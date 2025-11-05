/**
 * Scraping-related TypeScript types
 * Story 1.2: LinkedIn Profile Scraping Workflow
 */

import { Database } from './database';

// Database table types
export type Prospect = Database['public']['Tables']['prospects']['Row'];
export type ProspectInsert = Database['public']['Tables']['prospects']['Insert'];
export type ProspectUpdate = Database['public']['Tables']['prospects']['Update'];

export type ProspectEnrichment = Database['public']['Tables']['prospect_enrichment']['Row'];
export type ProspectEnrichmentInsert = Database['public']['Tables']['prospect_enrichment']['Insert'];
export type ProspectEnrichmentUpdate = Database['public']['Tables']['prospect_enrichment']['Update'];

// Company data structure (stored in prospect_enrichment.company_data JSONB)
export interface CompanyData {
  linkedin_url?: string;
  description?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  website_url?: string;
  website_description?: string;
  products_services?: string[];
  recent_news?: Array<{
    title: string;
    date?: string;
    url?: string;
  }>;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

// Scraping request parameters
export interface ScrapingParams {
  industry?: string;
  location?: string;
  job_title?: string;
  company_size?: string;
  user_id: string;
  campaign_id: string;
}

// Scraping response
export interface ScrapingResponse {
  success: boolean;
  execution_id?: string;
  validated_count: number;
  rejected_count: number;
  total_profiles: number;
  warmup_started: number;
  error?: string;
}

// Prospect validation result
export interface ProspectValidationResult {
  validated: ValidatedProspect[];
  rejected: RejectedProspect[];
  total: number;
  validatedCount: number;
  rejectedCount: number;
}

export interface ValidatedProspect {
  full_name: string;
  company_name: string;
  job_title: string;
  linkedin_url: string;
  location?: string;
  profile_summary?: string;
  email?: string | null;
  phone?: string | null;
  company_linkedin_url?: string | null;
}

export interface RejectedProspect {
  profile: any;
  reason: 'missing_name' | 'missing_company' | 'missing_job_title';
}

// Scraping execution metrics
export interface ScrapingExecutionMetrics {
  execution_id: string;
  user_id: string;
  campaign_id: string;
  profiles_scraped: number;
  profiles_validated: number;
  profiles_rejected: number;
  companies_enriched: number;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
  cost_estimate_eur?: number; // 5€/compte LinkedIn/month
  created_at: string;
}

// Rate limit info
export interface ScrapingRateLimitInfo {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetAt: Date;
}

