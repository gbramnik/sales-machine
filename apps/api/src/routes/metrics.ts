import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { MetricsService } from '../services/MetricsService';

export async function metricsRoutes(server: FastifyInstance) {
  const metricsService = new MetricsService();

  // Get metrics for current user
  server.get('/metrics', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            format: 'date',
            description: 'Date in YYYY-MM-DD format (default: today)',
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const date = (request.query as { date?: string })?.date || new Date().toISOString().split('T')[0];

    try {
      const metrics = await metricsService.getAllMetrics(userId, date);
      return reply.send(metrics);
    } catch (error: any) {
      return reply.code(500).send({
        error: 'Failed to fetch metrics',
        message: error.message,
      });
    }
  });

  // Manual metrics sync (admin only - for Story 1.8 Task 10)
  server.post('/metrics/sync', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    // TODO: Add admin check (for now, any authenticated user can trigger sync)
    // For production, add admin role check

    try {
      // Get all active users
      const users = await metricsService.getActiveUsers();
      let usersProcessed = 0;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // For each user, trigger N8N workflow sync
      // Note: In production, this would trigger the N8N workflow
      // For now, we'll just return the count
      for (const user of users) {
        if (user.google_sheet_id) {
          // In production: Trigger N8N webhook here
          // await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ userId: user.id, date: today }) });
          usersProcessed++;
        }
      }

      return reply.send({
        synced: true,
        users_processed: usersProcessed,
        message: `Metrics sync triggered for ${usersProcessed} users`,
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: 'Failed to sync metrics',
        message: error.message,
      });
    }
  });
}
