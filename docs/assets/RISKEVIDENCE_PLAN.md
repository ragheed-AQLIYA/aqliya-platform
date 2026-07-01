# RiskEvidence Model Plan (TD-014)

**Status:** Assessment Complete

## Current State

RiskOS (`/risk/*`) has no dedicated evidence model. It uses `AuditRiskProcedure.evidenceRequired` (a boolean/string field) instead of a proper evidence attachment system. This means:
- No file upload per risk assessment
- No evidence chain for risk findings
- No audit trail for evidence changes

## Options

### Option A: Add `RiskEvidence` model (recommended)

- New Prisma model: `RiskEvidence` with fields: id, assessmentId, filename, storageKey, fileType, fileSize, uploadedById, createdAt
- Links to `AuditRiskAssessment`
- Enables file upload, download, evidence chain

**Effort:** 1 day (schema + migration + actions + UI)

### Option B: Use existing `CoreEvidence`

- Link `AuditRiskAssessment` → `CoreEvidence` via `EvidenceLink`
- Reuses existing evidence infrastructure
- No new model needed

**Effort:** 0.5 day (link only)

## Recommendation

Option B — use `CoreEvidence`. RiskOS is AuditOS-adjacent and doesn't need a separate evidence model. Reuse CoreEvidence to maintain consistency.

**Decision:** Pending product team confirmation.
