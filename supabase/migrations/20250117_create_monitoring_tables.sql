-- Sales Machine - Monitoring Tables Migration
-- Migration: 20250117_create_monitoring_tables
-- Description: Create tables for application monitoring and alerting (Story 6.1)
-- Dependencies: Story 6.1 Application Monitoring & Alerting

-- =====================================================
-- WORKFLOW_EXECUTION_METRICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workflow_execution_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL,
  total_executions INTEGER NOT NULL DEFAULT 0,
  failed_executions INTEGER NOT NULL DEFAULT 0,
  failure_rate DECIMAL(5,2) NOT NULL,
  top_failed_workflows JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_workflow_metrics_timestamp 
  ON public.workflow_execution_metrics(timestamp DESC);

-- =====================================================
-- COST_MONITORING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cost_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  supabase_cost DECIMAL(10,2) DEFAULT 0,
  upstash_cost DECIMAL(10,2) DEFAULT 0,
  claude_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  alerts_sent JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_cost_monitoring_date 
  ON public.cost_monitoring(date DESC);

-- =====================================================
-- WEEKLY_METRICS_SUMMARY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weekly_metrics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start_date DATE UNIQUE NOT NULL,
  uptime_percentage DECIMAL(5,2),
  error_rate DECIMAL(5,2),
  user_growth INTEGER DEFAULT 0,
  workflow_failure_rate DECIMAL(5,2),
  total_cost DECIMAL(10,2),
  summary_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for week-based queries
CREATE INDEX IF NOT EXISTS idx_weekly_summary_week 
  ON public.weekly_metrics_summary(week_start_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.workflow_execution_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_metrics_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can SELECT (read-only access for monitoring dashboards)
-- Note: In practice, these tables are primarily accessed by service role for automated workflows
-- Admin access can be granted via service role or specific user roles
CREATE POLICY "Admin can view workflow metrics" 
  ON public.workflow_execution_metrics
  FOR SELECT
  USING (true); -- TODO: Replace with actual admin check if needed

CREATE POLICY "Admin can view cost monitoring" 
  ON public.cost_monitoring
  FOR SELECT
  USING (true); -- TODO: Replace with actual admin check if needed

CREATE POLICY "Admin can view weekly summary" 
  ON public.weekly_metrics_summary
  FOR SELECT
  USING (true); -- TODO: Replace with actual admin check if needed

-- Policy: Service role can INSERT/UPDATE (for automated workflows)
-- Service role has full access via service_role key (bypasses RLS)
-- No explicit policy needed - service role bypasses RLS by default

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.workflow_execution_metrics IS 'N8N workflow execution metrics for monitoring failure rates (Story 6.1)';
COMMENT ON TABLE public.cost_monitoring IS 'Daily cost tracking for Supabase, Upstash, and Claude API (Story 6.1)';
COMMENT ON TABLE public.weekly_metrics_summary IS 'Weekly aggregated metrics summary for email reports (Story 6.1)';

COMMENT ON COLUMN public.workflow_execution_metrics.top_failed_workflows IS 'JSONB array of top failed workflows with error details';
COMMENT ON COLUMN public.cost_monitoring.alerts_sent IS 'JSONB array of alerts sent when thresholds exceeded';
COMMENT ON COLUMN public.weekly_metrics_summary.summary_email_sent_at IS 'Timestamp when weekly summary email was sent';



