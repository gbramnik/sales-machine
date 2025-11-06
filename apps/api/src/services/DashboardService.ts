import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

export interface DashboardStats {
  healthScore: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    breakdown: {
      deliverability: number;
      responseRate: number;
      aiPerformance: number;
    };
  };
  pipeline: {
    contacted: number;
    engaged: number;
    qualified: number;
    meetingBooked: number;
  };
  pendingReviews: number;
  activeCampaigns: number;
  totalProspects: number;
}

export interface ActivityStreamItem {
  id: string;
  timestamp: Date;
  type: 'qualified' | 'booked' | 'flagged' | 'responded' | 'contacted';
  prospect: {
    name: string;
    company: string;
  };
  confidence?: number;
}

export class DashboardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get dashboard statistics
   */
  async getStats(userId: string): Promise<DashboardStats> {
    try {
      // Get health score using database function
      // @ts-ignore - Supabase type inference issue with Database generic
      const { data: healthData } = await this.supabase
        .rpc('calculate_health_score', { user_uuid: userId } as any);

      const healthScore = healthData?.[0] || {
        score: 0,
        deliverability_score: 0,
        response_rate_score: 0,
        ai_performance_score: 0,
      };

      // Get pipeline counts
      const { data: prospects } = await this.supabase
        .from('prospects')
        .select('status')
        .eq('user_id', userId);

      const pipelineCounts = {
        contacted: 0,
        engaged: 0,
        qualified: 0,
        meetingBooked: 0,
      };

      prospects?.forEach((p: any) => {
        if (p.status === 'contacted') pipelineCounts.contacted++;
        if (p.status === 'engaged') pipelineCounts.engaged++;
        if (p.status === 'qualified') pipelineCounts.qualified++;
        if (p.status === 'meeting_booked') pipelineCounts.meetingBooked++;
      });

      // Get pending reviews count
      // @ts-ignore - Supabase type inference issue with Database generic
      const { data: pendingReviews } = await this.supabase
        .rpc('get_pending_review_count', { user_uuid: userId } as any);

      // Get active campaigns count
      const { count: activeCampaigns } = await this.supabase
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');

      // Get total prospects
      const { count: totalProspects } = await this.supabase
        .from('prospects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        healthScore: {
          score: healthScore.score,
          trend: 'stable', // TODO: Calculate trend from historical data
          trendValue: 0,
          breakdown: {
            deliverability: healthScore.deliverability_score,
            responseRate: healthScore.response_rate_score,
            aiPerformance: healthScore.ai_performance_score,
          },
        },
        pipeline: pipelineCounts,
        pendingReviews: pendingReviews || 0,
        activeCampaigns: activeCampaigns || 0,
        totalProspects: totalProspects || 0,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch dashboard stats',
        500,
        error
      );
    }
  }

  /**
   * Get activity stream (recent AI actions)
   */
  async getActivityStream(userId: string, limit = 20): Promise<ActivityStreamItem[]> {
    const { data, error } = await this.supabase
      .from('ai_conversation_log')
      .select(`
        id,
        created_at,
        direction,
        is_qualified,
        ai_confidence_score,
        prospect:prospects(full_name, company_name)
      `)
      .eq('user_id', userId)
      .eq('generated_by_ai', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch activity stream',
        500,
        error
      );
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: new Date(item.created_at),
      type: item.is_qualified ? 'qualified' : item.direction === 'inbound' ? 'responded' : 'contacted',
      prospect: {
        name: item.prospect?.full_name || 'Unknown',
        company: item.prospect?.company_name || 'Unknown',
      },
      confidence: item.ai_confidence_score,
    }));
  }

  /**
   * Get pipeline prospects by stage
   */
  async getPipelineProspects(userId: string) {
    const { data, error } = await this.supabase
      .from('prospects')
      .select(`
        id,
        full_name,
        company_name,
        status,
        is_vip,
        updated_at,
        enrichment:prospect_enrichment(confidence_score)
      `)
      .eq('user_id', userId)
      .in('status', ['contacted', 'engaged', 'qualified', 'meeting_booked'])
      .order('updated_at', { ascending: false });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch pipeline prospects',
        500,
        error
      );
    }

    // Group by status
    const stages = [
      { id: 'contacted', label: 'Contacted', prospects: [] as any[] },
      { id: 'engaged', label: 'Engaged', prospects: [] as any[] },
      { id: 'qualified', label: 'Qualified', prospects: [] as any[] },
      { id: 'meeting_booked', label: 'Meeting Booked', prospects: [] as any[] },
    ];

    data?.forEach((prospect: any) => {
      const stage = stages.find((s) => s.id === prospect.status);
      if (stage) {
        stage.prospects.push({
          id: prospect.id,
          name: prospect.full_name,
          company: prospect.company_name,
          confidenceScore: prospect.enrichment?.confidence_score || 0,
          isVIP: prospect.is_vip,
          lastActivity: this.getRelativeTime(new Date(prospect.updated_at)),
        });
      }
    });

    return stages.map((stage) => ({
      ...stage,
      count: stage.prospects.length,
    }));
  }

  /**
   * Get alerts for dashboard (Story 5.2 - Task 5)
   */
  async getAlerts(userId: string): Promise<any[]> {
    const alerts: any[] = [];

    try {
      // 1. Deliverability alerts: Check bounce rate >5% or spam >0.1%
      const { data: campaigns } = await this.supabase
        .from('campaigns')
        .select('id, bounce_rate, spam_complaint_rate, name')
        .eq('user_id', userId)
        .eq('status', 'active');

      campaigns?.forEach((campaign: any) => {
        if (campaign.bounce_rate > 5) {
          alerts.push({
            id: `deliverability-${campaign.id}`,
            type: 'deliverability',
            title: 'High Bounce Rate',
            message: `Campaign "${campaign.name}" has a bounce rate of ${campaign.bounce_rate.toFixed(1)}% (threshold: 5%)`,
            timestamp: new Date(),
            severity: campaign.bounce_rate > 10 ? 'high' : 'medium',
            actionUrl: `/campaigns/${campaign.id}`,
          });
        }
        if (campaign.spam_complaint_rate > 0.1) {
          alerts.push({
            id: `spam-${campaign.id}`,
            type: 'deliverability',
            title: 'Spam Complaint Detected',
            message: `Campaign "${campaign.name}" has spam complaints (${campaign.spam_complaint_rate.toFixed(2)}%)`,
            timestamp: new Date(),
            severity: 'high',
            actionUrl: `/campaigns/${campaign.id}`,
          });
        }
      });

      // 2. VIP review alerts: Count pending VIP reviews
      const { data: vipReviews } = await this.supabase
        .from('ai_review_queue')
        .select('id, prospect:prospects(is_vip)')
        .eq('user_id', userId)
        .eq('status', 'pending');

      const vipCount = vipReviews?.filter((r: any) => r.prospect?.is_vip).length || 0;
      if (vipCount > 0) {
        alerts.push({
          id: 'vip-review',
          type: 'vip_review',
          title: 'VIP Accounts Need Review',
          message: `${vipCount} message${vipCount === 1 ? '' : 's'} awaiting review for C-level prospects`,
          timestamp: new Date(),
          severity: 'high',
          actionUrl: '/review-queue',
        });
      }

      // 3. Meeting booked alerts: Recent meetings (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recentMeetings } = await this.supabase
        .from('meetings')
        .select('id, prospect:prospects(full_name, company_name)')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      recentMeetings?.forEach((meeting: any) => {
        alerts.push({
          id: `meeting-${meeting.id}`,
          type: 'meeting_booked',
          title: 'New Meeting Booked',
          message: `Meeting scheduled with ${meeting.prospect?.full_name} from ${meeting.prospect?.company_name}`,
          timestamp: new Date(),
          severity: 'low',
          actionUrl: `/meetings/${meeting.id}`,
        });
      });

      // Sort by severity and timestamp
      const severityOrder = { high: 0, medium: 1, low: 2 };
      alerts.sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  /**
   * Dismiss an alert (Story 5.2 - Task 5)
   */
  async dismissAlert(userId: string, alertId: string): Promise<void> {
    // For MVP, we'll store dismissed alerts in a simple table
    // In production, this could be more sophisticated (e.g., user_dismissed_alerts table)
    try {
      // Check if user_dismissed_alerts table exists, if not, just return
      // For now, we'll use a simple approach: store in a JSONB field in users table
      // Or create a user_dismissed_alerts table if needed
      
      // For MVP, we'll just return success (client-side dismissal)
      // In production, persist to database
      return;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      // Don't throw - allow client-side dismissal even if backend fails
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }
}
