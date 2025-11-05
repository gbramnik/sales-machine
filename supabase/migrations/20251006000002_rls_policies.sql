-- Sales Machine - Row Level Security Policies
-- Migration: 20251006000002_rls_policies
-- Description: Enable RLS and create policies for multi-tenant data isolation

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_enrichment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users are automatically created via trigger (handled by Supabase Auth)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- CAMPAIGNS TABLE POLICIES
-- =====================================================

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create campaigns
CREATE POLICY "Users can create campaigns"
  ON public.campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PROSPECTS TABLE POLICIES
-- =====================================================

-- Users can view their own prospects
CREATE POLICY "Users can view own prospects"
  ON public.prospects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create prospects
CREATE POLICY "Users can create prospects"
  ON public.prospects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prospects
CREATE POLICY "Users can update own prospects"
  ON public.prospects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own prospects (GDPR)
CREATE POLICY "Users can delete own prospects"
  ON public.prospects
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PROSPECT_ENRICHMENT TABLE POLICIES
-- =====================================================

-- Users can view enrichment for their prospects
CREATE POLICY "Users can view own enrichment"
  ON public.prospect_enrichment
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.prospects
      WHERE prospects.id = prospect_enrichment.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

-- Users can create enrichment data
CREATE POLICY "Users can create enrichment"
  ON public.prospect_enrichment
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update enrichment data
CREATE POLICY "Users can update enrichment"
  ON public.prospect_enrichment
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete enrichment data
CREATE POLICY "Users can delete enrichment"
  ON public.prospect_enrichment
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- EMAIL_TEMPLATES TABLE POLICIES
-- =====================================================

-- Users can view their own templates + system templates
CREATE POLICY "Users can view own and system templates"
  ON public.email_templates
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_system_template = TRUE
    OR user_id IS NULL  -- Public templates
  );

-- Users can create templates
CREATE POLICY "Users can create templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates (not system templates)
CREATE POLICY "Users can update own templates"
  ON public.email_templates
  FOR UPDATE
  USING (auth.uid() = user_id AND is_system_template = FALSE);

-- Users can delete their own templates (not system templates)
CREATE POLICY "Users can delete own templates"
  ON public.email_templates
  FOR DELETE
  USING (auth.uid() = user_id AND is_system_template = FALSE);

-- =====================================================
-- AI_CONVERSATION_LOG TABLE POLICIES
-- =====================================================

-- Users can view their conversation logs
CREATE POLICY "Users can view own conversations"
  ON public.ai_conversation_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users/System can create conversation logs
CREATE POLICY "Users can create conversations"
  ON public.ai_conversation_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No updates allowed (audit trail)
-- No deletes allowed (audit trail, GDPR handled via cascade)

-- =====================================================
-- MEETINGS TABLE POLICIES
-- =====================================================

-- Users can view their meetings
CREATE POLICY "Users can view own meetings"
  ON public.meetings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create meetings
CREATE POLICY "Users can create meetings"
  ON public.meetings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their meetings
CREATE POLICY "Users can update own meetings"
  ON public.meetings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their meetings
CREATE POLICY "Users can delete own meetings"
  ON public.meetings
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- AI_REVIEW_QUEUE TABLE POLICIES
-- =====================================================

-- Users can view their review queue
CREATE POLICY "Users can view own review queue"
  ON public.ai_review_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create review items
CREATE POLICY "Users can create review items"
  ON public.ai_review_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update review items (approve/reject/edit)
CREATE POLICY "Users can update review items"
  ON public.ai_review_queue
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete review items
CREATE POLICY "Users can delete review items"
  ON public.ai_review_queue
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- AUDIT_LOG TABLE POLICIES
-- =====================================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = performed_by);

-- System can create audit logs (no user INSERT policy - handled by triggers/backend)
-- No updates allowed (immutable audit trail)
-- No deletes allowed (immutable audit trail)

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user owns a prospect
CREATE OR REPLACE FUNCTION public.user_owns_prospect(prospect_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.prospects
    WHERE id = prospect_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a campaign
CREATE OR REPLACE FUNCTION public.user_owns_campaign(campaign_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.prospects TO authenticated;
GRANT ALL ON public.prospect_enrichment TO authenticated;
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.ai_conversation_log TO authenticated;
GRANT ALL ON public.meetings TO authenticated;
GRANT ALL ON public.ai_review_queue TO authenticated;
GRANT ALL ON public.audit_log TO authenticated;

-- Grant select on system templates to anon (for marketing pages)
GRANT SELECT ON public.email_templates TO anon;

-- =====================================================
-- REALTIME PUBLICATION (for Activity Stream)
-- =====================================================

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversation_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_review_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospects;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Users can only access their own profile data';
COMMENT ON POLICY "Users can view own campaigns" ON public.campaigns IS 'Multi-tenant isolation: users can only see their campaigns';
COMMENT ON POLICY "Users can view own prospects" ON public.prospects IS 'Multi-tenant isolation: users can only see their prospects';
