-- Sales Machine - Performance Indexes Migration
-- Migration: 20250117_add_performance_indexes
-- Description: Add missing performance indexes for frequently queried fields (Story 6.3)
-- Dependencies: Story 6.3 Load Testing & Performance Validation

-- =====================================================
-- ADD MISSING INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Prospects table: Add created_at index (missing from initial schema)
-- This index is critical for sorting and date filtering queries
CREATE INDEX IF NOT EXISTS idx_prospects_created_at 
  ON public.prospects(created_at DESC);

-- Note: Other indexes already exist in initial_schema.sql:
-- - idx_prospects_user_id (exists)
-- - idx_prospects_status (exists)
-- - idx_prospects_user_campaign (composite, exists)
-- - idx_campaigns_user_id (exists)
-- - idx_campaigns_status (exists)
-- - idx_campaigns_created_at (exists)
-- - idx_meetings_user_id (exists)
-- - idx_meetings_status (exists)
-- - idx_meetings_scheduled_at (exists)
-- - idx_conversation_user_id (exists)
-- - idx_conversation_prospect_id (exists)
-- - idx_conversation_created_at (exists)

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify indexes were created (run in Supabase SQL Editor to check)
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('prospects', 'campaigns', 'meetings', 'ai_conversation_log')
-- ORDER BY tablename, indexname;

