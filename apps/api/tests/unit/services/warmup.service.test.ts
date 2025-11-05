import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WarmupService } from '../../../src/services/WarmupService';
import { ApiError, ErrorCode } from '../../../src/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabase = () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    single: vi.fn(),
  };
  return mockSupabase as unknown as SupabaseClient<any>;
};

describe('WarmupService', () => {
  let warmupService: WarmupService;
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  const mockUserId = 'user-123';
  const mockProspectId = 'prospect-123';

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    warmupService = new WarmupService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('getWarmupConfig', () => {
    it('should return user config when available', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          warmup_duration_days: 12,
          daily_likes_limit: 30,
          daily_comments_limit: 30,
          account_type: 'sales_navigator',
        },
        error: null,
      } as any);

      const config = await warmupService.getWarmupConfig(mockUserId);

      expect(config).toEqual({
        warmup_duration_days: 12,
        daily_likes_limit: 30,
        daily_comments_limit: 30,
        account_type: 'sales_navigator',
      });
    });

    it('should return defaults when user config not found', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      const config = await warmupService.getWarmupConfig(mockUserId);

      expect(config).toEqual({
        warmup_duration_days: 10,
        daily_likes_limit: 20,
        daily_comments_limit: 20,
        account_type: 'basic',
      });
    });

    it('should throw ApiError on database error', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any);

      await expect(warmupService.getWarmupConfig(mockUserId)).rejects.toThrow(ApiError);
      await expect(warmupService.getWarmupConfig(mockUserId)).rejects.toThrow(
        'Failed to fetch warm-up configuration'
      );
    });
  });

  describe('startWarmup', () => {
    it('should create new warm-up schedule', async () => {
      // Mock getWarmupConfig
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      
      // First call: getWarmupConfig
      vi.mocked(mockSupabase.single)
        .mockResolvedValueOnce({
          data: { warmup_duration_days: 10 },
          error: null,
        } as any)
        // Second call: check existing schedule (not found)
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }, // Not found error
        } as any)
        // Third call: insert new schedule
        .mockResolvedValueOnce({
          data: {
            id: 'schedule-123',
            connection_ready_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          error: null,
        } as any);

      vi.mocked(mockSupabase.insert).mockReturnValue(mockSupabase);

      const result = await warmupService.startWarmup(mockProspectId, mockUserId);

      expect(result).toHaveProperty('schedule_id');
      expect(result).toHaveProperty('connection_ready_at');
    });

    it('should update existing warm-up schedule', async () => {
      // Mock getWarmupConfig
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      
      // First call: getWarmupConfig
      vi.mocked(mockSupabase.single)
        .mockResolvedValueOnce({
          data: { warmup_duration_days: 10 },
          error: null,
        } as any)
        // Second call: check existing schedule (found)
        .mockResolvedValueOnce({
          data: { id: 'existing-schedule-123' },
          error: null,
        } as any)
        // Third call: update schedule
        .mockResolvedValueOnce({
          data: {
            id: 'existing-schedule-123',
            connection_ready_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          error: null,
        } as any);

      vi.mocked(mockSupabase.update).mockReturnValue(mockSupabase);

      const result = await warmupService.startWarmup(mockProspectId, mockUserId);

      expect(result.schedule_id).toBe('existing-schedule-123');
    });
  });

  describe('getWarmupStatus', () => {
    it('should return warm-up status with days remaining', async () => {
      const connectionReadyDate = new Date();
      connectionReadyDate.setDate(connectionReadyDate.getDate() + 5); // 5 days from now

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          id: 'schedule-123',
          status: 'warmup_in_progress',
          connection_ready_at: connectionReadyDate.toISOString(),
          likes_count: 5,
          comments_count: 3,
        },
        error: null,
      } as any);

      const status = await warmupService.getWarmupStatus(mockProspectId, mockUserId);

      expect(status.status).toBe('warmup_in_progress');
      expect(status.days_remaining).toBeGreaterThanOrEqual(4);
      expect(status.actions_completed).toBe(8);
      expect(status.likes_count).toBe(5);
      expect(status.comments_count).toBe(3);
    });

    it('should return ready_for_connection when days remaining is 0', async () => {
      const connectionReadyDate = new Date();
      connectionReadyDate.setDate(connectionReadyDate.getDate() - 1); // 1 day ago

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          id: 'schedule-123',
          status: 'warmup_in_progress',
          connection_ready_at: connectionReadyDate.toISOString(),
          likes_count: 10,
          comments_count: 5,
        },
        error: null,
      } as any);

      const status = await warmupService.getWarmupStatus(mockProspectId, mockUserId);

      expect(status.status).toBe('ready_for_connection');
      expect(status.days_remaining).toBe(0);
    });

    it('should throw ApiError when schedule not found', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      } as any);

      await expect(warmupService.getWarmupStatus(mockProspectId, mockUserId)).rejects.toThrow(
        ApiError
      );
      await expect(warmupService.getWarmupStatus(mockProspectId, mockUserId)).rejects.toThrow(
        'Warm-up schedule not found'
      );
    });
  });

  describe('calculateConnectionReadyDate', () => {
    it('should calculate connection ready date correctly', () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const warmupDays = 10;

      const result = warmupService.calculateConnectionReadyDate(startDate, warmupDays);

      const expectedDate = new Date('2025-01-11T00:00:00Z');
      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    it('should handle minimum warmup duration (7 days)', () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const warmupDays = 7;

      const result = warmupService.calculateConnectionReadyDate(startDate, warmupDays);

      const expectedDate = new Date('2025-01-08T00:00:00Z');
      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    it('should handle maximum warmup duration (15 days)', () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const warmupDays = 15;

      const result = warmupService.calculateConnectionReadyDate(startDate, warmupDays);

      const expectedDate = new Date('2025-01-16T00:00:00Z');
      expect(result.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe('getAccountTypeLimits', () => {
    it('should return basic account limits', () => {
      const limits = warmupService.getAccountTypeLimits('basic');

      expect(limits).toEqual({
        daily_likes: 20,
        daily_comments: 20,
      });
    });

    it('should return Sales Navigator account limits', () => {
      const limits = warmupService.getAccountTypeLimits('sales_navigator');

      expect(limits).toEqual({
        daily_likes: 40,
        daily_comments: 40,
      });
    });
  });
});

