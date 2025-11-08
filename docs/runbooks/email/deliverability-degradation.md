---
title: "Deliverability Degradation"
category: "email"
keywords: ["deliverability", "bounce rate", "spam", "email", "mailgun", "sendgrid"]
last_updated: "2025-01-17"
---

# Deliverability Degradation

## Problem

**Problem Description:**
Email deliverability drops significantly, resulting in high bounce rates, spam complaints, and emails landing in spam folders instead of inboxes.

**Symptoms:**
- Bounce rate > 5% (normal: < 2%)
- Spam complaints > 0.1% (normal: < 0.1%)
- Open rate drops significantly
- Emails landing in spam folder
- Low inbox placement rate

## Diagnosis Steps

1. **Check deliverability health dashboard (if exists)**
   - Navigate to deliverability health endpoint: `GET /api/campaigns/deliverability-health`
   - Review bounce rate, spam complaint rate, open rate
   - Check health status (green/yellow/red)

2. **Review bounce rate in email provider dashboard**
   - **Mailgun (Primary Provider):**
     - Login to Mailgun dashboard: https://app.mailgun.com
     - Navigate to Analytics → Bounces
     - Review bounce rate trends
     - Check bounce types (hard bounces, soft bounces)
   - **SendGrid (if configured):**
     - Login to SendGrid dashboard: https://app.sendgrid.com
     - Navigate to Activity → Bounces
   - **AWS SES (if configured):**
     - Login to AWS Console → SES
     - Navigate to Bounces tab

3. **Check spam complaint rate in email provider dashboard**
   - **Mailgun:**
     - Navigate to Analytics → Spam Complaints
     - Review complaint rate trends
   - **SendGrid:**
     - Navigate to Activity → Spam Reports
   - **AWS SES:**
     - Navigate to Complaints tab

4. **Review recent email content for spam triggers**
   - Check for spam words (FREE, CLICK HERE, URGENT, etc.)
   - Review link density (too many links)
   - Check for excessive capitalization
   - Review email subject lines
   - Check for broken HTML

5. **Check sender reputation (if available)**
   - **Mailgun:**
     - Navigate to Sending → Domains
     - Check domain reputation score
   - Use external tools:
     - Sender Score: https://www.senderscore.org
     - Google Postmaster Tools: https://postmaster.google.com

6. **Review domain authentication (SPF, DKIM, DMARC records)**
   ```bash
   # Check SPF record
   dig TXT yourdomain.com | grep spf
   
   # Check DKIM record
   dig TXT default._domainkey.yourdomain.com
   
   # Check DMARC record
   dig TXT _dmarc.yourdomain.com
   ```
   - Verify SPF record includes Mailgun: `v=spf1 include:mailgun.org ~all`
   - Verify DKIM record is valid
   - Verify DMARC policy is set (recommended: `p=quarantine` or `p=reject`)

7. **Check for blacklist status**
   - Use MXToolbox: https://mxtoolbox.com/blacklists.aspx
   - Enter your domain or IP address
   - Check if listed on any blacklists
   - Common blacklists: Spamhaus, SURBL, Barracuda

## Resolution Steps

### Immediate Actions

1. **Pause email campaigns if bounce rate > 10%**
   - Navigate to campaign management
   - Pause all active campaigns
   - Prevent further damage to sender reputation

2. **Remove bounced email addresses from prospect list**
   ```sql
   -- Query bounced prospects
   SELECT id, email, status 
   FROM prospects 
   WHERE status = 'unsubscribed' 
   AND updated_at > NOW() - INTERVAL '7 days';
   ```
   - Remove hard bounces from database
   - Update prospect status to 'unsubscribed'

3. **Review and fix domain authentication (SPF, DKIM, DMARC)**
   - **SPF Record:**
     ```
     v=spf1 include:mailgun.org ~all
     ```
   - **DKIM Record:**
     - Get DKIM key from Mailgun dashboard
     - Add TXT record: `default._domainkey.yourdomain.com`
   - **DMARC Record:**
     ```
     v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
     ```

### Short-term Actions

1. **Clean email list**
   - Remove invalid email addresses
   - Remove unsubscribed users
   - Remove hard bounces
   - Implement list hygiene process

2. **Review email content**
   - Remove spam trigger words
   - Reduce link density
   - Improve email personalization
   - Test email content with spam checkers (Mail-Tester.com)

3. **Warm up new sending domain (if domain changed)**
   - Start with low volume (50-100 emails/day)
   - Gradually increase volume over 2-4 weeks
   - Monitor deliverability metrics closely

4. **Contact email provider support for reputation review**
   - **Mailgun Support:** support@mailgun.com
   - Request reputation review
   - Provide context on bounce rate spike
   - Request guidance on improving deliverability

### Long-term Actions

1. **Implement double opt-in for email collection**
   - Require email confirmation before adding to list
   - Improve list quality
   - Reduce bounce rates

2. **Improve email content quality**
   - Personalize emails (use prospect name, company)
   - Make emails relevant to recipient
   - Segment email lists by interest/behavior
   - A/B test email content

3. **Monitor deliverability metrics daily**
   - Set up daily deliverability health checks
   - Review bounce rate, spam complaint rate, open rate
   - Track trends over time

4. **Set up alerts for bounce rate spikes (Story 6.1)**
   - Configure Slack alerts for bounce rate > 5%
   - Configure alerts for spam complaints > 0.1%
   - Monitor alerts daily

## Prevention

- Monitor deliverability metrics daily
- Set up alerts for bounce rate > 5% and spam complaints > 0.1%
- Regularly clean email list (remove bounces, unsubscribes)
- Maintain domain authentication (SPF, DKIM, DMARC)
- Follow email best practices (personalization, relevance, timing)
- Test email content before sending (spam checkers)
- Warm up new sending domains gradually
- Monitor sender reputation regularly

## Related Runbooks

- [N8N Workflow Failures](../workflows/n8n-workflow-failures.md)
- [Monitoring Setup](../monitoring/monitoring-setup.md)

## Additional Resources

- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Email Deliverability Best Practices](https://www.mailgun.com/blog/email-deliverability-guide/)
- [SPF Record Setup](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)
- [DKIM Record Setup](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)



