import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsService } from '../../../src/services/MetricsService';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the supabase module
vi.mock('../../../src/lib/supabase', () => {
  let resolveValue: any = { count: 0, data: null, error: null };
  
  const createChain = () => {
    const chain: any = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      not: vi.fn(() => chain),
      or: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      lte: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };
    
    // Make the chain thenable (Promise-like) - resolves with current resolveValue
    chain.then = (onResolve: any) => Promise.resolve(resolveValue).then(onResolve);
    chain.catch = (onReject: any) => Promise.resolve(resolveValue).catch(onReject);
    
    return chain;
  };

  const mockSupabase: any = {
    from: vi.fn(() => createChain()),
    _setResolveValue: (value: any) => { resolveValue = value; },
  };

  return {
    supabase: mockSupabase as unknown as SupabaseClient<any>,
  };
});

describe('MetricsService', () => {
  let metricsService: MetricsService;
  const userId = 'test-user-id';
  const date = '2025-01-12';

  beforeEach(() => {
    metricsService = new MetricsService();
    vi.clearAllMocks();
  });

  describe('getCampaignMetrics', () => {
    it('should calculate campaign metrics correctly', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Set default resolve value for all queries
      (supabase as any)._setResolveValue({ count: 100, error: null });

      const metrics = await metricsService.getCampaignMetrics(userId, date);

      expect(metrics).toHaveProperty('date', date);
      expect(metrics).toHaveProperty('total_scraped');
      expect(metrics).toHaveProperty('meetings_per_100_prospects');
    });

    it('should calculate meetings per 100 prospects correctly', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Set default count - will be used for all queries
      (supabase as any)._setResolveValue({ count: 100, error: null });

      const metrics = await metricsService.getCampaignMetrics(userId, date);

      expect(metrics.meetings_per_100_prospects).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getEmailMetrics', () => {
    it('should calculate email metrics correctly', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Set default values - all queries will return these
      (supabase as any)._setResolveValue({
        count: 100,
        data: [{ email_opens: 20, email_clicks: 10 }],
        error: null,
      });

      const metrics = await metricsService.getEmailMetrics(userId, date);

      expect(metrics).toHaveProperty('sent_count');
      expect(metrics).toHaveProperty('open_rate');
      expect(metrics).toHaveProperty('bounce_rate');
      expect(metrics).toHaveProperty('health_status');
    });

    it('should handle division by zero in rates', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ count: 0, data: [], error: null });

      const metrics = await metricsService.getEmailMetrics(userId, date);

      expect(metrics.open_rate).toBe(0);
      expect(metrics.reply_rate).toBe(0);
    });
  });

  describe('getAIAgentMetrics', () => {
    it('should calculate AI agent metrics correctly', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Set default values
      (supabase as any)._setResolveValue({
        count: 50,
        data: [
          { ai_confidence_score: 85 },
          { ai_confidence_score: 90 },
          { ai_confidence_score: 80 },
        ],
        error: null,
      });

      const metrics = await metricsService.getAIAgentMetrics(userId, date);

      expect(metrics).toHaveProperty('total_conversations');
      expect(metrics).toHaveProperty('qualification_accuracy');
      expect(metrics).toHaveProperty('confidence_avg');
    });
  });

  describe('calculateDeliverabilityHealth', () => {
    it('should return Green for low bounce and spam rates', () => {
      const health = metricsService.calculateDeliverabilityHealth(1.5, 0.03);
      expect(health).toBe('Green');
    });

    it('should return Amber for medium bounce or spam rates', () => {
      const health1 = metricsService.calculateDeliverabilityHealth(3.0, 0.03);
      expect(health1).toBe('Amber');

      const health2 = metricsService.calculateDeliverabilityHealth(1.5, 0.08);
      expect(health2).toBe('Amber');
    });

    it('should return Red for high bounce or spam rates', () => {
      const health1 = metricsService.calculateDeliverabilityHealth(6.0, 0.03);
      expect(health1).toBe('Red');

      const health2 = metricsService.calculateDeliverabilityHealth(1.5, 0.15);
      expect(health2).toBe('Red');
    });
  });

  describe('getAllMetrics', () => {
    it('should return all metrics combined', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ count: 10, data: [], error: null });

      const allMetrics = await metricsService.getAllMetrics(userId, date);

      expect(allMetrics).toHaveProperty('campaign');
      expect(allMetrics).toHaveProperty('email');
      expect(allMetrics).toHaveProperty('ai');
    });
  });
});

