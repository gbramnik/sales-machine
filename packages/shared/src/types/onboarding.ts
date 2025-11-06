/**
 * Onboarding Wizard Types
 * Story 5.1: Onboarding Wizard (Backend)
 */

export interface OnboardingSession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_step: 'goal_selection' | 'industry' | 'icp' | 'domain' | 'calendar' | 'complete';
  goal_meetings_per_month?: '5-10' | '10-20' | '20-30';
  industry?: string;
  icp_config?: ICPConfig;
  domain_verified: boolean;
  domain_verification_details?: DomainVerificationResult;
  calendar_connected: boolean;
  calendar_provider?: 'google' | 'outlook';
  calendar_email?: string;
  preflight_checklist?: PreflightChecklist;
  auto_config_applied: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ICPConfig {
  job_titles?: string[];
  company_sizes?: string[];
  locations?: string[];
  templates?: string[];
  channels?: string[];
  intent_signals?: string[];
}

export interface DomainVerificationResult {
  verified: boolean;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  recommendations?: string[];
}

export interface PreflightChecklist {
  goal_selected: boolean;
  industry_selected: boolean;
  icp_configured: boolean;
  domain_verified: boolean;
  calendar_connected: boolean;
  all_complete: boolean;
}

export interface OAuthUrl {
  oauth_url: string;
  state: string;
}

export interface CalendarConnectionResult {
  connected: boolean;
  provider: string;
  email: string;
}

export interface AutoConfigResult {
  icp_applied: boolean;
  templates_applied: number;
  channels_applied: string[];
  intent_signals_applied: string[];
}

export interface IndustryICPMapping {
  id: string;
  industry: string;
  suggested_job_titles: string[];
  suggested_company_sizes: string[];
  suggested_locations: string[];
  suggested_templates?: string[];
  suggested_channels: string[];
  intent_signals?: string[];
  created_at: string;
  updated_at: string;
}

