# Privacy Policy

**Last Updated:** January 2025

## Introduction

Sales Machine ("we", "our", or "us") is committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, store, and protect your personal data.

## Data Controller

Sales Machine  
Email: privacy@sales-machine.com

## Data We Collect

### User Account Data
- Email address
- Full name
- Authentication credentials (stored securely via Supabase Auth)

### Prospect Data
- LinkedIn profile information (name, job title, company, profile URL)
- Email addresses (when available)
- Phone numbers (when available)
- Location information
- Profile summaries and enrichment data

### Campaign Data
- Campaign configurations
- Email templates
- Campaign performance metrics

### Meeting Data
- Scheduled meeting details
- Calendar integration data
- Meeting notes and outcomes

### AI Conversation Logs
- AI-generated messages
- Conversation history
- Confidence scores

### Technical Data
- IP addresses
- User agents
- API request logs
- Error logs

## How We Use Your Data

We use your personal data to:
- Provide and improve our services
- Process prospect detection and enrichment
- Send automated outreach messages (LinkedIn and Email)
- Schedule and manage meetings
- Generate AI-powered conversation responses
- Monitor service performance and deliverability
- Comply with legal obligations

## Data Storage

Your data is stored in:
- **Supabase (PostgreSQL)**: Primary database for all user and prospect data
- **Upstash Redis**: Caching and queue management (session tokens, enrichment cache, email queue)
- **N8N Cloud**: Workflow execution logs (internal system logs)

All data is stored in EU-compliant data centers.

## Data Sharing

We share your data with the following third-party services:

### Service Providers
- **Supabase**: Database and authentication services
- **Upstash**: Redis caching and queue management
- **N8N Cloud**: Workflow automation
- **Anthropic Claude API**: AI-powered enrichment and conversation generation
- **UniPil API**: LinkedIn automation (warm-up, connections, messages)
- **SMTP Providers** (SendGrid/Mailgun/AWS SES): Email delivery

All service providers are GDPR-compliant and bound by data processing agreements.

## Cookies

We use **session cookies only** to keep you logged in. We do not use tracking cookies, analytics cookies, or advertising cookies.

Session cookies are essential for the service to function and expire when you log out.

## Your Rights (GDPR)

Under GDPR, you have the following rights:

### Right to Access
You can request a copy of all your personal data by:
- Using the data export endpoint: `GET /gdpr/users/me/data`
- Contacting us at: privacy@sales-machine.com

### Right to Rectification
You can update your personal data through your account settings or by contacting us.

### Right to Erasure (Right to be Forgotten)
You can request deletion of your data by:
- Using the data deletion endpoint: `DELETE /gdpr/prospects/:prospect_id`
- Contacting us at: privacy@sales-machine.com

We will delete your data from all systems (Supabase, Upstash, N8N logs) within 30 days of your request.

### Right to Data Portability
You can export your data in JSON format using the data export endpoint.

### Right to Object
You can object to processing of your data by contacting us.

### Right to Restrict Processing
You can request restriction of data processing by contacting us.

### Right to Withdraw Consent
You can withdraw consent at any time by updating your preferences or contacting us.

## Data Retention

- **Active User Data**: Retained while your account is active
- **Unsubscribed Prospects**: Automatically purged after 30 days
- **Audit Logs**: Retained for 7 years (legal compliance)
- **Session Cookies**: Expire on logout

## Data Security

We implement appropriate technical and organizational measures to protect your data:
- Encryption in transit (HTTPS/TLS)
- Encryption at rest (database encryption)
- Row-Level Security (RLS) policies
- Access controls and authentication
- Regular security audits

## Data Breach Notification

In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by GDPR.

## International Data Transfers

Your data may be transferred to and processed in countries outside the EU. We ensure appropriate safeguards are in place (Standard Contractual Clauses, Privacy Shield, etc.).

## Children's Privacy

Our service is not intended for users under 16 years of age. We do not knowingly collect data from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.

## Contact Us

For privacy-related inquiries, please contact:
- Email: privacy@sales-machine.com
- Data Protection Officer: dpo@sales-machine.com

## Consent

By using our service, you consent to the collection and use of your data as described in this Privacy Policy.

---

**Note:** This privacy policy is template-based and should be reviewed by a legal professional before production deployment.



