import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { aiQualificationService, QualificationContext } from '../services/ai-qualification.service';
import { requireAuth, getUserId } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * AI Qualification API Routes
 * 
 * Internal endpoint for N8N workflow to call Claude API for prospect qualification
 */
export async function aiQualificationRoutes(server: FastifyInstance) {
  // Qualify prospect (internal endpoint for N8N)
  server.post(
    '/ai/qualify',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = getUserId(request);
      const body = request.body as QualificationContext & { prospect_id: string; user_id: string };

      try {
        // Verify prospect ownership
        const { data: prospect } = await supabaseAdmin
          .from('prospects')
          .select('id, list_id')
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

        // Build qualification context
        const context: QualificationContext = {
          prospect: body.prospect,
          enrichment: body.enrichment,
          thread_history: body.thread_history || [],
          reply_text: body.reply_text,
          channel: body.channel,
          sentiment: body.sentiment,
        };

        // Call AI qualification service
        const result = await aiQualificationService.qualifyProspect(context);

        return reply.send({
          success: true,
          data: result,
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
          error: 'Failed to qualify prospect',
          details: error?.message || 'Unknown error',
        });
      }
    }
  );
}


