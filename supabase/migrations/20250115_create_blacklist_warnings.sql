-- ============================================================================
-- Blacklist Warnings Table
-- Story: 2.3 Fact-Checking & Topic Blacklist
-- Description: Tracks repeated violations per prospect for escalation (3+ violations trigger escalation)
-- ============================================================================

CREATE TABLE public.blacklist_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  violation_category TEXT NOT NULL,
  violation_count INTEGER DEFAULT 1,
  first_violation_at TIMESTAMPTZ DEFAULT NOW(),
  last_violation_at TIMESTAMPTZ DEFAULT NOW(),
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  UNIQUE(user_id, prospect_id, violation_category)
);

-- Indexes for performance
CREATE INDEX idx_blacklist_warnings_user_prospect ON public.blacklist_warnings(user_id, prospect_id);
CREATE INDEX idx_blacklist_warnings_escalated ON public.blacklist_warnings(escalated) WHERE escalated = TRUE;

-- Comments
COMMENT ON TABLE public.blacklist_warnings IS 'Tracks repeated violations per prospect. Escalates to user review after 3+ violations.';
COMMENT ON COLUMN public.blacklist_warnings.violation_count IS 'Number of times this violation category has occurred for this prospect';
COMMENT ON COLUMN public.blacklist_warnings.escalated IS 'TRUE if violation_count >= 3, triggering urgent review';

