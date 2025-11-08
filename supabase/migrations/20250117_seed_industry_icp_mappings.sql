-- Seed industry_icp_mappings with 20 common B2B industries
-- Migration: 20250117_seed_industry_icp_mappings

-- Generic fallback ICP config
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Other',
  ARRAY['CEO', 'CTO', 'VP Engineering', 'Director', 'Manager'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'Canada', 'United Kingdom'],
  ARRAY[]::TEXT[],
  ARRAY['linkedin', 'email'],
  ARRAY['job_postings', 'company_growth', 'funding_announcements']
) ON CONFLICT (industry) DO NOTHING;

-- SaaS & Cloud Software
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'SaaS & Cloud Software',
  ARRAY['CTO', 'VP Engineering', 'VP Product', 'Engineering Director', 'Head of Product'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'Canada', 'United Kingdom', 'Germany', 'France'],
  ARRAY['cold-outreach-saas', 'product-demo-request'],
  ARRAY['linkedin', 'email'],
  ARRAY['job_postings', 'product_launches', 'funding_announcements', 'tech_stack_changes']
) ON CONFLICT (industry) DO NOTHING;

-- Consulting & Professional Services
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Consulting & Professional Services',
  ARRAY['Managing Partner', 'Principal', 'Director', 'Senior Consultant', 'Practice Lead'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'United Kingdom', 'Canada', 'Australia'],
  ARRAY['consulting-intro', 'case-study-share'],
  ARRAY['linkedin', 'email'],
  ARRAY['company_growth', 'new_office_openings', 'service_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Marketing Agencies
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Marketing Agencies',
  ARRAY['Agency Owner', 'Managing Director', 'Head of Growth', 'Marketing Director', 'Account Director'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['agency-partnership', 'client-success-story'],
  ARRAY['linkedin', 'email'],
  ARRAY['new_client_wins', 'service_expansions', 'team_growth']
) ON CONFLICT (industry) DO NOTHING;

-- Financial Services
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Financial Services',
  ARRAY['CFO', 'VP Finance', 'Finance Director', 'Head of Operations', 'Chief Risk Officer'],
  ARRAY['51-200', '201-500', '500+'],
  ARRAY['United States', 'United Kingdom', 'Switzerland', 'Singapore'],
  ARRAY['financial-services-intro', 'compliance-solution'],
  ARRAY['linkedin', 'email'],
  ARRAY['regulatory_changes', 'mergers_acquisitions', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;

-- Healthcare & Medical
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Healthcare & Medical',
  ARRAY['Chief Medical Officer', 'VP Operations', 'Healthcare Administrator', 'Practice Manager', 'Director of IT'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'Canada', 'United Kingdom'],
  ARRAY['healthcare-solution', 'patient-care-improvement'],
  ARRAY['linkedin', 'email'],
  ARRAY['regulatory_changes', 'technology_upgrades', 'facility_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Legal Services
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Legal Services',
  ARRAY['Managing Partner', 'Partner', 'Practice Group Leader', 'Legal Operations Director', 'Chief Operating Officer'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['legal-tech-solution', 'efficiency-improvement'],
  ARRAY['linkedin', 'email'],
  ARRAY['firm_growth', 'technology_upgrades', 'practice_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Real Estate
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Real Estate',
  ARRAY['Broker Owner', 'Managing Broker', 'Real Estate Director', 'Property Manager', 'Operations Manager'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'Canada', 'United Kingdom', 'Australia'],
  ARRAY['real-estate-tech', 'property-management-solution'],
  ARRAY['linkedin', 'email'],
  ARRAY['market_expansions', 'technology_upgrades', 'portfolio_growth']
) ON CONFLICT (industry) DO NOTHING;

-- Manufacturing
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Manufacturing',
  ARRAY['Operations Director', 'VP Operations', 'Plant Manager', 'Supply Chain Director', 'Quality Director'],
  ARRAY['51-200', '201-500', '500+'],
  ARRAY['United States', 'Germany', 'China', 'Mexico'],
  ARRAY['manufacturing-efficiency', 'supply-chain-optimization'],
  ARRAY['linkedin', 'email'],
  ARRAY['facility_expansions', 'technology_upgrades', 'supply_chain_changes']
) ON CONFLICT (industry) DO NOTHING;

-- Retail & E-commerce
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Retail & E-commerce',
  ARRAY['VP E-commerce', 'Head of Digital', 'E-commerce Director', 'Marketing Director', 'Operations Director'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'United Kingdom', 'Canada', 'Australia'],
  ARRAY['ecommerce-growth', 'retail-innovation'],
  ARRAY['linkedin', 'email'],
  ARRAY['new_product_launches', 'marketplace_expansions', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;

-- Education & Training
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Education & Training',
  ARRAY['Dean', 'Director of Education', 'Head of Learning', 'Training Director', 'Academic Director'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'United Kingdom', 'Canada', 'Australia'],
  ARRAY['education-technology', 'learning-platform'],
  ARRAY['linkedin', 'email'],
  ARRAY['curriculum_changes', 'technology_upgrades', 'program_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Technology Services
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Technology Services',
  ARRAY['CTO', 'VP Engineering', 'Technical Director', 'Solutions Architect', 'Engineering Manager'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'Canada', 'United Kingdom', 'India'],
  ARRAY['tech-services-intro', 'digital-transformation'],
  ARRAY['linkedin', 'email'],
  ARRAY['tech_stack_changes', 'project_announcements', 'team_growth']
) ON CONFLICT (industry) DO NOTHING;

-- HR & Recruiting
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'HR & Recruiting',
  ARRAY['VP People', 'Head of HR', 'Talent Acquisition Director', 'HR Director', 'People Operations Manager'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['hr-tech-solution', 'talent-acquisition'],
  ARRAY['linkedin', 'email'],
  ARRAY['hiring_sprees', 'company_growth', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;

-- Accounting & Finance
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Accounting & Finance',
  ARRAY['Managing Partner', 'Partner', 'Firm Administrator', 'Director of Operations', 'Practice Manager'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['accounting-software', 'tax-season-prep'],
  ARRAY['linkedin', 'email'],
  ARRAY['firm_growth', 'technology_upgrades', 'service_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Insurance
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Insurance',
  ARRAY['VP Operations', 'Agency Owner', 'Branch Manager', 'Operations Director', 'Underwriting Director'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['insurance-tech', 'claims-efficiency'],
  ARRAY['linkedin', 'email'],
  ARRAY['regulatory_changes', 'technology_upgrades', 'market_expansions']
) ON CONFLICT (industry) DO NOTHING;

-- Construction
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Construction',
  ARRAY['Project Director', 'Operations Manager', 'General Manager', 'Estimating Director', 'Safety Director'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'Canada', 'United Kingdom', 'Australia'],
  ARRAY['construction-tech', 'project-management'],
  ARRAY['linkedin', 'email'],
  ARRAY['project_wins', 'technology_upgrades', 'safety_improvements']
) ON CONFLICT (industry) DO NOTHING;

-- Logistics & Transportation
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Logistics & Transportation',
  ARRAY['Operations Director', 'VP Logistics', 'Fleet Manager', 'Supply Chain Director', 'Distribution Manager'],
  ARRAY['51-200', '201-500', '500+'],
  ARRAY['United States', 'Canada', 'Germany', 'Netherlands'],
  ARRAY['logistics-optimization', 'fleet-management'],
  ARRAY['linkedin', 'email'],
  ARRAY['route_expansions', 'technology_upgrades', 'fleet_growth']
) ON CONFLICT (industry) DO NOTHING;

-- Energy & Utilities
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Energy & Utilities',
  ARRAY['Operations Director', 'VP Operations', 'Plant Manager', 'Engineering Director', 'Maintenance Director'],
  ARRAY['201-500', '500+'],
  ARRAY['United States', 'Canada', 'United Kingdom', 'Germany'],
  ARRAY['energy-efficiency', 'smart-grid-solution'],
  ARRAY['linkedin', 'email'],
  ARRAY['infrastructure_upgrades', 'renewable_energy_projects', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;

-- Media & Advertising
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Media & Advertising',
  ARRAY['VP Marketing', 'Head of Advertising', 'Media Director', 'Creative Director', 'Account Director'],
  ARRAY['11-50', '51-200', '201-500'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['ad-tech-solution', 'media-buying-platform'],
  ARRAY['linkedin', 'email'],
  ARRAY['campaign_launches', 'client_wins', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;

-- Non-profit
INSERT INTO public.industry_icp_mappings (industry, suggested_job_titles, suggested_company_sizes, suggested_locations, suggested_templates, suggested_channels, intent_signals)
VALUES (
  'Non-profit',
  ARRAY['Executive Director', 'Development Director', 'Program Director', 'Operations Director', 'Communications Director'],
  ARRAY['1-10', '11-50', '51-200'],
  ARRAY['United States', 'United Kingdom', 'Canada'],
  ARRAY['nonprofit-tech', 'donor-management'],
  ARRAY['linkedin', 'email'],
  ARRAY['fundraising_campaigns', 'program_expansions', 'technology_upgrades']
) ON CONFLICT (industry) DO NOTHING;



