import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useOnboarding } from '@/hooks/useOnboarding';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useOnboarding();

  // Redirect to dashboard if onboarding is already completed
  useEffect(() => {
    if (!isLoading && session?.status === 'completed') {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isLoading, navigate]);

  const handleComplete = () => {
    // Redirect to dashboard after successful onboarding
    navigate('/dashboard', { replace: true });
  };

  // Show loading state while checking session
  if (isLoading) {
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

  return (
    <ErrorBoundary>
      <OnboardingWizard onComplete={handleComplete} />
    </ErrorBoundary>
  );
};

