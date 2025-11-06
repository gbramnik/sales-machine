import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { SettingsService } from '../services/SettingsService';
import { z } from 'zod';

// Validation schemas
const saveApiCredentialSchema = z.object({
  service_name: z.enum([
    'openai', // Claude API (Anthropic)
    'unipil', // UniPil API (LinkedIn automation)
    'smtp_mailgun', // SMTP Mailgun provider
    'smtp_sendgrid', // SMTP SendGrid provider
    'smtp_ses', // AWS SES SMTP provider
    'email_finder', // Email Finder API (Anymail/Better Contacts)
    'cal_com', // Cal.com calendar service
    'calendly', // Calendly calendar service
    'n8n_linkedin_scrape', // N8N webhook for LinkedIn scraping
    'n8n_ai_enrichment', // N8N webhook for AI enrichment
    'n8n_email_send', // N8N webhook for email sending
    'n8n_email_reply', // N8N webhook for email reply handling
    'n8n_daily_detection', // N8N webhook for daily prospect detection
    'n8n_warmup', // N8N webhook for warm-up workflow
    'n8n_connection', // N8N webhook for connection trigger
    'n8n_ai_conversation', // N8N webhook for AI conversation workflow
    // Deprecated services (kept for backward compatibility)
    'instantly',
    'smartlead',
    'calcom', // Alias for cal_com
  ]),
  api_key: z.string().min(1).optional(),
  webhook_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const saveICPConfigSchema = z.object({
  industries: z.array(z.string()).optional(),
  job_titles: z.array(z.string()).optional(),
  company_sizes: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  exclude_industries: z.array(z.string()).optional(),
  exclude_companies: z.array(z.string()).optional(),
});

const saveEmailSettingsSchema = z.object({
  domain: z.string().optional(),
  sending_email: z.string().email().optional(),
  daily_limit: z.number().int().min(1).max(100).default(20),
  warm_up_enabled: z.boolean().default(true),
  warm_up_days_required: z.number().int().min(7).max(30).default(14),
  bounce_rate_threshold: z.number().min(0).max(100).default(5),
});

const saveAISettingsSchema = z.object({
  personality_id: z.string().uuid().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal']).optional(),
  confidence_threshold: z.number().min(60).max(95).default(80), // AC requirement: 60-95 range
  use_vip_mode: z.boolean().default(true),
  response_templates: z.array(z.string()).optional(),
});

export async function settingsRoutes(server: FastifyInstance) {
  const settingsService = new SettingsService();

  // Get all API credentials (masked)
  server.get('/api-credentials', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    const credentials = await settingsService.getApiCredentials(userId);

    return reply.send(credentials);
  });

  // Save/Update API credential
  server.post('/api-credentials', {
    preHandler: requireAuth,
    schema: {
      body: saveApiCredentialSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = saveApiCredentialSchema.parse(request.body);

    const credential = await settingsService.saveApiCredential(userId, data);

    return reply.send(credential);
  });

  // Delete API credential
  server.delete('/api-credentials/:service_name', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          service_name: { type: 'string' },
        },
        required: ['service_name'],
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { service_name } = request.params as { service_name: string };

    await settingsService.deleteApiCredential(userId, service_name);

    return reply.code(204).send();
  });

  // Verify API credential
  server.post('/api-credentials/:service_name/verify', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          service_name: { type: 'string' },
        },
        required: ['service_name'],
      },
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const { service_name } = request.params as { service_name: string };

    const result = await settingsService.verifyApiCredential(userId, service_name);

    return reply.send(result);
  });

  // Get ICP configuration
  server.get('/icp', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    const icp = await settingsService.getICPConfig(userId);

    return reply.send(icp);
  });

  // Save ICP configuration
  server.post('/icp', {
    preHandler: requireAuth,
    schema: {
      body: saveICPConfigSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = saveICPConfigSchema.parse(request.body);

    const icp = await settingsService.saveICPConfig(userId, data);

    return reply.send(icp);
  });

  // Get email settings
  server.get('/email', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    const settings = await settingsService.getEmailSettings(userId);

    return reply.send(settings);
  });

  // Save email settings
  server.post('/email', {
    preHandler: requireAuth,
    schema: {
      body: saveEmailSettingsSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = saveEmailSettingsSchema.parse(request.body);

    const settings = await settingsService.saveEmailSettings(userId, data);

    return reply.send(settings);
  });

  // Verify domain DNS records
  server.post('/email/verify-domain', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
        },
        required: ['domain'],
      },
    },
  }, async (request, reply) => {
    const { domain } = request.body as { domain: string };

    const result = await settingsService.verifyDomain(domain);

    return reply.send(result);
  });

  // Get AI settings
  server.get('/ai', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    const settings = await settingsService.getAISettings(userId);

    return reply.send(settings);
  });

  // Save AI settings
  server.post('/ai', {
    preHandler: requireAuth,
    schema: {
      body: saveAISettingsSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = saveAISettingsSchema.parse(request.body);

    // Validate confidence_threshold range
    if (data.confidence_threshold !== undefined && (data.confidence_threshold < 60 || data.confidence_threshold > 95)) {
      return reply.status(400).send({
        success: false,
        error: 'confidence_threshold must be between 60 and 95',
      });
    }

    const settings = await settingsService.saveAISettings(userId, data);

    return reply.send(settings);
  });

  // Get detection settings
  server.get('/detection', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    try {
      const settings = await settingsService.getDetectionSettings(userId);
      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to get detection settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Save detection settings
  const saveDetectionSettingsSchema = z.object({
    detection_mode: z.enum(['autopilot', 'semi_auto']).optional(),
    daily_prospect_count: z.number().int().min(1).max(40).optional(),
    detection_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  });

  server.post('/detection', {
    preHandler: requireAuth,
    schema: {
      body: saveDetectionSettingsSchema,
    },
  }, async (request, reply) => {
    const userId = getUserId(request);
    const data = saveDetectionSettingsSchema.parse(request.body);

    try {
      const settings = await settingsService.saveDetectionSettings(userId, data);
      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to save detection settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get all settings (combined)
  server.get('/all', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const userId = getUserId(request);

    const [credentials, icp, email, ai, detection] = await Promise.all([
      settingsService.getApiCredentials(userId),
      settingsService.getICPConfig(userId),
      settingsService.getEmailSettings(userId),
      settingsService.getAISettings(userId),
      settingsService.getDetectionSettings(userId).catch(() => null),
    ]);

    return reply.send({
      success: true,
      data: {
        api_credentials: credentials,
        icp,
        email,
        ai,
        detection,
      },
    });
  });
}

