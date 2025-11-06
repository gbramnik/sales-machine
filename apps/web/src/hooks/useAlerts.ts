import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface Alert {
  id: string;
  type: 'deliverability' | 'vip_review' | 'meeting_booked' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  severity: 'high' | 'medium' | 'low';
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getDashboardAlerts();
        if (response.success && response.data) {
          setAlerts(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
        console.error('Error fetching alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const dismissAlert = async (alertId: string) => {
    try {
      await apiClient.dismissAlert(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  return { alerts, isLoading, error, dismissAlert };
};

