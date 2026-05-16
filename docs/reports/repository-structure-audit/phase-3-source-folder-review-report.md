# Phase 3 — Source Folder Review Report

**Date:** 2026-05-16
**Scope:** Source structure analysis only — no files moved, no code changed

---

## 1. Summary

The AQLIYA source code is a **well-organized modular monolith**. The current folder boundaries are clean and align with the v1.1 architecture (presentation → actions → domain → data layers). No urgent reorganization is needed.

**Assessment:** Source reorganization is **not required at this time**. The cost of moving files (import updates, potential build breaks) outweighs the benefit for all reviewed targets.

---

## 2. Review Scope

| Target | Type | Analysis Depth | Verdict |
|--------|------|----------------|---------|
| `src/components/visuals/` | Component group | Full | ✅ Keep as-is — shared visual infrastructure, not marketing-only |
| `src/actions/tender.ts` | Server Action | Full | ✅ Keep as-is — DecisionOS ownership confirmed |
| `src/lib/audit/pagination.ts` | Shared utility | Full | 🔶 Move to `src/lib/shared/` — low risk, low priority |
| `src/lib/audit/rate-limit.ts` | Domain-specific utility | Full | ✅ Keep as-is — separate concern from global rate-limit |
| Optional boundaries | Folder structure | Quick scan | ✅ Clean — no boundary leaks detected |

---

## 3. Import / Usage Map

| Target | Used By | Product Area | Runtime Impact | Move Risk | Recommendation |
|--------|---------|--------------|----------------|-----------|----------------|
| `src/components/visuals/` | `(marketing)/page.tsx`, `(marketing)/products/page.tsx` | Marketing | Direct (renders on marketing pages) | Medium (barrel export used by 2 routes) | Keep as-is |
| `src/actions/tender.ts` | `(dashboard)/decisions/[id]/tender/page.tsx` | DecisionOS | Direct (tender profile CRUD) | Medium (1 route, 1 action file, Prisma model used by `lib/`) | Keep as-is |
| `src/lib/audit/pagination.ts` | `audit-read-actions.ts`, `services.ts`, `db/index.ts`, `pagination.test.ts` | Shared (used by AuditOS only) | Indirect (type import + utility) | Low (generic types, no AuditOS domain dependency) | **Move candidate** |
| `src/lib/audit/rate-limit.ts` | `audit-actions.ts` (22 calls), `audit-export-actions.ts` (1 call) | AuditOS only | Direct (throws on limit) | High (AuditOS-specific actor context dependency) | Keep as-is |

---

## 4. Component Boundary Findings — `src/components/visuals/`

### Files Found (10)

| File | Purpose | Classification |
|------|---------|---------------|
| `operating-system-map-visual.tsx` | AQLIYA platform OS map | Marketing |
| `custom-workflow-builder-visual.tsx` | Workflow builder concept visual | Marketing |
| `decision-matrix-visual.tsx` | DecisionOS matrix visual | Marketing |
| `simulation-scenario-visual.tsx` | Simulation scenario visual | Marketing |
| `sales-pipeline-visual.tsx` | SalesOS pipeline visual | Marketing |
| `audit-trace-visual.tsx` | AuditOS traceability visual | Marketing |
| `local-content-map-visual.tsx` | LocalContentOS map visual | Marketing |
| `proof-chain-visual.tsx` | Proof chain concept visual | Marketing |
| `system-blueprint-panel.tsx` | System blueprint architecture | Marketing |
| `index.ts` | Barrel export (9 components) | Shared |

### Usage Analysis

```
Used only by:
  src/app/(marketing)/page.tsx          → OperatingSystemMapVisual, ProofChainVisual
  src/app/(marketing)/products/page.tsx → 6 visuals (CustomWorkflowBuilder, DecisionMatrix, 
                                            SimulationScenario, SalesPipeline, AuditTrace, LocalContentMap)
```

### Finding
All visual components are used **exclusively** by marketing routes `(marketing)/`. Despite being marketing-only in usage, they serve as **shared visual infrastructure** for the marketing layer — they are not "enterprise" components reused across workspaces.

The barrel export (`index.ts`) is clean. Moving to `src/components/marketing/visuals/` would require updating 2 import paths and would add no functional value.

**Verdict:** ✅ **Keep as-is.** The current location is acceptable. A future rename to `src/components/marketing/` would be low-risk but unnecessary for now.

---

## 5. Action Boundary Findings — `src/actions/tender.ts`

### Exported Actions

| Action | Purpose |
|--------|---------|
| `getTenderProfile(decisionId)` | Fetch tender profile by decision ID |
| `createOrUpdateTenderProfile(decisionId, data)` | Create or update tender assessment data |

### Consumers

```
src/app/(dashboard)/decisions/[id]/tender/page.tsx  → imports both functions
```

### Product Ownership

The tender functionality is deeply integrated into **DecisionOS**:
- Route: `(dashboard)/decisions/[id]/tender/` (DecisionOS workspace)
- Action uses `requireDecisionAccess` (DecisionOS auth)
- Uses `Prisma.TenderProfile` model (DecisionOS schema)
- Referenced by `src/lib/decision/decision-type-config.ts` as a DecisionOS type ("tender" type)
- Referenced by `src/lib/decision/decision-templates.ts` as a DecisionOS template
- Simulation engine (`src/lib/simulation/tender-simulation.ts`) and recommendation engine (`src/lib/recommendation/tender-recommendation.ts`) both reference tender as DecisionOS sub-feature
- NOT related to LocalContentOS (no local content types, no supplier locality, no procurement analysis)

### Finding
Tender is a **DecisionOS sub-feature**, not a separate product or LocalContentOS component. It represents a "tender/bid evaluation" use case of the DecisionOS decision pipeline.

**Verdict:** ✅ **Keep as-is.** Move to `src/actions/local-content/` would be **incorrect**. The file is correctly placed.

---

## 6. Shared Utility Findings

### A. `src/lib/audit/pagination.ts`

**Content:**
- `PaginatedResult<T>` interface
- `PaginationParams` interface
- `DEFAULT_PAGE_SIZE = 20`
- `paginate<T>(items, total, params)` — generic pagination wrapper
- `offsetFromPage(page, pageSize)` — generic offset calculator

**AuditOS-specific dependencies:** None. All types and functions are fully generic (`T` parameterized).

**Consumers (all in AuditOS):**
- `src/actions/audit-read-actions.ts` — type import only
- `src/lib/audit/services.ts` — type import only
- `src/lib/audit/db/index.ts` — imports all 3 exports + uses type
- `src/__tests__/unit/pagination.test.ts` — unit test

**Assessment:** The pagination module is **fully generic** with zero AuditOS domain dependencies. It is correctly identified by the v1.1 architecture doc as "Shared".

However, it is currently only consumed by AuditOS files. Moving it to `src/lib/shared/pagination.ts` would be:
- Low effort: update 4 import paths + 1 barrel export
- Low risk: no business logic impact
- Low priority: no consumer outside AuditOS yet

**Verdict:** 🔶 **Move candidate** — low risk, but defer until a non-AuditOS consumer emerges or Phase 4 is triggered.

### B. `src/lib/audit/rate-limit.ts`

**Content:**
- In-memory `Map<string, RateLimitEntry>` store
- `enforceAuditRateLimit(actor, actionName, category)` — throws on limit
- `resetRateLimit(actor, actionName)`
- Categories: default(60), upload(10), ai_generate(10), export(20), mutation(30)
- Periodic cleanup via `setInterval`

**AuditOS-specific dependencies:**
- Imports `AuditActor` type from `./actor-context` (AuditOS-specific)

**Consumers:**
- `src/actions/audit-actions.ts` — 22 calls across upload, mutation, ai_generate, export categories
- `src/actions/audit-export-actions.ts` — 1 export call

**Other rate-limit files in the codebase:**
- `src/lib/rate-limit.ts` — **Different** function: `checkRateLimit(key, config?)` — generic, returns `{allowed, remaining, resetAt}`. Used by:
  - `src/middleware-rate-limit.ts` — API rate limiting (IP-based for `/api/` routes)

**Key distinction:**
- `src/lib/rate-limit.ts` = **global** (IP-based, used in middleware for API routes)
- `src/lib/audit/rate-limit.ts` = **AuditOS action-level** (actor-based, specific categories per audit operation)

These are **not duplicates**. They serve different purposes with different interfaces.

**Verdict:** ✅ **Keep as-is.** The audit rate-limit is correctly placed within AuditOS domain. It depends on `AuditActor` and has AuditOS-specific action categories. The global `src/lib/rate-limit.ts` is a separate concern.

---

## 7. Optional Boundary Review

### `src/components/enterprise/` (32 components)
Clean shared enterprise component library. Components are imported by marketing routes, dashboard routes, audit workspace, and decision workspace. No boundary leaks.

### `src/components/platform/` (10 components)
Clean platform shell components (a11y, analytics, header, sidebar, etc.). No issues.

### `src/lib/ai/`
Clean AI orchestration with deterministic handlers + cloud/local stubs. Follows provider pattern. No boundary issues.

### `src/lib/governance/`
Clean shared governance engine with tests and examples. Used by both AuditOS and DecisionOS. Well-structured.

### `src/lib/audit/` vs `src/lib/decision/`
Clean separation. `audit/` handles engagement lifecycle (TB → mapping → statements → notes → evidence → findings → review → approval → export). `decision/` handles decision pipeline (intake → framework → scenarios → simulation → recommendation → governance). Some shared code exists in `lib/governance/`.

No boundary leaks detected.

---

## 8. Risks

### No Action Risk
| Risk | Level | Description |
|------|-------|-------------|
| Pagination generic in AuditOS folder | Low | No harm; if non-AuditOS consumer emerges, path is misleading |

### Moving Risk
| Item | Risk | Description |
|------|------|-------------|
| `pagination.ts` to `src/lib/shared/` | Low | 4 import paths to update; all within AuditOS; unit test exists |
| `tender.ts` to `src/actions/local-content/` | **High** | Would break DecisionOS route; incorrect product assignment |
| `rate-limit.ts` out of audit/ | **High** | Depends on AuditActor; separate interface from global rate-limit |
| `visuals/` to `marketing/` | Low | 2 import paths; no functional change; low benefit |

### Owner Decision Risk
| Item | Risk | Description |
|------|------|-------------|
| visual components categorization | Low | Current location works; rename is cosmetic |

### Validation Risk
- No current TSC errors reported (pre-existing baseline)
- Moving any file requires `npx tsc --noEmit` + `npm run build` validation

---

## 9. Phase 4 Recommendation

**Decision: Do not proceed to Phase 4 at this time.**

### Rationale
1. The source code is well-organized with clean domain boundaries.
2. All reviewed targets are correctly placed or have acceptable current positions.
3. No move provides enough functional benefit to justify the import update risk.
4. The only viable move candidate (`pagination.ts` → `src/lib/shared/`) is low-priority — no non-AuditOS consumer exists yet.

### If Phase 4 Is Triggered in the Future

The only move with evidence to support it:

| Current Path | Proposed Path | Risk | Reason |
|-------------|---------------|------|--------|
| `src/lib/audit/pagination.ts` | `src/lib/shared/pagination.ts` | Low | Fully generic; no AuditOS domain dependency |

**Move plan if executed:**
1. Create `src/lib/shared/pagination.ts` with same content
2. Update imports in:
   - `src/actions/audit-read-actions.ts` (line 31)
   - `src/lib/audit/services.ts` (line 12)
   - `src/lib/audit/db/index.ts` (lines 4-5)
   - `src/__tests__/unit/pagination.test.ts` (line 1)
3. Create barrel export in `src/lib/shared/index.ts` if not present
4. Remove `src/lib/audit/pagination.ts`
5. Validate: `npx tsc --noEmit && npm run build && npm test`

---

## 10. Owner Decisions Needed

| Item | Decision Needed | Recommended Answer | Risk if Deferred |
|------|----------------|-------------------|------------------|
| `src/components/visuals/` location | Move to `src/components/marketing/visuals/`? | **No, keep as-is** | Low |
| `src/actions/tender.ts` ownership | Move to `local-content/`? | **No, keep as DecisionOS** (confirmed by usage evidence) | Medium (wrong move would break DecisionOS) |
| `src/lib/audit/pagination.ts` move | Extract to `src/lib/shared/`? | **Defer** — only when non-AuditOS consumer emerges | Low |
| `src/lib/audit/rate-limit.ts` consolidation | Merge with `src/lib/rate-limit.ts`? | **No** — different interfaces, different purposes | Low |

---

## 11. Validation

- **Source code changed**: No
- **Files moved**: No
- **Imports changed**: No
- **Report created**: Yes (`docs/reports/repository-structure-audit/phase-3-source-folder-review-report.md`)
- **git status**: Only pre-existing modifications present; no new source changes introduced by Phase 3
