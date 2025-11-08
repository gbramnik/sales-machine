-- Humanness Testing Framework - Core Test Table
-- Migration: 20250116_create_humanness_tests
-- Description: Create humanness_tests table for perception panel tests

CREATE TABLE public.humanness_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL,
  test_version TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('perception_panel', 'post_launch_survey', 'response_rate_tracking')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  target_detection_rate DECIMAL(5,2) DEFAULT 20.00, -- Target <20%
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb -- Store test configuration
);

CREATE INDEX idx_humanness_tests_status ON public.humanness_tests(status);
CREATE INDEX idx_humanness_tests_type ON public.humanness_tests(test_type);
CREATE INDEX idx_humanness_tests_created_by ON public.humanness_tests(created_by);

-- RLS Policies
ALTER TABLE public.humanness_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tests"
  ON public.humanness_tests FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own tests"
  ON public.humanness_tests FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tests"
  ON public.humanness_tests FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tests"
  ON public.humanness_tests FOR DELETE
  USING (auth.uid() = created_by);



