# Wave 2A — Core Engine Unification Report

## Summary

- Created `CoreUnifiedEvidenceService` — wraps `PrismaEvidenceStore` with `storeEvidence`, `getEvidence`, `listEvidence`, `deleteEvidence`, `verifyEvidence`, `rejectEvidence`
- Created `CoreUnifiedAuditService` — wraps `PrismaAuditLedger` with `log`, `query`, `getTimeline`
- Created `CoreUnifiedWorkflowService` — wraps `PrismaWorkflowEngine` with `createInstance`, `transition`, `getState`, `getAvailableActions`
- Added all three services to `Core` class in `core-builder.ts` as `unifiedEvidence`, `unifiedAudit`, `unifiedWorkflow`
- Updated product evidence adapters (AuditOS, DecisionOS, LocalContentOS) to expose `getUnifiedEvidenceService()`
- Updated barrel exports in `src/core/evidence/index.ts`, `src/core/audit/index.ts`, `src/core/workflow/index.ts`

## Product/System Affected

- Product: AQLIYA Core
- Area: Shared engines — Evidence, Audit, Workflow
- Completion level before: L3 (separate per-product implementations)
- Completion level after: L4 (unified service layer with Prisma persistence)

## Files Changed

- `src/core/evidence/evidence-unified-service.ts` — **NEW** Unified evidence service
- `src/core/evidence/index.ts` — Added exports for unified service + PrismaEvidenceStore
- `src/core/audit/audit-unified-service.ts` — **NEW** Unified audit service
- `src/core/audit/index.ts` — Added exports for unified service + PrismaAuditLedger
- `src/core/workflow/workflow-unified-service.ts` — **NEW** Unified workflow service
- `src/core/workflow/index.ts` — Added exports for unified service + Prisma engines
- `src/core/core-builder.ts` — Added `unifiedEvidence`, `unifiedAudit`, `unifiedWorkflow` to Core class
- `src/products/local-content/core-adapters/evidence-adapter.ts` — Added `getUnifiedEvidenceService()`
- `src/products/local-content/core-adapters/index.ts` — Exported new function
- `src/products/decisions/core-adapters/evidence-adapter.ts` — Added `getUnifiedEvidenceService()`
- `src/products/decisions/core-adapters/index.ts` — Exported new function
- `src/products/audit/core-adapters/evidence-adapter.ts` — Added `getUnifiedEvidenceService()`
- `src/products/audit/core-adapters/index.ts` — Exported new function

## Governance Check

- RBAC: Services accept `orgId`/`tenantId` and filter by it; Core class ensures tenant isolation
- Tenant isolation: All queries are scoped by `tenantId`/`orgId`
- Evidence: Unified evidence service uses `EvidenceObject` + `EvidenceLink` from Prisma; product adapters do dual-write sync
- Audit trail: Unified audit service records all mutations to `PlatformAuditEvent` with hash chain
- Review/approval: Evidence service supports `verifyEvidence`, `rejectEvidence` for review workflows
- Export control: Not directly addressed (handled at product layer)
- AI boundary: Not directly addressed

## Validation

| Command            | Result |
| ------------------ | ------ |
| `npx tsc --noEmit` | Pass (no new errors; all existing errors are in pre-existing test files) |

## Known Limitations

- Services use in-memory implementations by default in Core builder; Prisma implementations require proper DI
- Product evidence adapters still do dual-write to both product-specific tables and Core `EvidenceObject` — full migration to Core-only is future work
- No migration needed — uses existing `EvidenceObject`, `PlatformAuditEvent`, `WorkflowDefinition`, `WorkflowInstance`, `WorkflowTransitionLog` Prisma models
- Workflow unified service uses hardcoded `VALID_ACTIONS_BY_STATE` map instead of reading from `WorkflowDefinition.transitions`

## Next Recommended Step

Adopt the unified services in product code paths — replace direct `PrismaAuditLedger`/`PrismaEvidenceStore` calls with `core.unifiedAudit.log()`, `core.unifiedEvidence.storeEvidence()`, etc.
