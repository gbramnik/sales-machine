import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { ExclusionService } from '../services/ExclusionService';

export async function exclusionRoutes(fastify: FastifyInstance) {
  const exclusionService = new ExclusionService();

  /**
   * GET /api/exclusion/excluded-urls
   * Get excluded LinkedIn URLs for authenticated user
   */
  fastify.get(
    '/api/exclusion/excluded-urls',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const excludedUrls = await exclusionService.getExcludedProspectUrls(userId);
        return reply.send({
          success: true,
          excluded_urls: excludedUrls,
          count: excludedUrls.length,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get excluded URLs',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /api/exclusion/clear-cache
   * Clear exclusion cache for authenticated user (admin/debug)
   */
  fastify.post(
    '/api/exclusion/clear-cache',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        await exclusionService.clearCache(userId);
        return reply.send({
          success: true,
          message: 'Cache cleared successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to clear cache',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}


