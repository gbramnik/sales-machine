# Operational Runbooks

Step-by-step troubleshooting guides for quickly resolving common issues without research.

## Quick Links

### Email Issues
- [Deliverability Degradation](./email/deliverability-degradation.md) - Bounce rate spikes, spam complaints, low deliverability

### Workflow Issues
- [N8N Workflow Failures](./workflows/n8n-workflow-failures.md) - UniPil errors, Claude API timeouts, webhook errors

### Onboarding Issues
- [User Onboarding Issues](./onboarding/user-onboarding-issues.md) - Domain verification fails, calendar connection errors, OAuth errors

### Database Issues
- [Database Performance Degradation](./database/performance-degradation.md) - Slow queries, connection pool exhaustion, high CPU/memory usage

### Monitoring Issues
- [Monitoring Setup](./monitoring/monitoring-setup.md) - Sentry, Better Stack, Slack alerts configuration

## Runbook Format

All runbooks follow a consistent format:

1. **Problem** - Description and symptoms
2. **Diagnosis Steps** - How to identify the issue
3. **Resolution Steps** - How to fix the issue (immediate, short-term, long-term)
4. **Prevention** - How to prevent the issue from recurring
5. **Related Runbooks** - Links to related troubleshooting guides
6. **Additional Resources** - External documentation and references

## Search

Use the keywords in each runbook's frontmatter to search for specific issues:

- **Email:** deliverability, bounce rate, spam, mailgun, sendgrid
- **Workflows:** n8n, workflow, unipil, claude, api, timeout, error
- **Onboarding:** onboarding, domain, verification, calendar, oauth, smtp
- **Database:** database, performance, slow queries, connection pool, supabase, postgresql
- **Monitoring:** monitoring, sentry, betterstack, alerts, slack

## Contributing

When creating a new runbook:

1. Use the [runbook template](./template.md)
2. Follow the standard format (Problem → Diagnosis → Resolution → Prevention)
3. Include frontmatter with title, category, keywords, and last_updated date
4. Add links to related runbooks
5. Test the runbook in staging environment
6. Update this index

## Testing

All runbooks should be tested in staging environment before use in production:

1. Simulate the issue in staging
2. Follow diagnosis steps
3. Follow resolution steps
4. Verify issue resolved
5. Document test results in [test-results.md](./test-results.md)

## Categories

### Email Issues (`email/`)
Issues related to email delivery, deliverability, and email infrastructure.

### Workflow Issues (`workflows/`)
Issues related to N8N workflows, external API integrations, and automation.

### Onboarding Issues (`onboarding/`)
Issues related to user onboarding, domain verification, and OAuth connections.

### Database Issues (`database/`)
Issues related to database performance, queries, and connections.

### Monitoring Issues (`monitoring/`)
Issues related to monitoring tools, alerts, and observability.

## Last Updated

All runbooks are regularly updated. Check the `last_updated` date in each runbook's frontmatter for the most recent version.



