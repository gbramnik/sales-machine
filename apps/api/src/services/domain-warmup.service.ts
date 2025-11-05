import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Domain Warm-up Service
 * 
 * Enforces mandatory warm-up period for new domains:
 * - 14-21 days warm-up period required
 * - During warm-up: 5 emails/day limit
 * - After warm-up: 20 emails/day limit
 * 
 * Per FR7: New domains require 14-21 days warm-up before full campaign
 */

const WARMUP_PERIOD_DAYS_MIN = 14;
const WARMUP_DAILY_LIMIT = 5;
const POST_WARMUP_DAILY_LIMIT = 20;

export interface WarmupStatus {
  is_warmed_up: boolean;
  warmup_started_at: string | null;
  days_remaining: number;
  days_elapsed: number;
  current_daily_limit: number;
}

export class DomainWarmupService {
  /**
   * Check if domain warm-up period is completed
   * 
   * @param userId - User ID
   * @returns Warmup status
   */
  async getWarmupStatus(userId: string): Promise<WarmupStatus> {
    // Get user's warm-up start date
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('domain_warmup_started_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    const warmupStartedAt = user.domain_warmup_started_at;

    // If warm-up hasn't started, return default status
    if (!warmupStartedAt) {
      return {
        is_warmed_up: false,
        warmup_started_at: null,
        days_remaining: WARMUP_PERIOD_DAYS_MIN,
        days_elapsed: 0,
        current_daily_limit: WARMUP_DAILY_LIMIT,
      };
    }

    // Calculate days elapsed
    const startDate = new Date(warmupStartedAt);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if warm-up is complete (use minimum 14 days)
    const isWarmedUp = daysElapsed >= WARMUP_PERIOD_DAYS_MIN;
    const daysRemaining = isWarmedUp ? 0 : Math.max(0, WARMUP_PERIOD_DAYS_MIN - daysElapsed);

    return {
      is_warmed_up: isWarmedUp,
      warmup_started_at: warmupStartedAt,
      days_remaining: daysRemaining,
      days_elapsed: daysElapsed,
      current_daily_limit: isWarmedUp ? POST_WARMUP_DAILY_LIMIT : WARMUP_DAILY_LIMIT,
    };
  }

  /**
   * Start warm-up period for a domain
   * 
   * @param userId - User ID
   * @returns Updated warmup status
   */
  async startWarmup(userId: string): Promise<WarmupStatus> {
    // Check if warm-up already started
    const status = await this.getWarmupStatus(userId);

    if (status.warmup_started_at) {
      return status; // Already started
    }

    // Start warm-up period
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        domain_warmup_started_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to start domain warm-up',
        500,
        error
      );
    }

    return this.getWarmupStatus(userId);
  }

  /**
   * Validate that warm-up period is completed before sending email
   * 
   * @param userId - User ID
   * @throws ApiError if warm-up not completed
   */
  async validateWarmupCompleted(userId: string): Promise<void> {
    const status = await this.getWarmupStatus(userId);

    if (!status.is_warmed_up) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        `Domain warm-up period not completed (${status.days_remaining} days remaining). Minimum ${WARMUP_PERIOD_DAYS_MIN} days required.`,
        400
      );
    }
  }

  /**
   * Get current daily sending limit based on warm-up status
   * 
   * @param userId - User ID
   * @returns Daily sending limit (5 during warm-up, 20 after)
   */
  async getDailyLimit(userId: string): Promise<number> {
    const status = await this.getWarmupStatus(userId);
    return status.current_daily_limit;
  }
}

// Export singleton instance
export const domainWarmupService = new DomainWarmupService();

