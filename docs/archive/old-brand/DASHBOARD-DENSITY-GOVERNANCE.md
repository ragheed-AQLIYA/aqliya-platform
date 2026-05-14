# AQLIYA — Dashboard Density Governance

**Version:** 1.0  
**Date:** May 2026  
**Purpose:** Define rules for information density, spacing, and visual hierarchy across the AQLIYA enterprise platform.

---

## PRINCIPLES

1. **Density over whitespace** — Enterprise users need information density. Prefer structured compactness over sparse minimalism.
2. **Hierarchy through typography** — Use font size, weight, and color to establish hierarchy, not just spacing.
3. **Consistent spacing scale** — All spacing uses the 4px grid system.
4. **Module consistency** — All modules follow the same density rules.
5. **Arabic-first** — RTL layout is the default. LTR is secondary.

---

## SPACING RULES

### Page Level
```
Page padding:     24px (mobile) → 32px (desktop)
Section gap:      24px between sections
Section margin:   0 (sections stack directly)
```

### Dashboard Level
```
KPI grid gap:     16px
Card gap:         16px
Card padding:     20px (EnterpriseCard)
Card header:      16px 20px
Card content:     16px 20px
Card footer:      12px 20px
```

### Component Level
```
KPI card padding: 20px
KPI label gap:    8px
KPI value gap:    4px
KPI change gap:   4px

Table row height: 48px (h-12)
Table header:     40px (h-10)
Table cell:       16px horizontal padding

Badge padding:    4px 10px (md)
Badge gap:        6px

Button gap:       6px (default)
Button padding:   10px (default)
```

---

## TABLE DENSITY

### Standard Table
```
Row height:       48px
Header height:    40px
Cell padding:     16px horizontal
Font size:        14px (body)
Header font:      12px, uppercase, semibold
```

### Compact Table (for dense data)
```
Row height:       40px
Header height:    32px
Cell padding:     12px horizontal
Font size:        13px
Header font:      11px, uppercase, semibold
```

### Financial Table
```
Row height:       44px
Cell padding:     12px horizontal
Font:             Monospace for numbers (tabular-nums)
Alignment:        Right for numbers, left for labels
Border:           Subtle (border-b, not full grid)
```

---

## CARD HIERARCHY

### Level 1: Page Container
```
Background:       Page background (--background)
Padding:          24-32px
Border:           None
```

### Level 2: Section
```
Background:       Transparent
Padding:          0
Border:           None
Gap from above:   24px
```

### Level 3: Card
```
Background:       Card (--card)
Padding:          20px
Border:           1px solid --border
Border-radius:    8px (--radius-lg)
Shadow:           None (flat by default)
Hover:            Subtle shadow on interactive cards
```

### Level 4: Card Content
```
Header:           Border-bottom, 16px padding
Content:          16px padding
Footer:           Background --muted/50, border-top, 12px padding
```

---

## EXECUTIVE READABILITY

### KPI Cards
```
Label:            12px, uppercase, tracking-wider, muted
Value:            32px (2rem), bold, tabular-nums
Change:           14px, medium, colored
Icon:             16px, muted
```

### Section Headers
```
Eyebrow:          12px, uppercase, tracking-wider, muted, with dot
Title:            18px (text-lg), semibold
Description:      14px, muted
Action:           Right-aligned
```

### Data Tables
```
Header:           12px, uppercase, semibold, muted
Cell:             14px, regular
Numbers:          Monospace, tabular-nums, right-aligned
Status:           Badge, 10-12px
```

### AI Insights
```
Card border:      3px left, cyan
Title:            14px, semibold, cyan
Content:          14px, foreground/80
Confidence:       Monospace, colored by level
```

---

## RESPONSIVE BREAKPOINTS

### Mobile (<768px)
```
Page padding:     16px
KPI grid:         1 column
Card grid:        1 column
Table:            Horizontal scroll
Sidebar:          Hidden (hamburger menu)
Header:           Compact (logo + title only)
```

### Tablet (768px - 1024px)
```
Page padding:     24px
KPI grid:         2 columns
Card grid:        2 columns
Table:            Full width
Sidebar:          Collapsed (icon-only)
Header:           Full
```

### Desktop (>1024px)
```
Page padding:     32px
KPI grid:         4 columns
Card grid:        3 columns
Table:            Full width
Sidebar:          Expanded
Header:           Full
```

### Large Desktop (>1280px)
```
Page padding:     32px (max-width container)
KPI grid:         4 columns
Card grid:        3-4 columns
Table:            Full width
```

---

## ARABIC/ENGLISH READINESS

### Font Sizes
```
Arabic text may appear slightly larger at the same px size.
No adjustment needed — Noto Sans Arabic is optimized.
```

### Spacing
```
RTL layouts use logical properties (start/end, not left/right).
All components support RTL natively.
```

### Line Heights
```
Arabic:           1.6 (slightly more than English 1.5)
English:          1.5
```

### Word Breaks
```
Arabic:           Normal word breaking
English:          Break-words for long technical terms
```

---

## VISUAL HIERARCHY RULES

### Color Weight
```
Primary (most):   --foreground (#111827) — Headlines, key data
Secondary:        --muted-foreground (#6B7280) — Labels, descriptions
Tertiary:         --muted — Backgrounds, dividers
Accent:           Module colors — Actions, highlights
Status:           Success/Warning/Error — State indicators
```

### Typography Weight
```
Bold (700):       KPI values, page titles
Semibold (600):   Section titles, card titles, table headers
Medium (500):     Labels, badges, buttons
Regular (400):    Body text, descriptions
```

### Size Hierarchy
```
Display:          48.8px — Hero only
H1:               39px — Page titles
H2:               31.2px — Section headers
H3:               25px — Sub-sections
H4:               20px — Card titles
Body:             16px — Standard text
Small:            14px — Secondary text
Caption:          12px — Labels, metadata
```

---

## DO's AND DON'Ts

### DO
- Use the spacing scale (4px multiples)
- Use tabular-nums for all financial data
- Use uppercase + tracking-wider for labels
- Use module accent borders for context
- Use AI indicators sparingly (1-2 per page)
- Use status badges for state, not color alone
- Keep cards flat (no shadow by default)
- Use hover shadows only for interactive cards

### DON'T
- Add arbitrary spacing values
- Use color as the only state indicator
- Stack more than 4 KPI cards in a row
- Use shadows on non-interactive cards
- Add decorative elements without purpose
- Use gradients on cards (only on hero/AI)
- Mix module accent colors on the same card
- Use more than 2 AI indicators per section

---

## MODULE-SPECIFIC DENSITY

### AuditOS
```
Primary focus:    Evidence and findings tables
Table density:    Standard (48px rows)
KPI emphasis:     Open findings, pending reviews
AI usage:         Evidence suggestions, risk flags
```

### SalesOS
```
Primary focus:    Pipeline cards and deal lists
Table density:    Compact (40px rows) for deal lists
KPI emphasis:     Pipeline value, win rate
AI usage:         Pipeline analysis, follow-up urgency
```

### DecisionOS
```
Primary focus:    Decision cards and workflow progress
Table density:    Standard (48px rows)
KPI emphasis:     Approval rate, completion
AI usage:         Decision readiness, confidence scores
```

---

*This document is a living specification. Update as the platform evolves.*
