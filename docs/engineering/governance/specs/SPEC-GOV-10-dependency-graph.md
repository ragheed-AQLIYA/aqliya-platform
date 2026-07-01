# SPEC-GOV-10: Implementation Dependency Graph

> **Engineering Specification** | **Execution order, module dependencies, data flow**  
> **Status:** Pre-implementation

---

## 1. Full Dependency Graph

```
                                    ┌──────────────────┐
                                    │   types/          │
                                    │   entities.ts     │
                                    │   relationships   │
                                    │   rules.ts        │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   schemas/        │
                                    │   zod validators  │
                                    └────────┬─────────┘
                                             │
                    ┌────────────────────────────────────────┐
                    │                                         │
                    ▼                                         ▼
          ┌─────────────────────┐              ┌──────────────────────┐
          │   registry/          │              │   shared/             │
          │   claim-registry     │              │   parser.ts           │
          │   product-registry   │              │   hash.ts             │
          │   decision-registry  │              │   date.ts             │
          │   findings-registry  │              │   regex.ts            │
          │   manifest-registry  │              │   result.ts           │
          └─────────┬───────────┘              └──────────┬───────────┘
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   resolver/                   │
                    │   entity-resolver.ts          │
                    │   relationship-resolver.ts    │
                    │   chain-resolver.ts           │
                    │   graph-resolver.ts           │
                    └─────────────┬─────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   rules/                     │
                    │   engine.ts (scheduler)     │
                    │   base-rule.ts               │
                    │                              │
                    │   ┌───────────────────────┐  │
                    │   │ Phase 1: Structural    │  │
                    │   │ GR-001, GR-002         │  │
                    │   └───────────────────────┘  │
                    │   ┌───────────────────────┐  │
                    │   │ Phase 2: Identity      │  │
                    │   │ GR-003, GR-004, GR-005 │  │
                    │   └───────────────────────┘  │
                    │   ┌───────────────────────┐  │
                    │   │ Phase 3: Integrity     │  │
                    │   │ GR-006, GR-007, GR-008 │  │
                    │   └───────────────────────┘  │
                    │   ┌───────────────────────┐  │
                    │   │ Phase 4: Pattern       │  │
                    │   │ GR-009, GR-010, GR-011 │  │
                    │   └───────────────────────┘  │
                    │   ┌───────────────────────┐  │
                    │   │ Phase 5: Historical    │  │
                    │   │ GR-012, GR-013         │  │
                    │   └───────────────────────┘  │
                    └─────────────┬─────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   validators/                │
                    │   claims-validator           │
                    │   evidence-validator         │
                    │   products-validator         │
                    │   authorities-validator      │
                    │   relationships-validator    │
                    │   integrity-validator        │
                    │   freshness-validator        │
                    │   freeze-validator           │
                    │   decisions-validator        │
                    │   governance-validator       │
                    └─────────────┬─────────────────┘
                                  │
                    ┌─────────────┴─────────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────────┐      ┌──────────────────────┐
          │   generators/        │      │   cli/                │
          │   manifest           │      │   commands/           │
          │   dossier            │      │   formatters/         │
          │   coverage           │      │   config.ts           │
          │   freshness          │      └──────────┬───────────┘
          │   report             │                 │
          │   hash               │                 ▼
          └─────────────────────┘      ┌──────────────────────┐
                                       │   adapters/           │
                                       │   github-actions      │
                                       │   filesystem          │
                                       │   logger              │
                                       └──────────────────────┘
```

## 2. Execution Order (Sprint by Sprint)

```
Sprint 1: Foundation (Registry)
─────────────────────────────────
  1. types/entities.ts           ─── 12 entity interfaces
  2. types/relationships.ts      ─── C01–C21 types
  3. types/rules.ts              ─── GR result types
  4. types/registries.ts         ─── Registry interfaces
  5. types/identifiers.ts        ─── ID regex validators
  6. types/errors.ts             ─── Error types
  7. schemas/*.ts                ─── Zod schemas
  8. shared/parser.ts            ─── Markdown table parser
  9. shared/hash.ts              ─── SHA256
  10. shared/date.ts             ─── Date/freshness
  11. shared/regex.ts            ─── ID matchers
  12. shared/result.ts           ─── Ok/Err
  13. registry/loader.ts         ─── Base loader
  14. registry/claim-registry.ts ─── CLAIM_REGISTRY.md parser
  15. registry/product-registry.ts
  16. registry/decision-registry.ts
  17. registry/findings-registry.ts

Sprint 2: Resolvers
────────────────────
  18. resolver/entity-resolver.ts       ─── Cross-ref resolution
  19. resolver/relationship-resolver.ts ─── C01–C21 validation
  20. resolver/chain-resolver.ts        ─── Claim→EV→SRC→DOC
  21. resolver/graph-resolver.ts        ─── Dependency graph

Sprint 3: Rule Engine
──────────────────────
  22. rules/base-rule.ts           ─── Abstract rule
  23. rules/engine.ts              ─── Scheduler
  24. rules/gr-001.ts              ─── Immutable IDs
  25. rules/gr-002.ts              ─── Derived Artifacts
  26. rules/gr-003.ts              ─── Evidence Manifest
  27. rules/gr-004.ts              ─── Glossary Precision
  28. rules/gr-005.ts              ─── Three-tier Review
  29. rules/gr-006.ts              ─── Decision Preconditions
  30. rules/gr-007.ts              ─── Evidence Independence
  31. rules/gr-008.ts              ─── Shared Evidence
  32. rules/gr-009.ts              ─── Capability Evidence
  33. rules/gr-010.ts              ─── Marginal Efficiency
  34. rules/gr-011.ts              ─── Quality Preservation
  35. rules/gr-012.ts              ─── Historical Consistency
  36. rules/gr-013.ts              ─── Conflict Preservation

Sprint 4: Validators
─────────────────────
  37. validators/claims-validator.ts
  38. validators/evidence-validator.ts
  39. validators/products-validator.ts
  40. validators/authorities-validator.ts
  41. validators/relationships-validator.ts
  42. validators/integrity-validator.ts
  43. validators/freshness-validator.ts
  44. validators/freeze-validator.ts
  45. validators/decisions-validator.ts
  46. validators/governance-validator.ts

Sprint 5: Generators
─────────────────────
  47. generators/manifest-generator.ts
  48. generators/dossier-generator.ts
  49. generators/coverage-generator.ts
  50. generators/freshness-generator.ts
  51. generators/report-generator.ts
  52. generators/hash-generator.ts

Sprint 6: CLI
──────────────
  53. cli/config.ts
  54. cli/formatters/cli-formatter.ts
  55. cli/formatters/json-formatter.ts
  56. cli/formatters/ci-formatter.ts
  57. cli/commands/validate.ts
  58. cli/commands/generate.ts
  59. cli/commands/report.ts
  60. cli/commands/status.ts
  61. cli/commands/audit.ts
  62. cli/index.ts

Sprint 7: Integration
─────────────────────
  63. adapters/filesystem.ts
  64. adapters/logger.ts
  65. adapters/github-actions.ts
  66. .github/workflows/governance.yml
  67. .github/gov-config.yml
  68. package.json update
  69. tsconfig.json update

Sprint 8: Hardening
────────────────────
  70. Unit tests for all rules
  71. Integration tests (registry→resolver→rules)
  72. Determinism tests (generators)
  73. E2E tests (CLI commands)
  74. CI pipeline testing
  75. Performance benchmarks
  76. Documentation
```

## 3. Critical Path

```
types/ → schemas/ → registry/ → resolver/ → rules/ → validators/ → cli/
                                                              ↓
                                                         generators/
```

The critical path is: **types → schemas → registry → resolver → rules → validators → cli**

Generators can be built in parallel with CLI after validators are complete.

## 4. Parallelization Opportunities

```
Sprint 1:  registry/ + shared/ + types/ + schemas/  (all independent)
Sprint 2:  resolver/                                (single thread)
Sprint 3:  rules/ (13 rules can be parallelized)     (13 parallel tasks)
Sprint 4:  validators/                              (sequential)
Sprint 5:  generators/                              (sequential)
Sprint 6:  cli/ + formatters/                        (parallel)
Sprint 7:  integration                              (sequential)
```

## 5. File Creation Order (by dependency)

```
 1  →  src/lib/governance-engine/types/entities.ts
 2  →  src/lib/governance-engine/types/relationships.ts
 3  →  src/lib/governance-engine/types/rules.ts
...
76  →  .github/workflows/governance.yml
```

**Total files:** ~76 files across 8 sprints
