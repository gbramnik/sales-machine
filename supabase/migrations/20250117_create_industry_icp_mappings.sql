-- Create industry_icp_mappings table for Story 5.1: Onboarding Wizard (Backend)
-- Migration: 20250117_create_industry_icp_mappings

CREATE TABLE IF NOT EXISTS public.industry_icp_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry TEXT NOT NULL UNIQUE,
  suggested_job_titles TEXT[] NOT NULL, -- Array of job titles
  suggested_company_sizes TEXT[] NOT NULL, -- Array: ['1-10', '11-50', '51-200', '201-500', '500+']
  suggested_locations TEXT[] NOT NULL, -- Array of countries/regions
  suggested_templates TEXT[], -- Array of template IDs or names
  suggested_channels TEXT[] DEFAULT ARRAY['linkedin', 'email'], -- Array: ['linkedin', 'email']
  intent_signals TEXT[], -- Array of intent signal types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_industry_icp_mappings_industry ON public.industry_icp_mappings(industry);

-- Comments
COMMENT ON TABLE public.industry_icp_mappings IS 'Maps industries to suggested ICP configurations for auto-configuration during onboarding';

