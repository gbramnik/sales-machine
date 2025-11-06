import { supabase } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Confidence Analytics Service
 * 
 * Provides analytics for AI confidence scoring:
 * - Confidence score distribution
 * - Review metrics (percentage requiring review, conversion rate)
 * - Average confidence score
 */

export interface ConfidenceDistribution {
  '0-20': number;
  '21-40': number;
  '41-60': number;
  '61-80': number;
  '81-100': number;
}

export interface ReviewMetrics {
  total_messages: number;
  queued_messages: number;
  approved_messages: number;
  percentage_requiring_review: number;
  review_to_send_conversion_rate: number;
}

export class ConfidenceAnalyticsService {
  /**
   * Get confidence score distribution
   * 
   * @param userId - User ID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Distribution by score ranges
   */
  async getConfidenceDistribution(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ConfidenceDistribution> {
    const { data, error } = await supabase
      .from('ai_conversation_log')
      .select('ai_confidence_score')
      .eq('user_id', userId)
      .eq('generated_by_ai', true)
      .not('ai_confidence_score', 'is', null)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get confidence distribution: ${error.message}`,
        500,
        error
      );
    }

    // Initialize distribution
    const distribution: ConfidenceDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    // Count by ranges
    (data || []).forEach((item: any) => {
      const score = item.ai_confidence_score;
      if (score >= 0 && score <= 20) {
        distribution['0-20']++;
      } else if (score >= 21 && score <= 40) {
        distribution['21-40']++;
      } else if (score >= 41 && score <= 60) {
        distribution['41-60']++;
      } else if (score >= 61 && score <= 80) {
        distribution['61-80']++;
      } else if (score >= 81 && score <= 100) {
        distribution['81-100']++;
      }
    });

    return distribution;
  }

  /**
   * Get review metrics
   * 
   * @param userId - User ID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Review metrics
   */
  async getReviewMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReviewMetrics> {
    // Get total AI-generated messages
    const { data: totalData, error: totalError } = await supabase
      .from('ai_conversation_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('generated_by_ai', true)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (totalError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get total messages: ${totalError.message}`,
        500,
        totalError
      );
    }

    const totalMessages = totalData?.length || 0;

    // Get queued messages
    const { data: queuedData, error: queuedError } = await supabase
      .from('ai_review_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (queuedError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get queued messages: ${queuedError.message}`,
        500,
        queuedError
      );
    }

    const queuedMessages = queuedData?.length || 0;

    // Get approved messages
    const { data: approvedData, error: approvedError } = await supabase
      .from('ai_review_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (approvedError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get approved messages: ${approvedError.message}`,
        500,
        approvedError
      );
    }

    const approvedMessages = approvedData?.length || 0;

    // Calculate percentages
    const percentageRequiringReview = totalMessages > 0
      ? (queuedMessages / totalMessages) * 100
      : 0;

    const reviewToSendConversionRate = queuedMessages > 0
      ? (approvedMessages / queuedMessages) * 100
      : 0;

    return {
      total_messages: totalMessages,
      queued_messages: queuedMessages,
      approved_messages: approvedMessages,
      percentage_requiring_review: Math.round(percentageRequiringReview * 100) / 100,
      review_to_send_conversion_rate: Math.round(reviewToSendConversionRate * 100) / 100,
    };
  }

  /**
   * Get average confidence score
   * 
   * @param userId - User ID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Average confidence score
   */
  async getAverageConfidence(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const { data, error } = await supabase
      .from('ai_conversation_log')
      .select('ai_confidence_score')
      .eq('user_id', userId)
      .eq('generated_by_ai', true)
      .not('ai_confidence_score', 'is', null)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get average confidence: ${error.message}`,
        500,
        error
      );
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const scores = data.map((item: any) => item.ai_confidence_score || 0);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;

    return Math.round(average * 100) / 100;
  }
}


