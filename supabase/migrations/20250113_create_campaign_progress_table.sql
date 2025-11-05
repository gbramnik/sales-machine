-- Create campaign_progress table for Story 1.12: Campaign Management API
-- Tracks real-time progress metrics for campaigns

CREATE TABLE IF NOT EXISTS public.campaign_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Progress metrics
  total INTEGER DEFAULT 0,
  processed INTEGER DEFAULT 0,
  succeeded INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  completed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  last_batch_at TIMESTAMPTZ,
  next_batch_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(campaign_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_campaign_progress_campaign ON public.campaign_progress(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_user ON public.campaign_progress(user_id);

-- Add RLS policies
ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own campaign progress"
  ON public.campaign_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_campaign_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_progress_updated_at
  BEFORE UPDATE ON public.campaign_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_progress_updated_at();

-- Add comment
COMMENT ON TABLE public.campaign_progress IS 'Tracks real-time progress metrics for campaigns (Story 1.12)';

