# WIP Cluster Report — Repository Hygiene

**Date:** 2026-06-05  
**Analyst:** Platform Steward (analysis only)  
**Baseline `main` HEAD:** `1dbfa075c31fcd935b813cc952a09c6d4d1f3516`  
**Accepted security commits:** `90fea4e`, `1dbfa07`  
**Method:** `git status --porcelain`, `git diff --numstat` (no code or commits changed)

---

## Executive summary

| Metric | Value |
|--------|------:|
| Total WIP paths | **524** |
| Modified (`M`) | **246** |
| Deleted (`D`) | **58** |
| Untracked (`??`) | **220** |
| Approx. line churn (tracked diff) | **+4,891 / −10,648** |

**Largest cluster:** SalesOS (**272 paths**, ~8k deletions) — treat as a **product refactor branch**, not platform.

**Highest platform risk:** Uncommitted overlays on **already-committed** files (`audit-actions.ts`, `localcontent-actions.ts`) that can undo sampling (A1-02), LC-03 routing, or reintroduce guard drift.

**Cleanest platform extract:** `registration-actions.ts` (untracked only) — align with steward note; commit on isolated branch without Sales/LC WIP.

---

## Platform vs product separation

```text
main (committed, green baseline)
├── Platform (accepted): 90fea4e, 1dbfa07, 9897212, e958494, 163fe5f, 5cca20b, d680396
│
└── Working tree WIP (524 paths) — DO NOT merge as one commit
    ├── PLATFORM WIP (145 paths) — IC, auth, CI, infra, registration, middleware
    ├── PRODUCT WIP
    │   ├── SalesOS (272) — isolate first; highest blast radius
    │   ├── Docs (75) — low runtime risk; authority/sync review needed
    │   ├── AuditOS (18) — reconcile with e958494 audit-actions
    │   ├── Prisma (7) — migration coupling; CI-sensitive
    │   ├── LocalContentOS (5) — small but touches committed LC paths
    │   └── DecisionOS (2) — small; verify vs bbc905e D3-01
```

---

## Cluster: SalesOS

| Attribute | Assessment |
|-----------|------------|
| **File count** | **272** (170 modified, 58 deleted, 44 untracked) |
| **Line churn** | ~+1,278 / −8,046 |
| **Risk** | **CRITICAL** — mass deletion under `src/lib/sales/v02/**`, broad `src/lib/sales/vnext/**` and `src/components/sales/**` churn |
| **Commit readiness** | **Not ready** — needs dedicated review, test pass, and explicit archive/move plan for deleted v02 tree |
| **Recommended branch** | `wip/salesos-vnext-consolidation` |

### Representative paths

- **Modified:** `src/actions/sales-actions.ts`, `src/lib/sales/**`, `src/components/sales/**`, `src/app/sales/**`
- **Deleted:** `src/lib/sales/v02/**` (cross-product-signals, institutional-learning, proof-effectiveness, etc.)
- **Untracked:** Sales route `error.tsx` / `loading.tsx` shells, `src/actions/sales-contact-actions.ts`, `src/lib/sales/prisma-*.ts`, `src/lib/sales/_v02/`

### Steward notes

- Do **not** mix with platform or AuditOS commits.
- `src/lib/platform/signals/sales-signal-producer.ts` is modified but classified Platform-adjacent — review dependency if Sales branch merges first.
- Prisma migration `20260601180000_salesos_l5_governance` is modified in **Prisma** cluster — coordinate schema branch with Sales.

---

## Cluster: AuditOS

| Attribute | Assessment |
|-----------|------------|
| **File count** | **18** (3 modified, 15 untracked) |
| **Line churn** | ~+104 / −1,755 (deletions likely from `services.ts` reshuffle) |
| **Risk** | **HIGH** for `src/actions/audit-actions.ts` — WIP extends beyond committed `e958494` (sampling-only slice); includes `getAuditActorForMutation` refactor pattern |
| **Commit readiness** | **Partial** — untracked `error.tsx`/`loading.tsx` shells are low risk; **audit-actions WIP is not ready** until reconciled with HEAD |
| **Recommended branch** | `wip/auditos-loading-boundaries` (UI shells) + **discard or re-apply** `audit-actions` WIP separately |

### Representative paths

- **Modified:** `src/actions/audit-actions.ts`, `src/lib/audit/services.ts`, `src/lib/audit/storage/index.ts`
- **Untracked:** `src/app/audit/engagements/[engagementId]/*/error.tsx`, `loading.tsx` (trial-balance, validation, pilot, etc.)

### Conflict with `main`

| File | On `main` | In WIP | Action |
|------|-----------|--------|--------|
| `audit-actions.ts` | Sampling action only (`e958494`) | +138/−54 broader auth refactor | **Revert WIP** or branch explicitly; do not blind-merge |
| Sampling UI/routes | Committed | Clean | No WIP conflict |

---

## Cluster: LocalContentOS

| Attribute | Assessment |
|-----------|------------|
| **File count** | **5** (all modified) |
| **Line churn** | ~+68 / −22 |
| **Risk** | **MEDIUM** — touches `localcontent-actions.ts` (may reintroduce `guardLocalContent` beyond LC-03), `audit-events.ts` dual-write (excluded from LC commits) |
| **Commit readiness** | **Not ready as one blob** — split: (1) audit dual-write platform branch, (2) discard action guard WIP unless intentional |
| **Recommended branch** | `wip/localcontent-audit-dual-write` OR revert local LC action WIP |

### Representative paths

- `src/actions/localcontent-actions.ts`
- `src/actions/local-content-workspace-actions.ts`
- `src/lib/local-content/audit-events.ts`
- `src/lib/platform/signals/localcontent-signal-producer.ts`
- `src/app/local-content/outputs/page.tsx`

### Conflict with `main`

| File | On `main` | In WIP |
|------|-----------|--------|
| `scoring.ts`, `approval-routing.ts`, review/approval pages | LC-01, LC-03 committed | Should be **clean** — verify `git diff` before any LC work |
| `localcontent-actions.ts` | LC-03 routing action only | +30 lines likely guard/refactor WIP |
| `audit-events.ts` | Unchanged on main | Platform audit dual-write |

---

## Cluster: DecisionOS

| Attribute | Assessment |
|-----------|------------|
| **File count** | **2** (both modified) |
| **Line churn** | ~+130 / −9 |
| **Risk** | **MEDIUM** — `decisions.ts` may contain work beyond approved **D3-01** (`bbc905e`) |
| **Commit readiness** | **Review first** — diff against `bbc905e` scope (outcome dashboard only) |
| **Recommended branch** | `wip/decisionos-post-d3-01` (only if diff is intentional) |

### Representative paths

- `src/actions/decisions.ts`
- `src/actions/decision-evidence-actions.ts`

---

## Cluster: Platform

| Attribute | Assessment |
|-----------|------------|
| **File count** | **145** (38 modified, 107 untracked) |
| **Line churn** | ~+2,459 / −290 |
| **Risk** | **HIGH** — spans auth, AI/IC, CI/CD, infra, mocks, tests; easy to break green CI |
| **Commit readiness** | **Split into sub-branches** (see below) |
| **Recommended branch** | Multiple (see sub-clusters) |

### Platform sub-clusters (recommended split)

| Sub-cluster | ~Files | Risk | Readiness | Branch |
|-------------|-------:|------|-----------|--------|
| **Registration / tenant** | 1 untracked reg | Low | **Ready** (register only; tenant on main) | `platform/registration-actions` |
| **Intelligence Core / AI** | ~40+ untracked `src/lib/ai/**`, API routes | High | Needs `tsc`, `npm test`, pgvector CI | `platform/ic-ai-activation` |
| **Auth / MFA / sessions** | untracked `src/lib/auth/*`, `src/actions/mfa.ts`, settings routes | High | Security review | `platform/auth-mfa` |
| **CI / infra / deploy** | `.github/workflows/*`, `infra/terraform`, docker compose | Medium | Docs + ops review | `platform/infra-cicd` |
| **Core access / middleware** | `src/core/access`, `src/middleware*`, `src/lib/auth.ts` | High | Conflicts with `d680396` edge work | `platform/core-access-middleware` |
| **Scripts / validation** | `scripts/*`, `verification/`, root `BUILD_*.md` | Low | Docs/ops | `platform/ops-scripts` |
| **Tests / mocks** | `src/__tests__/**`, `src/__mocks__/**` | Medium | Tie to IC branch | same as IC |

### Critical platform WIP files (reconcile before any merge to `main`)

| Path | Issue |
|------|--------|
| `src/actions/registration-actions.ts` | Untracked; documented in SoT but not on `main` |
| `src/actions/audit-actions.ts` | Product-overlap (AuditOS) but **platform auth pattern** — keep off Sales branch |
| `package.json` / `package-lock.json` | Dependency drift — run `npm ci` on branch |
| `.github/workflows/ci.yml` | Modified — verify vs green local CI |

---

## Cluster: Docs

| Attribute | Assessment |
|-----------|------------|
| **File count** | **75** (24 modified, 51 untracked) |
| **Line churn** | ~+625 / −493 |
| **Risk** | **LOW** runtime — **MEDIUM** authority drift (official vs source-of-truth vs validation reports) |
| **Commit readiness** | **Ready** as docs-only branch after quick authority pass |
| **Recommended branch** | `docs/program-reports-2026-06` |

### Representative paths

- **Modified:** `docs/official/*`, `docs/source-of-truth/*`, `docs/README.md`
- **Untracked:** `docs/execution-backlog/`, `docs/validation/`, `docs/deployment/`, `docs/operations/parallel-execution-*`, `docs/archive/code/sales-v02/`

### Steward notes

- `docs/archive/code/sales-v02/` aligns with SalesOS v02 deletion — commit with Sales or docs archive policy.
- `docs/operations/platform-action-guards.md` is **on main** (`90fea4e`) — not WIP.

---

## Cluster: Prisma

| Attribute | Assessment |
|-----------|------------|
| **File count** | **7** (3 modified, 4 untracked) |
| **Line churn** | ~+240 / −47 |
| **Risk** | **HIGH** — schema + 3 new migrations affect CI `db push`, pgvector, seeds |
| **Commit readiness** | **Not ready** without migration review and coordinated product owner |
| **Recommended branch** | `platform/prisma-ic-notifications` |

### Representative paths

- **Modified:** `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/20260601180000_salesos_l5_governance/migration.sql`
- **Untracked:** `20260603000001_add_platform_secret_and_notification/`, `20260603220000_add_notification_preferences/`, `20260605000001_ic01_pgvector_document_chunk/`, `prisma/seed-sales.ts`

### Dependencies

- Tied to **Platform** (IC/pgvector, notifications) and **SalesOS** (governance migration edit).
- Must run before claiming IC feature branches production-safe.

---

## Cross-cluster dependency matrix

| From → To | Dependency |
|-----------|------------|
| Prisma → Platform IC | pgvector migration required for RAG tests |
| Prisma → SalesOS | salesos_l5_governance migration edit |
| Platform AI → AuditOS | `audit-ai-bridge`, governed AI (do not merge Audit WIP auth blindly) |
| SalesOS → Docs | archive copies under `docs/archive/code/sales-v02/` |
| LocalContentOS → Platform | `audit-events` dual-write, signal producer |
| Docs → All | Status matrices may claim features not on `main` until WIP lands |

---

## Recommended hygiene sequence (no feature work)

1. **Freeze `main`** — treat `1dbfa07` as platform security baseline; no mixed commits.
2. **Stash or branch entire WIP** — `git stash push -u -m "wip-2026-06-05-full"` OR one branch per cluster above.
3. **Land platform-only quick wins**
   - `platform/registration-actions` (untracked file only)
   - Keep `tenant-actions` on `main` (already `1dbfa07`)
4. **Revert dangerous overlays on committed files**
   - `src/actions/audit-actions.ts` → match `e958494` unless opening dedicated auth-refactor PR
   - `src/actions/localcontent-actions.ts` → match `163fe5f` unless opening guard-refactor PR
5. **SalesOS last** — largest cluster; own branch + full test/build cycle.
6. **Docs parallel** — low risk; merge when authority review done.
7. **Prisma with IC** — single branch with CI pgvector job validation.

---

## Commit readiness summary

| Cluster | Readiness | Rationale |
|---------|-----------|-----------|
| **SalesOS** | 🔴 Not ready | Mass deletes + prototype churn |
| **AuditOS** | 🟡 Partial | UI shells OK; audit-actions WIP conflicts with `e958494` |
| **LocalContentOS** | 🟡 Split | LC commits on main; WIP is overlay/dual-write |
| **DecisionOS** | 🟡 Review | Small diff; verify D3-01 boundary |
| **Platform** | 🟡 Split | Sub-branches; registration ready in isolation |
| **Docs** | 🟢 Ready (docs-only) | No build impact |
| **Prisma** | 🔴 Not ready | Migrations + schema need review |

---

## Validation checklist (per branch, before merge to `main`)

```bash
npx tsc --noEmit
node scripts/audit-action-guards.mjs
node scripts/demo-smoke-check.mjs
npm test
npm run build
# If Prisma branch:
npx prisma validate
npx prisma db push   # CI parity
```

---

## References

- Committed Phase 2: `5cca20b` (LC-01), `163fe5f` (LC-03), `e958494` (A1-02), `9897212` (test fix)
- Security: `90fea4e`, `1dbfa07`
- Build baseline: `d680396`
- D3-01: `bbc905e`

---

*Generated by Platform Steward — analysis only. No application code or git commits were made for this report.*
