-- No Spray No Pray - Add Prospect Company Fields
-- Migration: 20250111_add_prospect_company_fields
-- Description: Add company-related fields and email_confidence_score to prospects table for comprehensive enrichment

-- =====================================================
-- ADD COLUMNS TO PROSPECTS
-- =====================================================
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS company_website TEXT,
  ADD COLUMN IF NOT EXISTS company_description TEXT,
  ADD COLUMN IF NOT EXISTS email_confidence_score INTEGER CHECK (email_confidence_score >= 0 AND email_confidence_score <= 100);

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prospects_company_linkedin_url ON public.prospects(company_linkedin_url) WHERE company_linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_company_website ON public.prospects(company_website) WHERE company_website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_email_confidence ON public.prospects(email_confidence_score DESC) WHERE email_confidence_score IS NOT NULL;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN public.prospects.company_linkedin_url IS 'LinkedIn company page URL extracted via UniPil API';
COMMENT ON COLUMN public.prospects.company_website IS 'Company website URL extracted from LinkedIn company page or direct scraping';
COMMENT ON COLUMN public.prospects.company_description IS 'Company description extracted from LinkedIn company page';
COMMENT ON COLUMN public.prospects.email_confidence_score IS 'Email finder confidence score (0-100) indicating likelihood that found email is correct';





