# 2. Campaign Monitoring Dashboard

**Story Reference:** Epic 5, Story 5.2
**Screen Route:** `/dashboard`
**Entry Point:** Default landing page after onboarding

## Design Objective

Provide at-a-glance campaign health visibility with drill-down capabilities. Users should immediately understand: "Is my AI Sales Rep performing well?" and "What meetings are in progress?"

## Layout & Structure

**Page Layout:**
- Max-width: 1440px
- Padding: 32px
- Grid: 12 columns, 24px gap

**Header:**
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard                                    🔔 (3)  👤 JD  │
│                                                               │
│ Welcome back, John! Your AI Sales Rep booked 2 meetings     │
│ this week. 🎉                                                │
└──────────────────────────────────────────────────────────────┘
```

**Navigation:**
- Left sidebar (240px fixed width)
- Items: Dashboard, Prospects, Review Queue, Templates, Analytics, Settings
- Active state: Blue background, left border indicator

---

## Section 1: Key Metrics Row

**Layout:** 4 equal-width cards (grid-cols-4, gap-6)

**Card 1: Campaign Health Score**
```
┌─────────────────────────────┐
│ Campaign Health             │
│                             │
│       ╭─────────╮           │
│       │   92    │  ↑ +5    │
│       ╰─────────╯           │
│                             │
│ Excellent                   │
│ [View Breakdown]            │
└─────────────────────────────┘
```

**Card Specifications:**
- Height: 240px
- Background: White
- Border: 1px gray-200
- Border-radius: 8px
- Shadow: shadow-sm, hover shadow-md

**Circular Progress Ring:**
- Diameter: 120px
- Stroke-width: 12px
- Background stroke: gray-200
- Foreground stroke: Green (92%), Amber (70-89%), Red (<70%)
- Animated on load (0 to score over 1 second, ease-out)

**Breakdown Expandable:**
```
Deliverability:  38/40  ████████████████████░
Response Rate:   24/30  ████████████████░░░░░
AI Performance:  30/30  ████████████████████░
```

---

**Card 2: Meetings This Week**
```
┌─────────────────────────────┐
│ Meetings This Week          │
│                             │
│         12                  │
│         ↑ +3 from last week │
│                             │
│ Next: Tomorrow 2:00 PM      │
│ Sarah Chen - FinTech Corp   │
└─────────────────────────────┘
```

**Specifications:**
- Large number: 48px font-bold gray-900
- Trend: 14px with arrow icon, green if positive, red if negative
- Next meeting preview: 14px gray-600, truncate long names

---

**Card 3: Active Prospects**
```
┌─────────────────────────────┐
│ Active Prospects            │
│                             │
│         247                 │
│                             │
│ Contacted:    156           │
│ Engaged:       64           │
│ Qualified:     27           │
└─────────────────────────────┘
```

**Breakdown List:**
- Each line: 14px, gray-600 label, gray-900 bold number
- Right-aligned numbers

---

**Card 4: Review Queue**
```
┌─────────────────────────────┐
│ Review Queue                │
│                             │
│         8                   │
│         messages awaiting   │
│                             │
│ VIP Accounts:     3         │
│ Low Confidence:   5         │
│                             │
│ [Review Now]                │
└─────────────────────────────┘
```

**Alert State (if queue > 10):**
- Border: 2px amber-400
- Pulsing amber dot animation top-right
- "Review Now" button becomes primary (blue) instead of secondary

---

## Section 2: Meeting Pipeline

**Header:**
```
Meeting Pipeline                                    [Filter ▾] [Export]
```

**Kanban Layout:**
```
┌──────────┬──────────┬──────────┬──────────────┐
│Contacted │ Engaged  │Qualified │Meeting Booked│
│  (156)   │  (64)    │  (27)    │    (12)      │
├──────────┼──────────┼──────────┼──────────────┤
│          │          │          │              │
│ [Card]   │ [Card]   │ [Card]   │ [Card]       │
│ [Card]   │ [Card]   │ [Card]   │ [Card]       │
│ [Card]   │ [Card]   │          │              │
│ [Card]   │ [Card]   │          │              │
│ [Card]   │          │          │              │
│ [Card]   │          │          │              │
│          │          │          │              │
│ ...      │ ...      │ ...      │ ...          │
│          │          │          │              │
│ [Load    │          │          │              │
│  More]   │          │          │              │
└──────────┴──────────┴──────────┴──────────────┘
```

**Column Specifications:**
- Equal width (25% each)
- Max height: 600px with internal scroll
- Background: gray-50
- Padding: 16px

**Column Header:**
- 16px font-semibold gray-700
- Badge with count (gray-200 background, gray-700 text)

**Prospect Card (inside column):**
```
┌────────────────────────┐
│ 👤 Sarah Chen      👑  │  ← Avatar + VIP indicator
│ FinTech Solutions      │
│                        │
│ Confidence: 92% ✓      │  ← Green badge
│ 2 hours ago            │  ← Gray-500 timestamp
└────────────────────────┘
```

**Card Specifications:**
- Width: 100% (column width minus padding)
- Height: auto (min 100px)
- Background: White
- Border: 1px gray-200
- Border-radius: 6px
- Margin-bottom: 12px
- Hover: shadow-md, border-primary-300, cursor-pointer

**Avatar:**
- Size: 32px circle
- If no image: Initials on colored background (generated from name hash)
- Position: Top-left with 4px margin

**VIP Crown:**
- Size: 20px Lucide Crown icon
- Color: Gold (#D97706)
- Position: Absolute top-right, 8px from edges

**Confidence Badge:**
- Position: Bottom-left of card
- Size: Small (12px text)

**Timestamp:**
- Position: Bottom-right
- Relative time (e.g., "2 hours ago", "3 days ago")

**Click Interaction:**
- Opens prospect detail modal (full screen overlay)
- Modal shows: Full profile, conversation history, enrichment data, actions

**Drag-Drop (Phase 2 - NOT MVP):**
- Visual feedback: Card opacity 0.5, dotted outline where dropping
- Animate movement between columns (300ms ease-out)
- Optimistic UI update (revert if API fails)

**Load More:**
- Infinite scroll OR "Load More" button at column bottom
- Shows next 10 cards per load

**Accessibility:**
- Each column `role="list"`
- Each card `role="listitem"` with `aria-label` full description
- Keyboard: Tab through cards, Enter to open detail
- Screen reader: "Sarah Chen from FinTech Solutions, Qualified stage, confidence 92%, VIP account, last activity 2 hours ago"

---

## Section 3: AI Activity Stream

**Header:**
```
AI Activity Stream                               [Live] [View All]
```

**Live Indicator:**
- Green pulsing dot + "Live" text
- Powered by Supabase Realtime

**Stream Container:**
```
┌────────────────────────────────────────────────────────┐
│ ● 2:34 PM                                             │
│ │                                                      │
│ │ ✓ AI qualified Sarah Chen                          │
│ │   FinTech Solutions                                 │
│ │   Confidence: 92%                                   │
│ │                                                      │
│ ● 2:15 PM                                             │
│ │                                                      │
│ │ 📅 Meeting booked with John Smith                   │
│ │   Acme Corp - Tomorrow 3:00 PM                      │
│ │                                                      │
│ ● 1:47 PM                                             │
│ │                                                      │
│ │ ⚠ Low confidence message flagged                    │
│ │   Mary Johnson - Review needed                      │
│ │   [Review]                                          │
│ │                                                      │
│ ● 1:22 PM                                             │
│ │                                                      │
│ │ 📧 Responded to Mark Davis                          │
│ │   TechStart Inc - Asked qualification question      │
│ │                                                      │
└────────────────────────────────────────────────────────┘
```

**Container Specifications:**
- Height: 400px fixed
- Overflow-y: scroll (auto-hide scrollbar)
- Background: White
- Border: 1px gray-200
- Border-radius: 8px
- Padding: 16px

**Activity Item:**
- Dot indicator (left border): 8px circle, colors by type
  - Qualified: Green (#10B981)
  - Booked: Green (#10B981)
  - Responded: Blue (#2563EB)
  - Flagged: Amber (#F59E0B)
- Vertical line connecting dots: 2px gray-200
- Timestamp: 14px gray-500, positioned at dot level
- Content: 16px gray-700 main text, 14px gray-500 secondary text
- Action button (if applicable): Small secondary button inline

**New Item Animation:**
- Fade in from top (opacity 0 to 1, 200ms)
- Slide down from -20px to 0 (200ms ease-out)
- Highlight background yellow-50 for 2 seconds, then fade to white

**Auto-Scroll Behavior:**
- If user at top of feed: Auto-scroll to show new item
- If user scrolled down: Don't auto-scroll (preserve position)
- Show "New Activity" badge at top when updates arrive while scrolled

**View All Link:**
- Opens full-page activity log with filters (date range, activity type)

**Accessibility:**
- `role="feed"` for container
- `aria-busy="true"` during loading
- Live region announcement: `aria-live="polite"` for new items
- Screen reader: "New activity at 2:34 PM, AI qualified Sarah Chen from FinTech Solutions, confidence 92%"

---

## Section 4: Alert Center

**Collapsed State:**
```
┌────────────────────────────────────────────────────────┐
│ 🔔 Alerts (3)                                [Expand ▼]│
└────────────────────────────────────────────────────────┘
```

**Expanded State:**
```
┌────────────────────────────────────────────────────────┐
│ 🔔 Alerts (3)                              [Collapse ▲]│
├────────────────────────────────────────────────────────┤
│                                                         │
│ ⚠ Deliverability Warning                               │
│   Bounce rate increased to 4.2% (threshold: 5%)        │
│   [View Details]                            Just now   │
│                                                         │
│ 👑 VIP Account Needs Approval                          │
│   3 messages awaiting review for C-level prospects     │
│   [Review Queue]                            10 min ago │
│                                                         │
│ ✓ Domain Warm-up Complete                              │
│   yourdomain.com is now at full sending capacity       │
│   [Dismiss]                                 2 hours ago│
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Alert Types:**
- Warning (Amber): Deliverability issues, quota near limit
- Action Required (Blue): VIP approvals, low confidence queue
- Success (Green): Milestones, warm-up complete
- Error (Red): Critical failures, integrations broken

**Alert Item:**
- Icon: Type-specific (AlertTriangle, Crown, CheckCircle, XCircle)
- Title: 16px font-semibold
- Description: 14px gray-600
- Action button: Small secondary or primary (if urgent)
- Timestamp: 14px gray-500, right-aligned

**Dismiss Interaction:**
- Click "Dismiss" or X icon (top-right of alert)
- Fade out animation (300ms)
- Removed from list

**Badge Count:**
- Number of unread alerts
- Position: Top-right of bell icon in header
- Red circle with white text

**Accessibility:**
- `role="alert"` for new critical alerts
- Keyboard: Tab through alerts, Enter to activate action
- Screen reader: Alert type + content announced

---

## Responsive Behavior (Tablet/Mobile)

**Tablet (768px - 1023px):**
- Key Metrics: 2x2 grid instead of 4 columns
- Pipeline: Horizontal scroll (swipe between columns)
- Activity Stream: Collapsed by default, expandable

**Mobile (< 768px):**
- Single column layout
- Key Metrics: Full-width cards, stacked vertically
- Pipeline: Tabs instead of Kanban (switch between stages)
- Activity Stream: Accordion, shows last 5 items
- Alert Center: Full-width notifications

---
