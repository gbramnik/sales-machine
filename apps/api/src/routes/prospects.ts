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

  // Manual trigger for prospect detection
  fastify.post(
    '/trigger-detection',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const { Redis } = await import('@upstash/redis');

      // Rate limiting: max 1 manual trigger per day
      const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.UPSTASH_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

      if (redisUrl && redisToken) {
        const redis = new Redis({ url: redisUrl, token: redisToken });
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `manual_detection:${userId}:${today}`;

        const existing = await redis.get(cacheKey);
        if (existing) {
          return reply.status(429).send({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Only 1 manual trigger per day allowed',
          });
        }

        // Set counter for 24 hours
        await redis.set(cacheKey, '1', { ex: 86400 });
      }

      // Trigger N8N workflow
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv997159.hstgr.cloud/webhook';
      const webhookUrl = `${n8nWebhookUrl}/daily-detection/manual`;

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN || process.env.API_SERVICE_TOKEN || ''}`,
          },
          body: JSON.stringify({
            user_id: userId,
            triggered_by: 'manual',
          }),
        });

        if (!response.ok) {
          throw new Error(`N8N webhook failed: ${response.statusText}`);
        }

        return reply.send({
          success: true,
          message: 'Detection triggered successfully',
        });
      } catch (error) {
        fastify.log.error('Failed to trigger detection:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to trigger detection',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}
