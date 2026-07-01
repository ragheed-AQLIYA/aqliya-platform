---
title: AuditOS MVP — UI/UX Specification
document_id: UX.001
status: Draft
owner: Design + Engineering
version: 0.1
last_updated: 2026-05-08
supersedes: PRD.001 (§6 screens), ARCH.001 (§23–24 API/state)
---

# AuditOS MVP UI/UX Specification

> **Golden rule encoded:** AI assists. Humans decide. Evidence governs.
> **UX corollary:** Every screen must make the evidence chain visible and the human decision point unambiguous.

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [Screen Inventory](#2-screen-inventory)
3. [Layout Components](#3-layout-components)
4. [Interaction Patterns](#4-interaction-patterns)
5. [Visual Design Language](#5-visual-design-language)

---

## 1. Information Architecture

### 1.1 Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  App Shell (Main Layout)                                        │
│  ┌─────────┬────────────────────────────────────────────────┐  │
│  │         │  Top Bar (org context, user menu, breadcrumbs)  │  │
│  │  Side   ├────────────────────────────────────────────────┤  │
│  │  Bar    │                                                │  │
│  │         │  <Page Content>                                │  │
│  │  • Dash │                                                │  │
│  │  • Eng  │                                                │  │
│  │  • Org  │                                                │  │
│  │  • Set  │                                                │  │
│  └─────────┴────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Main Navigation (Sidebar)

| Item | Icon | Route | Roles |
|------|------|-------|-------|
| Dashboard | `LayoutDashboard` | `/` | All |
| Engagements | `Briefcase` | `/engagements` | All |
| Review Queue | `ClipboardCheck` | `/review-queue` | Reviewer, Manager, Partner |
| Organizations | `Building2` | `/organizations` | Admin, Partner |
| Settings | `Settings` | `/settings` | Admin |

### 1.3 Engagement Workspace Tabs

Each engagement opens a workspace with these tabs, matching the workflow stages:

| # | Tab | Route Segment | Workflow Phase | Primary Role |
|---|-----|--------------|----------------|--------------|
| 1 | Overview | `overview` | All | All |
| 2 | Trial Balance | `trial-balance` | DataIntake | Operator |
| 3 | Account Mapping | `mapping` | DataIntake | Operator |
| 4 | Validation | `validation` | DataIntake → EvidenceCollection | Operator/Reviewer |
| 5 | Financial Statements | `statements` | EvidenceCollection → Review | Reviewer |
| 6 | Disclosure Notes | `notes` | EvidenceCollection → Review | Reviewer |
| 7 | Evidence Store | `evidence` | EvidenceCollection | All |
| 8 | Findings | `findings` | Review → FindingsDrafting | Reviewer |
| 9 | Recommendations | `recommendations` | FindingsDrafting → Approval | Reviewer |
| 10 | Approval | `approval` | Approval | Manager/Partner |
| 11 | Publication | `publication` | Publication | Partner |
| 12 | Audit Trail | `audit-trail` | All | All |

**Tab visibility** is role-dependent and state-dependent. Locked tabs (workflow has not reached that stage) appear as disabled with a lock icon and tooltip explaining the prerequisite.

### 1.4 Hierarchy Flow

```
Dashboard (Engagement List)
  └─ Engagement Workspace
       ├─ Overview          (read-only summary of all tabs)
       ├─ Trial Balance     (upload + table)
       ├─ Account Mapping   (suggestions → confirm)
       ├─ Validation        (checks → flags)
       ├─ Financial Stmts   (draft statements)
       ├─ Disclosure Notes  (note inventory)
       ├─ Evidence Store    (files + links)
       ├─ Findings          (signals → finding lifecycle)
       ├─ Recommendations   (AI draft → human finalize)
       ├─ Approval          (checklist → sign-off)
       ├─ Publication       (export package)
       └─ Audit Trail       (event log)
```

---

## 2. Screen Inventory

### 2.1 Login / Auth

**Screen name:** Login

**Purpose:** Authenticate user and establish session for tenant-scoped access.

**Primary users:** All roles (Operator, Reviewer, Manager, Partner, Admin)

**Key actions:**
- Enter email + password
- Submit credentials
- View login errors (invalid credentials, account locked, tenant inactive)
- (Post-MVP: SSO, MFA)

**Required data:**
- Email input field
- Password input field (with show/hide toggle)
- "Remember me" checkbox
- Submit button
- Error message area
- Link to support for account issues

**State dependencies:** None (public route)

**Layout:**
```
┌─────────────────────────────────────┐
│  Centered card, max-w-sm            │
│  ┌───────────────────────────────┐  │
│  │  AQLIYA logo + mark           │  │
│  │  "AuditOS" tagline            │  │
│  │                               │  │
│  │  Email input                  │  │
│  │  Password input               │  │
│  │                               │  │
│  │  [Sign In] (primary button)   │  │
│  │                               │  │
│  │  Need help? link              │  │
│  └───────────────────────────────┘  │
│                                     │
│  Footer: "© AQLIYA — Mind the Future"│
└─────────────────────────────────────┘
```

**States:**
- **Idle:** Form ready for input
- **Loading:** Button shows spinner, inputs disabled
- **Error:** Inline error message below form, field-level validation on blur
- **Success:** Redirect to dashboard

---

### 2.2 Dashboard (Engagement List)

**Screen name:** Dashboard

**Purpose:** Central hub showing all engagements for the user's organization with status overview, key metrics, and quick actions.

**Primary users:** All roles

**Key actions:**
- View engagement list with status, client, period
- Create new engagement (Admin, Partner)
- Click engagement row to enter workspace
- Filter by status, client, date
- Search engagements
- View summary counts (open issues, pending reviews, publication readiness)

**Required data:**
- Engagement cards/table: client name, fiscal period, engagement type, status, progress %, assigned team, last activity
- Summary bar: total engagements, active engagements, pending reviews, ready for publication
- Status badge for each engagement

**State dependencies:** None (always available)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Top bar: "Engagements" | [New Engagement] btn (role-gated) │
├─────────────────────────────────────────────────────────────┤
│  Summary Cards (4 stat cards in a row)                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │Total │ │Active│ │Pending│ │Ready │                     │
│  │Eng.  │ │Eng.  │ │Review │ │Pub.  │                     │
│  │ 12   │ │  8   │ │  3    │ │  2   │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
├─────────────────────────────────────────────────────────────┤
│  Search + Filter bar                                        │
│  [Search...______] [Status ▼] [Client ▼] [Date ▼]          │
├─────────────────────────────────────────────────────────────┤
│  Engagement Table                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Client    │ Period  │ Status    │ Progress │ Team    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Acme Corp │ FY2025  │ DataIntake│ ████░░ 60%│ J, A.. │  │
│  │ Beta Ltd  │ FY2025  │ Review    │ ██████ 85%│ S, M.. │  │
│  │ ...       │         │           │          │        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**States:**
- **Loading:** Skeleton rows for table, shimmer for stat cards
- **Empty:** Illustration + "Create your first engagement" CTA
- **Error:** Error banner with retry button
- **Populated:** Table with data, pagination if >20 items

---

### 2.3 Engagement Workspace — Overview Tab

**Screen name:** Engagement Overview

**Purpose:** At-a-glance summary of engagement progress, recent activity, and key alerts across all tabs.

**Primary users:** All roles (especially Manager/Partner for status checks)

**Key actions:**
- View workflow progress bar (phases completed vs remaining)
- View recent activity timeline (last 10 events)
- View alert summary (unresolved flags, missing evidence count, unmapped accounts)
- Navigate to blocked/pending tab via alert links
- View engagement metadata (client, period, type, team, governance rules)

**Required data:**
- Engagement metadata header: client name, fiscal period, engagement type, status badge
- Workflow progress: horizontal step indicator with current phase highlighted
- Alert banner (if any blocking issues): color-coded by severity
- Recent activity: reverse-chronological list of audit events
- Quick stats: accounts mapped %, evidence files, findings, recommendations
- Team members assigned

**State dependencies:** Requires active engagement (engagement_id in route)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Engagements > Acme Corp FY2025                 │
├─────────────────────────────────────────────────────────────┤
│  Engagement Header                                          │
│  Acme Corp | FY2025 | Full Audit | [In Review] badge       │
│  Team: John S (Manager), Alice T (Reviewer)...              │
├─────────────────────────────────────────────────────────────┤
│  Workflow Progress (horizontal stepper)                     │
│  ●━━━●━━━●━━━○━━━○━━━○━━━○                               │
│  Init  Data  Evid  Rev  Find  Appr  Pub                    │
│        Intk  Coll                ov   ish                   │
├─────────────────────────────────────────────────────────────┤
│  [Alert Banner — if blocking]                               │
│  ⚠ 3 accounts unmapped — go to Account Mapping             │
├──────────────────┬──────────────────────────────────────────┤
│  Quick Stats     │  Recent Activity                         │
│                  │                                          │
│  Accounts: 85%   │  • J.Smith uploaded evidence (2m ago)   │
│  Evidence: 12    │  • AI generated 3 signals (5m ago)      │
│  Findings: 3     │  • A.Taylor mapped 15 accounts (1h ago) │
│  Recs: 1         │  • TB uploaded by O.Cooper (3h ago)     │
│  Blockers: 1     │  • Engagement created (1d ago)          │
└──────────────────┴──────────────────────────────────────────┘
```

---

### 2.4 Trial Balance

**Screen name:** Trial Balance

**Purpose:** Upload, parse, and review a client's trial balance file. Validate structure and assess data trust.

**Primary users:** Operator, Reviewer

**Key actions:**
- Upload CSV/XLSX file (drag-and-drop or file picker)
- View parse results in sortable/filterable table
- Map file columns to system fields (if auto-detection fails)
- Confirm trust state acceptance
- Re-upload to replace existing TB
- View parsing errors with line-level detail

**Required data:**
- Upload area (before upload)
- Column mapping preview (if columns need manual mapping)
- Account table: code, name, debit, credit, account type, currency
- Trust state indicator: trusted (green), conditional (yellow), blocked (red)
- Parse summary: total accounts, total debits, total credits, difference
- Error rows display (if any parse failures)

**State dependencies:** Requires DataIntake or later engagement state

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Engagements > Acme > Trial Balance             │
├─────────────────────────────────────────────────────────────┤
│  Upload Section (collapsible after upload)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Drop zone or click to upload] CSV, XLSX up to 50MB│   │
│  │  Currently: tb_acme_fy2025.xlsx (2.3MB) [Replace]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Trust State Banner                                         │
│  [✅ Trusted] All checks passed — data ready for mapping    │
│  [⚠ Conditional] 3 warnings detected — review details below│
│  [❌ Blocked] Trial balance unbalanced — fix and re-upload  │
├─────────────────────────────────────────────────────────────┤
│  Summary Bar                                                │
│  Accounts: 245 | Total Debits: $1,245,000 | Credits: $1,245,000│
├─────────────────────────────────────────────────────────────┤
│  Account Table (paginated, 25 rows/page)                    │
│  ┌──────┬──────────────┬────────┬────────┬────────┬────┐   │
│  │ Code │ Name         │ Debit  │ Credit │ Type   │Cur │   │
│  ├──────┼──────────────┼────────┼────────┼────────┼────┤   │
│  │ 1000 │ Cash         │ 50,000 │ —      │ Debit  │USD │   │
│  │ 2000 │ AP           │ —      │ 30,000 │ Credit │USD │   │
│  │ ...  │              │        │        │        │    │   │
│  └──────┴──────────────┴────────┴────────┴────────┴────┘   │
│  [1][2][3]...[10]  [Rows per page: 25 ▼]                   │
└─────────────────────────────────────────────────────────────┘
```

**States:**
- **No upload:** Drop zone prominent, empty state
- **Uploading:** Progress bar with filename, cancel option
- **Parsing:** Spinner, "Analyzing file..."
- **Parse error:** Red banner with specific column/line errors
- **Validated:** Table shown, trust banner visible
- **Re-upload:** Previous data replaced, warning about downstream impact

---

### 2.5 Account Mapping

**Screen name:** Account Mapping

**Purpose:** Map client chart of accounts to the canonical financial model. AI suggests mappings; operator confirms or overrides.

**Primary users:** Operator (confirm mappings), Reviewer (review unmapped)

**Key actions:**
- View all accounts with their mapping status
- Accept AI-suggested mapping (single click)
- Select alternative canonical account from dropdown
- Manually map unmapped accounts (search canonical accounts)
- Skip unmapped account (blocked — must resolve before progressing)
- Confirm all mappings (batch action when all resolved)
- View mapping suggestions with confidence score

**Required data:**
- Account list: code, name, current mapping status, AI suggestion (if any)
- For each account: suggested canonical account with confidence %, alternative suggestions
- Mapping summary: mapped / total / unmapped / ambiguous counts
- Canonical account hierarchy browser (searchable)

**State dependencies:** Trial balance must be uploaded and parsed

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Mapping Progress: ████████░░ 85% (208/245 mapped)         │
│  [Confirm All Mappings] — enabled when 100%                │
├─────────────────────────────────────────────────────────────┤
│  Filters: [All ▼] [Unmapped] [AI Suggested] [Manual]      │
│  Search: [_________________________]                       │
├─────────────────────────────────────────────────────────────┤
│  Account Mapping Table                                     │
│  ┌──────┬─────────┬──────────────────┬────────┬─────────┐  │
│  │ Code │ Name    │ Canonical        │ Method │ Action  │  │
│  ├──────┼─────────┼──────────────────┼────────┼─────────┤  │
│  │ 1000 │ Cash    │ Cash & Equiv.    │ AI 92% │ [✓] [✎] │  │
│  │ 1200 │ AR      │ Trade Rec.       │ Manual │ [✎]     │  │
│  │ 2100 │ Loans   │ — unmapped —     │ —      │ [Map ▶] │  │
│  │  ... │         │                  │        │         │  │
│  └──────┴─────────┴──────────────────┴────────┴─────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Side panel (opens on [Map ▶] or [✎])                      │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Account: 2100 — Short-term Loans                 │       │
│  │                                                   │       │
│  │  AI Suggestions:                                  │       │
│  │  ○ [92%] Short-term Borrowings [Accept]           │       │
│  │  ○ [67%] Long-term Borrowings  [Accept]           │       │
│  │                                                   │       │
│  │  Search Canonical: [________________]             │       │
│  │  ┌─ Assets                                       │       │
│  │  │ ├─ Current Assets                             │       │
│  │  │ │ ├─ Cash & Cash Equivalents                  │       │
│  │  │ │ ├─ Trade Receivables                        │       │
│  │  │ │ ├─ Short-term Borrowings ◄── selected       │       │
│  │  │ │ └─ ...                                      │       │
│  │  └─ ...                                         │       │
│  │                                                   │       │
│  │  [Cancel] [Apply Mapping]                         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**Interaction details:**
- AI suggestions shown as cards within the side panel, ranked by confidence
- Accepting a suggestion creates the mapping immediately (no side panel needed for quick accept)
- Inline action column has: accept checkmark (if AI suggestion exists), edit pencil (opens panel), map button (when unmapped)
- Confidence bar rendered as a thin colored bar: green >80%, yellow 50-80%, red <50%
- Ambiguous mappings (AI confidence <50% or multiple close matches) highlighted with a warning icon

**States:**
- **Loading:** Skeleton rows
- **Empty:** No TB uploaded yet — CTA to upload
- **All mapped:** Green success banner, "Confirm All" active
- **Blocked:** Red banner "X accounts unmapped — cannot proceed"
- **Partial:** Yellow banner with remaining count

---

### 2.6 Validation

**Screen name:** Validation

**Purpose:** Run and review data quality checks: balance validation, missing mappings, unusual balances, negative balances, classification conflicts, trust state assessment.

**Primary users:** Operator, Reviewer

**Key actions:**
- Run all validations (or re-run after changes)
- View each validation check result (pass/fail/warning)
- Disposition anomaly flags (acknowledge, investigate, dismiss)
- View trust state determination
- View validation detail for individual accounts
- Acknowledge warnings to proceed

**Required data:**
- Validation check list with status per check
- For each check: name, status, affected accounts count, details
- Anomaly flags table: account, flag type, severity, description, disposition
- Trust state: current assessment and contributing factors
- Run history: past validation runs with timestamps and result summary

**State dependencies:** Accounts must be mapped; runs available from DataIntake onward

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Run Validations] button (disabled if no changes)         │
│  Last run: 2 minutes ago by System (auto)                  │
├─────────────────────────────────────────────────────────────┤
│  Trust State Banner                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [✅ Trusted / ⚠ Conditional / ❌ Blocked]           │  │
│  │  Explanation: 2 warnings accepted, all critical pass │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Validation Checks (card list)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Balance Equality          245 accounts, balanced  │  │
│  │    Total Debits: $1,245,000 = Total Credits: $1,245,000│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Classification            All 245 accounts typed  │  │
│  │    ✓ 240 correctly classified                        │  │
│  │    ⚠ 5 classification conflicts [View]               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠ Unusual Balances          3 accounts flagged      │  │
│  │    • 2100 Loans: $2M vs expected $200-500K range    │  │
│  │    • ...                                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Negative Balances         No negative balances   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Anomaly Flags Table                                       │
│  ┌──────┬──────────────┬──────────┬──────────┬──────────┐  │
│  │Account│ Flag Type    │ Severity │ Desc.    │ Dispos.  │  │
│  ├──────┼──────────────┼──────────┼──────────┼──────────┤  │
│  │ 2100 │ Range        │ Medium   │ Bal $2M..│ [ ▼ ]   │  │
│  │ 5100 │ Class. Conflict│ High   │ DR vs CR │ [ ▼ ]   │  │
│  │  ... │              │          │          │          │  │
│  └──────┴──────────────┴──────────┴──────────┴──────────┘  │
│  Disposition dropdown: [Acknowledge] [Investigate] [Dismiss]│
└─────────────────────────────────────────────────────────────┘
```

**Validation check card pattern:**
- Icon: green check, yellow warning, red X
- Summary line with count
- Expandable detail section (click to reveal per-account breakdown)
- "View" link opens drawer with full detail

---

### 2.7 Draft Financial Statements

**Screen name:** Financial Statements

**Purpose:** View AI-drafted financial statements (SFP, P&L, SOCE, Cash Flow) based on mapped and validated account data.

**Primary users:** Reviewer, Manager

**Key actions:**
- Switch between statement types (SFP, P&L, SOCE, Cash Flow)
- Review AI-drafted figures (read-only until review stage)
- Flag statement items for follow-up (creates a finding)
- View evidence links per line item
- Export draft to PDF (placeholder — post-MVP full export)

**Required data:**
- Statement type tabs
- Statement of Financial Position: assets, liabilities, equity sections with line items and totals
- P&L: revenue, COGS, operating expenses, finance costs, tax, net income
- SOCE: opening balance, changes, closing balance per equity component
- Cash Flow placeholder: operating, investing, financing sections (MVP may show placeholder message)
- AI draft indicator with model version and confidence
- Each line item shows: source accounts, mapped canonical accounts, computed figure

**State dependencies:** Requires account mapping complete, validation run

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Statement Type Tabs: [SFP] [P&L] [SOCE] [Cash Flow]       │
├─────────────────────────────────────────────────────────────┤
│  AI Draft Indicator                                         │
│  ⚡ AI-drafted statement | Model: gpt-4.0 | Confidence: 94%│
│  ℹ Review and verify all figures before use                │
├─────────────────────────────────────────────────────────────┤
│  Statement of Financial Position                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Acme Corp — Statement of Financial Position         │  │
│  │  As at 31 December 2025                              │  │
│  │                                                      │  │
│  │  ASSETS                                   $          │  │
│  │  Current Assets                                     │  │
│  │    Cash & Cash Equivalents          50,000  [i] [🔗]│  │
│  │    Trade Receivables               120,000  [i] [🔗]│  │
│  │    Inventories                     200,000  [i] [🔗]│  │
│  │    Total Current Assets            370,000          │  │
│  │                                                      │  │
│  │  Non-Current Assets                                 │  │
│  │    Property, Plant & Equipment     800,000  [i] [🔗]│  │
│  │    Intangible Assets               100,000  [i] [🔗]│  │
│  │    Total Non-Current Assets        900,000          │  │
│  │                                                      │  │
│  │  TOTAL ASSETS                    1,270,000          │  │
│  │  ... (liabilities, equity sections)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Cash Flow: [Placeholder — full draft coming post-MVP]     │
│  Cash flow statement generation requires period-over-period│
│  data and is planned for a future release.                  │
└─────────────────────────────────────────────────────────────┘
```

**Line item interaction:**
- `[i]` icon opens tooltip showing: source account codes, mapping confidence, validation status
- `[🔗]` icon opens evidence drawer showing linked evidence for that line item
- Clicking a figure or line text selects it, enabling "Create Finding" from context menu

---

### 2.8 Disclosure Notes

**Screen name:** Disclosure Notes

**Purpose:** Inventory of disclosure notes required by the reporting framework, with AI-drafted content and missing info flags.

**Primary users:** Reviewer, Manager

**Key actions:**
- View list of required disclosure notes (per reporting framework)
- Expand note to view AI-drafted content
- Mark note as reviewed
- Flag missing information within a note
- Request additional evidence for a note
- Override/accept AI draft content

**Required data:**
- Note list: note title, required by (framework reference), status (draft/reviewed/complete), AI indicator
- Note content: AI-drafted text with citations, evidence links
- Missing info flags: items within the note that lack substantiation
- Framework requirement reference

**State dependencies:** Account mapping complete, validation run

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Notes Progress: ████████░░ 6/14 reviewed                  │
│  Framework: IFRS 2024                                      │
├─────────────────────────────────────────────────────────────┤
│  Note List (accordion)                                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ 1. General Information                    [Draft]  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ 2. Accounting Policies                   [Draft]   │  │
│  │    ⚠ 3 missing policy disclosures                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▼ 3. Property, Plant & Equipment           [Review]  │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ [AI Draft] Model: gpt-4.0 | Conf: 91%       │    │  │
│  │  │                                               │    │  │
│  │  │ The group's property, plant and equipment... │    │  │
│  │  │ ...                                          │    │  │
│  │  │                                               │    │  │
│  │  │ Evidence cited: [ev-001] PPE Schedule.pdf    │    │  │
│  │  │              [ev-002] Depreciation calc.xlsx  │    │  │
│  │  │                                               │    │  │
│  │  │ Missing: Disclosure of useful lives [🔗]     │    │  │
│  │  │ Missing: Depreciation method disclosure [🔗] │    │  │
│  │  │                                               │    │  │
│  │  │ [Mark Reviewed] [Request Evidence] [Override] │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ 4. Revenue Recognition                   [Draft]   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.9 Evidence Store

**Screen name:** Evidence Store

**Purpose:** Central repository for all uploaded evidence files, with linking to accounts and findings, lifecycle status, and missing evidence requests.

**Primary users:** Operator (upload), Reviewer (verify), All (view)

**Key actions:**
- Upload evidence files (drag-and-drop, multiple files)
- View evidence list with status, type, upload info
- Link evidence to accounts and findings
- Verify evidence (reviewer action)
- Request additional evidence
- Preview supported file types (PDF, image)
- Download evidence (presigned URL)
- View evidence state lifecycle

**Required data:**
- Evidence table: filename, type, upload date, uploader, state, linked accounts, linked findings
- Evidence detail panel: file metadata, hash, state history, links
- Upload progress for in-progress uploads
- Missing evidence requests list

**State dependencies:** Available from EvidenceCollection phase onward

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Upload Evidence] button | Filter: [All ▼] [By Account]  │
│  Search: [__________________________]                      │
├─────────────────────────────────────────────────────────────┤
│  Evidence Table                                             │
│  ┌────────┬──────┬──────────┬───────┬───────┬──────────┐  │
│  │ File   │ Type │ Uploaded │ State │ Linked│ Actions  │  │
│  ├────────┼──────┼──────────┼───────┼───────┼──────────┤  │
│  │ inv.pdf│ PDF  │ 2h ago   │ [Ver] │ Accts │ [🔗][▼] │  │
│  │ rec.xls│ XLSX │ 1d ago   │ [Can] │ —     │ [🔗][▼] │  │
│  │ ...    │      │          │       │       │          │  │
│  └────────┴──────┴──────────┴───────┴───────┴──────────┘  │
│                                                             │
│  State badges: [Can] Candidate | [Ver] Verified | [Acc] Accepted│
├─────────────────────────────────────────────────────────────┤
│  Missing Evidence Requests (collapsible section)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠ Evidence needed for account 2100 — Loans        │  │
│  │    Requested by: J.Smith | Priority: High | 2d ago  │  │
│  │    [Upload Evidence] [Dismiss Request]               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Evidence link drawer (slides in from right):**
```
┌─────────────────────────────────────┐
│  Evidence: inv.pdf                   │
│  Status: [Verified]                  │
│  Uploaded: 2h ago by A.Taylor       │
│  Size: 1.2MB | Type: PDF            │
│  Hash: sha256:a1b2...               │
│                                      │
│  Linked to Accounts:                 │
│    • 1200 — Trade Receivables       │
│    • 1300 — Inventory (via link)    │
│                                      │
│  Linked to Findings:                 │
│    • FND-003 — Inventory valuation  │
│                                      │
│  [Download] [Copy Link] [Preview]    │
│                                      │
│  State History:                      │
│  Candidate → Verified (A.Taylor)     │
│  (2h ago)                            │
└─────────────────────────────────────┘
```

---

### 2.10 Findings

**Screen name:** Findings

**Purpose:** Create, review, and manage audit findings. Findings are signals that have been triaged into actionable audit items with evidence links.

**Primary users:** Reviewer (create/edit), Manager (review), Partner (approve)

**Key actions:**
- Create new finding (from signal or manually)
- View finding list with severity, status, type
- Edit finding details (description, type, risk, materiality)
- Link evidence to finding
- Submit finding for review (Draft → ReviewReady)
- Withdraw finding
- View signal-to-finding trace

**Required data:**
- Finding list: ID, title, type, severity, status, linked accounts, linked evidence, creator, date
- Finding detail: description, type, materiality level, risk rating, evidence links, account links, signal link, state history
- AI-generated finding language (shown as suggestion card)
- Signal source information (if created from signal)

**State dependencies:** Evidence Collection phase active or later

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [New Finding] button | Filter: [All ▼] [Draft] [Review]  │
│  Sort: [Risk ▼] [Date ▼]                                   │
├─────────────────────────────────────────────────────────────┤
│  Finding Cards (list or grid)                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [High] [Material] FND-001: Inventory Valuation      │  │
│  │  Risk: Critical | Status: Draft | Created: 1h ago    │  │
│  │  │                                                     │  │
│  │  AI-suggested finding: Inventory valuation may be     │  │
│  │  misstated due to outdated cost assumptions...        │  │
│  │  [Accept Suggestion] [Edit] [Link Evidence] [Submit]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Medium] [Control] FND-002: Segregation of Duties   │  │
│  │  Risk: High | Status: ReviewReady | 2 accounts       │  │
│  │  Evidence: 3 files linked                             │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  AI Suggestions Panel (collapsible right panel)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI-Generated Finding Suggestions                    │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ ⚡ Unusual balance in account 2100            │   │  │
│  │  │ Confidence: 87%  |  Signal: Range anomaly    │   │  │
│  │  │ [Create Finding] [Dismiss]                   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ ⚡ Evidence gap: 3 accounts no evidence       │   │  │
│  │  │ Confidence: 94%                              │   │  │
│  │  │ [Create Finding] [Dismiss]                   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Create/Edit Finding Dialog:**
```
┌──────────────────────────────────────────────────────┐
│  [Edit Finding] FND-001                              │
│                                                      │
│  Finding Type: [Material Misstatement ▼]            │
│  Title: [Inventory Valuation                    ]   │
│                                                      │
│  Description:                                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ [AI Drafted] Inventory may be misstated...   │  │
│  │ [Accept] [Edit] [Discard]                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  Risk Rating: [Critical ▼]                          │
│  Materiality: [Material ▼]                          │
│                                                      │
│  Linked Accounts: [1200] [1300] [+ Add Account]    │
│  Linked Evidence: [ev-001] [ev-003] [+ Add Evidence]│
│                                                      │
│  Signal Source: SIG-001 (Range Anomaly)             │
│                                                      │
│  [Cancel] [Save Draft] [Submit for Review]          │
└──────────────────────────────────────────────────────┘
```

---

### 2.11 Recommendations

**Screen name:** Recommendations

**Purpose:** Draft, review, and submit audit recommendations. AI assists with drafting; human finalizes and submits for approval.

**Primary users:** Reviewer (draft), Manager (review), Partner (approve)

**Key actions:**
- Create recommendation from finding
- View AI-drafted recommendation language
- Edit/override AI suggestion
- Link findings and evidence to recommendation
- Submit for approval (Draft → PendingApproval)
- Withdraw/reject recommendation
- View recommendation state

**Required data:**
- Recommendation list: ID, title, linked finding, risk level, status, AI indicator
- Recommendation detail: description, recommended action, impact assessment, deadline, responsible party, evidence trace
- AI suggestion card with model, confidence, edit history
- Findings referenced

**State dependencies:** Findings must exist (Review phase or later)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [New Recommendation] button | Filter: [All] [Draft] [Pending]│
├─────────────────────────────────────────────────────────────┤
│  Recommendation Cards                                        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  REC-001: Revise inventory valuation methodology      │  │
│  │  Linked: FND-001 | Risk: Critical | Status: Draft    │  │
│  │  AI-assisted | Conf: 89%                              │  │
│  │                                                       │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │ [AI Suggestion]                                │   │  │
│  │  │ Management should revise inventory valuation   │   │  │
│  │  │ methodology to reflect current market costs... │   │  │
│  │  │ [Accept] [Edit] [Regenerate] [Discard]         │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  Evidence Trace:                                      │  │
│  │  📄 inv-schedule.pdf → Account 1300 → FND-001 → REC  │  │
│  │                                                       │  │
│  │  [Edit] [Submit for Approval] [Delete Draft]          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  REC-002: Implement segregation of duties             │  │
│  │  Linked: FND-002 | Risk: High | Status: PendingApproval│  │
│  │  Submitted: 1d ago | Awaiting: M. Partner             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**AI suggestion card behavior:**
- Appears at the top of the recommendation detail when AI draft exists
- Marked with distinct AI visual treatment (icon, border color, badge)
- Buttons: Accept (fills the form fields), Edit (opens form with AI text), Regenerate (calls AI again), Discard (removes suggestion)
- When accepted, shows "AI-contributed" badge on the recommendation

---

### 2.12 Review Queue

**Screen name:** Review Queue

**Purpose:** Central queue for reviewers to examine findings, recommendations, and evidence. Prioritized by risk, materiality, and deadline. Supports inline review with approve/return/request-evidence actions.

**Primary users:** Reviewer, Manager, Partner

**Key actions:**
- View prioritized queue (risk: critical first, then high, medium, low)
- View item detail inline (finding, recommendation, or evidence)
- Approve item (move to next workflow stage)
- Return item with revision request
- Request additional evidence
- Add review comments
- Filter by item type, status, account, creator

**Required data:**
- Queue items: type (evidence/finding/rec), title/ID, risk/severity, status, creator, deadline, age in queue
- Item detail panel: full content with evidence links, AI indicators
- Review action buttons: [Approve] [Return] [Request Evidence]
- Comment input with mandatory rationale for Return/Request

**State dependencies:** Items must be in review-ready/pending state

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Review Queue (filtered by current user's authority scope) │
├─────────────────────────────────────────────────────────────┤
│  Filters: [All Types ▼] [Status ▼] [Account ▼] [Creator ▼]│
├──────────────────┬──────────────────────────────────────────┤
│  Queue List      │  Detail Panel (right side)               │
│                  │                                          │
│  ┌──────────────┐│  ┌──────────────────────────────────┐   │
│  │ 🔴 Critical  ││  │  REC-001: Revise inventory       │   │
│  │ REC-001      ││  │  Finding: FND-001                │   │
│  │ Creator: J.S ││  │  Risk: Critical | Mat: Material   │   │
│  │ Age: 2d      ││  │                                   │   │
│  ├──────────────┤│  │  Description:                    │   │
│  │ 🟡 High      ││  │  AI-assisted: Management should  │   │
│  │ FND-002      ││  │  revise inventory valuation...   │   │
│  │ Creator: A.T ││  │                                   │   │
│  │ Age: 1d      ││  │  Evidence:                       │   │
│  ├──────────────┤│  │  📄 inv-schedule.pdf [View]      │   │
│  │ 🟢 Medium   ││  │  📄 cost-analysis.xlsx [View]     │   │
│  │ EVI-005      ││  │                                   │   │
│  │ (Evidence)   ││  │  ┌───────────────────────────┐   │   │
│  │ Creator: O.C ││  │  │ Review Comments:           │   │   │
│  │ Age: 3d      ││  │  │ [________________________]│   │   │
│  ├──────────────┤│  │  └───────────────────────────┘   │   │
│  │ 🟢 Medium   ││  │                                   │   │
│  │ REC-003      ││  │  [Approve] [Return] [Req Evid]   │   │
│  └──────────────┘│  └──────────────────────────────────┘   │
│                  │                                          │
│  Sort by:        │                                          │
│  [Risk ▼]        │                                          │
│  [Materiality ▼] │                                          │
│  [Deadline ▼]    │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

**Review interaction flow:**
1. Click item in queue list → detail panel loads
2. Read full content, view linked evidence inline
3. Enter comment (optional for Approve, required for Return/Request Evidence)
4. Click action button:
   - **Approve:** Item advances to next state (finding → approved, rec → pending final approval)
   - **Return:** Dialog requires return reason — item goes back to drafting
   - **Request Evidence:** Dialog requires description of evidence needed — creates missing evidence request

---

### 2.13 Approval

**Screen name:** Approval

**Purpose:** Final approval checkpoint before publication. Shows approval checklist, blocking issues, and sign-off trail. Only Manager/Partner can approve.

**Primary users:** Manager, Partner

**Key actions:**
- View approval checklist (all conditions required for sign-off)
- Approve recommendation (Accept, Modify with rationale, or Reject with rationale)
- View blocking issues (items preventing approval)
- View sign-off trail (who approved/rejected what and when)
- Request changes before approval

**Required data:**
- Approval checklist items with status (passed/blocked/pending):
  - All accounts mapped
  - Validation passed (no blocking checks)
  - Evidence verified for material accounts
  - All findings review-ready or approved
  - All recommendations reviewed
  - Recommendations match authority tier
- Recommendation summary with full content
- Blocking issues list (red items in checklist)
- Sign-off trail: chronological list of approval actions with approver, action, timestamp

**State dependencies:** Recommendations in PendingApproval state

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Approval: Acme Corp FY2025                                │
├─────────────────────────────────────────────────────────────┤
│  Approval Checklist                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ All accounts mapped (245/245)                    │  │
│  │  ✅ Validation passed — Trusted                      │  │
│  │  ✅ Evidence verified for material accounts (12/12)  │  │
│  │  ✅ All findings review-ready (3/3)                  │  │
│  │  ⏳ Recommendations reviewed (2/3)                   │  │
│  │  ✅ Authority tier matches recommendation risk        │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Blocking Issues                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ❌ 1 recommendation still pending review            │  │
│  │    REC-003: Update revenue recognition policy        │  │
│  │    [Go to Review Queue]                              │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Recommendations Pending Approval                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REC-001: Revise inventory valuation  [Critical]     │  │
│  │  [View] [Approve] [Modify] [Reject]                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REC-002: Segregation of duties       [High]         │  │
│  │  [View] [Approve] [Modify] [Reject]                  │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Sign-off Trail                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  M. Partner — Approved REC-001 (2h ago)              │  │
│  │  J. Manager — Approved REC-002 (1d ago)              │  │
│  │  M. Partner — Rejected REC-003 v1 — "Needs more..."  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Approval action dialog (on clicking [Approve]/[Modify]/[Reject]):**
```
┌──────────────────────────────────────────────────┐
│  Approve Recommendation REC-001                   │
│                                                   │
│  Action: [● Approve] [○ Modify] [○ Reject]       │
│                                                   │
│  Comment (required for Modify/Reject):           │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  Character count: 0/500                          │
│                                                   │
│  [Cancel] [Confirm]                              │
└──────────────────────────────────────────────────┘
```

---

### 2.14 Publication Package

**Screen name:** Publication Package

**Purpose:** Final review and export of all approved content before publishing to client. Shows draft statements, review summary, findings summary, and export controls.

**Primary users:** Partner

**Key actions:**
- View publication readiness status
- Review final draft statements and recommendations
- View findings summary
- Download/export publication package (PDF)
- Publish (makes immutable, generates client-facing access)
- Confirm publication irreversibility

**Required data:**
- Publication readiness checklist (all items green)
- Draft statements (SFP, P&L, SOCE — read-only final version)
- Recommendations summary (all approved)
- Findings summary (all approved)
- Evidence trace summary
- Export/download buttons
- Publish button (with confirmation dialog)

**State dependencies:** All recommendations approved, Engagement in Publication phase

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Publication Package — Acme Corp FY2025                    │
├─────────────────────────────────────────────────────────────┤
│  Readiness: ✅ All checks passed — ready to publish        │
├─────────────────────────────────────────────────────────────┤
│  Package Contents                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📄 Draft Financial Statements (3)                   │  │
│  │     [SFP] [P&L] [SOCE] — final versions              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  📋 Recommendations (2) — approved, ready to publish │  │
│  │     REC-001: Revise inventory valuation              │  │
│  │     REC-002: Segregation of duties                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  🔍 Findings Summary (3) — linked to recommendations │  │
│  │     FND-001: Inventory valuation [Critical]          │  │
│  │     FND-002: Segregation [High]                      │  │
│  │     FND-003: Revenue recognition [Medium]            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  📎 Evidence Referenced (7 files)                    │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  [Download Draft Package (PDF)] [Publish (Irreversible)]   │
└─────────────────────────────────────────────────────────────┘
```

**Publish confirmation dialog:**
```
┌──────────────────────────────────────────────────┐
│  ⚠ Confirm Publication                           │
│                                                   │
│  This action is IRREVERSIBLE.                     │
│                                                   │
│  Once published:                                  │
│  • All content becomes immutable                  │
│  • A client-facing access URL will be generated  │
│  • Evidence references will be frozen             │
│  • The published record cannot be deleted         │
│                                                   │
│  Type "PUBLISH" to confirm:                       │
│  [________________________]                       │
│                                                   │
│  [Cancel] [Confirm Publication]                   │
└──────────────────────────────────────────────────┘
```

---

### 2.15 Audit Trail

**Screen name:** Audit Trail

**Purpose:** Immutable event log showing every state transition and action taken within the engagement.

**Primary users:** All roles (read-only), Partner/Admin (full access)

**Key actions:**
- View chronological event list
- Filter by event type, actor, date range, target type
- Click event to view detail
- Export event log
- Forward/backward trace from an event

**Required data:**
- Event table: timestamp, event type, actor, target type, target ID, action, previous state → new state
- Event detail: full event payload, evidence references, metadata
- Filter controls

**State dependencies:** Always available

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Audit Trail — Acme Corp FY2025                            │
├─────────────────────────────────────────────────────────────┤
│  Filters: [Event Type ▼] [Actor ▼] [Date Range ▼] [Export]│
├─────────────────────────────────────────────────────────────┤
│  Event Timeline (reverse chronological)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [12:34] M.Partner approved REC-001                  │  │
│  │  Recommendation: PendingApproval → Approved          │  │
│  │  Commentary: "Approved as presented. Evidence is..." │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [11:20] AI generated recommendation draft           │  │
│  │  AI Suggestion created for recommendation REC-001    │  │
│  │  Model: gpt-4.0 | Confidence: 89%                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [10:15] J.Smith uploaded evidence                   │  │
│  │  Evidence: inv-schedule.pdf (Candidate → Candidate)  │  │
│  │  File hash: sha256:a1b2c3...                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [09:00] System validated trial balance              │  │
│  │  Validation run: All checks passed | Trust: Trusted  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Load More...                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Layout Components

### 3.1 Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (w-64)       │  Top Bar (h-14)                     │
│                       │  ┌────────┬────────────────────┐  │
│  ┌─────────────────┐  │  │Breadcrumb                 │  │
│  │ Logo + Brand    │  │  │            [User ▼] [Org] │  │
│  ├─────────────────┤  │  └────────────────────────────┘  │
│  │ Navigation      │  ├────────────────────────────────┤  │
│  │ • Dashboard     │  │                                │  │
│  │ • Engagements   │  │        Page Content            │  │
│  │ • Review Queue  │  │                                │  │
│  │ • Organizations │  │                                │  │
│  │ • Settings      │  │                                │  │
│  ├─────────────────┤  │                                │  │
│  │ Role badge      │  │                                │  │
│  └─────────────────┘  │                                │  │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar:**
- Fixed width 256px (w-64), full height
- Background: `--sidebar` (white in light, dark gray in dark mode)
- Logo at top with brand name
- Navigation items with icons, active state highlight
- Active state: `variant="secondary"` (blue-tinted background)
- Collapsible on mobile (hamburger menu in top bar)

**Top Bar:**
- Height 56px (h-14), sticky, border-bottom
- Background: `bg-background/95 backdrop-blur`
- Left: Breadcrumb component
- Right: User menu (avatar, name, role, logout), organization name

### 3.2 Engagement Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Engagement Header                                          │
│  Client Name | Period | Type | [Status Badge]              │
├─────────────────────────────────────────────────────────────┤
│  Tab Navigation (scrollable if overflow)                    │
│  [Overview] [TB] [Map] [Val] [Stmts] [Notes] [Evid]...    │
├─────────────────────────────────────────────────────────────┤
│  Status Bar                                                 │
│  [Workflow Phase Badge] | Issues: 3 | Pending: 2           │
├─────────────────────────────────────────────────────────────┤
│  Alert Banner (conditional)                                 │
│  ⚠ This engagement has 3 blocked items                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  Tab Content                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Status bar:**
- Shows current workflow phase as a badge
- Key counts: open issues, pending items, overdue items
- Changes color (green → yellow → red) based on severity

### 3.3 Table Components

**Standard table pattern** (based on existing `Table` component) with:
- Sortable column headers (click to toggle asc/desc, indicator arrow)
- Filter dropdown per column
- Checkbox column for multi-select (where applicable)
- Actions column with dropdown menu (use `DropdownMenu`)
- Pagination footer with page selector and rows-per-page control
- Empty state: centered icon + message + optional CTA

**Table component props:**
```typescript
interface AuditTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string>) => void;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  pageSize?: number;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}
```

### 3.4 Drawer/Panel for Traceability

**Right slide-out drawer:**
- Slides from right edge, overlays content
- Width: 480px (default), up to 640px for evidence preview
- Header: title, close button
- Body: scrollable content with optional sections
- Footer: action buttons (when applicable)
- Backdrop: semi-transparent overlay, click to close

**Used for:**
- Evidence detail view (§2.9)
- Account mapping side panel (§2.5)
- Review item detail in queue (§2.12)
- Traceability graph view

### 3.5 Status Badges

| Badge | Variant | Usage |
|-------|---------|-------|
| **State badges:** | | |
| Draft | `outline` | Finding/rec in draft |
| ReviewReady | `secondary` | Ready for review |
| InReview | `default` | Currently being reviewed |
| Approved | `default` (green) | Approved item |
| Rejected | `destructive` | Rejected item |
| Published | `default` (blue) | Published output |
| **Trust badges:** | | |
| Trusted | `default` (green bg) | Data trust OK |
| Conditional | `secondary` (yellow) | Warnings accepted |
| Blocked | `destructive` | Cannot proceed |
| **Severity badges:** | | |
| Critical | `destructive` with red dot | Critical risk |
| High | `destructive` (outline) | High risk |
| Medium | `secondary` (yellow) | Medium risk |
| Low | `outline` | Low risk |
| **Evidence badges:** | | |
| Candidate | `outline` | Uploaded, not reviewed |
| Verified | `default` (green) | Reviewer OK'd |
| Accepted | `default` (blue) | Referenced in finding |
| Referenced | `default` | Cited in publication |
| **AI badges:** | | |
| AI Suggested | Purple/indigo border + sparkle icon | AI-generated content |
| Human | `outline` | Human-originated content |

### 3.6 AI Suggestion Cards

**Visual pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ [AI Suggestion] · Model: gpt-4.0 · Confidence: 89%     │
│                                                             │
│  [Content body — AI-generated text]                        │
│                                                             │
│  Evidence cited: [ev-001] [ev-003]                         │
│                                                             │
│  [Accept] [Edit] [Regenerate] [Discard]                    │
└─────────────────────────────────────────────────────────────┘
```

- Distinct left border: 3px solid `--brand-indigo` (#2f4598)
- Background: subtle indigo tint (`--accent`)
- Sparkle icon (⚡ or `Sparkles` from lucide) in header
- Model + confidence metadata in smaller muted text
- Action buttons: Accept (primary), Edit (outline), Regenerate (ghost), Discard (ghost)

### 3.7 Review Action Buttons

**Button group in review panels:**
```
[Approve] — variant="default" (green/primary)
[Return]  — variant="outline" (yellow/amber)
[Req Evidence] — variant="outline" (blue)
```

- Approve always leftmost (most prominent)
- Return and Request Evidence equally styled (P9: no passive acceptance optimization)
- Each button opens confirmation dialog when clicked

### 3.8 Approval Checklist

```
┌────────────────────────────────────────────────────────────┐
│  Approval Checklist                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ All accounts mapped (245/245)                    │  │
│  │  ✅ Validation passed — Trusted                      │  │
│  │  ⚠ Evidence for material accounts (10/12)      [⏳] │  │
│  │     • Account 2100 — missing bank confirmation       │  │
│  │     • Account 3100 — missing share certificate       │  │
│  │  ❌ Recommendations reviewed (1/3)              [⛔] │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

- Each item has: status icon (✅/⚠/❌), description, detail, action link
- Clicking a ⚠/❌ item navigates to the relevant tab
- Overall header shows pass/fail status with color

---

## 4. Interaction Patterns

### 4.1 AI Suggestions — Presentation and Confirmation

**Trigger points:**
| Feature | Trigger | Display |
|---------|---------|---------|
| Account mapping | After TB parsed, AI fetches suggestions | Inline in mapping panel |
| Finding drafting | User creates new finding | AI suggestion card in dialog |
| Recommendation drafting | User creates new recommendation | AI suggestion card in form |
| Signal generation | After evidence review milestone | AI suggestions panel in Findings tab |
| Evidence summarization | User opens evidence detail | Summary section in drawer |

**Flow:**
1. AI service called asynchronously (loading spinner shown)
2. Result rendered as AI Suggestion Card (§3.6)
3. User actions:
   - **Accept:** Content is copied into the editable form, `ai_contributed` flag set
   - **Edit:** Content copied into form, `ai_contributed` + `human_edited` flags set
   - **Regenerate:** Loading state, new suggestion replaces current card
   - **Discard:** Card removed, no AI content in form
4. All interactions logged to `ai_suggestions` table

**UX rules:**
- Suggestion card must remain visually distinct even after acceptance
- User can always manually override — override path is equally prominent (P9)
- Never auto-accept; always require explicit human action (P4)
- Low-confidence suggestions (<50%) shown but visually dimmed

### 4.2 Evidence Linking to Accounts and Findings

**Link flow:**
1. From Evidence drawer: click [+ Link to Account] or [+ Link to Finding]
2. Search dialog opens: type to search accounts by code/name or findings by ID/title
3. Select link type: `Supports`, `Contradicts`, `Context`
4. Optional: add context note
5. Click [Link] — creates EvidenceLink record
6. Linked items appear in evidence detail panel

**Unlink flow:**
- Click [✕] next to a linked item in the drawer
- Confirm unlinking
- Record soft-delete on EvidenceLink

**Visual indicators:**
- Account rows show evidence count with link icon
- Finding cards show evidence count with link icon
- Clicking count opens evidence drawer scoped to that entity

**Missing evidence:** Accounts without evidence are flagged in:
- Validation tab (evidence sufficiency check)
- Account mapping panel (per-account indicator)
- Overview tab (summary count)

### 4.3 Review Comments

**Where comments appear:**
- Review Queue detail panel (§2.12)
- Finding detail (§2.10)
- Recommendation detail (§2.11)
- Approval action dialog (§2.13)

**Comment behavior:**
- Textarea with character count (500 max)
- Required for: Return, Reject, Request Evidence actions
- Optional for: Approve action
- Comments are appended to the review record and appear in the audit trail
- Previous comments on the item are visible in a thread view

**Thread view:**
```
Review History for REC-001:
[2h ago] M.Partner: Approved. Evidence supports conclusion.
[1d ago] J.Reviewer: Submitted for approval.
[2d ago] J.Reviewer: Drafted (AI-assisted).
```

### 4.4 Approval Flow

```
1. Reviewer submits recommendation (Draft → PendingApproval)
2. Item enters approval queue
3. Approver (Manager/Partner) sees item in:
   a. Approval tab (§2.13) — checklist context
   b. Review Queue (§2.12) — if also a reviewer
4. Approver opens item, reviews full content + evidence
5. Approver chooses action:
   • Accept → state: PendingApproval → Approved
   • Modify → state: PendingApproval → Approved (modification record created)
   • Reject → state: PendingApproval → Rejected (rationale required)
6. When all recommendations approved:
   • Engagement advances to Publication phase
7. Publication tab becomes accessible for Partner
```

**Approval authority enforcement:**
- UI hides Approve button for users without authority for the item's risk tier
- Low/Medium: Manager+ can approve
- High: Partner only
- Critical: Partner only (no delegation)
- API guard clause enforces same restriction server-side

### 4.5 Traceability Exposure

**Traceability is exposed in two ways:**

**1. Per-entity trace panel:**
- Available on Findings, Recommendations, and Evidence
- Click trace icon (🔗 or network graph icon) opens drawer
- Shows bidirectional graph: source → account → evidence → signal → finding → recommendation → approval → publication
- Each node is clickable (navigates to the relevant tab)

**2. Engagement-level trace view:**
- Full trace graph accessible from Overview tab or Audit Trail tab
- Filterable by entity type, date range, account

**Visual representation (MVP):**
```
Account 1200 ──▶ inv.pdf ──▶ FND-001 ──▶ REC-001 ──▶ [Published]
                     │                     │
                     └──▶ FND-003 ──▶ REC-002
```

- Simple vertical timeline with horizontal branches
- Nodes colored by type (blue=account, green=evidence, yellow=finding, orange=rec, purple=publication)
- Lines show relationship type label
- Hover shows metadata tooltip

---

## 5. Visual Design Language

### 5.1 Color Palette

**Brand colors (primary system):**
| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-blue` | `#137dc5` | Primary actions, links, active states |
| `--brand-indigo` | `#2f4598` | AI suggestion accents, secondary brand |
| `--brand-cyan` | `#0baee8` | Highlights, info states |
| `--brand-gradient` | `linear-gradient(90deg, #2f4598, #137dc5, #0baee8)` | Logo, loading indicators |

**Semantic colors:**
| Token | Context | Usage |
|-------|---------|-------|
| Green | Success, Trusted, Verified, Approved | `oklch(0.6 0.2 145)` — status badges, checkmarks |
| Yellow/Amber | Warning, Conditional, Medium risk | `oklch(0.75 0.15 80)` — warning banners, medium severity |
| Red | Error, Blocked, Rejected, Critical | `--destructive` — blocking issues, critical badges |
| Blue | Info, InReview, Published | `--brand-blue` — info banners, in-progress states |
| Purple/Indigo | AI-generated, AI-assisted | `--brand-indigo` — AI suggestion cards, AI badges |

**Neutral palette:**
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | oklch(1 0 0) | oklch(0.145 0 0) | Page background |
| `--foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | Text |
| `--muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | Subtle backgrounds |
| `--muted-foreground` | oklch(0.556 0 0) | oklch(0.708 0 0) | Secondary text |
| `--border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | Borders, dividers |
| `--card` | oklch(1 0 0) | oklch(0.205 0 0) | Card backgrounds |

**Chart colors:**
```
--chart-1: #137dc5 (blue)
--chart-2: #0baee8 (cyan)
--chart-3: #2f4598 (indigo)
--chart-4: #63c9ed (light blue)
--chart-5: #0f4f7a (dark blue)
```

### 5.2 Typography

| Element | Family | Size | Weight | Line Height |
|---------|--------|------|--------|-------------|
| Body | `--font-sans` (Inter var) | 14px (text-sm) | 400 | 1.5 |
| Small/UI | `--font-sans` | 13px (text-xs) | 400 | 1.4 |
| Headings | `--font-heading` (`--font-sans`) | 16-24px | 600 (semibold) | 1.3 |
| Monospace | `--font-mono` (Geist Mono) | 13px | 400 | 1.5 |
| Table header | `--font-sans` | 13px | 500 (medium) | 1.4 |
| Badge text | `--font-sans` | 12px | 500 | 1.3 |
| Page title | `--font-heading` | 20px | 600 | 1.3 |
| Section title | `--font-heading` | 16px | 600 | 1.3 |

### 5.3 Spacing and Density

**Grid:**
- Base unit: 4px
- Content padding: 16px (p-4)
- Card padding: 16px (p-4), reduced to 12px for compact variant
- Section gap: 24px (gap-6)
- Table cell padding: 8px horizontal (px-2), 8px vertical (py-2)

**Component sizing:**
| Component | Height | Notes |
|-----------|--------|-------|
| Top bar | 56px | h-14 |
| Sidebar | 100vh | w-64 |
| Tab bar | 40px | h-10 |
| Buttons | 32px (default), 28px (sm), 36px (lg) | |
| Input fields | 32px | h-8 |
| Badges | 20px | h-5 |
| Cards | Variable | min spacing 16px internal |

**Density option:** For review-heavy screens (Review Queue), a compact mode reduces padding by 25% to show more content.

### 5.4 State Indicators

| State | Visual Treatment |
|-------|-----------------|
| **Loading** | Skeleton placeholders (matching content shape), pulsing animation |
| **Error** | Red banner at top of content area, icon, message, retry button |
| **Empty** | Centered illustration + heading + description + optional CTA |
| **Success** | Green banner (auto-dismiss after 3s for toasts, persistent for banners) |
| **Warning** | Yellow/amber banner with icon and action link |
| **Blocking** | Red banner with ❌ icon, explanation, action link to resolve |

### 5.5 AI vs Human Visual Distinction

Every piece of AI-generated content must be visually distinguishable from human-generated content.

| Element | AI Treatment | Human Treatment |
|---------|-------------|-----------------|
| Suggestion card | Indigo left border + sparkle icon + "AI" badge | Standard card styling |
| Content text | Italic muted text on indigo-tinted background | Normal text on white |
| Badge | `variant="ai"` (indigo bg, white text) | `variant="outline"` |
| Icon | `Sparkles` from lucide | None or `User` icon |
| Metadata | Model + confidence visibly displayed | Not applicable |
| Finding/Recommendation | "AI-contributed" badge on header | No badge |

### 5.6 Warning/Error/Blocked States

| Level | Icon | Banner Color | Border | Action |
|-------|------|-------------|--------|--------|
| Info | ℹ | Blue (`--brand-blue` bg) | Blue | Optional CTA |
| Warning | ⚠ | Yellow/amber | Yellow | "View Details" link |
| Error/Blocked | ❌ | Red (`--destructive` bg) | Red | "Resolve" link |
| Success | ✅ | Green | Green | None (auto-dismiss) |

**Banner component:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ 3 accounts unmapped. Mapping must be complete to proceed│
│                                   [Go to Account Mapping]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix A: Component Tree

```
AppLayout
├── Sidebar
│   ├── Logo
│   └── NavItem[]
└── MainArea
    ├── TopBar
    │   ├── Breadcrumbs
    │   └── UserMenu
    └── PageContent
        ├── DashboardPage
        │   ├── StatCard[]
        │   ├── SearchFilter
        │   └── EngagementTable
        ├── EngagementWorkspace
        │   ├── EngagementHeader
        │   ├── StatusBar
        │   ├── AlertBanner
        │   ├── TabNav
        │   └── TabContent
        │       ├── OverviewTab
        │       │   ├── WorkflowStepper
        │       │   ├── QuickStats
        │       │   └── ActivityTimeline
        │       ├── TrialBalanceTab
        │       │   ├── UploadZone
        │       │   ├── TrustBanner
        │       │   ├── SummaryBar
        │       │   └── AccountTable
        │       ├── AccountMappingTab
        │       │   ├── MappingProgress
        │       │   ├── MappingTable
        │       │   └── MappingPanel (Drawer)
        │       ├── ValidationTab
        │       │   ├── TrustBanner
        │       │   ├── ValidationCard[]
        │       │   └── AnomalyTable
        │       ├── FinancialStatementsTab
        │       │   ├── StatementTabs
        │       │   ├── AiIndicator
        │       │   └── StatementContent
        │       ├── DisclosureNotesTab
        │       │   └── NoteAccordion[]
        │       ├── EvidenceStoreTab
        │       │   ├── UploadButton
        │       │   ├── EvidenceTable
        │       │   ├── EvidenceDrawer
        │       │   └── MissingRequests
        │       ├── FindingsTab
        │       │   ├── NewFindingButton
        │       │   ├── FindingCard[]
        │       │   ├── AiSuggestionsPanel
        │       │   └── FindingDialog
        │       ├── RecommendationsTab
        │       │   ├── RecommendationCard[]
        │       │   └── RecForm
        │       ├── ApprovalTab
        │       │   ├── ApprovalChecklist
        │       │   ├── BlockingIssues
        │       │   ├── ApprovalItem[]
        │       │   └── SignoffTrail
        │       ├── PublicationTab
        │       │   ├── ReadinessChecklist
        │       │   ├── PackageContents
        │       │   └── PublishButton
        │       └── AuditTrailTab
        │           ├── EventFilters
        │           └── EventItem[]
        └── ReviewQueuePage
            ├── QueueFilters
            ├── QueueList
            └── ReviewDetailPanel
```

## Appendix B: Route Map

```
/                                        → Dashboard (engagement list)
/engagements                             → Dashboard (engagement list)
/engagements/[id]                        → Overview tab (redirect)
/engagements/[id]/overview               → Overview
/engagements/[id]/trial-balance          → Trial Balance
/engagements/[id]/mapping                → Account Mapping
/engagements/[id]/validation             → Validation
/engagements/[id]/statements             → Financial Statements
/engagements/[id]/notes                  → Disclosure Notes
/engagements/[id]/evidence               → Evidence Store
/engagements/[id]/findings               → Findings
/engagements/[id]/recommendations        → Recommendations
/engagements/[id]/approval               → Approval
/engagements/[id]/publication            → Publication Package
/engagements/[id]/audit-trail            → Audit Trail
/review-queue                            → Review Queue
/organizations                           → Organization list (Admin/Partner)
/organizations/[id]                      → Organization detail
/settings                                → User settings
/login                                   → Login page
/published/[publicationId]               → Client-facing published view
```

---

*End of AuditOS MVP UI/UX Specification*
