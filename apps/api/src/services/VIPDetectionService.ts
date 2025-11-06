import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

/**
 * VIP Detection Service
 * 
 * Handles automatic VIP detection from job titles and manual VIP marking/unmarking.
 */
export class VIPDetectionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * C-level keywords for automatic VIP detection
   */
  private readonly VIP_KEYWORDS = [
    'ceo',
    'cto',
    'cmo',
    'cfo',
    'coo',
    'president',
    'founder',
    'founder & ceo',
    'co-founder',
  ];

  /**
   * Detect if a job title indicates a VIP (C-level executive)
   * @param jobTitle - The job title to check
   * @returns true if job title matches C-level keywords, false otherwise
   */
  detectVIPFromJobTitle(jobTitle: string | null): boolean {
    if (!jobTitle) {
      return false;
    }

    const lowerTitle = jobTitle.toLowerCase();
    // Use word boundaries to avoid false positives (e.g., "director" containing "cto")
    return this.VIP_KEYWORDS.some(keyword => {
      // For short keywords (like "ceo", "cto"), also check as standalone or with punctuation
      // For longer keywords, use word boundaries
      if (keyword.length <= 4) {
        // Short acronyms: match as whole word or with punctuation
        const regex = new RegExp(`(^|[^a-z])${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i');
        return regex.test(lowerTitle);
      } else {
        // Longer keywords: use word boundaries
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerTitle);
      }
    });
  }

  /**
   * Mark a prospect as VIP
   * @param prospectId - The prospect ID to mark as VIP
   * @param userId - The user ID (for RLS)
   * @param reason - Reason for marking as VIP
   * @param autoDetected - Whether this was auto-detected (default: false)
   * @returns VIP marking result
   */
  async markAsVIP(
    prospectId: string,
    userId: string,
    reason: string,
    autoDetected: boolean = false
  ): Promise<{
    success: true;
    prospect_id: string;
    is_vip: boolean;
    vip_reason: string;
  }> {
    // Update prospect
    const { data: prospect, error: prospectError } = await this.supabase
      .from('prospects')
      .update({
        is_vip: true,
        vip_reason: reason,
      })
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found or update failed',
        404,
        prospectError
      );
    }

    // Log to audit_log
    const { error: auditError } = await this.supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        event_type: 'prospect_marked_vip',
        entity_type: 'prospect',
        entity_id: prospectId,
        new_values: {
          reason,
          auto_detected: autoDetected,
        } as any,
      });

    if (auditError) {
      // Log error but don't fail the operation
      console.error('Failed to log VIP marking to audit_log:', auditError);
    }

    return {
      success: true,
      prospect_id: prospectId,
      is_vip: true,
      vip_reason: reason,
    };
  }

  /**
   * Unmark a prospect as VIP
   * @param prospectId - The prospect ID to unmark as VIP
   * @param userId - The user ID (for RLS)
   * @returns Unmarking result
   */
  async unmarkAsVIP(
    prospectId: string,
    userId: string
  ): Promise<{
    success: true;
    prospect_id: string;
    is_vip: boolean;
  }> {
    // Update prospect
    const { data: prospect, error: prospectError } = await this.supabase
      .from('prospects')
      .update({
        is_vip: false,
        vip_reason: null,
      })
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found or update failed',
        404,
        prospectError
      );
    }

    // Log to audit_log
    const { error: auditError } = await this.supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        event_type: 'prospect_unmarked_vip',
        entity_type: 'prospect',
        entity_id: prospectId,
        new_values: {} as any,
      });

    if (auditError) {
      // Log error but don't fail the operation
      console.error('Failed to log VIP unmarking to audit_log:', auditError);
    }

    return {
      success: true,
      prospect_id: prospectId,
      is_vip: false,
    };
  }
}

