import { useState, useEffect, useCallback } from 'react';
import type {
  DomainVerificationResult,
  ICPConfig,
  OnboardingChecklistItem,
  OnboardingSession,
  OnboardingStep,
} from '@sales-machine/shared';
import { apiClient } from '@/lib/api-client';
import { onboardingStatusSelectors, useOnboardingStore } from '@/stores/onboarding.store';

interface OnboardingStatusPayload {
  session?: OnboardingSession;
  checklist?: OnboardingChecklistItem[];
  completed?: boolean;
  pendingStep?: OnboardingStep;
}

const extractStatusPayload = (raw: unknown): OnboardingStatusPayload => {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  if ('session' in raw) {
    const value = raw as {
      session: OnboardingSession;
      checklist?: OnboardingChecklistItem[];
    };
    return {
      session: value.session,
      checklist: value.checklist,
    };
  }

  const direct = raw as Partial<OnboardingStatusPayload> & Record<string, unknown>;
  if ('completed' in direct || 'pendingStep' in direct) {
    return {
      completed: typeof direct.completed === 'boolean' ? direct.completed : undefined,
      pendingStep: (direct.pendingStep as OnboardingStep | undefined) ??
        (direct.pending_step as OnboardingStep | undefined),
      checklist: Array.isArray(direct.checklist)
        ? (direct.checklist as OnboardingChecklistItem[])
        : undefined,
    };
  }

  return {};
};

export const useOnboarding = () => {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const syncFromSession = useOnboardingStore(onboardingStatusSelectors.syncFromSession);
  const setStatus = useOnboardingStore(onboardingStatusSelectors.setStatus);
  const setChecklist = useOnboardingStore(onboardingStatusSelectors.setChecklist);
  const markCompleted = useOnboardingStore(onboardingStatusSelectors.markCompleted);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getOnboardingStatus();
      const payload = extractStatusPayload(
        response && typeof response === 'object' && 'success' in response
          ? (response as { success: boolean; data?: unknown }).data
          : response
      );

      if (payload.session) {
        setSession(payload.session);
        syncFromSession(payload.session, payload.checklist);
      } else if (typeof payload.completed === 'boolean') {
        setStatus({
          completed: payload.completed,
          pendingStep: payload.pendingStep,
          checklist: payload.checklist,
        });
      }

      if (payload.checklist) {
        setChecklist(payload.checklist);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch onboarding status'));
    } finally {
      setIsLoading(false);
    }
  }, [markCompleted, setChecklist, setStatus, syncFromSession]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.startOnboarding();
      if (response.success && response.data) {
        const payload = extractStatusPayload(response.data);
        if (payload.session) {
          setSession(payload.session);
          syncFromSession(payload.session, payload.checklist);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncFromSession]);

  const saveGoal = useCallback(async (goal: '5-10' | '10-20' | '20-30') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveGoalSelection(goal);
      if (response.success && response.data) {
        const payload = extractStatusPayload(response.data);
        if (payload.session) {
          setSession(payload.session);
          syncFromSession(payload.session, payload.checklist);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save goal selection'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncFromSession]);

  const saveIndustry = useCallback(async (industry: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveIndustrySelection(industry);
      if (response.success && response.data) {
        const payload = extractStatusPayload(response.data);
        if (payload.session) {
          setSession(payload.session);
          syncFromSession(payload.session, payload.checklist);
        }
        return (response.data as Record<string, unknown>).icp_suggestions;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save industry selection'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncFromSession]);

  const saveICP = useCallback(async (icpConfig: ICPConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.saveICPConfig(icpConfig);
      if (response.success && response.data) {
        const payload = extractStatusPayload(response.data);
        if (payload.session) {
          setSession(payload.session);
          syncFromSession(payload.session, payload.checklist);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save ICP config'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncFromSession]);

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
        const payload = extractStatusPayload(response.data);

        if (payload.session) {
          setSession(payload.session);
          syncFromSession(payload.session, payload.checklist);
        } else if (typeof payload.completed === 'boolean') {
          if (payload.completed) {
            markCompleted({
              completed: payload.completed,
              pendingStep: payload.pendingStep,
              checklist: payload.checklist,
            });
          } else {
            setStatus({
              completed: payload.completed,
              pendingStep: payload.pendingStep,
              checklist: payload.checklist,
            });
          }
        }

        if (payload.checklist) {
          setChecklist(payload.checklist);
        }

        window.dispatchEvent(new CustomEvent('onboarding:completed'));

        const autoConfig = (response.data as Record<string, unknown>).auto_config;
        return autoConfig;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete onboarding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [markCompleted, setChecklist, setStatus, syncFromSession]);

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

