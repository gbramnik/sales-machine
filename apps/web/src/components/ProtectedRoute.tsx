import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Button } from '@/components/ui/button';

export const ProtectedRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const {
    completed,
    isLoading: onboardingLoading,
    error: onboardingError,
    refresh,
  } = useOnboardingStatus({ skip: !isAuthenticated });

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  if (isLoading || (isAuthenticated && !isOnboardingRoute && (onboardingLoading || completed === null))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAuthenticated && !isOnboardingRoute) {
    if (onboardingError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">We couldn&apos;t confirm your setup</h2>
            <p className="mt-3 text-gray-600">
              Something went wrong while checking your onboarding status. Please try again.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                refresh(true).catch(() => {
                  /* handled in store */
                });
              }}
            >
              Retry
            </Button>
            <Button variant="ghost" onClick={() => navigate('/onboarding')}>
              Open Onboarding Wizard
            </Button>
          </div>
        </div>
      );
    }

    if (completed === false) {
      return <Navigate to="/onboarding" replace state={{ from: location }} />;
    }
  }

  if (isOnboardingRoute && completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

