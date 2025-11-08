# Calendar Service Selection

## Decision Date
2025-11-05

## Context
Story 1.7 requires integration with a calendar booking service for autonomous meeting scheduling. Two options were evaluated: Cal.com and Calendly.

## Requirements
- REST API for booking link generation
- OAuth 2.0 for calendar connection (Google Calendar, Outlook)
- Webhook support for booking/cancellation events
- EU data residency (GDPR compliance)
- Cost-effective for Micro-MVP (solo-preneur budget)
- Self-hostable option preferred

## Evaluation

### Cal.com

**Pros:**
- ✅ Open-source (self-hostable - free)
- ✅ Self-hosted option available for EU data residency
- ✅ REST API with booking links, events, webhooks
- ✅ OAuth 2.0 support for Google Calendar/Outlook
- ✅ Webhook support: BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED
- ✅ Free tier: Self-hosted option (no cost), hosted plans start at $8/month
- ✅ Active development and community support
- ✅ Flexible customization options

**Cons:**
- ⚠️ Self-hosted requires server setup (DevOps overhead)
- ⚠️ Hosted version requires paid plan for advanced features

**API Documentation:**
- REST API: https://cal.com/docs/api
- OAuth: https://cal.com/docs/api/oauth
- Webhooks: https://cal.com/docs/api/webhooks

### Calendly

**Pros:**
- ✅ Stable API with good documentation
- ✅ OAuth 2.0 support
- ✅ Webhook support for scheduled/cancelled events
- ✅ Hosted solution (zero DevOps)

**Cons:**
- ❌ No self-hosted option (vendor lock-in)
- ❌ Free tier has limited API access
- ❌ Paid plans start at $8/month (Essential plan required for API)
- ❌ US-based hosting (EU data residency concerns)
- ❌ Less flexible customization

**API Documentation:**
- REST API: https://developer.calendly.com/api-docs
- OAuth: https://developer.calendly.com/api-docs/CALendlyAPI/oauth
- Webhooks: https://developer.calendly.com/api-docs/CALendlyAPI/webhooks

## Comparison Matrix

| Feature | Cal.com | Calendly |
|---------|---------|----------|
| **Self-hostable** | ✅ Yes (open-source) | ❌ No |
| **Free tier** | ✅ Self-hosted (free) | ⚠️ Limited API access |
| **Hosted pricing** | $8/month+ | $8/month+ (Essential required) |
| **OAuth support** | ✅ Yes | ✅ Yes |
| **Webhook support** | ✅ Yes | ✅ Yes |
| **EU data residency** | ✅ Self-hosted option | ❌ US-based |
| **API reliability** | ✅ Stable | ✅ Stable |
| **Customization** | ✅ High (open-source) | ⚠️ Limited |

## Decision

**Selected: Cal.com (self-hosted or hosted)**

### Rationale

1. **EU Data Residency & GDPR Compliance:**
   - Self-hosted option allows data to remain in EU servers
   - Critical for GDPR compliance (NFR10)
   - Aligns with project's EU-first approach

2. **Cost Optimization:**
   - Self-hosted = $0/month (only server costs if not already running)
   - Hosted option available as fallback ($8/month)
   - Fits solo-preneur budget constraints

3. **Flexibility:**
   - Open-source allows custom modifications
   - Better integration control
   - No vendor lock-in

4. **Micro-MVP Speed:**
   - Can use hosted version initially for speed
   - Migrate to self-hosted later if needed
   - API structure similar, easy migration path

### Implementation Plan

**Phase 1 (Micro-MVP):**
- Use Cal.com hosted version for speed
- API key-based authentication (simpler than OAuth initially)
- Configure webhooks for booking events

**Phase 2 (Post-MVP):**
- Evaluate self-hosting if EU data residency becomes critical
- Migrate to self-hosted if needed (API compatible)

### Configuration

**Environment Variables:**
```bash
CAL_COM_API_KEY=your_api_key_here
CAL_COM_BASE_URL=https://api.cal.com  # or https://cal.yourdomain.com for self-hosted
CAL_COM_USERNAME=your_username  # Optional: for booking link generation
```

**API Credentials Storage:**
- Store in `api_credentials` table:
  - `service_name = 'calcom'` or `'cal_com'`
  - `api_key` = API key (encrypted)
  - `metadata` = `{ base_url, username, oauth_client_id, oauth_client_secret, default_event_type_id }` (for OAuth)

## References

- Cal.com API Docs: https://cal.com/docs/api
- Calendly API Docs: https://developer.calendly.com/api-docs
- Story 1.7: `docs/stories/1.7.meeting-booking-integration.md`





