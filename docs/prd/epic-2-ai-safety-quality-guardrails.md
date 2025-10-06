# Epic 2: AI Safety & Quality Guardrails

**Expanded Goal:** Build robust safety mechanisms around AI-generated content to prevent hallucinations, protect user reputation in high-stakes B2B conversations, and validate humanness of messages. Implement confidence scoring, VIP mode for high-value accounts, fact-checking layer, and human perception testing to achieve <20% AI detection rate (NFR5).

**Timeline:** Week 9 (40h solo development - integrated within Full MVP phase)

## Story 2.1: AI Confidence Scoring System
**As a** user,
**I want** the AI to self-assess confidence in its responses,
**so that** I can review uncertain messages before they're sent.

**Acceptance Criteria:**
1. Claude API prompt enhanced to return confidence_score (0-100) for every generated message
2. Confidence calculation based on: context completeness, fact verifiability from enrichment data, tone appropriateness
3. Messages scoring <80% confidence automatically queued in `ai_review_queue` table (not sent)
4. User notification system: Alert when messages awaiting review (email + dashboard badge if exists)
5. Review interface allows: Approve (send as-is), Edit (modify then send), Reject (don't send, add to nurture)
6. Analytics: Track confidence score distribution, percentage requiring review, review-to-send conversion rate
7. Confidence threshold configurable per user (default 80%, range 60-95%)

## Story 2.2: VIP Mode for High-Value Accounts
**As a** user,
**I want** to manually approve ALL AI messages for critical prospects,
**so that** I never risk my reputation on important relationships.

**Acceptance Criteria:**
1. VIP flag added to `prospects` table (boolean: is_vip, default false)
2. VIP criteria detection: Automatically flag if C-level title (CEO, CTO, CMO, CFO) OR user manually marks account
3. VIP override rule: ALL AI-generated messages for VIP accounts require human approval regardless of confidence score (per FR13)
4. Dedicated VIP review queue (separate from low-confidence queue) with priority notifications
5. VIP message template: More formal tone, shorter, no aggressive CTA
6. Analytics: Track VIP conversion rate vs. non-VIP to validate manual review value

## Story 2.3: Fact-Checking & Topic Blacklist
**As a** user,
**I want** the AI to avoid making claims it can't verify,
**so that** I never send false information to prospects.

**Acceptance Criteria:**
1. Blacklist defined for sensitive topics: pricing promises, guarantees, competitor bashing, unverified claims about prospect's business
2. AI prompt includes instruction: "Never mention pricing, guarantees, or make claims about the prospect's business that aren't explicitly in the context data"
3. Regex-based detection layer: Scan AI responses for blacklisted phrases ("guarantee", "best price", "competitor X is worse")
4. If blacklisted content detected: Auto-block message, flag for review, log incident
5. Fact-verification: Cross-reference AI claims against enrichment data (e.g., if AI mentions "recent funding round", verify in enrichment data)
6. Warning system: If AI attempts blacklisted topic 3+ times for same prospect, escalate to user review

## Story 2.4: Humanness Testing Framework
**As a** product manager,
**I want** to validate AI messages are perceived as human,
**so that** we achieve <20% detection rate (NFR5) before scaling.

**Acceptance Criteria:**
1. Recruit 10 B2B decision-makers matching ICP (French SMB owners/founders) for perception panel
2. Test design: Show 10 messages (5 AI-generated, 5 human-written), ask to identify which are AI
3. Target: <20% correct AI identification rate (indistinguishable from human baseline)
4. Variants tested: Generate 5 different AI prompting strategies, identify lowest detection rate
5. Winning strategy codified into template library and AI prompts
6. Post-launch tracking: User survey quarterly "Have prospects mentioned detecting automation?" (target <5% yes)
7. Response rate proxy: Track reply rate per 100 messages (if drops below 5% for cold, investigate AI fatigue)

---
