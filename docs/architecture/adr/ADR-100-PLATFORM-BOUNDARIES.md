# ADR-100: Platform Boundaries

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Lead Software Architect / Platform Architecture  
**Constitution principles:** 1 (Product Independence), 2 (Platform Neutrality), 13 (Business First)  
**Supersedes:** None  
**Related:** `AQLIYA_ARCHITECTURE_CONSTITUTION.md`, `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`, CEAP Architecture Stream

Trust principle: **AI assists. Humans decide. Evidence governs.**

---

## Context

AQLIYA is a Private Governed Institutional Intelligence Platform that hosts multiple operating systems (AuditOS, LocalContentOS, DecisionOS, SalesOS, WorkflowOS, Office AI, and others) on a shared Core/Kernel. Without explicit boundaries, products couple through deep imports, shared Prisma tables, and marketing language that collapses platform vs product.

The Architecture Constitution already asserts product independence and platform neutrality. This ADR makes those boundaries **operational and inspectable**.

---

## Problem

1. Product status and marketing language sometimes present all OS surfaces as equal “production products.”
2. Cross-product data access can occur via shared Prisma models and bridges even when lib-to-lib imports are clean.
3. ContentStudio, RiskOS, and Institutional Memory sit in ambiguous “product vs capability vs submodule” categories.
4. Agents and engineers lack a single decision that answers: “What may depend on what?”

---

## Options Considered

### Option A — Hard microservices per product (separate deployables)

| Pros | Cons |
|------|------|
| Strongest isolation | Massive rewrite; contradicts modular monolith reality |
| Independent scaling | Destroys shared governance cost advantage |

### Option B — Soft folders only (no enforced rules)

| Pros | Cons |
|------|------|
| Zero migration cost | Boundaries already erode (bridges, dual naming) |
| Flexible | Undermines Constitution and commercial packaging |

### Option C — Modular monolith with Kernel-only shared dependency + event bus for cross-product (selected)

| Pros | Cons |
|------|------|
| Matches current repo shape | Requires ongoing GOV-04 enforcement |
| Aligns with Constitution ADR-002/003 | Prisma mega-schema remains a soft leak |
| Supports independent licensing narrative | Plugin registration incomplete today |

---

## Decision

**AQLIYA is a modular monolith with strict logical product boundaries.**

1. **Platform** = Identity, tenant, RBAC/ABAC, audit ledger, evidence contracts, AI gateway, feature flags, cache, event bus, storage adapters, deployment — exposed only through `@/lib/kernel` (and documented Core contracts).
2. **Products** = AuditOS, LocalContentOS, DecisionOS, SalesOS, WorkflowOS (and future OS). Each owns its `src/lib/<product>/`, routes, actions, and domain models. Products **must not** import another product’s `src/lib/*`.
3. **Shared applications / capabilities** (not primary commercial products): Office AI Assistant, RiskOS (AuditOS-adjacent), Institutional Memory, Knowledge Foundation, ContentStudio (standalone operational content workspace).
4. **Cross-product communication** = Kernel Event Bus + approved bridges under `src/lib/*-intelligence/` or `src/lib/integration/adapters/` — never deep product imports.
5. **Commercial wedges** = AuditOS and LocalContentOS only for pilot SOWs (`WHAT_WE_DO_NOT_CLAIM.md`).

---

## Consequences

### Positive
- Clear ownership for PRs and CODEOWNERS-style rules.
- Aligns engineering with commercial exclusions.
- Enables future extraction without rewriting product logic.

### Negative / tradeoffs
- Prisma single schema remains a physical coupling until a later schema ADR.
- Existing bridges (`audit-engagement-bridge.ts`) are exceptions that must be catalogued.

---

## Migration Strategy

1. **Immediate (docs):** Align PRODUCT_STATUS_MATRIX Reality Notes and commercial language with this boundary map.
2. **Near-term:** Complete ProductPlugin registration for DecisionOS, WorkflowOS, Office AI (see ADR-104).
3. **Ongoing:** Enforce `GOV-04` (no cross-domain deep imports) via engineering architecture-drift agent + CI.
4. **Later:** Schema partitioning (ADR-102 follow-on) for physical isolation of product domains.

No runtime code change required to accept this ADR.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Product→product `@/lib/*` imports | **0** (production code) |
| Marketed pilot products | ≤2 (AuditOS, LocalContentOS) |
| Cross-product bridges | Documented inventory; each has ADR exception or kernel event |
| GOV-04 compliance score | Maintain **100%** |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Teams bypass Kernel with Prisma joins | Catalog bridges; prefer events; future schema split |
| Marketing re-expands product surface | Commercial review against this ADR |
| ContentStudio/LC confusion | Taxonomy + Matrix single classification |

---

## Related Components

- `src/lib/kernel/`
- `src/lib/audit/`, `src/lib/local-content/`, `src/lib/sales/`, `src/lib/decision/`, `src/lib/workflowos/`, `src/lib/office-ai/`
- `src/products/*-os/`
- `engineering/gates/ACTIVE_GOVERNANCE_RULES.md` (GOV-04)
- `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Constitution principles 1–2 | `docs/architecture/AQLIYA_ARCHITECTURE_CONSTITUTION.md` |
| Kernel bootstrap + 3 plugins | `src/lib/kernel/bootstrap.ts` |
| Product isolation (no sales↔audit↔lcos lib imports) | CEAP Stream 2 grep (2026-07-19) |
| Cross-product bridge | `src/lib/local-content-intelligence/audit-engagement-bridge.ts` |
| Commercial wedges | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| Taxonomy | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` |
