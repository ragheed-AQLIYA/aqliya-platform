# AuditOS MVP — Demo Guide

## Product Summary

AuditOS is a **governed financial assurance workflow system** that helps audit firms convert trial balances into traceable, reviewable, governed reporting packages. It is the first execution wedge of AQLIYA's Enterprise Decision Intelligence Infrastructure.

**Core principle:** AI assists. Humans decide. Evidence governs.

AuditOS is NOT:
- A chatbot or conversational interface
- An autonomous audit tool
- A generic BPM engine
- A dashboard-first product
- An ERP replacement

## Phase 1 MVP Scope

The Phase 1 prototype demonstrates the full wedge from trial balance ingestion through publication package, using pre-seeded mock data for Gulf Trading Co. FY2025.

### In Scope

| Module | Status | Description |
|--------|--------|-------------|
| Dashboard | Complete | Engagement overview, status summary, recent activity |
| Engagement Workspace | Complete | Workflow progress, team view, alerts, traceability summary |
| Trial Balance | Complete | Table view with sort/search, trust state, debit/credit/variance |
| Account Mapping | Complete | AI-suggested mappings, confidence scores, human accept/manual mapping |
| Validation | Complete | Balance check, missing mappings, unusual balances, classification conflicts |
| Draft Financial Statements | Complete | P&L and Balance Sheet with linked account traceability |
| Disclosure Notes | Complete | Draft notes with missing information flags, AI draft indicators |
| Evidence Store | Complete | Uploaded/missing evidence states, linking, detail panel |
| Findings | Complete | Findings lifecycle, severity/status filters, AI suggestion labels |
| Recommendations | Complete | AI-assisted drafting with accept/reject/edit, risk levels |
| Review Queue | Complete | Reviewer comments, add/resolve workflow |
| Approval Checklist | Complete | Blocking issues, checklists, approval history, authority display |
| Publication Package | Complete | Draft state, summary cards, generate/publish placeholders |
| Audit Trail | Complete | 16 events, chronologic with filters, AI event flags, search |
| AI Governance | Complete | AI outputs labeled, human confirmation required, no autonomous actions |

### Out of Scope (Phase 1)

- Real database — all data is mock (prisma schema not extended)
- Real file upload — evidence is pre-seeded
- Real AI API — AI suggestions are deterministic mock data
- Engagement create/edit flow — uses pre-seeded engagement only
- Client management UI — clients visible via dashboard cards only
- User authentication — uses existing AQLIYA auth infrastructure
- Multi-tenant isolation — single-tenant prototype
- Production-grade error handling — basic empty/loading/error states

## Demo User Journey

The prototype supports one complete demo path:

```
1. Open Dashboard (/audit)
2. Select "Gulf Trading Co. FY2025" engagement
3. View workflow progress stepper (11 steps)
4. View alerts: unmapped account, missing evidence, unusual balance, classification warning
5. Open Trial Balance → see 22 accounts with trust state "Conditional"
6. Notice variance of SAR 45,000 (unbalanced due to unmapped Sundry Income)
7. Open Account Mapping → 21 of 22 accounts mapped, 1 pending
8. Accept AI mapping suggestion for Sundry Income → toast confirmation
9. Open Validation → 2 errors, 3 warnings, grouped by severity
10. Accept/dismiss validation issues with rationale dialog
11. Open Statements → P&L and Balance Sheet tabs
12. Click a line (e.g. "Cash and Cash Equivalents") → traceability panel
13. Open Notes → 7 disclosure notes, 4 with missing information
14. Toggle "Missing Information" filter → see notes needing data
15. Open Evidence → 5 items, 1 missing (inventory count, red "MISSING" badge)
16. Open Findings → 4 findings, AI-suggested label, severity/status filters
17. Open Recommendations → 3 items, AI suggestion with Accept/Reject/Edit
18. Open Review → 2 open comments, add comment form
19. Open Approval → Not Ready with 2 blocking issues displayed
20. Open Publication → Draft state with summary cards
21. Open Audit Trail → 16 events, filterable, searchable
22. Return to Dashboard → updated stats reflect engagement state
```

## Demo Dataset

### Organization
**Aqliya Audit Firm** — Saudi Arabia, IFRS for SMEs

### Client
**Gulf Trading Co.** — Wholesale Trade, FY ending 31 December 2025, SAR

### Users

| Name | Role |
|------|------|
| Khalid Al Saud | Partner |
| Farida Al Zamil | Manager |
| Sarah Al Otaibi | Reviewer |
| Ahmed Al Ghamdi | Operator |
| Faisal Al Harbi | Client Contact (Viewer) |

### Trial Balance
22 accounts covering all categories with total debits SAR 11,045,000 and total credits SAR 11,000,000.

### Intentional Issues

| Issue | Location | Description |
|-------|----------|-------------|
| Unmapped account | Mapping | Sundry Income (5100) — SAR 45,000 unmapped |
| Missing evidence | Evidence | Inventory count sheet not uploaded |
| Negative balance | Validation | Accrued Expenses shows credit SAR 20,000 (not liabilities) |
| Classification conflict | Validation | Short-term Loan may have 24-month term |
| Prior-period variance | Validation | Professional Fees up 60% YoY without explanation |
| Missing note info | Notes | PPE, Receivables, Inventories, Short-term Loan notes need more data |
| Unbalanced TB | Trial Balance | Variance of SAR 45,000 from unmapped account |

## Key Screens

| Route | Screen | Key Elements |
|-------|--------|-------------|
| `/audit` | Dashboard | Stats cards, engagement list, recent activity |
| `/audit/engagements/[id]` | Engagement Overview | Workflow progress, alerts, metrics, team, activity, traceability |
| `.../trial-balance` | Trial Balance | 22 accounts, trust badge, variance, sortable/searchable table |
| `.../mapping` | Account Mapping | Progress bar, AI suggestions, Accept button, filter All/Mapped/Unmapped |
| `.../validation` | Validation | Trust state, errors/warnings grouped, accept/dismiss dialog |
| `.../statements` | Statements | P&L + Balance Sheet tabs, traceability panel on line click |
| `.../notes` | Disclosure Notes | Filter by status, missing info toggle, AI draft labels |
| `.../evidence` | Evidence | State badges, detail panel, missing highlighted red |
| `.../findings` | Findings | Severity/status/type filters, AI badge, create dialog |
| `.../recommendations` | Recommendations | Risk badges, AI suggestion panel with Accept/Reject/Edit |
| `.../review` | Review | Comment list, add comment, open/resolved filter |
| `.../approval` | Approval | Blocking issues, checklist, approval history |
| `.../publication` | Publication | Summary cards, generate/publish buttons |
| `.../audit-trail` | Audit Trail | 16 events, filters, search, AI event flags |

## AI Governance Rules

The prototype enforces these AI boundaries:

| Rule | Enforcement |
|------|------------|
| AI cannot approve | No approve action exists on AI components |
| AI cannot publish | Publication requires explicit human action |
| AI cannot override workflow state | No AI write access to state objects |
| AI cannot hide missing evidence | Missing evidence is always visible (red badges) |
| AI outputs are labeled | Sparkles icon + "AI Suggested"/"AI Drafted"/"AI Suggestion" |
| Human confirmation required | Accept/Reject/Edit buttons on all AI suggestions |
| AI contribution is tracked | `aiContributed`/`aiSuggested` fields in data model |
| Audit trail marks AI events | `aiRelated: true` with model version metadata |

### Where AI Appears

| Feature | AI Role | Human Action |
|---------|---------|-------------|
| Account mapping | Suggests canonical mapping | Accept or manual re-map |
| Finding creation | Suggests finding language | Review, edit, confirm |
| Recommendation | Drafts recommendation text | Accept, edit, or reject |
| Disclosure notes | Drafts note language | Review, edit, approve |
| Validation explanation | Explains anomalies | Review, accept/dismiss |
| Queue ranking | Sorts by risk/materiality | N/A (algorithmic) |

## Traceability

Traceability is demonstrated at two levels:

**Level 1: Engagement Overview** — Forward/backward trace summary with missing links highlighted.

**Level 2: Statement Line Traceability** — Clicking any line in a financial statement opens a side panel showing:
- Line item name and amount
- Linked mapped accounts
- Evidence trail (TB → Mapped → Evidence)
- Findings and recommendations (placeholder)
- Current validation status

The traceability concept is structurally supported by the data model (linkedAccountMappings on statement lines, EvidenceLink polymorphic joins, AuditEvent sequence chain) but the full interactive TraceabilityGraph is not yet wired.

## Known Limitations

| Limitation | Impact | Planned for |
|------------|--------|-------------|
| Mock data only (no real DB) | Cannot persist changes | Phase 2 |
| Prisma schema not extended | AuditOS entities not in DB | Phase 2 |
| TraceabilityDrawer not wired | Shared component exists but unused | Phase 2 |
| No real file upload | Evidence is pre-seeded | Phase 2 |
| No real AI API | Suggestions are deterministic | Phase 2 |
| No engagement create/edit | Cannot add new engagements | Phase 2 |
| No client management UI | Clients only visible via engagement | Phase 2 |
| Statement of Cash Flows | Placeholder only | Post-MVP |
| Statement of Changes in Equity | Placeholder only | Post-MVP |
| Real e-signature | Not implemented | Post-MVP |
| Multi-tenant | All data in single org | Post-MVP |

## Phase 2 Recommendation

Phase 2 should extend the Prisma schema with AuditOS entities (Client, Engagement, TrialBalance, AccountMapping, etc.), replace mock services with Prisma-backed server actions, wire the TraceabilityDrawer across all screens, add engagement create/edit flow, and add real CSV/XLSX trial balance upload with column mapping.

See `docs/product/auditos-phase-2-plan.md` for details.

---

*AuditOS — Governed Financial Assurance Workflow*
*AI assists. Humans decide. Evidence governs.*
