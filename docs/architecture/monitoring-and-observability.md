# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** Sentry (error tracking, performance monitoring)
- **Backend Monitoring:** Sentry (error tracking, API performance)
- **Error Tracking:** Sentry (5K events/month free tier)
- **Performance Monitoring:** Sentry Performance (transaction tracing)
- **Logging:** Better Stack (Logtail) for centralized logs
- **Uptime Monitoring:** Better Stack Uptime (ping every 5 min)

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors
- API response times (from frontend perspective)
- User interactions (button clicks, form submissions)

**Backend Metrics:**
- Request rate (requests/min)
- Error rate (%)
- Response time (p50, p95, p99)
- Database query performance
- N8N workflow execution times

**Alerts:**
- Error rate > 5% (15 min window) → Slack notification
- API p95 response time > 1s → Email alert
- Uptime < 99.5% → Immediate Slack alert
- Cost alerts: Claude API > €50/day, Supabase > €100/month

---
