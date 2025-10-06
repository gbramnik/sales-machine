# 3. AI Message Review Queue

**Story Reference:** Epic 5, Story 5.3
**Screen Route:** `/review-queue`
**Entry Point:** Navigation menu, Alert Center link, Dashboard badge

## Design Objective

Enable fast, confident review of AI-generated messages with full context. Users should be able to approve, edit, or reject messages in under 30 seconds per item.

## Layout & Structure

**Page Layout:**
- Max-width: 1600px (wider for side-by-side context)
- Full-height content area

**Header:**
```
┌──────────────────────────────────────────────────────────┐
│ AI Message Review Queue                                  │
│                                                           │
│ 8 messages awaiting review                               │
└──────────────────────────────────────────────────────────┘
```

---

## Tab Navigation

**Two Tabs:**
```
┌─────────────────┬─────────────────┐
│ VIP Accounts (3)│Low Confidence(5)│
└─────────────────┴─────────────────┘
```

**Tab Specifications:**
- Active tab: Blue underline (3px), bold text, blue text
- Inactive tab: Gray text, hover underline
- Badge count: Gray-200 pill with count

**Keyboard Navigation:**
- Arrow keys to switch tabs
- Tab key to move into content

---

## Review Item Layout

**Two-Column Layout (60% / 40% split):**

```
┌───────────────────────────────────────────────────────────────┐
│ Left Panel (60% - Message)      │ Right Panel (40% - Context)│
├──────────────────────────────────┼────────────────────────────┤
│                                  │                            │
│ To: Sarah Chen                   │ Sarah Chen                 │
│ FinTech Solutions                │ VP of Marketing            │
│ sarah.chen@fintech.com           │ FinTech Solutions          │
│                                  │                            │
│ Subject: Your team's recent hires│ 📍 San Francisco, CA      │
│                                  │ 🔗 linkedin.com/in/...    │
│ ┌──────────────────────────────┐ │                            │
│ │ Hi Sarah,                    │ │ Context:                   │
│ │                              │ │                            │
│ │ I noticed your team just     │ │ Talking Points:            │
│ │ brought on two new SDRs—     │ │ • Recent hire: 2 SDRs     │
│ │ congratulations! Scaling     │ │   (LinkedIn Jobs)          │
│ │ outreach is exciting but     │ │ • Pain point: Lead gen     │
│ │ challenging.                 │ │   scaling challenges       │
│ │                              │ │ • Engaged with post about  │
│ │ Many marketing leaders we    │ │   sales automation         │
│ │ work with hit a wall when... │ │   (3 days ago)             │
│ │                              │ │                            │
│ │ [Message content continues]  │ │ Recent Activity:           │
│ │                              │ │ Posted about challenges    │
│ │ Best regards,                │ │ onboarding new sales team  │
│ │ John                         │ │ members (Oct 2)            │
│ │                              │ │                            │
│ └──────────────────────────────┘ │ Conversation History:      │
│                                  │ (None - first contact)     │
│ Confidence: 87% ✓                │                            │
│ Generated: 10 minutes ago        │                            │
│                                  │ Why Flagged:               │
│ Actions:                         │ VIP Account (C-level)      │
│ [Approve] [Edit] [Reject]        │ Requires manual approval   │
│                                  │                            │
└──────────────────────────────────┴────────────────────────────┘
```

---

## Left Panel: Message Content

**Header Section:**
- To: Prospect name (18px font-semibold) + Company (16px gray-600)
- Email: 14px gray-500
- Subject: 16px gray-700

**Message Body:**
- Container: Light gray background (gray-50)
- Border: 1px gray-200
- Border-radius: 6px
- Padding: 20px
- Font: 16px, line-height 1.6
- Read-only view initially

**Metadata Row:**
- Confidence badge: Small, colored by score
- Timestamp: "Generated 10 minutes ago"

**Action Buttons:**

**Approve Button:**
- Style: Primary blue
- Width: 120px, Height: 40px
- Icon: CheckCircle
- Text: "Approve"
- Hover: Darker blue, shadow
- Keyboard: Enter key

**Edit Button:**
- Style: Secondary (outline)
- Width: 120px, Height: 40px
- Icon: Edit3
- Text: "Edit"
- Click: Transform message container to textarea

**Reject Button:**
- Style: Destructive (red text)
- Width: 120px, Height: 40px
- Icon: XCircle
- Text: "Reject"
- Click: Show confirmation dialog with optional reason

**Button Spacing:**
- Gap: 12px between buttons
- Left-aligned

---

## Right Panel: Context Information

**Prospect Overview:**
- Avatar: 48px circle (top)
- Name: 20px font-semibold
- Title: 16px gray-600
- Company: 16px gray-600
- Location: 14px gray-500 with pin icon
- LinkedIn: Clickable link with external link icon

**Section: Talking Points**
- Header: 14px font-semibold gray-700 "Talking Points:"
- List: Bulleted, 14px gray-600
- Source attribution: "(LinkedIn Jobs)" in lighter gray

**Section: Recent Activity**
- Header: 14px font-semibold gray-700 "Recent Activity:"
- Content: 14px gray-600
- Timestamp: "(Oct 2)" in lighter gray

**Section: Conversation History**
- Header: 14px font-semibold gray-700 "Conversation History:"
- Content:
  - If none: "(None - first contact)"
  - If exists: Thread preview with expand/collapse

**Section: Why Flagged**
- Background: Amber-50 (if VIP) or Blue-50 (if low confidence)
- Border-left: 3px amber-400 or blue-400
- Padding: 12px
- Text: 14px
- Reason: "VIP Account (C-level)" or "Confidence score below threshold (87% < 80%)"

**Scrollable:**
- Right panel scrolls independently if content exceeds viewport
- Sticky header (prospect name) remains visible

---

## Edit Mode

**When "Edit" clicked:**

**Transform message container:**
```
┌──────────────────────────────────┐
│ <textarea>                       │
│ Hi Sarah,                        │
│                                  │
│ I noticed your team just         │
│ brought on two new SDRs—         │
│ congratulations! ...             │
│                                  │
│ [User can edit here]             │
│                                  │
│ </textarea>                      │
└──────────────────────────────────┘

Character count: 287 / 500

[Cancel]  [Save & Send]
```

**Textarea Specifications:**
- Min-height: 300px
- Resize: Vertical only
- Font: Same as display mode (16px)
- Border: 2px blue (focused)
- Background: White

**Character Counter:**
- Real-time update as user types
- Color: Gray-500 if under limit, red if over limit
- Limit: 500 characters (configurable)

**Cancel Button:**
- Reverts to read-only view
- Confirmation dialog if changes made: "Discard changes?"

**Save & Send Button:**
- Primary blue
- Validates content (not empty, under char limit)
- Shows loading spinner while sending
- On success: Toast notification "Message sent to Sarah Chen"
- Removes item from queue
- Advances to next item

---

## Reject Mode

**When "Reject" clicked:**

**Confirmation Dialog:**
```
┌────────────────────────────────────────┐
│ Reject Message?                        │
├────────────────────────────────────────┤
│                                        │
│ This message will not be sent to       │
│ Sarah Chen.                            │
│                                        │
│ Reason (optional):                     │
│ ┌────────────────────────────────────┐ │
│ │ [Textarea]                         │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Next action:                           │
│ ○ Add to nurture sequence              │
│ ○ Skip this prospect                   │
│                                        │
│ [Cancel]  [Confirm Reject]             │
│                                        │
└────────────────────────────────────────┘
```

**Dialog Specifications:**
- Size: 480px width, auto height
- Position: Centered overlay
- Backdrop: Dark overlay (50% opacity)
- Animation: Fade in + scale from 0.95 to 1

**Reason Textarea:**
- Optional, saves for future AI learning
- Placeholder: "Why are you rejecting this message?"
- Min-height: 80px

**Next Action Radio:**
- Default: "Add to nurture sequence"
- Explains what happens to prospect

**Confirm Reject Button:**
- Destructive red
- On click: Remove from queue, show toast "Message rejected"

---

## Bulk Actions

**Header Row (above tabs):**
```
┌──────────────────────────────────────────────────────────┐
│ ☑ Select All        [Bulk Approve]  [Bulk Reject]       │
└──────────────────────────────────────────────────────────┘
```

**Checkbox on Each Item:**
- Position: Top-left of message panel
- Style: Standard checkbox (20px)
- Select multiple with Shift+Click

**Bulk Approve:**
- Only enabled if selections > 0
- Shows count: "Approve 3 Messages"
- Confirmation dialog: "Send 3 messages?"

**Bulk Reject:**
- Only enabled if selections > 0
- Shows count: "Reject 3 Messages"
- Confirmation with reason textarea

**Filters:**

**Filter Dropdown (next to tabs):**
```
[Filter ▾]
  ☑ Confidence > 80%
  ☑ Confidence 60-80%
  ☐ Confidence < 60%
  ──────────────
  ☑ VIP Accounts
  ☐ Regular Accounts
  ──────────────
  Sort by:
  ○ Newest First
  ○ Highest Confidence
  ○ VIP First (default)
```

---

## Empty States

**VIP Tab - No Items:**
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                    👑                                     │
│                                                           │
│        No VIP messages awaiting review                   │
│                                                           │
│        All high-value account messages have been         │
│        approved or are pending send.                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Low Confidence Tab - No Items:**
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                    ✓                                      │
│                                                           │
│        All messages meet confidence threshold            │
│                                                           │
│        Your AI Sales Rep is performing well!             │
│        No manual reviews needed.                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

**Global:**
- `A` - Approve current message
- `E` - Edit current message
- `R` - Reject current message
- `J` / `↓` - Next message
- `K` / `↑` - Previous message
- `Tab` - Switch tabs
- `Esc` - Close modals/cancel edit

**Shortcut Help:**
- `?` - Show keyboard shortcut overlay

**Overlay Design:**
```
┌────────────────────────────────────┐
│ Keyboard Shortcuts                 │
├────────────────────────────────────┤
│                                    │
│ A       Approve message            │
│ E       Edit message               │
│ R       Reject message             │
│ J / ↓   Next message               │
│ K / ↑   Previous message           │
│ Tab     Switch tabs                │
│ ?       Show this help             │
│                                    │
│           [Close]                  │
│                                    │
└────────────────────────────────────┘
```

---

## Accessibility

**WCAG AA Compliance:**
- All color contrasts meet 4.5:1 minimum
- Confidence badges include text + icon (not color-only)
- Focus indicators: 2px blue outline on all interactive elements
- Skip links: "Skip to message content" at top

**Screen Reader Support:**
- Page title: "AI Message Review Queue - 8 messages awaiting review"
- Tab announces count: "VIP Accounts tab, 3 items"
- Message announces full context: "Message to Sarah Chen, VP of Marketing at FinTech Solutions, confidence 87%, VIP account"
- Action buttons: "Approve message to Sarah Chen"

**Keyboard Navigation:**
- All functionality accessible without mouse
- Logical tab order: Tabs → Filter → Message → Actions → Next message
- Escape key always cancels/closes
- Focus trap in modals (can't tab outside)

**Live Regions:**
- Toast notifications announced: "Message sent to Sarah Chen"
- Queue count updates announced: "8 messages awaiting review, now 7"

---
