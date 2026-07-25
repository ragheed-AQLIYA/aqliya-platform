# Audit Log Model Merge Migration Plan

**Status:** Schema & Service Ready (Phases 1-2 Complete)
**Created:** 2026-07-24
**Owner:** Platform Architect
**Target:** Merge 8 audit models into 1 (PlatformAuditLog)

---

## Executive Summary

AQLIYA has 8 audit log models. PlatformAuditLog already receives dual-writes from 6/8 models. This plan consolidates all into one unified audit trail.

| Metric | Current | Target |
|--------|---------|--------|
| Audit models | 8 | 1 |
| Audit tables | 8 | 1 |
| Audit enums (DB) | 2 | 0 (TS constants) |
| Total audit fields | 116 | 42 |
| Query layer | 4 separate | 1 (productKey filter) |
| Affected files | ~300 | ~300 (gradual) |

## Phases and Status

### Phase 1: Schema Extension [DONE]
- Migration: 20260724180519_add_platform_audit_log_merge_fields
- 10 new optional fields on PlatformAuditLog
- 2 new composite indexes

### Phase 2: Service Layer Update [DONE]
- PlatformAuditLogInput type extended
- writePlatformAuditLog() passes through new fields

### Phase 3: Unified Query Layer [PENDING]
- Update unified-query.ts to query only PlatformAuditLog
- Add productKey and organizationId filters

### Phase 4: Product-by-Product Read Migration [PENDING]
- SalesOS (~80-150 files)
- WorkflowOS (~45-90 files)
- AuditOS (~30-43 files)
- LocalContentOS (~25-43 files)
- DecisionOS (~5-9 files)

### Phase 5: Deprecate Product Models [PENDING]
- Mark product-specific models with @@deprecated
- Remove product-specific create calls
- Drop deprecated models from schema

## Field Mapping

| New Field | Source Model(s) |
|-----------|----------------|
| organizationId | SalesAuditEvent, WorkflowAuditEvent, LcAiAuditEvent |
| beforeState | AuditLog.before, LocalContentAuditEvent.before, WorkflowAuditEvent.fromStatus |
| afterState | AuditLog.after, LocalContentAuditEvent.after, WorkflowAuditEvent.toStatus |
| eventDescription | AuditEvent.description |
| aiRelated | AuditEvent.aiRelated |
| aiConfidence | LcAiAuditEvent.confidence |
| aiStatus | LcAiAuditEvent.status |
| inputSummary | LcAiAuditEvent.inputSummary |
| outputSummary | LcAiAuditEvent.outputSummary |
| durationMs | LcAiAuditEvent.durationMs |

## Migration Safety

- All new fields are nullable with defaults
- Product-specific models remain in place during migration
- Reads migrate one product at a time
- Dual-write pattern already proven for 6/8 models
- Hash chain already anchored on PlatformAuditLog
