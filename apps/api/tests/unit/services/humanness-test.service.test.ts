import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumannessTestService } from '../../../src/services/HumannessTestService';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
};

describe('HumannessTestService', () => {
  let service: HumannessTestService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HumannessTestService(mockSupabase as any);
  });

  describe('createTest', () => {
    it('should create a test with correct status', async () => {
      const testData = {
        id: 'test-123',
        test_name: 'Test 1',
        test_version: 'v1.0',
        test_type: 'perception_panel',
        status: 'draft',
        target_detection_rate: 20.0,
        created_by: 'user-123',
        metadata: {},
        created_at: new Date().toISOString(),
        completed_at: null,
      };

      mockSupabase.insert.mockReturnValue({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: testData, error: null }),
        })),
      });

      const result = await service.createTest('Test 1', 'v1.0', 'user-123');

      expect(result).toEqual(testData);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          test_name: 'Test 1',
          test_version: 'v1.0',
          test_type: 'perception_panel',
          status: 'draft',
        })
      );
    });

    it('should throw error if creation fails', async () => {
      mockSupabase.insert.mockReturnValue({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        })),
      });

      await expect(service.createTest('Test 1', 'v1.0', 'user-123')).rejects.toThrow(ApiError);
    });
  });

  describe('addPanelist', () => {
    it('should add panelist with validation', async () => {
      const panelistData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        job_title: 'CEO',
        company_name: 'Acme Corp',
        company_size: '11-50' as const,
        industry: 'SaaS',
        country: 'FR',
        role: 'ceo' as const,
      };

      const panelistResult = {
        id: 'panelist-123',
        ...panelistData,
        test_id: 'test-123',
        recruitment_status: 'pending',
        invitation_sent_at: null,
        test_completed_at: null,
        compensation_offered: null,
        created_at: new Date().toISOString(),
      };

      // Mock test exists check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'test-123' }, error: null }),
          })),
        })),
      });

      // Mock panelist insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: panelistResult, error: null }),
          })),
        })),
      });

      const result = await service.addPanelist('test-123', panelistData);

      expect(result).toEqual(panelistResult);
    });

    it('should throw error for invalid email', async () => {
      const panelistData = {
        full_name: 'John Doe',
        email: 'invalid-email',
      };

      await expect(service.addPanelist('test-123', panelistData)).rejects.toThrow(ApiError);
    });
  });

  describe('sendPanelistInvitation', () => {
    it('should send email and update status', async () => {
      const panelist = {
        id: 'panelist-123',
        email: 'john@example.com',
        full_name: 'John Doe',
        test: {
          id: 'test-123',
          test_name: 'Test 1',
          created_by: 'user-123',
        },
      };

      // Mock panelist fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: panelist, error: null }),
            })),
          })),
        })),
      });

      // Mock update
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }));
      mockSupabase.from.mockReturnValueOnce({
        update: mockUpdate,
      });

      // Mock SMTPService sendEmail method
      const mockSendEmail = vi.fn().mockResolvedValue({ message_id: 'msg-123' });
      (service as any).smtpService = {
        sendEmail: mockSendEmail,
      };

      await service.sendPanelistInvitation('test-123', 'panelist-123');

      expect(mockSendEmail).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('bulkInvitePanelists', () => {
    it('should handle bulk invitations', async () => {
      const panelistIds = ['panelist-1', 'panelist-2', 'panelist-3'];

      // Mock sendPanelistInvitation to succeed for first two, fail for third
      vi.spyOn(service, 'sendPanelistInvitation')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Failed to send'));

      const result = await service.bulkInvitePanelists('test-123', panelistIds);

      expect(result.total).toBe(3);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});

