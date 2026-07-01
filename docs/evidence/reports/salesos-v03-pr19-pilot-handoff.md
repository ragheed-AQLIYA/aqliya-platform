# SalesOS v0.3 — PR-19 Pilot onboarding handoff pack

**Status:** Implementation in repo  
**Validation classification:** not validated — no browser smoke or full test suite executed for this report  
**Product:** SalesOS (AQLIYA platform)  
**Repo:** `C:\Users\PC\Documents\Aqliya`

---

## 1. Purpose

PR-19 delivers a **read-only pilot onboarding handoff pack** per deal. It aggregates existing metadata and links—no new Prisma schema, no agent library changes, no PDF generation library.

The pack supports commercial operators moving a deal from governed pilot prep to external handoff with a single printable checklist.

---

## 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Read-only UI aggregating conversion memo, evidence links, review decisions, ICP score | New tables or migrations |
| Print-friendly HTML export (inline route, no pdfkit) | Email send, LLM generation |
| Checklist derived from existing metadata gates | Editing memo/governance from pack page |
| Alias route `/sales/pilot-handoff/[dealId]` → deal pilot page | Changes under `src/lib/sales/agents/*` |

---

## 3. Routes

| Route | Type | Description |
|-------|------|-------------|
| `/sales/deals/[id]/pilot` | Server page | Primary read-only handoff pack |
| `/sales/pilot-handoff/[dealId]` | Redirect | Alias to `/sales/deals/[dealId]/pilot` |
| `/sales/deals/[id]/pilot/export` | Route handler | `text/html` export for print / save |

Deal detail page (`/sales/deals/[id]`) links to the pack when PR-19 CTA is visible.

---

## 4. Data sources (no new schema)

| Section | Source |
|---------|--------|
| Conversion memo | `SalesDeal.metadata.conversionMemo` (PR-13) |
| Evidence links | `SalesEvidenceLink` rows for deal |
| Review decisions | `SalesDeal.metadata.reviewDecisions` (PR-10) |
| ICP score | `SalesAccount.metadata.icpScore` (PR-15) |

Loader: `loadPilotHandoffPack(dealId, scope)` in `src/lib/sales/pilot-handoff-pack.ts`.

---

## 5. Checklist logic

Checklist items are computed in `buildPilotHandoffChecklist()`:

1. Memo draft + pilot criteria complete  
2. Memo submitted or decided  
3. At least one evidence link on deal  
4. Memo evidence refs match linked rows  
5. Latest governance review = approved  
6. ICP score configured on account  
7. Human ICP review when score is agent-generated  

Statuses: `complete` | `incomplete` | `na`.

---

## 6. Files touched

| Path | Role |
|------|------|
| `src/lib/sales/pilot-handoff-pack.ts` | Assembly, checklist, HTML export |
| `src/lib/sales/__tests__/sales-pilot-handoff-pack.test.ts` | Unit tests |
| `src/components/sales/pilot-handoff-pack-view.tsx` | Read-only UI |
| `src/components/sales/pilot-handoff-export-button.tsx` | Print + HTML export actions |
| `src/app/sales/deals/[id]/pilot/page.tsx` | Pack page |
| `src/app/sales/deals/[id]/pilot/export/route.ts` | HTML export handler |
| `src/app/sales/pilot-handoff/[dealId]/page.tsx` | Route alias |
| `src/app/sales/deals/[id]/page.tsx` | Link to pack |

---

## 7. Validation (honest)

| Check | Status |
|-------|--------|
| Unit tests for pack assembly / export HTML | Added — not executed in this session |
| Browser smoke on `/sales/deals/[id]/pilot` | not validated |
| RBAC (`salesos:read`) on export route | Implemented via existing guards — not runtime verified |
| Production readiness | **not validated** — PR-19 stub |

---

## 8. Operator notes

- Export opens HTML in a new tab; use browser **Print → Save as PDF** if a PDF file is needed (no server-side PDF lib by design).
- Pack is **read-only**; edit memo, evidence, governance, and ICP from deal/account pages.
- Safe-claims: pack does not imply commercial approval or autonomous pilot decision—human review remains required.

---

## 9. Dependencies on prior PRs

- **PR-13** — conversion memo metadata  
- **PR-10** — review decisions metadata  
- **PR-4b** — evidence links  
- **PR-15** — ICP score on account metadata (rules agent; human review gate)

---

**Report version:** 2026-06-01 — PR-19 pilot handoff pack
