-- ============================================================================
-- Topic Blacklist Table
-- Story: 2.3 Fact-Checking & Topic Blacklist
-- Description: Stores blacklisted phrases for sensitive topics (pricing, guarantees, competitors, unverified claims)
-- ============================================================================

CREATE TABLE public.topic_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_category TEXT NOT NULL CHECK (topic_category IN ('pricing', 'guarantee', 'competitor', 'unverified_claim')),
  blacklisted_phrase TEXT NOT NULL,
  regex_pattern TEXT, -- Optional: custom regex for complex patterns
  severity TEXT DEFAULT 'block' CHECK (severity IN ('block', 'warning', 'review')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blacklisted_phrase)
);

-- Indexes for performance
CREATE INDEX idx_topic_blacklist_user_id ON public.topic_blacklist(user_id);
CREATE INDEX idx_topic_blacklist_category ON public.topic_blacklist(topic_category);
CREATE INDEX idx_topic_blacklist_active ON public.topic_blacklist(is_active) WHERE is_active = TRUE;

-- Add updated_at trigger
CREATE TRIGGER topic_blacklist_updated_at BEFORE UPDATE ON public.topic_blacklist
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.topic_blacklist IS 'Blacklisted phrases for sensitive topics. user_id = NULL means system-wide default.';
COMMENT ON COLUMN public.topic_blacklist.user_id IS 'NULL for system-wide defaults, UUID for user-specific phrases';
COMMENT ON COLUMN public.topic_blacklist.topic_category IS 'Category: pricing, guarantee, competitor, or unverified_claim';
COMMENT ON COLUMN public.topic_blacklist.regex_pattern IS 'Optional custom regex pattern for complex matching (overrides default phrase matching)';
COMMENT ON COLUMN public.topic_blacklist.severity IS 'Action level: block (auto-block), warning (flag), or review (queue for review)';

