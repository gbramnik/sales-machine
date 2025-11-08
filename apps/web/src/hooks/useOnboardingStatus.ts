import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  ONBOARDING_STATUS_STALE_TIME_MS,
  onboardingStatusSelectors,
  useOnboardingStore,
} from '@/stores/onboarding.store';

interface UseOnboardingStatusOptions {
  skip?: boolean;
  staleTimeMs?: number;
}

export const useOnboardingStatus = (options?: UseOnboardingStatusOptions) => {
  const skip = options?.skip ?? false;
  const staleTime = options?.staleTimeMs ?? ONBOARDING_STATUS_STALE_TIME_MS;

  const userId = useAuthStore((state) => state.user?.id ?? null);

  const completed = useOnboardingStore(onboardingStatusSelectors.completed);
  const pendingStep = useOnboardingStore(onboardingStatusSelectors.pendingStep);
  const checklist = useOnboardingStore(onboardingStatusSelectors.checklist);
  const isLoading = useOnboardingStore(onboardingStatusSelectors.isLoading);
  const error = useOnboardingStore(onboardingStatusSelectors.error);
  const lastFetchedAt = useOnboardingStore(onboardingStatusSelectors.lastFetchedAt);
  const fetchStatus = useOnboardingStore(onboardingStatusSelectors.fetchStatus);
  const setUserId = useOnboardingStore(onboardingStatusSelectors.setUserId);

  const refresh = useCallback(
    (force = true) => fetchStatus({ force }),
    [fetchStatus]
  );

  useEffect(() => {
    setUserId(userId);
  }, [setUserId, userId]);

  useEffect(() => {
    if (skip || !userId) {
      return;
    }

    if (!lastFetchedAt) {
      fetchStatus({ force: true }).catch(() => {
        // Errors are handled in store state; suppress unhandled rejection.
      });
      return;
    }

    const age = Date.now() - lastFetchedAt;
    if (age > staleTime) {
      fetchStatus({ force: true }).catch(() => {
        // handled in store
      });
    }
  }, [skip, userId, lastFetchedAt, staleTime, fetchStatus]);

  return {
    completed,
    pendingStep,
    checklist,
    isLoading,
    error,
    lastFetchedAt,
    refresh,
  };
};




