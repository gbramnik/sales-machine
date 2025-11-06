-- Create onboarding_sessions table for Story 5.1: Onboarding Wizard (Backend)
-- Migration: 20250117_create_onboarding_sessions

CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_step TEXT DEFAULT 'goal_selection' CHECK (current_step IN ('goal_selection', 'industry', 'icp', 'domain', 'calendar', 'complete')),
  goal_meetings_per_month TEXT CHECK (goal_meetings_per_month IN ('5-10', '10-20', '20-30')),
  industry TEXT,
  icp_config JSONB, -- Stores auto-suggested ICP config
  domain_verified BOOLEAN DEFAULT FALSE,
  domain_verification_details JSONB, -- Stores SPF/DKIM/DMARC status
  calendar_connected BOOLEAN DEFAULT FALSE,
  calendar_provider TEXT CHECK (calendar_provider IN ('google', 'outlook')),
  calendar_access_token TEXT, -- Encrypted at application layer
  calendar_refresh_token TEXT, -- Encrypted at application layer
  calendar_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- For OAuth state, etc.
  preflight_checklist JSONB DEFAULT '{}'::jsonb, -- Stores checklist status
  auto_config_applied BOOLEAN DEFAULT FALSE, -- Whether auto-config has been applied
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON public.onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON public.onboarding_sessions(status);

-- Enable RLS
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own onboarding sessions
CREATE POLICY "Users can only access their own onboarding sessions"
  ON public.onboarding_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.onboarding_sessions IS 'Stores onboarding wizard session state for each user';
COMMENT ON COLUMN public.onboarding_sessions.calendar_access_token IS 'Encrypted at application layer before storage';
COMMENT ON COLUMN public.onboarding_sessions.calendar_refresh_token IS 'Encrypted at application layer before storage';

