import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface OnboardingSession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_step: 'goal_selection' | 'industry' | 'icp' | 'domain' | 'calendar' | 'complete';
  goal_meetings_per_month?: '5-10' | '10-20' | '20-30';
  industry?: string;
  icp_config?: any;
  domain_verified: boolean;
  domain_verification_details?: any;
  calendar_connected: boolean;
  calendar_provider?: 'google' | 'outlook';
  calendar_email?: string;
  preflight_checklist?: any;
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

export const useOnboarding = () => {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getOnboardingStatus();
      if (response.success && response.data) {
        setSession(response.data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch onboarding status'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.startOnboarding();
      if (response.success && response.data) {
        setSession(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGoal = useCallback(async (goal: '5-10' | '10-20' | '20-30') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveGoalSelection(goal);
      if (response.success && response.data) {
        setSession(response.data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save goal selection'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveIndustry = useCallback(async (industry: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveIndustrySelection(industry);
      if (response.success && response.data) {
        setSession(response.data.session);
        return response.data.icp_suggestions;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save industry selection'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveICP = useCallback(async (icpConfig: ICPConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveICPConfig(icpConfig);
      if (response.success && response.data) {
        setSession(response.data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save ICP config'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyDomain = useCallback(async (domain: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.verifyDomain(domain);
      if (response.success && response.data) {
        // Update session with domain verification result
        await fetchStatus();
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to verify domain'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  const connectCalendar = useCallback(async (provider: 'google' | 'outlook') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getCalendarOAuthUrl(provider);
      if (response.success && response.data) {
        // Redirect to OAuth URL
        window.location.href = response.data.oauth_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initiate calendar OAuth'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.completeOnboarding();
      if (response.success && response.data) {
        setSession(response.data.session);
        return response.data.auto_config;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    session,
    isLoading,
    error,
    startOnboarding,
    saveGoal,
    saveIndustry,
    saveICP,
    verifyDomain,
    connectCalendar,
    completeOnboarding,
    refetch: fetchStatus,
  };
};

