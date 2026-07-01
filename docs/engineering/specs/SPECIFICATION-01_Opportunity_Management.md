# Specification-01: Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Specification Index — organizes 5 independent specifications for PRD-01.
> **Parent:** `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Grandparent:** `CAPABILITY_BACKLOG.md` (EPIC-01) → `SALESOS_V2_BLUEPRINT.md` (frozen)
> **Engineering rule:** No implementation reads the Blueprint directly. All reads PRD-01 → Specification-01.
> **Traceability:** Every element in these specifications must trace to a specific FR, AC, or scenario in PRD-01.

---

## Overview

This document is the index for all specifications required to implement **Opportunity Management** (EPIC-01). It defines five independent specifications, each with its own scope, deliverables, and acceptance criteria.

---

## Specification Governance

These rules govern **all** specifications in this program. Every specification must conform.

### Required Sections

Every specification must define the following six elements:

| Element | Purpose | Example |
|---|---|---|
| **Inputs** | What documents, contracts, or data feed into this specification | `PRD-01 §6 (FRs)`, `Platform Workflow Engine contract` |
| **Outputs** | What artifacts this specification produces | Domain types, API contracts, test plans |
| **Dependencies** | What other specs or systems must exist before this one can be completed | SPEC-01a must be complete before SPEC-01b |
| **Assumptions** | What is assumed to be true without verification | Platform Capabilities work as contracted |
| **Open Questions** | What is not yet decided and needs resolution before implementation | "How does evidence linking behave when Platform Evidence Network is unavailable?" |
| **Non-Goals** | What this specification explicitly does NOT cover | Prisma models, database schema, UI framework |

A specification is not ready for review until all six elements are filled. Any element left as "TBD" is a blocking issue.

### Implementation Independence

Every specification must include a section titled **Implementation Independence** that explicitly states what it defines and what it does NOT define. This prevents implementation details from leaking into the specification layer.

Example (from Domain Specification):

```markdown
## Implementation Independence

This specification defines:
- Business semantics for the Deal aggregate
- Aggregate rules and invariants
- Domain event contracts
- Domain service interfaces

This specification intentionally does NOT define:
- Prisma models or database schema
- PostgreSQL, Redis, or any storage technology
- Next.js Server Actions or API routes
- UI components or page layouts
- Testing frameworks or test infrastructure
```

### Standard Header Table

Every specification document must begin with this header table:

```markdown
| Field | Value |
|---|---|
| **Stability** | Draft / Stable / Frozen |
| **Depends On** | List of prerequisite specifications |
| **Blocks** | List of specifications that depend on this |
| **Consumer** | Team or role that consumes this specification |
```

### Traceability Requirement

Every specification element (type, function, rule, test) must trace to:
1. A specific **PRD-01** requirement (FR, DR, DI, AC)
2. A specific **Blueprint** section (optional — PRD is the primary reference for engineering)

No element may exist in a specification without a traceable parent requirement.

### Review Gates

| Stage | Required Sign-off |
|---|---|
| Draft Complete | Specification Author |
| Ready for Review | Technical Lead |
| Approved | Architecture Board |
| Frozen | Product Architect + Platform Architect |

---

## Specification Documents

| # | Specification | Owner | Contents | Dependencies |
|---|---|---|---|---|
| **SPEC-01a** | Domain Specification | Domain Engineer | Aggregate definition (Deal), entities, value objects, domain services, domain events, invariants, repository interface | PRD-01 §6, §7, §7.1, §7.2 |
| **SPEC-01b** | API Specification | API Engineer | Server Actions, DTOs, request/response types, error contracts, authorization guards, idempotency, versioning | SPEC-01a (Domain types) |
| **SPEC-01c** | Workflow Specification | Workflow Engineer | State machine implementation, transition guards, SLA monitoring, escalation rules, Platform Workflow Engine integration | PRD-01 §8, §9, DR-01 to DR-09 |
| **SPEC-01d** | UX Specification | UX Engineer | Page layouts, component states, loading/error/empty states, RTL layout, permission-based UI, mobile responsiveness | SPEC-01b (API contracts) |
| **SPEC-01e** | Test Specification | QA Engineer | Unit test plan, integration test plan, workflow scenarios, authorization tests, audit tests, performance benchmarks | SPEC-01a, SPEC-01b, SPEC-01c |

---

## 1. SPEC-01a: Domain Specification

**Purpose:** Define the domain model for Deal aggregate, entities, value objects, domain services, and domain events.

### Scope

| In Scope | Out of Scope |
|---|---|
| Deal aggregate root definition | Platform Kernel types (Entity, Workflow, etc.) — referenced, not defined |
| Entities: Deal, ReviewDecision, EvidenceReference | Data storage schema — belongs to implementation |
| Value Objects: Stage, Amount, Probability, DealStatus | Prisma models — belong to implementation |
| Domain Events: DealCreated, DealStageChanged, DealClosedWon, etc. | Event Bus publishing — belongs to API layer |
| Domain Services: DealTransitionService, EvidenceGateService | Repository implementation — defined as interface only |
| Domain Invariants: DI-01 through DI-07 | |
| Aggregate boundary rules | |

### Key Deliverables

- Deal aggregate class/interface with all properties defined in PRD-01 §6 and §10
- Value object definitions for Stage, Amount, Probability, Currency, DealStatus
- Domain event interfaces for all 7 events in PRD-01 §7.3
- Domain service interfaces for stage transition and evidence gate
- Repository interface (implementation deferred)

### Acceptance

- All 7 FRs from PRD-01 §6 have corresponding domain types
- All 9 Domain Rules (DR-01 to DR-09) are enforceable via domain types
- All 7 Domain Invariants (DI-01 to DI-07) are expressed in the domain model
- All 7 Domain Events from PRD-01 §7.3 have defined interfaces
- The Deal aggregate boundary is respected (no direct access to internal entities)

---

## 2. SPEC-01b: API Specification

**Purpose:** Define the API layer — Server Actions, DTOs, error contracts, authorization, idempotency.

### Scope

| In Scope | Out of Scope |
|---|---|
| Server Action signatures and return types | UI component implementation — belongs to SPEC-01d |
| Request/response DTOs for each FR | Domain logic implementation — belongs to SPEC-01a |
| Error codes and error response format | Workflow engine implementation — belongs to SPEC-01c |
| Authorization guards per action | |
| Optimistic concurrency protocol | |
| Idempotency per operation | |

### Key Deliverables

- Server Action contracts for all 7 actions in PRD-01 §12
- `ActionResult<T>` type with all error codes (FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, BUSINESS_RULE_FAILED, GOVERNANCE_BLOCKED, CONFLICT)
- Permission strings for each action (e.g., `salesos:deal.create`, `salesos:deal.approve`)
- Version field protocol for optimistic concurrency
- Idempotency implementation notes per operation type
- Event publication contracts (what, when, with what payload)

### Acceptance

- All 7 Server Actions from PRD-01 §12 have defined contracts
- All 6 error codes from PRD-01 §12 have defined response shapes
- Authorization guards are mapped to each action (from PRD-01 §5 Actors)
- Version handling is specified for all write operations
- Idempotency rules from PRD-01 §12 are implementable
- All 9 published events from PRD-01 §11 have payload definitions

---

## 3. SPEC-01c: Workflow Specification

**Purpose:** Define the Deal workflow — state machine, transition guards, SLA rules, Platform Workflow Engine integration.

### Scope

| In Scope | Out of Scope |
|---|---|
| State machine definition with all 7 stages | Platform Workflow Engine contract — referenced, not defined |
| Transition guards: evidence checks, role checks | Other product workflows |
| SLA rules and escalation logic | |
| Workflow Engine contract consumption pattern | |
| Rejection and failure states | |

### Key Deliverables

- Workflow definition matching PRD-01 §8 state machine
- Guard implementations for each transition (from PRD-01 FR-03)
- SLA timer definitions (7 days Draft, 3 days In Review)
- Escalation notification triggers
- Integration test scenarios for each guard

### Acceptance

- All 8 transitions from PRD-01 §8 are implementable
- All guards are enforceable server-side
- SLA rules trigger escalations at the correct thresholds
- Workflow rejects invalid transitions with appropriate error codes
- Domain Events are published at each transition

---

## 4. SPEC-01d: UX Specification

**Purpose:** Define the user interface for Opportunity Management — screens, states, interactions, RTL layout.

### Scope

| In Scope | Out of Scope |
|---|---|
| Deal list page with filters | Other product screens |
| Deal detail page with all sections | Platform navigation chrome |
| Deal creation form | Global design system (reuse existing) |
| Review/approval panel | |
| Evidence linking UI | |
| Stage transition controls | |
| Loading states, empty states, error states | |
| Permission-based UI visibility | |

### Key Deliverables

- Page layout for Deal List with filter bar, sort controls, pagination
- Page layout for Deal Detail with tabs: Overview, Evidence, Activity, Audit
- Deal creation form layout with all fields from PRD-01 FR-01
- Stage transition controls with visual guard indicators
- Review/approval panel with decision form and history timeline
- Evidence linking UI with search and link/unlink actions
- Empty state for no deals
- Error state for failed operations
- Loading state for async data
- RTL layout specifications for all screens

### Acceptance

- All screens handle loading, empty, and error states
- RTL layout is consistent across all screens
- Permission-based UI elements match PRD-01 §5 Actor permissions
- All 12 Acceptance Criteria from PRD-01 §13 are reflected in UI behavior
- Evidence Gate Indicator is visible when evidence is required

---

## 5. SPEC-01e: Test Specification

**Purpose:** Define test plans for Opportunity Management — unit, integration, workflow, authorization, audit, and performance.

### Scope

| In Scope | Out of Scope |
|---|---|
| Unit tests for domain model | Tests for other Product Capabilities |
| Integration tests for API layer | Platform Kernel tests (separate) |
| Workflow tests for state machine | E2E tests (separate specification) |
| Authorization tests for all actions | |
| Audit trail verification tests | |
| Performance benchmarks | |

### Key Deliverables

- Unit test plan covering: Deal aggregate invariants, value object validation, domain event construction, domain rule enforcement
- Integration test plan covering: All 7 Server Actions, all 8 stage transitions, evidence linking, error code returns
- Workflow test plan covering: All 5 test scenarios from PRD-01 §14, plus edge cases (double transition, invalid stage target)
- Authorization test plan covering: Permission checks for each Actor role, tenant isolation, cross-org access denial
- Audit test plan covering: All 11 actions from Observability Matrix (PRD-01 §14b), event payload correctness, chronological ordering
- Performance benchmarks: Deal list < 1s at 1000 deals, stage transition < 200ms, evidence link < 200ms

### Acceptance

- All 12 Acceptance Criteria from PRD-01 §13 have corresponding tests
- All 5 Test Scenarios from PRD-01 §14 have automated tests
- All 11 observability signals from PRD-01 §14b are verified in tests
- Test suite can run independently (no dependency on other Product Capabilities)

---

## Specification Dependency Graph

```
SPEC-01a (Domain)
    │
    ▼
SPEC-01b (API) ──► SPEC-01c (Workflow)
    │                    │
    ▼                    ▼
SPEC-01d (UX)     SPEC-01e (Tests)
```

| Spec | Blocks | Blocked By |
|---|---|---|
| SPEC-01a (Domain) | SPEC-01b, SPEC-01c, SPEC-01e | Nothing |
| SPEC-01b (API) | SPEC-01d, SPEC-01e | SPEC-01a |
| SPEC-01c (Workflow) | SPEC-01e | SPEC-01a |
| SPEC-01d (UX) | — | SPEC-01b |
| SPEC-01e (Tests) | — | SPEC-01a, SPEC-01b, SPEC-01c |

---

## Traceability

| Specification | PRD-01 Reference | Blueprint Reference |
|---|---|---|
| SPEC-01a (Domain) | §6 (FRs), §7 (Domain Rules), §7.1 (Invariants), §7.2 (Aggregate Root), §10 (Data Model) | §7.2 (Deal Domain), §7.3 (Domain Events), §10 (Data Model) |
| SPEC-01b (API) | §5 (Actors), §11 (Platform Dependencies), §12 (APIs, Error Codes, Concurrency, Idempotency) | §11 (API Contracts) |
| SPEC-01c (Workflow) | §8 (Workflow), §9 (Evidence Requirements), DR-01 to DR-09 | §7.4 (State Machines), §8 (Workflow Engine) |
| SPEC-01d (UX) | §5 (Actors), §6 (FRs), §13 (ACs) | §12 (UX Architecture) |
| SPEC-01e (Tests) | §13 (ACs), §14 (Test Scenarios), §14b (Observability) | §13.6 (KPIs) |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Specification Index
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Next:** Individual specifications (SPEC-01a through SPEC-01e)
- **Priority order:** SPEC-01a (Domain) → SPEC-01b (API) + SPEC-01c (Workflow) → SPEC-01d (UX) + SPEC-01e (Tests)
- **Changes from v0.1:** Added Specification Governance section (required elements, Implementation Independence, header table, traceability, review gates).
- **Status:** Draft v0.2 — ready for review. Next: SPEC-01a (Domain Specification) as reference template.
