---
title: "Repository Quality — Baseline Report"
status: active
program: "Repository Quality"
phase: 0
version: "1.0"
date: 2026-06-27
author: OpenCode
classification: baseline-report
supersedes: none
---

# Repository Quality — Baseline Report

**Program:** Repository Quality  
**Phase:** 0 — Quality Baseline  
**Date:** 2026-06-27  
**Method:** Measurement only — zero changes applied  

> All data collected from the committed state at commit `bf80fdd` (tip of Repository Health) plus subsequent Phase 2 closure documents. No fixes applied.

---

## 1. Repository Dimensions

| Metric | Value |
|--------|------:|
| TypeScript/TSX files | 2,253 |
| Total source files | 2,266 |
| TypeScript lines of code | 313,449 |
| Test files | 321 |
| Prisma models | 228 |
| Prisma enums | 27 |
| Schema lines | 5,391 |

---

## 2. Lint Status

### Summary

| Category | Count |
|----------|:-----:|
| Errors (`@typescript-eslint/no-explicit-any`) | **6** |
| Warnings (all rules) | **723** |
| Potentially auto-fixable (`--fix`) | **4** |
| **Total problems** | **729** |

### Error Detail

All 6 errors are `@typescript-eslint/no-explicit-any`:

| File | Lines |
|------|:-----:|
| `src/lib/core/knowledge/rag/embedding-service.ts` | 1 |
| `src/lib/core/memory/institutional-memory-service.ts` | 5 |

### Warning Classification

| Rule | Count | % of Total | Type |
|------|:-----:|:----------:|------|
| `security/detect-object-injection` | 412 | 57.0% | Security |
| `@typescript-eslint/no-unused-vars` | 262 | 36.2% | Code quality |
| `security/detect-non-literal-fs-filename` | 40 | 5.5% | Security |
| `security/detect-possible-timing-attacks` | 2 | 0.3% | Security |
| `@typescript-eslint/no-explicit-any` (warning) | 2 | 0.3% | Type safety |
| `react-hooks/exhaustive-deps` | 2 | 0.3% | React |
| `security/detect-non-literal-regexp` | 1 | 0.1% | Security |
| `security/detect-unsafe-regex` | 1 | 0.1% | Security |
| `react-hooks/no-immutability` | 1 | 0.1% | React |
| **Total** | **723** | **100%** | |

### Warnings by Severity (Suggested)

| Priority | Count | Rules | Assessment |
|:--------:|:-----:|-------|------------|
| **High** | 2 | `@typescript-eslint/no-explicit-any` (warning-level, same as the 6 errors) | Type safety — easy to fix |
| **Medium** | 262 | `@typescript-eslint/no-unused-vars` | Many are intentional exports; need classification |
| **Low** | 412 | `security/detect-object-injection` | Most are legitimate dynamic access patterns; need architectural review |
| **Info** | 47 | All others | False positives, edge cases, or minor |

### Files with Most Warnings

| File | Warnings | Primary Rule |
|------|:--------:|--------------|
| `src/lib/local-content/content/file-repository.ts` | 43 | detect-object-injection |
| `src/lib/skill-runtime/runtime.ts` | 18 | Mixed |
| `src/lib/skill-runtime/evaluator.ts` | 12 | Mixed |
| `src/lib/workflowos/analytics-service.ts` | 14 | detect-object-injection |
| `src/lib/sales/agents/follow-up.ts` | 5 | Mixed |

---

## 3. Test Status

### Suite Summary

| Status | Count |
|--------|:-----:|
| Passed | **316** |
| Skipped | **4** |
| Failed | **1** |
| **Total test suites** | **321** |

### Test Summary

| Status | Count |
|--------|:-----:|
| Passed | **3,119** |
| Skipped | **21** |
| Failed | **1** |
| **Total tests** | **3,141** |

### Failed Test (1)

| Suite | Test | Root Cause |
|-------|------|------------|
| `src/__tests__/migration-evidence.test.ts` | "is the latest applied migration in the repository" | Migration name staleness — expects `20260622140000_knowledge_foundation_release_trust_chain` but DB has `20260623000000_add_knowledge_candidate_fk` |

### Skipped Suites (4)

| Suite | Reason (if documented) |
|-------|------------------------|
| (4 suites skipped) | Pre-existing, from Repository Health baseline |

### Skipped Tests (21)

All pre-existing from Repository Health baseline. 21 tests across various suites are marked with `skip` or `todo`.

### DB-Dependent Tests

No official count yet. Observed pattern: multiple suites produce `[PlatformAuditLog] Write failed: Cannot read properties of undefined (reading 'create')` console warnings — these gracefully degrade when no database is available. Known DB-dependent suites include:

| Suite | Failure Mode |
|-------|-------------|
| Integration test suites (9 suites) | `Database aqliya_dev does not exist` |
| Audit-log-related suites | Graceful `console.warn` on Prisma unavailability |

---

## 4. Code Quality Markers

### TODO/FIXME/HACK

| Marker | Count | Files Affected |
|--------|:-----:|:--------------:|
| `TODO` | 25 | 16 |
| `XXX` | 4 | — |
| `FIXME` | 0 | — |
| `HACK` | 0 | — |
| **Total** | **29** | **16** |

No `FIXME` or `HACK` — this is a positive signal.

### Knowledge Map

| File | Status |
|------|--------|
| `knowledge-map.json` | **NOT FOUND** |
| `docs/knowledge-map.json` | **NOT FOUND** |

The knowledge map file does not exist in the current working tree. This may have been deleted or never generated after the Repository Health commits.

### Bundle Warnings

Build succeeds with exit 0. No bundle errors observed during Repository Health validation. Detailed bundle warning count deferred to Phase 0 refinement.

---

## 5. Cross-reference with Repository Health

| Health Metric | Health Closure Value | Current Value | Delta |
|---------------|:--------------------:|:-------------:|:-----:|
| TS errors | 0 | **0** | — |
| Build | PASS | **PASS** | — |
| Prisma validate | 🚀 | **🚀** | — |
| Lint errors | 0 | **6** | ⬆️ New (added by KF commits `bf80fdd`) |
| Lint warnings | 723 | **723** | — |
| Test pass | 3,119 | **3,119** | — |
| Test fail | 1 | **1** | — |

> **Note:** The 6 lint errors (all `no-explicit-any`) appeared after the KF schema commit `bf80fdd` which added `src/lib/core/knowledge/rag/embedding-service.ts` and `src/lib/core/memory/institutional-memory-service.ts` — both never-before-committed modules restored from the working tree. These 6 errors are **new debt introduced by module recovery**, not pre-existing.

---

## 6. Unmeasured (Deferred)

The following metrics are acknowledged but not collected in this Phase 0 snapshot:

| Metric | Reason | Plan |
|--------|--------|------|
| Dead code (unused exports) | Requires AST analysis tool | Phase 3 |
| Circular dependencies | Requires `madge` | Phase 3 |
| Duplicate types/interfaces | Manual inspection | Phase 3 |
| Duplicate utilities | Manual inspection | Phase 3 |
| Import consistency | Spot-check only | Phase 3 |
| Folder naming convention | Spot-check only | Phase 3 |
| Bundle warnings (detailed) | Requires `webpack-bundle-analyzer` | Phase 3 |
| Test coverage percentage | Requires `--coverage` flag (slow) | Phase 2 |
| Flaky test identification | Requires repeated test runs | Phase 2 |

---

## 7. Key Findings

### Finding 1: 57% of warnings are a single security rule
`security/detect-object-injection` accounts for 412 of 723 warnings (57%). Many appear in legitimate dynamic access patterns (e.g., `record[fieldName]` in database mappers). The security team should review whether these are true positives or default-deny noise.

### Finding 2: 6 new lint errors appeared with module recovery
The module recovery in Repository Health added `embedding-service.ts` and `institutional-memory-service.ts` which contain 6 `no-explicit-any` usages. These are high-value targets for Phase 1.

### Finding 3: Knowledge Map is missing
No `knowledge-map.json` file found. This likely needs regeneration from scratch after the committed state stabilizes.

### Finding 4: Migration evidence test is stale
The single test failure is a migration-staleness check — the test hardcodes an expected migration name that has been superseded. This is a trivial fix that slipped through because the test only runs against a live database.

---

## 8. Raw Data Sources

| Source | Location |
|--------|----------|
| Full lint output | `C:\Users\PC\AppData\Local\Temp\lint-raw.txt` (gitignored) |
| Test output | Saved on previous runs |
| Repository Health Phase 2 closure | `../repository-health/phases/PHASE_2_CLOSURE.md` |

---

*Baseline v1.0. Phase 0 complete — no changes applied. Ready for Phase 1 — Lint Quality.*
