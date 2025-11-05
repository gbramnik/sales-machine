-- Add settings fields to users table for Story 1.11: Settings Management API
-- Adds email_settings, ai_settings, and detection settings fields

-- Add email_settings JSONB field
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.email_settings IS 'Email configuration settings (domain, warmup, limits, bounce thresholds)';

-- Add ai_settings JSONB field
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.ai_settings IS 'AI agent configuration (personality, tone, confidence threshold, VIP mode)';

-- Add detection settings fields (for Story 1.10: Daily Prospect Detection)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS detection_mode TEXT DEFAULT 'autopilot' CHECK (detection_mode IN ('autopilot', 'semi_auto'));

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS daily_prospect_count INTEGER DEFAULT 20 CHECK (daily_prospect_count >= 1 AND daily_prospect_count <= 40);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS detection_time TEXT DEFAULT '06:00';

COMMENT ON COLUMN public.users.detection_mode IS 'Prospect detection mode: autopilot (auto-add) or semi_auto (requires validation)';
COMMENT ON COLUMN public.users.daily_prospect_count IS 'Number of prospects to detect per day (1-40)';
COMMENT ON COLUMN public.users.detection_time IS 'Time of day to run prospect detection (HH:MM format)';

