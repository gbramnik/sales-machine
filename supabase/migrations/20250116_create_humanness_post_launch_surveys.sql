-- Humanness Testing Framework - Post-Launch Surveys Table
-- Migration: 20250116_create_humanness_post_launch_surveys
-- Description: Create humanness_post_launch_surveys table for quarterly tracking

CREATE TABLE public.humanness_post_launch_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  survey_period TEXT NOT NULL, -- e.g., "2025-Q1", "2025-Q2"
  question_1_detection_mentioned BOOLEAN, -- "Have prospects mentioned detecting automation?"
  question_1_details TEXT, -- Optional: Details if yes
  question_2_response_rate DECIMAL(5,2), -- Response rate per 100 messages
  question_3_feedback TEXT, -- Optional: General feedback
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, survey_period)
);

CREATE INDEX idx_humanness_post_launch_surveys_user_id ON public.humanness_post_launch_surveys(user_id);
CREATE INDEX idx_humanness_post_launch_surveys_period ON public.humanness_post_launch_surveys(survey_period);

-- RLS Policies
ALTER TABLE public.humanness_post_launch_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own surveys"
  ON public.humanness_post_launch_surveys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own surveys"
  ON public.humanness_post_launch_surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON public.humanness_post_launch_surveys FOR UPDATE
  USING (auth.uid() = user_id);

