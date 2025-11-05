-- Add deliverability metrics to campaigns table
-- Migration: 20250111_add_campaign_deliverability_fields
-- Description: Add bounce_rate and spam_complaint_rate for Story 1.5 deliverability monitoring

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS bounce_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounce_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_complaint_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_complaint_rate DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN public.campaigns.bounce_count IS 'Total number of bounced emails';
COMMENT ON COLUMN public.campaigns.bounce_rate IS 'Bounce rate percentage (bounce_count / total_sent * 100)';
COMMENT ON COLUMN public.campaigns.spam_complaint_count IS 'Total number of spam complaints';
COMMENT ON COLUMN public.campaigns.spam_complaint_rate IS 'Spam complaint rate percentage (spam_complaint_count / total_sent * 100)';

