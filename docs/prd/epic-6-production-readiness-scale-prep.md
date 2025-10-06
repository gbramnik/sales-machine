# Epic 6: Production Readiness & Scale Prep

**Expanded Goal:** Implement comprehensive monitoring (Sentry, Betterstack), GDPR compliance (data deletion, consent tracking), load testing to 100 users, operational runbooks for common issues, and validate solo-preneur can support 50+ customers with <5h/week support load.

**Timeline:** Weeks 14-15 (80h solo development)

## Story 6.1: Application Monitoring & Alerting
**As a** developer,
**I want** proactive error detection and uptime monitoring,
**so that** I fix issues before users report them.

**Acceptance Criteria:**
1. Sentry integration for error tracking (API Gateway, N8N webhook errors, frontend exceptions)
2. Betterstack (or UptimeRobot) for uptime monitoring: Ping endpoints every 5 minutes, alert if down >2 minutes
3. Slack webhook alerts: Critical errors, downtime, deliverability health drops to Red
4. N8N workflow execution monitoring: Track failure rate, alert if >10% workflows failing
5. Cost monitoring: Daily Supabase/Upstash/Claude API usage reports, alert if exceeding budget thresholds
6. Dashboard: Weekly summary email with key metrics (uptime, error rate, user growth)

## Story 6.2: GDPR Compliance Implementation
**As a** user,
**I want** to comply with GDPR data protection laws,
**so that** I can legally operate in France/EU and protect prospect privacy.

**Acceptance Criteria:**
1. Data deletion endpoint: DELETE /prospects/{prospect_id} → Purge from Supabase + Upstash + N8N logs (per NFR10)
2. User data export: GET /users/me/data → Export all user data (prospects, campaigns, meetings) in JSON format
3. Consent tracking: `prospects` table includes consent_given (boolean), consent_date, consent_source
4. Privacy policy: Legal doc created (template-based, not custom lawyer), linked in app footer
5. Cookie banner: Minimal implementation (session cookies only for MVP, no tracking cookies)
6. Audit logging: All prospect data access logged in `audit_log` table (user_id, action, prospect_id, timestamp)
7. Data retention policy: Auto-purge prospects marked "unsubscribed" after 30 days

## Story 6.3: Load Testing & Performance Validation
**As a** developer,
**I want** to validate the system handles 100 concurrent users,
**so that** I can scale to 50+ paying customers confidently (per NFR6).

**Acceptance Criteria:**
1. Load testing tool setup (k6 or Artillery) with test scenarios
2. Scenario 1: 100 concurrent users scraping LinkedIn simultaneously (validate N8N capacity)
3. Scenario 2: 1000 email queue operations (validate Upstash Redis performance)
4. Scenario 3: 100 AI enrichment requests (validate Claude API rate limit handling)
5. Performance benchmarks: API response time <500ms p95, workflow execution <5 seconds (per NFR3)
6. Database query optimization: Add indexes on frequently queried fields (user_id, status, created_at)
7. Report: Document bottlenecks, scaling limits, recommended infrastructure upgrades for 100+ users

## Story 6.4: Operational Runbooks
**As a** solo-preneur,
**I want** step-by-step troubleshooting guides,
**so that** I can quickly resolve common issues without research.

**Acceptance Criteria:**
1. Runbook created for: Deliverability degradation (bounce rate spike, spam complaints)
2. Runbook created for: N8N workflow failures (PhantomBuster errors, Claude API timeouts)
3. Runbook created for: User onboarding issues (domain verification fails, calendar connection errors)
4. Runbook created for: Database performance degradation (slow queries, connection pool exhausted)
5. Runbook format: Problem → Diagnosis steps → Resolution steps → Prevention
6. Stored in /docs/runbooks/ with searchable index
7. Test runbooks: Simulate each issue in staging, validate resolution steps work

---
