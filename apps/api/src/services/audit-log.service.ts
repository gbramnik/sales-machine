import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types';
import { FastifyRequest } from 'fastify';

/**
 * Audit Log Service
 * 
 * Handles audit logging for GDPR compliance and security tracking.
 * Logs all prospect data access and modifications.
 */
export class AuditLogService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Log prospect access
   */
  async logProspectAccess(
    userId: string,
    prospectId: string,
    action: 'prospect_viewed' | 'prospect_updated' | 'prospect_created' | 'prospect_deleted' | 'prospect_enrichment_accessed' | 'prospect_enrichment_created',
    request?: FastifyRequest
  ): Promise<void> {
    try {
      await this.supabase.from('audit_log').insert({
        user_id: userId,
        event_type: action,
        entity_type: 'prospect',
        entity_id: prospectId,
        ip_address: request?.ip || request?.headers['x-forwarded-for'] || undefined,
        user_agent: request?.headers['user-agent'] || undefined,
        performed_by: userId,
      });
    } catch (error) {
      console.warn('Failed to log prospect access:', error);
      // Continue - audit log failure is not critical for operation
    }
  }

  /**
   * Log prospect update with old and new values
   */
  async logProspectUpdate(
    userId: string,
    prospectId: string,
    oldValues: any,
    newValues: any,
    request?: FastifyRequest
  ): Promise<void> {
    try {
      await this.supabase.from('audit_log').insert({
        user_id: userId,
        event_type: 'prospect_updated',
        entity_type: 'prospect',
        entity_id: prospectId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: request?.ip || request?.headers['x-forwarded-for'] || undefined,
        user_agent: request?.headers['user-agent'] || undefined,
        performed_by: userId,
      });
    } catch (error) {
      console.warn('Failed to log prospect update:', error);
      // Continue - audit log failure is not critical for operation
    }
  }
}

