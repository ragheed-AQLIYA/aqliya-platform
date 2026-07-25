# ADR-110: Merge 8 Audit Log Models into Single PlatformAuditLog

**Status:** Accepted — Implemented 2026-07-24  
**Date:** 2026-07-25  
**Owner:** Platform Architecture / Data Architecture  
**Constitution principles:** 1 (Product Independence), 2 (Platform Neutrality), 13 (Business First)  
**Related:** ADR-100, ADR-102, ADR-103, ADR-106; dual-write bridge; platform audit service

---

## Context

AQLIYA accumulated 8 separate audit log models serving 7 products over multiple development phases:

| # | Model | Product(s) | Writes to PlatformAuditLog? |
|---|-------|-----------|-----------------------------|
| 1 | `PlatformAuditLog` | Cross-product (shared) | Self (primary) |
| 2 | `AuditLog` | DecisionOS | Yes (dual-write) |
| 3 | `AuditEvent` | AuditOS | Yes (dual-write) |
| 4 | `SunbulAuditEvent` | WorkflowOS / Sunbul | Yes (dual-write) |
| 5 | `LocalContentAuditEvent` | LocalContentOS | Yes (dual-write) |
| 6 | `SalesAuditEvent` | SalesOS | Yes (dual-write) |
| 7 | `WorkflowAuditEvent` | WorkflowOS | Yes (dual-write) |
| 8 | `LcAiAuditEvent` | LocalContentOS AI | No (standalone) |

All models shared core audit fields (`id`, `createdAt`, `actorId`, `action`, `metadata`) but diverged in product-specific fields and semantics. Six of eight models already dual-wrote into `PlatformAuditLog`, creating **redundant data** — every audit event existed twice (once in its product-specific table and once in `PlatformAuditLog`). Two product-specific enums (`AuditAction`, `SunbulAuditAction`) added further fragmentation.

The dual-write pattern was a transitional compromise. It prevented data loss during migration but also doubled write overhead, created consistency risks (partial dual-write failures), and forced queries to union across models or hard-code provider-specific column names.

---

## Problem

1. **Redundant storage**: Every product audit event stored twice — in the product-specific table and `PlatformAuditLog`. Estimated 50% storage waste for audit data.
2. **Query complexity**: Reading audit history required unions across 8 models with diverging column names (`eventType` vs `action` vs `type` vs `actionType`).
3. **Consistency risk**: Dual-write failures produced orphaned records where one table had the event but the other did not. Verification scripts (`verify-platform-audit-logs.ts`) existed *because* this was a known problem.
4. **Cross-product visibility**: No single query could surface audit events across all products without model-aware routing.
5. **Governance fragmentation**: Audit retention, archival, and hash chain logic were duplicated or inconsistently applied across models.
6. **Prisma schema bloat**: 7 redundant models + 2 enums added ~193 lines to `schema.prisma` with no business value beyond product-specific scaffolding.

---

## Options Considered

### Option A — Keep all 8 models; add tighter consistency enforcement

| Pros | Cons |
|------|------|
| Zero migration risk | Redundant storage persists indefinitely |
| Product models preserved as-is | Query complexity unresolved; cross-product audit impossible |
| | Dual-write orchestration overhead grows with each new product |

**Rejected.** The dual-write pattern was always transitional. Retaining it permanently violates Platform Neutrality (Principle 2) and wastes operational resources.

### Option B — Use PostgreSQL table inheritance (`INHERITS`)

| Pros | Cons |
|------|------|
| Single parent, typed children | Prisma 7 does not support table inheritance |
| Could preserve product-specific columns | Requires raw SQL queries — prohibited under ADR-102 |
| | Migration complexity high; ORM compatibility near-zero |

**Rejected.** Prisma is the sole ORM (ADR-102 §Dec.2). Using `INHERITS` would require bypassing Prisma for audit queries, creating a two-tier access pattern.

### Option C — Event sourcing with separate event store (e.g., dedicated `audit_events` database)

| Pros | Cons |
|------|------|
| Strongest decoupling | Massive architecture change — new DB, new write path, new query layer |
| Designed for audit at scale | Over-engineering for current scale and use cases |
| | No consumer for this complexity; violates "Business First" (Principle 13) |

**Rejected.** Event sourcing is a future consideration for heavy-write scenarios. At current scale, a single table with proper indexes handles all audit needs.

### Option D — Merge all models into a single PlatformAuditLog with extended fields (selected)

| Pros | Cons |
|------|------|
| Single source of truth for all audit data | Requires coordinated migration across 7 products |
| Eliminates dual-write — halve write overhead | 48 query sites + 12 write sites need migration |
| Cross-product audit queries trivial (`WHERE productKey = X`) | Test suite impact (~40 suites) |
| Preserves existing hash chain integrity | |
| Reduces schema by 193 lines | |
| productKey column already exists as filtering dimension | |

**Selected.** This is the natural endpoint of the dual-write transitional strategy. It matches the existing architecture direction (ADR-100 modular monolith, ADR-102 single Postgres) and simplifies governance.

---

## Decision

### 1. Single audit model

All 8 audit log models are merged into a single `PlatformAuditLog`. This table is the **only** audit write target and **only** audit read source for the platform.

### 2. Schema additions

Ten new optional fields are added to `PlatformAuditLog` to cover product-specific needs previously captured in the 7 deprecated models:

| Field | Type | Purpose | From |
|-------|------|---------|------|
| `organizationId` | `String?` | Tenant isolation at org level | All models |
| `beforeState` | `String?` | Pre-mutation state snapshot | `AuditEvent`, `SunbulAuditEvent` |
| `afterState` | `String?` | Post-mutation state snapshot | `AuditEvent`, `SunbulAuditEvent` |
| `eventDescription` | `String?` | Human-readable event description | `AuditLog`, `LcAiAuditEvent` |
| `aiRelated` | `Boolean` (default `false`) | Flags AI involvement in event | `LcAiAuditEvent`, `WorkflowAuditEvent` |
| `aiConfidence` | `Float?` | AI confidence score (0.0–1.0) | `LcAiAuditEvent` |
| `aiStatus` | `String?` | AI action status (`success`/`partial`/`failed`) | `LcAiAuditEvent` |
| `inputSummary` | `Json?` | AI input payload summary | `LcAiAuditEvent` |
| `outputSummary` | `Json?` | AI output payload summary | `LcAiAuditEvent` |
| `durationMs` | `Int?` | Operation duration for performance tracking | `WorkflowAuditEvent` |

### 3. New indexes

Two composite indexes are added for tenant-scoped audit queries:

- `[organizationId, createdAt]` — chronological event listing per organization
- `[organizationId, action, createdAt]` — action-type filtering per organization

These join the existing 10 indexes on `platformOrganizationId`, `productKey`, `actorId`, `action`, `targetType`, `sourceSystem`, and `createdAt`.

### 4. productKey as segmentation dimension

The existing `productKey` column is the sole product filter. All writes **must** set `productKey` to the correct product identifier. All reads **must** filter by `productKey` when product-scoped audit views are needed.

Standardized product keys:

| Product/Surface | `productKey` value |
|-----------------|-------------------|
| AuditOS | `audit_os` |
| DecisionOS | `decision_os` |
| SalesOS | `sales_os` or `salesos` (legacy) |
| WorkflowOS / Sunbul | `workflowos` or `sunbul` (legacy) |
| LocalContentOS | `local_content` |
| Office AI Assistant | `office_ai` |

### 5. No dual-write

All writes go **directly** to `PlatformAuditLog` via `writePlatformAuditLog()`. There is no secondary write to any product-specific table. The dual-write bridge is retired.

### 6. Hash chain preservation

The existing `HashChainEntry` relation on `PlatformAuditLog` is preserved without change. All audit events continue to be appended to the platform hash chain via `appendToAuditChain()`.

### 7. Deprecated models and enums

The following are permanently removed from the Prisma schema:

- **Tables:** `AuditLog`, `AuditEvent`, `SunbulAuditEvent`, `LocalContentAuditEvent`, `SalesAuditEvent`, `WorkflowAuditEvent`, `LcAiAuditEvent`
- **Enums:** `AuditAction`, `SunbulAuditAction`

---

## Phased Implementation

### Phase 1 — Schema extension
- **Migration:** `20260724180519_add_platform_audit_log_merge_fields`
- **Adds:** 10 columns + 2 indexes to `PlatformAuditLog`
- **Risk:** Zero — new nullable columns, no existing data affected

### Phase 2 — Service layer update
- **File:** `src/lib/core/contracts/event-envelope.ts`
- **Adds:** `PlatformAuditLogInput` interface extended with 10 new optional fields
- **File:** `src/lib/platform/audit-log.ts`
- **Adds:** `writePlatformAuditLog()` updated to accept and persist all 10 new fields
- **Adds:** Helper factory `createPlatformAuditLogInputFromContext()`

### Phase 3 — Unified query simplification
- **File:** `src/lib/platform/audit/unified-query.ts` (new)
- **Purpose:** Single query interface across all products using `productKey` filter
- **Pagination:** All queries return `{ items, totalCount, hasMore }` format (ADR-105 compliance)

### Phase 4 — Dual-write bridge update
- **Scope:** 5 call sites using dual-write → single-write
- **Files adapted:** `src/lib/platform/signals/audit-signal-producer.ts`, `src/lib/audit/archival/index.ts`, `src/lib/audit/reporting-graph/snapshot.ts`, `src/lib/audit/engagement-archival-service.ts`, `src/lib/audit/db/` modules
- **Pattern:** Removed dual-write to product-specific tables; retained single-write to `PlatformAuditLog`

### Phase 5 — Product read migration
- **Scope:** 48 read queries across 49 files
- **Products:** AuditOS, DecisionOS, SalesOS, LocalContentOS, WorkflowOS/Sunbul
- **Change:** All `AuditEvent.findMany()` / `AuditLog.findMany()` etc. → `PlatformAuditLog.findMany({ where: { productKey } })`
- **Dashboards:** All 5 product dashboards use unified audit data

### Phase 6 — Product write migration
- **Scope:** 12 write sites across 7 products
- **Change:** All `AuditEvent.create()`, `SalesAuditEvent.create()`, etc. → `writePlatformAuditLog()` with `productKey`
- **Inbound args adapted:** Product-specific input types mapped to `PlatformAuditLogInput`

### Phase 7 — Model removal
- **Migration:** `20260724232330_drop_deprecated_audit_models`
- **Drops:** 7 tables (`CASCADE`) + 2 enums (`CASCADE`)
- **Prisma:** Schema cleaned of deprecated models and enums

### Phase 8 — Test fixes
- **Scope:** ~40 test suites updated
- **Pattern:** Mocks changed from product-specific audit creates to `writePlatformAuditLog` mocks
- **Outcome:** 4,678+ tests passing, 0 TypeScript errors

---

## Consequences

### Positive

- **Schema reduction:** 8 tables → 1 (193 lines of Prisma removed)
- **Write overhead halved:** No dual-write — every audit event is stored once
- **Cross-product audit queries become trivial:** `WHERE productKey = X` replaces 8-way unions
- **Single source of truth:** No more verification scripts needed to reconcile dual-write consistency
- **Governance simplified:** Audit retention, archival, and hash chain logic apply uniformly
- **Zero TypeScript errors maintained throughout:** Each phase verified with `npx tsc --noEmit`
- **Hash chain integrity preserved:** No migration path touches `HashChainEntry` relation
- **Platform Neutrality reinforced:** Audit is a platform capability, not a product concern (ADR-100, ADR-101)

### Negative

- **Coordinated migration effort:** 8 phases across 7 products required ~40 test suite updates
- **Larger single table:** `PlatformAuditLog` now carries all audit fields; query performance depends on proper indexing (11 composite indexes mitigate this)
- **Backward incompatibility:** Code referencing deprecated models must be migrated (no gradual deprecation period)
- **productKey naming inconsistency:** Legacy keys (`salesos` vs `sales_os`, `sunbul` vs `workflowos`) remain for backward compatibility but should be normalized in a future cleanup

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Audit tables in schema | 1 | 1 |
| TypeScript errors | 0 | 0 |
| Test pass rate | ≥99% | 99.3% (maintained) |
| Dual-write call sites remaining | 0 | 0 |
| Cross-product audit queries possible | Yes | Yes (unified-query.ts) |
| Hash chain integrity | Preserved | Preserved |
| Schema lines reduced | ≥150 | 193 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Single table becomes performance bottleneck at scale | 11 composite indexes; future partitioning by `productKey` or `createdAt` if needed |
| productKey normalization drift | `unified-query.ts` accepts both legacy and canonical keys; separate cleanup ADR for normalization |
| Missed read queries referencing deprecated models | TypeScript `npx tsc --noEmit` catches all model references; CI gate enforces |
| Longer migration deploy window (two migrations) | Phases separated — schema extension in one deploy, model drop in next; no downtime for either (nullable adds, deferrable drops) |

---

## Related Components

- `prisma/migrations/20260724180519_add_platform_audit_log_merge_fields/`
- `prisma/migrations/20260724232330_drop_deprecated_audit_models/`
- `src/lib/platform/audit-log.ts` — `writePlatformAuditLog()`, `createPlatformAuditLogInputFromContext()`
- `src/lib/core/contracts/event-envelope.ts` — `PlatformAuditLogInput` interface
- `src/lib/platform/audit/unified-query.ts` — Unified audit query service
- `src/lib/platform/audit/integration.ts` — Hash chain integration
- `src/lib/platform/audit-bridge/` — Audit bridge adapters
- `src/lib/audit/archival/` — Archival service (migrated reads)
- `scripts/platform/verify-platform-audit-logs.ts` — Dual-write verification (to be deprecated)

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Migration: fields | `prisma/migrations/20260724180519_add_platform_audit_log_merge_fields/migration.sql` |
| Migration: drops | `prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql` |
| Schema (single model) | `prisma/schema.prisma` L282–347 (`model PlatformAuditLog`) |
| Write service | `src/lib/platform/audit-log.ts` |
| Input contract | `src/lib/core/contracts/event-envelope.ts` L8–55 |
| Unified query | `src/lib/platform/audit/unified-query.ts` |
| Hash chain integration | `src/lib/platform/audit/integration.ts` |
| AuditOS write site | `src/lib/audit/__tests__/audit-events.test.ts` — verifies single-write to `writePlatformAuditLog` |
| SalesOS write site | `src/lib/sales/__tests__/audit-events.test.ts` — verifies single-write |
| LocalContentOS write site | `src/lib/local-content/__tests__/audit-events.test.ts` — verifies single-write |
| Archived models (dropped) | AuditLog, AuditEvent, SunbulAuditEvent, LocalContentAuditEvent, SalesAuditEvent, WorkflowAuditEvent, LcAiAuditEvent |
| Archived enums (dropped) | AuditAction, SunbulAuditAction |

---

## References

- ADR-100 (Platform Boundaries) — modular monolith, Kernel-only shared deps
- ADR-102 (Database Strategy) — single Postgres, Prisma sole ORM, migrate deploy
- ADR-103 (Tenant Isolation) — `organizationId` on business models with composite indexes
- ADR-106 (Event Architecture) — bus + outbox for cross-product events; audit events as outbox payloads
- Dual-write bridge verification: `scripts/platform/verify-platform-audit-logs.ts`
