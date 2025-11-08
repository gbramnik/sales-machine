import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ICPConfig } from './useOnboarding';

export const useOnboardingICP = (industry?: string) => {
  const [suggestions, setSuggestions] = useState<ICPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestions = useCallback(async (targetIndustry?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getICPSuggestions(targetIndustry || industry);
      if (response.success && response.data) {
        setSuggestions(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ICP suggestions'));
    } finally {
      setIsLoading(false);
    }
  }, [industry]);

  useEffect(() => {
    if (industry) {
      fetchSuggestions(industry);
    }
  }, [industry, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    refetch: fetchSuggestions,
  };
};



