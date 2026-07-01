# SPEC-GOV-09: Implementation Architecture

> **Engineering Specification** | **Directory structure, module boundaries, import rules**  
> **Status:** Pre-implementation | **Architecture Baseline:** M2 v1.2 (Frozen)

---

## 1. Directory Structure

```
src/lib/governance-engine/           ← NEW: Governance Engine root
│
├── types/                           ← Shared type definitions
│   ├── index.ts                     ← Barrel export
│   ├── entities.ts                  ← 12 entity interfaces (Claim, Evidence, etc.)
│   ├── relationships.ts             ← C01–C21 relationship types
│   ├── rules.ts                     ← GR-001 to GR-013 result types
│   ├── registries.ts                ← Registry interfaces
│   ├── identifiers.ts               ← ID pattern contracts + regex validators
│   ├── metrics.ts                   ← KQI, MK-01, GRI types
│   └── errors.ts                    ← ValidationError, EngineError types
│
├── schemas/                         ← Zod validation schemas
│   ├── index.ts
│   ├── claim-schema.ts              ← CLM-ID, fields, constraints
│   ├── evidence-schema.ts           ← EV-ID, tiers, freshness
│   ├── product-schema.ts            ← PROD-ID, types, KA
│   ├── decision-schema.ts           ← DEC-ID, types, preconditions
│   ├── authority-schema.ts          ← AUTH-ID, KA mapping
│   └── contract-schema.ts           ← File path contracts
│
├── registry/                        ← Registry Loaders (read-only)
│   ├── index.ts
│   ├── loader.ts                    ← Base registry loader
│   ├── claim-registry.ts            ← CLAIM_REGISTRY.md parser
│   ├── product-registry.ts          ← product-registry.md parser
│   ├── decision-registry.ts         ← decision-registry.md parser
│   ├── findings-registry.ts         ← governance-findings-log.md parser
│   ├── manifest-registry.ts         ← MANIFEST-*.md reader
│   └── dossier-registry.ts          ← DOSSIER-*.md reader
│
├── resolver/                        ← Entity Resolvers
│   ├── index.ts
│   ├── entity-resolver.ts           ← Cross-registry reference resolution
│   ├── relationship-resolver.ts     ← C01–C21 cardinality validation
│   ├── chain-resolver.ts            ← Claim→Evidence→Source→Document
│   └── graph-resolver.ts            ← Dependency graph builder
│
├── rules/                           ← Rule Engine
│   ├── index.ts
│   ├── engine.ts                    ← Rule scheduler + executor
│   ├── base-rule.ts                 ← Abstract rule interface
│   ├── gr-001-immutable-ids.ts
│   ├── gr-002-derived-artifacts.ts
│   ├── gr-003-evidence-manifest.ts
│   ├── gr-004-glossary-precision.ts
│   ├── gr-005-three-tier-review.ts
│   ├── gr-006-decision-preconditions.ts
│   ├── gr-007-evidence-independence.ts
│   ├── gr-008-shared-evidence.ts
│   ├── gr-009-capability-evidence.ts
│   ├── gr-010-marginal-efficiency.ts
│   ├── gr-011-quality-preservation.ts
│   ├── gr-012-historical-consistency.ts
│   └── gr-013-conflict-preservation.ts
│
├── validators/                      ← Validation API
│   ├── index.ts
│   ├── claims-validator.ts
│   ├── evidence-validator.ts
│   ├── products-validator.ts
│   ├── authorities-validator.ts
│   ├── relationships-validator.ts
│   ├── integrity-validator.ts
│   ├── freshness-validator.ts
│   ├── freeze-validator.ts
│   ├── decisions-validator.ts
│   └── governance-validator.ts      ← Orchestrates all validators
│
├── generators/                      ← Derived Artifact Generators
│   ├── index.ts
│   ├── manifest-generator.ts        ← MANIFEST-{Product}.md
│   ├── dossier-generator.ts         ← DOSSIER-{Product}.md
│   ├── coverage-generator.ts        ← evidence-coverage-matrix.md
│   ├── freshness-generator.ts       ← evidence-freshness-report.md
│   ├── report-generator.ts          ← governance-review-brief.md
│   └── hash-generator.ts            ← manifest-hashes.json
│
├── cli/                             ← CLI interface
│   ├── index.ts                     ← Entry point (bin/aqliya-gov)
│   ├── commands/
│   │   ├── validate.ts              ← aqliya-gov validate
│   │   ├── generate.ts              ← aqliya-gov generate
│   │   ├── report.ts                ← aqliya-gov report
│   │   ├── status.ts                ← aqliya-gov status
│   │   └── audit.ts                 ← aqliya-gov audit
│   ├── formatters/
│   │   ├── cli-formatter.ts         ← Human-readable output
│   │   ├── json-formatter.ts        ← JSON output
│   │   └── ci-formatter.ts          ← GitHub Actions annotations
│   └── config.ts                    ← CLI configuration
│
├── adapters/                        ← External integrations
│   ├── index.ts
│   ├── github-actions.ts            ← CI annotations
│   ├── filesystem.ts                ← File read/write with path validation
│   └── logger.ts                    ← Structured logging
│
└── shared/                          ← Shared utilities
    ├── index.ts
    ├── parser.ts                    ← Markdown table parser
    ├── hash.ts                      ← SHA256 implementation
    ├── date.ts                      ← Date parsing + freshness
    ├── regex.ts                     ← ID pattern matchers
    └── result.ts                    ← Result type (Ok/Err pattern)
```

## 2. Module Boundaries

| Module | Visibility | Imports From | Exports To |
|--------|-----------|-------------|------------|
| `types/` | Public | None | All modules |
| `schemas/` | Public | `types/` | Registry, Validators |
| `registry/` | Internal | `types/`, `schemas/` | Resolver, Validators |
| `resolver/` | Internal | `types/`, `registry/` | Rules, Validators |
| `rules/` | Internal | `types/`, `resolver/` | Validators, CLI |
| `validators/` | Public | `types/`, `registry/`, `resolver/`, `rules/` | CLI, CI |
| `generators/` | Public | `types/`, `registry/`, `resolver/` | CLI |
| `cli/` | Public | All modules | User |
| `adapters/` | Internal | `types/` | CLI, CI |
| `shared/` | Public | None | All modules |

## 3. Import Rules

```
types/ ← NO IMPORTS FROM outside types/
schemas/ ← MAY IMPORT from types/
registry/ ← MAY IMPORT from types/, schemas/, shared/
resolver/ ← MAY IMPORT from types/, registry/, shared/
rules/ ← MAY IMPORT from types/, resolver/, shared/
validators/ ← MAY IMPORT from all modules
generators/ ← MAY IMPORT from types/, registry/, resolver/, shared/
cli/ ← MAY IMPORT from all modules
adapters/ ← MAY IMPORT from types/, shared/
shared/ ← NO IMPORTS FROM project modules (stdlib only)

FORBIDDEN:
  rules/ → generators/     (Rules must not trigger generation)
  generators/ → rules/     (Generators must not validate)
  registry/ → cli/         (Registry must be independent of CLI)
  types/ → anything/       (Types must not depend on implementation)
```

## 4. Public API Surface

```typescript
// src/lib/governance-engine/index.ts  (Public barrel)

export { GovernanceEngine } from './validators/governance-validator';
export { RegistryLoader } from './registry/loader';
export { ManifestGenerator } from './generators/manifest-generator';
export { DossierGenerator } from './generators/dossier-generator';
export { RuleEngine } from './rules/engine';
export { createCLI } from './cli';

// Types are exported from types/
export type { Claim, Evidence, Product, Decision, Authority, Source, Document, Review, Finding, Manifest, Dossier, KnowledgeArea } from './types/entities';
export type { C01, C21 } from './types/relationships';
export type { GR, GRResult } from './types/rules';
```

## 5. Package Boundaries

```
src/lib/governance-engine/
  → Single npm package: @aqliya/governance-engine (or internal lib)
  → Zero runtime dependencies on Next.js
  → Only depends on: zod, Node.js fs/path
  → Testable in isolation (no DB, no API, no UI)
```

## 6. Circular Dependency Prevention

```
Rule: All imports must flow downward:
  types → schemas → registry → resolver → rules → validators → cli
  types → shared (independent)

Enforcement:
  - ESLint rule: import/no-cycle
  - CI check: madge --circular src/lib/governance-engine/
  - Breaking: circular dependency = build failure
```

## 7. Testing Strategy

```
Unit tests:
  └── Each rule in isolation (GR-001 to GR-013)
Integration tests:
  └── Registry → Resolver → Rule Engine pipeline
  └── Generator → output comparison (determinism)
End-to-end tests:
  └── CLI commands with real governance files
  └── CI integration with mock GitHub Actions
```

## 8. Files Affected

| File/Directory | Action |
|---------------|--------|
| `src/lib/governance-engine/` | **CREATE** (new directory) |
| `src/lib/governance/` | **UNCHANGED** (runtime governance — separate concern) |
| `package.json` | **UPDATE** (add `@aqliya/governance-engine` path) |
| `tsconfig.json` | **UPDATE** (add path alias) |
| `.github/workflows/governance.yml` | **CREATE** (CI workflow) |
| `.github/gov-config.yml` | **CREATE** (governance config) |
