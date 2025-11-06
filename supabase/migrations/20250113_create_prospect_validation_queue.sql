-- Create prospect_validation_queue table for Story 1.10: Daily Prospect Detection & Filtering
-- Tracks prospects pending user validation in semi-auto mode

CREATE TABLE IF NOT EXISTS public.prospect_validation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES public.users(id),
  
  -- Constraints
  UNIQUE(prospect_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_validation_queue_user ON public.prospect_validation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_queue_status ON public.prospect_validation_queue(status);
CREATE INDEX IF NOT EXISTS idx_validation_queue_prospect ON public.prospect_validation_queue(prospect_id);
CREATE INDEX IF NOT EXISTS idx_validation_queue_pending ON public.prospect_validation_queue(user_id, status) WHERE status = 'pending';

-- Add RLS policies
ALTER TABLE public.prospect_validation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own validation queue"
  ON public.prospect_validation_queue
  FOR ALL
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_prospect_validation_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.validated_at = COALESCE(NEW.validated_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospect_validation_queue_updated_at
  BEFORE UPDATE ON public.prospect_validation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_prospect_validation_queue_updated_at();

-- Add comment
COMMENT ON TABLE public.prospect_validation_queue IS 'Tracks prospects pending user validation in semi-auto mode (Story 1.10)';


