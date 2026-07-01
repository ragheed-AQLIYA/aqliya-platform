# PHASE 28 Final Hotfix — Governance Bypass Closure (R-01–R-04)

**Date:** 2026-06-21  
**Status:** COMPLETE  
**Prior audit:** `PHASE_28_FINAL_INDEPENDENT_AUDIT.md` → `PHASE_28_FINAL_BLOCKED`  
**Post-hotfix verdict:** `PHASE_28_FINAL_ACCEPTED`

---

## Summary

Closed four governance bypass findings from the independent red team audit. All paths to `ACTIVE` now require integrity verification; rollback targets are explicitly policy-bound; release requires OPERATOR; middleware covers Knowledge Foundation routes.

---

## Fixes

### R-01 — Rollback integrity bypass

**File:** `rollback-service.ts`

- `executeRollback()` calls `verifyReleaseIntegrity(targetVersionId, { forActivation: true })` **before** any status mutations
- Failure throws `Rollback integrity verification failed` + emits `integrity.failed`

### R-02 — Rollback target validation

**File:** `rollback-service.ts`

- Exported `ROLLBACK_ALLOWED_TARGET_STATUSES = ["RELEASED", "ACTIVE"]`
- Rejects `DRAFT`, `APPROVED`, `DEPRECATED` with explicit error

### R-03 — Release authorization gap

**Files:** `actions.ts`, `release-generator.ts`

- `generateFoundationRelease()` → `assertOperator(user)`
- `generateReleasePackage()` → server-side `getCurrentUser()` OPERATOR/ADMIN check (defense in depth)

### R-04 — Middleware coverage

**File:** `middleware.ts`

- Added `/knowledge-foundation`: `viewer` in `routeMinRoles`
- Added `/knowledge-foundation` and `/knowledge-foundation/:path*` to `config.matcher`

### Supporting change

**File:** `release-integrity.ts`

- `forActivation` option allows status gate `RELEASED | ACTIVE` (used by activate + rollback)

---

## Tests Added/Updated

| File | Coverage |
|------|----------|
| `phase-28-final-hotfix.test.ts` | rollback fail/pass, viewer release denied, middleware source |
| `knowledge-rollback.test.ts` | integrity mock, DEPRECATED/APPROVED rejected, integrity fail blocks update |
| `phase-28-2-version-scoped.test.ts` | auth mock for release generator |
| `phase-28-2-release-hardening.test.ts` | auth mock for release generator |

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- knowledge-foundation phase-28-final-hotfix migration-evidence` | Pass |

---

## Verdict

```text
PHASE_28_FINAL_ACCEPTED
ADR-028 IMPLEMENTED AND CLOSED (governance paths)
READY_FOR_PHASE_29 — Enterprise Readiness Track
```

R-05–R-08 remain operational hardening items for Phase 29 (runbooks, recovery, transactions) — not governance bypasses.

---

## Phase 29 Recommended Scope

1. Release Approval SOP  
2. Rollback SOP (integrity re-check policy documented)  
3. Evidence Retention Policy  
4. Pilot Governance Runbook  
5. Operational Monitoring & Incident Response  
6. RELEASED+FAILED recovery runbook (R-06)
