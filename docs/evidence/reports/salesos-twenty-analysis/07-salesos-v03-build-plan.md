# 07 — SalesOS v0.3 Build Plan

**Date:** 2026-06-01  
**Target:** L4 Usable v0.1 (minimum) — **not production-certified**

---

## Phase Overview

| Phase | Goal | Outcome level |
|-------|------|---------------|
| 0 | Migration drift reconciliation | Unblock `migrate dev` |
| 1 | P0 schema + seed | L3→L4 data foundation |
| 2 | Core CRUD + actions | L4 list/create/update |
| 3 | Dashboard wired to DB | L4 real KPIs |
| 4 | Interactions + audit | L4 governance baseline |
| 5 | Proposal review gate | L4→L5 partial |
| 6 | Tests + docs sync | Light validated |

---

## Phase 0 — Drift Reconciliation

**Goal:** Align migration history before new SalesOS tables.

**Files:**
- Investigate backup/branch for missing SQL in `prisma/migrations/`
- `docs/releases/localcontentos-prisma-smoke/agent-01-migration-drift-assessment.md` (reference)

**Tasks:**
1. Determine if orphan SalesOS tables exist on dev DB
2. Choose: restore migrations OR baseline diff OR drop orphan tables (approval required)
3. Verify `npx prisma migrate status` clean on fresh clone path

**Risks:** Destructive DB ops; blocks all schema work  
**Acceptance:** `migrate status` consistent; team documented decision

---

## Phase 1 — P0 Schema + Seed

**Goal:** Additive SalesOS core models (see `02-salesos-data-model-map.md`).

**Schema:** `prisma/schema.prisma`
- `SalesAccount`, `SalesContact`, `SalesOpportunity`, `SalesInteraction`, `SalesAuditEvent`

**Migration:** `prisma/migrations/YYYYMMDDHHMMSS_salesos_p0_core/migration.sql`

**Seed:** `prisma/seed.ts` or `prisma/seed-sales.ts`
- 3 accounts, 5 contacts, 8 opportunities, 10 interactions (Arabic names)

**Lib scaffold:**
- `src/lib/sales/types.ts`
- `src/lib/sales/permissions.ts`
- `src/lib/sales/audit-events.ts`
- `src/lib/sales/services.ts`
- `src/lib/sales/prisma-repository.ts`

**Acceptance:** `npx prisma validate` pass; seed idempotent; models have `platformOrganizationId`, `createdById`

---

## Phase 2 — Server Actions + Routes

**Goal:** Real CRUD flows.

**Actions:** `src/actions/sales-workspace-actions.ts`  
Pattern: `local-content-workspace-actions.ts` (`ActionResult<T>`, `safe()` wrapper)

**Routes:**
| File | Purpose |
|------|---------|
| `src/app/sales/accounts/page.tsx` | Account list |
| `src/app/sales/accounts/[accountId]/page.tsx` | Account detail |
| `src/app/sales/opportunities/page.tsx` | Opportunity list |
| `src/app/sales/opportunities/[oppId]/page.tsx` | Opportunity detail |
| `src/app/sales/opportunities/new/page.tsx` | Create form |

**Components:**
- `src/components/sales/sales-account-form.tsx`
- `src/components/sales/sales-opportunity-form.tsx`
- `src/components/sales/sales-interaction-log.tsx`

**Fix nav debt:**
- `src/lib/platform/navigation.ts` — real hrefs
- `src/components/platform/command-palette.tsx` — remove dead links

**Acceptance:** Create account + opportunity persists; tenant isolation enforced; unauthorized → 403/redirect

---

## Phase 3 — Dashboard Wired

**Goal:** Replace mock KPIs on `src/app/sales/page.tsx`.

**Changes:**
- Convert to server component OR fetch via server action on load
- KPI queries in `src/lib/sales/services.ts`: pipeline total, active count, win rate, account count
- Pipeline stage cards from grouped opportunities
- Follow-up queue from `nextActionAt` + stale interaction rules

**Keep:** Amber prototype banner until Phase 6 sign-off

**Acceptance:** KPI values match seeded DB; no hardcoded `$2.4M`

---

## Phase 4 — Interactions + Audit Trail

**Goal:** Governed activity logging.

**Features:**
- Log interaction form on opportunity detail
- `SalesAuditEvent` written on all mutations
- `src/app/sales/audit-trail/page.tsx` — event list (org-scoped)
- Optional: `PlatformAuditLog` for operator view

**API (if files needed):**
- `src/app/api/sales/evidence/[id]/download/route.ts` — auth + tenant (Phase 5)

**Acceptance:** Every mutation has audit row; timeline shows sales events not audit mock data

---

## Phase 5 — Proposal + Review Gate

**Goal:** First governance differentiator.

**Schema add:** `SalesProposal`, `SalesReview`

**Routes:**
- `src/app/sales/review/page.tsx` — review queue
- Proposal tab on opportunity detail

**AI (optional in this phase):** Proposal Draft Assistant (#4 from agents map) — draft only

**Acceptance:** Cannot export brief without approved proposal; commercial claim flag visible

---

## Phase 6 — Tests + Documentation

**Tests:**
- `src/lib/sales/__tests__/services.test.ts` — CRUD, tenant guard
- `src/lib/sales/__tests__/permissions.test.ts`
- Optional smoke: update `scripts/_salesos-v02-smoke-once.ts` to match real routes

**Docs sync:**
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md`
- `docs/systems/salesos/README.md`
- `docs/official/aqliya-agent-context-v1.1.md` (if status changes)

**Validation (light):**
- `npx tsc --noEmit`
- `npm test -- src/lib/sales`
- `npx prisma validate`

**Acceptance:** SalesOS labeled L4 in status matrix; marketing still honest about pilot scope

---

## Risk Register (Build)

| Risk | Mitigation |
|------|------------|
| Migration drift | Phase 0 mandatory |
| Scope creep (CRM clone) | Stick to P0 entities only |
| AI overclaim | Proposal review gate before export |
| Nav dead links | Phase 2 cleanup |
| AuditOS regression | No shared schema breaks; isolated models |
| RAM on full build | Light validation per low-load protocol |

---

## Out of Scope (v0.3)

- Email/calendar sync (Twenty parity)
- Kanban drag-drop
- Metadata/custom objects engine
- `/sales/intelligence`, `/sales/icp`, `/sales/revenue` (defer v0.4)
- L6 production hardening

---

## Estimated File Count (Phase 1–4 minimum)

~25–35 new/modified files — focused slice, not CRM rewrite.

**Validation classification after Phase 6:** light validated — not production no-go, not pilot-ready L5 without review gate manual pass.
