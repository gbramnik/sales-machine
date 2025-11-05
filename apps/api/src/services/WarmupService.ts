import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

export interface WarmupConfig {
  warmup_duration_days: number;
  daily_likes_limit: number;
  daily_comments_limit: number;
  account_type: 'basic' | 'sales_navigator';
}

export interface WarmupStatus {
  status: 'warmup_in_progress' | 'ready_for_connection' | 'completed' | 'skipped';
  connection_ready_at: string;
  days_remaining: number;
  actions_completed: number;
  likes_count: number;
  comments_count: number;
}

export interface StartWarmupResult {
  schedule_id: string;
  connection_ready_at: string;
}

export interface AccountLimits {
  daily_likes: number;
  daily_comments: number;
}

export class WarmupService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get warm-up configuration for a user
   * Returns user's config or defaults if not set
   */
  async getWarmupConfig(userId: string): Promise<WarmupConfig> {
    const { data, error } = await this.supabase
      .from('users')
      .select('warmup_duration_days, daily_likes_limit, daily_comments_limit, account_type')
      .eq('id', userId)
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch warm-up configuration',
        500,
        error
      );
    }

    // Return user config or defaults
    return {
      warmup_duration_days: data?.warmup_duration_days ?? 10,
      daily_likes_limit: data?.daily_likes_limit ?? 20,
      daily_comments_limit: data?.daily_comments_limit ?? 20,
      account_type: (data?.account_type as 'basic' | 'sales_navigator') ?? 'basic',
    };
  }

  /**
   * Start warm-up for a prospect
   * Creates a warm-up schedule entry with calculated connection_ready_at date
   */
  async startWarmup(prospectId: string, userId: string): Promise<StartWarmupResult> {
    // Get user's warm-up config
    const config = await this.getWarmupConfig(userId);

    // Calculate connection_ready_at: NOW() + warmup_duration_days
    const warmupStartDate = new Date();
    const connectionReadyDate = this.calculateConnectionReadyDate(warmupStartDate, config.warmup_duration_days);

    // Check if warm-up schedule already exists
    const { data: existing } = await this.supabase
      .from('linkedin_warmup_schedule')
      .select('id')
      .eq('prospect_id', prospectId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing schedule
      const { data, error } = await this.supabase
        .from('linkedin_warmup_schedule')
        .update({
          warmup_start_at: warmupStartDate.toISOString(),
          connection_ready_at: connectionReadyDate.toISOString(),
          status: 'warmup_in_progress',
          actions_today: 0,
          likes_count: 0,
          comments_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id, connection_ready_at')
        .single();

      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to update warm-up schedule',
          500,
          error
        );
      }

      return {
        schedule_id: data.id,
        connection_ready_at: data.connection_ready_at,
      };
    }

    // Create new schedule
    const { data, error } = await this.supabase
      .from('linkedin_warmup_schedule')
      .insert({
        prospect_id: prospectId,
        user_id: userId,
        warmup_start_at: warmupStartDate.toISOString(),
        connection_ready_at: connectionReadyDate.toISOString(),
        status: 'warmup_in_progress',
      })
      .select('id, connection_ready_at')
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to create warm-up schedule',
        500,
        error
      );
    }

    return {
      schedule_id: data.id,
      connection_ready_at: data.connection_ready_at,
    };
  }

  /**
   * Get warm-up status for a prospect
   * Returns current status, days remaining, and action counts
   */
  async getWarmupStatus(prospectId: string, userId: string): Promise<WarmupStatus> {
    const { data, error } = await this.supabase
      .from('linkedin_warmup_schedule')
      .select('*')
      .eq('prospect_id', prospectId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Warm-up schedule not found for this prospect',
        404,
        error
      );
    }

    // Calculate days remaining
    const connectionReadyDate = new Date(data.connection_ready_at);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((connectionReadyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate total actions completed
    const actionsCompleted = (data.likes_count || 0) + (data.comments_count || 0);

    // Determine status
    let status: 'warmup_in_progress' | 'ready_for_connection' | 'completed' | 'skipped' = data.status as any;
    if (status === 'warmup_in_progress' && daysRemaining === 0) {
      status = 'ready_for_connection';
    }

    return {
      status,
      connection_ready_at: data.connection_ready_at,
      days_remaining: daysRemaining,
      actions_completed: actionsCompleted,
      likes_count: data.likes_count || 0,
      comments_count: data.comments_count || 0,
    };
  }

  /**
   * Calculate connection ready date from start date and warm-up duration
   */
  calculateConnectionReadyDate(startDate: Date, warmupDays: number): Date {
    return new Date(startDate.getTime() + warmupDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Get account type limits (daily likes and comments)
   * Returns limits based on LinkedIn account type
   */
  getAccountTypeLimits(accountType: 'basic' | 'sales_navigator'): AccountLimits {
    if (accountType === 'sales_navigator') {
      return {
        daily_likes: 40,
        daily_comments: 40,
      };
    }

    // Default: basic account
    return {
      daily_likes: 20,
      daily_comments: 20,
    };
  }
}

