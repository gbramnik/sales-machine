# Component Library

## Technology Stack

**Framework:** React 18+ with TypeScript
**Styling:** Tailwind CSS v3.3+
**Component Library:** shadcn/ui v0.5.0+
**Icons:** Lucide React
**Charts:** Recharts v2.5+
**State Management:** Zustand or React Context

## Core shadcn/ui Components Needed

**Install via CLI:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add separator
```

## Custom Components to Build

### 1. HealthScoreCard Component

**Purpose:** Display 0-100 campaign health score with visual indicator

**Props:**
```typescript
interface HealthScoreCardProps {
  score: number;           // 0-100
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;     // e.g., +5 for "+5 from last week"
  breakdown?: {
    deliverability: number;  // 0-40
    responseRate: number;    // 0-30
    aiPerformance: number;   // 0-30
  };
}
```

**Visual Specification:**
- **Score Display:** Large circular progress ring (120px diameter)
  - 90-100: Green (#10B981)
  - 70-89: Amber (#F59E0B)
  - 0-69: Red (#EF4444)
- **Typography:** Score number 36px bold monospace, "Campaign Health" label 14px gray-500
- **Breakdown (expandable):** Small bar charts showing 3 sub-scores
- **Trend Indicator:** Small arrow icon + percentage change

**Example Layout:**
```
┌─────────────────────────────────┐
│  Campaign Health                │
│                                 │
│       ╭─────────╮              │
│       │   92    │  ↑ +5        │
│       ╰─────────╯              │
│                                 │
│  ▸ View Breakdown              │
└─────────────────────────────────┘
```

**Accessibility:**
- `role="meter"` with `aria-valuemin="0"` `aria-valuemax="100"` `aria-valuenow={score}`
- Color not sole indicator (include text "Excellent" / "Good" / "Needs Attention")
- Keyboard expandable breakdown (Enter/Space to toggle)

---

### 2. PipelineKanban Component

**Purpose:** Kanban board showing prospects moving through sales stages

**Props:**
```typescript
interface PipelineKanbanProps {
  stages: {
    id: string;
    label: string;              // "Contacted", "Engaged", etc.
    prospects: ProspectCard[];
    count: number;
  }[];
  onProspectMove?: (prospectId: string, newStage: string) => void;
  isDragEnabled?: boolean;      // Default: false for MVP
}

interface ProspectCard {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  confidenceScore?: number;
  isVIP?: boolean;
  lastActivity: string;         // "2 hours ago"
}
```

**Visual Specification:**
- **Layout:** 4 columns equal width, horizontal scroll on smaller screens
- **Column Headers:** Stage label + count badge (e.g., "Engaged (12)")
- **Cards:**
  - White background, border-gray-200, shadow-sm
  - Hover: shadow-md, border-primary-blue-300
  - VIP indicator: Gold crown icon top-right
  - Confidence score: Small badge (e.g., "92%" green if >80, amber if <80)

**Card Layout:**
```
┌────────────────────────┐
│ John Smith        👑   │  ← VIP crown if isVIP
│ Acme Corp              │
│                        │
│ Confidence: 92%   ✓    │
│ 2 hours ago            │
└────────────────────────┘
```

**Interaction:**
- Click card → Open prospect detail modal
- Drag-drop (Phase 2 - not MVP): Visual feedback with shadow + opacity

**Accessibility:**
- Each column `role="list"`, each card `role="listitem"`
- Keyboard navigation: Tab through cards, Enter to open
- Screen reader: "John Smith from Acme Corp, Engaged stage, confidence 92%, VIP account"

---

### 3. AIActivityStream Component

**Purpose:** Real-time feed of AI agent actions

**Props:**
```typescript
interface AIActivityStreamProps {
  activities: ActivityItem[];
  maxHeight?: string;        // Default: "400px"
  enableLiveUpdates?: boolean; // Supabase Realtime
}

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'qualified' | 'responded' | 'booked' | 'flagged';
  prospect: {
    name: string;
    company: string;
  };
  confidence?: number;
  message?: string;
}
```

**Visual Specification:**
- **Layout:** Vertical timeline with left border indicator
- **Activity Types:**
  - Qualified: Green dot + CheckCircle icon
  - Responded: Blue dot + Mail icon
  - Booked: Green dot + Calendar icon
  - Flagged: Amber dot + AlertTriangle icon

**Item Layout:**
```
┌────────────────────────────────────┐
│ ● 2:34 PM                         │
│ │                                  │
│ │ AI qualified Sarah Chen          │
│ │ FinTech Solutions                │
│ │ Confidence: 92% ✓                │
│ │                                  │
│ ● 2:15 PM                         │
│ │                                  │
│ │ Meeting booked with John Smith   │
│ │ Acme Corp - Tomorrow 3:00 PM     │
└────────────────────────────────────┘
```

**Real-Time Updates:**
- New items fade in from top with subtle animation (slide down 200ms ease-out)
- Max 50 items displayed (older items truncated, "View All" link)
- Auto-scroll to newest if user at top, otherwise preserve scroll position

**Accessibility:**
- `role="feed"` with `aria-busy` during loading
- Live region announcement: "New activity: AI qualified Sarah Chen, confidence 92%"
- Timestamps in relative format with full date on hover/focus

---

### 4. ConfidenceBadge Component

**Purpose:** Visual indicator for AI confidence scores

**Props:**
```typescript
interface ConfidenceBadgeProps {
  score: number;           // 0-100
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;     // "Confidence: 92%"
}
```

**Visual Specification:**
- **Color Coding:**
  - 80-100: Green background (#ECFDF5), green text (#059669)
  - 60-79: Amber background (#FFFBEB), amber text (#D97706)
  - 0-59: Red background (#FEF2F2), red text (#DC2626)
- **Icons:**
  - 80+: CheckCircle
  - 60-79: AlertTriangle
  - <60: XCircle
- **Sizes:**
  - sm: 12px text, 16px icon
  - md: 14px text, 20px icon
  - lg: 16px text, 24px icon

**Example:**
```
[✓ 92%]     (green badge)
[⚠ 73%]     (amber badge)
[✗ 45%]     (red badge)
```

**Accessibility:**
- Not color-dependent (icon + text always present)
- `aria-label="Confidence score 92%, high confidence"`

---

### 5. VIPAccountIndicator Component

**Purpose:** Highlight VIP accounts requiring special handling

**Props:**
```typescript
interface VIPAccountIndicatorProps {
  isVIP: boolean;
  placement?: 'badge' | 'icon' | 'banner';
  reason?: string;         // "C-level executive"
}
```

**Visual Specification:**
- **Icon Mode:** Gold crown (Lucide Crown icon) with tooltip
- **Badge Mode:** Small pill "VIP" with gold background
- **Banner Mode:** Full-width amber alert bar "VIP Account - All messages require approval"

**Colors:**
- Background: #FFFBEB (gold-50)
- Border: #D97706 (gold-600)
- Text: #92400E (gold-800)

**Accessibility:**
- `role="status"` for banner mode
- Tooltip/aria-label: "VIP account - {reason}"

---

### 6. MessageReviewCard Component

**Purpose:** Display AI-generated message for approval

**Props:**
```typescript
interface MessageReviewCardProps {
  prospect: {
    name: string;
    company: string;
    title: string;
  };
  message: {
    id: string;
    content: string;
    confidence: number;
    generatedAt: Date;
  };
  context: {
    talkingPoints: string[];
    recentActivity: string;
    conversationHistory?: string;
  };
  onApprove: (messageId: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onReject: (messageId: string, reason?: string) => void;
}
```

**Visual Specification:**

**Layout:** Two-column (60/40 split)

```
┌────────────────────────────────────────────────────────┐
│ Left Panel (60%)         │ Right Panel (40%)           │
├──────────────────────────┼─────────────────────────────┤
│                          │ Sarah Chen                  │
│ AI-Generated Message:    │ VP of Marketing             │
│                          │ FinTech Solutions           │
│ ┌──────────────────────┐ │                             │
│ │ Hi Sarah,            │ │ Context:                    │
│ │                      │ │ • Recent hire: 2 new SDRs   │
│ │ I noticed your team  │ │ • Pain point: Lead gen      │
│ │ just brought on...   │ │ • Engaged with post about   │
│ │                      │ │   sales automation          │
│ │ [Message content]    │ │                             │
│ └──────────────────────┘ │ Confidence: 87% ✓           │
│                          │                             │
│ [Approve] [Edit] [Reject]│ Last Activity: 2 hours ago  │
└────────────────────────────────────────────────────────┘
```

**Action Buttons:**
- Approve: Primary blue, full width or left-aligned
- Edit: Secondary (outline), opens inline textarea
- Reject: Destructive red text button, confirmation dialog

**Accessibility:**
- Message in `<blockquote>` with `aria-label="AI-generated message"`
- Action buttons grouped in `role="group"` with clear labels
- Keyboard shortcuts: A (approve), E (edit), R (reject)

---
