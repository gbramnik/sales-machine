# Requirements

## Functional

**FR1:** System shall scrape LinkedIn profiles, jobs, and company pages using configurable source parameters (industry, location, job title, company size)

**FR2:** System shall scrape Google Maps businesses by category and geographic location to identify local B2B prospects

**FR3:** System shall detect tech stack via BuiltWith API integration to enable technographic targeting (identify prospects using competitive or complementary technologies)

**FR4:** System shall detect intent signals: recent hires/job changes (LinkedIn Jobs API), tech stack analysis (BuiltWith), and social engagement (LinkedIn/Instagram post commenters matching ICP)

**FR5:** System shall enrich prospect data using contextual analysis (website scraping, social profile analysis, recent posts/comments extraction) to generate AI-powered "talking points" dossier via Claude API

**FR6:** System shall send personalized email campaigns via Instantly.ai or Smartlead integration with hard-coded deliverability guardrails (max 20 emails/day per address, non-bypassable)

**FR7:** System shall enforce mandatory email warm-up period (2-3 weeks) for new sending domains before full campaign volume activation

**FR8:** System shall automate LinkedIn connection requests and direct messages via PhantomBuster with platform risk awareness

**FR9:** System shall provide proven template library (10-15 templates across channels: cold intro, follow-up, re-engagement) with AI variable personalization using enrichment data

**FR10:** AI conversational agent shall respond to prospect replies, ask qualification questions based on BANT framework, and detect buying intent

**FR11:** AI agent shall make binary qualification decisions: Qualified prospects trigger autonomous meeting booking via Cal.com/Calendly integration, Not Qualified prospects enter nurture sequence

**FR12:** AI agent shall implement confidence scoring (0-100%) for all generated messages; messages <80% confidence queued for human review (not sent automatically)

**FR13:** System shall flag high-value accounts (>€10K opportunity or C-level prospects) for VIP Mode where ALL AI messages require user approval before sending

**FR14:** AI agent shall cross-reference claims against enrichment data sources and blacklist sensitive topics (pricing promises, guarantees, competitor bashing) with auto-block on prohibited content

**FR15:** System shall orchestrate complete workflow via N8N: Prospect discovery → Enrichment → Outreach → AI qualification → Meeting booking with error handling, retry logic, and failure notifications

**FR16:** System shall implement MCP architecture abstraction layer for Scraping, Enrichment, and Outreach categories enabling tool replaceability without core workflow rewrites

**FR17:** System shall provide Zero-Config onboarding wizard: Goal selection (5-30 meetings/month), industry dropdown, auto-configuration of ICP/templates/channels, domain verification with automated DNS check, and single-button campaign launch

**FR18:** System shall track campaign metrics: email deliverability (inbox placement rate), response rates, AI agent qualification accuracy, and meeting generation rate

**FR19:** System shall monitor deliverability health in real-time with auto-pause triggers on poor metrics (bounce rate spikes, spam complaints)

**FR20:** System shall support Micro-MVP feature set (LinkedIn scraping + Email outreach + Basic AI Agent only) as initial deployment before Full MVP expansion

**FR21:** System shall cache prospect enrichment data in Upstash Redis with TTL (Time To Live) expiration to reduce Claude API costs and improve AI response latency (<10 seconds per NFR2)

**FR22:** System shall implement email queue management via Upstash Redis to enforce deliverability limits (20 emails/day) and prevent sending violations during campaign execution

**FR23:** System shall store user session tokens in Upstash Redis with automatic expiration (24-hour TTL) for fast authentication validation (1-2ms lookup target)

## Non-Functional

**NFR1:** Email deliverability shall maintain >90% inbox placement rate across all user campaigns during Micro-MVP, >95% for Full MVP

**NFR2:** AI conversational agent response time shall be <10 seconds per prospect reply

**NFR3:** Workflow execution latency shall be <5 seconds per prospect processed (scraping → enrichment → outreach queuing)

**NFR4:** System uptime shall be 99.5% availability (allowing ~3.6 hours downtime/month for maintenance)

**NFR5:** AI-generated messages shall achieve <20% detection rate as "AI/bot" by recipients measured via pre-launch human perception panels (20-30 B2B decision-makers)

**NFR6:** System shall support 100 concurrent users by Month 6, handling 10,000 prospects processed/day across all users by Month 12

**NFR7:** Database shall store 100K+ prospect records with contextual enrichment data using PostgreSQL

**NFR8:** User onboarding shall be completable in <2 hours without support intervention (self-service validation metric)

**NFR9:** AI agent shall handle 70%+ of prospect responses without human intervention during Micro-MVP, 80%+ for Full MVP

**NFR10:** System shall maintain GDPR compliance for data handling (user consent, data deletion requests, encryption at rest, audit logging for all prospect data access)

**NFR11:** Email outreach shall be CAN-SPAM compliant (unsubscribe links, physical address, accurate headers)

**NFR12:** System shall respect 3rd-party API rate limits (LinkedIn 100 requests/day, Claude API tier limits) with automatic throttling

**NFR13:** Tool operational costs shall remain <€2,000/month for 15-customer base to maintain >70% gross margin

**NFR14:** Solo-preneur support load shall be <5 hours/week for 10-15 customers proving self-service model scalability

**NFR15:** System architecture shall use monorepo structure (single repo with /workflows, /api, /frontend, /docs folders) for simplified deployment and version synchronization

**NFR16:** Upstash Redis usage shall remain within free tier (10K commands/day) for Micro-MVP (5-15 users) and scale to Pro tier (€10-20/month) for 50-100 users to maintain gross margin targets (>70% per NFR13)
