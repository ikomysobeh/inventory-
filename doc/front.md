
# 🎨 UI Design Guide — Restaurant Inventory Management System
## Visual Inspiration & Design System for Frontend Development

> This document gives the AI (or developer) everything needed to build a beautiful,
> consistent, mobile-first UI. Read this before writing a single line of CSS.

---

## 1. The Problem with What We Have

The current AI-built UI (see screenshot) looks like this:
- Plain white background, no visual hierarchy
- Default browser fonts, no personality
- No color, no spacing rhythm, no cards, no icons
- Looks like a form from 2005

**We need the opposite:** a clean, modern, professional tool that feels
as polished as Linear or Notion — but designed for a restaurant kitchen,
not a tech office. Workers using it on their phones should feel like
it was built for them.

---

## 2. Design Direction: "Clean Kitchen"

**Concept:** Industrial-clean. Like a well-organized professional kitchen —
everything has a place, everything is easy to grab. Not flashy, not corporate.
Warm, functional, trustworthy.

**Tone keywords:** Warm · Clear · Confident · Fast · No noise

**NOT this:**
- Purple gradients on white (generic SaaS)
- Dark hacker dashboard (wrong context)
- Flat pastel cards that feel like a to-do app

**YES this:**
- Deep slate backgrounds with warm cream/white content cards
- Amber/orange accent — the color of a kitchen flame
- Bold, readable numbers — this is a counting app
- Tactile inputs that feel big and easy to tap on phone

---

## 3. Visual Inspiration (Websites to Study)

Study these before building each section. Focus on layout, spacing, color use,
and typography — not the content itself.

### Overall App Shell & Layout
| Site | What to Study |
|---|---|
| https://linear.app | Sidebar layout, dark theme with colored accents, tight spacing |
| https://vercel.com/dashboard | Clean dark dashboard, stat cards, subtle borders |
| https://railway.app | Compact sidebar, dark nav, minimal icons |
| https://render.com | Status badges, clean list layouts |

### Dashboard & Data Cards
| Site | What to Study |
|---|---|
| https://ui.shadcn.com/examples/dashboard | Card layout, stat numbers, table rows |
| https://dribbble.com/shots/21598756 | Restaurant dashboard dark UI — study the card hierarchy |
| https://dribbble.com/shots/20185180 | Inventory dashboard — warm tones, category grouping |
| https://tailwindui.com/components/application-ui/page-examples/home-screens | Stat cards and alert rows |

### Mobile-first Forms & Inputs
| Site | What to Study |
|---|---|
| https://dribbble.com/shots/19879046 | Large mobile inputs, thumb-friendly layout |
| https://mobbin.com (search: "inventory") | Real mobile apps using input grids |
| https://dribbble.com/shots/22450156 | Number inputs on mobile, clean label placement |

### Tables & Lists
| Site | What to Study |
|---|---|
| https://ui.shadcn.com/examples/tasks | Clean table with badges and actions |
| https://www.notion.so | Row hover, compact text, inline edits |
| https://airtable.com | Grid with fixed columns, colored badges |

### Typography Reference
| Site | What to Study |
|---|---|
| https://fonts.google.com/specimen/DM+Sans | Our primary font — clean, warm, not Inter |
| https://fonts.google.com/specimen/Space+Grotesk | Alternative display option for headers |
| https://fonts.google.com/specimen/Geist | Vercel's font — very clean numbers |
| https://fonts.google.com/specimen/Sora | Friendly but professional — good for mobile |

### Color & Badge Inspiration
| Site | What to Study |
|---|---|
| https://www.radix-ui.com/colors | Color scales — how to build a proper palette |
| https://ui.shadcn.com/docs/components/badge | Badge variants (LOW / OK / INACTIVE) |
| https://vercel.com/design/color | Status colors: error red, warning amber, success green |

---

## 4. Color System

Use CSS variables everywhere. Never hardcode colors.

```css
:root {
  /* Backgrounds */
  --bg-base:        #0f1117;   /* deepest background — app shell */
  --bg-surface:     #181c27;   /* sidebar, nav */
  --bg-card:        #1e2333;   /* cards, panels */
  --bg-input:       #252b3b;   /* input fields */
  --bg-hover:       #2a3045;   /* row hover */

  /* Borders */
  --border-subtle:  #2e3549;   /* card edges, dividers */
  --border-strong:  #3d4666;   /* focused inputs */

  /* Text */
  --text-primary:   #f0f2f8;   /* headings, main content */
  --text-secondary: #8892a4;   /* labels, meta info */
  --text-muted:     #4e5770;   /* placeholder, disabled */

  /* Accent — Kitchen Flame Orange */
  --accent:         #f97316;   /* primary action, highlights */
  --accent-soft:    #7c3a0f;   /* accent background/badge bg */
  --accent-hover:   #fb923c;   /* hover state */

  /* Status Colors */
  --status-low:     #ef4444;   /* LOW STOCK — red */
  --status-low-bg:  #450a0a;   /* LOW badge background */
  --status-ok:      #22c55e;   /* OK / IN STOCK — green */
  --status-ok-bg:   #052e16;   /* OK badge background */
  --status-warn:    #f59e0b;   /* warning amber */
  --status-warn-bg: #431407;

  /* Semantic */
  --danger:         #f43f5e;
  --danger-bg:      #4c0519;
}
```

> For a **light theme** version (optional — managers on desktop):
> Flip backgrounds to `#fafafa` / `#ffffff`, text to `#111827`,
> keep the same orange accent. Use the dark theme as default.

---

## 5. Typography

```css
/* Import in index.html or main.css */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;   /* for numbers and quantities */

  /* Scale */
  --text-xs:   0.75rem;    /* 12px — meta, timestamps */
  --text-sm:   0.875rem;   /* 14px — labels, table cells */
  --text-base: 1rem;       /* 16px — body */
  --text-lg:   1.125rem;   /* 18px — input values (minimum for mobile) */
  --text-xl:   1.25rem;    /* 20px — card titles */
  --text-2xl:  1.5rem;     /* 24px — page headings */
  --text-3xl:  1.875rem;   /* 30px — dashboard stat numbers */
}

body {
  font-family: var(--font-body);
  background: var(--bg-base);
  color: var(--text-primary);
}

/* All quantity numbers use mono font */
.quantity, input[type="number"] {
  font-family: var(--font-mono);
  font-size: var(--text-lg);   /* never smaller than 18px */
}
```

---

## 6. Spacing & Layout System

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* App shell */
  --sidebar-width: 240px;        /* desktop sidebar */
  --bottom-nav-height: 64px;     /* mobile bottom bar */
  --topbar-height: 56px;
}
```

**Layout rules:**
- Mobile: full-width, content padded 16px each side
- Desktop (manager): 240px sidebar + main content area
- Cards: 16px internal padding on mobile, 24px on desktop
- Section headers: 12px top padding, 8px bottom padding
- Row height minimum: 56px (so thumbs can tap comfortably)

---

## 7. Component Design Specs

### 7.1 App Shell

```
Mobile (Employee):
┌─────────────────────────┐
│  TopBar (56px)          │  ← App name left, user avatar right
├─────────────────────────┤
│                         │
│  Page Content           │
│  (scrollable)           │
│                         │
│                         │
├─────────────────────────┤
│  BottomNav (64px)       │  ← fixed at bottom
└─────────────────────────┘

Desktop (Manager):
┌──────────┬──────────────────────────┐
│ Sidebar  │ TopBar (56px)            │
│ (240px)  ├──────────────────────────┤
│          │                          │
│ Nav      │ Page Content             │
│ links    │ (scrollable)             │
│          │                          │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Sidebar style:**
- Background: `var(--bg-surface)`
- Logo/brand at top with a small orange flame icon 🔥 or fork icon
- Nav items: icon + label, 44px height, rounded corners
- Active item: `var(--accent)` left border (3px) + `var(--bg-hover)` background
- Bottom: user name + role badge + logout icon

**Bottom nav style (mobile):**
- Background: `var(--bg-surface)` with top border `var(--border-subtle)`
- 4 icons max for manager, 1–2 for employee
- Active icon: accent color, small dot indicator below

---

### 7.2 Login Page

**Goal:** Simple, clean, trustworthy. Not intimidating.

```
Full screen, centered card:

┌──────────────────────────────┐
│                              │
│    🔥  Restaurant            │
│       Inventory              │
│                              │
│  ──────────────────────────  │
│                              │
│  Email Address               │
│  [                         ] │
│                              │
│  Password                    │
│  [                    👁️  ] │
│                              │
│  [       Login →            ]│  ← full-width orange button
│                              │
│  "Login failed" shown here   │  ← red text, subtle
│                              │
└──────────────────────────────┘
```

**Specs:**
- Card: `var(--bg-card)`, radius-xl, 400px wide on desktop, full-width on mobile
- Background: `var(--bg-base)` with subtle dot-grid pattern (CSS background-image)
- Input: 48px height, background `var(--bg-input)`, border `var(--border-subtle)`
- Input focus: border `var(--accent)`, soft orange glow (box-shadow)
- Button: 52px height, background `var(--accent)`, bold 600 weight, full width
- Error state: red text below the form, fade-in animation

**CSS for dot-grid background:**
```css
body.login-page {
  background-color: var(--bg-base);
  background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

### 7.3 Inventory Checklist (Employee Main Screen)

This is the most important screen. It must be extremely comfortable to use on a phone for 5–10 minutes at a time.

```
┌─────────────────────────────────────────┐
│  📦 Inventory Count                     │  ← TopBar
│  June 7, 2025                    Sara ▸  │
├─────────────────────────────────────────┤
│  ████████████░░░░░░░░  32 / 45          │  ← progress bar, accent color
├─────────────────────────────────────────┤
│                                         │
│  ┌─ 🥦 Vegetables & Produce  (2 LOW) ─┐ │
│  │                                    │ │
│  │  Tomatoes          [12]    [3] Case │ │  ← REST  OFF
│  │  ──────────────────────────────    │ │
│  │  🔴 Parsley        [ 2]    [0] Case │ │  ← low stock row — red left border
│  │  ──────────────────────────────    │ │
│  │  Lettuce           [ 5]    [2] Head │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ 🧀 Dairy & Pantry  ───────────────┐ │
│  │  Yogurt            [ 4]    [1] Bag  │ │
│  │  ──────────────────────────────    │ │
│  │  🔴 Feta Cheese    [ 0]    [0] Bag  │ │
│  └────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│           [ 💾  Save Count ]            │  ← sticky bottom button
└─────────────────────────────────────────┘
```

**Column header (sticky, below progress bar):**
```
ITEM                    REST    OFF
```
- Text: `var(--text-secondary)`, 12px, all caps, letter-spacing 0.08em

**Item Row specs:**
- Height: 56px minimum
- Two number inputs side by side: each 64px wide, 48px tall
- Input font: `var(--font-mono)`, 20px, centered
- Unit label: 12px, muted, right of second input
- Normal row border-left: transparent (3px)
- LOW STOCK row: border-left 3px `var(--status-low)`, background tint `rgba(239,68,68,0.05)`
- LOW STOCK indicator: small red dot (8px circle) before item name

**Category section header:**
- Background: `var(--bg-card)` with subtle top/bottom border
- Icon + name + "(X LOW)" badge when low items exist
- Chevron right, rotates on collapse
- Tap entire header to collapse/expand

**Progress bar:**
- Height: 6px, full width
- Background: `var(--bg-input)`
- Fill: `var(--accent)` with smooth transition
- Text: "32 / 45 items" right-aligned, 12px

**Save button:**
- Sticky at bottom, above bottom nav
- Full width, 52px height, `var(--accent)` background
- "Saving..." state: spinner + "Saving..." text, slightly dimmed
- "Saved ✓" state: green for 2 seconds then back to normal

---

### 7.4 Manager Dashboard

```
┌──────────────────────────────────────────┐
│  Good morning, Ahmed 👋                  │
│  June 7, 2025 · Restaurant Inventory     │
├──────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  🔴  12  │ │  ✅  87  │ │ 📅 Today │ │
│  │ Low Stock│ │  Items   │ │Last Count│ │
│  └──────────┘ └──────────┘ └──────────┘ │
├──────────────────────────────────────────┤
│  LOW STOCK ALERTS             Sort: Need │
│  ─────────────────────────────────────   │
│  Item           Rest  Off  Par   Need    │
│  ┌──────────────────────────────────┐   │
│  │ 🔴 Parsley        2    0    5   3 Case│
│  │ 🔴 Feta Cheese    0    0    2   2 Bag │
│  │ 🔴 Burger Buns    1    0    6   5 Bag │
│  └──────────────────────────────────┘   │
├──────────────────────────────────────────┤
│  [🛒 Shopping List]      [⬇ Export CSV] │
└──────────────────────────────────────────┘
```

**Stat cards:**
- 3 per row on desktop, stack 1-per-row on mobile
- Background: `var(--bg-card)`, border `var(--border-subtle)`
- Number: 30px, bold, `var(--font-mono)`
- Label: 12px, `var(--text-secondary)`
- Low stock card: accent left border `var(--status-low)`, number in red

**Alert table rows:**
- Alternating background: transparent / `rgba(255,255,255,0.02)`
- Hover: `var(--bg-hover)` slide-in animation
- Number columns: `var(--font-mono)`, right-aligned
- Need column: bold, accent color if > 0

---

### 7.5 Shopping List

**Style concept:** Looks like a clean printed list, but digital.
Supplier sections feel like "sections of a list" — visual separation without being heavy.

```
┌──────────────────────────────────────────┐
│  🛒 Shopping List                        │
│  June 7, 2025                    [PDF]   │
├──────────────────────────────────────────┤
│                                          │
│  SYSCO                           3 items │  ← supplier header, uppercase
│  ───────────────────────────────         │
│  · Parsley 12 Count       3 Cases        │
│  · Feta Cheese            2 Bags         │
│  · Mint 1 LB              2 Cases        │
│                                          │
│  SAM'S CLUB                      2 items │
│  ───────────────────────────────         │
│  · Red Onion              4 Bags         │
│  · Coca-Cola              2 Cases        │
│                                          │
│  NO SUPPLIER                     1 item  │
│  ───────────────────────────────         │
│  · Leeks                  2 Bunch        │
│                                          │
├──────────────────────────────────────────┤
│  [ 📄 PDF ]              [ ⬇ CSV ]      │
└──────────────────────────────────────────┘
```

**Supplier header:**
- Font: 11px, all caps, letter-spacing 0.12em, `var(--text-secondary)`
- Right side: item count badge, subtle gray
- Bottom: 1px border `var(--border-subtle)`

**List items:**
- Left: bullet dot (4px, accent color)
- Item name: 14px regular
- Quantity + unit: pushed right, 14px, `var(--font-mono)`, bold

---

### 7.6 Manager Items Table

```
┌──────────────────────────────────────────────────────┐
│  Items                              [+ Add Item]     │
│  ──────────────────────────────────────────────────  │
│  [🔍 Search items...]  [Category ▼]  [Supplier ▼]   │
├──────────────────────────────────────────────────────┤
│  Name              Category    Supplier  Unit  Par  St│
│  ──────────────────────────────────────────────────  │
│  Tomatoes          🥦 Veg       Sysco    Case   5  ✅ │
│  Parsley           🥦 Veg       Sysco    Case   5  ✅ │
│  Feta Cheese       🧀 Dairy     Sysco    Bag    2  ✅ │
│  [Deactivated]     🥩 Meat      Saad     LB     0  ⛔│
│  ...                                                  │
└──────────────────────────────────────────────────────┘
```

**Table specs:**
- Row height: 52px
- Column Name: bold, 14px
- Category: icon + text, pill badge (subtle background matching category color)
- Unit: `var(--font-mono)`, muted
- Status: ✅ green badge / ⛔ gray badge "Inactive"
- Row hover: `var(--bg-hover)` + show Edit / Deactivate action buttons (slide in from right)

---

### 7.7 Item Form (Add / Edit)

**Style:** Feels like a focused form. Not overwhelming. One task.

```
┌──────────────────────────────────┐
│  ← Edit Item                     │
├──────────────────────────────────┤
│  Name *                          │
│  [Tomatoes                     ] │
│                                  │
│  Full Name                       │
│  [Tomato Roma Fresh (25lb)     ] │
│                                  │
│  Category *        Supplier      │
│  [🥦 Vegetables ▼] [Sysco ▼   ] │
│                                  │
│  Unit              Par Level     │
│  [Case          ▼] [5          ] │
│                                  │
│  Notes                           │
│  [Sysco SKU: 6894125           ] │
│                                  │
│  Active                          │
│  [● Yes  ○ No]                   │
│                                  │
│  [  Cancel  ]   [  Save Item  ] →│
└──────────────────────────────────┘
```

**Form specs:**
- Two-column grid for short fields (Category + Supplier, Unit + Par Level)
- Single column for long fields (Name, Full Name, Notes)
- Labels: 12px, `var(--text-secondary)`, uppercase, letter-spacing
- Inputs: 44px height, `var(--bg-input)` background, border `var(--border-subtle)`
- Input focus: border `var(--accent)`, soft glow
- Required asterisk: accent color
- Save button: accent background, right side
- Cancel button: ghost style (border only)

---

## 8. Badge System

All badges use the same base style. Only color changes.

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;    /* pill */
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-low      { background: var(--status-low-bg);  color: var(--status-low);  }
.badge-ok       { background: var(--status-ok-bg);   color: var(--status-ok);   }
.badge-warn     { background: var(--status-warn-bg); color: var(--status-warn); }
.badge-manager  { background: var(--accent-soft);    color: var(--accent);      }
.badge-employee { background: var(--bg-input);       color: var(--text-secondary); }
.badge-inactive { background: var(--bg-input);       color: var(--text-muted);  }
```

---

## 9. Button System

```css
/* Base */
.btn {
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Primary — main actions */
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
}
.btn-primary:hover { background: var(--accent-hover); }

/* Ghost — secondary actions */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Danger — destructive */
.btn-danger {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger);
}

/* Full width (mobile) */
.btn-full { width: 100%; justify-content: center; }

/* Large (main CTA like Save on checklist) */
.btn-lg { height: 52px; font-size: 16px; }
```

---

## 10. Input System

```css
.input-wrapper { display: flex; flex-direction: column; gap: 6px; }

.input-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
}

.input {
  height: 44px;
  padding: 0 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
}

.input::placeholder { color: var(--text-muted); }

/* Number input — used in checklist */
.input-number {
  width: 64px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 20px;
  padding: 0 8px;
}
```

---

## 11. Animations & Micro-interactions

```css
/* Page entrance — stagger category sections */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.category-block {
  animation: fadeSlideUp 0.3s ease both;
}
.category-block:nth-child(1) { animation-delay: 0.05s; }
.category-block:nth-child(2) { animation-delay: 0.10s; }
.category-block:nth-child(3) { animation-delay: 0.15s; }
/* ...etc */

/* Save button saved state */
@keyframes savedPulse {
  0%   { background: var(--status-ok); transform: scale(1); }
  50%  { transform: scale(1.02); }
  100% { background: var(--accent); transform: scale(1); }
}

/* Row hover slide-in for action buttons */
.table-row .row-actions {
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.15s ease;
}
.table-row:hover .row-actions {
  opacity: 1;
  transform: translateX(0);
}

/* Input focus glow */
.input { transition: border-color 0.15s, box-shadow 0.15s; }

/* Category collapse/expand */
.chevron { transition: transform 0.2s ease; }
.collapsed .chevron { transform: rotate(-90deg); }
```

---

## 12. Tailwind Config (if using Tailwind)

Extend the default config in `tailwind.config.js` to match the design system:

```js
module.exports = {
  content: ['./src/**/*.{jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0f1117',
          surface: '#181c27',
          card:    '#1e2333',
          input:   '#252b3b',
          hover:   '#2a3045',
        },
        border: {
          subtle: '#2e3549',
          strong: '#3d4666',
        },
        accent: {
          DEFAULT: '#f97316',
          hover:   '#fb923c',
          soft:    '#7c3a0f',
        },
        status: {
          low:    '#ef4444',
          ok:     '#22c55e',
          warn:   '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '20px',
      },
    },
  },
}
```

---

## 13. Responsive Breakpoints

```css
/* Mobile first — base styles target mobile */
/* sm: 640px  — large phone landscape */
/* md: 768px  — tablet */
/* lg: 1024px — desktop (sidebar appears here) */

/* Show sidebar only on desktop */
.sidebar   { display: none; }
@media (min-width: 1024px) {
  .sidebar { display: flex; }
  .bottom-nav { display: none; }
}
```

---

## 14. Page-by-Page Implementation Checklist

Use this as a checklist when building each page:

### Login
- [ ] Dot-grid background on base color
- [ ] Centered card, max-width 400px
- [ ] Flame/fork logo mark above title
- [ ] Email + password inputs with correct focus state
- [ ] Password visibility toggle
- [ ] Full-width orange Login button
- [ ] Error message fade-in on failure

### Checklist (Employee)
- [ ] Sticky progress bar below topbar
- [ ] Sticky column headers: ITEM · RESTAURANT · OFFICE
- [ ] Category blocks with collapse/expand + chevron
- [ ] Low-stock indicator: red left border + dot on item name
- [ ] Two number inputs per row (mono font, large, centered)
- [ ] Unit label after second input
- [ ] Sticky Save button above bottom nav
- [ ] "Saving..." and "Saved ✓" button states

### Dashboard (Manager)
- [ ] Three stat cards in a row
- [ ] Low-stock table with correct columns
- [ ] Red accent on low-stock number in stat card
- [ ] Row hover reveals sort/filter affordance
- [ ] Two action buttons: Shopping List + Export CSV

### Shopping List
- [ ] Supplier group headers (small caps, subtle)
- [ ] Bullet dot items with quantity pushed right
- [ ] "No Supplier" group at bottom
- [ ] PDF + CSV export buttons

### Items Table
- [ ] Search input full-width at top
- [ ] Category + Supplier filter dropdowns
- [ ] Table with row hover actions (Edit / Deactivate)
- [ ] Status badge on each row
- [ ] Add Item button top-right

### Item Form
- [ ] Two-column grid for short fields
- [ ] Unit dropdown with common options + free text
- [ ] Clear required field indicators
- [ ] Inline validation errors
- [ ] Cancel (ghost) + Save (accent) button pair

---

## 15. Reference Components to Build First

Build these shared components before any page. Every page uses them.

1. `Button` — primary, ghost, danger, with loading state
2. `Input` — text, number, with label and error
3. `Badge` — LOW, OK, INACTIVE, MANAGER, EMPLOYEE
4. `Card` — base card wrapper with border and background
5. `Modal` — with backdrop, focus trap, close on Escape
6. `Toast` — success, error, info — slide in from top-right
7. `Spinner` — inline and full-page
8. `EmptyState` — icon + title + message + optional button
9. `ConfirmDialog` — "Are you sure?" with Cancel + Confirm
10. `CollapsibleSection` — used for category blocks and supplier groups
11. `NumberInput` — large, mono, mobile-optimized, min 0
12. `StatCard` — icon + big number + label + optional colored border

---

