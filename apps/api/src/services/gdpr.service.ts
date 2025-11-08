import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import type { Database } from '@sales-machine/shared/types';
import { ApiError, ErrorCode } from '../types';

/**
 * GDPR Service
 * 
 * Handles GDPR compliance operations:
 * - Data deletion (Supabase + Upstash + N8N)
 * - Data export
 * - Consent tracking
 */
export class GDPRService {
  private supabase: SupabaseClient<Database>;
  private redis: Redis | null = null;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;

    // Initialize Redis if credentials available
    const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      try {
        this.redis = new Redis({
          url: redisUrl,
          token: redisToken,
        });
      } catch (error) {
        console.warn('Failed to initialize Redis for GDPR service:', error);
      }
    }
  }

  /**
   * Delete prospect data from all systems (GDPR compliance)
   * 
   * Deletion order (to respect foreign keys):
   * 1. ai_review_queue
   * 2. meetings
   * 3. ai_conversation_log
   * 4. prospect_enrichment
   * 5. prospects (CASCADE should handle related deletes, but explicit order is safer)
   * 
   * Then:
   * - Delete from Upstash Redis cache
   * - Attempt N8N log deletion (if supported)
   * - Log deletion in audit_log
   */
  async deleteProspectData(prospectId: string, userId: string): Promise<void> {
    // Verify prospect exists and belongs to user
    const { data: prospect, error: prospectError } = await this.supabase
      .from('prospects')
      .select('id, user_id')
      .eq('id', prospectId)
      .eq('user_id', userId)
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found or unauthorized',
        404
      );
    }

    // Delete in order (respecting foreign keys)
    const deletions: Array<{ table: string; error?: any }> = [];

    // 1. Delete from ai_review_queue
    try {
      const { error } = await this.supabase
        .from('ai_review_queue')
        .delete()
        .eq('prospect_id', prospectId)
        .eq('user_id', userId);
      
      if (error) deletions.push({ table: 'ai_review_queue', error });
    } catch (error) {
      deletions.push({ table: 'ai_review_queue', error });
    }

    // 2. Delete from meetings
    try {
      const { error } = await this.supabase
        .from('meetings')
        .delete()
        .eq('prospect_id', prospectId)
        .eq('user_id', userId);
      
      if (error) deletions.push({ table: 'meetings', error });
    } catch (error) {
      deletions.push({ table: 'meetings', error });
    }

    // 3. Delete from ai_conversation_log
    try {
      const { error } = await this.supabase
        .from('ai_conversation_log')
        .delete()
        .eq('prospect_id', prospectId)
        .eq('user_id', userId);
      
      if (error) deletions.push({ table: 'ai_conversation_log', error });
    } catch (error) {
      deletions.push({ table: 'ai_conversation_log', error });
    }

    // 4. Delete from prospect_enrichment
    try {
      const { error } = await this.supabase
        .from('prospect_enrichment')
        .delete()
        .eq('prospect_id', prospectId)
        .eq('user_id', userId);
      
      if (error) deletions.push({ table: 'prospect_enrichment', error });
    } catch (error) {
      deletions.push({ table: 'prospect_enrichment', error });
    }

    // 5. Delete from prospects (main table)
    try {
      const { error } = await this.supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId)
        .eq('user_id', userId);
      
      if (error) {
        deletions.push({ table: 'prospects', error });
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          `Failed to delete prospect: ${error.message}`,
          500,
          error
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      deletions.push({ table: 'prospects', error });
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to delete prospect',
        500,
        error
      );
    }

    // Delete from Upstash Redis cache
    if (this.redis) {
      try {
        // Delete enrichment cache
        const enrichmentKey = `enrichment:${prospectId}`;
        await this.redis.del(enrichmentKey);

        // Note: excluded_prospects cache is per-user and date, so we don't need to delete it
        // It will expire naturally after 24h TTL
      } catch (error) {
        console.warn('Failed to delete Redis cache for prospect:', error);
        // Continue - cache deletion failure is not critical
      }
    }

    // Attempt N8N log deletion (if supported)
    // Note: N8N execution logs are typically immutable and cannot be deleted via API
    // This is documented limitation - N8N logs are internal system logs, not user-accessible data
    // If N8N API supports deletion in the future, add it here

    // Log deletion in audit_log
    try {
      await this.supabase
        .from('audit_log')
        .insert({
          user_id: userId,
          event_type: 'gdpr_deletion',
          entity_type: 'prospect',
          entity_id: prospectId,
          new_values: {
            deleted_at: new Date().toISOString(),
            deletion_errors: deletions.filter(d => d.error).map(d => ({
              table: d.table,
              error: d.error?.message || 'Unknown error',
            })),
          },
          performed_by: userId,
        });
    } catch (error) {
      console.warn('Failed to log GDPR deletion in audit_log:', error);
      // Continue - audit log failure is not critical for deletion
    }

    // If there were any deletion errors (except prospects table), log them but don't fail
    const criticalErrors = deletions.filter(d => d.table === 'prospects' && d.error);
    if (criticalErrors.length > 0) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to delete prospect from database',
        500,
        criticalErrors[0].error
      );
    }
  }

  /**
   * Export all user data (GDPR compliance)
   * 
   * Returns JSON structure with all user-related data:
   * - User profile
   * - Prospects
   * - Campaigns
   * - Meetings
   * - Prospect enrichment
   * - AI conversation logs
   * - AI review queue
   */
  async exportUserData(userId: string): Promise<any> {
    // Query all user data
    const [user, prospects, campaigns, meetings, enrichment, conversations, reviewQueue] = await Promise.all([
      // User profile
      this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),

      // Prospects
      this.supabase
        .from('prospects')
        .select('*')
        .eq('user_id', userId),

      // Campaigns
      this.supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId),

      // Meetings
      this.supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId),

      // Prospect enrichment (for all user's prospects)
      this.supabase
        .from('prospect_enrichment')
        .select('*')
        .in('prospect_id', 
          // Subquery to get prospect IDs - we'll handle this differently
          [] // Will be populated after prospects query
        ),

      // AI conversation logs
      this.supabase
        .from('ai_conversation_log')
        .select('*')
        .eq('user_id', userId),

      // AI review queue
      this.supabase
        .from('ai_review_queue')
        .select('*')
        .eq('user_id', userId),
    ]);

    // Get prospect IDs for enrichment query
    const prospectIds = prospects.data?.map(p => p.id) || [];
    let enrichmentData: any[] = [];

    if (prospectIds.length > 0) {
      const { data } = await this.supabase
        .from('prospect_enrichment')
        .select('*')
        .in('prospect_id', prospectIds);
      
      enrichmentData = data || [];
    }

    // Check for errors
    if (user.error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch user data',
        500,
        user.error
      );
    }

    // Format export data
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: userId,
      user: user.data,
      prospects: prospects.data || [],
      campaigns: campaigns.data || [],
      meetings: meetings.data || [],
      prospect_enrichment: enrichmentData,
      ai_conversation_logs: conversations.data || [],
      ai_review_queue: reviewQueue.data || [],
      metadata: {
        total_prospects: prospects.data?.length || 0,
        total_campaigns: campaigns.data?.length || 0,
        total_meetings: meetings.data?.length || 0,
        total_conversations: conversations.data?.length || 0,
        total_review_items: reviewQueue.data?.length || 0,
      },
    };

    // Log export in audit_log
    try {
      await this.supabase
        .from('audit_log')
        .insert({
          user_id: userId,
          event_type: 'data_exported',
          entity_type: 'user',
          entity_id: userId,
          new_values: {
            export_date: exportData.export_date,
            data_summary: exportData.metadata,
          },
          performed_by: userId,
        });
    } catch (error) {
      console.warn('Failed to log data export in audit_log:', error);
      // Continue - audit log failure is not critical
    }

    return exportData;
  }
}



