# OPERATOR_DEPLOY_CHECKLIST — PR #5

**Program:** AuditOS Factory (Release Candidate)  
**Branch on staging:** `staging` @ `608579c`+ (merged from `auditos/factory-memory-2026-06`)  
**PR:** https://github.com/ragheed-AQLIYA/aqliya-platform/pull/5  
**Target:** `https://staging.aqliya.com`

## Objective

Deploy PR #5 to real staging infrastructure and validate release gates before merge to `main`.

**Do not merge** until all PASS criteria below are met.

---

## Step 1 — GitHub Secrets

**Repository → Settings → Secrets and variables → Actions**

### Required (deploy blocked without these)

| Secret | Notes |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user/role with ECR, ECS, Terraform, S3 state access |
| `AWS_SECRET_ACCESS_KEY` | Pair with above |

**IAM must allow:** ECR push (`aqliya/staging/app`), ECS `update-service` on `aqliya-staging-cluster` / `aqliya-staging-service`, Terraform S3 backend (`aqliya-terraform-state`), DynamoDB lock (`aqliya-terraform-locks`).

**Not required in GitHub:** `AWS_REGION` (hardcoded `me-south-1` in workflow), `ECR_REPOSITORY`, `ECS_CLUSTER`, `DATABASE_URL`.

### Optional (smoke only — deploy proceeds without them)

| Secret | Purpose |
|--------|---------|
| `SCIM_API_KEY` | Authenticated SCIM probe in post-deploy smoke |
| `SMOKE_TEST_TOKEN` | Authenticated route probes in post-deploy smoke |

---

## Step 2 — Re-run Deploy Workflow

**Actions → Deploy to AWS → Run workflow** (or re-run latest failed run)

| Setting | Value |
|---------|-------|
| Branch | `staging` |
| Workflow file | `.github/workflows/deploy.yml` |

### Expected job results

| Job | PASS |
|-----|------|
| Test (`tsc`) | ✅ Already verified @ `608579c` |
| Terraform (plan) | Plan artifact uploaded |
| Build & Push Docker | Image pushed to ECR |
| Apply Terraform | Apply completes |
| Post-Deploy Verification | Smoke against `https://staging.aqliya.com` |

**If Test fails on missing JSON:** ensure `knowledge/chart-of-accounts/*.json` is on branch (fixed in `608579c`).

---

## Step 3 — Database (RDS)

Obtain `DATABASE_URL` from AWS (Secrets Manager / ECS task env — **do not commit**).

```bash
npx prisma migrate status
npx prisma migrate deploy
```

**Expected:** 37 migrations applied (including 7 factory-memory migrations).

### If migration drift occurs

| Symptom | Action |
|---------|--------|
| `TBMappingPatternStatus already exists` | Verify columns exist → `npx prisma migrate resolve --applied 20260614150000_firm_memory_governance` → redeploy |
| Graph sync `42P10` / ON CONFLICT | Run `docs/review/STAGING_DRIFT_REPAIR_reporting-graph.sql` via `npx prisma db execute --stdin` |

Full detail: `docs/review/MIGRATION_WALKTHROUGH.md`

---

## Step 4 — Smoke Validation

```bash
npm run smoke:local -- --base-url https://staging.aqliya.com
```

### Manual route checks

| Route | Expected |
|-------|----------|
| `/auditos`, `/auditos/trial-balance` | 200 (public demo) |
| `/audit`, `/monitoring`, `/settings` | 307 → `/login` |
| `/api/scim/v2/Users` (no auth) | 401 |

**PASS:** All critical smoke checks pass (warnings on optional env vars are OK).

---

## Step 5 — Shalfa Validation

**Requires full TB file** (~578 accounts) — **not** repo `TB.xlsx` (211 lines).

Example path: `C:\Users\PC\Downloads\TB 31-12-2025 Final.xlsx`

Point `DATABASE_URL` at staging RDS (or run from environment with staging DB access):

```bash
TB_FILE="/path/to/TB 31-12-2025 Final.xlsx" npm run shalfa:setup
npm run shalfa:validate
```

### Expected

| Metric | Target |
|--------|--------|
| TB lines / mappings | 578 / 578 |
| Factory accuracy | **≈ 94%** |
| `pass` | `true` |
| Net profit variance | ≈ 0.000016% |

Evidence file: `docs/audits/evidence/shalfa-live-validation.json`

Local reference run (2026-06-15): **94% PASS** on full TB.

---

## Release Decision

### PASS → Merge PR #5 to `main`

All of:

- [ ] Deploy workflow succeeds (ECS live)
- [ ] `prisma migrate deploy` succeeds on staging RDS
- [ ] Post-deploy smoke PASS
- [ ] Route protection verified
- [ ] Shalfa validate ≈ 94% on full TB

Then: **Merge PR #5 → `main`** · tag baseline · start Cycle 2 planning.

### FAIL → Do not merge

- Document failure in incident note
- Do **not** open new features, refactors, or Phase 16 work on this branch
- Fix operational blocker only, re-run checklist

---

## Reference Docs (if needed)

| Doc | When |
|-----|------|
| `STAGING_VALIDATION_REPORT.md` | Full local/staging-like validation evidence |
| `MIGRATION_WALKTHROUGH.md` | Migration drift / rollback detail |
| `58E4021_REVIEW_PACK.md` | Platform/integration risk in commit `58e4021` |
| `STAGING_DRIFT_REPAIR_reporting-graph.sql` | Reporting graph index repair |

---

## Current Status (2026-06-15)

| Gate | Status |
|------|--------|
| Engineering / CI build | ✅ PASS |
| Staging branch merged | ✅ |
| AWS deploy | ❌ Blocked — missing GitHub AWS secrets |
| RDS migrate on staging | ⏳ |
| Shalfa 94 on staging | ⏳ |
| Merge to main | ⏳ |

**Next operator action:** Configure AWS secrets → re-run Deploy to AWS on `staging`.
