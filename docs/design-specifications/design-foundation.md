# Design Foundation

## Design Principles

**1. Complexity Hidden, Outcomes Visible**
- Users see "Meetings Booked: 12" not "N8N Workflow Execution Success Rate: 94%"
- Technical infrastructure (webhooks, MCP servers, queue processing) never exposed
- Focus on business outcomes: meetings, qualified leads, response rates

**2. Trust-Oriented Aesthetic**
- Professional, calm, confident visual language
- Transparent AI operations (always show confidence scores)
- No dark patterns or hidden automation

**3. Progressive Disclosure**
- Simple default views with drill-down for power users
- Critical actions prominent, advanced features accessible but not overwhelming
- Context-aware help and guidance

**4. Business Language Only**
- "AI Sales Rep" not "Claude API Integration"
- "Campaign Health" not "Deliverability Metrics Dashboard"
- "Review Message" not "Low Confidence Queue Processing"

---

## Visual Design System

### Color Palette

**Primary Colors (Trust & Professionalism)**
```
Primary Blue:     #2563EB (rgb(37, 99, 235))   - Primary actions, links, active states
Primary Blue 50:  #EFF6FF                       - Subtle backgrounds
Primary Blue 600: #1D4ED8                       - Hover states
Primary Blue 700: #1E40AF                       - Active/pressed states
```

**Semantic Colors**
```
Success Green:    #10B981 (rgb(16, 185, 129))   - Completed actions, health indicators
Success Green 50: #ECFDF5                       - Success backgrounds
Warning Amber:    #F59E0B (rgb(245, 158, 11))   - Alerts, low confidence scores
Warning Amber 50: #FFFBEB                       - Warning backgrounds
Error Red:        #EF4444 (rgb(239, 68, 68))    - Critical errors, rejections
Error Red 50:     #FEF2F2                       - Error backgrounds
```

**Neutral Gray Scale**
```
Gray 50:  #F9FAFB - Page backgrounds
Gray 100: #F3F4F6 - Card backgrounds, dividers
Gray 200: #E5E7EB - Borders (inactive)
Gray 300: #D1D5DB - Borders (subtle)
Gray 400: #9CA3AF - Placeholder text
Gray 500: #6B7280 - Secondary text
Gray 600: #4B5563 - Body text
Gray 700: #374151 - Headings
Gray 800: #1F2937 - Primary text
Gray 900: #111827 - High emphasis text
```

**VIP Gold Accent** (for VIP accounts)
```
Gold:     #D97706 (rgb(217, 119, 6))
Gold 50:  #FFFBEB
```

### Typography

**Font Family**
```css
Primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace:  'JetBrains Mono', 'SF Mono', 'Courier New', monospace (for confidence scores, metrics)
```

**Type Scale** (Desktop 1280px+)
```
Display:       font-size: 48px, line-height: 56px, weight: 700 (Dashboard welcome)
H1:            font-size: 36px, line-height: 44px, weight: 700
H2:            font-size: 30px, line-height: 38px, weight: 600
H3:            font-size: 24px, line-height: 32px, weight: 600
H4:            font-size: 20px, line-height: 28px, weight: 600
Body Large:    font-size: 18px, line-height: 28px, weight: 400
Body:          font-size: 16px, line-height: 24px, weight: 400
Body Small:    font-size: 14px, line-height: 20px, weight: 400
Caption:       font-size: 12px, line-height: 16px, weight: 400
```

**WCAG AA Compliance:**
- All text on white: Gray 600+ (4.5:1 contrast minimum)
- Large text (18px+): Gray 500+ acceptable (3:1 contrast)
- Interactive elements: Underline or 3px minimum border for non-color identification

### Spacing System (Tailwind Scale)

```
Space 1:  4px    (0.25rem)  - Tight element padding
Space 2:  8px    (0.5rem)   - Small gaps
Space 3:  12px   (0.75rem)  - Default inner padding
Space 4:  16px   (1rem)     - Card padding, standard gaps
Space 6:  24px   (1.5rem)   - Section spacing
Space 8:  32px   (2rem)     - Large section gaps
Space 12: 48px   (3rem)     - Major section divisions
Space 16: 64px   (4rem)     - Page section breaks
```

### Border & Shadow System

**Border Radius**
```
sm:  4px  - Badges, tags
md:  6px  - Buttons, inputs
lg:  8px  - Cards, modals
xl:  12px - Large containers
2xl: 16px - Feature cards
```

**Shadows** (depth hierarchy)
```
sm:    0 1px 2px 0 rgb(0 0 0 / 0.05)                      - Subtle elevation
md:    0 4px 6px -1px rgb(0 0 0 / 0.1)                    - Cards
lg:    0 10px 15px -3px rgb(0 0 0 / 0.1)                  - Modals, dropdowns
xl:    0 20px 25px -5px rgb(0 0 0 / 0.1)                  - Popovers
inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)                - Input fields
```

### Iconography

**Library:** Lucide React (v0.263.1+)
- Consistent 24px default size (20px for compact UI)
- 1.5px stroke width (professional, not too thin)
- Line style (not filled) for modern aesthetic

**Key Icons:**
- `Sparkles` - AI features, confidence indicators
- `Mail` - Email campaigns
- `Users` - Prospects, contacts
- `Calendar` - Meeting bookings
- `TrendingUp` - Health scores, performance
- `AlertTriangle` - Warnings, low confidence
- `CheckCircle` - Success states
- `XCircle` - Errors, rejections
- `Crown` - VIP accounts
- `Eye` - Review actions
- `Edit3` - Edit actions
- `ThumbsUp` / `ThumbsDown` - Approve/reject

---
