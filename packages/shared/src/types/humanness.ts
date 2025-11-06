import { z } from 'zod';

/**
 * Humanness Testing Framework Types
 * Story 2.4: Humanness Testing Framework
 */

// Test Types
export const HumannessTestSchema = z.object({
  id: z.string().uuid(),
  test_name: z.string(),
  test_version: z.string(),
  test_type: z.enum(['perception_panel', 'post_launch_survey', 'response_rate_tracking']),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  target_detection_rate: z.number(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  created_by: z.string().uuid().nullable(),
  metadata: z.record(z.any()),
});
export type HumannessTest = z.infer<typeof HumannessTestSchema>;

// Panelist Types
export const PanelistSchema = z.object({
  id: z.string().uuid(),
  test_id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email(),
  job_title: z.string().nullable(),
  company_name: z.string().nullable(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).nullable(),
  industry: z.string().nullable(),
  country: z.string(),
  role: z.enum(['owner', 'founder', 'ceo', 'cto', 'cmo', 'decision_maker']).nullable(),
  recruitment_status: z.enum(['pending', 'invited', 'accepted', 'completed', 'declined']),
  invitation_sent_at: z.string().datetime().nullable(),
  test_completed_at: z.string().datetime().nullable(),
  compensation_offered: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type Panelist = z.infer<typeof PanelistSchema>;

// Test Message Types
export const TestMessageSchema = z.object({
  id: z.string().uuid(),
  test_id: z.string().uuid(),
  message_text: z.string(),
  message_type: z.enum(['ai_generated', 'human_written']),
  ai_prompting_strategy: z.string().nullable(),
  channel: z.enum(['linkedin', 'email']),
  subject: z.string().nullable(),
  message_order: z.number().nullable(),
  template_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  metadata: z.record(z.any()),
});
export type TestMessage = z.infer<typeof TestMessageSchema>;

// Test Response Types
export const TestResponseSchema = z.object({
  id: z.string().uuid(),
  test_id: z.string().uuid(),
  panelist_id: z.string().uuid(),
  message_id: z.string().uuid(),
  identified_as_ai: z.boolean(),
  confidence_level: z.number().int().min(1).max(5).nullable(),
  reasoning: z.string().nullable(),
  response_time_seconds: z.number().int().nullable(),
  created_at: z.string().datetime(),
});
export type TestResponse = z.infer<typeof TestResponseSchema>;

// Analytics Types
export const DetectionRateMetricsSchema = z.object({
  overall_detection_rate: z.number(),
  strategy_metrics: z.array(z.object({
    strategy: z.string(),
    detection_rate: z.number(),
    ai_messages_count: z.number(),
    ai_correctly_identified: z.number(),
    ai_incorrectly_identified_as_human: z.number(),
    false_positive_rate: z.number(),
  })),
  target_met: z.boolean(),
});
export type DetectionRateMetrics = z.infer<typeof DetectionRateMetricsSchema>;

export const WinningStrategySchema = z.object({
  strategy_name: z.string(),
  detection_rate: z.number(),
  ai_messages_count: z.number(),
  ai_correctly_identified: z.number(),
  ai_incorrectly_identified_as_human: z.number(),
});
export type WinningStrategy = z.infer<typeof WinningStrategySchema>;

// Response Rate Types
export const ResponseRateMetricsSchema = z.object({
  ai_messages_sent: z.number(),
  replies_received: z.number(),
  response_rate_per_100: z.number(),
  below_threshold: z.boolean(),
  threshold: z.number(),
});
export type ResponseRateMetrics = z.infer<typeof ResponseRateMetricsSchema>;

export const ResponseRateTrendSchema = z.object({
  daily_rates: z.array(z.object({
    date: z.string(),
    response_rate: z.number(),
  })),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  average_rate: z.number(),
});
export type ResponseRateTrend = z.infer<typeof ResponseRateTrendSchema>;

// Survey Types
export const PostLaunchSurveySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  survey_period: z.string(),
  question_1_detection_mentioned: z.boolean().nullable(),
  question_1_details: z.string().nullable(),
  question_2_response_rate: z.number().nullable(),
  question_3_feedback: z.string().nullable(),
  submitted_at: z.string().datetime(),
});
export type PostLaunchSurvey = z.infer<typeof PostLaunchSurveySchema>;

