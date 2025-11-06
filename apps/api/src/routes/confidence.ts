import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { ConfidenceService } from '../services/ConfidenceService';

export async function confidenceRoutes(fastify: FastifyInstance) {
  const confidenceService = new ConfidenceService();

  /**
   * GET /api/confidence/threshold
   * Get confidence threshold for authenticated user or specified user_id (for N8N)
   */
  fastify.get(
    '/api/confidence/threshold',
    async (request, reply) => {
      // Support both authenticated user and service token (for N8N)
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;
      const queryParams = request.query as { user_id?: string };

      let userId: string | null = null;

      // Check if service token is provided (for N8N workflow)
      if (serviceToken && authHeader === `Bearer ${serviceToken}`) {
        userId = queryParams.user_id || null;
        if (!userId) {
          return reply.status(400).send({
            success: false,
            error: 'user_id query parameter required when using service token',
          });
        }
      } else {
        // Use authenticated user
        try {
          requireAuth(request, reply, () => {});
          userId = getUserId(request);
        } catch (error) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }
      }

      if (!userId) {
        return reply.status(400).send({
          success: false,
          error: 'user_id required',
        });
      }

      try {
        const threshold = await confidenceService.getConfidenceThreshold(userId);
        return reply.send({
          success: true,
          data: { threshold },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get confidence threshold',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}

