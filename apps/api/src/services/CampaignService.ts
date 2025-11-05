import { supabase } from '../lib/supabase';
import { RateLimitService } from './RateLimitService';

export interface CampaignCreateData {
  name: string;
  description?: string;
  agent_id: string;
  message_template: string;
  batch_size?: number;
  batch_interval_minutes?: number;
  followup_enabled?: boolean;
  followup_max_count?: number;
  followup_intervals_hours?: string;
  metadata?: Record<string, any>;
}

export interface CampaignUpdateData {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  message_template?: string;
  batch_size?: number;
  batch_interval_minutes?: number;
  followup_enabled?: boolean;
  followup_max_count?: number;
  metadata?: Record<string, any>;
}

export interface CampaignListQuery {
  status?: 'draft' | 'active' | 'paused' | 'completed';
  limit?: number;
  offset?: number;
}

export class CampaignService {
  /**
   * List campaigns for a user
   */
  async list(userId: string, query: CampaignListQuery) {
    let supabaseQuery = supabase
      .from('campaigns')
      .select('*, agents(name, is_active)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    const { data, error, count } = await supabaseQuery
      .range(query.offset || 0, (query.offset || 0) + (query.limit || 20) - 1);

    if (error) {
      throw new Error(`Failed to list campaigns: ${error.message}`);
    }

    return {
      campaigns: data || [],
      total: count || 0,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }

  /**
   * Get campaign by ID
   */
  async getById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        agents(id, name, is_active),
        campaign_progress(
          total,
          processed,
          succeeded,
          failed,
          percentage,
          completed,
          last_batch_at,
          next_batch_at,
          estimated_completion_at
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new campaign
   */
  async create(userId: string, data: CampaignCreateData) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        agent_id: data.agent_id,
        message_template: data.message_template,
        batch_size: data.batch_size || 5,
        batch_interval_minutes: data.batch_interval_minutes || 3,
        followup_enabled: data.followup_enabled || false,
        followup_max_count: data.followup_max_count || 3,
        followup_intervals_hours: data.followup_intervals_hours || '24,72,168',
        metadata: data.metadata || {},
        status: 'draft',
        is_active: false,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    // Initialize campaign progress
    await supabase
      .from('campaign_progress')
      .insert({
        campaign_id: campaign.id,
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        percentage: 0,
        completed: false,
      });

    return campaign;
  }

  /**
   * Update a campaign
   */
  async update(id: string, userId: string, data: CampaignUpdateData) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    return campaign;
  }

  /**
   * Delete a campaign
   */
  async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }

    return true;
  }

  /**
   * Trigger LinkedIn scraping for a campaign
   */
  async triggerLinkedInScrape(
    id: string,
    userId: string,
    params: {
      industry?: string;
      location?: string;
      job_title?: string;
      company_size?: string;
    }
  ) {
    // Check rate limit
    const rateLimitService = new RateLimitService();
    const rateLimitResult = await rateLimitService.checkScrapingLimit(userId);
    
    if (!rateLimitResult.allowed) {
      throw new Error('Daily scraping limit reached (100/day). Please try again tomorrow.');
    }

    // Get campaign
    const campaign = await this.getById(id, userId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get N8N webhook URL from settings
    const { data: settings } = await supabase
      .from('api_credentials')
      .select('webhook_url')
      .eq('user_id', userId)
      .eq('service_name', 'n8n_linkedin_scrape')
      .eq('is_active', true)
      .single();

    if (!settings?.webhook_url) {
      throw new Error('N8N LinkedIn scraping webhook not configured');
    }

    // Trigger N8N workflow
    const response = await fetch(settings.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: id,
        user_id: userId,
        ...params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger LinkedIn scraping: ${response.statusText}`);
    }

    const result = await response.json() as { executionId?: string };

    // Update campaign progress
    await supabase
      .from('campaign_progress')
      .update({
        last_batch_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('campaign_id', id);

    return {
      status: 'triggered',
      message: 'LinkedIn scraping started',
      workflow_execution_id: result?.executionId || null,
    };
  }

  /**
   * Get campaign progress
   */
  async getProgress(id: string, userId: string) {
    // Verify campaign ownership
    const campaign = await this.getById(id, userId);
    if (!campaign) {
      return null;
    }

    const { data, error } = await supabase
      .from('campaign_progress')
      .select('*')
      .eq('campaign_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get campaign progress: ${error.message}`);
    }

    return data;
  }
}

