import type { Database } from './database.types';

/**
 * VIP-related types for Story 2.2: VIP Mode for High-Value Accounts
 */

// VIP Detection Result
export interface VIPDetectionResult {
  is_vip: boolean;
  reason: string;
  auto_detected: boolean;
}

// VIP Conversion Metrics
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

// VIP Review Metrics
export interface VIPReviewMetrics {
  total_vip_reviews: number;
  approved_vip: number;
  rejected_vip: number;
  approval_rate: number;
  rejection_rate: number;
}

// Prospect with VIP status (extends database type)
export type ProspectRow = Database['public']['Tables']['prospects']['Row'];
export interface ProspectWithVIP extends ProspectRow {
  is_vip: boolean;
  vip_reason: string | null;
}

// Email Template with VIP flag (extends database type)
export type EmailTemplateRow = Database['public']['Tables']['email_templates']['Row'];
export interface EmailTemplateWithVIP extends EmailTemplateRow {
  is_vip_template: boolean | null;
}

