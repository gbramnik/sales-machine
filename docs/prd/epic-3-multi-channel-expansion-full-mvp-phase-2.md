# Epic 3: Multi-Channel Expansion (Full MVP Phase 2)

**Expanded Goal:** Extend beyond email+LinkedIn foundation to WhatsApp and Google Maps scraping, enabling users to reach prospects on their preferred platforms. Email must still generate 60%+ meetings standalone (platform resilience per brief).

**Timeline:** Week 11 (40h solo development)

## Story 3.1: WhatsApp Business API Integration
**As a** user,
**I want** to send personalized WhatsApp messages to prospects,
**so that** I can reach them on a high-engagement channel.

**Acceptance Criteria:**
1. WhatsApp Business API account setup with verified business profile
2. N8N workflow to send WhatsApp messages via API (text only for MVP, no media)
3. Message queue in Upstash Redis (separate from email queue) with daily limit: 50 messages/day (conservative start)
4. Template library: 3 WhatsApp-specific templates (shorter, more casual than email)
5. Opt-out handling: Automatic unsubscribe if prospect replies "STOP" or reports spam
6. Analytics: Track delivery rate, read rate, reply rate (WhatsApp provides read receipts)
7. Multi-channel coordination: If prospect already contacted via email, wait 48h before WhatsApp (avoid saturation)

## Story 3.2: Google Maps Local Business Scraping
**As a** user,
**I want** to scrape local businesses from Google Maps,
**so that** I can target geographically-specific prospects (e.g., restaurants, retail, services in Paris).

**Acceptance Criteria:**
1. PhantomBuster Google Maps scraper configured with parameters: category, city, radius
2. Scraped data includes: business name, address, phone, website, Google rating, review count
3. Data stored in `prospects` table with source="google_maps" tag
4. Enrichment workflow: Extract website → scrape for contact email → enrich with Claude API
5. Use case validation: Target local service businesses (restaurants, boutiques, agencies) vs. corporate B2B
6. Rate limiting: 100 businesses/day (respect Google scraping limits)

---
