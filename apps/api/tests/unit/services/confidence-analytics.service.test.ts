import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfidenceAnalyticsService } from '../../../src/services/ConfidenceAnalyticsService';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            not: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('ConfidenceAnalyticsService', () => {
  let analyticsService: ConfidenceAnalyticsService;
  let mockSupabase: any;

  beforeEach(() => {
    analyticsService = new ConfidenceAnalyticsService();
    const { supabase } = require('../../../src/lib/supabase');
    mockSupabase = supabase;
    vi.clearAllMocks();
  });

  describe('getConfidenceDistribution', () => {
    it('should return correct distribution by score ranges', async () => {
      const mockData = [
        { ai_confidence_score: 15 },
        { ai_confidence_score: 25 },
        { ai_confidence_score: 55 },
        { ai_confidence_score: 75 },
        { ai_confidence_score: 90 },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              not: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn().mockResolvedValue({
                    data: mockData,
                  }),
                })),
              })),
            })),
          })),
        })),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const distribution = await analyticsService.getConfidenceDistribution('user-id', startDate, endDate);

      expect(distribution['0-20']).toBe(1);
      expect(distribution['21-40']).toBe(1);
      expect(distribution['41-60']).toBe(1);
      expect(distribution['61-80']).toBe(1);
      expect(distribution['81-100']).toBe(1);
    });
  });

  describe('getReviewMetrics', () => {
    it('should calculate correct review metrics', async () => {
      // Mock total messages
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn().mockResolvedValue({
                  data: Array(100).fill({ id: 'msg-id' }),
                }),
              })),
            })),
          })),
        })),
      });

      // Mock queued messages
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn().mockResolvedValue({
                data: Array(20).fill({ id: 'queue-id' }),
              }),
            })),
          })),
        })),
      });

      // Mock approved messages
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn().mockResolvedValue({
                  data: Array(15).fill({ id: 'approved-id' }),
                }),
              })),
            })),
          })),
        })),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const metrics = await analyticsService.getReviewMetrics('user-id', startDate, endDate);

      expect(metrics.total_messages).toBe(100);
      expect(metrics.queued_messages).toBe(20);
      expect(metrics.approved_messages).toBe(15);
      expect(metrics.percentage_requiring_review).toBe(20);
      expect(metrics.review_to_send_conversion_rate).toBe(75);
    });

    it('should handle division by zero (no messages)', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn().mockResolvedValue({
                  data: [],
                }),
              })),
            })),
          })),
        })),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const metrics = await analyticsService.getReviewMetrics('user-id', startDate, endDate);

      expect(metrics.percentage_requiring_review).toBe(0);
      expect(metrics.review_to_send_conversion_rate).toBe(0);
    });
  });

  describe('getAverageConfidence', () => {
    it('should return correct average confidence score', async () => {
      const mockData = [
        { ai_confidence_score: 80 },
        { ai_confidence_score: 85 },
        { ai_confidence_score: 90 },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              not: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn().mockResolvedValue({
                    data: mockData,
                  }),
                })),
              })),
            })),
          })),
        })),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const average = await analyticsService.getAverageConfidence('user-id', startDate, endDate);

      expect(average).toBe(85);
    });

    it('should return 0 if no messages', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              not: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn().mockResolvedValue({
                    data: [],
                  }),
                })),
              })),
            })),
          })),
        })),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const average = await analyticsService.getAverageConfidence('user-id', startDate, endDate);

      expect(average).toBe(0);
    });
  });
});


