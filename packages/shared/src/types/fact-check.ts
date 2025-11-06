import type { Database } from './database.types';

/**
 * Fact-Checking & Blacklist types for Story 2.3: Fact-Checking & Topic Blacklist
 */

// Blacklist Detection Result
export interface BlacklistDetectionResult {
  detected: boolean;
  violations: BlacklistViolation[];
  severity: 'block' | 'warning' | 'review';
}

// Blacklist Violation
export interface BlacklistViolation {
  category: string;
  phrase: string;
  severity: 'block' | 'warning' | 'review';
  matched_text: string;
}

// Fact Verification Result
export interface FactVerificationResult {
  verified_claims: string[];
  unverified_claims: UnverifiedClaim[];
  all_verified: boolean;
}

// Unverified Claim
export interface UnverifiedClaim {
  claim: string;
  reason: string;
}

// Warning Status
export interface WarningStatus {
  escalated: boolean;
  violation_count: number;
  message?: string;
}

// Topic Blacklist Row (from database)
export type TopicBlacklistRow = Database['public']['Tables']['topic_blacklist']['Row'];
export type TopicBlacklistInsert = Database['public']['Tables']['topic_blacklist']['Insert'];
export type TopicBlacklistUpdate = Database['public']['Tables']['topic_blacklist']['Update'];

// Blacklist Incident Row (from database)
export type BlacklistIncidentRow = Database['public']['Tables']['blacklist_incidents']['Row'];
export type BlacklistIncidentInsert = Database['public']['Tables']['blacklist_incidents']['Insert'];

// Blacklist Warning Row (from database)
export type BlacklistWarningRow = Database['public']['Tables']['blacklist_warnings']['Row'];
export type BlacklistWarningInsert = Database['public']['Tables']['blacklist_warnings']['Insert'];
export type BlacklistWarningUpdate = Database['public']['Tables']['blacklist_warnings']['Update'];

