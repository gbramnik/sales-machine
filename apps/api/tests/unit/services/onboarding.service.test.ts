import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingService } from '../../../src/services/OnboardingService';
import { SettingsService } from '../../../src/services/SettingsService';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the supabase module
vi.mock('../../../src/lib/supabase', () => {
  let resolveValue: any = { count: 0, data: null, error: null };
  
  const createChain = () => {
    const chain: any = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      upsert: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(resolveValue)),
    };
    
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

// Mock SettingsService
vi.mock('../../../src/services/SettingsService', () => {
  return {
    SettingsService: vi.fn().mockImplementation(() => ({
      verifyDomain: vi.fn(),
      saveICPConfig: vi.fn(),
      saveEmailSettings: vi.fn(),
    })),
  };
});

// Mock encryption
vi.mock('../../../src/lib/encryption', () => ({
  encrypt: vi.fn((value: string) => `encrypted_${value}`),
  decrypt: vi.fn((value: string) => value.replace('encrypted_', '')),
}));

describe('OnboardingService', () => {
  let onboardingService: OnboardingService;
  let settingsService: SettingsService;
  const userId = 'test-user-id';

  beforeEach(() => {
    onboardingService = new OnboardingService();
    settingsService = new SettingsService();
    vi.clearAllMocks();
  });

  describe('startOnboarding', () => {
    it('should create new session if none exists', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // First call: no existing session
      (supabase as any)._setResolveValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found
      });

      // Second call: insert new session
      (supabase as any)._setResolveValue({
        data: {
          id: 'session-id',
          user_id: userId,
          status: 'in_progress',
          current_step: 'goal_selection',
          domain_verified: false,
          calendar_connected: false,
          auto_config_applied: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.startOnboarding(userId);
      
      expect(session.id).toBe('session-id');
      expect(session.status).toBe('in_progress');
      expect(session.current_step).toBe('goal_selection');
    });

    it('should return existing session if in progress', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          id: 'existing-session-id',
          user_id: userId,
          status: 'in_progress',
          current_step: 'industry',
          domain_verified: false,
          calendar_connected: false,
          auto_config_applied: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.startOnboarding(userId);
      
      expect(session.id).toBe('existing-session-id');
      expect(session.current_step).toBe('industry');
    });
  });

  describe('saveGoalSelection', () => {
    it('should update goal and move to industry step', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          id: 'session-id',
          user_id: userId,
          status: 'in_progress',
          current_step: 'industry',
          goal_meetings_per_month: '10-20',
          domain_verified: false,
          calendar_connected: false,
          auto_config_applied: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.saveGoalSelection(userId, '10-20');
      
      expect(session.goal_meetings_per_month).toBe('10-20');
      expect(session.current_step).toBe('industry');
    });
  });

  describe('saveIndustrySelection', () => {
    it('should save industry and auto-suggest ICP', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // First call: check industry exists
      (supabase as any)._setResolveValue({
        data: { industry: 'SaaS & Cloud Software' },
        error: null,
      });

      // Second call: get ICP mapping
      (supabase as any)._setResolveValue({
        data: {
          suggested_job_titles: ['CTO', 'VP Engineering'],
          suggested_company_sizes: ['11-50', '51-200'],
          suggested_locations: ['United States'],
          suggested_templates: [],
          suggested_channels: ['linkedin', 'email'],
          intent_signals: [],
        },
        error: null,
      });

      // Third call: update session
      (supabase as any)._setResolveValue({
        data: {
          id: 'session-id',
          user_id: userId,
          status: 'in_progress',
          current_step: 'icp',
          industry: 'SaaS & Cloud Software',
          icp_config: {
            job_titles: ['CTO', 'VP Engineering'],
            company_sizes: ['11-50', '51-200'],
            locations: ['United States'],
          },
          domain_verified: false,
          calendar_connected: false,
          auto_config_applied: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.saveIndustrySelection(userId, 'SaaS & Cloud Software');
      
      expect(session.industry).toBe('SaaS & Cloud Software');
      expect(session.current_step).toBe('icp');
      expect(session.icp_config?.job_titles).toContain('CTO');
    });

    it('should throw error if industry not found', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(
        onboardingService.saveIndustrySelection(userId, 'Invalid Industry')
      ).rejects.toThrow('Industry "Invalid Industry" not found');
    });
  });

  describe('getAutoSuggestedICP', () => {
    it('should return ICP config for industry', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          suggested_job_titles: ['CTO', 'VP Engineering'],
          suggested_company_sizes: ['11-50', '51-200'],
          suggested_locations: ['United States'],
          suggested_templates: [],
          suggested_channels: ['linkedin', 'email'],
          intent_signals: [],
        },
        error: null,
      });

      const icpConfig = await onboardingService.getAutoSuggestedICP('SaaS & Cloud Software');
      
      expect(icpConfig.job_titles).toContain('CTO');
      expect(icpConfig.company_sizes).toContain('11-50');
      expect(icpConfig.locations).toContain('United States');
    });

    it('should return fallback ICP if industry not found', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const icpConfig = await onboardingService.getAutoSuggestedICP('Unknown Industry');
      
      expect(icpConfig.job_titles).toBeDefined();
      expect(icpConfig.job_titles?.length).toBeGreaterThan(0);
    });
  });

  describe('saveICPConfig', () => {
    it('should merge user overrides with existing config', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // First call: get existing session
      (supabase as any)._setResolveValue({
        data: {
          icp_config: {
            job_titles: ['CTO', 'VP Engineering'],
            company_sizes: ['11-50', '51-200'],
            locations: ['United States'],
          },
        },
        error: null,
      });

      // Second call: update session
      (supabase as any)._setResolveValue({
        data: {
          id: 'session-id',
          user_id: userId,
          status: 'in_progress',
          current_step: 'domain',
          icp_config: {
            job_titles: ['CTO', 'VP Engineering', 'CEO'],
            company_sizes: ['11-50'],
            locations: ['United States', 'Canada'],
          },
          domain_verified: false,
          calendar_connected: false,
          auto_config_applied: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.saveICPConfig(userId, {
        job_titles: ['CTO', 'VP Engineering', 'CEO'],
        locations: ['United States', 'Canada'],
      });
      
      expect(session.current_step).toBe('domain');
      expect(session.icp_config?.job_titles).toContain('CEO');
    });
  });

  describe('verifyDomain', () => {
    it('should verify domain and update session', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Mock SettingsService.verifyDomain
      vi.spyOn(settingsService, 'verifyDomain').mockResolvedValue({
        domain: 'example.com',
        verified: true,
        checks: {
          spf: true,
          dkim: true,
          dmarc: true,
        },
        recommendations: {
          spf: null,
          dkim: null,
          dmarc: null,
        },
      });

      // Update session call
      (supabase as any)._setResolveValue({
        data: null,
        error: null,
      });

      const result = await onboardingService.verifyDomain(userId, 'example.com');
      
      expect(result.verified).toBe(true);
      expect(result.spf).toBe(true);
      expect(result.dkim).toBe(true);
      expect(result.dmarc).toBe(true);
    });
  });

  describe('getPreflightChecklist', () => {
    it('should return complete checklist when all items are done', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          goal_meetings_per_month: '10-20',
          industry: 'SaaS & Cloud Software',
          icp_config: {
            job_titles: ['CTO'],
            company_sizes: ['11-50'],
            locations: ['United States'],
          },
          domain_verified: true,
          calendar_connected: true,
        },
        error: null,
      });

      const checklist = await onboardingService.getPreflightChecklist(userId);
      
      expect(checklist.goal_selected).toBe(true);
      expect(checklist.industry_selected).toBe(true);
      expect(checklist.icp_configured).toBe(true);
      expect(checklist.domain_verified).toBe(true);
      expect(checklist.calendar_connected).toBe(true);
      expect(checklist.all_complete).toBe(true);
    });

    it('should return incomplete checklist when items are missing', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          goal_meetings_per_month: '10-20',
          industry: null,
          icp_config: null,
          domain_verified: false,
          calendar_connected: false,
        },
        error: null,
      });

      const checklist = await onboardingService.getPreflightChecklist(userId);
      
      expect(checklist.goal_selected).toBe(true);
      expect(checklist.industry_selected).toBe(false);
      expect(checklist.icp_configured).toBe(false);
      expect(checklist.domain_verified).toBe(false);
      expect(checklist.calendar_connected).toBe(false);
      expect(checklist.all_complete).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding when all prerequisites met', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      // Mock getPreflightChecklist
      vi.spyOn(onboardingService, 'getPreflightChecklist').mockResolvedValue({
        goal_selected: true,
        industry_selected: true,
        icp_configured: true,
        domain_verified: true,
        calendar_connected: true,
        all_complete: true,
      });

      // Mock applyAutoConfiguration
      vi.spyOn(onboardingService, 'applyAutoConfiguration').mockResolvedValue({
        icp_applied: true,
        templates_applied: 0,
        channels_applied: ['linkedin', 'email'],
        intent_signals_applied: [],
      });

      // Update session call
      (supabase as any)._setResolveValue({
        data: {
          id: 'session-id',
          user_id: userId,
          status: 'completed',
          current_step: 'complete',
          completed_at: new Date().toISOString(),
          domain_verified: true,
          calendar_connected: true,
          auto_config_applied: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const session = await onboardingService.completeOnboarding(userId);
      
      expect(session.status).toBe('completed');
      expect(session.completed_at).toBeDefined();
    });

    it('should throw error if prerequisites not met', async () => {
      vi.spyOn(onboardingService, 'getPreflightChecklist').mockResolvedValue({
        goal_selected: true,
        industry_selected: true,
        icp_configured: true,
        domain_verified: false,
        calendar_connected: false,
        all_complete: false,
      });

      await expect(
        onboardingService.completeOnboarding(userId)
      ).rejects.toThrow('Cannot complete onboarding: Missing prerequisites');
    });
  });
});



