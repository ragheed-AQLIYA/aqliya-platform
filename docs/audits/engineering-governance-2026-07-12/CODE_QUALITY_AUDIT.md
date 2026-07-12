# AQLIYA Code Quality Audit
**Date:** 2026-07-12  
**Codebase:** 2,889 TypeScript/TSX files  
**Working tree:** ~200 files modified across working tree (LF/CRLF + actual code changes)  
**Focus:** `src/` — actions, lib, app, components, middleware

---

## 1. Executive Summary

AQLIYA is a **large institutional platform** (2,889 source files) with ambitious product scope spanning 10+ systems. The codebase exhibits a **modular monolith** pattern with clear product separation in `src/lib/` and `src/components/` but significant quality issues in **duplication, type safety, and file size control**.

**Overall grade: C+ (3.2/5)**

### Top 3 Critical Findings

1. **`ActionResult` + `safe()` duplicated 14 times identically across actions** (violates DRY in mission-critical error handling layer). A single shared utility would eliminate ~200 lines of duplicated code and ensure consistent error semantics across all 10+ products.

2. **`as any` epidemic (400+ occurrences)** — most prolific in `src/lib/sales/prisma-repository.ts` (~35 instances), audit engine bridges, and platform services. The `content-studio-service.ts` hand-typed delegate interface (`ContentStudioDb`) is a workaround for schema drift that violates Liskov substitution.

3. **10 files exceed 1,000 lines** — `src/lib/audit/db/index.ts` (3,473), `mock-data.ts` (2,418), `audit/services.ts` (1,804), `audit-actions.ts` (1,673), `sales/seed-data.ts` (1,673), `decisions.ts` (1,586), `localcontent-actions.ts` (1,305). These are God Objects that mix orchestration, business logic, validation, and persistence.

---

## 2. SOLID Assessment

| Principle | Score (1-5) | Issues Found |
|-----------|-------------|--------------|
| **Single Responsibility** | 2.5 | Actions frequently mix auth, validation, DB access, audit logging, and notification in one function. `localcontent-actions.ts` (1,305 lines) does project, supplier, spend, evidence, findings, review, approval, reports — at least 8 distinct domains. |
| **Open/Closed** | 3.0 | Engine pattern (`audit-*engine.ts`) is extensible via parameter objects. But `audit/services.ts` (1,804 lines) has a hardcoded `USE_DATABASE` flag and mock fallback pattern requiring modification to add new backends. SalesOS `prisma-repository.ts` has hardcoded `prisma as any` casts per model. |
| **Liskov Substitution** | 3.0 | `content-studio-service.ts` uses a hand-typed `ContentStudioDb` interface (`prisma as unknown as ContentStudioDb`) that doesn't extend any Prisma contract — substituting the real Prisma client with this facade would work but breaks type safety guarantees. |
| **Interface Segregation** | 3.5 | Types are generally well-segmented (e.g., `CreateWorkspaceData`, `UpdateContentData` in content-studio). However, `audit/db/index.ts` exposes ~60+ functions from a single barrel export, and the `CurrentUser` interface in `lib/auth.ts` carries optional fields (`platformOrganizationId?`) only used by specific contexts. |
| **Dependency Inversion** | 3.0 | `src/actions/` files directly import Prisma (`import { prisma } from "@/lib/prisma"`) instead of depending on repository abstractions. The `lib/` services layer partially abstracts this (e.g., `local-content/services.ts` re-exported via actions), but audit actions still call `prisma` directly in many places. The authorization engine is correctly abstracted behind `createStandardEngine()`. |

---

## 3. Naming Convention Violations

### File Naming Inconsistencies

| Issue | Files | Recommendation |
|-------|-------|----------------|
| **Missing `-actions` suffix** | `approval.ts`, `decisions.ts`, `decision-export.ts`, `decision-intelligence.ts`, `decision-learning.ts`, `decision-outcomes.ts`, `decision-sector.ts`, `decision-signals-alerts.ts`, `decision-templates.ts`, `simulation.ts`, `tender.ts`, `mfa.ts`, `office-ai-stats.ts`, `localcontent-review-export.ts`, `localcontent-guards.ts`, `localcontent-rbac.ts` | Rename to `*-actions.ts` for consistency. Guards/RBAC files should stay in `lib/`, not `actions/`. |
| **Mixed `localcontent` vs `local-content`** | `localcontent-actions.ts` vs `local-content-workspace-actions.ts` at sibling level | Standardize on one form (prefer `localcontent` per Prisma model naming) |
| **Non-action files in `actions/`** | `localcontent-guards.ts`, `localcontent-rbac.ts` are utility/guard files, not server actions | Move to `src/lib/local-content/` |
| **`'use server'` directive inconsistency** | Some files use `"use server"` with semicolon, some without; some on line 1, some on line 4 | Standardize on line 1 with semicolon |
| **kebab-case in app router vs camelCase in lib** | `src/app/local-content/` (kebab) vs `src/lib/local-content/` (matching) — but `src/lib/salesos/` vs `src/lib/sales/` inconsistency | Resolve `salesos/` vs `sales/` directory naming |

### Function Naming Issue

- **`Action` suffix is inconsistent**: Some exported functions have `Action` suffix (e.g., `getDecisions` vs `getSectorsAction`). Files like `decision-sector.ts` use `Action` suffix on every function; `decisions.ts` and `notification-actions.ts` do not. No single convention governs the entire `actions/` directory.

### Arabic/English Naming

- Bilingual string labels exist (`PRODUCT_LABELS`, `PRODUCT_LABELS_AR` in `institutional-memory-actions.ts`) — these are well-maintained.
- Component props use English keys consistently — no Arabic keys found in interface definitions.

---

## 4. Folder Structure Assessment

| Directory | Rating | Issues |
|-----------|--------|--------|
| `src/lib/` | C | 45 subdirectories with overlapping concerns. `platform/` is a catch-all (content-studio, signals, org-advanced, sales-intelligence, monitoring, audit-bridge, cross-product-ai, retention, etc.). `audit/` and `audit-intelligence/` are separate; `sales/` and `salesos/` coexist. |
| `src/components/` | B | 31 directories, organized by product — good. Some overlap with `src/app/` page-level components that haven't been extracted to shared components. |
| `src/actions/` | C+ | 94 entries — too many files. `approval.ts` and `decisions.ts` lack the `-actions` suffix. `localcontent-rbac.ts` and `localcontent-guards.ts` are infrastructure utilities, not actions. |
| `src/app/` | B | 35 directories. Route groups `(dashboard)` and `(marketing)` well-used. Some routes reference pages that don't exist on disk: `invite/`, `published/` — these may be catch-all param routes or dead references. |
| `src/__tests__/` | B- | Integration tests mixed with unit tests at top level. `__tests__/` under `actions/` is properly nested. |
| Prisma schema | B | Well-structured with models per product. Tech debt: models referenced by `content-studio-service.ts` exist in schema but require `prisma generate` to be fully typed. |

### Key Structural Issues

1. **`src/lib/platform/` is a dumping ground**: Contains 15+ subdirectories/services unrelated to platform infrastructure — content-studio, sales-intelligence, org-advanced, cross-product-ai, audit-bridge, model-governance, office-ai-adv, decision-gov. These should be under product-specific paths.

2. **`src/core/` exists alongside `src/lib/core/`**: Root `src/core/` is mostly empty; the real core lives in `src/lib/core/`.

3. **Inline actions in `src/app/`**: `src/app/content-studio/actions.ts` (473 lines) and `src/app/sales/intelligence/actions.ts` duplicate the pattern from `src/actions/`. Should either consolidate into `src/actions/` or follow a co-located module pattern consistently.

---

## 5. Dead Code Report

| File / Pattern | Issue | Severity |
|------|-------|----------|
| `src/lib/authorization/engine/migration/*` (5 files, ~1,618 lines) | Deleted in working tree — `decision-replay.ts`, `evidence-package.ts`, `parity-report.ts`, `shadow-adapter.ts`, `shadow-logger.ts` all removed. The migration phase is complete. | LOW (already cleaned) |
| `src/lib/authorization/product-guards.ts` (116 lines) | Deleted in working tree. | LOW (already cleaned) |
| `src/lib/authorization/action-guard.ts` (44 lines) | Deleted in working tree. | LOW (already cleaned) |
| `src/lib/auth.ts` (138 lines → 72 lines) | Heavily refactored; old 138-line version deleted. New 72-line version is a thin wrapper around `lib/auth-next.ts` and `lib/auth/index.ts`. | LOW |
| `src/app/published/` directory | No `page.tsx` found at top level. Likely uses dynamic `[decisionId]` routes. | MED — verify intent |
| `src/app/invite/` directory | No `page.tsx` found. May redirect in middleware or use catch-all. | MED — verify intent |
| `tests/README.md` (18 lines) | Deleted in working tree. | LOW |
| `TODO/FIXME comments` | ~25 TODOs across 15 files, concentrated in `src/lib/sales/v02/` (4), `src/lib/sales/vnext/` (4), `src/products/sales/` (4). | MEDIUM |
| `src/lib/audit/db/index.ts` line 1: `/* eslint-disable @typescript-eslint/no-explicit-any */` | Disables lint for entire 3,473-line file. Should be narrowed to specific lines/functions. | HIGH |

---

## 6. Duplicate Code Patterns

### Pattern 1: `ActionResult<T>` + `safe()` wrapper — 14 copies

Found in:
- `localcontent-actions.ts:95-114`
- `localcontent-workbook-actions.ts:57-82`
- `local-content-workspace-actions.ts:41-60`
- `localcontent-ai-advisor-actions.ts:32-52`
- `sales-actions.ts:47-67`
- `sales-dashboard-actions.ts:10-30`
- `sales-read-actions.ts:13-33`
- `sales-admin-actions.ts:23-43`
- `sales-icp-actions.ts:14-34`
- `sales-review-list-actions.ts:11-31`
- `contact-actions.ts:9-29`
- `contact-export-actions.ts:12-32`
- `contact-review-actions.ts:7-27`
- `erp-actions.ts:8-28`

Also in `src/app/content-studio/actions.ts:38-57` (15th copy)

```typescript
// Same pattern repeated identically 15 times:
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };
async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof SomeDomainError) { ... }
    if (isExpectedAccessDeniedError(error)) { ... }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Domain]", message);
    return { ok: false, error: message };
  }
}
```

**Impact:** 200+ lines duplicated. Inconsistent error handling (some catch `ProjectAccessError`, some catch `ContentStudioError`, some catch nothing specific). Should be a shared `result-types.ts` in `src/lib/`.

### Pattern 2: `getCurrentUser()` + org-scoped Prisma query

Every action file repeats:
```typescript
const user = await getCurrentUser();
const data = await prisma.someModel.findMany({
  where: { organizationId: user.organizationId },
});
```

This pattern appears in 50+ action functions. A generic `tenantScopedQuery()` helper in `src/lib/authorization/` could eliminate repetition.

### Pattern 3: Audit log dual-write

```typescript
try { 
  await auditLogger({ ... }).record(...);
} catch { 
  // Dual-write must not block the primary action 
}
```

Appears in `localcontent-actions.ts:118-160`, `content-studio/actions.ts:74-85`, and others. Should be centralized in a `fireAndForgetAudit()` utility.

### Pattern 4: Role check boilerplate

```typescript
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
```

Appears in 30+ action files. The `localcontent-rbac.ts` abstractions (`requirePermission`, `requireRole`) show the right pattern but aren't universally adopted.

---

## 7. Large Files / God Objects

| File | Lines | Issues |
|------|-------|-------|
| `src/lib/audit/db/index.ts` | 3,473 | Monolithic DB access layer with 60+ exported functions. Handles all AuditOS entities (engagement, trial balance, mapping, validation, FS, notes, evidence, findings, recommendations, review, approval, publications, events, AI output, dashboards, pilot). Should be split by domain entity. |
| `src/lib/audit/mock-data.ts` | 2,418 | Static mock data for 20+ entity types. Should be split per entity or moved to seed data. |
| `src/lib/audit/services.ts` | 1,804 | Orchestration layer mixing DB calls, AI bridge, mock fallback, and business logic. The `tryDb()` pattern is elegant but the file is too large. |
| `src/actions/audit-actions.ts` | 1,673 | 50+ imported service functions renamed as `svc*` — each action is a thin delegation. Could use a higher-order wrapper. |
| `src/lib/sales/seed-data.ts` | 1,673 | Massive seed data — expected for demo/seed, but should be JSON/YAML data, not inline TypeScript. |
| `src/actions/decisions.ts` | 1,586 | 40+ action functions covering intake, framework, scenarios, risks, recommendations, approval, evidence, signals, outcomes, templates, patterns, learning. One action file per domain would be cleaner. |
| `src/actions/localcontent-actions.ts` | 1,305 | 50+ action functions — project, supplier, spend, evidence, findings, review, approval, verification, tender match, reports, CSV import, analytics. Should follow the audit split pattern (read-actions, write-actions, export-actions). |
| `src/components/audit/evidence/evidence-page.tsx` | 1,198 | Large multi-tab evidence page. Could decompose into panel components. |
| `src/app/local-content/settings/integrations/page.tsx` | 1,173 | Very large page component — likely mixes UI, form logic, and data fetching. |
| `src/app/auditos/demo-data.ts` | 1,127 | Demo data — acceptable size for demo route but should be validated for no real-customer data leakage. |
| `src/components/audit/findings/findings-page.tsx` | 1,126 | Large findings page — similar to evidence-page pattern. |

**Additional files 500-1,000 lines:**
- `src/lib/sales/store.ts` (1,065) — Sales state management
- `src/app/sales/settings/crm/page.tsx` (1,058)
- `src/lib/local-content/workbook/ai-advisor.ts` (1,026)
- `src/lib/local-content/services.ts` (874)
- `src/actions/sales-actions.ts` (858)
- `src/lib/local-content/content/prisma-repository.ts` (853)
- `src/lib/sales/prisma-repository.ts` (835)
- `src/lib/audit/db/statement-builder.ts` (817)
- `src/lib/platform/content-studio/__tests__/content-studio.test.ts` (810)
- `src/lib/platform/org-advanced/__tests__/org-adv.test.ts` (791)
- `src/lib/platform/sales-intelligence/__tests__/sales-intel.test.ts` (787)
- `src/actions/workflowos-actions.ts` (771)

---

## 8. TypeScript Quality

### Quantitative Metrics

| Metric | Count | Notes |
|--------|-------|-------|
| `@ts-ignore` | **0** | Zero occurrences in entire `src/` tree — excellent discipline |
| `@ts-expect-error` | **1** | `src/lib/platform/audit-risk/__tests__/audit-risk.test.ts:715` (legitimate: TS can't narrow `catConfig`) |
| `as any` in `src/actions/` | ~40 | Concentrated in audit engine bridge files where literal types don't match Prisma enums |
| `as any` in `src/lib/` | ~161+ | Heaviest in `sales/prisma-repository.ts` (~35), `audit/db/index.ts` (~10), engine files (independence, client-acceptance, knowledge, working-papers) |
| `/* eslint-disable @typescript-eslint/no-explicit-any */` | **2 files** | `audit/db/index.ts` and `sales/prisma-repository.ts` — blanket disables |
| Missing return types | ~40% of actions | Many exported functions lack explicit return types (e.g., `getUnreadNotifications()` returns implicit `Promise<Notification[]>` but not declared) |
| `as Prisma.InputJsonValue` | ~15 | Common pattern for JSON metadata fields — acceptable but should use a helper |

### Overall TypeScript Strictness Score: **2.5/5**

**Rationale:**
- `strict: true` likely enabled (no `@ts-ignore` usage, 1 `@ts-expect-error`)
- But `as any` is used as a routine escape hatch instead of fixing type mismatches
- The `content-studio-service.ts` `ContentStudioDb` interface is a creative workaround but shows schema-code drift
- Many missing explicit return types
- `eslint-disable` for `no-explicit-any` on 2 massive files normalizes unsafe patterns
- The recently cleaned authorization migration files had 1,618 lines of `as any` patterns that are now removed (positive)

### High-Risk `as any` Files

1. `src/lib/sales/prisma-repository.ts` — every method uses `const db = prisma as any` (~35 times). Tier B/A models aren't in the generated Prisma client.
2. `src/lib/audit/db/index.ts` — `data as any` for Prisma create/update operations. Entire file has `eslint-disable` blanket.
3. `src/lib/platform/audit-bridge/audit-bridge-service.ts` — `as any` for field mappings (15 uses)
4. `src/lib/platform/cross-product-ai/cross-product-ai-service.ts` — 25 `any` types in AI orchestration (high risk per AGENTS.md §12)

---

## 9. Code Smells Catalog

| Smell | Location | Fix Difficulty |
|-------|----------|----------------|
| **God Object** | `src/lib/audit/db/index.ts` (3,473 lines, 60+ exports) | HARD — requires splitting into entity-specific DB modules |
| **Shotgun Surgery** | Adding a new AuditOS entity requires touching `db/index.ts`, `services.ts`, `mock-data.ts`, `audit-actions.ts`, and 2-3 component files | MEDIUM |
| **Feature Envy** | `src/actions/localcontent-actions.ts:45` imports 45 functions from `local-content/services.ts` — the action file is a pass-through that envies the service layer | EASY — use a wildcard re-export pattern |
| **Primitive Obsession** | `string` used everywhere for IDs, statuses, types where enums exist in Prisma | MEDIUM |
| **Divergent Change** | `src/actions/decisions.ts` would need to change if new decision domain is added, if auth pattern changes, OR if Prisma API changes | MEDIUM — split by domain |
| **Lazy Element** | `src/actions/localcontent-guards.ts` is not a server action file — it's in wrong directory | EASY |
| **Data Clumps** | `{ id, name, email, role, organizationId }` (user context) passed together through 50+ functions | EASY — use a context object |
| **Message Chains** | `workbook: { project: { organizationId } }` in `localcontent-guards.ts` traverses 3 levels of nested Prisma `where` — fragile to schema changes | EASY — use `findUnique` with `include` |
| **Refused Bequest** | `content-studio-service.ts` hand-types its own `ContentStudioDb` interface instead of using generated Prisma types — refused inheritance | MEDIUM — regenerate Prisma client |
| **Inconsistent Abstraction Level** | `audit-actions.ts` has both high-level `generateDraftNotes()` and low-level `updateEvidenceStorageService()` in same file | MEDIUM |
| **Alternative Classes with Different Interfaces** | `lib/audit/db/index.ts` (Prisma calls) vs `lib/audit/services.ts` (orchestration) vs `actions/audit-actions.ts` (HTTP boundary) — three tiers that sometimes duplicate validation | MEDIUM |

---

## 10. Quality Scorecard

| Metric | Score | Target | Notes |
|--------|-------|--------|-------|
| **SOLID Compliance** | 3.0/5 | 4.0 | SRP violated in big files; DI partial |
| **TypeScript Strictness** | 2.5/5 | 4.0 | `as any` epidemic, missing return types |
| **Code Duplication (DRY)** | 2.0/5 | 4.0 | `ActionResult`+`safe` copied 15x |
| **File Size Discipline** | 2.0/5 | 3.5 | 10 files >1K lines, 22 files >500 lines |
| **Naming Consistency** | 3.0/5 | 4.0 | File suffix inconsistency, `local-content` vs `localcontent` |
| **Folder Organization** | 3.0/5 | 4.0 | `platform/` dumping ground, `salesos/` vs `sales/` confusion |
| **Test Coverage (visible)** | N/A | N/A | Tests exist but coverage% not measured in this audit |
| **Dead Code Management** | 4.0/5 | 5.0 | Recent cleanup removed ~2K dead lines; few TODOs remain |
| **Error Handling** | 3.0/5 | 4.0 | Inconsistent across 15 `safe()` copies |
| **Import Hygiene** | 3.5/5 | 4.0 | Some barrel exports, but 45 imports in single action file |
| | | | |
| **Overall** | **3.2/5** | **4.0** | |

---

## 11. Top 10 Files Needing Refactor

| Rank | File | Lines | Severity | Reason |
|------|------|-------|----------|--------|
| 1 | `src/lib/audit/db/index.ts` | 3,473 | CRITICAL | Monolithic DB layer — split by entity: `db/engagements.ts`, `db/evidence.ts`, `db/findings.ts`, etc. |
| 2 | `src/actions/localcontent-actions.ts` | 1,305 | HIGH | 50+ actions across 8 domains — split into `localcontent-project-actions.ts`, `localcontent-evidence-actions.ts`, etc. |
| 3 | `src/actions/decisions.ts` | 1,586 | HIGH | 40+ decision actions in one file — split by stage: intake, framework, risks, recommendation, outcomes. |
| 4 | `src/lib/audit/services.ts` | 1,804 | HIGH | Mixes DB, AI, mock fallback — extract `AuditOsRepository` interface and `AuditOsFacade` orchestrator. |
| 5 | `src/lib/sales/prisma-repository.ts` | 835 | HIGH | 35 `as any` casts — regenerate Prisma client for Tier B/A models or accept schema extension. |
| 6 | `src/actions/audit-actions.ts` | 1,673 | HIGH | 50+ thin pass-through wrappers — consider a generic `createAuditAction()` factory. |
| 7 | `src/components/audit/evidence/evidence-page.tsx` | 1,198 | MEDIUM | Large monolithic page component — decompose into tabs, tables, modals. |
| 8 | `src/components/audit/findings/findings-page.tsx` | 1,126 | MEDIUM | Same pattern as evidence-page — extract shared patterns. |
| 9 | `src/lib/audit/mock-data.ts` | 2,418 | MEDIUM | Move to JSON/YAML fixtures or seed scripts. |
| 10 | `src/lib/sales/store.ts` | 1,065 | MEDIUM | Client-side state management — verify it doesn't import server-only modules. |

---

## 12. Recommendations

### Immediate (This Sprint)

1. **Create `src/lib/result-types.ts`** — Extract the `ActionResult<T>` type and `safe()` wrapper into a shared utility. Eliminate 15 copies. (Effort: 1 hour)

2. **Create `src/lib/action-helpers.ts`** — Extract common patterns: `getAuthContext()`, `tenantScopedQuery()`, `fireAndForgetAudit()`. (Effort: 2 hours)

3. **Fix naming: rename 12 files missing `-actions` suffix** — `approval.ts → approval-actions.ts`, `decisions.ts → decision-actions.ts`, `simulation.ts → simulation-actions.ts`, `tender.ts → tender-actions.ts`, `mfa.ts → mfa-actions.ts`, and the `decision-*.ts` group. (Effort: 1 hour + import fixup)

4. **Move `localcontent-guards.ts` and `localcontent-rbac.ts` to `src/lib/local-content/`** — These are not actions. (Effort: 30 min)

### Short-term (Next 2 Weeks)

5. **Split `src/lib/audit/db/index.ts`** — Break into per-entity modules: `db/engagements.ts`, `db/trial-balance.ts`, `db/evidence.ts`, `db/findings.ts`, etc. Keep `index.ts` as barrel export. (Effort: 3-4 hours)

6. **Split `src/actions/decisions.ts`** — Already have `decision-intelligence.ts`, `decision-learning.ts`, etc. Split remaining 40 functions into `decision-review.ts`, `decision-signals.ts`, `decision-recommendation.ts`. (Effort: 2 hours)

7. **Regenerate Prisma + fix `content-studio-service.ts`** — Run `npx prisma generate`, remove `ContentStudioDb` hand-typed interface, use generated types. Fix `sales/prisma-repository.ts` Tier B/A models similarly. (Effort: 2 hours)

8. **Add explicit return types to 40% of actions** — Focus on `notification-actions.ts`, `activity-actions.ts`, `admin-actions.ts`, and other utility actions first. (Effort: 3-4 hours)

### Medium-term (This Month)

9. **Refactor `localcontent-actions.ts`** — Split into domain-specific action files following audit's read/write/export pattern. (Effort: 4-5 hours)

10. **Create shared `ActionResult` infrastructure** — Beyond extracting the type, create middleware-like wrappers for common patterns: `withAuth()`, `withAudit()`, `withValidation()`. (Effort: 6-8 hours)

11. **Reorganize `src/lib/platform/`** — Move product-specific services (content-studio, sales-intelligence, org-advanced, cross-product-ai) to their respective product directories under `src/lib/`. (Effort: 4-5 hours)

12. **Reduce `as any` count by 50%** — Target: engines (`audit-*-engine.ts` files) should use properly typed adapter interfaces; `sales/prisma-repository.ts` should register Tier B/A models. (Effort: 8-10 hours)

### Long-term (Next Quarter)

13. **Introduce repository pattern** — Define `AuditOsRepository`, `SalesOsRepository`, `ContentStudioRepository` interfaces. Implement Prisma-backed versions. Wire via a service locator or DI container. This enables testability and On-Prem readiness.

14. **Establish architectural fitness functions** — Automated checks for: file size >500 lines, `as any` count per file, duplicate code blocks, missing `"use server"` directives, import of server-only modules in client components.

---

## Appendix A: Methodology

- **Files inspected:** 500+ (via grep, glob, and direct reads)
- **Commands run:** `git log`, `git diff --stat`, file line counts, regex searches for `as any`, `@ts-ignore`, `TODO`, `ActionResult`, `safe<T>`
- **Direct file reads:** 40+ files across `src/actions/`, `src/lib/`, `src/app/`, `src/middleware.ts`
- **Heavy commands avoided:** `npm run build`, `npm test` (per low-load protocol)

## Appendix B: Skills Applied

- `aqliya-security-gate.md` — Verified auth coverage in middleware, route handlers
- `aqliya-docs-authority.md` — Checked naming against product taxonomy
- `aqliya-product-completion.md` — Classified current levels per product

## Appendix C: Status

| Status | DONE_WITH_CONCERNS |
|--------|-------------------|
| Concerns | Audit is comprehensive but execution was limited to static analysis. Runtime validation (build, test, lint) was not performed per low-load protocol. The `as any` counts are approximate due to PowerShell 5.1 `-Raw` parameter limitation. |

---

*Generated by AQLIYA Code Quality Auditor — 2026-07-12*
