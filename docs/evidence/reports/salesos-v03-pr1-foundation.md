# SalesOS v0.3 PR-1 — Foundation Report

**Status:** Implementation complete (schema + code); migration not executed in PR-1  
**Product level after PR:** L4 foundation (partial) — P0 schema, services, actions, guards, audit, dashboard KPI wiring  
**Validation classification:** not validated (migration/seed/generate not run in agent session)

---

## 1. Objective

Move SalesOS from L3 mock toward L4 foundation: P0 Prisma models, idempotent demo seed, deal/account CRUD services, org guards, domain audit events, server actions, partial `/sales` dashboard wiring, and lightweight unit tests — without Twenty CRM import, without full CRM scope, and without running heavy build/lint/migrate/generate in this PR.

---

## 2. Files changed / added

| Path | Role |
|------|------|
| `prisma/schema.prisma` | P0 models: `SalesPipeline`, `SalesPipelineStage`, `SalesAccount`, `SalesDeal`, `SalesAuditEvent` |
| `scripts/seed-sales-demo.ts` | Idempotent demo pipeline, stages (from deal-stage definitions), accounts, deals, one audit event |
| `src/lib/sales/services.ts` | CRUD + dashboard stats |
| `src/lib/sales/guards.ts` | `requireSalesOrgAccess`, `assertSalesDealAccess`, `assertSalesAccountAccess` |
| `src/lib/sales/audit-events.ts` | `recordSalesAuditEvent` + action name constants |
| `src/lib/sales/validation.ts` | Create/update/stage transition validation |
| `src/actions/sales-actions.ts` | Server actions (list/get/create/update, accounts, pipeline stages, dashboard stats) |
| `src/lib/platform/audit-logger.ts` | `Product.SALES_OS` (`sales_os`) |
| `src/app/sales/page.tsx` | Server wrapper → stats action |
| `src/app/sales/sales-dashboard-client.tsx` | KPI + stage cards wired to Prisma stats when available |
| `src/lib/sales/__tests__/sales-services.test.ts` | Unit tests (guards, audit, validation) |
| `docs/reports/salesos-v03-pr1-foundation.md` | This report |

**Note:** `docs/reports/salesos-twenty-analysis/` was not present in the repo at implementation time; stage slugs follow `docs/product/auditos-sales-ops/deal-stage-definitions.md`.

---

## 3. Schema (P0)

- **Tenant scope:** `organizationId` + optional `platformOrganizationId` on pipeline, stage, account, deal, audit event.
- **Relations:** `SalesDeal` → required `SalesAccount`; optional `SalesPipelineStage` → `SalesPipeline`.
- **Audit:** `SalesAuditEvent` — `actorId`, `actorName`, `action`, `targetType`, `targetId`, `metadata` (JSON), `createdAt`.
- **Statuses:** string fields (`open` / `won` / `lost` / `archived` for deals) — no new Prisma enums.
- **Timestamps / actors:** `createdAt`, `updatedAt`, `createdById`, `updatedById` on mutable entities where applicable.

### Next migration (not run in PR-1)

```bash
# After resolving any existing drift per team process:
npx prisma migrate dev --name salesos_p0_core
npx prisma generate
tsx scripts/seed-sales-demo.ts
```

---

## 4. Server actions

| Action | Min role | Notes |
|--------|----------|-------|
| `listSalesDealsAction` | authenticated org | Tenant-scoped list |
| `getSalesDealAction` | authenticated org | `assertSalesDealAccess` |
| `createSalesDealAction` | OPERATOR | Validates input, domain audit + platform audit logger |
| `updateSalesDealAction` | OPERATOR | Stage change → `sales.deal.stage_changed` |
| `listSalesAccountsAction` | authenticated org | |
| `getSalesAccountAction` | VIEWER | `sales.account.viewed` |
| `listSalesPipelineStagesAction` | VIEWER | Default pipeline; `sales.pipeline.viewed` |
| `getSalesDashboardStatsAction` | VIEWER | KPI payload for dashboard |

---

## 5. Guards

- `requireSalesOrgAccess()` — session user + org `platformOrganizationId` from DB.
- `assertSalesDealAccess(dealId)` — 404 / cross-org `FORBIDDEN`.
- `assertSalesAccountAccess(accountId)` — same pattern.

---

## 6. Audit

**Domain (`SalesAuditEvent`):**

- `sales.deal.created`
- `sales.deal.updated`
- `sales.deal.stage_changed`
- `sales.account.viewed`
- `sales.pipeline.viewed`

**Platform (`auditLogger`):** dual-write on deal create via `Product.SALES_OS` (string key `sales_os`, consistent with existing `Product` object pattern — not a Prisma enum).

---

## 7. Dashboard (`/sales`)

- Server `page.tsx` calls `getSalesDashboardStatsAction`.
- Client shows real **account count**, **deal count**, **open deals**, **open pipeline value (approx)**, **deals by stage** (top 3 stages with open deals), **latest updated deals**.
- AI insight, follow-up queue, and entity timeline remain **mock/TODO** for PR-2.
- Banner explains migration + seed when DB tables are empty or missing.

---

## 8. Validation performed in agent session

| Command | Result |
|---------|--------|
| `git status -sb` | (parent should confirm) |
| `npx prisma validate` | **Passed** (schema valid) |
| `jest src/lib/sales/__tests__/sales-services.test.ts` | **Passed** (8 tests) |
| `npm run build` | **Not run** (low-load) |
| `npm run lint` | **Not run** (low-load) |
| `npm test` (full) | **Not run** (low-load) |
| `npx prisma migrate dev` | **Not run** (forbidden in PR-1) |
| `npx prisma generate` | **Not run** (forbidden in PR-1) |

---

## 9. Risks

1. **Schema without migration** — TypeScript/Prisma client will not include new models until `prisma generate` after migration.
2. **Filtered `_count` on relations** — `getSalesDashboardStats` uses Prisma filtered counts; verify against your Prisma version after migrate.
3. **Dashboard action throws** if tables missing — UI shows error banner (intentional until migrate + seed).
4. **No RBAC product permissions** — uses global `UserRole` only (aligned with other early products).
5. **Platform audit dual-write** only on create — update/stage not duplicated to `PlatformAuditLog` in PR-1.

---

## 10. Intentionally not implemented (PR-1)

- Twenty CRM import or email/calendar/sync tables
- Deal delete, account CRUD UI, pipeline admin UI
- Product registry entry for SalesOS (marketing still shell)
- Full CRM, AI forecasting, contact sync
- E2E / Cypress for sales
- Global `prisma/seed.ts` hook (standalone `scripts/seed-sales-demo.ts` only)

---

## 11. Next recommended PR (PR-2 slice)

**Name:** `salesos_p0_ui` — exact scope:

1. Apply migration `salesos_p0_core` + document drift resolution in `docs/reports/`.
2. Deal list + detail routes under `/sales/deals` using existing actions.
3. Minimal create-deal form (account picker, stage, amount).
4. Wire `PlatformAuditLog` on update/stage change.
5. Replace mock timeline with `SalesAuditEvent` feed (read-only).
6. Add `salesos:read` / `salesos:create` permissions when platform RBAC matrix is ready.

---

## 12. Parent handoff summary

| Item | Value |
|------|--------|
| **Status** | DONE_WITH_CONCERNS (migration/generate not executed) |
| **Product level** | L4 foundation partial (~L3.5 UI + L4 data layer code-ready) |
| **Commands run** | Light reads/grep; `prisma validate` if succeeded |
| **Production readiness** | **No** — requires migration, generate, seed, and targeted test run |
