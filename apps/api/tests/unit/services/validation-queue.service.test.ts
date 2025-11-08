import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationQueueService } from '../../../src/services/ValidationQueueService';
import { WarmupService } from '../../../src/services/WarmupService';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(),
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
        })),
      })),
    })),
  },
}));

// Mock WarmupService
vi.mock('../../../src/services/WarmupService', () => ({
  WarmupService: vi.fn().mockImplementation(() => ({
    startWarmup: vi.fn(),
  })),
}));

describe('ValidationQueueService', () => {
  let validationQueueService: ValidationQueueService;
  let mockSupabase: any;

  beforeEach(() => {
    validationQueueService = new ValidationQueueService();
    const { supabase } = require('../../../src/lib/supabase');
    mockSupabase = supabase;
    vi.clearAllMocks();
  });

  describe('addToQueue', () => {
    it('should add prospect to validation queue', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'queue-id' },
            }),
          })),
        })),
      });

      const result = await validationQueueService.addToQueue('prospect-id', 'user-id');

      expect(result.queue_id).toBe('queue-id');
    });

    it('should handle duplicate entry gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockRejectedValue({
              code: '23505', // Duplicate key error
            }),
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing-queue-id' },
              }),
            })),
          })),
        })),
      });

      const result = await validationQueueService.addToQueue('prospect-id', 'user-id');

      expect(result.queue_id).toBe('existing-queue-id');
    });
  });

  describe('approve', () => {
    it('should approve prospect and start warm-up', async () => {
      const mockWarmupService = {
        startWarmup: vi.fn().mockResolvedValue({
          schedule_id: 'warmup-id',
          connection_ready_at: '2025-01-20T00:00:00Z',
        }),
      };
      (WarmupService as any).mockImplementation(() => mockWarmupService);

      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      });

      const result = await validationQueueService.approve('prospect-id', 'user-id');

      expect(result.success).toBe(true);
      expect(result.warmup_started).toBe(true);
    });

    it('should handle warm-up failure gracefully', async () => {
      const mockWarmupService = {
        startWarmup: vi.fn().mockRejectedValue(new Error('Warm-up failed')),
      };
      (WarmupService as any).mockImplementation(() => mockWarmupService);

      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      });

      const result = await validationQueueService.approve('prospect-id', 'user-id');

      expect(result.success).toBe(true);
      expect(result.warmup_started).toBe(false);
    });
  });

  describe('reject', () => {
    it('should reject prospect', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      });

      const result = await validationQueueService.reject('prospect-id', 'user-id');

      expect(result.success).toBe(true);
    });
  });

  describe('getPendingQueue', () => {
    it('should get pending validation queue', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'queue-id',
                      prospect_id: 'prospect-id',
                      user_id: 'user-id',
                      status: 'pending',
                      created_at: '2025-01-13T00:00:00Z',
                      validated_at: null,
                      validated_by: null,
                      prospects: {
                        id: 'prospect-id',
                        full_name: 'John Doe',
                        company_name: 'Acme Corp',
                        job_title: 'CTO',
                        linkedin_url: 'https://linkedin.com/in/johndoe',
                        location: 'Paris',
                        profile_summary: 'Test summary',
                      },
                    },
                  ],
                }),
              })),
            })),
          })),
        })),
      });

      const result = await validationQueueService.getPendingQueue('user-id', 50);

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('pending');
      expect(result[0].prospect?.full_name).toBe('John Doe');
    });
  });
});





