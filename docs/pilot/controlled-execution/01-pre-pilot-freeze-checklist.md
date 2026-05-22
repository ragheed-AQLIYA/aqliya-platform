# AQLIYA Controlled Pilot — Pre-Pilot Freeze Checklist

**Document:** 01-pre-pilot-freeze-checklist.md  
**Purpose:** Verify that the platform is frozen for pilot execution.  

---

## Freeze Policy

Only critical pilot-blocking fixes are allowed after freeze. No product expansion, UI redesign, architecture refactor, or workflow logic changes.

## Section 1: Code Freeze

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1.1 | No new features being added | ☐ Frozen ☐ Active | |
| 1.2 | No new modules being created | ☐ Frozen ☐ Active | |
| 1.3 | No backend business logic changes | ☐ Frozen ☐ Active | |
| 1.4 | No Prisma schema changes | ☐ Frozen ☐ Active | |
| 1.5 | No server action changes | ☐ Frozen ☐ Active | |
| 1.6 | No workflow logic changes | ☐ Frozen ☐ Active | |

## Section 2: Route Freeze

| # | Item | Status | Notes |
|---|------|--------|-------|
| 2.1 | No new routes being added | ☐ Frozen ☐ Active | |
| 2.2 | No existing routes being modified | ☐ Frozen ☐ Active | |
| 2.3 | No route redirects being added | ☐ Frozen ☐ Active | |

## Section 3: Workflow Freeze

| # | Item | Status | Notes |
|---|------|--------|-------|
| 3.1 | Audit engagement workflow is stable | ☐ Verified ☐ Needs Review | |
| 3.2 | Account mapping workflow is stable | ☐ Verified ☐ Needs Review | |
| 3.3 | Financial statement generation is stable | ☐ Verified ☐ Needs Review | |
| 3.4 | Notes generation is stable | ☐ Verified ☐ Needs Review | |
| 3.5 | Evidence workflow is stable | ☐ Verified ☐ Needs Review | |
| 3.6 | Review workflow is stable | ☐ Verified ☐ Needs Review | |
| 3.7 | Approval workflow is stable | ☐ Verified ☐ Needs Review | |
| 3.8 | Traceability is functional | ☐ Verified ☐ Needs Review | |
| 3.9 | AI suggestion workflow is stable | ☐ Verified ☐ Needs Review | |

## Section 4: Documentation Freeze

| # | Item | Status | Notes |
|---|------|--------|-------|
| 4.1 | Execution pack is complete | ☐ Verified ☐ Needs Update | Last updated May 12, 2026 |
| 4.2 | Pilot readiness report is complete | ☐ Verified ☐ Needs Update | Last updated May 12, 2026 |
| 4.3 | Dry-run materials are complete | ☐ Verified ☐ Needs Update | Last updated May 12, 2026 |
| 4.4 | Controlled execution docs are complete | ☐ Verified ☐ Needs Update | |
| 4.5 | Risk register is current | ☐ Verified ☐ Needs Update | |

## Section 5: Validation Status

| # | Item | Last Run | Result |
|---|------|----------|--------|
| 5.1 | `npx tsc --noEmit` | May 12, 2026 | ✅ Pass |
| 5.2 | `npm run build` | May 12, 2026 | ✅ Pass |
| 5.3 | `npm run audit:health` | May 12, 2026 | ✅ 7/7 Pass |
| 5.4 | `npm run backup:verify` | May 12, 2026 | ✅ Pass |
| 5.5 | `npm run test:unit` | May 12, 2026 | ✅ 3/3 Pass |

## Section 6: Known Exceptions

| # | Exception | Impact | Approval Required |
|---|-----------|--------|------------------|
| — | None | — | — |

## Section 7: Critical Fix Policy

After freeze, only the following fix types are allowed:

- Critical pilot blocker (blocks TB processing or demo)
- Broken route/link (causes 404 during customer demo)
- Broken UI visibility (outputs unreadable)
- Security concern (data exposure, auth bypass)
- Data loss concern (engagement data at risk)
- Validation failure (build/type/health fails)

These fix types are FORBIDDEN after freeze:

- New feature
- New module
- Architecture refactor
- Visual redesign
- Experimental AI

## Section 8: Rollback Readiness

| # | Item | Status | Notes |
|---|------|--------|-------|
| 8.1 | Git repository is clean | ☐ Yes ☐ Uncommitted changes | |
| 8.2 | Recent working commit identified | ☐ Yes | |
| 8.3 | Rollback procedure documented | ☐ Yes ☐ No | |
| 8.4 | Database backup available | ☐ Yes ☐ No | |

## Section 9: Backup Verification

| # | Item | Status | Notes |
|---|------|--------|-------|
| 9.1 | Database connectivity verified | ✅ | `npm run backup:verify` passes |
| 9.2 | Engagement data present | ✅ | 2 engagements |
| 9.3 | Audit events present | ✅ | 31 events |
| 9.4 | AI outputs present | ✅ | 5 outputs |
| 9.5 | Users present | ✅ | 9 users |

## Section 10: Final Signoff

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Pilot Lead | | | |
