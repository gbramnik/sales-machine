-- Humanness Testing Framework - Test Responses Table
-- Migration: 20250116_create_humanness_test_responses
-- Description: Create humanness_test_responses table for panelist responses

CREATE TABLE public.humanness_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.humanness_tests(id) ON DELETE CASCADE,
  panelist_id UUID NOT NULL REFERENCES public.humanness_test_panelists(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.humanness_test_messages(id) ON DELETE CASCADE,
  identified_as_ai BOOLEAN NOT NULL, -- True if panelist identified message as AI
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5), -- 1=very unsure, 5=very confident
  reasoning TEXT, -- Optional: Why they identified it as AI/human
  response_time_seconds INTEGER, -- Time taken to respond
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(panelist_id, message_id) -- One response per panelist per message
);

CREATE INDEX idx_humanness_test_responses_test_id ON public.humanness_test_responses(test_id);
CREATE INDEX idx_humanness_test_responses_panelist_id ON public.humanness_test_responses(panelist_id);
CREATE INDEX idx_humanness_test_responses_message_id ON public.humanness_test_responses(message_id);

-- RLS Policies
ALTER TABLE public.humanness_test_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses for their tests"
  ON public.humanness_test_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_responses.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Panelists can create responses for their assigned tests"
  ON public.humanness_test_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.humanness_test_panelists
      WHERE humanness_test_panelists.id = humanness_test_responses.panelist_id
      AND humanness_test_panelists.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Panelists can update their own responses"
  ON public.humanness_test_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_test_panelists
      WHERE humanness_test_panelists.id = humanness_test_responses.panelist_id
      AND humanness_test_panelists.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

