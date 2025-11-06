-- Description: Seed VIP-specific email templates
-- Story: 2.2 VIP Mode for High-Value Accounts

-- LinkedIn VIP Initial Connection
INSERT INTO public.email_templates (
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  is_vip_template,
  is_system_template,
  is_active,
  tone,
  variables_required
) VALUES (
  NULL, -- System template
  'LinkedIn VIP Initial Connection',
  'Formal, respectful LinkedIn connection request for C-level executives',
  'initial_connection',
  NULL, -- LinkedIn doesn't use subjects
  'Hi {{prospect_name}}, I noticed your role as {{job_title}} at {{company}}. I''d be interested in learning more about your priorities. Would you be open to a brief conversation?',
  'linkedin',
  'Hi {{prospect_name}}, I noticed your role as {{job_title}} at {{company}}. I''d be interested in learning more about your priorities. Would you be open to a brief conversation?',
  TRUE,
  TRUE,
  TRUE,
  'formal',
  ARRAY['prospect_name', 'job_title', 'company']
) ON CONFLICT DO NOTHING;

-- Email VIP Initial Outreach
INSERT INTO public.email_templates (
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  is_vip_template,
  is_system_template,
  is_active,
  tone,
  variables_required
) VALUES (
  NULL, -- System template
  'Email VIP Initial Outreach',
  'Formal, professional email for C-level executives with soft CTA',
  'initial_outreach',
  'Quick question about {{company}}',
  'Hi {{prospect_name}}, I hope this message finds you well. I''d appreciate a few minutes of your time to discuss {{company_insights}}. Would you be open to a brief conversation?',
  'email',
  NULL,
  TRUE,
  TRUE,
  TRUE,
  'formal',
  ARRAY['prospect_name', 'company', 'company_insights']
) ON CONFLICT DO NOTHING;

-- LinkedIn VIP Follow-up
INSERT INTO public.email_templates (
  user_id,
  name,
  description,
  use_case,
  subject_line,
  body,
  channel,
  linkedin_message_preview,
  is_vip_template,
  is_system_template,
  is_active,
  tone,
  variables_required
) VALUES (
  NULL, -- System template
  'LinkedIn VIP Follow-up',
  'Respectful follow-up for engaged VIP prospects',
  'follow_up_engaged',
  NULL, -- LinkedIn doesn't use subjects
  'Thank you for your response, {{prospect_name}}. I''d be happy to share more details. Would you prefer a brief call or email exchange?',
  'linkedin',
  'Thank you for your response, {{prospect_name}}. I''d be happy to share more details. Would you prefer a brief call or email exchange?',
  TRUE,
  TRUE,
  TRUE,
  'formal',
  ARRAY['prospect_name']
) ON CONFLICT DO NOTHING;

