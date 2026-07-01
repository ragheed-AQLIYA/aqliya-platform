# TECHNICAL DEBT REVIEW
**Independent Audit — AQLIYA Repository**
**Date:** 2026-06-25
**Classification:** Technical Due Diligence
**Auditors:** Staff Engineer · Technical Due Diligence Reviewer

---

## 1. Debt Inherited from Stabilization Program

The BUILD_STABILIZATION_REPORT (2026-06-04) acknowledged the following remaining items:

| ID | Priority | Item | Current State |
|----|----------|------|--------------|
| P3-001 | P3 | `middleware.ts` → `proxy.ts` migration (Next.js 16) | Not done |
| P3-002 | P3 | Sentry deprecation + source map upload | Not done |
| P3-003 | P3 | 158 ESLint warnings in Sales vnext (hidden with `--quiet`) | Not resolved — directory intact |
| P3-004 | P3 | Distributed rate limiting (middleware per-instance memory only) | Not done |

The stabilization report additionally claimed TypeScript compilation passes. **That claim is false as of 2026-06-25.** 63 real parse errors exist across the canonical AI module, authorization, knowledge, and sales layers.

---

## 2. Orphaned Working Artifacts

**FINDING: MEDIUM — Confirmed**

The following files are committed to the repository root and should not be in version control:

| File | Size | Nature |
|------|------|--------|
| `.salesos-ts-errors.txt` | 118 KB | TypeScript error dump from a prior SalesOS development session |
| `.salesos-missing-modules.txt` | 1.5 KB | Missing module list from a prior session |
| `.salesos-vnext-errors.txt` | 30 KB | vnext-specific TypeScript error dump |

These are working artifacts — session outputs from AI-assisted development that were committed to the repository. Their presence documents that the Sales layer had substantial unresolved TypeScript issues at the time of those sessions. The issues were documented but not fully resolved, and the documentation was not removed.

---

## 3. Incomplete Migrations

### 3.1 AI Module Migration (Ongoing, Broken)

The `src/lib/ai/` → `src/lib/core/ai/` migration has been in progress since at least the `feat(core): consolidate AI engine and memory under core/` commit. Current state:

- 23 production files still import from `@/lib/ai`
- The shim's own provider index and runtime index contain parse errors
- No CI gate enforces canonical import paths
- No migration completion date is declared anywhere

**Debt classification:** MEDIUM — elevated to MEDIUM-HIGH because the shim is broken, not just deprecated. Any new feature written using the legacy path will encounter runtime failures even if it appears correct.

### 3.2 Sales Layer Version Consolidation (No Plan)

Three parallel Sales implementations exist simultaneously:
- `src/lib/sales/` — primary library (~50 top-level files)
- `src/lib/sales/vnext/` — experimental next-gen
- `src/lib/sales/v02/` — second evolution pass (corrupted files)

No deprecation notices in code, no ADR documenting the consolidation path, no issue tracker reference. Developers working on Sales have no authoritative answer to "which directory do I modify?"

**Debt classification:** HIGH

### 3.3 `middleware.ts` → `proxy.ts`

Next.js 16.2 deprecates `middleware.ts` in favor of `proxy.ts`. Not yet migrated. Migration requires auth/runtime/API re-test.

**Debt classification:** LOW — not blocking, will become breaking in a future Next.js major version.

---

## 4. Platform Contract Stubs

**FINDING: HIGH — Confirmed, active production issue**

`src/products/sales/core-adapters/` contains stubs for platform contracts that do not exist in the codebase:

| Stub Function | Contract (Missing) | Active Behavior |
|--------------|-------------------|----------------|
| `recordAuditEventSafe()` | `@/lib/platform/contracts/audit-trail-runtime` | noop — silently discards audit events |
| `getOutputsByProduct()` | `@/lib/platform/output/engine` | returns `[]` — no outputs found |
| `getRequiredApprovalForOutput()` | `@/lib/platform/output/engine` | returns `false` — approval never required |
| `registerOutputQueueEntry()` | `@/lib/platform/operations/unified-output-queue` | returns `"todo-registered"` — no real registration |

These stubs are not commented out or feature-flagged. They are called by production code paths in `syncSalesOutputToCore()`. In a live SalesOS deployment:

- Opportunity outputs are never registered in the platform output queue
- Approval workflow is bypassed (approval never required returns false)
- SalesOS-specific audit events above the local ledger are silently discarded

---

## 5. Schema Drift

CLAUDE.md documents `R-04: SalesOS schema drift`. The 234-model Prisma schema is comprehensive. However:

- The generated Prisma client (`node_modules/.prisma/client/index.d.ts`) has a parse error at line 448,669 — possible schema or generation corruption
- `src/lib/sales/prisma-repository.ts` has a file-level `eslint-disable @typescript-eslint/no-explicit-any` — consistent with type mismatches between schema and application types
- `src/lib/sales/types.ts` has a TypeScript parse error (TS1005 at line 559) — Sales types module cannot compile

---

## 6. Line Ending and Encoding Debt

**FINDING: HIGH**

14 TypeScript source files are detected as binary by filesystem tools due to null bytes, mixed CRLF+CR endings, or Unicode special characters in unexpected positions. No `.gitattributes` file is present to enforce line ending normalization.

Root cause: The AQLIYA repository is developed on Windows machines (CRLF) and Linux CI (LF). Without `.gitattributes`, every Windows commit risks encoding corruption. This issue will recur until `*.ts text eol=lf` is enforced in `.gitattributes`.

---

## 7. CI Gaps as Structural Debt

| Missing CI Check | What It Allows | Remediation Cost |
|-----------------|---------------|-----------------|
| `npm audit` with threshold | Known CVEs ship | Low — 1 line in ci.yml |
| Gitleaks secret scan | Committed secrets | Low — config already exists |
| Import path guard (no `@/lib/ai`) | Migration regressions | Low — grep step in CI |
| Line ending check | Encoding corruption recurrence | Low — `.gitattributes` |
| AI eval gate (blocking) | AI quality regressions | Medium — requires eval harness |
| Distributed rate limit | DoS on multi-instance | High — requires Redis wiring |

---

## 8. Debt Register Summary

| Item | Classification | Severity | Production Impact |
|------|---------------|----------|-------------------|
| 14 corrupted source files | Active defect | Critical | TypeScript compilation broken |
| 63 TypeScript parse errors | Active defect | Critical | Build cannot pass |
| `src/lib/core/index.ts` corrupted | Active defect | Critical | Canonical registry non-functional |
| SALESOS_PLACEHOLDER no-ops | Active defect | High | SalesOS audit/output/approval broken |
| Sales 3 parallel versions | Structural debt | High | Undefined ownership; maintenance risk |
| AI module migration incomplete | Structural debt | Medium | 23 legacy importers; broken shim |
| No CI security scanning | Process debt | High | CVEs and secrets undetected |
| No `.gitattributes` | Process debt | High | Encoding corruption will recur |
| Middleware deprecation | Structural debt | Low | Future breaking change |
| Per-instance rate limiting | Operational debt | Medium | Effective per-IP limits less than declared |

**Verdict: The technical debt picture worsened after the stabilization program, primarily due to corrupted files that appeared in subsequent commits. Debt that was P3 (theoretical/cosmetic) when the stabilization report was written is now active compilation failure. The debt register needs to be reset with the corrupted files as the new P0.**
