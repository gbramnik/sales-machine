import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

export interface ResponseRateMetrics {
  ai_messages_sent: number;
  replies_received: number;
  response_rate_per_100: number;
  below_threshold: boolean;
  threshold: number;
}

export interface ResponseRateTrend {
  daily_rates: Array<{
    date: string;
    response_rate: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  average_rate: number;
}

export class HumannessResponseRateService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Calculate response rate for a user over a date range
   */
  async calculateResponseRate(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ResponseRateMetrics> {
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Query AI messages sent and replies received
    const { data: outbound, error: outboundError } = await this.supabase
      .from('ai_conversation_log')
      .select('id')
      .eq('user_id', userId)
      .eq('direction', 'outbound')
      .eq('generated_by_ai', true)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);

    if (outboundError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch outbound messages',
        500,
        outboundError
      );
    }

    const { data: inbound, error: inboundError } = await this.supabase
      .from('ai_conversation_log')
      .select('id')
      .eq('user_id', userId)
      .eq('direction', 'inbound')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);

    if (inboundError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch inbound messages',
        500,
        inboundError
      );
    }

    const aiMessagesSent = outbound?.length || 0;
    const repliesReceived = inbound?.length || 0;
    const responseRatePer100 = aiMessagesSent > 0
      ? (repliesReceived / aiMessagesSent) * 100
      : 0;

    const threshold = 5.0;
    const belowThreshold = responseRatePer100 < threshold;

    return {
      ai_messages_sent: aiMessagesSent,
      replies_received: repliesReceived,
      response_rate_per_100: Math.round(responseRatePer100 * 100) / 100,
      below_threshold: belowThreshold,
      threshold,
    };
  }

  /**
   * Track response rate trend over time
   */
  async trackResponseRateTrend(
    userId: string,
    days: number = 30
  ): Promise<ResponseRateTrend> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyRates: Array<{ date: string; response_rate: number }> = [];

    // Calculate daily rates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const metrics = await this.calculateResponseRate(userId, date, nextDate);
      dailyRates.push({
        date: date.toISOString().split('T')[0],
        response_rate: metrics.response_rate_per_100,
      });
    }

    // Calculate trend
    const rates = dailyRates.map(r => r.response_rate);
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 0.5) {
      trend = 'stable';
    } else if (diff > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;

    return {
      daily_rates: dailyRates,
      trend,
      average_rate: Math.round(averageRate * 100) / 100,
    };
  }
}



