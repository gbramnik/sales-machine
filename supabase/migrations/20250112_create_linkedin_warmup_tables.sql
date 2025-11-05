-- Sales Machine - LinkedIn Warm-up Tables
-- Migration: 20250112_create_linkedin_warmup_tables
-- Description: Create tables for LinkedIn warm-up workflow tracking and actions

-- =====================================================
-- LINKEDIN_WARMUP_SCHEDULE TABLE
-- =====================================================
CREATE TABLE public.linkedin_warmup_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Warm-up timeline
  warmup_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  connection_ready_at TIMESTAMPTZ NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'warmup_in_progress' CHECK (status IN ('warmup_in_progress', 'ready_for_connection', 'completed', 'skipped')),
  
  -- Action counters
  actions_today INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  last_action_at TIMESTAMPTZ,
  
  -- Connection tracking
  connection_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_prospect_warmup UNIQUE (prospect_id, user_id)
);

-- =====================================================
-- LINKEDIN_WARMUP_ACTIONS TABLE
-- =====================================================
CREATE TABLE public.linkedin_warmup_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'comment')),
  target_post_url TEXT,
  target_author_linkedin_url TEXT,
  
  -- Execution tracking
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Warmup schedule indexes
CREATE INDEX idx_warmup_schedule_prospect ON public.linkedin_warmup_schedule(prospect_id);
CREATE INDEX idx_warmup_schedule_user ON public.linkedin_warmup_schedule(user_id);
CREATE INDEX idx_warmup_schedule_status ON public.linkedin_warmup_schedule(status);
CREATE INDEX idx_warmup_schedule_ready_at ON public.linkedin_warmup_schedule(connection_ready_at);

-- Warmup actions indexes
CREATE INDEX idx_warmup_actions_prospect ON public.linkedin_warmup_actions(prospect_id);
CREATE INDEX idx_warmup_actions_user ON public.linkedin_warmup_actions(user_id);
CREATE INDEX idx_warmup_actions_executed ON public.linkedin_warmup_actions(executed_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.linkedin_warmup_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_warmup_actions ENABLE ROW LEVEL SECURITY;

-- Warmup schedule policies
CREATE POLICY "Users can only access their own warm-up schedules"
  ON public.linkedin_warmup_schedule
  FOR ALL
  USING (auth.uid() = user_id);

-- Warmup actions policies
CREATE POLICY "Users can only access their own warm-up actions"
  ON public.linkedin_warmup_actions
  FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATE TRIGGER FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_linkedin_warmup_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER linkedin_warmup_schedule_updated_at
  BEFORE UPDATE ON public.linkedin_warmup_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_warmup_schedule_updated_at();

-- =====================================================
-- ADD WARMUP CONFIG FIELDS TO USERS TABLE
-- =====================================================

-- Add warmup configuration fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS warmup_duration_days INTEGER DEFAULT 10 CHECK (warmup_duration_days >= 7 AND warmup_duration_days <= 15),
  ADD COLUMN IF NOT EXISTS daily_likes_limit INTEGER DEFAULT 20 CHECK (daily_likes_limit >= 20 AND daily_likes_limit <= 40),
  ADD COLUMN IF NOT EXISTS daily_comments_limit INTEGER DEFAULT 20 CHECK (daily_comments_limit >= 20 AND daily_comments_limit <= 40),
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'basic' CHECK (account_type IN ('basic', 'sales_navigator'));

-- Add comments for documentation
COMMENT ON COLUMN public.users.warmup_duration_days IS 'Warm-up period duration in days (7-15, default: 10)';
COMMENT ON COLUMN public.users.daily_likes_limit IS 'Daily LinkedIn likes limit (20-40, default: 20 for basic, 40 for Sales Navigator)';
COMMENT ON COLUMN public.users.daily_comments_limit IS 'Daily LinkedIn comments limit (20-40, default: 20 for basic, 40 for Sales Navigator)';
COMMENT ON COLUMN public.users.account_type IS 'LinkedIn account type: basic or sales_navigator';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.linkedin_warmup_schedule TO authenticated;
GRANT ALL ON public.linkedin_warmup_actions TO authenticated;

-- =====================================================
-- REALTIME PUBLICATION (for Activity Stream)
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_warmup_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_warmup_actions;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.linkedin_warmup_schedule IS 'Tracks warm-up schedule and timeline for each prospect';
COMMENT ON TABLE public.linkedin_warmup_actions IS 'Logs all LinkedIn engagement actions (likes, comments) during warm-up period';
COMMENT ON COLUMN public.linkedin_warmup_schedule.status IS 'warmup_in_progress: Currently warming up, ready_for_connection: Ready to send connection, completed: Connection sent, skipped: No posts/authors found';
COMMENT ON COLUMN public.linkedin_warmup_actions.action_type IS 'Type of engagement: like or comment';
COMMENT ON COLUMN public.linkedin_warmup_actions.target_post_url IS 'Direct URL to the LinkedIn post that was engaged with';
COMMENT ON COLUMN public.linkedin_warmup_actions.target_author_linkedin_url IS 'LinkedIn URL of the author whose post was engaged with (if prospect has no posts)';

