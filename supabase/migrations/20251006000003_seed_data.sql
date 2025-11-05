-- Sales Machine - Seed Data for Development
-- Migration: 20251006000003_seed_data
-- Description: Insert system email templates and sample data for development

-- =====================================================
-- SYSTEM EMAIL TEMPLATES
-- =====================================================

INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  variables_required,
  tone,
  is_system_template
) VALUES

-- Template 1: Cold Intro
(
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Cold Intro - Pain Point Focus',
  'Initial outreach focusing on prospect''s pain points',
  'cold_intro',
  'Quick question about {{company}}',
  'Hi {{prospect_name}},

I noticed {{talking_point_1}}.

Many {{job_title}}s I work with face similar challenges:
• {{pain_point_1}}
• {{pain_point_2}}
• Time-consuming manual processes

I''d love to share how we''ve helped companies like {{similar_company}} automate their prospecting while maintaining personalization.

Open to a 15-minute conversation this week?

Best,
{{sender_name}}',
  '["prospect_name", "company", "talking_point_1", "job_title", "pain_point_1", "pain_point_2", "similar_company", "sender_name"]'::jsonb,
  'conversational',
  TRUE
),

-- Template 2: Follow-up (No Reply)
(
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'Follow-up - No Reply',
  'First follow-up when prospect hasn''t responded',
  'follow_up_no_reply',
  'Re: Quick question about {{company}}',
  'Hi {{prospect_name}},

I know you''re busy, so I''ll keep this brief.

I reached out last week about {{pain_point_1}}. I recently helped {{similar_company}} achieve {{specific_result}}, and I think there might be a similar opportunity for {{company}}.

Would a quick 10-minute call make sense?

You can grab time here: {{calendar_link}}

Best,
{{sender_name}}',
  '["prospect_name", "company", "pain_point_1", "similar_company", "specific_result", "calendar_link", "sender_name"]'::jsonb,
  'conversational',
  TRUE
),

-- Template 3: Follow-up (Engaged)
(
  '00000000-0000-0000-0000-000000000003',
  NULL,
  'Follow-up - Engaged Prospect',
  'Follow-up for prospects who showed interest',
  'follow_up_engaged',
  '{{prospect_name}} - Next steps for {{company}}',
  'Hi {{prospect_name}},

Thanks for your interest! Based on our last conversation, I think {{specific_solution}} would be a great fit for {{company}}.

I''d love to show you:
✓ {{benefit_1}}
✓ {{benefit_2}}
✓ How {{similar_company}} achieved {{result}}

Are you free for a quick demo this week?

{{calendar_link}}

Best,
{{sender_name}}',
  '["prospect_name", "company", "specific_solution", "benefit_1", "benefit_2", "similar_company", "result", "calendar_link", "sender_name"]'::jsonb,
  'professional',
  TRUE
),

-- Template 4: Re-engagement
(
  '00000000-0000-0000-0000-000000000004',
  NULL,
  'Re-engagement - Long Term Nurture',
  'Re-engage prospects after long period of inactivity',
  're_engagement',
  'Thought this might interest you, {{prospect_name}}',
  'Hi {{prospect_name}},

We spoke {{time_period}} ago about {{original_topic}}.

I wanted to reach out because we just released {{new_feature}} that specifically addresses {{pain_point_1}} - something you mentioned was a challenge for {{company}}.

Would it make sense to reconnect for 10 minutes?

{{calendar_link}}

Best,
{{sender_name}}

P.S. {{social_proof}}',
  '["prospect_name", "time_period", "original_topic", "new_feature", "pain_point_1", "company", "calendar_link", "sender_name", "social_proof"]'::jsonb,
  'conversational',
  TRUE
),

-- Template 5: Meeting Confirmation
(
  '00000000-0000-0000-0000-000000000005',
  NULL,
  'Meeting Confirmation',
  'Confirm meeting and set expectations',
  'meeting_confirmation',
  'Confirmed: {{meeting_type}} - {{meeting_date}}',
  'Hi {{prospect_name}},

Looking forward to our {{meeting_type}} on {{meeting_date}} at {{meeting_time}} {{timezone}}.

Here''s the meeting link: {{meeting_link}}

To make the most of our time, I''d love to understand:
1. {{question_1}}
2. {{question_2}}

Feel free to reply with any thoughts, or we can discuss live.

See you soon!

{{sender_name}}',
  '["prospect_name", "meeting_type", "meeting_date", "meeting_time", "timezone", "meeting_link", "question_1", "question_2", "sender_name"]'::jsonb,
  'professional',
  TRUE
);

-- =====================================================
-- DEVELOPMENT SEED DATA (Only in development)
-- =====================================================

-- Note: In production, these should NOT be inserted
-- This is just for local development and testing

-- Insert sample campaigns (only if not in production)
-- DO $$
-- BEGIN
--   IF current_setting('app.environment', TRUE) = 'development' THEN
--     -- Sample seed data would go here
--     -- This section is commented out to prevent accidental production insertion
--   END IF;
-- END $$;

-- =====================================================
-- FUNCTIONS FOR TEMPLATE VARIABLE REPLACEMENT
-- =====================================================

CREATE OR REPLACE FUNCTION public.replace_template_variables(
  template_text TEXT,
  variables JSONB
)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  key TEXT;
  value TEXT;
BEGIN
  result := template_text;

  -- Loop through all variables in the JSONB object
  FOR key, value IN SELECT * FROM jsonb_each_text(variables)
  LOOP
    result := REPLACE(result, '{{' || key || '}}', value);
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example usage:
-- SELECT public.replace_template_variables(
--   'Hi {{name}}, welcome to {{company}}!',
--   '{"name": "John", "company": "Acme Corp"}'::jsonb
-- );

COMMENT ON FUNCTION public.replace_template_variables IS 'Replace {{variable}} placeholders in email templates with actual values';

-- =====================================================
-- HELPER FUNCTION: Get Pending Review Count
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_pending_review_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.ai_review_queue
    WHERE user_id = user_uuid
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get Campaign Stats
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_campaign_stats(campaign_uuid UUID)
RETURNS TABLE (
  total_prospects BIGINT,
  contacted BIGINT,
  replied BIGINT,
  qualified BIGINT,
  meetings_booked BIGINT,
  reply_rate NUMERIC,
  meeting_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_prospects,
    COUNT(*) FILTER (WHERE status IN ('contacted', 'engaged', 'qualified', 'meeting_booked'))::BIGINT as contacted,
    COUNT(*) FILTER (WHERE last_replied_at IS NOT NULL)::BIGINT as replied,
    COUNT(*) FILTER (WHERE status = 'qualified')::BIGINT as qualified,
    COUNT(*) FILTER (WHERE status = 'meeting_booked')::BIGINT as meetings_booked,
    CASE
      WHEN COUNT(*) FILTER (WHERE status IN ('contacted', 'engaged', 'qualified', 'meeting_booked')) > 0
      THEN (COUNT(*) FILTER (WHERE last_replied_at IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE status IN ('contacted', 'engaged', 'qualified', 'meeting_booked'))::NUMERIC * 100)
      ELSE 0
    END as reply_rate,
    CASE
      WHEN COUNT(*) FILTER (WHERE last_replied_at IS NOT NULL) > 0
      THEN (COUNT(*) FILTER (WHERE status = 'meeting_booked')::NUMERIC / COUNT(*) FILTER (WHERE last_replied_at IS NOT NULL)::NUMERIC * 100)
      ELSE 0
    END as meeting_rate
  FROM public.prospects
  WHERE campaign_id = campaign_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Calculate Health Score
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_health_score(user_uuid UUID)
RETURNS TABLE (
  score INTEGER,
  deliverability_score INTEGER,
  response_rate_score INTEGER,
  ai_performance_score INTEGER
) AS $$
DECLARE
  total_sent BIGINT;
  total_replied BIGINT;
  total_bounced BIGINT;
  total_ai_approved BIGINT;
  total_ai_reviewed BIGINT;
BEGIN
  -- Get metrics
  SELECT
    COUNT(*) FILTER (WHERE direction = 'outbound'),
    COUNT(*) FILTER (WHERE direction = 'inbound'),
    0 -- Bounce tracking to be implemented
  INTO total_sent, total_replied, total_bounced
  FROM public.ai_conversation_log
  WHERE user_id = user_uuid
  AND created_at > NOW() - INTERVAL '30 days';

  SELECT
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*)
  INTO total_ai_approved, total_ai_reviewed
  FROM public.ai_review_queue
  WHERE user_id = user_uuid
  AND created_at > NOW() - INTERVAL '30 days';

  -- Calculate scores (0-100)
  RETURN QUERY SELECT
    LEAST(100, (
      CASE WHEN total_sent > 0 THEN (40 - (total_bounced::NUMERIC / total_sent * 40))::INTEGER ELSE 40 END +
      CASE WHEN total_sent > 0 THEN (total_replied::NUMERIC / total_sent * 30)::INTEGER ELSE 0 END +
      CASE WHEN total_ai_reviewed > 0 THEN (total_ai_approved::NUMERIC / total_ai_reviewed * 30)::INTEGER ELSE 30 END
    ))::INTEGER as score,
    CASE WHEN total_sent > 0 THEN (100 - (total_bounced::NUMERIC / total_sent * 100))::INTEGER ELSE 100 END as deliverability_score,
    CASE WHEN total_sent > 0 THEN (total_replied::NUMERIC / total_sent * 100)::INTEGER ELSE 0 END as response_rate_score,
    CASE WHEN total_ai_reviewed > 0 THEN (total_ai_approved::NUMERIC / total_ai_reviewed * 100)::INTEGER ELSE 100 END as ai_performance_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.replace_template_variables TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_review_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_health_score TO authenticated;
