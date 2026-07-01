# PRD-01: Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Requirements Document — first engineering artifact in SalesOS v2.
> **Epic:** EPIC-01 (Opportunity Management)
> **Parent:** `CAPABILITY_BACKLOG.md` v1.0 → `SALESOS_V2_BLUEPRINT.md` v1.0 (frozen)
> **Next:** Specification-01 → Implementation-01 → Acceptance Tests
> **Philosophy:** This is the first PRD in the SalesOS v2 engineering program. Its structure will be reviewed after completion to validate the PRD template for all future Product Capabilities.

---

## 1. Purpose

Opportunity Management is the core operational capability of SalesOS v2. It enables sales teams to create, track, qualify, review, approve, and close commercial opportunities (deals) through a governed workflow with evidence gates, AI-assisted decision support, and full audit trail.

It is the **foundational domain** — Pipeline Management, Revenue Intelligence, Forecast Management, and Commercial Memory all depend on Deal data. Getting this right determines the success of the entire product.

---

## 2. Scope

### In Scope for PRD-01

| Area | Description |
|---|---|
| Deal CRUD | Create, read, update, close deals |
| Stage Management | 7-stage lifecycle with governed transitions |
| Evidence Gates | Required evidence per stage before transition |
| Review Workflow | Submit for review, approve, reject with reasons |
| Domain Events | Deal lifecycle events for internal and cross-product consumption |
| Audit Trail | Every mutation creates an audit event via Platform Audit |
| Role-Based Access | Permission guards on all mutations |
| Basic Deal List | Filterable, sortable list of deals |

### Out of Scope for PRD-01

| Area | Reason | Planned |
|---|---|---|
| Pipeline visualization | Separate Product Capability (EPIC-03) | Wave 2 |
| Drag-and-drop stage transitions | Requires Pipeline Management | Wave 2 |
| AI-assisted deal scoring | Requires Revenue Intelligence (EPIC-05) | Wave 3 |
| Bulk operations | Not required for core workflow | v2.1 |
| Email/calendar integration | Out of product scope | v2.2+ |
| CRM sync (HubSpot/Salesforce) | Platform boundary — integration, not core | v2.1 |

---

## 3. Business Outcomes

| Outcome | Measurement | Target |
|---|---|---|
| Reduce deal creation-to-review time | Median time from create to first review | ≤ 5 days |
| Increase evidence compliance | Deals with required evidence before stage transition | ≥ 95% |
| Improve review completion rate | Reviews completed within SLA | ≥ 90% |
| Increase approval-to-close conversion | Approved deals reaching Closed Won | ≥ 80% |
| Full audit traceability | Every mutation creates auditable event | 100% |

---

## 4. Product Capability Definition

| Field | Value |
|---|---|
| **Product Capability** | Opportunity Management |
| **Epic** | EPIC-01 |
| **Blueprint Section** | §5 (Product Capabilities), §7.2 (Deal Domain), §7.4 (Deal State Machine), §7.3 (Domain Events), §9 (Deal Modules) |
| **ADR** | ADR-001 (Freeze SalesOS v1), ADR-015 (Product Capability Layer) |
| **Constitution Principles** | 1 (Product Independence), 2 (Platform Neutrality), 5 (Consumer-Driven Extraction) |
| **KPIs (from Blueprint §13.6)** | Review completion rate ≥ 90%, Evidence gate compliance ≥ 95%, Approval-to-close ratio ≥ 80% |

---

## 5. Actors

| Actor | Role | Permissions Required |
|---|---|---|
| **Sales Rep** | Creates and manages deals. Links evidence. Submits for review. | `salesos:deal.create`, `salesos:deal.update`, `salesos:evidence.link` |
| **Sales Manager** | Reviews and approves/rejects deals. Views all deals in organization. | `salesos:deal.review`, `salesos:deal.approve` |
| **Sales Admin** | Configures stage definitions, evidence requirements. Manages deal metadata. | `salesos:deal.admin` |
| **Platform** | Listens to Deal Domain Events for audit, analytics, cross-product signals. | (Event Bus subscription) |

---

## 6. Functional Requirements

### FR-01: Create Deal

| Field | Required | Type | Description |
|---|---|---|---|
| `accountId` | ✅ | string | Reference to Account entity |
| `name` | ✅ | string | Deal name |
| `amount` | ✅ | number | Deal value |
| `currency` | ✅ | string | ISO code (default: SAR) |
| `stage` | ✅ | string | Initial stage (default: Draft) |
| `probability` | ✅ | number | 0-100 |
| `expectedCloseDate` | ❌ | date | Estimated close date |
| `ownerId` | ✅ | string | Assigned sales rep |

**Behavior:**
- System sets initial stage to `Draft`
- System sets `createdById` and `createdAt` from Platform Auth
- System publishes Domain Event `DealCreated`
- System creates Platform Audit event `salesos.deal.created`
- System returns created Deal entity

### FR-02: Update Deal

- Actor can update mutable fields (amount, probability, expectedCloseDate, ownerId)
- Stage changes are handled by FR-03 (not direct update)
- System sets `updatedById` and `updatedAt`
- System publishes Domain Event `DealUpdated`

### FR-03: Transition Stage

| Transition | Action | From | To | Guard |
|---|---|---|---|---|
| Qualify | `qualify` | Draft | Qualified | Account must be active |
| Submit for Review | `submit_for_review` | Qualified | In Review | Evidence count ≥ 1 |
| Approve | `approve` | In Review | Approved | Reviewer ≠ owner |
| Reject | `reject` | In Review | Rejected | Rejection reason required |
| Negotiate | `negotiate` | Approved | Negotiation | — |
| Close Won | `close_won` | Negotiation | Closed Won | Approval audit trail complete |
| Close Lost | `close_lost` | Negotiation | Closed Lost | Loss reason required |

**Behavior:**
- System validates guard before transition via Platform Workflow Engine
- On transition, system sets `reviewStatus` based on action:
  - `submit_for_review` → `reviewStatus = "in_review"`
  - `approve` → `reviewStatus = "approved"`, `approvalStatus = "approved"`
  - `reject` → `reviewStatus = "rejected"`
- System publishes Domain Event `DealStageChanged` with `{ fromStage, toStage, action, actorId }`
- System creates Platform Audit event
- If transition is `close_won` or `close_lost`, system publishes `DealClosedWon` / `DealClosedLost`

### FR-04: Link Evidence

| Field | Required | Description |
|---|---|---|
| `dealId` | ✅ | Target deal |
| `evidenceId` | ✅ | Reference to evidence in Platform Evidence Network |
| `evidenceType` | ✅ | Type classification |

**Behavior:**
- System calls `platform.evidence.link()`
- System increments `evidenceCount` on Deal
- System publishes Domain Event `DealEvidenceLinked`
- System creates Platform Audit event

### FR-05: List Deals

| Filter | Type | Description |
|---|---|---|
| `stage` | string | Filter by current stage |
| `ownerId` | string | Filter by assigned rep |
| `status` | string | `open` or `closed` |
| `dateFrom` / `dateTo` | date | Expected close date range |
| `search` | string | Text search on name and account name |

**Behavior:**
- System returns paginated list
- System enforces tenant isolation via `organizationId`
- Response includes: deal ID, name, account name, stage, amount, probability, expectedCloseDate, owner, evidenceCount, reviewStatus

### FR-06: Get Deal Detail

**Returns:**
- All deal fields
- Account summary (name, industry, status)
- Evidence links (via Platform Evidence Network)
- Interaction history (via Commercial Memory, when available)
- Review decisions (from Deal metadata)
- Audit trail (last 20 events)

### FR-07: Delete Deal

- Soft delete (set status to `archived`)
- Only Sales Admin can delete
- System publishes Domain Event `DealArchived`

---

## 7. Domain Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| DR-01 | A Deal must belong to exactly one Account | `accountId` is required and immutable after creation |
| DR-02 | A Deal cannot skip stages | All transitions must go through the defined state machine |
| DR-03 | Evidence is required before entering `In Review` | `evidenceCount >= 1` guard on `submit_for_review` |
| DR-04 | Reviewer cannot be the Deal owner | `reviewerId !== ownerId` guard on `approve` |
| DR-05 | Rejection requires a reason | `rejectionReason` is required for `reject` action |
| DR-06 | Loss requires a reason | `lossReason` is required for `close_lost` action |
| DR-07 | A closed Deal cannot be reopened | No transitions from `Closed Won` or `Closed Lost` |
| DR-08 | All mutations are audited | Every create, update, transition creates a Platform Audit event |
| DR-09 | Tenant isolation enforced server-side | All queries scoped by `organizationId` from Platform Auth context |

## 7.1 Domain Invariants

Invariants are constraints that must **always** be true for the Deal aggregate. They differ from Domain Rules (which govern transitions) — invariants are structural guarantees that cannot be violated at any state.

| Invariant ID | Invariant | Enforcement |
|---|---|---|
| DI-01 | Deal amount must be ≥ 0 | Validation on create and update |
| DI-02 | Deal probability must be between 0 and 100 inclusive | Validation on create and update |
| DI-03 | Deal must belong to exactly one Account | `accountId` is required and immutable |
| DI-04 | Deal owner must be a valid user in the organization | Reference integrity check |
| DI-05 | A closed Deal (Won or Lost) is immutable | No transitions or updates allowed |
| DI-06 | Stage must be a valid value from the defined state machine | Enum validation |
| DI-07 | Evidence count must equal the actual count of linked evidence | Computed from Platform Evidence Network, never stored as independent field |

## 7.2 Aggregate Root

The **Deal** is the Aggregate Root. It owns and enforces consistency for all entities within its boundary.

```text
Deal (Aggregate Root)
  │
  ├── Stage (current state in state machine)
  ├── Review (review decisions stored in metadata)
  ├── Evidence Links (count only — actual links live in Platform Evidence Network)
  ├── Domain Events (published on state changes)
  └── Version (for optimistic concurrency)
```

**Rules:**
- All changes to a Deal must go through the Deal Aggregate Root. No entity within the aggregate may be modified independently.
- Evidence Links are owned by the Platform Evidence Network. The Deal Aggregate only stores a reference count (`evidenceCount`), not the links themselves.
- The Aggregate boundary ensures consistency: a Deal cannot be in `Approved` stage while `reviewStatus` is `in_review`.

---

## 8. Workflow

The Deal lifecycle is governed by the Platform Workflow Engine (`platform.workflow`). The state machine is fully defined in Blueprint §7.4.

### Stage Definitions

| Stage | Description | Evidence Required | Approval Required |
|---|---|---|---|
| Draft | Initial creation. Basic information captured. | 0 | No |
| Qualified | Deal meets basic qualification criteria. | 0 | No |
| In Review | Deal is under manager review. | ≥ 1 | Yes (by Sales Manager) |
| Approved | Deal has been approved by manager. | ≥ 1 | — |
| Negotiation | Active negotiation phase. | — | No |
| Closed Won | Deal successfully closed. Won. | — | No |
| Closed Lost | Deal lost to competitor or abandoned. | — | No |

### SLA Rules

| Stage | Max Duration | Escalation |
|---|---|---|
| Draft | 7 days | Notify Sales Manager if not qualified |
| In Review | 3 days | Escalate to Sales Admin if not reviewed |

---

## 9. Evidence Requirements

### Evidence Types (consumed from Platform Evidence Network)

| Type | Description | Required For Stage |
|---|---|---|
| `qualification_note` | Notes on why deal qualifies | In Review |
| `proposal` | Proposal document | Negotiation |
| `poc_report` | Proof of concept results | Negotiation |
| `reference_call` | Customer reference summary | Negotiation |

### Evidence Gate Logic

```typescript
// Enforced by Platform Workflow Engine
function canTransitionToInReview(deal: Deal): boolean {
  return deal.evidenceCount >= 1;  // at least one evidence of any type
}
```

---

## 10. AI Touchpoints

| AI Feature | In PRD-01? | When | Description |
|---|---|---|---|
| Win probability suggestion | ❌ No | Wave 3 (EPIC-05) | Will compute probability from qualification score + evidence count. For v2.0, probability is manually set. |
| Next best action | ❌ No | Wave 3 (EPIC-05) | Will suggest next stage action based on deal state. For v2.0, actions are manual. |
| Risk alert | ❌ No | Wave 3 (EPIC-05) | Will detect stalled deals, low evidence, competitor threats. |
| Review summary | ❌ No | v2.1 | AI-generated summary of deal for reviewer. |

**AI is intentionally excluded from PRD-01.** The core workflow must work without AI. Intelligence is added as a layer on top in later waves.

---

## 11. Platform Dependencies

### Required Platform Capabilities

| Capability | Contract | Consumption Pattern |
|---|---|---|
| `platform.auth` | `AuthGuard.requirePermission("salesos:deal.create")` | Server-side guard on all mutations |
| `platform.workflow` | `WorkflowEngine.transition(dealId, "qualify")` | All stage transitions |
| `platform.evidence` | `EvidenceService.link({ targetType: "deal", targetId, evidenceId })` | Evidence linking and listing |

### Consumed Events (from Event Bus)

| Event | Producer | Purpose |
|---|---|---|
| `platform.auth.user.authenticated` | Platform Auth | Establish session context |

### Published Events (to Event Bus)

| Event | Payload | Consumer |
|---|---|---|
| `salesos.deal.created` | `{ dealId, accountId, amount, stage }` | Platform audit, analytics |
| `salesos.deal.stage_changed` | `{ dealId, fromStage, toStage, action, actorId }` | Workflow engine, notifications |
| `salesos.deal.submitted_for_review` | `{ dealId, reviewerId }` | Review queue, notifications |
| `salesos.deal.approved` | `{ dealId, approverId }` | Forecast update |
| `salesos.deal.rejected` | `{ dealId, reviewerId, reason }` | Deal owner notification |
| `salesos.deal.closed_won` | `{ dealId, amount, accountId }` | Revenue recognition, handoff trigger |
| `salesos.deal.closed_lost` | `{ dealId, reason, competitor? }` | Win/loss analysis |

---

## 12. APIs

### Server Actions (Next.js Server Actions)

| Action | Input | Output |
|---|---|---|
| `createDealAction` | `CreateDealInput` | `ActionResult<Deal>` |
| `updateDealAction` | `UpdateDealInput` | `ActionResult<Deal>` |
| `transitionDealAction` | `{ dealId, action }` | `ActionResult<Deal>` |
| `linkEvidenceAction` | `{ dealId, evidenceId, evidenceType }` | `ActionResult<EvidenceLink>` |
| `listDealsAction` | `ListDealsFilter` | `ActionResult<Deal[]>` |
| `getDealAction` | `{ dealId }` | `ActionResult<DealDetail>` |

### Response Format

```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
```

### Optimistic Concurrency

Every Deal entity carries a `version` field to detect concurrent modifications.

```typescript
interface ConcurrencyGuard {
  version: number;     // monotonically increasing, starts at 1
  updatedAt: string;   // ISO timestamp of last modification
}
```

**Rules:**
- Every update and transition request must include the `version` of the Deal being modified.
- Before applying the change, the system compares the provided `version` against the current `version` in the database.
- If they match → change proceeds, `version` is incremented.
- If they do not match → change is rejected with `CONFLICT`.
- The `updatedAt` timestamp is set to the current time whenever `version` changes.

### Idempotency Policy

Certain operations must be idempotent to handle retry scenarios (network issues, double-clicks, Server Action replay).

| Operation | Idempotent? | Mechanism |
|---|---|---|
| `createDeal` | No | Each call creates a new Deal. Use client-side deduplication. |
| `updateDeal` | Yes (conditional) | If the input matches the current state (same fields, same version), return success without applying changes. |
| `transitionDeal` | Yes | If the Deal is already in the target stage and the requested action matches the last transition action, return success without reapplying. |
| `linkEvidence` | Yes (conditional) | If the same evidenceId is already linked to the same Deal, return success without duplicate. |
| `listDeals` | Yes | Read-only — naturally idempotent. |
| `getDeal` | Yes | Read-only — naturally idempotent. |

**Implementation note:** Idempotency does not mean "ignore the request." It means "if the request has already been applied, return the same result without side effects." This is critical for Server Actions which may be retried by the Next.js runtime.

### Error Codes

| Code | HTTP Equivalent | When |
|---|---|---|
| `FORBIDDEN` | 403 | Missing permission or cross-tenant access |
| `NOT_FOUND` | 404 | Deal or Account not found |
| `VALIDATION_ERROR` | 400 | Invalid input format, missing required fields, type errors |
| `BUSINESS_RULE_FAILED` | 422 | Domain invariant violated (e.g., Reviewer == Owner, Loss reason missing, Closed deal update). Distinct from GOVERNANCE_BLOCKED — this is a business logic rule, not a workflow gate. |
| `GOVERNANCE_BLOCKED` | 422 | Stage transition guard failed (e.g., missing evidence before In Review). Governed by Platform Workflow Engine. |
| `CONFLICT` | 409 | Concurrent modification (version mismatch) |

---

## 13. Acceptance Criteria

| AC ID | Criterion | Type |
|---|---|---|
| AC-01 | Sales Rep can create a Deal with required fields and it appears in the deal list | Functional |
| AC-02 | Deal transitions through all 7 stages in order, respecting guards | Workflow |
| AC-03 | Transition from Qualified to In Review is blocked if evidence count < 1 | Governance |
| AC-04 | Reviewer cannot approve their own Deal | Governance |
| AC-05 | Rejection requires a reason | Validation |
| AC-06 | Close Lost requires a loss reason | Validation |
| AC-07 | Closing a Deal prevents further transitions | Lifecycle |
| AC-08 | Every mutation creates an Audit event visible in the Deal detail | Audit |
| AC-09 | Tenant isolation: User from Org A cannot see Deals from Org B | Security |
| AC-10 | Sales Manager can view all Deals in their org, filter by stage | Authorization |
| AC-11 | Each stage transition publishes the correct Domain Event | Eventing |
| AC-12 | Evidence count updates when evidence is linked/unlinked | Integration |

---

## 14. Test Scenarios

### Scenario 1: Happy Path — Deal Closed Won

```
1. Sales Rep creates Deal for qualifying Account → Deal is in Draft
2. Sales Rep qualifies Deal → Deal moves to Qualified
3. Sales Rep links 1 evidence → evidenceCount = 1
4. Sales Rep submits for review → Deal moves to In Review
5. Sales Manager reviews and approves → Deal moves to Approved
6. Sales Rep negotiates → Deal moves to Negotiation
7. Sales Rep closes won → Deal moves to Closed Won
   Verify: All Domain Events published, audit trail complete, no further transitions allowed
```

### Scenario 2: Governance Block — Missing Evidence

```
1. Sales Rep creates Deal, qualifies it → Deal is in Qualified
2. Sales Rep attempts to submit for review → BLOCKED (evidenceCount < 1)
   Verify: Error code GOVERNANCE_BLOCKED, Deal stays in Qualified, no Domain Events published
3. Sales Rep links evidence → evidenceCount = 1
4. Sales Rep submits for review → Deal moves to In Review (success)
```

### Scenario 3: Rejection Flow

```
1. Deal is in In Review
2. Sales Manager rejects with reason → Deal moves to Rejected
   Verify: reviewStatus = "rejected", rejection reason stored, Domain Event published
3. Sales Rep cannot transition from Rejected to next stage directly
```

### Scenario 4: Tenant Isolation

```
1. User A (Org 1) creates Deal
2. User B (Org 2) attempts to view Deal → FORBIDDEN
3. User B attempts to transition Deal → FORBIDDEN
```

### Scenario 5: Audit Trail

```
1. Create Deal → audit event: salesos.deal.created
2. Qualify → audit event: salesos.deal.stage_changed
3. Link evidence → audit event: salesos.evidence.linked
4. Submit for review → audit event: salesos.deal.submitted_for_review
5. Approve → audit event: salesos.deal.approved
6. Close won → audit event: salesos.deal.closed_won
   Verify: All 6 events appear in Deal detail audit trail, in chronological order
```

---

## 14b. Observability Matrix

Every operation in Opportunity Management must emit observability signals. This matrix defines what is emitted for each action.

| Action | Metric | Log | Trace | Audit Event |
|---|---|---|---|---|
| `createDeal` | `salesos.deal.created` counter | Structured log with dealId, accountId, amount | Trace span: `DealService.create` | `salesos.deal.created` |
| `updateDeal` | `salesos.deal.updated` counter | Structured log with dealId, changed fields | Trace span: `DealService.update` | `salesos.deal.updated` |
| `transitionDeal` | `salesos.deal.transition` counter + `salesos.deal.stage.{toStage}` gauge | Structured log with dealId, fromStage, toStage, action | Trace span: `DealService.transition` | `salesos.deal.stage_changed` |
| `linkEvidence` | `salesos.evidence.linked` counter | Structured log with dealId, evidenceId | Trace span: `EvidenceService.link` | `salesos.evidence.linked` |
| `submitForReview` | `salesos.deal.submitted_for_review` counter | Structured log with dealId, reviewerId | Trace span: `DealService.submitForReview` | `salesos.deal.submitted_for_review` |
| `approveDeal` | `salesos.deal.approved` counter + `salesos.deal.approval_time` histogram | Structured log with dealId, approverId, reviewDuration | Trace span: `DealService.approve` | `salesos.deal.approved` |
| `rejectDeal` | `salesos.deal.rejected` counter | Structured log with dealId, reviewerId, reason | Trace span: `DealService.reject` | `salesos.deal.rejected` |
| `closeWon` | `salesos.deal.closed_won` counter + `salesos.deal.pipeline_conversion` gauge | Structured log with dealId, amount, accountId | Trace span: `DealService.closeWon` | `salesos.deal.closed_won` |
| `closeLost` | `salesos.deal.closed_lost` counter + `salesos.deal.loss_reason.{reason}` counter | Structured log with dealId, reason, competitor | Trace span: `DealService.closeLost` | `salesos.deal.closed_lost` |
| `listDeals` | `salesos.deal.list` counter (by filter type) | Structured log with filter params (no PII) | Trace span: `DealService.list` | — (read-only) |
| `getDeal` | `salesos.deal.detail` counter | Structured log with dealId | Trace span: `DealService.getDetail` | — (read-only) |

**Metric naming convention:** `salesos.{entity}.{action}` — all lowercase with dots, published to Platform Observability service.

---

## 15. Traceability

| PRD Element | Blueprint Reference | ADR | Constitution Principle |
|---|---|---|---|
| Deal Stage Machine | §7.4 (State Machines) | ADR-001, ADR-015 | 1, 2 |
| Evidence Gates | §7.4 (transition guards) | ADR-001 | 5 |
| Domain Events | §7.3 (Domain Events) | ADR-001 | 2 |
| Platform Dependencies | §1 (Product Profile), §11 (API Contracts) | ADR-001 | 1, 5 |
| KPIs | §13.6 (Capability KPIs) | ADR-015 | 12 |
| Bounded Context | §7.1 (Deal Context) | ADR-015 | 2 |
| Audit | §7.3 (Domain Event → Platform mapping) | ADR-001 | 1 |
| AI Exclusion | §3 (Out of Scope) | ADR-016 | 12 |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Product Requirements Document
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `CAPABILITY_BACKLOG.md` (EPIC-01)
- **Grandparent:** `SALESOS_V2_BLUEPRINT.md` (frozen)
- **Next:** Specification-01 (Domain Spec, API Spec, Workflow Spec, UX Spec, Test Spec)
- **Review required before freezing:** Product Architect, Platform Architect, Engineering Lead
- **Changes from v0.1:** Added Aggregate Root definition (§7.2), Domain Invariants (7), Optimistic Concurrency with version field, Idempotency Policy per operation, BUSINESS_RULE_FAILED error code, Observability Matrix with metrics/logs/traces/audit per action.
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. No modifications. Next: Specification-01.
- **Engineering rule:** No implementation may read the Blueprint directly. All engineering reads PRD-01 v1.0 → Specification-01.
