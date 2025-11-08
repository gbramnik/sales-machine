import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, session, isLoading, checkSession } = useAuthStore();
  const bypassAuth = import.meta.env.VITE_E2E_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (bypassAuth) {
      useAuthStore.setState((state) => {
        const fallbackUser = state.user ?? ({ id: 'e2e-user', email: 'e2e@sales-machine.test' } as any);
        const fallbackSession =
          state.session ??
          ({
            access_token: 'e2e-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: 'e2e-refresh-token',
            user: fallbackUser,
          } as any);

        return {
          ...state,
          user: fallbackUser,
          session: fallbackSession,
          isLoading: false,
        };
      });
      return;
    }

    // Check session on mount
    checkSession();
  }, [checkSession, bypassAuth]);

  const isAuthenticated = !!user && !!session;

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    requireAuth,
  };
};

