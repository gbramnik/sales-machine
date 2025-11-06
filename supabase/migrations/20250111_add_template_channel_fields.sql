-- No Spray No Pray - Add Template Channel Fields
-- Migration: 20250111_add_template_channel_fields
-- Description: Add channel and linkedin_message_preview fields to email_templates table for LinkedIn + Email support

-- =====================================================
-- ADD COLUMNS TO EMAIL_TEMPLATES
-- =====================================================
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email' CHECK (channel IN ('linkedin', 'email', 'both')),
  ADD COLUMN IF NOT EXISTS linkedin_message_preview TEXT;

-- =====================================================
-- UPDATE EXISTING RECORDS
-- =====================================================
-- Set default channel for existing records (assume email-only for backward compatibility)
UPDATE public.email_templates
SET channel = 'email'
WHERE channel IS NULL;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN public.email_templates.channel IS 'Channel for template: linkedin (LinkedIn message only), email (email only), both (can be used for both)';
COMMENT ON COLUMN public.email_templates.linkedin_message_preview IS 'LinkedIn message preview text (max 300 chars for LinkedIn connection requests)';



