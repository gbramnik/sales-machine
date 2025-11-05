-- No Spray No Pray - Make subject_line nullable for LinkedIn templates
-- Migration: 20250111_make_subject_line_nullable
-- Description: Make subject_line nullable to support LinkedIn templates (which don't use subject lines)

-- =====================================================
-- ALTER SUBJECT_LINE COLUMN
-- =====================================================
ALTER TABLE public.email_templates
  ALTER COLUMN subject_line DROP NOT NULL;

-- =====================================================
-- UPDATE EXISTING TEMPLATES
-- =====================================================
-- Set subject_line to NULL for any LinkedIn-only templates (if they exist)
UPDATE public.email_templates
SET subject_line = NULL
WHERE channel = 'linkedin' AND subject_line IS NOT NULL;

COMMENT ON COLUMN public.email_templates.subject_line IS 'Email subject line (nullable for LinkedIn templates which do not use subject lines)';

