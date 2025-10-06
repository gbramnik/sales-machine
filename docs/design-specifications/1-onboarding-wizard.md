# 1. Onboarding Wizard

**Story Reference:** Epic 5, Story 5.4
**Screen Route:** `/onboarding`
**Entry Point:** First login, no existing campaign

## Design Objective

Create a conversational, low-friction 5-step wizard that makes users feel confident and supported. The wizard should feel like a guided conversation with a sales consultant, not a technical configuration form.

## Layout & Structure

**Container:**
- Max-width: 640px centered
- Background: Gradient from gray-50 to white
- Card elevation: shadow-lg with border-radius 12px

**Progress Indicator:**
- Top of card, horizontal stepper (5 dots)
- Completed: Blue filled circle
- Current: Blue outline circle with pulse animation
- Upcoming: Gray outline circle
- Label: "Step 2 of 5" (14px gray-500)

---

## Step 1: Welcome & Goal Selection

**Header:**
```
Let's get your AI Sales Rep configured!

This will take about 10 minutes. We'll help you set up
everything needed to start booking qualified meetings.
```

**Content:**
- **Question:** "How many qualified meetings per month do you want to book?"
- **Options:** Three large selectable cards (radio button behavior)

**Card Layout:**
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  🎯  5-10 Meetings │  │  🚀  10-20 Meetings │  │  ⚡  20-30 Meetings │
│                     │  │                     │  │                     │
│  Starter            │  │  Growth             │  │  Scale              │
│  Perfect for solo   │  │  Small team support │  │  Aggressive growth  │
│  entrepreneurs      │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Card Specifications:**
- Width: 180px, Height: 140px
- Background: White, Border: 2px gray-200
- Hover: Border-primary-blue-300, shadow-md
- Selected: Border-primary-blue-600, bg-primary-blue-50
- Icon: 32px emoji or Lucide icon
- Title: 18px font-semibold
- Description: 14px gray-500

**Button:**
- Primary button "Continue" bottom-right
- Disabled until selection made

**Accessibility:**
- Radio group with keyboard navigation (arrow keys)
- `aria-describedby` pointing to helper text
- Focus visible indicator (2px blue outline)

---

## Step 2: Industry & ICP Selection

**Header:**
```
Who are you trying to reach?

Tell us about your ideal customer so we can configure
the right targeting and messaging.
```

**Content:**

**Industry Selection:**
- Visual grid of industry cards (4 columns, 5 rows = 20 industries)
- Search filter at top: "Search industries..." (instant filter)

**Industry Card (80px x 80px):**
```
┌──────────┐
│   💼     │  ← Industry icon (can be emoji or custom icon)
│  SaaS    │
└──────────┘
```

**Hover/Selected States:**
- Hover: shadow-md, scale 1.05
- Selected: Blue border, checkmark overlay top-right

**Industry List:**
- SaaS & Cloud Software
- Marketing Agencies
- Consulting & Professional Services
- E-Commerce & Retail
- Financial Services
- Healthcare & Medical
- Real Estate
- Manufacturing
- Education & EdTech
- Hospitality & Tourism
- Construction & Engineering
- Legal Services
- Logistics & Transportation
- Non-Profit
- Media & Entertainment
- Technology Services
- Design & Creative
- HR & Recruiting
- Insurance
- Other (Custom input)

**ICP Preview Panel** (below industry selection):
```
┌──────────────────────────────────────────────────────────┐
│ Based on your selection, we recommend targeting:         │
│                                                           │
│ Job Titles: VP of Marketing, CMO, Marketing Director     │
│ Company Size: 50-500 employees                           │
│ Location: France, Belgium, Switzerland                   │
│                                                           │
│ [Edit Recommendations]  (opens advanced panel)           │
└──────────────────────────────────────────────────────────┘
```

**Advanced Panel** (collapsible):
- Job titles: Multi-select dropdown
- Company size: Range slider (1-10, 10-50, 50-200, 200-1000, 1000+)
- Locations: Multi-select with search

**Buttons:**
- Back (secondary, left)
- Continue (primary, right)

---

## Step 3: Domain Verification

**Header:**
```
Verify your sending domain

To ensure high email deliverability, we need to verify
your domain is properly configured.
```

**Content:**

**Domain Input:**
```
┌──────────────────────────────────────────┐
│ Your sending email domain                │
│ ┌──────────────────────────────────────┐ │
│ │ yourdomain.com                       │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Check DNS Records]  (primary button)    │
└──────────────────────────────────────────┘
```

**Verification Status Display:**

**After clicking "Check DNS Records":**

```
┌──────────────────────────────────────────────────────────┐
│ DNS Records Status                                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ✅ SPF Record              Verified                      │
│ ✅ DKIM Record             Verified                      │
│ ❌ DMARC Record            Not Found                     │
│                                                           │
│    [Show Setup Instructions]                             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- Green checkmark (CheckCircle icon) + "Verified" in green
- Red X (XCircle icon) + "Not Found" in red with "Fix this" link

**Expandable Instructions** (when "Show Setup Instructions" clicked):

```
┌──────────────────────────────────────────────────────────┐
│ 📋 Add this DMARC record to your DNS:                   │
│                                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Type:  TXT                                        │   │
│ │ Name:  _dmarc                                     │   │
│ │ Value: v=DMARC1; p=quarantine; rua=mailto:...    │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ [Copy to Clipboard]                                      │
│                                                           │
│ Need help? [Watch Video Tutorial]                       │
└──────────────────────────────────────────────────────────┘
```

**Warm-Up Notice:**
```
┌──────────────────────────────────────────────────────────┐
│ ⏳ Domain Warm-Up Required                              │
│                                                           │
│ New domains need 14-21 days of warm-up before full       │
│ campaign volume. Your AI Sales Rep will gradually        │
│ increase sending to protect your reputation.             │
│                                                           │
│ Start Date: Oct 5, 2025                                  │
│ Full Volume: Oct 19-26, 2025                             │
└──────────────────────────────────────────────────────────┘
```

**Buttons:**
- Skip for Now (secondary, left) - with warning "Deliverability may be affected"
- Continue (primary, right) - Only enabled when all green checks OR user confirms skip

---

## Step 4: Calendar Connection

**Header:**
```
Connect your calendar

Your AI Sales Rep will book meetings directly on your
calendar when prospects are qualified.
```

**Content:**

**Calendar Provider Selection:**
```
┌─────────────────────┐  ┌─────────────────────┐
│                     │  │                     │
│   📅 Google         │  │   📅 Outlook        │
│                     │  │                     │
│   [Connect]         │  │   [Connect]         │
│                     │  │                     │
└─────────────────────┘  └─────────────────────┘
```

**OAuth Flow:**
1. User clicks "Connect"
2. OAuth popup window (500px x 600px centered)
3. User authorizes in provider interface
4. Popup closes, returns to wizard

**Success State:**

```
┌──────────────────────────────────────────────────────────┐
│ ✅ Calendar Connected                                    │
│                                                           │
│ john@acmecorp.com (Google Calendar)                      │
│                                                           │
│ Available meeting slots:                                 │
│ • Mon-Fri, 9:00 AM - 5:00 PM EST                        │
│ • 30-minute default duration                             │
│                                                           │
│ [Edit Availability Settings]                             │
└──────────────────────────────────────────────────────────┘
```

**Edit Availability Modal:**
- Day/time selection grid
- Meeting duration dropdown (15, 30, 45, 60 minutes)
- Buffer time between meetings (0, 15, 30 minutes)

**Buttons:**
- Back (secondary)
- Continue (primary, enabled only after successful connection)

---

## Step 5: Review & Launch

**Header:**
```
You're all set! 🎉

Review your configuration below. Your AI Sales Rep is ready
to start prospecting as soon as you activate.
```

**Content:**

**Configuration Summary:**
```
┌──────────────────────────────────────────────────────────┐
│ Your AI Sales Rep Configuration                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ 🎯 Goal: 10-20 qualified meetings/month                 │
│                                                           │
│ 👥 Target Audience:                                      │
│    Industry: SaaS & Cloud Software                       │
│    Job Titles: VP Marketing, CMO, Marketing Director     │
│    Company Size: 50-500 employees                        │
│    Locations: France, Belgium, Switzerland               │
│                                                           │
│ ✉️  Email Domain: yourdomain.com                         │
│    Status: Verified ✅ (Warm-up: 14 days remaining)     │
│                                                           │
│ 📅 Calendar: john@acmecorp.com (Google)                 │
│    Availability: Mon-Fri 9AM-5PM                         │
│                                                           │
│ [Edit Configuration]                                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**What Happens Next:**
```
┌──────────────────────────────────────────────────────────┐
│ 🤖 Your AI Sales Rep will:                              │
│                                                           │
│ 1. Find 50-100 prospects matching your ICP daily         │
│ 2. Research and personalize outreach for each prospect   │
│ 3. Send emails (max 20/day during warm-up)              │
│ 4. Respond to replies and qualify leads 24/7            │
│ 5. Book meetings automatically when prospects qualify    │
│                                                           │
│ You'll be notified for:                                  │
│ • VIP accounts requiring approval                        │
│ • Low-confidence messages needing review                 │
│ • Meetings booked                                        │
│ • Deliverability alerts                                  │
└──────────────────────────────────────────────────────────┘
```

**Final Action:**

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│         [Activate My AI Sales Rep]                       │
│            (Large primary button)                         │
│                                                           │
│  By activating, you agree to our Terms of Service       │
│  and Privacy Policy                                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Button Specifications:**
- Width: 320px, Height: 56px
- Background: Gradient blue (primary-600 to primary-700)
- Text: 18px font-semibold white
- Hover: Shadow-xl, slight scale (1.02)
- Loading state: Spinner + "Activating..." text

**Post-Activation:**
- Success toast notification: "Your AI Sales Rep is now active!"
- Auto-redirect to Campaign Dashboard (3 second delay with animated loading)

**Accessibility:**
- Each step has `aria-label` describing current step
- Progress announced to screen readers: "Step 2 of 5, Industry Selection"
- All interactive elements keyboard navigable
- Form validation errors announced via live regions

---
