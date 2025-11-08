import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

type TestAnalytics = Database['public']['Tables']['humanness_test_analytics']['Row'];
type TestAnalyticsInsert = Database['public']['Tables']['humanness_test_analytics']['Insert'];

export interface DetectionRateMetrics {
  overall_detection_rate: number;
  strategy_metrics: Array<{
    strategy: string;
    detection_rate: number;
    ai_messages_count: number;
    ai_correctly_identified: number;
    ai_incorrectly_identified_as_human: number;
    false_positive_rate: number;
  }>;
  target_met: boolean;
}

export interface WinningStrategy {
  strategy_name: string;
  detection_rate: number;
  ai_messages_count: number;
  ai_correctly_identified: number;
  ai_incorrectly_identified_as_human: number;
}

export class HumannessTestAnalyticsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Calculate detection rate metrics for a test
   */
  async calculateDetectionRate(testId: string): Promise<DetectionRateMetrics> {
    // Query responses with message details
    const { data: responses, error } = await this.supabase
      .from('humanness_test_responses')
      .select(`
        identified_as_ai,
        message:humanness_test_messages!inner(
          message_type,
          ai_prompting_strategy
        )
      `)
      .eq('test_id', testId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch test responses',
        500,
        error
      );
    }

    // Group by strategy and message type
    const strategyData: Record<string, {
      ai_messages_count: number;
      human_messages_count: number;
      ai_correctly_identified: number;
      ai_incorrectly_identified_as_human: number;
      human_incorrectly_identified_as_ai: number;
    }> = {};

    // Initialize overall counters
    let totalAiMessages = 0;
    let totalHumanMessages = 0;
    let totalAiCorrectlyIdentified = 0;
    let totalAiIncorrectlyIdentified = 0;
    let totalHumanIncorrectlyIdentified = 0;

    for (const response of responses || []) {
      const message = (response as any).message;
      const strategy = message.ai_prompting_strategy || 'overall';
      const isAi = message.message_type === 'ai_generated';
      const identifiedAsAi = response.identified_as_ai;

      if (!strategyData[strategy]) {
        strategyData[strategy] = {
          ai_messages_count: 0,
          human_messages_count: 0,
          ai_correctly_identified: 0,
          ai_incorrectly_identified_as_human: 0,
          human_incorrectly_identified_as_ai: 0,
        };
      }

      if (isAi) {
        strategyData[strategy].ai_messages_count++;
        totalAiMessages++;
        if (identifiedAsAi) {
          strategyData[strategy].ai_correctly_identified++;
          totalAiCorrectlyIdentified++;
        } else {
          strategyData[strategy].ai_incorrectly_identified_as_human++;
          totalAiIncorrectlyIdentified++;
        }
      } else {
        strategyData[strategy].human_messages_count++;
        totalHumanMessages++;
        if (identifiedAsAi) {
          strategyData[strategy].human_incorrectly_identified_as_ai++;
          totalHumanIncorrectlyIdentified++;
        }
      }
    }

    // Calculate metrics per strategy
    const strategyMetrics = Object.entries(strategyData)
      .filter(([strategy]) => strategy !== 'overall' && strategy !== null)
      .map(([strategy, data]) => {
        const detectionRate = data.ai_messages_count > 0
          ? (data.ai_correctly_identified / data.ai_messages_count) * 100
          : 0;
        const falsePositiveRate = data.human_messages_count > 0
          ? (data.human_incorrectly_identified_as_ai / data.human_messages_count) * 100
          : 0;

        return {
          strategy,
          detection_rate: Math.round(detectionRate * 100) / 100,
          ai_messages_count: data.ai_messages_count,
          ai_correctly_identified: data.ai_correctly_identified,
          ai_incorrectly_identified_as_human: data.ai_incorrectly_identified_as_human,
          false_positive_rate: Math.round(falsePositiveRate * 100) / 100,
        };
      });

    // Calculate overall detection rate
    const overallDetectionRate = totalAiMessages > 0
      ? (totalAiCorrectlyIdentified / totalAiMessages) * 100
      : 0;

    // Get target from test
    const { data: test } = await this.supabase
      .from('humanness_tests')
      .select('target_detection_rate')
      .eq('id', testId)
      .single();

    const target = test?.target_detection_rate || 20.0;
    const targetMet = overallDetectionRate < target;

    // Store analytics in database (upsert)
    for (const metric of strategyMetrics) {
      const analyticsInsert: TestAnalyticsInsert = {
        test_id: testId,
        ai_prompting_strategy: metric.strategy,
        total_messages: metric.ai_messages_count + (strategyData[metric.strategy]?.human_messages_count || 0),
        ai_messages_count: metric.ai_messages_count,
        human_messages_count: strategyData[metric.strategy]?.human_messages_count || 0,
        ai_correctly_identified: metric.ai_correctly_identified,
        ai_incorrectly_identified_as_human: metric.ai_incorrectly_identified_as_human,
        human_incorrectly_identified_as_ai: strategyData[metric.strategy]?.human_incorrectly_identified_as_ai || 0,
        detection_rate: metric.detection_rate,
        false_positive_rate: metric.false_positive_rate,
      };

      await this.supabase
        .from('humanness_test_analytics')
        .upsert(analyticsInsert, {
          onConflict: 'test_id,ai_prompting_strategy',
        });
    }

    return {
      overall_detection_rate: Math.round(overallDetectionRate * 100) / 100,
      strategy_metrics: strategyMetrics,
      target_met: targetMet,
    };
  }

  /**
   * Get winning strategy (lowest detection rate)
   */
  async getWinningStrategy(testId: string): Promise<WinningStrategy | null> {
    const { data, error } = await this.supabase
      .from('humanness_test_analytics')
      .select('*')
      .eq('test_id', testId)
      .not('ai_prompting_strategy', 'is', null)
      .order('detection_rate', { ascending: true })
      .limit(1);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch winning strategy',
        500,
        error
      );
    }

    if (!data || data.length === 0) {
      return null;
    }

    const analytics = data[0];
    return {
      strategy_name: analytics.ai_prompting_strategy || 'unknown',
      detection_rate: Number(analytics.detection_rate),
      ai_messages_count: analytics.ai_messages_count,
      ai_correctly_identified: analytics.ai_correctly_identified,
      ai_incorrectly_identified_as_human: analytics.ai_incorrectly_identified_as_human,
    };
  }
}



