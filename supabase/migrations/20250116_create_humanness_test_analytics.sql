-- Humanness Testing Framework - Test Analytics Table
-- Migration: 20250116_create_humanness_test_analytics
-- Description: Create humanness_test_analytics table for detection rate metrics

CREATE TABLE public.humanness_test_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.humanness_tests(id) ON DELETE CASCADE,
  ai_prompting_strategy TEXT, -- NULL for overall metrics
  total_messages INTEGER NOT NULL,
  ai_messages_count INTEGER NOT NULL,
  human_messages_count INTEGER NOT NULL,
  ai_correctly_identified INTEGER NOT NULL DEFAULT 0, -- How many AI messages were correctly identified as AI
  ai_incorrectly_identified_as_human INTEGER NOT NULL DEFAULT 0, -- AI messages identified as human (good!)
  human_incorrectly_identified_as_ai INTEGER NOT NULL DEFAULT 0, -- Human messages identified as AI (false positive)
  detection_rate DECIMAL(5,2) NOT NULL, -- Percentage: (ai_correctly_identified / ai_messages_count) * 100
  false_positive_rate DECIMAL(5,2) NOT NULL, -- Percentage: (human_incorrectly_identified_as_ai / human_messages_count) * 100
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, ai_prompting_strategy)
);

CREATE INDEX idx_humanness_test_analytics_test_id ON public.humanness_test_analytics(test_id);
CREATE INDEX idx_humanness_test_analytics_strategy ON public.humanness_test_analytics(ai_prompting_strategy);

-- RLS Policies
ALTER TABLE public.humanness_test_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their tests"
  ON public.humanness_test_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_analytics.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "System can create analytics for tests"
  ON public.humanness_test_analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_analytics.test_id
    )
  );

CREATE POLICY "System can update analytics for tests"
  ON public.humanness_test_analytics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_analytics.test_id
    )
  );



