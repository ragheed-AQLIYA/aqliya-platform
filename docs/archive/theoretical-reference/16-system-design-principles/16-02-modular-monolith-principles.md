---
title: Modular Monolith Principles
document_id: 16.02
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 01.01, 02.01, 16.01, 16.03, 16.10, 16.12
---

# Modular Monolith Principles

## 1. Purpose

This document defines the architectural philosophy and structural principles governing AQLIYA's modular monolith approach. It explains why AQLIYA rejects both monolithic coupling and premature microservice decomposition in favor of internal modularity with strict domain boundaries.

## Doctrine Modernization Note

This document remains valid as architecture doctrine. Its older decision-infrastructure language should be read as one strategic doctrine inside AQLIYA's broader platform architecture.

## 2. Thesis

**AQLIYA should be deployed as a single unit with internal module boundaries that are as strict as service boundaries but without the operational fragility, data consistency costs, and governance risks of distributed microservices.**

## 3. Problem

Regulated governed workflows require data consistency, transactional integrity, and cross-domain traceability. Microservice architectures sacrifice these properties for deployment independence that AQLIYA does not need at its current scale. Monolithic architectures sacrifice modularity for simplicity, creating coupling that makes domain evolution costly. A modular monolith preserves the benefits of both approaches.

## 4. Why Existing Systems Fail

- microservice architectures in audit and financial domains create distributed data consistency problems that produce exactly the integrity failures the system should prevent
- monolithic audit tools accumulate technical debt because domain boundaries erode under shipping pressure, making it impossible to evolve one domain without destabilizing others
- service mesh architectures introduce operational complexity that small teams cannot sustain, diverting engineering effort from domain depth to infrastructure management
- event-driven architectures without transactional guarantees produce eventual consistency that is incompatible with evidence integrity requirements

The common failure is choosing the architecture pattern for its perceived modernity rather than for its fit to domain requirements.

## 5. AQLIYA Philosophy

AQLIYA builds governed AI operating systems for domains where a single inconsistent record can create regulatory liability. The architecture must prioritize data integrity and transactional coherence over deployment flexibility. Modular monolith is the correct architecture because it enforces domain boundaries structurally while keeping data within a single transactional boundary.

AuditOS is the current primary product line. The modular monolith will grow additional domain modules and supporting capabilities over time. Each module must be internally cohesive and externally decoupled so that the monolith can be decomposed if scale demands it, but not before.

## 6. Core Principles

1. A module is the unit of domain isolation. Code outside a module does not access its internal data structures.
2. Cross-module communication occurs through declared interfaces, not through shared tables or direct function calls.
3. A single transactional boundary covers the entire monolith. Cross-module data changes are locally consistent.
4. Module boundaries are enforced at compile time through access controls, not through convention alone.
5. Each module owns its data schema. Other modules access that data only through the owning module's interface.
6. The monolith is deployed as a single unit. Module-level deployment independence is a future option, not a current requirement.
7. Adding a new domain module must not require changes to existing module internals.

## 7. Key Concepts

- **Module:** A self-contained domain unit with its own data model, business logic, and declared interface. Analogous to a bounded context in domain-driven design.
- **Declared Interface:** The set of operations, queries, and events a module exposes to other modules. All inter-module communication passes through this interface.
- **Internal Implementation:** Code and data structures within a module that are inaccessible to other modules. This includes database tables, helper functions, and domain events that are not part of the declared interface.
- **Structural Boundary:** A compile-time or build-time enforcement mechanism that prevents modules from accessing each other's internals.
- **Transactional Coherence:** The guarantee that a state change spanning multiple modules completes atomically within a single database transaction.

## 8. Operational Implications

1. Deployment is straightforward because one artifact is released at a time.
2. Monitoring must distinguish module-level health within the single deployment.
3. Incident triage should identify the affected module first, then trace cross-module interactions.
4. Database operations must remain within the single-database boundary. Module-specific schemas provide isolation without distributed transactions.

## 9. Product Implications

1. Feature development teams work within module boundaries. Cross-module features are designed at the interface level first.
2. Product roadmap must account for module interface stability. Changing a module interface requires coordination with dependent modules.
3. New domains are added as new modules, not as modifications to existing ones.

## 10. Architecture Implications

1. The codebase is organized by module, not by technical layer. A module contains its own models, services, interfaces, and tests.
2. Module dependencies form a directed acyclic graph. Circular dependencies between modules are prohibited.
3. Database schemas are namespaced per module. Foreign keys across module boundaries use declared interface methods, not direct table references.
4. Shared infrastructure concerns such as authentication, event dispatch, and storage are provided by a platform layer that modules use but do not own.
5. Integration tests exercise module interfaces. Unit tests exercise module internals.

## 11. Governance Implications

Governance rules are enforced within modules, not across them in infrastructure middleware. Each module is responsible for applying governance constraints relevant to its domain. The platform layer provides governance primitives, but modules determine how those primitives apply to their domain logic.

## 12. AI / Intelligence Implications

AI capabilities are deployed as a cross-cutting module that operates within the governance constraints of the calling module. The intelligence module provides services such as recommendation generation, evidence linking, and pattern detection, but it does not own domain logic or make decisions. Modules invoke intelligence services through the declared interface and receive results that must be processed through the calling module's governance rules.

## 13. UX Implications

The user experience is composed from module-specific interface components. Users interact with a unified application, but the interface components are owned and maintained by the module teams. Cross-module navigation follows declared interface contracts, not direct URL references to module internals.

## 14. Commercial Implications

The modular monolith reduces the operational cost of serving regulated enterprise clients. Single-region deployment with internal module isolation satisfies most enterprise deployment requirements. Clients who need module-level deployment isolation, such as air-gapped financial environments, can be served through module-level packaging without re-architecting the system.

## 15. Anti-Patterns

1. **Leaky Module Boundaries.** Allowing direct database queries across module schemas, which couples modules at the data layer and makes independent evolution impossible.
2. **Shared Mutable State.** Using global state or shared caches that modules mutate without coordination, reintroducing the consistency problems the monolith was chosen to avoid.
3. **Premature Decomposition.** Extracting modules into separate services before domain boundaries are stable, creating distributed failures on top of unstable interfaces.
4. **God Module.** Letting one module accumulate logic that should belong to other modules, typically because the owning module is the first one built and becomes the default location for new features.
5. **Interface Neglect.** Failing to maintain declared interfaces as the system evolves, allowing modules to communicate through undocumented channels.
6. **Transaction Overflow.** Designing transactions that span so many module operations that they reintroduce the coupling the architecture was designed to eliminate.

## 16. Examples

**Example 1:** The audit module needs to reference a client entity from the organization module. It calls the organization module's declared interface method `getClient(clientId)` rather than querying the organization schema directly. If the organization module changes its internal schema, the audit module is unaffected because it only depends on the interface contract.

**Example 2:** A workflow spans the evidence module and the finding module. When evidence is marked as insufficient, the finding module receives a notification through the declared interface and updates the finding's status. The entire state change occurs within a single transaction, preserving data consistency.

**Example 3:** The financial intelligence module is added to the platform. It defines its own data model, workflows, and governance rules as a self-contained module. It calls the evidence module's interface to link financial data to evidence objects. No existing module code needs modification.

## 17. Enterprise Impact

1. Lower operational risk because single-deployment reduces distributed system failure modes.
2. Faster feature delivery because module teams can develop, test, and refine within their boundaries without coordinating releases across teams.
3. Data consistency guarantees that regulated enterprises require for audit and financial decisions.
4. Simple tenant isolation because module-level data can be partitioned by tenant within a single database.

## 18. Long-Term Strategic Importance

The modular monolith is AQLIYA's architectural foundation. If module boundaries are maintained with discipline, the architecture can scale to dozens of domain modules without operational complexity. If boundaries erode, AQLIYA accumulates the coupling costs of a monolith without the benefits of modularity. The architecture supports future decomposition into separate services if specific modules require independent scaling, but that decision should be driven by observed performance requirements, not by architectural ideology.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Root doctrine for architectural decisions |
| 02.01 | Enterprise Decision Intelligence Theory | Domain requirements that drive monolith choice |
| 16.01 | Platform Design Principles | Parent philosophy that modular monolith serves |
| 16.03 | Domain Boundary Principles | How module boundaries are drawn |
| 16.10 | Reliability Design Principles | Reliability within a modular monolith |
| 16.12 | Scalability Principles | Scaling strategy for monolith architecture |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Final Editor | Reviewed v0.2: doctrinal alignment verified |
