import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(resolveValue)),
    };
    
    // Make the chain thenable (Promise-like)
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

describe('SettingsService', () => {
  let settingsService: SettingsService;
  const userId = 'test-user-id';

  beforeEach(() => {
    settingsService = new SettingsService();
    vi.clearAllMocks();
  });

  describe('getApiCredentials', () => {
    it('should return masked credentials without api_key', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: [
          {
            id: 'cred-1',
            service_name: 'openai',
            webhook_url: null,
            is_active: true,
            last_verified_at: '2025-01-13T00:00:00Z',
            created_at: '2025-01-13T00:00:00Z',
            updated_at: '2025-01-13T00:00:00Z',
          },
        ],
        error: null,
      });

      const credentials = await settingsService.getApiCredentials(userId);

      expect(credentials).toBeDefined();
      expect(credentials[0]).not.toHaveProperty('api_key');
      expect(credentials[0]).toHaveProperty('service_name', 'openai');
    });
  });

  describe('saveApiCredential', () => {
    it('should save credential without exposing api_key in response', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          id: 'cred-1',
          service_name: 'openai',
          webhook_url: null,
          is_active: true,
          last_verified_at: null,
        },
        error: null,
      });

      const result = await settingsService.saveApiCredential(userId, {
        service_name: 'openai',
        api_key: 'secret-key-123',
      });

      expect(result).not.toHaveProperty('api_key');
      expect(result).toHaveProperty('service_name', 'openai');
    });
  });

  describe('deleteApiCredential', () => {
    it('should delete credential successfully', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ error: null });

      const result = await settingsService.deleteApiCredential(userId, 'openai');

      expect(result).toBe(true);
    });
  });

  describe('getICPConfig', () => {
    it('should return ICP config from icp_criteria JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          icp_criteria: {
            industries: ['SaaS', 'Tech'],
            job_titles: ['CTO', 'VP Engineering'],
            company_sizes: ['50-200'],
            locations: ['US'],
          },
        },
        error: null,
      });

      const config = await settingsService.getICPConfig(userId);

      expect(config).toHaveProperty('industries');
      expect(config.industries).toEqual(['SaaS', 'Tech']);
      expect(config.job_titles).toEqual(['CTO', 'VP Engineering']);
    });

    it('should return defaults when icp_criteria is null', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: { icp_criteria: null },
        error: null,
      });

      const config = await settingsService.getICPConfig(userId);

      expect(config.industries).toEqual([]);
      expect(config.job_titles).toEqual([]);
    });
  });

  describe('saveICPConfig', () => {
    it('should save ICP config to icp_criteria JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ error: null });

      const config = {
        industries: ['SaaS'],
        job_titles: ['CTO'],
        company_sizes: ['50-200'],
        locations: ['US'],
      };

      const result = await settingsService.saveICPConfig(userId, config);

      expect(result).toEqual(config);
    });
  });

  describe('getEmailSettings', () => {
    it('should return email settings from email_settings JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          email_settings: {
            domain: 'example.com',
            sending_email: 'noreply@example.com',
            daily_limit: 50,
            warm_up_enabled: true,
            warm_up_days_required: 14,
            bounce_rate_threshold: 5,
          },
        },
        error: null,
      });

      const settings = await settingsService.getEmailSettings(userId);

      expect(settings).toHaveProperty('domain', 'example.com');
      expect(settings).toHaveProperty('daily_limit', 50);
    });

    it('should return defaults when email_settings is null', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: { email_settings: null },
        error: null,
      });

      const settings = await settingsService.getEmailSettings(userId);

      expect(settings.daily_limit).toBe(20);
      expect(settings.warm_up_enabled).toBe(true);
    });
  });

  describe('saveEmailSettings', () => {
    it('should save email settings to email_settings JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ error: null });

      const settings = {
        domain: 'example.com',
        daily_limit: 50,
      };

      const result = await settingsService.saveEmailSettings(userId, settings);

      expect(result).toEqual(settings);
    });
  });

  describe('getAISettings', () => {
    it('should return AI settings from ai_settings JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: {
          ai_settings: {
            personality_id: 'persona-1',
            tone: 'professional',
            confidence_threshold: 85,
            use_vip_mode: true,
            response_templates: [],
          },
        },
        error: null,
      });

      const settings = await settingsService.getAISettings(userId);

      expect(settings).toHaveProperty('tone', 'professional');
      expect(settings).toHaveProperty('confidence_threshold', 85);
    });

    it('should return defaults when ai_settings is null', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({
        data: { ai_settings: null },
        error: null,
      });

      const settings = await settingsService.getAISettings(userId);

      expect(settings.tone).toBe('professional');
      expect(settings.confidence_threshold).toBe(80);
      expect(settings.use_vip_mode).toBe(true);
    });
  });

  describe('saveAISettings', () => {
    it('should save AI settings to ai_settings JSONB field', async () => {
      const { supabase } = await import('../../../src/lib/supabase');
      
      (supabase as any)._setResolveValue({ error: null });

      const settings = {
        tone: 'casual' as const,
        confidence_threshold: 90,
        use_vip_mode: false,
      };

      const result = await settingsService.saveAISettings(userId, settings);

      expect(result).toEqual(settings);
    });
  });
});

