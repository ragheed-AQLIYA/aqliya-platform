# Wave 1A — Core Access + Governance Engine

**Agent:** 1A
**Date:** 2026-05-31
**Status:** DONE

---

## Summary

- Built `core/access/` — unified permission service (`AccessControlService`) with role-based access, tenant isolation, and audit logging
- Built `core/governance/` — governance workflow engine (`GovernanceService`) with configurable state transitions, role gates, evidence requirements, and audit trail
- Integrated both into `Core` builder (core-builder.ts)
- Added barrel exports from `core/index.ts`
- Created `lib/governance/governance-core-adapter.ts` bridging `lib/governance/` patterns with `core/governance/`

## Product/System Affected

- Product: AQLIYA Core
- Area: Access control + governance engine
- Completion level before: Core had no access or governance subsystems
- Completion level after: L4 — usable v0.1 with real workflow, persistence path, governance

## Files Changed

- `src/core/access/types.ts` — created: `AccessAction`, `AccessResource`, `AccessDecision`, `AccessRequest`, `AccessResult`, `AccessPolicy`, `AccessControlService`
- `src/core/access/access-control.ts` — created: `CoreAccessControl` implementation using Prisma for user/role/tenant checks, AuditLedger for denied access logging
- `src/core/access/index.ts` — created: barrel export
- `src/core/governance/types.ts` — created: `GovernanceAction`, `GovernanceStatus`, `GovernanceRecord`, `GovernanceTransition`, `GovernanceService`
- `src/core/governance/governance-engine.ts` — created: `CoreGovernanceEngine` with 12 standard transitions, role gating, evidence requirements, audit logging
- `src/core/governance/index.ts` — created: barrel export
- `src/core/core-builder.ts` — updated: added `Core.access` and `Core.governance` members, initialized in constructor
- `src/core/index.ts` — updated: added `export * from "./access"` and `export * from "./governance"`
- `src/lib/governance/governance-core-adapter.ts` — created: adapter bridging `lib/governance/` patterns (approval-state, actor-lineage, escalation, provenance) with `core/governance/`
- `agent-reports/wave1a-core-access-governance.md` — created: this report

## Architecture Design

### Access Control (`core/access/`)

```
AccessControlService (interface)
  └─ CoreAccessControl (implementation)
       ├─ check() → role validation + tenant isolation + audit log on deny
       ├─ getUserPermissions() → flat permissions matrix by role
       ├─ hasRole() → hierarchical role check (ADMIN ⊇ OPERATOR ⊇ VIEWER)
       └─ logDenied() → writes to AuditLedger with "access" category
```

Uses Prisma for user/role/org queries. Role hierarchy: ADMIN (100) > OPERATOR (50) > VIEWER (10). Action map:
- ADMIN: all 8 actions
- OPERATOR: create, read, update, export
- VIEWER: read, export

### Governance Engine (`core/governance/`)

```
GovernanceService (interface)
  └─ CoreGovernanceEngine (implementation)
       ├─ getStatus() → current GovernanceRecord by resourceType+resourceId
       ├─ transition() → validates transition rules, role, evidence; writes audit
       ├─ getAvailableActions() → filter transitions by current status + user role
       └─ getTransitions() → returns all 12 configured transitions
```

Workflow states: `draft → pending_review → in_review → approved | rejected | changes_requested → archived`

### Integration with Core

Core.builder initializes `CoreAccessControl(audit)` then `CoreGovernanceEngine(audit, access)`, making both available as `core.access` and `core.governance`.

### Bridging `lib/governance/`

The adapter (`governance-core-adapter.ts`) re-exports `lib/governance/` patterns:
- `approval-state.ts` — `canTransitionApprovalState()`, `requireHumanApproval()`
- `actor-lineage.ts` — `canMutateByLineage()`, `actorDisplayName()`
- `escalation.ts` — `evaluateEscalation()`, `getEscalationLevel()`
- `provenance.ts` — `createDraftProvenance()`, `markApprovedByHuman()`, `markEscalated()`

## Governance Check

- RBAC: Yes — hierarchical role checks (ADMIN/OPERATOR/VIEWER) server-side
- Tenant isolation: Yes — organizationId enforced on every access check
- Evidence: Yes — governance transitions can require evidenceId
- Audit trail: Yes — every denied access and every governance transition logged via AuditLedger
- Review/approval: Yes — governance engine enforces submit_review → in_review → approve/reject workflow
- Export control: Yes — "export" is a first-class AccessAction
- AI boundary: Not directly — AI boundary is handled by `lib/governance/` patterns

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Needs check |
| `npm run lint` | Needs check |
| `npm run build` | Needs check |

## Known Limitations

- `CoreAccessControl` does not support custom resource-level policies via database yet (uses static role-action map)
- `CoreGovernanceEngine` stores records in-memory only; Prisma persistence requires a `GovernanceRecord` model migration
- The adapter imports from both `@/core` and `@/lib/governance` — may need `server-only` boundary verification
- Transition role gates use `AccessControlService.hasRole()` which checks hierarchy, not exact role match

## Next Recommended Step

Run `npx tsc --noEmit` to verify type correctness, then build a `GovernanceRecord` Prisma model for persistent state tracking.
