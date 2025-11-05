import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { meetingBookingService } from '../services/meeting-booking.service';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';
import { z } from 'zod';

// Validation schemas
const generateBookingLinkSchema = z.object({
  prospect_id: z.string().uuid(),
  event_type_id: z.string().optional(),
  duration: z.number().int().min(15).max(120).optional(),
});

const cancelMeetingSchema = z.object({
  reason: z.string().optional(),
});

const rescheduleMeetingSchema = z.object({
  new_time: z.string().datetime(),
});

/**
 * Meetings API Routes
 * 
 * Handles meeting booking, management, and webhooks
 */
export async function meetingsRoutes(server: FastifyInstance) {
  // Generate booking link for prospect (Story 1.7 - Task 3)
  server.post(
    '/meetings/generate-link',
    {
      preHandler: requireAuth,
      schema: {
        body: generateBookingLinkSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof generateBookingLinkSchema>;

      try {
        const result = await meetingBookingService.generateBookingLink({
          prospectId: body.prospect_id,
          userId,
          eventTypeId: body.event_type_id,
          duration: body.duration,
        });

        return reply.send({
          success: true,
          data: result,
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
          error: 'Failed to generate booking link',
          details: error.message,
        });
      }
    }
  );

  // List meetings (Story 1.7 - Task 9)
  server.get(
    '/meetings',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const query = request.query as {
        status?: string;
        start_date?: string;
        end_date?: string;
      };

      try {
        let queryBuilder = supabaseAdmin
          .from('meetings')
          .select(`
            *,
            prospect:prospects(id, name, email, company, job_title, linkedin_url)
          `)
          .eq('user_id', userId);

        if (query.status) {
          queryBuilder = queryBuilder.eq('status', query.status);
        }

        if (query.start_date && query.end_date) {
          queryBuilder = queryBuilder
            .gte('scheduled_at', query.start_date)
            .lte('scheduled_at', query.end_date);
        }

        const { data: meetings, error } = await queryBuilder.order('scheduled_at', { ascending: true });

        if (error) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to fetch meetings',
            500,
            error
          );
        }

        return reply.send({
          success: true,
          data: meetings || [],
          count: meetings?.length || 0,
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
          error: 'Failed to fetch meetings',
          details: error.message,
        });
      }
    }
  );

  // Get meeting details (Story 1.7 - Task 9)
  server.get(
    '/meetings/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params as { id: string };

      try {
        const { data: meeting, error } = await supabaseAdmin
          .from('meetings')
          .select(`
            *,
            prospect:prospects(
              id,
              name,
              email,
              company,
              job_title,
              linkedin_url,
              profile_summary
            ),
            enrichment:prospect_enrichment(
              talking_points,
              pain_points,
              company_insights
            )
          `)
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error || !meeting) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'Meeting not found',
            404
          );
        }

        return reply.send({
          success: true,
          data: meeting,
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
          error: 'Failed to fetch meeting',
          details: error.message,
        });
      }
    }
  );

  // Cancel meeting (Story 1.7 - Task 9)
  server.patch(
    '/meetings/:id/cancel',
    {
      preHandler: requireAuth,
      schema: {
        body: cancelMeetingSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params as { id: string };
      const body = request.body as z.infer<typeof cancelMeetingSchema>;

      try {
        // Verify meeting belongs to user
        const { data: meeting, error: fetchError } = await supabaseAdmin
          .from('meetings')
          .select('id, calendar_event_id, calendar_provider, prospect_id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (fetchError || !meeting) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'Meeting not found',
            404
          );
        }

        // Update meeting status
        const { error: updateError } = await supabaseAdmin
          .from('meetings')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: body.reason || null,
          })
          .eq('id', id);

        if (updateError) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to cancel meeting',
            500,
            updateError
          );
        }

        // Update prospect status
        await supabaseAdmin
          .from('prospects')
          .update({ status: 'meeting_cancelled' })
          .eq('id', meeting.prospect_id);

        // TODO: Call Cal.com API to cancel booking (if supported)
        // This would require implementing cancelBooking method in MeetingBookingService

        return reply.send({
          success: true,
          message: 'Meeting cancelled successfully',
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
          error: 'Failed to cancel meeting',
          details: error.message,
        });
      }
    }
  );

  // Reschedule meeting (Story 1.7 - Task 9)
  server.post(
    '/meetings/:id/reschedule',
    {
      preHandler: requireAuth,
      schema: {
        body: rescheduleMeetingSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const { id } = request.params as { id: string };
      const body = request.body as z.infer<typeof rescheduleMeetingSchema>;

      try {
        // Verify meeting belongs to user
        const { data: meeting, error: fetchError } = await supabaseAdmin
          .from('meetings')
          .select('id, calendar_event_id, duration_minutes')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (fetchError || !meeting) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'Meeting not found',
            404
          );
        }

        const newTime = new Date(body.new_time);

        // Update meeting scheduled time
        const { data: updatedMeeting, error: updateError } = await supabaseAdmin
          .from('meetings')
          .update({
            scheduled_at: newTime.toISOString(),
            status: 'rescheduled',
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to reschedule meeting',
            500,
            updateError
          );
        }

        // TODO: Call Cal.com API to reschedule booking (if supported)
        // This would require implementing rescheduleBooking method in MeetingBookingService

        return reply.send({
          success: true,
          data: updatedMeeting,
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
          error: 'Failed to reschedule meeting',
          details: error.message,
        });
      }
    }
  );
}

