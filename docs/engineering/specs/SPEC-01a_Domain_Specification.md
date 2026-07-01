# SPEC-01a: Domain Specification — Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — defines the Deal aggregate, entities, value objects, domain events, invariants, and domain services for Opportunity Management.
> **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Template status:** This is the first Domain Specification in the SalesOS v2 engineering program. Its structure will become the reference template for all future domain specifications.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | `PRD-01_Opportunity_Management.md` v1.0 (FROZEN) |
| **Blocks** | SPEC-01b (API Specification), SPEC-01c (Workflow Specification), SPEC-01e (Test Specification) |
| **Consumer** | Domain Engineering Team |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Deal domain definition | PRD-01 | §6 (FR-01 to FR-07), §10 (Data Model) |
| Domain rules | PRD-01 | §7 (DR-01 to DR-09) |
| Domain invariants | PRD-01 | §7.1 (DI-01 to DI-07) |
| Aggregate root definition | PRD-01 | §7.2 |
| Domain events | PRD-01 | §7.3 |
| Stage definitions and transitions | PRD-01 | §8 (Workflow) |
| Evidence requirements | PRD-01 | §9 |
| Platform Kernel generic types | Platform Kernel Architecture | Entity, WorkflowState, EventEnvelope, EvidenceLink |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Deal aggregate class/interface | Core domain type with all properties, invariants, and behavior | SPEC-01b (API), SPEC-01c (Workflow) |
| Value object definitions | Stage, Amount, Probability, Currency, DealStatus, EvidenceCount | SPEC-01b |
| Domain event interfaces | DealCreated, DealStageChanged, DealClosedWon, etc. | SPEC-01b, SPEC-01e |
| Domain service interfaces | DealTransitionService, EvidenceGateService | SPEC-01c |
| Repository interface | DealRepository (implementation deferred to infrastructure) | SPEC-01b |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| Platform Kernel `Entity` type | Contract | Cannot define Deal base type |
| Platform Workflow Engine | Contract | Cannot define stage transitions |
| Platform Evidence Network | Contract | Cannot define evidence gates |
| PRD-01 v1.0 | Document | No requirements to implement |

---

## Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| A-01 | Platform Kernel contracts (auth, workflow, evidence) are available as specified in Platform Kernel Architecture | Would need to implement stubs or adapters |
| A-02 | The Deal is the correct Aggregate Root for Opportunity Management | Would need to refactor aggregate boundary |
| A-03 | Evidence links are owned by Platform Evidence Network; Deal only stores a count | Would need to store evidence references in Deal aggregate |
| A-04 | Domain Events are raised synchronously within the domain layer | Would need async event handling infrastructure |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Should Deal history (all past stages) be part of the aggregate or a separate read model? | Affects aggregate size and query performance | SPEC-01a review |
| OQ-02 | How does the aggregate handle concurrent transition requests to different stages? | Affects optimistic concurrency strategy | SPEC-01a review |
| OQ-03 | Should `evidenceCount` be computed on read or stored on the aggregate? | Affects consistency guarantees | SPEC-01a review |

---

## Non-Goals

This specification does NOT define:
- Prisma models or database schema
- PostgreSQL, Redis, or any storage technology
- Next.js Server Actions or API routes
- UI components or page layouts
- Testing frameworks or test infrastructure
- Platform Workflow Engine implementation
- Platform Evidence Network implementation
- Authentication or authorization flows (consumed from Platform Auth)

---

## Implementation Independence

This specification defines:
- Business semantics for the Deal aggregate
- Aggregate rules and invariants
- Domain event contracts
- Domain service interfaces
- Value object definitions and validation rules

This specification intentionally does NOT define:
- Prisma models or database schema
- PostgreSQL, Redis, or any storage technology
- Next.js Server Actions or API routes
- UI components or page layouts
- Testing frameworks or test infrastructure
- Platform Kernel implementation details

---

# 1. Deal Aggregate

## 1.1 Identity

```typescript
type DealId = string;  // UUID v4, assigned by the system on creation
type AccountId = string;  // references Account aggregate in Account Context
type UserId = string;  // references User in Platform Identity
```

## 1.2 Deal Entity

```typescript
interface Deal {
  // Identity
  id: DealId;
  organizationId: string;  // tenant scope, from Platform Auth context

  // Core attributes
  accountId: AccountId;       // required, immutable after creation
  name: string;               // required, mutable
  amount: number;             // required, >= 0 (DI-01), mutable
  currency: string;           // required, ISO 4217, default "SAR", mutable
  probability: number;        // required, 0-100 (DI-02), mutable
  expectedCloseDate?: string; // optional ISO date, mutable

  // Stage (governed by Platform Workflow Engine)
  stage: Stage;               // current stage, managed via transitions only
  previousStage?: Stage;      // last stage before current (for reversal scenarios)

  // Governance
  reviewStatus: ReviewStatus; // "draft" | "in_review" | "approved" | "rejected"
  approvalStatus?: ApprovalStatus; // "approved" | "rejected"
  reviewDecisions: ReviewDecision[]; // chronological history of review decisions

  // Evidence (count only — actual links in Platform Evidence Network)
  evidenceCount: number;  // >= 0 (DI-07), computed on read or synchronized on link

  // Ownership
  ownerId: UserId;         // assigned sales rep, required, mutable
  createdById: UserId;     // immutable after creation
  updatedById?: UserId;    // set on every mutation

  // Concurrency
  version: number;         // starts at 1, incremented on every mutation (PRD-01 §12)

  // Timeline
  createdAt: string;       // ISO timestamp, set on creation
  updatedAt: string;       // ISO timestamp, set on every mutation
  expectedCloseDate?: string; // ISO date, mutable
  closedAt?: string;       // ISO timestamp, set when stage reaches Closed Won or Closed Lost

  // Metadata
  metadata?: DealMetadata; // extensible key-value store for product-specific data
  lossReason?: string;     // required when stage transitions to Closed Lost (DR-06)
  competitor?: string;     // optional, captured on Closed Lost
}
```

## 1.3 Invariants

All invariants are enforced by the aggregate. No Deal may exist in a state that violates any invariant.

| ID | Invariant | Enforcement Point | Violation Response |
|---|---|---|---|
| DI-01 | `amount >= 0` | Create, Update | `BUSINESS_RULE_FAILED` |
| DI-02 | `0 <= probability <= 100` | Create, Update | `BUSINESS_RULE_FAILED` |
| DI-03 | `accountId` is required and immutable | Create | `VALIDATION_ERROR` if missing or changed |
| DI-04 | `ownerId` must reference a valid user | Create, Update ownerId | `FORBIDDEN` if invalid |
| DI-05 | Closed stages (Won, Lost) are immutable | Transition, Update | `BUSINESS_RULE_FAILED` |
| DI-06 | `stage` must be a valid value from the state machine | Transition | `VALIDATION_ERROR` |
| DI-07 | `evidenceCount` must equal actual linked evidence count | Evidence link/unlink | Computed on read |

---

# 2. Value Objects

```typescript
// ─── Stage ───

type Stage =
  | "Draft"
  | "Qualified"
  | "In Review"
  | "Approved"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

// ─── Aggregate Lifecycle ───
// The Deal aggregate passes through these stages during its lifetime.
// This is the aggregate lifecycle (what happens to the aggregate itself),
// distinct from the workflow state machine (which governs business process transitions).

// Lifecycle stages:
//   1. Created    — Aggregate is instantiated, initial state set
//   2. Active     — Aggregate is being modified through workflow transitions
//   3. Closed     — Aggregate reached a terminal workflow state (Won or Lost)
//   4. Archived   — Aggregate is soft-deleted, no further mutations allowed

type AggregateLifecycleStage = "created" | "active" | "closed" | "archived";

// Transition rules:
//   Created  ──▶ Active  (automatic after first workflow transition)
//   Active   ──▶ Closed  (when stage reaches Closed Won or Closed Lost)
//   Closed   ──▶ Archived (soft delete by admin)
//   Closed   ──▶ (terminal) — no transition back to Active
//   Archived ──▶ (terminal) — no transitions out

// ─── Review Status ───

type ReviewStatus = "draft" | "in_review" | "approved" | "rejected";
type ApprovalStatus = "approved" | "rejected";

// ─── Amount (Value Object) ───

class Amount {
  private constructor(
    public readonly value: number,
    public readonly currency: string, // ISO 4217
  ) {
    if (value < 0) {
      throw new BusinessRuleError("Amount value must be >= 0");
    }
    if (currency.length !== 3 || currency !== currency.toUpperCase()) {
      throw new ValidationError("Currency must be a 3-letter ISO 4217 code");
    }
  }

  static create(value: number, currency: string = "SAR"): Amount {
    return new Amount(value, currency);
  }

  add(other: Amount): Amount {
    if (other.currency !== this.currency) {
      throw new BusinessRuleError("Cannot add amounts with different currencies");
    }
    return new Amount(this.value + other.value, this.currency);
  }

  multiply(factor: number): Amount {
    return new Amount(this.value * factor, this.currency);
  }

  equals(other: Amount): boolean {
    return this.value === other.value && this.currency === other.currency;
  }

  toString(): string {
    return `${this.value} ${this.currency}`;
  }
}

// ─── Probability (Value Object) ───

class Probability {
  private constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new BusinessRuleError("Probability must be an integer between 0 and 100");
    }
  }

  static create(value: number): Probability {
    return new Probability(value);
  }

  asPercentage(): number {
    return this.value;
  }

  asDecimal(): number {
    return this.value / 100;
  }

  equals(other: Probability): boolean {
    return this.value === other.value;
  }
}

// ─── Currency (Value Object) ───

class Currency {
  private constructor(public readonly code: string) {
    if (code.length !== 3 || code !== code.toUpperCase()) {
      throw new ValidationError("Currency must be a 3-letter ISO 4217 code");
    }
  }

  static SAR = new Currency("SAR");
  static USD = new Currency("USD");
  static AED = new Currency("AED");

  static create(code: string): Currency {
    return new Currency(code.toUpperCase());
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }
}

// ─── Stage (Value Object) ───

class Stage {
  private constructor(public readonly name: StageName) {}

  static readonly DRAFT = new Stage("Draft");
  static readonly QUALIFIED = new Stage("Qualified");
  static readonly IN_REVIEW = new Stage("In Review");
  static readonly APPROVED = new Stage("Approved");
  static readonly NEGOTIATION = new Stage("Negotiation");
  static readonly CLOSED_WON = new Stage("Closed Won");
  static readonly CLOSED_LOST = new Stage("Closed Lost");

  static readonly VALID_STAGES: StageName[] = [
    "Draft", "Qualified", "In Review", "Approved",
    "Negotiation", "Closed Won", "Closed Lost",
  ];

  static create(name: string): Stage {
    if (!VALID_STAGE_NAMES.includes(name as StageName)) {
      throw new ValidationError(`Invalid stage: ${name}. Valid stages: ${VALID_STAGE_NAMES.join(", ")}`);
    }
    return new Stage(name as StageName);
  }

  get isClosed(): boolean {
    return this.name === "Closed Won" || this.name === "Closed Lost";
  }

  get isTerminal(): boolean {
    return this.isClosed;
  }

  equals(other: Stage): boolean {
    return this.name === other.name;
  }

  toString(): string {
    return this.name;
  }
}

type StageName =
  | "Draft"
  | "Qualified"
  | "In Review"
  | "Approved"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

const VALID_STAGE_NAMES: readonly StageName[] = [
  "Draft", "Qualified", "In Review", "Approved",
  "Negotiation", "Closed Won", "Closed Lost",
];

// ─── Review Decision ───

interface ReviewDecision {
  id: string;
  decision: "approved" | "rejected";
  actorId: UserId;
  actorName?: string;
  reason: string;       // required for rejection (DR-05)
  stageSlug?: string;
  createdAt: string;
}

// ─── Deal Metadata ───

interface DealMetadata {
  reviewDecisions?: ReviewDecision[];
  riskFlags?: string[];
  signals?: string[];  // references to Signal entities
  [key: string]: unknown; // extensible
}
```

---

# 3. Domain Events

All domain events extend the Platform Kernel `EventEnvelope`:

```typescript
// Platform Kernel base
interface EventEnvelope {
  id: string;
  type: string;
  source: string;                 // always "salesos"
  subject: string;                // dealId
  data: unknown;
  timestamp: string;
  sequenceId: string;             // for ordering and replay
  eventVersion: number;           // semver MAJOR version of the event schema
  capabilities?: string[];        // platform capabilities that produced this event
}

// Event versioning policy:
//   eventVersion = 1 → initial schema (SalesOS v2.0)
//   Increment on MAJOR schema changes (breaking)
//   New fields are optional additions (MINOR), do not change eventVersion

// ─── Deal Created ───

interface DealCreatedEvent {
  type: "salesos.deal.created";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    accountId: AccountId;
    name: string;
    amount: number;
    currency: string;
    stage: Stage;
    ownerId: UserId;
    createdById: UserId;
  };
}

// ─── Deal Stage Changed ───

interface DealStageChangedEvent {
  type: "salesos.deal.stage_changed";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    fromStage: Stage;
    toStage: Stage;
    action: string;         // e.g., "qualify", "approve", "close_won"
    actorId: UserId;
    reason?: string;        // rejection reason, loss reason
  };
}

// ─── Deal Submitted for Review ───

interface DealSubmittedForReviewEvent {
  type: "salesos.deal.submitted_for_review";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    reviewerId: UserId;     // the assigned reviewer (manager)
    evidenceCount: number;
  };
}

// ─── Deal Approved ───

interface DealApprovedEvent {
  type: "salesos.deal.approved";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    approverId: UserId;
    reviewDuration: number; // hours from submission to approval
  };
}

// ─── Deal Rejected ───

interface DealRejectedEvent {
  type: "salesos.deal.rejected";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    reviewerId: UserId;
    reason: string;
  };
}

// ─── Deal Closed Won ───

interface DealClosedWonEvent {
  type: "salesos.deal.closed_won";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    amount: number;
    currency: string;
    accountId: AccountId;
    closedAt: string;
  };
}

// ─── Deal Closed Lost ───

interface DealClosedLostEvent {
  type: "salesos.deal.closed_lost";
  eventVersion: 1;
  subject: DealId;
  data: {
    dealId: DealId;
    amount: number;
    reason: string;         // required (DR-06)
    competitor?: string;
    closedAt: string;
  };
}
```

---

# 4. Domain Error Model

All domain-level errors extend a common `DomainError` base. This ensures that the API layer can map them to HTTP error codes without inspecting internal error types.

```typescript
/**
 * Base error for all domain-level errors.
 * All domain errors are recoverable by the caller (client can retry or correct input).
 */
interface DomainError {
  readonly code: string;           // machine-readable error code
  readonly message: string;        // human-readable description
  readonly recoverable: boolean;   // true if the caller can retry after correcting input
  readonly details?: Record<string, unknown>; // additional context for the caller
}

// ─── Validation Error ───
// Input failed format validation (e.g., missing required field, invalid type).

class ValidationError extends Error implements DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly recoverable = true;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "ValidationError";
  }
}

// ─── Business Rule Error ───
// Input violated a domain invariant (e.g., reviewer == owner, closed deal mutation).
// This is NOT a validation error — the input format is correct, but the business rule rejects it.

class BusinessRuleError extends Error implements DomainError {
  readonly code = "BUSINESS_RULE_FAILED";
  readonly recoverable = true;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

// ─── Governance Blocked Error ───
// A workflow guard blocked the transition (e.g., insufficient evidence).
// The caller must resolve the governance condition before retrying.

class GovernanceBlockedError extends Error implements DomainError {
  readonly code = "GOVERNANCE_BLOCKED";
  readonly recoverable = true;

  constructor(
    message: string,
    public readonly guardType: string,  // e.g., "evidence_gate", "role_check"
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "GovernanceBlockedError";
  }
}

// ─── Concurrency Error ───
// The aggregate version does not match the expected version.
// The caller must re-read the aggregate and retry.

class ConcurrencyError extends Error implements DomainError {
  readonly code = "CONFLICT";
  readonly recoverable = true;

  constructor(
    message: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number,
  ) {
    super(message);
    this.name = "ConcurrencyError";
  }
}

// ─── Not Found Error ───
// The requested aggregate does not exist or is not accessible in this tenant scope.

class NotFoundError extends Error implements DomainError {
  readonly code = "NOT_FOUND";
  readonly recoverable = false;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "NotFoundError";
  }
}
```

**Error mapping to API layer:**

| Domain Error | API Error Code | HTTP Status |
|---|---|---|
| `ValidationError` | `VALIDATION_ERROR` | 400 |
| `BusinessRuleError` | `BUSINESS_RULE_FAILED` | 422 |
| `GovernanceBlockedError` | `GOVERNANCE_BLOCKED` | 422 |
| `ConcurrencyError` | `CONFLICT` | 409 |
| `NotFoundError` | `NOT_FOUND` | 404 |

---

# 5. Domain Services

```typescript
// ─── Deal Transition Service ───

interface DealTransitionService {
  /**
   * Transitions a Deal from its current stage to the next stage
   * based on the requested action. Validates guards before transition.
   *
   * @param dealId - Target deal
   * @param action - Transition action (e.g., "qualify", "approve", "close_won")
   * @param actorId - User performing the action
   * @param options - Optional: reason for rejection/loss, override notes
   * @returns Updated Deal
   * @throws BusinessRuleError if guard fails
   * @throws GovernanceBlockedError if evidence gate fails
   * @throws ConcurrencyError if version mismatch
   */
  transition(
    dealId: DealId,
    action: string,
    actorId: UserId,
    options?: TransitionOptions,
  ): Promise<Deal>;
}

interface TransitionOptions {
  reason?: string;         // required for reject, close_lost
  version: number;         // for optimistic concurrency
}

// ─── Evidence Gate Service ───

interface EvidenceGateService {
  /**
   * Validates that a Deal has sufficient evidence for the target stage.
   *
   * @param dealId - Target deal
   * @param toStage - Target stage to validate against
   * @returns true if evidence requirement is met
   * @throws GovernanceBlockedError if insufficient evidence
   */
  validateEvidenceGate(dealId: DealId, toStage: Stage): Promise<boolean>;

  /**
   * Returns the minimum evidence required for a given stage.
   */
  getRequiredEvidenceCount(stage: Stage): number;
}
```

---

# 5. Repository Interface

**Principle:** Repository returns **Aggregates only** — never DTOs, ORM models, or projection objects. This preserves the aggregate boundary and prevents persistence concerns from leaking into the domain layer.

```typescript
interface DealRepository {
  findById(dealId: DealId, organizationId: string): Promise<Deal | null>;
  findMany(filter: DealFilter, organizationId: string): Promise<Deal[]>;
  save(deal: Deal): Promise<Deal>;
  delete(dealId: DealId, organizationId: string): Promise<void>;
}

interface DealFilter {
  stage?: Stage;
  ownerId?: UserId;
  status?: "open" | "closed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

---

# 6. Domain Event Publisher Interface

```typescript
interface DomainEventPublisher {
  publish(event: EventEnvelope): Promise<void>;
}
```

The implementation of `DomainEventPublisher` will:
1. Raise the event within the domain boundary
2. Optionally publish to Platform Event Bus for cross-product consumption (as defined in PRD-01 §11)

---

# 7. Validation: Traceability

This specification traces to PRD-01 as follows:

| SPEC-01a Element | PRD-01 Reference | Blueprint Reference |
|---|---|---|
| Deal aggregate (identity, attributes) | §6 (FR-01: Create Deal), §10 (Data Model) | §7.2 (Deal Domain), §10 (Data Model) |
| Value objects (Stage, Amount, etc.) | §6, §10 | §7.2 |
| Invariants (DI-01 to DI-07) | §7.1 (Domain Invariants) | §7.4 (State Machines) |
| Domain events (7 events) | §7.3 (Domain Events), §11 (Published Events) | §7.3 |
| Transition service | §6 (FR-03: Transition Stage), §8 (Workflow) | §7.4, §8 |
| Evidence gate service | §9 (Evidence Requirements), DR-03 | §7.4 |
| Repository interface | §6 (FR-05: List, FR-06: Detail) | §10 |
| Domain event publisher | §11 (Published Events) | §11.2 |
| Concurrency (version field) | §12 (Optimistic Concurrency) | — |
| Error patterns | §12 (Error Codes) | — |

---

# 8. Open Questions Resolution

The following questions were identified as open during drafting and are now resolved:

| Question | Resolution | Rationale |
|---|---|---|
| OQ-01: Deal history — aggregate or read model? | **Aggregate** — `previousStage` field + `reviewDecisions[]` metadata + Domain Events provide complete history | The aggregate must be self-contained for consistency. A separate read model can be added later for query optimization. |
| OQ-02: Concurrent transition requests to different stages? | **Version-based optimistic concurrency** — first request wins, second gets CONFLICT | Simplifies aggregate consistency. Retry logic is the caller's responsibility. |
| OQ-03: evidenceCount computed or stored? | **Compute on read**, synchronize on evidence link/unlink | Avoids inconsistency between stored count and actual linked count. The Platform Evidence Network is the source of truth. |

---

---

# 9. Ubiquitous Language

| Term | Definition | Synonyms (Avoid) |
|---|---|---|
| **Deal** | A commercial opportunity being managed through a governed lifecycle from creation to close. The central aggregate in Opportunity Management. | Opportunity, Lead, Sales Opportunity |
| **Account** | The organization or entity with which a Deal is associated. Owned by the Account Context. | Company, Customer, Client |
| **Stage** | A named step in the Deal lifecycle workflow. Stages are sequential and governed by transition rules. | Phase, Status, Step |
| **Transition** | A permitted movement of a Deal from one Stage to another, triggered by an action and guarded by rules. | Move, Change, Advance |
| **Review** | The process of evaluating a Deal before approval. A manager examines evidence and makes a decision. | Assessment, Evaluation, Check |
| **Approval** | A positive review decision that allows the Deal to progress to the next stage. | Sign-off, Authorization, Clearance |
| **Evidence** | A document, record, or artifact linked to a Deal that supports its progression through governed stages. | Attachment, Document, Proof |
| **Evidence Gate** | A rule that requires a minimum number of Evidence links before a Deal can transition to a governed stage. | Evidence Check, Gate, Requirement |
| **Domain Event** | A record of a state change within the Deal aggregate. Published for internal and cross-product consumption. | Event, Notification, Webhook |
| **Aggregate** | A cluster of domain objects treated as a single unit for data changes. The Deal Aggregate enforces all invariants. | Entity Group, Root, Cluster |
| **Invariant** | A business rule that must always be true for the aggregate, regardless of state. | Constraint, Guard, Rule |
| **Value Object** | An immutable object defined by its attributes rather than its identity. | VO, Data Object, Record |
| **Repository** | A service that provides access to Aggregates, abstracting the underlying storage technology. | DAO, Data Access, Storage Service |
| **Organization** | The tenant scope that owns all data. Every Deal belongs to exactly one Organization. | Tenant, Company, Workspace |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Domain Specification
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Template status:** This is the first Domain Specification in the SalesOS v2 program. Its structure is intended to become the reference template for all future domain specifications.
- **Next documents:** SPEC-01b (API Specification), SPEC-01c (Workflow Specification)
- **Changes from v0.1:** Added Aggregate Lifecycle, Domain Error Model (5 typed errors with DomainError interface), Value Objects as classes (Amount, Probability, Currency, Stage — each with invariant enforcement), eventVersion on all 7 Domain Events, Repository returns Aggregates only principle, Ubiquitous Language glossary (14 terms).
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. Serves as Reference Domain Specification for all future AQLIYA product specifications.
- **Next:** SPEC-01b (API Specification).
- **Template note for future specs:** Add a "Specification Decisions" section (SD-001, SD-002...) to document architectural decisions made within each specification, including alternatives considered and rationale. This prevents knowledge loss when specifications are revisited after extended periods.
