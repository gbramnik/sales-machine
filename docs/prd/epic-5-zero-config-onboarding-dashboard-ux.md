# Epic 5: Zero-Config Onboarding & Dashboard UX

**Expanded Goal:** Build conversational onboarding wizard that auto-configures ICP, templates, and channels based on user goals/industry. Create campaign monitoring dashboard with Health Score Card, Meeting Pipeline, AI Activity Stream, and Human-in-the-Loop review queues. Hide all technical complexity (users never see "N8N", "MCP", "webhook").

**Timeline:** Weeks 8, 10 (80h: 40h solo + 60h contractor React development)

## Story 5.1: Onboarding Wizard (Backend)
**As a** user,
**I want** to answer simple business questions,
**so that** the system automatically configures my campaign without technical setup.

**Acceptance Criteria:**
1. Wizard API endpoints created: POST /onboarding/start, POST /onboarding/step/{step_id}, GET /onboarding/status
2. Step 1: Goal selection - "How many qualified meetings/month do you want?" (5-10, 10-20, 20-30)
3. Step 2: Industry dropdown - Pre-populated with 20 common B2B industries (SaaS, Consulting, Agencies, etc.)
4. Step 3: ICP auto-configuration - Based on industry, suggest job titles, company sizes, locations
5. Step 4: Domain verification - Check DNS records (SPF, DKIM, DMARC), display setup instructions if missing
6. Step 5: Calendar connection - OAuth flow for Google Calendar/Outlook
7. Pre-flight checklist: Validate all prerequisites complete before "Launch Campaign" button activates
8. Auto-configuration logic: Map industry → relevant templates, channels, intent signals

## Story 5.2: Campaign Monitoring Dashboard (Frontend)
**As a** user,
**I want** a visual dashboard showing campaign health,
**so that** I can monitor performance without reading spreadsheets.

**Acceptance Criteria:**
1. React dashboard with Tailwind CSS + shadcn/ui components
2. Health Score Card: 0-100 score synthesizing deliverability (40%), response rate (30%), AI performance (30%)
3. Meeting Pipeline: Kanban board with columns: Contacted → Engaged → Qualified → Meeting Booked (drag-drop optional)
4. AI Activity Stream: Real-time feed using Supabase Realtime (e.g., "AI qualified [Sarah Chen] - Confidence: 92%")
5. Alert Center: Notifications for deliverability issues, VIP accounts needing review, meetings booked
6. Mobile responsive: Dashboard viewable on phone (read-only, no editing)
7. Authentication: Supabase Auth session validation, redirect to login if unauthorized

## Story 5.3: AI Message Review Queue Interface
**As a** user,
**I want** to review and approve low-confidence AI messages,
**so that** I maintain control over what's sent to prospects.

**Acceptance Criteria:**
1. Review Queue page with two tabs: "Low Confidence" (score <80%), "VIP Accounts" (all messages)
2. Each item shows: Prospect name/company, AI-generated message, confidence score, enrichment context panel
3. Actions: Approve (send as-is), Edit (inline editor, then send), Reject (don't send, optional note)
4. Bulk actions: "Approve all >75%", "Reject all <60%"
5. Context panel: Side-by-side view of enrichment data (talking points, recent activity) + AI message for validation
6. Notifications: Badge count on dashboard menu, email notification if >10 messages waiting
7. Search/filter: By confidence range, by date added, by prospect name

## Story 5.4: Onboarding Wizard (Frontend)
**As a** user,
**I want** a friendly visual wizard,
**so that** I can complete setup in <2 hours without feeling overwhelmed.

**Acceptance Criteria:**
1. Multi-step wizard UI with progress indicator (Step 1 of 5)
2. Conversational copy: "Let's get your AI Sales Rep configured! This will take about 10 minutes."
3. Industry selection: Visual cards with icons (not dropdown) - click to select
4. ICP preview: "Based on your industry, we recommend targeting: [job titles]. Sound good?" (editable)
5. Domain verification: Automated DNS check with green checkmarks, red X with "Fix this" instructions
6. Calendar connect: OAuth popup, success confirmation with preview of available time slots
7. Final summary: "You're all set! Your AI Sales Rep will start prospecting for [X] meetings/month targeting [industry]."
8. Single "Activate My AI Sales Rep" button (per UI Design Goals)

---
