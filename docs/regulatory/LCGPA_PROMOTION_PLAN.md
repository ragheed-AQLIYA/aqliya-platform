# LCGPA Promotion — Production Database Execution Plan

**Status: NOT EXECUTED.** Prepared 2026-08-22. Every step below was rehearsed
end to end on a clone restored from `aqliya-pre-lcgpa-20260822-142620.sql`.

The development database `aqliya` is unchanged: 238 tables, 1,417 rows,
21 finished migrations and 1 failed row — byte-identical to the state captured
in the backup.

---

## 0. Environment audit (read-only, 2026-08-22)

Does `20260711153755_add_enums_ondelete` exist as applied anywhere?

| Environment | Database target | Reachable | Inspectable | Verdict |
|---|---|---|---|---|
| development | `localhost:5432/aqliya` | YES | YES | **NOT APPLIED** (22 rows, target absent) |
| CI | `aqliya_ci`, ephemeral service container | NO (destroyed per run) | NO | **NOT APPLIED** — each run starts empty and `migrate deploy` failed at this migration |
| staging (AWS) | `.env.staging` placeholders only | NO (`staging.aqliya.com` does not resolve) | NO | **UNKNOWN** — prior forensics records it as never provisioned |
| staging (docker) | `db:5432/aqliya_staging` | NO (Docker daemon not running) | NO | **UNKNOWN** |
| production (AWS RDS) | `aqliya-prod-db.cds80cqswjgf.eu-north-1.rds.amazonaws.com` | NO (NXDOMAIN) | NO | **UNKNOWN** |
| production (Vercel `aqliya-app`) | none bound | n/a | n/a | N/A — separate repo, deployment from 2025-12-12 |
| Vercel `aqliya-platform` | none bound | n/a | n/a | N/A — `live: false`, latest deployment ERROR |
| local `aqliya_lc_pilot` | `localhost:5432` | YES | YES | **NOT APPLIED** (19 rows) |
| local `aqliya_p0_fresh` | `localhost:5432` | YES | YES | **NOT APPLIED** (22 rows) |
| local `aqliya_pilot` | `localhost:5432` | YES | NO | **NOT APPLIED** (no history table) |
| local `migration_order_test`, `_test2` | `localhost:5432` | YES | YES | **NOT APPLIED** (22 rows each) |
| PostgreSQL 18.3 on `:5433` | `localhost:5433/postgres` | YES | NO | **NOT APPLIED** (no Prisma history) |

Two databases report APPLIED — `aqliya_cleanroom` and `aqliya_promote_rehearsal`.
Both were created during this verification work as disposable proofs. Neither is
an environment.

**No reachable environment has it applied.** Every unreachable environment is
recorded as UNKNOWN, per the audit rule; none is inferred to be clean.

**Open item.** A production RDS was live and validated on 2026-07-09
(`GET /api/health → {"database":true}`). Its hostname no longer resolves, the
Terraform `rds_endpoint` output is empty and `aws_db_instance` has zero
instances, which together indicate teardown — but that is inference, not
inspection. Note the timing: this migration is dated **2026-07-11**, two days
after the last recorded production validation. See "Residual risk" below.

---

## 1. Preconditions (all verified 2026-08-22)

| Gate | Result |
|---|---|
| Clean-room `prisma migrate deploy` from empty | All 60 migrations applied |
| Clean room vs `prisma/schema.prisma` | No difference detected |
| Clone vs `git HEAD:prisma/schema.prisma` | No difference detected |
| Clone promotion: schema equality | No difference detected |
| Clone promotion: row census | 1,417 → 1,456; **0 rows lost** |
| Structural verification on clone | PASS |
| `tsc` (root, regulatory, scripts) | 0 errors |
| Full regression | 514 suites, 7,522 tests, 0 failures |
| LCGPA acceptance chain | 10/10 |

Backup: `C:\Users\PC\aqliya-backups\aqliya-pre-lcgpa-20260822-142620.sql`
(10.98 MB, SHA-256 `071F819433BF68F720B6EF8A1999C5E6CD8D55E2DD6CC134179F85C0A5577455`)

---

## 1. Backup verification (before anything else)

```powershell
$b = "C:\Users\PC\aqliya-backups\aqliya-pre-lcgpa-20260822-142620.sql"
(Get-FileHash $b -Algorithm SHA256).Hash
# expect 071F819433BF68F720B6EF8A1999C5E6CD8D55E2DD6CC134179F85C0A5577455
```

Then prove the backup actually restores, into a throwaway database:

```powershell
node .promote\mkdb.js aqliya_restore_check
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" `
  --dbname="postgresql://postgres:postgres@localhost:5432/aqliya_restore_check" --file=$b
node .promote\census.js aqliya_restore_check restore-check.json
```

**Expected:** 238 tables, 1,417 rows — matching `aqliya`. Do not proceed if it differs.

---

## 2. Row census before

```powershell
node .promote\census.js aqliya prod-census-before.json
```

**Expected:** `238 tables, 1417 rows`.

---

## 3. Resolve the one failed migration

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"
npx prisma migrate resolve --applied 20260605000001_ic01_pgvector_document_chunk
```

**Expected:** `Migration 20260605000001_ic01_pgvector_document_chunk marked as applied.`

**Why this is truthful, not a blind baseline.** It failed on 2026-08-03 with
`0A000: extension "vector" is not available`. pgvector was installed afterwards
(`vector 0.8.6`), and the objects the migration creates are present:
`DocumentChunk` exists with `embedding vector(1536)`. Prisma **adds** a second
history row rather than editing the failure record, so the original failure and
its logs remain in the audit trail.

---

## 4. Baseline the 36 unrecorded migrations

```powershell
Get-Content .promote\baseline-list.txt |
  Where-Object { $_ -and $_ -ne "20260605000001_ic01_pgvector_document_chunk" } |
  ForEach-Object { npx prisma migrate resolve --applied $_ }
```

**Expected:** 36 × `marked as applied`, 0 errors.

**Why every one is proven, not assumed.** `prisma migrate diff` reports
*No difference detected* between `aqliya` and `git HEAD:prisma/schema.prisma`,
and the clean room built purely by replaying these migrations matches
`prisma/schema.prisma` exactly. Together these prove `aqliya` already sits at
precisely the pre-LCGPA point of the chain, so every one of the 36 has its
schema present. None is marked applied on the strength of drift alone.

---

## 5. Status before deploy

```powershell
npx prisma migrate status
```

**Expected:** `60 migrations found`, exactly two not yet applied —
`20260822000000_lcgpa_regulatory_intelligence` and `20260822010000_repair_schema_drift`.
**Stop if any other migration is listed as pending.**

---

## 6. Deploy

```powershell
npx prisma migrate deploy
```

**Expected:** exactly two `Applying migration` lines, in this order:

```
Applying migration `20260822000000_lcgpa_regulatory_intelligence`
Applying migration `20260822010000_repair_schema_drift`
```

The second is a no-op on `aqliya` — `Notification` and the ten indexes already
exist there — but it records the history row that lets a fresh environment build
them.

---

## 7. Post-migration schema check

```powershell
npx prisma migrate status
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

**Expected:** `Database schema is up to date!` and `No difference detected`, exit 0.

---

## 8. Row census after

```powershell
node .promote\census.js aqliya prod-census-after.json
node .promote\census-compare.js prod-census-before.json prod-census-after.json
```

**Expected:** 238 → 257 tables (+19), rows 1,417 → 1,456. The only row-count
increase is `_prisma_migrations` (22 → 61). **`ROWS LOST: 0`.**

---

## 9. Structural verification

```powershell
node .promote\verify-structure.js aqliya
```

**Expected:** 19/19 new tables, 16 regulatory foreign keys all `ON DELETE RESTRICT`,
60 indexes on `LcRegulatory*`, 17 added columns all nullable-or-defaulted,
no migration applied more than once, LCGPA recorded exactly once. `PASS`.

---

## 10. Regression and LCGPA acceptance

```powershell
npx tsc --noEmit
npm test
npx jest src/lib/local-content/lcgpa/regulatory
```

**Expected:** 0 TypeScript errors; 514 suites / 7,522 tests passing;
432 regulatory tests including the 10-step acceptance chain.

---

## 11. What is deliberately NOT done

Promotion installs the **schema only**. It does not:

- run `lc:regulatory:bootstrap --commit` against `aqliya`
- approve or activate any regulatory dataset
- resolve any of the six `PENDING_HUMAN_REVIEW` conflicts
- assert any effective date

After promotion `aqliya` has the regulatory tables and **zero rows** in them.
Populating them is a separate, explicitly requested step.

---

## Rollback / recovery

**During steps 3–4 (resolve/baseline).** These write only to
`_prisma_migrations`; no schema or application data changes. To undo, delete the
rows added by the baseline:

```sql
DELETE FROM "_prisma_migrations"
 WHERE migration_name = ANY($1)      -- the 37 names
   AND started_at > '<timestamp when step 3 began>';
```

**During step 6 (deploy).** Prisma does not wrap migrations in transactions, so
a mid-migration failure leaves partial state. Recovery is a full restore:

```powershell
node .promote\mkdb.js aqliya_rollback_target   # or drop/recreate aqliya
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" `
  --dbname="postgresql://postgres:postgres@localhost:5432/aqliya" `
  --file="C:\Users\PC\aqliya-backups\aqliya-pre-lcgpa-20260822-142620.sql"
```

The window of exposure is small — the LCGPA migration applied to the clone in
203 ms — and the migration is purely additive, so a partial failure leaves extra
objects rather than missing data.

**After step 6.** The migration adds tables and nullable columns only. Reverting
is a restore from the backup; nothing about the promotion destroys data that the
backup does not contain.

---

## Residual risk

**One unknown remains.** `20260711153755_add_enums_ondelete` was repaired in
place. That is safe because it has never executed anywhere visible from this
machine: development halted 34 migrations earlier, CI fails at it on every run,
and no deploy workflow runs migrations at all. If a staging or production
database exists elsewhere where it *was* applied, its recorded checksum will no
longer match the repaired file and `prisma migrate deploy` there will report a
modified-migration error. The fix in that case is to update that one checksum
row to the new file hash; the SQL is semantically identical, so no schema change
is needed.

Confirm no such environment exists before promoting beyond development.
