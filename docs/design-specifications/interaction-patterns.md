# Interaction Patterns

## Health Score Visualization

**Circular Progress Ring Animation:**

**Component:** HealthScoreCard

**Animation Sequence:**
1. On mount/view: Ring animates from 0 to score over 1 second
2. Easing: Cubic-bezier (ease-out)
3. Color transitions smoothly during animation

**Code Example (Recharts):**
```tsx
<PieChart width={120} height={120}>
  <Pie
    data={[
      { value: score, fill: scoreColor },
      { value: 100 - score, fill: '#E5E7EB' }
    ]}
    innerRadius={42}
    outerRadius={60}
    startAngle={90}
    endAngle={-270}
    dataKey="value"
    animationDuration={1000}
    animationEasing="ease-out"
  />
</PieChart>
```

**Breakdown Panel:**
- Click "View Breakdown" → Smooth expand (300ms height transition)
- Three horizontal bar charts (Recharts Bar component)
- Bars animate left-to-right on expand (stagger by 100ms)

---

## Meeting Pipeline Drag-Drop (Phase 2)

**Library:** @dnd-kit/core (React drag-drop)

**Interaction Flow:**
1. User clicks and holds card (300ms press for mobile)
2. Card lifts with shadow-xl, slight rotation (2deg), opacity 0.8
3. Dragging: Ghost card follows cursor, original slot shows dotted outline
4. Hovering over column: Column background changes to blue-50
5. Drop: Animate card to new position (400ms ease-out)
6. API call: Optimistic UI update (revert if fails)

**Visual Feedback:**
- Drag handle: Six dots icon (top of card, visible on hover)
- Drop zone indicator: Dotted border 2px blue
- Invalid drop: Red border, shake animation

**Accessibility:**
- Keyboard: Arrow keys to move focus, Space to pick up, Arrow keys to move, Space to drop
- Screen reader: "Picked up Sarah Chen card from Engaged column. Use arrow keys to move, space to drop"

---

## AI Activity Stream Live Updates

**Technology:** Supabase Realtime subscriptions

**Implementation:**
```typescript
// Subscribe to new activities
supabase
  .channel('ai_activity')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'ai_conversation_log' },
    (payload) => {
      // Add new activity to stream
      setActivities([payload.new, ...activities]);
      // Announce to screen reader
      announceActivity(payload.new);
    }
  )
  .subscribe();
```

**Animation:**
- New item inserts at top
- Fade in: opacity 0 → 1 (200ms)
- Slide down: translateY(-20px) → 0 (200ms ease-out)
- Highlight: Background yellow-50 for 2s, then fade to white (500ms)

**Performance:**
- Max 50 items in DOM (older items removed)
- Virtual scrolling if > 100 items (react-window)
- Debounce rapid updates (max 1 update per second)

---

## Confidence Badge Color Transitions

**Component:** ConfidenceBadge

**State Management:**
```typescript
const getBadgeColor = (score: number) => {
  if (score >= 80) return { bg: '#ECFDF5', text: '#059669', border: '#10B981' };
  if (score >= 60) return { bg: '#FFFBEB', text: '#D97706', border: '#F59E0B' };
  return { bg: '#FEF2F2', text: '#DC2626', border: '#EF4444' };
};
```

**Transition:**
- If score changes (e.g., AI re-evaluates): Smooth color transition (300ms)
- Pulse animation on score increase (scale 1 → 1.1 → 1 over 400ms)

---

## Toast Notifications

**Library:** shadcn/ui Sonner (built on Radix Toast)

**Notification Types:**

**Success:**
```
┌────────────────────────────────────┐
│ ✓  Message sent to Sarah Chen     │
└────────────────────────────────────┘
```
- Background: Green-50
- Border-left: 4px green-500
- Icon: CheckCircle green
- Duration: 3 seconds
- Position: Bottom-right

**Warning:**
```
┌────────────────────────────────────┐
│ ⚠  Bounce rate increased to 4.2%  │
│    [View Details]                  │
└────────────────────────────────────┘
```
- Background: Amber-50
- Border-left: 4px amber-500
- Icon: AlertTriangle amber
- Duration: 5 seconds (persistent if action button)

**Error:**
```
┌────────────────────────────────────┐
│ ✗  Failed to send message          │
│    [Retry]                         │
└────────────────────────────────────┘
```
- Background: Red-50
- Border-left: 4px red-500
- Icon: XCircle red
- Duration: 7 seconds (persistent if action button)

**Accessibility:**
- `role="status"` for success/info
- `role="alert"` for warnings/errors
- Screen reader announces content immediately
- Focus moves to action button if present

---
