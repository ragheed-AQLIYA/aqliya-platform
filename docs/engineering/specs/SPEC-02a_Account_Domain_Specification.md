# SPEC-02a: Domain Specification — Account Intelligence

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — Cycle 2, template reuse.
> **Parent:** `PRD-02_Account_Intelligence.md` v0.2
> **Template:** SPEC-01a structure. Domain: Account (replaces Deal).
> **Template reuse target:** ≥95%.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | PRD-02 v0.2 |
| **Blocks** | SPEC-02b (API), SPEC-02c (Workflow), SPEC-02e (Tests) |
| **Consumer** | Domain Engineering Team |

---

## Inputs

| Input | Source |
|---|---|
| Account domain definition | PRD-02 §6 (FR-01 to FR-07) |
| Domain rules | PRD-02 §7 (DR-01 to DR-07) |
| Domain invariants | PRD-02 §7.1 (DI-01 to DI-05) |
| Aggregate root + ownership | PRD-02 §7.2 |
| Value object distinctions | PRD-02 §7.3 |
| Source of truth per field | PRD-02 §12 |
| Platform Kernel generic types | Platform Kernel Architecture |

---

## Outputs

| Output | Consumer |
|---|---|
| Account aggregate class/interface | SPEC-02b, SPEC-02c |
| Value objects (IcpScore, HealthScore, Sensitivity, AccountStatus) | SPEC-02b |
| Domain event interfaces | SPEC-02b, SPEC-02e |
| Domain error model | SPEC-02b |
| Domain service interfaces | SPEC-02c |
| Repository interface | SPEC-02b |

---

## Dependencies

| Dependency | Type |
|---|---|
| Platform Kernel `Entity` type | Contract |
| Platform AI `AIOrchestrator` | Contract |
| Platform Evidence Network | Contract |
| PRD-02 | Document |

---

## Assumptions

| # | Assumption |
|---|---|
| A-01 | Platform Kernel contracts (auth, ai, evidence, event-bus, features) available |
| A-02 | Account is correct Aggregate Root for Account Intelligence |
| A-03 | Source of Truth separation (PRD-02 §12) is honored — aggregate stores snapshots |

---

## Open Questions

| # | Question |
|---|---|
| OQ-01 | Should Health Score be recomputed on every read or cached? |
| OQ-02 | How does ICP Rule Engine communicate with Account Aggregate? |
| OQ-03 | Should IcpScore and HealthScore be Value Objects computed externally or by the aggregate? |

---

## Non-Goals

This specification does NOT define: Prisma models, database schema, Next.js Server Actions, UI components, Platform Kernel implementation.

---

## Implementation Independence

This specification defines: Account business semantics, aggregate rules, domain event contracts, value object definitions, repository interface.

This specification does NOT define: Prisma, PostgreSQL, Redis, Next.js, UI, testing infrastructure.

---

# 1. Account Aggregate

```typescript
type AccountId = string;
type OrganizationId = string;
type UserId = string;

type AccountStatus = "Prospect" | "Active" | "Dormant" | "Archived";

interface Account {
  id: AccountId;
  organizationId: OrganizationId;
  name: string;
  nameAr?: string;
  industry?: string;
  size?: string;
  region?: string;
  status: AccountStatus;
  ownerId: UserId;
  createdById: UserId;
  updatedById?: UserId;

  scores: {
    icp?: IcpScore;
    health?: HealthScore;
  };

  createdAt: string;
  updatedAt: string;
  version: number;

  metadata?: Record<string, unknown>;
}

// Factory
function createAccount(props: CreateAccountProps): Account;

// Reconstitute
function reconstituteAccount(raw: Record<string, unknown>): Account;
```

**Invariants:** name non-empty (DI-01), icpScore 0-100 if present (DI-02), single org (DI-03), archived immutable (DI-04), healthScore 0-100 if present (DI-05).

---

# 2. Value Objects

```typescript
// ICP Score — semi-static, rule-based
class IcpScore {
  constructor(public readonly value: number, public readonly dimensions: Record<string, number>, public readonly computedAt: string) {
    if (value < 0 || value > 100) throw new BusinessRuleError("ICP score must be 0-100");
  }
  static create(value: number, dimensions: Record<string, number>): IcpScore;
  asPercentage(): number;
  equals(other: IcpScore): boolean;
}

// Health Score — dynamic, periodic
class HealthScore {
  constructor(public readonly value: number, public readonly factors: string[], public readonly computedAt: string) {
    if (value < 0 || value > 100) throw new BusinessRuleError("Health score must be 0-100");
  }
  static create(value: number, factors: string[]): HealthScore;
  equals(other: HealthScore): boolean;
}

// Sensitivity — for contacts/stakeholders
class Sensitivity {
  static readonly STANDARD = new Sensitivity("standard");
  static readonly RESTRICTED = new Sensitivity("restricted");
  static readonly CONFIDENTIAL = new Sensitivity("confidential");
  static create(level: string): Sensitivity;
}

// Account Status
class AccountStatus_ {
  static readonly PROSPECT = new AccountStatus_("Prospect");
  static readonly ACTIVE = new AccountStatus_("Active");
  static readonly DORMANT = new AccountStatus_("Dormant");
  static readonly ARCHIVED = new AccountStatus_("Archived");
  get isArchived(): boolean;
}
```

---

# 3. Domain Events

```typescript
interface AccountCreatedEvent {
  type: "salesos.account.created"; eventVersion: 1; subject: string;
  data: { accountId: string; name: string; industry?: string; ownerId: string; };
}

interface AccountQualifiedEvent {
  type: "salesos.account.qualified"; eventVersion: 1;
  data: { accountId: string; icpScore: number; };
}

interface AccountScoredEvent {
  type: "salesos.account.scored"; eventVersion: 1;
  data: { accountId: string; score: number; dimensions: Record<string, number>; };
}

interface AccountDormantEvent {
  type: "salesos.account.dormant"; eventVersion: 1;
  data: { accountId: string; dormancyReason: string; };
}

interface BriefGeneratedEvent {
  type: "salesos.account.brief_generated"; eventVersion: 1;
  data: { accountId: string; briefId: string; governanceId: string; };
}
```

---

# 4. Domain Error Model

Same hierarchy as SPEC-01a: `ValidationError`, `BusinessRuleError`, `GovernanceBlockedError`, `ConcurrencyError`, `NotFoundError` — all extending `DomainError` interface with `code`, `message`, `recoverable`, `details`.

---

# 5. Repository Interface

```typescript
interface AccountRepository {
  findById(id: AccountId, orgId: OrganizationId): Promise<Account | null>;
  findMany(filter: AccountFilter, orgId: OrganizationId): Promise<Account[]>;
  save(account: Account): Promise<Account>;
  archive(id: AccountId, orgId: OrganizationId): Promise<void>;
}

interface AccountFilter {
  industry?: string; icpMin?: number; icpMax?: number;
  status?: AccountStatus; ownerId?: UserId;
  search?: string; page?: number; limit?: number;
}
```

**Principle:** Repository returns Aggregates only — never DTOs or ORM models.

---

# 6. Domain Event Publisher

Same `DomainEventPublisher` interface as SPEC-01a §6.

---

## Traceability

| Element | PRD-02 Reference |
|---|---|
| Account aggregate | §6 (FRs), §7.2 |
| Value objects | §7.3 |
| Domain events | §11 |
| Error model | §13 (API error codes) |
| Repository | §6 (FR-06, FR-07) |
| Source of truth | §12 |

---

## Document Metadata

- **Author:** OpenCode | **Type:** Domain Specification — Cycle 2
- **Version:** 0.1 | **Template:** SPEC-01a | **Reuse:** ~95%
- **Status:** Draft — ready for review
