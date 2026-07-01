# 03 — SalesOS UX Benchmark

**Date:** 2026-06-01  
**Benchmark:** Twenty CRM UX patterns vs current `/sales` prototype

---

## Current SalesOS Route Structure

| Route | Status | Notes |
|-------|--------|-------|
| `/sales` | **Exists** — L3 mock dashboard | Only implemented workspace route |
| `/products/sales` | **Exists** — L1 marketing | Honest "قيد التطوير" |
| `/sales/accounts` | **Missing** | Referenced in nav + smoke script |
| `/sales/opportunities` | **Missing** | Referenced in nav + smoke script |
| `/sales/activities` | **Missing** | Smoke script only |
| `/sales/intelligence` | **Missing** | Smoke script only |
| `/sales/icp` | **Missing** | Smoke script only |
| `/sales/revenue` | **Missing** | Smoke script only |
| `/sales/command-center` | **Missing** | Smoke script only |

**Navigation debt:** `src/lib/platform/navigation.ts` lists Pipeline, Deals, Accounts — all href to `/sales` (same page). Command palette (`command-palette.tsx`) links to nonexistent `/sales/deals/global-finance`.

---

## Twenty CRM UI Patterns → SalesOS Mapping

| Twenty pattern | SalesOS equivalent | v0.3 priority | AQLIYA adaptation |
|----------------|-------------------|---------------|-------------------|
| Object index (table) | Account list, Opportunity list | P0 | Arabic table headers, RTL pagination |
| Kanban pipeline view | Opportunity stages board | P1 | Stage = governed state, not drag-only |
| Record detail page | Account/Opportunity detail | P0 | Tabs: Overview, Activity, Evidence, Governance |
| Activity timeline | Interaction log | P0 | Reuse `entity-timeline.tsx` with sales events |
| Cmd+K command menu | Already exists platform-wide | P0 | Wire create/search to real entities |
| Saved views / filters | Pipeline filters | P2 | Defer — use query params first |
| Email sidebar | Interaction type=email | P2 | Manual log first, sync later |
| Dashboard widgets | KPI + intelligence panel | P0 | Already stubbed on `/sales` |
| Notes on record | SalesNote / Interaction | P0 | Permissioned |
| Relation picker (Company→People) | Account→Contacts | P0 | Standard form pattern |
| Workflow automation UI | Governance review queue | P1 | Human approval, not Zapier clone |
| Settings/data model UI | Admin stage config | P2 | JSON seed first |

---

## SalesOS-Specific UX (Not in Twenty)

These differentiate SalesOS from generic CRM:

1. **Prototype banner** — keep amber warning until L4 (`src/app/sales/page.tsx` pattern)
2. **Governance tab** on proposals — review status, approver, evidence links
3. **Commercial claim flag** — UI indicator when AI/marketing text needs review (ties to `commercial_claim_review` in `retrieval-router.ts`)
4. **Sales memory panel** — institutional learnings per account (win/loss patterns)
5. **Cross-product links** — jump to DecisionOS tender, LocalContentOS project where relevant
6. **Confidence + limitation on AI cards** — reuse `AIInsightCard` with `confidence` prop (already on dashboard)
7. **Arabic-first copy** — stage names, empty states, error messages in Arabic
8. **Evidence attachment on interactions** — file upload pattern from LocalContentOS evidence UX

---

## Recommended Route Tree (v0.3)

```
/sales                          → Dashboard (KPIs, pipeline summary, follow-ups)
/sales/accounts                 → Account list + create
/sales/accounts/[accountId]     → Account detail (contacts, opps, memory)
/sales/opportunities            → Pipeline list / board
/sales/opportunities/[oppId]    → Opportunity detail (interactions, proposals)
/sales/opportunities/new        → Create opportunity
/sales/review                   → Governance queue (proposals, claims)
/sales/audit-trail              → SalesAuditEvent viewer
```

**Defer to v0.4+:** `/sales/intelligence`, `/sales/icp`, `/sales/revenue`, `/sales/command-center`

---

## Component Reuse Plan

| Need | Reuse from | New component |
|------|-----------|---------------|
| Shell layout | `src/app/sales/layout.tsx` | Keep |
| KPI row | `KPICard` | Wire to server data |
| Pipeline cards | `EnterpriseCard` | Extract `PipelineStageCard` |
| Tables | shadcn/ui table patterns from LocalContentOS | `sales-account-table.tsx` |
| Forms | LocalContentOS create forms | `sales-opportunity-form.tsx` |
| Timeline | `entity-timeline.tsx` | Map SalesAuditEvent types |
| Empty/loading/error | LocalContentOS route files | Add per-route |
| Delete confirm | `local-content-delete-button.tsx` pattern | Sales variant |

---

## UX Quality Gates (L4)

- [ ] Every list page: loading.tsx, error.tsx, empty state with next action (Arabic)
- [ ] Every mutation: toast/feedback + optimistic or refresh via `revalidatePath`
- [ ] No dead nav links (fix command palette + sidebar hrefs)
- [ ] KPI values from DB, not hardcoded
- [ ] AI insights labeled "مسودة / اقتراح" not final
- [ ] Export button disabled until approval gate passes

---

## Twenty UX to Avoid Copying

- English-only microcopy defaults
- Unlimited custom fields UI (metadata complexity)
- AI chatbot as primary navigation
- Generic "Lead" object before Account/Opportunity discipline
- Billing/credits surfaces

---

## Validation

Static UX audit of routes and components only. No browser pass claimed.
