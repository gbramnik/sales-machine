-- ============================================================================
-- VIP Mode Complete Migration
-- Story: 2.2 VIP Mode for High-Value Accounts
-- Description: Adds VIP template flag and seeds VIP templates
-- ============================================================================

-- Part 1: Add is_vip_template column to email_templates
-- ============================================================================
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS is_vip_template BOOLEAN DEFAULT FALSE;

-- Add index for VIP template queries
CREATE INDEX IF NOT EXISTS idx_email_templates_is_vip_template 
ON public.email_templates(is_vip_template) 
WHERE is_vip_template = TRUE;

-- Add comment
COMMENT ON COLUMN public.email_templates.is_vip_template IS 'Flag indicating this template is specifically designed for VIP (C-level) prospects. VIP templates have formal tone, shorter length, and soft CTAs.';

-- Part 2: Seed VIP Templates
-- ============================================================================

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

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'email_templates' 
  AND column_name = 'is_vip_template';

-- Verify index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'email_templates' 
  AND indexname = 'idx_email_templates_is_vip_template';

-- Verify VIP templates were inserted
SELECT name, use_case, channel, is_vip_template, is_system_template
FROM email_templates
WHERE is_vip_template = TRUE
ORDER BY use_case, channel;

