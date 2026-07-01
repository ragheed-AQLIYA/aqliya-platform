# Core Evidence Platform — Phase 5B.1–5B.3

**Status:** Implemented  
**Baseline:** Phase 5B (CoreEvidence platform)  
**Date:** 2026-06-21  
**Target level:** L5 Institutional Evidence Platform

---

## Summary

Phase 5B.1–5B.3 completes institutionalization:

| Workstream | Deliverable | Status |
|------------|-------------|--------|
| **A — Backfill** | `scripts/platform/backfill-core-evidence.mjs` | Done |
| **B — Health & Ops** | `/api/platform/evidence/health` + monitoring panels | Done |
| **C — Workflow** | `workflow-bridge.ts` → lifecycle from workflow actions | Done |

---

## Workstream A — Evidence Backfill

### Script

```bash
npm run platform:backfill-evidence:dry    # dry run
npm run platform:backfill-evidence:apply  # execute
```

### Behavior

- Scans all `AuditEvidence` + `AuditEvidenceLink` + `LocalContentEvidence`
- Upserts `CoreEvidence` via `(productSlug, productEvidenceId)` unique key
- Mirrors entity links into `EvidenceLink` (idempotent)
- Creates initial `EvidenceLifecycle` row only on first create
- Preserves organization boundaries (`organizationId`, `platformOrganizationId`)
- Writes JSON report to `backups/evidence-reports/`

### Report format

```text
Backfill Report
- Total scanned
- Total created
- Total updated
- Total linked
- Errors
```

---

## Workstream B — Evidence Health & Operations

### API

`GET /api/platform/evidence/health` (ADMIN)

### Metrics

| Metric | Description |
|--------|-------------|
| `totalCoreEvidence` | Registry row count |
| `orphanedEvidence` | CoreEvidence without product row |
| `missingRelations` | Product links not mirrored in EvidenceLink |
| `failedAdapterSyncs` | Product evidence missing CoreEvidence |
| `lifecycleDistribution` | Count by lifecycle status |
| `backfillCoverage` | Audit / LC / overall % |

### Dashboard integration

- `/monitoring` — `EvidenceHealthPanel`
- `/operator` — `EvidenceHealthPanel`
- Component: `src/components/monitoring/evidence-health-panel.tsx`
- Service: `src/lib/core/evidence/health.ts`

---

## Workstream C — Workflow Integration

### Architecture

```text
Workflow Engine (evaluateTransition)
      ↓
Evidence Workflow Bridge
      ↓
Evidence Lifecycle (transitionEvidenceLifecycle)
```

### Action mapping

| Workflow action | Evidence lifecycle |
|-----------------|-------------------|
| `submit` | `reviewed` |
| `approve` | `approved` |
| `reject` | `rejected` |
| `archive` | `archived` |
| `return` | `created` |

### Product state inference

| AuditOS state | Workflow action |
|---------------|-----------------|
| `reviewed` | submit |
| `accepted` | approve |
| `rejected` | reject |

| LocalContentOS status | Workflow action |
|-----------------------|-----------------|
| `reviewed` | submit |
| `verified` | approve |
| `rejected` | reject |

### Integration points

- `audit-adapter.ts` — `syncAuditEvidenceStateToCore` uses workflow bridge
- `local-content-adapter.ts` — `syncLocalContentEvidenceStateToCore` uses workflow bridge
- Provenance: `{ source: "workflow_bridge", workflowAction }` on lifecycle events

Backward compatible: non-workflow states (uploaded, linked, missing) use existing product-state mapping.

---

## Migration Validation

| Check | Result |
|-------|--------|
| Schema unchanged (5B migration sufficient) | Pass |
| Backfill idempotent | Pass (unique constraint + link dedup) |
| Product tables unchanged | Pass |
| Adapter dual-write preserved | Pass |
| Decision Engine untouched | Pass |

---

## Evidence Platform Readiness Assessment

| Criterion | L4 (5B) | L5 (5B.1–3) |
|-----------|---------|-------------|
| Canonical registry | Yes | Yes |
| Lifecycle audit trail | Yes | Yes + workflow provenance |
| Historical coverage | Manual | **Backfill script** |
| Operational visibility | None | **Health API + dashboard** |
| Workflow governance | Product-local | **Workflow bridge** |
| Cross-product graph | Partial | Unchanged (Phase 5B) |

**Readiness:** L5 Institutional Evidence Platform (AuditOS + LocalContentOS scope)

**Conditions:**

1. Run `platform:backfill-evidence:apply` in each environment
2. Verify 100% backfill coverage via `/api/platform/evidence/health`
3. Remaining products (Contact, Workflow, Sales) — future adapters

---

## File Index

| Path | Purpose |
|------|---------|
| `scripts/platform/backfill-core-evidence.mjs` | Idempotent backfill |
| `src/lib/core/evidence/health.ts` | Health snapshot service |
| `src/lib/core/evidence/workflow-bridge.ts` | Workflow → lifecycle |
| `src/app/api/platform/evidence/health/route.ts` | Health API |
| `src/components/monitoring/evidence-health-panel.tsx` | Dashboard panel |
| `src/lib/core/evidence/__tests__/workflow-bridge.test.ts` | Workflow tests |
| `src/lib/core/evidence/__tests__/health.test.ts` | Health tests |

---

## Next Recommended Step

Run backfill in staging/production and confirm `backfillCoverage.overall.percent === 100` via health API.
