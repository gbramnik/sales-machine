-- Add ai_confidence_threshold field to users table for Story 2.1: AI Confidence Scoring System
-- Threshold range: 60-95 (default 80)

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS ai_confidence_threshold INTEGER DEFAULT 80 CHECK (ai_confidence_threshold >= 60 AND ai_confidence_threshold <= 95);

COMMENT ON COLUMN public.users.ai_confidence_threshold IS 'AI confidence threshold for auto-sending messages (60-95, default 80). Messages below threshold are queued for review.';

