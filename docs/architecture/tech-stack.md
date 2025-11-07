# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3+ | Type-safe React development | Catch bugs at compile-time, solo dev needs safety net; IntelliSense accelerates development |
| **Frontend Framework** | React | 18.2+ | UI component library | Mature ecosystem, shadcn/ui requires React, Supabase Realtime has official React hooks |
| **UI Component Library** | shadcn/ui | 0.5.0+ | Pre-built accessible components | Tailwind-based, copy-paste (not npm dependency), full customization control, WCAG AA compliant |
| **State Management** | Zustand | 4.4+ | Lightweight global state | Simpler than Redux (200 lines vs. 2000), no boilerplate, React 18 concurrent mode compatible |
| **Backend Language** | TypeScript (Node.js) | 20 LTS | API Gateway logic | Share types with frontend via `packages/shared`, single-language stack reduces context switching |
| **Backend Framework** | Fastify | 4.24+ | HTTP server for API Gateway | 2x faster than Express, built-in TypeScript support, plugin ecosystem for auth/validation |
| **Runtime Validation** | Zod | 3.22+ | Type-safe schema validation | Validate N8N webhooks, Redis cache, external API responses at runtime; auto-infer TypeScript types |
| **API Style** | REST | - | HTTP endpoints for CRUD operations | Simpler than GraphQL for Micro-MVP, N8N webhooks are REST-based, easy Railway deployment |
| **Database** | Supabase (PostgreSQL) | 15+ | Primary data store + Auth + Realtime | Managed PostgreSQL eliminates DevOps, Row-Level Security for multi-tenant isolation, Realtime for Activity Stream |
| **Cache** | Upstash Redis | 7.0+ | Session tokens, enrichment cache, email queue | Serverless pricing (free tier 10K commands/day), REST API compatible with edge functions |
| **File Storage** | Supabase Storage | - | User avatars, email attachments (future) | S3-compatible, integrated with Supabase Auth RLS, €0.021/GB storage |
| **Authentication** | Supabase Auth | - | OAuth2 (Google/LinkedIn), JWT tokens | Pre-built OAuth flows save 2-3 days, JWT validation built-in, session management via Upstash Redis |
| **Frontend Testing** | Vitest | 1.0+ | Unit tests for components, hooks | Vite-native (fast), Jest-compatible API, 10x faster than Jest for small test suites |
| **Backend Testing** | Vitest | 1.0+ | Unit tests for API routes, services | Unified testing framework (same as frontend), native TypeScript support |
| **E2E Testing** | Playwright | 1.40+ | Critical user journeys (onboarding, review queue) | Cross-browser, auto-wait reduces flaky tests, codegen for fast test creation |
| **Build Tool** | Vite | 5.0+ | Frontend bundler | 100x faster HMR than Webpack, native ESM, optimized production builds (<200KB initial bundle) |
| **Bundler** | esbuild (via Vite) | 0.19+ | JavaScript/TypeScript transpilation | 10-100x faster than Babel, built into Vite, supports TypeScript natively |
| **IaC Tool** | N/A (Micro-MVP) | - | Defer to Full MVP | Managed services (Railway, Supabase, N8N Cloud) use web UI config; codify with Pulumi in Phase 2 |
| **CI/CD** | GitHub Actions | - | Lint, test, deploy on push to main | Free for public repos, Railway has native GitHub integration (auto-deploy), simple YAML config |
| **Monitoring** | Sentry | SaaS | Error tracking (frontend + backend) | 5K events/month free tier, source maps support, Slack alerting, solo-friendly setup (10 min) |
| **Logging** | Better Stack (Logtail) | SaaS | Centralized logs from Railway + N8N | 1GB/month free tier, search/filter UI, retention 7 days (sufficient for debugging) |
| **CSS Framework** | Tailwind CSS | 3.4+ | Utility-first styling | shadcn/ui requirement, no CSS file bloat, PurgeCSS removes unused classes (final CSS <50KB) |
| **Orchestration** | N8N Cloud | Latest | Workflow automation engine | Visual debugging 5x faster than logs, 22 existing workflows proven, EU data residency |
| **Web Scraping & Search** | Unipile + Tavily | Latest | Company/profile context enrichment | Unipile handles LinkedIn/company browsing; Tavily Search/Extract APIs add site insights at low cost [[source]](https://docs.tavily.com/documentation/api-reference/endpoint/search) |
| **AI/LLM** | Claude API (Anthropic) | Sonnet 3.5/4 | Prospect enrichment, conversation agent | Superior reasoning for B2B context, lower hallucination rate than GPT-4, GDPR-compliant EU inference |
| **Charts/Visualization** | Recharts | 2.10+ | Health Score, Pipeline charts | React-native, composable, smaller bundle than Chart.js (40KB vs. 150KB), accessible SVG output |

## Type Safety Architecture

**Supabase Auto-Generated Types:**
```bash
# Generate TypeScript types from database schema
npm run generate:types  # Calls: supabase gen types typescript
```

**Type Flow:**
```
Database Schema (PostgreSQL)
    ↓ (supabase gen types)
packages/shared/types/database.types.ts (auto-generated)
    ↓ (extends)
packages/shared/types/*.ts (business logic types)
    ↓ (imports)
apps/api + apps/web (consume shared types)
    ↓ (validates with)
Zod schemas (runtime type safety for N8N/Redis)
```

**Example:**
```typescript
// packages/shared/src/types/database.types.ts (AUTO-GENERATED)
export type Database = {
  public: {
    Tables: {
      prospects: {
        Row: { id: string; name: string; ... }
      }
    }
  }
}

// packages/shared/src/types/prospect.ts (MANUAL)
import type { Database } from './database.types'
export type ProspectRow = Database['public']['Tables']['prospects']['Row']
export interface Prospect extends ProspectRow {
  displayName: string;  // Computed field
}

// Zod schema for N8N webhook validation
export const N8NProspectPayloadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // ...
});
```

---
