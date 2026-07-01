# Tabletop Readiness Verdict

**Generated:** 2026-06-22  
**Evidence:** `tabletop-db-probe.mjs`, `platform:bootstrap-tabletop`, account rows in `prisma/seed.ts`, live staging/production probes.

---

## Checklist

| Item | Local | Remote staging | Remote production |
|------|-------|----------------|-------------------|
| KF tables | ✅ probe | ❓ no access | ❓ not probed |
| ACTIVE version + integrity | ✅ bootstrap | ❌ | ❓ |
| PROMOTED pool (≥2) | ✅ 2 | ❌ | ❓ |
| Accounts admin/operator/viewer | ✅ 3 users | ❌ | ❓ |
| DNS / URL reachable | N/A (localhost) | ❌ ENOTFOUND | ✅ aqliya.com 200 |
| Human exercise executed | ❌ not done | ❌ | ❌ |

---

## Account Evidence (local DB)

From `tabletop-db-probe.mjs`:

| Email | Role | Password in seed |
|-------|------|------------------|
| `admin@aqliya.com` | ADMIN | `admin123` (`prisma/seed.ts`) |
| `sara@aqliya.com` | OPERATOR | `operator123` |
| `mohammad@aqliya.com` | VIEWER | `viewer123` |

---

## SOP / Runbook Files (repo)

Present under `docs/operations/knowledge-foundation/` (glob verified):

- `TABLETOP_GOVERNANCE_EXERCISE.md`
- `TABLETOP_READINESS_CHECKLIST.md`
- `TABLETOP_EXECUTION_RECORD.md`
- `TABLETOP_AFTER_ACTION_REPORT.md`
- `RELEASE_APPROVAL_SOP.md`, `ROLLBACK_SOP.md`

**Human tabletop completion records:** not found in repo (exercise not executed).

---

## Verdicts

| Environment | Status | Reason |
|-------------|--------|--------|
| **Local** | **CONDITIONAL GO** | Bootstrap cycle proven (`TABLETOP_READY=YES`); human exercise + signed records still pending |
| **Remote staging** | **NO-GO** | DNS ENOTFOUND — cannot run remote tabletop |
| **Production** | **NO-GO for tabletop** | Live app healthy but KF accounts/state not verified on prod DB |

---

## Overall Tabletop Recommendation

**CONDITIONAL GO** — proceed with **local human tabletop** only after scheduling exercise using SOP templates.  
**NO-GO** for remote/staging tabletop until DNS + staging DB + bootstrap on that environment.
