import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSupabaseClient } from '../lib/supabase';
import { HumannessTestService } from '../services/HumannessTestService';
import { HumannessTestMessageService } from '../services/HumannessTestMessageService';
import { HumannessTestAnalyticsService } from '../services/HumannessTestAnalyticsService';
import { HumannessStrategyService } from '../services/HumannessStrategyService';
import { HumannessResponseRateService } from '../services/HumannessResponseRateService';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

// Zod schemas
const createTestSchema = z.object({
  test_name: z.string().min(1).max(200),
  test_version: z.string().min(1).max(50),
});

const addPanelistSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['owner', 'founder', 'ceo', 'cto', 'cmo', 'decision_maker']).optional(),
  compensation_offered: z.string().optional(),
});

const generateMessagesSchema = z.object({
  prospect_id: z.string().uuid(),
  channel: z.enum(['linkedin', 'email']),
});

const humanMessagesSchema = z.object({
  messages: z.array(z.object({
    message_text: z.string().min(1),
    subject: z.string().optional(),
    channel: z.enum(['linkedin', 'email']),
  })).length(5),
});

const submitResponseSchema = z.object({
  message_id: z.string().uuid(),
  identified_as_ai: z.boolean(),
  confidence_level: z.number().int().min(1).max(5).optional(),
  reasoning: z.string().optional(),
  response_time_seconds: z.number().int().min(0),
});

const bulkInviteSchema = z.object({
  panelist_ids: z.array(z.string().uuid()),
});

const codifyStrategySchema = z.object({
  strategy_name: z.string().optional(),
});

export async function humannessTestsRoutes(fastify: FastifyInstance) {
  // Create test
  fastify.post(
    '/',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const body = createTestSchema.parse(request.body);
      const test = await testService.createTest(
        body.test_name,
        body.test_version,
        req.user.userId
      );

      return reply.send({
        success: true,
        data: {
          test_id: test.id,
          test_name: test.test_name,
          status: test.status,
        },
      });
    }
  );

  // Get test
  fastify.get(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const params = request.params as { id: string };
      const test = await testService.getTest(params.id, req.user.userId);

      return reply.send({
        success: true,
        data: test,
      });
    }
  );

  // Add panelist
  fastify.post(
    '/:id/panelists',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const params = request.params as { id: string };
      const body = addPanelistSchema.parse(request.body);
      const panelist = await testService.addPanelist(params.id, body);

      return reply.send({
        success: true,
        data: {
          panelist_id: panelist.id,
          full_name: panelist.full_name,
          email: panelist.email,
          recruitment_status: panelist.recruitment_status,
        },
      });
    }
  );

  // Get panelists
  fastify.get(
    '/:id/panelists',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const params = request.params as { id: string };
      const panelists = await testService.getPanelists(params.id);

      return reply.send({
        success: true,
        data: panelists,
      });
    }
  );

  // Send panelist invitation
  fastify.post(
    '/:id/panelists/:panelistId/invite',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const params = request.params as { id: string; panelistId: string };
      await testService.sendPanelistInvitation(params.id, params.panelistId);

      return reply.send({
        success: true,
        message: 'Invitation sent',
      });
    }
  );

  // Bulk invite panelists
  fastify.post(
    '/:id/panelists/bulk-invite',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const testService = new HumannessTestService(supabase);

      const params = request.params as { id: string };
      const body = bulkInviteSchema.parse(request.body);
      const result = await testService.bulkInvitePanelists(params.id, body.panelist_ids);

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Generate test messages
  fastify.post(
    '/:id/generate-messages',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const messageService = new HumannessTestMessageService(supabase);

      const params = request.params as { id: string };
      const body = generateMessagesSchema.parse(request.body);

      // Get enrichment data
      const { data: enrichment } = await supabase
        .from('prospect_enrichment')
        .select('*')
        .eq('prospect_id', body.prospect_id)
        .single();

      const messageSet = await messageService.createTestMessageSet(
        params.id,
        {
          prospect_id: body.prospect_id,
          enrichment_data: enrichment || undefined,
          channel: body.channel,
        },
        req.user.userId
      );

      return reply.send({
        success: true,
        data: messageSet,
      });
    }
  );

  // Add human messages
  fastify.post(
    '/:id/human-messages',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const messageService = new HumannessTestMessageService(supabase);

      const params = request.params as { id: string };
      const body = humanMessagesSchema.parse(request.body);

      // Get prospect context (needed for metadata)
      const prospectId = body.messages[0]?.channel === 'email'
        ? (await supabase.from('prospects').select('id').limit(1).single()).data?.id
        : null;

      const messages = await messageService.generateHumanMessages(
        params.id,
        body.messages,
        req.user.userId
      );

      return reply.send({
        success: true,
        data: { messages },
      });
    }
  );

  // Get messages for panelist (shuffled, without revealing type)
  fastify.get(
    '/:testId/panelist/:panelistId/messages',
    async (request, reply) => {
      // No auth required - panelist accesses via link
      const supabase = createSupabaseClient(
        request.headers.authorization?.substring(7) || ''
      );
      const messageService = new HumannessTestMessageService(supabase);

      const params = request.params as { testId: string; panelistId: string };
      const messages = await messageService.getShuffledMessages(params.testId);

      return reply.send({
        success: true,
        data: { messages },
      });
    }
  );

  // Submit panelist response
  fastify.post(
    '/:testId/panelist/:panelistId/responses',
    async (request, reply) => {
      const supabase = createSupabaseClient(
        request.headers.authorization?.substring(7) || ''
      );

      const params = request.params as { testId: string; panelistId: string };
      const body = submitResponseSchema.parse(request.body);

      const { error } = await supabase
        .from('humanness_test_responses')
        .insert({
          test_id: params.testId,
          panelist_id: params.panelistId,
          message_id: body.message_id,
          identified_as_ai: body.identified_as_ai,
          confidence_level: body.confidence_level || null,
          reasoning: body.reasoning || null,
          response_time_seconds: body.response_time_seconds,
        });

      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Failed to record response',
          details: error.message,
        });
      }

      return reply.send({
        success: true,
        message: 'Response recorded',
      });
    }
  );

  // Complete test
  fastify.post(
    '/:testId/panelist/:panelistId/complete',
    async (request, reply) => {
      const supabase = createSupabaseClient(
        request.headers.authorization?.substring(7) || ''
      );

      const params = request.params as { testId: string; panelistId: string };

      const { error } = await supabase
        .from('humanness_test_panelists')
        .update({
          recruitment_status: 'completed',
          test_completed_at: new Date().toISOString(),
        })
        .eq('id', params.panelistId)
        .eq('test_id', params.testId);

      if (error) {
        return reply.status(400).send({
          success: false,
          error: 'Failed to complete test',
          details: error.message,
        });
      }

      return reply.send({
        success: true,
        message: 'Test completed. Thank you!',
      });
    }
  );

  // Get analytics
  fastify.get(
    '/:id/analytics',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const analyticsService = new HumannessTestAnalyticsService(supabase);

      const params = request.params as { id: string };
      const metrics = await analyticsService.calculateDetectionRate(params.id);
      const winningStrategy = await analyticsService.getWinningStrategy(params.id);

      return reply.send({
        success: true,
        data: {
          ...metrics,
          winning_strategy: winningStrategy,
        },
      });
    }
  );

  // Get winning strategy
  fastify.get(
    '/:id/winning-strategy',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const analyticsService = new HumannessTestAnalyticsService(supabase);

      const params = request.params as { id: string };
      const winningStrategy = await analyticsService.getWinningStrategy(params.id);

      if (!winningStrategy) {
        return reply.status(404).send({
          success: false,
          error: 'Winning strategy not found',
        });
      }

      return reply.send({
        success: true,
        data: winningStrategy,
      });
    }
  );

  // Codify winning strategy
  fastify.post(
    '/:id/codify-strategy',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const strategyService = new HumannessStrategyService(supabase);

      const params = request.params as { id: string };
      const body = codifyStrategySchema.parse(request.body);

      const result = await strategyService.codifyWinningStrategy(
        params.id,
        body.strategy_name || null,
        req.user.userId
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Get response rate
  fastify.get(
    '/response-rate',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const responseRateService = new HumannessResponseRateService(supabase);

      const queryParams = request.query as { user_id?: string; days?: string };
      const userId = queryParams.user_id || req.user.userId;
      const days = parseInt(queryParams.days || '30');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await responseRateService.calculateResponseRate(
        userId,
        startDate,
        endDate
      );
      const trend = await responseRateService.trackResponseRateTrend(userId, days);

      return reply.send({
        success: true,
        data: {
          ...metrics,
          trend,
        },
      });
    }
  );

  // Get response rate trend
  fastify.get(
    '/response-rate/trend',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const responseRateService = new HumannessResponseRateService(supabase);

      const queryParams = request.query as { user_id?: string; days?: string };
      const userId = queryParams.user_id || req.user.userId;
      const days = parseInt(queryParams.days || '30');

      const trend = await responseRateService.trackResponseRateTrend(userId, days);

      return reply.send({
        success: true,
        data: trend,
      });
    }
  );
}



