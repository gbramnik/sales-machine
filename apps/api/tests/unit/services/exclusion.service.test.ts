import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExclusionService } from '../../../src/services/ExclusionService';
import { Redis } from '@upstash/redis';

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            not: vi.fn(() => ({
              select: vi.fn(),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('ExclusionService', () => {
  let exclusionService: ExclusionService;
  let mockRedis: any;

  beforeEach(() => {
    process.env.UPSTASH_REDIS_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_TOKEN = 'test-token';
    
    exclusionService = new ExclusionService();
    mockRedis = (Redis as any).mock.results[0].value;
    vi.clearAllMocks();
  });

  describe('getExcludedProspectUrls', () => {
    it('should return cached excluded URLs if available', async () => {
      const cachedUrls = ['https://linkedin.com/in/test1', 'https://linkedin.com/in/test2'];
      mockRedis.get.mockResolvedValue(cachedUrls);

      const result = await exclusionService.getExcludedProspectUrls('user-id');

      expect(result).toEqual(cachedUrls);
      expect(mockRedis.get).toHaveBeenCalledWith('excluded_prospects:user-id:2025-01-13');
    });

    it('should query database and cache result if cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      const { supabase } = await import('../../../src/lib/supabase');

      // Mock contacted prospects
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              not: vi.fn(() => ({
                select: vi.fn().mockResolvedValue({
                  data: [
                    { linkedin_url: 'https://linkedin.com/in/contacted1' },
                    { linkedin_url: 'https://linkedin.com/in/contacted2' },
                  ],
                }),
              })),
            })),
          })),
        })),
      });

      // Mock warmup prospects
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn().mockResolvedValue({
              data: [
                { prospects: { linkedin_url: 'https://linkedin.com/in/warmup1' } },
              ],
            }),
          })),
        })),
      });

      mockRedis.set.mockResolvedValue('OK');

      const result = await exclusionService.getExcludedProspectUrls('user-id');

      expect(result.length).toBeGreaterThan(0);
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle missing linkedin_connections table gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);
      const { supabase } = await import('../../../src/lib/supabase');

      // Mock contacted prospects
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              not: vi.fn(() => ({
                select: vi.fn().mockResolvedValue({ data: [] }),
              })),
            })),
          })),
        })),
      });

      // Mock warmup prospects
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn().mockResolvedValue({ data: [] }),
          })),
        })),
      });

      // Mock linkedin_connections (should fail gracefully)
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => {
          throw new Error('Table does not exist');
        }),
      });

      mockRedis.set.mockResolvedValue('OK');

      const result = await exclusionService.getExcludedProspectUrls('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('isExcluded', () => {
    it('should return true if URL is excluded', async () => {
      const excludedUrls = ['https://linkedin.com/in/test1'];
      mockRedis.get.mockResolvedValue(excludedUrls);

      const result = await exclusionService.isExcluded('user-id', 'https://linkedin.com/in/test1');

      expect(result).toBe(true);
    });

    it('should return false if URL is not excluded', async () => {
      const excludedUrls = ['https://linkedin.com/in/test1'];
      mockRedis.get.mockResolvedValue(excludedUrls);

      const result = await exclusionService.isExcluded('user-id', 'https://linkedin.com/in/test2');

      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear exclusion cache', async () => {
      mockRedis.del.mockResolvedValue(1);

      await exclusionService.clearCache('user-id');

      expect(mockRedis.del).toHaveBeenCalledWith('excluded_prospects:user-id:2025-01-13');
    });
  });
});

