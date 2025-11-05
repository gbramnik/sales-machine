-- No Spray No Pray - Add Enrichment Fields
-- Migration: 20250111_add_enrichment_fields
-- Description: Add company_insights and enrichment_source fields to prospect_enrichment table for multi-source enrichment tracking

-- =====================================================
-- ADD COLUMNS TO PROSPECT_ENRICHMENT
-- =====================================================
ALTER TABLE public.prospect_enrichment
  ADD COLUMN IF NOT EXISTS company_insights TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_source TEXT CHECK (enrichment_source IN ('linkedin_only', 'linkedin_company', 'linkedin_company_web', 'full'));

-- =====================================================
-- UPDATE EXISTING RECORDS
-- =====================================================
-- Set default enrichment_source for existing records
UPDATE public.prospect_enrichment
SET enrichment_source = 'linkedin_only'
WHERE enrichment_source IS NULL;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN public.prospect_enrichment.company_insights IS 'Company-level insights extracted from LinkedIn company page and website scraping';
COMMENT ON COLUMN public.prospect_enrichment.enrichment_source IS 'Source of enrichment data: linkedin_only, linkedin_company (profile + company), linkedin_company_web (+ web scraping), full (+ email finder)';

