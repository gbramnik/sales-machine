import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { emailSendingLimitService } from '../services/email-sending-limit.service';

/**
 * Email Sending Limit API Routes
 * 
 * Internal endpoints for N8N workflow to manage sending limits
 */

export async function emailSendingLimitRoutes(server: FastifyInstance) {
  // Check if limit reached
  server.get(
    '/email-sending-limit/check',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const query = request.query as { sending_email: string };

      if (!query.sending_email) {
        return reply.code(400).send({
          success: false,
          error: 'sending_email parameter required',
        });
      }

      const isReached = await emailSendingLimitService.isLimitReached(
        userId,
        query.sending_email
      );
      const count = await emailSendingLimitService.getDailyCount(
        userId,
        query.sending_email
      );
      const remaining = await emailSendingLimitService.getRemainingCount(
        userId,
        query.sending_email
      );

      return reply.send({
        success: true,
        is_reached: isReached,
        count,
        remaining,
        limit: 20,
      });
    }
  );

  // Increment sending counter
  server.post(
    '/email-sending-limit/increment',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as { sending_email: string; user_id?: string };

      if (!body.sending_email) {
        return reply.code(400).send({
          success: false,
          error: 'sending_email required',
        });
      }

      // Use provided user_id or authenticated user's ID
      const targetUserId = body.user_id || userId;

      const newCount = await emailSendingLimitService.incrementCount(
        targetUserId,
        body.sending_email
      );

      return reply.send({
        success: true,
        count: newCount,
        limit: 20,
        remaining: Math.max(0, 20 - newCount),
      });
    }
  );
}

