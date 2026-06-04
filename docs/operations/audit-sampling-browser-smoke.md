# AuditOS Sampling — Browser Smoke (5 min)

**Route:** `/audit/engagements/{engagementId}/sampling`  
**Prerequisite:** seeded engagement with trial balance (e.g. `eng-gulf-2025` after `npx prisma db seed`)  
**Auth:** `admin@aqliya.com` / `admin123`  
**Server:** `npm run build` then `npm run start:standalone` (repo `output: standalone` — avoid `next start` alone)

---

## Steps

| # | Action | Pass criteria |
| - | ------ | ------------- |
| 1 | Login → `/audit` → open engagement | Workspace loads, RTL OK |
| 2 | Upload or confirm trial balance | Tab **ميزان المراجعة** has lines |
| 3 | Open tab **العينة** | Page shows population count > 0 |
| 4 | Method **طبقي** (stratified), size 5, seed `smoke-01` | Sample table renders |
| 5 | Repeat with same seed | Same selected IDs (reproducible) |
| 6 | Method **نظامي** (systematic), interval 2 | Shows interval / randomStart in result |
| 7 | Governance banner | Text states human decides — no auto-approval |

---

## Automated (no browser)

```bash
npm test -- src/lib/audit/__tests__/sampling-engine.test.ts
npm test -- src/lib/audit/__tests__/audit-sampling-action.test.ts
npm run demo:smoke
```

---

## Fail escalation

| Symptom | Check |
| ------- | ----- |
| Tab locked | Trial balance missing — workflow gate |
| Empty population | `getTrialBalanceLines` / upload path |
| Action error | Server logs; `generateAuditSamplingAction` RBAC |

**Status label:** browser smoke = **manual**; engine/action tests = **automated**.
