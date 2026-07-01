# R-001 — Migration Order Verification

**Date:** 2026-06-15  
**Status:** CONFIRMED  
**Severity:** CRITICAL — Fresh database deployment fails

---

## 1. Dependency Graph

### Migrations involved

| Migration | Created | Tables | FK References |
|-----------|---------|--------|---------------|
| `20260613100000_reporting_graph_foundation` | ✅ `LeadScheduleLine` (line 51) | `ReportingGraph`, `ReportingGraphNode`, `ReportingGraphEdge`, `ReportingGraphSnapshot`, `LeadScheduleLine` | `LeadScheduleLine.leadScheduleId → LeadSchedule.id` (line 87) |
| `20260615110000_add_lead_schedule` | ✅ `LeadSchedule`, `WorkingPaperIndex` (lines 5, 25) | `WorkingPaperIndex`, `LeadSchedule` | `LeadSchedule.workingPaperIndexId → WorkingPaperIndex.id` (line 51) |

### Dependency chain

```
20260613100000
  ├── creates: LeadScheduleLine
  ├── FK: LeadScheduleLine.leadScheduleId → LeadSchedule.id  ★ FAILS
  └── depends on: LeadSchedule (not yet created)

     → GAP ←

20260615110000
  ├── creates: WorkingPaperIndex, LeadSchedule
  ├── FK: LeadSchedule.workingPaperIndexId → WorkingPaperIndex.id
  └── NO dependency on 20260613100000
```

### Schema models

| Model | Schema line | Created in migration |
|-------|-------------|---------------------|
| `WorkingPaperIndex` | `schema.prisma:4447` | `20260615110000` |
| `LeadSchedule` | `schema.prisma:4448` | `20260615110000` |
| `LeadScheduleLine` | `schema.prisma:4470` | `20260613100000` (line 51) |

### Root cause

Migration `20260613100000` line 87:

```sql
ALTER TABLE "LeadScheduleLine"
  ADD CONSTRAINT "LeadScheduleLine_leadScheduleId_fkey"
  FOREIGN KEY ("leadScheduleId") REFERENCES "LeadSchedule"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
```

This FK references `LeadSchedule`, but that table is not created until migration `20260615110000`, which runs **after** `20260613100000` in alphabetical order.

---

## 2. Fresh Database Reproduction

### Environment

| Attribute | Value |
|-----------|-------|
| Database | PostgreSQL 16.13 (Docker, `postgres:16-alpine`) |
| Host | `localhost:5432` |
| Database name | `migration_order_test` |
| Prisma | Via `npx prisma migrate deploy` |
| Migrations count | 38 |

### Reproduction steps

```bash
docker exec aqliya-db-1 psql -U postgres \
  -c "DROP DATABASE IF EXISTS migration_order_test;"
docker exec aqliya-db-1 psql -U postgres \
  -c "CREATE DATABASE migration_order_test;"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/migration_order_test?schema=public" \
  npx prisma migrate deploy
```

### Exact output

```
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "migration_order_test", schema "public" at "localhost:5432"

38 migrations found in prisma/migrations

Applying migration `20260506103224_init_postgres`
Applying migration `20260506120601_org_scoping`
Applying migration `20260506123140_recommendation_publication`
...

Applying migration `20260609100000_tb_intelligence_firm_memory`
Applying migration `20260613100000_reporting_graph_foundation`     ← FAILS HERE
Error: P3018

A migration failed to apply. New migrations cannot be applied
before the error is recovered from.

Migration name: 20260613100000_reporting_graph_foundation

Database error code: 42P01

Database error:
ERROR: relation "LeadSchedule" does not exist
```

### PostgreSQL error detail

```
ERROR: relation "LeadSchedule" does not exist
SQL state: 42P01
```

The exact SQL that fails is at `20260613100000_reporting_graph_foundation/migration.sql:87`:

```sql
ALTER TABLE "LeadScheduleLine"
  ADD CONSTRAINT "LeadScheduleLine_leadScheduleId_fkey"
  FOREIGN KEY ("leadScheduleId") REFERENCES "LeadSchedule"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 3. Reproducibility

| Attempt | Database | Result | Evidence |
|---------|----------|--------|----------|
| 1 | `migration_order_test` (fresh) | Blocked by missing pgvector extension | Pre-existing infra issue |
| 2 | `migration_order_test` (fresh, after pgvector install) | **FAILED at `20260613100000`** | `relation "LeadSchedule" does not exist` |
| 3 | `migration_order_test2` (completely fresh) | **FAILED at `20260613100000`** | `relation "LeadSchedule" does not exist` |

**Result:** 100% reproducible. Every fresh database deployment fails at the same migration with the same error.

---

## 4. Verdict

```
R-001 CONFIRMED
```

**Criteria satisfied:**
- ✅ Fresh database **fails** on `npx prisma migrate deploy`
- ✅ Failing migration: `20260613100000_reporting_graph_foundation`
- ✅ Exact error: `relation "LeadSchedule" does not exist` (42P01)
- ✅ Root cause: FK on `LeadScheduleLine` (line 87) references `LeadSchedule`, which is not created until migration `20260615110000` (runs **after** the failing migration)
- ✅ 100% reproducible across 2 separate fresh databases

---

## 5. Hotfix Options

### Constraints

- ✅ Preserve existing production databases (migration history, data intact)
- ✅ Preserve migration history — no destructive operations
- ✅ No destructive migration — no DROP TABLE, no column drops
- ✅ No rewrite of existing migrations if already applied anywhere
- ⚠️ Exception: `20260615110000` must be made idempotent to prevent duplicate-table errors on fresh deploys (see below)

---

### Option A (Recommended): Bridge migration + idempotent `20260615110000`

**Strategy:**
1. Create a **new bridge migration** `20260612999999_fix_r001_lead_schedule_order` that creates `LeadSchedule` and `WorkingPaperIndex` **BEFORE** `20260613100000` runs
2. Modify `20260615110000_add_lead_schedule` to be **idempotent** (uses `IF NOT EXISTS` / DO blocks) so it doesn't fail when tables already exist

**Step 1 — Create bridge migration**

`prisma/migrations/20260612999999_fix_r001_lead_schedule_order/migration.sql`:

```sql
-- Fix R-001: Create LeadSchedule and WorkingPaperIndex before
-- 20260613100000 tries to FK LeadScheduleLine to LeadSchedule.
-- Uses IF NOT EXISTS for safety on existing databases.

CREATE TABLE IF NOT EXISTS "WorkingPaperIndex" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "indexType" TEXT NOT NULL,
    "paperNumber" TEXT NOT NULL,
    "paperTitle" TEXT NOT NULL,
    "preparedById" TEXT,
    "preparedDate" TIMESTAMP(3),
    "methodologyRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "conclusion" TEXT,
    "reviewedById" TEXT,
    "reviewedDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkingPaperIndex_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeadSchedule" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "priorYearBalance" DOUBLE PRECISION,
    "currentYearBalance" DOUBLE PRECISION,
    "adjustments" JSONB,
    "finalBalance" DOUBLE PRECISION,
    "assertionCoverage" JSONB,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_idx"
    ON "WorkingPaperIndex"("engagementId");
CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_indexType_idx"
    ON "WorkingPaperIndex"("engagementId", "indexType");

CREATE UNIQUE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_key"
    ON "LeadSchedule"("workingPaperIndexId");
CREATE INDEX IF NOT EXISTS "LeadSchedule_engagementId_idx"
    ON "LeadSchedule"("engagementId");
CREATE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_idx"
    ON "LeadSchedule"("workingPaperIndexId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'LeadSchedule_workingPaperIndexId_fkey'
  ) THEN
    ALTER TABLE "LeadSchedule"
      ADD CONSTRAINT "LeadSchedule_workingPaperIndexId_fkey"
      FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;
```

**Step 2 — Modify `20260615110000_add_lead_schedule/migration.sql`**

Replace existing SQL with idempotent version:

```sql
-- AuditOS 2.0 Phase 2: Add LeadSchedule and WorkingPaperIndex tables
-- IDEMPOTENT version — safe for fresh and existing databases.

CREATE TABLE IF NOT EXISTS "WorkingPaperIndex" (
    ...
);

CREATE TABLE IF NOT EXISTS "LeadSchedule" (
    ...
);

CREATE INDEX IF NOT EXISTS ...
...

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'LeadSchedule_workingPaperIndexId_fkey'
  ) THEN
    ALTER TABLE "LeadSchedule"
      ADD CONSTRAINT "LeadSchedule_workingPaperIndexId_fkey"
      FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;
```

**Step 3 — Apply to existing databases**

For existing databases where `20260615110000` was already applied:

```bash
# Accept the checksum change on the modified migration
npx prisma migrate resolve --applied 20260615110000_add_lead_schedule

# Apply the new bridge migration (and any other pending migrations)
npx prisma migrate deploy
```

| Group | On fresh DB | On existing DB with `20260615110000` applied |
|-------|-------------|----------------------------------------------|
| Bridge migration | Creates tables ✅ | `IF NOT EXISTS` → no-op ✅ |
| `20260613100000` (original) | FK succeeds (LeadSchedule exists) ✅ | Already applied ✅ |
| `20260615110000` (modified, idempotent) | `IF NOT EXISTS` → no-op ✅ | Checksum changed → needs `migrate resolve` |

**Risk assessment:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Checksum mismatch on existing DBs for `20260615110000` | HIGH (if migration already applied) | MEDIUM — `migrate deploy` fails until resolved | Documented `migrate resolve` step in deploy instructions |
| Constraint already exists in existing DBs | MEDIUM | NONE — DO block handles it | Idempotent constraint creation |
| Tables already exist in `20260612999999` on existing DBs | HIGH | NONE — `IF NOT EXISTS` handles it | All CREATE statements use `IF NOT EXISTS` |

---

### Option B: Bridge migration only + manual fix on fresh DBs (less recommended)

**Strategy:** Only create the bridge migration. Do NOT modify `20260615110000`. On fresh databases, `20260615110000` will fail when it tries to CREATE TABLE LeadSchedule (already exists from bridge). Fix by running `npx prisma migrate resolve --applied 20260615110000_add_lead_schedule` to skip it.

| Group | On fresh DB | Risk |
|-------|-------------|------|
| Bridge migration | Creates tables | ✅ |
| `20260613100000` | FK succeeds | ✅ |
| `20260615110000` (unmodified) | `CREATE TABLE` on existing table → **FAILS** | ❌ Needs manual resolve |

**Verdict:** Option A is safer because it makes `20260615110000` self-healing. Option B requires manual intervention on every fresh deployment.

---

## 6. Deploy Sequence (for Option A)

### Fresh database

```bash
npx prisma migrate deploy
# Expected: all 39 migrations apply successfully
```

### Existing database (where PR #5 was already deployed)

```bash
# Step 1: Accept checksum change for modified migration
npx prisma migrate resolve --applied 20260615110000_add_lead_schedule

# Step 2: Apply new bridge migration
npx prisma migrate deploy
```

---

## 7. Commit History for This Fix

The fix will add:
- `prisma/migrations/20260612999999_fix_r001_lead_schedule_order/` (new directory + migration.sql)
- `prisma/migrations/20260615110000_add_lead_schedule/migration.sql` (modified — idempotent)
- `docs/review/R001_MIGRATION_ORDER_VERIFICATION.md` (this document)

No existing data is modified. No tables are dropped. No production database is changed without explicit `migrate deploy`.

---

## 8. Verification

After applying the fix, run on a fresh database:

```bash
npx prisma migrate deploy
```

Expected result: ALL 39 migrations apply successfully from 0001 to latest, including `20260613100000_reporting_graph_foundation`.

---

## Appendix A: Full Command Output (Failure Reproduction)

```
$ DATABASE_URL="postgresql://postgres:postgres@localhost:5432/migration_order_test?schema=public"
$ npx prisma migrate deploy

Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "migration_order_test",
  schema "public" at "localhost:5432"

38 migrations found in prisma/migrations

Applying migration `20260506103224_init_postgres`
Applying migration `20260506120601_org_scoping`
Applying migration `20260506123140_recommendation_publication`
Applying migration `20260506224331_add_password_hash`
Applying migration `20260508151001_audit_phase3`
Applying migration `20260509014343_add_ai_output_source_entity`
Applying migration `20260509135929_add_pilot_models`
Applying migration `20260518220001_sunbul_phase1`
Applying migration `20260519100001_add_platform_organization_bridge`
Applying migration `20260521053231_add_localcontentos_foundation`
Applying migration `20260527011230_add_sunbul_audit_actions`
Applying migration `20260528005759_add_governance_fields_v0_2`
Applying migration `20260601120000_localcontentos_content_studio`
Applying migration `20260601140000_salesos_p0_core`
Applying migration `20260601150000_salesos_p1_interactions`
Applying migration `20260601160000_salesos_p1_evidence`
Applying migration `20260601170000_salesos_p1_contacts`
Applying migration `20260601180000_salesos_l5_governance`
Applying migration `20260602120000_add_user_mfa_fields`
Applying migration `20260603000001_add_platform_secret_and_notification`
Applying migration `20260603220000_add_notification_preferences`
Applying migration `20260605000001_ic01_pgvector_document_chunk`
Applying migration `20260605100000_add_invitation`
Applying migration `20260606120000_add_agent_memory`
Applying migration `20260606120000_workflow_template_local_contact`
Applying migration `20260606140000_add_l5_workflow_contact_models`
Applying migration `20260607100000_audit_evidence_version`
Applying migration `20260608000001_add_embedding_json_fallback`
Applying migration `20260608000002_add_ingestion_batch_document`
Applying migration `20260608120000_l0_05_sso_scim`
Applying migration `20260609100000_tb_intelligence_firm_memory`
Applying migration `20260613100000_reporting_graph_foundation`

Error: P3018

A migration failed to apply. New migrations cannot be applied
before the error is recovered from.

Migration name: 20260613100000_reporting_graph_foundation

Database error code: 42P01

Database error:
ERROR: relation "LeadSchedule" does not exist

DbError {
  severity: "ERROR",
  code: SqlState(E42P01),
  message: "relation \"LeadSchedule\" does not exist",
  file: "namespace.c",
  line: 434,
  routine: "RangeVarGetRelidExtended"
}
```

## Appendix B: Schema.prisma Model Definitions (for reference)

```prisma
model WorkingPaperIndex {
  id                  String    @id @default(cuid())
  engagementId        String
  indexType           String
  paperNumber         String
  paperTitle          String
  preparedById        String?
  preparedDate        DateTime?
  methodologyRef      String?
  status              String    @default("draft")
  conclusion          String?
  reviewedById        String?
  reviewedDate        DateTime?
  createdById         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  leadSchedule        LeadSchedule?

  @@index([engagementId])
  @@index([engagementId, indexType])
}

model LeadSchedule {
  id                  String    @id @default(cuid())
  workingPaperIndexId String    @unique
  engagementId        String
  accountCode         String
  accountName         String
  priorYearBalance    Float?
  currentYearBalance  Float?
  adjustments         Json?
  finalBalance        Float?
  assertionCoverage   Json?
  notes               String?
  createdById         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  workingPaperIndex WorkingPaperIndex @relation(fields: [workingPaperIndexId], references: [id], onDelete: Cascade)
  lines             LeadScheduleLine[]

  @@index([engagementId])
  @@index([workingPaperIndexId])
}

model LeadScheduleLine {
  id             String   @id @default(cuid())
  leadScheduleId String
  leadSchedule   LeadSchedule @relation(fields: [leadScheduleId], references: [id], onDelete: Cascade)
  lineNumber     Int
  description    String
  amount         Float    @default(0)
  reference      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([leadScheduleId])
}
```

---

*End of verification document.*
