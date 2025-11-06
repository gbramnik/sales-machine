import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

export interface VIPConversionMetrics {
  vip: {
    total: number;
    contacted: number;
    qualified: number;
    meetings: number;
    contact_rate: number;
    qualification_rate: number;
    meeting_rate: number;
  };
  non_vip: {
    total: number;
    contacted: number;
    qualified: number;
    meetings: number;
    contact_rate: number;
    qualification_rate: number;
    meeting_rate: number;
  };
  comparison: {
    contact_rate_diff: number;
    qualification_rate_diff: number;
    meeting_rate_diff: number;
  };
}

export interface VIPReviewMetrics {
  total_vip_reviews: number;
  approved_vip: number;
  rejected_vip: number;
  approval_rate: number;
  rejection_rate: number;
}

/**
 * VIP Analytics Service
 * 
 * Provides analytics for VIP vs non-VIP conversion rates and review metrics.
 */
export class VIPAnalyticsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get VIP conversion metrics compared to non-VIP
   */
  async getVIPConversionMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<VIPConversionMetrics> {
    // Query VIP prospects
    const { data: vipData, error: vipError } = await this.supabase
      .from('prospects')
      .select('id, status, is_vip')
      .eq('user_id', userId)
      .eq('is_vip', true)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (vipError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch VIP conversion metrics',
        500,
        vipError
      );
    }

    // Query non-VIP prospects
    const { data: nonVipData, error: nonVipError } = await this.supabase
      .from('prospects')
      .select('id, status, is_vip')
      .eq('user_id', userId)
      .or('is_vip.eq.false,is_vip.is.null')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (nonVipError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch non-VIP conversion metrics',
        500,
        nonVipError
      );
    }

    const vipProspects = vipData || [];
    const nonVipProspects = nonVipData || [];

    // Calculate VIP metrics
    const vipTotal = vipProspects.length;
    const vipContacted = vipProspects.filter(
      p => ['contacted', 'engaged', 'qualified', 'meeting_booked'].includes(p.status || '')
    ).length;
    const vipQualified = vipProspects.filter(
      p => ['qualified', 'meeting_booked'].includes(p.status || '')
    ).length;
    const vipMeetings = vipProspects.filter(
      p => p.status === 'meeting_booked'
    ).length;

    // Calculate non-VIP metrics
    const nonVipTotal = nonVipProspects.length;
    const nonVipContacted = nonVipProspects.filter(
      p => ['contacted', 'engaged', 'qualified', 'meeting_booked'].includes(p.status || '')
    ).length;
    const nonVipQualified = nonVipProspects.filter(
      p => ['qualified', 'meeting_booked'].includes(p.status || '')
    ).length;
    const nonVipMeetings = nonVipProspects.filter(
      p => p.status === 'meeting_booked'
    ).length;

    // Calculate rates (handle division by zero)
    const vipContactRate = vipTotal > 0 ? (vipContacted / vipTotal) * 100 : 0;
    const vipQualificationRate = vipContacted > 0 ? (vipQualified / vipContacted) * 100 : 0;
    const vipMeetingRate = vipQualified > 0 ? (vipMeetings / vipQualified) * 100 : 0;

    const nonVipContactRate = nonVipTotal > 0 ? (nonVipContacted / nonVipTotal) * 100 : 0;
    const nonVipQualificationRate = nonVipContacted > 0 ? (nonVipQualified / nonVipContacted) * 100 : 0;
    const nonVipMeetingRate = nonVipQualified > 0 ? (nonVipMeetings / nonVipQualified) * 100 : 0;

    // Calculate differences
    const contactRateDiff = vipContactRate - nonVipContactRate;
    const qualificationRateDiff = vipQualificationRate - nonVipQualificationRate;
    const meetingRateDiff = vipMeetingRate - nonVipMeetingRate;

    return {
      vip: {
        total: vipTotal,
        contacted: vipContacted,
        qualified: vipQualified,
        meetings: vipMeetings,
        contact_rate: Math.round(vipContactRate * 100) / 100,
        qualification_rate: Math.round(vipQualificationRate * 100) / 100,
        meeting_rate: Math.round(vipMeetingRate * 100) / 100,
      },
      non_vip: {
        total: nonVipTotal,
        contacted: nonVipContacted,
        qualified: nonVipQualified,
        meetings: nonVipMeetings,
        contact_rate: Math.round(nonVipContactRate * 100) / 100,
        qualification_rate: Math.round(nonVipQualificationRate * 100) / 100,
        meeting_rate: Math.round(nonVipMeetingRate * 100) / 100,
      },
      comparison: {
        contact_rate_diff: Math.round(contactRateDiff * 100) / 100,
        qualification_rate_diff: Math.round(qualificationRateDiff * 100) / 100,
        meeting_rate_diff: Math.round(meetingRateDiff * 100) / 100,
      },
    };
  }

  /**
   * Get VIP review metrics
   */
  async getVIPReviewMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<VIPReviewMetrics> {
    const { data, error } = await this.supabase
      .from('ai_review_queue')
      .select(`
        id,
        status,
        prospect:prospects!inner(is_vip)
      `)
      .eq('user_id', userId)
      .eq('prospects.is_vip', true)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch VIP review metrics',
        500,
        error
      );
    }

    const reviews = data || [];
    const totalVipReviews = reviews.length;
    const approvedVip = reviews.filter(r => r.status === 'approved').length;
    const rejectedVip = reviews.filter(r => r.status === 'rejected').length;

    // Calculate rates (handle division by zero)
    const approvalRate = totalVipReviews > 0 ? (approvedVip / totalVipReviews) * 100 : 0;
    const rejectionRate = totalVipReviews > 0 ? (rejectedVip / totalVipReviews) * 100 : 0;

    return {
      total_vip_reviews: totalVipReviews,
      approved_vip: approvedVip,
      rejected_vip: rejectedVip,
      approval_rate: Math.round(approvalRate * 100) / 100,
      rejection_rate: Math.round(rejectionRate * 100) / 100,
    };
  }
}

