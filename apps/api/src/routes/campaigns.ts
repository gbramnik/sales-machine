import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { CampaignService } from '../services/CampaignService';
import { z } from 'zod';

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  agent_id: z.string().uuid(),
  message_template: z.string().min(1),
  batch_size: z.number().int().min(1).max(50).default(5),
  batch_interval_minutes: z.number().int().min(1).max(60).default(3),
  followup_enabled: z.boolean().default(false),
  followup_max_count: z.number().int().min(1).max(10).default(3),
  followup_intervals_hours: z.string().default('24,72,168'),
  metadata: z.record(z.any()).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  message_template: z.string().optional(),
  batch_size: z.number().int().min(1).max(50).optional(),
  batch_interval_minutes: z.number().int().min(1).max(60).optional(),
  followup_enabled: z.boolean().optional(),
  followup_max_count: z.number().int().min(1).max(10).optional(),
  metadata: z.record(z.any()).optional(),
});

const listCampaignsQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export async function campaignsRoutes(server: FastifyInstance) {
  const campaignService = new CampaignService();

  // List campaigns
  server.get('/', {
    preHandler: requireAuth,
    schema: {
      querystring: listCampaignsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            campaigns: { type: 'array' },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const query = listCampaignsQuerySchema.parse(request.query);

    const result = await campaignService.list(userId, query);

    return reply.send(result);
  });

  // Get campaign by ID
  server.get('/:id', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);

    const campaign = await campaignService.getById(id, userId);

    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }

    return reply.send(campaign);
  });

  // Create campaign
  server.post('/', {
    preHandler: requireAuth,
    schema: {
      body: createCampaignSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = createCampaignSchema.parse(request.body);

    const campaign = await campaignService.create(userId, data);

    return reply.code(201).send(campaign);
  });

  // Update campaign
  server.patch('/:id', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: updateCampaignSchema,
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);
    const data = updateCampaignSchema.parse(request.body);

    const campaign = await campaignService.update(id, userId, data);

    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }

    return reply.send(campaign);
  });

  // Delete campaign
  server.delete('/:id', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);

    await campaignService.delete(id, userId);

    return reply.code(204).send();
  });

  // Trigger LinkedIn scraping
  server.post('/:id/trigger-scrape', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
          location: { type: 'string' },
          job_title: { type: 'string' },
          company_size: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);
    const params = request.body as any;

    const result = await campaignService.triggerLinkedInScrape(id, userId, params);

    return reply.send(result);
  });

  // Get campaign progress
  server.get('/:id/progress', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);

    const progress = await campaignService.getProgress(id, userId);

    if (!progress) {
      return reply.code(404).send({ error: 'Progress not found' });
    }

    return reply.send(progress);
  });

  // Queue email for campaign (Story 1.5)
  server.post('/:id/queue-email', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          prospect_id: { type: 'string', format: 'uuid' },
          template_id: { type: 'string', format: 'uuid' },
        },
        required: ['prospect_id', 'template_id'],
      },
    },
  }, async (request, reply) => {
    const { id: campaignId } = request.params as { id: string };
    const userId = getUserId(request);
    const { prospect_id, template_id } = request.body as {
      prospect_id: string;
      template_id: string;
    };

    // Import services
    const { emailQueueService } = await import('../services/email-queue.service');
    const { emailTemplateService } = await import('../services/email-template.service');
    const { emailSendingLimitService } = await import('../services/email-sending-limit.service');
    const { domainWarmupService } = await import('../services/domain-warmup.service');
    const { supabaseAdmin } = await import('../lib/supabase');

    try {
      // 1. Validate template exists and belongs to user
      const { data: template } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('id', template_id)
        .or(`user_id.eq.${userId},is_system_template.eq.true`)
        .single();

      if (!template) {
        return reply.code(404).send({ error: 'Template not found or access denied' });
      }

      // 2. Validate prospect has enrichment data (required variables)
      const personalized = await emailTemplateService.personalizeTemplate(
        template_id,
        prospect_id,
        userId
      );

      if (personalized.variables_missing.length > 0) {
        return reply.code(400).send({
          error: 'Missing required template variables',
          missing_variables: personalized.variables_missing,
        });
      }

      // 3. Get prospect data to get sending email
      const { data: prospect } = await supabaseAdmin
        .from('prospects')
        .select('email, company_name, name, is_vip')
        .eq('id', prospect_id)
        .single();

      if (!prospect || !prospect.email) {
        return reply.code(404).send({ error: 'Prospect not found or missing email' });
      }

      // 4. Get user's sending email from SMTP credentials or user settings
      const { data: smtpCreds } = await supabaseAdmin
        .from('api_credentials')
        .select('metadata')
        .eq('user_id', userId)
        .eq('service_name', 'smtp_mailgun')
        .eq('is_active', true)
        .single();

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, email_settings')
        .eq('id', userId)
        .single();

      const userEmail = (user as { email?: string })?.email;
      const emailSettings = (user as { email_settings?: any })?.email_settings;
      const sendingEmail = smtpCreds?.metadata?.from_email || emailSettings?.sending_email || userEmail || 'noreply@example.com';

      // 5. Check sending limit (Task 4)
      await emailSendingLimitService.validateLimit(userId, sendingEmail);

      // 6. Check domain warm-up (Task 3)
      await domainWarmupService.validateWarmupCompleted(userId);

      // 7. Enqueue email to Redis (Task 5)
      const queuePosition = await emailQueueService.enqueue({
        prospect_id,
        template_id,
        sending_email: sendingEmail,
        personalized_subject: personalized.subject || '',
        personalized_body: personalized.body,
        is_vip: prospect.is_vip || false,
        user_id: userId,
        campaign_id: campaignId,
      });

      return reply.send({
        success: true,
        queued: true,
        queue_position: queuePosition,
        message: 'Email queued successfully',
      });
    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'VALIDATION_ERROR') {
        return reply.code(error.statusCode || 400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to queue email',
        details: error.message,
      });
    }
  });

  // Resume paused campaign (Story 1.5 - Task 9)
  server.post('/:id/resume', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = getUserId(request);

    const campaign = await campaignService.getById(id, userId);

    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'paused') {
      return reply.code(400).send({ error: 'Campaign is not paused' });
    }

    // Resume campaign
    const updated = await campaignService.update(id, userId, { status: 'active' });

    return reply.send({
      success: true,
      campaign: updated,
      message: 'Campaign resumed successfully',
    });
  });

  // Check deliverability and auto-pause (Story 1.5 - Task 9)
  server.post('/check-deliverability', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        properties: {
          campaign_id: { type: 'string', format: 'uuid' },
        },
        required: ['campaign_id'],
      },
    },
  }, async (request, reply) => {
    const { campaign_id } = request.body as { campaign_id: string };
    const userId = getUserId(request);

    const campaign = await campaignService.getById(campaign_id, userId);

    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }

    // Calculate bounce rate and spam complaint rate
    const totalSent = campaign.contacted_count || 0;
    const bounceCount = campaign.bounce_count || 0;
    const spamCount = campaign.spam_complaint_count || 0;

    const bounceRate = totalSent > 0 ? (bounceCount / totalSent) * 100 : 0;
    const spamRate = totalSent > 0 ? (spamCount / totalSent) * 100 : 0;

    // Check if should pause (bounce >5% OR spam >0.1%)
    const shouldPause = bounceRate > 5 || spamRate > 0.1;

    if (shouldPause) {
      // Auto-pause campaign
      await campaignService.update(campaign_id, userId, { status: 'paused' });

      // Log to audit (if audit_log table exists)
      // TODO: Send notification email to user

      return reply.send({
        success: true,
        should_pause: true,
        bounce_rate: bounceRate.toFixed(2),
        spam_complaint_rate: spamRate.toFixed(2),
        message: `Campaign paused: bounce rate ${bounceRate.toFixed(2)}% or spam rate ${spamRate.toFixed(2)}% exceeds threshold`,
      });
    }

    return reply.send({
      success: true,
      should_pause: false,
      bounce_rate: bounceRate.toFixed(2),
      spam_complaint_rate: spamRate.toFixed(2),
    });
  });
}

