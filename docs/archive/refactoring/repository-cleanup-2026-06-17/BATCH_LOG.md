# Repository Cleanup — Batch Execution Log

**Program:** `docs/refactoring/repository-cleanup-2026-06-17/`

---

## Batch 1 — Duplicate deletion + favicon fix

**Date:** 2026-06-17  
**Risk:** Low  
**Reversible:** `git restore` on deleted paths

### Actions

| Action | Count | Details |
|--------|------:|---------|
| DELETE `(1).ts` duplicates | 19 | See DUPLICATE_REMOVAL_PLAN Category A |
| DELETE `.bak` marketing pages | 11 | See Category B |
| UPDATE favicon refs | 2 | `layout.tsx`, `manifest.ts` → `/favicon.svg`, `/brand/aqliya-mark.svg` |

### Evidence

- Grep 2026-06-17: zero imports of ` (1).ts` modules in `src/`
- `.bak` files not routed by Next.js App Router

### Validation

| Command | Result | Notes |
|---------|--------|-------|
| `npx tsc --noEmit` | **PASS** | 2026-06-17 post Batch 1; 0 errors |
| Import grep post-delete | Pending | Re-run after batch |

### Result

**Status:** EXECUTED — 31 files removed, 2 files updated, eslint scope expanded (Batch 3)

---

## Batch 2 — Documentation scaffolding

**Date:** 2026-06-17

| Action | Path |
|--------|------|
| CREATE | `docs/reports/README.md` |
| CREATE | All plans under `docs/refactoring/repository-cleanup-2026-06-17/` |

**Status:** EXECUTED

---

## Batch 3 — ESLint scope

**Date:** 2026-06-17

| Action | File |
|--------|------|
| UPDATE | `eslint.config.mjs` — ignore `docs/**`, `knowledge-foundation/**`, `archive/**`, `backups/**` |

**Status:** EXECUTED

---

## Batch 4 — Empty directory removal

**Date:** 2026-06-17  
**Risk:** Low

| Action | Path | Reason |
|--------|------|--------|
| DELETE (empty dir) | `src/lib/contacts/` | 0 files; LocalContactOS uses `localcontactos/` |
| DELETE (empty dir) | `src/lib/utils/` | 0 files |
| DELETE (empty dir) | `src/lib/i18n/` | 0 files; i18n at repo root |

**Skipped:** `src/lib/risk/` — routes exist under `src/app/risk/`; populate in Phase 5.

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |

**Status:** EXECUTED

---

## Batch 5 — Duplicate doc archive

**Date:** 2026-06-17  
**Risk:** Low

| Source | Target | Reason |
|--------|--------|--------|
| `docs/audits/RELEASE_DECISION.md` (167 lines) | `docs/archive/2026-06/RELEASE_DECISION-audits-copy.md` | Duplicate of review copy |
| `docs/audits/RELEASE_DECISION.md` | Replaced with 8-line pointer | Canonical: `docs/review/RELEASE_DECISION.md` |

**Status:** EXECUTED

---

## Batch 6 — Runbooks cross-link (partial)

**Date:** 2026-06-17  
**Risk:** Low — no file moves

| Action | File |
|--------|------|
| UPDATE | `runbooks/README.md` — link to `docs/operations/`, backup index |
| UPDATE | `runbooks/backup-restore.md` — cross-ref to `docs/operations/backup-restore-procedure.md` |

**Deferred:** Moving `runbooks/` → `docs/operations/runbooks/` (requires link sweep)

**Status:** EXECUTED (cross-link only)

---

## Batches 7–10

**Status:** EXECUTED (partial Batch 8; Batch 10 scripts deferred)

---

## Batch 7 — Remove unreferenced `sales/_v02` tree

**Date:** 2026-06-17  
**Risk:** Low  
**Reversible:** `git restore src/lib/sales/_v02`

### Evidence

- Grep 2026-06-17: **zero** imports of `@/lib/sales/_v02` in `src/`
- Active Sales code imports `@/lib/sales/v02/` (no underscore) via `vnext/` and services
- `docs/operations/salesos-migration-runbook.md`: `_v02` excluded from build — dead duplicate tree

### Actions

| Action | Path | Count |
|--------|------|------:|
| DELETE | `src/lib/sales/_v02/` | 62 files |

### Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |

**Status:** EXECUTED

---

## Batch 8 — Decision route redirect (partial)

**Date:** 2026-06-17  
**Risk:** Low

### Actions

| Action | File | Detail |
|--------|------|--------|
| ADD redirect | `next.config.mjs` | `/decision` → `/decisions` (permanent) |

### Deferred

- `/decision/gov/*` — unique governance UI; no 1:1 target under `/decisions/` yet
- Removing `src/app/decision/` pages — after gov migration or explicit redirect map

**Status:** EXECUTED (redirect only)

---

## Batch 9 — Merge `docs/product/` → `docs/products/`

**Date:** 2026-06-17  
**Risk:** Low — pointer stubs preserve old paths

### Actions

| Action | Detail |
|--------|--------|
| MOVE | 226 files `docs/product/*` → `docs/products/` |
| CREATE | `docs/product/README.md` — redirect stub |
| UPDATE | `docs/README.md` — authority map + navigation table |

### Notes

- Internal links in moved files may still say `docs/product/` — update opportunistically, not mass-replaced
- Canonical folder: **`docs/products/`**

**Status:** EXECUTED

---

## Batch 10 — Recovery docs archive + scripts (partial)

**Date:** 2026-06-17

### Actions

| Action | Detail |
|--------|--------|
| MOVE | 7 `.md` files `docs/recovery/` → `docs/archive/2026-06/recovery/` |
| CREATE | `docs/recovery/README.md` — redirect stub |

### Deferred

- `scripts/` regrouping — requires `package.json` / CI script path audit first

**Status:** EXECUTED (recovery archive only)

---

## Next proposed batches (optional)

| Batch | Work | Status |
|-------|------|--------|
| 18 | Root misc cleanup → `remediation/`, `workflowos/`, `ops/`, `dev/` | **DONE** |
| 19 | Active-doc link refresh for old `scripts/` paths (skip archive/audits) | **DONE** |

---

## Batch 17 — `scripts/localcontent/` + `scripts/ic/`

**Date:** 2026-06-17  
**Risk:** Medium — npm + PowerShell cwd fixes

### Actions

| Action | Detail |
|--------|--------|
| MOVE | 12 scripts → `scripts/localcontent/` |
| MOVE | 12 scripts → `scripts/ic/` |
| FIX | Repo paths (`../../.env`, `../../src`, `../../docs`); PS1 `$PSScriptRoot\..\..` |
| FIX | `phase0-workflow-validation.ts` → output `../phase0-output/` |
| FIX | `cycle6-*.ps1` internal node paths → `scripts/ic/` |
| UPDATE | `package.json` — lc:*, ic:*, cycle6:*, eval:*, dev:localcontent-pilot |
| CREATE | `scripts/localcontent/README.md`, `scripts/ic/README.md` |

### Validation

| Command | Result |
|---------|--------|
| `npm run demo:smoke` | **PASS** |
| `npm run factory:smoke:static` | **PASS** |

**Status:** EXECUTED

---

## Batch 16 — `scripts/audit/` regroup

**Date:** 2026-06-17  
**Risk:** Medium — npm paths + dynamic `../src` imports

### Actions

| Action | Detail |
|--------|--------|
| MOVE | 40 AuditOS/TB/factory/shalfa/phase-3b/recon/p10–p14 scripts → `scripts/audit/` |
| FIX | Repo-root paths: `../../.env`, `../../docs`, `../../src` (dynamic imports) |
| UPDATE | `package.json` — 16 npm script paths (tb:*, shalfa:*, phase-3*, factory:*) |
| UPDATE | `docs/systems/auditos/RECONCILIATION_ENGINE.md` — recon script path |
| CREATE | `scripts/audit/README.md` |

### Unchanged

- `scripts/mock-server-only.cjs` preload path

### Validation

| Command | Result |
|---------|--------|
| `npm run demo:smoke` | **PASS** |
| `npm run factory:smoke:static` | **PASS** |

**Status:** EXECUTED

---

## Batch 15 — `scripts/platform/` regroup

**Date:** 2026-06-17  
**Risk:** Medium — binding paths updated atomically

### Actions

| Action | Detail |
|--------|--------|
| MOVE | 33 platform scripts → `scripts/platform/` |
| FIX | `__dirname` → repo root (`../../.env`, `../../backups`) in 23 TS/MJS files |
| UPDATE | `package.json` — 40+ npm script paths |
| UPDATE | CI: `backup.yml`, `deploy.yml`, `promote.yml` |
| UPDATE | `demo-smoke-check.mjs` internal pgvector paths |
| UPDATE | Runbooks (`backup-restore`, `staging-environment`, `alerting`), `ACTION_GUARD_MATRIX.md`, `AGENTS.md`, production runbook |
| CREATE | `scripts/platform/README.md` |

### Unchanged at root

- `scripts/mock-server-only.cjs` — preload path stability

### Validation

| Command | Result |
|---------|--------|
| `npm run demo:smoke` | **PASS** |
| `npm run validate:env` | Run at report time |

**Status:** EXECUTED

---

**Date:** 2026-06-17  
**Risk:** Low (audit + non-binding file move)

### Actions

| Action | Detail |
|--------|--------|
| CREATE | `SCRIPTS_PATH_AUDIT.md` — 75 package.json refs, 3 CI paths, regroup checklist |
| MOVE | 25 `scripts/_*` one-time scripts → `scripts/archived/` |
| UPDATE | `scripts/README.md` — archived folder + audit link |

### Evidence

- Grep: zero `package.json` / CI references to `scripts/_*`
- `mock-server-only.cjs` stays at root (22+ npm preload refs)

### Deferred

- Active script subfolder regroup (`platform/`, `audit/`, etc.) — Batch 15+

**Status:** EXECUTED

---

## Batch 13 — `docs/product/` → `docs/products/` link fixes

**Date:** 2026-06-17  
**Risk:** Low — path corrections only

### Scope

Updated **active** documentation trees; left **archive/** and **audits/** evidence snapshots unchanged (point-in-time).

### Actions

| Action | Detail |
|--------|--------|
| BULK REPLACE | `docs/product/` → `docs/products/` in 96 `.md` files under `products/`, `commercial/`, `pilot/`, `systems/`, `review/`, etc. |
| FIX | Relative links `../product/` → `../products/` in `pilot/PILOT-PACK-INDEX.md`, `commercial/README.md` |
| UPDATE | `DOCUMENTATION_AUTHORITY.md`, `DOCUMENTATION_GOVERNANCE.md`, `DOCUMENTATION_INVENTORY.md` |
| UPDATE | `docs/products/README.md` — canonical path note |
| FIX | `docs/operations/parallel-execution-cycle-2026-06-07-roadmap-phase3.md` |

### Intentionally unchanged

- `docs/archive/**` — historical references preserved
- `docs/audits/**` — forensic/reality audit evidence (100+ index entries)
- `docs/refactoring/**` — cleanup plan docs reference old paths by design

**Status:** EXECUTED

---

## Batch 11 — Migrate `/decision/gov` → `/decisions/gov`

**Date:** 2026-06-17  
**Risk:** Medium (route move; redirects preserve bookmarks)

### Evidence

- Nav, sidebar, command palette already use `/decisions` as canonical
- `/decision/page.tsx` duplicated dashboard; `/decision` already redirects to `/decisions` (Batch 8)
- `/decision/gov` is platform-level governance (escalation rules) — distinct from `/decisions/[id]/governance`

### Actions

| Action | Detail |
|--------|--------|
| MOVE | `src/app/decision/gov/*` → `src/app/(dashboard)/decisions/gov/*` |
| CREATE | `decisions/gov/layout.tsx` — sub-nav (لوحة القرارات / الحوكمة) |
| DELETE | Entire `src/app/decision/` legacy tree (9 files) |
| UPDATE | Internal links + `revalidatePath` → `/decisions/gov` |
| ADD redirects | `/decision/gov`, `/decision/gov/:path*` → `/decisions/gov/*` |
| UPDATE | `ROUTE_STRATEGY.md`, `ROUTE_REGISTRY.md`, Cypress e2e |

### Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** (after clearing stale `.next/`) |

**Status:** EXECUTED

---

## Batch 12 — Scripts inventory refresh (no physical moves)

**Date:** 2026-06-17  
**Risk:** Low — documentation only

### Actions

| Action | Detail |
|--------|--------|
| UPDATE | `scripts/README.md` — full inventory (155 files), category map, npm script index |
| DEFER | Physical regroup into `scripts/{platform,audit,localcontent,...}/` — requires `package.json` + CI + `.github/workflows` path audit |

**Status:** EXECUTED (inventory only)

---

## Batch 18 — Root misc scripts regroup

**Date:** 2026-06-17  
**Risk:** Low — ad-hoc scripts; no `package.json` bindings

### Actions

| Action | Detail |
|--------|--------|
| CREATE | `scripts/remediation/`, `workflowos/`, `ops/`, `dev/` |
| MOVE | 8 phase20–24 scripts → `remediation/` |
| MOVE | 5 Sunbul/WorkflowOS scripts → `workflowos/` |
| MOVE | 9 ops scripts → `ops/` (retention, migrations, admin, archive PS1) |
| MOVE | 2 dev QA scripts → `dev/` |
| FIX | `../../src` imports in moved TS/MJS; PS1 `$PSScriptRoot\..\..` |
| FIX | `run-retention.mjs`, `validate-sunbul-e2e.ts` — corrected triple-`../` regression |
| CREATE | Subfolder READMEs + refreshed `scripts/README.md` |
| UPDATE | `L6_COMPLETION_PROGRAM.md`, `docs/clients/sunbul/README.md` paths |

### Root after batch

Only `mock-server-only.cjs` + `README.md` remain at `scripts/` root.

### Validation

| Command | Result |
|---------|--------|
| `npm run demo:smoke` | **PASS** |

**Status:** EXECUTED

---

## Program status

Repository cleanup **Batches 1–18 complete** (2026-06-17). Optional Batch 19: opportunistic doc link fixes in active docs (not archive/audits).

---

## Batch 19 — Active doc script path refresh

**Date:** 2026-06-17  
**Risk:** Low — documentation only

### Scope

Updated **active** trees: `docs/operations/`, `docs/source-of-truth/`, `docs/systems/`, `docs/releases/`, `runbooks/`, `SCRIPTS_PATH_AUDIT.md`.  
**Skipped:** `docs/archive/**`, `docs/audits/**` (point-in-time evidence).

### Actions

| Action | Detail |
|--------|--------|
| REPLACE | 28 flat `scripts/<file>` → subfolder paths (platform/, audit/, ic/, localcontent/) across **32 files** |
| FIX | `seed-sales-demo.ts` → `prisma/seed-sales.ts` (file never existed at old path) |
| FIX | `_l6-smoke-worker2.ts` → `scripts/archived/_l6-smoke-worker2.ts` in release evidence |
| UPDATE | `SCRIPTS_PATH_AUDIT.md` — PowerShell cross-ref paths |

### Validation

| Command | Result |
|---------|--------|
| Stale-path grep (active docs) | **0** remaining flat paths |
| `npm run demo:smoke` | **PASS** |

**Status:** EXECUTED

---

## Program status (final)

Repository cleanup program **complete** (Batches 1–19, 2026-06-17).

---

## Ship gate — Security P0 (2026-06-17)

**Scope:** Post-cleanup trust gate — not repo reorganization.

### Actions

| Action | Detail |
|--------|--------|
| DELETE | `src/app/api/test-token/route.ts` — JWT/cookie disclosure endpoint |
| CREATE | `src/__tests__/unit/no-test-token-route.test.ts` — regression guard |
| REFACTOR | `CoreAccessControl` — deny-by-default + action role matrix + denial audit |
| UPDATE | `server-action-guard.ts` — passes session `role` into core checks |
| CREATE | `src/core/access/__tests__/access-control.test.ts` |
| UPDATE | `cross-tenant-isolation.test.ts` §6 — deny-by-default expectations |
| SYNC | SalesOS maturity: L5 overclaim → **L4 internal preview** in `PRODUCT_STATUS_MATRIX.md` + `AQLIYA_MASTER_REFERENCE.md` |

### Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm test -- access-control, no-test-token, cross-tenant-isolation` | **PASS** (87 tests) |
| `npm run demo:smoke` | **PASS** |

**Status:** EXECUTED

---

## Ship gate P1 — MFA JWT + skills API (2026-06-17)

### Actions

| Action | Detail |
|--------|--------|
| UPDATE | `auth-config.ts` — `mfaEnabled`/`mfaVerified` on JWT login + session update |
| CREATE | `src/lib/auth/mfa-gate.ts` + `mfa-gate.test.ts` |
| UPDATE | `middleware.ts` — `/api/skills/*` matcher + ADMIN RBAC + MFA gate helper |
| UPDATE | `/api/skills/evaluate` — GET/POST require `requireUserContext("ADMIN")` |
| CREATE | `skills/evaluate/__tests__/route.test.ts` |
| UPDATE | MFA verify route — sets `mfaEnabled` + `mfaVerified` on session cookie |

### Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** (after `tb-loader.ts` generic fix) |
| Targeted P1 security tests | **PASS** (16 tests) |
| `npm run demo:smoke` | **PASS** |

**Status:** EXECUTED
