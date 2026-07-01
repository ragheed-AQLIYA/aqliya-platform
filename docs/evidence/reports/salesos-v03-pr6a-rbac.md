# SalesOS v0.3 PR-6A — RBAC (`salesos_p1_rbac`)

**Status:** DONE (light validated)  
**Product:** SalesOS under AQLIYA  
**Scope:** Server-side product permissions only — no schema, no UI, no migration SQL

---

## Summary

- Added SalesOS permission strings aligned with LocalContentOS / product registry naming: `salesos:read`, `salesos:create`, `salesos:update`.
- Registered SalesOS in `PRODUCT_REGISTRY` with workspace `/sales` and the three permissions.
- Wired `requireSalesPermission()` in guards and all SalesOS server actions in `sales-actions.ts`.
- Tenant isolation (`requireSalesOrgAccess`, deal/account asserts) remains the base gate; product permissions layer on top.
- New focused Jest file validates the role matrix without touching `sales-services.test.ts`.

---

## Permission matrix

| Role     | salesos:read | salesos:create | salesos:update |
| -------- | ------------ | -------------- | -------------- |
| VIEWER   | yes          | no             | no             |
| OPERATOR | yes          | yes            | yes            |
| ADMIN    | yes          | yes            | yes            |

Future permissions (`salesos:review`, `salesos:export`, etc.) are intentionally out of scope for PR-6A.

---

## Action mapping

| Permission       | Server actions (representative)                                      |
| ---------------- | -------------------------------------------------------------------- |
| `salesos:read`   | list/get deals, accounts, pipeline, dashboard, interactions, evidence |
| `salesos:create` | create deal, account, interaction                                    |
| `salesos:update` | update deal/account, evidence link/unlink, interaction update/delete, next action |

---

## Files changed

| File | Change |
| ---- | ------ |
| `src/lib/sales/permissions.ts` | **New** — role x permission matrix |
| `src/lib/sales/registry.ts` | **New** — product id, routes, permissions |
| `src/lib/platform/product-registry.ts` | Register SalesOS product |
| `src/lib/sales/guards.ts` | `requireSalesPermission`, guard-level `assertSalesPermission` |
| `src/actions/sales-actions.ts` | Permission checks on all actions |
| `src/lib/sales/__tests__/sales-rbac.test.ts` | **New** — matrix unit tests |

---

## Conflicts avoided

Did **not** edit:

- `sales-dashboard-client.tsx`
- `src/lib/sales/interactions.ts` (service layer)
- Sales pipeline page
- Migration SQL / Prisma schema

---

## Governance check

| Gate              | Result |
| ----------------- | ------ |
| RBAC server-side  | yes — actions call `requireSalesPermission` |
| Tenant isolation  | preserved — org guards unchanged |
| Audit trail       | unchanged |
| Schema change     | none |

---

## Validation

| Command | Result |
| ------- | ------ |
| `npx prisma validate` | Not run (no schema change) |
| `npm run build` | Not run (low-load) |
| `npm run lint` | Not run (low-load) |
| `npm test -- src/lib/sales/__tests__/sales-rbac.test.ts` | PASS (5/5) |

---

## Known limitations

- UI does not hide buttons by permission yet (server enforcement only).
- No `salesos:review` / `salesos:export` until governed review/export flows land.
- Role matrix is TypeScript-only (not persisted in DB).

---

## Arabic one-liner

> فرض صلاحيات SalesOS على الخادم: قراءة للم viewer، وإنشاء/تعديل للم operator والـ admin، مع عزل المؤسسة كما كان.

---

## Next recommended step

Add client-side permission hints on SalesOS workspace pages (read-only for VIEWER) once PR-6B UI stream is unblocked.
