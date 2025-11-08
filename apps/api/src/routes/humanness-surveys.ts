import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSupabaseClient } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { ApiError, ErrorCode } from '../types';

// Zod schemas
const submitSurveySchema = z.object({
  survey_period: z.string(),
  question_1_detection_mentioned: z.boolean().optional(),
  question_1_details: z.string().optional(),
  question_2_response_rate: z.number().optional(),
  question_3_feedback: z.string().optional(),
});

export async function humannessSurveysRoutes(fastify: FastifyInstance) {
  // Submit survey
  fastify.post(
    '/',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );

      const body = submitSurveySchema.parse(request.body);

      // Upsert survey
      const { data, error } = await supabase
        .from('humanness_post_launch_surveys')
        .upsert({
          user_id: req.user.userId,
          survey_period: body.survey_period,
          question_1_detection_mentioned: body.question_1_detection_mentioned || null,
          question_1_details: body.question_1_details || null,
          question_2_response_rate: body.question_2_response_rate || null,
          question_3_feedback: body.question_3_feedback || null,
        }, {
          onConflict: 'user_id,survey_period',
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to submit survey',
          500,
          error
        );
      }

      // Calculate aggregate metrics
      const { data: allSurveys } = await supabaseAdmin
        .from('humanness_post_launch_surveys')
        .select('question_1_detection_mentioned')
        .eq('survey_period', body.survey_period);

      const totalResponses = allSurveys?.length || 0;
      const detectionMentionedCount = allSurveys?.filter(s => s.question_1_detection_mentioned === true).length || 0;
      const detectionMentionedRate = totalResponses > 0
        ? (detectionMentionedCount / totalResponses) * 100
        : 0;

      // Log alert if threshold exceeded
      if (detectionMentionedRate > 5) {
        await supabaseAdmin
          .from('audit_log')
          .insert({
            event_type: 'humanness_survey_alert',
            user_id: req.user.userId,
            metadata: {
              detection_rate: detectionMentionedRate,
              threshold: 5,
              survey_period: body.survey_period,
            },
          });
      }

      return reply.send({
        success: true,
        message: 'Survey submitted',
      });
    }
  );

  // Get survey analytics
  fastify.get(
    '/analytics',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );

      const queryParams = request.query as { period?: string };
      const period = queryParams.period || getCurrentQuarter();

      // Get all surveys for period
      const { data: surveys, error } = await supabaseAdmin
        .from('humanness_post_launch_surveys')
        .select('question_1_detection_mentioned')
        .eq('survey_period', period);

      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to fetch survey analytics',
          500,
          error
        );
      }

      const totalResponses = surveys?.length || 0;
      const detectionMentionedCount = surveys?.filter(s => s.question_1_detection_mentioned === true).length || 0;
      const detectionMentionedRate = totalResponses > 0
        ? (detectionMentionedCount / totalResponses) * 100
        : 0;

      return reply.send({
        success: true,
        data: {
          period,
          total_responses: totalResponses,
          detection_mentioned_count: detectionMentionedCount,
          detection_mentioned_rate: Math.round(detectionMentionedRate * 100) / 100,
          target_met: detectionMentionedRate < 5,
        },
      });
    }
  );
}

/**
 * Get current quarter string (e.g., "2025-Q1")
 */
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}



