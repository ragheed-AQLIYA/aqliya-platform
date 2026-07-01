# SPEC-01b: API Specification — Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — defines Server Actions, DTOs, error contracts, authorization guards, concurrency, and event publication for Opportunity Management.
> **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN)
> **Golden Rule:** Every endpoint is a translator between the transport layer (Server Action) and the Domain. Zero business logic lives in the API layer.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-01a v1.0 (FROZEN) — Deal aggregate, value objects, domain errors, domain events |
| **Blocks** | SPEC-01c (Workflow), SPEC-01d (UX), SPEC-01e (Tests) |
| **Consumer** | API Engineering Team, Frontend Engineering Team |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Deal aggregate definition | SPEC-01a | §1.2 (Deal Entity), §1.3 (Invariants) |
| Value objects | SPEC-01a | §2 (Amount, Probability, Currency, Stage classes) |
| Domain errors | SPEC-01a | §4 (DomainError hierarchy, 5 error types) |
| Domain events | SPEC-01a | §3 (7 events with eventVersion) |
| Repository interface | SPEC-01a | §5 (DealRepository contract) |
| Functional requirements | PRD-01 | §6 (FR-01 to FR-07) |
| Actor permissions | PRD-01 | §5 (Sales Rep, Sales Manager, Sales Admin) |
| Error codes | PRD-01 | §12 (Error Codes table) |
| Idempotency policy | PRD-01 | §12 (Idempotency per operation) |
| Platform dependencies | PRD-01 | §11 (platform.auth, platform.workflow, platform.evidence) |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Server Action contracts | Typed actions for all 7 FRs | Frontend, SPEC-01d (UX) |
| Request/Response DTOs | Input validation shapes, response types | Frontend, SPEC-01d |
| Authorization guard map | Permission → Action mapping | SPEC-01c (Workflow), SPEC-01e (Tests) |
| Error contract map | Domain error → API error → HTTP status | Frontend, SPEC-01e |
| Event publication spec | What events published, when, with what payload | Platform Kernel, SPEC-01e |
| Concurrency protocol | Version field handling | Frontend |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| SPEC-01a v1.0 | Document | No domain contracts to translate |
| Platform Auth `AuthGuard` | Contract | Cannot enforce permissions |
| Platform Workflow Engine | Contract | Cannot transition stages |
| Platform Evidence Network | Contract | Cannot link evidence |
| Platform Event Bus | Contract | Cannot publish domain events |

---

## Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| A-01 | Platform Kernel contracts are available as specified in Platform Kernel Architecture | Would need to implement adapters |
| A-02 | Server Actions are the correct transport layer for SalesOS v2 | Would need to add REST endpoints |
| A-03 | Domain errors map one-to-one to API error codes | Would need error translation logic |
| A-04 | Version field is sufficient for optimistic concurrency | Would need etag or timestamp-based strategies |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Should pagination metadata (total count, next page) be included in list response or fetched separately? | Affects list API contract | SPEC-01b review |
| OQ-02 | How does the API layer handle Platform Event Bus unavailability? | Affects write path resilience | SPEC-01b review |

---

## Non-Goals

This specification does NOT define:
- UI components, page layouts, or user interactions
- Database queries, Prisma models, or storage schema
- Platform Workflow Engine implementation
- Platform Evidence Network implementation
- Testing strategies or test infrastructure
- Deployment, monitoring, or observability infrastructure

---

## Implementation Independence

This specification defines:
- Server Action signatures and return types
- DTO shapes for request and response
- Error contract mapping from Domain to API
- Authorization guard binding per action
- Concurrency protocol (version handling)
- Idempotency rules per operation
- Event publication contracts (when, what, to which channel)

This specification intentionally does NOT define:
- Business logic, validation rules, or domain invariants (delegated to SPEC-01a)
- Database queries or Prisma models
- UI components or page layouts
- Testing frameworks or infrastructure
- Deployment configurations

---

## Specification Decisions

| ID | Decision | Rationale | Alternatives Considered | Affected Sections |
|---|---|---|---|---|
| SD-001 | Server Actions are the primary API transport | Native to Next.js pattern, co-located with routes, built-in revalidation | REST endpoints: unnecessary abstraction | §2 (All Server Actions) |
| SD-002 | Domain errors are caught and mapped in a single `safe()` wrapper | Prevents error handling from spreading across every action | Per-action try/catch: duplicated, error-prone | §1.2 (Error Mapping), §2 (All Actions) |
| SD-003 | `ActionResult<T>` is the universal return type | Consistent error surface, no exception propagation | Throwing errors: 500 for domain errors | §1.1 (Universal Return Type), §2 (All Actions) |
| SD-004 | Event publication after domain service call | Ensures aggregate is persisted before publishing | Publishing before save: phantom events on failure | §3 (Event Publication) |
| SD-005 | DealResponse flattens Value Objects to primitives | Simpler client consumption, no domain dependency in frontend | Returning Value Objects: frontend needs domain types | §8.1 (Domain → DTO Translation) |
| SD-006 | version field for concurrency, not etag | Explicit integer is simpler than etag parsing | etag: header parsing, less explicit for Server Actions | §4 (Optimistic Concurrency) |
| SD-007 | Pagination is 1-indexed with hasNext | Consistent with common frontend patterns, avoids off-by-one errors | 0-indexed: confusing for non-technical stakeholders | §6 (Pagination Contract) |
| SD-008 | totalCount is optional for deep pages | COUNT scans on large tables are expensive for every request | Always including totalCount: performance degradation at scale | §6.3 (Pagination Rules) |
| SD-009 | Correlation context flows through all layers | Enables end-to-end tracing across Server Actions, Domain, Events, and Logs | No correlation: impossible to debug cross-system failures | §1.3 (Correlation Context), §2 (All Actions) |
| SD-010 | Transaction boundary excludes event publication | Event Bus unavailability must not block the primary write | Including events in transaction: holds transaction open, risk of deadlock | §5 (Transaction Boundary) |

---

# 1. Server Action Contracts

## 1.1 Universal Return Type

```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode };

type ErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_FAILED"
  | "GOVERNANCE_BLOCKED"
  | "CONFLICT";
```

## 1.2 Error Mapping (Domain → API)

| Domain Error | API Error Code | HTTP Equivalent | Notes |
|---|---|---|---|
| `NotFoundError` | `NOT_FOUND` | 404 | Aggregate not found or inaccessible |
| `ValidationError` | `VALIDATION_ERROR` | 400 | Input format error |
| `BusinessRuleError` | `BUSINESS_RULE_FAILED` | 422 | Domain invariant violated |
| `GovernanceBlockedError` | `GOVERNANCE_BLOCKED` | 422 | Workflow guard blocked transition |
| `ConcurrencyError` | `CONFLICT` | 409 | Version mismatch on write |
| Authorization failure | `FORBIDDEN` | 403 | Missing permission or cross-tenant |
| Unexpected error | (logged, generic message) | 500 | Unhandled exception — no details exposed |

### Implementation Pattern — Safe Wrapper

```typescript
async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { ok: false, error: error.message, code: "NOT_FOUND" };
    }
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, code: "VALIDATION_ERROR" };
    }
    if (error instanceof BusinessRuleError) {
      return { ok: false, error: error.message, code: "BUSINESS_RULE_FAILED" };
    }
    if (error instanceof GovernanceBlockedError) {
      return { ok: false, error: error.message, code: "GOVERNANCE_BLOCKED" };
    }
    if (error instanceof ConcurrencyError) {
      return { ok: false, error: error.message, code: "CONFLICT" };
    }
    // Unexpected error — log and return generic message
    console.error("[OpportunityManagement]", error);
    return { ok: false, error: "An unexpected error occurred", code: "FORBIDDEN" };
  }
}
```

---

## 1.3 Correlation Context

Every API call carries a correlation context that flows through the entire system — from Server Action to Domain to Event Bus to Audit to Logs.

```typescript
interface CorrelationContext {
  correlationId: string;   // client-generated, stable across retries
  requestId: string;       // server-generated, unique per request
  requestIdempotencyKey?: string;  // optional, for idempotent operations
}
```

**Rules:**
- `correlationId`: Generated by the client (frontend). Passed in every request. Stable across retries — the same logical operation has the same `correlationId` even if the HTTP request is retried.
- `requestId`: Generated by the server on every invocation. Unique per request. Used for log correlation and trace identification.
- `requestIdempotencyKey`: Optional. For operations where the client wants to guarantee at-most-once semantics even without Server Action deduplication.

**Propagation:**

```
Client Request (correlationId)
    ↓
Server Action (generates requestId)
    ↓
Domain Service (receives both)
    ↓
Repository (logged in audit)
    ↓
Event Bus (included in event metadata)
    ↓
Logs / Metrics (correlated by requestId)
```

---

## 1.4 AuthContext Contract

Instead of accessing `ctx.user.id` and `ctx.organizationId` as scattered properties, all actions use a formal `AuthContext`:

```typescript
interface AuthContext {
  user: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  organizationId: string;
  platformOrganizationId?: string | null;
  permissions: string[];
}
```

**Rules:**
- Every Server Action resolves `AuthContext` before executing any domain logic.
- `AuthContext` is passed to Domain Services for audit and ownership.
- Domain Services do NOT resolve `AuthContext` themselves — they receive it from the API layer.

**Usage pattern:**

```typescript
export async function createDealAction(input: CreateDealInput): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx: AuthContext = await requirePermission("salesos:deal.create");
    // ctx.user.id, ctx.organizationId, etc. are always available
    const deal = await DealService.create(toCreateDealDomain(input, ctx));
    return toDealResponse(deal);
  });
}
```

---

## 1.5 Authorization Guard

```typescript
import { requireSalesPermission } from "@/lib/sales/guards";  // from Platform Auth

type Permission =
  | "salesos:deal.create"
  | "salesos:deal.update"
  | "salesos:deal.review"
  | "salesos:deal.approve"
  | "salesos:evidence.link"
  | "salesos:deal.admin";
```

**Permission-to-Action Map:**

| Action | Required Permission | Actor |
|---|---|---|
| `createDeal` | `salesos:deal.create` | Sales Rep |
| `updateDeal` | `salesos:deal.update` | Sales Rep (owner) |
| `transitionDeal` | `salesos:deal.update` | Sales Rep |
| `submitForReview` | `salesos:deal.update` | Sales Rep |
| `approveDeal` | `salesos:deal.approve` | Sales Manager |
| `rejectDeal` | `salesos:deal.approve` | Sales Manager |
| `linkEvidence` | `salesos:evidence.link` | Sales Rep |
| `listDeals` | `salesos:deal.create` | Sales Rep (implies read) |
| `getDeal` | `salesos:deal.create` | Sales Rep (implies read) |
| `deleteDeal` | `salesos:deal.admin` | Sales Admin |

---

# 2. Server Actions

## 2.1 createDealAction

```typescript
"use server";

export async function createDealAction(
  input: CreateDealInput,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.create");

    // Translate: validate input format
    const parsed = CreateDealInput.parse(input);

    // Translate: call domain service
    const deal = await DealService.create({
      ...parsed,
      organizationId: ctx.organizationId,
      createdById: ctx.user.id,
    });

    // Translate: return domain result as DTO
    return toDealResponse(deal);
  });
}
```

### Input DTO

```typescript
interface CreateDealInput {
  accountId: string;
  name: string;
  amount: number;       // Amount.create(value, currency) on server
  currency?: string;    // default "SAR"
  probability?: number;  // Probability.create(value) on server
  expectedCloseDate?: string;
  ownerId: string;
}
```

### Response DTO

```typescript
interface DealResponse {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  ownerId: string;
  reviewStatus: string;
  evidenceCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}
```

### Idempotency

| Property | Value |
|---|---|
| **Idempotent** | No — each call creates a new Deal |
| **Client strategy** | Disable button after click, redirect to detail page |
| **Server strategy** | N/A — each POST creates a new resource |

---

## 2.2 transitionDealAction

```typescript
"use server";

export async function transitionDealAction(
  dealId: string,
  action: string,
  options?: TransitionOptions,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.update");

    // Translate: call domain service with version guard
    const deal = await DealService.transition(
      dealId,
      action,
      ctx.user.id,
      {
        reason: options?.reason,
        version: options?.version,
      },
    );

    // Translate: publish domain event to Platform Event Bus
    await publishDomainEvent(deal, action, ctx.user.id);

    // Translate: return updated deal
    return toDealResponse(deal);
  });
}
```

### Input

```typescript
interface TransitionOptions {
  reason?: string;
  version: number;       // required for optimistic concurrency
}
```

### Idempotency

| Property | Value |
|---|---|
| **Idempotent** | **Yes** — if Deal is already in target stage and last transition matches the requested action, return success without reapplying |
| **Server strategy** | Check `deal.stage` and `lastAction`: if already in expected state, return current Deal |

**Implementation logic:**

```typescript
async function transition(
  dealId: string,
  action: string,
  actorId: string,
  options: TransitionOptions,
): Promise<Deal> {
  const deal = await dealRepository.findById(dealId, organizationId);

  // Idempotency check: if already in the target stage for this action
  if (isAlreadyAtTargetStage(deal, action)) {
    return deal;  // no-op, return current state
  }

  // Proceed with transition (validates guards, checks version)
  return dealTransitionService.transition(deal, action, actorId, options);
}
```

---

## 2.3 submitForReviewAction

```typescript
"use server";

export async function submitForReviewAction(
  dealId: string,
  options: { version: number },
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.update");
    const deal = await DealService.submitForReview(dealId, ctx.user.id, options);
    await publishDomainEvent(deal, "submit_for_review", ctx.user.id);
    return toDealResponse(deal);
  });
}
```

### Idempotency

**Yes** — if `deal.reviewStatus` is already `"in_review"`, return success without re-applying.

---

## 2.4 approveDealAction

```typescript
"use server";

export async function approveDealAction(
  dealId: string,
  input: { version: number },
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.approve");

    // Business rule: reviewer cannot be owner (enforced in domain)
    const deal = await DealService.approve(dealId, ctx.user.id, input);
    await publishDomainEvent(deal, "approve", ctx.user.id);
    return toDealResponse(deal);
  });
}
```

### Idempotency

**Yes** — if `deal.reviewStatus` is already `"approved"`, return success.

---

## 2.5 rejectDealAction

```typescript
"use server";

export async function rejectDealAction(
  dealId: string,
  input: { reason: string; version: number },
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.approve");

    // Business rule: rejection reason is required (DR-05, enforced in domain)
    const deal = await DealService.reject(dealId, ctx.user.id, input);
    await publishDomainEvent(deal, "reject", ctx.user.id);
    return toDealResponse(deal);
  });
}
```

### Idempotency

**Yes** — if `deal.reviewStatus` is already `"rejected"` with the same reason, return success.

---

## 2.6 linkEvidenceAction

```typescript
"use server";

export async function linkEvidenceAction(
  input: LinkEvidenceInput,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:evidence.link");

    // Translate: call Platform Evidence Network
    await EvidenceService.link({
      targetType: "deal",
      targetId: input.dealId,
      evidenceId: input.evidenceId,
      organizationId: ctx.organizationId,
      linkedById: ctx.user.id,
    });

    // Translate: update deal evidence count
    const deal = await DealService.syncEvidenceCount(input.dealId, ctx.organizationId);
    return toDealResponse(deal);
  });
}
```

### Input

```typescript
interface LinkEvidenceInput {
  dealId: string;
  evidenceId: string;
}
```

### Idempotency

**Yes (conditional)** — if the same `evidenceId` is already linked to the same `dealId`, return success without duplicate.

---

## 2.7 listDealsAction

```typescript
"use server";

export async function listDealsAction(
  filter?: ListDealsFilter,
): Promise<ActionResult<DealResponse[]>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.create");

    // Translate: call repository with tenant-scoped filter
    const deals = await dealRepository.findMany(
      { ...filter, organizationId: ctx.organizationId },
    );

    // Translate: return DTOs
    return deals.map(toDealResponse);
  });
}
```

### Input

```typescript
interface ListDealsFilter {
  stage?: string;
  ownerId?: string;
  status?: "open" | "closed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;  // default 20, max 100
}
```

### Idempotency

**Yes** — read-only, naturally idempotent.

---

## 2.8 getDealAction

```typescript
"use server";

export async function getDealAction(
  dealId: string,
): Promise<ActionResult<DealDetailResponse>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.create");
    const deal = await dealRepository.findById(dealId, ctx.organizationId);
    if (!deal) throw new NotFoundError("Deal not found");

    return toDealDetailResponse(deal);
  });
}
```

### Response

```typescript
interface DealDetailResponse extends DealResponse {
  accountName: string;
  accountIndustry?: string;
  evidenceLinks: EvidenceLinkView[];
  reviewDecisions: ReviewDecisionView[];
  auditEvents: AuditEventView[];
}
```

### Idempotency

**Yes** — read-only, naturally idempotent.

---

## 2.9 deleteDealAction

```typescript
"use server";

export async function deleteDealAction(
  dealId: string,
  input: { version: number },
): Promise<ActionResult<{ deleted: boolean }>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:deal.admin");
    await DealService.archive(dealId, ctx.organizationId, input.version);
    return { ok: true, data: { deleted: true } };
  });
}
```

### Idempotency

**Yes** — if Deal is already archived, return success.

---

# 3. Domain Event Publication

## 3.1 Publication Rules

| Domain Event | Published to Event Bus? | Event Type | When |
|---|---|---|---|
| `DealCreated` | ✅ Yes | `salesos.deal.created` | After successful creation |
| `DealStageChanged` | ✅ Yes | `salesos.deal.stage_changed` | After every stage transition |
| `DealSubmittedForReview` | ✅ Yes | `salesos.deal.submitted_for_review` | After submit_for_review action |
| `DealApproved` | ✅ Yes | `salesos.deal.approved` | After approve action |
| `DealRejected` | ✅ Yes | `salesos.deal.rejected` | After reject action |
| `DealClosedWon` | ✅ Yes | `salesos.deal.closed_won` | After close_won transition |
| `DealClosedLost` | ✅ Yes | `salesos.deal.closed_lost` | After close_lost transition |

## 3.2 Publication Implementation

```typescript
async function publishDomainEvent(
  deal: Deal,
  action: string,
  actorId: string,
): Promise<void> {
  const event = buildEvent(deal, action, actorId);
  await platformEventBus.publish(event);
}

function buildEvent(deal: Deal, action: string, actorId: string): EventEnvelope {
  const base = {
    source: "salesos",
    subject: deal.id,
    timestamp: new Date().toISOString(),
    sequenceId: crypto.randomUUID(),
    eventVersion: 1,
  };

  switch (action) {
    case "create":
      return { ...base, type: "salesos.deal.created", eventVersion: 1, data: { /* deal created data */ } };
    case "qualify":
    case "submit_for_review":
    case "approve":
    case "reject":
    case "close_won":
    case "close_lost":
      return { ...base, type: "salesos.deal.stage_changed", eventVersion: 1, data: { /* stage change data */ } };
    case "submit_for_review":
      return { ...base, type: "salesos.deal.submitted_for_review", eventVersion: 1, data: { /* review data */ } };
    // ... etc
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
```

## 3.3 Failure Handling

If the Event Bus is unavailable during publication:

| Scenario | Behavior | Rationale |
|---|---|---|
| Event Bus unavailable at creation | **Deal created, event queued for retry** | Deal creation is the primary operation. Event is secondary. |
| Event Bus unavailable at transition | **Transition succeeds, event queued for retry** | Deal state change is the primary operation. |
| Event Bus unavailable on repeated retries | **Logged as metric, alert triggered** | Eventual consistency. Platform team alerted. |

---

# 4. Optimistic Concurrency Protocol

## 4.1 Client-Server Flow

```
Client                                         Server
  │                                              │
  │  1. GET /deal/123 → { ..., version: 5 }      │
  │─────────────────────────────────────────────>│
  │                                              │
  │  2. User edits deal                          │
  │                                              │
  │  3. POST transition(dealId=123, version=5)   │
  │─────────────────────────────────────────────>│
  │                                              │
  │  4. Server checks: deal.version == 5?        │
  │     ✅ Yes → apply, version → 6              │
  │     ❌ No → return CONFLICT                  │
  │                                              │
  │  5. On CONFLICT: client refreshes            │
  │     and re-applies user changes              │
  │◄─────────────────────────────────────────────│
```

## 4.2 Version Rules

| Rule | Implementation |
|---|---|
| `version` starts at 1 | Set on aggregate creation |
| `version` increments on every write | All create, update, transition, linkEvidence, delete |
| Client must send `version` on all write operations | Server validates before applying |
| Server returns new `version` in every response | Client updates its local copy |
| CONFLICT is returned when versions don't match | Client must re-fetch and retry |

---

# 5. Transaction Boundary

Understanding where the transaction begins and ends is critical for consistency and performance.

## 5.1 Transaction Scope

```text
┌──────────────────────────────────────────────────────────┐
│           INSIDE TRANSACTION                              │
│                                                           │
│  1. Permission check (fast, no I/O)                       │
│  2. AuthContext resolution (from Platform Auth cache)     │
│  3. Domain aggregate mutation (in-process)                │
│  4. Repository save (Prisma write)                        │
│                                                           │
│  → Transaction commits here                               │
│  → Database is consistent                                 │
│  → Other readers see the new state                        │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│           OUTSIDE TRANSACTION                             │
│                                                           │
│  5. Domain event publication (Event Bus)                  │
│  6. Platform audit event (Audit service)                  │
│  7. Metrics and observability signals                     │
│  8. Cache invalidation (if applicable)                    │
│                                                           │
│  → These may fail without affecting data consistency      │
│  → Failures are logged and retried asynchronously         │
└──────────────────────────────────────────────────────────┘
```

## 5.2 Rules

| # | Rule | Rationale |
|---|---|---|
| TB-01 | All I/O inside the transaction must be to the primary database | Prevents distributed transaction across heterogeneous systems |
| TB-02 | Event publication is always outside the transaction | Event Bus unavailability must not block the primary write |
| TB-03 | On event publication failure: log + queue retry | Eventual consistency is acceptable for cross-product events |
| TB-04 | Transaction timeout: 5 seconds max | Prevents long-running transactions from blocking the connection pool |
| TB-05 | No external API calls inside the transaction | External service latency would hold the transaction open |

---

# 6. Pagination Contract

All list operations follow a standardized pagination contract. This becomes the template for all SalesOS v2 (and future AQLIYA product) list endpoints.

## 6.1 Request

```typescript
interface PaginationRequest {
  page: number;       // 1-indexed. Default: 1.
  pageSize: number;   // Items per page. Default: 20. Max: 100.
}
```

## 6.2 Response

```typescript
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  hasNext: boolean;
  totalCount?: number;  // optional — computed only when explicitly requested (performance)
}
```

## 6.3 Rules

| Rule | Implementation |
|---|---|
| Default page size | 20 |
| Maximum page size | 100 (server caps higher values silently) |
| Total count | Included by default for first 3 pages. Omitted for deeper pagination to avoid COUNT scans on large datasets. |
| Ordering | Default: `updatedAt DESC`. Clients can request alternative sort via `sortBy` and `sortOrder` params. |
| Empty result | Returns `{ items: [], page: 1, pageSize: 20, hasNext: false, totalCount: 0 }`. Never returns 404. |

## 6.4 Integration with listDealsAction

```typescript
interface ListDealsFilter extends PaginationRequest {
  stage?: string;
  ownerId?: string;
  status?: "open" | "closed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: "updatedAt" | "createdAt" | "amount" | "probability";
  sortOrder?: "asc" | "desc";
}

listDealsAction(filter: ListDealsFilter): Promise<ActionResult<PaginatedResponse<DealResponse>>>;
```

---

# 7. API Versioning Policy

## 7.1 Version Declaration

Every Server Action contract declares an `apiVersion`:


```typescript
interface ApiVersioned {
  apiVersion: number;  // MAJOR version of the API contract
}
```

**Example in a Server Action:**

```typescript
export async function createDealAction(input: CreateDealInput): Promise<
  ActionResult<DealResponse & { apiVersion: 1 }>
> {
  // ...
}
```

## 7.2 Versioning Rules

| Change | Version Bump | Consumer Impact |
|---|---|---|
| New optional field in request or response | MINOR (no version change) | Backward compatible |
| New Server Action added | MINOR (no version change) | Backward compatible |
| Required field added to request DTO | MAJOR (apiVersion + 1) | Client must update |
| Existing field removed from response | MAJOR (apiVersion + 1) | Client must update |
| Field type changed | MAJOR (apiVersion + 1) | Client must update |
| Error code removed or renamed | MAJOR (apiVersion + 1) | Client must update |

## 7.3 Relationship to eventVersion

| Version | Owned By | Scope | Changes When |
|---|---|---|---|
| `apiVersion` | API layer (SPEC-01b) | Server Action contract | API contract changes |
| `eventVersion` | Domain layer (SPEC-01a) | Domain event schema | Domain event schema changes |

Both are independently versioned. A new `apiVersion` does not imply a new `eventVersion`, and vice versa.

---

# 8. DTO Mapping

## 5.1 Domain → DTO Translation

```typescript
function toDealResponse(deal: Deal): DealResponse {
  return {
    id: deal.id,
    accountId: deal.accountId,
    name: deal.name,
    amount: deal.amount instanceof Amount ? deal.amount.value : deal.amount,
    currency: deal.currency instanceof Currency ? deal.currency.code : deal.currency,
    stage: deal.stage instanceof Stage ? deal.stage.name : deal.stage,
    probability: deal.probability instanceof Probability ? deal.probability.value : deal.probability,
    expectedCloseDate: deal.expectedCloseDate,
    ownerId: deal.ownerId,
    reviewStatus: deal.reviewStatus,
    evidenceCount: deal.evidenceCount,
    version: deal.version,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    createdById: deal.createdById,
  };
}

function toDealDetailResponse(deal: Deal): DealDetailResponse {
  return {
    ...toDealResponse(deal),
    accountName: deal.accountName,        // from joined query
    accountIndustry: deal.accountIndustry,
    evidenceLinks: [],                     // resolved via Platform Evidence Network
    reviewDecisions: [],                   // extracted from deal metadata
    auditEvents: [],                       // fetched from Platform Audit service
  };
}
```

## 5.2 Input → Domain Translation

```typescript
function toCreateDealDomain(input: CreateDealInput, ctx: AuthContext): CreateDealDomainInput {
  return {
    accountId: input.accountId,
    name: input.name,
    amount: Amount.create(input.amount, input.currency ?? "SAR"),
    probability: input.probability !== undefined ? Probability.create(input.probability) : undefined,
    expectedCloseDate: input.expectedCloseDate,
    ownerId: input.ownerId,
    organizationId: ctx.organizationId,
    createdById: ctx.user.id,
  };
}
```

---

# 6. Specification Decisions

| ID | Decision | Rationale | Alternatives |
|---|---|---|---|
| SD-001 | Server Actions as API transport | Native to Next.js, co-located with routes, built-in revalidation | REST endpoints: unnecessary abstraction |
| SD-002 | Single `safe()` wrapper for all error mapping | Prevents error handling duplication across 9 actions | Per-action try/catch: duplicated, error-prone |
| SD-003 | `ActionResult<T>` universal return type | Consistent error surface, no exception propagation | Throwing errors: 500 for domain errors |
| SD-004 | Event publication after domain service call | Ensures deal is saved before publishing | Publishing before save: risk of phantom events |
| SD-005 | DealResponse flattenes Value Objects | Simpler client consumption | Returning Value Objects: client needs domain types |
| SD-006 | `version` field for concurrency, not etag | Explicit integer is simpler than etag parsing | etag: needs header parsing, less explicit |

---

# 7. Traceability

| SPEC-01b Element | PRD-01 Reference | SPEC-01a Reference | Blueprint Reference |
|---|---|---|---|---|
| Server Action contracts | §12 (APIs) | §1 (Deal aggregate) | §11 (API Contracts) |
| Error mapping | §12 (Error Codes) | §4 (Domain Error Model) | — |
| Authorization map | §5 (Actors) | — | — |
| AuthContext contract | §5 (Actors) | — | — |
| Correlation context | §12 (APIs) | — | — |
| Event publication | §11 (Published Events) | §3 (Domain Events) | §11.2 (Published Contracts) |
| Transaction boundary | §12 (APIs) | — | — |
| Concurrency protocol | §12 (Optimistic Concurrency) | §1.2 (version field) | — |
| Idempotency rules | §12 (Idempotency Policy) | — | — |
| Pagination contract | §6 (FR-05) | — | — |
| API versioning | — | §3 (eventVersion pattern) | — |
| DTO mapping | §6 (FRs) | §2 (Value Objects) | — |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** API Specification
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN)
- **Next:** SPEC-01c (Workflow Specification)
- **Changes from v0.1:** Added Correlation Context (§1.3), AuthContext contract (§1.4), Transaction Boundary (§5 with rules TB-01 to TB-05), Pagination Contract (§6 with PaginatedResponse<T>), API Versioning Policy (§7 with apiVersion), Specification Decisions expanded from 3 to 10 with Affected Sections column. Traceability updated.
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. Serves as Reference API Specification for all future AQLIYA product specifications.
- **Next:** SPEC-01c (Workflow Specification).
- **ADR note for future:** Consider ADR-017 — Transactional Outbox pattern for enterprise production. Current save → commit → publish → retry pattern is sufficient for v2.0.
