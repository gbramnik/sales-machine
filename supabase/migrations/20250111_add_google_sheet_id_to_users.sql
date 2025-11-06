-- Add google_sheet_id field to users table for Story 1.8: Basic Reporting & Metrics
-- This field stores the Google Sheet ID for each user's metrics dashboard

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS google_sheet_id TEXT;

-- Add comment
COMMENT ON COLUMN public.users.google_sheet_id IS 'Google Sheet ID for user metrics dashboard (Story 1.8)';



