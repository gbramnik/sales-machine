import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { ValidationQueueService } from '../services/ValidationQueueService';
import { z } from 'zod';

// Validation schemas
const approveProspectSchema = z.object({
  prospect_id: z.string().uuid(),
});

const rejectProspectSchema = z.object({
  prospect_id: z.string().uuid(),
});

export async function validationQueueRoutes(fastify: FastifyInstance) {
  const validationQueueService = new ValidationQueueService();

  /**
   * GET /validation-queue
   * Get pending validation queue for authenticated user
   */
  fastify.get(
    '/validation-queue',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const limit = parseInt((request.query as any)?.limit || '50', 10);

      try {
        const queue = await validationQueueService.getPendingQueue(userId, limit);
        return reply.send({
          success: true,
          data: queue,
          count: queue.length,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get validation queue',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /validation-queue/:id/approve
   * Approve prospect and start warm-up
   */
  fastify.post(
    '/validation-queue/:id/approve',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const prospectId = (request.params as any).id;

      try {
        const result = await validationQueueService.approve(prospectId, userId);
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to approve prospect',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /validation-queue/:id/reject
   * Reject prospect
   */
  fastify.post(
    '/validation-queue/:id/reject',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const prospectId = (request.params as any).id;

      try {
        const result = await validationQueueService.reject(prospectId, userId);
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to reject prospect',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}



