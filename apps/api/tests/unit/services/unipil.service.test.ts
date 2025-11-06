import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set environment variables before importing the service
process.env.UNIPIL_API_URL = 'https://api.unipil.io';
process.env.UNIPIL_API_KEY = 'test-api-key';

import { UniPilService, SearchProfilesParams } from '../../../src/services/UniPilService';

// Mock fetch globally
global.fetch = vi.fn();

describe('UniPilService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Ensure env vars are set for each test
    process.env.UNIPIL_API_URL = 'https://api.unipil.io';
    process.env.UNIPIL_API_KEY = 'test-api-key';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('searchProfiles', () => {
    it('should return profiles on successful API call', async () => {
      const mockProfiles = [
        {
          full_name: 'John Doe',
          job_title: 'CTO',
          company_name: 'Acme Corp',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          location: 'Paris',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockProfiles,
        }),
      });

      const params: SearchProfilesParams = {
        industry: 'Technology',
        location: 'Paris',
        job_title: 'CTO',
      };

      const result = await UniPilService.searchProfiles(params);

      expect(result).toEqual(mockProfiles);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/linkedin/search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should throw error when API returns error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Daily limit reached',
          },
        }),
      });

      const params: SearchProfilesParams = {
        industry: 'Technology',
      };

      await expect(UniPilService.searchProfiles(params)).rejects.toThrow();
    });

    it('should retry on 5xx errors', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [],
          }),
        });
      });

      const params: SearchProfilesParams = { industry: 'Technology' };
      const result = await UniPilService.searchProfiles(params);

      expect(result).toEqual([]);
      expect(callCount).toBe(3); // Retried twice
    });
  });

  describe('getCompanyPage', () => {
    it('should return company data on successful API call', async () => {
      const mockCompanyData = {
        company_name: 'Acme Corp',
        linkedin_url: 'https://linkedin.com/company/acme',
        website: 'https://acme.com',
        description: 'A great company',
        industry: 'Technology',
        company_size: '50-200',
        headquarters: 'Paris',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCompanyData,
        }),
      });

      const result = await UniPilService.getCompanyPage(
        'https://linkedin.com/company/acme'
      );

      expect(result).toEqual(mockCompanyData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/linkedin/company'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('checkRateLimit', () => {
    it('should return rate limit info', async () => {
      const result = await UniPilService.checkRateLimit('user-id', 20);

      expect(result.dailyLimit).toBe(20);
      expect(result.remaining).toBe(20);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should enforce max daily limit of 40', async () => {
      const result = await UniPilService.checkRateLimit('user-id', 100); // Request 100, max is 40

      expect(result.dailyLimit).toBe(40);
    });

    it('should enforce min daily limit of 20', async () => {
      const result = await UniPilService.checkRateLimit('user-id', 10); // Request 10, min is 20

      expect(result.dailyLimit).toBe(20);
    });
  });
});
