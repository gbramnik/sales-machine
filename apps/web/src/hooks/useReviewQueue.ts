import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ReviewQueueItem {
  id: string;
  prospect: {
    id: string;
    full_name: string;
    company_name: string;
    job_title?: string | null;
    is_vip?: boolean;
  };
  proposed_message: string;
  proposed_subject?: string | null;
  ai_confidence_score: number;
  ai_reasoning?: string | null;
  channel: 'linkedin' | 'email';
  created_at: string;
  priority?: number;
  requires_immediate_attention?: boolean;
}

export interface ReviewQueueResponse {
  success: boolean;
  data: ReviewQueueItem[];
  filter?: string;
  vip_count?: number;
  non_vip_count?: number;
}

export const useReviewQueue = (filter: 'vip' | 'low_confidence' | 'all' = 'all') => {
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vipCount, setVipCount] = useState(0);
  const [lowConfidenceCount, setLowConfidenceCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Map filter to API filter
        const apiFilter = filter === 'vip' ? 'vip' : filter === 'low_confidence' ? 'non_vip' : 'all';
        const response = await apiClient.getReviewQueue({ filter: apiFilter });
        
        if (response.success && response.data) {
          // Filter low confidence (<80%) if needed
          let filtered = response.data;
          if (filter === 'low_confidence') {
            filtered = response.data.filter((r) => r.ai_confidence_score < 80);
          }
          
          setReviews(filtered);
          setVipCount(response.vip_count || 0);
          setLowConfidenceCount(response.non_vip_count || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch review queue'));
        console.error('Error fetching review queue:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [filter]);

  const refetch = async () => {
    const apiFilter = filter === 'vip' ? 'vip' : filter === 'low_confidence' ? 'non_vip' : 'all';
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getReviewQueue({ filter: apiFilter });
      if (response.success && response.data) {
        let filtered = response.data;
        if (filter === 'low_confidence') {
          filtered = response.data.filter((r) => r.ai_confidence_score < 80);
        }
        setReviews(filtered);
        setVipCount(response.vip_count || 0);
        setLowConfidenceCount(response.non_vip_count || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch review queue'));
    } finally {
      setIsLoading(false);
    }
  };

  return { reviews, isLoading, error, vipCount, lowConfidenceCount, refetch };
};

