import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumannessResponseRateService } from '../../../src/services/HumannessResponseRateService';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  gte: vi.fn(() => mockSupabase),
  lte: vi.fn(() => mockSupabase),
};

describe('HumannessResponseRateService', () => {
  let service: HumannessResponseRateService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HumannessResponseRateService(mockSupabase as any);
  });

  describe('calculateResponseRate', () => {
    it('should calculate response rate correctly', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Mock outbound messages (AI sent)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn().mockResolvedValue({
                    data: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
                    error: null,
                  }),
                })),
              })),
            })),
          })),
        })),
      });

      // Mock inbound messages (replies)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn().mockResolvedValue({
                  data: [{ id: '1' }, { id: '2' }],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      });

      const result = await service.calculateResponseRate('user-123', startDate, endDate);

      expect(result.ai_messages_sent).toBe(5);
      expect(result.replies_received).toBe(2);
      expect(result.response_rate_per_100).toBe(40.0); // 2/5 * 100
      expect(result.below_threshold).toBe(false); // 40% > 5%
      expect(result.threshold).toBe(5.0);
    });

    it('should flag below threshold', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Mock: 100 AI messages sent, 2 replies
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn().mockResolvedValue({
                    data: Array(100).fill({ id: 'msg' }),
                    error: null,
                  }),
                })),
              })),
            })),
          })),
        })),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn().mockResolvedValue({
                  data: [{ id: '1' }, { id: '2' }],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      });

      const result = await service.calculateResponseRate('user-123', startDate, endDate);

      expect(result.response_rate_per_100).toBe(2.0); // 2/100 * 100
      expect(result.below_threshold).toBe(true); // 2% < 5%
    });
  });

  describe('trackResponseRateTrend', () => {
    it('should track trend over time', async () => {
      // Mock calculateResponseRate to return different rates
      vi.spyOn(service, 'calculateResponseRate')
        .mockResolvedValueOnce({ ai_messages_sent: 10, replies_received: 1, response_rate_per_100: 10, below_threshold: false, threshold: 5 })
        .mockResolvedValueOnce({ ai_messages_sent: 10, replies_received: 0.5, response_rate_per_100: 5, below_threshold: false, threshold: 5 })
        .mockResolvedValueOnce({ ai_messages_sent: 10, replies_received: 0.3, response_rate_per_100: 3, below_threshold: true, threshold: 5 });

      const result = await service.trackResponseRateTrend('user-123', 3);

      expect(result.daily_rates).toHaveLength(3);
      expect(result.trend).toBe('decreasing');
      expect(result.average_rate).toBeGreaterThan(0);
    });

    it('should identify stable trend', async () => {
      vi.spyOn(service, 'calculateResponseRate')
        .mockResolvedValue({ ai_messages_sent: 10, replies_received: 1, response_rate_per_100: 10, below_threshold: false, threshold: 5 });

      const result = await service.trackResponseRateTrend('user-123', 10);

      expect(result.trend).toBe('stable');
    });
  });
});



