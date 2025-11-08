-- Sales Machine - GDPR Compliance Fields Migration
-- Migration: 20250117_add_gdpr_fields
-- Description: Add consent tracking and privacy policy acceptance fields (Story 6.2)
-- Dependencies: Story 6.2 GDPR Compliance Implementation

-- =====================================================
-- ADD CONSENT TRACKING TO PROSPECTS TABLE
-- =====================================================

-- Add consent tracking columns to prospects table
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_source TEXT;

-- Add index for consent queries
CREATE INDEX IF NOT EXISTS idx_prospects_consent_given 
  ON public.prospects(consent_given);

-- Add comments for documentation
COMMENT ON COLUMN public.prospects.consent_given IS 'GDPR consent tracking flag - indicates if prospect has given explicit consent for data processing';
COMMENT ON COLUMN public.prospects.consent_date IS 'Timestamp when consent was given (if consent_given = TRUE)';
COMMENT ON COLUMN public.prospects.consent_source IS 'Source of consent: linkedin, email, manual, import, or other';

-- =====================================================
-- ADD PRIVACY POLICY ACCEPTANCE TO USERS TABLE
-- =====================================================

-- Add privacy policy acceptance field to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ;

-- Add index for privacy policy queries
CREATE INDEX IF NOT EXISTS idx_users_privacy_accepted 
  ON public.users(privacy_policy_accepted_at);

-- Add comment for documentation
COMMENT ON COLUMN public.users.privacy_policy_accepted_at IS 'Timestamp when user accepted privacy policy (GDPR compliance)';

-- =====================================================
-- UPDATE EXISTING DATA (Optional - for data migration)
-- =====================================================

-- Set default consent_given = FALSE for existing prospects (if needed)
-- UPDATE public.prospects SET consent_given = FALSE WHERE consent_given IS NULL;

-- Note: Existing prospects will have consent_given = FALSE by default
-- This is correct - they haven't explicitly consented yet

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify columns were added (run in Supabase SQL Editor to check)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'prospects' AND column_name IN ('consent_given', 'consent_date', 'consent_source');

-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'privacy_policy_accepted_at';



