import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { TopicBlacklistService } from './TopicBlacklistService';

/**
 * Blacklist Detection Result
 */
export interface BlacklistDetectionResult {
  detected: boolean;
  violations: Array<{
    category: string;
    phrase: string;
    severity: 'block' | 'warning' | 'review';
    matched_text: string;
  }>;
  severity: 'block' | 'warning' | 'review';
}

/**
 * Fact Verification Result
 */
export interface FactVerificationResult {
  verified_claims: string[];
  unverified_claims: Array<{
    claim: string;
    reason: string;
  }>;
  all_verified: boolean;
}

/**
 * Warning Status
 */
export interface WarningStatus {
  escalated: boolean;
  violation_count: number;
  message?: string;
}

/**
 * Fact Check Service
 * 
 * Detects blacklisted content, extracts claims, verifies facts against enrichment data,
 * and tracks violations for escalation.
 */
export class FactCheckService {
  private blacklistService: TopicBlacklistService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.blacklistService = new TopicBlacklistService(supabase);
  }

  /**
   * Detect blacklisted content in a message
   * @param message - The message to check
   * @param userId - The user ID
   * @returns Detection result with violations
   */
  async detectBlacklistedContent(
    message: string,
    userId: string
  ): Promise<BlacklistDetectionResult> {
    // Get blacklist phrases for user
    const blacklist = await this.blacklistService.getBlacklist(userId);

    const violations: BlacklistDetectionResult['violations'] = [];
    let maxSeverity: 'block' | 'warning' | 'review' = 'review';

    // Check each blacklisted phrase
    for (const phrase of blacklist) {
      let regex: RegExp;

      if (phrase.regex_pattern) {
        // Use custom regex pattern
        try {
          regex = new RegExp(phrase.regex_pattern, 'gi');
        } catch (error) {
          // Invalid regex, skip this phrase
          console.error(`Invalid regex pattern for phrase ${phrase.phrase}:`, error);
          continue;
        }
      } else {
        // Build regex from phrase (word boundaries for short phrases, simple match for longer)
        const escapedPhrase = phrase.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (phrase.phrase.length <= 4) {
          // Short phrases: match as whole word or with punctuation
          regex = new RegExp(`(^|[^a-z])${escapedPhrase}([^a-z]|$)`, 'gi');
        } else {
          // Longer phrases: use word boundaries
          regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
        }
      }

      // Test message against regex
      const matches = message.match(regex);
      if (matches && matches.length > 0) {
        violations.push({
          category: phrase.category,
          phrase: phrase.phrase,
          severity: phrase.severity,
          matched_text: matches[0].trim(),
        });

        // Update max severity (block > warning > review)
        if (phrase.severity === 'block') {
          maxSeverity = 'block';
        } else if (phrase.severity === 'warning' && maxSeverity !== 'block') {
          maxSeverity = 'warning';
        }
      }
    }

    return {
      detected: violations.length > 0,
      violations,
      severity: maxSeverity,
    };
  }

  /**
   * Extract factual claims from a message
   * @param message - The message to analyze
   * @returns Array of extracted claims (normalized)
   */
  extractClaims(message: string): string[] {
    const claims: string[] = [];

    // Claim patterns (case-insensitive)
    const patterns = [
      // Funding claims
      /(?:recent|just|latest|new).*funding/gi,
      /raised.*\$?[\d,]+/gi,
      /funding.*round/gi,
      /series [a-z]/gi,
      
      // Product claims
      /(?:new|recent|just|latest).*product/gi,
      /launched.*product/gi,
      /product.*launch/gi,
      
      // Expansion claims
      /(?:expanding|expansion|growing|growth|opening|new.*office)/gi,
      
      // News claims
      /(?:recent|just|latest).*news/gi,
      /announced/gi,
      /acquisition/gi,
      /merger/gi,
    ];

    // Extract matches
    for (const pattern of patterns) {
      const matches = message.match(pattern);
      if (matches) {
        claims.push(...matches.map(m => m.toLowerCase().trim()));
      }
    }

    // Return unique claims
    return Array.from(new Set(claims));
  }

  /**
   * Verify claims against enrichment data
   * @param claims - Array of claims to verify
   * @param prospectId - The prospect ID
   * @param userId - The user ID
   * @returns Verification result
   */
  async verifyClaimsAgainstEnrichment(
    claims: string[],
    prospectId: string,
    userId: string
  ): Promise<FactVerificationResult> {
    if (claims.length === 0) {
      return {
        verified_claims: [],
        unverified_claims: [],
        all_verified: true,
      };
    }

    // Get enrichment data
    const { data: enrichment, error } = await this.supabase
      .from('prospect_enrichment')
      .select('talking_points, company_data, recent_activity, company_insights')
      .eq('prospect_id', prospectId)
      .eq('user_id', userId)
      .single();

    if (error || !enrichment) {
      // No enrichment data - mark all claims as unverified
      return {
        verified_claims: [],
        unverified_claims: claims.map(claim => ({
          claim,
          reason: 'No enrichment data available for verification',
        })),
        all_verified: false,
      };
    }

    const verified: string[] = [];
    const unverified: Array<{ claim: string; reason: string }> = [];

    // Check each claim against enrichment data
    const enrichmentData = enrichment as any;
    
    for (const claim of claims) {
      let found = false;

      // Check talking_points (array)
      if (enrichmentData.talking_points && Array.isArray(enrichmentData.talking_points)) {
        const foundInTalkingPoints = enrichmentData.talking_points.some((tp: string) =>
          tp.toLowerCase().includes(claim)
        );
        if (foundInTalkingPoints) {
          found = true;
        }
      }

      // Check company_data (JSONB)
      if (!found && enrichmentData.company_data) {
        const companyData = enrichmentData.company_data;
        const searchText = JSON.stringify(companyData).toLowerCase();
        if (searchText.includes(claim)) {
          found = true;
        }
      }

      // Check recent_activity (text)
      if (!found && enrichmentData.recent_activity) {
        if (enrichmentData.recent_activity.toLowerCase().includes(claim)) {
          found = true;
        }
      }

      // Check company_insights (text)
      if (!found && enrichmentData.company_insights) {
        if (enrichmentData.company_insights.toLowerCase().includes(claim)) {
          found = true;
        }
      }

      if (found) {
        verified.push(claim);
      } else {
        unverified.push({
          claim,
          reason: `Claim not found in enrichment data (checked: talking_points, company_data, recent_activity, company_insights)`,
        });
      }
    }

    return {
      verified_claims: verified,
      unverified_claims: unverified,
      all_verified: unverified.length === 0,
    };
  }

  /**
   * Track violation and check for escalation (3+ violations)
   * @param userId - The user ID
   * @param prospectId - The prospect ID
   * @param category - The violation category
   * @returns Warning status
   */
  async trackViolation(
    userId: string,
    prospectId: string,
    category: string
  ): Promise<WarningStatus> {
    // Check if warning exists
    const { data: existingWarning, error: fetchError } = await this.supabase
      .from('blacklist_warnings')
      .select('*')
      .eq('user_id', userId)
      .eq('prospect_id', prospectId)
      .eq('violation_category', category)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "not found"
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch warning',
        500,
        fetchError
      );
    }

    let violationCount: number;
    let escalated = false;

    if (existingWarning) {
      // Increment count
      violationCount = existingWarning.violation_count + 1;
      
      // Check threshold
      if (violationCount >= 3 && !existingWarning.escalated) {
        escalated = true;
      }

      // Update warning
      const { error: updateError } = await this.supabase
        .from('blacklist_warnings')
        .update({
          violation_count: violationCount,
          last_violation_at: new Date().toISOString(),
          escalated: escalated || existingWarning.escalated,
          escalated_at: escalated ? new Date().toISOString() : existingWarning.escalated_at,
        })
        .eq('id', existingWarning.id);

      if (updateError) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to update warning',
          500,
          updateError
        );
      }
    } else {
      // Create new warning
      violationCount = 1;
      const { error: insertError } = await this.supabase
        .from('blacklist_warnings')
        .insert({
          user_id: userId,
          prospect_id: prospectId,
          violation_category: category,
          violation_count: 1,
        });

      if (insertError) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to create warning',
          500,
          insertError
        );
      }
    }

    return {
      escalated,
      violation_count: violationCount,
      message: escalated
        ? `AI attempted blacklisted topic ${violationCount} times for this prospect. Manual review required.`
        : undefined,
    };
  }
}

