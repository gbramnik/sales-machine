import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { setSentryUser, clearSentryUser } from '@/lib/sentry';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Set Sentry user context
        if (data.user) {
          setSentryUser(data.user.id, data.user.email || '');
        }

        set({
          user: data.user,
          session: data.session,
          isLoading: false,
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        clearSentryUser();
        set({
          user: null,
          session: null,
          isLoading: false,
        });
      },

      checkSession: async () => {
        set({ isLoading: true });
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking session:', error);
          set({ isLoading: false });
          return;
        }

        // Set Sentry user context
        if (session?.user) {
          setSentryUser(session.user.id, session.user.email || '');
        } else {
          clearSentryUser();
        }

        set({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });
      },

      setSession: (session: Session | null) => {
        // Set Sentry user context
        if (session?.user) {
          setSentryUser(session.user.id, session.user.email || '');
        } else {
          clearSentryUser();
        }

        set({
          session,
          user: session?.user ?? null,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Initialize session check on store creation
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});

