import { FastifyInstance } from 'fastify';
import { NotificationService } from '../services/NotificationService';
import { z } from 'zod';

const sendDailyProspectNotificationSchema = z.object({
  user_id: z.string().uuid(),
  prospect_count: z.number().int().min(0),
  prospect_list: z.array(z.object({
    id: z.string().uuid(),
    full_name: z.string(),
    company_name: z.string(),
    job_title: z.string().nullable(),
    linkedin_url: z.string().nullable(),
  })),
  mode: z.enum(['autopilot', 'semi_auto']),
});

const notifyPendingReviewSchema = z.object({
  user_id: z.string().uuid(),
  count: z.number().int().min(0),
  urgent: z.boolean().optional().default(false),
});

export async function notificationRoutes(fastify: FastifyInstance) {
  const notificationService = new NotificationService();

  /**
   * POST /api/notifications/daily-prospects
   * Send daily prospect notification (called from N8N workflow)
   */
  fastify.post(
    '/api/notifications/daily-prospects',
    async (request, reply) => {
      // Verify service token (internal endpoint)
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;

      if (!serviceToken || authHeader !== `Bearer ${serviceToken}`) {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        });
      }

      try {
        const data = sendDailyProspectNotificationSchema.parse(request.body);
        
        await notificationService.sendDailyProspectNotification(
          data.user_id,
          data.prospect_count,
          data.prospect_list.map(p => ({
            id: p.id,
            full_name: p.full_name,
            company_name: p.company_name,
            job_title: p.job_title,
            linkedin_url: p.linkedin_url,
          })),
          data.mode
        );

        return reply.send({
          success: true,
          message: 'Notification sent successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to send notification',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /api/notifications/pending-reviews
   * Send notification for pending AI review queue (called from N8N workflow)
   */
  fastify.post(
    '/api/notifications/pending-reviews',
    async (request, reply) => {
      // Verify service token (internal endpoint)
      const authHeader = request.headers.authorization;
      const serviceToken = process.env.API_SERVICE_TOKEN;

      if (!serviceToken || authHeader !== `Bearer ${serviceToken}`) {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        });
      }

      try {
        const data = notifyPendingReviewSchema.parse(request.body);
        
        await notificationService.notifyPendingReview(
          data.user_id,
          data.count,
          data.urgent
        );

        return reply.send({
          success: true,
          message: 'Notification sent successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to send notification',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}

