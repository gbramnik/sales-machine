-- Humanness Testing Framework - Test Messages Table
-- Migration: 20250116_create_humanness_test_messages
-- Description: Create humanness_test_messages table for test messages (AI and human)

CREATE TABLE public.humanness_test_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.humanness_tests(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('ai_generated', 'human_written')),
  ai_prompting_strategy TEXT, -- NULL for human_written, strategy name for AI (e.g., 'strategy_1', 'strategy_2')
  channel TEXT NOT NULL CHECK (channel IN ('linkedin', 'email')),
  subject TEXT, -- NULL for LinkedIn, required for email
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL, -- If AI used template
  message_order INTEGER, -- Order in shuffled test set
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb -- Store enrichment context, prospect details used
);

CREATE INDEX idx_humanness_test_messages_test_id ON public.humanness_test_messages(test_id);
CREATE INDEX idx_humanness_test_messages_type ON public.humanness_test_messages(message_type);
CREATE INDEX idx_humanness_test_messages_strategy ON public.humanness_test_messages(ai_prompting_strategy);
CREATE INDEX idx_humanness_test_messages_order ON public.humanness_test_messages(test_id, message_order);

-- RLS Policies
ALTER TABLE public.humanness_test_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their tests"
  ON public.humanness_test_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_messages.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their tests"
  ON public.humanness_test_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_messages.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

-- Allow panelists to view messages (for test interface)
CREATE POLICY "Panelists can view messages for their assigned tests"
  ON public.humanness_test_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_test_panelists
      WHERE humanness_test_panelists.test_id = humanness_test_messages.test_id
      AND humanness_test_panelists.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

