-- No Spray No Pray - Seed LinkedIn and Email Templates
-- Migration: 20250111_seed_linkedin_email_templates
-- Description: Insert 5 LinkedIn message templates and update existing email templates with channel='email'

-- =====================================================
-- UPDATE EXISTING EMAIL TEMPLATES
-- =====================================================
-- Set channel='email' for all existing email templates
UPDATE public.email_templates
SET channel = 'email'
WHERE channel IS NULL OR channel = 'email';

-- =====================================================
-- INSERT LINKEDIN MESSAGE TEMPLATES
-- =====================================================

-- Template 1: Cold Connection Request
INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  variables_required,
  tone,
  is_system_template
) VALUES (
  '00000000-0000-0000-0000-000000000101',
  NULL,
  'LinkedIn Cold Connection Request',
  'Initial LinkedIn connection request with personalized note',
  'cold_intro',
  NULL, -- LinkedIn doesn't use subject lines
  'Hi {{prospect_name}},

I noticed {{talking_point_1}} and thought you might find this interesting.

I work with {{job_title}}s at companies like {{company}} who face similar challenges around {{pain_point_1}}. Many have found success by {{recent_activity}}.

Would love to connect and share insights!

Best,
{{sender_name}}',
  'linkedin',
  'Would love to connect! {{talking_point_1}}',
  '["prospect_name", "talking_point_1", "job_title", "company", "pain_point_1", "recent_activity", "sender_name", "linkedin_connection_note"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Template 2: Follow-up (No Reply)
INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  variables_required,
  tone,
  is_system_template
) VALUES (
  '00000000-0000-0000-0000-000000000102',
  NULL,
  'LinkedIn Follow-up - No Reply',
  'Follow-up message for prospects who accepted connection but didn''t reply',
  'follow_up_no_reply',
  NULL,
  'Hi {{prospect_name}},

I know you''re busy, so I''ll keep this brief.

I reached out last week about {{pain_point_1}} at {{company}}. I recently helped a similar company achieve {{specific_result}}.

Would a quick 10-minute call make sense? I can share how we addressed {{pain_point_1}}.

{{calendar_link}}

Best,
{{sender_name}}',
  'linkedin',
  'Quick follow-up on {{pain_point_1}} - 10 min call?',
  '["prospect_name", "pain_point_1", "company", "specific_result", "calendar_link", "sender_name"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Template 3: Follow-up (Engaged)
INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  variables_required,
  tone,
  is_system_template
) VALUES (
  '00000000-0000-0000-0000-000000000103',
  NULL,
  'LinkedIn Follow-up - Engaged',
  'Follow-up message for prospects who engaged with previous message',
  'follow_up_engaged',
  NULL,
  'Hi {{prospect_name}},

Thanks for your interest! Based on our conversation, I think {{specific_solution}} would be a great fit for {{company}}.

I''d love to show you:
✓ {{benefit_1}}
✓ {{benefit_2}}
✓ How we helped {{similar_company}} achieve {{result}}

Are you free for a quick demo this week?

{{calendar_link}}

Best,
{{sender_name}}',
  'linkedin',
  'Next steps for {{company}} - quick demo?',
  '["prospect_name", "company", "specific_solution", "benefit_1", "benefit_2", "similar_company", "result", "calendar_link", "sender_name"]'::jsonb,
  'professional',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Template 4: Re-engagement
INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  variables_required,
  tone,
  is_system_template
) VALUES (
  '00000000-0000-0000-0000-000000000104',
  NULL,
  'LinkedIn Re-engagement',
  'Re-engage prospects after long period of inactivity',
  're_engagement',
  NULL,
  'Hi {{prospect_name}},

We connected {{time_period}} ago about {{original_topic}}.

I wanted to reach out because we just released {{new_feature}} that specifically addresses {{pain_point_1}} - something you mentioned was a challenge for {{company}}.

Would it make sense to reconnect for 10 minutes?

{{calendar_link}}

Best,
{{sender_name}}',
  'linkedin',
  'Quick update on {{new_feature}} for {{company}}',
  '["prospect_name", "time_period", "original_topic", "new_feature", "pain_point_1", "company", "calendar_link", "sender_name"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Template 5: Meeting Confirmation
INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  variables_required,
  tone,
  is_system_template
) VALUES (
  '00000000-0000-0000-0000-000000000105',
  NULL,
  'LinkedIn Meeting Confirmation',
  'Confirm meeting and set expectations via LinkedIn',
  'meeting_confirmation',
  NULL,
  'Hi {{prospect_name}},

Looking forward to our {{meeting_type}} on {{meeting_date}} at {{meeting_time}} {{timezone}}.

Here''s the meeting link: {{meeting_link}}

To make the most of our time, I''d love to understand:
1. {{question_1}}
2. {{question_2}}

Feel free to reply with any thoughts, or we can discuss live.

See you soon!

{{sender_name}}',
  'linkedin',
  'Confirmed: {{meeting_type}} on {{meeting_date}}',
  '["prospect_name", "meeting_type", "meeting_date", "meeting_time", "timezone", "meeting_link", "question_1", "question_2", "sender_name"]'::jsonb,
  'professional',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

