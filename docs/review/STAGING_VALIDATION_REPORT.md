# Staging Validation Report — PR #5 (Factory Memory)

**Date:** 2026-06-15  
**Branch:** `auditos/factory-memory-2026-06`  
**Environment:** Local staging gate (Windows, `DATABASE_URL` → local PostgreSQL on `localhost:5432`)  
**Status label:** **STAGING VALIDATION SUBSTANTIALLY PASSED** — **APPROVED MERGE CANDIDATE** (local gate complete)

---

## Executive Summary

| Gate | Result | Notes |
|------|--------|-------|
| Migrations (`migrate deploy`) | **PASS** (after drift fix) | Governance enum drift → `migrate resolve` |
| Reporting graph indexes | **PASS** (after drift repair) | Missing unique indexes → manual SQL repair |
| Prisma generate | **PASS** | v7.8.0 |
| Production build | **PASS** | Next.js 16.2.4, ~111s |
| TypeScript | **PASS** | `npx tsc --noEmit` |
| Factory static smoke | **PASS** | 33 checks |
| Factory live smoke (`eng-gulf-2025`) | **PASS** | 39 reporting graph nodes after index repair |
| Post-deploy smoke (`localhost:3000`) | **PASS** | 29/29 critical, 1 warning |
| Route probes | **PASS** | `/auditos/*` 200; `/audit`, `/monitoring` → 307 login |
| Shalfa setup | **PASS** | 211 TB lines (truncated file) |
| Shalfa validate (factory accuracy) | **PASS** | **94%** on full TB (578 lines), `pass: true` |

**Verdict:** All local staging gates pass, including Shalfa pilot evidence reproduction on `TB 31-12-2025 Final.xlsx` (578 accounts, factory accuracy **94%**). Remaining operator step: repeat migration deploy + Shalfa validate on **staging RDS** before production merge.

---

## Migration Gate

### Failure 1 — Governance enum (resolved)

```
Migration 20260614150000_firm_memory_governance — FAILED
Error P3018: type "TBMappingPatternStatus" already exists (PostgreSQL 42710)
```

**Fix:** Verified enum + columns exist → `npx prisma migrate resolve --applied 20260614150000_firm_memory_governance` → deploy `20260615100000_tb_classification_detail`.

**All 37 migrations now applied** on Prisma-connected DB.

### Failure 2 — Reporting graph indexes (resolved)

Migration `20260613100000_reporting_graph_foundation` was marked applied but **unique indexes were missing** (only PKs present). Symptom:

```
42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Fix:** Ran `docs/review/STAGING_DRIFT_REPAIR_reporting-graph.sql` via `npx prisma db execute --stdin`.

After repair: `npm run factory:smoke` → **PASS** (39 graph nodes).

### Known gap — `LeadSchedule` table

`LeadSchedule` / `LeadScheduleLine` are in `schema.prisma` but **no migration creates `LeadSchedule`**. Migration `20260613100000` only references `LeadScheduleLine` FK. Factory smoke and reconciliation **degrade gracefully** (warnings, schedule ties skipped). **Not fixed in Feature Freeze** — document for post-merge follow-up.

---

## Infrastructure Note — Dual PostgreSQL on Port 5432

| PID | Process | Notes |
|-----|---------|-------|
| 6540 | `postgres.exe` (Windows service) | **Prisma target** — migrations + factory data |
| 14688 | `com.docker.backend.exe` | Docker `aqliya-db-1` — stale, no `_prisma_migrations` |

Use one authoritative DB for staging RDS and local dev.

---

## Smoke Gates

### Static factory smoke

```
npm run factory:smoke:static — PASS (33 checks)
```

### Live factory smoke

```
npm run factory:smoke — PASS
Evidence: docs/audits/evidence/factory-pilot-smoke-2026-06-15T11-44-44-189Z.txt
```

### Post-deploy smoke

```
npm run smoke:local — PASS
29 passed, 0 failed, 1 warning (SCIM_DEFAULT_ORG_ID unset)
Duration: ~2.8s
```

### Route probes (manual)

| Route | Status | Expected |
|-------|--------|----------|
| `/auditos` | 200 | Public demo |
| `/auditos/trial-balance` | 200 | Public demo |
| `/audit` | 307 → `/login` | Protected |
| `/monitoring` | 307 → `/login` | Protected |

---

## Shalfa Pilot Gate — **PASS (2026-06-15, full TB)**

### Setup (full file)

```powershell
$env:TB_FILE="C:\Users\PC\Downloads\TB 31-12-2025 Final.xlsx"
npm run shalfa:setup
```

| Metric | Value |
|--------|-------|
| TB lines | **578** |
| Confirmed mappings | **578** |
| Policy | `shalfa-pilot-audited-v1` |
| Engagement | `eng-shalfa-2025` |

### Validate

```powershell
npm run shalfa:validate
```

| Score | Value | Target |
|-------|-------|--------|
| Factory accuracy | **94%** | ≈94% |
| Economic | 100 | — |
| Line item | 100 | — |
| Net profit variance | 0.000016% | — |
| Pass | **true** | true |

Evidence: `docs/audits/evidence/shalfa-live-validation.json`

### Prior truncated run (for audit trail)

Repo `TB.xlsx` (211 lines) produced **26%** — confirmed **input data gap**, not product regression.

---

## Merge Decision Matrix

| Criterion | Status |
|-----------|--------|
| Migrations apply (with documented drift paths) | ✅ Local |
| Build passes | ✅ |
| Factory + post-deploy smoke | ✅ |
| Route auth boundaries | ✅ |
| Shalfa ≈94% on full TB (live re-run) | ✅ **94%** |
| Staging RDS deploy (operator) | ⏳ Repeat on RDS before prod merge |

**Recommendation:** PR #5 is an **APPROVED MERGE CANDIDATE** on local staging evidence. Operator should run `migrate deploy` (+ drift repair SQL if needed) and Shalfa validate on staging RDS before merging to `main`.

---

## Commands Run (full session)

```bash
npx prisma migrate deploy                              # fail → resolve → pass
npx prisma migrate resolve --applied 20260614150000_firm_memory_governance
npx prisma migrate deploy                              # pass (37/37)
npx prisma generate                                    # pass
npm run build                                          # pass
npx tsc --noEmit                                       # pass
TB_FILE="...\TB 31-12-2025 Final.xlsx" npm run shalfa:setup   # pass (578 lines)
npm run shalfa:validate                                # pass 94%
# reporting graph index repair (docs/review/STAGING_DRIFT_REPAIR_reporting-graph.sql)
npm run factory:smoke:static                           # pass
npm run factory:smoke                                  # pass
npm run smoke:local                                    # pass
```

---

## Related Docs

- `docs/review/MIGRATION_WALKTHROUGH.md` — Risk B, drift resolution
- `docs/review/STAGING_DRIFT_REPAIR_reporting-graph.sql` — Index repair script
- `docs/review/58E4021_REVIEW_PACK.md` — Risk A, platform scope
- `docs/audits/evidence/p13-2-validation.json` — Prior Shalfa 578-line accuracy
- Draft PR: https://github.com/ragheed-AQLIYA/aqliya-platform/pull/5
