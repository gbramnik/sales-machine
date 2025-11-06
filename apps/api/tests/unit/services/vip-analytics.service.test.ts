import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VIPAnalyticsService } from '../../../src/services/VIPAnalyticsService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
};

describe('VIPAnalyticsService', () => {
  let service: VIPAnalyticsService;

  beforeEach(() => {
    service = new VIPAnalyticsService(mockSupabase as any);
    vi.clearAllMocks();
  });

  describe('getVIPConversionMetrics', () => {
    it('should calculate VIP and non-VIP conversion rates', async () => {
      const vipProspects = [
        { id: '1', status: 'contacted' },
        { id: '2', status: 'qualified' },
        { id: '3', status: 'meeting_booked' },
      ];
      const nonVipProspects = [
        { id: '4', status: 'contacted' },
        { id: '5', status: 'new' },
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: vipProspects, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: nonVipProspects, error: null }),
        });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await service.getVIPConversionMetrics('user-1', startDate, endDate);

      expect(result.vip.total).toBe(3);
      expect(result.vip.contacted).toBe(3);
      expect(result.vip.qualified).toBe(2);
      expect(result.vip.meetings).toBe(1);
      expect(result.non_vip.total).toBe(2);
      expect(result.non_vip.contacted).toBe(1);
    });

    it('should handle division by zero', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await service.getVIPConversionMetrics('user-1', startDate, endDate);

      expect(result.vip.contact_rate).toBe(0);
      expect(result.vip.qualification_rate).toBe(0);
      expect(result.non_vip.contact_rate).toBe(0);
    });
  });

  describe('getVIPReviewMetrics', () => {
    it('should calculate VIP review approval/rejection rates', async () => {
      const reviews = [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
        { id: '3', status: 'rejected' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: reviews, error: null }),
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await service.getVIPReviewMetrics('user-1', startDate, endDate);

      expect(result.total_vip_reviews).toBe(3);
      expect(result.approved_vip).toBe(2);
      expect(result.rejected_vip).toBe(1);
      expect(result.approval_rate).toBeCloseTo(66.67, 1);
      expect(result.rejection_rate).toBeCloseTo(33.33, 1);
    });
  });
});

