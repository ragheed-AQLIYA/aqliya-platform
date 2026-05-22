# AQLIYA Production Migration Plan

**Version:** 1.0
**Status:** Pre-production planning
**Scope:** Safe migration of platform foundation models to production PostgreSQL

---

## 1. Drift Assessment

### Current State

The last committed Prisma migration file (`20260519100001_add_platform_organization_bridge`) creates **only** the `PlatformOrganization` table with its FK columns on `Organization` and `AuditOrganization`.

The following schema changes were applied to local dev via `npx prisma db push` and are **NOT** in any migration file:

| Missing From Migrations | Type | Added In Sprint |
|---|---|---|
| `ClientWorkspace` table + all indexes | New model | 2B |
| `Project` table + all indexes | New model | 2B |
| `PlatformAuditLog` table + all indexes | New model | 3D |
| `AuditClient.clientWorkspaceId` column + FK + index | Additive FK | 2B |
| `AuditEngagement.projectId` column + FK + index | Additive FK | 2B |
| `PlatformOrganization.clientWorkspaces` relation | Prisma-only (no SQL change) | 2B |

### Drift Risk

**HIGH** — `prisma migrate deploy` will FAIL on production because the migration history does not account for these tables and columns.

---

## 2. Production Migration Strategy

### Option A: Consolidated Migration File (Recommended)

**Steps:**
1. Take a full PostgreSQL backup of the production database
2. Apply the consolidated migration SQL (see Section 3) directly to production PostgreSQL
3. Register the migration in `_prisma_migrations` table manually OR use `prisma migrate resolve --applied`
4. Run `npx prisma generate` to update the client
5. Run backfill scripts
6. Deploy the application

**Pros:** Full control, reviewed SQL, no data loss, no reset
**Cons:** Manual Prisma migration tracking

### Option B: Reset Development First, Generate Clean Migrations

**Steps:**
1. Reset local dev database
2. Generate a single migration from current schema
3. Test on staging
4. Apply to production

**Pros:** Clean migration history, automated SQL generation
**Cons:** Requires local database reset, may lose dev data

**Recommendation: Option A** — the consolidated SQL can be reviewed by a DBA and applied safely.

---

## 3. Consolidated Migration SQL

File: `docs/product/platform-foundation-consolidated-migration.sql`

This SQL is additive only — it creates new tables and adds nullable columns. It does NOT modify or remove existing data.

### Migration Steps (in order)

#### Step 1: Create ClientWorkspace

```sql
CREATE TABLE "ClientWorkspace" (
    "id" TEXT NOT NULL,
    "platformOrganizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "workspaceType" TEXT NOT NULL DEFAULT 'client',
    "status" TEXT NOT NULL DEFAULT 'active',
    "productAccess" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ClientWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClientWorkspace_platformOrganizationId_slug_key" ON "ClientWorkspace"("platformOrganizationId", "slug");
CREATE INDEX "ClientWorkspace_platformOrganizationId_status_idx" ON "ClientWorkspace"("platformOrganizationId", "status");
CREATE INDEX "ClientWorkspace_workspaceType_idx" ON "ClientWorkspace"("workspaceType");
CREATE INDEX "ClientWorkspace_status_idx" ON "ClientWorkspace"("status");
CREATE INDEX "ClientWorkspace_deletedAt_idx" ON "ClientWorkspace"("deletedAt");
ALTER TABLE "ClientWorkspace" ADD CONSTRAINT "ClientWorkspace_platformOrganizationId_fkey"
    FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

#### Step 2: Create Project

```sql
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "team" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Project_workspaceId_status_idx" ON "Project"("workspaceId", "status");
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Step 3: Add AuditClient FKs

```sql
ALTER TABLE "AuditClient" ADD COLUMN "clientWorkspaceId" TEXT;
CREATE INDEX "AuditClient_clientWorkspaceId_idx" ON "AuditClient"("clientWorkspaceId");
ALTER TABLE "AuditClient" ADD CONSTRAINT "AuditClient_clientWorkspaceId_fkey"
    FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

#### Step 4: Add AuditEngagement FKs

```sql
ALTER TABLE "AuditEngagement" ADD COLUMN "projectId" TEXT;
CREATE INDEX "AuditEngagement_projectId_idx" ON "AuditEngagement"("projectId");
ALTER TABLE "AuditEngagement" ADD CONSTRAINT "AuditEngagement_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

#### Step 5: Create PlatformAuditLog

```sql
CREATE TABLE "PlatformAuditLog" (
    "id" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "clientWorkspaceId" TEXT,
    "projectId" TEXT,
    "productKey" TEXT NOT NULL,
    "environment" TEXT,
    "actorId" TEXT,
    "actorType" TEXT,
    "actorEmail" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "status" TEXT NOT NULL DEFAULT 'recorded',
    "sourceSystem" TEXT,
    "sourceModel" TEXT,
    "sourceId" TEXT,
    "requestId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "aiPromptVersion" TEXT,
    "aiOutputReviewStatus" TEXT,
    "evidenceRefs" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PlatformAuditLog_platformOrganizationId_createdAt_idx" ON "PlatformAuditLog"("platformOrganizationId", "createdAt");
CREATE INDEX "PlatformAuditLog_clientWorkspaceId_createdAt_idx" ON "PlatformAuditLog"("clientWorkspaceId", "createdAt");
CREATE INDEX "PlatformAuditLog_projectId_createdAt_idx" ON "PlatformAuditLog"("projectId", "createdAt");
CREATE INDEX "PlatformAuditLog_productKey_createdAt_idx" ON "PlatformAuditLog"("productKey", "createdAt");
CREATE INDEX "PlatformAuditLog_actorId_createdAt_idx" ON "PlatformAuditLog"("actorId", "createdAt");
CREATE INDEX "PlatformAuditLog_action_createdAt_idx" ON "PlatformAuditLog"("action", "createdAt");
CREATE INDEX "PlatformAuditLog_targetType_targetId_idx" ON "PlatformAuditLog"("targetType", "targetId");
CREATE INDEX "PlatformAuditLog_sourceSystem_sourceId_idx" ON "PlatformAuditLog"("sourceSystem", "sourceId");
CREATE INDEX "PlatformAuditLog_createdAt_idx" ON "PlatformAuditLog"("createdAt");
```

---

## 4. Pre-Migration Checklist

| Step | Command | Verification |
|---|---|---|
| Backup database | `pg_dump -Fc aqliya > aqliya-$(date +%Y%m%d).dump` | File exists, size > 0 |
| Verify backup | `pg_restore -l aqliya-*.dump \| head -5` | Lists tables |
| Test SQL on staging | Apply SQL to staging DB | No errors |
| Run backfill | `npm run platform:backfill-workspaces:apply` | 100% links |
| Run verification | `npm run platform:verify-org-links` | 100% coverage |
| Run verification | `npm run platform:verify-workspace-links` | 100% coverage |
| Run verification | `npm run platform:verify-audit-logs` | All products present |

---

## 5. Post-Migration Validation

```bash
npm run platform:verify-org-links       # Must show 100%
npm run platform:verify-workspace-links  # Must show 100%
npm run platform:verify-audit-logs       # Must show expected rows
npx prisma generate                      # Must succeed
npx tsc --noEmit                         # Must pass with 0 errors
npm run build                            # Must succeed
```

---

## 6. Rollback Strategy

| Step | SQL |
|---|---|
| Drop PlatformAuditLog | `DROP TABLE IF EXISTS "PlatformAuditLog";` |
| Drop AuditEngagement.projectId | `ALTER TABLE "AuditEngagement" DROP COLUMN "projectId";` |
| Drop AuditClient.clientWorkspaceId | `ALTER TABLE "AuditClient" DROP COLUMN "clientWorkspaceId";` |
| Drop Project | `DROP TABLE IF EXISTS "Project";` |
| Drop ClientWorkspace | `DROP TABLE IF EXISTS "ClientWorkspace";` |
| Restore from backup | `pg_restore -d aqliya aqliya-*.dump` |

**Impact:** Zero data loss if backup exists. Additive columns/ tables only.

---

## 7. No-Go Conditions

| Condition | Action |
|---|---|
| Any existing production table would be dropped | STOP — this migration is additive only |
| Backup fails or doesn't exist | STOP — never migrate without backup |
| Verification script shows < 100% links | STOP — investigate and fix before proceeding |
| `npx tsc --noEmit` errors after migration | STOP — revert and fix |
| `npm run build` fails | STOP — revert and fix |
