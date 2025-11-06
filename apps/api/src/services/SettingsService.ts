import { supabase } from '../lib/supabase';
import * as dns from 'dns';
import { promisify } from 'util';
import { encrypt, decrypt } from '../lib/encryption';

const resolveTxt = promisify(dns.resolveTxt);

export interface ApiCredentialData {
  service_name: string;
  api_key?: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
}

export interface ICPConfigData {
  industries?: string[];
  job_titles?: string[];
  company_sizes?: string[];
  locations?: string[];
  technologies?: string[];
  exclude_industries?: string[];
  exclude_companies?: string[];
}

export interface EmailSettingsData {
  domain?: string;
  sending_email?: string;
  daily_limit?: number;
  warm_up_enabled?: boolean;
  warm_up_days_required?: number;
  bounce_rate_threshold?: number;
}

export interface AISettingsData {
  personality_id?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  confidence_threshold?: number;
  use_vip_mode?: boolean;
  response_templates?: string[];
}

export class SettingsService {
  /**
   * Get all API credentials for a user (with masked keys)
   */
  async getApiCredentials(userId: string) {
    const { data, error } = await supabase
      .from('api_credentials')
      .select('id, service_name, webhook_url, is_active, last_verified_at, created_at, updated_at')
      .eq('user_id', userId)
      .order('service_name');

    if (error) {
      throw new Error(`Failed to get API credentials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Save or update an API credential
   */
  async saveApiCredential(userId: string, data: ApiCredentialData) {
    // Check if credential already exists
    const { data: existing } = await supabase
      .from('api_credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('service_name', data.service_name)
      .single();

    // Encrypt API key before storage
    const encryptedApiKey = data.api_key ? encrypt(data.api_key) : undefined;

    if (existing) {
      // Update existing
      const updateData: any = {
        webhook_url: data.webhook_url,
        metadata: data.metadata,
        updated_at: new Date().toISOString(),
      };
      
      // Only update api_key if provided
      if (encryptedApiKey !== undefined) {
        updateData.api_key = encryptedApiKey;
      }

      const { data: credential, error } = await supabase
        .from('api_credentials')
        .update(updateData)
        .eq('id', existing.id)
        .select('id, service_name, webhook_url, is_active, last_verified_at')
        .single();

      if (error) {
        throw new Error(`Failed to update API credential: ${error.message}`);
      }

      return credential;
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('api_credentials')
        .insert({
          user_id: userId,
          service_name: data.service_name,
          api_key: encryptedApiKey,
          webhook_url: data.webhook_url,
          metadata: data.metadata || {},
          is_active: true,
        })
        .select('id, service_name, webhook_url, is_active, last_verified_at')
        .single();

      if (error) {
        throw new Error(`Failed to create API credential: ${error.message}`);
      }

      return created;
    }
  }

  /**
   * Delete an API credential
   */
  async deleteApiCredential(userId: string, serviceName: string) {
    const { error } = await supabase
      .from('api_credentials')
      .delete()
      .eq('user_id', userId)
      .eq('service_name', serviceName);

    if (error) {
      throw new Error(`Failed to delete API credential: ${error.message}`);
    }

    return true;
  }

  /**
   * Verify an API credential by testing it
   */
  async verifyApiCredential(userId: string, serviceName: string) {
    const { data: credential } = await supabase
      .from('api_credentials')
      .select('api_key, webhook_url')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .single();

    if (!credential) {
      throw new Error('API credential not found');
    }

    // Decrypt API key for verification
    const decryptedApiKey = credential.api_key ? decrypt(credential.api_key) : null;

    let isValid = false;
    let errorMessage: string | null = null;

    try {
      // Test the credential based on service type
      if (serviceName === 'openai' && decryptedApiKey) {
        // Test Claude API (Anthropic) - using OpenAI endpoint as fallback, but should use Anthropic
        // Note: This is a placeholder - should use Anthropic API endpoint
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': decryptedApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        isValid = response.ok || response.status === 400; // 400 might mean auth is valid but request is invalid
        if (!isValid && response.status === 401) {
          errorMessage = `Anthropic API error: Invalid API key`;
        }
      } else if (serviceName === 'unipil' && decryptedApiKey) {
        // Test UniPil API
        const unipilUrl = process.env.UNIPIL_API_URL || 'https://api.unipil.com';
        const response = await fetch(`${unipilUrl}/api/v1/health`, {
          headers: {
            'Authorization': `Bearer ${decryptedApiKey}`,
          },
        });
        isValid = response.ok;
        if (!isValid) {
          errorMessage = `UniPil API error: ${response.statusText}`;
        }
      } else if (serviceName.startsWith('n8n_') && credential.webhook_url) {
        // Test N8N webhook (simple ping)
        const response = await fetch(credential.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });
        isValid = response.ok || response.status === 202; // 202 Accepted is also valid
        if (!isValid) {
          errorMessage = `N8N webhook error: ${response.statusText}`;
        }
      } else if (serviceName.startsWith('smtp_') && decryptedApiKey) {
        // SMTP verification would require nodemailer - for now, just check key exists
        // TODO: Implement actual SMTP connection test with nodemailer
        isValid = !!decryptedApiKey;
        if (!isValid) {
          errorMessage = 'SMTP credentials missing';
        }
      } else if ((serviceName === 'cal_com' || serviceName === 'calendly') && decryptedApiKey) {
        // Calendar service verification
        isValid = !!decryptedApiKey;
        if (!isValid) {
          errorMessage = 'Calendar API key missing';
        }
      } else if (serviceName === 'email_finder' && decryptedApiKey) {
        // Email finder service - basic format validation
        isValid = decryptedApiKey.length > 10; // Basic validation
        if (!isValid) {
          errorMessage = 'Email finder API key format invalid';
        }
      } else {
        // For other services, just mark as valid if key/url exists
        isValid = !!(decryptedApiKey || credential.webhook_url);
      }

      // Update verification timestamp
      await supabase
        .from('api_credentials')
        .update({
          last_verified_at: new Date().toISOString(),
          is_active: isValid,
        })
        .eq('user_id', userId)
        .eq('service_name', serviceName);

    } catch (error: any) {
      isValid = false;
      errorMessage = error.message;
    }

    return {
      service_name: serviceName,
      is_valid: isValid,
      verified_at: new Date().toISOString(),
      error: errorMessage,
    };
  }

  /**
   * Get ICP configuration
   */
  async getICPConfig(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('icp_criteria')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get ICP config: ${error.message}`);
    }

    // Parse JSONB field and return with defaults
    const config = (data?.icp_criteria as ICPConfigData) || {};
    return {
      industries: config.industries || [],
      job_titles: config.job_titles || [],
      company_sizes: config.company_sizes || [],
      locations: config.locations || [],
      technologies: config.technologies || [],
      exclude_industries: config.exclude_industries || [],
      exclude_companies: config.exclude_companies || [],
    };
  }

  /**
   * Save ICP configuration
   */
  async saveICPConfig(userId: string, data: ICPConfigData) {
    // Store full ICP config in JSONB field
    const { error } = await supabase
      .from('users')
      .update({
        icp_criteria: data as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save ICP config: ${error.message}`);
    }

    return data;
  }

  /**
   * Get email settings
   */
  async getEmailSettings(userId: string) {
    // First check if email_settings JSONB field exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email_settings')
      .eq('id', userId)
      .single();

    if (!userError && userData?.email_settings) {
      const settings = userData.email_settings as EmailSettingsData;
      return {
        domain: settings.domain || null,
        sending_email: settings.sending_email || null,
        daily_limit: settings.daily_limit || 20,
        warm_up_enabled: settings.warm_up_enabled ?? true,
        warm_up_days_required: settings.warm_up_days_required || 14,
        bounce_rate_threshold: settings.bounce_rate_threshold || 5,
      };
    }

    // Fallback to campaign_sending_settings table if it exists
    const { data, error } = await supabase
      .from('campaign_sending_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          domain: null,
          sending_email: null,
          daily_limit: 20,
          warm_up_enabled: true,
          warm_up_days_required: 14,
          bounce_rate_threshold: 5,
        };
      }
      throw new Error(`Failed to get email settings: ${error.message}`);
    }

    return {
      domain: data.metadata?.domain || null,
      sending_email: data.metadata?.sending_email || null,
      daily_limit: data.metadata?.daily_limit || 20,
      warm_up_enabled: data.metadata?.warm_up_enabled ?? true,
      warm_up_days_required: data.metadata?.warm_up_days_required || 14,
      bounce_rate_threshold: data.metadata?.bounce_rate_threshold || 5,
    };
  }

  /**
   * Save email settings
   */
  async saveEmailSettings(userId: string, data: EmailSettingsData) {
    // Store in email_settings JSONB field in users table
    const { error } = await supabase
      .from('users')
      .update({
        email_settings: data as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save email settings: ${error.message}`);
    }

    return data;
  }

  /**
   * Verify domain DNS records
   */
  async verifyDomain(domain: string) {
    const checks = {
      spf: false,
      dkim: false,
      dmarc: false,
    };

    try {
      // Check SPF record
      const spfRecords = await resolveTxt(domain);
      checks.spf = spfRecords.some(record =>
        record.some(value => value.includes('v=spf1'))
      );
    } catch {}

    try {
      // Check DKIM record (using common selector 'default')
      const dkimRecords = await resolveTxt(`default._domainkey.${domain}`);
      checks.dkim = dkimRecords.length > 0;
    } catch {}

    try {
      // Check DMARC record
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
      checks.dmarc = dmarcRecords.some(record =>
        record.some(value => value.includes('v=DMARC1'))
      );
    } catch {}

    const allValid = checks.spf && checks.dkim && checks.dmarc;

    return {
      domain,
      verified: allValid,
      checks,
      recommendations: {
        spf: !checks.spf ? 'Add SPF record: v=spf1 include:_spf.google.com ~all' : null,
        dkim: !checks.dkim ? 'Configure DKIM in your email service provider' : null,
        dmarc: !checks.dmarc ? 'Add DMARC record: v=DMARC1; p=quarantine; rua=mailto:dmarc@' + domain : null,
      },
    };
  }

  /**
   * Get AI settings
   */
  async getAISettings(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('ai_settings')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get AI settings: ${error.message}`);
    }

    // Parse JSONB field and return with defaults
    const settings = (data?.ai_settings as AISettingsData) || {};
    // Get confidence_threshold from dedicated field (ai_confidence_threshold) or fallback to ai_settings
    const { data: userData } = await supabase
      .from('users')
      .select('ai_confidence_threshold')
      .eq('id', userId)
      .single();
    
    const confidenceThreshold = userData?.ai_confidence_threshold ?? settings.confidence_threshold ?? 80;
    
    return {
      personality_id: settings.personality_id || null,
      tone: settings.tone || 'professional',
      confidence_threshold: confidenceThreshold,
      use_vip_mode: settings.use_vip_mode ?? true,
      response_templates: settings.response_templates || [],
    };
  }

  /**
   * Save AI settings
   */
  async saveAISettings(userId: string, data: AISettingsData) {
    // Extract confidence_threshold if provided (store in dedicated field)
    const confidenceThreshold = data.confidence_threshold;
    const settingsWithoutThreshold = { ...data };
    delete (settingsWithoutThreshold as any).confidence_threshold;

    // Store in ai_settings JSONB field (without confidence_threshold)
    const updateData: any = {
      ai_settings: settingsWithoutThreshold as any,
      updated_at: new Date().toISOString(),
    };

    // If confidence_threshold provided, store in dedicated field
    if (confidenceThreshold !== undefined) {
      if (confidenceThreshold < 60 || confidenceThreshold > 95) {
        throw new Error('confidence_threshold must be between 60 and 95');
      }
      updateData.ai_confidence_threshold = confidenceThreshold;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save AI settings: ${error.message}`);
    }

    return data;
  }

  /**
   * Get AI confidence threshold
   */
  async getAIConfidenceThreshold(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('ai_confidence_threshold')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get AI confidence threshold: ${error.message}`);
    }

    const threshold = data?.ai_confidence_threshold;
    if (threshold === null || threshold === undefined) {
      return 80; // Default threshold
    }

    // Validate threshold is in valid range (60-95)
    if (threshold < 60 || threshold > 95) {
      return 80; // Default if invalid
    }

    return threshold;
  }

  /**
   * Save AI confidence threshold
   */
  async saveAIConfidenceThreshold(userId: string, threshold: number): Promise<{ threshold: number }> {
    // Validate threshold range
    if (threshold < 60 || threshold > 95) {
      throw new Error('AI confidence threshold must be between 60 and 95');
    }

    const { error } = await supabase
      .from('users')
      .update({
        ai_confidence_threshold: threshold,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save AI confidence threshold: ${error.message}`);
    }

    return { threshold };
  }

  /**
   * Get detection settings
   */
  async getDetectionSettings(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('detection_mode, daily_prospect_count, detection_time')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get detection settings: ${error.message}`);
    }

    return {
      detection_mode: data?.detection_mode || 'autopilot',
      daily_prospect_count: data?.daily_prospect_count || 20,
      detection_time: data?.detection_time || '06:00',
    };
  }

  /**
   * Save detection settings
   */
  async saveDetectionSettings(
    userId: string,
    data: {
      detection_mode?: 'autopilot' | 'semi_auto';
      daily_prospect_count?: number;
      detection_time?: string;
    }
  ) {
    // Validate daily_prospect_count
    if (data.daily_prospect_count !== undefined) {
      if (data.daily_prospect_count < 1 || data.daily_prospect_count > 40) {
        throw new Error('daily_prospect_count must be between 1 and 40');
      }
    }

    // Validate detection_time format (HH:MM)
    if (data.detection_time !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.detection_time)) {
        throw new Error('detection_time must be in HH:MM format (24-hour)');
      }
    }

    const updateData: any = {};
    if (data.detection_mode !== undefined) updateData.detection_mode = data.detection_mode;
    if (data.daily_prospect_count !== undefined) updateData.daily_prospect_count = data.daily_prospect_count;
    if (data.detection_time !== undefined) updateData.detection_time = data.detection_time;

    const { error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save detection settings: ${error.message}`);
    }

    return {
      detection_mode: updateData.detection_mode || 'autopilot',
      daily_prospect_count: updateData.daily_prospect_count || 20,
      detection_time: updateData.detection_time || '06:00',
    };
  }
}

