# Epic 4: Advanced Intent Signals & MCP Architecture

**Expanded Goal:** Implement BuiltWith tech stack detection and social engagement signals for differentiated targeting. Refactor Epic 1 direct integrations to MCP abstraction layer for tool-agnostic flexibility (future-proofing against vendor lock-in).

**Timeline:** Weeks 12-13 (80h solo development)

## Story 4.1: BuiltWith Tech Stack Detection
**As a** user,
**I want** to identify prospects using specific technologies,
**so that** I can target users of competitive or complementary tools.

**Acceptance Criteria:**
1. BuiltWith API integration configured with credits purchased
2. For each prospect with website: Query BuiltWith for tech stack (CRM, marketing automation, analytics, hosting)
3. Tech stack data stored in `prospect_tech_stack` table (prospect_id, technologies array, detected_at)
4. Filtering capability: "Find all prospects using HubSpot CRM" or "Using WordPress but not using marketing automation"
5. Enrichment enhancement: Claude prompt includes tech stack: "This prospect uses [tech_stack], suggest relevant talking points"
6. Use case: Target prospects using inferior tools with upgrade pitch

## Story 4.2: Social Engagement Intent Signals
**As a** user,
**I want** to find prospects engaging with relevant content,
**so that** I can reach them when they're actively interested in related topics.

**Acceptance Criteria:**
1. LinkedIn post commenters scraper: Given a LinkedIn post URL, scrape all commenters' profiles
2. Instagram post commenters scraper: Given Instagram post, extract commenters (if public account)
3. Engagement data stored with intent_signal="social_engagement", source_post_url, engagement_type (comment/like)
4. Use case: Scrape comments on competitor posts, thought leader posts in industry
5. Prioritization: Social engagement prospects marked higher priority in email queue (send first)
6. Analytics: Track conversion rate for social_engagement prospects vs. cold scraping

## Story 4.3: MCP Abstraction Layer - Scraping
**As a** developer,
**I want** to abstract scraping integrations via MCP,
**so that** I can swap PhantomBuster for Captain Data without rewriting workflows.

**Acceptance Criteria:**
1. MCP server created for Scraping category with standard interface: scrape(source, parameters) → prospect_data[]
2. PhantomBuster adapter implements scraping interface (wraps existing N8N integration)
3. Captain Data adapter created as backup (same interface, different implementation)
4. N8N workflows refactored to call MCP Scraping server (not PhantomBuster directly)
5. Configuration: Admin can switch scraping provider via environment variable (SCRAPING_PROVIDER=phantombuster|captaindata)
6. Testing: Validate both adapters return same data structure

## Story 4.4: MCP Abstraction Layer - Enrichment
**As a** developer,
**I want** to abstract AI enrichment via MCP,
**so that** I can swap Claude for GPT-4 or Mistral if pricing/performance changes.

**Acceptance Criteria:**
1. MCP server created for Enrichment category with interface: enrich(prospect_data) → enrichment_data
2. Claude adapter implements enrichment interface
3. OpenAI GPT-4 adapter created as alternative (same prompt structure, different API)
4. Configuration: Switch via ENRICHMENT_PROVIDER environment variable
5. Cost comparison dashboard: Track cost-per-enrichment for each provider
6. A/B testing: Run 10% of enrichments through alternative provider, compare quality

---
