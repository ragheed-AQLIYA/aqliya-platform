# LocalContentOS L6 — Commit Execution Pack

**Date:** 2026-06-01  
**Status:** AWAITING USER APPROVAL — **DO NOT RUN** until user explicitly requests commit  
**Prepared by:** Landing prep (Blocker B4) — git status/diff only; no staging, no commits, no build/test/migrate  
**Project root:** `C:\Users\PC\Documents\Aqliya`

---

## Commit readiness verdict

| Item | Status |
|------|--------|
| **Execution pack ready** | **YES** — six commits defined with exact paths and messages |
| **Safe to commit as-is** | **NO** — see gaps below before approval |
| **Pre-commit gates verified** | **NOT RUN** (per low-load / no-commit instruction) |

### Gaps vs `localcontentos-commit-plan.md`

1. **`prisma/schema.prisma`** — diff adds **7 ContentStudio models + 7 SalesOS models**. Commit 5 must use `git add -p` (Content Studio hunks only).
2. **`prisma/seed.ts`** — working diff is **SalesOS-only** (`SEED_SALES_DEMO` / `execSync`). **No LC seed hunks** — **omit from Commit 5** unless LC lines are added first.
3. **`src/actions/localcontent-actions.ts`** (modified) — audit-logger hardening (`Product.LOCAL_CONTENT`); **not listed in plan**. Recommend **Commit 2** (governed actions) or **Commit 1** (L6 hardening). Included below as optional hunk in Commit 2.
4. **`src/lib/platform/audit-logger.ts`** (modified) — adds `SALES_OS` constant. **Exclude** from LocalContentOS commits (SalesOS).
5. **Other LC doc folders** (`localcontentos-persistence-consolidation/`, `localcontentos-prisma-cutover/`, `localcontentos-prisma-smoke/`) — untracked but **outside Commit 6 scope** per plan.
6. **Scratch files** — 7× `tmp-*` untracked; **never stage**.

### Excluded from all commits (verified in working tree)

- `src/lib/sales/**`, `src/app/sales/**`, `src/actions/sales-actions.ts`
- `prisma/migrations/20260601140000_*`, `20260601150000_*`, `20260601160000_*`
- `scripts/seed-sales-demo.ts`
- `src/app/sales/page.tsx` (modified — SalesOS dashboard refactor)
- `src/lib/platform/audit-logger.ts` (SalesOS product key)
- `SOFT_LAUNCH_APPROVAL_REQUESTS.md`, `docs/operations/salesos-*`, `docs/product/salesos-*`, `docs/releases/website-soft-launch/**`
- `tmp-q.ts`, `tmp-query-projects.*`, `tmp-seed-smoke.*`, `tmp-write-status.mjs`

---

## File counts per commit (LocalContentOS scope)

| Commit | Files staged | Notes |
|--------|-------------:|-------|
| 1 — Domain + services | **22** | All untracked |
| 2 — Server actions | **1–2** | 1 required + optional `localcontent-actions.ts` |
| 3 — UI routes + components | **14** | 6 app + 8 components (2 modified, 12 new) |
| 4 — Platform registry | **2** | 1 new file + partial `index.ts` |
| 5 — Prisma schema + migration | **2** | migration.sql + partial schema; **0 seed** |
| 6 — L6 documentation | **34** | `localcontentos-completion/**` (incl. this pack) |
| **Total (LC scope)** | **75–76** | Excludes SalesOS, tmp, audit-logger |

---

## Commit 1 — Domain + service layer (incl. L6 hardening)

**Message:** `feat(localcontentos): add Content Studio domain, services, and L6 hardening`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add src/lib/local-content/content/
git add src/lib/local-content/index.ts
git add src/lib/local-content/registry.ts
git add jest.content-studio-prisma.config.js
git commit -m "feat(localcontentos): add Content Studio domain, services, and L6 hardening"
```

**Files (22):**

```
jest.content-studio-prisma.config.js
src/lib/local-content/index.ts
src/lib/local-content/registry.ts
src/lib/local-content/content/ai.ts
src/lib/local-content/content/contracts.ts
src/lib/local-content/content/evidence.ts
src/lib/local-content/content/file-repository.ts
src/lib/local-content/content/index.ts
src/lib/local-content/content/outputs.ts
src/lib/local-content/content/permissions.ts
src/lib/local-content/content/prisma-repository.ts
src/lib/local-content/content/repository-instance.ts
src/lib/local-content/content/repository-interface.ts
src/lib/local-content/content/repository.ts
src/lib/local-content/content/review.ts
src/lib/local-content/content/services.ts
src/lib/local-content/content/store.ts
src/lib/local-content/content/tenant-scope.ts
src/lib/local-content/content/types.ts
src/lib/local-content/content/workflow.ts
src/lib/local-content/content/__tests__/content-studio.test.ts
src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts
```

**Pre-commit verify (when approved):** `npm test -- content-studio.test.ts` → 25/25 PASS

---

## Commit 2 — Server actions + RBAC

**Message:** `feat(localcontentos): add governed workspace server actions`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add src/actions/local-content-workspace-actions.ts
# Optional — audit logger consistency for compliance actions (modified, not in original plan):
# git add -p src/actions/localcontent-actions.ts
git commit -m "feat(localcontentos): add governed workspace server actions"
```

**Files (1 required):**

```
src/actions/local-content-workspace-actions.ts
```

**Optional (+1 if staged with -p):**

```
src/actions/localcontent-actions.ts   # M — Product.LOCAL_CONTENT audit hardening
```

**Pre-commit verify (when approved):** grep `assertLocalContentPermission` on all mutations in workspace actions

---

## Commit 3 — UI routes and components

**Message:** `feat(localcontentos): add Content Studio UI routes and forms`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add src/app/local-content/campaigns/
git add src/app/local-content/outputs/
git add src/app/local-content/review/
git add src/app/local-content/page.tsx
git add src/components/local-content/campaign-content-item-form.tsx
git add src/components/local-content/campaign-content-source-form.tsx
git add src/components/local-content/content-item-studio-actions.tsx
git add src/components/local-content/content-review-queue.tsx
git add src/components/local-content/content-studio-nav.tsx
git add src/components/local-content/create-campaign-form.tsx
git add src/components/local-content/create-content-output-form.tsx
git add src/components/local-content/create-content-project-form.tsx
git add src/components/local-content/local-content-shell.tsx
git commit -m "feat(localcontentos): add Content Studio UI routes and forms"
```

**Files (14 — only changed/new; pre-existing tracked project routes unchanged):**

```
src/app/local-content/page.tsx                                    # M
src/app/local-content/campaigns/page.tsx                          # ??
src/app/local-content/campaigns/[id]/page.tsx                     # ??
src/app/local-content/outputs/page.tsx                            # ??
src/app/local-content/review/page.tsx                             # ??
src/components/local-content/local-content-shell.tsx              # M
src/components/local-content/campaign-content-item-form.tsx       # ??
src/components/local-content/campaign-content-source-form.tsx     # ??
src/components/local-content/content-item-studio-actions.tsx      # ??
src/components/local-content/content-review-queue.tsx             # ??
src/components/local-content/content-studio-nav.tsx               # ??
src/components/local-content/create-campaign-form.tsx             # ??
src/components/local-content/create-content-output-form.tsx       # ??
src/components/local-content/create-content-project-form.tsx      # ??
```

---

## Commit 4 — Platform registry

**Message:** `feat(platform): register LocalContentOS in product registry`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add src/lib/platform/product-registry.ts
git add -p src/lib/platform/index.ts
# Stage ONLY the product-registry export line — do NOT stage unrelated hunks
git commit -m "feat(platform): register LocalContentOS in product registry"
```

**Files (2):**

```
src/lib/platform/product-registry.ts                              # ??
src/lib/platform/index.ts                                         # M — export product-registry only
```

**Do NOT stage:** `src/lib/platform/audit-logger.ts` (SalesOS `SALES_OS` constant)

---

## Commit 5 — Prisma schema + migration (Content Studio only)

**Message:** `feat(prisma): add LocalContentOS Content Studio schema and migration`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add prisma/migrations/20260601120000_localcontentos_content_studio/
git add -p prisma/schema.prisma
# Stage ONLY ContentStudio* model hunks — reject Sales* model hunks
# prisma/seed.ts — SKIP (current diff is SalesOS-only; no LC hunks)
git commit -m "feat(prisma): add LocalContentOS Content Studio schema and migration"
```

**Files (2):**

```
prisma/migrations/20260601120000_localcontentos_content_studio/migration.sql
prisma/schema.prisma                                              # M — ContentStudio* partial only
```

**ContentStudio models to stage (7):** `ContentStudioProject`, `ContentStudioCampaign`, `ContentStudioSource`, `ContentStudioItem`, `ContentStudioReview`, `ContentStudioApproval`, `ContentStudioOutput`

**Do NOT stage:** SalesOS models (`SalesPipeline`, `SalesAccount`, `SalesDeal`, etc.) or SalesOS migrations

**Note:** Migration applied on localhost per `localcontentos-migration-readiness.md`; SalesOS schema drift on shared DB must be resolved before deploy.

---

## Commit 6 — L6 completion documentation

**Message:** `docs(localcontentos): add L6 program evidence pack`

**Commands (AWAITING USER APPROVAL):**

```powershell
git add docs/releases/localcontentos-completion/
git commit -m "docs(localcontentos): add L6 program evidence pack"
```

**Files (34):**

```
docs/releases/localcontentos-completion/agent-00-gatekeeper.md
docs/releases/localcontentos-completion/agent-01-product-architecture.md
docs/releases/localcontentos-completion/agent-02-domain-contracts.md
docs/releases/localcontentos-completion/agent-03-service-layer.md
docs/releases/localcontentos-completion/agent-04-workflow-integration.md
docs/releases/localcontentos-completion/agent-05-evidence-source-integration.md
docs/releases/localcontentos-completion/agent-06-governed-ai-integration.md
docs/releases/localcontentos-completion/agent-07-review-approval.md
docs/releases/localcontentos-completion/agent-08-output-engine.md
docs/releases/localcontentos-completion/agent-09-server-actions.md
docs/releases/localcontentos-completion/agent-10-workspace-ui.md
docs/releases/localcontentos-completion/agent-11-navigation-registry.md
docs/releases/localcontentos-completion/agent-12-targeted-tests.md
docs/releases/localcontentos-completion/agent-13-typescript-validation.md
docs/releases/localcontentos-completion/agent-14-smoke-results.md
docs/releases/localcontentos-completion/agent-l6-backend-hardening.md
docs/releases/localcontentos-completion/agent-l6-workspace-ui.md
docs/releases/localcontentos-completion/final-integrator-report.md
docs/releases/localcontentos-completion/localcontentos-commit-plan.md
docs/releases/localcontentos-completion/localcontentos-commit-recommendation.md
docs/releases/localcontentos-completion/localcontentos-commit-execution-ready.md
docs/releases/localcontentos-completion/localcontentos-completion-status.md
docs/releases/localcontentos-completion/localcontentos-human-smoke-checklist.md
docs/releases/localcontentos-completion/localcontentos-l6-completion-status.md
docs/releases/localcontentos-completion/localcontentos-l6-final-report.md
docs/releases/localcontentos-completion/localcontentos-l6-gap-matrix.md
docs/releases/localcontentos-completion/localcontentos-l6-governance-checklist.md
docs/releases/localcontentos-completion/localcontentos-l6-readiness-scorecard.md
docs/releases/localcontentos-completion/localcontentos-l6-roadmap.md
docs/releases/localcontentos-completion/localcontentos-manual-smoke-steps-3-6.md
docs/releases/localcontentos-completion/localcontentos-migration-readiness.md
docs/releases/localcontentos-completion/localcontentos-pilot-handoff.md
docs/releases/localcontentos-completion/localcontentos-schema-proposal.md
docs/releases/localcontentos-completion/localcontentos-smoke-steps-3-6-manual.md
docs/releases/localcontentos-completion/localcontentos-v01-readiness-scorecard.md
```

---

## Pre-commit checklist (user must confirm before any commit)

- [ ] Smoke step 5 PASS or waiver documented in `agent-14-smoke-results.md`
- [ ] Unit tests **25/25 PASS** (`content-studio.test.ts`)
- [ ] LocalContentOS tsc clean on LC paths (or documented exception)
- [ ] No secrets or `tmp-*` files staged
- [ ] `git add -p` completed for `schema.prisma` (no SalesOS hunks)
- [ ] `seed.ts` omitted unless LC hunks exist
- [ ] User explicitly requested commit
- [ ] L6 scorecard reviewed — **L5 with conditions**; **not** Production Ready

## Production claim

**NO**

---

*Generated 2026-06-01 from `git status --short` + `git diff --stat` — no git add/commit performed.*
