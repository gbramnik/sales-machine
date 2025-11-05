import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { smtpService } from '../services/SMTPService';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Email Sending API Routes
 * 
 * Internal endpoints for N8N workflow to send emails via SMTP
 */

export async function emailRoutes(server: FastifyInstance) {
  // Send email via SMTP (internal endpoint for N8N)
  server.post(
    '/email/send',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as {
        to: string;
        subject: string;
        body: string;
        from: string;
        reply_to?: string;
        prospect_id: string;
        template_id: string;
        campaign_id?: string;
      };

      try {
        // Get SMTP credentials from database (api_credentials table)
        const { data: credentials } = await supabaseAdmin
          .from('api_credentials')
          .select('metadata')
          .eq('user_id', userId)
          .eq('service_name', 'smtp_mailgun')
          .eq('is_active', true)
          .single();

        if (!credentials) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'SMTP credentials not configured',
            404
          );
        }

        // Get SMTP config from metadata
        const smtpConfig = credentials.metadata || {};

        // Send email via Mailgun
        const result = await smtpService.sendEmail(
          {
            to: body.to,
            subject: body.subject,
            body: body.body,
            from: body.from,
            reply_to: body.reply_to,
          },
          {
            api_key: smtpConfig.api_key,
            domain: smtpConfig.domain,
            from_email: body.from,
          }
        );

        return reply.send({
          success: true,
          message_id: result.message_id,
          provider_message_id: result.provider_message_id,
          status: result.status,
        });
      } catch (error: any) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to send email',
          details: error.message,
        });
      }
    }
  );
}

