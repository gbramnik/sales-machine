import { z } from 'zod';

/**
 * Email Template Types
 * 
 * Business logic types for email templates with validation schemas.
 * Database types are auto-generated from Supabase schema.
 */

// Template channel enum
export type TemplateChannel = 'linkedin' | 'email' | 'both';

// Template use case enum
export type TemplateUseCase = 
  | 'cold_intro'
  | 'follow_up_no_reply'
  | 'follow_up_engaged'
  | 're_engagement'
  | 'meeting_confirmation'
  | 'meeting_reminder'
  | 'custom';

// Template tone enum
export type TemplateTone = 'conversational' | 'professional' | 'casual' | 'formal';

/**
 * Email Template (business logic type)
 */
export interface EmailTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  use_case: TemplateUseCase | null;
  subject_line: string | null; // Nullable for LinkedIn templates
  body: string;
  channel: TemplateChannel | null;
  linkedin_message_preview: string | null; // Max 300 chars for connection requests
  variables_required: string[]; // JSONB array
  tone: TemplateTone | null;
  variant_id: string | null; // For A/B testing
  is_active: boolean;
  is_system_template: boolean;
  sent_count: number;
  open_rate: number | null;
  reply_rate: number | null;
  meeting_rate: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Zod schema for template personalization request
 */
export const personalizeTemplateRequestSchema = z.object({
  template_id: z.string().uuid(),
  prospect_id: z.string().uuid(),
  channel: z.enum(['linkedin', 'email']).optional(),
});

export type PersonalizeTemplateRequest = z.infer<typeof personalizeTemplateRequestSchema>;

/**
 * Personalized template response
 */
export interface PersonalizedTemplate {
  subject?: string; // Email only
  body: string;
  linkedin_preview?: string; // LinkedIn connection note (max 300 chars)
  variables_used: string[];
  variables_missing: string[];
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  valid: boolean;
  missing: string[];
}

/**
 * Zod schema for creating a template
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  use_case: z.enum([
    'cold_intro',
    'follow_up_no_reply',
    'follow_up_engaged',
    're_engagement',
    'meeting_confirmation',
    'meeting_reminder',
    'custom',
  ]).optional(),
  subject_line: z.string().nullable().optional(),
  body: z.string().min(1),
  channel: z.enum(['linkedin', 'email', 'both']).default('email'),
  linkedin_message_preview: z.string().max(300).nullable().optional(),
  variables_required: z.array(z.string()).default([]),
  tone: z.enum(['conversational', 'professional', 'casual', 'formal']).default('conversational'),
  variant_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

/**
 * Zod schema for updating a template
 */
export const updateTemplateSchema = createTemplateSchema.partial();

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

