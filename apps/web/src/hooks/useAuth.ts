import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, session, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    // Check session on mount
    checkSession();
  }, [checkSession]);

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

