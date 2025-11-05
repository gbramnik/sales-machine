/**
 * LinkedIn Warm-up Types
 * Business logic types for warm-up functionality
 */

import type { Database } from './database';

// Database row types
export type WarmupScheduleRow = Database['public']['Tables']['linkedin_warmup_schedule']['Row'];
export type WarmupActionRow = Database['public']['Tables']['linkedin_warmup_actions']['Row'];

// Insert types
export type WarmupScheduleInsert = Database['public']['Tables']['linkedin_warmup_schedule']['Insert'];
export type WarmupActionInsert = Database['public']['Tables']['linkedin_warmup_actions']['Insert'];

// Update types
export type WarmupScheduleUpdate = Database['public']['Tables']['linkedin_warmup_schedule']['Update'];
export type WarmupActionUpdate = Database['public']['Tables']['linkedin_warmup_actions']['Update'];

// Business logic types
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

export interface WarmupAction {
  id: string;
  prospect_id: string;
  user_id: string;
  action_type: 'like' | 'comment';
  target_post_url: string | null;
  target_author_linkedin_url: string | null;
  executed_at: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface WarmupScheduleWithProspect extends WarmupScheduleRow {
  prospect: {
    id: string;
    full_name: string;
    job_title: string | null;
    company_name: string;
    linkedin_url: string | null;
    status: string;
  };
}

export type WarmupScheduleStatus = 'warmup_in_progress' | 'ready_for_connection' | 'completed' | 'skipped';
export type WarmupActionType = 'like' | 'comment';

