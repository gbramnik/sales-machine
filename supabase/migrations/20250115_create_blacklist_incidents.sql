-- ============================================================================
-- Blacklist Incidents Table
-- Story: 2.3 Fact-Checking & Topic Blacklist
-- Description: Tracks blacklist violations for analytics and monitoring
-- ============================================================================

CREATE TABLE public.blacklist_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  review_queue_id UUID REFERENCES public.ai_review_queue(id) ON DELETE SET NULL,
  violation_category TEXT NOT NULL,
  blacklisted_phrase TEXT NOT NULL,
  matched_text TEXT,
  message_preview TEXT,
  severity TEXT DEFAULT 'block',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_blacklist_incidents_user_id ON public.blacklist_incidents(user_id);
CREATE INDEX idx_blacklist_incidents_prospect_id ON public.blacklist_incidents(prospect_id);
CREATE INDEX idx_blacklist_incidents_category ON public.blacklist_incidents(violation_category);
CREATE INDEX idx_blacklist_incidents_created_at ON public.blacklist_incidents(created_at DESC);

-- Comments
COMMENT ON TABLE public.blacklist_incidents IS 'Tracks blacklist violations for analytics and monitoring';
COMMENT ON COLUMN public.blacklist_incidents.matched_text IS 'The actual text that matched the blacklisted phrase';
COMMENT ON COLUMN public.blacklist_incidents.message_preview IS 'First 200 characters of the blocked message';

