import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

type Prospect = Database['public']['Tables']['prospects']['Row'];
type ProspectInsert = Database['public']['Tables']['prospects']['Insert'];
type ProspectUpdate = Database['public']['Tables']['prospects']['Update'];
type ProspectEnrichment = Database['public']['Tables']['prospect_enrichment']['Row'];

export interface ProspectFilters {
  campaignId?: string;
  status?: string;
  isVip?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProspectWithEnrichment extends Prospect {
  enrichment?: ProspectEnrichment;
}

export class ProspectService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * List prospects with optional filters
   */
  async listProspects(userId: string, filters: ProspectFilters = {}): Promise<{
    prospects: ProspectWithEnrichment[];
    total: number;
  }> {
    let query = this.supabase
      .from('prospects')
      .select(`
        *,
        enrichment:prospect_enrichment(*)
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.isVip !== undefined) {
      query = query.eq('is_vip', filters.isVip);
    }

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch prospects',
        500,
        error
      );
    }

    return {
      prospects: data || [],
      total: count || 0,
    };
  }

  /**
   * Get single prospect by ID with enrichment
   */
  async getProspect(userId: string, prospectId: string): Promise<ProspectWithEnrichment> {
    const { data, error } = await this.supabase
      .from('prospects')
      .select(`
        *,
        enrichment:prospect_enrichment(*)
      `)
      .eq('id', prospectId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }

    return data;
  }

  /**
   * Create new prospect
   */
  async createProspect(userId: string, prospect: ProspectInsert): Promise<Prospect> {
    // @ts-ignore - Supabase type inference issue with Database generic
    const { data, error } = await this.supabase
      .from('prospects')
      .insert({
        ...prospect,
        user_id: userId,
      } as any)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to create prospect',
        500,
        error
      );
    }

    return data;
  }

  /**
   * Update prospect
   */
  async updateProspect(
    userId: string,
    prospectId: string,
    updates: ProspectUpdate
  ): Promise<Prospect> {
    const { data, error} = await this.supabase
      .from('prospects')
      // @ts-expect-error - Supabase type inference issue
      .update(updates)
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to update prospect',
        500,
        error
      );
    }

    if (!data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }

    return data;
  }

  /**
   * Delete prospect (GDPR)
   */
  async deleteProspect(userId: string, prospectId: string): Promise<void> {
    const { error } = await this.supabase
      .from('prospects')
      .delete()
      .eq('id', prospectId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to delete prospect',
        500,
        error
      );
    }
  }
}
