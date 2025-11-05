# SMTP Provider Selection Decision

**Date:** 2025-01-13  
**Decision Status:** ✅ Finalized  
**Selected Provider:** Mailgun

## Evaluation Summary

### Providers Evaluated

#### 1. SendGrid
- **Features:** Robust API, SMTP support, webhooks, analytics
- **Pricing:** $19.95/month for 50K emails (€0.40 per 1000 emails)
- **Limits:** Free tier: 100 emails/day
- **Deliverability:** Excellent reputation, IP warming support
- **EU Data Residency:** ✅ EU servers available

#### 2. Mailgun ⭐ SELECTED
- **Features:** SMTP + REST API, webhooks, analytics, EU servers
- **Pricing:** €35/month for 50K emails (€0.70 per 1000 emails)
- **Limits:** Free tier: 5K emails/month (first 3 months), then 1000/month
- **Deliverability:** Excellent reputation, automated IP warming
- **EU Data Residency:** ✅ EU servers (eu.mailgun.net) - **GDPR compliant**
- **Advantages:**
  - EU-first infrastructure (critical for GDPR)
  - Better pricing for small volumes (<50K/month)
  - Excellent developer experience
  - Strong webhook support

#### 3. AWS SES
- **Features:** SMTP + API, webhooks via SNS, analytics
- **Pricing:** $0.10 per 1000 emails (very cheap)
- **Limits:** Sandbox: 200 emails/day, production: request increase
- **Deliverability:** Excellent (AWS infrastructure)
- **EU Data Residency:** ✅ EU regions available (eu-west-1, eu-central-1)
- **Advantages:**
  - Lowest cost per email
  - Scalable to millions of emails
  - AWS ecosystem integration
- **Disadvantages:**
  - More complex setup (SNS for webhooks)
  - Sandbox limitations initially
  - Less user-friendly for small volumes

## Decision Rationale

**Selected: Mailgun**

### Key Factors:
1. **GDPR Compliance:** EU servers (eu.mailgun.net) ensure data residency
2. **Developer Experience:** Clean API, excellent documentation, easy webhook setup
3. **Cost-Effective for MVP:** Free tier sufficient for initial testing, then €35/month for 50K emails
4. **Deliverability:** Strong reputation, automated IP warming, built-in analytics
5. **Feature Set:** SMTP + REST API support, comprehensive webhooks, bounce/spam handling

### Implementation:
- **API URL:** `https://api.eu.mailgun.net/v3`
- **SMTP Host:** `smtp.eu.mailgun.org`
- **Port:** 587 (STARTTLS) or 465 (SSL)
- **Webhook URL:** `{{ API_GATEWAY_URL }}/webhooks/smtp/email-event`

### Migration Path:
- ✅ SMTPService.ts already implemented with Mailgun support
- ✅ Environment variables: `MAILGUN_API_URL`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`
- ✅ Webhook configuration ready for bounce/spam/open/click/reply events

## Future Considerations

If email volume exceeds 100K/month, consider:
- **AWS SES:** Lower cost at scale ($0.10 vs €0.70 per 1000)
- **SendGrid:** Better enterprise features, dedicated IP options

For now, Mailgun is the optimal choice for MVP and early growth phase.
