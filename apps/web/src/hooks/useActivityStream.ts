import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'qualified' | 'responded' | 'booked' | 'flagged';
  prospect: {
    name: string;
    company: string;
  };
  confidence?: number;
  message?: string;
}

const formatActivity = (log: any): ActivityItem => {
  return {
    id: log.id || log.prospect_id || `activity-${Date.now()}`,
    timestamp: new Date(log.created_at || log.timestamp || Date.now()),
    type: log.action_taken === 'qualified' ? 'qualified' 
      : log.action_taken === 'booked' ? 'booked'
      : log.action_taken === 'flagged' ? 'flagged'
      : 'responded',
    prospect: {
      name: log.prospect_name || log.prospect?.name || 'Unknown',
      company: log.prospect_company || log.prospect?.company || 'Unknown',
    },
    confidence: log.ai_confidence_score || log.confidence_score,
    message: log.ai_response || log.message,
  };
};

export const useActivityStream = (enableLiveUpdates = false) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);
  const { user } = useAuthStore();

  // Fetch initial activities
  useEffect(() => {
    const fetchInitialActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getDashboardActivityStream({ limit: 20 });
        if (response.success && response.data) {
          const formatted = response.data.map(formatActivity);
          setActivities(formatted);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
        console.error('Error fetching activities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialActivities();
  }, []);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!enableLiveUpdates || !user?.id) return;

    // Subscribe to ai_conversation_log table
    const channel = supabase
      .channel('ai-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_conversation_log',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new activity to stream
          const newActivity = formatActivity(payload.new);
          setActivities((prev) => {
            // Add to top, keep max 50 items
            const updated = [newActivity, ...prev].slice(0, 50);
            return updated;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enableLiveUpdates, user?.id]);

  return { activities, isLoading, error };
};



