# API Specification

## REST API Base

**Base URL:** `https://api.sales-machine.com`
**Authentication:** Bearer JWT token (Supabase Auth)

## Core Endpoints

**Authentication & User**
- `POST /auth/callback` - OAuth callback handler
- `GET /users/me` - Current user profile
- `PATCH /users/me` - Update user profile

**Onboarding**
- `POST /onboarding/start` - Initialize wizard
- `POST /onboarding/step/industry` - Save industry, get ICP recommendations
- `POST /onboarding/step/domain` - Verify DNS records
- `POST /onboarding/step/calendar` - Connect calendar OAuth
- `POST /onboarding/complete` - Finalize and create campaign

**Campaigns**
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign with stats
- `PATCH /campaigns/:id` - Update campaign
- `POST /campaigns/:id/trigger-scrape` - Manual LinkedIn scrape

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

**Webhooks (N8N/External)**
- `POST /webhooks/n8n/prospect-scraped` - LinkedIn scraper results
- `POST /webhooks/n8n/enrichment-complete` - AI enrichment results
- `POST /webhooks/instantly/email-reply` - Prospect email replies
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
