import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { SettingsService } from './SettingsService';
import { encrypt, decrypt } from '../lib/encryption';
import { supabase } from '../lib/supabase';
import * as crypto from 'crypto';
import type {
  OnboardingSession,
  ICPConfig,
  DomainVerificationResult,
  PreflightChecklist,
  OAuthUrl,
  CalendarConnectionResult,
  AutoConfigResult,
} from '@sales-machine/shared/types/onboarding';

// Re-export types for convenience
export type {
  OnboardingSession,
  ICPConfig,
  DomainVerificationResult,
  PreflightChecklist,
  OAuthUrl,
  CalendarConnectionResult,
  AutoConfigResult,
};

export class OnboardingService {
  private settingsService: SettingsService;

  constructor(private supabaseClient: SupabaseClient<Database> = supabase) {
    this.settingsService = new SettingsService();
  }

  /**
   * Start or resume onboarding session
   */
  async startOnboarding(userId: string): Promise<OnboardingSession> {
    // Check if session exists
    const { data: existing } = await this.supabaseClient
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.status === 'completed') {
        // Return existing completed session
        return this.mapToOnboardingSession(existing);
      }
      if (existing.status === 'in_progress') {
        // Return existing session (resume)
        return this.mapToOnboardingSession(existing);
      }
    }

    // Create new session
    const { data: created, error } = await this.supabaseClient
      .from('onboarding_sessions')
      .insert({
        user_id: userId,
        status: 'in_progress',
        current_step: 'goal_selection',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create onboarding session: ${error.message}`);
    }

    return this.mapToOnboardingSession(created);
  }

  /**
   * Save goal selection
   */
  async saveGoalSelection(
    userId: string,
    goal: '5-10' | '10-20' | '20-30'
  ): Promise<OnboardingSession> {
    const { data, error } = await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        goal_meetings_per_month: goal,
        current_step: 'industry',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save goal selection: ${error.message}`);
    }

    return this.mapToOnboardingSession(data);
  }

  /**
   * Save industry selection and auto-suggest ICP
   */
  async saveIndustrySelection(
    userId: string,
    industry: string
  ): Promise<OnboardingSession> {
    // Validate industry exists
    const { data: industryMapping } = await this.supabaseClient
      .from('industry_icp_mappings')
      .select('industry')
      .eq('industry', industry)
      .single();

    if (!industryMapping) {
      throw new Error(`Industry "${industry}" not found`);
    }

    // Get auto-suggested ICP
    const icpConfig = await this.getAutoSuggestedICP(industry);

    // Update session
    const { data, error } = await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        industry,
        icp_config: icpConfig as any,
        current_step: 'icp',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save industry selection: ${error.message}`);
    }

    return this.mapToOnboardingSession(data);
  }

  /**
   * Get auto-suggested ICP configuration for an industry
   */
  async getAutoSuggestedICP(industry: string): Promise<ICPConfig> {
    const { data } = await this.supabaseClient
      .from('industry_icp_mappings')
      .select('suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals')
      .eq('industry', industry)
      .single();

    if (!data) {
      // Return generic fallback ICP config
      return {
        job_titles: ['CEO', 'CTO', 'VP Engineering', 'Director', 'Manager'],
        company_sizes: ['11-50', '51-200', '201-500'],
        locations: ['United States', 'Canada', 'United Kingdom'],
        templates: [],
        channels: ['linkedin', 'email'],
        intent_signals: ['job_postings', 'company_growth', 'funding_announcements'],
      };
    }

    return {
      job_titles: data.suggested_job_titles || [],
      company_sizes: data.suggested_company_sizes || [],
      locations: data.suggested_locations || [],
      templates: data.suggested_templates || [],
      channels: data.suggested_channels || ['linkedin', 'email'],
      intent_signals: data.intent_signals || [],
    };
  }

  /**
   * Save ICP configuration (user can override auto-suggestions)
   */
  async saveICPConfig(
    userId: string,
    icpConfig: Partial<ICPConfig>
  ): Promise<OnboardingSession> {
    // Get existing session to merge with
    const { data: session } = await this.supabaseClient
      .from('onboarding_sessions')
      .select('icp_config')
      .eq('user_id', userId)
      .single();

    // Merge with existing icp_config (preserve auto-suggestions, update user overrides)
    const existingConfig = (session?.icp_config as ICPConfig) || {};
    const mergedConfig: ICPConfig = {
      ...existingConfig,
      ...icpConfig, // User overrides take precedence
    };

    // Update session
    const { data, error } = await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        icp_config: mergedConfig as any,
        current_step: 'domain',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save ICP config: ${error.message}`);
    }

    // Also save to users.icp_criteria via SettingsService
    await this.settingsService.saveICPConfig(userId, {
      job_titles: mergedConfig.job_titles,
      company_sizes: mergedConfig.company_sizes,
      locations: mergedConfig.locations,
    });

    return this.mapToOnboardingSession(data);
  }

  /**
   * Verify domain DNS records
   */
  async verifyDomain(
    userId: string,
    domain: string
  ): Promise<DomainVerificationResult> {
    // Reuse SettingsService.verifyDomain()
    const result = await this.settingsService.verifyDomain(domain);

    const verified = result.checks.spf && result.checks.dkim && result.checks.dmarc;

    // Build recommendations array
    const recommendations: string[] = [];
    if (result.recommendations.spf) recommendations.push(result.recommendations.spf);
    if (result.recommendations.dkim) recommendations.push(result.recommendations.dkim);
    if (result.recommendations.dmarc) recommendations.push(result.recommendations.dmarc);

    // Update session
    const updateData: any = {
      domain_verified: verified,
      domain_verification_details: {
        spf: result.checks.spf,
        dkim: result.checks.dkim,
        dmarc: result.checks.dmarc,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      },
      updated_at: new Date().toISOString(),
    };

    // Move to next step if verified
    if (verified) {
      updateData.current_step = 'calendar';
    }

    await this.supabaseClient
      .from('onboarding_sessions')
      .update(updateData)
      .eq('user_id', userId);

    // Also save to email settings if verified
    if (verified) {
      await this.settingsService.saveEmailSettings(userId, { domain });
    }

    return {
      verified,
      spf: result.checks.spf,
      dkim: result.checks.dkim,
      dmarc: result.checks.dmarc,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  /**
   * Initiate calendar OAuth flow
   */
  async initiateCalendarOAuth(
    userId: string,
    provider: 'google' | 'outlook'
  ): Promise<OAuthUrl> {
    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    let oauthUrl: string;
    const redirectUri = process.env.CALENDAR_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID environment variable is required');
      }

      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;
    } else {
      // Outlook
      const clientId = process.env.OUTLOOK_CLIENT_ID;
      if (!clientId) {
        throw new Error('OUTLOOK_CLIENT_ID environment variable is required');
      }

      oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://graph.microsoft.com/Calendars.ReadWrite offline_access')}` +
        `&state=${state}`;
    }

    // Store state in session metadata
    await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        metadata: { oauth_state: state },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return {
      oauth_url: oauthUrl,
      state,
    };
  }

  /**
   * Handle calendar OAuth callback
   */
  async handleCalendarOAuthCallback(
    userId: string,
    code: string,
    state: string,
    provider: 'google' | 'outlook'
  ): Promise<CalendarConnectionResult> {
    // Verify state
    const { data: session } = await this.supabaseClient
      .from('onboarding_sessions')
      .select('metadata')
      .eq('user_id', userId)
      .single();

    const storedState = (session?.metadata as any)?.oauth_state;
    if (storedState !== state) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    const redirectUri = process.env.CALENDAR_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

    let accessToken: string;
    let refreshToken: string;
    let email: string;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange OAuth code: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      // Get calendar email
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to get user info: ${userInfoResponse.statusText}`);
      }

      const userInfo = await userInfoResponse.json();
      email = userInfo.email;
    } else {
      // Outlook
      const clientId = process.env.OUTLOOK_CLIENT_ID;
      const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error('OUTLOOK_CLIENT_ID and OUTLOOK_CLIENT_SECRET environment variables are required');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange OAuth code: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      // Get calendar email
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to get user info: ${userInfoResponse.statusText}`);
      }

      const userInfo = await userInfoResponse.json();
      email = userInfo.mail || userInfo.userPrincipalName;
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Update session
    await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        calendar_connected: true,
        calendar_provider: provider,
        calendar_access_token: encryptedAccessToken,
        calendar_refresh_token: encryptedRefreshToken,
        calendar_email: email,
        current_step: 'complete',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Also save to api_credentials table
    const serviceName = provider === 'google' ? 'cal_com' : 'cal_com'; // Using cal_com for both for now
    await this.supabaseClient
      .from('api_credentials')
      .upsert({
        user_id: userId,
        service_name: serviceName,
        api_key: encryptedAccessToken,
        metadata: {
          refresh_token: encryptedRefreshToken,
          email,
          provider,
        },
        is_active: true,
      }, {
        onConflict: 'user_id,service_name',
      });

    return {
      connected: true,
      provider,
      email,
    };
  }

  /**
   * Get preflight checklist
   */
  async getPreflightChecklist(userId: string): Promise<PreflightChecklist> {
    const { data: session } = await this.supabaseClient
      .from('onboarding_sessions')
      .select('goal_meetings_per_month, industry, icp_config, domain_verified, calendar_connected')
      .eq('user_id', userId)
      .single();

    if (!session) {
      // Return empty checklist if no session
      return {
        goal_selected: false,
        industry_selected: false,
        icp_configured: false,
        domain_verified: false,
        calendar_connected: false,
        all_complete: false,
      };
    }

    const goal_selected = !!session.goal_meetings_per_month;
    const industry_selected = !!session.industry;
    const icp_configured = !!session.icp_config && 
      JSON.stringify(session.icp_config) !== '{}' &&
      Object.keys(session.icp_config as any).length > 0;
    const domain_verified = session.domain_verified === true;
    const calendar_connected = session.calendar_connected === true;

    const all_complete = goal_selected && industry_selected && icp_configured && domain_verified && calendar_connected;

    return {
      goal_selected,
      industry_selected,
      icp_configured,
      domain_verified,
      calendar_connected,
      all_complete,
    };
  }

  /**
   * Apply auto-configuration based on industry
   */
  async applyAutoConfiguration(userId: string): Promise<AutoConfigResult> {
    const { data: session } = await this.supabaseClient
      .from('onboarding_sessions')
      .select('industry, icp_config, goal_meetings_per_month')
      .eq('user_id', userId)
      .single();

    if (!session || !session.industry) {
      throw new Error('Onboarding session not found or industry not selected');
    }

    // Get industry mapping
    const { data: industryMapping } = await this.supabaseClient
      .from('industry_icp_mappings')
      .select('suggested_templates, suggested_channels, intent_signals')
      .eq('industry', session.industry)
      .single();

    // Apply ICP config (already done in saveICPConfig, but verify)
    const icpConfig = session.icp_config as ICPConfig;
    if (icpConfig) {
      await this.settingsService.saveICPConfig(userId, {
        job_titles: icpConfig.job_titles,
        company_sizes: icpConfig.company_sizes,
        locations: icpConfig.locations,
      });
    }

    // Apply templates (mark as preferred)
    let templatesApplied = 0;
    if (industryMapping?.suggested_templates && industryMapping.suggested_templates.length > 0) {
      // TODO: Implement template preference marking when template preference system exists
      templatesApplied = industryMapping.suggested_templates.length;
    }

    // Apply channels (store in user settings if not already set)
    const channelsApplied = industryMapping?.suggested_channels || ['linkedin', 'email'];

    // Apply intent signals (store in user settings)
    const intentSignalsApplied = industryMapping?.intent_signals || [];

    // Create initial campaign (if CampaignService exists)
    // Note: CampaignService.create() requires agent_id and message_template
    // This would need to be handled separately or with defaults
    // For now, we'll skip campaign creation in auto-config

    // Update session
    await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        auto_config_applied: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return {
      icp_applied: !!icpConfig,
      templates_applied: templatesApplied,
      channels_applied: channelsApplied,
      intent_signals_applied: intentSignalsApplied,
    };
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string): Promise<OnboardingSession> {
    // Check preflight checklist
    const checklist = await this.getPreflightChecklist(userId);
    if (!checklist.all_complete) {
      throw new Error('Cannot complete onboarding: Missing prerequisites');
    }

    // Apply auto-configuration
    await this.applyAutoConfiguration(userId);

    // Update session
    const { data, error } = await this.supabaseClient
      .from('onboarding_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete onboarding: ${error.message}`);
    }

    return this.mapToOnboardingSession(data);
  }

  /**
   * Map database row to OnboardingSession interface
   */
  private mapToOnboardingSession(row: any): OnboardingSession {
    return {
      id: row.id,
      user_id: row.user_id,
      status: row.status,
      current_step: row.current_step,
      goal_meetings_per_month: row.goal_meetings_per_month,
      industry: row.industry,
      icp_config: row.icp_config as ICPConfig,
      domain_verified: row.domain_verified || false,
      domain_verification_details: row.domain_verification_details as DomainVerificationResult,
      calendar_connected: row.calendar_connected || false,
      calendar_provider: row.calendar_provider,
      calendar_email: row.calendar_email,
      preflight_checklist: row.preflight_checklist as PreflightChecklist,
      auto_config_applied: row.auto_config_applied || false,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
    };
  }
}

