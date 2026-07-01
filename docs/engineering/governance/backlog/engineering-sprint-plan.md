# Engineering Sprint Plan

> **8 Sprints** | **~76 files** | **~55h estimated** | **Architecture Baseline:** M2 v1.2 (Frozen)

---

## Sprint 1: Foundation — Registry Layer

**Goal:** All governance registries parseable into typed objects

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S1.1 | Define 12 entity interfaces | types/entities.ts | 1h | None | Interfaces match CLAIM_REGISTRY.md §1b |
| S1.2 | Define C01–C21 relationship types | types/relationships.ts | 0.5h | S1.1 | All 21 relationships typed |
| S1.3 | Define GR result types | types/rules.ts | 0.5h | S1.1 | GR-001 to GR-013 result types |
| S1.4 | Define registry interfaces | types/registries.ts | 0.5h | S1.1 | Registry load/query methods |
| S1.5 | Define ID regex validators | types/identifiers.ts | 0.5h | None | All 9 ID patterns validated |
| S1.6 | Define error types | types/errors.ts | 0.5h | None | ValidationError, EngineError |
| S1.7 | Zod schemas for all entities | schemas/*.ts | 2h | S1.1–S1.6 | Schemas reject invalid entities |
| S1.8 | Markdown table parser | shared/parser.ts | 1.5h | None | Tables parseable into arrays |
| S1.9 | SHA256 utility | shared/hash.ts | 0.5h | None | Deterministic hashing |
| S1.10 | Date/freshness utilities | shared/date.ts | 0.5h | None | Date parsing, expiry calc |
| S1.11 | ID pattern matchers | shared/regex.ts | 0.5h | S1.5 | Regex tests pass |
| S1.12 | Result type (Ok/Err) | shared/result.ts | 0.5h | None | Type-safe error handling |
| S1.13 | Registry loader (base) | registry/loader.ts | 1h | S1.7, S1.8 | All registries loadable |
| S1.14 | Claim registry parser | registry/claim-registry.ts | 2h | S1.13 | 120+ claims parseable |
| S1.15 | Product registry parser | registry/product-registry.ts | 1h | S1.13 | 17 products parseable |
| S1.16 | Decision registry parser | registry/decision-registry.ts | 1h | S1.13 | 17 decisions parseable |
| S1.17 | Findings registry parser | registry/findings-registry.ts | 0.5h | S1.13 | 2 findings parseable |

**Sprint 1 effort:** ~14.5h | **Files created:** 20 | **Gate:** All registries parseable, all entity IDs validated

---

## Sprint 2: Resolver Layer

**Goal:** Cross-registry references resolvable, relationships validated

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S2.1 | Entity resolver | resolver/entity-resolver.ts | 2h | Sprint 1 | CLM↔EV↔SRC↔AUTH resolved |
| S2.2 | Relationship resolver | resolver/relationship-resolver.ts | 2h | S2.1 | C01–C21 validated |
| S2.3 | Chain resolver | resolver/chain-resolver.ts | 1.5h | S2.1 | Claim→EV→SRC→DOC chains |
| S2.4 | Graph resolver | resolver/graph-resolver.ts | 1.5h | S2.1 | Dependency graph builder |

**Sprint 2 effort:** ~7h | **Files created:** 4 | **Gate:** All cross-references resolvable, 0 broken chains

---

## Sprint 3: Rule Engine Layer

**Goal:** All 13 GR rules executable

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S3.1 | Abstract rule interface | rules/base-rule.ts | 0.5h | Sprint 2 | Interface defined |
| S3.2 | Rule scheduler | rules/engine.ts | 1.5h | S3.1 | Rules execute in phase order |
| S3.3 | GR-001 (Immutable IDs) | rules/gr-001.ts | 0.5h | Sprint 2 | Detects changed IDs |
| S3.4 | GR-002 (Derived Artifacts) | rules/gr-002.ts | 0.5h | Sprint 2 | Detects manual Manifest edits |
| S3.5 | GR-003 (Evidence Manifest) | rules/gr-003.ts | 0.5h | Sprint 2 | MAT without Manifest = fail |
| S3.6 | GR-004 (Glossary Precision) | rules/gr-004.ts | 0.5h | Sprint 2 | Regex for forbidden terms |
| S3.7 | GR-005 (Three-tier Review) | rules/gr-005.ts | 0.5h | Sprint 2 | Same-agent detection |
| S3.8 | GR-006 (Decision Preconditions) | rules/gr-006.ts | 1.5h | Sprint 2 | 6 preconditions checked |
| S3.9 | GR-007 (Evidence Independence) | rules/gr-007.ts | 1h | Sprint 2 | Circular EV detection |
| S3.10 | GR-008 (Shared Evidence) | rules/gr-008.ts | 1h | Sprint 2 | Duplicate capability EV |
| S3.11 | GR-009 (Capability Evidence) | rules/gr-009.ts | 1h | Sprint 2 | Engine EV patterns |
| S3.12 | GR-010 (Marginal Efficiency) | rules/gr-010.ts | 0.5h | Sprint 2 | MK-01 calculation |
| S3.13 | GR-011 (Quality Preservation) | rules/gr-011.ts | 0.5h | Sprint 2 | KQI calculation |
| S3.14 | GR-012 (Historical Consistency) | rules/gr-012.ts | 1h | Sprint 2 | HC-IDs, SupersededBy |
| S3.15 | GR-013 (Conflict Preservation) | rules/gr-013.ts | 1h | Sprint 2 | Dimensional conflicts |

**Sprint 3 effort:** ~12h | **Files created:** 15 | **Gate:** All 13 rules executable, CI-exitable

---

## Sprint 4: Validator Layer

**Goal:** Complete validation API covering all governance checks

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S4.1 | Claims validator | validators/claims-validator.ts | 1h | Sprint 3 | validateClaims() works |
| S4.2 | Evidence validator | validators/evidence-validator.ts | 1h | Sprint 3 | validateEvidence() works |
| S4.3 | Products validator | validators/products-validator.ts | 1h | Sprint 3 | validateProducts() works |
| S4.4 | Authorities validator | validators/authorities-validator.ts | 0.5h | Sprint 3 | validateAuthorities() works |
| S4.5 | Relationships validator | validators/relationships-validator.ts | 0.5h | Sprint 3 | validateRelationships() works |
| S4.6 | Integrity validator | validators/integrity-validator.ts | 1h | Sprint 3 | validateIntegrity() works |
| S4.7 | Freshness validator | validators/freshness-validator.ts | 0.5h | Sprint 3 | validateFreshness() works |
| S4.8 | Freeze validator | validators/freeze-validator.ts | 0.5h | Sprint 3 | validateFreeze() works |
| S4.9 | Decisions validator | validators/decisions-validator.ts | 0.5h | Sprint 3 | validateDecisions() works |
| S4.10 | Governance validator | validators/governance-validator.ts | 1h | S4.1–S4.9 | Orchestrates all |

**Sprint 4 effort:** ~7.5h | **Files created:** 10 | **Gate:** All validators pass on current governance state

---

## Sprint 5: Generator Layer (Parallelizable)

**Goal:** All derived artifacts auto-generatable

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S5.1 | Manifest generator | generators/manifest-generator.ts | 3h | Sprint 3 | Deterministic, reverse-validatable |
| S5.2 | Dossier generator | generators/dossier-generator.ts | 3h | S5.1 | 12-section output |
| S5.3 | Coverage generator | generators/coverage-generator.ts | 2h | Sprint 3 | T1–T7 per product |
| S5.4 | Freshness generator | generators/freshness-generator.ts | 1h | Sprint 3 | Expiry tracking |
| S5.5 | Report generator | generators/report-generator.ts | 1.5h | S5.1–S5.4 | governance-review-brief.md |
| S5.6 | Hash generator | generators/hash-generator.ts | 0.5h | S5.1 | manifest-hashes.json |

**Sprint 5 effort:** ~11h | **Files created:** 6 | **Gate:** All generators deterministic, output matches manual baseline

---

## Sprint 6: CLI Layer

**Goal:** Full CLI interface with JSON/CI modes

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S6.1 | CLI config | cli/config.ts | 0.5h | None | Config loadable |
| S6.2 | CLI formatter (human) | cli/formatters/cli-formatter.ts | 1h | None | Human-readable output |
| S6.3 | CLI formatter (JSON) | cli/formatters/json-formatter.ts | 0.5h | None | JSON output |
| S6.4 | CLI formatter (CI) | cli/formatters/ci-formatter.ts | 0.5h | None | GitHub Actions annotations |
| S6.5 | Validate command | cli/commands/validate.ts | 1.5h | Sprint 4 | All validate subcommands |
| S6.6 | Generate command | cli/commands/generate.ts | 1h | Sprint 5 | All generate subcommands |
| S6.7 | Report command | cli/commands/report.ts | 1h | Sprint 4 | Summary + detailed |
| S6.8 | Status command | cli/commands/status.ts | 0.5h | Sprint 4 | Health overview |
| S6.9 | Audit command | cli/commands/audit.ts | 1h | Sprint 4 | Full audit |
| S6.10 | CLI entry point | cli/index.ts | 0.5h | S6.5–S6.9 | CLI executable |

**Sprint 6 effort:** ~8h | **Files created:** 10 | **Gate:** All commands work in CLI/JSON/CI modes

---

## Sprint 7: Integration Layer

**Goal:** CI pipeline operational

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S7.1 | Filesystem adapter | adapters/filesystem.ts | 1h | None | Read/write with path validation |
| S7.2 | Logger | adapters/logger.ts | 0.5h | None | Structured logging |
| S7.3 | GitHub Actions adapter | adapters/github-actions.ts | 1h | Sprint 6 | PR annotations |
| S7.4 | CI workflow | .github/workflows/governance.yml | 1h | Sprint 6 | Pre-merge gate |
| S7.5 | Config | .github/gov-config.yml | 0.5h | None | Rule configuration |
| S7.6 | package.json update | package.json | 0.5h | None | Path alias, bin entry |
| S7.7 | tsconfig.json update | tsconfig.json | 0.5h | None | Path resolution |

**Sprint 7 effort:** ~5h | **Files created:** 7 | **Gate:** CI pipeline blocks merge on governance violations

---

## Sprint 8: Hardening

**Goal:** Production-ready quality

| ID | Task | Files | Effort | Dependencies | Acceptance |
|----|------|-------|--------|--------------|------------|
| S8.1 | Unit tests — all rules | tests/ | 3h | Sprint 3 | 100% rule coverage |
| S8.2 | Integration tests | tests/ | 2h | Sprint 4 | Registry→Resolver→Rules |
| S8.3 | Determinism tests | tests/ | 1h | Sprint 5 | Same input = same output |
| S8.4 | E2E tests | tests/ | 2h | Sprint 6 | CLI commands |
| S8.5 | CI pipeline validation | tests/ | 1h | Sprint 7 | Mock GitHub Actions |
| S8.6 | Performance benchmarks | tests/ | 1h | All | Full validation < 30s |
| S8.7 | Documentation | docs/ | 1h | All | README, API docs |

**Sprint 8 effort:** ~11h | **Files created:** ~20 test files | **Gate:** All tests pass, CI green

---

## Summary

| Sprint | Focus | Tasks | Effort | Files | Gate |
|--------|-------|-------|--------|-------|------|
| S1 | Foundation | 17 | ~14.5h | 20 | All registries parseable |
| S2 | Resolver | 4 | ~7h | 4 | All references resolvable |
| S3 | Rule Engine | 15 | ~12h | 15 | 13 GR rules executable |
| S4 | Validators | 10 | ~7.5h | 10 | All validators pass |
| S5 | Generators | 6 | ~11h | 6 | Deterministic output |
| S6 | CLI | 10 | ~8h | 10 | All CLI commands work |
| S7 | Integration | 7 | ~5h | 7 | CI pipeline operational |
| S8 | Hardening | 7 | ~11h | 20+ | All tests pass |
| **Total** | | **76** | **~76h** | **~92 files** | **Governance Gate LIVE** |

## Note on Effort

The original estimate was ~55h. The sprint breakdown reveals ~76h due to:
- Testing effort added (Sprint 8)
- CLI detail added (Sprint 6 — expanded from 3 tasks to 10)
- Integration detail added (Sprint 7)

This is more realistic. The 55h estimate was specifications-only.
