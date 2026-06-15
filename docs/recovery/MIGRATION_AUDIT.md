# Migration Audit — AuditOS Recovery

**Branch:** `auditos/factory-memory-2026-06`  
**Last migration in `main` (HEAD parent):** `20260608120000_l0_05_sso_scim`  
**New local migrations:** 7 (20260609 → 20260615)

---

## Apply Order (mandatory sequence)

| # | Migration | Depends on | Safe | Risk |
|---|-----------|------------|------|------|
| 1 | `20260609100000_tb_intelligence_firm_memory` | SSO/scim baseline | **Yes** | **Medium** — creates `TBMappingPattern`, `TenantIntegration`; uses `IF NOT EXISTS` for TenantIntegration |
| 2 | `20260613100000_reporting_graph_foundation` | AuditEngagement | **Yes** | **Low** — additive tables only |
| 3 | `20260614120000_engagement_presentation_profile` | AuditEngagement | **Yes** | **Low** — nullable columns on engagement |
| 4 | `20260614130000_presentation_policy_engine` | #3 | **Yes** | **Low** — new policy table + FK |
| 5 | `20260614140000_firm_memory_erp_context` | #1 | **Yes** | **Low** — `ADD COLUMN IF NOT EXISTS` |
| 6 | `20260614150000_firm_memory_governance` | #5 | **Yes** | **Medium** — new enum + status default CONFIRMED on existing rows |
| 7 | `20260615100000_tb_classification_detail` | #1 (TBClassificationHistory) | **Yes** | **Low** — optional JSONB column |

**No destructive DROP TABLE / DROP COLUMN** in new migrations.

---

## Drift Notes (local dev)

`npx prisma migrate status` reported **3 pending** migrations while dev DB may already have columns from manual `db execute`. Before staging:

```sql
SELECT migration_name, finished_at FROM "_prisma_migrations"
ORDER BY finished_at DESC LIMIT 15;
```

If columns exist but migration row missing → `prisma migrate resolve --applied <name>` (staging only, with DBA review).

---

## Staging Deployment Sequence

```bash
# 1. Backup RDS snapshot
# 2. Deploy app build from auditos/factory-memory-2026-06
# 3. Migrate
npx prisma migrate deploy
npx prisma generate
# 4. Seed presentation policies (if seed updated)
npx prisma db seed
# 5. Smoke
npm run phase-3d:validate-governance   # optional, engagement-specific
scripts/post-deploy-smoke.mjs
```

---

## Production Deployment Sequence

Same as staging with:

- Maintenance window approval
- **Do not** auto-run `phase-3c:backfill` globally
- Backfill firm memory **per approved engagement** only
- Rollback = app revert + forward-only schema (deprecate patterns, do not drop tables)

---

## Rollback Strategy

| Scenario | Action |
|----------|--------|
| App regression | Revert ECS/Vercel to previous image |
| Bad memory patterns | `deprecateFirmMemoryPattern()` — no schema rollback |
| Failed migration mid-way | Restore RDS snapshot; do not `migrate reset` on prod |
| Presentation policy error | Reassign engagement to `generic-v1` policy |

---

## Conflict Risk Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Duplicate TenantIntegration create | Low | Migration uses IF NOT EXISTS |
| Enum TBMappingPatternStatus on PG | Low | Single CREATE TYPE |
| Schema vs `_prisma_migrations` drift | Medium | Resolve before deploy |
| Missing TBMappingPattern on prod | **High** if deploy app before migrate | **Always migrate before traffic** |
