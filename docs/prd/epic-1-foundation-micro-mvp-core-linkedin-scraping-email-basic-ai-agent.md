# Epic 1: Foundation & Micro-MVP Core (LinkedIn Scraping + Email + Basic AI Agent)

**Expanded Goal:** Establish project infrastructure (monorepo, Supabase, Upstash, N8N Cloud, Railway) and deliver minimal viable autonomous prospecting system. Users can scrape LinkedIn profiles, enrich with AI-generated talking points, send personalized email campaigns with deliverability guardrails, and have an AI agent respond to prospect replies to book qualified meetings. Success = 5 beta users generating 3+ qualified meetings each within 30 days.

**Timeline:** Weeks 1-6 (240h solo development)

## Story 1.1: Project Infrastructure Setup
**As a** developer,
**I want** the foundational technical infrastructure configured,
**so that** I can build features on a stable, scalable foundation.

**Acceptance Criteria:**
1. Monorepo created with `/workflows`, `/api`, `/frontend`, `/mcp-servers`, `/docs`, `/scripts`, `/tests` folder structure
2. GitHub repository initialized with README, .gitignore, and branch protection (main branch)
3. Supabase project created with PostgreSQL database, Auth configured for OAuth2 (Google/LinkedIn SSO)
4. Upstash Redis instance created (free tier) with connection credentials stored in environment variables
5. N8N Cloud account setup with workspace created and webhook endpoints documented
6. Railway project created for API Gateway hosting with environment variables configured (Supabase URL, Upstash credentials, N8N webhook URLs)
7. GitHub Actions CI/CD pipeline configured for linting and basic tests (runs on PR creation)
8. Local development environment documentation complete (setup instructions in /docs/dev-setup.md)
9. N8N workflows deployed to N8N Cloud workspace with webhook URLs captured and documented in /workflows/README.md. Deployment script (scripts/deploy-workflows.sh) tested and added to CI/CD pipeline with manual approval gate

## Story 1.2: LinkedIn Profile Scraping Workflow
**As a** user,
**I want** to scrape LinkedIn profiles based on ICP criteria,
**so that** I can build a targeted prospect list.

**Acceptance Criteria:**
1. N8N workflow accepts input parameters: industry, location, job title, company size (via webhook trigger)
2. PhantomBuster integration configured to scrape LinkedIn profiles matching criteria (20-50 profiles per execution)
3. Scraped data includes: full name, job title, company name, LinkedIn URL, location, profile summary
4. Data validation: Reject profiles missing required fields (name, company, job title)
5. Prospect records stored in Supabase PostgreSQL with schema: `prospects` table (id, user_id, name, title, company, linkedin_url, location, summary, created_at, status)
6. Error handling: If PhantomBuster fails, retry 3 times with exponential backoff, then notify user via webhook
7. Rate limiting: Maximum 100 LinkedIn scraping requests/day per user (respect LinkedIn ToS per NFR12)
8. Workflow execution logged in N8N with success/failure status

## Story 1.3: AI-Powered Contextual Enrichment
**As a** user,
**I want** AI to generate personalized talking points for each prospect,
**so that** my outreach messages feel human and relevant.

**Acceptance Criteria:**
1. N8N workflow triggered automatically after LinkedIn scraping completes (via N8N internal trigger)
2. Claude API integration configured with prompt template: "Based on this LinkedIn profile [profile data], generate 3-5 personalized talking points for B2B outreach focusing on pain points, recent activities, and mutual interests"
3. Enrichment data includes: talking_points (array), pain_points (array), recent_activity (string), personalization_score (0-100)
4. Enriched data stored in `prospect_enrichment` table (prospect_id, talking_points, pain_points, recent_activity, score, enriched_at)
5. Enrichment data cached in Upstash Redis with 7-day TTL (per FR21) to reduce Claude API costs on re-runs
6. If Claude API returns low-confidence enrichment (score <50), flag prospect for manual review
7. Cost tracking: Log Claude API token usage per enrichment for unit economics monitoring
8. Error handling: If Claude API fails, retry once, then skip enrichment and mark prospect as "enrichment_failed"

## Story 1.4: Proven Email Template Library
**As a** user,
**I want** access to pre-validated email templates,
**so that** I don't have to write campaigns from scratch and can trust message quality.

**Acceptance Criteria:**
1. Minimum 5 email templates created covering: cold intro, follow-up (no reply), follow-up (engaged), re-engagement, meeting confirmation
2. Each template includes: subject line, body with variable placeholders, tone guidance (conversational/professional)
3. Templates stored in Supabase `email_templates` table with fields: name, subject, body, variables_required (array), tone, use_case
4. Template personalization engine: Replace placeholders with prospect enrichment data (talking_points, pain_points, recent_activity)
5. Preview functionality: User can preview how template renders with actual prospect data before sending
6. Template validation: Ensure all required variables exist in enrichment data before queuing email (reject if missing)
7. A/B testing support (basic): Tag templates with variant_id to enable performance comparison (implement tracking only, not auto-selection)

## Story 1.5: Email Campaign Infrastructure
**As a** user,
**I want** to send personalized email campaigns with deliverability protection,
**so that** my emails land in prospect inboxes without burning my domain.

**Dependency:** Requires Story 1.4 (Email Template Library) completion before email campaign activation.

**Acceptance Criteria:**
1. Instantly.ai OR Smartlead API integration configured (evaluate both, select best during implementation)
2. User domain verification workflow: DNS records (SPF, DKIM, DMARC) checked via automation, status displayed to user
3. Mandatory warm-up period enforced: New domains require 14-21 days warm-up before full campaign (per FR7)
4. Hard-coded sending limit: Maximum 20 emails/day per sending address (non-bypassable code enforcement per FR6)
5. Email queue stored in Upstash Redis using sorted set (priority: VIP accounts first, score = timestamp + priority_boost)
6. Scheduler workflow (runs every hour): Dequeue 20 emails from Redis → Send via Instantly.ai/Smartlead → Update prospect status to "contacted"
7. Deliverability monitoring: Track bounce rate, spam complaints (real-time via webhook from email tool)
8. Auto-pause trigger: If bounce rate >5% or spam complaints >0.1%, pause campaign and notify user immediately
9. Email templates loaded from Supabase `email_templates` table with variable placeholders: {{prospect_name}}, {{company}}, {{talking_point_1}}

## Story 1.6: Basic AI Conversational Agent
**As a** user,
**I want** an AI agent to respond to prospect email replies autonomously,
**so that** qualified leads get engaged 24/7 without manual intervention.

**Acceptance Criteria:**
1. Webhook configured to receive email replies from Instantly.ai/Smartlead (prospect responds → webhook triggers N8N workflow)
2. N8N workflow extracts: prospect_id, reply_text, sentiment, thread_history
3. Claude API prompt: "You are a B2B sales assistant. Based on this prospect reply [reply_text] and context [enrichment_data], determine: (1) Is this a qualified lead (BANT)? (2) What should the response be?"
4. AI agent returns: qualification_status (qualified/not_qualified/needs_more_info), proposed_response, confidence_score (0-100)
5. Binary decision logic:
   - If qualified + confidence >80% → Book meeting via Cal.com/Calendly API (send calendar link)
   - If not_qualified → Add to nurture sequence (future epic, for now just mark status)
   - If confidence <80% → Queue for human review (store in `ai_review_queue` table)
6. Template-based responses only (Micro-MVP constraint): AI selects from 5 pre-written response templates, fills variables (no free-form generation to prevent hallucination)
7. Response sent automatically via Instantly.ai/Smartlead API if confidence >80%, otherwise queued for approval
8. All AI interactions logged in `ai_conversation_log` table (prospect_id, reply_text, ai_response, confidence, action_taken, timestamp)

## Story 1.7: Meeting Booking Integration
**As a** user,
**I want** the AI agent to autonomously book qualified meetings on my calendar,
**so that** I don't have to manually coordinate scheduling.

**Acceptance Criteria:**
1. Cal.com OR Calendly integration configured (evaluate both, select one)
2. User calendar connected during onboarding (OAuth flow for Google Calendar/Outlook)
3. When AI qualifies prospect (Story 1.6), generate unique booking link with prospect context pre-filled (name, company, meeting topic)
4. AI response includes calendar link: "Based on your interest, let's schedule a 30-minute call: [booking_link]"
5. When prospect books meeting: Webhook received → Update prospect status to "meeting_booked" → Store meeting details (time, date, calendar_event_id)
6. Meeting booked notification sent to user (email + in-app if dashboard exists)
7. Meeting data stored in `meetings` table (prospect_id, scheduled_time, calendar_event_id, status, booked_at)
8. Cancellation handling: If prospect cancels, update status to "meeting_cancelled" and notify user

## Story 1.8: Basic Reporting & Metrics
**As a** user,
**I want** to see campaign performance metrics,
**so that** I can validate the system is working and generating results.

**Acceptance Criteria:**
1. Simple Google Sheet dashboard (not custom UI for Micro-MVP speed) with tabs:
   - Campaign Overview: Total prospects scraped, enriched, contacted, replied, qualified, meetings_booked
   - Email Performance: Sent count, open rate, reply rate, bounce rate, spam complaints
   - AI Agent Performance: Total conversations, qualification accuracy (qualified meetings / total qualifications), confidence score average
2. Data synced from Supabase to Google Sheet via N8N workflow (runs daily at midnight)
3. Deliverability health indicator: Green (bounce <2%, spam <0.05%), Amber (bounce 2-5%), Red (bounce >5% or spam >0.1%)
4. Beta user access: Share Google Sheet with read-only access for each beta user (separate sheet per user)
5. Key metric validation: Track "meetings booked per 100 prospects contacted" (target: 0.5-1% per project brief)

---
