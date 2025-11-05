-- Add domain warm-up and verification fields to users table
-- Migration: 20250111_add_domain_warmup_fields
-- Description: Add domain_warmup_started_at and domain_verification_status for Story 1.5

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS domain_warmup_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS domain_verification_status JSONB DEFAULT '{"spf": false, "dkim": false, "dmarc": false, "verified_at": null}'::jsonb;

COMMENT ON COLUMN public.users.domain_warmup_started_at IS 'Timestamp when domain warm-up period started (14-21 days required)';
COMMENT ON COLUMN public.users.domain_verification_status IS 'DNS verification status: SPF, DKIM, DMARC records';

