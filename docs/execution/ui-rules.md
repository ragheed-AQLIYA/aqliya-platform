# AuditOS — UI Rules

## Design Philosophy

**Enterprise-grade. Calm. Clean.**

AuditOS is a professional financial tool. The UI must convey trust, precision, and clarity. It is not a consumer SaaS product.

## Rules

### 1. No Generic SaaS Clutter

- No animated gradients, floating shapes, or decorative backgrounds
- No gamification elements (badges, streaks, points)
- No social proof widgets (user counts, testimonials on product pages)
- No marketing banners inside the product interface
- No notification dots without substantive alerts

### 2. No Fake Metrics

- Do not display metrics that are not backed by real data
- Do not show placeholder charts with random data
- Do not display "AI confidence scores" without a defined calculation method
- Do not show progress bars without actual progress tracking
- If data is not available, show "Pending" or "Not yet calculated" — not fake numbers

### 3. No Unsupported AI Claims

- Do not claim AI "verified" or "validated" anything
- AI output must always be labeled as "Draft" or "AI-assisted draft"
- Do not use language like "AI confirms" or "AI guarantees"
- Use language like "AI suggests" or "AI-generated draft — requires review"

### 4. Bilingual-Ready

- All user-facing text must support Arabic (RTL) and English (LTR)
- Layout must not break when switching between LTR and RTL
- Font choices must support Arabic script
- Date formats must support both Gregorian and Hijri (if applicable)
- Number formats must support both Western and Arabic-Indic numerals (if applicable)

### 5. Audit Trust Language

Use precise, professional language throughout:

| Avoid | Use |
|-------|-----|
| "AI checked this" | "AI-assisted draft — requires human review" |
| "Verified" | "Reviewed" |
| "Correct" | "Consistent with source data" |
| "Error" | "Observation" or "Finding" |
| "Done" | "Approved" |
| "Smart" | "Assistive" |

### 6. Clear State Indicators

Every significant item must have a clear state:

| State | Meaning | Visual |
|-------|---------|--------|
| **Draft** | AI-generated or user-created, not yet reviewed | Neutral/gray indicator |
| **Reviewed** | Human has reviewed, may have observations | Blue indicator |
| **Approved** | Human has approved, ready for publication | Green indicator |

- State must be visible on financial statements, notes, evidence, and findings
- State transitions must be logged in the audit trail
- State cannot be changed by AI — only by human action

### 7. Color System

- Use a restrained, professional color palette
- Primary: neutral dark tones for text and borders
- Accent: single brand color for interactive elements
- Status colors: gray (Draft), blue (Reviewed), green (Approved), amber (Observation), red (Finding)
- No bright or saturated colors except for status indicators

### 8. Typography

- Use system fonts or a single professional font family
- Clear hierarchy: heading, subheading, body, caption
- Monospace font for account codes, amounts, and technical identifiers
- Sufficient line height for readability (minimum 1.5 for body text)

### 9. Data Tables

- Financial data must be presented in clear, structured tables
- Column headers must be fixed/sticky on scroll
- Amounts must be right-aligned with consistent decimal places
- Account codes must be left-aligned
- Negative amounts must be shown in parentheses or with a minus sign (consistent throughout)
- Totals must be visually distinct (bold line or background)

### 10. Forms and Inputs

- Clear labels above inputs (not placeholder-only)
- Required fields must be marked
- Validation errors must be inline and specific
- No auto-submit without confirmation for destructive actions
- Confirmation dialog for approval actions

### 11. Navigation

- Clear breadcrumb navigation within engagements
- Engagement selector must be visible and accessible
- No hidden or hamburger navigation on desktop
- Mobile navigation must be functional and clear

### 12. Loading States

- Show loading indicators for data fetching
- Do not block the entire UI for partial data loads
- Show skeleton loaders for table content
- Show spinner for form submissions

### 13. Error States

- Show clear, actionable error messages
- Do not expose stack traces or technical details to users
- Provide guidance on how to resolve the error
- Log technical errors to the audit trail (not displayed to user)
