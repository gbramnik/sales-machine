# Next Steps

## UX Expert Prompt

You are the UX Expert for Sales Machine, an AI-powered autonomous sales prospecting platform. Review the PRD (docs/prd.md) focusing on the "User Interface Design Goals" section and Epic 5 stories (Onboarding Wizard, Campaign Dashboard, AI Review Queue).

**Your Task:**

Create design direction for the following experiences, prioritizing simplicity and "hiding complexity" from users:

1. **Onboarding Wizard (Story 5.4):**
   - Visual design approach for conversational 5-step wizard
   - Industry selection card layout with icons
   - Domain verification status display (green checkmarks vs. red X with instructions)
   - Calendar connection OAuth success confirmation

2. **Campaign Monitoring Dashboard (Story 5.2):**
   - Health Score Card (0-100 visualization)
   - Meeting Pipeline Kanban layout (Contacted → Engaged → Qualified → Booked)
   - AI Activity Stream real-time feed design
   - Alert Center notification patterns

3. **AI Message Review Queue (Story 5.3):**
   - Two-tab layout (Low Confidence vs. VIP Accounts)
   - Context panel side-by-side with AI message
   - Approve/Edit/Reject action buttons placement
   - Bulk action controls

**Design Principles (from PRD):**
- Complexity hidden, outcomes visible
- Business language only (never show "N8N", "webhook", "MCP")
- Trust-oriented aesthetic (professional blues/grays, green accents)
- WCAG AA accessibility compliance
- Desktop-first (1280px+), mobile-responsive for monitoring

**Deliverables:**
- Wireframes or mockups for 3 core screens above
- Component library recommendations (using shadcn/ui with Tailwind CSS)
- Interaction patterns for Health Score, Pipeline drag-drop, AI Activity Stream

Refer to UI inspiration: Stripe dashboard (clean data viz), Linear (minimal aesthetic), Vercel (trust-oriented design).

## Architect Prompt

You are the Technical Architect for Sales Machine, an AI-powered autonomous sales prospecting platform. Review the complete PRD (docs/prd.md) focusing on Requirements, Technical Assumptions, and all Epic stories with acceptance criteria.

**Your Task:**

Create the technical architecture document covering:

1. **System Architecture:**
   - Component diagram showing N8N workflows, API Gateway (Node.js), Frontend (React), Supabase PostgreSQL, Upstash Redis, third-party integrations
   - Data flow: LinkedIn scraping → Claude enrichment → Email queue → AI response → Meeting booking
   - Authentication flow: Supabase Auth OAuth2 → JWT tokens → session management in Upstash Redis

2. **Database Design:**
   - Schema for all tables identified in stories: `prospects`, `prospect_enrichment`, `email_templates`, `ai_review_queue`, `meetings`, `ai_conversation_log`, `prospect_tech_stack`, `audit_log`
   - Relationships (foreign keys), indexes on frequently queried fields (user_id, status, created_at)
   - Supabase Row Level Security (RLS) policies for multi-tenant data isolation

3. **N8N Workflow Architecture:**
   - Workflow definitions for: LinkedIn scraping, AI enrichment, email scheduler, AI agent response, meeting booking
   - Error handling patterns (retry logic with exponential backoff, failure notifications)
   - Webhook routing from Instantly.ai/Smartlead email replies to AI agent workflow

4. **MCP Architecture (Epic 4):**
   - MCP server protocol design for Scraping and Enrichment categories
   - PhantomBuster adapter implementation (wrapping existing integration)
   - Environment variable configuration for provider swapping (SCRAPING_PROVIDER, ENRICHMENT_PROVIDER)

5. **API Specifications:**
   - REST endpoints for onboarding wizard: POST /onboarding/start, POST /onboarding/step/{step_id}
   - Campaign management: GET /campaigns, POST /campaigns, GET /prospects
   - AI review queue: GET /ai-review-queue, POST /ai-review-queue/{id}/approve

6. **Caching Strategy:**
   - Upstash Redis usage: Session tokens (24h TTL), prospect enrichment data (7-day TTL per FR21), email queue (sorted set), rate limiting counters
   - Cache invalidation rules, eviction policies

7. **Performance & Scalability:**
   - Load testing approach to validate NFR6 (100 concurrent users, 10K prospects/day)
   - Database query optimization strategy (indexes, query patterns)
   - N8N scalability assessment (current 22 workflows, projected 100 users)

8. **Security & Compliance:**
   - GDPR compliance implementation (data deletion, audit logging per Story 6.2)
   - API authentication (JWT validation, rate limiting via Upstash Redis)
   - Secrets management (environment variables, no hard-coded credentials)

**Key Constraints from PRD:**
- Monorepo structure (/workflows, /api, /frontend, /mcp-servers, /docs, /scripts, /tests)
- Solo-preneur operational model (must be maintainable by single developer)
- Cost targets: Supabase + Upstash free tiers for Micro-MVP, <€2K/month for 15 customers (NFR13)
- Performance: API <500ms p95, workflows <5s, AI responses <10s (NFR2-3)

**Deliverables:**
- Architecture document (docs/architecture.md)
- Database schema diagrams
- N8N workflow specifications
- API endpoint documentation
- Deployment guide (Railway + N8N Cloud + Supabase + Upstash setup)

Refer to Technical Assumptions section for full tech stack details and trade-off analysis.
