# Platform Core Extraction Blueprint

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Execution Contract — not a design document, not a roadmap.
> **Predecessor:** `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` (v1.4 FINAL)

---

## Purpose

This document defines **how** shared capabilities are extracted from existing AQLIYA products into a neutral Platform Kernel.

The objective is to create a reusable foundation for all AQLIYA products.
SalesOS v2 is the **first validation consumer** — not the owner of the Platform Kernel.

Future consumers include AuditOS, DecisionOS, LocalContentOS, WorkflowOS, and any new product built on the platform.

**This document is an execution contract.** Every section is binding during implementation. If a decision conflicts with these terms, the contract wins — not the implementation convenience.

---

## Document Structure

| # | Section | What It Answers |
|---|---|---|
| 1 | **Extraction Principles** | What rules are never broken? |
| 2 | **Extraction Inventory** | What exists? What do we extract? What do we keep? |
| 3 | **Extraction Waves** | In what order? How do we validate each wave? |
| 4 | **Contracts** | What does each extracted component promise? |
| 5 | **Validation** | How do we know extraction succeeded? |

---

# 1. Extraction Principles

These six principles are constitutional. If an implementation decision conflicts with these principles, **the principles win.**

---

## 1.1 Product Independence

> Every AQLIYA product must be independently licensable, deployable, operable, upgradable, and testable.

**Enforcement:**
- The Platform Kernel is the **only** allowed runtime dependency for any product.
- Direct product-to-product imports are architectural violations.
- Cross-product communication must go through the Event Bus or Kernel API.
- A product's test suite must not require fixtures from another product.

---

## 1.2 Platform Neutrality

> The Platform Kernel must not know about any product.

**Enforcement:**
- The Kernel's domain model contains only generic concepts: `Identity`, `Organization`, `User`, `Workflow`, `Evidence`, `Document`, `Knowledge`, `Event`, `Signal`, `Agent`, `Capability`, `Feature`.
- Zero references to `SalesAccount`, `AuditEngagement`, `LocalContentProject`, `Decision`, or any other product-specific entity may exist inside `src/lib/platform/`.
- The Kernel must compile and pass its test suite without any product package installed.

---

## 1.3 Consumer-Driven Extraction

> No capability may be extracted into the Platform Kernel unless there is at least one identified consumer and one defined contract.

**Enforcement:**
- Every extraction candidate must have a `First Consumer` field before extraction begins.
- Every extracted component must have a published Interface/Contract before implementation.
- Components with no identified consumer remain in their source product until a consumer emerges.

---

## 1.4 Kernel Budget Rule

> Every extraction sprint must end with a validated consumer.

**Enforcement:**
- No sprint may extract components without validating that the first consumer can use them.
- Validation is not optional — it is the definition of "done" for the sprint.
- If a sprint's deliverables cannot be validated by the consumer, the sprint scope is too large.

---

## 1.5 One Owner Rule

> Every extracted component must have an owner, a contract, a first consumer, and an acceptance test.

| Component | Owner | First Consumer | Acceptance |
|---|---|---|---|
| (every row in the Extraction Inventory) | named team or person | named product | measurable test |

**Enforcement:**
- All four fields must be populated before extraction begins.
- If any field is empty, the component is not ready for extraction.

---

## 1.6 Extraction Reversibility

> Every extraction must be reversible until its consumer has been validated.

**Enforcement (Strangler Pattern):**
1. Identify the existing implementation in the source product.
2. Extract the generic interface/contract to the platform.
3. Build the platform implementation (initially a thin wrapper delegating to the existing code).
4. Update the source product to consume the platform version.
5. Run consumer validation.
6. Only after validation passes: remove the old implementation from the source product.
7. If validation fails: revert the consumer to use the old implementation. The extraction is unrolled without breaking the product.

**This means:** at any point during extraction, the source product can return to its original state by switching back to its internal implementation. The Kernel never holds hostage a product's ability to function.

---

# 2. Extraction Inventory

## 2.1 Classification Legend

| Label | Decision | Action |
|---|---|---|
| 🏗️ **Platform** | Extract to Kernel | Move generic logic to `src/lib/platform/`. Source product becomes a consumer. |
| 📦 **Product** | Stay in product | Leave in source product. No extraction. |
| 📚 **Library** | Shared utility | Create a stateless utility package in `src/lib/shared/`. No business logic. |
| 🏚️ **Legacy** | Freeze / Replace | Do not extract. Keep running but do not evolve. Remove when all consumers migrate. |

---

## 2.2 Asset Inventory

### 🏗️ Platform Assets — Extract to Kernel

| Component | Source | Owner | First Consumer | Wave | Status |
|---|---|---|---|---|---|
| **Audit Event System** | SalesOS `audit-events.ts` — 43 actions, dual-write to `writePlatformAuditLog` + `appendToAuditChain` | Platform Team | SalesOS v2 | 1 | ✅ Mature — standardize contract |
| **Authorization Guard Pattern** | SalesOS `guards.ts`, `permissions.ts` — tenant-scoped entity access with server-side enforcement | Platform Team | SalesOS v2 | 1 | ⚠️ Partial — 3-tier role model, SalesOS-specific names |
| **Domain Abstractions** | Does not exist — must be built: `Entity`, `Domain`, `Workflow`, `Event`, `Signal`, `Policy` interfaces | Platform Team | SalesOS v2 | 1 | ❌ Build new |
| **Event Bus** | Does not exist — cross-product signals is a `throw new Error("TODO")` stub | Platform Team | SalesOS v2 | 1 | ❌ Build new |
| **Evidence Network** | SalesOS `evidence-links.ts`, `evidence-resolver.ts` — generic target-agnostic evidence linking | Platform Team | SalesOS v2 | 1 | ⚠️ Partial — exists in SalesOS, AuditOS, DecisionOS independently |
| **Workflow Engine** | SalesOS `governance.ts`, `l5-governance.ts` + WorkflowOS templates — state machines, review/approval | Platform Team | SalesOS v2 | 1 | ⚠️ Partial — hardcoded per product |
| **AI Orchestration** | `src/lib/ai/` — orchestrator, governance context injection, provider selection, fallback | AI Team | SalesOS v2 | 2 | ✅ Mature — extract contracts |
| **Feature Flags** | Does not exist — zero implementations anywhere | Platform Team | SalesOS v2 | 2 | ❌ Build new |
| **Provider Routing** | `@musistudio/claude-code-router` — Anthropic primary, OpenRouter secondary | AI Team | SalesOS v2 | 2 | ✅ Mature — already shared |
| **Knowledge Graph Service** | SalesOS `v02/knowledge-graph/` — graph model, builder, queries, store-reader | Platform Team | SalesOS v2 | 3 | ⚠️ Partial — types exist, service is SalesOS-coupled |
| **Institutional Memory** | `src/lib/platform/institutional-memory/` — service, models, graph, cross-product linking | Platform Team | SalesOS v2 | 3 | ⚠️ Partial — service exists, incomplete cross-product linking |
| **L5 Acceptance Framework** | SalesOS `l5-acceptance.ts` — product-agnostic maturity criteria (11 dimensions) | Platform Team | All products | 3 | ✅ Mature — extract without changes |
| **Governance Unification** | SalesOS `governance.ts` + DecisionOS governance + core governance engine | Platform Team | SalesOS v2 | 3 | ✅ Mature — unify existing implementations |
| **Signal Taxonomy & Registry** | SalesOS `v02/cross-product-signals/types.ts` — 6 institutional signal kinds | Platform Team | SalesOS v2 | 3 | ⚠️ Partial — taxonomy exists, implementation is stubbed |

---

### 📦 Product Assets — Stay in SalesOS

| Component | Rationale |
|---|---|
| `SalesAccount`, `SalesContact`, `SalesDeal` Prisma models | Core CRM domain — product-specific data |
| `SalesPipelineStage` and pipeline management | Sales-specific workflow definitions |
| Deal risk scoring (`deal-risk-types.ts`) | Sales-specific heuristics and weightings |
| Win/loss analysis (`next-action-engine.ts`) | Sales-specific outcome analysis rules |
| ICP scoring and learning (`icp-learning.ts`) | Sales-specific qualification models |
| CRM sync connectors (`crm/` — HubSpot, Salesforce) | Sales-specific integrations |
| Outreach management (`outreach.ts`) | Sales-specific channel management |
| Account brief / pilot handoff packs | Sales-specific output documents |
| Pipeline, funnel, revenue analytics | Sales-specific metric aggregations |
| All 80+ SalesOS components | Sales-specific UI |
| All 30+ SalesOS routes | Sales-specific navigation |
| Seed data (`seed-data.ts`) | Sales-specific demo data |

---

### 📚 Shared Libraries — Create as Utility Packages

| Component | Source | Action |
|---|---|---|
| Validation utilities | SalesOS `validation.ts` | Extract generic validation patterns |
| Bilingual formatting | SalesOS `sales-ux-copy.ts`, `sales-bilingual-parity.ts` | Extract i18n helpers |
| Entity ID factory | SalesOS `entity-factory.ts` | Extract ID generation pattern |
| Error handling | SalesOS action `safe()` pattern | Extract to shared utility |
| Date/time formatting | Various | Extract to shared utility |

---

### 🏚️ Legacy — Freeze / Replace Later

| Component | Rationale | Replacement Plan |
|---|---|---|
| In-memory store (`store.ts`) | Default persistence for intelligence entities — not scalable | Replace with Prisma-only persistence in Wave 1 |
| v02 implementations (`v02/institutional-learning/`, `v02/strategic-recommendations/`, `v02/market-intelligence/`) | Archived-then-resurrected code — depends on in-memory store | Replace with Platform Kernel services in Waves 2-3 |
| vnext facade layer (`vnext/`) | Thin wrappers over v02 — unnecessary indirection | Remove after v02 implementations are replaced |
| Phantom import stubs (`v02/cross-product-signals/aggregator.ts TODO`) | `throw new Error("TODO")` at runtime | Replace with Event Bus in Wave 1 |
| Hardcoded state machines (`service.ts transitionReviewState`, etc.) | Duplicated workflow logic | Replace with Workflow Engine in Wave 1 |
| Tier A/B persistence (`tier-a-persistence.ts`, `tier-b-persistence.ts`) | In-memory persistence workarounds | Remove after Prisma persistence is universal |
| `prisma-repository.ts` Tier B/A `as any` casts | 896 lines with mixed typed/untyped — schema drift documented as R-04 | Remove when schema aligns |

---

# 3. Extraction Waves

Each wave follows the same cadence:

```
Deliverables → Consumer Validation → Exit Gate → NEXT WAVE
```

Wave scope is determined by **Consumer-Driven Extraction**: only components whose First Consumer is ready for them. If a component has no consumer ready, it moves to a later wave.

---

## Wave 1 — Minimal Runtime Foundation

**Goal:** SalesOS v2 can authenticate, create an entity, publish an event, and link evidence.

**Duration target:** 2-3 sprints.

### Deliverables

| Component | Action | Source |
|---|---|---|
| **Domain Abstractions** | Build new | Generic interfaces: `Entity`, `Domain`, `WorkflowState`, `Event`, `Signal`, `Policy`, `Capability` |
| **Event Bus** | Build new | Typed pub/sub with at least one working cross-product event |
| **Audit Event System** | Extract + standardize | From SalesOS `audit-events.ts` — dual-write, hash chain, unified event envelope |
| **Authorization Guard Pattern** | Extract + rename | From SalesOS `guards.ts`, `permissions.ts` — generic tenant-scoped access |
| **Evidence Network** | Extract + generalize | From SalesOS `evidence-links.ts`, `evidence-resolver.ts` — target-agnostic evidence linking |
| **Workflow Engine** | Extract + generalize | From SalesOS `governance.ts` + WorkflowOS — configurable state machine, review/approval |

### Consumer Validation

| Test | What It Proves |
|---|---|
| SalesOS v2 user authenticates via Platform Identity | Identity + Authorization extracted correctly |
| SalesOS v2 creates an Entity implementing Domain Abstractions | Domain Abstractions are usable |
| SalesOS v2 publishes `entity.created` event via Event Bus | Event Bus works cross-component |
| SalesOS v2 links evidence to entity via Evidence Network | Evidence Network is generic and functional |
| SalesOS v2 moves entity through a workflow stage | Workflow Engine is extracted and functional |
| SalesOS v2 audit trail shows all mutations | Audit Event System is unified |

### Exit Gate

- [ ] All six deliverables have passing acceptance tests
- [ ] Contracts (see Section 4) are reviewed and frozen
- [ ] Consumer validation tests all pass
- [ ] No regressions in SalesOS v1, AuditOS, DecisionOS, or LocalContentOS test suites
- [ ] Any component that failed consumer validation was reverted (Extraction Reversibility applied)
- [ ] Product-to-product import count: **0** (enforced by CI)

---

## Wave 2 — Core Business Services

**Goal:** SalesOS v2 has governed AI, feature flags, and configurable workflows.

**Duration target:** 2-3 sprints.

### Deliverables

| Component | Action | Source |
|---|---|---|
| **AI Orchestration Contracts** | Extract from `src/lib/ai/` | Formalize governance context, provider selection, fallback, confidence scoring as platform contracts |
| **Provider Routing** | Extract as contract | Formalize the routing pattern from `@musistudio/claude-code-router` |
| **Feature Flags** | Build new | Flag registry, targeting rules, progressive rollout, A/B segments |
| **Workflow Engine v2** | Complete extraction | Move from Wave 1 MVP to full configurable engine with SLA monitoring (from WorkflowOS) |

### Consumer Validation

| Test | What It Proves |
|---|---|
| SalesOS v2 calls AI via Platform AI Orchestration | AI contracts are usable |
| SalesOS v2 AI output includes governance metadata | Governance context injection works |
| SalesOS v2 feature flag controls a UI element | Feature Flag system is functional |
| SalesOS v2 SLA-monitored workflow completes within time | Workflow Engine v2 is complete |

### Exit Gate

- [ ] All four deliverables have passing acceptance tests
- [ ] AI contracts frozen and versioned
- [ ] Feature Flag system has UI + server-side evaluation
- [ ] Consumer validation tests all pass
- [ ] No regressions in existing products
- [ ] Extraction Reversibility applied to any failed extraction

---

## Wave 3 — Intelligence & Knowledge

**Goal:** SalesOS v2 uses the complete intelligence stack: knowledge graph, institutional memory, unified governance, signal registry.

**Duration target:** 2-3 sprints.

### Deliverables

| Component | Action | Source |
|---|---|---|
| **Knowledge Graph Service** | Extract graph model + build platform service | From SalesOS `v02/knowledge-graph/` — generic graph, queries, subgraphs |
| **Institutional Memory** | Complete platform service | From `src/lib/platform/institutional-memory/` — cross-product linking, collections, export |
| **Governance Unification** | Extract + standardize | From SalesOS + DecisionOS + core governance — unified policy engine |
| **Signal Taxonomy & Registry** | Extract taxonomy + build registry | From SalesOS `v02/cross-product-signals/types.ts` |
| **L5 Acceptance Framework** | Extract without changes | From SalesOS `l5-acceptance.ts` — becomes shared product maturity standard |

### Consumer Validation

| Test | What It Proves |
|---|---|
| SalesOS v2 queries knowledge graph for account relationships | Knowledge Graph is generic and functional |
| SalesOS v2 reads cross-product institutional memory | Institutional Memory linking works |
| SalesOS v2 governance policy enforced consistently | Governance is unified and not SalesOS-specific |
| SalesOS v2 publishes signal to registry | Signal Registry is usable |
| SalesOS v2 L5 criteria evaluated against framework | L5 framework is product-agnostic |

### Exit Gate

- [ ] All five deliverables have passing acceptance tests
- [ ] Knowledge Graph service has documented graph model and query API
- [ ] Institutional Memory has working cross-product linking
- [ ] Governance policies are versioned and not product-coupled
- [ ] Consumer validation tests all pass
- [ ] No regressions in existing products
- [ ] Extraction Reversibility applied to any failed extraction

---

# 4. Contracts

## 4.1 Contract Design Rule

> **Contracts are designed before implementations.**

For every extracted component, the sequence is:

```
Interface Definition
        ↓
Acceptance Test
        ↓
Implementation
        ↓
Consumer Validation
```

Not the reverse. If implementation precedes interface, the interface becomes a reflection of accidental implementation details rather than a deliberate contract.

---

## 4.2 Component Contracts

### 4.2.1 Event Bus

```typescript
// Contract — Event Bus
// Status: To be designed in Platform Kernel Architecture

interface EventBus {
  publish<T>(event: PlatformEvent<T>): Promise<void>;
  subscribe<T>(pattern: EventPattern, handler: EventHandler<T>): Subscription;
  unsubscribe(subscription: Subscription): void;
  replay(sequenceId: string, options?: ReplayOptions): Promise<void>;
}

interface PlatformEvent<T = unknown> {
  id: string;
  type: string;           // e.g., "entity.created", "deal.stage_changed"
  source: string;         // e.g., "salesos-v2", "platform"
  subject?: string;       // e.g., entity ID
  data: T;
  timestamp: string;
  sequenceId: string;     // for replay / ordering
  metadata?: Record<string, unknown>;
}

interface EventPattern {
  type?: string | RegExp;
  source?: string;
}

type EventHandler<T> = (event: PlatformEvent<T>) => Promise<void>;
```

**What it does:** Cross-component typed pub/sub. No product knows another product directly — they communicate through events.

**What it does NOT do:** Message queues, stream processing, saga orchestration. Those are future extensions.

**First consumer expects:** SalesOS v2 publishes `deal.created`, `deal.stage_changed`, `deal.closed_won`. Platform subscribes for audit logging.

---

### 4.2.2 Domain Abstractions

```typescript
// Contract — Domain Abstractions
// Status: To be designed in Platform Kernel Architecture

interface Entity {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface WorkflowState {
  workflowId: string;
  entityId: string;
  currentStage: string;
  validTransitions: string[];
  history: StateTransition[];
}

interface Signal {
  id: string;
  type: string;
  source: string;
  targetType: string;
  targetId: string;
  severity: "low" | "medium" | "high";
  payload: Record<string, unknown>;
  timestamp: string;
}

interface Policy {
  id: string;
  name: string;
  evaluate(context: PolicyContext): Promise<PolicyDecision>;
}
```

**What it does:** Provides the generic type system that all product entities extend.

**What it does NOT do:** Define product-specific fields, behavior, or validation rules.

**First consumer expects:** SalesOS v2 `Account extends Entity { name, industry, ... }`. SalesOS v2 `Deal extends Entity { amount, stage, ... }`.

---

### 4.2.3 Authorization Guard

```typescript
// Contract — Authorization
// Status: To be designed in Platform Kernel Architecture

interface AuthContext {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}

interface AuthGuard {
  requirePermission(permission: string): Promise<AuthContext>;
  requireEntityAccess(entityId: string, entityType: string): Promise<AuthContext>;
  hasPermission(ctx: AuthContext, permission: string): boolean;
}
```

**What it does:** Centralizes tenant-scoped authorization. Products define their permission strings; the Kernel enforces them server-side.

**What it does NOT do:** Manage users, handle authentication flows, store role hierarchies.

**First consumer expects:** SalesOS v2 calls `requirePermission("salesos:deal.create")` and gets back the validated AuthContext.

---

### 4.2.4 Evidence Network

```typescript
// Contract — Evidence Network
// Status: To be designed in Platform Kernel Architecture

interface Evidence {
  id: string;
  organizationId: string;
  source: string;         // e.g., "platform", "salesos", "auditos"
  sourceId: string;       // ID in the source system
  type: string;           // e.g., "document", "note", "reference"
  title: string;
  metadata?: Record<string, unknown>;
}

interface EvidenceLink {
  id: string;
  targetType: string;     // product-defined entity type
  targetId: string;       // product-defined entity ID
  evidenceId: string;
  linkedById: string;
  linkedAt: string;
}

interface EvidenceService {
  link(target: LinkTarget, evidenceId: string): Promise<EvidenceLink>;
  unlink(linkId: string): Promise<void>;
  listForTarget(targetType: string, targetId: string): Promise<EvidenceLinkView[]>;
  resolveEvidence(evidenceId: string): Promise<Evidence | null>;
}
```

**What it does:** Universal evidence linking across all products. Any entity can link to any evidence.

**What it does NOT do:** Store evidence files (delegated to Storage service), validate evidence type schemas.

**First consumer expects:** SalesOS v2 links documents to deals, lists evidence for a deal, enforces governance gates based on evidence count.

---

### 4.2.5 Workflow Engine

```typescript
// Contract — Workflow Engine
// Status: To be designed in Platform Kernel Architecture

interface WorkflowDefinition {
  id: string;
  name: string;
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  policies?: PolicyRef[];
}

interface WorkflowStage {
  id: string;
  name: string;
  requiredEvidence?: number;
  requiredApprovals?: number;
}

interface WorkflowTransition {
  fromStage: string;
  toStage: string;
  action: string;
  guard?: string;  // policy ID
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  currentStage: string;
  history: StageTransitionRecord[];
  sla?: SLAStatus;
}

interface WorkflowEngine {
  createInstance(definitionId: string, entity: Entity): Promise<WorkflowInstance>;
  transition(instanceId: string, action: string): Promise<WorkflowInstance>;
  getInstance(entityType: string, entityId: string): Promise<WorkflowInstance | null>;
  listDefinitions(productSlug: string): Promise<WorkflowDefinition[]>;
}
```

**What it does:** Configurable state machines that replace hardcoded review/approval logic in products.

**What it does NOT do:** Replace product-specific stage logic (e.g., what "qualified" means for SalesOS vs AuditOS). Products define their stage semantics; the engine enforces transitions.

**First consumer expects:** SalesOS v2 defines "New → Qualified → Proposal → Pilot → Negotiation → Closed Won/Lost" as a workflow. The engine enforces that evidence is present before "Proposal."

---

### 4.2.6 Feature Flags

```typescript
// Contract — Feature Flags
// Status: To be designed in Platform Kernel Architecture

interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  rules?: TargetingRule[];
}

interface TargetingRule {
  type: "organization" | "role" | "percentage" | "custom";
  value: string | number;
}

interface FeatureFlagService {
  isEnabled(key: string, context: FlagContext): Promise<boolean>;
  getFlags(productSlug: string): Promise<FeatureFlag[]>;
  setFlag(key: string, enabled: boolean): Promise<void>;
}
```

**What it does:** Progressive rollout capability for all products. No more env-var-based toggles.

**What it does NOT do:** A/B testing framework, experiment analysis, metrics collection.

**First consumer expects:** SalesOS v2 checks `isEnabled("salesos.ai.suggestions")` before showing AI-generated recommendations.

---

### 4.2.7 AI Orchestration Contracts

```typescript
// Contract — AI Orchestration (extracted from existing src/lib/ai/)
// Status: Already exists — formalize as platform contract

interface AIContext {
  useCase: string;
  productSlug: string;
  organizationId: string;
  userId: string;
  inputSources: string[];
  evidenceRefs: string[];
  policyTags: string[];
}

interface AIRequest {
  context: AIContext;
  prompt: string;
  model?: ModelPreference;
  outputType: "draft" | "recommendation" | "analysis";
}

interface AIResponse {
  output: string;
  confidence: number;
  governanceId: string;
  modelUsed: string;
  disclaimer: string;
  outputStatus: "draft" | "recommendation";
}

interface AIOrchestrator {
  generate(request: AIRequest): Promise<AIResponse>;
  getCapabilities(productSlug: string): Promise<AICapability[]>;
}
```

**What it does:** Governed AI generation with provider selection, confidence scoring, and audit trail.

**What it does NOT do:** Autonomous decision-making, model training, data storage.

**First consumer expects:** SalesOS v2 calls `orchestrator.generate()` for account brief drafting, deal risk analysis, ICP scoring — each with governance context.

---

### 4.2.8 Knowledge Graph Service

```typescript
// Contract — Knowledge Graph
// Status: To be designed in Platform Kernel Architecture

interface GraphNode {
  id: string;
  type: string;         // product-defined
  label: string;
  properties: Record<string, unknown>;
}

interface GraphEdge {
  id: string;
  type: string;         // e.g., "linked_to", "references", "generated_by"
  sourceId: string;
  targetId: string;
  properties: Record<string, unknown>;
}

interface KnowledgeGraphService {
  addNode(node: GraphNode): Promise<void>;
  addEdge(edge: GraphEdge): Promise<void>;
  getSubgraph(nodeId: string, depth?: number): Promise<Subgraph>;
  query(pattern: GraphQuery): Promise<GraphQueryResult>;
}
```

**What it does:** Domain-agnostic entity graph that products populate with their own entity types.

**What it does NOT do:** Define product-specific node types, relationship semantics, or visualization.

**First consumer expects:** SalesOS v2 adds `Account` and `Deal` as nodes, `has_deal`, `references_proof` as edges. Queries "show me all accounts with deals in Negotiation stage."

---

## 4.3 Capability Governance

> **Architectural requirement:** The Platform Kernel must treat its extracted components as **Capabilities** — not just files, folders, or services.
>
> The three concepts below are mandatory for the Platform Kernel Architecture. They are previewed here because they affect extraction decisions. Their full design belongs in `PLATFORM_KERNEL_ARCHITECTURE.md`.

---

### 4.3.1 Capability Registry

Products depend on **Capabilities**, not on file paths or package names.

```typescript
interface Capability {
  id: string;              // e.g., "platform.event-bus"
  name: string;            // e.g., "Event Bus"
  contract: string;        // e.g., "EventBus v1"
  owner: string;           // team or person
  consumers: string[];     // product slugs
  status: CapabilityStatus;
  since: string;           // semver
}
```

| Capability | Contract | Owner | First Consumer | Status |
|---|---|---|---|---|
| `platform.event-bus` | `EventBus v1` | Platform | SalesOS v2 | Wave 1 |
| `platform.workflow` | `WorkflowEngine v1` | Platform | SalesOS v2 | Wave 1 |
| `platform.evidence` | `EvidenceService v1` | Platform | SalesOS v2 | Wave 1 |
| `platform.auth` | `AuthGuard v1` | Platform | SalesOS v2 | Wave 1 |
| `platform.ai` | `AIOrchestrator v1` | AI Team | SalesOS v2 | Wave 2 |
| `platform.features` | `FeatureFlagService v1` | Platform | SalesOS v2 | Wave 2 |
| `platform.knowledge-graph` | `KnowledgeGraph v1` | Platform | SalesOS v2 | Wave 3 |
| `platform.institutional-memory` | `InstitutionalMemory v1` | Platform | SalesOS v2 | Wave 3 |
| `platform.signal-registry` | `SignalRegistry v1` | Platform | SalesOS v2 | Wave 3 |

**Why this matters beyond extraction:**
- **Licensing:** A customer can license `platform.workflow` without licensing `platform.knowledge-graph`.
- **Marketplace:** A third-party product declares `requires: ["platform.event-bus", "platform.auth"]`.
- **Feature Flags:** A flag targets `platform.ai` capabilities for specific organizations.
- **Dependency Graph:** The platform knows which products depend on which capabilities.

---

### 4.3.2 Capability Versioning

Every Capability owns its own semantic version. Products may consume different versions of different capabilities simultaneously.

```typescript
interface CapabilityVersion {
  capabilityId: string;
  version: string;            // semver: "1.2.3"
  contract: string;           // e.g., "EventBus v1"
  changelog: string;
  publishedAt: string;
  compatibleWith: string[];   // product slugs + versions
}
```

**Versioning policy:**

```
MAJOR — breaking contract change
MINOR — backward-compatible addition
PATCH — bug fix, no contract change
```

Example scenario — two products on different versions:

```
Capability: platform.workflow

    SalesOS v2 → platform.workflow@1.0.0
    AuditOS vNext → platform.workflow@2.0.0

    The Kernel hosts both contracts.
    Each product consumes only what it declared.
```

**Why this matters:**
- Products ship on their own cadence, not the Kernel's cadence.
- A breaking change in `platform.knowledge-graph` does not block `platform.workflow` consumers.
- A product can upgrade capabilities one at a time, not all-or-nothing.

---

### 4.3.3 Capability Lifecycle

Not every capability is in the same maturity phase. The lifecycle governs what consumers can expect.

```
Draft
  │
  ▼
Experimental ─── Internal
                      │
                      ▼
                   Stable
                      │
                  ┌───┴───┐
                  ▼       ▼
            Deprecated  Retired
```

| Stage | Meaning | Consumer Expectations |
|---|---|---|
| **Draft** | Concept, not implemented | Do not depend on it |
| **Experimental** | Implemented, contract may change | Use at your own risk. Contract breaks without MAJOR version bump. |
| **Internal** | Stable contract, AQLIYA products only | Contracts are versioned. Breaking changes require MAJOR bump. |
| **Stable** | Public contract, third-party ready | Backward compatibility guaranteed within MAJOR version. |
| **Deprecated** | Replaced by newer capability | Still works, but no new features. Consumers should plan migration. |
| **Retired** | Removed from Kernel | No longer available. Consumers must have migrated. |

**Expected lifecycle for extracted capabilities:**

| Capability | Wave 1 Status | Wave 2 Status | Wave 3 Status | Target |
|---|---|---|---|---|
| All Wave 1-3 capabilities | Internal | Internal | Internal → Stable | Stable by SalesOS v2 launch |

**Why this matters:**
- Prevents premature commitment to stable APIs during extraction.
- Allows the Kernel team to iterate on contracts before freezing them.
- Gives product teams clear expectations about contract reliability.

---

### 4.3.4 Summary: What This Means for Extraction

| During Extraction | The Capability Governance means: |
|---|---|
| Component is extracted | It registers as a Capability in the Registry with `status: Internal` |
| Contract changes | MAJOR version bump. Consumers are notified via the Registry. |
| Two products need different versions | Kernel hosts both. Each consumer declares its dependency. |
| Capability is no longer needed | Deprecate → notify consumers → set a removal date → Retire |
| New consumer arrives | Registry shows available capabilities, their contracts, and their lifecycle stage |

**The Capability Registry, Versioning, and Lifecycle will be fully designed in `PLATFORM_KERNEL_ARCHITECTURE.md`. This section only establishes them as architectural requirements that affect extraction decisions from Wave 1 onward.**

---

# 5. Validation

## 5.1 Validation Types

Extraction success is measured by three independent validation gates. Each type can fail independently — a component can pass Technical Validation but fail Architectural Validation.

---

### 5.1.1 Technical Validation

| Gate | What It Checks | How |
|---|---|---|
| **TypeScript** | `npx tsc --noEmit` = 0 errors | CI pipeline |
| **Build** | `npm run build` passes | CI pipeline |
| **Tests** | Component acceptance tests pass | `npm test -- <pattern>` |
| **No regression** | Existing product test suites still pass | Full test suite run |
| **Lint** | `npm run lint` — no new warnings | CI pipeline |

---

### 5.1.2 Architectural Validation

| Gate | What It Checks | How |
|---|---|---|
| **Product Independence** | Zero product-to-product imports in extracted code | CI grep for `from "@/lib/(audit|sales|decision|local-content)"` inside `src/lib/platform/` |
| **Platform Neutrality** | Zero product entity references in Kernel | CI grep for `SalesAccount|AuditEngagement|LocalContentProject|Decision` inside `src/lib/platform/` |
| **No circular dependency** | Kernel does not import from products that consume it | Dependency graph check |
| **Extraction Reversibility** | Source product can still function if platform version is removed | Verify: source product's original implementation is preserved until consumer validation passes |
| **Contract stability** | Interfaces are frozen before implementation begins | Git diff check: no interface changes after implementation started |

---

### 5.1.3 Consumer Validation

| Gate | What It Checks | How |
|---|---|---|
| **First consumer compiles** | SalesOS v2 compiles against extracted Platform contracts | `npx tsc --noEmit` on SalesOS v2 with Kernel as dependency |
| **First consumer tests pass** | SalesOS v2 tests pass using Platform services | `npm test` on SalesOS v2 |
| **First consumer workflow** | End-to-end user journey works | Integration test: create entity → link evidence → transition workflow → publish event → read audit trail |
| **No product coupling** | SalesOS v2 does not import any other product | CI grep: no `from "@/lib/audit"` etc. inside SalesOS v2 |

---

## 5.2 Validation Cadence

| When | What Runs | Required Result |
|---|---|---|
| **Every commit** | Technical Validation (TypeScript + build + lint) | All pass |
| **Every sprint end** | Technical + Architectural Validation | All pass |
| **Every wave end** | Technical + Architectural + Consumer Validation | All pass |

---

## 5.3 Wave Exit Sign-off

Each wave exits only when:

```
Technical Validation:  ✅ ALL PASS
Architectural Validation: ✅ ALL PASS
Consumer Validation:    ✅ ALL PASS
Contracts frozen:      ✅ YES
Extraction Reversibility: ✅ CONFIRMED
```

No single check can be waived. If any check fails, the wave does not exit — the failed extraction is reverted (per Extraction Reversibility), and the wave scope is reduced.

---

# Appendix: Document Hierarchy

```
AQLIYA_ARCHITECTURE_CONSTITUTION.md              ← Constitutional principles
        │
        ▼
ARCHITECTURE_DECISION_INDEX.md                  ← All ADRs mapped
        │
        ▼
SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md       ← Diagnosis (FROZEN)
        │
        ▼
PLATFORM_CORE_EXTRACTION_BLUEPRINT.md           ← THIS DOCUMENT (FROZEN)
        │
        ▼
PLATFORM_KERNEL_ARCHITECTURE.md                 ← Kernel Design (ACTIVE)
        │
        ▼
SALESOS_V2_BLUEPRINT.md (future)                ← Product Design
        │
        ▼
PRDs → Specifications → Implementation
```

| Document | Type | Role | Status |
|---|---|---|---|
| `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Governance | 11 immutable principles | ✅ ACTIVE |
| `ARCHITECTURE_DECISION_INDEX.md` | Reference | All ADR decisions mapped | ✅ ACTIVE |
| `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` | Diagnosis | Where we are, what needs to change | ✅ FROZEN |
| **THIS DOCUMENT — Platform Core Extraction Blueprint** | **Execution Contract** | **How shared capabilities are extracted** | **✅ FROZEN (v1.1)** |
| `PLATFORM_KERNEL_ARCHITECTURE.md` | Design | How the kernel works | ✅ ACTIVE |
| `SALESOS_V2_BLUEPRINT.md` (future) | Design | SalesOS v2 as first Kernel consumer | ⏸️ Next |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Execution Contract
- **Date:** 2026-06-28
- **Version:** 1.1
- **Predecessor:** `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` v1.4 FINAL
- **Next document:** `PLATFORM_KERNEL_ARCHITECTURE.md`
- **Authority:** ADR-001 (from Reality Assessment) — SalesOS v2 will not evolve from current SalesOS implementation
- **Status:** **FROZEN (v1.1)** — no further modifications. Next document: `PLATFORM_KERNEL_ARCHITECTURE.md`.
