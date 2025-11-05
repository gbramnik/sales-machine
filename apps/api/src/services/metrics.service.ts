import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Metrics Service
 * 
 * Calculates campaign, email, and AI agent performance metrics
 * for reporting and dashboard display.
 */

export interface CampaignMetrics {
  total_scraped: number;
  total_enriched: number;
  total_contacted: number;
  total_replied: number;
  total_qualified: number;
  meetings_booked: number;
  meetings_per_100_prospects: number;
}

export interface EmailMetrics {
  sent_count: number;
  open_rate: number; // Percentage
  reply_rate: number; // Percentage
  bounce_rate: number; // Percentage
  spam_complaint_rate: number; // Percentage
  health_status: 'Green' | 'Amber' | 'Red';
}

export interface AIMetrics {
  total_conversations: number;
  qualification_accuracy: number; // Percentage
  confidence_avg: number; // Average confidence score
}

export interface DailyMetrics {
  date: string; // ISO date string
  campaign: CampaignMetrics;
  email: EmailMetrics;
  ai: AIMetrics;
}

export class MetricsService {
  /**
   * Calculate campaign metrics for a user on a specific date
   */
  async getCampaignMetrics(
    userId: string,
    date: string // ISO date string (YYYY-MM-DD)
  ): Promise<CampaignMetrics> {
    try {
      // Query prospects table: Count by status
      const { data: prospects, error: prospectsError } = await supabaseAdmin
        .from('prospects')
        .select('id, status, created_at')
        .eq('user_id', userId);

      if (prospectsError) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to fetch prospects',
          500,
          prospectsError
        );
      }

      // Filter by date (created_at on date)
      const targetDate = new Date(date + 'T00:00:00.000Z');
      const targetDateStart = new Date(targetDate);
      targetDateStart.setUTCHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setUTCHours(23, 59, 59, 999);

      const prospectsOnDate = (prospects || []).filter((p: any) => {
        const createdAt = new Date(p.created_at);
        return createdAt >= new Date(targetDateStart) && createdAt <= new Date(targetDateEnd);
      });

      // Count by status
      const total_scraped = prospectsOnDate.length;
      const total_contacted = prospectsOnDate.filter((p: any) => p.status === 'contacted').length;
      const total_replied = prospectsOnDate.filter((p: any) => 
        p.status === 'engaged' || p.status === 'qualified' || p.status === 'meeting_booked'
      ).length;
      const total_qualified = prospectsOnDate.filter((p: any) => p.status === 'qualified').length;

      // Count enriched (has prospect_enrichment)
      const prospectIds = prospectsOnDate.map((p: any) => p.id);
      let total_enriched = 0;
      if (prospectIds.length > 0) {
        const { count: enrichmentCount } = await supabaseAdmin
          .from('prospect_enrichment')
          .select('id', { count: 'exact', head: true })
          .in('prospect_id', prospectIds);

        total_enriched = enrichmentCount || 0;
      }

      // Query meetings table: Count meetings booked on date
      const { count: meetingsCount } = await supabaseAdmin
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      const meetings_booked = meetingsCount || 0;

      // Calculate meetings per 100 prospects
      const meetings_per_100_prospects = total_contacted > 0
        ? (meetings_booked / total_contacted) * 100
        : 0;

      return {
        total_scraped,
        total_enriched,
        total_contacted,
        total_replied,
        total_qualified,
        meetings_booked,
        meetings_per_100_prospects: parseFloat(meetings_per_100_prospects.toFixed(2)),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to calculate campaign metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Calculate email performance metrics for a user on a specific date
   */
  async getEmailMetrics(
    userId: string,
    date: string
  ): Promise<EmailMetrics> {
    try {
      const targetDate = new Date(date + 'T00:00:00.000Z');
      const targetDateStart = new Date(targetDate);
      targetDateStart.setUTCHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setUTCHours(23, 59, 59, 999);

      // Count sent emails (outbound, email channel)
      const { count: sentCount } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('direction', 'outbound')
        .eq('channel', 'email')
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      const sent_count = sentCount || 0;

      // Count replies (inbound, email channel)
      const { count: replyCount } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('direction', 'inbound')
        .eq('channel', 'email')
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      const reply_count = replyCount || 0;

      // Get bounce_rate and spam_complaint_rate from campaigns table
      // Aggregate across all active campaigns for user on date
      const { data: campaigns } = await supabaseAdmin
        .from('campaigns')
        .select('bounce_rate, spam_complaint_rate, bounce_count, spam_complaint_count, contacted_count')
        .eq('user_id', userId)
        .gte('updated_at', targetDateStart)
        .lte('updated_at', targetDateEnd);

      let bounce_rate = 0;
      let spam_complaint_rate = 0;

      if (campaigns && campaigns.length > 0) {
        // Aggregate bounce_rate and spam_complaint_rate across campaigns
        const totalBounceCount = campaigns.reduce((sum, c: any) => sum + (c.bounce_count || 0), 0);
        const totalSpamCount = campaigns.reduce((sum, c: any) => sum + (c.spam_complaint_count || 0), 0);
        const totalSent = campaigns.reduce((sum, c: any) => sum + (c.contacted_count || 0), 0);

        if (totalSent > 0) {
          bounce_rate = (totalBounceCount / totalSent) * 100;
          spam_complaint_rate = (totalSpamCount / totalSent) * 100;
        } else if (campaigns.length > 0) {
          // Use average if available
          const avgBounceRate = campaigns.reduce((sum, c: any) => sum + (c.bounce_rate || 0), 0) / campaigns.length;
          const avgSpamRate = campaigns.reduce((sum, c: any) => sum + (c.spam_complaint_rate || 0), 0) / campaigns.length;
          bounce_rate = avgBounceRate;
          spam_complaint_rate = avgSpamRate;
        }
      }

      // Calculate open_rate (placeholder - would need email_events table or webhook tracking)
      // For now, use reply_rate as proxy or set to 0
      const open_rate = 0; // TODO: Implement when email_events table is created

      // Calculate reply_rate
      const reply_rate = sent_count > 0 ? (reply_count / sent_count) * 100 : 0;

      // Calculate deliverability health status
      const health_status = this.calculateHealthStatus(bounce_rate, spam_complaint_rate);

      return {
        sent_count,
        open_rate: parseFloat(open_rate.toFixed(2)),
        reply_rate: parseFloat(reply_rate.toFixed(2)),
        bounce_rate: parseFloat(bounce_rate.toFixed(2)),
        spam_complaint_rate: parseFloat(spam_complaint_rate.toFixed(2)),
        health_status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to calculate email metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Calculate AI agent performance metrics for a user on a specific date
   */
  async getAIMetrics(
    userId: string,
    date: string
  ): Promise<AIMetrics> {
    try {
      const targetDate = new Date(date + 'T00:00:00.000Z');
      const targetDateStart = new Date(targetDate);
      targetDateStart.setUTCHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setUTCHours(23, 59, 59, 999);

      // Count total conversations (inbound + outbound)
      const { count: totalConversations } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      // Count qualified conversations
      const { count: qualifiedCount } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_qualified', true)
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      // Count total qualifications (AI-generated messages with qualification)
      const { count: totalQualifications } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('generated_by_ai', true)
        .not('is_qualified', 'is', null)
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      // Calculate qualification accuracy
      const qualification_accuracy = totalQualifications && totalQualifications > 0
        ? (qualifiedCount || 0) / totalQualifications * 100
        : 0;

      // Calculate average confidence score for AI-generated messages
      const { data: aiMessages } = await supabaseAdmin
        .from('ai_conversation_log')
        .select('ai_confidence_score')
        .eq('user_id', userId)
        .eq('generated_by_ai', true)
        .not('ai_confidence_score', 'is', null)
        .gte('created_at', targetDateStart)
        .lte('created_at', targetDateEnd);

      const confidenceScores = (aiMessages || [])
        .map((m: any) => m.ai_confidence_score)
        .filter((score: any) => typeof score === 'number' && !isNaN(score));

      const confidence_avg = confidenceScores.length > 0
        ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
        : 0;

      return {
        total_conversations: totalConversations || 0,
        qualification_accuracy: parseFloat(qualification_accuracy.toFixed(2)),
        confidence_avg: parseFloat(confidence_avg.toFixed(2)),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to calculate AI metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Calculate deliverability health status
   */
  calculateHealthStatus(
    bounce_rate: number,
    spam_complaint_rate: number
  ): 'Green' | 'Amber' | 'Red' {
    // Green: bounce < 2% AND spam < 0.05%
    if (bounce_rate < 2 && spam_complaint_rate < 0.05) {
      return 'Green';
    }

    // Amber: bounce 2-5% OR spam 0.05-0.1%
    if (
      (bounce_rate >= 2 && bounce_rate <= 5) ||
      (spam_complaint_rate >= 0.05 && spam_complaint_rate <= 0.1)
    ) {
      return 'Amber';
    }

    // Red: bounce > 5% OR spam > 0.1%
    return 'Red';
  }

  /**
   * Get all metrics for a user on a specific date
   */
  async getDailyMetrics(
    userId: string,
    date: string
  ): Promise<DailyMetrics> {
    const [campaign, email, ai] = await Promise.all([
      this.getCampaignMetrics(userId, date),
      this.getEmailMetrics(userId, date),
      this.getAIMetrics(userId, date),
    ]);

    return {
      date,
      campaign,
      email,
      ai,
    };
  }
}

// Export singleton instance
export const metricsService = new MetricsService();

