import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  healthScore: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    breakdown: {
      deliverability: number;
      responseRate: number;
      aiPerformance: number;
    };
  };
  pipeline: {
    contacted: number;
    engaged: number;
    qualified: number;
    meetingBooked: number;
  };
  pendingReviews: number;
  activeCampaigns: number;
  totalProspects: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};



