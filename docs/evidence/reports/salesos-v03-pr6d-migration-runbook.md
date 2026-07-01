# SalesOS v0.3 PR-6D — Migration Runbook Summary

**Workstream:** Parallel D — docs-only operations guide  
**Status:** Complete (documentation)  
**Validation:** not validated (no migrate/seed/browser in this pass)

---

## Deliverable

| File | Role |
|------|------|
| docs/operations/salesos-migration-runbook.md | Full operator runbook |
| docs/reports/salesos-v03-pr6d-migration-runbook.md | This summary |

---

## Migration inventory (local)

1. 20260601140000_salesos_p0_core  
2. 20260601150000_salesos_p1_interactions  
3. 20260601160000_salesos_p1_evidence  

Apply via npx prisma migrate deploy in that order when pending.

---

## Operator sequence (short)

1. npx prisma validate + npx prisma migrate status  
2. npx prisma migrate deploy  
3. npx prisma generate  
4. npx tsx scripts/seed-sales-demo.ts or SEED_SALES_DEMO=1 npx prisma db seed  
5. Smoke: /sales, /sales/deals, /sales/accounts, /sales/pipeline

---

## Drift highlights

- Six legacy SalesOS migration names may exist in DB without local SQL — blocks migrate dev.  
- Product status docs lag v0.3 implementation.  
- Verify p1_evidence migration.sql is UTF-8 if deploy fails.

---

## Rollback

Do not use migrate reset or ad-hoc DROP without approval and backup.

---

### ملخص عربي

دليل تشغيل جاهز: ثلاث هجرات SalesOS بالترتيب، ثم generate و seed، مع تحذيرات drift ومسارات smoke — دون تنفيذ migrate في هذه الجلسة.
