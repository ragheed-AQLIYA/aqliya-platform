# ADR-101: Kernel Design

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Platform Architecture  
**Constitution principles:** 2 (Platform Neutrality), 3 (Consumer-Driven Extraction), 8 (Contracts Before Implementation), 9–12 (Capability Registry / Versioning / Lifecycle / Stable Core)  
**Related:** ADR-100 (Platform Boundaries), `PLATFORM_KERNEL_ARCHITECTURE.md`, Sprint 7 Kernel 2.0 migration

---

## Context

Platform Kernel 2.0 migrated ~691 consumers to `@/lib/kernel` as the single import surface (auth, authorization, cache, feature-flags, audit, knowledge, governance, workflowos, prisma bridges). The Kernel provides contracts, implementations, plugins, events, and a thin CQRS projection layer.

---

## Problem

Without a frozen Kernel design:

1. Product teams re-import `@/lib/platform/*` or `@/lib/core/*` deeply, defeating migration.
2. Fat bridges (especially AuditOS re-exports) violate Platform Neutrality in spirit.
3. Incomplete ProductPlugin registration leaves DecisionOS / WorkflowOS / Office AI outside the formal plugin mesh.
4. CQRS exists only as read projections for three domains — unclear whether to expand or constrain.

---

## Options Considered

### Option A — Dissolve Kernel; products import platform modules directly

| Pros | Cons |
|------|------|
| Less indirection | Undoes Sprint 7; coupling explosion |

### Option B — Full hexagonal Kernel with zero product-named bridges

| Pros | Cons |
|------|------|
| Ideal neutrality | Large rewrite of `kernel/audit.ts` and index re-exports |

### Option C — Kernel facade + contracts + plugins; slim bridges over time (selected)

| Pros | Cons |
|------|------|
| Matches shipped Kernel 2.0 | Temporary product-named bridges allowed |
| Consumer-driven extraction preserved | Requires debt backlog for neutrality |

---

## Decision

1. **`@/lib/kernel` is the sole permitted import surface** for platform capabilities from product/application code.
2. Kernel structure:
   - `contracts/` — ports (identity, tenant, workflow, policy, evidence, AI, event-bus, audit-ledger, cache, …)
   - `implementations/` — adapters wrapping Core/Platform services
   - `plugin/` — `ProductPlugin` + `ProductRegistry`
   - `cqrs/` — read-side `Projection` / `ProjectionManager` (command bus **not** required in v1)
   - `events/` + `publish.ts` — typed domain events
   - Bridge modules — stable re-exports; new deep AuditOS APIs go behind contracts, not unbounded re-exports
3. **Bootstrap** (`initializeKernel`) registers service contracts then ProductPlugins.
4. **Platform Neutrality rule:** Kernel domain model must not grow new product entity types; temporary bridge re-exports are technical debt tracked under Architecture Governance TD/AD items.
5. **CQRS scope:** Keep read projections for dashboard/scoring use cases; do not introduce a full command-bus until a consumer ADR demands it (Constitution: Consumer-Driven Extraction).

---

## Consequences

### Positive
- Stable refactor surface for Core internals.
- Clear DI/bootstrap lifecycle.
- Aligns with Constitution capability registry intent.

### Negative
- Bridge bloat risk if unchecked.
- Incomplete plugin set remains a gap until ADR-104 migration completes.

---

## Migration Strategy

1. Lint/eng rule: forbid new `@/lib/platform` / `@/lib/core` imports outside Kernel implementations (progressive).
2. Register missing ProductPlugins (ADR-104).
3. Split AuditOS kernel bridge into capability-sized contracts (P2 backlog).
4. No big-bang rewrite of Kernel.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Direct `@/lib/platform` imports from `src/app` / `src/actions` / product libs | Decreasing; new PRs = 0 |
| ProductPlugins registered | All marketed OS ≥ Decision, Workflow, Office AI |
| Kernel tests | Pass (`src/lib/kernel/__tests__`) |
| Consumer churn on Core moves | Near-zero if via Kernel |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Facade hides poor Core APIs | Contracts + versioning |
| Plugin metadata ≠ Prisma schemas | Fix `getSchemas()` in plugins |
| CQRS half-pattern confuses teams | Document “read projections only” |

---

## Related Components

- `src/lib/kernel/bootstrap.ts`, `index.ts`, `contracts/`, `implementations/`, `plugin/`, `cqrs/`
- `src/lib/core/`
- `docs/architecture/PLATFORM_KERNEL_ARCHITECTURE.md`
- `engineering/knowledge/ADR_REGISTRY.md` (Platform Intelligence Core)

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Kernel bridges | `src/lib/kernel/{auth,authorization,cache,audit,prisma,...}.ts` |
| Plugin registration (3) | `src/lib/kernel/bootstrap.ts` L161–167 |
| Event bus impl | `src/lib/kernel/implementations/event-bus.ts` |
| CQRS projections | `src/lib/domains/{audit,local-content,sales}/queries/` |
| Migration claim | `PRODUCT_STATUS_MATRIX.md` Phase 28 / Reality Notes Kernel 2.0 |
