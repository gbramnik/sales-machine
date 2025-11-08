---
title: "Monitoring Setup"
category: "monitoring"
keywords: ["monitoring", "sentry", "betterstack", "alerts", "slack"]
last_updated: "2025-01-17"
---

# Monitoring Setup

## Problem

**Problem Description:**
Monitoring tools (Sentry, Better Stack, Slack alerts) are not configured or not working correctly, preventing proper error tracking and alerting.

**Symptoms:**
- Errors not appearing in Sentry
- Uptime monitoring not working
- Slack alerts not being sent
- Monitoring dashboards empty or incorrect

## Diagnosis Steps

1. **Check Sentry configuration**
   - Verify `SENTRY_DSN` environment variable is set
   - Verify `SENTRY_DSN_FRONTEND` environment variable is set (for frontend)
   - Verify `SENTRY_ENVIRONMENT` environment variable is set
   - Check Sentry dashboard for project configuration

2. **Check Better Stack configuration**
   - Verify Better Stack account is created
   - Verify uptime monitors are configured
   - Check monitor URLs are correct
   - Verify alert channels are configured

3. **Check Slack webhook configuration**
   - Verify `SLACK_WEBHOOK_URL` environment variable is set
   - Test Slack webhook manually
   - Check Slack workspace for webhook app

4. **Check N8N workflow monitoring**
   - Verify `N8N_API_KEY` environment variable is set
   - Verify `N8N_BASE_URL` environment variable is set
   - Check N8N workflows are active
   - Review N8N execution logs

## Resolution Steps

### Sentry Configuration

1. **Create Sentry account and project**
   - Visit https://sentry.io
   - Create account (if not exists)
   - Create new project (Node.js for backend, React for frontend)
   - Copy DSN from project settings

2. **Configure backend Sentry**
   ```bash
   # Set environment variables
   export SENTRY_DSN=https://xxx@sentry.io/xxx
   export SENTRY_ENVIRONMENT=production
   ```
   - Verify Sentry initialized in `apps/api/src/server.ts`
   - Test error tracking: `GET /test-error` endpoint

3. **Configure frontend Sentry**
   ```bash
   # Set environment variables
   export VITE_SENTRY_DSN_FRONTEND=https://xxx@sentry.io/xxx
   export VITE_SENTRY_ENVIRONMENT=production
   ```
   - Verify Sentry initialized in `apps/web/src/main.tsx`
   - Test error tracking: Trigger React error

4. **Configure Sentry Slack integration**
   - Sentry dashboard → Settings → Integrations → Slack
   - Connect Slack workspace
   - Configure alert rules:
     - Critical errors (level: error, fatal) → Slack #alerts
     - High-frequency errors (>10 errors/hour) → Slack #alerts

### Better Stack Configuration

1. **Create Better Stack account**
   - Visit https://betterstack.com
   - Create account (if not exists)
   - Set up workspace

2. **Create uptime monitors**
   - **API Gateway:**
     - URL: `https://api.sales-machine.com/health`
     - Check interval: 5 minutes
     - Alert threshold: Down for >2 minutes
   - **Frontend:**
     - URL: `https://app.sales-machine.com`
     - Check interval: 5 minutes
     - Alert threshold: Down for >2 minutes
   - **N8N Health:**
     - URL: `https://n8n.srv997159.hstgr.cloud/webhook/health/{workflow-id}`
     - Check interval: 5 minutes
     - Alert threshold: Down for >2 minutes

3. **Configure alert channels**
   - Better Stack dashboard → Settings → Integrations → Slack
   - Connect Slack workspace
   - Configure alerts:
     - Downtime detected → Slack #alerts
     - Uptime recovered → Slack #alerts

### Slack Webhook Configuration

1. **Create Slack webhook**
   - Slack workspace → Apps → Incoming Webhooks
   - Create webhook for #alerts channel
   - Copy webhook URL

2. **Configure environment variable**
   ```bash
   export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
   ```

3. **Test Slack webhook**
   ```bash
   curl -X POST $SLACK_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"text": "Test alert"}'
   ```

### N8N Workflow Monitoring

1. **Configure N8N API access**
   ```bash
   export N8N_API_KEY=your-api-key
   export N8N_BASE_URL=https://n8n.srv997159.hstgr.cloud
   ```

2. **Activate monitoring workflows**
   - Activate `workflows/monitoring-workflow-execution.json`
   - Activate `workflows/monitoring-cost-tracking.json`
   - Activate `workflows/monitoring-weekly-summary.json`

3. **Test N8N API access**
   ```bash
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     $N8N_BASE_URL/api/v1/executions
   ```

## Prevention

- Regularly test monitoring tools
- Set up alerts for monitoring tool failures
- Monitor monitoring tool status pages
- Review monitoring dashboards daily
- Update monitoring configurations as needed

## Related Runbooks

- [N8N Workflow Failures](../workflows/n8n-workflow-failures.md)
- [Database Performance Degradation](../database/performance-degradation.md)

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Better Stack Documentation](https://betterstack.com/docs)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)



