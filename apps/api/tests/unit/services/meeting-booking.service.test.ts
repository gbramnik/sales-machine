import { describe, it, expect, vi, beforeEach } from 'vitest';
import { meetingBookingService } from '../../../src/services/meeting-booking.service';
import { ApiError, ErrorCode } from '../../../src/types';
import { supabaseAdmin } from '../../../src/lib/supabase';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Mock fetch for Cal.com API
global.fetch = vi.fn();

describe('MeetingBookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateBookingLink', () => {
    it('should generate booking link for valid prospect', async () => {
      const prospectId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174001';

      // Mock prospect data
      const mockProspect = {
        id: prospectId,
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        job_title: 'CTO',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        list_id: 'list-123',
      };

      const mockEnrichment = {
        talking_points: ['Cloud migration', 'Cost optimization'],
        company_insights: 'Fast-growing SaaS company',
      };

      const mockList = {
        user_id: userId,
      };

      // Mock Supabase queries
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn();

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'prospects') {
          return {
            select: mockSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockSingle.mockResolvedValue({
                  data: mockProspect,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'prospect_enrichment') {
          return {
            select: mockSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockSingle.mockResolvedValue({
                  data: mockEnrichment,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'lists') {
          return {
            select: mockSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockSingle.mockResolvedValue({
                  data: mockList,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'api_credentials') {
          return {
            select: mockSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockSingle.mockResolvedValue({
                  data: {
                    api_key: 'test-api-key',
                    metadata: {
                      base_url: 'https://api.cal.com/v1',
                      username: 'testuser',
                    },
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: mockSelect, eq: mockEq, single: mockSingle };
      });

      // Mock fetch for Cal.com API
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          event_types: [{ id: 'event-123', slug: '30min' }],
        }),
      });

      const result = await meetingBookingService.generateBookingLink({
        prospectId,
        userId,
        duration: 30,
      });

      expect(result).toHaveProperty('booking_link');
      expect(result).toHaveProperty('booking_id');
      expect(result.booking_link).toContain('cal.com');
      expect(result.booking_link).toContain('testuser');
    });

    it('should throw error if prospect not found', async () => {
      const prospectId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174001';

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'prospects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          };
        }
        return { select: vi.fn(), eq: vi.fn(), single: vi.fn() };
      });

      await expect(
        meetingBookingService.generateBookingLink({
          prospectId,
          userId,
        })
      ).rejects.toThrow(ApiError);
    });

    it('should throw error if access denied', async () => {
      const prospectId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174001';

      const mockProspect = {
        id: prospectId,
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        list_id: 'list-123',
      };

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'prospects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProspect,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'lists') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null, // List not found or different user_id
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn(), eq: vi.fn(), single: vi.fn() };
      });

      await expect(
        meetingBookingService.generateBookingLink({
          prospectId,
          userId,
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('parseWebhookPayload', () => {
    it('should parse Cal.com BOOKING_CREATED event', () => {
      const payload = {
        type: 'BOOKING_CREATED',
        booking: {
          id: 'booking-123',
          uid: 'uid-123',
          startTime: '2025-01-15T10:00:00Z',
          attendees: [
            {
              email: 'john@example.com',
              name: 'John Doe',
            },
          ],
          metadata: {
            prospect_id: 'prospect-123',
          },
        },
      };

      const result = meetingBookingService.parseWebhookPayload(payload);

      expect(result.event_type).toBe('booked');
      expect(result.booking_id).toBe('booking-123');
      expect(result.scheduled_time).toBe('2025-01-15T10:00:00Z');
      expect(result.prospect_email).toBe('john@example.com');
      expect(result.prospect_name).toBe('John Doe');
      expect(result.metadata?.prospect_id).toBe('prospect-123');
    });

    it('should parse Cal.com BOOKING_CANCELLED event', () => {
      const payload = {
        type: 'BOOKING_CANCELLED',
        booking: {
          id: 'booking-123',
          startTime: '2025-01-15T10:00:00Z',
          attendees: [
            {
              email: 'john@example.com',
              name: 'John Doe',
            },
          ],
        },
      };

      const result = meetingBookingService.parseWebhookPayload(payload);

      expect(result.event_type).toBe('cancelled');
      expect(result.booking_id).toBe('booking-123');
    });

    it('should handle different payload formats', () => {
      const payload = {
        event_type: 'booked',
        data: {
          id: 'booking-456',
          start_time: '2025-01-15T10:00:00Z',
          email: 'jane@example.com',
          name: 'Jane Smith',
        },
      };

      const result = meetingBookingService.parseWebhookPayload(payload);

      expect(result.event_type).toBe('booked');
      expect(result.booking_id).toBe('booking-456');
      expect(result.scheduled_time).toBe('2025-01-15T10:00:00Z');
      expect(result.prospect_email).toBe('jane@example.com');
    });
  });

  describe('verifyCredentials', () => {
    it('should return true for valid credentials', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'user-123' }),
      });

      const result = await meetingBookingService.verifyCredentials({
        api_key: 'valid-key',
        base_url: 'https://api.cal.com/v1',
      });

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cal.com/v1/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-key',
          }),
        })
      );
    });

    it('should return false for invalid credentials', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await meetingBookingService.verifyCredentials({
        api_key: 'invalid-key',
        base_url: 'https://api.cal.com/v1',
      });

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await meetingBookingService.verifyCredentials({
        api_key: 'test-key',
        base_url: 'https://api.cal.com/v1',
      });

      expect(result).toBe(false);
    });
  });
});



