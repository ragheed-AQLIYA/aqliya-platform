# ADR-104: Plugin Architecture

**Status:** Accepted — Codified; migration incomplete  
**Date:** 2026-07-19  
**Owner:** Platform Architecture  
**Constitution principles:** 1 (Product Independence), 9–11 (Capability Registry / Versioning / Lifecycle)  
**Related:** ADR-100, ADR-101, Sprint 9 Product Independence Verification

---

## Context

Kernel defines `ProductPlugin` and `ProductRegistry`. Bootstrap currently registers three plugins: AuditOS, LocalContentOS, SalesOS. Docs claim broader product independence and event-bus awareness for more products. Plugin `getSchemas()` metadata on AuditOS does not fully match Prisma model names.

---

## Problem

1. DecisionOS, WorkflowOS, Office AI (and others) are real products/apps but not Kernel plugins — asymmetric architecture.
2. Without plugins, capability discovery, init hooks, and dependency injection are inconsistent.
3. Schema name drift in `getSchemas()` misleads tooling and docs.
4. Risk of “plugin theater” if plugins do not declare real capabilities.

---

## Options Considered

### Option A — No plugins; folder convention only

| Pros | Cons |
|------|------|
| Simpler | Abandons Sprint 9 investment; weaker independence story |

### Option B — Plugin per product including shared apps (selected)

| Pros | Cons |
|------|------|
| Uniform init + capability declaration | Requires registration work for missing OS |
| Matches Constitution registry intent | Must keep plugins thin |

### Option C — Dynamic runtime plugin loading from packages

| Pros | Cons |
|------|------|
| True deployable plugins | Not supported by current monolith packaging |

---

## Decision

1. **Every first-class product and shared application** that owns routes + domain data **must** implement `ProductPlugin` and register in `initializeKernel()`.
2. **Minimum plugin set (mandatory):**
   - AuditOSPlugin (exists)
   - LocalContentOSPlugin (exists)
   - SalesOSPlugin (exists)
   - DecisionOSPlugin (**to register**)
   - WorkflowOSPlugin (**to register**)
   - OfficeAIPlugin (**to register**)
3. **Optional / adjacent plugins** (when marketed or operator-facing): RiskOS, LocalContactOS, ContentStudio, InstitutionalMemory — only if they need Kernel lifecycle hooks; otherwise remain Kernel consumers without plugin.
4. Plugins declare: `id`, required capabilities, `initialize`, optional `getSchemas()` **using real Prisma model names only**.
5. Plugins **must not** import other products’ libs (ADR-100). Cross-talk via Event Bus.
6. Plugin registration is **static** in bootstrap (no dynamic remote code loading).

---

## Consequences

### Positive
- Uniform product lifecycle on Kernel boot.
- Clearer independence verification.
- Aligns docs with code structure.

### Negative
- Registration work and tests for three missing plugins.
- Adjacent products need explicit include/exclude decisions.

---

## Migration Strategy

1. Implement DecisionOS / WorkflowOS / Office AI plugins mirroring existing three (thin wrappers).
2. Fix AuditOS `getSchemas()` names to match Prisma.
3. Add Kernel test: expected plugin IDs present after `initializeKernel()`.
4. Update PRODUCT_STATUS_MATRIX Reality Notes when registration complete.
5. No change to product business logic required for thin plugins.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Registered plugins for mandatory set | 6/6 |
| `getSchemas()` names ⊆ Prisma models | 100% |
| Cross-product imports via plugins | 0 |
| Kernel plugin tests | Green |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Thick plugins reintroduce coupling | Keep plugins as wiring only |
| Schema drift returns | CI check optional later |
| Over-registering shells | Follow ADR-100 commercial map |

---

## Related Components

- `src/lib/kernel/plugin/product-plugin.ts`, `product-registry.ts`
- `src/lib/kernel/bootstrap.ts`
- `src/products/audit-os/`, `local-content-os/`, `sales-os/`
- `src/lib/kernel/__tests__/kernel.test.ts`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Interface | `src/lib/kernel/plugin/product-plugin.ts` |
| Registration of 3 | `src/lib/kernel/bootstrap.ts` |
| Sprint 9 claims | `AGENTS.md` / PRODUCT_STATUS_MATRIX Product Independence |
| CEAP gap | Stream 2 — incomplete plugin surface |
