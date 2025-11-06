import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { UniPilService } from '../services/UniPilService';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * LinkedIn Messaging API Routes
 * 
 * Internal endpoints for N8N workflow to send LinkedIn messages via UniPil
 */
export async function linkedinRoutes(server: FastifyInstance) {
  // Send LinkedIn message (internal endpoint for N8N)
  server.post(
    '/linkedin/send-message',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);
      const body = request.body as {
        prospect_id: string;
        message: string;
        thread_id?: string;
      };

      try {
        // Verify prospect ownership
        const { data: prospect } = await supabaseAdmin
          .from('prospects')
          .select('id, linkedin_url, list_id')
          .eq('id', body.prospect_id)
          .single();

        if (!prospect) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'Prospect not found',
            404
          );
        }

        // Verify list ownership
        const { data: listData } = await supabaseAdmin
          .from('lists')
          .select('user_id')
          .eq('id', prospect.list_id)
          .eq('user_id', userId)
          .single();

        if (!listData) {
          throw new ApiError(
            ErrorCode.FORBIDDEN,
            'Access denied to this prospect',
            403
          );
        }

        if (!prospect.linkedin_url) {
          throw new ApiError(
            ErrorCode.VALIDATION_ERROR,
            'Prospect has no LinkedIn URL',
            400
          );
        }

        // Send message via UniPil
        const result = await UniPilService.sendMessage(
          prospect.linkedin_url,
          body.message
        );

        return reply.send({
          success: true,
          message_id: result.message_id,
          status: result.success ? 'sent' : 'failed',
        });
      } catch (error: any) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to send LinkedIn message',
          details: error?.message || 'Unknown error',
        });
      }
    }
  );
}



