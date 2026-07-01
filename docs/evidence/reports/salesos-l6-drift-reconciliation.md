# SalesOS L6 — Drift reconciliation (Phase 0 unblock)

**Date:** 2026-06-01  
**Target DB:** PostgreSQL `aqliya` @ `localhost:5432` (from `.env`)  
**Validation:** migrate deploy OK; seed OK; **Retry 2** migrate status + validate + idempotent seed OK — **light validated** (no browser smoke)  
**Status:** `DONE_WITH_CONCERNS`

---

## Problem summary (before)

| Blocker | Detail |
|---------|--------|
| B1 | Six legacy SalesOS migrations applied in DB, absent from `prisma/migrations/` (runbook §7.1) |
| P3018 | `20260601140000_salesos_p0_core` failed: `SalesAccount` already exists (legacy overlap) |
| P3009 | Failed migration row blocked `migrate deploy` |
| P1 pending | `20260601150000`–`20260601170000` not applied |
| Seed | Blocked until P0/P1 schema + indexes aligned |

### `_prisma_migrations` (SalesOS-related, before fix)

- Legacy applied (not in repo): `20260529120000_salesos_v1_persistence`, `20260530114715_add_core_tables`, tier A/B1/B2/B3 SalesOS names (see runbook §7.1).
- `20260601140000_salesos_p0_core`: **failed** row (`SalesAccount already exists`).
- P1 folders: not applied.

### Physical tables (before fix — selected)

| Table | State |
|-------|--------|
| SalesPipeline, SalesPipelineStage, SalesAccount | Legacy + partial P0 overlap |
| SalesDeal, SalesAuditEvent, SalesInteraction | **Missing** |
| SalesEvidenceLink, SalesContact | **Legacy schema** (incompatible with v0.3) |

**Forbidden actions not used:** `migrate reset`, `DROP` of production tables.

---

## Actions taken

### 1. Read-only / status

```text
npx prisma migrate status   → drift B1 + failed P0 + pending P1 (exit 1)
```

### 2. Forward-fix SQL (additive + rename only)

Executed via `npx prisma db execute --file …`:

| Script | Purpose |
|--------|---------|
| `scripts/salesos-drift-forward-fix.sql` | Add `SalesAccount` v0.3 columns; create `SalesDeal` / `SalesAuditEvent`; rename empty/conflicting legacy tables to `*_legacy202605` |
| `scripts/salesos-drift-rename-legacy-indexes.sql` | Rename legacy index names that blocked P1 `CREATE TABLE` (e.g. `SalesEvidenceLink_pkey`) |
| `scripts/salesos-drift-pipeline-indexes.sql` | Add missing unique indexes for seed `upsert` on pipeline/stages |
| `scripts/salesos-drift-account-nullability.sql` | Drop NOT NULL on legacy `ownerId` / `createdById` on `SalesAccount` |

**Renamed tables (data preserved):**

- `SalesEvidenceLink` → `SalesEvidenceLink_legacy202605` (0 rows)
- `SalesContact` → `SalesContact_legacy202605` (2 rows)

### 3. Prisma migrate resolve + deploy

```powershell
npx prisma migrate resolve --applied 20260601140000_salesos_p0_core
npx prisma migrate deploy
# P3018 on evidence → index rename +:
npx prisma migrate resolve --rolled-back 20260601160000_salesos_p1_evidence
npx prisma migrate deploy   # applied 160000 + 170000
```

### 4. Client + seed

```powershell
npx prisma generate          # exit 0
npx tsx scripts/seed-sales-demo.ts   # exit 0 — 5 demo accounts/deals
npx prisma migrate status    # "Database schema is up to date!"
```

---

## State after

| Check | Result |
|-------|--------|
| Repo migrations `20260601140000`–`20260601170000` | Applied (successful rows) |
| `migrate deploy` | All 17 local migrations applied |
| Seed | **Success** (`Pipeline: default-auditos-commercial`, 9 stages, 5 accounts/deals) |
| B1 legacy names in DB | **Still present** — documented only; **not** `resolve --rolled-back` (runbook: DBA review) |

### Concerns (post-reconciliation)

1. **Duplicate `_prisma_migrations` rows** for `20260601140000_salesos_p0_core` and `20260601160000_salesos_p1_evidence` (failed + applied pairs). `migrate status` reports up to date; optional DBA hygiene to archive failed rows.
2. **Legacy SalesOS tables remain** (`SalesOpportunity`, `SalesInteractionLog`, knowledge graph, etc.) alongside v0.3 models — shared DB is hybrid until a dedicated pilot DB or full legacy retirement.
3. **Manual SQL** outside Prisma migration files — must be repeated on other environments or captured in a reviewed forward migration.

---

## Commands log (this session)

| Order | Command | Exit |
|-------|---------|------|
| 1 | `npx prisma migrate status` | 1 (drift) |
| 2 | `npx prisma db execute --file scripts/salesos-drift-forward-fix.sql` | 0 |
| 3 | `npx prisma migrate resolve --applied 20260601140000_salesos_p0_core` | 0 |
| 4 | `npx prisma migrate deploy` | 1 (evidence index clash) |
| 5 | `npx prisma db execute --file scripts/salesos-drift-rename-legacy-indexes.sql` | 0 |
| 6 | `npx prisma migrate resolve --rolled-back 20260601160000_salesos_p1_evidence` | 0 |
| 7 | `npx prisma migrate deploy` | 0 |
| 8 | `npx prisma generate` | 0 |
| 9 | `npx prisma db execute --file scripts/salesos-drift-pipeline-indexes.sql` | 0 |
| 10 | `npx tsx scripts/seed-sales-demo.ts` | 1 (null constraint) |
| 11 | `npx prisma db execute --file scripts/salesos-drift-account-nullability.sql` | 0 |
| 12 | `npx tsx scripts/seed-sales-demo.ts` | 0 |
| 13 | `npx prisma migrate status` | 0 |

---

## Arabic summary

تمت معالجة انحراف الترحيلات **بدون reset**: SQL تصحيحي (إضافة جداول/أعمدة، إعادة تسمية جداول legacy)، ثم `resolve` + `migrate deploy` لـ P0–P1، ثم **نجاح البذرة**. لا يزال DB مشتركاً مع جداول SalesOS قديمة — **pilot بشروط** بعد دخان المتصفح.

---

## Next step

Human operator: `npm run dev` (port per env) and run browser smoke checklist — runbook §8.1 (Phase 0 baseline).
---

## Post-closure verification (Retry 2 — 2026-06-01)

Independent re-check after reconciliation (no new SQL):

| Check | Result |
|-------|--------|
| `npx prisma migrate status` | Exit 0 — up to date |
| `npx prisma validate` | Exit 0 |
| `npx tsx scripts/seed-sales-demo.ts` (2nd run) | Exit 0 — idempotent |
| Row counts | SalesAccount **8**, SalesDeal **5**, SalesPipeline **1** |

**Finding:** `SalesAccount` count (**8**) exceeds demo seed output (**5** demo accounts) — consistent with **legacy/hybrid rows** on shared `aqliya` DB; not a regression from Retry 1.

**Arabic:** التحقق الثاني **نجح**؛ فرق عدد الحسابات يعكس بيانات legacy على DB مشترك.
