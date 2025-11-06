-- Description: Add is_vip_template flag to email_templates table for VIP-specific templates
-- Story: 2.2 VIP Mode for High-Value Accounts

-- Add is_vip_template column
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS is_vip_template BOOLEAN DEFAULT FALSE;

-- Add index for VIP template queries
CREATE INDEX IF NOT EXISTS idx_email_templates_is_vip_template 
ON public.email_templates(is_vip_template) 
WHERE is_vip_template = TRUE;

-- Add comment
COMMENT ON COLUMN public.email_templates.is_vip_template IS 'Flag indicating this template is specifically designed for VIP (C-level) prospects. VIP templates have formal tone, shorter length, and soft CTAs.';

