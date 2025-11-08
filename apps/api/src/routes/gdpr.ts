import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from '../lib/supabase';
import { GDPRService } from '../services/gdpr.service';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { ApiError, ErrorCode } from '../types';

export async function gdprRoutes(fastify: FastifyInstance) {
  // GDPR Data Deletion Endpoint
  fastify.delete(
    '/prospects/:prospect_id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const gdprService = new GDPRService(supabase);

      const params = request.params as { prospect_id: string };

      try {
        await gdprService.deleteProspectData(
          params.prospect_id,
          req.user.userId
        );

        return reply.send({
          success: true,
          message: 'Prospect data deleted successfully',
        });
      } catch (error) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        return reply.status(500).send({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Failed to delete prospect data',
          },
        });
      }
    }
  );

  // GDPR Data Export Endpoint
  fastify.get(
    '/users/me/data',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const gdprService = new GDPRService(supabase);

      try {
        const exportData = await gdprService.exportUserData(req.user.userId);

        // Set headers for file download
        const filename = `user-data-export-${req.user.userId}-${Date.now()}.json`;
        reply.header('Content-Type', 'application/json');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);

        return reply.send(exportData);
      } catch (error) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        return reply.status(500).send({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Failed to export user data',
          },
        });
      }
    }
  );

  // Consent Update Endpoint
  fastify.post(
    '/prospects/:id/consent',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );

      const params = request.params as { id: string };
      const body = request.body as {
        consent_given: boolean;
        consent_source: string;
      };

      // Validate request body
      if (typeof body.consent_given !== 'boolean') {
        return reply.status(400).send({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'consent_given must be a boolean',
          },
        });
      }

      if (!body.consent_source) {
        return reply.status(400).send({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'consent_source is required',
          },
        });
      }

      // Update prospect consent
      const updateData: any = {
        consent_given: body.consent_given,
        consent_source: body.consent_source,
      };

      if (body.consent_given) {
        updateData.consent_date = new Date().toISOString();
      } else {
        updateData.consent_date = null;
      }

      const { data, error } = await supabase
        .from('prospects')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', req.user.userId)
        .select()
        .single();

      if (error) {
        return reply.status(500).send({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Failed to update consent',
          },
        });
      }

      if (!data) {
        return reply.status(404).send({
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Prospect not found',
          },
        });
      }

      // Log consent change in audit_log
      try {
        await supabase.from('audit_log').insert({
          user_id: req.user.userId,
          event_type: 'consent_updated',
          entity_type: 'prospect',
          entity_id: params.id,
          new_values: {
            consent_given: body.consent_given,
            consent_source: body.consent_source,
            consent_date: updateData.consent_date,
          },
          performed_by: req.user.userId,
        });
      } catch (error) {
        console.warn('Failed to log consent update in audit_log:', error);
        // Continue - audit log failure is not critical
      }

      return reply.send({
        success: true,
        data,
      });
    }
  );
}



