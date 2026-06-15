# Independent Release Decision — PR #5

**Audit council decision:** **APPROVE WITH CONDITIONS**  
**Date:** 2026-06-15  
**Subject:** Merge `auditos/factory-memory-2026-06` (PR #5) to `main` after staging validation

---

## Question

> Can PR #5 be merged after successful staging validation?

---

## Decision

### **APPROVE WITH CONDITIONS**

Merge is **justified for the Shalfa pilot Factory Program scope** once operational gates pass. Merge is **not justified today** without staging proof and CI triage.

This is **not REJECT** because:

- Factory code, migrations, and validation scripts are **committed and inspectable**
- Shalfa 94% gate is **defined, scripted, and evidenced** on full TB locally
- Staging deploy **Test (`tsc`)** passes after COA asset fix
- Security sanitization removed account-level GL from PR evidence files

This is **not unconditional APPROVE** because:

- GitHub PR CI **FAILS** (run `27548070717`: 10 failed tests, 5 suites)
- Staging deploy **never succeeded** (AWS credentials missing)
- Schema gap: **`LeadSchedule` table has no migration**
- Generalization claims in docs **exceed hold-out evidence**

---

## Conditions (all required before merge to `main`)

| # | Condition | Evidence required |
|---|-----------|-------------------|
| C1 | Staging ECS deploy green | Deploy workflow all jobs pass on `staging` |
| C2 | RDS migrations applied | `prisma migrate deploy` exit 0 on staging RDS |
| C3 | Smoke on real URL | `post-deploy-smoke.mjs` critical checks pass @ `https://staging.aqliya.com` |
| C4 | Shalfa reproduced | `shalfa:validate` ≥85 (target ≈94) on full TB against staging DB or approved staging-like RDS |
| C5 | CI disposition | Fix CI failures **or** document waiver with proof failures are env-flaky and unrelated to factory (council recommends fix) |
| C6 | No test-token leak | Confirm `src/app/api/test-token/` never merged; delete locally |

---

## If staging validation PASSes

**Recommended actions:**

1. Merge PR #5 → `main`
2. Tag baseline (e.g. `auditos-factory-rc-2026-06`)
3. Freeze feature scope; open **Cycle 2** (Client #2, reuse KPI) separately
4. Post-merge ticket: `LeadSchedule` migration + reporting-graph drift guard in CI

---

## If staging validation FAILs

**Do not merge.** Open incident; use `MIGRATION_WALKTHROUGH.md` and `STAGING_DRIFT_REPAIR_reporting-graph.sql`. Do not expand scope (Phase 16, Local AI, refactor).

---

## Evidence basis

| Source | Finding |
|--------|---------|
| `git log origin/main..origin/auditos/factory-memory-2026-06` | 13 commits, 602 files |
| `gh pr view 5` | OPEN, MERGEABLE; CI quality **FAILURE** |
| `gh run view 27548070717` | 1961 pass / 10 fail |
| `gh run view 27547489983` | Deploy Test pass; AWS creds fail |
| `docs/audits/evidence/shalfa-live-validation.json` | 578 mappings, accuracy 94, pass true |
| Local `npm test --testPathPatterns=tb-intelligence\|firm-memory\|presentation` | 72/72 pass |
| `prisma/migrations` grep `LeadSchedule` | **No CREATE TABLE** |

---

## Dissent / alternative views

| View | Council response |
|------|------------------|
| “Local 94% is enough; merge now” | Rejected — operational reproducibility is explicit remaining gate |
| “CI red blocks everything” | Partially accepted — staging deploy `tsc` passes; full CI needs triage but is not a factory logic disproof |
| “Docs say L5 pilot-ready = production-ready” | Rejected — docs overstate; evidence supports **pilot RC with conditions** |

---

## Sign-off posture (independent)

```text
Engineering substance:     Sufficient for conditional RC
Operational proof:         Insufficient today
Documentation trust:       Partial — verify claims matrix
Merge authorization:       WITH CONDITIONS after staging PASS
```
