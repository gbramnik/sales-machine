# Accessibility Implementation

## WCAG AA Requirements Checklist

**1. Color Contrast**
- ✅ All text meets 4.5:1 ratio (normal text)
- ✅ Large text (18px+) meets 3:1 ratio
- ✅ Interactive elements meet 3:1 against backgrounds
- ✅ Focus indicators meet 3:1 contrast

**2. Keyboard Navigation**
- ✅ All functionality accessible via keyboard
- ✅ Logical tab order (left-to-right, top-to-bottom)
- ✅ Focus indicators visible (2px blue outline, 4px offset)
- ✅ No keyboard traps (can escape all modals with Esc)
- ✅ Skip links provided ("Skip to main content")

**3. Screen Reader Support**
- ✅ Semantic HTML (nav, main, section, article)
- ✅ ARIA labels for icons-only buttons
- ✅ ARIA live regions for dynamic content
- ✅ Alt text for all meaningful images
- ✅ Form labels properly associated

**4. Visual Indicators**
- ✅ Color not sole indicator (icons + text always present)
- ✅ Confidence scores: Color + icon + text label
- ✅ Health scores: Color + numeric value + text status
- ✅ VIP indicators: Gold color + crown icon + "VIP" text

**5. Interactive Elements**
- ✅ Minimum touch target: 44x44px (mobile)
- ✅ Minimum click target: 24x24px (desktop)
- ✅ Adequate spacing between targets (8px minimum)
- ✅ Hover/focus states clearly visible

---

## Focus Management

**Focus Indicators:**
```css
/* Global focus style */
*:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 4px;
  border-radius: 4px;
}

/* Button focus */
button:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
```

**Focus Trap in Modals:**
- Focus moves to first interactive element when opened
- Tab cycles within modal only
- Esc closes and returns focus to trigger element

**Skip Links:**
```html
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```
- Visible on keyboard focus
- Positioned absolute, top-left
- High z-index (9999)

---

## Screen Reader Announcements

**Live Regions:**
```html
<!-- Toast notifications -->
<div role="status" aria-live="polite" aria-atomic="true">
  Message sent to Sarah Chen
</div>

<!-- Critical alerts -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Deliverability warning: Bounce rate increased
</div>
```

**Visually Hidden Text:**
```html
<!-- Icon-only button -->
<button>
  <XIcon />
  <span class="sr-only">Close dialog</span>
</button>

<!-- Confidence badge -->
<span class="badge">
  <CheckCircle />
  92%
  <span class="sr-only">Confidence score 92%, high confidence</span>
</span>
```

**ARIA Labels:**
```html
<!-- Health score -->
<div
  role="meter"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="92"
  aria-label="Campaign health score: 92 out of 100, Excellent"
>
  92
</div>

<!-- Pipeline card -->
<div
  role="listitem"
  aria-label="Sarah Chen from FinTech Solutions, Qualified stage, confidence 92%, VIP account, last activity 2 hours ago"
>
  ...
</div>
```

---

## Reduced Motion Support

**Respecting User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Conditional Animations:**
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Only animate if user hasn't requested reduced motion
const animationConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 300 };
```

---
