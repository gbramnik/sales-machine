import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Button } from '@/components/ui/button';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading, error, refetch } = useOnboarding();
  const { completed, isLoading: statusLoading } = useOnboardingStatus();

  const [requestedStep, setRequestedStep] = useState<number | undefined>(undefined);

  useEffect(() => {
    const stateStep =
      location.state && typeof location.state === 'object' && 'step' in location.state
        ? Number((location.state as Record<string, unknown>).step)
        : undefined;
    const queryStep = new URLSearchParams(location.search).get('step');
    const parsedStep = Number(queryStep ?? stateStep);

    if (!Number.isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
      setRequestedStep(parsedStep);
    }

    if (stateStep) {
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Redirect to dashboard if onboarding is already completed
  useEffect(() => {
    if (!isLoading && session?.status === 'completed') {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isLoading, navigate]);

  useEffect(() => {
    if (!statusLoading && completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [completed, statusLoading, navigate]);

  const handleComplete = () => {
    // Redirect to dashboard after successful onboarding
    navigate('/dashboard', { replace: true });
  };

  // Show loading state while checking session
  if (isLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  // Don't render wizard if already completed (will redirect)
  if (session?.status === 'completed') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">We hit a snag</h2>
          <p className="text-gray-600">
            Something went wrong while loading your onboarding session. Please try again.
          </p>
          <Button
            onClick={() => {
              refetch().catch(() => {
                /* handled in hook */
              });
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <OnboardingWizard onComplete={handleComplete} initialStep={requestedStep} />
    </ErrorBoundary>
  );
};

