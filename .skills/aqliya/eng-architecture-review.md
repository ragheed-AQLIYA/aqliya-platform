---
name: eng-architecture-review
description: Architecture compliance review — layer violations, cyclic dependencies, product boundary integrity, Core reuse, DDD alignment
version: 1.0
date: 2026-07-13
status: active
owner: Layer 2 — Repository Intelligence + Layer 3 — Code Quality
inputs: Module or product to review, dependency graph
outputs: Architecture compliance report with violation severity and fix recommendations
dependencies: engineering/os/knowledge-graph.mjs, engineering/os/COMPLIANCE.md, engineering/agents/architecture-drift.mjs
---

# Engineering Architecture Review

> **Purpose:** Validate that code respects AQLIYA's architecture: Platform Core, Product Boundaries, Clean Architecture layers, DDD domains.

---

## Review Checklist

### 1. Layer Discipline (Critical)

```
□ Is this code in the correct layer?
  - src/lib/core/ — Shared platform engines
  - src/lib/<product>/ — Product-specific logic
  - src/components/<product>/ — UI components
  - src/actions/ — Server Actions (boundary)
  - src/app/<product>/ — Routes/pages

□ Does it respect layer dependencies?
  - Core → NEVER imports from products
  - Product → MAY import from Core
  - Components → NEVER import from lib directly (use actions)
  - Actions → NEVER import from app/
```

**Architecture reference:** `docs/official/aqliya-core-architecture-v1.1.md`, `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`

---

### 2. Product Boundary Integrity (Critical)

```
□ Does this code belong to the named product/system?
□ Does it cross product boundaries without going through Core?
□ Does it import from another product's lib/ directory?
  Example violation: src/lib/audit/ importing from src/lib/decision/
□ Does it use shared Core engines or duplicate them?
```

**Enforce:** `engineering/os/COMPLIANCE.md` → NO_CROSS_DOMAIN_DEEP_IMPORTS

---

### 3. Cyclic Dependencies (High)

```
□ Check dependency graph for cycles (A → B → A)
□ Check indirect cycles (A → B → C → A)
□ Does a product have a self-referencing import within its own tree? (allowed)
```

**Tool:** `engineering/os/knowledge-graph.mjs` — run `npm run eng:os -- --impact <module>`

---

### 4. Platform Core Reuse (High)

```
□ Is this functionality already in src/lib/core/?
□ Is this functionality already in src/lib/platform/?
□ Should this be extracted to Core for other products to use?
□ Is a product implementing its own governance/audit/RBAC instead of using Core?
```

**Anti-pattern:** Product reimplements `enforce()`, audit logging, or evidence graph instead of using Core.

---

### 5. DDD Alignment (Medium)

```
□ Does the module align with a bounded context?
□ Are domain entities clearly named?
□ Are value objects used where appropriate?
□ Are aggregates consistent?
□ Are domain events used for cross-boundary communication?
```

**Taxonomy reference:** `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`

---

### 6. Route-Domain Mapping (Medium)

```
□ Does the route match the product taxonomy?
□ Is the route listed in ROUTE_STRATEGY.md?
□ Is the route type correct? (workspace, demo, marketing, admin)
□ Does the route have appropriate auth protection?
```

**Route reference:** `docs/source-of-truth/ROUTE_STRATEGY.md`

---

### 7. Shared Kernel Protection (High)

The AQLIYA Platform Core is the shared kernel. Violations:

```
□ Product modifies Core for its own needs (not general platform need)
□ Product adds product-specific types to Core
□ Product creates Core-like module in its own namespace
```

**Rule:** If 2+ products need it, it belongs in Core. If only 1 product needs it, it stays in the product namespace.

---

## Output Format

```md
## Architecture Review: <product_or_module>

### Layer Discipline
| Violation | Severity | Location | Fix |
|-----------|----------|----------|-----|

### Product Boundary Integrity
| Violation | Severity | Location | Fix |
|-----------|----------|----------|-----|

### Dependency Graph
| Cycle | Severity | Path | Fix |
|-------|----------|------|-----|

### Core Reuse Opportunities
| Current | Should Use | Benefit |
|---------|------------|---------|

### Compliance Score: X%

### Recommendations
1. Critical fixes (must do)
2. High-priority improvements
3. Medium-priority refactors
```

---

## Integration

Load when:
- New product module is created
- Cross-product import is detected
- Architecture drift is flagged by `engineering/agents/architecture-drift.mjs`
- Before merging significant refactors
