# SPEC-GOV-11: Graph Readiness Phase (ENG-001)

> **Engineering Specification** | **Analytical phase — assessment only**  
> **Status:** Pre-implementation | **Architecture Baseline:** M2 v1.2 (Frozen)  
> **Governance Baseline:** 13 Rules (GR-001 to GR-013), 19 Decisions (DEC-2026-0001→0019)  
> **Supersedes:** SPEC-GOV-08 (original graph readiness assessment, pre-engine)  
> **Version:** 2.0 | **Date:** 2026-06-30

---

## 1. Purpose

Determine whether the AQLIYA Knowledge Governance Platform requires a dedicated graph store by producing structured evidence — not by committing to any storage technology.

This phase is **analytical only**. It produces a structured JSON model, validates its relationships, computes graph statistics, measures both readiness and suitability, and produces a recommendation framework. The output is an **ADR Recommendation**: *should we adopt a graph store, or is the current Markdown + Engine architecture sufficient?*

The final decision remains with governance, not with the tool.

---

## 2. Scope (What ENG-001 Builds)

| Deliverable | Description |
|-------------|-------------|
| **2.1 Registry Extractor** | Read-only parser: Markdown registries → structured JSON |
| **2.2 Relationship Validator** | Verifies cardinality, integrity, traceability across JSON model |
| **2.3 Graph Statistics** | Computes nodes, edges, density, cycles, orphans, components |
| **2.4 Readiness Score** | Weighted score (0–100) measuring **data quality** — completeness, integrity, connectivity |
| **2.5 Suitability Score** | Weighted score (0–100) measuring **actual need for Graph DB** — traversal depth, query complexity, scale |
| **2.6 Decision Framework** | Combines Readiness + Suitability to produce a recommendation |

Each deliverable is a **CLI command or library function** within `src/lib/governance-engine/graph/`. No new runtime dependencies. No database connections.

---

## 3. Non-Scope (Hard Constraints)

These are **not** part of ENG-001:

| Constraint | Rationale |
|------------|-----------|
| ❌ Any graph database installation or configuration | Assessment only — no storage commitment |
| ❌ Any graph database integration | Decision comes after assessment |
| ❌ Modifying M2 entities, relationships, or IDs | M2 v1.2 is frozen — no changes without ADR |
| ❌ Writing to Markdown registries | Registry Extractor is read-only |
| ❌ Adding new entities or relationships | Zero schema change rule applies |
| ❌ UUID migration | Specified as future work if Graph DB is adopted |
| ❌ Performance benchmarking | Not meaningful without a target store |
| ❌ UI or dashboard | CLI output only |
| ❌ Real-time graph queries | Pre-decision, pre-infrastructure |
| ❌ Recommending a specific product or vendor | Decision Framework is technology-neutral |

---

## 4. Deliverable 1: Registry Extractor

### 4.1 Purpose

Convert frozen Markdown governance registries into a structured JSON representation that preserves all entity definitions, identifiers, relationships, and metadata — without modifying the source files.

### 4.2 Contract

```
Input:  docs/governance/evidence-catalog/{CLAIM_REGISTRY,product-registry,
        decision-registry,evidence-catalog,AUTHORITY_MATRIX}.md
Output: src/lib/governance-engine/graph/data/extracted-registries.json
Format: JSON object with entity collections keyed by type
Rule:   Read-only. Never writes to Markdown.
```

### 4.3 Important: JSON Is a Derived Representation, Not a New Source of Truth

```
Markdown (source of truth)
        ↓
JSON (derived representation)
```

The JSON output is a **read-only projection** of the Markdown registries. It is:

- **Not a Round-trip** — changes to JSON are never written back to Markdown
- **Not a new source of truth** — the Markdown registries remain the canonical authority
- **Regenerated on every run** — manual edits to JSON files are overwritten

This prevents any future drift where someone edits the JSON instead of the Markdown, which would break traceability between the governance data and its source.

### 4.4 Entity Collections

| Collection | Source | Entities | Key |
|------------|--------|----------|-----|
| `claims` | CLAIM_REGISTRY.md | All CLAIM-ID rows | CLM-ID |
| `products` | product-registry.md | All PROD-ID rows | PROD-ID |
| `decisions` | decision-registry.md | All DEC-ID entries | DEC-ID |
| `evidence` | evidence-catalog.md | All EV-ID entries | EV-ID |
| `authorities` | AUTHORITY_MATRIX.md | All AUTH-ID entries | AUTH-ID |

### 4.5 Field Mapping

Each entity collection preserves **all table columns** from its source Markdown, with these transformations:

- **Identifiers**: stored as strings, validated against ID pattern regex (e.g., `CLM-\d{4}-\d{4}`)
- **Relationships**: cross-references (e.g., `Auth`, `Evidence` columns) stored as **arrays of reference strings**, preserving the original text but also resolved where possible
- **Metrics lines**: extracted as metadata (not entity rows)
- **Booleans**: parsed from `✅`/`❌` or explicit `Yes`/`No`
- **L-Levels**: preserved as string, parsed for numeric comparison where possible
- **Timestamps**: preserved as ISO strings where parseable

### 4.6 JSON Schema (Minimal)

```jsonc
{
  "claims": [
    {
      "id": "CLM-2026-0001",
      "version": "1.0",
      "type": "capability",
      "origin": "product",
      "dimension": "implementation",
      "capRef": null,
      "claimText": "...",
      "ka": "KA-01",
      "product": "PROD-AUDITOS",
      "auth": "AUTH-MASTER-REF",
      "evidence": ["EV-0001", "EV-0002"],
      "confidence": "high",
      "completeness": "full"
    }
  ],
  "products": [ /* ... */ ],
  "decisions": [ /* ... */ ],
  "evidence": [ /* ... */ ],
  "authorities": [ /* ... */ ]
}
```

### 4.7 Error Handling

- Missing source files → error with clear path
- Unparseable row → warning + skipped row (logged)
- Missing required field → warning
- Invalid ID pattern → error
- Zero entities extracted → error (empty registry detection)

### 4.8 Location

- Source: `src/lib/governance-engine/graph/extractor.ts`
- Schema: `src/lib/governance-engine/graph/extractor-schema.ts`
- Index: `src/lib/governance-engine/graph/index.ts`
- Output: `src/lib/governance-engine/graph/data/extracted-registries.json`
- Tests: `src/lib/governance-engine/__tests__/graph/extractor.test.ts`

---

## 5. Deliverable 2: Relationship Validator

### 5.1 Purpose

Verify that all M2 relationships (C01–C21) and governance references are correctly represented in the extracted JSON model — without modifying the model itself.

### 5.2 Validation Checks

| Check | What It Validates |
|-------|-------------------|
| **Cardinality** | Each cross-reference count matches M2 cardinality (1:1, 1:N, N:M) |
| **Reference Integrity** | Every referenced ID (AUTH-ID, EV-ID, DEC-ID, PROD-ID, CLM-ID) exists in its collection |
| **Bidirectional Sync** | If A references B, B's inverse reference exists (where applicable) |
| **Chain Continuity** | CLAIM → Evidence → Source → Authority chains are complete (no dead ends) |
| **Decision Preconditions** | Every DEC-ID referenced as precondition exists with status Approved or Active |
| **No Dangling References** | No orphaned IDs referencing deleted/nonexistent entities |
| **Product Coverage** | Every PROD-ID has at least one CLAIM-ID reference (or documented exception) |

### 5.3 Output

```jsonc
{
  "valid": true/false,
  "checks": {
    "cardinality": { "pass": true, "failures": [] },
    "referenceIntegrity": { "pass": true, "failures": [] },
    "bidirectionalSync": { "pass": true, "failures": [] },
    "chainContinuity": { "pass": true, "failures": [] },
    "decisionPreconditions": { "pass": true, "failures": [] },
    "danglingReferences": { "pass": true, "failures": [] },
    "productCoverage": { "pass": true, "failures": [] }
  },
  "totalFailures": 0,
  "executionTimeMs": 12
}
```

### 5.4 Error Classification

- **Error**: Broken reference (ID points to nowhere) — blocks Readiness Score
- **Warning**: Cardinality mismatch but all references resolvable — reduces score
- **Info**: Optional field missing — logged, no score impact

### 5.5 Location

- `src/lib/governance-engine/graph/relationship-validator.ts`
- `src/lib/governance-engine/graph/types/validation-result.ts`
- `src/lib/governance-engine/__tests__/graph/relationship-validator.test.ts`

---

## 6. Deliverable 3: Graph Statistics

### 6.1 Purpose

Compute quantitative graph metrics from the extracted JSON model to inform the Readiness Score, Suitability Score, and Decision Framework.

### 6.2 Metrics

| Metric | Definition | Used By |
|--------|------------|---------|
| **Node Count** | Total entities across all 5 collections | Suitability (scale) |
| **Edge Count** | Total cross-references between entities | Readiness (connectivity) |
| **Graph Density** | `2\|E\| / (\|V\|(\|V\|-1))` | Readiness (connectivity) |
| **Avg Degree** | `2\|E\| / \|V\|` | Suitability (density) |
| **Connected Components** | Weakly connected subgraphs | Readiness (integrity) |
| **Cycles** | Closed directed paths | Readiness (cycle freedom) |
| **Orphan Nodes** | Entities with zero connections | Readiness (completeness) |
| **Longest Path** | Maximum chain depth | Suitability (traversal depth) |
| **Hub Nodes** | Top 5 nodes by degree centrality | Suitability (density) |
| **Broken Chains** | Chains with missing intermediate nodes | Readiness (traceability) |

### 6.3 Output

```jsonc
{
  "nodeCount": 198,
  "edgeCount": 423,
  "graphDensity": 0.021,
  "avgDegree": 4.27,
  "connectedComponents": 3,
  "cycles": 0,
  "orphanNodes": 2,
  "orphanDetails": ["CLM-2026-0045", "EV-0031"],
  "longestPath": 7,
  "hubNodes": [
    { "id": "PROD-AUDITOS", "degree": 24, "type": "product" },
    { "id": "AUTH-MASTER-REF", "degree": 19, "type": "authority" },
    { "id": "DEC-2026-0001", "degree": 15, "type": "decision" }
  ],
  "brokenChains": 0,
  "executionTimeMs": 8
}
```

### 6.4 Location

- `src/lib/governance-engine/graph/graph-stats.ts`
- `src/lib/governance-engine/graph/types/graph-stats.ts`
- `src/lib/governance-engine/__tests__/graph/graph-stats.test.ts`

---

## 7. Deliverable 4: Readiness Score

### 7.1 Purpose

Measure **data quality** — is our governance data well-structured, connected, and complete enough to consider a graph database?

This score answers: **"How ready is our data for a graph representation?"** — not "Do we need one?"

### 7.2 Dimensions and Weights

| Dimension | Weight | Measure | Source |
|-----------|--------|---------|--------|
| **Entity Completeness** | 20% | % of expected entities present in extracted JSON | Extractor |
| **Relationship Integrity** | 20% | % of validation checks passing | Validator |
| **Graph Connectivity** | 15% | Connected components count (lower = better), orphan count | Stats |
| **Traceability** | 15% | % of chains complete, broken chains count | Validator + Stats |
| **Cycle Freedom** | 10% | 100% if 0 cycles, penalized per cycle | Stats |
| **Identifier Stability** | 10% | % of entities with stable, frozen IDs | Extractor |
| **Automation Readiness** | 10% | % of registries that parse without errors | Extractor |

### 7.3 Scoring Formula

```
Readiness = Σ(weight_i × score_i) where:
  - score_i ∈ [0, 100]
  - weights sum to 100%
  - Any Error-level validator failure caps score at 50
```

### 7.4 Output

```jsonc
{
  "readiness": 97.3,
  "dimensions": {
    "entityCompleteness": { "score": 98, "weight": 20 },
    "relationshipIntegrity": { "score": 100, "weight": 20 },
    "graphConnectivity": { "score": 95, "weight": 15 },
    "traceability": { "score": 99, "weight": 15 },
    "cycleFreedom": { "score": 100, "weight": 10 },
    "identifierStability": { "score": 100, "weight": 10 },
    "automationReadiness": { "score": 85, "weight": 10 }
  },
  "capReason": null,
  "cappedByValidatorFailure": false,
  "executionTimeMs": 5
}
```

### 7.5 Classification

| Score Range | Classification | Meaning |
|-------------|---------------|---------|
| 95–100 | **Graph-Ready** | Data is structured, connected, validated. No quality barrier. |
| 80–94 | **Near-Ready** | Minor gaps exist. Addressable before any graph migration. |
| 60–79 | **Preparatory** | Significant gaps. Clean up structured data first. |
| < 60 | **Not Ready** | Foundation incomplete. Fix data quality before considering graph. |

### 7.6 Location

- `src/lib/governance-engine/graph/readiness-score.ts`
- `src/lib/governance-engine/graph/types/readiness-score.ts`
- `src/lib/governance-engine/__tests__/graph/readiness-score.test.ts`

---

## 8. Deliverable 5: Suitability Score

### 8.1 Purpose

Measure **actual need for a graph database** — does the governance model's query patterns, traversal depth, relationship density, and scale justify adopting dedicated graph technology?

This score answers: **"Do we need a graph database?"** — independently of whether our data is ready for one.

A high Readiness Score with a low Suitability Score means: *we could use a graph DB, but we don't need to.*

### 8.2 Dimensions and Weights

| Dimension | Weight | Measure | Source |
|-----------|--------|---------|--------|
| **Traversal Depth** | 25% | Average chain depth (longest path / total chains) | Stats |
| **Relationship Density** | 20% | Avg degree relative to max possible (normalized 0–100) | Stats |
| **Query Complexity** | 20% | % of governance queries that traverse 3+ hops | Decision Framework input |
| **Scale Outlook** | 20% | Projected node count growth (current × expected multiplier) | Extractor + Estimate |
| **Change Volatility** | 15% | Frequency of relationship/schema changes per quarter | Governance log |

### 8.3 Scoring Formula

```
Suitability = Σ(weight_i × score_i) where:
  - score_i ∈ [0, 100]
  - weights sum to 100%
  - If Readiness < 80: Suitability is informational only (data quality must improve first)
```

### 8.4 Output

```jsonc
{
  "suitability": 42.5,
  "dimensions": {
    "traversalDepth": { "score": 45, "weight": 25 },
    "relationshipDensity": { "score": 38, "weight": 20 },
    "queryComplexity": { "score": 30, "weight": 20 },
    "scaleOutlook": { "score": 60, "weight": 20 },
    "changeVolatility": { "score": 35, "weight": 15 }
  },
  "readinessGate": true,
  "informationalOnly": false,
  "executionTimeMs": 4
}
```

### 8.5 Classification

| Score Range | Classification | Meaning |
|-------------|---------------|---------|
| 80–100 | **Graph-Needy** | Query patterns, scale, and density justify dedicated graph storage. |
| 50–79 | **Graph-Beneficial** | Some benefit from graph traversal, but not strongly justified. |
| 20–49 | **Marginally Suitable** | PostgreSQL or Markdown + Engine likely sufficient. |
| < 20 | **Not Suitable** | No technical justification for graph storage. |

### 8.6 Combined Implications

| Readiness | Suitability | Implication |
|-----------|-------------|-------------|
| ≥ 90 | ≥ 80 | **Strong case for graph DB** — both data quality and need align. |
| ≥ 90 | 50–79 | **Could adopt, but not strongly justified** — consider relational approach. |
| ≥ 90 | < 50 | **Data is ready, but no need** — retain Markdown + Engine. |
| 80–89 | Any | **Near-ready on data** — improve quality before making storage decisions. |
| < 80 | Any | **Data quality not sufficient** — fix readiness gaps first. |
| < 80 | ≥ 80 | **Rare case** — need may exist but data cannot support it yet. Improve readiness first. |

### 8.7 Location

- `src/lib/governance-engine/graph/suitability-score.ts`
- `src/lib/governance-engine/graph/types/suitability-score.ts`
- `src/lib/governance-engine/__tests__/graph/suitability-score.test.ts`

---

## 9. Decision Framework

### 9.1 Purpose

Combine Readiness Score and Suitability Score into a **technology-neutral recommendation** — not a final decision.

### 9.2 Technology-Neutral Language

The Decision Framework **must not** reference specific products (Neo4j, Amazon Neptune, ArangoDB, PostgreSQL Graph Extension, etc.) in its decision logic. Specific technology recommendations belong in the ADR Recommendation (§13), not in the framework itself.

### 9.3 Decision Criteria

| Criterion | Weight | Source |
|-----------|--------|--------|
| **Readiness Score** | 30% | Must be ≥ 80 to proceed (data quality gate) |
| **Suitability Score** | 30% | Measures actual graph need |
| **Combined Score** | 20% | (Readiness × Suitability) / 100 — alignment |
| **Scale** | 10% | Node count > 500 suggests performance consideration |
| **Trend** | 10% | Is the graph growing? (more products, more relationships) |

### 9.4 Recommendation Outcomes

| Scenario | Recommendation |
|----------|----------------|
| Readiness ≥ 90 AND Suitability ≥ 80 | **Graph store recommended** — adopt a dedicated graph store with native traversal capabilities |
| Readiness ≥ 80 AND Suitability ≥ 50 | **Graph store considered** — evaluate query patterns and scale first; relational may suffice |
| Readiness ≥ 80 AND Suitability < 50 | **Relational sufficient** — retain current architecture or add JSON/array columns for lightweight graph patterns |
| Readiness < 80 | **Not ready** — address data quality gaps first, regardless of storage choice |
| Any Error-level validator failure | **Blocked** — fix data integrity issues before any storage decision |

### 9.5 What This Is Not

The Decision Framework output is a **recommendation**, not a decision:

```
Assessment → Recommendation → Governance Review → Decision
```

The recommendation goes to governance for review. Governance makes the final call.

### 9.6 Location

- `src/lib/governance-engine/graph/decision-framework.ts`
- `src/lib/governance-engine/graph/types/decision-framework.ts`
- `src/lib/governance-engine/__tests__/graph/decision-framework.test.ts`

---

## 10. CLI Commands

| Command | Description | Calls |
|---------|-------------|-------|
| `npx tsx src/lib/governance-engine/graph/cli extract` | Extract registries → JSON | Extractor |
| `npx tsx src/lib/governance-engine/graph/cli validate` | Validate extracted JSON | Relationship Validator |
| `npx tsx src/lib/governance-engine/graph/cli stats` | Compute graph statistics | Graph Stats |
| `npx tsx src/lib/governance-engine/graph/cli readiness` | Compute readiness score | Readiness Score |
| `npx tsx src/lib/governance-engine/graph/cli suitability` | Compute suitability score | Suitability Score |
| `npx tsx src/lib/governance-engine/graph/cli assess` | Run full pipeline → report | All + Decision Framework |

The `assess` command runs the full pipeline and produces a single structured JSON report containing all six deliverables' outputs, plus a summary recommendation.

---

## 11. Output Artifacts

| Artifact | Path | Format |
|----------|------|--------|
| Extracted Registries | `src/lib/governance-engine/graph/data/extracted-registries.json` | JSON |
| Validation Report | `src/lib/governance-engine/graph/data/validation-report.json` | JSON |
| Graph Statistics | `src/lib/governance-engine/graph/data/graph-stats.json` | JSON |
| Readiness Score | `src/lib/governance-engine/graph/data/readiness-score.json` | JSON |
| Suitability Score | `src/lib/governance-engine/graph/data/suitability-score.json` | JSON |
| Assessment Report | `src/lib/governance-engine/graph/data/assessment-report.json` | JSON |
| Summary Verdict | CLI stdout + `assessment-report.json` | Structured + Human-readable |

All artifacts are **derived** — never committed to Git unless explicitly approved. They are regenerated on every `assess` run.

---

## 12. Success Criteria

### 12.1 Functional Gates

ENG-001 is complete when:

1. `npx tsx src/lib/governance-engine/graph/cli extract` produces valid JSON for all 5 registries
2. `npx tsx src/lib/governance-engine/graph/cli validate` reports 0 errors on frozen registries
3. `npx tsx src/lib/governance-engine/graph/cli stats` computes all 10 metrics correctly
4. `npx tsx src/lib/governance-engine/graph/cli readiness` produces weighted score
5. `npx tsx src/lib/governance-engine/graph/cli suitability` produces weighted score
6. `npx tsx src/lib/governance-engine/graph/cli assess` produces full report
7. All tests pass: `npx vitest run src/lib/governance-engine/__tests__/graph/`
8. 0 TypeScript errors: `npx tsc --noEmit`
9. ADR Recommendation is drafted (Go / Consider / Postpone / Blocked)
10. No M2 entities, relationships, or identifiers were modified
11. No Markdown registry was written to
12. No graph database dependency was added to `package.json`

### 12.2 Non-Functional Gates

| Gate | Criterion | Measure |
|------|-----------|---------|
| **Determinism** | Same inputs → identical outputs on every run | CI double-run test |
| **Read-only** | No files outside `graph/data/` are created or modified | File system guard |
| **Execution time** | Full `assess` pipeline completes in under 30 seconds | Timer gate |
| **Memory** | Peak heap usage stays under 500 MB for all registries | Process monitoring |
| **No source mutation** | All 5 Markdown registries have unchanged checksums | Pre/post hash check |
| **No vendor lock-in** | No specific database product name appears in decision logic | Grep gate |

---

## 13. ADR Recommendation Template (Post-Assessment)

After ENG-001 completes, an Architecture Decision Record must be created at `docs/governance/adr-graph-database-recommendation.md` with:

```markdown
# ADR: Graph Database Recommendation

## Context
ENG-001 Graph Readiness assessment completed.
Readiness Score: XX/100 — {classification}
Suitability Score: XX/100 — {classification}

## Assessment Summary
{extracted from assessment-report.json}

## Recommendation
{Go / Consider / Postpone / Blocked}

### Rationale
{Why this recommendation over others}

### Supporting Data
- Node count: {N}
- Edge count: {E}
- Avg degree: {N}
- Longest chain: {N}
- Cycles: {N}
- Connected components: {N}

## Options Considered
A) Dedicated graph store — {rationale, technology examples, tradeoffs}
B) Graph-capable relational store — {rationale, technology examples, tradeoffs}
C) Retain Markdown + Engine — {rationale, tradeoffs}

## Next Step
{What governance must decide — the final decision is governance's, not ENG-001's}

## Consequences
{What adoption (or non-adoption) means for M2, Engine, tooling, CI}
```

---

## 14. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Governance Engine (SPEC-GOV-01→10) | ✅ Complete | Engine provides loading, types, and validation primitives |
| M2 v1.2 Freeze | ✅ Complete | No schema changes needed |
| ADR-001 (Version vs IDs) | ✅ Complete | Resolves identifier stability concerns |
| 13 Governance Rules | ✅ Complete | GR-001 to GR-013 provide verification layer |
| All 19 Decisions | ✅ Complete | DEC-2026-0001 to DEC-2026-0019 |
| 83 Evidence Items | ✅ Complete | EV-0001 to EV-0083 |

No new dependencies required. ENG-001 uses only standard Node.js (`fs`, `path`) and existing `governance-engine/` types.

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Markdown parsing is fragile | Medium | Medium | Add unit tests for each registry format; fail fast on structure changes |
| Zero entities extracted | Low | High | Empty-registry detection with clear error message |
| Extractor output drifts from source | Low | Medium | Version output; regenerate on each `assess` |
| Suitability Score is subjective | Medium | Medium | Define objective measures for each dimension; document edge cases |
| Decision Framework recommends Graph DB prematurely | Medium | Medium | ADR review gate; Score < 80 blocks recommendation |
| Performance on 500+ entities | Low | Low | Linear scans sufficient at current scale |

---

## 16. Engineering Estimate

| Component | Estimated Files | Estimated Lines | Tests |
|-----------|----------------|-----------------|-------|
| Registry Extractor | 3 | ~350 | 15 |
| Relationship Validator | 3 | ~300 | 20 |
| Graph Statistics | 3 | ~250 | 15 |
| Readiness Score | 3 | ~200 | 10 |
| Suitability Score | 3 | ~200 | 10 |
| Decision Framework | 3 | ~200 | 10 |
| CLI thin layer | 2 | ~100 | 5 |
| Test infrastructure | 2 | ~100 | — |
| **Total** | **22** | **~1700** | **85** |

---

## 17. Review Checklist

Before review, verify all of:

- [ ] No M2 entities, relationships, IDs changes
- [ ] No Markdown registry writes
- [ ] No graph database dependency in package.json
- [ ] Extractor is read-only
- [ ] JSON is a derived representation, not a round-trip source of truth
- [ ] Validation checks map to M2 C01–C21 cardinalities
- [ ] Graph statistics use standard graph theory definitions
- [ ] Readiness Score dimensions (§7) measure data quality only
- [ ] Suitability Score dimensions (§8) measure graph need independently
- [ ] Combined implications table covers all meaningful Readiness × Suitability combinations
- [ ] Decision Framework (§9) is technology-neutral — no vendor product names
- [ ] ADR Recommendation is a recommendation, not a decision
- [ ] Non-functional gates are defined and measurable
- [ ] All outputs are derived artifacts (excluded from Git)
- [ ] ADR Recommendation template included
- [ ] Tests cover: happy path, empty registries, broken references, cycles, orphans

---

## Appendix A — Decision Examples

These worked examples illustrate how Readiness × Suitability combinations translate into recommendations. They are **illustrative only** — actual recommendations depend on real extracted data.

| Scenario | Readiness | Suitability | Recommendation | Rationale |
|----------|-----------|-------------|----------------|-----------|
| **High quality, low need** | 98 | 28 | **Continue with relational model** | Data is well-structured but graph traversal is minimal. Avg degree likely < 3. No graph DB justification. |
| **High quality, moderate need** | 96 | 54 | **Reassess after growth** | Data is ready. Some graph-like patterns exist but not dominant. Re-evaluate when node count doubles or query complexity increases. |
| **High quality, strong need** | 97 | 91 | **Prepare ADR evaluating graph-capable storage** | Both quality and need align. Governance should evaluate dedicated graph store vs graph-capable relational store. |
| **Moderate quality, strong need** | 81 | 93 | **Investigate graph architecture before scaling** | Need is real but data quality lags. Improve readiness first — once Readiness ≥ 90, trigger full ADR process. |
| **Low quality, any need** | 65 | 82 | **Fix readiness gaps first** | Readiness < 80 gates all graph decisions. Improve data completeness and integrity before considering storage. |
| **Low quality, low need** | 55 | 22 | **No action** | Neither data quality nor business need justifies graph investment. Current Markdown + Engine is sufficient. |

### How to Read This Table

- **Readiness ≤ 80**: Always fix data quality first (regardless of Suitability)
- **Suitability ≤ 50**: Graph DB is unlikely to be justified (regardless of Readiness)
- **Both ≥ 90**: Strong alignment — governance should actively evaluate graph storage options
- **One high, one low**: The lower score determines the next step
