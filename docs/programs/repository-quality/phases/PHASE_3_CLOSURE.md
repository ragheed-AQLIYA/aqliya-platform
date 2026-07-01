---
title: "Repository Quality — Phase 3 Closure: Maintainability"
status: completed
program: "Repository Quality"
phase: 3
version: "1.0"
date: 2026-06-29
author: OpenCode
classification: phase-closure
supersedes: none
---

# Phase 3 — Maintainability

**Status:** ✅ COMPLETE  
**Start:** 2026-06-29 | **Finish:** 2026-06-29

**Principle:** Read-only analysis. No file modifications, deletions, or restructuring.

---

## 1. Objective

Analyze four dimensions of repository maintainability without making changes:

1. **Knowledge Map Freshness** — Are architecture/taxonomy/status docs accurate?
2. **Dead Files Inventory** — Which files are not imported anywhere?
3. **Duplicate Detection** — Where is code duplicated across the codebase?
4. **Import Consistency** — Are import patterns consistent and correct?

---

## 2. Knowledge Map Freshness

### Documents Analyzed

| Document | Status | Issues Found |
|----------|:------:|:------------:|
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | ✅ Read | 1 stale rating |
| `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | ✅ Read | 1 stale rating |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | ✅ Read | 1 stale claim |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | ✅ Read | **Critical: duplicate rules** |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | ✅ Read | Clean |
| `docs/official/aqliya-core-architecture-v1.1.md` | ✅ Read | 2 stale "not implemented" claims |

### Issues Found

#### Critical

| # | Document | Issue | Location |
|---|----------|-------|----------|
| **KM-1** | `ROUTE_STRATEGY.md` | Rules 17 and 18 are duplicated **3 times each** — copy-paste error during merge conflict resolution | Lines 452–461 |

#### High (stale status claims)

| # | Document | Stale Claim | Current Reality |
|---|----------|-------------|-----------------|
| **KM-2** | `AQLIYA_ARCHITECTURE.md` | SalesOS listed as "prototype" | SalesOS is L5 Pilot-ready (per ROUTE_STRATEGY.md) |
| **KM-3** | `AQLIYA_SYSTEM_TAXONOMY.md` | Institutional Memory rated L3 | Institutional Memory is L5 Pilot-ready |
| **KM-4** | `PRODUCT_STATUS_MATRIX.md` | Organizations described as "mock-only" | Organizations is now L5 with real Prisma data |
| **KM-5** | `aqliya-core-architecture-v1.1.md` | Institutional Memory and Model Governance listed as "not implemented" | Both are now implemented (IM at L5, MG at L0–L4) |

#### Low

| # | Document | Issue |
|---|----------|-------|
| **KM-6** | `aqliya-core-architecture-v1.1.md` | References `src/lib/sunbul/` — this directory may no longer exist |
| **KM-7** | `AQLIYA_ARCHITECTURE.md` | `/intelligence` route group missing from route overview diagram |

### Summary: 1 critical, 4 high, 2 low issues across 6 documents.

---

## 3. Dead Files Inventory

### Methodology

Searched all import statements, barrel re-exports, and `@/` path alias references across the entire repository. Excluded test files (`__tests__/`), barrel/index files, and route files from the dead candidate list.

### 3.1 Truly Orphaned Directories

These directories contain **33 files** that are **not imported by any other file in the repository**:

#### `src/account/` (8 files)

| File | Type |
|------|------|
| `src/account/domain/account.ts` | DDD domain model |
| `src/account/domain/errors.ts` | Error types |
| `src/account/domain/events.ts` | Domain events |
| `src/account/domain/index.ts` | Barrel |
| `src/account/domain/repository.ts` | Repository interface |
| `src/account/domain/value-objects.ts` | Value objects |
| `src/account/infrastructure/in-memory-repository.ts` | In-memory implementation |
| `src/account/domain/__tests__/account.test.ts` | Tests |

**Likely:** Abandoned DDD experiment. The engagement module has its own `account` sub-module at `src/engagement/domain/engagement.ts` that may have superseded this.

#### `src/engagement/` (11 files)

| File | Type |
|------|------|
| `src/engagement/domain/engagement.ts` | DDD domain model |
| `src/engagement/domain/errors.ts` | Error types |
| `src/engagement/domain/repository.ts` | Repository interface |
| `src/engagement/infrastructure/in-memory-repository.ts` | In-memory implementation |
| `src/engagement/workflow/orchestrator.ts` | Workflow orchestrator |
| `src/engagement/workflow/sla.ts` | SLA definitions |
| `src/engagement/actions.ts` | Actions |
| `src/engagement/audit.ts` | Audit |
| `src/engagement/domain/__tests__/engagement.test.ts` | Tests |
| `src/engagement/domain/__tests__/repository.test.ts` | Tests |
| `src/engagement/__tests__/engagement-flow.test.ts` | Tests |

**Likely:** Abandoned DDD experiment. AuditOS has its own engagement management in `src/lib/audit/` that is actively used.

#### `src/core/` (9 files)

| File | Type |
|------|------|
| `src/core/access/abac-gate.ts` | ABAC gate |
| `src/core/access/abac-shadow-report.ts` | Shadow report |
| `src/core/audit/audit-ledger-prisma.ts` | Audit ledger |
| `src/core/audit/types.ts` | Audit types |
| `src/core/evidence/evidence-store-prisma.ts` | Evidence store |
| `src/core/evidence/evidence-store.ts` | Evidence store interface |
| `src/core/evidence/types.ts` | Evidence types |
| `src/core/output/index.ts` | Output barrel |
| `src/core/product-runtime.ts` | Product runtime |

**Likely:** Early prototype of the Core that was later relocated to `src/lib/core/`. The `src/core/` files were never cleaned up.

#### `src/products/` (5 files)

| File | Type |
|------|------|
| `src/products/sales/core-adapters/audit-adapter.ts` | Sales adapter |
| `src/products/sales/core-adapters/evidence-adapter.ts` | Evidence adapter |
| `src/products/sales/core-adapters/index.ts` | Barrel |
| `src/products/sales/core-adapters/output-adapter.ts` | Output adapter |
| `src/products/sales/product-definition.ts` | Product definition |

**Likely:** Early product-adapters prototype, superseded by `src/lib/sales/` and `src/lib/core/` architecture.

### 3.2 Backward-Compatible Wrappers (Intentional, ~55 files)

The directory `src/lib/ai/` contains ~55 files that are **backward-compatible re-exports only** — every file re-exports from `src/lib/core/ai/`:

```typescript
// Pattern:
/**
 * Backward-compatible re-export. Canonical implementation at @/lib/core/ai/...
 * New code should import from @/lib/core/ai/... directly.
 */
export * from "@/lib/core/ai/...";
```

These are intentional but represent a **maintenance tax** — any developer could accidentally modify the old file thinking it's the source of truth.

### 3.3 Potentially Dead Individual Files

~250+ files in `src/lib/` appear not to be imported outside their parent directory. **However, this scan is noisy** — barrel files using `export *` patterns, JSON data files, and sibling-directory imports may not be detected by simple string matching.

**NOTE:** No files are recommended for deletion without explicit approval per charter scope.

### Summary: 33 truly orphaned files, ~55 intentional wrappers, ~250+ unverified candidates.

---

## 4. Duplicate Detection

### 4.1 Dual AI Structure (55 Exact Duplicate Filenames)

| Directory | Role | Files |
|-----------|------|:-----:|
| `src/lib/ai/` | Old backward-compat wrappers | ~55 files |
| `src/lib/core/ai/` | Canonical implementations | ~55 files |

Every file in `src/lib/ai/` has an identically-named counterpart in `src/lib/core/ai/`. The old files are re-export wrappers only, but the duplication creates maintenance risk.

### 4.2 Duplicate Type Names

| Type | Occurrences | Risk |
|------|:-----------:|:----:|
| `RiskLevel` | 5 | Low — shared concept |
| `IcpFitStubResult` | 4 | **Medium — copy-paste stub** |
| `IcpFitStubAccountInput` | 4 | **Medium — copy-paste stub** |
| `DomainError` | 3+ | Low — standard pattern |
| `ReviewDecision` | 3+ | Low — shared concept |
| `SLAStatus` | 3+ | Low — shared concept |
| `ConfidenceLevel` | 3+ | Low — shared concept |
| `EvidenceStatus` | 3+ | Low — shared concept |
| 12+ other types | 3+ each | Low — all shared domain concepts |

The `IcpFitStub*` types are likely copy-paste artifacts from SalesOS v0.2 exploration code and deserve consolidation.

### 4.3 Same-Named Files Across Directories

| Filename | Occurrences | Risk |
|----------|:-----------:|:----:|
| `services.ts` | 7 | Low — expected per-domain pattern |
| `types.ts` | 17+ | Low — expected per-domain pattern |
| `index.ts` | 100+ | Low — barrel files, expected |
| `utils.ts` / `*helper*` | ~5 | Low — scattered utilities |

No unexpected naming collisions detected beyond the dual AI structure.

---

## 5. Import Consistency

### 5.1 What Passes

| Check | Result |
|-------|--------|
| Prisma imports in client components | ✅ **Zero violations** |
| Filesystem imports in components | ✅ **Zero violations** |
| Mixed import styles in same directory | ✅ **Consistent** |
| Core barrel file completeness | ✅ **Complete** — all 12 modules exported |
| Core sub-barrel completeness | ✅ **All verified** |

### 5.2 What Requires Attention

The dual AI import paths (`@/lib/ai/` vs `@/lib/core/ai/`) create ambiguity — new developers may not know which to use. This is the only import consistency issue.

---

## 6. Large Files (Top 10 by Lines)

| Lines | File | Notes |
|:-----:|------|-------|
| 3,473 | `src/lib/audit/db/index.ts` | **Largest file** — likely a DB barrel that grew organically |
| 2,418 | `src/lib/audit/mock-data.ts` | Mock data — naturally large |
| 1,804 | `src/lib/audit/services.ts` | Audit services — may benefit from splitting |
| 1,673 | `src/actions/audit-actions.ts` | Server actions — naturally long |
| 1,673 | `src/lib/sales/seed-data.ts` | Seed data — naturally large |
| 1,515 | `src/actions/decisions.ts` | Server actions — naturally long |
| 1,255 | `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | **Page component** — may mix UI + logic |
| 1,230 | `src/actions/localcontent-actions.ts` | Server actions — naturally long |
| 1,198 | `src/components/audit/evidence/evidence-page.tsx` | **UI component** — large render |
| 1,173 | `src/app/local-content/settings/integrations/page.tsx` | **Page component** — large |

6 files exceed 1,500 lines. The 3,473-line `src/lib/audit/db/index.ts` is the most urgent candidate for splitting.

---

## 7. Maintainability Scorecard

| Dimension | Score | Notes |
|-----------|:-----:|-------|
| Knowledge Map Freshness | ⚠️ **5 stale** (1 critical, 4 high) | ROUTE_STRATEGY.md has duplicate rules; 3 docs have stale L ratings |
| Dead Files | ⚠️ **33 orphaned** + ~55 intentional wrappers | 4 abandoned directories + dual AI tax |
| Duplicate Code | ⚠️ **55 dual-AI wrappers** + 2 stub types | Intentional but costly |
| Import Consistency | ✅ **Clean** | No violations found |

### Priority Recommendations (read-only, for decision)

| Priority | Action | Effort | Impact |
|----------|--------|:------:|:------:|
| P0 | Fix ROUTE_STRATEGY.md duplicate rules (KM-1) | ~5 min | Prevents reader confusion |
| P1 | Update 4 stale doc ratings (KM-2 to KM-5) | ~15 min | Restores doc accuracy |
| P2 | Remove orphaned `src/account/`, `src/engagement/`, `src/core/`, `src/products/` | ~30 min | Eliminates 33 dead files |
| P3 | Clean up dual AI wrappers — migrate all imports to `@/lib/core/ai/` then delete `src/lib/ai/` | ~2 hr | Eliminates 55-file maintenance tax |
| P4 | Consolidate `IcpFitStub*` duplicate types | ~15 min | Reduces type confusion |
| P5 | Split `src/lib/audit/db/index.ts` (3,473 lines) | ~1 hr | Improves maintainability |

**NOTE:** Per charter, no actions are taken without explicit approval. This is an inventory only.

---

## 8. Validation

| Check | Result |
|-------|--------|
| Analysis Scope | ✅ Read-only — no files modified |
| Charter Compliance | ✅ No deletions, no restructuring, no barrel creation |
| Data Integrity | ✅ All findings verifiable via grep and import tracing |

---

## 9. Handoff to Program Closure

Phase 3 is complete. The Repository Quality program has delivered:

| Phase | Deliverables |
|:-----:|--------------|
| **0** | `BASELINE_REPORT.md` — comprehensive quality baseline |
| **1** | `PHASE_1_CLOSURE.md` — lint quality classification, 6 errors eliminated, 458 warnings categorized |
| **2** | `PHASE_2_CLOSURE.md` — test quality matrix, 3 failures fixed, 21 skipped tests documented |
| **3** | `PHASE_3_CLOSURE.md` — maintainability analysis, stale docs, dead files, duplicates, import health |

No further quality phases are planned.

---

*Phase 3 closure v1.0. Completed 2026-06-29.*
