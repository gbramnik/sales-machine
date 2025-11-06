import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export const usePendingReviewCount = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getReviewQueue({ filter: 'all' });
      if (response.success && response.data) {
        setCount(response.data.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch review count'));
      console.error('Error fetching review count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { count, isLoading, error, refetch: fetchCount };
};

