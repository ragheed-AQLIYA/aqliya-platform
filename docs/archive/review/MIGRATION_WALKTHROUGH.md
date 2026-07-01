# Migration Walkthrough — AuditOS Factory Program (PR #5)

**Branch:** `auditos/factory-memory-2026-06`  
**PR:** [#5](https://github.com/ragheed-AQLIYA/aqliya-platform/pull/5)  
**Baseline on `main`:** `20260608120000_l0_05_sso_scim`  
**New migrations:** 7 (20260609 → 20260615)  
**Date:** 2026-06-15  
**Risk class:** **Risk B — Data/Schema Risk** (companion to `docs/review/58E4021_REVIEW_PACK.md` — Risk A)

---

## Executive Summary

| Gate | Result |
|------|--------|
| Additive migrations | ✅ All 7 — CREATE TABLE / ADD COLUMN only |
| No destructive alters | ✅ No `DROP TABLE`, `DROP COLUMN`, `ALTER TYPE` destructive |
| No mandatory data rewrite | ✅ No `UPDATE` mass backfill in SQL |
| Optional seed data | ⚠️ Migration #4 inserts 2 system presentation policies |
| Rollback documented | ✅ Per-migration below + RDS snapshot strategy |
| Apply order fixed | ✅ Chronological — do not reorder |

**Overall schema risk:** **Medium** (migration #1 is largest surface; rest are Low)

**Critical deploy rule:**

```text
migrate deploy BEFORE routing production traffic to new app build
```

Deploying app code before migrations → runtime errors on missing `TBMappingPattern`, `ReportingGraph`, etc.

---

## Mandatory Apply Order

```text
main baseline: 20260608120000_l0_05_sso_scim
        │
        ▼
[1] 20260609100000_tb_intelligence_firm_memory          ← HIGHEST SCHEMA RISK
        │
        ▼
[2] 20260613100000_reporting_graph_foundation
        │
        ▼
[3] 20260614120000_engagement_presentation_profile
        │
        ▼
[4] 20260614130000_presentation_policy_engine
        │
        ├──────────────────┐
        ▼                  │
[5] 20260614140000_firm_memory_erp_context  (requires [1])
        │
        ▼
[6] 20260614150000_firm_memory_governance   (requires [5])
        │
        ▼
[7] 20260615100000_tb_classification_detail (requires [1])
```

**Command (staging / production):**

```bash
# After RDS snapshot
npx prisma migrate deploy
npx prisma generate
```

**Verify:**

```sql
SELECT migration_name, finished_at
FROM "_prisma_migrations"
WHERE migration_name LIKE '202606%'
ORDER BY finished_at;
-- Expect 7 rows with non-null finished_at
```

---

## Summary Matrix (All 7)

| # | Migration ID | Purpose | Objects | Data Migration | Backward Compatible | Prod Risk | Depends On |
|---|--------------|---------|---------|----------------|---------------------|-----------|------------|
| 1 | `20260609100000_tb_intelligence_firm_memory` | TB Intelligence + Firm Memory foundation | 2 enums, 4 tables | No | Yes (additive) | **Medium** | `Organization`, `AuditEngagement` (FK org only) |
| 2 | `20260613100000_reporting_graph_foundation` | Reporting graph + lead schedule lines | 5 tables | No | Yes | **Low** | `AuditEngagement`, `LeadSchedule` |
| 3 | `20260614120000_engagement_presentation_profile` | IS presentation profile on engagement | 2 nullable columns | No | Yes | **Low** | `AuditEngagement` |
| 4 | `20260614130000_presentation_policy_engine` | Presentation policy table + FK | 1 table, 1 column, 2 seed rows | **Yes** (INSERT) | Yes | **Low** | #3, `AuditEngagement` |
| 5 | `20260614140000_firm_memory_erp_context` | ERP context on firm memory | 7 nullable columns, 3 indexes | No | Yes | **Low** | #1 `TBMappingPattern`, `TBMappingFeedback` |
| 6 | `20260614150000_firm_memory_governance` | Governed memory lifecycle | 1 enum, 8 columns | No (defaults only) | Yes | **Medium** | #5 |
| 7 | `20260615100000_tb_classification_detail` | Trust + Evidence JSON snapshot | 1 nullable JSONB column | No | Yes | **Low** | #1 `TBClassificationHistory` |

---

## Priority 1 — TB Intelligence Foundation

### `20260609100000_tb_intelligence_firm_memory`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260609100000_tb_intelligence_firm_memory` |
| **Purpose** | Foundation for TB Intelligence pipeline and Firm Memory — pattern storage, classification history, feedback loop, tenant integration registry |
| **Production Risk** | **Medium** — largest new surface; blocks classification/memory if app deploys first |

#### Objects Added

**Enums:**

| Enum | Values |
|------|--------|
| `IntegrationType` | `AI`, `CRM`, `ERP`, `STORAGE`, `EMAIL`, `WEBHOOK` |
| `IntegrationStatus` | `ACTIVE`, `ERROR`, `DISABLED`, `PENDING` |

**Tables:**

| Table | Key columns | FK |
|-------|-------------|-----|
| `TenantIntegration` | orgId, type, provider, status, vaultSecretId, configMetadata | → `Organization` |
| `TBMappingPattern` | orgId, clientAccountCode, canonicalAccountId, hitCount, confidence | → `Organization` |
| `TBMappingFeedback` | orgId, engagementId, clientAccountCode, acceptedCanonicalId, reviewerId | → `Organization` |
| `TBClassificationHistory` | orgId, engagementId, accountCode, resultCategory, source, confidence | → `Organization` |

**Indexes:** Unique on `(organizationId, clientAccountCode)` for patterns; org/engagement indexes on history and feedback.

#### Data Migration

**No** — no `INSERT`/`UPDATE` in SQL. Firm memory backfill is **application script** (`phase-3c:backfill`) — **not** run automatically by migrate deploy.

#### Backward Compatible

**Yes** — purely additive. Existing AuditOS flows unchanged until app code reads/writes new tables.

**Caveats:**

- `TenantIntegration` uses `CREATE TABLE IF NOT EXISTS` — safe if table pre-exists from manual work
- Enums `IntegrationType` / `IntegrationStatus` use plain `CREATE TYPE` — **will fail if enums already exist** (unlikely on clean staging from main)
- `TBMappingPattern` / feedback / history use plain `CREATE TABLE` — **not idempotent**; re-run fails if tables exist

#### Rollback Plan

| Scenario | Action |
|----------|--------|
| Migration failed mid-way | Restore RDS snapshot |
| Migration applied, app broken | Revert app image; **keep schema** (forward-only) |
| Need to undo data | `DELETE FROM "TBMappingPattern" WHERE ...` or deprecate via governance (migration #6) |
| Full schema rollback | **Not supported in-place** — restore snapshot only |

**Do not** `DROP TABLE TBMappingPattern` on production without DBA approval — loses firm memory.

#### Dependencies

- `Organization` table (existing)
- Prisma baseline through `20260608120000_l0_05_sso_scim`

#### Staging Verification

```sql
SELECT COUNT(*) FROM "TBMappingPattern";           -- 0 OK pre-backfill
SELECT COUNT(*) FROM "TBClassificationHistory";    -- 0+ OK
\d "TenantIntegration"                             -- table exists
```

```bash
npx prisma migrate status   # no pending for this migration after deploy
```

#### Reviewer Notes

- **Highest schema risk** in the program — enables entire Firm Memory moat
- No mandatory backfill at migrate time ✅
- Classification flow **requires** this migration before factory TB upload with memory

---

## Priority 2 — Presentation Engine

### `20260614120000_engagement_presentation_profile`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260614120000_engagement_presentation_profile` |
| **Purpose** | Phase 13.1 — store engagement-level IS presentation profile (generic vs pilot-audited) |
| **Production Risk** | **Low** |

#### Objects Added

**Columns on `AuditEngagement`:**

| Column | Type | Nullable |
|--------|------|----------|
| `presentationProfile` | TEXT | ✅ Yes |
| `presentationProfileVersion` | TEXT | ✅ Yes |

#### Data Migration

**No**

#### Backward Compatible

**Yes** — NULL means app resolves to generic profile in code.

#### Rollback Plan

- App revert: NULL columns ignored by old code (if old code ignores unknown columns — Prisma may require matching schema)
- Schema rollback: `ALTER TABLE "AuditEngagement" DROP COLUMN IF EXISTS "presentationProfile", DROP COLUMN IF EXISTS "presentationProfileVersion";` — only with DBA approval

#### Dependencies

- `AuditEngagement` table

---

### `20260614130000_presentation_policy_engine`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260614130000_presentation_policy_engine` |
| **Purpose** | Phase 13.2 — DB-backed presentation policies (generic + Shalfa pilot) |
| **Production Risk** | **Low** |

#### Objects Added

**Table `AuditPresentationPolicy`:**

| Column | Notes |
|--------|-------|
| id, slug, name, version | Unique slug |
| rules | JSONB — IS line rules |
| isSystem | default true |
| organizationId | nullable — system policies |

**Column on `AuditEngagement`:**

| Column | Type | Nullable | FK |
|--------|------|----------|-----|
| `presentationPolicyId` | TEXT | ✅ Yes | → `AuditPresentationPolicy` ON DELETE SET NULL |

**Seed data (data migration):**

| id | slug | Purpose |
|----|------|---------|
| `pol-generic-v1` | `generic-v1` | Default presentation rules |
| `pol-shalfa-pilot-audited-v1` | `shalfa-pilot-audited-v1` | Shalfa pilot GL calibration (JSON rules — not raw TB) |

`INSERT ... ON CONFLICT ("id") DO NOTHING` — **idempotent re-run safe**.

#### Data Migration

**Yes** — 2 system policy rows inserted. No customer TB data — GL code lists in JSON only.

#### Backward Compatible

**Yes** — engagements without `presentationPolicyId` use generic resolution path.

#### Rollback Plan

| Scenario | Action |
|----------|--------|
| Wrong policy assigned | Update engagement: `presentationPolicyId = 'pol-generic-v1'` |
| Remove seed policies | `DELETE FROM "AuditPresentationPolicy" WHERE isSystem = true` — only if no FK references |
| App revert | Old app ignores policy table if not referenced |

#### Dependencies

- #3 presentation profile columns (logical; FK is to policy table only)
- `AuditEngagement`

#### Staging Verification

```sql
SELECT id, slug FROM "AuditPresentationPolicy";
-- Expect pol-generic-v1, pol-shalfa-pilot-audited-v1
```

---

## Priority 3 — Firm Memory Governance

### `20260614140000_firm_memory_erp_context`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260614140000_firm_memory_erp_context` |
| **Purpose** | Phase 3C — ERP Map1/Map2 labels and name fingerprint for pattern matching |
| **Production Risk** | **Low** |

#### Objects Added

**`TBMappingPattern` columns (all nullable, `IF NOT EXISTS`):**

| Column | Purpose |
|--------|---------|
| `erpMap1Label` | ERP Map1 text |
| `erpMap2Label` | ERP Map2 text |
| `nameFingerprint` | Normalized name hash |
| `lastConfirmedById` | Reviewer reference |
| `lastEngagementId` | Source engagement |

**`TBMappingFeedback` columns:** `erpMap1Label`, `erpMap2Label` (nullable)

**Indexes:** `(organizationId, nameFingerprint)`, `(organizationId, erpMap1Label, erpMap2Label)`

#### Data Migration

**No**

#### Backward Compatible

**Yes** — NULL-safe; existing patterns work without ERP context until backfill/enrichment.

#### Rollback Plan

- Forward-only; columns can remain unused after app revert
- Drop columns only via controlled migration (not in repo)

#### Dependencies

- #1 `TBMappingPattern`, `TBMappingFeedback`

#### Reviewer Checklist

- [x] NULL-safe columns
- [x] No mandatory backfill in SQL
- [x] `ADD COLUMN IF NOT EXISTS` — drift-tolerant

---

### `20260614150000_firm_memory_governance`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260614150000_firm_memory_governance` |
| **Purpose** | Phase 3D — governed memory lifecycle (DRAFT → CONFIRMED → TRUSTED → DEPRECATED) |
| **Production Risk** | **Medium** — enum + NOT NULL defaults on existing table |

#### Objects Added

**Enum `TBMappingPatternStatus`:** `DRAFT`, `CONFIRMED`, `TRUSTED`, `DEPRECATED`

**`TBMappingPattern` columns:**

| Column | Type | Default | Nullable |
|--------|------|---------|----------|
| `status` | TBMappingPatternStatus | `'CONFIRMED'` | NOT NULL |
| `lastConfirmedAt` | TIMESTAMP | — | Yes |
| `confirmedReviewerIds` | JSONB | `'[]'` | NOT NULL |
| `auditClientId` | TEXT | — | Yes |
| `erpChartKey` | TEXT | — | Yes |
| `memoryVersion` | INTEGER | `1` | NOT NULL |
| `deprecatedAt` | TIMESTAMP | — | Yes |
| `deprecatedReason` | TEXT | — | Yes |

**Indexes:** `(organizationId, status)`, `(auditClientId)`

#### Data Migration

**No explicit UPDATE** — PostgreSQL applies `DEFAULT 'CONFIRMED'` to existing rows at column add time.

**Post-migrate application backfill** (optional, per engagement):

```bash
npm run phase-3c:backfill-firm-memory   # NOT auto-run on deploy
npm run phase-3d:validate-governance
```

#### Backward Compatible

**Yes** with semantics:

- Empty `TBMappingPattern` at first deploy → no row impact
- Rows inserted before #6 get `status = CONFIRMED` automatically
- **No mandatory TRUSTED promotion** — TRUSTED grows via governance workflow only
- `confirmedReviewerIds` defaults to `[]` — safe for reads

#### Rollback Plan

| Scenario | Action |
|----------|--------|
| Bad patterns promoted | App: `deprecateFirmMemoryPattern()` — sets DEPRECATED |
| App revert | Old app may not know `status` column — **requires app/schema match**; revert app only if old build ignores new columns (Prisma client must match) |
| Schema rollback | Restore snapshot — do not drop enum in prod ad hoc |

#### Dependencies

- #5 ERP context columns (logical ordering)
- #1 `TBMappingPattern`

#### Reviewer Checklist

- [x] NULL-safe optional fields (`lastConfirmedAt`, `auditClientId`, etc.)
- [x] Backward compatible defaults (`CONFIRMED`, `[]`, `memoryVersion=1`)
- [x] No mandatory backfill in migration SQL
- [ ] Confirm staging: 578 patterns → all `CONFIRMED`, 0 `TRUSTED` post-backfill (expected)

---

## Priority 4 — Reporting Layer

### `20260613100000_reporting_graph_foundation`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260613100000_reporting_graph_foundation` |
| **Purpose** | AuditOS 2.0 reporting graph (nodes/edges/snapshots) + `LeadScheduleLine` detail rows |
| **Production Risk** | **Low** |

#### Objects Added

| Table | Purpose |
|-------|---------|
| `ReportingGraph` | One graph per engagement (unique engagementId) |
| `ReportingGraphNode` | Entity nodes in graph |
| `ReportingGraphEdge` | Relationships between nodes |
| `ReportingGraphSnapshot` | Milestone snapshots (JSON payload) |
| `LeadScheduleLine` | Line-level lead schedule amounts |

**FK chain:** Graph → `AuditEngagement` CASCADE; nodes/edges/snapshots → graph CASCADE; lines → `LeadSchedule` CASCADE.

#### Data Migration

**No**

#### Backward Compatible

**Yes** — new tables only; existing FS/mapping flows unaffected until graph sync runs.

#### Rollback Plan

- App revert: orphan graph tables harmless if unused
- Data loss on CASCADE if engagement deleted — by design

#### Dependencies

- `AuditEngagement` (must exist)
- `LeadSchedule` (must exist on main — pre-existing AuditOS table)

#### Staging Verification

```sql
SELECT COUNT(*) FROM "ReportingGraph";   -- 0+ OK
```

---

### `20260615100000_tb_classification_detail`

| Field | Detail |
|-------|--------|
| **Migration ID** | `20260615100000_tb_classification_detail` |
| **Purpose** | Phase 4 Trust + Evidence — store structured classification explanation JSON per history row |
| **Production Risk** | **Low** |

#### Objects Added

| Table | Column | Type | Nullable |
|-------|--------|------|----------|
| `TBClassificationHistory` | `classificationDetail` | JSONB | ✅ Yes |

#### Data Migration

**No** — populated by application on new classifications only; old rows remain NULL.

#### Backward Compatible

**Yes** — NULL means no evidence drawer data for legacy history rows.

#### Rollback Plan

- App revert: column ignored if Prisma client matches
- Forward-only schema preferred

#### Dependencies

- #1 `TBClassificationHistory`

#### Staging Verification

```sql
SELECT COUNT(*) FROM "TBClassificationHistory" WHERE "classificationDetail" IS NOT NULL;
-- >0 after mapping run with Phase 4 app
```

---

## Drift Handling (Pre-Staging)

Local dev reported **3 pending** migrations while columns may already exist from manual `db execute`.

**Before staging deploy:**

```sql
-- Check applied migrations
SELECT migration_name, finished_at FROM "_prisma_migrations"
ORDER BY started_at DESC LIMIT 15;

-- Check if columns exist without migration row
SELECT column_name FROM information_schema.columns
WHERE table_name = 'TBMappingPattern' AND column_name = 'status';
```

| Situation | Action |
|-----------|--------|
| Column exists, migration row missing | `npx prisma migrate resolve --applied <migration_name>` **with DBA review** |
| Migration row exists, column missing | Re-run `migrate deploy` or restore snapshot |
| Clean staging from main snapshot | `migrate deploy` only — preferred path |

**Staging should start from RDS snapshot of production/main baseline — avoid resolve unless drift proven.**

---

## Staging Deployment Runbook

```bash
# 0. RDS snapshot (mandatory)
# 1. Deploy branch build to staging
# 2. Migrate
export DATABASE_URL="postgresql://..."   # staging
npx prisma migrate deploy
npx prisma generate

# 3. Optional seed (if policies missing — migration #4 should have seeded)
npx prisma db seed

# 4. Build smoke
npm run build

# 5. Shalfa validation (requires TB + engagement on staging DB)
TB_FILE="/path/to/pilot-tb.xlsx" npm run shalfa:setup    # if not seeded
npm run shalfa:validate

# 6. Optional governance check
npm run phase-3d:validate-governance
```

### Success Criteria (Merge Gate)

| Check | Target |
|-------|--------|
| `migrate deploy` | 7/7 applied, exit 0 |
| `npm run build` | PASS |
| `shalfa:validate` | Factory Accuracy ≈ **94** |
| Middleware smoke | `/audit/*` accessible for admin |
| No destructive SQL | ✅ confirmed in this doc |

---

## Production Rollback Matrix

| Failure mode | First action | Schema action |
|--------------|--------------|---------------|
| Migration fails | Stop deploy; restore RDS snapshot | Restore |
| App regression post-migrate | Revert ECS/Vercel image | **Keep schema** (forward-only) |
| Bad firm memory patterns | Run deprecate workflow | UPDATE status → DEPRECATED |
| Wrong presentation policy | Set engagement to `pol-generic-v1` | None |
| Failed mid-migration | Restore snapshot | Restore |

**Never on production:**

- `prisma migrate reset`
- `DROP TABLE` on factory tables without snapshot
- Global `phase-3c:backfill` without engagement approval

---

## Final Gate — PR #5 Review Ready

| Area | Result |
|------|--------|
| Additive migrations | ✅ |
| No destructive alters | ✅ |
| No data rewrite in SQL | ✅ (seed policies only in #4) |
| NULL-safe / backward compatible | ✅ |
| No mandatory backfill at migrate | ✅ |
| Rollback documented | ✅ |
| Staging migrate deploy | ⏳ **Operator to run** |

**When staging passes:**

```text
PR #5 → Review Ready → Merge to main
```

**Remaining operator commands:**

```bash
npx prisma migrate deploy
npm run build
TB_FILE="/path/to/pilot-tb.xlsx" npm run shalfa:validate
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `docs/review/58E4021_REVIEW_PACK.md` | Risk A — platform/auth/middleware |
| `docs/recovery/MIGRATION_AUDIT.md` | Recovery-era migration audit |
| `docs/recovery/POST_SANITIZATION_AUDIT.md` | R1 GREEN + push status |
| `docs/operations/firm-memory-deployment-runbook.md` | Post-deploy firm memory ops |

---

## Reviewer Sign-Off

| Reviewer | Date | Migrations reviewed | Staging deploy | Verdict |
|----------|------|---------------------|----------------|---------|
| | | ☐ 1-7 | ☐ Pass | ☐ Review Ready ☐ Blocked |

---

*Feature Freeze active — no new migrations until PR #5 merges or explicit approval.*
