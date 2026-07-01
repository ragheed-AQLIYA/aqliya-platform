# DUPLICATION REPORT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Glob, grep, directory analysis — AST diff **NOT RUN**

---

## Executive Summary

Duplication clusters in **SalesOS** (version sprawl + Windows copies), **cross-product signal engines** (v02 vs _v02), **AI provider factories**, and **documentation** (1,735 markdown files with overlapping authority).

---

## 1. File-Level Duplicates (Exact Copy Artifacts)

**Pattern:** `filename (1).ext`  
**Count:** 20 files (glob verified)

| Domain | Count | Paths |
|--------|------:|-------|
| SalesOS lib | 15 | `src/lib/sales/**/(1).ts` |
| AI lib | 2 | `governed-ai-metadata`, `intelligence-runtime` |
| Server actions | 2 | `sales-icp-actions`, `sales-review-list-actions` |
| Public assets | 1 | `symbol (1).svg` |

**Evidence:** Windows Explorer copy naming; not imported by convention.

**Recommendation:** Delete all `(1)` files after confirming canonical sibling exists.

---

## 2. SalesOS Version Sprawl

| Tree | File count (approx) | Evidence |
|------|--------------------:|----------|
| `src/lib/sales/` total | 358 | Phase 3 subagent |
| `sales/v02/cross-product-signals/` | Present | TODO markers |
| `sales/_v02/cross-product-signals/` | Present | **Mirror structure** |
| `sales/vnext/` | Present | Active vnext tests |

**Duplicated modules (structural mirror — NOT VERIFIED byte-identical):**

| Module | v02 path | _v02 path |
|--------|----------|-----------|
| aggregator.ts | ✓ | ✓ |
| patterns.ts | ✓ | ✓ |
| from-sales-intelligence.ts | ✓ | ✓ |
| types.ts | ✓ | ✓ |

**TODO duplication:** Same 4 TODOs in both aggregators (grep verified).

---

## 3. AI Provider / Runtime Duplication

| File | Path | Notes |
|------|------|-------|
| Provider factory | `src/lib/ai/provider-factory.ts` | Present |
| Alternate factory | `src/lib/ai/providers/index.ts` | NOT fully opened |
| Intelligence runtime dup | `intelligence-runtime.ts` + `(1).ts` | Copy artifact |
| Governed metadata dup | `governed-ai-metadata.ts` + `(1).ts` | Copy artifact |

**Prior audit (code-health-report):** Multiple provider factory patterns — **PARTIALLY VERIFIED**.

---

## 4. DecisionOS Dual Route Trees

| Tree | Location | Pages |
|------|----------|------:|
| Dashboard decisions | `src/app/(dashboard)/decisions/` | ~15+ sub-pages |
| Legacy decision | `src/app/decision/` | 9 files |

**Impact:** Parallel UX/workflow paths — functional duplication risk.

---

## 5. Workflow Legacy Duplication

| System | Paths |
|--------|-------|
| WorkflowOS | `src/app/workflowos/`, `src/lib/workflowos/` |
| Sunbul alias | `src/app/sunbul/`, redirects in `next.config.mjs` |
| Org legacy | `src/app/organizations/sunbul/` |

---

## 6. Documentation Duplication

| Type | Count | Evidence |
|------|------:|----------|
| Total markdown | 1,735 | DOCUMENT_INDEX generation |
| Theoretical reference | 352 | Overlaps product specs |
| Archive | 227 | Supersedes active docs if cited wrongly |
| Parallel audit reports | 69+ in `docs/audits/` | Multiple reality audits |

**Authority duplication:**

| Topic | Conflicting docs |
|-------|------------------|
| SalesOS status | Master ref, README, PRODUCT_STATUS_MATRIX |
| Build health | Phase 7 matrix vs build-audit 2026-06-17 |
| Local AI | Master ref vs ADR-001 vs code |

**Release decision duplicates:**

- `docs/audits/RELEASE_DECISION.md`
- `docs/review/RELEASE_DECISION.md`

---

## 7. Config / Test Duplication

| Item | Evidence |
|------|----------|
| ESLint ignore list | Duplicate entries in `eslint.config.mjs` L48–68 (decision paths repeated) |
| Jest + Cypress | Both present — complementary, not duplicate |
| Backup runbooks | `docs/operations/backup-restore-procedure.md` + `runbooks/backup-restore.md` — **NOT VERIFIED** content overlap |

---

## 8. Prisma / Seed Duplication Risk

| Item | Evidence |
|------|----------|
| Large seeds | `prisma/seed-audit.ts` ~2500 lines (code-health) |
| Multiple seed scripts | `seed-local-content.ts`, domain seeds — NOT VERIFIED overlap |

---

## 9. Duplication Severity Matrix

| Cluster | Severity | Effort to consolidate |
|---------|----------|----------------------|
| `(1)` files | High noise | Low (1h) |
| v02 vs _v02 | High maintenance | Medium (3–5d) |
| Decision dual routes | Medium UX | Medium (2–3d) |
| Doc authority overlap | Medium commercial risk | Medium (ongoing) |
| AI provider factories | Low-Medium | Low (1–2d) |

---

## NOT VERIFIED

- Byte-level diff between v02 and _v02 files
- Full duplicate component detection in `src/components/`
- Duplicate server action logic across products
