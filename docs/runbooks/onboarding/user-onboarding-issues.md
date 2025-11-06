---
title: "User Onboarding Issues"
category: "onboarding"
keywords: ["onboarding", "domain", "verification", "calendar", "oauth", "smtp"]
last_updated: "2025-01-17"
---

# User Onboarding Issues

## Problem

**Problem Description:**
Users cannot complete onboarding due to domain verification failures, calendar connection errors, OAuth errors, or email configuration issues.

**Symptoms:**
- User cannot complete onboarding
- Domain verification fails
- Calendar connection fails (OAuth error)
- Email configuration fails
- User reports onboarding issues
- Onboarding progress stuck at specific step

## Diagnosis Steps

1. **Check user onboarding status in database**
   ```sql
   -- Query user onboarding status
   SELECT id, email, onboarding_completed, onboarding_step, onboarding_data
   FROM users
   WHERE id = 'USER_ID';
   ```
   - Review onboarding_completed flag
   - Check onboarding_step (which step failed)
   - Review onboarding_data for error messages

2. **Review onboarding logs (if available)**
   - Check API logs for onboarding requests
   - Review error logs for onboarding endpoints
   - Check Sentry for onboarding errors (Story 6.1)

3. **Identify failure point:**
   - Domain verification step
   - Calendar connection step (OAuth)
   - Email configuration step
   - LinkedIn connection step
   - Other onboarding steps

4. **Check domain verification:**
   ```bash
   # Check SPF record
   dig TXT userdomain.com | grep spf
   
   # Check DKIM record
   dig TXT default._domainkey.userdomain.com
   
   # Check DMARC record
   dig TXT _dmarc.userdomain.com
   ```
   - Verify DNS records (SPF, DKIM, DMARC) are correct
   - Check domain verification API response
   - Review domain verification error message
   - Test domain verification endpoint manually

5. **Check calendar connection:**
   - Verify OAuth provider status (Google Calendar, Outlook)
   - Check OAuth credentials (client ID, secret) in environment variables
   - Review OAuth error message
   - Check OAuth callback URL configuration
   - Verify OAuth scopes are correct

6. **Check user account status:**
   - Verify user account exists in database
   - Check user permissions
   - Review user error logs
   - Check if user is blocked or suspended

## Resolution Steps

### Domain Verification Fails

1. **Verify DNS records are correct (SPF, DKIM, DMARC)**
   - **SPF Record:**
     ```
     v=spf1 include:mailgun.org ~all
     ```
   - **DKIM Record:**
     - Get DKIM key from Mailgun dashboard
     - Add TXT record: `default._domainkey.userdomain.com`
   - **DMARC Record:**
     ```
     v=DMARC1; p=quarantine; rua=mailto:dmarc@userdomain.com
     ```

2. **Check domain verification API (test manually)**
   ```bash
   curl -X POST https://api.sales-machine.com/api/onboarding/verify-domain \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer USER_TOKEN" \
     -d '{"domain": "userdomain.com"}'
   ```
   - Review API response for specific errors
   - Check if DNS records are detected correctly

3. **Guide user to fix DNS records (provide instructions)**
   - Provide step-by-step DNS setup instructions
   - Include screenshots or examples
   - Link to Mailgun domain verification guide

4. **Retry domain verification after DNS update**
   - Wait 5-10 minutes for DNS propagation
   - Retry domain verification
   - Monitor verification status

5. **If persistent: Contact domain provider support**
   - Check if domain provider has DNS restrictions
   - Verify domain is not blocked
   - Contact domain provider support if needed

### Calendar Connection Fails

1. **Verify OAuth provider status (Google Calendar, Outlook)**
   - **Google Calendar:**
     - Check Google Cloud status: https://status.cloud.google.com
     - Verify Google Calendar API is enabled
   - **Outlook:**
     - Check Microsoft 365 status: https://status.office365.com
     - Verify Microsoft Graph API is enabled

2. **Check OAuth credentials (refresh if needed)**
   - Verify OAuth client ID and secret in environment variables
   - Check OAuth credentials in Google Cloud Console / Azure Portal
   - Refresh OAuth credentials if expired
   - Verify OAuth redirect URIs are correct

3. **Verify OAuth callback URL is correct**
   - Check OAuth callback URL in OAuth provider settings
   - Verify callback URL matches application configuration
   - Test OAuth callback URL manually

4. **Guide user to re-authorize calendar connection**
   - Provide step-by-step OAuth authorization instructions
   - Clear existing OAuth tokens
   - Initiate new OAuth flow

5. **Clear OAuth tokens and retry connection**
   ```sql
   -- Clear user OAuth tokens (if stored in database)
   UPDATE users
   SET calendar_oauth_token = NULL, calendar_refresh_token = NULL
   WHERE id = 'USER_ID';
   ```
   - Clear OAuth tokens from database
   - Retry calendar connection

6. **If persistent: Check OAuth provider error logs**
   - Review OAuth provider error logs
   - Check for OAuth scope issues
   - Verify OAuth application permissions

### Email Configuration Fails

1. **Verify SMTP credentials (username, password, host, port)**
   - **Mailgun SMTP (Primary Provider):**
     - Host: `smtp.eu.mailgun.org` (EU) or `smtp.mailgun.org` (US)
     - Port: `587` (STARTTLS) or `465` (SSL)
     - Username: `postmaster@yourdomain.com`
     - Password: Mailgun SMTP password (from Mailgun dashboard)
   - **SendGrid SMTP (if configured):**
     - Host: `smtp.sendgrid.net`
     - Port: `587` (STARTTLS)
     - Username: `apikey`
     - Password: SendGrid API key
   - **AWS SES SMTP (if configured):**
     - Host: `email-smtp.REGION.amazonaws.com`
     - Port: `587` (STARTTLS)
     - Username: AWS SES SMTP username
     - Password: AWS SES SMTP password

2. **Test SMTP connection manually**
   ```bash
   # Test Mailgun SMTP connection
   telnet smtp.eu.mailgun.org 587
   
   # Or use openssl
   openssl s_client -connect smtp.eu.mailgun.org:587 -starttls smtp
   ```

3. **Check email provider status**
   - **Mailgun:** https://status.mailgun.com
   - **SendGrid:** https://status.sendgrid.com
   - **AWS SES:** https://status.aws.amazon.com

4. **Guide user to verify SMTP settings**
   - Provide step-by-step SMTP configuration instructions
   - Include SMTP settings for each provider
   - Test SMTP connection with user's credentials

5. **Retry email configuration**
   - Update SMTP credentials in user settings
   - Test email sending
   - Verify email configuration is saved

### General Resolution

1. **Reset user onboarding status (if needed)**
   ```sql
   -- Reset user onboarding
   UPDATE users
   SET onboarding_completed = FALSE,
       onboarding_step = 'initial',
       onboarding_data = NULL
   WHERE id = 'USER_ID';
   ```
   - Reset onboarding progress
   - Allow user to restart onboarding

2. **Guide user through onboarding again**
   - Provide clear instructions for each step
   - Monitor onboarding progress
   - Provide support if issues persist

3. **Monitor onboarding completion**
   - Track onboarding completion rate
   - Monitor onboarding errors
   - Review onboarding analytics

4. **Escalate to support if persistent**
   - Document issue details
   - Collect error logs
   - Contact support team

## Prevention

- Improve onboarding error messages (user-friendly)
- Add onboarding progress tracking
- Implement onboarding retry logic
- Test onboarding flow regularly
- Monitor onboarding completion rate
- Set up alerts for onboarding failures
- Provide clear documentation for each onboarding step
- Add validation before moving to next step

## Related Runbooks

- [Deliverability Degradation](../email/deliverability-degradation.md)
- [Monitoring Setup](../monitoring/monitoring-setup.md)

## Additional Resources

- [Mailgun SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [Google Calendar API Setup](https://developers.google.com/calendar/api/guides/overview)
- [Domain Verification Guide](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)

