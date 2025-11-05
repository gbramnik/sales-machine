-- Story 1.2 - Add company_data JSONB to prospect_enrichment
-- Migration: 20250112_add_company_data_to_enrichment
-- Description: Add company_data JSONB field to prospect_enrichment table for storing comprehensive company information from LinkedIn company pages and web scraping

-- =====================================================
-- ADD COMPANY_DATA COLUMN TO PROSPECT_ENRICHMENT
-- =====================================================
ALTER TABLE public.prospect_enrichment
  ADD COLUMN IF NOT EXISTS company_data JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- ADD INDEX FOR JSONB QUERIES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prospect_enrichment_company_data 
  ON public.prospect_enrichment USING GIN (company_data);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN public.prospect_enrichment.company_data IS 'Company data from LinkedIn company page and web scraping. Structure: { linkedin_url, description, industry, size, headquarters, website_url, website_description, products_services, recent_news, contact_info }';

