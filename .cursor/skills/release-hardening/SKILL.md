---
name: release-hardening
description: Use for release hardening, pilot readiness, validation gates, final QA, and go/no-go reports.
---

# Release Hardening Skill

## Required Output

- release scope
- changed files
- validation matrix
- blockers
- accepted limitations
- go/no-go decision
- next lowest-risk step

## Classifications

- NOT_VALIDATED
- LIGHT_VALIDATED
- TYPESCRIPT_PASS
- BUILD_PASS
- CONTROLLED_PILOT_READY
- DONE_WITH_CONCERNS
- PRODUCTION_NO_GO
- PRODUCTION_CANDIDATE

Never use PRODUCTION_READY without full evidence.

## Default Validation Matrix (run only with approval)

| Command | When |
|---------|------|
| `npx tsc --noEmit` | Type changes |
| `npm run lint` | Any TS/TSX change |
| `npm test` | Logic/governance changes |
| `npm run build` | Pre-release or route/build changes |
| Browser smoke | UI/auth/routing changes |

Align final report with `AGENTS.md` section 25 when completing product tasks.
