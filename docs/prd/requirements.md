# Requirements

## Functional

**FR1:** System shall detect 20 prospects/day (configurable, max 40) matching ICP + Persona criteria via UniPil API, excluding prospects already contacted by user, with detection scheduled at 6h AM daily

**FR2:** System shall scrape LinkedIn profiles and company pages using UniPil API with configurable source parameters (industry, location, job title, company size, ICP criteria, Persona criteria)

**FR3:** System shall enrich prospect data with maximum context: LinkedIn profile (via UniPil), LinkedIn company page (via UniPil), website scraping (site web prospect), email finder (API externe), and AI-powered "talking points" dossier via Claude API

**FR4:** System shall implement LinkedIn warm-up workflow: 7-15 days (configurable) of automated engagement (30-40 likes/day, 30-40 comments/day, configurable limits) before sending connection request, with automatic detection of authors that prospects comment on if prospects don't publish posts

**FR5:** System shall send personalized LinkedIn connection requests via UniPil API after warm-up period completion, with personalized invitation message based on enrichment data

**FR6:** System shall send personalized email campaigns via SMTP dédié (SendGrid/Mailgun/AWS SES) with hard-coded deliverability guardrails (max 50-100 emails/day per address, non-bypassable), with fallback to email if LinkedIn connection is rejected

**FR7:** System shall enforce mandatory email warm-up period (2-3 weeks) for new sending domains before full campaign volume activation

**FR8:** System shall automate LinkedIn conversation management via UniPil API with platform risk awareness, supporting simultaneous LinkedIn + Email conversations

**FR9:** System shall provide proven template library (10-15 templates across LinkedIn and Email channels: LinkedIn connection request, LinkedIn follow-up, email cold intro, email follow-up, re-engagement) with AI variable personalization using enrichment data

**FR10:** AI conversational agent shall respond to prospect replies on both LinkedIn and Email channels simultaneously, ask qualification questions based on BANT framework, and detect buying intent

**FR11:** AI agent shall make binary qualification decisions: Qualified prospects trigger autonomous meeting booking via Cal.com/Calendly integration, Not Qualified prospects enter nurture sequence

**FR12:** AI agent shall implement confidence scoring (0-100%) for all generated messages (LinkedIn and Email); messages <80% confidence queued for human review (not sent automatically)

**FR13:** System shall flag high-value accounts (>€10K opportunity or C-level prospects) for VIP Mode where ALL AI messages require user approval before sending

**FR14:** AI agent shall cross-reference claims against enrichment data sources and blacklist sensitive topics (pricing promises, guarantees, competitor bashing) with auto-block on prohibited content

**FR15:** System shall orchestrate complete workflow via N8N: Daily prospect detection (6h AM) → Enrichment → LinkedIn warm-up (7-15 days) → LinkedIn connection → AI conversation (LinkedIn + Email) → Meeting booking with error handling, retry logic, and failure notifications

**FR16:** System shall support full autopilot mode (automatic daily detection and processing) and semi-automatic mode (user validation of daily prospect list before processing)

**FR17:** System shall provide Zero-Config onboarding wizard: ICP definition (multiple ICPs supported), Persona definition (multiple Personas supported), LinkedIn account connection (UniPil), SMTP configuration (SendGrid/Mailgun/SES), warm-up LinkedIn settings (délai 7-15 jours, actions/jour), domain verification with automated DNS check, and single-button campaign launch

**FR18:** System shall track campaign metrics: email deliverability (inbox placement rate), response rates, AI agent qualification accuracy, and meeting generation rate

**FR19:** System shall monitor deliverability health in real-time with auto-pause triggers on poor metrics (bounce rate spikes, spam complaints)

**FR20:** System shall support Micro-MVP feature set (LinkedIn warm-up + Connection + AI Conversation LinkedIn + Email) as initial deployment before Full MVP expansion

**FR21:** System shall cache prospect enrichment data in Upstash Redis with TTL (Time To Live) expiration to reduce Claude API costs and improve AI response latency (<10 seconds per NFR2)

**FR22:** System shall implement email queue management via Upstash Redis to enforce deliverability limits (50-100 emails/day) and prevent sending violations during campaign execution

**FR23:** System shall store user session tokens in Upstash Redis with automatic expiration (24-hour TTL) for fast authentication validation (1-2ms lookup target)

**FR24:** System shall track LinkedIn warm-up actions (likes, comments, author engagements) with daily limits configurable per user account type (Sales Navigator vs basic account), respecting LinkedIn ToS to avoid account restrictions

**FR25:** System shall extract LinkedIn company page data (company name, industry, size, description, recent posts) via UniPil API and store in prospect enrichment for enhanced context

**FR26:** System shall scrape prospect website content (company website) using Unipile browser automation plus Tavily Search/Extract APIs to gather business context, technologies used, and relevant information for AI conversation personalization

**FR27:** System shall integrate email finder API (Enrow) to discover prospect email addresses and optional phone numbers for multi-canal outreach

**FR28:** System shall maintain prospect contact history to exclude already-contacted prospects from daily detection, ensuring no duplicate outreach to same prospects

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

**NFR12:** System shall respect 3rd-party API rate limits (UniPil API limits per account, LinkedIn warm-up limits 30-40 actions/day, Claude API tier limits) with automatic throttling

**NFR17:** System shall respect LinkedIn warm-up best practices: 30-40 likes/day maximum, 30-40 comments/day maximum, with configurable limits based on account type (Sales Navigator allows higher limits than basic account)

**NFR13:** Tool operational costs shall remain <€2,000/month for 15-customer base to maintain >70% gross margin

**NFR14:** Solo-preneur support load shall be <5 hours/week for 10-15 customers proving self-service model scalability

**NFR15:** System architecture shall use monorepo structure (single repo with /workflows, /api, /frontend, /docs folders) for simplified deployment and version synchronization

**NFR16:** Upstash Redis usage shall remain within free tier (10K commands/day) for Micro-MVP (5-15 users) and scale to Pro tier (€10-20/month) for 50-100 users to maintain gross margin targets (>70% per NFR13)
