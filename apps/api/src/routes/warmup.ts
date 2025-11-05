import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { WarmupService } from '../services/WarmupService';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { ApiError, ErrorCode } from '../types';

// Validation schemas
const warmupConfigSchema = z.object({
  warmup_duration_days: z.number().int().min(7).max(15).optional(),
  daily_likes_limit: z.number().int().min(20).max(40).optional(),
  daily_comments_limit: z.number().int().min(20).max(40).optional(),
  account_type: z.enum(['basic', 'sales_navigator']).optional(),
});

export async function warmupRoutes(server: FastifyInstance) {
  const warmupService = new WarmupService(supabase);

  // GET /warmup/config - Get warm-up configuration
  server.get('/config', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);
    const config = await warmupService.getWarmupConfig(userId);

    return reply.send({
      success: true,
      data: config,
    });
  });

  // POST /warmup/config - Update warm-up configuration
  server.post('/config', {
    preHandler: requireAuth,
    schema: {
      body: warmupConfigSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const body = warmupConfigSchema.parse(request.body);

    // Update user's warm-up config
    const { data: user, error } = await supabase
      .from('users')
      .update({
        warmup_duration_days: body.warmup_duration_days,
        daily_likes_limit: body.daily_likes_limit,
        daily_comments_limit: body.daily_comments_limit,
        account_type: body.account_type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('warmup_duration_days, daily_likes_limit, daily_comments_limit, account_type')
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to update warm-up configuration',
        500,
        error
      );
    }

    const config = await warmupService.getWarmupConfig(userId);

    return reply.send({
      success: true,
      data: config,
    });
  });

  // POST /warmup/start/:prospectId - Start warm-up for a prospect
  server.post('/start/:prospectId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          prospectId: { type: 'string', format: 'uuid' },
        },
        required: ['prospectId'],
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { prospectId } = request.params as { prospectId: string };

    // Verify prospect belongs to user
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id')
      .eq('id', prospectId)
      .eq('user_id', userId)
      .single();

    if (!prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }

    const result = await warmupService.startWarmup(prospectId, userId);

    return reply.send({
      success: true,
      data: result,
    });
  });

  // GET /warmup/status/:prospectId - Get warm-up status for a prospect
  server.get('/status/:prospectId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          prospectId: { type: 'string', format: 'uuid' },
        },
        required: ['prospectId'],
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { prospectId } = request.params as { prospectId: string };

    const status = await warmupService.getWarmupStatus(prospectId, userId);

    return reply.send({
      success: true,
      data: status,
    });
  });

  // GET /warmup/actions/:prospectId - Get warm-up actions for a prospect
  server.get('/actions/:prospectId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          prospectId: { type: 'string', format: 'uuid' },
        },
        required: ['prospectId'],
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { prospectId } = request.params as { prospectId: string };
    const { limit = 50, offset = 0 } = request.query as { limit?: number; offset?: number };

    const { data, error, count } = await supabase
      .from('linkedin_warmup_actions')
      .select('*', { count: 'exact' })
      .eq('prospect_id', prospectId)
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch warm-up actions',
        500,
        error
      );
    }

    return reply.send({
      success: true,
      data: {
        actions: data || [],
        total: count || 0,
        limit,
        offset,
      },
    });
  });

  // GET /warmup/prospects - List prospects in warm-up
  server.get('/prospects', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['warmup_in_progress', 'ready_for_connection', 'completed', 'skipped'],
          },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { status, limit = 20, offset = 0 } = request.query as {
      status?: string;
      limit?: number;
      offset?: number;
    };

    let query = supabase
      .from('linkedin_warmup_schedule')
      .select(`
        *,
        prospect:prospects(
          id,
          full_name,
          job_title,
          company_name,
          linkedin_url,
          status
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('connection_ready_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch warm-up prospects',
        500,
        error
      );
    }

    return reply.send({
      success: true,
      data: {
        schedules: data || [],
        total: count || 0,
        limit,
        offset,
      },
    });
  });
}

