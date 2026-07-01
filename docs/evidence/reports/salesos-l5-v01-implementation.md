# SalesOS L5 v0.1 — Implementation Report (Phases 2–8)

**Date:** 2026-06-01  
**Repo:** C:\Users\PC\Documents\Aqliya  
**Classification:** L5 usable v0.1 with governed persistence — **not production-certified**

## Summary

Phases 2–8 implement relational governance (`SalesProposal`, `SalesReview`, `SalesApproval`) while keeping shipped names (`SalesDeal`, `SalesInteraction`, `SalesEvidenceLink`). UI aliases `/sales/opportunities` → deals. Dual-write to `deal.metadata.reviewDecisions` remains for backward compatibility.

## Phase 2 — Schema & migration

| Artifact | Status |
|----------|--------|
| `prisma/schema.prisma` | Added L5 models + relations on `SalesDeal` |
| `prisma/migrations/20260601180000_salesos_l5_governance/migration.sql` | Created (SQL only) |
| `npx prisma validate` | Pass (agent session) |

**Human step (required):** `npx prisma migrate deploy` then `npx prisma generate` on target DB. Hybrid/shared DB: reconcile B1 drift per `docs/operations/salesos-migration-runbook.md` before deploy.

## Phase 3 — Repository layer

| Path | Role |
|------|------|
| `src/lib/sales/repositories/org-scope.ts` | Org guards |
| `src/lib/sales/repositories/proposals.ts` | Proposal CRUD |
| `src/lib/sales/repositories/reviews.ts` | Review CRUD + pending list |
| `src/lib/sales/repositories/approvals.ts` | Approval create + queue helpers |
| `src/lib/sales/l5-governance.ts` | Submit / approve / reject + metadata dual-write |
| `src/lib/sales/l5-types.ts` | String status unions |

P0 entities (accounts, deals, interactions, evidence) remain in `services.ts`, `interactions.ts`, `evidence-links.ts` — existing pattern preserved.

## Phase 4 — Server actions

Wired in `src/actions/sales-actions.ts`:

- `createSalesAccountAction`, `updateSalesAccountAction` (existing)
- `createSalesOpportunityAction` / `updateSalesOpportunityAction` → deal wrappers
- `createSalesActivityAction` → interaction wrapper
- `attachSalesEvidenceAction` → evidence link wrapper
- `submitSalesOpportunityForReviewAction`, `approveSalesOpportunityAction`, `rejectSalesOpportunityAction`
- `listSalesAuditTrailAction` → org audit alias
- `listOrgSalesActivitiesAction`, `listPendingOpportunityReviewsAction`, `listOrgSalesApprovalsAction`

Permission: `salesos:review` for OPERATOR/ADMIN on approve/reject.

## Phase 5 — UI routes

| Route | Behavior |
|-------|----------|
| `/sales/opportunities` | Re-exports deals list |
| `/sales/opportunities/new`, `[id]` | Re-exports deal pages |
| `/sales/activities` | Org interaction list |
| `/sales/approval` | Pending reviews + recent approvals |
| `/sales/review` | L5 governance + outreach queue |
| `/sales/evidence`, `/sales/audit-trail` | Existing (enhanced nav links) |

Nav updated in `src/components/sales/sales-shell.tsx`.

## Phase 6 — Seed

| Script | Contents |
|--------|----------|
| `scripts/seed-sales-l5.ts` | 8 contacts, 12 L5-tagged activities, 4 evidence stubs, 2 reviews, 1 approval (requires demo base seed + migrate) |

Does not overwrite non-Sales products. Idempotent by name/seed tag.

## Phase 7 — Tests

| Command | Scope |
|---------|--------|
| `npx jest src/lib/sales/__tests__ --testPathPattern="l5|governance|repository"` | L5 + governance suites |

New: `src/lib/sales/__tests__/sales-l5-governance.test.ts` (tenant isolation, submit, approve audit, pending list).

**Not run:** full `npm test`, build, lint (low-load default).

## Phase 8 — Docs

- This report
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — SalesOS row updated to L5 usable v0.1 with conditions

## Honest limitations

- **Operational:** migrate deploy, generate, seed, browser smoke **not executed** in agent session.
- **Hybrid DB:** shared database may block blind migrate; human must verify migration history.
- **Evidence stubs:** L5 seed uses placeholder `evidenceId` values — not Core evidence records.
- **Relational vs metadata:** Until migrate, L5 tables empty; governance still works via metadata + audit.
- **Production:** Do not claim pilot-ready externally without Phase 0 sign-off + smoke evidence.

## Files changed (representative)

- `prisma/schema.prisma`
- `prisma/migrations/20260601180000_salesos_l5_governance/migration.sql`
- `src/lib/sales/repositories/*`, `l5-governance.ts`, `l5-types.ts`, `audit-events.ts`, `permissions.ts`
- `src/actions/sales-actions.ts` (L5 section)
- `src/app/sales/opportunities/*`, `activities/page.tsx`, `approval/page.tsx`, `review/page.tsx`
- `src/components/sales/sales-shell.tsx`
- `scripts/seed-sales-l5.ts`
- `src/lib/sales/__tests__/sales-l5-governance.test.ts`
- `docs/reports/salesos-l5-v01-implementation.md`
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`

## Next human steps

1. Reconcile B1 drift if applicable.
2. `npx prisma migrate deploy`
3. `npx prisma generate`
4. `tsx scripts/seed-sales-demo.ts` (if needed)
5. `tsx scripts/seed-sales-l5.ts`
6. `npx jest src/lib/sales/__tests__ --testPathPattern="l5|governance"`
7. Browser smoke: `/sales/opportunities`, `/sales/activities`, `/sales/approval`, `/sales/review`
