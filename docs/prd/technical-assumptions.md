# Technical Assumptions

## Repository Structure: Monorepo

**Decision:** Single repository with organized folder structure

**Structure:**
```
/sales-machine
├── /workflows        # N8N workflow JSON exports and documentation
├── /api             # Node.js/FastAPI custom logic layer
├── /frontend        # React/Vue.js dashboard application
├── /mcp-servers     # MCP abstraction servers (Scraping, Enrichment, Outreach)
├── /docs            # Technical documentation, architecture diagrams
├── /scripts         # Deployment, migration, utility scripts
└── /tests           # Integration and E2E tests
```

**Rationale:**
- **Solo-preneur advantage:** Single developer benefits from unified codebase - simplified deployment, version synchronization, atomic commits across stack
- **Deployment simplicity:** Single CI/CD pipeline vs. coordinating multiple repo deployments
- **Refactoring ease:** Moving code between layers (e.g., N8N workflow → custom API) doesn't require cross-repo changes
- **Alternative considered:** Multi-repo for frontend/backend separation - rejected due to solo operational overhead

**Trade-offs:**
- ✅ Faster development iteration, easier debugging, simpler dependency management
- ⚠️ Larger repo clone size (minimal impact for solo dev)
- ⚠️ If team grows, may need monorepo tooling (Nx, Turborepo) - acceptable future complexity

## Service Architecture

**Decision:** Hybrid Microservices via N8N Workflows + Custom API Gateway

**Architecture:**
- **N8N Workflows as Microservices:** Each workflow (scraping, enrichment, outreach, AI qualification) operates independently with dedicated execution context
- **Custom API Gateway:** Lightweight Node.js/FastAPI layer handles:
  - Frontend ↔ N8N communication (REST endpoints triggering workflows)
  - Authentication/authorization (user session management)
  - Rate limiting and request validation
  - Webhook routing from external tools (email replies, LinkedIn messages) to appropriate N8N workflows
- **MCP Abstraction Layer:** Category-based servers (Scraping MCP, Enrichment MCP, Outreach MCP) enable tool swapping without N8N workflow rewrites
- **Data Layer:** Shared PostgreSQL database accessed by all services for prospect data, user config, campaign metrics

**Rationale:**
- **Proven foundation:** 22 existing N8N workflows validate orchestration approach - low technical risk
- **Flexibility:** Workflows independently deployable, scalable, and debuggable
- **Future migration path:** Can extract performance-critical workflows to custom services (Python/Node.js) without full rewrite
- **Alternative considered:** Pure monolith - rejected due to tool integration complexity; Pure microservices - rejected due to solo operational overhead

**Trade-offs:**
- ✅ Loose coupling enables tool replacement (MCP benefit), workflow iteration without downtime
- ✅ N8N visual interface accelerates debugging vs. pure code
- ⚠️ N8N performance ceiling at 500+ users may require migration to custom backend (acceptable Phase 2 challenge)
- ⚠️ Webhook complexity requires robust error handling and retry logic

**Micro-MVP Simplification:**
- **Direct integrations OK:** Skip MCP layer initially (UniPil, SMTP, Email Finder, Claude API directly in N8N workflows) - MCP abstraction deferred to Post-MVP (Phase 2+)
- **Rationale:** MVP "No Spray No Pray" timeline prioritizes speed over architecture purity. Direct integrations (UniPil, SMTP, Email Finder) are sufficient for MVP. MCP can be considered later if tool flexibility becomes a priority.

## Testing Requirements

**Decision:** Unit + Integration + Manual QA (Pragmatic Testing Pyramid for Micro-MVP)

**Testing Strategy:**

**1. Unit Testing (Component-Level)**
- **Scope:** Custom API Gateway logic (authentication, rate limiting, webhook routing)
- **Coverage Target:** >70% for critical paths (user auth, payment processing, data validation)
- **Tools:** Jest (Node.js), pytest (Python if FastAPI chosen)
- **Rationale:** Low-cost safety net for custom code; N8N workflows tested via integration layer

**2. Integration Testing (Workflow-Level)**
- **Scope:** End-to-end N8N workflow execution
  - Test: LinkedIn scrape → Enrichment → Email queue → AI response → Meeting booking
  - Validate: Data transformations, error handling, retry logic
- **Tools:** Postman/Newman collections triggering N8N webhooks, automated assertions on workflow outputs
- **Coverage Target:** 100% of critical user journeys (onboarding → first campaign → meeting booked)
- **Rationale:** N8N workflows ARE the core product - integration tests validate business logic

**3. Manual QA (User Acceptance)**
- **Scope:** UX flows, edge cases, cross-browser compatibility
- **Process:** Founder (Gary) + 2-3 beta users test each release candidate
- **Checklist:** Onboarding completion, AI message review, deliverability monitoring, meeting booking
- **Rationale:** Solo-preneur resource constraint - manual QA acceptable for Micro-MVP (automate in Full MVP if support load validates need)

**4. Humanness Testing (Specialized Validation)**
- **Scope:** AI-generated message quality and human perception
- **Process:**
  - Pre-launch: Human perception panels (20-30 ICP members) blind test AI vs. human messages
  - Post-launch: Response rate tracking, user surveys ("Have prospects mentioned detecting automation?")
- **Target:** <20% AI detection rate
- **Rationale:** Critical non-functional requirement (NFR5) - unique to AI-driven product

**NOT Included in Micro-MVP:**
- ❌ E2E automated browser testing (Playwright, Cypress) - manual QA sufficient for 5 beta users
- ❌ Load testing - 5 concurrent users doesn't justify performance testing infrastructure
- ❌ Security penetration testing - defer to Full MVP when handling payment data

**Full MVP Expansion:**
- Add E2E automation for regression protection (support >15 customers requires automation)
- Load testing before scaling to 50+ users (validate N8N performance ceiling)
- Security audit before public launch (GDPR compliance verification)

**Trade-offs:**
- ✅ Fast iteration (minimal test maintenance overhead for solo dev)
- ✅ Pragmatic coverage (tests that matter, not 100% coverage theater)
- ⚠️ Manual QA bottleneck if user base grows (hiring trigger: QA >10h/week for 2 consecutive weeks)

## Additional Technical Assumptions and Requests

**Frontend Technology:**
- **Decision:** React with TypeScript (alternatively: Vue.js 3 + TypeScript)
- **UI Library:** Tailwind CSS + shadcn/ui (or equivalent component library)
- **State Management:** Zustand or React Context (avoid Redux complexity for Micro-MVP)
- **Rationale:** Mature ecosystem, component reusability, TypeScript safety for solo dev (catch bugs before runtime)
- **Alternative:** No-code tools (Retool, Bubble) - considered but rejected due to customization limits for AI message review UX

**Backend Custom Logic:**
- **Decision:** Node.js with Express/Fastify (alternatively: Python FastAPI if ML features needed)
- **Rationale:** JavaScript expertise (aligns with N8N familiarity), single-language stack (JS frontend + backend)
- **Deployment:** Railway, Render, or Fly.io (PaaS for simplified DevOps)

**Database & Caching:**
- **Primary Database:** Supabase (PostgreSQL 15+ with built-in Auth, Row Level Security, Realtime subscriptions)
- **Caching Layer:** Upstash Redis (serverless Redis, free tier up to 10K commands/day)
- **Rationale:**
  - Supabase eliminates 2-3 days auth/database setup, built-in RLS simplifies GDPR compliance (NFR10), Realtime enables dashboard live updates
  - Upstash Redis serverless model aligns with solo-preneur cost optimization (pay-per-use vs. dedicated instance)
  - PostgreSQL reliability + JSONB support for flexible enrichment data storage
- **Migration Plan:** If costs exceed €200/month or vendor lock-in risk materializes, migrate to self-hosted PostgreSQL + Redis (standard dump/restore process)

**N8N Hosting:**
- **Decision:** Self-hosted on VPS (DigitalOcean, Hetzner) or N8N Cloud (€20-50/month)
- **Consideration:** Self-hosted = cost control; N8N Cloud = zero DevOps overhead
- **Micro-MVP:** Use N8N Cloud for speed (eliminate server setup time) - migrate to self-hosted if costs exceed €100/month

**Authentication & Security:**
- **User Auth:** Supabase Auth with OAuth2 (Google/LinkedIn SSO) - eliminates custom auth implementation
- **Session Management:** Upstash Redis for session tokens (1-2ms lookup, automatic TTL expiration)
- **API Security:** JWT tokens (Supabase-issued), API key rotation, rate limiting via Upstash Redis (100 requests/min/user)
- **Secrets Management:** Environment variables via Railway/Render platform (Doppler or AWS Secrets Manager for Full MVP)
- **Encryption:** TLS/HTTPS for all communications, Supabase encryption-at-rest

**Third-Party Integrations (MVP):**
- **Database & Cache:** Supabase (PostgreSQL + Auth + Realtime), Upstash Redis (serverless cache/sessions/queues)
- **LinkedIn Automation:** UniPil API (LinkedIn scraping, warm-up, connections, messaging)
- **Web Scraping & Search:** Unipile browser automation + Tavily Search/Extract APIs
- **Email Sending:** Dedicated SMTP server (SendGrid, Mailgun, or AWS SES)
- **Email Finder:** Enrow
- **Enrichment:** Claude API (Anthropic), custom web scrapers
- **Calendar:** Cal.com (open-source preference) or Calendly
- **Note:** Direct integrations used for MVP. MCP abstraction layer deferred to Post-MVP (Phase 2+) if tool flexibility becomes a priority.

**Deployment & CI/CD:**
- **Hosting:** Railway (preferred for simplicity) or Render/Fly.io
- **CI/CD:** GitHub Actions (free tier sufficient for Micro-MVP)
  - Automated: Linting, unit tests, integration test suite
  - Manual approval: Production deployment (solo dev controls release timing)
- **Environments:** Development (local), Staging (pre-production testing), Production (live users)

**Monitoring & Observability:**
- **Application Monitoring:** Sentry (error tracking), Betterstack/UptimeRobot (uptime monitoring)
- **Workflow Monitoring:** N8N built-in execution logs + custom alerting webhooks (Slack notifications on failures)
- **Analytics:** PostHog or Mixpanel (user behavior tracking, funnel analysis)
- **Rationale:** Proactive issue detection critical for autonomous system - users expect 99.5% uptime (NFR4)

**Compliance & Legal:**
- **GDPR:** Data retention policies (prospect data purged on user request), consent tracking, privacy policy
- **CAN-SPAM:** Automated unsubscribe handling, physical address in emails, accurate sender info
- **LinkedIn/Instagram ToS:** Rate limiting (100 requests/day LinkedIn), clear documentation warning users of platform risk
- **User Terms:** Legal review before public launch (defer to Full MVP - beta users accept "as-is" testing agreement)

**AI Cost Management:**
- **Claude API Budget:** €0.01-0.05 per conversation estimated - monitor unit economics closely
- **Cost Alerts:** Trigger if Claude costs exceed €5/user/month (indicates inefficient prompting or excessive retries)
- **Fallback Strategy:** If Claude pricing increases >50%, evaluate alternatives (OpenAI GPT-4, Mistral, local LLM)

**Scalability Assumptions:**
- **N8N Capacity:** Assumed capable of handling 100 concurrent users based on 22 existing workflow experience - requires load testing validation
- **Supabase Database:** PostgreSQL can handle 100K prospect records without partitioning - monitor query performance at 50K+ records
- **Upstash Redis:** Free tier (10K commands/day) sufficient for 5-15 users; Pro tier (€10-20/month) covers 50-100 users
- **API Rate Limits:** 3rd-party tools won't change limits dramatically - MCP enables rapid tool swap if needed
- **Cost Triggers:**
  - Supabase >€200/month → migrate to self-hosted PostgreSQL
  - Upstash >€50/month → migrate to dedicated Redis instance (DigitalOcean, Hetzner)

**Documentation Requirements:**
- **User-Facing:** Video tutorials (5-min segments), FAQ, troubleshooting guides (business language only)
- **Developer:** API documentation (for future integrations), N8N workflow architecture diagrams, MCP server specifications
- **Operational:** Runbooks for common issues (deliverability degradation, workflow failures, API outages)
