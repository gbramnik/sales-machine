import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

type ReviewQueueItem = Database['public']['Tables']['ai_review_queue']['Row'];
// type ReviewQueueInsert = Database['public']['Tables']['ai_review_queue']['Insert']; // Reserved for future use

export interface ReviewQueueWithProspect extends ReviewQueueItem {
  prospect: {
    id: string;
    full_name: string;
    company_name: string;
    job_title: string | null;
    is_vip: boolean;
  };
}

export class AIReviewService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get pending review queue items
   */
  async getPendingReviews(userId: string): Promise<ReviewQueueWithProspect[]> {
    const { data, error } = await this.supabase
      .from('ai_review_queue')
      .select(`
        *,
        prospect:prospects(id, full_name, company_name, job_title, is_vip)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch review queue',
        500,
        error
      );
    }

    return data as ReviewQueueWithProspect[];
  }

  /**
   * Approve and send message
   */
  async approveMessage(userId: string, reviewId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to approve message',
        500,
        error
      );
    }

    // TODO: Trigger email sending via N8N webhook or email service
  }

  /**
   * Edit and approve message
   */
  async editMessage(
    userId: string,
    reviewId: string,
    editedSubject?: string,
    editedMessage?: string
  ): Promise<void> {
    // Get review item
    const { data: reviewItem } = await this.supabase
      .from('ai_review_queue')
      .select('prospect_id, proposed_subject, proposed_message, user_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();
    const { error } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'edited',
        reviewed_at: new Date().toISOString(),
        edited_subject: editedSubject,
        edited_message: editedMessage,
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to edit message',
        500,
        error
      );
    }

    // TODO: Trigger email sending with edited content
  }

  /**
   * Reject message
   */
  async rejectMessage(userId: string, reviewId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to reject message',
        500,
        error
      );
    }
  }

  /**
   * Bulk approve messages
   */
  async bulkApprove(userId: string, reviewIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .in('id', reviewIds)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to bulk approve',
        500,
        error
      );
    }

    // TODO: Trigger batch email sending
  }
}
