-- Humanness Testing Framework - Panelists Table
-- Migration: 20250116_create_humanness_test_panelists
-- Description: Create humanness_test_panelists table for test participants

CREATE TABLE public.humanness_test_panelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.humanness_tests(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  industry TEXT,
  country TEXT DEFAULT 'FR', -- Target: French SMB owners/founders
  role TEXT CHECK (role IN ('owner', 'founder', 'ceo', 'cto', 'cmo', 'decision_maker')),
  recruitment_status TEXT DEFAULT 'pending' CHECK (recruitment_status IN ('pending', 'invited', 'accepted', 'completed', 'declined')),
  invitation_sent_at TIMESTAMPTZ,
  test_completed_at TIMESTAMPTZ,
  compensation_offered TEXT, -- e.g., "€50 Amazon voucher"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, email)
);

CREATE INDEX idx_humanness_test_panelists_test_id ON public.humanness_test_panelists(test_id);
CREATE INDEX idx_humanness_test_panelists_status ON public.humanness_test_panelists(recruitment_status);
CREATE INDEX idx_humanness_test_panelists_email ON public.humanness_test_panelists(email);

-- RLS Policies
ALTER TABLE public.humanness_test_panelists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view panelists for their tests"
  ON public.humanness_test_panelists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_panelists.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create panelists for their tests"
  ON public.humanness_test_panelists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_panelists.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update panelists for their tests"
  ON public.humanness_test_panelists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.humanness_tests
      WHERE humanness_tests.id = humanness_test_panelists.test_id
      AND humanness_tests.created_by = auth.uid()
    )
  );



