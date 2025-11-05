import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from '../lib/supabase';
import { ProspectService } from '../services/ProspectService';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export async function prospectsRoutes(fastify: FastifyInstance) {
  // List prospects with filters
  fastify.get(
    '/',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const prospectService = new ProspectService(supabase);

      const queryParams = request.query as {
        campaignId?: string;
        status?: string;
        isVip?: string;
        search?: string;
        limit?: string;
        offset?: string;
      };

      const filters = {
        campaignId: queryParams.campaignId,
        status: queryParams.status,
        isVip: queryParams.isVip === 'true',
        search: queryParams.search,
        limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
        offset: queryParams.offset ? parseInt(queryParams.offset) : 0,
      };

      const result = await prospectService.listProspects(
        req.user.userId,
        filters
      );

      return reply.send({
        success: true,
        data: result.prospects,
        meta: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    }
  );

  // Get single prospect
  fastify.get(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const prospectService = new ProspectService(supabase);

      const params = request.params as { id: string };
      const prospect = await prospectService.getProspect(
        req.user.userId,
        params.id
      );

      return reply.send({
        success: true,
        data: prospect,
      });
    }
  );

  // Create prospect
  fastify.post(
    '/',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const prospectService = new ProspectService(supabase);

      const prospectData = request.body as any;
      const prospect = await prospectService.createProspect(
        req.user.userId,
        prospectData
      );

      return reply.status(201).send({
        success: true,
        data: prospect,
      });
    }
  );

  // Update prospect
  fastify.patch(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const prospectService = new ProspectService(supabase);

      const params = request.params as { id: string };
      const updates = request.body as any;

      const prospect = await prospectService.updateProspect(
        req.user.userId,
        params.id,
        updates
      );

      return reply.send({
        success: true,
        data: prospect,
      });
    }
  );

  // Delete prospect (GDPR)
  fastify.delete(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const prospectService = new ProspectService(supabase);

      const params = request.params as { id: string };
      await prospectService.deleteProspect(req.user.userId, params.id);

      return reply.status(204).send();
    }
  );
}
