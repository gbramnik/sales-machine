import { supabase } from '../lib/supabase';

/**
 * MetricsService
 * Story 1.8: Basic Reporting & Metrics
 * 
 * Calculates campaign, email, and AI agent performance metrics
 * for Google Sheets dashboard sync.
 */

export interface CampaignMetrics {
  date: string;
  total_scraped: number;
  total_enriched: number;
  total_contacted: number;
  total_replied: number;
  total_qualified: number;
  meetings_booked: number;
  meetings_per_100_prospects: number;
}

export interface EmailMetrics {
  date: string;
  sent_count: number;
  open_rate: number;
  reply_rate: number;
  bounce_rate: number;
  spam_complaint_rate: number;
  health_status: 'Green' | 'Amber' | 'Red';
}

export interface AIAgentMetrics {
  date: string;
  total_conversations: number;
  qualification_accuracy: number;
  confidence_avg: number;
}

export interface AllMetrics {
  campaign: CampaignMetrics;
  email: EmailMetrics;
  ai: AIAgentMetrics;
}

export class MetricsService {
  /**
   * Get campaign metrics for a user and date
   */
  async getCampaignMetrics(
    userId: string,
    date: string // YYYY-MM-DD format
  ): Promise<CampaignMetrics> {
    const dateStart = `${date}T00:00:00Z`;
    const dateEnd = `${date}T23:59:59Z`;

    // Total scraped (all prospects)
    const { count: totalScraped } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Total enriched (prospects with enrichment data)
    const { count: totalEnriched } = await supabase
      .from('prospect_enrichment')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('enriched_at', dateStart)
      .lte('enriched_at', dateEnd);

    // Total contacted
    const { count: totalContacted } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'contacted')
      .gte('last_contacted_at', dateStart)
      .lte('last_contacted_at', dateEnd);

    // Total replied (engaged status or has last_replied_at)
    const { count: totalReplied } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or('status.eq.engaged,last_replied_at.not.is.null')
      .gte('last_replied_at', dateStart)
      .lte('last_replied_at', dateEnd);

    // Total qualified
    const { count: totalQualified } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'qualified')
      .gte('updated_at', dateStart)
      .lte('updated_at', dateEnd);

    // Meetings booked
    const { count: meetingsBooked } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Calculate meetings per 100 prospects
    const meetingsPer100 =
      totalContacted && totalContacted > 0
        ? (meetingsBooked || 0) / totalContacted * 100
        : 0;

    return {
      date,
      total_scraped: totalScraped || 0,
      total_enriched: totalEnriched || 0,
      total_contacted: totalContacted || 0,
      total_replied: totalReplied || 0,
      total_qualified: totalQualified || 0,
      meetings_booked: meetingsBooked || 0,
      meetings_per_100_prospects: Math.round(meetingsPer100 * 100) / 100, // Round to 2 decimals
    };
  }

  /**
   * Get email performance metrics for a user and date
   */
  async getEmailMetrics(
    userId: string,
    date: string
  ): Promise<EmailMetrics> {
    const dateStart = `${date}T00:00:00Z`;
    const dateEnd = `${date}T23:59:59Z`;

    // Sent count (outbound emails from ai_conversation_log)
    const { count: sentCount } = await supabase
      .from('ai_conversation_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('direction', 'outbound')
      .eq('channel', 'email')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Opens count (sum of email_opens from prospects)
    const { data: prospects } = await supabase
      .from('prospects')
      .select('email_opens')
      .eq('user_id', userId)
      .gte('last_contacted_at', dateStart)
      .lte('last_contacted_at', dateEnd);

    const openCount = prospects?.reduce((sum, p) => sum + (p.email_opens || 0), 0) || 0;

    // Clicks count (sum of email_clicks from prospects)
    const clickCount = prospects?.reduce((sum, p) => sum + (p.email_clicks || 0), 0) || 0;

    // Reply count (inbound emails from ai_conversation_log)
    const { count: replyCount } = await supabase
      .from('ai_conversation_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('direction', 'inbound')
      .eq('channel', 'email')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Get bounce_rate and spam_complaint_rate from campaigns table
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('bounce_rate, spam_complaint_rate, bounce_count, spam_complaint_count, contacted_count')
      .eq('user_id', userId)
      .gte('updated_at', dateStart)
      .lte('updated_at', dateEnd);

    // Aggregate bounce and spam rates across campaigns
    let totalBounces = 0;
    let totalSpam = 0;
    let totalSent = 0;
    let bounceRate = 0;
    let spamComplaintRate = 0;

    if (campaigns && campaigns.length > 0) {
      campaigns.forEach((campaign: any) => {
        totalBounces += campaign.bounce_count || 0;
        totalSpam += campaign.spam_complaint_count || 0;
        totalSent += campaign.contacted_count || 0; // Using contacted_count as proxy for sent
      });

      if (totalSent > 0) {
        bounceRate = (totalBounces / totalSent) * 100;
        spamComplaintRate = (totalSpam / totalSent) * 100;
      } else if (campaigns[0]) {
        // Use pre-calculated rates if available
        bounceRate = campaigns[0].bounce_rate || 0;
        spamComplaintRate = campaigns[0].spam_complaint_rate || 0;
      }
    }

    // Calculate rates
    const openRate = sentCount && sentCount > 0 ? (openCount / sentCount) * 100 : 0;
    const replyRate = sentCount && sentCount > 0 ? ((replyCount || 0) / sentCount) * 100 : 0;

    // Calculate deliverability health
    const healthStatus = this.calculateDeliverabilityHealth(bounceRate, spamComplaintRate);

    return {
      date,
      sent_count: sentCount || 0,
      open_rate: Math.round(openRate * 100) / 100,
      reply_rate: Math.round(replyRate * 100) / 100,
      bounce_rate: Math.round(bounceRate * 100) / 100,
      spam_complaint_rate: Math.round(spamComplaintRate * 100) / 100,
      health_status: healthStatus,
    };
  }

  /**
   * Get AI agent performance metrics for a user and date
   */
  async getAIAgentMetrics(
    userId: string,
    date: string
  ): Promise<AIAgentMetrics> {
    const dateStart = `${date}T00:00:00Z`;
    const dateEnd = `${date}T23:59:59Z`;

    // Total conversations (inbound + outbound)
    const { count: totalConversations } = await supabase
      .from('ai_conversation_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Qualified meetings
    const { count: qualifiedMeetings } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Total qualifications (from ai_conversation_log where is_qualified = true)
    const { count: totalQualifications } = await supabase
      .from('ai_conversation_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_qualified', true)
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    // Qualification accuracy
    const qualificationAccuracy =
      totalQualifications && totalQualifications > 0
        ? ((qualifiedMeetings || 0) / totalQualifications) * 100
        : 0;

    // Average confidence score for AI-generated messages
    const { data: aiMessages } = await supabase
      .from('ai_conversation_log')
      .select('ai_confidence_score')
      .eq('user_id', userId)
      .eq('generated_by_ai', true)
      .not('ai_confidence_score', 'is', null)
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd);

    const confidenceAvg =
      aiMessages && aiMessages.length > 0
        ? aiMessages.reduce((sum, m) => sum + (m.ai_confidence_score || 0), 0) / aiMessages.length
        : 0;

    return {
      date,
      total_conversations: totalConversations || 0,
      qualification_accuracy: Math.round(qualificationAccuracy * 100) / 100,
      confidence_avg: Math.round(confidenceAvg * 100) / 100,
    };
  }

  /**
   * Calculate deliverability health status
   */
  calculateDeliverabilityHealth(
    bounceRate: number,
    spamComplaintRate: number
  ): 'Green' | 'Amber' | 'Red' {
    // Green: bounce < 2% AND spam < 0.05%
    if (bounceRate < 2 && spamComplaintRate < 0.05) {
      return 'Green';
    }

    // Amber: bounce 2-5% OR spam 0.05-0.1%
    if (
      (bounceRate >= 2 && bounceRate <= 5) ||
      (spamComplaintRate >= 0.05 && spamComplaintRate <= 0.1)
    ) {
      return 'Amber';
    }

    // Red: bounce > 5% OR spam > 0.1%
    return 'Red';
  }

  /**
   * Get all metrics for a user and date
   */
  async getAllMetrics(userId: string, date: string): Promise<AllMetrics> {
    const [campaign, email, ai] = await Promise.all([
      this.getCampaignMetrics(userId, date),
      this.getEmailMetrics(userId, date),
      this.getAIAgentMetrics(userId, date),
    ]);

    return { campaign, email, ai };
  }

  /**
   * Get all active users with google_sheet_id
   */
  async getActiveUsers(): Promise<Array<{ id: string; email: string; google_sheet_id: string | null }>> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, google_sheet_id')
      .not('google_sheet_id', 'is', null)
      .eq('onboarding_completed', true);

    if (error) {
      throw new Error(`Failed to fetch active users: ${error.message}`);
    }

    return data || [];
  }
}

