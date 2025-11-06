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
      .order('created_at', { ascending: true }); // FIFO within same priority

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
   * Get VIP pending review queue items only
   */
  async getVIPReviews(userId: string): Promise<ReviewQueueWithProspect[]> {
    const { data, error } = await this.supabase
      .from('ai_review_queue')
      .select(`
        *,
        prospect:prospects!inner(id, full_name, company_name, job_title, is_vip)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .eq('prospects.is_vip', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch VIP review queue',
        500,
        error
      );
    }

    return data as ReviewQueueWithProspect[];
  }

  /**
   * Get non-VIP pending review queue items only
   */
  async getNonVIPReviews(userId: string): Promise<ReviewQueueWithProspect[]> {
    const { data, error } = await this.supabase
      .from('ai_review_queue')
      .select(`
        *,
        prospect:prospects!inner(id, full_name, company_name, job_title, is_vip)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .or('prospects.is_vip.eq.false,prospects.is_vip.is.null')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch non-VIP review queue',
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
    // Get review item
    const { data: reviewItem, error: reviewError } = await this.supabase
      .from('ai_review_queue')
      .select('prospect_id, proposed_subject, proposed_message, proposed_channel, ai_confidence_score, template_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (reviewError || !reviewItem) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Review item not found',
        404,
        reviewError
      );
    }

    // Get prospect
    const { data: prospect, error: prospectError } = await this.supabase
      .from('prospects')
      .select('id, linkedin_url, email, user_id')
      .eq('id', reviewItem.prospect_id)
      .eq('user_id', userId)
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404,
        prospectError
      );
    }

    // Determine channel
    const channel = (reviewItem as any).proposed_channel || ((reviewItem as any).proposed_subject ? 'email' : 'linkedin');                                                        
    const messageText = (reviewItem as any).proposed_message || '';
    const subject = (reviewItem as any).proposed_subject || null;

    // Send message via appropriate channel
    try {
      if (channel === 'linkedin' && prospect.linkedin_url) {
        // Send via UniPil API
        const { UniPilService } = await import('./UniPilService');
        await UniPilService.sendMessage(
          prospect.linkedin_url,
          messageText
        );
      } else if (channel === 'email' && prospect.email) {
        // Send via SMTP
        const { SMTPService } = await import('./SMTPService');
        const { supabase } = await import('../lib/supabase');
        
        // Get SMTP credentials
        const { data: smtpCreds } = await supabase
          .from('api_credentials')
          .select('metadata, api_key')
          .eq('service_name', 'smtp')
          .eq('is_active', true)
          .single();

        if (smtpCreds) {
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

          const smtpService = new SMTPService('mailgun');
          await smtpService.sendEmail(
            {
              to: prospect.email,
              from: user?.email || smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
              subject: subject || 'Re: Your inquiry',
              body: messageText,
            },
            {
              api_key: smtpCreds.api_key,
              domain: smtpCreds.metadata?.domain,
              from_email: smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
            }
          );
        }
      }
    } catch (sendError) {
      console.error('Failed to send message:', sendError);
      // Don't fail the approval if sending fails, just log it
    }

    // Update review status
    const { error: updateError } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (updateError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to approve message',
        500,
        updateError
      );
    }

    // Log to ai_conversation_log
    await this.supabase
      .from('ai_conversation_log')
      .insert({
        prospect_id: prospect.id,
        user_id: userId,
        direction: 'outbound',
        channel: channel as 'email' | 'linkedin',
        subject: subject,
        message_text: messageText,
        generated_by_ai: true,
        ai_confidence_score: reviewItem.ai_confidence_score,
        created_at: new Date().toISOString(),
      });
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
    const { data: reviewItem, error: reviewError } = await this.supabase
      .from('ai_review_queue')
      .select('prospect_id, proposed_subject, proposed_message, proposed_channel, ai_confidence_score, template_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (reviewError || !reviewItem) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Review item not found',
        404,
        reviewError
      );
    }

    // Get prospect
    const { data: prospect, error: prospectError } = await this.supabase
      .from('prospects')
      .select('id, linkedin_url, email, user_id')
      .eq('id', reviewItem.prospect_id)
      .eq('user_id', userId)
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404,
        prospectError
      );
    }

    // Use edited content or fallback to proposed
    const messageText = editedMessage || reviewItem.proposed_message || '';
    const subject = editedSubject || reviewItem.proposed_subject || null;
    const channel = reviewItem.proposed_channel || (subject ? 'email' : 'linkedin');

    // Send message via appropriate channel
    try {
      if (channel === 'linkedin' && prospect.linkedin_url) {
        const { UniPilService } = await import('./UniPilService');
        await UniPilService.sendMessage(
          prospect.linkedin_url,
          messageText
        );
      } else if (channel === 'email' && prospect.email) {
        const { SMTPService } = await import('./SMTPService');
        const { supabase } = await import('../lib/supabase');
        
        const { data: smtpCreds } = await supabase
          .from('api_credentials')
          .select('metadata, api_key')
          .eq('service_name', 'smtp')
          .eq('is_active', true)
          .single();

        if (smtpCreds) {
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

          const smtpService = new SMTPService('mailgun');
          await smtpService.sendEmail(
            {
              to: prospect.email,
              from: user?.email || smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
              subject: subject || 'Re: Your inquiry',
              body: messageText,
            },
            {
              api_key: smtpCreds.api_key,
              domain: smtpCreds.metadata?.domain,
              from_email: smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
            }
          );
        }
      }
    } catch (sendError) {
      console.error('Failed to send edited message:', sendError);
    }

    // Update review status
    const { error: updateError } = await this.supabase
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

    if (updateError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to edit message',
        500,
        updateError
      );
    }

    // Log to ai_conversation_log (generated_by_ai = false because human edited)
    await this.supabase
      .from('ai_conversation_log')
      .insert({
        prospect_id: prospect.id,
        user_id: userId,
        direction: 'outbound',
        channel: channel as 'email' | 'linkedin',
        subject: subject,
        message_text: messageText,
        generated_by_ai: false, // Human edited
        ai_confidence_score: reviewItem.ai_confidence_score,
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Reject message
   */
  async rejectMessage(userId: string, reviewId: string, reason?: string): Promise<void> {
    // Get review item to get prospect_id
    const { data: reviewItem, error: reviewError } = await this.supabase
      .from('ai_review_queue')
      .select('prospect_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (reviewError) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Review item not found',
        404,
        reviewError
      );
    }

    // Update review status
    const { error: updateError } = await this.supabase
      .from('ai_review_queue')
      // @ts-expect-error - Supabase type inference issue
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (updateError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to reject message',
        500,
        updateError
      );
    }

    // Update prospect status to 'nurture'
    if (reviewItem.prospect_id) {
      await this.supabase
        .from('prospects')
        .update({
          status: 'nurture',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewItem.prospect_id)
        .eq('user_id', userId);
    }

    // Log rejection to audit_log
    await this.supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        event_type: 'ai_message_rejected',
        entity_type: 'ai_review_queue',
        entity_id: reviewId,
        new_values: {
          rejection_reason: reason || 'No reason provided',
        },
      });
  }

  /**
   * Bulk approve messages
   */
  async bulkApprove(userId: string, reviewIds: string[]): Promise<void> {
    // Process each review ID individually to send messages
    for (const reviewId of reviewIds) {
      try {
        await this.approveMessage(userId, reviewId);
      } catch (error) {
        console.error(`Failed to approve review ${reviewId}:`, error);
        // Continue with other reviews even if one fails
      }
    }
  }

  /**
   * Bulk reject messages
   */
  async bulkReject(userId: string, reviewIds: string[], reason?: string): Promise<void> {
    // Process each review ID individually
    for (const reviewId of reviewIds) {
      try {
        await this.rejectMessage(userId, reviewId, reason);
      } catch (error) {
        console.error(`Failed to reject review ${reviewId}:`, error);
        // Continue with other reviews even if one fails
      }
    }
  }
}
