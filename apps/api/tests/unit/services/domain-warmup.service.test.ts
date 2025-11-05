import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainWarmupService } from '../../../../src/services/domain-warmup.service';

// Mock Supabase
vi.mock('../../../../src/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    single: vi.fn(),
  };

  return {
    supabaseAdmin: mockSupabase,
  };
});

describe('DomainWarmupService', () => {
  let domainWarmupService: DomainWarmupService;
  const mockUserId = 'user-123';

  beforeEach(() => {
    domainWarmupService = new DomainWarmupService();
    vi.clearAllMocks();
  });

  describe('getWarmupStatus', () => {
    it('should return default status when warm-up not started', async () => {
      const { supabaseAdmin } = await import('../../../../src/lib/supabase');

      vi.mocked(supabaseAdmin.single).mockResolvedValue({
        data: { domain_warmup_started_at: null },
        error: null,
      });

      const status = await domainWarmupService.getWarmupStatus(mockUserId);

      expect(status.is_warmed_up).toBe(false);
      expect(status.days_remaining).toBe(14);
      expect(status.current_daily_limit).toBe(5);
    });

    it('should return warmed up status after 14 days', async () => {
      const { supabaseAdmin } = await import('../../../../src/lib/supabase');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15); // 15 days ago

      vi.mocked(supabaseAdmin.single).mockResolvedValue({
        data: { domain_warmup_started_at: startDate.toISOString() },
        error: null,
      });

      const status = await domainWarmupService.getWarmupStatus(mockUserId);

      expect(status.is_warmed_up).toBe(true);
      expect(status.current_daily_limit).toBe(20);
    });

    it('should return warm-up in progress status', async () => {
      const { supabaseAdmin } = await import('../../../../src/lib/supabase');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // 7 days ago

      vi.mocked(supabaseAdmin.single).mockResolvedValue({
        data: { domain_warmup_started_at: startDate.toISOString() },
        error: null,
      });

      const status = await domainWarmupService.getWarmupStatus(mockUserId);

      expect(status.is_warmed_up).toBe(false);
      expect(status.days_remaining).toBe(7);
      expect(status.current_daily_limit).toBe(5);
    });
  });

  describe('validateWarmupCompleted', () => {
    it('should not throw when warm-up completed', async () => {
      const { supabaseAdmin } = await import('../../../../src/lib/supabase');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15);

      vi.mocked(supabaseAdmin.single).mockResolvedValue({
        data: { domain_warmup_started_at: startDate.toISOString() },
        error: null,
      });

      await expect(
        domainWarmupService.validateWarmupCompleted(mockUserId)
      ).resolves.not.toThrow();
    });

    it('should throw when warm-up not completed', async () => {
      const { supabaseAdmin } = await import('../../../../src/lib/supabase');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      vi.mocked(supabaseAdmin.single).mockResolvedValue({
        data: { domain_warmup_started_at: startDate.toISOString() },
        error: null,
      });

      await expect(
        domainWarmupService.validateWarmupCompleted(mockUserId)
      ).rejects.toThrow('Domain warm-up period not completed');
    });
  });
});

