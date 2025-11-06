---
title: "N8N Workflow Failures"
category: "workflows"
keywords: ["n8n", "workflow", "unipil", "claude", "api", "timeout", "error"]
last_updated: "2025-01-17"
---

# N8N Workflow Failures

## Problem

**Problem Description:**
N8N workflows are failing due to various errors including UniPil API errors, Claude API timeouts, webhook errors, and database connection issues.

**Symptoms:**
- Workflow execution failures in N8N dashboard
- Error notifications in Slack (from Story 6.1)
- Prospects not being processed
- AI enrichment not completing
- LinkedIn automation not working
- Email sending delays

## Diagnosis Steps

1. **Check N8N execution logs for failed workflows**
   - Login to N8N dashboard: https://n8n.srv997159.hstgr.cloud
   - Navigate to Executions tab
   - Filter by "Failed" status
   - Review error messages and stack traces

2. **Identify error type:**
   - **UniPil errors:**
     - API rate limits exceeded
     - Authentication failures
     - LinkedIn API errors
     - Connection timeouts
   - **Claude API timeouts:**
     - Rate limits exceeded
     - API errors (429, 500, 503)
     - Request timeouts
   - **Webhook errors:**
     - Authentication failures
     - Payload format errors
     - URL not found (404)
   - **Database errors:**
     - Connection errors
     - Query timeouts
     - Constraint violations

3. **Check error frequency (isolated vs. systematic)**
   - Review execution history for patterns
   - Check if errors are isolated or affecting all workflows
   - Identify time-based patterns (peak hours, etc.)

4. **Review workflow configuration**
   - Check API credentials (UniPil, Claude)
   - Verify API keys are valid and not expired
   - Check webhook URLs and authentication
   - Review workflow node configurations

5. **Check external service status**
   - **UniPil API:**
     - Check UniPil status page (if available)
     - Review UniPil API documentation for known issues
   - **Claude API:**
     - Check Anthropic status page: https://status.anthropic.com
     - Review Claude API documentation for rate limits
   - **Supabase:**
     - Check Supabase status page: https://status.supabase.com
     - Review Supabase dashboard for connection issues

6. **Review workflow execution history for patterns**
   - Check execution times (slow workflows)
   - Review error frequency trends
   - Identify workflows with highest failure rates

## Resolution Steps

### UniPil Errors

1. **Check UniPil API status**
   - Review UniPil API documentation
   - Check for known issues or maintenance windows
   - Contact UniPil support if persistent

2. **Verify API credentials**
   - Check UniPil API key in N8N credentials
   - Refresh API key if expired
   - Verify API key has correct permissions

3. **Check rate limits**
   - Review UniPil API rate limits
   - Reduce concurrent workflows if rate limited
   - Implement retry logic with exponential backoff
   - Add delays between API calls

4. **Review UniPil error message for specific issue**
   - Check error response from UniPil API
   - Review UniPilService implementation for error handling
   - Check LinkedIn API errors (may be passed through UniPil)

5. **Retry failed workflow execution**
   - In N8N dashboard, click "Retry" on failed execution
   - Monitor retry success rate

**Common UniPil Errors:**
- `401 Unauthorized`: Invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: UniPil service issue
- `LinkedIn API Error`: LinkedIn-specific error (passed through UniPil)

### Claude API Timeouts

1. **Check Claude API status**
   - Visit Anthropic status page: https://status.anthropic.com
   - Check for known issues or outages

2. **Verify API key**
   - Check Claude API key in N8N credentials
   - Refresh API key if expired
   - Verify API key has correct permissions

3. **Check rate limits**
   - Review Claude API rate limits for your tier
   - Typical limits: 50 requests/minute (free), 1000 requests/minute (paid)
   - Implement retry logic with exponential backoff
   - Add delays between API calls

4. **Reduce request size**
   - Split large requests into smaller chunks
   - Reduce token count per request
   - Use smaller models (Haiku instead of Opus) if appropriate

5. **Increase timeout settings (if applicable)**
   - Review N8N HTTP Request node timeout settings
   - Increase timeout for Claude API calls (default: 30s, try 60s)

### Webhook Errors

1. **Verify webhook URL is correct**
   - Check webhook URL in workflow configuration
   - Verify webhook path matches API route
   - Test webhook URL manually (curl, Postman)

2. **Check webhook authentication**
   - Verify API key or JWT token is correct
   - Check Authorization header format
   - Verify webhook signature (if applicable)

3. **Verify webhook payload format**
   - Check payload matches expected format
   - Review API route expectations
   - Test payload manually

4. **Test webhook manually**
   ```bash
   curl -X POST https://api.sales-machine.com/webhooks/n8n/linkedin-scrape \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{"user_id": "test", "search_criteria": {...}}'
   ```

5. **Review webhook provider status**
   - Check if webhook provider (N8N, Cal.com, etc.) is operational
   - Review webhook provider logs

### Database Errors

1. **Check database connection (Supabase status)**
   - Visit Supabase status page: https://status.supabase.com
   - Check Supabase dashboard for connection issues
   - Review connection pool usage

2. **Verify database credentials**
   - Check Supabase connection string in N8N
   - Verify database credentials are correct
   - Refresh credentials if expired

3. **Review query performance (slow queries)**
   - Check Supabase dashboard → Database → Query Performance
   - Identify slow queries (> 100ms)
   - Review query execution plans

4. **Check database connection pool (exhausted pool)**
   - Review connection pool usage in Supabase dashboard
   - Check for connection pool exhaustion errors
   - Increase connection pool size if needed

5. **Review database error logs**
   - Check Supabase dashboard → Logs
   - Review database error messages
   - Check for constraint violations, timeouts

### General Resolution

1. **Retry failed workflow execution**
   - In N8N dashboard, click "Retry" on failed execution
   - Monitor retry success rate

2. **Fix workflow configuration if needed**
   - Update API credentials
   - Fix webhook URLs
   - Update node configurations

3. **Update workflow with error handling**
   - Add error handling nodes
   - Implement retry logic
   - Add error notifications

4. **Monitor workflow execution after fix**
   - Watch workflow executions for 24-48 hours
   - Verify error rate decreases
   - Document resolution

## Prevention

- Set up workflow failure alerts (Story 6.1)
- Implement retry logic in workflows (exponential backoff)
- Monitor external service status (UniPil API, Claude API)
- Regularly review workflow execution logs
- Test workflows after configuration changes
- Implement error handling in workflows
- Monitor API rate limits and usage
- Set up alerts for high error rates

## Related Runbooks

- [Database Performance Degradation](../database/performance-degradation.md)
- [Monitoring Setup](../monitoring/monitoring-setup.md)

## Additional Resources

- [N8N Documentation](https://docs.n8n.io/)
- [UniPil API Documentation](https://unipil.com/docs)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [Supabase Documentation](https://supabase.com/docs)

