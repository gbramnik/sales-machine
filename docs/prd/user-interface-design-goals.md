# User Interface Design Goals

## Overall UX Vision

Sales Machine's interface embodies the philosophy "**Complexity hidden, outcomes visible**". Users interact with a business-focused dashboard that presents campaign health, meeting pipeline, and AI agent activity without exposing underlying technical orchestration (N8N workflows, MCP integrations, webhooks). The UX prioritizes **trust and transparency** - users can audit every AI-generated message, review prospect context, and override automation at any point. The interface should feel like managing a high-performing sales team member, not configuring software.

**Design Principles:**
- **Outcome-oriented:** Show meetings booked, response rates, qualified conversations - not technical metrics
- **Progressive disclosure:** Simple default views with drill-down for power users
- **Safety-first:** Clear indicators for AI confidence levels, VIP accounts requiring approval, deliverability warnings
- **Business language only:** Never expose terms like "webhook", "MCP server", "workflow trigger"

## Key Interaction Paradigms

**1. Zero-Config Wizard (Onboarding)**
- Conversational flow mimicking a sales consultant interview: "What's your goal?" → "Who's your ideal customer?" → "Launch campaign"
- System auto-configures ICP, templates, channels based on industry/goal selections
- Pre-flight validation dashboard: Domain setup ✓, Warm-up status (14 days remaining), ICP completeness ✓
- Single "Activate My AI Sales Rep" button to launch - no multi-step manual configuration

**2. Campaign Monitoring Dashboard**
- **Health Score Card:** Single 0-100 score synthesizing deliverability, response rate, AI performance
- **Meeting Pipeline View:** Kanban-style board showing prospects moving through: Contacted → Engaged → Qualified → Meeting Booked
- **AI Activity Stream:** Real-time feed of AI agent actions with confidence indicators (e.g., "Qualified prospect [Sarah Chen] - Confidence: 92% ✓")
- **Alert Center:** Proactive notifications for deliverability issues, VIP accounts needing approval, qualified meetings ready to book

**3. Human-in-the-Loop Review**
- **VIP Queue:** Dedicated interface for high-value accounts showing AI-drafted messages with "Approve/Edit/Reject" workflow
- **Low-Confidence Queue:** Messages scoring <80% confidence presented for review before sending
- **Context Panel:** Side-by-side view of prospect enrichment data (talking points, recent activity) + AI-generated message for validation

**4. Template & Personalization Studio**
- **Visual Template Builder:** Drag-drop editor for message templates with AI variable placeholders ({{prospect_pain_point}}, {{recent_activity}})
- **Personalization Preview:** Live preview showing how template renders with actual prospect data
- **A/B Testing Interface:** Simple toggle to enable variant testing with performance comparison charts

## Core Screens and Views

**1. Dashboard (Home)**
- Campaign health overview, weekly meetings booked, AI agent activity summary, deliverability status

**2. Prospect Pipeline**
- Searchable/filterable list of all prospects with status, channel, last contact, AI confidence, next action

**3. AI Message Review Queue**
- VIP accounts and low-confidence messages requiring approval before send

**4. Campaign Configuration**
- ICP editor (industry, company size, roles, geography), channel activation toggles, template library selection

**5. Analytics & Reporting**
- Channel performance comparison, template effectiveness, intent signal ROI, deliverability trends

**6. Settings & Integrations**
- Domain verification, calendar connection (Cal.com/Calendly), API key management (hidden behind user-friendly labels)

**7. Onboarding Wizard (First-Time Only)**
- Goal selection → Industry/ICP setup → Domain verification → Template selection → Launch

## Accessibility: WCAG AA

- Keyboard navigation for all workflows (no mouse-only interactions)
- Color contrast ratios meeting WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Screen reader compatibility for visually impaired users
- Alt text for all visual indicators (health scores, confidence badges, status icons)

**Rationale:** WCAG AA is industry standard for B2B SaaS, balances accessibility without requiring AAA-level investment (magnification support, sign language interpretation). Solo-preneur resource constraints favor AA compliance initially.

## Branding

**Visual Style:** Modern B2B SaaS aesthetic with **trust-oriented design language**

- **Color Palette:** Professional blues/grays (trustworthy, calm) with green accents (success, growth) and amber warnings (deliverability alerts, low confidence)
- **Typography:** Clean sans-serif (Inter, Geist, or similar) for readability across devices
- **Iconography:** Line-style icons (Lucide, Heroicons) for consistency and lightweight feel
- **Data Visualization:** Chart.js or Recharts with muted colors to avoid overwhelming users

**Voice & Tone:**
- Conversational yet professional (not overly casual or corporate)
- Empowering language: "Your AI Sales Rep booked 3 meetings this week" (not "System generated 3 conversions")
- Transparent about AI: "Confidence: 85% - Review recommended" (not hiding automation)
- Encouraging: Progress indicators, celebration moments (first meeting booked, 10th qualified conversation)

**NO corporate branding assets provided** - greenfield design opportunity following modern SaaS conventions (Stripe, Linear, Vercel aesthetic references)

## Target Device and Platforms: Web Responsive

**Primary:** Desktop web browser (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Dashboard optimized for 1280px+ screens (sales professionals work on laptops/desktops)
- Critical workflows functional down to 1024px (tablet landscape)

**Secondary:** Mobile-responsive (iOS Safari, Android Chrome)
- Read-only dashboard view for monitoring on-the-go (campaign health, meeting alerts)
- AI message approval queue accessible on mobile (tap to approve/reject)
- Full configuration/setup requires desktop (complexity limits mobile utility)

**NOT Supported (MVP):**
- Native mobile apps (iOS/Android) - web-first approach
- Tablet-optimized layouts (responsive desktop layout acceptable)
- Legacy browsers (IE11, older Safari versions)

**Rationale:** B2B users primarily work from desktops for configuration-heavy tasks. Mobile responsiveness for monitoring/approvals addresses 80% of mobile use cases without native app investment.
