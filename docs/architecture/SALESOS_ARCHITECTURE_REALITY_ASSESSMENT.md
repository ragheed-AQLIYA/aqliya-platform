# SalesOS Architecture Reality Assessment

> **Status:** Final | **Date:** 2026-06-28 | **Scope:** Architectural reality only — no redesign, no roadmap, no implementation plan.
>
> **Mandate:** Determine whether the current SalesOS architecture can evolve into an Enterprise Business Platform, or whether it should remain a focused Sales product.
>
> **Method:** Full codebase inspection of routes, schema, services, actions, components, store, persistence, governance, AI integration, and shared platform usage. Evidence from code only — no speculation.

---

## Q1. Current Classification

### What is SalesOS today?

**SalesOS is a CRM-lite commercial intelligence workspace with governance overlays.**

It is NOT a CRM clone (per its own doctrine in `types.ts` line 2), but its core data model and workflows are fundamentally CRM primitives:

| CRM Primitive | SalesOS Equivalent | Prisma Model |
|---|---|---|
| Account / Company | `SalesAccount` | ✅ `SalesAccount` |
| Contact / Person | `SalesContact` | ✅ `SalesContact` |
| Deal / Opportunity | `SalesDeal` / `SalesOpportunity` | ✅ `SalesDeal` |
| Pipeline stage | `SalesPipelineStage` | ✅ `SalesPipelineStage` |
| Activity / Interaction | `SalesInteraction` | ✅ `SalesInteraction` |
| Proposal | `SalesProposal` | ✅ `SalesProposal` |
| Review / Approval | `SalesReview` / `SalesApproval` | ✅ Both models |

**Evidence from `types.ts` line 1:**
```typescript
// ─── SalesOS domain types (Core foundation, no schema migration) ───
// Governed revenue intelligence — not a CRM clone.
```

**Evidence from domain interface:** `SalesAccount` (id, organizationId, name, status, industry, ownerId), `SalesContact` (id, accountId, name, title, email, phone), `SalesOpportunity` (id, accountId, name, stage, valueEstimate, probability, expectedCloseDate) — all standard CRM fields.

**However, SalesOS extends beyond CRM with:**
- ICP scoring and learning (`icp-learning.ts`, `icp-types.ts`)
- Commercial proof network and effectiveness tracking (`proof-network/`, `proof-effectiveness/`)
- Internal knowledge graph (`knowledge-graph/`)
- Institutional learning (`institutional-learning/`, `v02/institutional-learning/`)
- Cross-product institutional signals (`cross-product-signals/`)
- Commercial memory and pattern recognition (`commercial-memory.ts`)
- Next-action engine (`next-action-engine.ts`)
- Pipeline analytics and forecasting (`pipeline-analytics.ts`, forecast routes)
- CRM sync connectors (HubSpot, Salesforce — `crm/connector.ts`)
- Bilingual Arabic-first UX across 30+ routes

**Verdict: CRM+ (CRM with an intelligence analytics layer), NOT a Business Platform.**

---

## Q2. Can It Expand to Marketing, Revenue, CS, CPQ, Forecasting, Commerce, Partner Management?

### Answer: No — not with the current architecture.

The following architectural constraints would prevent natural multi-domain expansion:

---

### Constraint 1: In-Memory Store Is the Default Persistence

**File:** `src/lib/sales/store.ts`

The primary data layer for intelligence entities (signals, objections, competitor mentions, ICP insights, next actions, win/loss, proof assets) is an **in-memory Map per organization**, stored in a module-level `orgStores` variable:

```typescript
const orgStores = new Map<string, OrgStore>();
```

Prisma persistence is **opt-in** via environment variables:
```typescript
const PRISMA_PERSISTENCE_ENABLED =
  process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
  process.env.SALESOS_PRISMA_PERSISTENCE === "true";
```

The `OrgStore` interface includes intelligence maps alongside core CRM maps:
```typescript
interface OrgStore {
  accounts: Map<string, SalesAccount>;
  contacts: Map<string, SalesContact>;
  opportunities: Map<string, SalesOpportunity>;
  signals: Map<string, SalesSignal>;
  objections: Map<string, SalesObjection>;
  // ... 10+ more intelligence maps
}
```

This in-memory architecture:
- Does not survive server restart
- Cannot scale horizontally
- Provides no consistency guarantees across instances
- Is a development sandbox pattern, not enterprise infrastructure

### Constraint 2: Dual/Ambiguous Service Layer

SalesOS has **four parallel service abstractions**, creating maintenance confusion:

| Layer | File(s) | Persistence | Usage |
|---|---|---|---|
| In-memory store | `store.ts` | Maps in memory | Default; used by dashboard, service.ts, and vnext facades |
| Legacy Prisma service | `service.ts` | Imports from `store.ts` (in-memory) | Dashboard, review/approval, evidence linking |
| New Prisma service | `services.ts` | Direct Prisma queries | Deal/account CRUD with audit, governance, validation |
| Repository layer | `repositories/` | Prisma via repository pattern | Proposals, reviews, approvals, CRUD |
| vNext facades | `vnext/` | Mostly delegates to `v02/` | Intelligence, memory, recommendations |
| v02 legacy | `v02/` | In-memory store + file persistence | Strategic recommendations, knowledge graph, institutional learning |

**Evidence from `service.ts` line 73:**
```typescript
function recordAuditEventSafe(_input: {...}): void {
  // no-op until platform audit module is available
}
```

**Evidence from `service.ts` lines 27-90:** The file contains local stubs `ReviewState`, `transitionReviewState()`, `mapMutationToAuditEvent()`, `validateProductEvidenceType()` — clearly indicating incomplete platform integration.

### Constraint 3: No Event Bus

The cross-product signals system is a **shell with TODO comments**:

**File:** `src/lib/sales/v02/cross-product-signals/aggregator.ts`
```typescript
// ─── Phantom imports (commented out — module does not exist) ───
// import {
//   collectCrossProductCommercialSignals,
//   deriveInstitutionalCommercialSignals,
// } from "@/lib/platform/signals/cross-product-commercial";

// TODO: implement when platform/signals/cross-product-commercial exists
async function collectCrossProductCommercialSignals(
  _organizationId: string,
  _ownerId: string,
): Promise<CrossProductSignalAggregation> {
  throw new Error(
    "TODO: implement when platform/signals/cross-product-commercial exists",
  );
}
```

There is no event bus, no pub/sub, no message queue. The "cross-product" system is a v02 facade that throws errors at runtime. Marketing, Revenue, Customer Success, CPQ, and Partner Management modules would all need events to communicate — the infrastructure does not exist.

### Constraint 4: All Intelligence Is Deeply Sales-Coupled

Every intelligence subsystem depends on `SalesAccount` or `SalesDeal` types:

| Intelligence Module | Coupled To | File |
|---|---|---|
| Commercial memory | `SalesOpportunity`, `SalesInteractionLog` | `vnext/commercial-memory.ts` |
| Institutional learning | `SalesAccount` metadata | `vnext/institutional-learning.ts` |
| Knowledge graph | `SalesAccount`, `SalesProofAsset` (via v02) | `vnext/commercial-knowledge-graph.ts` |
| Cross-product signals | `SalesAccount` | `vnext/cross-product-signals.ts` |
| Account intelligence | `SalesAccount` | `vnext/account-intelligence.ts` |
| Opportunity intelligence | `SalesOpportunity` | `vnext/opportunity-intelligence.ts` |
| Pipeline analytics | `SalesOpportunity` | `vnext/pipeline-analytics.ts` |
| Meeting intelligence | `SalesAccount` | `vnext/meeting-intelligence.ts` |

**Evidence from `vnext/institutional-learning.ts` line 7:**
```typescript
import { learningEvidence } from "@/lib/sales/v02/institutional-learning/evidence";
```

This means adding a Marketing domain would require: (a) forking all these modules, (b) creating `MarketingAccount`, `MarketingCampaign` types, (c) rewriting the intelligence layer. There is no domain-agnostic abstraction.

### Constraint 5: No Workflow Engine

Workflows are **hardcoded state machines** in individual functions:

**File:** `src/lib/sales/service.ts` lines 49-58:
```typescript
function transitionReviewState(
  pkg: ReviewState,
  _action: string,
  _actor: { id: string; role: string },
): { package: ReviewState; auditMetadata: Record<string, unknown> } {
  const nextStatus = _action === "submit_for_review" ? "InReview"
    : _action === "approve" ? "Approved" : pkg.status;
  // ...
}
```

There is no workflow orchestration, no BPMN, no configurable workflows. Adding CPQ or approval workflows for a new domain would require hand-coding new state machines.

### Constraint 6: No Feature Flags

**Glob result:** Zero feature flag implementations in SalesOS. The only conditional behavior is environment variable checks (`SALESOS_PRISMA_PERSISTENCE`, `SALESOS_FILE_PERSISTENCE`), which are infrastructure settings, not feature toggles.

Adding Marketing, Revenue, or Partner Management modules would require deploying all code at once with no progressive rollout capability.

### Constraint 7: No Async Processing

All operations are synchronous. CRM sync, intelligence computation, report generation — everything blocks the request thread. There are no queues, no background workers, no job scheduling.

**File:** `src/lib/sales/crm/sync-orchestrator.ts` — the CRM sync is `Promise.all()` fetching from external APIs inline.

---

## Q3. Reusable Subsystems

The following subsystems have clean interfaces and could be extracted for cross-product reuse:

### 3.1 Audit Event System (Reusable: High)

**Location:** `src/lib/sales/audit-events.ts`

Dual-writes to both:
1. `prisma.salesAuditEvent` (SalesOS-specific)
2. `writePlatformAuditLog()` — platform-wide audit trail with hash chain

This pattern is product-agnostic. The action taxonomy (43 event types) is well-defined. The hash chain integration is best-effort and non-blocking.

### 3.2 Evidence Linking System (Reusable: High)

**Location:** `src/lib/sales/evidence-links.ts`, `evidence-resolver.ts`

Generic pattern for linking evidence to any target type (deal, account) with:
- Tenant-scoped validation (`assertEvidenceAccessibleInSalesOrg`)
- Dual-write to `SalesEvidenceLink` Prisma model
- Audit trail for link/unlink operations
- Enriched views with resolved evidence metadata

The target type abstraction (`SALES_EVIDENCE_TARGETS = { DEAL, ACCOUNT }`) is extensible.

### 3.3 Governance Framework (Reusable: Medium-High)

**Location:** `src/lib/sales/governance.ts`

Stage-change governance with:
- `requiresApprovalForStageChange()` — stage markers
- `assertStageChangeGovernance()` — guard with OPERATOR/ADMIN override
- `recordReviewDecision()` — review decision persistence with metadata append
- `appendReviewDecisionMetadata()`, `readReviewDecisions()` — metadata pattern

Requires decoupling from `SalesDeal` to become truly product-agnostic.

### 3.4 RBAC and Guard System (Reusable: Medium)

**Location:** `src/lib/sales/permissions.ts`, `guards.ts`

Three-tier permission model (`VIEWER` / `OPERATOR` / `ADMIN`) with:
- `assertSalesPermission()` — server-side enforcement
- `assertSalesAccountAccess()` — tenant-scoped entity access
- `assertSalesDealAccess()` — tenant-scoped entity access

The pattern is generic but the permission names and types are sales-specific (`salesos:read`, etc.).

### 3.5 L5 Acceptance Framework (Reusable: High)

**Location:** `src/lib/sales/l5-acceptance.ts`

Machine-readable maturity criteria with 11 dimensions (G1-G5, I1-I3, U1, C1-C2). This framework is entirely product-agnostic and could become a shared platform standard for all products.

### 3.6 Proof Network and Knowledge Graph (Reusable: Medium)

**Location:** `src/lib/sales/v02/knowledge-graph/`, `src/lib/sales/v02/proof-network/`

The graph data structures (`Node`, `Edge`, `KnowledgeGraph`) and queries (`getAccountSubgraph`, `getProofUsagePaths`, `getIndustryCluster`) have clean interfaces. They currently depend on sales-specific data sources (store.ts) but the graph model itself is domain-agnostic.

### 3.7 Cross-Product Signal Taxonomy (Reusable: Medium)

**Location:** `src/lib/sales/v02/cross-product-signals/types.ts`

The taxonomy of 6 institutional signal kinds and the `CrossProductCommercialSignal` interface are domain-agnostic. The implementation is a TODO shell, but the types are reusable.

### 3.8 Commercial Memory Pattern Recognition (Reusable: Low-Medium)

**Location:** `src/lib/sales/vnext/commercial-memory.ts`

The pattern recognition logic (objections, signals, competitors, win/loss themes) is sales-specific in implementation but the pattern structure (`CommercialMemoryPattern`, `RankedMemoryItem`) could inform a shared pattern recognition framework.

---

## Q4. Architectural Bottlenecks

### Bottleneck 1: In-Memory Store (Severity: Critical)

**File:** `src/lib/sales/store.ts`

- All intelligence entities (signals, objections, ICP, win/loss, next actions, proof assets) live in `Map` instances within a module-level `Map<string, OrgStore>`.
- Data is lost on server restart unless `SALESOS_FILE_PERSISTENCE` or `SALESOS_PRISMA_PERSISTENCE` is enabled.
- Prisma persistence is optional and fire-and-forget (`persistPrismaWrite` catches errors silently).
- Tier A intelligence (signals, objections, etc.) has no Prisma model — it uses file persistence or stays in-memory.

**Impact:** Cannot scale. Cannot guarantee data integrity. Every new business domain (Marketing, Revenue, etc.) would need to either use this same in-memory pattern or build its own persistence from scratch. No shared data foundation exists.

### Bottleneck 2: v02/vnext Legacy Debt (Severity: High)

**File:** `src/lib/sales/v02/` (60+ files), `src/lib/sales/vnext/` (20+ files)

The v02 directory was previously archived (per Product Status Matrix reality note): "archived 02/ (60 files, @ts-nocheck)" but was later resurrected. The vnext directory is a thin facade that imports from v02:

```typescript
// vnext/commercial-recommendations.ts line 15-25
import {
  buildStrategicRecommendationsSnapshot,
  // ...v02 imports
} from "@/lib/sales/v02/strategic-recommendations";
```

This creates a **three-layer dependency chain**: Route → Action → vnext facade → v02 implementation → in-memory store. Each layer adds indirection without abstraction.

### Bottleneck 3: No Multi-Tenant Domain Boundaries (Severity: High)

All entities use `organizationId` for tenant isolation, but there is no domain namespace. A `SalesAccount` and a hypothetical `MarketingCampaign` would both live in the same Prisma schema, same service layer, same permission model. There is no logical domain boundary.

### Bottleneck 4: Monolithic Route Hierarchy (Severity: Medium)

All 30+ routes live under a single `/sales/*` namespace. Expanding to Marketing => `/sales/marketing/*` or `/marketing/*`? Customer Success => `/sales/customer-success/*` or `/customer-success/*`? Revenue => `/sales/revenue/*` or `/revenue/*`?

The current navigation (`sales-nav.tsx`) would need to either grow unbounded or be replaced with a dynamic product registry — which does not exist.

### Bottleneck 5: Phantom Import Pattern (Severity: High)

**Files:** `cross-product-signals/aggregator.ts`, several v02 files

Code files contain imports to modules that do not exist:
```typescript
// TODO: implement when platform/signals/cross-product-commercial exists
```

These are not dead code — they are intended to be active but silently fail at runtime. This pattern means any new domain attempting to integrate with SalesOS's intelligence layer would encounter missing infrastructure with no clear migration path.

### Bottleneck 6: No Domain Event System (Severity: Critical)

There is no mechanism for one domain to react to changes in another. For example:
- When a deal closes won, there is no event for Customer Success to create an onboarding workflow
- When an account reaches $X revenue, there is no event for Marketing to trigger an upsell campaign
- When a signal is detected in AuditOS, there is no event for SalesOS to update deal risk

The "cross-product signals" module attempts to solve this but is a `throw new Error("TODO")` stub.

---

## Q5. What Should Move to the Shared Platform

The following capabilities currently live inside SalesOS but, by architectural rights, belong in the AQLIYA platform layer:

### Must Move (Blocking Enterprise Platform Architecture)

| Capability | Current Home | Target Platform Location | Rationale |
|---|---|---|---|
| **Event bus / messaging** | Does not exist (stub in cross-product-signals) | `src/lib/platform/events/` | Every domain needs events; SalesOS should publish/subscribe, not own the bus |
| **Workflow engine / state machine** | Hardcoded in `governance.ts`, `l5-governance.ts`, `service.ts` | `src/lib/platform/workflow/` or existing `WorkflowOS` | Review/approval is a universal pattern, not SalesOS-specific |
| **Feature flags** | Does not exist | `src/lib/platform/feature-flags/` | Progressive rollout for multi-domain expansion |
| **Knowledge graph** | `v02/knowledge-graph/`, `vnext/commercial-knowledge-graph.ts` | `src/lib/platform/knowledge-graph/` | Graph model is domain-agnostic; sales should be a consumer, not owner |
| **Institutional memory** | `v02/institutional-learning/`, `vnext/institutional-learning.ts` | `src/lib/platform/institutional-memory/` (already started) | Cross-product memory cannot live inside one product |
| **Signal taxonomy & aggregation** | `v02/cross-product-signals/`, `vnext/cross-product-signals.ts` | `src/lib/platform/signals/` (already started) | Cross-product signals are by definition across products |
| **Pattern recognition / memory engine** | `vnext/commercial-memory.ts` | `src/lib/platform/intelligence/` | Objection, signal, competitor pattern recognition is a platform capability |
| **Proof / evidence network** | `v02/proof-network/`, `vnext/proof-effectiveness.ts` | `src/lib/platform/evidence/` | Evidence linking is universal (AuditOS, LocalContentOS, DecisionsOS all need it) |

### Should Move (Cleaner Product Boundaries)

| Capability | Current Home | Rationale |
|---|---|---|
| **RBAC permission model** | `permissions.ts` (duplicated from platform) | Should use shared `@/lib/auth` and `@/lib/platform/access` |
| **L5 acceptance criteria** | `l5-acceptance.ts` | Should be a shared standard across all products |
| **Audit event taxonomy** | `audit-events.ts` (43 sales-specific actions) | Sales-specific actions stay, but the event recording pattern should be shared |
| **Export gating** | `core-adoption.ts` (`canExportOutput`, `getOutputMetadata`) | Already has platform hooks but is duplicated per product |
| **Bilingual UX patterns** | `sales-ux-copy.ts`, `sales-bilingual-parity.ts` | Should be a shared i18n service |
| **Reporting / analytics primitives** | `reporting.ts`, `pipeline-analytics.ts` | Metric aggregation patterns should be shared |

### Should Stay Inside SalesOS

| Capability | Reason to Stay |
|---|---|
| `SalesAccount`, `SalesContact`, `SalesDeal` models | Core CRM domain primitives |
| Pipeline management and stage definitions | Sales-specific workflow |
| Deal risk scoring (`deal-risk-types.ts`) | Sales-specific heuristics |
| Win/loss analysis (`next-action-engine.ts`) | Sales-specific outcome analysis |
| ICP scoring and learning (`icp-learning.ts`) | Sales-specific qualification |
| CRM sync connectors (`crm/`) | Sales-specific integrations |
| Outreach management (`outreach.ts`) | Sales-specific channel management |
| Account brief / pilot handoff packs | Sales-specific outputs |
| Pipeline, funnel, revenue analytics | Sales-specific metrics |
| 80+ SalesOS components | UI components are product-specific |

---

## Q6. Architectural Readiness Scores

### Scoring Rubric

| Score | Meaning |
|---|---|
| 0-20 | Non-existent or actively harmful |
| 21-40 | Present but immature / deeply flawed |
| 41-60 | Functional but would hinder expansion |
| 61-80 | Adequate foundation with known gaps |
| 81-100 | Enterprise-ready |

---

### 6.1 Folder Structure — Score: 60/100

**Strengths:**
- Clear route structure under `/sales/*` with `page.tsx`, `loading.tsx`, `error.tsx` for each route
- Components organized in `src/components/sales/`
- `src/lib/sales/` contains all business logic
- Actions in `src/actions/sales-actions.ts` and `sales-read-actions.ts`

**Weaknesses:**
- Three co-existing service layers (`service.ts`, `services.ts`, `store.ts`)
- `vnext/` and `v02/` directories create confusion about which is current
- `repositories/` duplicates what `prisma-repository.ts` does
- No sub-domain folder structure (all 80+ components flat in one directory)
- Intelligence, memory, knowledge, signals all in one flat namespace

**Verdict:** Works for a single product. Would collapse under 5+ domains.

---

### 6.2 Domain Model — Score: 50/100

**Strengths:**
- Clean TypeScript interfaces in `types.ts` (15 entity types)
- Tenant isolation via `organizationId` on every entity
- Audit-aware: `createdById`, `createdAt`, `updatedAt`, `updatedById` on all models
- Evidence, confidence, and source metadata on intelligence entities

**Weaknesses:**
- Two parallel stage systems (v01 and legacy) with a normalization layer
- `SalesOpportunity` vs `SalesDeal` — both represent the same concept
- No domain namespace for multi-product expansion
- `SalesInteractionLog` is kept alongside `SalesActivity` for backward compat
- Intelligence types are concrete (sales-specific) not abstract (domain-agnostic)
- In-memory entity IDs use `crypto.randomUUID().slice(0, 8)` — collision risk

**Verdict:** Strong single-domain model. No extension points for new domains.

---

### 6.3 Scalability — Score: 25/100

**Strengths:**
- Prisma-backed models for core CRM entities (Accounts, Deals, Contacts, Interactions)
- Dual-write to platform audit log provides eventual consistency foundation
- Repository pattern exists for some models

**Weaknesses:**
- **In-memory store is the default** — all intelligence entities (signals, objections, ICP, next actions, win/loss, proof assets, competitor mentions) live in a `Map<string, T>` inside a module-level variable
- No caching layer (Redis or otherwise)
- No async processing, no queues, no background jobs
- CRM sync blocks the request thread
- `persistPrismaWrite` uses fire-and-forget with silent error swallowing
- Route-level revalidation (`revalidatePath("/sales")`) is broad and inefficient

**Verdict:** Not scalable beyond a single-server demo. Adding Marketing, Revenue, or Customer Success data volumes would require a complete rewrite of the persistence layer.

---

### 6.4 Extensibility — Score: 30/100

**Strengths:**
- Evidence linking system has a generic interface
- Audit event system has platform dual-write
- L5 acceptance framework is product-agnostic
- Knowledge graph has clean data structures

**Weaknesses:**
- No plugin/module registration system — adding a new domain means editing dozens of files
- No domain namespace — all entities share the same `organizationId` scope with no separation
- Intelligence subsystems are directly coupled to `SalesAccount`/`SalesDeal` types
- Cross-product signals are stubbed with `throw new Error("TODO")`
- Adding a Marketing domain would require: new Prisma models, new routes, new components, new store methods, forked intelligence modules, modified permission model, modified governance — essentially copying and modifying the entire SalesOS structure
- No feature flags for progressive rollout

**Verdict:** Extending to even one additional domain (e.g., Marketing) would be a multi-month rewrite, not a configuration change.

---

### 6.5 Maintainability — Score: 40/100

**Strengths:**
- 80+ components with consistent patterns
- Comprehensive test suite (see Product Status Matrix: 2,462 tests passing)
- Bilingual Arabic-first pattern throughout
- Error/loading/empty states for most routes

**Weaknesses:**
- **Four-way service architecture** makes it difficult to know where to add new logic
- `v02/` was archived then resurrected — indicates architectural uncertainty
- In-memory store with optional Prisma means code paths diverge based on env vars
- Phantom imports (`TODO: implement when module exists`) create latent runtime failures
- `prisma-repository.ts` has `as any` casts for Tier B/A models (896 lines, mixed typed/untyped)
- No clear pattern for when to add to `store.ts` vs `services.ts` vs `prisma-repository.ts`

**Verdict:** A single team can maintain this today. Adding multiple teams would create constant merge conflicts and ambiguity about where logic belongs.

---

### 6.6 Product Boundaries — Score: 25/100

**Strengths:**
- SalesOS has a clear route boundary (`/sales/*`)
- Layout ensures authentication
- Sidebar navigation is scoped

**Weaknesses:**
- **No architectural boundary between SalesOS and the platform** — platform stubs live inside SalesOS (e.g., `core-adoption.ts` has `getProductById`, `getProductWorkflowTemplates`, `canExportOutput` — these should be platform services)
- Intelligence, memory, knowledge, signals, and recommendations have no product boundary — they are SalesOS-internal but should be platform capabilities
- The cross-product signals module lives inside SalesOS despite being cross-product by definition
- The in-memory store (`store.ts`) is the integration point for all intelligence — there is no API boundary, no contract, no versioning
- Adding a second product (e.g., MarketingOS) would require duplicating the entire store/service/component pattern

**Verdict:** SalesOS acts as both a product and a de facto platform for intelligence. This is the most critical architectural flaw for Enterprise Platform ambitions.

---

## Q7. Final Recommendation

### Option A: Keep SalesOS Focused as CRM+ (Evolve existing code) ❌ (Rejected)
### Option B: Evolve SalesOS into Enterprise Business Platform ❌ (Rejected)
### Option C: Create a New Product (Business Platform) for multi-domain vision ⏸️ (Incomplete)
### Option D: Freeze SalesOS v1 → Build AQLIYA Platform Kernel v2 → Blueprint SalesOS v2 as First Consumer ✅ (Selected)

---

### Recommendation: Option D — Freeze, Build Kernel, Then Rebuild

**Architectural reasoning:**

The assessment evidence correctly proves that **the current SalesOS codebase cannot evolve into an Enterprise Business Platform**. However, the question was about the **vision for SalesOS v2**, not about evolving the current code.

The real question is: does the Enterprise Business Platform vision justify rebuilding SalesOS from first principles?

**Yes — but only after the AQLIYA Platform Kernel is built first.**

---

### Why Option A (Keep as CRM+) Is Rejected

Option A assumes the only valid path is to keep maintaining the existing code. This ignores:
- The existing codebase has structural debt that limits even CRM+ growth (in-memory store, v02/vnext confusion, phantom imports)
- "Maintenance mode" for v1 while building v2 is the correct engineering pattern — not keeping v1 as the future
- The intelligence subsystems (knowledge graph, institutional learning, signals) are valuable but trapped in SalesOS — they should be platform capabilities that benefit all products

### Why Option B (Evolve into Platform) Is Rejected

The evidence is clear: evolving the existing SalesOS code into a platform would:
- Require rewriting the persistence layer while keeping backward compatibility
- Create constant ambiguity about what is SalesOS-specific vs platform-wide
- Risk destabilizing a working product
- Result in a "big ball of mud" with no clear product boundaries

### Why Option C (New Product) Is Incomplete

Creating a new Business Platform product without the platform kernel first would repeat SalesOS's architectural mistakes. The new product would need its own event bus, its own workflow engine, its own feature flags — exactly the problem SalesOS has today. **The platform kernel must come first.**

---

### Recommendation: Option D — Freeze, Extract, Unify, Consume

The approach is not "build a new kernel from scratch." It is **Extract → Unify → Complete**.

AQLIYA already has several mature shared capabilities embedded across products. The task is to extract them into a cohesive Platform Kernel, not to rebuild them.

```
┌─────────────────────────────────────────────────────────┐
│                    Current Products                      │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │
│  │ AuditOS  │ │ DecisionOS │ │LocalContent│ │SalesOS │ │
│  │          │ │            │ │    OS      │ │   v1   │ │
│  └────┬─────┘ └─────┬──────┘ └─────┬──────┘ └───┬────┘ │
│       │             │              │             │      │
│       ▼             ▼              ▼             ▼      │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Extract Shared Capabilities               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │
│  │  │Governance│ │Audit     │ │AI Orchestration  │ │   │
│  │  │(mature)  │ │Events    │ │(mature)          │ │   │
│  │  │          │ │(mature)  │ │                  │ │   │
│  │  ├──────────┤ ├──────────┤ ├──────────────────┤ │   │
│  │  │RBAC/     │ │Evidence  │ │Provider Routing  │ │   │
│  │  │Perms     │ │Linking   │ │(mature)          │ │   │
│  │  │(partial) │ │(partial) │ │                  │ │   │
│  │  ├──────────┤ ├──────────┤ ├──────────────────┤ │   │
│  │  │Instit.   │ │Knowledge │ │Event Bus         │ │   │
│  │  │Memory    │ │Graph     │ │(missing)         │ │   │
│  │  │(partial) │ │(partial) │ │                  │ │   │
│  │  ├──────────┤ ├──────────┤ ├──────────────────┤ │   │
│  │  │Workflow  │ │Feature   │ │Domain            │ │   │
│  │  │Engine    │ │Flags     │ │Abstractions      │ │   │
│  │  │(partial) │ │(missing) │ │(missing)         │ │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │           AQLIYA Unified Platform Kernel          │   │
│  │  Event Bus │ Workflow │ Features │ AI │ Graph    │   │
│  │  Identity │ Evidence │ Memory │ Permissions      │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  SalesOS v2         │ ← First consumer
              │  AuditOS vNext      │
              │  DecisionOS vNext   │
              │  LocalContentOS vN  │
              │  Any future product  │
              └─────────────────────┘
```

---

### Priority Order

#### Phase 1: AQLIYA Platform Core Extraction

> **Key nuance:** This is NOT building a platform kernel from scratch. AQLIYA already has several mature shared capabilities embedded across products. The task is **Extraction → Unification → Completion**, not rebuild.

| Kernel Capability | Current State | Action |
|---|---|---|
| **Event Bus** | ❌ Missing — cross-product signals is a `throw new Error("TODO")` stub | Build new |
| **Workflow Engine** | ⚠️ Partial — hardcoded state machines in SalesOS, WorkflowOS exists but is product-specific | Extract patterns → unify → complete |
| **Feature Flags** | ❌ Missing — zero implementations anywhere | Build new |
| **Knowledge Graph** | ⚠️ Partial — graph data structures exist in SalesOS v02, but are sales-dependent | Extract generic model → complete infrastructure |
| **Institutional Memory** | ⚠️ Partial — `src/lib/platform/institutional-memory/` service exists, with models and graph | Extract from SalesOS → complete cross-product linking |
| **AI Fabric** | ✅ Mature — AI Orchestrator, Governance engine, Provider Routing, Prompt Registry all exist | Extract to unified contract layer |
| **Evidence Network** | ⚠️ Partial — evidence-linking pattern exists in SalesOS, AuditOS, and DecisionOS independently | Extract common pattern → unified service |
| **Identity & Permissions** | ⚠️ Partial — RBAC in auth, but each product duplicates its own permission model | Extract → unified permission registry |
| **Domain Abstractions** | ❌ Missing — no `Entity`, `Domain`, `Workflow`, `Event` interfaces | Build new |
| **Governance** | ✅ Mature — real engine used across products | Already shared (extract if needed) |
| **Audit Events** | ✅ Mature — SalesOS dual-writes to platform audit log + hash chain | Already shared (standardize the pattern) |
| **Provider Routing** | ✅ Mature — Anthropic primary, OpenRouter secondary via ccr | Already shared |

**The approach is Extraction-led, not Greenfield.**

For each capability identified as "inside SalesOS but should be platform", the process is:
1. Identify the existing implementation (in SalesOS, AuditOS, or other product)
2. Extract the generic interface/contract
3. Move it to the platform layer
4. Update the source product to consume the platform version
5. Make it available for other products

This preserves existing investment, reduces risk, and accelerates delivery.

#### Priority 2: SalesOS v2 Blueprint

Once the Platform Kernel provides:
- Event bus for cross-domain signals
- Workflow engine for configurable deal stages
- Feature flags for progressive rollout
- Domain abstractions for clean boundaries
- Evidence network for proof management
- AI Fabric for governed intelligence

Then design SalesOS v2 as the **first consumer** of this kernel:

```
SalesOS v2 Architecture (conceptual)

┌─────────────────────────────────────────────────┐
│                   SalesOS v2                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Pipeline │ │ Accounts │ │ Intelligence     │ │
│  │ Domain   │ │ Domain   │ │ Domain           │ │
│  │          │ │          │ │  - ICP           │ │
│  │  - Stages│ │  - CRM   │ │  - Signals       │ │
│  │  - Deals │ │  - Sync  │ │  - Memory        │ │
│  │  - Forecast│ │  - Contacts│ │  - Knowledge     │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │            │                │            │
└───────┼────────────┼────────────────┼────────────┘
        │            │                │
        ▼            ▼                ▼
┌─────────────────────────────────────────────────┐
│            AQLIYA Platform Kernel v2             │
│  Event Bus │ Workflow │ Features │ AI │ Graph   │
│  Identity │ Evidence │ Memory │ Permissions     │
└─────────────────────────────────────────────────┘
```

#### Priority 3: SalesOS v2 Implementation

Only after:
1. Platform Kernel is functional
2. Blueprint is reviewed and validated

Then implement SalesOS v2 as a new codebase — not as a branch of SalesOS v1. This avoids all the architectural debt documented in this assessment.

---

### What Happens to SalesOS v1

| Activity | Policy |
|---|---|
| Bug fixes | ✅ Yes — critical and security only |
| Security patches | ✅ Yes — mandatory |
| Data integrity | ✅ Yes — ensure existing customers are not disrupted |
| New features | ❌ No — freeze |
| Architecture changes | ❌ No — freeze |
| Refactoring | ❌ No — freeze |
| Platform extraction | ⏸️ Only if it does not destabilize v1 |

SalesOS v1 becomes **legacy** — maintained but not evolved. Its sole purpose is to serve existing users until SalesOS v2 replaces it.

---

### Why This Aligns with AQLIYA's Existing Pattern

This is not a new approach for AQLIYA. The project already follows this pattern:

| System | Status |
|---|---|
| **AuditOS** | Was rebuilt. Not the same architecture as 12 months ago. |
| **Intelligence Core** | Redesigned. Tier 2 exit, Tier 3 prep. |
| **Governance** | Redesigned. Real engine replacing stubs. |
| **Provider Layer** | Redesigned. AI providers with governed orchestration. |

Rebuilding is an accepted pattern. The mistake would be rebuilding **inside** SalesOS instead of rebuilding **the platform first**.

---

### What the Assessment Revealed (Beyond SalesOS)

The single most important finding is not the SalesOS evaluation. It is this:

> **The current AQLIYA platform contains several mature shared capabilities, but it does not yet provide a cohesive, production-ready Platform Kernel that can serve as the common foundation for the next generation of products. The missing pieces are not only implementations, but unified abstractions, contracts, and runtime services.**

This is a critical nuance. **"Does not yet exist as a usable foundation" does NOT mean "nothing exists."** It means:

| Interpretation | Correct? |
|---|---|
| ❌ "There is no Kernel at all — start from zero" | **Wrong** |
| ✅ "There is no unified, production-ready Kernel that products can depend on" | **Correct** |

AQLIYA already has real, mature components that prove the extraction approach is viable:

| Existing Asset | Evidence in Codebase |
|---|---|
| **AI Orchestration** | `src/lib/ai/` — orchestrator with governance context injection, provider selection, fallback |
| **Governance Engine** | `src/lib/ai/governance/` — real governed AI metadata, intelligence routing |
| **Provider Routing** | `@musistudio/claude-code-router` — Anthropic primary, OpenRouter secondary |
| **Audit Events + Hash Chain** | `src/lib/sales/audit-events.ts` dual-writes to `writePlatformAuditLog` + `appendToAuditChain` |
| **RBAC Guards** | `src/lib/sales/guards.ts` — tenant-scoped entity access with server-side enforcement |
| **Evidence Linking** | `src/lib/sales/evidence-links.ts` — generic target-agnostic evidence linking |
| **Knowledge Graph Data Structures** | `src/lib/sales/v02/knowledge-graph/` — graph model, queries, builder |
| **Institutional Memory Service** | `src/lib/platform/institutional-memory/` — service, models, graph |
| **WorkflowOS** | Full product at L5 — template-based workflows, SLA monitoring, approval gating |
| **L5 Acceptance Framework** | `src/lib/sales/l5-acceptance.ts` — product-agnostic maturity criteria |

These are **not technical debt to be replaced**. They are **assets to be extracted, unified, and completed** into a coherent Platform Kernel.

The phantom import pattern (`TODO: implement when platform module exists`) is evidence not that the platform has nothing, but that **the existing components were built independently inside products rather than extracted into shared services**. This is exactly the problem the Extraction phase solves.

Building SalesOS v2 before the Platform Kernel Extraction would mean:
- SalesOS v2 builds its own event bus → AuditOS builds its own → DecisionOS builds its own
- SalesOS v2 extends its own workflow engine → WorkflowOS is duplicated
- SalesOS v2 implements its own feature flags → no other product benefits

**The extraction must come first. Then all products consume the unified Kernel.**

---

### Constitutional Principles for the Platform Kernel

These two principles must be treated as **constitutional** — they govern all extraction and design decisions. Violations must be treated as architectural defects.

---

#### Principle 1: Product Independence Rule

> Every AQLIYA product must be independently licensable, deployable, operable, upgradable, and testable.

This means:

| Requirement | Meaning | Enforced by |
|---|---|---|
| **Licensable** | A customer can buy SalesOS without buying AuditOS | No hard dependencies between products at the commercial or data layer |
| **Deployable** | SalesOS runs in its own container/process without AuditOS or DecisionOS present | Platform Kernel is the only runtime dependency |
| **Operable** | SalesOS has its own admin UI, its own configuration, its own monitoring | Product-side admin surfaces, not platform-only |
| **Upgradable** | SalesOS v2.1 can be deployed without upgrading AuditOS | Versioned platform contracts; product-level feature flags |
| **Testable** | SalesOS tests do not require AuditOS or DecisionOS fixtures | Platform Kernel tests are separate; products mock the kernel |

**Enforcement mechanism:** During extraction, every dependency between products must be flagged as a violation. The only allowed dependency for any product is `AQLIYA Platform Kernel`. If Product A needs data from Product B, the communication must go through the Kernel (via Event Bus or Kernel API), not through a direct product-to-product import.

---

#### Principle 2: Platform Neutrality Rule

> The Platform Kernel must not know about any product.

This is the most important architectural boundary. The Kernel deals in **Generic Concepts** only — never in product-specific entities.

| ❌ NOT in Kernel | ✅ IS in Kernel |
|---|---|
| `SalesAccount` | `Organization`, `Entity` |
| `AuditEngagement` | `Workflow`, `WorkflowState` |
| `LocalContentProject` | `Document`, `Content` |
| `Decision` | `Event`, `Signal` |
| `SalesDeal` | `OpportunityStage` (generic lifecycle) |
| `AuditFinding` | `Evidence`, `EvidenceLink` |
| `DealRisk` | `RiskAssessment` (generic) |
| `SalesPipeline` | `PipelineAnalytics` (generic metric) |

**Why this matters:** If the Kernel knows about `SalesAccount`, then every other product must also accept `SalesAccount` as a Kernel concept. When ProcurementOS is added, someone will ask "should ProcurementOS use SalesAccount?" — and suddenly the Kernel is polluted with procurement-specific fields on a sales concept.

**The Kernel's domain model must be:**

```
Identity ─── Organization ─── User ─── Role ─── Permission

Workflow ─── WorkflowState ─── Transition ─── Policy

Evidence ─── EvidenceLink ─── Document ─── Content

Knowledge ─── KnowledgeGraph ─── Node ─── Edge ─── Signal

Event ─── EventBus ─── Subscription ─── EventLog

Agent ─── Capability ─── AIContext ─── GovernanceRecord

Feature ─── FeatureFlag ─── Segment ─── Rollout

Notification ─── Channel ─── Template ─── Delivery
```

Products (SalesOS, AuditOS, etc.) extend or instantiate these generic concepts for their domain. `SalesAccount` is `Entity` + `Organization` + product-specific fields. `SalesPipeline` is `Workflow` + `PipelineAnalytics` + sales-specific stage definitions.

---

### Formal Component Classification

During the Extraction phase, every component (file, service, engine, model, type) must be classified into exactly one of these categories:

| Category | Label | Decision | Example from SalesOS |
|---|---|---|---|
| **Platform Asset** | `🏗️ Platform` | Extract to the Platform Kernel | `audit-events.ts` (dual-write pattern), `evidence-links.ts` (generic linking), `l5-governance.ts` (review/approval runtime) |
| **Product Asset** | `📦 Product` | Stay inside the product | `SalesAccount` model, pipeline stage definitions, deal scoring heuristics, Outreach templates |
| **Shared Library** | `📚 Library` | Create as a shared utility package (no business logic) | Validation functions, bilingual formatting, date utilities, i18n helpers |
| **Legacy** | `🏚️ Legacy` | Freeze, do not extract. Remove when safe. | v02 directory, in-memory store (`store.ts`), phantom import stubs |

**Classification process for every component:**

```
                   ┌─────────────────────────┐
                   │  Does this contain      │
                   │  business logic?        │
                   └────────────┬────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │ Yes                        │ No
                  ▼                            ▼
     ┌────────────────────────┐    ┌──────────────────────┐
     │ Is the logic generic   │    │ Is it used by        │
     │ (any product needs it)?│    │ multiple products?   │
     └───────────┬────────────┘    └──────────┬───────────┘
                 │                             │
       ┌────────┴────────┐          ┌─────────┴─────────┐
       │ Yes    │ No     │          │ Yes       │ No    │
       ▼        ▼        │          ▼           │       │
   ┌──────┐ ┌────────┐   │    ┌─────────┐       │       │
   │Plat- │ │Product │   │    │ Library │       │       │
   │form  │ │Asset   │   │    │ (shared)│       │       │
   └──────┘ └────────┘   │    └─────────┘       │       │
                         ▼                      ▼       │
                    ┌──────────┐           ┌─────────┐  │
                    │Product   │           │ Stay    │  │
                    │Asset     │           │ (prod)  │  │
                    └──────────┘           └─────────┘  │
                                                         ▼
                                                   ┌──────────┐
                                                   │ Product  │
                                                   │ Asset    │
                                                   └──────────┘
```

If a component does not fit any of these categories:
- It may be **Legacy** (if it was a prototype or experiment)
- It may need to be **split** (separate the generic part from the product-specific part)

---

### How This Enables Future Products

If these two principles and the classification system are adopted, the architecture naturally supports:

| Future Product | Kernel Services Used | Product-Specific Logic |
|---|---|---|
| **FinanceOS** | Event Bus (listen to `deal.closed_won`), Workflow Engine (approval routing), Evidence Network (audit trail), Identity (RBAC) | Chart of accounts, financial statements, reconciliation rules |
| **HROS** | Event Bus (hire/termination events), Workflow (onboarding/offboarding), Document management, Identity/Permissions | Org hierarchy, payroll, performance reviews |
| **ProcurementOS** | Event Bus (PO events), Workflow (approval chains), Evidence Network (contracts), Feature Flags | Supplier scoring, RFx workflows, contract templates |
| **RiskOS** | Knowledge Graph (entity relationships), Signal aggregation, Event Bus (risk events), AI Fabric (risk scoring) | Risk models, assessment questionnaires, mitigation tracking |
| **ComplianceOS** | Workflow Engine (regulatory deadlines), Evidence Network (audit trail), Document Management | Regulatory rule engine, obligation tracking, filing automation |

Each product extends the Kernel's generic concepts. None depends on another product. The Kernel knows nothing about any of them.

**This achieves the commercial goal: sell each product independently, with AQLIYA Platform Kernel as the only shared dependency.**

---

### Summary: The Six Deliverables of the Extraction Phase

| # | Deliverable | Description |
|---|---|---|
| 1 | **Platform Kernel domain model** | Generic types only (Identity, Organization, User, Workflow, Evidence, Knowledge, Event, Agent, Feature, Notification) |
| 2 | **Event Bus** | Cross-domain pub/sub with typed events, subscriptions, replay |
| 3 | **Workflow Engine** | Configurable state machines, transitions, policies, SLA monitoring |
| 4 | **Feature Flag System** | Flag registry, targeting rules, progressive rollout, A/B segments |
| 5 | **Component Classification Registry** | Every extracted component tagged as Platform / Product / Library / Legacy |
| 6 | **Migration Guide** | For each product: what to extract, what to keep, what to freeze |

---

## Architecture Decision Record: ADR-001

> This ADR formalizes the architectural conclusion of this assessment. It is the decision record, separate from the analysis above.

| Field | Value |
|---|---|
| **ID** | ADR-001 |
| **Title** | SalesOS v2 will not evolve from the current SalesOS implementation |
| **Status** | Accepted |
| **Date** | 2026-06-28 |
| **Author** | OpenCode Architecture Assessment Agent |
| **Reviewer** | AQLIYA Product Lead |
| **Source** | `docs/architecture/SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` |

### Context

SalesOS is currently a CRM+ commercial intelligence workspace with 30+ routes, 13 Prisma models, 80+ components, and multiple intelligence subsystems (knowledge graph, institutional learning, cross-product signals, commercial memory). The Enterprise Business Platform vision requires capabilities (event bus, workflow engine, feature flags, domain abstractions, async processing) that the current architecture cannot support without fundamental restructuring.

### Decision

1. **Freeze SalesOS v1.** No new features. Maintenance, bug fixes, and security patches only.
2. **Extract reusable platform capabilities** from SalesOS and other products into a unified AQLIYA Platform Kernel.
3. **Build the missing platform capabilities** (Event Bus, Feature Flags, Domain Abstractions).
4. **Design SalesOS v2 as the first consumer** of the Platform Kernel — not as a branch of SalesOS v1.
5. Apply the **Product Independence Rule** (every product independently licensable, deployable, operable, upgradable, testable) and the **Platform Neutrality Rule** (Kernel knows nothing about products — only generic concepts).

### Rationale

- The current architecture's in-memory store, dual persistence, v02/vnext legacy, and phantom import pattern prevent natural evolution into a multi-domain platform (see Q2, Q4 of the assessment).
- The intelligence subsystems (knowledge graph, institutional learning, signals, memory) are tightly coupled to `SalesAccount`/`SalesDeal` types — they must be extracted to the platform before they can serve other products (see Q5).
- AQLIYA already has mature shared components (AI Orchestration, Governance, Audit Events, Provider Routing, RBAC guards) — extraction is viable, not speculative (see "What the Assessment Revealed").
- The two constitutional principles prevent the Kernel from becoming a "big bag of shared stuff" — they enforce clean boundaries.

### Consequences

| Positive | Negative / Risk |
|---|---|
| SalesOS v2 will have a clean, event-driven architecture | SalesOS v1 feature development stops during extraction |
| All future products (FinanceOS, HROS, etc.) can reuse the same Kernel | Extraction phase requires coordination across product teams |
| Existing investment in mature components is preserved, not discarded | Risk of extraction scope creep (mitigated by Exit Criteria below) |
| Product independence becomes architectural fact, not marketing claim | Need to classify every extracted component during the transition |
| Kernel remains product-neutral — never polluted by domain logic | Temporary tension: v1 maintenance vs. kernel extraction resources |

---

## Platform Core Extraction: Exit Criteria

The extraction phase is complete **only when ALL of the following criteria are met**. No single criterion is optional.

### Hard Gates (Must Pass)

| # | Criterion | Target State | Verification Method |
|---|---|---|---|
| EG-01 | **Product-to-product imports** | 0 remaining in the entire codebase | Global grep for cross-product import patterns (`from "@/lib/audit"` inside SalesOS, etc.) — CI must fail on detection |
| EG-02 | **Platform-classified components extracted** | 100% of components tagged `🏗️ Platform` moved to `src/lib/platform/` with no remaining duplicate in source products | Component Classification Registry audit |
| EG-03 | **Kernel product neutrality** | 0 references to any product entity (`SalesAccount`, `AuditEngagement`, `LocalContentProject`, etc.) inside `src/lib/platform/` | CI grep for product-specific type names in platform code |
| EG-04 | **Event Bus production-ready** | Typed pub/sub with at least one working cross-product event (e.g., `sales.deal.closed_won`) verified by integration test | Integration test passes |
| EG-05 | **Workflow Engine production-ready** | Configurable state machine with at least one product workflow (e.g., SalesOS deal review) running on the engine instead of hardcoded code | Integration test passes |
| EG-06 | **Feature Flag System production-ready** | Flag registry UI + server-side evaluation + at least one product using a flag for progressive rollout | Integration test passes |
| EG-07 | **Platform contracts frozen** | All Kernel interfaces (Event types, Workflow definitions, Evidence schemas, Domain abstractions) have versioned contracts. No API-breaking changes without ADR. | ADR review board sign-off |

### Quality Gates (Should Pass)

| # | Criterion | Target State |
|---|---|---|
| EQ-01 | **Platform Kernel test suite** | ≥80% coverage on all Kernel services |
| EQ-02 | **First consumer blueprint validated** | SalesOS v2 Blueprint reviewed and approved by architecture board |
| EQ-03 | **Migration guide complete** | For each product: extracted components, kept components, frozen components documented |
| EQ-04 | **No regression in existing products** | SalesOS v1, AuditOS, DecisionOS, LocalContentOS test suites all pass with extracted Kernel |
| EQ-05 | **Component Classification Registry maintained** | Registry is up to date, with every component tagged and rationale documented |

### When These Criteria Are Met

```
Platform Core Extraction   →   SalesOS v2 Blueprint   →   SalesOS v2 Implementation
         ✅ Done                      Start                        Not yet
```

The extraction phase does not produce a perfect Kernel — it produces a **sufficient Kernel** that passes these gates. Perfection is deferred to later iterations. Without these gates, extraction becomes infinite refactoring.

---

| Evidence Category | Count | Key Finding |
|---|---|---|
| In-memory store usage | 1,161 lines in `store.ts` | Default persistence for 10 intelligence entity types |
| Phantom imports | 5+ v02 files | `throw new Error("TODO: implement when module exists")` |
| Service layer ambiguity | 4 patterns (store, service, services, repositories) | No clear boundary |
| Intelligence-to-Sales coupling | 8 vnext modules × SalesAccount/SalesDeal dependency | 100% of intelligence subsystems are sales-coupled |
| Prisma models for SalesOS | 13 models | All are CRM primitives + audit |
| Component count | 80+ files in `src/components/sales/` | All sales-specific UI |
| CRM sync connectors | 2 (HubSpot, Salesforce) | Solid CRM integration pattern |
| Event-driven infrastructure | 0 | No event bus, no queues, no pub/sub |
| Feature flags | 0 | No capability for progressive rollout |
| Async processing | 0 | All operations are synchronous |
| Cross-product signals | 1 stub | `throw new Error("TODO")` at runtime |

---

## Document Metadata

- **Author:** OpenCode Architecture Assessment Agent
- **Reviewer:** AQLIYA Product Lead (corrections: Option D, Extraction-led approach, Product Independence Rule, Platform Neutrality Rule, Component Classification)
- **Date:** 2026-06-28
- **Version:** 1.4 (Final)
- **Changes:**
  - v1.0 (original): Option A — Keep SalesOS as CRM+. Evidence correct, conclusion too conservative.
  - v1.1 (reviewer correction): Option D — Freeze, Build Platform Kernel, Rebuild. Still framed as "build" not "extract."
  - v1.2 (reviewer refinement): **Extraction-led approach.** The kernel is not built from scratch — it is extracted from existing mature components across AuditOS, DecisionOS, SalesOS, and the platform. The task is Extract → Unify → Complete, not Greenfield rebuild.
  - v1.3 (reviewer refinement): **Two constitutional principles added.** Product Independence Rule (every product independently licensable, deployable, operable, upgradable, testable) and Platform Neutrality Rule (Kernel knows nothing about products — only generic concepts). **Formal Component Classification** added (Platform Asset / Product Asset / Shared Library / Legacy) with decision tree. Future product enablement mapped.
  - v1.4 (final): **ADR-001 added** — formal architecture decision record freezing SalesOS v1, extracting platform kernel, making SalesOS v2 first consumer. **Exit Criteria added** — 7 hard gates (EG-01 to EG-07) and 5 quality gates (EQ-01 to EQ-05) for the Platform Core Extraction phase. Document frozen after this version.
- **Methodology:** Full codebase inspection — no speculation, no redesign, no roadmap
- **Authority:** AGENTS.md §34 (Module Classification) — Task Type: Architecture Reality Assessment
- **Status:** **FINAL — no further modifications.** Next documents: Platform Core Extraction Blueprint → Platform Kernel Architecture → SalesOS v2 Master Blueprint.
