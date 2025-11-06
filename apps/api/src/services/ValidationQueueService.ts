import { supabase } from '../lib/supabase';
import { WarmupService } from './WarmupService';
import { ApiError, ErrorCode } from '../types';

/**
 * Validation Queue Service
 * 
 * Manages prospect validation queue for semi-auto mode:
 * - Add prospects to queue
 * - Approve prospects (triggers warm-up)
 * - Reject prospects
 * - Get pending queue
 */

export interface ValidationQueueItem {
  id: string;
  prospect_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  validated_at: string | null;
  validated_by: string | null;
  prospect?: {
    id: string;
    full_name: string;
    company_name: string;
    job_title: string | null;
    linkedin_url: string | null;
    location: string | null;
    profile_summary: string | null;
  };
}

export class ValidationQueueService {
  /**
   * Add prospect to validation queue
   * 
   * @param prospectId - Prospect ID
   * @param userId - User ID
   * @returns Queue item ID
   */
  async addToQueue(prospectId: string, userId: string): Promise<{ queue_id: string }> {
    const { data, error } = await supabase
      .from('prospect_validation_queue')
      .insert({
        prospect_id: prospectId,
        user_id: userId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      // Handle duplicate entry (already in queue)
      if (error.code === '23505') {
        // Get existing queue item
        const { data: existing } = await supabase
          .from('prospect_validation_queue')
          .select('id')
          .eq('prospect_id', prospectId)
          .eq('user_id', userId)
          .single();

        if (existing) {
          return { queue_id: existing.id };
        }
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to add prospect to validation queue: ${error.message}`,
        500,
        error
      );
    }

    return { queue_id: data.id };
  }

  /**
   * Approve prospect (triggers warm-up)
   * 
   * @param prospectId - Prospect ID
   * @param userId - User ID
   * @returns Success status and warm-up status
   */
  async approve(prospectId: string, userId: string): Promise<{
    success: boolean;
    warmup_started: boolean;
  }> {
    // Update queue status
    const { error: queueError } = await supabase
      .from('prospect_validation_queue')
      .update({
        status: 'approved',
        validated_at: new Date().toISOString(),
        validated_by: userId,
      })
      .eq('prospect_id', prospectId)
      .eq('user_id', userId);

    if (queueError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to approve prospect: ${queueError.message}`,
        500,
        queueError
      );
    }

    // Update prospect status
    const { error: prospectError } = await supabase
      .from('prospects')
      .update({
        status: 'new',
        updated_at: new Date().toISOString(),
      })
      .eq('id', prospectId)
      .eq('user_id', userId);

    if (prospectError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to update prospect status: ${prospectError.message}`,
        500,
        prospectError
      );
    }

    // Start warm-up
    let warmupStarted = false;
    try {
      const warmupService = new WarmupService();
      await warmupService.startWarmup(prospectId, userId);
      warmupStarted = true;

      // Update prospect status to warmup_in_progress
      await supabase
        .from('prospects')
        .update({
          status: 'warmup_in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prospectId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to start warm-up:', error);
      // Don't fail the approval if warm-up fails, just log it
    }

    return {
      success: true,
      warmup_started: warmupStarted,
    };
  }

  /**
   * Reject prospect
   * 
   * @param prospectId - Prospect ID
   * @param userId - User ID
   * @returns Success status
   */
  async reject(prospectId: string, userId: string): Promise<{ success: boolean }> {
    // Update queue status
    const { error: queueError } = await supabase
      .from('prospect_validation_queue')
      .update({
        status: 'rejected',
        validated_at: new Date().toISOString(),
        validated_by: userId,
      })
      .eq('prospect_id', prospectId)
      .eq('user_id', userId);

    if (queueError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to reject prospect: ${queueError.message}`,
        500,
        queueError
      );
    }

    // Update prospect status
    const { error: prospectError } = await supabase
      .from('prospects')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', prospectId)
      .eq('user_id', userId);

    if (prospectError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to update prospect status: ${prospectError.message}`,
        500,
        prospectError
      );
    }

    return { success: true };
  }

  /**
   * Get pending validation queue for a user
   * 
   * @param userId - User ID
   * @param limit - Maximum number of items to return
   * @returns Array of validation queue items with prospect data
   */
  async getPendingQueue(
    userId: string,
    limit: number = 50
  ): Promise<ValidationQueueItem[]> {
    const { data, error } = await supabase
      .from('prospect_validation_queue')
      .select(`
        id,
        prospect_id,
        user_id,
        status,
        created_at,
        validated_at,
        validated_by,
        prospects (
          id,
          full_name,
          company_name,
          job_title,
          linkedin_url,
          location,
          profile_summary
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get validation queue: ${error.message}`,
        500,
        error
      );
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      prospect_id: item.prospect_id,
      user_id: item.user_id,
      status: item.status as 'pending' | 'approved' | 'rejected',
      created_at: item.created_at,
      validated_at: item.validated_at,
      validated_by: item.validated_by,
      prospect: item.prospects ? {
        id: item.prospects.id,
        full_name: item.prospects.full_name,
        company_name: item.prospects.company_name,
        job_title: item.prospects.job_title,
        linkedin_url: item.prospects.linkedin_url,
        location: item.prospects.location,
        profile_summary: item.prospects.profile_summary,
      } : undefined,
    }));
  }
}



