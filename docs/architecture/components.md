# Components

*[Condensed component descriptions - see full architecture for details]*

## Frontend (React SPA)
- Pages: Dashboard, ReviewQueue, Onboarding, Prospects, Analytics
- Components: HealthScoreCard, PipelineKanban, AIActivityStream, MessageReviewCard
- State: Zustand (UI state), Supabase Realtime (server state)
- Routing: React Router with ProtectedRoute wrapper

## API Gateway (Fastify)
- Routes: Auth, Onboarding, Campaigns, Prospects, Review Queue, Meetings, Dashboard, Webhooks
- Middleware: JWT auth, rate limiting (Upstash Redis), audit logging
- Services: Campaign, Prospect, N8N trigger, Cache (Redis), Supabase queries

## N8N Workflows
1. **LinkedIn Scraper** - PhantomBuster → Supabase → Trigger enrichment
2. **AI Enrichment** - Fetch prospect → Claude API → Cache Redis (7d) → Supabase
3. **Email Scheduler** - Dequeue Redis (20/day) → Instantly.ai → Update status
4. **AI Conversation** - Email reply → Claude qualification → Queue/Send/Book meeting
5. **Meeting Booking** - Generate Cal.com link → Send invite → Store meeting

## Supabase (Database)
- PostgreSQL 15+ with Row-Level Security policies
- Realtime WebSocket for activity stream
- Auth with OAuth2 (Google/LinkedIn)

## Upstash Redis
- Session tokens (24h TTL)
- Enrichment cache (7d TTL)
- Email queue (sorted set by timestamp)
- Rate limit counters (1min TTL)

---
