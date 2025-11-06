import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfidenceService } from '../../../src/services/ConfidenceService';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('ConfidenceService', () => {
  let confidenceService: ConfidenceService;
  let mockSupabase: any;

  beforeEach(() => {
    confidenceService = new ConfidenceService();
    const { supabase } = require('../../../src/lib/supabase');
    mockSupabase = supabase;
    vi.clearAllMocks();
  });

  describe('getConfidenceThreshold', () => {
    it('should return default threshold (80) when user has no setting', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: null },
            }),
          })),
        })),
      });

      const threshold = await confidenceService.getConfidenceThreshold('user-id');

      expect(threshold).toBe(80);
    });

    it('should return user-configured threshold', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: 75 },
            }),
          })),
        })),
      });

      const threshold = await confidenceService.getConfidenceThreshold('user-id');

      expect(threshold).toBe(75);
    });

    it('should return default if threshold is out of range (< 60)', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: 50 },
            }),
          })),
        })),
      });

      const threshold = await confidenceService.getConfidenceThreshold('user-id');

      expect(threshold).toBe(80);
    });

    it('should return default if threshold is out of range (> 95)', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: 100 },
            }),
          })),
        })),
      });

      const threshold = await confidenceService.getConfidenceThreshold('user-id');

      expect(threshold).toBe(80);
    });
  });

  describe('shouldQueueForReview', () => {
    it('should queue if score < threshold', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: 80 },
            }),
          })),
        })),
      });

      const shouldQueue = await confidenceService.shouldQueueForReview(75, 'user-id');

      expect(shouldQueue).toBe(true);
    });

    it('should not queue if score >= threshold', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { ai_confidence_threshold: 80 },
            }),
          })),
        })),
      });

      const shouldQueue = await confidenceService.shouldQueueForReview(85, 'user-id');

      expect(shouldQueue).toBe(false);
    });
  });
});


