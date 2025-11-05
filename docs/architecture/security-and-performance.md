# Security and Performance

## Security Requirements

**Frontend Security:**
- **CSP Headers:** `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.no-spray-no-pray.com https://*.supabase.co`
- **XSS Prevention:** React auto-escapes, DOMPurify for rich text (if needed)
- **Secure Storage:** Supabase session in httpOnly cookies, no localStorage for tokens

**Backend Security:**
- **Input Validation:** Zod schemas on all endpoints
- **Rate Limiting:** 100 requests/min/user via Upstash Redis
- **CORS Policy:** `https://app.no-spray-no-pray.com` only (production - domain TBD)

**Authentication Security:**
- **Token Storage:** JWT in Supabase Auth session (httpOnly cookies)
- **Session Management:** 24h session tokens in Upstash Redis
- **Password Policy:** Enforced by Supabase Auth (8+ chars, complexity)

**API Key Rotation Policy:**
- **Rotation Schedule:** All API keys rotated every 90 days (quarterly)
- **Rotation Process:**
  1. Generate new key in provider dashboard (N8N Cloud, Claude, UniPil, SMTP provider, Cal.com)
  2. Update Railway environment variable with new key
  3. Redeploy API Gateway (`git commit -m "chore: rotate API keys" --allow-empty && git push`)
  4. Revoke old key after 24h grace period (allow in-flight requests to complete)
- **Incident Response:** Immediate rotation if key suspected compromised
- **Automated Alerts:** Calendar reminder 7 days before rotation due date
- **Keys Requiring Rotation:**
  - `N8N_API_KEY` (N8N Cloud webhook authentication)
  - `CLAUDE_API_KEY` (Anthropic API)
  - `UNIPIL_API_KEY` (LinkedIn automation: warm-up, connections, messages)
  - `SENDGRID_API_KEY` / `MAILGUN_API_KEY` / `AWS_SES_ACCESS_KEY` (SMTP email sending)
  - `EMAIL_FINDER_API_KEY` (Email finder service: Anymail/Better Contacts)
  - `CAL_COM_API_KEY` (Meeting booking)

## Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** <200KB initial, <500KB total
- **Core Web Vitals Targets:**
  - Largest Contentful Paint (LCP): <2.5s
  - First Input Delay (FID): <100ms
  - Cumulative Layout Shift (CLS): <0.1
  - Time to Interactive (TTI): <3.5s
- **Loading Strategy:** Code splitting via React.lazy, route-based chunks
- **Code Splitting Strategy:**
  - Route-based: Each page lazy-loaded via React.lazy
  - Vendor chunk: Separate chunk for node_modules (long-term caching)
  - Shared chunk: Common components (HealthScoreCard, PipelineKanban) in shared.chunk.js
- **Caching Strategy:** Supabase Realtime for live data, React Query for API cache
- **Bundle Size Monitoring:** CI check fails if initial bundle >200KB

**Backend Performance:**
- **Response Time Target:** <500ms p95 for API endpoints
- **Database Optimization:** Indexes on user_id, status, created_at; query result caching in Redis
- **Caching Strategy:** Enrichment data cached 7 days, session tokens 24h

---
