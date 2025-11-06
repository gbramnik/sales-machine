import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TopicBlacklistService } from '../services/TopicBlacklistService';
import { FactCheckService } from '../services/FactCheckService';
import { createSupabaseClient, supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../types';

/**
 * Fact-Check API Routes
 * 
 * Endpoints for blacklist management and fact-checking
 */
export async function factCheckRoutes(fastify: FastifyInstance) {
  // Get blacklist phrases
  fastify.get(
    '/blacklist',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const blacklistService = new TopicBlacklistService(supabase);

      const queryParams = request.query as { category?: string };
      const category = queryParams.category as
        | 'pricing'
        | 'guarantee'
        | 'competitor'
        | 'unverified_claim'
        | undefined;

      const blacklist = await blacklistService.getBlacklist(
        req.user.userId,
        category
      );

      // Group by category
      const byCategory = {
        pricing: blacklist.filter(p => p.category === 'pricing'),
        guarantee: blacklist.filter(p => p.category === 'guarantee'),
        competitor: blacklist.filter(p => p.category === 'competitor'),
        unverified_claim: blacklist.filter(p => p.category === 'unverified_claim'),
      };

      return reply.send({
        success: true,
        data: {
          phrases: blacklist,
          categories: byCategory,
        },
      });
    }
  );

  // Add blacklist phrase
  fastify.post(
    '/blacklist',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const blacklistService = new TopicBlacklistService(supabase);

      const addPhraseSchema = z.object({
        category: z.enum(['pricing', 'guarantee', 'competitor', 'unverified_claim']),
        phrase: z.string().min(1).max(200),
        severity: z.enum(['block', 'warning', 'review']).default('block').optional(),
      });

      const body = request.body as any;
      const validationResult = addPhraseSchema.safeParse(body);

      if (!validationResult.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          validationResult.error.errors
        );
      }

      const { category, phrase, severity } = validationResult.data;
      const result = await blacklistService.addBlacklistPhrase(
        req.user.userId,
        category,
        phrase,
        severity || 'block'
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Remove blacklist phrase
  fastify.delete(
    '/blacklist/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const blacklistService = new TopicBlacklistService(supabase);

      const params = request.params as { id: string };
      await blacklistService.removeBlacklistPhrase(req.user.userId, params.id);

      return reply.send({
        success: true,
        message: 'Phrase removed',
      });
    }
  );

  // Check message for blacklisted content (for N8N workflow)
  fastify.post(
    '/check',
    async (request, reply) => {
      // Service token authentication for N8N
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;

      if (!authHeader || authHeader !== `Bearer ${serviceToken}`) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          'Invalid service token',
          401
        );
      }

      const checkSchema = z.object({
        message: z.string().min(1),
        user_id: z.string().uuid(),
      });

      const body = request.body as any;
      const validationResult = checkSchema.safeParse(body);

      if (!validationResult.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          validationResult.error.errors
        );
      }

      const { message, user_id } = validationResult.data;
      const factCheckService = new FactCheckService(supabaseAdmin);
      const result = await factCheckService.detectBlacklistedContent(message, user_id);

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Verify claims against enrichment data (for N8N workflow)
  fastify.post(
    '/verify',
    async (request, reply) => {
      // Service token authentication
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;

      if (!authHeader || authHeader !== `Bearer ${serviceToken}`) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          'Invalid service token',
          401
        );
      }

      const verifySchema = z.object({
        claims: z.array(z.string()),
        prospect_id: z.string().uuid(),
        user_id: z.string().uuid(),
      });

      const body = request.body as any;
      const validationResult = verifySchema.safeParse(body);

      if (!validationResult.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          validationResult.error.errors
        );
      }

      const { claims, prospect_id, user_id } = validationResult.data;
      const factCheckService = new FactCheckService(supabaseAdmin);
      const result = await factCheckService.verifyClaimsAgainstEnrichment(
        claims,
        prospect_id,
        user_id
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Track violation (for N8N workflow)
  fastify.post(
    '/track-violation',
    async (request, reply) => {
      // Service token authentication
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;

      if (!authHeader || authHeader !== `Bearer ${serviceToken}`) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          'Invalid service token',
          401
        );
      }

      const trackSchema = z.object({
        user_id: z.string().uuid(),
        prospect_id: z.string().uuid(),
        category: z.string(),
      });

      const body = request.body as any;
      const validationResult = trackSchema.safeParse(body);

      if (!validationResult.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          validationResult.error.errors
        );
      }

      const { user_id, prospect_id, category } = validationResult.data;
      const factCheckService = new FactCheckService(supabaseAdmin);
      const result = await factCheckService.trackViolation(
        user_id,
        prospect_id,
        category
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );
}

