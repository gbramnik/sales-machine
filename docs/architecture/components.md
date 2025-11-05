# Components

*[Condensed component descriptions - see full architecture for details]*

## Frontend (React SPA)
- Pages: Dashboard, ReviewQueue, Onboarding, Prospects, Analytics, WarmupStatus
- Components: DailyProspectsCard, WarmupStatusCard, LinkedInConversationsCard, HealthScoreCard, PipelineKanban, AIActivityStream, MessageReviewCard
- State: Zustand (UI state), Supabase Realtime (server state)
- Routing: React Router with ProtectedRoute wrapper

## API Gateway (Fastify)
- Routes: Auth, Onboarding, Campaigns, Prospects, Review Queue, Meetings, Dashboard, Webhooks, Warmup
- Middleware: JWT auth, rate limiting (Upstash Redis), audit logging
- Services: Campaign, Prospect, UniPil, SMTP, Warmup, N8N trigger, Cache (Redis), Supabase queries

## N8N Workflows
1. **Daily Prospect Detection** (6h AM) - UniPil API search → ICP/Persona matching → Exclude already contacted → Store 20 prospects/day
2. **Comprehensive Enrichment** - UniPil (profile + company page) → Web scraping → Email finder API → Claude API → Cache Redis (7d) → Supabase
3. **LinkedIn Warm-up** (7-15 days) - Daily actions (likes, comments) → Detect authors commented → Track actions → After delay → Mark ready for connection
4. **LinkedIn Connection** - UniPil API → Send connection request → Store connection status → If accepted → Trigger AI conversation
5. **AI Conversation** (LinkedIn + Email) - LinkedIn reply via UniPil → Email reply via SMTP → Claude qualification → Queue/Send/Book meeting
6. **Email Scheduler** - Dequeue Redis (50-100/day) → SMTP dédié → Update status (fallback if connection rejected)
7. **Meeting Booking** - Generate Cal.com link → Send invite → Store meeting

## Supabase (Database)
- PostgreSQL 15+ with Row-Level Security policies
- Realtime WebSocket for activity stream
- Auth with OAuth2 (Google/LinkedIn)
- New tables: linkedin_warmup_actions, linkedin_warmup_schedule, linkedin_connections
- Extended: prospect_enrichment (company_data, website_data, email_found, phone_found), conversations (channel, linkedin_message_id, email_message_id)

## Upstash Redis
- Session tokens (24h TTL)
- Enrichment cache (7d TTL)
- Email queue (sorted set by timestamp)
- Rate limit counters (1min TTL)
- Warm-up action tracking (daily limits per user)

---
