# AQLIYA — OpenCode Product Boundary Review
**Date:** 2026-08-16  
**Scope:** All product domains, cross-product coupling, SalesOS deep dive, deployability assessment

---

## 1. Product Inventory

| Product | Route Prefix | `src/lib/` Domain | `src/app/` Routes | Schema Models | Plugin Registered? |
|---|---|---|---|---|---|
| AuditOS | `/audit` | `src/lib/audit/` | 25+ (engagements, TB, mapping, statements, notes, evidence, findings, review, approval, sampling, materiality, independence, quality, knowledge, pilot) | 45+ | ✅ `AuditOSPlugin` |
| LocalContentOS | `/local-content` | `src/lib/local-content/` | 20+ (projects, suppliers, spend, classification, evidence, findings, review, approval, reports, workbook, ai-advisor, health, tender-match) | 15+ | ✅ `LocalContentOSPlugin` |
| SalesOS | `/sales` | `src/lib/sales/` + `src/lib/salesos/` | 20+ (dashboard, pipeline, deals, accounts, activities, intelligence, command-center, review, approval, outreach, forecast, settings) | 10 | ✅ `SalesOSPlugin` |
| DecisionOS | `/decisions` | `src/lib/decision/`, `src/lib/simulation/`, `src/lib/recommendation/` | 15+ (list, detail, new, gov, framework, scenarios, risks, tender, signals, simulation, outcomes) | 20+ | ❌ No plugin |
| WorkflowOS | `/workflowos` | `src/lib/workflowos/` | 6+ (dashboard, templates, records, admin, client records) | 2 | ⚠️ Kernel bridge only |
| RiskOS | `/risk` | `src/lib/risk/` | 4+ (dashboard, assessments, detail) | 3 | ❌ No plugin |
| Office AI Assistant | `/assistant`, `/office-ai` | `src/lib/office-ai/` | 5+ (tasks, stats, advanced, templates, schedules) | 5 | ❌ No plugin |
| LocalContactOS | `/contacts` | `src/lib/localcontactos/` | 6+ (dashboard, list, detail, new, graph, analytics) | 6 | ❌ No plugin |
| ContentStudio | `/content-studio` | `src/lib/content-studio/` | 5+ (workspace, create, edit, templates) | 6 | ❌ No plugin |
| Institutional Memory | `/institutional-memory` | `src/lib/core/memory/` | 3+ (events, collections, graph) | 2 | ❌ No plugin |

---

## 2. Product Boundary Assessment

| Product | Clear Boundary | Independent Domain | Independent Routes | Independent Data | Hidden Product Deps | Can Deploy Independently? |
|---|---|---|---|---|---|---|
| **AuditOS** | ✅ | ✅ | ✅ | ✅ | Kernel `audit.ts` bridge | ❌ (kernel depends on it) |
| **LocalContentOS** | ✅ | ✅ | ✅ | ✅ | None visible | ❌ (kernel depends on it) |
| **SalesOS** | ⚠️ | ⚠️ | ✅ | ✅ | Dual impl; platform ops import from `sales/` | ❌ (kernel + platform depend on it) |
| **DecisionOS** | ⚠️ | ⚠️ | ✅ | ✅ | Scattered across 3 directories; no plugin | ❌ (no plugin, but logic is real) |
| **WorkflowOS** | ✅ | ✅ | ✅ | ✅ | Kernel `workflowos.ts` bridge | ❌ (kernel depends on it) |
| **RiskOS** | ✅ | ✅ | ✅ | ✅ | None visible | ❌ (not registered in kernel) |
| **Office AI** | ✅ | ✅ | ✅ | ✅ | None visible | ❌ (not registered in kernel) |
| **LocalContactOS** | ✅ | ✅ | ✅ | ✅ | Queries `prisma.salesAccount`/`salesDeal` directly | ❌ (data coupling to SalesOS) |
| **ContentStudio** | ✅ | ✅ | ✅ | ✅ | None visible | ❌ (not registered in kernel) |

**Key Insight:** No product can be independently deployed because the kernel either hardcodes it (`bootstrap.ts`), re-exports its internals (`audit.ts`, `workflowos.ts`), or platform operations import from it. However, **product-to-product code imports are zero** — the coupling is one-way from platform to products.

---

## 3. SalesOS Deep Dive

SalesOS is the most heavily scrutinized product in this boundary review because it has a dual implementation and is the source of the only confirmed P0 security gap.

### 3.1 Route Inventory & Status

| Route | Status | Evidence |
|---|---|---|
| `/sales` (dashboard) | **IMPLEMENTED** | Real Prisma counts, pipeline board, account signals |
| `/sales/pipeline` | **IMPLEMENTED** | Full Kanban board with stages, deal cards, health badges |
| `/sales/deals` | **IMPLEMENTED** | List view with create, empty states |
| `/sales/deals/[id]` | **IMPLEMENTED** | Detail with evidence panel, interactions, status forms |
| `/sales/deals/new` | **IMPLEMENTED** | Create form with `createSalesDealAction` |
| `/sales/activities` | **IMPLEMENTED** | Interaction list via `listOrgSalesActivitiesAction` |
| `/sales/signals` | **STUB** | Real signal rows but banner says "stub — no CRM auto-collection" |
| `/sales/intelligence` | **IMPLEMENTED** | Intelligence hub with market view, competitor memory |
| `/sales/command-center` | **IMPLEMENTED** | Conversion funnel, top opportunities, metrics |
| `/sales/review` | **IMPLEMENTED** | Review list with `listPendingOpportunityReviewsAction` |
| `/sales/approval` | **IMPLEMENTED** | Approval workflow UI |
| `/sales/audit-trail` | **IMPLEMENTED** | Audit events via `listOrgSalesAuditEventsAction` |
| `/sales/outreach` | **IMPLEMENTED** | Campaigns and sequences |
| `/sales/accounts` | **SHELL** | Redirects to `/sales` — "list routes not yet shipped" |
| `/sales/accounts/[id]` | **IMPLEMENTED** | Account detail with ICP, contacts, deals, interactions |
| `/sales/settings/crm` | **IMPLEMENTED** | CRM connection cards |

### 3.2 Server Actions (CRUD & Workflow)

Sales actions are organized in a barrel (`src/actions/sales-actions/index.ts`) re-exporting ~33 actions from 7 modules:

| Module | Actions | Status |
|---|---|---|
| `sales-actions/accounts.ts` | list, get, create, update, recalculate ICP | **IMPLEMENTED** |
| `sales-actions/deals.ts` | list, get, create, update, next action, create from account | **IMPLEMENTED** |
| `sales-actions/interactions.ts` | create, update, delete | **IMPLEMENTED** |
| `sales-actions/governance.ts` | record review, list pending, approve, submit review, link/unlink evidence | **IMPLEMENTED** |
| `sales-actions/pipeline.ts` | list stages, dashboard stats, activities, audit events, signals | **IMPLEMENTED** |
| `sales-actions/ai-intelligence.ts` | recalculate risk, analyze objection, draft follow-up, approve draft, upsert memo, create outreach | **IMPLEMENTED** |

All actions use `requireSalesPermission()`, `assertSalesAccountAccess()`, `scopeFromCtx()`, and call `recordSalesAuditEvent()` / `writePlatformAuditLog()`.

### 3.3 Prisma Model Usage

All 10 SalesOS models are actively queried in production code (544+ references):

| Model | Used? |
|---|---|
| `SalesPipeline` | ✅ Integration tests, dashboard |
| `SalesPipelineStage` | ✅ Pipeline page, read actions |
| `SalesAccount` | ✅ Services, cross-product service |
| `SalesDeal` | ✅ Services, L5 governance, integration tests |
| `SalesEvidenceLink` | ✅ Evidence panel, link/unlink actions |
| `SalesInteraction` | ✅ Activities page, interaction actions |
| `SalesContact` | ✅ Account detail |
| `SalesProposal` | ✅ L5 governance (submit for review) |
| `SalesReview` | ✅ L5 governance, review list |
| `SalesApproval` | ✅ L5 governance, approval workflow |

### 3.4 Intelligence Connectors

| Connector | Base URL | Status |
|---|---|---|
| Apollo | `https://api.apollo.io/api/v1` | **IMPLEMENTED** |
| Ocean.io | `https://api.ocean.io/v1` | **IMPLEMENTED** |
| Clay | `https://api.clay.com/v2` | **IMPLEMENTED** |
| SmartLead | `https://api.smartlead.ai/api/v1` | **IMPLEMENTED** |
| LinkedIn | `https://api.linkedin.com/v2` | **IMPLEMENTED** |

- Factory registry: `src/lib/sales/intelligence/factory.ts`
- Webhook receiver: `src/app/api/sales/intel/webhook/route.ts` (HMAC-SHA256)
- OAuth callback: `src/app/api/sales/intel/oauth/callback/route.ts`

### 3.5 DoD Assessment (AGENTS.md §21.5)

| DoD Item | Status | Gap |
|---|---|---|
| Accounts/organizations | **IMPLEMENTED** | |
| Contacts/stakeholders | **IMPLEMENTED** | |
| Opportunities | **IMPLEMENTED** | `SalesDeal` serves as opportunities |
| Sales memory | **IMPLEMENTED** | Intelligence memory service |
| Interaction logs | **IMPLEMENTED** | |
| Qualification | **IMPLEMENTED** | `qualificationScore` field + action |
| Next actions | **IMPLEMENTED** | `updateDealNextActionAction` |
| Governance/review | **IMPLEMENTED** | `SalesReview` + `SalesApproval` |
| Evidence-backed proposal | **IMPLEMENTED** | `SalesEvidenceLink` + link/unlink actions |
| Audit trail | **IMPLEMENTED** | `recordSalesAuditEvent()` + `PlatformAuditLog` |
| Pipeline dashboard | **IMPLEMENTED** | Real Kanban board |
| Exports / account brief | **PARTIAL** | Export route exists but no evidence of full bilingual PDF brief |
| Seed dataset | **IMPLEMENTED** | `scripts/seed-sales-l5.ts` |

**SalesOS Verdict:** **L4 Usable v0.1, approaching L5.** The accounts list is a redirect shell and signals are explicitly stubbed. Everything else is real Prisma-backed workflow with RBAC, audit, and tenant isolation (except the P0 `organizationId` bypass).

### 3.6 Dual Implementation Problem

| Directory | Pattern | Used By |
|---|---|---|
| `src/lib/sales/` | Store-based (legacy, ~50 files) | Platform operations, actions, UI |
| `src/lib/salesos/` | DDD/Clean Architecture (28 files) | Not used by platform or actions |

**Impact:** Divergent codebases, duplicated domain knowledge, unclear canonical implementation. Platform operations import from the legacy `sales/` directory, ignoring the newer `salesos/` layer.

---

## 4. Cross-Product Coupling Evidence

### Code-Level Coupling
- **Zero** direct `import` statements between product `src/lib/` directories.
- **Platform → Product:** `src/lib/platform/operations/` imports from `src/lib/sales/`. `src/lib/core/ai/handlers/` imports from `src/lib/audit/`.
- **Data-Level Coupling:** `src/lib/localcontactos/cross-product-service.ts` queries `prisma.salesAccount` and `prisma.salesDeal` directly.

### Data-Level Coupling
| Consumer | Queries | Target Product | File |
|---|---|---|---|
| LocalContactOS | `prisma.salesAccount`, `prisma.salesDeal` | SalesOS | `src/lib/localcontactos/cross-product-service.ts` |
| Platform (unified activity) | `salesInteraction`, `salesDeal` | SalesOS | `src/lib/platform/operations/unified-activity-runtime.ts` |
| Platform (unified task) | `salesApproval`, `salesReview` | SalesOS | `src/lib/platform/operations/unified-task-runtime.ts` |

**Assessment:** Data-level coupling is acceptable for a unified platform (shared database), but it means LocalContactOS cannot function without SalesOS models present in the schema.

---

## 5. Deployability Assessment

| Question | Answer |
|---|---|
| Can AuditOS be deployed without SalesOS? | ❌ No — kernel hardcodes SalesOS plugin and core AI imports AuditOS handler |
| Can LocalContentOS be deployed without AuditOS? | ❌ No — kernel hardcodes AuditOS plugin |
| Can a new product be added without editing kernel? | ❌ No — `bootstrap.ts` requires static import and instantiation |
| Can products be independently versioned? | ⚠️ Partial — products have independent routes and tests, but share a monolithic schema and kernel |
| Can the platform run as a "kernel only" service? | ❌ No — kernel contains product bridge files |

---

*End of Product Boundary Review.*
