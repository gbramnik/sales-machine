import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { emailQueueService } from '../services/email-queue.service';

/**
 * Email Queue API Routes
 * 
 * Internal endpoints for N8N workflow to manage email queue
 */

export async function emailQueueRoutes(server: FastifyInstance) {
  // Dequeue emails from Redis (for N8N scheduler)
  server.post(
    '/email-queue/dequeue',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as { limit?: number; user_id?: string };

      const limit = body.limit || 20;
      // Use provided user_id or authenticated user's ID
      const targetUserId = body.user_id || userId;

      const emails = await emailQueueService.dequeue(targetUserId, limit);

      // Enrich with prospect emails
      const { supabaseAdmin } = await import('../lib/supabase');
      const enrichedEmails = await Promise.all(
        (emails || []).map(async (email) => {
          const { data: prospect } = await supabaseAdmin
            .from('prospects')
            .select('email')
            .eq('id', email.prospect_id)
            .single();

          return {
            ...email,
            prospect_email: prospect?.email || '',
          };
        })
      );

      return reply.send({
        success: true,
        data: enrichedEmails || [],
        count: enrichedEmails?.length || 0,
      });
    }
  );

  // Get queue size
  server.get(
    '/email-queue/size',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      const size = await emailQueueService.getQueueSize(userId);

      return reply.send({
        success: true,
        size,
      });
    }
  );

  // Get queue position for prospect
  server.get(
    '/email-queue/position/:prospect_id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { prospect_id } = request.params as { prospect_id: string };

      const position = await emailQueueService.getQueuePosition(userId, prospect_id);

      if (position === null) {
        return reply.code(404).send({
          success: false,
          error: 'Email not found in queue',
        });
      }

      return reply.send({
        success: true,
        position,
      });
    }
  );
}

