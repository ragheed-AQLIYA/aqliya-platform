# SPEC-GOV-01: Knowledge Governance Engine

> **Status:** Engineering Specification  
> **Version:** 1.0 | **Date:** 2026-06-30  
> **Architecture Baseline:** M2 v1.2 (Frozen)  
> **Governance Baseline:** 13 Rules (GR-001 to GR-013)  
> **Patterns:** 8 Validated + 1 ADR-approved

---

## 1. Purpose

Define the executable Knowledge Governance Engine that reads frozen governance registries (Claims, Evidence, Decisions, Products, Authorities) and validates them against 13 governance rules without modifying the M2 architecture.

## 2. Scope

- Registry Loaders (read-only file parsers)
- Entity Resolvers (cross-registry reference resolution)
- Relationship Validators (cardinality C01–C21 checks)
- Rule Engine (GR-001 to GR-013 execution)
- Generators (Manifest, Dossier, Coverage, Reports)
- CLI interface
- CI integration contracts

## 3. Non-Scope

- Modifying M2 entities, relationships, or identifiers
- Creating new governance rules
- Database or Graph storage (assessed separately)
- User interfaces beyond CLI
- Real-time governance enforcement (pre-commit only)

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Governance Engine                           │
├─────────────────────────────────────────────────────────────┤
│  Registry Loaders → Entity Resolvers → Rule Engine → Output │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Registry │→│ Entity   │→│  Rule    │→│ Generator│   │
│  │ Loader   │  │ Resolver │  │ Engine   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 5. Module Boundaries

| Module | Input | Output | Dependencies |
|--------|-------|--------|--------------|
| RegistryLoader | File paths (CLAIM_REGISTRY.md, product-registry.md, etc.) | Structured registry objects | fs, zod schemas |
| EntityResolver | Registry objects | Resolved cross-references | RegistryLoader |
| RelationshipResolver | Resolved entities | Cardinality-validated relationships | EntityResolver |
| RuleEngine | Resolved entities + relationships | Validation results per GR | RelationshipResolver |
| FreezeValidator | Registry + current state | Freeze compliance report | RuleEngine |
| FreshnessValidator | Evidence dates | Freshness report | RegistryLoader |
| ManifestGenerator | Claims + Evidence | MANIFEST-*.md | RuleEngine |
| DossierGenerator | Manifest | DOSSIER-*.md | ManifestGenerator |
| CoverageValidator | All registries | Coverage metrics | RuleEngine |
| GovReportGenerator | All validator outputs | governance-review-brief.md | All validators |

## 6. Data Flow

```
1. RegistryLoader reads all governance files
2. EntityResolver links CLM ← EV ← SRC ← DOC
3. RelationshipResolver validates C01–C21
4. RuleEngine executes GR-001 through GR-013
5. Generators produce derived artifacts
6. Reporter produces human-readable output
```

## 7. Error Model

| Error Type | Behavior | Exit Code |
|-----------|----------|-----------|
| Registry not found | Hard failure | 1 |
| Entity not resolvable | Warning + skip | 2 |
| Relationship violation | Rule-dependent | 10–22 |
| Freeze violation | Blocking | 30 |
| Freshness expired | Warning | 40 |
| Generation failure | Hard failure | 50 |

## 8. Acceptance Criteria

1. All 12 entity types loadable from registries
2. All 21 relationships (C01–C21) verifiable
3. All 13 GR rules executable
4. Manifest generation produces identical output for same input (determinism)
5. CLI works in CI mode (JSON output, exit codes)
6. No M2 modifications required

## 9. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Registry files too large for in-memory loading | Medium | Streaming parser for CLAIM_REGISTRY.md |
| Manual markdown parsing is fragile | High | Structured YAML frontmatter + regex fallback |
| Circular dependencies in entity resolution | Medium | Cycle detection in Resolver |
| CI gate slows down development | Low | Optional: warn-only mode for non-MAT changes |
