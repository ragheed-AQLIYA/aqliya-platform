# Repo Forensics Report

**Generated:** 2026-06-22 (live investigation)  
**Repo:** `ragheed-AQLIYA/aqliya-platform`  
**HEAD:** `6f607840ac032e13c07564c7bbc873772ca076fa`

## Scope

Evidence from: `.github/workflows/*`, `gh run list/view`, local `npm run lint`, `git log`.

---

## Workflows Inventory

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR `main` | tsc, test, lint, build (Postgres pgvector service) |
| `deploy.yml` | push `main`/`staging`, dispatch | AWS ECS + Terraform |
| `backup.yml` | cron daily, dispatch | DB backup artifact |
| `promote.yml` | manual dispatch | Staging health → promote image to prod ECS |
| `preview.yml` | PR `main` | Build + Vercel preview deploy |

---

## Findings

### F-01 — CI failing on HEAD (real failure)

| Field | Value |
|-------|-------|
| **Severity** | P0 |
| **Run** | `27915896494` (2026-06-21), commit `6f60784` |
| **Failed step** | `Lint` (steps 1–9 passed: db push, tsc, tests) |
| **Root cause** | ESLint errors (4 on CI log; 6 on local run) |
| **Evidence** | `gh run view 27915896494 --json jobs` → Lint `failure`; log lines `@typescript-eslint/no-explicit-any` in `abac-service.ts`, `@typescript-eslint/ban-ts-comment` in signal producers |
| **Fix** | Resolve 6 lint **errors** in: `src/lib/core/policy/access/abac-service.ts` (L268, L281), `src/lib/core/signals/producers/localcontent-signal-producer.ts`, `sales-signal-producer.ts`, `src/app/api/knowledge-mining/candidates/route.ts`, `src/components/knowledge-foundation/new-version-form.tsx` |

### F-02 — Deploy to AWS failing (not production blocker for Vercel)

| Field | Value |
|-------|-------|
| **Severity** | P1 |
| **Run** | `27915896487` (same commit as HEAD) |
| **Failed job** | `Build & Push Docker Image` |
| **Root cause** | `Could not load credentials from any providers` (missing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) |
| **Evidence** | `gh run view 27915896487 --log-failed` |
| **Fix** | Configure AWS secrets **or** disable/archive workflow if production path is Vercel-only |

### F-03 — Scheduled backup failing

| Field | Value |
|-------|-------|
| **Severity** | P1 |
| **Run** | `27921730098` (2026-06-22 schedule) |
| **Root cause** | `validate-env.mjs` during `npm ci` postinstall: `MISSING (required): DATABASE_URL` |
| **Evidence** | Backup log: `❌ MISSING (required): DATABASE_URL` |
| **Fix** | Set GitHub secret `DATABASE_URL` on repo/environment used by `backup.yml` |

### F-04 — Last green CI is not HEAD

| Field | Value |
|-------|-------|
| **Severity** | P1 |
| **Last CI success** | Run `27915193321` — commit `fix(lint): suppress R-IM-01...` (2026-06-21) |
| **HEAD CI** | Failure on `6f60784` |
| **Evidence** | `gh run list --limit 20` |

### F-05 — Vercel Preview workflow stale / failing on old PRs

| Field | Value |
|-------|-------|
| **Severity** | P2 |
| **Last runs** | 2026-06-15, branch `auditos/factory-memory-2026-06`, all `failure` |
| **Evidence** | `gh run list --workflow=preview.yml` |
| **Note** | No recent preview runs on `main`; production deploy not driven by this workflow on push |

### F-06 — Promote workflow blocked by staging DNS

| Field | Value |
|-------|-------|
| **Severity** | P1 (if ECS path used) |
| **Root cause** | `promote.yml` step curls `https://staging.aqliya.com/api/health` — domain does not resolve |
| **Evidence** | `.github/workflows/promote.yml` L28–31; live `staging-probe.mjs` ENOTFOUND |
| **Fix** | Provision staging DNS **before** using ECS promote path |

---

## Who Deploys Production?

| Path | Active? | Evidence |
|------|---------|----------|
| **Vercel Git Integration** | **Yes (live)** | `https://aqliya.com/api/health` → `server: Vercel`, `x-vercel-id` present, `build.commit` = `6f60784` = local `git rev-parse HEAD` |
| **GitHub `deploy.yml` → ECS** | **No (failing)** | All recent deploy runs fail at AWS credentials |
| **`preview.yml`** | PR-only | Not used for production |

`vercel.json` defines build: `npx prisma generate && npm run build`.

---

## Abandoned / Misaligned Workflows

| Workflow | Status |
|----------|--------|
| `deploy.yml` | Configured for AWS; fails without secrets; `paths-ignore` skips docs-only pushes |
| `promote.yml` | Manual ECS promotion; blocked by staging DNS |
| `preview.yml` | PR previews only; last activity mid-June |

---

## Validation Executed

| Command | Result |
|---------|--------|
| `gh run list --limit 20` | Executed |
| `gh run view 27915896494` | Executed |
| `npm run lint` (local) | **Fail** — 6 errors, 269 warnings |
