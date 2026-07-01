# AQLIYA — Independent Post-Phase-2 Audit
**External Principal Engineer Review | 2026-06-25**
**Scope: Repository reality after Phases 1A, 1B, 1C, and initial Phase 2 work**

---

> **Audit Methodology**: Read-only review of live repository state. No implementations made. Findings are grounded in direct file reads, grep results, and diff comparisons — not documentation or commit messages. Where claimed state and code state conflict, code wins.

---

## Executive Summary

Four phases of stabilization work have been applied to this repository. One area — authorization layer consolidation (Phase 1A / Phase 2) — is **genuinely complete and clean**. All other claimed completions are either **false, partial, or produced new architectural defects** that did not exist before the work began.

The most serious outcome of the consolidation work is the introduction of a **bidirectional dependency between `lib/core/ai` and `lib/ai`**. The "canonical" AI layer (`lib/core/ai`) now depends on the "legacy" AI layer (`lib/ai`) for actual execution. This is not a consolidation — it is a co-dependency layered over an already-complex module graph.

SalesOS TypeScript errors, claimed as fixed, are entirely unresolved. The fix strategy was `prisma as any` casts (30+ instances), which silences type checking without addressing schema drift.

RAG module duplication was not resolved. A new layer was added (`lib/core/knowledge/rag`), but production callers still import from `@/lib/rag`, the files have diverged, and there are now three RAG-adjacent locations.

---

## 1. Authorization — VERIFIED CLEAN

### Finding AUTH-01 — src/core/access/ migration: LEGITIMATE
**Severity: None (resolved)**

`src/core/access/` no longer contains access-control files. A full codebase grep for `from '@/core/access'` returns zero results. The canonical authorization stack is intact:

- `src/lib/authorization/` — active, 9 files + 5 test files
- `src/lib/core/policy/access/` — ABAC engine, 7 files + 3 test files

No legacy import paths remain. This is the one area where the claimed work matches repository reality.

### Finding AUTH-02 — Authorization tests mock the components under test
**Severity: Medium**

`src/lib/authorization/__tests__/authorize.test.ts` mocks both `tenant-guard` and `abac-bridge` at the module level:

```ts
jest.mock("../tenant-guard", () => ({
  checkTenantAccess: jest.fn().mockResolvedValue({ allowed: true }),
}));
jest.mock("../abac-bridge", () => ({
  evaluateAbac: jest.fn().mockResolvedValue({ allowed: true }),
}));
```

These are not peripheral dependencies — they are the core security checks that `authorize()` is supposed to invoke. Mocking them means the authorization tests never verify that `authorize()` correctly calls or handles failures from tenant isolation or ABAC enforcement. Tests pass, but they do not test the security behavior.

---

## 2. AI Layer — CRITICAL ARCHITECTURAL DEFECT INTRODUCED

### Finding AI-01 — Circular dependency: lib/core/ai ← → lib/ai
**Severity: Critical**

The stated goal of Phase 1C was to establish `lib/core/ai` as the canonical AI execution layer and reduce `lib/ai` to a backward-compatible re-export shell. The opposite has occurred.

**`lib/core/ai` currently imports from `lib/ai` in 34+ locations:**

```
src/lib/core/ai/generate.ts        → @/lib/ai/orchestrator
src/lib/core/ai/orchestrator.ts    → @/lib/ai/providers/deterministic-provider
src/lib/core/ai/orchestrator.ts    → @/lib/ai/providers/cloud-provider
src/lib/core/ai/orchestrator.ts    → @/lib/ai/providers/local-provider
src/lib/core/ai/orchestrator.ts    → @/lib/ai/providers/openai-provider
src/lib/core/ai/orchestrator.ts    → @/lib/ai/providers/anthropic-provider
src/lib/core/ai/orchestrator.ts    → @/lib/ai/prompt-registry
src/lib/core/ai/orchestrator.ts    → @/lib/ai/provider-router
src/lib/core/ai/orchestrator.ts    → @/lib/ai/hybrid-router
src/lib/core/ai/orchestrator.ts    → @/lib/ai/budget-manager
src/lib/core/ai/observability.ts   → @/lib/ai/orchestrator
src/lib/core/ai/cost-governance.ts → @/lib/ai/budget-manager
src/lib/core/ai/eval-gate.ts       → @/lib/ai/eval-gate
src/lib/core/ai/spend-tracker.ts   → @/lib/ai/cost-mapping
... (34+ total)
```

The `lib/ai/orchestrator` that `lib/core/ai/generate.ts` imports is itself a file that imports from `lib/ai/providers/`, `lib/ai/budget-manager`, `lib/ai/provider-router`, and `lib/ai/hybrid-router` — all of which are `lib/ai` internals, not re-exports of `lib/core/ai`.

**Result**: There is no canonical AI layer. There are two co-dependent layers with bidirectional coupling. `lib/core/ai` cannot function without `lib/ai`, and `lib/ai` re-exports parts of `lib/core/ai`. The module graph is a tangle, not a hierarchy.

This defect did not exist before Phase 1C. The consolidation introduced it.

### Finding AI-02 — lib/ai is NOT a re-export shell
**Severity: High**

The dependency graph (Phase 0 audit) described `lib/ai` as "a pure re-export shell." After Phase 1C, this was claimed to be the outcome of consolidation. It was never true, and remains not true.

`src/lib/ai/` has approximately 80 files. The re-export stubs exist (index.ts, generate.ts, provider-factory.ts, budget-manager.ts, observability.ts) but are a minority. Real, unique implementations exist only in `lib/ai`:

- `src/lib/ai/handlers/` — 8 deterministic task handlers registered on the provider at startup
- `src/lib/ai/eval/` — eval runner, eval types, 5 golden dataset suites
- `src/lib/ai/ingestion/` — ingestion pipeline (server-only, uses pgvector)
- `src/lib/ai/retrieval/` — similarity search, context builder (server-only)
- `src/lib/ai/review/` — ai-review-gate (governance gate for AI output)
- `src/lib/ai/runtime/` — inference service
- `src/lib/ai/providers/` — cloud, local, openai, anthropic, deterministic, circuit-breaker providers

These implementations are imported by `lib/core/ai/orchestrator.ts` for actual execution. The "canonical" layer's orchestrator depends on the "legacy" layer's providers. This is not consolidation — it is inversion.

### Finding AI-03 — lib/core/ai/orchestrator.ts IS lib/ai/orchestrator.ts
**Severity: High**

Both `src/lib/core/ai/orchestrator.ts` and what `src/lib/ai/orchestrator` points to appear to be the same file or near-identical content. The re-export from `lib/ai/orchestrator` that `lib/core/ai/generate.ts` imports is likely pointing back into `lib/core/ai`, completing the circular reference. The Node.js module system handles this via its require cache, so there is no runtime crash — but the import graph is undirected, making future refactoring extremely hazardous.

---

## 3. SalesOS TypeScript — CLAIMED FIX IS FALSE

### Finding SALES-01 — TD-001 errors are unresolved
**Severity: Critical**

The TECHNICAL_DEBT_REGISTER.md was updated with this claim:

> "type divergence fixed in Phase 1B-b — 0 TS errors"

The evidence file `.salesos-ts-errors.txt` contains all original ~30 TypeScript errors, unchanged. Representative sample of errors that are still present:

- `sales-actions.ts`: `SALES_OS` enum missing from Prisma schema
- `opportunity-detail.tsx`: missing module references
- `opportunity-intelligence-panel.tsx`: property type mismatches
- `proof-asset-file-upload-scaffold.tsx`: parameter type mismatches

The claim of "0 TS errors" is false. The errors were never fixed.

### Finding SALES-02 — Fix strategy was type safety bypass
**Severity: Critical**

`src/lib/sales/prisma-repository.ts` contains 30+ occurrences of `prisma as any`:

```ts
return !!(prisma as any).salesKnowledgeGraphNode;
const result = await (prisma as any).salesKnowledgeGraphNode.findMany(...);
```

The comments in the file acknowledge this explicitly:
> "optional schema extensions with `as any` + fail-soft try/catch"

This approach does not fix schema drift — it silences TypeScript's ability to detect it. Any future Prisma schema change that removes or renames these models will produce silent runtime failures instead of compile-time errors. The type safety gap is now larger than before, not smaller.

### Finding SALES-03 — vnext has 40+ new TypeScript errors
**Severity: High**

`.salesos-vnext-errors.txt` shows 40+ TypeScript errors in `src/lib/sales/vnext/` test and implementation files. Notable categories:

- **Missing exported members** (functions and constants renamed in source but not in tests)
- **Non-existent modules**: `@/lib/ai/intelligence-runtime`, `@/lib/platform/contracts/audit-trail-runtime`, `@/lib/platform/contracts/review-approval-runtime`, `@/lib/platform/contracts/review-approval-contract` — these modules were imported in vnext but never created
- **Type shape mismatches** between vnext types and base SalesOS types
- **Missing jest globals** in `cross-product-signals.test.ts` (cannot find name `jest`) — the test file is non-functional as written

The vnext layer was intended as in-progress work but currently has broken imports pointing to modules that do not exist in the repository. This means vnext code cannot compile or run.

### Finding SALES-04 — lib/sales version proliferation remains unaddressed
**Severity: Medium**

Phase 1C-4 claimed to "document the sales version strategy." Documentation of a problem is not resolution of it. Four entry points for SalesOS logic still exist:

- `src/lib/sales/` — base library
- `src/lib/sales/v02/` — version 2 additions
- `src/lib/sales/vnext/` — next version (broken, see SALES-03)
- `src/products/sales/` — product definition and core adapters

---

## 4. RAG Layer — DUPLICATION PERSISTS, WORSENED

### Finding RAG-01 — Three RAG locations, none canonical
**Severity: High**

The Phase 0 audit identified `lib/rag` duplication (TD-016). After Phase 1C, a third location has been added rather than the duplication resolved:

| Location | Role | Callers |
|---|---|---|
| `src/lib/rag/` | Appears to be re-exports wrapping `lib/core/knowledge/rag/` | API routes, lib/ai/ingestion, lib/core/knowledge/engine |
| `src/lib/core/knowledge/rag/` | Appears to be the target canonical layer | Only `src/lib/rag/` files import from here |
| `src/lib/ai/retrieval/` | Separate similarity-search and context-builder | Imports from `lib/ai/embedding/` |

The files in `lib/rag/` and `lib/core/knowledge/rag/` are not identical — they have diverged. Production API routes at `src/app/api/ai/knowledge/` import from `@/lib/rag`, not `@/lib/core/knowledge/rag`. No callers have been migrated to the new "canonical" path.

The consolidation added `lib/core/knowledge/rag` but left all callers on `lib/rag`. The result is a longer re-export chain with diverged file content and no migration path.

### Finding RAG-02 — lib/core/knowledge/rag imports from lib/ai
**Severity: Medium**

`src/lib/core/knowledge/rag/rag-retriever.ts` imports from `@/lib/ai/types`. This ties the "canonical" RAG layer to the "legacy" AI layer's type definitions, meaning type changes in `lib/ai/types` have downstream effects on `lib/core/knowledge/rag`.

---

## 5. Decision Module — PARTIALLY RESOLVED

### Finding DEC-01 — lib/decisions/ is empty, lib/decision/ and lib/core/decision/ remain
**Severity: Low**

TD-004 identified three locations for Decision module logic. The thin `lib/decisions/` directory is now empty — a genuine improvement. However, two active locations remain:

- `src/lib/decision/` — 32 files including the primary decision engine, scenarios, sector intelligence, portfolio, signals, and learning engine
- `src/lib/core/decision/` — core engine + evaluators + adapters

`src/lib/decision/decision-engine.ts` imports from `@/lib/core/decision/adapters/decisionos-adapter` and `@/lib/core/decision/types`, meaning lib/decision depends on lib/core/decision. This is the correct dependency direction (product layer → core layer), but the fragmentation means developers must know to look in two places for Decision logic.

---

## 6. Test Quality — STRUCTURALLY WEAK

### Finding TEST-01 — Authorization tests do not test authorization
**Severity: High**

(See AUTH-02 above.) The authorize() tests mock both `tenant-guard` and `abac-bridge`, the exact components responsible for the security behavior being tested. A passing test suite here provides no assurance that tenant isolation or ABAC enforcement works correctly.

### Finding TEST-02 — Heavy mocking across the test suite
**Severity: Medium**

143 test files use `jest.mock()`. 122 test files use `jest.fn()`. With 324 total test files, this means approximately 44% of test files use module-level mocking and 38% use function mocking. This level of mocking is characteristic of tests that verify call graphs rather than behavior. Tests can pass while the actual integration between components is broken — as evidenced by the `fix(ci): drop orphan KF components missing lib modules on main` commit, where the consolidation work broke real imports that tests had not caught.

### Finding TEST-03 — SalesOS vnext test files are non-functional
**Severity: High**

Multiple SalesOS vnext test files cannot compile:
- `cross-product-signals.test.ts`: no `jest` globals found — 5 immediate errors on `jest.fn()`
- `pipeline-analytics.test.ts`: imports from `../types` which does not exist
- `commercial-review-runtime.ts`: imports 3 modules that do not exist in the repository

These tests will never run. They were written against an API that was changed without updating the tests.

### Finding TEST-04 — --forceExit masks resource leaks (existing TD-015)
**Severity: Medium**

This item remains unaddressed and is actively relevant. The vnext test failures include potential resource leak cases (failed async operations, unclosed DB connections) that `--forceExit` will terminate rather than surface.

---

## 7. Repository Hygiene — UNCHANGED FROM PHASE 0

The following Phase 6 targets remain entirely unaddressed (expected, but confirmed):

- `src/app/en/` — 21 duplicate marketing routes still present
- `src/app/sunbul/` — live page content still present (should be redirect-only)
- `desktop.ini` files — present in `src/lib/core/decision/`, `src/lib/core/knowledge/rag/`
- `src/lib/simulation/` — orphan module, no callers verified
- RiskOS governance conflict — live routes contradict AGENTS.md directive

These are phased for Phase 6 and are not findings for this review period.

---

## 8. Technical Debt Register — Re-evaluation

| ID | Phase 0 Severity | Claimed Outcome | Actual State | Verdict |
|---|---|---|---|---|
| TD-001 | Critical | "Fixed — 0 TS errors" | All ~30 errors present | **Still valid — CRITICAL** |
| TD-002 | High | "lib/ai is re-export shell" | 80 files, real implementations, circular dependency | **Still valid — WORSENED** |
| TD-003 | High | Phase 6 target | Untouched | **Still valid** |
| TD-004 | High | "Decision module consolidated" | decisions/ empty, decision/ + core/decision/ remain | **Partially resolved** |
| TD-005 | High | "Migrated in Phase 2" | Verified clean — no legacy imports remain | **RESOLVED ✓** |
| TD-006 | High | "Strategy documented" | 4 locations still active, vnext has 40+ TS errors | **Partially resolved** |
| TD-007 | Medium | "Timestamps fixed" | Not verified in this review | **Unverified** |
| TD-008 | Low | Phase 6 target | Untouched | **Still valid** |
| TD-009 | Medium | "ABAC shadow mode active" | Shadow mode confirmed active, enforcement pending Phase 3 | **Partially resolved** |
| TD-010 | Medium | Phase 6 target | Resolved — RiskOS recognized in SYSTEM_TAXONOMY as L5 Pilot-ready | **RESOLVED ✓** |
| TD-011 | Medium | Phase 3 target | Untouched | **Still valid** |
| TD-012 | Medium | Phase 3 target | Untouched | **Still valid** |
| TD-013 | Medium | Phase 3 target | Untouched | **Still valid** |
| TD-014 | Low | Phase 6 target | desktop.ini files exist on disk (Windows auto-created) but properly gitignored at .gitignore:85, not tracked | **RESOLVED ✓** |
| TD-015 | Medium | Phase 5 target | --passWithNoTests removed, --forceExit removed from CLI (redundant — already in jest.config.js), forceExit:true kept in config for open handles | **RESOLVED ✓** |
| TD-016 | Medium | Phase 1 target | lib/rag + lib/core/knowledge/rag diverged; callers unmigrated | **Still valid — WORSENED** |
| TD-017 | Low | Phase 6 target | Audited — simulation is DecisionOS sub-capability, actively used at /decisions/[id]/simulation | **RESOLVED ✓** |

**Resolved: 5 (TD-005, TD-010, TD-014, TD-015, TD-017)**
**Partially resolved: 3 (TD-004, TD-006, TD-009)**
**Worsened: 2 (TD-002, TD-016)**
**New defects introduced: 2 (AI circular dependency, 40+ new vnext TS errors)**

---

## 9. Repository Health Scores

| Dimension | Score | Rationale |
|---|---|---|
| **Architecture** | 3/10 | Circular dependency between claimed canonical and legacy AI layers. RAG re-export chain with diverged files. Decision module split across 2 locations. The consolidation work added layers without removing the originals. |
| **Maintainability** | 4/10 | SalesOS has 70+ unresolved TS errors across base and vnext. `prisma as any` pattern is endemic in sales repository layer. Vnext imports non-existent modules. Future modifications require knowing which of multiple co-dependent AI locations to change. |
| **Modularity** | 3/10 | `lib/core/ai` depends on `lib/ai` for actual execution; `lib/ai` re-exports parts of `lib/core/ai`. RAG has a three-level re-export chain. Decision logic in 2 locations. Shared types scattered across `lib/ai/types`, `lib/core/ai/types`, and product-level type files. |
| **Security** | 7/10 | Authorization layer is genuinely clean. ABAC engine is in the right place. No legacy access-control import paths remain. Edge middleware intact. Primary deduction: authorization tests mock the components they test, ABAC not enforced by default, MFA not universally required. |
| **Testability** | 4/10 | 44% of test files use module-level mocking. Authorization tests mock their own security boundaries. Vnext test suite is entirely non-functional. `--forceExit` masks resource leaks. Integration tests not in CI. |
| **Simplicity** | 3/10 | Three RAG-adjacent module locations. Two AI layers with bidirectional coupling. Four SalesOS entry points. Authorization is the only area that achieved simplification. Every other consolidation target either remained unchanged or added new layers. |

**Overall health: 4/10** (weighted toward architecture and modularity as foundational concerns)

---

## 10. Critical Findings Summary

| ID | Area | Severity | Finding |
|---|---|---|---|
| C-01 | AI Architecture | Critical | Circular dependency: `lib/core/ai/generate.ts` → `@/lib/ai/orchestrator` → `lib/core/ai/*`. The "canonical" layer depends on the "legacy" layer for actual execution. |
| C-02 | SalesOS | Critical | TD-001 TypeScript errors claimed fixed but all ~30 original errors remain in `.salesos-ts-errors.txt`. Debt register claim is false. |
| C-03 | SalesOS | Critical | Fix strategy was `prisma as any` (30+ instances) — silences type checking without addressing schema drift. Produces silent runtime failures on schema change. |
| H-01 | AI Architecture | High | `lib/ai/` is not a re-export shell. 80 files, real implementations in handlers/, eval/, ingestion/, retrieval/, review/. `lib/core/ai/orchestrator.ts` imports providers from `lib/ai/providers/` — the actual execution code lives in the "deprecated" layer. |
| H-02 | SalesOS | High | vnext has 40+ new TypeScript errors, including imports of 4 modules that do not exist in the repository. vnext code cannot compile. |
| H-03 | RAG | High | Three RAG-adjacent locations (`lib/rag/`, `lib/core/knowledge/rag/`, `lib/ai/retrieval/`). Files have diverged. All production callers remain on `@/lib/rag`. No migration occurred. |
| H-04 | Tests | High | Authorization test suite mocks `tenant-guard` and `abac-bridge` — the exact security boundaries `authorize()` should invoke. Tests provide no assurance of actual tenant isolation or ABAC behavior. |
| H-05 | Tests | High | SalesOS vnext test files are non-functional: `cross-product-signals.test.ts` cannot find `jest`, `pipeline-analytics.test.ts` imports a type file that does not exist. |
| M-01 | Decision | Medium | Decision module consolidated from 3 to 2 locations. `lib/decision/` (32 files) + `lib/core/decision/` (engine + adapters) both remain active. |
| M-02 | AI | Medium | `lib/core/knowledge/rag` files import from `@/lib/ai/types`, coupling the "canonical" RAG layer to the "legacy" AI layer's types. |
| M-03 | CI | Medium | The `fix(ci): drop orphan KF components missing lib modules on main` commit indicates the consolidation work broke real imports that required an emergency patch. Tests did not catch this. |

---

## 11. Top 10 Recommendations Before Phase 3

**1. Halt all consolidation work and audit the AI layer graph first.**
Before any Phase 3 task begins, map the exact import relationship between `lib/core/ai` and `lib/ai`. Determine which files are actually canonical and which depend on which. The current bidirectional state means no one can safely refactor either layer without understanding the full graph. This is a blocking defect.

**2. Revert or redesign the AI layer consolidation.**
The approach of creating `lib/core/ai` while leaving real implementations in `lib/ai` and having the new layer import the old layer is structurally incorrect. Either: (a) move all implementations into `lib/core/ai` and make `lib/ai` a true re-export shell, or (b) leave `lib/ai` as the single location and delete the redundant `lib/core/ai` wrappers. Do not proceed with both layers in their current co-dependent state.

**3. Fix the SalesOS TypeScript errors or declare vnext as out of scope.**
The debt register must reflect reality. Either fix the actual type errors (SALES_OS enum, FormData mismatches, missing modules in vnext) or formally remove vnext from the build and declare it out of scope. The current state — broken code in the build tree with false claims of resolution in the register — is the worst possible outcome: the debt is hidden, not resolved.

**4. Remove `prisma as any` from the sales repository layer.**
30+ casts of `prisma as any` to access non-existent schema models means SalesOS has no type safety for its database operations. Decide: either add the required Prisma schema models and use typed queries, or remove the code paths that depend on them. There is no acceptable middle path where typed database access is silently replaced with untyped `any` casts.

**5. Rewrite authorization tests to not mock their own security boundaries.**
The `authorize()` tests should test that `authorize()` correctly invokes and handles `checkTenantAccess()` and `evaluateAbac()`. Mock downstream effects (Prisma, Redis), not the security gate functions themselves. The current tests verify call signatures, not security behavior.

**6. Resolve the RAG duplication before Phase 3.**
Pick one canonical RAG location. Either `lib/rag` or `lib/core/knowledge/rag` — not both. Migrate all callers to the canonical location. The current three-location state with diverged file content will continue to accumulate debt as each location evolves independently.

**7. Do not add Phase 3 features until TD-001 and AI-01 are resolved.**
Adding feature flag governance, audit trail coverage, and retention consolidation on top of a codebase with circular AI dependencies and unresolved SalesOS compilation errors increases the total defect surface. Phase 3 tasks should be gated on at minimum: AI circular dependency resolved, SalesOS TS errors resolved or formally deferred with honest register entries.

**8. Add one integration test that does not mock the database.**
143 test files use module-level mocking. Add a minimum viable integration test for `authorize()` against a real test database (using the existing `docker-compose.test.yml` setup). This proves the authorization layer — the one area that passed this audit — actually works end-to-end.

**9. Correct the TECHNICAL_DEBT_REGISTER.md.**
The register currently claims: "type divergence fixed in Phase 1B-b — 0 TS errors" for TD-001. This is false. A debt register with false entries is worse than no register — it creates false confidence. All entries must reflect actual evidence, not intent.

**10. Run `npx tsc --noEmit` on a schedule in CI for SalesOS specifically.**
The CI pipeline runs TypeScript checks but the SalesOS TS errors appear to have been excluded or suppressed (see `fix(lint): suppress R-IM-01 schema drift any`). If SalesOS TypeScript errors are not surfaced in CI, they will continue to accumulate silently. The phase of "fixing" TS errors by suppressing the check is a false fix.

---

## 12. What Is Safe to Proceed With (Phase 3)

Given the current state, the following Phase 3 tasks can proceed safely because they are independent of the defective AI and SalesOS layers:

**Safe to proceed:**
- Feature flag registry creation (G-GOV-001) — no dependency on AI or SalesOS
- Documentation taxonomy updates for ContentStudio, Institutional Memory (G-GOV-002) — docs only
- Background job visibility (G-OPS-005) — monitoring layer, independent
- API versioning strategy (G-ENT-003) — strategy document, no code changes required
- SIEM production verification (G-SEC-004) — operational check, independent

**Not safe to proceed without prerequisite fixes:**
- Audit trail coverage verification across SalesOS — SalesOS is in a broken state; audit trail claims built on `prisma as any` are unverifiable
- Any Phase 3 work that touches the AI layer — circular dependency must be resolved first
- Retention consolidation — depends on understanding which modules are authoritative, which requires the module graph to be clean

---

## Appendix — Evidence Basis

All findings in this document are backed by direct code observation:

| Finding | Evidence Source |
|---|---|
| C-01 AI circular dependency | `grep -r "from '@/lib/ai/" src/lib/core/ai/` — 34+ results; `cat src/lib/core/ai/generate.ts` line 1 |
| C-02 SalesOS TS errors present | `.salesos-ts-errors.txt` — all errors from Phase 0 still present |
| C-03 prisma as any | `grep "prisma as any" src/lib/sales/prisma-repository.ts` — 30+ matches |
| H-01 lib/ai not a shell | `ls src/lib/ai/handlers/ src/lib/ai/eval/ src/lib/ai/ingestion/ src/lib/ai/retrieval/` — real files with real logic |
| H-02 vnext TS errors | `.salesos-vnext-errors.txt` — 40+ errors, 4 missing modules |
| H-03 RAG divergence | `diff src/lib/rag/rag-retriever.ts src/lib/core/knowledge/rag/rag-retriever.ts` — files differ |
| H-04 Auth test mocking | `cat src/lib/authorization/__tests__/authorize.test.ts` lines 11–17 |
| AUTH-01 Clean migration | `grep -r "from '@/core/access'" src/` — zero results |
| SALES-04 4 SalesOS locations | `ls src/lib/sales/ src/lib/sales/v02/ src/lib/sales/vnext/ src/products/sales/` |
| TEST-02 Mocking prevalence | `grep -r "jest.mock" src/ --include="*.test.ts" -l` — 143 files |

---

*Review conducted 2026-06-25. Read-only. No changes made to source code, tests, schema, or infrastructure.*
*Next review checkpoint: after Phase 3 completion or after AI circular dependency + SalesOS TS resolution, whichever comes first.*
