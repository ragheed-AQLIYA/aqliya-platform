# SPEC-GOV-08: Graph Readiness Assessment

> **Engineering Specification** | **Pre-implementation assessment**

---

## 1. Current Readiness

| Criterion | Status | Details |
|-----------|--------|---------|
| Entity definitions | ✅ Complete | 12 entities defined with ID patterns |
| Relationships mapped | ✅ Complete | 21 cardinalities (C01–C21) |
| Identifiers stable | ✅ Frozen | All ID patterns frozen in M2 v1.2 |
| Cross-references exist | ✅ Present | CLM ↔ EV ↔ SRC ↔ AUTH ↔ DEC |
| No circular dependencies | ✅ Verified | GR-007 ensures acyclic chains |
| Version tracking | ⚠️ Partial | SemVer on core entities, not yet machine-enforced |
| Hash tracking | ⚠️ Partial | CLAIM-HASH recommended, not required |
| Lineage metadata | ⚠️ Partial | Freshness tracked, but full lineage not automated |
| Machine-readable format | ❌ Markdown | All registries are Markdown tables, not structured data |
| Dedicated graph store | ❌ None | No Neo4j, PostgreSQL Graph, or similar |

## 2. Missing Contracts for Graph

| Contract | Required For | Current State | Gap |
|----------|-------------|---------------|-----|
| Unique internal UUID | Stable node identity | CLM/EV IDs are stable but not UUID | Gap |
| Explicit edge definitions | Relationship traversal | C01–C21 defined in docs, not in schema | Gap |
| Node labels | Entity type filtering | Entity type in Product Registry, not in data | Gap |
| Property schema | Node/edge attributes | Defined in specs, not enforced | Gap |
| Index definitions | Query performance | Not defined | Gap |
| Migration strategy | Schema evolution | ADR process exists, no migration plan | Gap |

## 3. Readiness Score

| Dimension | Score (0–10) | Notes |
|-----------|-------------|-------|
| Entity model readiness | 9/10 | Well-defined, stable, frozen |
| Relationship model readiness | 8/10 | 21 cardinalities defined, machine-verifiable |
| Identifier stability | 10/10 | Frozen, immutable |
| Data format readiness | 4/10 | Markdown tables need structured extraction |
| UUID readiness | 2/10 | No internal UUIDs assigned |
| Edge readiness | 5/10 | Relationships documented but not stored |
| Query readiness | 1/10 | No query layer |
| Migration readiness | 3/10 | ADR exists, no migration tooling |
| Automation readiness | 4/10 | Manual population, no automated sync |
| **Overall** | **5.1/10** | **Conceptually ready, technically pre-migration** |

## 4. Recommendations

| Priority | Action | When |
|----------|--------|------|
| 1 | Resolve ADR-001 (Version vs Immutable IDs) | Before any graph implementation |
| 2 | Add internal UUID fields to entity definitions | Before graph migration |
| 3 | Convert CLAIM_REGISTRY.md to structured format (YAML/JSON) | Before graph migration |
| 4 | Define edge properties for C01–C21 | Before graph migration |
| 5 | Choose graph technology (Neo4j vs PostgreSQL vs custom) | After structured data exists |

## 5. Conclusion

Graph readiness is **pre-migration**. The conceptual model is excellent (9/10 for entity/relationship design), but the implementation is in Markdown rather than a structured store. Recommended order: ADR-001 → structured data → UUIDs → graph migration.
