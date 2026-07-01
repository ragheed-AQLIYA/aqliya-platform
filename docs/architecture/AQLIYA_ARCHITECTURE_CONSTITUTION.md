# AQLIYA Architecture Constitution

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Governance — constitutional principles that bind all AQLIYA products and platform.
> **Scope:** AQLIYA Platform Kernel, SalesOS, AuditOS, DecisionOS, LocalContentOS, WorkflowOS, Office AI Assistant, and any future product built on the platform.
> **Authority:** This document supersedes any conflicting statement in subordinate documents. If a product decision conflicts with this constitution, the constitution wins.

---

## Preamble

This constitution defines the **eleven immutable principles** of the AQLIYA architecture. Every product, every capability, every service, and every component must obey these principles. No technical convenience, delivery deadline, or organizational pressure may override them.

The constitution exists to ensure that AQLIYA remains a **coherent, governable, independently-deployable platform ecosystem** — not a collection of tightly-coupled products that cannot evolve independently.

---

## The Eleven Principles

### 1. Product Independence

> Every AQLIYA product must be independently licensable, deployable, operable, upgradable, and testable.

**Rationale:** The commercial model requires selling products separately. No product may depend on another product's runtime, data, or internal code.

**Enforcement:** The Platform Kernel is the only allowed shared dependency. Direct product-to-product imports are architectural violations. Cross-product communication goes through the Event Bus.

**Violation example:** SalesOS v1 imports from AuditOS → violates Product Independence.

---

### 2. Platform Neutrality

> The Platform Kernel must not know about any product.

**Rationale:** If the Kernel knows about products, it cannot evolve independently. Adding a new product would require Kernel changes. Products become Kernel's dependents, not autonomous consumers.

**Enforcement:** The Kernel's domain model contains only generic concepts: `Identity`, `Organization`, `User`, `Workflow`, `Evidence`, `Event`, `Signal`, `Capability`, `Feature`. Zero references to product-specific entities (`SalesAccount`, `AuditEngagement`, `LocalContentProject`, etc.) may exist inside `src/lib/platform/`.

**Violation example:** Platform Kernel contains a `SalesAccount` type → violates Platform Neutrality.

---

### 3. Consumer-Driven Extraction

> No capability may be extracted into the Platform Kernel unless there is at least one identified consumer and one defined contract.

**Rationale:** Prevents building platform capabilities that nobody needs. Every platform component must prove its value by serving at least one product.

**Enforcement:** Every extraction candidate requires a `First Consumer` field and a `Contract` before extraction begins. Components with no identified consumer remain in their source product.

**Violation example:** Extracting a Plugin Runtime capability when no product has requested it → violates Consumer-Driven Extraction.

---

### 4. Kernel Budget Rule

> Every extraction sprint must end with a validated consumer.

**Rationale:** Prevents long-running platform work with no integration validation. Each sprint produces a capability that a real product can use.

**Enforcement:** No sprint may extract components without validating that the first consumer can use them. Validation is the definition of "done" for the sprint.

**Violation example:** A sprint extracts Identity, Auth, Event Bus, and Workflow Engine but cannot demonstrate any working consumer flow → violates Kernel Budget Rule.

---

### 5. One Owner Rule

> Every extracted component must have an owner, a contract, a first consumer, and an acceptance test.

**Rationale:** Prevents orphan capabilities that nobody maintains, nobody knows how to use, and nobody can verify.

**Enforcement:** All four fields must be populated before extraction begins. If any field is empty, the component is not ready for extraction.

**Violation example:** A Knowledge Graph service is moved to the platform with no documented owner and no consumer test → violates One Owner Rule.

---

### 6. Extraction Reversibility

> Every extraction must be reversible until its consumer has been validated.

**Rationale:** Reduces risk of failed extractions. If a contract is wrong, the extraction is rolled back without breaking the source product.

**Enforcement (Strangler Pattern):**
1. Identify existing implementation
2. Extract interface/contract to platform
3. Build platform implementation (initially delegating to existing code)
4. Update source product to consume platform version
5. Validate consumer
6. Only after validation: remove old implementation
7. If validation fails: revert consumer to old implementation

**Violation example:** Removing the source product's internal implementation before validating the consumer → violates Extraction Reversibility.

---

### 7. Contracts Before Implementation

> Contracts are designed, reviewed, and frozen before implementation begins.

**Rationale:** If implementation precedes interface, the interface becomes a reflection of accidental implementation details rather than a deliberate contract.

**Enforcement:** Sequence: Interface Definition → Acceptance Test → Implementation → Consumer Validation. Not the reverse.

**Violation example:** Building a Workflow Engine implementation and then deriving its API from the code → violates Contracts Before Implementation.

---

### 8. Capability Registry

> Every platform capability must be registered in a central Capability Registry before it can be consumed.

**Rationale:** Products discover capabilities through the Registry, not through file paths or package names. The Registry provides versioning, lifecycle, and dependency management.

**Enforcement:** No capability may be consumed by a product unless it is registered. The Registry is the single source of truth for capability metadata.

**Violation example:** A product imports a platform service directly without going through the Registry → violates Capability Registry.

---

### 9. Capability Versioning

> Every platform capability owns its own semantic version. Products declare which version they consume.

**Rationale:** Products ship on different cadences. A breaking change in one capability must not block consumers of other capabilities. A product can upgrade capabilities one at a time.

**Enforcement:** MAJOR = breaking contract change, MINOR = backward-compatible addition, PATCH = bug fix. MAJOR changes require ADR approval. Old versions continue serving existing consumers until zero remain.

**Violation example:** A capability publishes a breaking change as a MINOR version bump → violates Capability Versioning.

---

### 10. Capability Lifecycle

> Every platform capability has a lifecycle stage that governs consumer expectations.

**Stages:** Draft → Experimental → Internal → Stable → Deprecated → Retired.

| Stage | Consumer Expectations |
|---|---|
| Draft | Do not depend on it |
| Experimental | Contract may change without MAJOR bump |
| Internal | Contract is versioned. AQLIYA products only. |
| Stable | Backward compatibility guaranteed within MAJOR version. |
| Deprecated | Still works. No new features. Migrate. |
| Retired | Removed. Consumers must have migrated. |

**Enforcement:** A capability's stage is published in the Registry. Consumers are notified before Deprecated and Retired transitions. Zero-consumer capabilities for 6 months are automatically deprecated.

**Violation example:** A capability marked "Internal" is consumed by a third-party product without explicit agreement → violates Capability Lifecycle.

---

### 11. Stable Core, Extensible Edge

> The Platform Kernel grows by extension, not by modification.

**Rationale:** Adding a new capability must not require modifying existing capabilities. The Kernel core stays frozen once stable. Growth happens via registration, not accretion.

**Enforcement:** New capabilities register themselves through defined extension points. No capability may import another capability's implementation — only contracts. No capability may exceed 5,000 lines of implementation. No capability may have > 5 direct dependencies.

**Violation example:** Adding a new feature requires modifying the Event Bus contract → violates Stable Core, Extensible Edge.

---

### 12. Business First, Technology Second

> Every platform capability must be justified by a shared business capability that multiple products need.

**Rationale:** Platforms fail when they build generic technical capabilities that no product actually needs at the business level. The question is never "can we build this?" — it is "what business capability does this enable?"

**Enforcement:** Every new capability proposed for the Platform Kernel must answer:
1. What business capability does it enable? (e.g., "Identity & Access Management" not "Auth Service")
2. Which products need this business capability?
3. What would each product do differently if this capability existed?

If the answer to (2) is "only one product," the capability may still be extracted — but it is validated more strictly for generality.

**Distinction from Consumer-Driven Extraction (Principle 5):**
- Principle 5 asks: "Who is the technical consumer?"
- Principle 12 asks: "What is the business capability this serves?"
- Both must be satisfied. A capability with a technical consumer but no business justification is rejected.

**Violation example:** Proposing a "Generic Notification Engine" because the technology is elegant, but no product has a business requirement for cross-product notifications → violates Business First, Technology Second.

---

When two principles conflict, the higher-priority principle wins.

| Priority | Principle | Rationale |
|---|---|---|---|
| 1 (highest) | **Product Independence** | The commercial model depends on this. If violated, products cannot be sold separately. |
| 2 | **Platform Neutrality** | If violated, the Kernel becomes coupled to products and cannot evolve independently. |
| 3 | **Stable Core, Extensible Edge** | If violated, the Kernel becomes a monolith and cannot scale. |
| 4 | **Business First, Technology Second** | If violated, the platform builds technical solutions without business justification. |
| 5 | **Contracts Before Implementation** | If violated, contracts become accidental and unstable. |
| 6 | **Consumer-Driven Extraction** | If violated, platform work becomes speculative and unvalidated. |
| 7 | **Kernel Budget Rule** | If violated, sprints produce unvalidated output. |
| 8 | **Extraction Reversibility** | If violated, failed extractions break products. |
| 9 | **One Owner Rule** | If violated, orphan capabilities accumulate. |
| 10 | **Capability Registry** | If violated, there is no source of truth for capabilities. |
| 11 | **Capability Versioning** | If violated, upgrades become painful and risky. |
| 12 (lowest) | **Capability Lifecycle** | Important for planning, but less critical than the above. |

---

## Business Capability Map

This map defines the **top-level business capabilities** that the AQLIYA Platform serves. It sits at the top of the capability hierarchy and answers: *what business problems does the platform solve?*

The full hierarchy is: **Business Capability → Platform Capability → Product Capability (product-specific) → Domain → Module**. See the Product Capability Layer section below for the next level.

```
Business Capabilities         Platform Capabilities          First Consumer
        │                              │
        ▼                              ▼
┌──────────────────────┐    ┌────────────────────┐
│ Identity & Access    │───▶│ platform.auth      │──▶ SalesOS v2
│ Management           │    │ platform.identity  │
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Business Workflow    │───▶│ platform.workflow  │──▶ SalesOS v2
│ Orchestration        │    │                    │    AuditOS vNext
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Governed AI          │───▶│ platform.ai        │──▶ SalesOS v2
│ Intelligence         │    │                    │    DecisionOS vNext
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Evidence & Audit     │───▶│ platform.evidence  │──▶ SalesOS v2
│ Management           │    │ platform.audit     │    AuditOS vNext
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Institutional        │───▶│ platform.knowledge │──▶ SalesOS v2
│ Knowledge            │    │ platform.memory    │    DecisionOS vNext
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Cross-Product Events │───▶│ platform.event-bus │──▶ SalesOS v2
│ & Signals            │    │ platform.signals   │    All products
└──────────────────────┘    └────────────────────┘

┌──────────────────────┐    ┌────────────────────┐
│ Feature Rollout      │───▶│ platform.features  │──▶ SalesOS v2
│ & Experimentation    │    │                    │    All products
└──────────────────────┘    └────────────────────┘
```

### How New Products Use the Map

When a new product is proposed (e.g., FinanceOS, HROS, ProcurementOS):

1. Identify which **Business Capabilities** the product needs
2. Map each to the corresponding **Platform Capability**
3. Any business capability not covered → propose a new Platform Capability (with ADR)
4. The product is then designed as a consumer of those Platform Capabilities only

**Example — FinanceOS:**

| Business Need | Business Capability | Platform Capability | Already Exists? |
|---|---|---|---|
| User authentication | Identity & Access | platform.auth | ✅ Yes |
| Approval routing | Business Workflow | platform.workflow | ✅ Yes |
| Financial report generation | Governed AI | platform.ai | ✅ Yes |
| Document evidence linking | Evidence & Audit | platform.evidence | ✅ Yes |
| Chart of accounts | (Finance-specific) | — | ❌ New product logic |

FinanceOS uses 4 existing Platform Capabilities and adds its own product-specific domain logic (chart of accounts, reconciliation rules, financial statements). It depends on the Kernel, not on any other product.

## Product Capability Layer

Between Business Capabilities and domain models, every product defines its own **Product Capabilities**. These are product-specific — they are not shared platform capabilities, but they are too coarse to be single domains.

The full hierarchy is:

```
Business Capability
        ↓  (shared across products)
Platform Capability
        ↓  (shared across products)
Product Capability
        ↓  (product-specific)
Domain
        ↓  (product-specific)
Module
```

### Examples

**SalesOS:**

| Layer | Name | Scope |
|---|---|---|
| Business Capability | Revenue Management | AQLIYA-wide |
| Platform Capability | platform.workflow, platform.ai, platform.evidence | AQLIYA-wide |
| **Product Capability** | **Revenue Intelligence** | **SalesOS-specific** |
| Domain | Forecasting, Pipeline Analytics, Account Scoring | SalesOS-specific |
| Module | Forecast Workspace, Pipeline View, ICP Dashboard | SalesOS-specific |

**AuditOS:**

| Layer | Name | Scope |
|---|---|---|
| Business Capability | Evidence & Audit Management | AQLIYA-wide |
| Platform Capability | platform.evidence, platform.workflow | AQLIYA-wide |
| **Product Capability** | **Audit Execution** | **AuditOS-specific** |
| Domain | Field Work, Sampling, Review Notes | AuditOS-specific |
| Module | Workpaper Review, Sampling Dashboard | AuditOS-specific |

**FinanceOS (future):**

| Layer | Name | Scope |
|---|---|---|
| Business Capability | Financial Operations | AQLIYA-wide |
| Platform Capability | platform.workflow, platform.evidence | AQLIYA-wide |
| **Product Capability** | **Financial Close** | **FinanceOS-specific** |
| Domain | Period Closing, Reconciliation, Reporting | FinanceOS-specific |
| Module | Close Checklist, Reconciliation Workspace | FinanceOS-specific |

### Why This Layer Exists

Without Product Capabilities, Domains are forced to play two roles:
1. Representing a business capability of the product
2. Representing a technical module

This leads to domain bloat over time. The Product Capability layer absorbs the business-role, leaving Domains to be purely structural.

### Where Product Capabilities Are Defined

Product Capabilities are defined in each product's Blueprint document (e.g., `SALESOS_V2_BLUEPRINT.md`). The Constitution only establishes that this layer exists and must be included.

### Map Evolution

The Business Capability Map grows when:
- A new product reveals a shared business need not yet covered
- A business capability is no longer needed by any product
- A business capability must be split into finer-grained capabilities

All changes require an ADR and must reference the affected Business Capabilities.

---

## How to Use This Constitution

1. **Before any architecture decision**, check which principles apply.
2. **If a decision conflicts with a principle**, the principle wins. Do not proceed.
3. **If two principles conflict**, the higher-priority principle wins. Document the resolution.
4. **Amending this constitution** requires a unanimous ADR with documented rationale. Amendments are rare.
5. **All subordinate documents** (Blueprints, Architecture Designs, Product PRDs, Specifications) must reference this constitution and declare which principles they satisfy.

---

## Document Relationships

```
AQLIYA ARCHITECTURE CONSTITUTION
        │
        ├── References ── ADR-001 through ADR-004 (Documented in Architecture Decision Index)
        │
        ├── Binds ── Platform Core Extraction Blueprint
        │
        ├── Binds ── Platform Kernel Architecture
        │
        ├── Binds ── SalesOS v2 Blueprint (and all future product blueprints)
        │
        └── Binds ── All AQLIYA products (SalesOS, AuditOS, DecisionOS, LocalContentOS, etc.)
```

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Governance — Constitutional
- **Date:** 2026-06-28
- **Version:** 0.3 (Draft)
- **Next lower documents:** `PLATFORM_CORE_EXTRACTION_BLUEPRINT.md`, `PLATFORM_KERNEL_ARCHITECTURE.md`, `SALESOS_V2_BLUEPRINT.md` (future — also serves as Product Blueprint Template)
- **Sibling document:** `ARCHITECTURE_DECISION_INDEX.md` (decision map)
- **Changes:**
  - v0.1: 11 principles, priority table, enforcement rules
  - v0.2: Principle 12 added (Business First, Technology Second). Business Capability Map added. Priority table updated.
  - v0.3: **Product Capability Layer added** — bridges Business Capabilities to product Domains. Full hierarchy defined: Business → Platform → Product → Domain → Module. Examples for SalesOS, AuditOS, FinanceOS. ADR-015.
- **Status:** Draft — ready for review
