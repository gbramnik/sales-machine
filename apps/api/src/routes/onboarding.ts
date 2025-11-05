import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';
import { z } from 'zod';

// Validation schemas
const calendarConnectionSchema = z.object({
  provider: z.enum(['cal_com', 'calendly']),
  code: z.string().optional(), // OAuth authorization code
  access_token: z.string().optional(), // Direct token (for API key mode)
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  username: z.string().optional(), // Cal.com username
  default_event_type_id: z.string().optional(),
});

/**
 * Onboarding API Routes
 * 
 * Handles onboarding steps including calendar connection
 */
export async function onboardingRoutes(server: FastifyInstance) {
  // Connect calendar during onboarding (Story 1.7 - Task 2)
  server.post(
    '/onboarding/step/calendar',
    {
      preHandler: requireAuth,
      schema: {
        body: calendarConnectionSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof calendarConnectionSchema>;

      try {
        // If OAuth code provided, exchange for tokens
        let accessToken = body.access_token;
        let refreshToken = body.refresh_token;
        let expiresAt: Date | null = null;

        if (body.code && !accessToken) {
          // Exchange OAuth code for tokens
          // This would call Cal.com/Calendly OAuth token endpoint
          // For MVP, we'll accept tokens directly
          throw new ApiError(
            ErrorCode.INVALID_REQUEST,
            'OAuth code exchange not yet implemented. Please provide access_token directly.',
            400
          );
        }

        if (body.expires_in) {
          expiresAt = new Date(Date.now() + body.expires_in * 1000);
        }

        // Store calendar credentials in users table
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            calendar_provider: body.provider,
            calendar_access_token: accessToken || null,
            calendar_refresh_token: refreshToken || null,
            calendar_token_expires_at: expiresAt?.toISOString() || null,
            calendar_username: body.username || null,
            default_event_type_id: body.default_event_type_id || null,
          })
          .eq('id', userId);

        if (updateError) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to save calendar credentials',
            500,
            updateError
          );
        }

        // Also store in api_credentials table for consistency
        if (accessToken) {
          const serviceName = body.provider === 'cal_com' ? 'cal_com' : 'calendly';
          await supabaseAdmin
            .from('api_credentials')
            .upsert({
              user_id: userId,
              service_name: serviceName,
              api_key: accessToken,
              metadata: {
                username: body.username,
                default_event_type_id: body.default_event_type_id,
                refresh_token: refreshToken,
                expires_at: expiresAt?.toISOString(),
                base_url: body.provider === 'cal_com' ? (process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1') : undefined,
              },
              is_active: true,
            }, {
              onConflict: 'user_id,service_name',
            });
        }

        return reply.send({
          success: true,
          message: 'Calendar connected successfully',
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
          error: 'Failed to connect calendar',
          details: error.message,
        });
      }
    }
  );

  // Get calendar connection status
  server.get(
    '/onboarding/step/calendar',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('calendar_provider, calendar_username, default_event_type_id')
          .eq('id', userId)
          .single();

        if (error || !user) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'User not found',
            404
          );
        }

        return reply.send({
          success: true,
          data: {
            connected: !!user.calendar_provider,
            provider: user.calendar_provider,
            username: user.calendar_username,
            default_event_type_id: user.default_event_type_id,
          },
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
          error: 'Failed to fetch calendar status',
          details: error.message,
        });
      }
    }
  );
}

