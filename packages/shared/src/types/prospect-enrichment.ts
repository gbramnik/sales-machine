/**
 * Prospect Enrichment TypeScript types
 * Story 1.3: AI-Powered Contextual Enrichment
 */

import { z } from 'zod';
import { ProspectEnrichment, ProspectEnrichmentInsert, ProspectEnrichmentUpdate } from './scraping';

/**
 * Enrichment source enum
 */
export type EnrichmentSource = 'linkedin_only' | 'linkedin_company' | 'linkedin_company_web' | 'full';

/**
 * Zod schema for enrichment source validation
 */
export const EnrichmentSourceSchema = z.enum([
  'linkedin_only',
  'linkedin_company',
  'linkedin_company_web',
  'full',
]);

/**
 * Zod schema for prospect enrichment validation
 */
export const ProspectEnrichmentSchema = z.object({
  id: z.string().uuid().optional(),
  prospect_id: z.string().uuid(),
  user_id: z.string().uuid(),
  talking_points: z.array(z.string()).default([]),
  pain_points: z.array(z.string()).default([]),
  recent_activity: z.string().nullable().optional(),
  company_insights: z.string().nullable().optional(),
  tech_stack: z.array(z.string()).default([]),
  personalization_score: z.number().int().min(0).max(100).nullable().optional(),
  confidence_score: z.number().int().min(0).max(100).nullable().optional(),
  enrichment_source: EnrichmentSourceSchema.nullable().optional(),
  enrichment_version: z.string().default('v1'),
  claude_model_used: z.string().nullable().optional(),
  token_count: z.number().int().min(0).nullable().optional(),
  enriched_at: z.string().datetime().nullable().optional(),
  mutual_connections: z.number().int().min(0).nullable().optional(),
  shared_interests: z.array(z.string()).default([]),
  company_data: z.any().nullable().optional(), // JSONB field
});

/**
 * Zod schema for enrichment insert
 */
export const ProspectEnrichmentInsertSchema = ProspectEnrichmentSchema.omit({
  id: true,
  enriched_at: true,
}).partial({
  enrichment_version: true,
  mutual_connections: true,
  shared_interests: true,
});

/**
 * Zod schema for enrichment update
 */
export const ProspectEnrichmentUpdateSchema = ProspectEnrichmentSchema.partial().omit({
  id: true,
  prospect_id: true,
  user_id: true,
});

/**
 * Type inference from Zod schemas
 */
export type ProspectEnrichmentValidated = z.infer<typeof ProspectEnrichmentSchema>;
export type ProspectEnrichmentInsertValidated = z.infer<typeof ProspectEnrichmentInsertSchema>;
export type ProspectEnrichmentUpdateValidated = z.infer<typeof ProspectEnrichmentUpdateSchema>;

/**
 * Enrichment response from N8N workflow
 */
export interface EnrichmentWorkflowResponse {
  success: boolean;
  execution_id?: string;
  prospect_id: string;
  enrichment_id?: string | null;
  cached: boolean;
  personalization_score?: number;
  requires_approval?: boolean;
}

/**
 * Manual enrichment API response
 */
export interface ManualEnrichmentResponse {
  success: boolean;
  cached: boolean;
  enrichment_id?: string | null;
  execution_id?: string | null;
  message: string;
}

// Re-export database types for convenience
export type {
  ProspectEnrichment,
  ProspectEnrichmentInsert,
  ProspectEnrichmentUpdate,
};

