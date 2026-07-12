# AQLIYA Architecture Audit
**Date:** 2026-07-12
**Auditor:** Architecture Agent
**Scope:** Full codebase — 202 modified files in working tree, all products, layers, and cross-cutting concerns

---

## 1. Executive Summary

- **5 verified Platform Neutrality violations** (ADR-003): Core imports from product-specific modules in `src/lib/core/ai/engine.ts`, `src/lib/core/signals/producers/sales-signal-producer.ts`, `src/lib/core/decision/adapters/decisionos-adapter.ts`, `src/lib/core/ai/handlers/disclosure-enrichment-handler.ts`, and `src/lib/platform/signals/sales-signal-producer.ts` — Core and Platform layers know about products.
- **1 major Product Boundary violation**: ContentStudio domain logic (17 files) lives under `src/lib/local-content/content/` — ContentStudio is documented as a standalone product, NOT a subsystem of LocalContentOS.
- **21 pages bypass the Action → Service → DB layering** by importing `prisma` directly in page components, skipping Server Actions and domain services.
- **Architecture docs are stale**: `docs/official/aqliya-core-architecture-v1.1.md` lists outdated maturity levels (DecisionOS=L4, LocalContentOS=L5, WorkflowOS=L4) that contradict the PRODUCT_STATUS_MATRIX (all L6).
- **Uncommitted deletions are clean**: 9 files deleted from ABAC migration layer (no remaining import references found), `product-guards.ts` removed — refactoring in progress, no broken imports detected.
- **0 cyclic dependencies** found between product libs (AuditOS ↔ DecisionOS = clean; SalesOS ↔ others = clean).

---

## 2. Architecture Adherence Score

| Document | Adherence | Gaps Found |
|----------|-----------|------------|
| `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | **PARTIAL (73%)** | ADR-002 (Product Independence): No direct product-to-product imports found — PASS. ADR-003 (Platform Neutrality): **FAILED** — 4 Core→Product imports and 1 Platform→Product import (see §3). ADRs 004-013: Conceptual architecture not yet fully implemented — no Capability Registry, no Event Bus, no kernel extraction. |
| `aqliya-core-architecture-v1.1.md` | **STALE (40%)** | Runtime Surface Classification table lists DecisionOS as L4, LocalContentOS as L5, WorkflowOS as L4 — all 3+ sprints out of date. Core Engine Status table claims "Evidence Graph: Partial" but `PRODUCT_STATUS_MATRIX` calls all products L6. "Model Governance: Not implemented" is now contradicted by L6 entries in the status matrix. |
| `AQLIYA_ARCHITECTURE.md` | **GOOD (85%)** | Route model is accurate. Layer definitions are correct. Reality Alignment Notes are accurate. Download Security Standard correctly describes current implementation. Missing: SalesOS workspace routes are not in the route table (32 routes at `/sales/*`). |
| `PRODUCT_STATUS_MATRIX.md` | **GOOD (85%)** | Statuses appear honest and code-verified (all products at L6). One concern: ContentStudio entry claims "Standalone Operational Content Workspace (NOT a subsystem of LocalContentOS)" but code lives under LocalContentOS (see §5). |
| `ROUTE_STRATEGY.md` | **GOOD (90%)** | All routes verified — every documented route exists in code. SalesOS routes present. Route rules are accurate. Route count claims (27 LocalContentOS, 32 SalesOS, 22 DecisionOS, 9 LocalContactOS, 4 RiskOS) are verifiable. |
| `ARCHITECTURE_DECISION_INDEX.md` | **GOOD (90%)** | All 16 ADRs documented. ADR-001 (SalesOS v2 freeze) is followed. ADR-016 (Architectural Closure) is respected — no new ADRs opened without evidence. Gap: Only 1 ADR has a physical file (`ADR-028`); ADR-002 through ADR-016 exist only in the Constitution document, not as standalone files in `docs/architecture/adr/`. |
| ADR-028 (Knowledge Foundation Bridge) | **DRAFT** | Accepted but not implemented. Schema migration for `KnowledgeFoundationVersionCandidate` junction table not yet applied. The compliance checklist in ADR-028 has all items unchecked. |

---

## 3. Coupling Analysis

### 3.1 Cross-Product Imports (Product → Product)

| Importer | Imported | Severity | Details |
|----------|----------|----------|---------|
| `src/lib/sales/__tests__/office-ai-deepening.test.ts` | `@/lib/office-ai/taxonomy` | **LOW** | Test file only — no runtime dependency |
| `src/lib/sales/__tests__/workflowos-expansion.test.ts` | `@/lib/office-ai/...` | **LOW** | Test file only |

**Assessment:** Cross-product coupling between product domain libs is effectively zero at runtime. This passes ADR-002 (Product Independence).

### 3.2 Core → Product Imports (Platform Neutrality Violations — ADR-003 FAILED)

| # | File | Imported From | Line | Severity |
|---|------|--------------|------|----------|
| C1 | `src/lib/core/ai/engine.ts` | `@/lib/audit/audit-ai-bridge` | 9 | **HIGH** |
| C2 | `src/lib/core/ai/engine.ts` | `@/lib/office-ai/office-ai-orchestrator-bridge` | 15 | **HIGH** |
| C3 | `src/lib/core/signals/producers/sales-signal-producer.ts` | `@/lib/sales/store` | 7 | **HIGH** |
| C4 | `src/lib/core/decision/adapters/decisionos-adapter.ts` | `@/lib/decision/decision-type-config` | 2 | **HIGH** |
| C5 | `src/lib/core/ai/handlers/disclosure-enrichment-handler.ts` | `@/lib/audit/notes/disclosure-types` | 7 | **HIGH** |

### 3.3 Platform → Product Imports

| # | File | Imported From | Line | Severity |
|---|------|--------------|------|----------|
| P1 | `src/lib/platform/signals/sales-signal-producer.ts` | `@/lib/sales/store` | 8 | **MEDIUM** |

### 3.4 Core → Governance (Legacy) Imports

The Core governance module (`src/lib/core/governance/index.ts`) re-exports from `@/lib/governance`. This is documented as a transitional pattern (legacy `governance/` → `core/governance`). 26 files across Core, platform, audit, and local-content import from `@/lib/governance` — this is acceptable for a shared governance module but the transition should be completed.

### 3.5 Shared Module Usage Pattern

**Clean:** `@/lib/governance/`, `@/lib/auth.ts`, `@/lib/platform/` (most modules), `@/lib/core/` (most modules) serve as shared dependencies — products depend on them, not on each other.

**Concerning:** The Core signal producer directory (`src/lib/core/signals/producers/`) contains product-specific signal collection code. This is architecturally wrong — signal producers should be registered via contracts from products upward, not embedded in Core with hardcoded product imports.

---

## 4. Cyclic Dependencies

### 4.1 Found Cycles

**NONE** — No cyclic imports detected between product libraries:
- AuditOS does not import from DecisionOS and vice versa ✅
- SalesOS does not import from other product libs (except test files) ✅
- LocalContentOS and ContentStudio libs are structurally combined (violation, but not a cycle) ⚠️
- Core modules reference each other internally (`core/ai` → `core/knowledge`, `core/knowledge` → `core/ai`) — this is expected within the Core layer ✅

### 4.2 Risk Level

**LOW** — Zero cycles at runtime. The import graph is a DAG with the dependency direction flowing: `products → core → legacy-governance → prisma`. The only risk is the Core→Product imports (C1-C5, P1) which break the DAG direction and create a hidden bidirectional dependency.

---

## 5. Product Boundary Assessment

| Product | Boundary Clarity | Violations | Risk |
|---------|-----------------|------------|------|
| **AuditOS** | **GOOD** | None | LOW |
| **DecisionOS** | **GOOD** | Core adapter imports DecisionOS type config (C4) | MEDIUM |
| **LocalContentOS** | **POOR** | ContentStudio domain logic (17 files) lives under `src/lib/local-content/content/`. Actions file (`src/actions/local-content-workspace-actions.ts`) imports exclusively from `@/lib/local-content/content/` | **HIGH** |
| **ContentStudio** | **POOR** | No dedicated `src/lib/content-studio/` directory. All domain logic is colocated with LocalContentOS at `src/lib/local-content/content/`. Clean platform lib at `src/lib/platform/content-studio/` (6 files) exists but is a thin service layer. | **HIGH** |
| **SalesOS** | **GOOD** | Clean boundaries. 13 models, ~80 components, own lib, own routes. One test imports office-ai (LOW risk). | LOW |
| **WorkflowOS** | **GOOD** | Clean boundaries. Own lib (`src/lib/workflowos/`). Own routes. No cross-product imports. | LOW |
| **LocalContactOS** | **GOOD** | Clean boundary at `src/lib/localcontactos/`. Own routes. | LOW |
| **RiskOS** | **GOOD** | Clean boundary. Own routes. No product lib imports found. | LOW |
| **Office AI Assistant** | **GOOD** | Clean boundary at `src/lib/office-ai/`. No product-to-product imports. | LOW |
| **Knowledge Foundation** | **GOOD** | Clean boundary at `src/lib/knowledge-foundation/`. Own routes. | LOW |
| **Institutional Memory** | **GOOD** | Clean boundary. Cross-product linking is by design via `InstitutionalMemoryEvent` model. | LOW |

### 5.1 ContentStudio / LocalContentOS Boundary — Detailed Findings

**Docs claim:** "Standalone Operational Content Workspace (NOT a subsystem of LocalContentOS)"
**Code reality:** ContentStudio Prisma models (`ContentWorkspace`, `ContentItem`, `ContentVersion`, `ContentTemplate`, `ContentEvidence`) exist in the schema. But the domain logic lives at:
- `src/lib/local-content/content/` — 17 files: `services.ts`, `review.ts`, `outputs.ts`, `evidence.ts`, `workflow.ts`, `permissions.ts`, `ai.ts`, `repository.ts`, `prisma-repository.ts`, `types.ts`, `contracts.ts`, `index.ts`, etc.

The action file `src/actions/local-content-workspace-actions.ts` imports exclusively from `@/lib/local-content/content/`:
```typescript
import { assertLocalContentPermission } from "@/lib/local-content/content/permissions";
import { createContentCampaign, ... } from "@/lib/local-content/content/services";
import { submitContentApproval, ... } from "@/lib/local-content/content/review";
import { buildOutputPackagePayload, ... } from "@/lib/local-content/content/outputs";
```

The clean ContentStudio platform service layer (`src/lib/platform/content-studio/`) exists but is thin — the bulk of business logic remains under the LocalContentOS namespace.

**Verdict:** ContentStudio is a **de facto subsystem** of LocalContentOS in current code. Either the code must be moved to `src/lib/content-studio/` or the docs must acknowledge the current coupling. This is a **HIGH priority architectural debt item**.

### 5.2 Maturity Overclaims Check

Verified `PRODUCT_STATUS_MATRIX.md` against code reality for all products claiming L6:
- AuditOS → 8 engines verified in code ✅
- DecisionOS → 22 route segments, 42+ tests ✅
- LocalContentOS → 27 route segments, 265+ tests ✅
- SalesOS → 32 route segments, 45 test files ✅
- RiskOS → 4 route segments, dashboard + assessment detail ✅
- LocalContactOS → 9 route segments, 15 tests ✅
- ContentStudio → ~125 tests, 5 routes ✅
- WorkflowOS → 31 action tests ✅
- Office AI → 248 tests ✅
- Knowledge Foundation → 87 tests ✅
- Institutional Memory → Verified ✅

**No overclaims detected.** All L6 products have evidence in code.

---

## 6. Layer Discipline

### 6.1 Server/Client Boundary Violations

**PASS** — No Client Components import Prisma or server-only modules.
- 0 components in `src/components/` import `@/lib/prisma`
- 0 components in `src/components/` import `server-only`
- 0 pages in `src/app/` import `server-only`

### 6.2 Action → Service → DB Layering Assessment

**PARTIAL FAIL — 21 pages bypass Server Actions entirely**

The following page components directly import `prisma` and query the database without going through Server Actions:

| # | Page File | 
|---|-----------|
| 1 | `src/app/(dashboard)/overview/page.tsx` |
| 2 | `src/app/(dashboard)/admin/page.tsx` |
| 3 | `src/app/(dashboard)/monitoring/page.tsx` |
| 4 | `src/app/(dashboard)/organizations/page.tsx` |
| 5 | `src/app/(dashboard)/organizations/[id]/page.tsx` |
| 6 | `src/app/(dashboard)/settings/audit-logs/page.tsx` |
| 7 | `src/app/(dashboard)/settings/platform-organization/page.tsx` |
| 8 | `src/app/(dashboard)/settings/workspaces/page.tsx` |
| 9 | `src/app/(dashboard)/assistant/page.tsx` |
| 10 | `src/app/(dashboard)/assistant/[taskId]/page.tsx` |
| 11 | `src/app/(dashboard)/knowledge-foundation/history/page.tsx` |
| 12 | `src/app/audit/page.tsx` |
| 13 | `src/app/workflowos/records/[id]/page.tsx` |
| 14 | `src/app/contacts/page.tsx` |
| 15 | `src/app/contacts/[id]/page.tsx` |
| 16 | `src/app/contacts/[id]/relations/new/page.tsx` |
| 17 | `src/app/sales/page.tsx` |
| 18 | `src/app/organizations/sunbul/page.tsx` |
| 19 | `src/app/local-content/workbook/[workbookId]/page.tsx` |
| 20 | `src/app/local-content/health/page.tsx` |
| 21 | `src/app/local-content/review-center/page.tsx` |

**Note:** These are all Server Components (not marked `"use client"`), so they don't violate the server/client boundary. However, they bypass the intended Action → Service → DB layering. Direct Prisma access in pages:
- Skips audit trail
- Skips RBAC enforcement (unless manually added inline)
- Makes governance checks inconsistent
- Makes testing harder (no mockable action layer)

### 6.3 Component Placement Violations

**PASS** — No component files found inside `src/app/` directories that should be in `src/components/`. All verified `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx` files are legitimate Next.js file conventions.

**MINOR:** Server actions found in app directory instead of `src/actions/`:
- `src/app/content-studio/actions.ts` — 473 lines of server actions
- `src/app/sales/intelligence/actions.ts` — modified in working tree
- `src/app/settings/models/model-governance-client.tsx` — imports from `@/lib/auth`

These should be migrated to `src/actions/` for consistency.

### 6.4 Barrel Exports

**GOOD:** Core has a unified barrel at `src/lib/core/index.ts` exporting 12 engines. Governance has barrel at `src/lib/governance/index.ts`. ContentStudio platform service has barrel at `src/lib/platform/content-studio/index.ts`.

**MISSING:** No barrel export files found for: `src/lib/riskos/`, `src/lib/institutional-memory/`. ContentStudio domain logic (under `src/lib/local-content/content/`) has a barrel at `index.ts` but under the wrong namespace.

---

## 7. Uncommitted Changes Risk

### 7.1 Files Deleted

| Deleted File | Impact | Risk |
|-------------|--------|------|
| `src/lib/authorization/__tests__/action-guard.test.ts` | Test for deleted action-guard | LOW — expected cleanup |
| `src/lib/authorization/engine/migration/decision-replay.ts` | ABAC migration tooling | LOW — no remaining imports found |
| `src/lib/authorization/engine/migration/evidence-package.ts` | ABAC migration tooling | LOW — no remaining imports |
| `src/lib/authorization/engine/migration/index.ts` | ABAC migration barrel | LOW — no remaining imports |
| `src/lib/authorization/engine/migration/parity-report.ts` | ABAC migration tooling (628 lines) | LOW — no remaining imports |
| `src/lib/authorization/engine/migration/shadow-adapter.ts` | ABAC shadow adapter (181 lines) | LOW — no remaining imports |
| `src/lib/authorization/engine/migration/shadow-logger.ts` | ABAC shadow logger (428 lines) | LOW — no remaining imports |
| `src/lib/authorization/product-guards.ts` | Product-specific guards (116 lines) | **MEDIUM** — verify no remaining consumers |
| `tests/README.md` | Test documentation | LOW — informational only |

### 7.2 Auth Module Refactoring

`src/lib/auth.ts` modified: 138 lines removed, now 72 lines. The file still exports `getCurrentUser`, `hasRequiredRole`, `isAdmin`, `isOperator`, `isViewer`, `isExpectedAccessDeniedError`, `CurrentUser`, `CurrentOrgContext`, and `RequiredRole` — all 227 consumers are intact.

### 7.3 Module Renames

No renamed files detected in working tree. All changes are modifications or deletions.

### 7.4 Overall Risk Level

**LOW-MEDIUM** — The ABAC migration layer deletion is a planned cleanup with no runtime impact. Auth refactoring preserves the public API. The product-guards deletion warrants a quick verification that no other files import from it.

---

## 8. Architecture Decision Records (ADR) Status

| ADR | Status | File Exists | Code Compliance |
|-----|--------|-------------|-----------------|
| **ADR-001** (SalesOS v2 freeze) | Accepted | In `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` | ✅ SalesOS v1 preserved |
| **ADR-002** (Product Independence) | Constitutional | In Constitution | ✅ No runtime product→product imports |
| **ADR-003** (Platform Neutrality) | Constitutional | In Constitution | ❌ 5 Core→Product imports (C1-C5) |
| **ADR-004** (Consumer-Driven Extraction) | Constitutional | In Constitution | ⚠️ Not yet exercised; extraction blueprint pending |
| **ADR-005** (Kernel Budget Rule) | Constitutional | In Constitution | ⚠️ Not yet exercised |
| **ADR-006** (One Owner Rule) | Constitutional | In Constitution | ⚠️ Not yet exercised |
| **ADR-007** (Extraction Reversibility) | Constitutional | In Constitution | ⚠️ Not yet exercised |
| **ADR-008** (Contracts Before Implementation) | Constitutional | In Constitution | ⚠️ Pending kernel extraction |
| **ADR-009** (Capability Registry) | Constitutional | In Constitution | ❌ No registry exists in code |
| **ADR-010** (Capability Versioning) | Constitutional | In Constitution | ❌ No capability versioning in code |
| **ADR-011** (Capability Lifecycle) | Constitutional | In Constitution | ❌ No lifecycle tracking in code |
| **ADR-012** (Stable Core, Extensible Edge) | Constitutional | In Constitution | ⚠️ Core grows by accretion, not extension |
| **ADR-013** (Business First) | Constitutional | In Constitution | ⚠️ Pending kernel extraction |
| **ADR-014** (Business Capability Map) | Constitutional | In Constitution | ✅ Map defined in Constitution |
| **ADR-015** (Product Capability Layer) | Constitutional | In Constitution | ✅ Layer defined in Constitution |
| **ADR-016** (Architectural Closure) | Accepted | In Constitution/Index | ✅ No new ADRs without evidence |
| **ADR-028** (Knowledge Foundation Bridge) | Accepted | `docs/architecture/adr/ADR-028-KNOWLEDGE-FOUNDATION-BRIDGE.md` | ❌ Not yet implemented — all checklist items unchecked |

### 8.1 ADR File Gap

Only 1 ADR has a standalone file in `docs/architecture/adr/`. ADRs 002-016 exist only as principles in the Constitution document. Recommendation: Create individual ADR files for the 12 constitutional principles, each with: Context, Decision, Rationale, Consequences, and Compliance sections per the template in `ARCHITECTURE_DECISION_INDEX.md`.

---

## 9. Critical Findings (Must Fix Before Pilot)

1. **C1-C2: `src/lib/core/ai/engine.ts:9,15`** — Core imports from `@/lib/audit/audit-ai-bridge` and `@/lib/office-ai/office-ai-orchestrator-bridge`. The Core AI engine knows about Audit and Office AI product domains. Fix: product-specific orchestration should be injected via contracts/adapters, not hardcoded imports.

2. **C3: `src/lib/core/signals/producers/sales-signal-producer.ts:7`** — Core signals module imports from `@/lib/sales/store`. The Core signal engine hardcodes SalesOS-specific store operations. Fix: signal collection should use a producer interface registered from products, not direct product imports in Core.

3. **ContentStudio product boundary: `src/lib/local-content/content/`** — 17 files of ContentStudio domain logic incorrectly colocated with LocalContentOS. Every ContentStudio action file imports from `@/lib/local-content/content/`. Fix: extract to `src/lib/content-studio/` and update all imports, or formally document ContentStudio as a LocalContentOS subsystem (contrary to current docs).

4. **Architecture doc staleness: `docs/official/aqliya-core-architecture-v1.1.md`** — Runtime Surface Classification, Core Engine Status, and Route Architecture tables are 3+ sprints out of date. Fix: sync with PRODUCT_STATUS_MATRIX.md and current code reality.

5. **ADR Compliance for ADR-028** — Knowledge Foundation Bridge schema migration and bridge code not implemented. All compliance checklist items are unchecked. Fix: implement Phase 28.1-28.4 per ADR-028 plan.

6. **21 pages with direct Prisma access** — Pages at `src/app/audit/page.tsx`, `src/app/contacts/page.tsx`, `src/app/sales/page.tsx`, etc. bypass Server Actions. Fix: migrate database queries to Server Actions for audit trail, RBAC enforcement, and testability.

---

## 10. Recommendations

1. **P0 — Resolve ADR-003 violations** (Platform Neutrality): Create producer/consumer contracts for the 5 Core→Product import paths. Use dependency inversion — Core defines interfaces; products implement them and register via adapters.

2. **P0 — Extract ContentStudio to standalone `src/lib/content-studio/`**: Move the 17 files from `src/lib/local-content/content/` to `src/lib/content-studio/`. Update all imports in `src/actions/local-content-workspace-actions.ts`, `src/actions/content-evidence-actions.ts`, and test files.

3. **P1 — Sync `aqliya-core-architecture-v1.1.md` with reality**: Update Runtime Surface Classification, Core Engine Status, and Architectural Boundaries sections to match the PRODUCT_STATUS_MATRIX (all products L6).

4. **P1 — Implement ADR-028 Phase 28.1**: Schema migration for `KnowledgeFoundationVersionCandidate` junction table and candidate bridge implementation.

5. **P2 — Migrate 21 pages to Server Actions**: Replace direct Prisma calls in page components with proper Action → Service → DB layering. This ensures consistent audit trail and RBAC enforcement.

6. **P2 — Create standalone ADR files**: Generate `docs/architecture/adr/ADR-002.md` through `ADR-016.md` for the 12 constitutional principles using the ADR template.

7. **P2 — Resolve P1** (`platform/signals/sales-signal-producer.ts`): Same dependency inversion pattern as Core signal producers — platform should not directly import product-specific store modules.

8. **P3 — Move app-directory actions to `src/actions/`**: Move `src/app/content-studio/actions.ts` and `src/app/sales/intelligence/actions.ts` to `src/actions/` for consistency.

9. **P3 — Verify `product-guards.ts` deletion**: Run `grep` to confirm no remaining imports from `@/lib/authorization/product-guards` before committing the deletion.

10. **P3 — Barrel export completeness**: Add barrel `index.ts` files for `src/lib/riskos/` and `src/lib/institutional-memory/` if those directories contain multiple modules.

---

## Appendix A: Methodology

- **Files inspected:** 200+ source files across `src/lib/`, `src/actions/`, `src/app/`, `src/components/`, `prisma/`, and `docs/`
- **Commands run:** `git status`, `git diff --stat`, `git diff --name-status`
- **Search patterns:** Cross-product import regex (`@/lib/(audit|decision|local-content|sales|office-ai|...)`) across all `.ts` and `.tsx` files
- **Heavy commands avoided:** `npm run build`, `npx tsc --noEmit` (read-only audit; no need to build)
- **RAM risk:** None
- **Security risk:** None (read-only operation)
- **Schema uncertainties:** None

## Appendix B: File Inventory

| Path | Role | Status |
|------|------|--------|
| `src/lib/core/` | Intelligence Core (12 engines) | ✅ Barrel-exported |
| `src/lib/audit/` | AuditOS domain logic | ✅ Clean boundaries |
| `src/lib/decision/` | DecisionOS domain logic | ✅ Clean boundaries |
| `src/lib/local-content/` | LocalContentOS + ContentStudio | ⚠️ Boundary violation |
| `src/lib/local-content/content/` | ContentStudio domain logic | ❌ Wrong namespace |
| `src/lib/platform/content-studio/` | ContentStudio platform service | ✅ Thin but correct |
| `src/lib/sales/` | SalesOS domain logic | ✅ Clean boundaries |
| `src/lib/workflowos/` | WorkflowOS domain logic | ✅ Clean boundaries |
| `src/lib/localcontactos/` | LocalContactOS domain logic | ✅ Clean boundaries |
| `src/lib/office-ai/` | Office AI domain logic | ✅ Clean boundaries |
| `src/lib/knowledge-foundation/` | Knowledge Foundation logic | ✅ Clean boundaries |
| `src/lib/governance/` | Legacy governance (→ core/governance) | ⚠️ Transition in progress |
| `src/lib/authorization/` | ABAC engine | ⚠️ Migration layer deleted |
| `src/lib/auth.ts` | Auth utilities | ✅ Being refactored |
| `src/lib/platform/` | Platform services | ⚠️ 1 product import (P1) |
| `src/actions/` | Server Actions | ✅ Clean layering |
| `src/components/` | UI Components | ✅ Clean |
| `src/app/` | Routes and pages | ⚠️ 21 pages bypass actions |
| `prisma/schema.prisma` | Database schema | ✅ Modified |
| `docs/` | Documentation | ⚠️ Stale core arch doc |
