import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from '../lib/supabase';
import { DashboardService } from '../services/DashboardService';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export async function dashboardRoutes(fastify: FastifyInstance) {
  // Get dashboard stats
  fastify.get(
    '/stats',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const dashboardService = new DashboardService(supabase);

      const stats = await dashboardService.getStats(req.user.userId);

      return reply.send({
        success: true,
        data: stats,
      });
    }
  );

  // Get activity stream
  fastify.get(
    '/activity-stream',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const dashboardService = new DashboardService(supabase);

      const queryParams = request.query as { limit?: string };
      const limit = queryParams.limit ? parseInt(queryParams.limit) : 20;

      const activities = await dashboardService.getActivityStream(
        req.user.userId,
        limit
      );

      return reply.send({
        success: true,
        data: activities,
      });
    }
  );

  // Get pipeline prospects
  fastify.get(
    '/pipeline',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const dashboardService = new DashboardService(supabase);

      const pipeline = await dashboardService.getPipelineProspects(
        req.user.userId
      );

      return reply.send({
        success: true,
        data: pipeline,
      });
    }
  );
}
