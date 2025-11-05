-- No Spray No Pray - Create Companies Table
-- Migration: 20250111_create_companies_table
-- Description: Create companies table for storing company data extracted from LinkedIn company pages and website scraping

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company identification
  company_name TEXT NOT NULL UNIQUE,
  linkedin_url TEXT,
  website TEXT,
  
  -- Company details
  industry TEXT,
  company_size TEXT,
  headquarters TEXT,
  description TEXT,
  
  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_companies_company_name ON public.companies(company_name);
CREATE INDEX idx_companies_linkedin_url ON public.companies(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX idx_companies_website ON public.companies(website) WHERE website IS NOT NULL;
CREATE INDEX idx_companies_industry ON public.companies(industry) WHERE industry IS NOT NULL;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.companies IS 'Company data extracted from LinkedIn company pages and website scraping for enrichment';
COMMENT ON COLUMN public.companies.company_name IS 'Unique company name for deduplication';
COMMENT ON COLUMN public.companies.linkedin_url IS 'LinkedIn company page URL';
COMMENT ON COLUMN public.companies.website IS 'Company website URL';
COMMENT ON COLUMN public.companies.scraped_at IS 'Timestamp when company data was last scraped';

