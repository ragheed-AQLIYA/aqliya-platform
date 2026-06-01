# AQLIYA Master Production Plan (Synthesized)

**Date:** 2026-06-01  
**Status:** Execution roadmap Phases 9–12

## Current gate summary

| Gate | Status |
|------|--------|
| Production deploy | **no-go** |
| CI automated tests | **open** |
| Shared DB migrate | **B1 waiver** — pilot DB required |
| SalesOS L6 | **not achieved** |
| AuditOS L5 | **protect** — conditional GO |
| LocalContentOS L5 | PO gate open |

## Phase 9 — DB & migration integrity (P0)

**Owner:** Migration Agent  
**Parallel:** safe

- Create `aqliya_pilot` database on localhost
- `npx prisma migrate deploy` on pilot (clean baseline)
- `npx prisma db seed`
- Run `scripts/backfill-platform-organizations.ts --apply`
- Run `scripts/backfill-sunbul-platform-org.ts --apply`
- Document shared DB baseline OR retire shared dev DB

## Phase 10 — SalesOS L6 completion (P0)

**Owner:** SalesOS Agent  
**Depends:** Phase 9 for runtime smoke

- Fix remaining `sales-actions` / prisma repository test gaps
- Green `next build --webpack` for sales critical path
- Authenticated curl + browser smoke all `/sales/*` routes
- Commit L5 tree if not fully committed

## Phase 11 — Platform hardening (P1)

**Owner:** Platform Agent  
**Parallel:** after Phase 10 build green

- Replace Core stubs (`@/core/evidence`, `@/core/output`) with real implementations or lib/platform re-exports
- CI: add `jest src/lib/sales/__tests__/sales-governance.test.ts` + health integration
- SSO / backup automation scoping (human infra)
- `audit-vnext-actions` — stub or implement missing workpaper exports without breaking AuditOS L5 routes

## Phase 12 — WorkflowOS governance column (P1)

**Owner:** WorkflowOS Agent  
**Depends:** Phase 9 migrate

- Apply `20260528005759_add_governance_fields_v0_2` on pilot
- Verify `SunbulClient.platformOrganizationId` backfill
- Smoke `/workflowos` tenant isolation

## Parallel agent assignments

| Agent | Phases | Can start now |
|-------|--------|---------------|
| Migration Agent | 9 | Yes |
| SalesOS Agent | 10 | Code fixes yes; smoke after 9 |
| Platform Agent | 11 | Core/docs yes |
| WorkflowOS Agent | 12 | After migrate |
| Smoke Agent | 10–12 | After pilot DB |

## Validation target (v0.1 platform)

**Pilot-ready with conditions** when: pilot DB migrated, sales build green, authenticated smoke pass, honest matrix updated — still **production no-go** until CI + ops gates.
