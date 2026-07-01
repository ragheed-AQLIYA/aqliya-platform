# Institutional Memory — P0: Pattern Selection + P1: Registry

> **Part of:** Wave 3 — Knowledge Engine  
> **Date:** 2026-06-29  
> **Pattern:** Knowledge Engine (≠ Intelligence Core Engine)  
> **Governance Rule:** No new GR unless a real gap appears during execution

---

## 1. Pattern Selection (P0)

| Dimension | Institutional Memory | Intelligence Core (for comparison) |
|-----------|--------------------|-----------------------------------|
| **Type** | Knowledge Engine | Capability Engine |
| **Core Unit** | Knowledge Object (Event, Collection, Graph Node/Edge) | Capability (AI Orchestration, Provider Router, etc.) |
| **Evidence Pattern** | Knowledge Object → Canonical Knowledge Evidence → Evidence Graph → Claims | Capability → Canonical Capability Evidence → Claims |
| **GR-009 Applicability** | ✅ Partial — objects can have canonical evidence, but IM also generates relationships between knowledge | ✅ Full — each capability has one canonical EV |
| **GR-012 Applicability** | ✅ High — IM has historical contradictions (L0 in docs vs L5 in code) | ✅ Applied |
| **GR-013 Applicability** | ✅ High — dimensional conflict (Implementation Reality = L5, docs say L0) | Not needed (no dimensional conflict) |

**Key Difference:** IM doesn't just have capabilities — it *is* a capability for other products. Its evidence pattern must account for both its own implementation AND the knowledge graph it generates.

---

## 2. Product Identity

| Field | Value |
|-------|-------|
| PROD-ID | PROD-IM |
| Product Name | Institutional Memory (الذاكرة المؤسسية) |
| Entity Type | Engine |
| KA | KA-16 |
| Authority | AUTH-IM |
| Current L-Level | L0–L5 (Disputed — widest gap in platform) |
| Strategic Intent | Frozen (DEC-2026-0001) |

---

## 3. Historical Contradiction (GR-012 + GR-013)

| Source | Says | Dimension | Truth |
|--------|------|-----------|-------|
| Codebase | L5 (4 routes, 4 models, 3 tests, graph support) | Implementation Reality | ✅ Verified |
| Core Architecture v1.1 | "Not implemented" | Product Maturity (stale) | 🔴 Stale |
| Glossary v1.1 | "Strategic future. Not implemented." | Commercial Claim | 🚫 Commercial position |
| Vision v1.1 | "Do not claim" | Commercial Claim | 🚫 Commercial position |
| PRODUCT_STATUS_MATRIX | L5 | Product Maturity | ✅ Current |
| DEC-2026-0001 | Frozen | Strategic Intent | 🧊 Governance decision |

**Conclusion:** Same pattern as SalesOS — all conflicting facts may be simultaneously correct across different dimensions.

---

## 4. GR-009 Consumption

IM as an Engine consumes from Intelligence Core:

| Capability | Canonical EV | Consume? |
|-----------|-------------|----------|
| CAP-004 Governance Engine | EV-0041 | ✅ |
| CAP-006 Audit Layer | EV-0007 | ✅ |
| CAP-008 Identity/RBAC | EV-0043 | ✅ |
| CAP-010 Runtime Services | EV-0034 | ✅ |

**Consumed: 4 of 10 | Forecast reuse: ~40%**

---

## 5. Knowledge Metrics (Instead of Standard Reuse Metrics)

| Metric | Target | Why Different |
|--------|--------|---------------|
| Knowledge Traceability | 100% | Every knowledge object must be traceable to source |
| Knowledge Lineage | 100% | Origin of knowledge must be known |
| Version Integrity | 100% | Versions must be linked |
| Graph Integrity | No circular dependencies | Graph must be acyclic |
| Knowledge Reuse | Measurable | How many products consume IM objects |

---

## 6. Forecast Claims

| Category | Count | Evidence |
|----------|-------|----------|
| Consumer (GR-009) | 4 | Canonical IC EV |
| Native (IM-specific) | ~4 | Knowledge objects, graph, events, collections |
| Historical | ~3 | Contradictions (L0 vs L5 across 5 docs) |
| Derived | 1 | Aggregated |
| **Total** | **~12** | |

---

## References

- DEC-2026-0001: Freeze
- GR-012: Historical Consistency
- GR-013: Governance Conflict Preservation
- Intelligence Core: `intelligence-core-capability-registry.md`
