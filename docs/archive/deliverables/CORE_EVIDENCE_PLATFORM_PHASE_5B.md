# Core Evidence Platform — Phase 5B Deliverables

**Status:** Implemented (additive, backward compatible)  
**Baseline:** `main` @ `6f60784`  
**Date:** 2026-06-21  
**Scope:** Evidence platform capability — AuditOS + LocalContentOS integration  
**Out of scope:** Decision Engine, Workflow, AI, Knowledge redesign

---

## 1. Evidence Architecture Assessment

### Current state (pre-Phase 5B)

```
Products (AuditOS, LocalContentOS, DecisionOS, …)
     ↓ product-local Prisma tables
Evidence Service (read facade only)
     ↓ best-effort
Evidence Graph (IntelligenceGraphNode/Edge — audit + LC uploads only)
```

| Layer | Reality | Gap |
|-------|---------|-----|
| **Storage** | 9+ product-specific tables (`AuditEvidence`, `LocalContentEvidence`, …) | No canonical registry |
| **Registry** | `lookupEvidence()` read facade; `registerEvidence()` logged only | Writes not centralized |
| **Lifecycle** | Per-product states (`accepted`, `verified`, …) | No platform lifecycle |
| **Links** | `AuditEvidenceLink` (rich); LC uses direct FKs | No cross-product link model |
| **Graph** | `has_evidence` edges; silent failures | No lineage/provenance traversal |
| **Adapters** | None | Product silos |

### Target state (Phase 5B)

```
Products
     ↓ Evidence Adapters (audit-adapter, local-content-adapter)
Core Evidence Platform (CoreEvidence + EvidenceLink + EvidenceRelation + EvidenceLifecycle)
     ↓
Evidence Graph (IntelligenceGraphNode/Edge + lineage APIs)
```

### Product maturity matrix

| Product | Storage | Versioning | Entity links | Graph | Core sync |
|---------|---------|------------|--------------|-------|-----------|
| **AuditOS** | L5 | Yes (`AuditEvidenceVersion`) | Yes (`AuditEvidenceLink`) | Yes | **Phase 5B** |
| **LocalContentOS** | L4 | No | Partial (FK only) | Partial | **Phase 5B** |
| DecisionOS | L4 | No | N/A | No | Read facade only (untouched) |
| LocalContactOS | L4 | No | N/A | No | Future |
| WorkflowOS | L4 | No | N/A | No | Future |
| SalesOS | L4 | No | `SalesEvidenceLink` | No | Future |

### Key gaps closed in Phase 5B

1. **Canonical registry** — `CoreEvidence` table with `(productSlug, productEvidenceId)` unique key
2. **Platform lifecycle** — five states with transition audit trail
3. **Cross-product links** — `EvidenceLink` (entity) + `EvidenceRelation` (evidence-to-evidence)
4. **Graph expansion** — idempotent nodes, entity edges, lineage traversal
5. **Product adapters** — AuditOS + LocalContentOS sync on upload, state change, link

### Remaining gaps (future phases)

- Backfill migration script for existing evidence rows
- DecisionOS / Contact / Workflow / Sales adapters
- Unified evidence browser UI at `/intelligence`
- Deprecate duplicate `src/lib/platform/evidence/` shim
- Wire `SamplingEvidence` and Content Studio sources

---

## 2. Prisma Design Proposal

### Models (implemented)

Location: `prisma/schema.prisma` — after `IntelligenceGraphEdge`

#### CoreEvidence

Canonical platform registry mirroring product evidence. Product tables remain source of truth during migration.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | cuid | Platform evidence ID |
| `organizationId` | string | Tenant scope (matches graph org ID) |
| `platformOrganizationId` | string? | Platform org when resolvable |
| `productSlug` | string | `audit`, `local_content`, … |
| `productEvidenceId` | string | FK to product table row |
| `resourceType` | string | Parent entity type |
| `resourceId` | string | Parent entity ID |
| `filename`, `fileType`, `storageKey`, `fileHash` | | File metadata mirror |
| `evidenceType` | string? | Product-specific type |
| `lifecycleStatus` | string | Platform lifecycle (default `created`) |
| `sensitivity` | string | `standard` \| `restricted` \| `confidential` |
| `graphNodeId` | string? | Intelligence graph document node |
| `metadata` | Json? | Extensible product metadata |

**Unique:** `(productSlug, productEvidenceId)`

#### EvidenceLink

Platform-level polymorphic entity links (superset of `AuditEvidenceLink`).

| Field | Purpose |
|-------|---------|
| `coreEvidenceId` | Platform evidence |
| `targetType`, `targetId` | Linked entity |
| `linkType` | `supports`, `contradicts`, `references`, `evidence_for` |
| `productSlug` | Product owning the target |

#### EvidenceRelation

Cross-product evidence-to-evidence relationships.

| Field | Purpose |
|-------|---------|
| `sourceEvidenceId`, `targetEvidenceId` | CoreEvidence pair |
| `relationType` | `derives_from`, `supersedes`, `duplicates`, `related_to`, `lineage` |

#### EvidenceLifecycle

Immutable lifecycle transition audit trail with provenance.

| Field | Purpose |
|-------|---------|
| `fromStatus`, `toStatus` | Transition |
| `actorId`, `reason` | Human accountability |
| `provenance` | JSON — source action, product state sync |

### Backward compatibility rules

1. **No product table changes** — `AuditEvidence`, `LocalContentEvidence` unchanged
2. **Dual-write on mutation** — adapters sync to `CoreEvidence` best-effort
3. **Reads unchanged** — product UIs continue reading product tables
4. **Download auth unchanged** — `lookupEvidence()` still reads product tables
5. **Unique constraint** — prevents duplicate registry entries per product evidence

---

## 3. Migration Plan

### Phase A — Schema (done)

Migration: `prisma/migrations/20260621180000_core_evidence_platform/migration.sql`

```bash
npx prisma migrate deploy   # production
npx prisma db push          # local dev
npx prisma generate
```

### Phase B — Runtime dual-write (done)

| Trigger | Adapter | Action |
|---------|---------|--------|
| Audit evidence create/upload | `linkAuditEvidenceAfterUpload` | Register CoreEvidence + graph node |
| Audit state change | `syncAuditEvidenceStateToCore` | Lifecycle transition |
| Audit entity link | `syncAuditEvidenceLinkToCore` | EvidenceLink row |
| LC evidence create/upload | `linkLocalContentEvidenceAfterUpload` | Register + entity FK links |
| LC status update | `syncLocalContentEvidenceStateToCore` | Lifecycle transition |

### Phase C — Backfill (future, non-blocking)

Script: `scripts/platform/backfill-core-evidence.mjs` (recommended next step)

```
FOR EACH AuditEvidence → registerCoreEvidence (idempotent upsert)
FOR EACH LocalContentEvidence → syncLocalContentEvidenceToCore
FOR EACH AuditEvidenceLink → syncAuditEvidenceLinkToCore
```

Estimated scope: seed data ~21 rows; production depends on tenant volume.

### Phase D — Cutover (future)

1. Add `lookupEvidence()` fallback to CoreEvidence when product row missing
2. Intelligence workspace evidence browser reads `CoreEvidence`
3. Deprecate `src/lib/platform/evidence/` duplicate
4. Optional: product tables become views/extensions of CoreEvidence

### Rollback

- Migration is additive only — drop tables to rollback schema
- Remove adapter imports from audit/LC services to disable dual-write
- No data loss on product tables

---

## 4. Lifecycle Specification

### Platform states

| State | Meaning | Arabic label |
|-------|---------|--------------|
| `created` | Registered, file may or may not be present | مُنشأ |
| `reviewed` | Human review completed | مُراجع |
| `approved` | Accepted for use in outputs/decisions | مُعتمد |
| `rejected` | Not acceptable | مرفوض |
| `archived` | Retained but inactive | مؤرشف |

### Valid transitions

```
created  → reviewed | approved | rejected | archived
reviewed → approved | rejected | archived
approved → archived
rejected → created | archived
archived → (terminal)
```

Implementation: `src/lib/core/evidence/lifecycle.ts`

### Product state mapping

| AuditOS state | Platform |
|---------------|----------|
| missing, requested, uploaded, linked | created |
| reviewed | reviewed |
| accepted | approved |
| rejected | rejected |

| LocalContentOS status | Platform |
|-----------------------|----------|
| missing, uploaded, linked | created |
| reviewed | reviewed |
| verified | approved |
| rejected | rejected |

### Auditability

Every lifecycle transition creates:

1. `EvidenceLifecycle` row with `fromStatus`, `toStatus`, `actorId`, `provenance`
2. `PlatformAuditLog` entry (`evidence.lifecycle.transition`)
3. Product audit events unchanged (AuditEvent, LocalContentAuditEvent)

### Provenance JSON schema

```json
{
  "source": "audit_state_sync | registerCoreEvidence | local_content_status_sync",
  "productState": "accepted",
  "syncProductState": "accepted",
  "actionId": "optional-server-action-ref"
}
```

---

## 5. Integration Strategy

### Adapter pattern

```
src/lib/core/evidence/adapters/
├── audit-adapter.ts       → syncAuditEvidenceToCore, syncAuditEvidenceStateToCore, syncAuditEvidenceLinkToCore
└── local-content-adapter.ts → syncLocalContentEvidenceToCore, syncLocalContentEvidenceStateToCore
```

### AuditOS integration points

| File | Hook |
|------|------|
| `src/lib/core/evidence/link-after-upload.ts` | Upload → graph + CoreEvidence |
| `src/lib/audit/services.ts` | `updateEvidenceStateWithEvent`, `linkEvidenceToEntity` |

**Non-breaking:** All platform sync wrapped in try/catch — product flows never fail on platform errors.

### LocalContentOS integration points

| File | Hook |
|------|------|
| `src/lib/local-content/services.ts` | `createEvidenceEntry` → existing graph hook (now registers CoreEvidence) |
| `src/actions/localcontent-actions.ts` | `uploadLocalContentEvidenceFileAction`, `updateLocalContentEvidenceStatusAction` |

**Fix applied:** File upload action now calls `linkLocalContentEvidenceAfterUpload` (was bypassing platform hooks).

### Evidence Graph expansion

| API | Purpose |
|-----|---------|
| `linkEvidenceToGraph` | Idempotent document nodes (`evidence:{slug}:{id}`) |
| `linkEvidenceToEntityInGraph` | Entity → evidence edges |
| `linkEvidenceLineageInGraph` | Evidence → evidence provenance |
| `getEvidenceLineageFromGraph` | Traverse lineage (depth-limited) |

### Core service API

| Function | Purpose |
|----------|---------|
| `registerCoreEvidence` | Upsert registry mirror |
| `transitionEvidenceLifecycle` | Governed state change |
| `createPlatformEvidenceLink` | Entity link |
| `createEvidenceRelation` | Cross-evidence relation |
| `getRelatedEvidence` | Query relations |
| `listEvidenceForResource` | Resource-scoped listing |
| `getEvidenceLifecycleHistory` | Provenance trail |

### Decision Engine boundary

**No files under Decision Engine workstream modified.** `DecisionEvidence` continues to be consumed by read facade only.

---

## File Index

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | +4 models |
| `prisma/migrations/20260621180000_core_evidence_platform/` | Migration SQL |
| `src/lib/core/evidence/lifecycle.ts` | Lifecycle spec |
| `src/lib/core/evidence/core-evidence-service.ts` | Platform service |
| `src/lib/core/evidence/adapters/audit-adapter.ts` | AuditOS adapter |
| `src/lib/core/evidence/adapters/local-content-adapter.ts` | LC adapter |
| `src/lib/core/evidence/graph.ts` | Lineage + idempotent nodes |
| `src/lib/core/evidence/link-after-upload.ts` | Register on upload |
| `src/lib/core/evidence/evidence-service.ts` | `registerEvidence` persists |
| `src/lib/core/evidence/index.ts` | Public exports |
| `src/lib/audit/services.ts` | State + link sync hooks |
| `src/actions/localcontent-actions.ts` | Upload + status sync hooks |
| `src/lib/core/evidence/__tests__/*.test.ts` | Unit tests |

---

## Validation

Run after `npx prisma generate`:

```bash
npx tsc --noEmit
npm run lint
npm test -- src/lib/core/evidence
npm run build
```

---

## Next Recommended Step

1. Run backfill script for existing AuditOS + LocalContentOS evidence
2. Add `/intelligence/evidence` cross-product browser (read-only, L3)
3. Wire Contact + Workflow adapters using same pattern
