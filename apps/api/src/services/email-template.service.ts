import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';
import { replacePlaceholders } from '../utils/template-replacer';

/**
 * Email Template Personalization Service
 * 
 * Handles template fetching, personalization, and validation for both
 * LinkedIn messages and email templates.
 */

// Types
export interface EmailTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  use_case: string | null;
  subject_line: string | null;
  body: string;
  channel: 'linkedin' | 'email' | 'both' | null;
  linkedin_message_preview: string | null;
  variables_required: string[];
  tone: string | null;
  variant_id: string | null;
  is_active: boolean;
  is_system_template: boolean;
}

export interface ProspectData {
  id: string;
  name: string;
  job_title: string | null;
  company: string | null;
}

export interface EnrichmentData {
  talking_points: string[];
  pain_points: string[];
  recent_activity: string | null;
  company_insights: string | null;
  tech_stack: string[];
}

export interface PersonalizedTemplate {
  subject?: string;
  body: string;
  linkedin_preview?: string;
  variables_used: string[];
  variables_missing: string[];
}

export class EmailTemplateService {
  /**
   * Personalize a template with prospect and enrichment data
   * 
   * @param templateId - Template ID
   * @param prospectId - Prospect ID
   * @param userId - User ID (for authorization)
   * @param channel - Optional channel filter ('linkedin' | 'email')
   * @returns Personalized template with subject, body, and linkedin_preview
   */
  async personalizeTemplate(
    templateId: string,
    prospectId: string,
    userId: string,
    channel?: 'linkedin' | 'email'
  ): Promise<PersonalizedTemplate> {
    // Fetch template
    const template = await this.getTemplate(templateId, userId, channel);
    
    // Fetch prospect data
    const prospect = await this.getProspect(prospectId, userId);
    
    // Fetch enrichment data
    const enrichment = await this.getEnrichment(prospectId);
    
    // Build variables object
    const variables = this.buildVariables(prospect, enrichment);
    
    // Check for missing required variables
    const variablesUsed: string[] = [];
    const variablesMissing: string[] = [];
    
    for (const requiredVar of template.variables_required || []) {
      if (variables[requiredVar] !== undefined && variables[requiredVar] !== null) {
        variablesUsed.push(requiredVar);
      } else {
        variablesMissing.push(requiredVar);
      }
    }
    
    // Personalize template body
    const personalizedBody = replacePlaceholders(template.body, variables, {
      strict: false,
      defaultMissing: '',
    });
    
    // Personalize subject (for email templates)
    let personalizedSubject: string | undefined;
    if (template.subject_line) {
      personalizedSubject = replacePlaceholders(template.subject_line, variables, {
        strict: false,
        defaultMissing: '',
      });
    }
    
    // Personalize LinkedIn preview (for LinkedIn templates)
    let personalizedLinkedInPreview: string | undefined;
    if (template.linkedin_message_preview) {
      personalizedLinkedInPreview = replacePlaceholders(
        template.linkedin_message_preview,
        variables,
        {
          strict: false,
          defaultMissing: '',
        }
      );
      
      // Validate LinkedIn connection note length (max 300 chars)
      if (personalizedLinkedInPreview.length > 300) {
        personalizedLinkedInPreview = personalizedLinkedInPreview.substring(0, 297) + '...';
      }
    }
    
    // Validate LinkedIn message body length (max 1000 chars)
    if (template.channel === 'linkedin' && personalizedBody.length > 1000) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        `LinkedIn message body exceeds 1000 character limit (${personalizedBody.length} chars)`,
        400
      );
    }
    
    return {
      subject: personalizedSubject,
      body: personalizedBody,
      linkedin_preview: personalizedLinkedInPreview,
      variables_used: variablesUsed,
      variables_missing: variablesMissing,
    };
  }

  /**
   * Get templates for a specific channel, optionally filtered by VIP status
   * 
   * @param channel - Channel type ('linkedin' | 'email')
   * @param userId - User ID
   * @param isVIP - Optional VIP filter. If true, returns only VIP templates. If false, returns only non-VIP templates. If undefined, returns all templates.
   * @returns Array of email templates
   */
  async getTemplatesForChannel(
    channel: 'linkedin' | 'email',
    userId: string,
    isVIP?: boolean
  ): Promise<EmailTemplate[]> {
    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .or(`user_id.eq.${userId},is_system_template.eq.true`)
      .or(`channel.eq.${channel},channel.eq.both`);

    // Filter by VIP status if specified
    if (isVIP !== undefined) {
      if (isVIP) {
        query = query.eq('is_vip_template', true);
      } else {
        query = query.or('is_vip_template.eq.false,is_vip_template.is.null');
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch templates',
        500,
        error
      );
    }

    // Parse variables_required JSONB for each template
    return (data || []).map(template => ({
      ...template,
      variables_required: Array.isArray(template.variables_required)
        ? template.variables_required
        : [],
    })) as EmailTemplate[];
  }
  
  /**
   * Get template by ID
   */
  private async getTemplate(
    templateId: string,
    userId: string,
    channel?: 'linkedin' | 'email'
  ): Promise<EmailTemplate> {
    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('id', templateId);
    
    // Filter by user or system template
    query = query.or(`user_id.eq.${userId},is_system_template.eq.true`);
    
    // Filter by channel if specified
    if (channel) {
      query = query.or(`channel.eq.${channel},channel.eq.both`);
    }
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Template not found or access denied',
        404
      );
    }
    
    // Parse variables_required JSONB
    const variablesRequired = Array.isArray(data.variables_required)
      ? data.variables_required
      : [];
    
    return {
      ...data,
      variables_required: variablesRequired,
    } as EmailTemplate;
  }
  
  /**
   * Get prospect data
   * Note: Prospects table doesn't have user_id, access is controlled via list_id -> lists -> user_id
   */
  private async getProspect(prospectId: string, userId: string): Promise<ProspectData> {
    // First verify prospect belongs to user via list ownership
    const { data: prospectData, error: prospectError } = await supabaseAdmin
      .from('prospects')
      .select('id, name, job_title, company, list_id')
      .eq('id', prospectId)
      .single();
    
    if (prospectError || !prospectData) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }
    
    // Verify list ownership
    const { data: listData, error: listError } = await supabaseAdmin
      .from('lists')
      .select('user_id')
      .eq('id', prospectData.list_id)
      .eq('user_id', userId)
      .single();
    
    if (listError || !listData) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Access denied to this prospect',
        403
      );
    }
    
    return {
      id: prospectData.id,
      name: prospectData.name || '',
      job_title: prospectData.job_title || null,
      company: prospectData.company || null,
    };
  }
  
  /**
   * Get enrichment data
   */
  private async getEnrichment(prospectId: string): Promise<EnrichmentData | null> {
    const { data, error } = await supabaseAdmin
      .from('prospect_enrichment')
      .select('talking_points, pain_points, recent_activity, company_insights, tech_stack')
      .eq('prospect_id', prospectId)
      .single();
    
    if (error || !data) {
      // Enrichment data is optional - return null if not found
      return null;
    }
    
    return {
      talking_points: Array.isArray(data.talking_points) ? data.talking_points : [],
      pain_points: Array.isArray(data.pain_points) ? data.pain_points : [],
      recent_activity: data.recent_activity || null,
      company_insights: data.company_insights || null,
      tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
    };
  }
  
  /**
   * Build variables object from prospect and enrichment data
   */
  private buildVariables(
    prospect: ProspectData,
    enrichment: EnrichmentData | null
  ): Record<string, string> {
    const variables: Record<string, string> = {
      prospect_name: prospect.name || '',
      company: prospect.company || '',
      job_title: prospect.job_title || '',
    };
    
    if (enrichment) {
      // Talking points
      variables.talking_point_1 = enrichment.talking_points[0] || '';
      variables.talking_point_2 = enrichment.talking_points[1] || '';
      
      // Pain points
      variables.pain_point_1 = enrichment.pain_points[0] || '';
      variables.pain_point_2 = enrichment.pain_points[1] || '';
      
      // Other enrichment data
      variables.recent_activity = enrichment.recent_activity || '';
      variables.company_insights = enrichment.company_insights || '';
      
      // Tech stack (comma-separated)
      variables.tech_stack = enrichment.tech_stack.join(', ') || '';
      
      // Generate LinkedIn connection note (max 300 chars)
      variables.linkedin_connection_note = this.generateLinkedInConnectionNote(
        prospect,
        enrichment
      );
    }
    
    // Default values for missing enrichment data
    if (!variables.talking_point_1) variables.talking_point_1 = '';
    if (!variables.talking_point_2) variables.talking_point_2 = '';
    if (!variables.pain_point_1) variables.pain_point_1 = '';
    if (!variables.pain_point_2) variables.pain_point_2 = '';
    if (!variables.recent_activity) variables.recent_activity = '';
    if (!variables.company_insights) variables.company_insights = '';
    if (!variables.tech_stack) variables.tech_stack = '';
    if (!variables.linkedin_connection_note) {
      variables.linkedin_connection_note = `Would love to connect!`;
    }
    
    return variables;
  }
  
  /**
   * Generate LinkedIn connection note from enrichment data (max 300 chars)
   */
  private generateLinkedInConnectionNote(
    prospect: ProspectData,
    enrichment: EnrichmentData
  ): string {
    const parts: string[] = [];
    
    // Start with talking point if available
    if (enrichment.talking_points.length > 0) {
      parts.push(`I noticed ${enrichment.talking_points[0]}`);
    }
    
    // Add company context if available
    if (enrichment.company_insights) {
      parts.push(`Thought you might find this interesting regarding ${prospect.company || 'your company'}`);
    }
    
    // Fallback
    if (parts.length === 0) {
      parts.push(`Would love to connect!`);
    }
    
    let note = parts.join('. ') + '.';
    
    // Truncate to 300 chars if needed
    if (note.length > 300) {
      note = note.substring(0, 297) + '...';
    }
    
    return note;
  }
  
  /**
   * Validate that all required template variables exist in enrichment data
   * 
   * @param template - Template to validate
   * @param enrichment - Enrichment data
   * @param prospect - Prospect data
   * @returns true if all required variables are available, false otherwise
   */
  validateTemplateVariables(
    template: EmailTemplate,
    enrichment: EnrichmentData | null,
    prospect: ProspectData
  ): { valid: boolean; missing: string[] } {
    const required = template.variables_required || [];
    const missing: string[] = [];
    
    // Build available variables
    const available = this.buildVariables(prospect, enrichment);
    
    // Check each required variable
    for (const variable of required) {
      const value = available[variable];
      if (value === undefined || value === null || value === '') {
        missing.push(variable);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();

