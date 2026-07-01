# AQLIYA Platform Kernel Architecture

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Design — answers *how does the kernel work?* not *what do we extract?*
> **Predecessor:** `PLATFORM_CORE_EXTRACTION_BLUEPRINT.md` v1.1 FROZEN
> **Next:** `SALESOS_V2_BLUEPRINT.md`

---

## How This Document Is Organized

This document is the **design** of the AQLIYA Platform Kernel. It does not repeat extraction plans, inventories, or waves — those are in the Blueprint.

It answers one question:

> **How does the kernel work?**

| # | Section | It Answers |
|---|---|---|
| 1 | **Kernel Philosophy** | What is the kernel? What are its boundaries? |
| 2 | **Runtime Architecture** | How do the layers stack at runtime? |
| 3 | **Capability Runtime** | How are capabilities registered, discovered, loaded? |
| 4 | **Kernel Domain Model** | What types does the kernel own? |
| 5 | **Kernel Service Architecture** | How is each capability structured internally? |
| 6 | **Dependency Rules** | What can depend on what? |
| 7 | **Extension Model** | How is a new capability added? |
| 8 | **Capability Governance** | Registry, versioning, lifecycle — full design. |
| 9 | **Operational Model** | Startup, health, diagnostics, observability. |
| 10 | **Evolution Rules** | How does the kernel evolve without becoming a monolith? |

---

## Principle 11 — Stable Core, Extensible Edge

This principle governs all design decisions in this document.

> **The Platform Kernel grows by extension, not by modification.**

| Meaning | Implication |
|---|---|
| Adding a new capability does not require modifying existing capabilities. | The Kernel is not a "God Object" that grows by accretion. |
| New capabilities register themselves via defined extension points. | No central list of all capabilities that needs updating. |
| The core domain model is frozen once stable. | Products extend generic types; they do not modify them. |
| Breaking changes require a new capability version, not a modification of the old one. | Consumers on old versions are not forced to upgrade. |

**This principle complements Platform Neutrality:** not only does the kernel not know about products — it also does not change shape every time a new product or capability is added. The core stays stable. Growth happens at the edge, via registration.

---

# 1. Kernel Philosophy

## 1.1 What the Kernel Is

The AQLIYA Platform Kernel is a **set of shared runtime services, domain abstractions, and extension contracts** that all AQLIYA products depend on.

It is:
- **A runtime** — services that run and coordinate during product operation
- **A contract set** — interfaces that products implement or consume
- **A registry** — known capabilities with versions and lifecycle states
- **A dependency** — the only allowed shared dependency for any product

## 1.2 What the Kernel Is NOT

| The Kernel is NOT | Because |
|---|---|
| A product | Products consume the kernel. The kernel has no UI, no workflows, no users. |
| A monolith | Capabilities are independently versioned, deployed, and owned. |
| A data lake | The kernel stores capability metadata, not product data. Products own their data. |
| An API gateway | The kernel provides runtime services, not HTTP routing. |
| A framework | Products do not extend the kernel via inheritance. They consume it via contracts. |
| A container | The kernel has no knowledge of what products are running or how they are deployed. |

## 1.3 Design Boundaries

| In Scope | Out of Scope |
|---|---|
| Capability registration, discovery, versioning | Product-specific business logic |
| Generic domain types (Entity, Workflow, Event, Signal, etc.) | Product-specific entities (SalesAccount, AuditEngagement, etc.) |
| Runtime coordination (Event Bus, Workflow Engine) | Product-specific UI, routes, components |
| Authorization enforcement | User management, authentication flows |
| Evidence linking infrastructure | Evidence file storage, format validation |
| AI orchestration contracts, provider routing | AI model training, prompt engineering |
| Feature flag evaluation | A/B experiment analysis |
| Capability lifecycle management | Product lifecycle management |
| Observability infrastructure | Product-specific dashboards, alerts |

---

# 2. Runtime Architecture

## 2.1 Layer Stack

```
┌─────────────────────────────────────────────────────────┐
│                     Products Layer                        │
│  SalesOS v2 │ AuditOS vNext │ DecisionOS vNext │ ...     │
│  (consume capabilities via contracts)                    │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Capability Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Event Bus│ │ Workflow │ │ Evidence │ │    AI    │   │
│  │          │ │ Engine   │ │ Network  │ │Orchestrat│   │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤   │
│  │ Knowledge│ │Instit.Mem│ │ Signal   │ │ Features │   │
│  │ Graph    │ │          │ │ Registry │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Kernel Services Layer                    │
│  Registry │ Auth │ Domain Model │ Policies │ Diagnostics │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                     │
│  Persistence (Prisma) │ Event Store │ Cache (Redis)     │
│  Provider Routing (ccr) │ Secrets │ Storage             │
└─────────────────────────────────────────────────────────┘
```

## 2.2 Layer Rules

| Layer | Can Import From | Cannot Import From |
|---|---|---|
| **Products** | Capability Layer contracts | Another product's internal code |
| **Capability Layer** | Kernel Services Layer, Infrastructure Layer | Products Layer |
| **Kernel Services Layer** | Infrastructure Layer | Capability Layer, Products Layer |
| **Infrastructure Layer** | Itself only | Any layer above |

## 2.3 Runtime Startup Sequence

```
1. Infrastructure Layer boots (Prisma, Redis, providers)
2. Kernel Services Layer boots (Registry, Auth, Domain)
3. Capability Layer registers each capability:
   a. Capability declares its contract
   b. Capability declares its dependencies (other capabilities)
   c. Registry validates dependency graph
   d. Capability is loaded
4. Health check: all capabilities report status
5. Products begin consuming
```

---

# 3. Capability Runtime

## 3.1 Capability Lifecycle at Runtime

```
REGISTERED → RESOLVED → LOADED → ACTIVE → DEGRADED → REMOVED
```

| State | Meaning |
|---|---|
| **REGISTERED** | Capability contract is published in the Registry |
| **RESOLVED** | Dependencies are resolved and validated |
| **LOADED** | Implementation is initialized |
| **ACTIVE** | Fully operational, accepting calls |
| **DEGRADED** | Operating with reduced functionality (e.g., dependency failed) |
| **REMOVED** | Unloaded from runtime |

## 3.2 Registration

```typescript
interface CapabilityRegistration {
  capabilityId: string;
  version: string;
  contract: CapabilityContract;
  dependencies: string[];  // other capability IDs
  init: () => Promise<void>;
  health: () => Promise<HealthStatus>;
  shutdown: () => Promise<void>;
}
```

A capability registers itself:

```typescript
// Example: Event Bus registering
kernel.register({
  capabilityId: "platform.event-bus",
  version: "1.0.0",
  contract: EventBusContract,
  dependencies: ["platform.auth"],
  init: async () => { /* connect to event store */ },
  health: async () => ({ status: "ok", latency: 12 }),
  shutdown: async () => { /* flush pending events */ },
});
```

## 3.3 Discovery

Products discover capabilities through the Registry, not through direct imports:

```typescript
// Product discovers a capability
const eventBus = await kernel.capability("platform.event-bus");

// Product calls the capability through its contract
await eventBus.publish({ ... });
```

The Registry returns the capability contract. The product never sees the implementation. This enables:
- Different implementations behind the same contract (testing, mocking, migration)
- Version negotiation (product requests v1, gets v1)
- Runtime replacement without product restart (if supported)

## 3.4 Dependency Resolution

When a capability registers, the Registry validates:

1. All declared dependencies exist in the Registry
2. All dependency versions are compatible (no MAJOR conflicts)
3. No circular dependencies exist
4. The dependency graph is a DAG (Directed Acyclic Graph)

If any check fails, the capability enters `REGISTERED` state but does not transition to `LOADED`. The Registry reports the failure with resolution details.

---

# 4. Kernel Domain Model

## 4.1 The Kernel's Owned Types

The Kernel owns **only** these generic types. Products extend them — they do not modify them.

```
Identity ─── Organization ─── User ─── Role ─── Permission

Capability ─── CapabilityContract ─── CapabilityVersion

Workflow ─── WorkflowState ─── WorkflowTransition ─── Policy

Event ─── EventEnvelope ─── Subscription ─── EventLog

Evidence ─── EvidenceLink ─── EvidenceSource

Knowledge ─── KnowledgeGraph ─── GraphNode ─── GraphEdge

Signal ─── SignalEnvelope ─── SignalRegistry

Agent ─── AgentContext ─── GovernanceRecord

Feature ─── FeatureFlag ─── TargetingRule

Notification ─── NotificationChannel ─── NotificationTemplate

Storage ─── StorageProvider ─── StorageReference
```

## 4.2 Type Ownership Rules

| Rule | Example |
|---|---|
| The Kernel defines the interface | `interface Workflow { ... }` |
| Products implement or extend the interface | `SalesDealWorkflow implements Workflow` |
| The Kernel never references product types | No `SalesAccount` anywhere in `src/lib/platform/` |
| Product types are validated against Kernel interfaces at compile time | TypeScript structural typing enforces this |

## 4.3 Core Interfaces

```typescript
// ─── Identity & Organization ───

interface Organization {
  id: string;
  name: string;
  platformOrganizationId?: string;
}

interface User {
  id: string;
  organizationId: string;
  roles: string[];
}

interface Permission {
  productSlug: string;
  action: string;     // e.g., "deal.create", "workflow.transition"
}

// ─── Capability ───

interface CapabilityContract {
  capabilityId: string;
  version: string;
  methods: string[];   // available operations
  events: string[];    // events this capability publishes
  since: string;       // version when this contract was introduced
}

// ─── Workflow ───

interface WorkflowDefinition {
  id: string;
  productSlug: string;
  name: string;
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  currentStage: string;
}

// ─── Event ───

interface EventEnvelope {
  id: string;
  type: string;
  source: string;
  subject: string;
  data: unknown;
  timestamp: string;
  sequenceId: string;
}

// ─── Evidence ───

interface EvidenceLink {
  id: string;
  targetType: string;
  targetId: string;
  evidenceId: string;
}

// ─── Signal ───

interface SignalEnvelope {
  id: string;
  type: string;
  sourceCapability: string;
  targetType: string;
  targetId: string;
  severity: "low" | "medium" | "high";
  payload: Record<string, unknown>;
}

// ─── Governance ───

interface GovernanceRecord {
  id: string;
  capabilityId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

// ─── Feature Flag ───

interface FeatureFlag {
  key: string;
  productSlug: string;
  enabled: boolean;
  rules?: TargetingRule[];
}
```

---

# 5. Kernel Service Architecture

## 5.1 Capability Internal Structure

Every capability follows the same internal pattern:

```
Capability
  │
  ├── Contract (interface) — published in Registry
  ├── Implementation — the actual runtime code
  ├── Storage — persistence layer for capability data
  ├── Policies — rules enforced during execution
  ├── Events — what events this capability publishes
  └── Extension Points — hooks for product-specific behavior
```

## 5.2 Example: Workflow Engine Internal Structure

```
Workflow Engine
  │
  ├── Contract: WorkflowEngine interface
  ├── Implementation:
  │     ├── createInstance()
  │     ├── transition()
  │     ├── getInstance()
  │     └── listDefinitions()
  ├── Storage: prisma.workflowDefinition, prisma.workflowInstance
  ├── Policies:
  │     ├── stageTransitionGuard — enforces evidence/approval requirements
  │     └── slaPolicy — checks SLA deadlines
  ├── Events:
  │     ├── workflow.instance.created
  │     ├── workflow.instance.transitioned
  │     └── workflow.instance.sla_breached
  └── Extension Points:
        ├── beforeTransition(entity, fromStage, toStage) → boolean
        └── afterTransition(entity, fromStage, toStage) → void
```

## 5.3 Contract Stability

Each capability contract follows these rules:

1. **Published before implementation** — Interface first, then acceptance test, then implementation.
2. **Semantic versioned** — MAJOR for breaking changes, MINOR for additions, PATCH for fixes.
3. **Dual support during MAJOR transitions** — Old contract continues until all consumers migrate.
4. **Tested via black-box acceptance tests** — Tests use only the contract, never the implementation.

---

# 6. Dependency Rules

## 6.1 Allowed Dependency Directions

```
Product A ──→ Capability Layer (contracts only)
Product B ──→ Capability Layer (contracts only)

Capability 1 ──→ Kernel Services Layer
Capability 2 ──→ Kernel Services Layer
Capability 2 ──→ Capability 1 (via contract only)

Kernel Services ──→ Infrastructure Layer
Kernel Services ──→ Itself (no circular)

Infrastructure ──→ Itself only
```

## 6.2 Forbidden Patterns

| Pattern | Why It Is Forbidden |
|---|---|
| Product → Product | Violates Product Independence. Products would not be independently deployable. |
| Capability → Product | Violates Platform Neutrality. Kernel must not know products. |
| Kernel Service → Capability | Kernel Services are lower than Capabilities in the layer stack. |
| Infrastructure → Kernel Service | Infrastructure is the lowest layer. |
| Circular dependency between Capabilities | Breaks the DAG. Prevents independent loading and evolution. |

## 6.3 Enforcement

These rules are enforced by:

1. **TypeScript imports** — `src/lib/platform/` cannot import from `src/lib/sales/`, `src/lib/audit/`, etc. (CI grep gate)
2. **Capability dependency graph** — Registry validates at registration time that no circular dependencies exist
3. **Build isolation** — Capabilities can be built and tested independently
4. **ADR requirement** — Any exception must be documented as an ADR and reviewed by the architecture board

---

# 7. Extension Model

## 7.1 How a New Capability Is Added

Adding a new capability to the Platform Kernel follows a fixed sequence:

```
1. Propose Capability (ADR)
   │
   ▼
2. Define Contract (interface)
   │
   ▼
3. Write Acceptance Tests (black-box)
   │
   ▼
4. Register in Registry (declares dependencies)
   │
   ▼
5. Implement (behind contract)
   │
   ▼
6. Validate (Consumer tests pass)
   │
   ▼
7. Publish (contract frozen, version set)
```

## 7.2 Registration API

```typescript
// Any capability can register itself at boot time
kernel.register({
  capabilityId: "platform.my-capability",
  version: "1.0.0",
  contract: MyCapabilityContract,
  dependencies: ["platform.auth", "platform.event-bus"],
  extensionPoints: {
    hooks: ["beforeAction", "afterAction"],
    providers: ["dataProvider"],
  },
  init: async () => { /* ... */ },
  health: async () => { /* ... */ },
  shutdown: async () => { /* ... */ },
});
```

## 7.3 Extension Points

Capabilities can expose extension points that other capabilities or products can hook into:

```typescript
interface ExtensionPoint {
  name: string;
  type: "hook" | "provider" | "filter";
  contract: string;  // the interface the extension must implement
}

// Example: Workflow Engine exposes beforeTransition hook
// A product can register a hook to validate business rules:
kernel.hook("platform.workflow", "beforeTransition", async (context) => {
  if (context.toStage === "proposal" && context.evidenceCount === 0) {
    return { allowed: false, reason: "Evidence required before proposal" };
  }
  return { allowed: true };
});
```

## 7.4 Capability Removal

A capability is removed when:

1. All consumers have migrated to a replacement
2. The capability enters `Deprecated` lifecycle stage
3. A removal date is set and communicated
4. On the removal date, the capability enters `Retired` stage
5. The Registry stops returning its contract
6. The runtime unloads its implementation

---

# 8. Capability Governance

> This section provides the full design for the three governance concepts introduced in the Blueprint (§4.3).

## 8.1 Capability Registry

### Data Model

```typescript
interface CapabilityEntry {
  id: string;                         // e.g., "platform.event-bus"
  name: string;                       // Human-readable name
  description: string;
  owner: string;                      // Team or person
  status: CapabilityStage;
  since: string;                      // Version when introduced
  versions: CapabilityVersionEntry[];
  dependencies: string[];             // Capability IDs this depends on
  consumers: string[];                // Product slugs
  contracts: CapabilityContract[];
  changelog: string;
  tags: string[];                     // e.g., ["extracted", "internal", "wave-1"]
}

interface CapabilityVersionEntry {
  version: string;                    // semver
  contract: string;                   // e.g., "EventBus v1"
  publishedAt: string;
  breaking: boolean;                  // true if MAJOR bump
  deprecated: boolean;
  supersededBy?: string;              // version that replaces this
}

interface CapabilityContract {
  version: string;
  interface: string;                  // TypeScript interface name
  methods: string[];
  events: string[];                   // events this capability publishes
  since: string;                      // version when this contract was added
}
```

### Registry API

```typescript
interface CapabilityRegistry {
  // Registration
  register(entry: CapabilityRegistration): Promise<void>;
  
  // Discovery
  get(id: string, version?: string): Promise<CapabilityEntry | null>;
  list(filter?: { status?: CapabilityStage; product?: string }): Promise<CapabilityEntry[]>;
  
  // Dependency Validation
  validateGraph(): Promise<DependencyValidationReport>;
  
  // Consumer Tracking
  addConsumer(capabilityId: string, productSlug: string): Promise<void>;
  removeConsumer(capabilityId: string, productSlug: string): Promise<void>;
  listConsumers(capabilityId: string): Promise<string[]>;
  
  // Lifecycle
  transition(capabilityId: string, toStage: CapabilityStage): Promise<void>;
}
```

## 8.2 Versioning Policy

### Rules

| Change Type | Version Bump | Consumer Impact |
|---|---|---|
| Bug fix, no contract change | PATCH | None — backward compatible |
| New method or event added (non-breaking) | MINOR | Existing code continues to work |
| Method signature changed | MAJOR | Consumer must update |
| Method removed | MAJOR | Consumer must update |
| Event schema changed | MAJOR | Consumer must update |
| Dependency added | MINOR | Should be transparent to consumer |

### Dual-Version Support

When a MAJOR version is released:

1. Old version continues to serve existing consumers
2. New version registers alongside it
3. Consumers migrate at their own pace
4. Old version is deprecated only when zero consumers remain on it

```
Time:  ──────────────────────────────────────────────►

platform.workflow@1.0.0  │███████████████████████████████
                         │                            │
platform.workflow@2.0.0  │              ████████████████
                         │              │
                    v2 released     v1 deprecated
                    Consumers       when zero
                    can choose      consumers remain
```

## 8.3 Lifecycle Stages

### Stage Definitions

```
DRAFT ──→ EXPERIMENTAL ──→ INTERNAL ──→ STABLE ──→ DEPRECATED ──→ RETIRED
                                                                   
  ↑           ↑               ↑            ↑            ↑            ↑
Concept    May change     AQLIYA only   Public       Schedule     Removed
           without notice versioned     contract     for removal
```

### Stage Transitions

| Transition | Requires |
|---|---|
| DRAFT → EXPERIMENTAL | Working implementation with passing tests |
| EXPERIMENTAL → INTERNAL | Contract reviewed and frozen. ADR approved. |
| INTERNAL → STABLE | At least one production consumer. Security review. |
| STABLE → DEPRECATED | Replacement exists. All consumers notified. Removal date set. |
| DEPRECATED → RETIRED | Removal date reached. Zero consumers remain. |

### Expected State After Each Wave

| Capability | After Wave 1 | After Wave 2 | After Wave 3 | SalesOS v2 Launch |
|---|---|---|---|---|
| Event Bus | EXPERIMENTAL | INTERNAL | INTERNAL | STABLE |
| Workflow Engine | EXPERIMENTAL | INTERNAL | INTERNAL | STABLE |
| Evidence Network | EXPERIMENTAL | INTERNAL | INTERNAL | STABLE |
| Auth | INTERNAL | INTERNAL | STABLE | STABLE |
| AI Orchestration | — | EXPERIMENTAL | INTERNAL | STABLE |
| Feature Flags | — | EXPERIMENTAL | INTERNAL | STABLE |
| Knowledge Graph | — | — | EXPERIMENTAL | INTERNAL |
| Institutional Memory | — | — | EXPERIMENTAL | INTERNAL |
| Signal Registry | — | — | EXPERIMENTAL | INTERNAL |

---

# 9. Operational Model

## 9.1 Startup Sequence

```
1. Infrastructure boot
   ├── Prisma connection pool initialized
   ├── Redis connection initialized
   ├── Provider routing (ccr) initialized
   └── Storage backends initialized

2. Kernel Services boot
   ├── Capability Registry loaded from storage
   ├── Auth service initialized
   ├── Domain model validated
   └── Diagnostics service started

3. Capability registration
   ├── Each capability calls kernel.register()
   ├── Registry validates dependency graph
   ├── Failed dependencies → capability stays REGISTERED
   └── All dependencies met → capability transitions to LOADED

4. Capability initialization
   ├── Each LOADED capability calls its init() function
   ├── init() may connect to event stores, warm caches, etc.
   └── Successful init → capability transitions to ACTIVE

5. Health check
   ├── All ACTIVE capabilities report health
   ├── Registry aggregates health status
   └── Kernel reports overall health (healthy / degraded / failed)

6. Products begin consuming
   ├── Products discover capabilities via Registry
   └── Products call capabilities through contracts
```

## 9.2 Health Check Model

```typescript
interface HealthReport {
  overall: "healthy" | "degraded" | "failed";
  capabilities: CapabilityHealth[];
  timestamp: string;
}

interface CapabilityHealth {
  capabilityId: string;
  status: "active" | "degraded" | "failed";
  latency: number;           // ms for last health check
  lastFailure?: string;
  failureCount: number;
  dependencies: string[];    // dependency capability health statuses
}
```

**Endpoints:**
- `GET /api/platform/health` — overall Kernel health
- `GET /api/platform/capabilities` — all registered capabilities with status
- `GET /api/platform/capabilities/:id/health` — specific capability health

## 9.3 Diagnostics

| Diagnostic | Frequency | What It Checks |
|---|---|---|
| Capability registration completeness | On startup + every deploy | All expected capabilities registered |
| Dependency graph validity | On every registration change | No cycles, no missing deps |
| Contract backward compatibility | On every deploy | MAJOR changes require explicit ADR |
| Consumer validation | On every capability version publish | At least one consumer can still compile |
| Extraction Reversibility | On every extraction | Source product can still function without extracted capability |

## 9.4 Observability

Each capability publishes:

| Signal | Destination | Purpose |
|---|---|---|
| `capability.registered` | Event Bus | Audit trail of registration |
| `capability.loaded` | Event Bus | Startup monitoring |
| `capability.failed` | Event Bus | Alerting |
| `capability.deprecated` | Event Bus | Consumer notification |
| `capability.removed` | Event Bus | Cleanup tracking |
| Capability-specific metrics | Prometheus (future) | Latency, error rates, throughput |
| Capability-specific logs | Structured logs | Debugging, audit |

---

# 10. Evolution Rules

## 10.1 How the Kernel Grows

The Kernel evolves through these mechanisms, listed in order of preference:

| Mechanism | When to Use | Example |
|---|---|---|
| **1. New capability registration** | A new cross-product concern emerges | Add `platform.notifications` |
| **2. New extension point** | Products need variation without breaking contracts | Add `beforeTransition` hook to Workflow Engine |
| **3. New contract version** | Backward-incompatible change required | `EventBus v2` with new publish signature |
| **4. Capability replacement** | Entire capability needs to be replaced | New `platform.workflow-v2` replaces old workflow engine |
| **5. Core type extension** | Rare — generic type needs a new field | Add `metadata` to `EventEnvelope` |

## 10.2 What Does NOT Grow the Kernel

| Change | Belongs In |
|---|---|
| A new product entity (e.g., `SalesAccountWidget`) | The product, not the kernel |
| A new product-specific integration | The product, via extension points |
| A new deployment target | Infrastructure configuration, not kernel code |
| A new UI pattern | The product's component library |
| A new reporting metric | The product's analytics module |

## 10.3 Anti-Degradation Rules

To prevent the Kernel from becoming a monolith over 5 years:

| Rule | Enforcement |
|---|---|
| **No capabilitiy may import another capability's implementation** | Only contracts are shared between capabilities |
| **No capability may exceed 5,000 lines of implementation** | CI line count gate — forces splitting into sub-capabilities |
| **No capability may have > 5 direct dependencies** | Forces clean separation of concerns |
| **Every MAJOR version change requires an ADR** | Prevents accidental breaking changes |
| **Every capability has a single owner** | No orphan capabilities |
| **Capabilities with zero consumers for 6 months are deprecated** | Prevents dead code accumulation |
| **The Registry is the single source of truth for capability metadata** | No ad-hoc capability configuration |

## 10.4 5-Year Evolution Path

```
Year 1                     Year 2-3                   Year 4-5
───────────────────────────────────────────────────────────────

Wave 1-3 Capabilities      Phase B Capabilities       Phase C Capabilities
  (8-10 internal)            (Institutional Memory,     (Air-Gapped Runtime,
                              Pattern Recognition,       Multi-Region,
                              Signal Aggregation,        Marketplace SDK,
                              Marketplace SDK)           Plugin Runtime,
                                                         Tenant Federation)

First Consumer              More consumers             Third-party extensions
  (SalesOS v2)               (AuditOS vNext,            (Partner ecosystem via
                              DecisionOS vNext,           Capability Registry)
                              LocalContentOS vNext)

Contracts Internal          Contracts Stable           Contracts Public

Manual registration         Semi-automated             Fully automated
                            registration               marketplace
```

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
PLATFORM_CORE_EXTRACTION_BLUEPRINT.md           ← Execution Contract (FROZEN)
        │
        ▼
PLATFORM_KERNEL_ARCHITECTURE.md                 ← THIS DOCUMENT (ACTIVE)
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
| `PLATFORM_CORE_EXTRACTION_BLUEPRINT.md` | Execution Contract | How shared capabilities are extracted | ✅ FROZEN |
| **THIS DOCUMENT — Platform Kernel Architecture** | **Design** | **How the kernel works** | **✅ ACTIVE** |
| `SALESOS_V2_BLUEPRINT.md` (future) | Design | SalesOS v2 as first Kernel consumer | ⏸️ Next |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Design
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Predecessor:** `PLATFORM_CORE_EXTRACTION_BLUEPRINT.md` v1.1 FROZEN
- **Next document:** `SALESOS_V2_BLUEPRINT.md`
- **Authority:** ADR-001 (from Reality Assessment)
- **Governing Principles:** Product Independence, Platform Neutrality, Consumer-Driven Extraction, Kernel Budget Rule, One Owner Rule, Extraction Reversibility, Contracts before Implementations, Capability Registry, Capability Versioning, Capability Lifecycle, **Stable Core Extensible Edge**
- **Status:** Draft — ready for review
