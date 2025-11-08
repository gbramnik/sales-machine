import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export const useOnboardingIndustries = () => {
  const [industries, setIndustries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getIndustries();
        if (response.success && response.data) {
          setIndustries(response.data.industries);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch industries'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return { industries, isLoading, error };
};



