-- No Spray No Pray - Seed Email Templates
-- Migration: 20250111_seed_email_templates
-- Description: Insert 5 system email templates with channel='email'

INSERT INTO public.email_templates (
  id,
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
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
  'email',
  '["prospect_name", "company", "talking_point_1", "job_title", "pain_point_1", "pain_point_2", "similar_company", "sender_name"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET channel = 'email';

-- Template 2: Follow-up (No Reply)
(
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'Follow-up - No Reply',
  'First follow-up when prospect has not responded',
  'follow_up_no_reply',
  'Re: Quick question about {{company}}',
  'Hi {{prospect_name}},

I know you''re busy, so I''ll keep this brief.

I reached out last week about {{pain_point_1}}. I recently helped {{similar_company}} achieve {{specific_result}}, and I think there might be a similar opportunity for {{company}}.

Would a quick 10-minute call make sense?

You can grab time here: {{calendar_link}}

Best,
{{sender_name}}',
  'email',
  '["prospect_name", "company", "pain_point_1", "similar_company", "specific_result", "calendar_link", "sender_name"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET channel = 'email';

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
  'email',
  '["prospect_name", "company", "specific_solution", "benefit_1", "benefit_2", "similar_company", "result", "calendar_link", "sender_name"]'::jsonb,
  'professional',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET channel = 'email';

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
  'email',
  '["prospect_name", "time_period", "original_topic", "new_feature", "pain_point_1", "company", "calendar_link", "sender_name", "social_proof"]'::jsonb,
  'conversational',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET channel = 'email';

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
  'email',
  '["prospect_name", "meeting_type", "meeting_date", "meeting_time", "timezone", "meeting_link", "question_1", "question_2", "sender_name"]'::jsonb,
  'professional',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET channel = 'email';

