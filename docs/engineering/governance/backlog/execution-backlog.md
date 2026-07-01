# Execution Backlog — Governance Engine Implementation

> **Ordered by dependency** | **Date:** 2026-06-30

---

## Priority 1: Foundation (Must Have)

| ID | Task | Complexity | Dependencies | Effort | Acceptance Criteria | Risk |
|----|------|-----------|--------------|--------|---------------------|------|
| ENG-001 | **ADR-001 Resolution** — Version vs Immutable IDs operational policy | Medium | None | 2h | Policy document approved, rules for when to version vs new-ID | Blocking for automation |
| ENG-002 | **Registry Loader** — Read all governance registries from Markdown into structured objects | High | ENG-001 | 4h | All 6 registries parsable, entity IDs validated against contracts | Fragile parsing |
| ENG-003 | **Entity Resolver** — Resolve cross-references between registries (CLM→EV, EV→SRC, etc.) | Medium | ENG-002 | 3h | All references resolved, broken refs reported | Circular deps |

## Priority 2: Validation Engine

| ID | Task | Complexity | Dependencies | Effort | Acceptance Criteria | Risk |
|----|------|-----------|--------------|--------|---------------------|------|
| ENG-004 | **Rule Engine Core** — Plugin architecture for GR-001 to GR-013 | Medium | ENG-003 | 3h | Rules execute in dependency order, results aggregated | Rule conflicts |
| ENG-005 | **GR-001 Implementation** — Immutable IDs Rule | Low | ENG-004 | 1h | Detects modified IDs, blocks merge | None |
| ENG-006 | **GR-002 Implementation** — Derived Artifacts Rule | Low | ENG-004 | 1h | Detects manual Manifest edits | None |
| ENG-007 | **GR-003 Implementation** — Evidence Manifest Rule | Low | ENG-004 | 1h | Detects MAT decisions without Manifest | None |
| ENG-008 | **GR-004 Implementation** — Glossary Precision Rule | Low | ENG-004 | 1h | Regex search for forbidden terms | False positives |
| ENG-009 | **GR-005 Implementation** — Three-tier Review | Low | ENG-004 | 1h | Detects same-agent violations | None |
| ENG-010 | **GR-006 Implementation** — Decision Preconditions | Medium | ENG-005–009 | 2h | Checks all 6 preconditions per MAT decision | Complex preconditions |
| ENG-011 | **GR-007 Implementation** — Evidence Independence | Medium | ENG-003 | 2h | Detects circular EV chains | Cycle detection |
| ENG-012 | **GR-008 Implementation** — Shared Evidence Canonicalization | Medium | ENG-003 | 2h | Detects duplicate capability EV | False positives with shared EV |
| ENG-013 | **GR-009 Implementation** — Capability Evidence | Medium | ENG-012 | 2h | Validates Engine product EV patterns | Engine detection |
| ENG-014 | **GR-010 Implementation** — Marginal Efficiency | Low | ENG-003 | 1h | Calculates MK-01, trend monitoring | Requires history |
| ENG-015 | **GR-011 Implementation** — Quality Preservation | Low | ENG-003 | 1h | Calculates KQI | Requires baseline |
| ENG-016 | **GR-012 Implementation** — Historical Consistency | Medium | ENG-016–017 | 2h | Validates HC-IDs, SupersededBy chains | Historical data quality |
| ENG-017 | **GR-013 Implementation** — Conflict Preservation | Medium | ENG-016 | 2h | Validates dimensional conflicts preserved | Conflict detection |

## Priority 3: Generators

| ID | Task | Complexity | Dependencies | Effort | Acceptance Criteria | Risk |
|----|------|-----------|--------------|--------|---------------------|------|
| ENG-018 | **Manifest Generator** | High | ENG-003 | 4h | Deterministic, reverse-validatable output | Large manifests |
| ENG-019 | **Dossier Generator** | High | ENG-018 | 4h | 12-section output, GR-002 compliance | Complex formatting |
| ENG-020 | **Coverage Generator** | Medium | ENG-003 | 3h | T1–T7 per product, KQI calculation | Metric accuracy |
| ENG-021 | **Freshness Generator** | Low | ENG-003 | 1h | Expiry tracking, categorized output | Date parsing |

## Priority 4: CLI + CI

| ID | Task | Complexity | Dependencies | Effort | Acceptance Criteria | Risk |
|----|------|-----------|--------------|--------|---------------------|------|
| ENG-022 | **CLI Framework** — aqliya-gov command structure | Medium | ENG-002–021 | 3h | All commands work, JSON/CI modes | CLI framework dependency |
| ENG-023 | **CI Integration** — GitHub Actions workflow | Low | ENG-022 | 2h | Pre-merge gate, PR annotations | CI configuration |
| ENG-024 | **Pre-commit Hook** | Low | ENG-022 | 1h | Block commits with violations | Developer friction |

## Priority 5: Reports + Audit

| ID | Task | Complexity | Dependencies | Effort | Acceptance Criteria | Risk |
|----|------|-----------|--------------|--------|---------------------|------|
| ENG-025 | **Governance Report Generator** | Medium | ENG-004 | 2h | Human-readable summary | None |
| ENG-026 | **Governance Audit Command** | Medium | ENG-025 | 3h | Full freeze + consistency + contradiction audit | None |
| ENG-027 | **Engineering Findings Collector** | Low | ENG-026 | 1h | Auto-detect implementation blockers | None |

## Summary

| Priority | Tasks | Total Effort |
|----------|-------|-------------|
| P1: Foundation | 3 | ~9h |
| P2: Validation | 14 | ~22h |
| P3: Generators | 4 | ~12h |
| P4: CLI + CI | 3 | ~6h |
| P5: Reports | 3 | ~6h |
| **Total** | **27** | **~55h** |
