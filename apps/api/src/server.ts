import Fastify from 'fastify';
import cors from '@fastify/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import { usersRoutes } from './routes/users';
import { dashboardRoutes } from './routes/dashboard';
import { prospectsRoutes } from './routes/prospects';
import { aiReviewQueueRoutes } from './routes/ai-review-queue';
import { campaignsRoutes } from './routes/campaigns';
import { settingsRoutes } from './routes/settings';
import { webhooksRoutes } from './routes/webhooks';
import { emailTemplatesRoutes } from './routes/email-templates';
import { emailQueueRoutes } from './routes/email-queue';
import { emailSendingLimitRoutes } from './routes/email-sending-limit';
import { emailRoutes } from './routes/email';
import { meetingsRoutes } from './routes/meetings';
import { onboardingRoutes } from './routes/onboarding';
import { aiQualificationRoutes } from './routes/ai-qualification';
import { linkedinRoutes } from './routes/linkedin';
import { metricsRoutes } from './routes/metrics';
import { warmupRoutes } from './routes/warmup';
import { validationQueueRoutes } from './routes/validation-queue';
import { exclusionRoutes } from './routes/exclusion';
import { notificationRoutes } from './routes/notifications';
import { confidenceRoutes } from './routes/confidence';
import { vipRoutes } from './routes/vip';
import { factCheckRoutes } from './routes/fact-check';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
await server.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://sales-machine.com']
    : true, // Allow all origins in development
  credentials: true,
});

// Health check endpoint (no auth required)
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
});

// Root endpoint
server.get('/', async () => {
  return {
    message: 'Sales Machine API Gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    docs: '/api/docs', // TODO: Add Swagger documentation
  };
});

// Register API routes
await server.register(usersRoutes, { prefix: '/users' });
await server.register(dashboardRoutes, { prefix: '/dashboard' });
await server.register(prospectsRoutes, { prefix: '/prospects' });
await server.register(aiReviewQueueRoutes, { prefix: '/ai-review-queue' });
await server.register(campaignsRoutes, { prefix: '/campaigns' });
await server.register(settingsRoutes, { prefix: '/settings' });
await server.register(webhooksRoutes, { prefix: '/webhooks' });
await server.register(emailTemplatesRoutes);
await server.register(emailQueueRoutes, { prefix: '/api' });
await server.register(emailSendingLimitRoutes, { prefix: '/api' });
await server.register(emailRoutes, { prefix: '/api' });
await server.register(meetingsRoutes, { prefix: '/meetings' });
await server.register(onboardingRoutes, { prefix: '/onboarding' });
  await server.register(aiQualificationRoutes, { prefix: '/api' });
  await server.register(linkedinRoutes, { prefix: '/api' });
  await server.register(metricsRoutes, { prefix: '/api' });
  await server.register(warmupRoutes, { prefix: '/warmup' });
  await server.register(validationQueueRoutes, { prefix: '/api' });
  await server.register(exclusionRoutes);
  await server.register(notificationRoutes);
  await server.register(confidenceRoutes);
  await server.register(vipRoutes, { prefix: '/api/vip' });
  await server.register(factCheckRoutes, { prefix: '/api/fact-check' });

// Error handlers
server.setErrorHandler(errorHandler);
server.setNotFoundHandler(notFoundHandler);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    server.log.info(`🚀 Server listening on ${host}:${port}`);
    server.log.info(`📊 Health check: http://${host}:${port}/health`);
    server.log.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
