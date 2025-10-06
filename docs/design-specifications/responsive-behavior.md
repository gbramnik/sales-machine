# Responsive Behavior

## Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops (primary target) */
2xl: 1536px /* Large desktops */
```

---

## Dashboard Responsive Behavior

**Desktop (1280px+):**
- Sidebar: Fixed 240px left
- Main content: Max-width 1440px, centered
- Metrics: 4-column grid
- Pipeline: 4 columns visible

**Laptop (1024px - 1279px):**
- Sidebar: Collapsible to icon-only (64px)
- Main content: Full width with 24px padding
- Metrics: 2x2 grid
- Pipeline: 4 columns with horizontal scroll

**Tablet (768px - 1023px):**
- Sidebar: Hidden, hamburger menu
- Metrics: 2 columns
- Pipeline: Horizontal scroll with snap points
- Activity Stream: Collapsed accordion

**Mobile (< 768px):**
- Single column layout
- Sidebar: Full-screen overlay menu
- Metrics: Stacked cards, full width
- Pipeline: Tabs instead of Kanban
  ```
  [Contacted ▾]  (Dropdown selector)

  [Card]
  [Card]
  [Card]
  ...
  ```
- Activity Stream: Last 5 items, "View All" link

---

## Review Queue Responsive Behavior

**Desktop (1280px+):**
- Side-by-side 60/40 layout
- Both panels visible simultaneously

**Tablet (768px - 1023px):**
- Side-by-side 50/50 layout
- Slightly compressed

**Mobile (< 768px):**
- Stacked layout:
  1. Message panel (full width)
  2. Collapsible context panel (accordion)
  ```
  ┌────────────────────────┐
  │ Message Content        │
  │                        │
  │ [Message here]         │
  │                        │
  │ [Actions]              │
  ├────────────────────────┤
  │ ▸ View Context         │  ← Expandable
  └────────────────────────┘
  ```
- Swipe gestures: Left (approve), right (reject)

---

## Onboarding Wizard Responsive Behavior

**Desktop/Tablet (768px+):**
- Centered card layout (640px max-width)
- Full multi-step experience

**Mobile (< 768px):**
- Full-screen wizard (no card borders)
- Larger touch targets (56px minimum)
- Industry cards: 2 columns instead of 4
- Simplified progress indicator (text only: "Step 2 of 5")

---
