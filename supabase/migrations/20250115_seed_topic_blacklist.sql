-- ============================================================================
-- Seed System-Wide Topic Blacklist
-- Story: 2.3 Fact-Checking & Topic Blacklist
-- Description: Insert default blacklisted phrases that apply to all users
-- ============================================================================

-- Pricing-related phrases
INSERT INTO public.topic_blacklist (user_id, topic_category, blacklisted_phrase, severity) VALUES
  (NULL, 'pricing', 'best price', 'block'),
  (NULL, 'pricing', 'lowest cost', 'block'),
  (NULL, 'pricing', 'cheapest', 'block'),
  (NULL, 'pricing', 'discount', 'block'),
  (NULL, 'pricing', 'special offer', 'block'),
  (NULL, 'pricing', 'pricing', 'review'), -- Review instead of block (may be contextually appropriate)
  (NULL, 'pricing', 'cost', 'review'),
  (NULL, 'pricing', 'price', 'review')
ON CONFLICT (user_id, blacklisted_phrase) DO NOTHING;

-- Guarantee-related phrases
INSERT INTO public.topic_blacklist (user_id, topic_category, blacklisted_phrase, severity) VALUES
  (NULL, 'guarantee', 'guarantee', 'block'),
  (NULL, 'guarantee', 'guaranteed', 'block'),
  (NULL, 'guarantee', 'promise', 'block'),
  (NULL, 'guarantee', 'assure', 'block'),
  (NULL, 'guarantee', 'certain', 'block'),
  (NULL, 'guarantee', 'definitely', 'block')
ON CONFLICT (user_id, blacklisted_phrase) DO NOTHING;

-- Competitor-related phrases
INSERT INTO public.topic_blacklist (user_id, topic_category, blacklisted_phrase, severity) VALUES
  (NULL, 'competitor', 'competitor', 'block'),
  (NULL, 'competitor', 'competition', 'block'),
  (NULL, 'competitor', 'better than', 'block'),
  (NULL, 'competitor', 'worse than', 'block'),
  (NULL, 'competitor', 'vs', 'block'),
  (NULL, 'competitor', 'versus', 'block'),
  (NULL, 'competitor', 'compared to', 'review') -- Review instead of block (may be neutral comparison)
ON CONFLICT (user_id, blacklisted_phrase) DO NOTHING;

-- Unverified claims (will be fact-checked against enrichment data)
INSERT INTO public.topic_blacklist (user_id, topic_category, blacklisted_phrase, severity) VALUES
  (NULL, 'unverified_claim', 'recent funding', 'review'), -- Review: verify against enrichment
  (NULL, 'unverified_claim', 'just raised', 'review'),
  (NULL, 'unverified_claim', 'new product launch', 'review'),
  (NULL, 'unverified_claim', 'expansion', 'review'),
  (NULL, 'unverified_claim', 'growth', 'review')
ON CONFLICT (user_id, blacklisted_phrase) DO NOTHING;

