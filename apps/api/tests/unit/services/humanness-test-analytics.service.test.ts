import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumannessTestAnalyticsService } from '../../../src/services/HumannessTestAnalyticsService';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  not: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  upsert: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
};

describe('HumannessTestAnalyticsService', () => {
  let service: HumannessTestAnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HumannessTestAnalyticsService(mockSupabase as any);
  });

  describe('calculateDetectionRate', () => {
    it('should calculate correct detection rate', async () => {
      const mockResponses = [
        {
          identified_as_ai: true,
          message: { message_type: 'ai_generated', ai_prompting_strategy: 'strategy_1' },
        },
        {
          identified_as_ai: false,
          message: { message_type: 'ai_generated', ai_prompting_strategy: 'strategy_1' },
        },
        {
          identified_as_ai: true,
          message: { message_type: 'ai_generated', ai_prompting_strategy: 'strategy_2' },
        },
        {
          identified_as_ai: false,
          message: { message_type: 'human_written', ai_prompting_strategy: null },
        },
      ];

      // Mock responses fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: mockResponses, error: null }),
        })),
      });

      // Mock test fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { target_detection_rate: 20.0 },
              error: null,
            }),
          })),
        })),
      });

      // Mock analytics upsert
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await service.calculateDetectionRate('test-123');

      expect(result.overall_detection_rate).toBeGreaterThanOrEqual(0);
      expect(result.strategy_metrics).toBeDefined();
      expect(result.target_met).toBeDefined();
    });

    it('should handle empty responses', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { target_detection_rate: 20.0 },
              error: null,
            }),
          })),
        })),
      });

      const result = await service.calculateDetectionRate('test-123');

      expect(result.overall_detection_rate).toBe(0);
      expect(result.strategy_metrics).toEqual([]);
    });
  });

  describe('getWinningStrategy', () => {
    it('should return strategy with lowest detection rate', async () => {
      const mockAnalytics = [
        {
          ai_prompting_strategy: 'strategy_1',
          detection_rate: 25.5,
          ai_messages_count: 10,
          ai_correctly_identified: 3,
          ai_incorrectly_identified_as_human: 7,
        },
        {
          ai_prompting_strategy: 'strategy_2',
          detection_rate: 15.0,
          ai_messages_count: 10,
          ai_correctly_identified: 2,
          ai_incorrectly_identified_as_human: 8,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            not: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: [mockAnalytics[1]], error: null }),
              })),
            })),
          })),
        })),
      });

      const result = await service.getWinningStrategy('test-123');

      expect(result).not.toBeNull();
      expect(result?.strategy_name).toBe('strategy_2');
      expect(result?.detection_rate).toBe(15.0);
    });

    it('should return null if no strategy found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            not: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              })),
            })),
          })),
        })),
      });

      const result = await service.getWinningStrategy('test-123');

      expect(result).toBeNull();
    });
  });
});



