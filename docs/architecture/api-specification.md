# API Specification

## REST API Base

**Base URL:** `https://api.no-spray-no-pray.com` (or domain TBD)
**Authentication:** Bearer JWT token (Supabase Auth)

## Core Endpoints

**Authentication & User**
- `POST /auth/callback` - OAuth callback handler
- `GET /users/me` - Current user profile
- `PATCH /users/me` - Update user profile

**Onboarding**
- `POST /onboarding/start` - Initialize wizard
- `POST /onboarding/step/icp` - Define ICP criteria (multiple ICPs supported)
- `POST /onboarding/step/persona` - Define Persona criteria (multiple Personas supported)
- `POST /onboarding/step/linkedin` - Connect LinkedIn account (UniPil)
- `POST /onboarding/step/smtp` - Configure SMTP (SendGrid/Mailgun/SES)
- `POST /onboarding/step/warmup` - Configure LinkedIn warm-up settings (délai 7-15 jours, actions/jour)
- `POST /onboarding/step/domain` - Verify DNS records (automated DNS check)
- `POST /onboarding/step/calendar` - Connect calendar OAuth (Cal.com)
- `POST /onboarding/complete` - Finalize and launch campaign (single-button launch)

**Campaigns**
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign with stats
- `PATCH /campaigns/:id` - Update campaign
- `POST /campaigns/:id/trigger-detection` - Manual daily prospect detection (semi-automatic mode)

**Prospects**
- `GET /prospects` - List with filters (campaign, status, VIP, search)
- `GET /prospects/:id` - Get prospect with enrichment + conversations
- `PATCH /prospects/:id` - Update status, VIP flag
- `DELETE /prospects/:id` - GDPR deletion (cascade)

**AI Review Queue**
- `GET /ai-review-queue` - Get pending messages
- `POST /ai-review-queue/:id/approve` - Approve and send
- `POST /ai-review-queue/:id/edit` - Edit then send
- `POST /ai-review-queue/:id/reject` - Reject (don't send)
- `POST /ai-review-queue/bulk-approve` - Approve multiple

**Meetings**
- `GET /meetings` - List upcoming/past meetings
- `GET /meetings/:id` - Get meeting details with context
- `PATCH /meetings/:id/cancel` - Cancel meeting

**Dashboard**
- `GET /dashboard/stats` - Health score, metrics, review queue count
- `GET /dashboard/pipeline` - Prospects by stage
- `GET /dashboard/activity-stream` - Recent AI activity
- `GET /dashboard/daily-prospects` - Daily detected prospects (for semi-automatic mode validation)

**Warm-up Management**
- `GET /warmup/status` - Get warm-up status overview (prospects in warm-up, actions today, limits)
- `GET /warmup/prospects` - List prospects currently in warm-up phase
- `GET /warmup/prospects/:id` - Get warm-up details for specific prospect (actions, days remaining)
- `PATCH /warmup/settings` - Update warm-up settings (délai, daily limits)

**Webhooks (N8N/External)**
- `POST /webhooks/n8n/prospect-scraped` - LinkedIn scraper results
- `POST /webhooks/n8n/enrichment-complete` - AI enrichment results
- `POST /webhooks/n8n/warmup-complete` - LinkedIn warm-up period completed
- `POST /webhooks/n8n/connection-status` - LinkedIn connection request status (accepted/rejected)
- `POST /webhooks/unipil/linkedin-reply` - Prospect LinkedIn message replies
- `POST /webhooks/smtp/email-reply` - Prospect email replies (SMTP webhook)
- `POST /webhooks/cal/meeting-booked` - Meeting booking confirmations

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_REQUEST | Missing required fields |
| 401 | UNAUTHORIZED | Invalid/expired JWT |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource doesn't exist |
| 422 | VALIDATION_ERROR | Zod schema validation failed |
| 429 | RATE_LIMIT_EXCEEDED | >100 req/min |
| 500 | INTERNAL_SERVER_ERROR | Unhandled error |
| 503 | SERVICE_UNAVAILABLE | External service down |

---
