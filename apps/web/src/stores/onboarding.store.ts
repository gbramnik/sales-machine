import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type {
  OnboardingChecklistItem,
  OnboardingSession,
  OnboardingStatus,
  OnboardingStep,
} from '@sales-machine/shared';
import { apiClient } from '@/lib/api-client';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;
const STATUS_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
export const ONBOARDING_STATUS_STALE_TIME_MS = STATUS_STALE_TIME_MS;

const wait = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

const normalizeStatus = (payload: unknown): OnboardingStatus => {
  if (!payload || typeof payload !== 'object') {
    return { completed: false, checklist: [] };
  }

  // Direct contract: { completed, pendingStep, checklist }
  if ('completed' in payload) {
    const direct = payload as Partial<OnboardingStatus> & Record<string, unknown>;
    return {
      completed: Boolean(direct.completed),
      pendingStep: (direct.pendingStep as OnboardingStep | undefined) ??
        ((direct.pending_step as OnboardingStep | undefined) ?? undefined),
      checklist: Array.isArray(direct.checklist)
        ? (direct.checklist as OnboardingChecklistItem[])
        : [],
      updatedAt: typeof direct.updatedAt === 'string' ? direct.updatedAt : undefined,
    };
  }

  // Legacy contract: { session, checklist }
  if ('session' in payload) {
    const legacy = payload as {
      session: OnboardingSession;
      checklist?: OnboardingChecklistItem[];
    };
    return {
      completed: legacy.session.status === 'completed',
      pendingStep: legacy.session.current_step,
      checklist: legacy.checklist ?? [],
      updatedAt: legacy.session.updated_at,
    };
  }

  return { completed: false, checklist: [] };
};

interface FetchOptions {
  force?: boolean;
}

interface OnboardingStoreState {
  completed: boolean | null;
  pendingStep?: OnboardingStep;
  checklist: OnboardingChecklistItem[];
  isLoading: boolean;
  error?: string;
  lastFetchedAt?: number;
  cachedUserId?: string | null;
  fetchStatus: (options?: FetchOptions) => Promise<OnboardingStatus | null>;
  markCompleted: (override?: Partial<OnboardingStatus>) => void;
  setStatus: (nextStatus: Partial<OnboardingStatus>) => void;
  syncFromSession: (session: OnboardingSession, checklist?: OnboardingChecklistItem[]) => void;
  setChecklist: (items: OnboardingChecklistItem[]) => void;
  setUserId: (userId: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        completed: null,
        pendingStep: undefined,
        checklist: [],
        isLoading: false,
        error: undefined,
        lastFetchedAt: undefined,
        cachedUserId: undefined,

        fetchStatus: async ({ force = false }: FetchOptions = {}) => {
          const { lastFetchedAt, isLoading, cachedUserId, completed } = get();

          if (!cachedUserId) {
            return null;
          }

          if (!force && !isLoading && lastFetchedAt) {
            const age = Date.now() - lastFetchedAt;
            if (age < STATUS_STALE_TIME_MS && completed !== null) {
              return {
                completed: Boolean(completed),
                pendingStep: get().pendingStep,
                checklist: get().checklist,
                updatedAt: new Date(lastFetchedAt).toISOString(),
              };
            }
          }

          set({ isLoading: true, error: undefined });
          let lastError: Error | null = null;

          for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt += 1) {
            try {
              const response = await apiClient.getOnboardingStatus();
              const payload =
                response && typeof response === 'object' && 'success' in response
                  ? (response as { success: boolean; data?: unknown }).data
                  : response;

              const normalized = normalizeStatus(payload);

              set({
                completed: normalized.completed,
                pendingStep: normalized.pendingStep,
                checklist: normalized.checklist,
                isLoading: false,
                error: undefined,
                lastFetchedAt: Date.now(),
              });

              return normalized;
            } catch (err) {
              lastError = err instanceof Error ? err : new Error('Failed to fetch onboarding status');
              if (attempt < MAX_RETRY_ATTEMPTS - 1) {
                await wait(RETRY_BACKOFF_MS * 2 ** attempt);
                continue;
              }
            }
          }

          set({
            isLoading: false,
            error: lastError?.message ?? 'Unable to load onboarding status.',
            lastFetchedAt: Date.now(),
          });

          if (lastError) {
            throw lastError;
          }

          return null;
        },

        markCompleted: (override) => {
          set({
            completed: true,
            pendingStep: override?.pendingStep,
            checklist: override?.checklist ?? get().checklist,
            error: undefined,
            lastFetchedAt: Date.now(),
          });
        },

        setStatus: (nextStatus) => {
          set((state) => ({
            completed:
              typeof nextStatus.completed === 'boolean' ? nextStatus.completed : state.completed,
            pendingStep: nextStatus.pendingStep ?? state.pendingStep,
            checklist: nextStatus.checklist ?? state.checklist,
            error: undefined,
            lastFetchedAt: Date.now(),
          }));
        },

        syncFromSession: (session, checklist) => {
          set({
            completed: session.status === 'completed',
            pendingStep: session.current_step,
            checklist: checklist ?? get().checklist,
            error: undefined,
            lastFetchedAt: Date.now(),
          });
        },

        setChecklist: (items) => {
          set({
            checklist: items,
            lastFetchedAt: Date.now(),
          });
        },

        setUserId: (userId) => {
          const { cachedUserId } = get();

          if (!userId) {
            set({
              cachedUserId: null,
              completed: null,
              pendingStep: undefined,
              checklist: [],
              isLoading: false,
              error: undefined,
              lastFetchedAt: undefined,
            });
            return;
          }

          if (cachedUserId && cachedUserId !== userId) {
            set({
              cachedUserId: userId,
              completed: null,
              pendingStep: undefined,
              checklist: [],
              isLoading: false,
              error: undefined,
              lastFetchedAt: undefined,
            });
            return;
          }

          if (cachedUserId !== userId) {
            set({ cachedUserId: userId });
          }
        },

        reset: () => {
          set({
            completed: null,
            pendingStep: undefined,
            checklist: [],
            isLoading: false,
            error: undefined,
            lastFetchedAt: undefined,
            cachedUserId: null,
          });
        },
      }),
      {
        name: 'onboarding-status',
        partialize: (state) => ({
          completed: state.completed,
          pendingStep: state.pendingStep,
          checklist: state.checklist,
          lastFetchedAt: state.lastFetchedAt,
          cachedUserId: state.cachedUserId ?? null,
        }),
      }
    )
  )
);

export const onboardingStatusSelectors = {
  completed: (state: OnboardingStoreState) => state.completed,
  pendingStep: (state: OnboardingStoreState) => state.pendingStep,
  checklist: (state: OnboardingStoreState) => state.checklist,
  isLoading: (state: OnboardingStoreState) => state.isLoading,
  error: (state: OnboardingStoreState) => state.error,
  lastFetchedAt: (state: OnboardingStoreState) => state.lastFetchedAt,
  fetchStatus: (state: OnboardingStoreState) => state.fetchStatus,
  markCompleted: (state: OnboardingStoreState) => state.markCompleted,
  syncFromSession: (state: OnboardingStoreState) => state.syncFromSession,
  setStatus: (state: OnboardingStoreState) => state.setStatus,
  setChecklist: (state: OnboardingStoreState) => state.setChecklist,
  setUserId: (state: OnboardingStoreState) => state.setUserId,
  reset: (state: OnboardingStoreState) => state.reset,
};


