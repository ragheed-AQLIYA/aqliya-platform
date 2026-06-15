# Firm Memory Deployment Runbook

**Product:** AuditOS TB Intelligence — Phase 3C/3D  
**Authority:** `docs/architecture/PHASE_3C_FIRM_MEMORY_ENGINE.md`, `PHASE_3D_MEMORY_GOVERNANCE.md`  
**Updated:** 2026-06-13

---

## Scope

Deploys governed firm memory for TB account mapping:

- **3C:** ERP context fields (`erpMap1Label`, `erpMap2Label`, `nameFingerprint`)
- **3D:** Governance lifecycle (`status`, `confirmedReviewerIds`, `memoryVersion`, deprecate fields)

**Not included:** Automatic backfill on production without explicit engagement approval.

---

## Migrations (apply in order)

| Migration | Purpose |
| --------- | ------- |
| `20260614140000_firm_memory_erp_context` | Phase 3C memory lookup fields |
| `20260614150000_firm_memory_governance` | Phase 3D trust lifecycle |

---

## Staging checklist

1. **Backup** RDS snapshot or `npm run db:backup` (dev/staging only).
2. **Deploy application** build that includes `firm-memory-engine.ts` + governance modules.
3. **Migrate:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
4. **Verify schema:**
   ```bash
   npx prisma validate
   ```
5. **Smoke (optional per engagement):**
   ```bash
   npm run phase-3c:validate
   npm run phase-3d:validate-governance
   ```
6. **Backfill (per engagement, not global default):**
   ```bash
   ENGAGEMENT_ID=eng-xxx npm run phase-3c:backfill
   ```
   Requires confirmed `auditAccountMapping` rows for that engagement.

---

## Production checklist

Same as staging with additional gates:

| Gate | Action |
| ---- | ------ |
| Change window | Approved maintenance window |
| Rollback plan | App rollback + migrations are forward-only; deprecate patterns instead of delete |
| No mass backfill | Run backfill only for approved pilot engagements |
| Post-deploy | `scripts/post-deploy-smoke.mjs` + mapping page manual check |
| Monitoring | Watch AuditOS mapping errors in Sentry/CloudWatch |

---

## Rollback / recovery

Prisma migrations are **not** auto-reversed in production.

| Scenario | Action |
| -------- | ------ |
| Bad pattern data | `deprecateFirmMemoryPattern()` via admin/API — sets `DEPRECATED`, excluded from lookup |
| Wrong canonical on pattern | Deprecate + re-confirm mapping in UI (writes new feedback) |
| Full engagement reset | Deprecate org patterns or scoped delete **only** with DBA approval |

---

## Environment variables

No new secrets. Uses existing `DATABASE_URL`.

Optional:

- `ENGAGEMENT_ID` — scopes validation/backfill scripts

---

## Validation commands

| Command | Expected (post-Shalfa backfill) |
| ------- | ------------------------------- |
| `npm run phase-3c:validate` | 100% memory-only accuracy |
| `npm run phase-3d:validate-governance` | 0 TRUSTED, 0 auto-suggest, all CONFIRMED |
| `node scripts/tb-memory-reuse-rate.mjs` | Baseline KPI artifact |

---

## References

- `docs/operations/parallel-execution-cycle-TB-MEMORY.md`
- `docs/operations/client-2-firm-memory-checklist.md`
- `docs/operations/production-deployment-runbook.md` (platform-wide)
