-- Sales Machine - Initial Database Schema
-- Migration: 20251006000001_initial_schema
-- Description: Create all core tables for Sales Machine MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  -- Subscription & limits
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  daily_email_limit INTEGER DEFAULT 20,
  monthly_prospect_limit INTEGER DEFAULT 500,
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  industry TEXT,
  icp_criteria JSONB,
  -- Settings
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =====================================================
-- CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- ICP targeting criteria
  icp_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"industry": "SaaS", "job_titles": ["CTO", "VP Engineering"], "company_size": "50-200", "location": "US"}

  -- Channel configuration
  channels JSONB DEFAULT '{"linkedin": true, "email": true}'::jsonb,

  -- Email configuration
  sending_email_address TEXT,
  email_template_id UUID,
  daily_send_limit INTEGER DEFAULT 20,

  -- Metrics
  total_prospects INTEGER DEFAULT 0,
  contacted_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  qualified_count INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- PROSPECTS TABLE
-- =====================================================
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  -- Prospect details (from LinkedIn scraping)
  full_name TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT NOT NULL,
  linkedin_url TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  location TEXT,
  profile_summary TEXT,

  -- Status & pipeline
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'engaged', 'qualified', 'meeting_booked',
    'meeting_completed', 'customer', 'lost', 'nurture', 'unsubscribed'
  )),
  pipeline_stage TEXT DEFAULT 'contacted',

  -- Flags
  is_vip BOOLEAN DEFAULT FALSE,
  vip_reason TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,

  -- Engagement tracking
  last_contacted_at TIMESTAMPTZ,
  last_replied_at TIMESTAMPTZ,
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,

  -- Metadata
  source TEXT DEFAULT 'linkedin_scrape',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT email_or_linkedin_required CHECK (email IS NOT NULL OR linkedin_url IS NOT NULL)
);

-- =====================================================
-- PROSPECT_ENRICHMENT TABLE
-- =====================================================
CREATE TABLE public.prospect_enrichment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- AI-generated enrichment data
  talking_points JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Recently hired 2 SDRs", "Posted about sales automation challenges"]

  pain_points JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Lead gen scaling", "Time-consuming research"]

  recent_activity TEXT,
  -- Example: "Posted on LinkedIn about onboarding challenges (Oct 2)"

  tech_stack JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Salesforce", "HubSpot", "LinkedIn Sales Navigator"]

  mutual_connections INTEGER DEFAULT 0,
  shared_interests JSONB DEFAULT '[]'::jsonb,

  -- Scoring
  personalization_score INTEGER CHECK (personalization_score >= 0 AND personalization_score <= 100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Metadata
  enriched_at TIMESTAMPTZ DEFAULT NOW(),
  enrichment_version TEXT DEFAULT 'v1',
  claude_model_used TEXT,
  token_count INTEGER,

  -- Unique constraint: one enrichment per prospect
  UNIQUE(prospect_id)
);

-- =====================================================
-- EMAIL_TEMPLATES TABLE
-- =====================================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  use_case TEXT CHECK (use_case IN (
    'cold_intro', 'follow_up_no_reply', 'follow_up_engaged',
    're_engagement', 'meeting_confirmation', 'meeting_reminder', 'custom'
  )),

  -- Email content
  subject_line TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Personalization
  variables_required JSONB DEFAULT '[]'::jsonb,
  -- Example: ["prospect_name", "company", "talking_point_1", "mutual_connection"]

  -- Settings
  tone TEXT DEFAULT 'conversational' CHECK (tone IN ('conversational', 'professional', 'casual', 'formal')),
  variant_id TEXT, -- For A/B testing

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_system_template BOOLEAN DEFAULT FALSE, -- System templates can't be deleted

  -- Performance metrics
  sent_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  reply_rate DECIMAL(5,2),
  meeting_rate DECIMAL(5,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI_CONVERSATION_LOG TABLE
-- =====================================================
CREATE TABLE public.ai_conversation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Conversation details
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'phone', 'other')),

  -- Message content
  subject TEXT,
  message_text TEXT NOT NULL,
  message_html TEXT,

  -- AI involvement
  generated_by_ai BOOLEAN DEFAULT FALSE,
  ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  prompt_template_used TEXT,
  claude_model_used TEXT,

  -- Sentiment & qualification
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'unknown')),
  is_qualified BOOLEAN,
  qualification_reason TEXT,

  -- Thread tracking
  thread_id TEXT,
  in_reply_to_id UUID REFERENCES public.ai_conversation_log(id),

  -- Metadata
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEETINGS TABLE
-- =====================================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  -- Meeting details
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT DEFAULT 'discovery' CHECK (meeting_type IN ('discovery', 'demo', 'follow_up', 'closing', 'other')),

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  timezone TEXT DEFAULT 'UTC',

  -- Calendar integration
  calendar_event_id TEXT,
  calendar_provider TEXT CHECK (calendar_provider IN ('cal_com', 'calendly', 'google', 'other')),
  meeting_link TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),

  -- Attendees
  attendees JSONB DEFAULT '[]'::jsonb,

  -- Notes & outcome
  pre_meeting_notes TEXT,
  post_meeting_notes TEXT,
  outcome TEXT,
  next_steps TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- =====================================================
-- AI_REVIEW_QUEUE TABLE
-- =====================================================
CREATE TABLE public.ai_review_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Message details
  message_type TEXT NOT NULL CHECK (message_type IN ('initial_outreach', 'follow_up', 'reply_response', 'meeting_request')),
  proposed_subject TEXT,
  proposed_message TEXT NOT NULL,

  -- AI context
  ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  ai_reasoning TEXT,
  enrichment_data_used JSONB,
  template_id UUID REFERENCES public.email_templates(id),

  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected')),
  reviewed_at TIMESTAMPTZ,

  -- Human edits
  edited_subject TEXT,
  edited_message TEXT,
  rejection_reason TEXT,

  -- Priority
  priority INTEGER DEFAULT 0,
  requires_immediate_attention BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT_LOG TABLE (GDPR Compliance)
-- =====================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL,
  -- Examples: 'prospect_created', 'prospect_deleted', 'email_sent', 'data_exported', 'gdpr_deletion'

  entity_type TEXT NOT NULL,
  -- Examples: 'prospect', 'campaign', 'email_template', 'user'

  entity_id UUID,

  -- Change tracking
  old_values JSONB,
  new_values JSONB,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);

-- Campaigns
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- Prospects
CREATE INDEX idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX idx_prospects_campaign_id ON public.prospects(campaign_id);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_pipeline_stage ON public.prospects(pipeline_stage);
CREATE INDEX idx_prospects_is_vip ON public.prospects(is_vip) WHERE is_vip = TRUE;
CREATE INDEX idx_prospects_user_campaign ON public.prospects(user_id, campaign_id);
CREATE INDEX idx_prospects_linkedin_url ON public.prospects(linkedin_url);
CREATE INDEX idx_prospects_email ON public.prospects(email);

-- Prospect Enrichment
CREATE INDEX idx_enrichment_prospect_id ON public.prospect_enrichment(prospect_id);
CREATE INDEX idx_enrichment_confidence ON public.prospect_enrichment(confidence_score DESC);
CREATE INDEX idx_enrichment_tech_stack ON public.prospect_enrichment USING GIN (tech_stack);

-- Email Templates
CREATE INDEX idx_templates_user_id ON public.email_templates(user_id);
CREATE INDEX idx_templates_use_case ON public.email_templates(use_case);
CREATE INDEX idx_templates_active ON public.email_templates(is_active) WHERE is_active = TRUE;

-- AI Conversation Log
CREATE INDEX idx_conversation_prospect_id ON public.ai_conversation_log(prospect_id);
CREATE INDEX idx_conversation_user_id ON public.ai_conversation_log(user_id);
CREATE INDEX idx_conversation_thread_id ON public.ai_conversation_log(thread_id);
CREATE INDEX idx_conversation_created_at ON public.ai_conversation_log(created_at DESC);

-- Meetings
CREATE INDEX idx_meetings_prospect_id ON public.meetings(prospect_id);
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_scheduled_at ON public.meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON public.meetings(status);

-- AI Review Queue
CREATE INDEX idx_review_queue_user_id ON public.ai_review_queue(user_id);
CREATE INDEX idx_review_queue_status ON public.ai_review_queue(status);
CREATE INDEX idx_review_queue_pending ON public.ai_review_queue(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_review_queue_priority ON public.ai_review_queue(priority DESC, created_at DESC);

-- Audit Log
CREATE INDEX idx_audit_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_event_type ON public.audit_log(event_type);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON public.audit_log(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER prospects_updated_at BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER review_queue_updated_at BEFORE UPDATE ON public.ai_review_queue
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.users IS 'User accounts extending Supabase auth.users';
COMMENT ON TABLE public.campaigns IS 'Prospecting campaigns with ICP targeting';
COMMENT ON TABLE public.prospects IS 'Potential customers from LinkedIn scraping';
COMMENT ON TABLE public.prospect_enrichment IS 'AI-generated talking points and context';
COMMENT ON TABLE public.email_templates IS 'Proven email templates with variables';
COMMENT ON TABLE public.ai_conversation_log IS 'Complete conversation history for audit';
COMMENT ON TABLE public.meetings IS 'Scheduled meetings via calendar integration';
COMMENT ON TABLE public.ai_review_queue IS 'AI-generated messages awaiting approval';
COMMENT ON TABLE public.audit_log IS 'GDPR compliance and change tracking';
