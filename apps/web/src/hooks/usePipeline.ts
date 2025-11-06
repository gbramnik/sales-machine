import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ProspectCard {
  id: string;
  name: string;
  company: string;
  confidenceScore?: number;
  isVIP?: boolean;
  lastActivity: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  prospects: ProspectCard[];
  count: number;
}

export const usePipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getDashboardPipeline();
        if (response.success && response.data) {
          // Transform API response to PipelineStage format
          const pipelineData = response.data;
          const stages: PipelineStage[] = [
            {
              id: 'contacted',
              label: 'Contacted',
              prospects: pipelineData.contacted?.prospects || [],
              count: pipelineData.contacted?.count || 0,
            },
            {
              id: 'engaged',
              label: 'Engaged',
              prospects: pipelineData.engaged?.prospects || [],
              count: pipelineData.engaged?.count || 0,
            },
            {
              id: 'qualified',
              label: 'Qualified',
              prospects: pipelineData.qualified?.prospects || [],
              count: pipelineData.qualified?.count || 0,
            },
            {
              id: 'meeting-booked',
              label: 'Meeting Booked',
              prospects: pipelineData.meetingBooked?.prospects || [],
              count: pipelineData.meetingBooked?.count || 0,
            },
          ];
          setStages(stages);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pipeline'));
        console.error('Error fetching pipeline:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipeline();
  }, []);

  return { stages, isLoading, error };
};

