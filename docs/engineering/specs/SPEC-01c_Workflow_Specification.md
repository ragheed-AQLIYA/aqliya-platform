# SPEC-01c: Workflow Specification — Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — defines the Deal state machine, transition guards, evidence gates, SLA rules, escalation logic, and recovery/compensation patterns.
> **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN), `SPEC-01b_API_Specification.md` v1.0 (FROZEN)
> **Relationship:**
>   - SPEC-01a = what the Domain is
>   - SPEC-01b = how the external world reaches the Domain
>   - **SPEC-01c = how the Domain moves through time**

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-01a v1.0 (Deal aggregate, Stage value object, Domain Events), SPEC-01b v1.0 (Server Actions, Event publication contracts) |
| **Blocks** | SPEC-01d (UX), SPEC-01e (Tests) |
| **Consumer** | Workflow Engineering Team, Platform Workflow Engine Team |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Deal state machine (stages + transitions) | PRD-01 | §8 (Workflow), §6 FR-03 (Transition Stage) |
| Transition guards | PRD-01 | §8 (Stage Definitions, SLA Rules) |
| Evidence requirements | PRD-01 | §9 (Evidence Requirements) |
| Domain rules (DR-01 to DR-09) | PRD-01 | §7 (Domain Rules) |
| Domain invariants (DI-01 to DI-07) | SPEC-01a | §1.3 |
| Aggregate lifecycle | SPEC-01a | §1 (Aggregate Lifecycle) |
| Stage value object | SPEC-01a | §2 (Stage class) |
| Domain events | SPEC-01a | §3 (7 events with eventVersion) |
| Domain error model | SPEC-01a | §4 (GovernanceBlockedError, BusinessRuleError) |
| API actions that trigger transitions | SPEC-01b | §2 (transitionDealAction, submitForReviewAction, etc.) |
| Authorization map | SPEC-01b | §1.5 (Permission-to-Action) |
| Transaction boundary | SPEC-01b | §5 |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| State machine implementation spec | Exact transition rules, guards, stage definitions | Platform Workflow Engine Team |
| Guard specifications | Pre-conditions for each transition | SPEC-01e (Tests) |
| Evidence gate logic | When evidence is required, how it's validated | SPEC-01e |
| SLA timer definitions | Duration limits per stage, notification triggers | Platform Operations |
| Escalation rules | What happens when SLA is breached | Platform Operations |
| Workflow event map | Which Domain Events are published at which transitions | SPEC-01b (already mapped) |
| Recovery/compensation rules | How to handle failed transitions, rollback scenarios | SPEC-01e |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| Platform Workflow Engine | Contract | Cannot execute state machine |
| Platform Evidence Network | Contract | Cannot validate evidence gates |
| Platform Auth | Contract | Cannot enforce role-based guards |
| SPEC-01a | Document | No domain types to transition |
| SPEC-01b | Document | No API entry points to trigger transitions |

---

## Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| A-01 | Platform Workflow Engine supports configurable state machines with guards | Would need to implement workflow logic in application code |
| A-02 | SLA timers are managed by the Platform Workflow Engine | Would need custom timer service |
| A-03 | Escalation notifications are handled by the Platform Notification service | Would need notification integration |
| A-04 | Stage definitions come from the business configuration, not hardcoded | Would need admin UI for stage configuration |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Can the Platform Workflow Engine support conditional transitions (e.g., different paths based on deal amount)? | Affects state machine complexity | SPEC-01c review |
| OQ-02 | Who configures stage definitions — admin UI or deploy-time config? | Affects flexibility vs. stability | Platform Kernel Architecture review |

---

## Non-Goals

This specification does NOT define:
- UI components for workflow visualization
- Platform Workflow Engine internal implementation
- Database storage for workflow instances
- Platform Notification service implementation
- Platform Evidence Network internal implementation

---

## Implementation Independence

This specification defines:
- State machine transition rules and guards
- Evidence gate validation logic
- SLA definitions and escalation triggers
- Recovery and compensation patterns
- Workflow event propagation rules

This specification intentionally does NOT define:
- Platform Workflow Engine internal architecture
- How SLA timers are implemented
- How notifications are delivered
- How evidence is stored
- UI for workflow visualization

---

## Specification Decisions

| ID | Decision | Rationale | Alternatives Considered | Affected Sections |
|---|---|---|---|---|
| SD-001 | State machine is defined in Platform Workflow Engine, not hardcoded | Enables future configuration without code changes | Hardcoded state machines: faster initially but inflexible | §1 (State Machine) |
| SD-002 | Evidence gates are checked by the domain before calling Workflow Engine | Keeps evidence logic in the domain layer, not in the workflow engine | Workflow Engine checking evidence: couples engine to SalesOS domain | §2 (Evidence Gates) |
| SD-003 | SLA timers start on stage entry, reset on stage change | Simple, predictable behavior | Cumulative timers: complex, low value | §3 (SLA Rules) |
| SD-004 | Escalation creates a notification + audit event, does NOT auto-transition | Human decision always required for governance-sensitive operations | Auto-return to previous stage: risky without human judgment | §4 (Escalation Rules) |
| SD-005 | Recovery is manual (admin override) for failed transitions | Governance-first approach. Machine cannot override evidence gates. | Auto-retry: could bypass governance rules | §6 (Recovery/Compensation) |

---

# 1. State Machine Implementation

## 1.1 Workflow Definition

```typescript
interface WorkflowDefinition {
  workflowId: string;          // stable identifier, e.g., "deal-management"
  workflowVersion: number;     // incremented on breaking changes to the workflow structure
  name: string;
  stages: StageDefinition[];
  transitions: TransitionDefinition[];
  slaPolicies: SLAPolicy[];    // abstracted timer configuration
  guardExecutionOrder: GuardPhase[];  // deterministic guard pipeline
}
```

**Versioning policy:**

| Change | Version Bump | Consumer Impact |
|---|---|---|
| New stage added | MAJOR (workflowVersion + 1) | Existing deals on old version are unaffected |
| Stage renamed | MAJOR | Old transitions reference old stage names |
| Guard added or removed | MAJOR | May change transition behavior |
| SLA duration changed | MINOR (no version change) | Backward compatible — timers restart with new duration |
| Display labels changed | PATCH (no version change) | Cosmetic only |

**Dual-version support:** When `workflowVersion` changes, existing deals continue using the version they were created under. New deals use the latest version. This prevents breaking in-flight workflows.

```typescript
const WORKFLOW_ID = "deal-management";
const WORKFLOW_VERSION_V1 = 1;

const dealWorkflow: WorkflowDefinition = {
  workflowId: WORKFLOW_ID,
  workflowVersion: WORKFLOW_VERSION_V1,
  name: "Deal Management",
  stages: DEAL_STAGES,
  transitions: DEAL_TRANSITIONS,
  slaPolicies: SLA_POLICIES,
  guardExecutionOrder: ["validation", "business", "governance"],
};
```

## 1.2 Stage Definitions

The Deal state machine has 7 stages. Stage definitions are consumed from PRD-01 §8 and SPEC-01a §2 (Stage value object).

```typescript
interface StageDefinition {
  name: string;              // matches Stage value object
  displayNameAr: string;     // Arabic label for UI
  displayNameEn: string;     // English label for UI
  sortOrder: number;         // 1-7, for pipeline display
  requiredEvidenceCount: number;
  requiresApproval: boolean;
  slaMaxDurationHours?: number;  // SLA timer, null if no SLA
}

const DEAL_STAGES: StageDefinition[] = [
  {
    name: "Draft",
    displayNameAr: "مسودة",
    displayNameEn: "Draft",
    sortOrder: 1,
    requiredEvidenceCount: 0,
    requiresApproval: false,
    slaMaxDurationHours: 168,  // 7 days
  },
  {
    name: "Qualified",
    displayNameAr: "مؤهل",
    displayNameEn: "Qualified",
    sortOrder: 2,
    requiredEvidenceCount: 0,
    requiresApproval: false,
  },
  {
    name: "In Review",
    displayNameAr: "قيد المراجعة",
    displayNameEn: "In Review",
    sortOrder: 3,
    requiredEvidenceCount: 1,
    requiresApproval: true,
    slaMaxDurationHours: 72,  // 3 days
  },
  {
    name: "Approved",
    displayNameAr: "معتمد",
    displayNameEn: "Approved",
    sortOrder: 4,
    requiredEvidenceCount: 1,
    requiresApproval: false,
  },
  {
    name: "Negotiation",
    displayNameAr: "تفاوض",
    displayNameEn: "Negotiation",
    sortOrder: 5,
    requiredEvidenceCount: 0,
    requiresApproval: false,
  },
  {
    name: "Closed Won",
    displayNameAr: "فوز",
    displayNameEn: "Closed Won",
    sortOrder: 6,
    requiredEvidenceCount: 0,
    requiresApproval: false,
    isTerminal: true,
  },
  {
    name: "Closed Lost",
    displayNameAr: "خسارة",
    displayNameEn: "Closed Lost",
    sortOrder: 7,
    requiredEvidenceCount: 0,
    requiresApproval: false,
    isTerminal: true,
  },
];
```

## 1.2 Transition Definitions

```typescript
interface TransitionDefinition {
  action: string;         // action name, used in API (SPEC-01b)
  fromStage: string;
  toStage: string;
  guard?: string;         // reference to a guard function
  requiresEvidence?: boolean;
  requiresApproval?: boolean;
  requiresReason?: boolean;  // e.g., rejection, loss
  publishedEvents: string[];  // Domain Events published
}

const DEAL_TRANSITIONS: TransitionDefinition[] = [
  {
    action: "qualify",
    fromStage: "Draft",
    toStage: "Qualified",
    guard: "accountMustBeActive",
    requiresEvidence: false,
    publishedEvents: ["DealStageChanged"],
  },
  {
    action: "submit_for_review",
    fromStage: "Qualified",
    toStage: "In Review",
    guard: "evidenceGate",
    requiresEvidence: true,
    requiresApproval: false,
    publishedEvents: ["DealStageChanged", "DealSubmittedForReview"],
  },
  {
    action: "approve",
    fromStage: "In Review",
    toStage: "Approved",
    guard: "reviewerNotOwner",
    requiresEvidence: false,
    publishedEvents: ["DealStageChanged", "DealApproved"],
  },
  {
    action: "reject",
    fromStage: "In Review",
    toStage: "Closed Lost",
    guard: "reviewerNotOwner",
    requiresReason: true,
    publishedEvents: ["DealStageChanged", "DealRejected"],
  },
  {
    action: "negotiate",
    fromStage: "Approved",
    toStage: "Negotiation",
    publishedEvents: ["DealStageChanged"],
  },
  {
    action: "close_won",
    fromStage: "Negotiation",
    toStage: "Closed Won",
    guard: "approvalAuditComplete",
    publishedEvents: ["DealStageChanged", "DealClosedWon"],
  },
  {
    action: "close_lost",
    fromStage: ["Negotiation", "Qualified", "In Review", "Approved"],
    toStage: "Closed Lost",
    requiresReason: true,
    publishedEvents: ["DealStageChanged", "DealClosedLost"],
  },
];
```

---

# 2. Transition Guards

## 2.1 Guard Execution Model

Guards are executed in a **deterministic, ordered, fail-fast pipeline**. Each guard phase must complete before the next begins. If any guard fails, the remaining guards are skipped and the transition is blocked.

### Guard Phases

```text
┌──────────────────────────────────────────────────┐
│  PHASE 1: Validation Guards                      │
│  ┌──────────────────────────────────────────┐    │
│  │ Check: Input format, required fields     │    │
│  │ Fail fast: VALIDATION_ERROR              │    │
│  └──────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  PHASE 2: Business Guards                       │
│  ┌──────────────────────────────────────────┐    │
│  │ Check: Domain invariants, business rules │    │
│  │ Fail fast: BUSINESS_RULE_FAILED          │    │
│  └──────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  PHASE 3: Governance Guards                     │
│  ┌──────────────────────────────────────────┐    │
│  │ Check: Evidence gates, approval rules    │    │
│  │ Fail fast: GOVERNANCE_BLOCKED            │    │
│  └──────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  PHASE 4: Workflow Engine                       │
│  ┌──────────────────────────────────────────┐    │
│  │ Execute: Transition in state machine     │    │
│  │ Snapshot: Capture guard results + state  │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### Execution Rules

| Rule | Implication |
|---|---|
| **Ordered** | Validation → Business → Governance. No phase runs before the previous one completes. |
| **Fail Fast** | First guard failure stops execution. Remaining guards are not evaluated. |
| **Deterministic** | Same input always produces the same guard results. No race conditions in guard evaluation. |
| **Logged** | Every guard evaluation is logged with input, result, and duration. |

### Guard Pipeline Implementation

```typescript
async function evaluateGuards(
  deal: Deal,
  transition: TransitionDefinition,
  context: WorkflowContext,
): Promise<GuardPipelineResult> {
  const pipeline: GuardPhase[] = ["validation", "business", "governance"];
  const results: GuardEvaluation[] = [];

  for (const phase of pipeline) {
    const guards = getGuardsForPhase(transition.action, phase);
    for (const guard of guards) {
      const result = await guard(deal, context, transition.toStage);
      results.push({
        guardName: guard.name,
        phase,
        result,
        evaluatedAt: new Date().toISOString(),
      });
      if (!result.allowed) {
        return { allowed: false, failedPhase: phase, results };
      }
    }
  }

  return { allowed: true, results };
}

type GuardPhase = "validation" | "business" | "governance";

interface GuardEvaluation {
  guardName: string;
  phase: GuardPhase;
  result: GuardResult;
  evaluatedAt: string;
}

interface GuardPipelineResult {
  allowed: boolean;
  failedPhase?: GuardPhase;
  results: GuardEvaluation[];
}
```

### Guard-to-Phase Mapping

| Guard | Phase | Error Code |
|---|---|---|
| `accountMustBeActive` | Business | `BUSINESS_RULE_FAILED` |
| `evidenceGate` | Governance | `GOVERNANCE_BLOCKED` |
| `reviewerNotOwner` | Business | `BUSINESS_RULE_FAILED` |
| `approvalAuditComplete` | Governance | `GOVERNANCE_BLOCKED` |

---

## 2.2 Guard: accountMustBeActive

```typescript
/**
 * Validates that the Account associated with this Deal is active.
 * Prevents deals from being qualified under inactive accounts.
 */
async function accountMustBeActive(deal: Deal, context: WorkflowContext): Promise<GuardResult> {
  const account = await accountRepository.findById(deal.accountId, context.organizationId);
  
  if (!account) {
    return { allowed: false, reason: "Account not found", code: "NOT_FOUND" };
  }
  
  if (account.status !== "active" && account.status !== "qualified") {
    return {
      allowed: false,
      reason: `Account status is '${account.status}'. Must be 'active' or 'qualified'.`,
      code: "BUSINESS_RULE_FAILED",
    };
  }
  
  return { allowed: true };
}
```

## 2.2 Guard: evidenceGate

```typescript
/**
 * Validates that the Deal has sufficient evidence for the target stage.
 * The minimum evidence count is defined in the StageDefinition.
 */
async function evidenceGate(deal: Deal, context: WorkflowContext, toStage: string): Promise<GuardResult> {
  const stageDef = DEAL_STAGES.find(s => s.name === toStage);
  if (!stageDef) {
    return { allowed: false, reason: `Unknown stage: ${toStage}`, code: "VALIDATION_ERROR" };
  }

  if (stageDef.requiredEvidenceCount === 0) {
    return { allowed: true };  // no evidence required for this stage
  }

  // Actual evidence count comes from Platform Evidence Network
  const actualCount = await evidenceService.countByTarget({
    targetType: "deal",
    targetId: deal.id,
    organizationId: context.organizationId,
  });

  if (actualCount < stageDef.requiredEvidenceCount) {
    return {
      allowed: false,
      reason: `Evidence required: ${stageDef.requiredEvidenceCount} needed, ${actualCount} linked.`,
      code: "GOVERNANCE_BLOCKED",
      details: { required: stageDef.requiredEvidenceCount, actual: actualCount },
    };
  }

  return { allowed: true };
}
```

## 2.3 Guard: reviewerNotOwner

```typescript
/**
 * Prevents a Deal owner from reviewing/approving their own Deal.
 */
function reviewerNotOwner(deal: Deal, context: WorkflowContext): GuardResult {
  if (context.actorId === deal.ownerId) {
    return {
      allowed: false,
      reason: "Deal owner cannot review or approve their own deal.",
      code: "BUSINESS_RULE_FAILED",
    };
  }
  return { allowed: true };
}
```

## 2.4 Guard: approvalAuditComplete

```typescript
/**
 * Validates that the Deal has a complete approval audit trail before closing as Won.
 */
async function approvalAuditComplete(deal: Deal, context: WorkflowContext): Promise<GuardResult> {
  const auditEvents = await auditService.listByTarget({
    targetType: "deal",
    targetId: deal.id,
    organizationId: context.organizationId,
    actions: ["salesos.deal.approved"],
  });

  if (auditEvents.length === 0) {
    return {
      allowed: false,
      reason: "Deal cannot be closed Won without an approval audit record.",
      code: "GOVERNANCE_BLOCKED",
    };
  }

  return { allowed: true };
}
```

## 2.6 Guard Result Type

```typescript
interface GuardResult {
  allowed: boolean;
  reason: string;
  code?: "VALIDATION_ERROR" | "BUSINESS_RULE_FAILED" | "GOVERNANCE_BLOCKED" | "NOT_FOUND";
  details?: Record<string, unknown>;
}
```

---

# 3. Evidence Gates

## 3.1 Evidence Requirements by Stage

| Stage | Required Evidence Count | Evidence Types Accepted | Gate Enforced |
|---|---|---|---|
| Draft | 0 | — | No |
| Qualified | 0 | — | No |
| In Review | 1 | Any type | **Yes** — cannot submit without at least 1 |
| Approved | 1 | Any type | No (already met from In Review) |
| Negotiation | 0 | — | No |
| Closed Won | 0 | — | No (approval audit trail required instead) |
| Closed Lost | 0 | — | No |

## 3.2 Evidence Validation Flow

```
1. User requests transition to a governed stage (e.g., submit_for_review)
2. System identifies target stage's evidence requirements
3. System queries Platform Evidence Network for actual count
4. If actual >= required → proceed with transition
5. If actual < required → block with GOVERNANCE_BLOCKED
6. System returns details: { required: N, actual: M }
```

## 3.3 Edge Cases

| Scenario | Behavior |
|---|---|
| Evidence linked after gate check, before transition | Transition proceeds with the count at time of check (optimistic). If evidence is removed concurrently, the next check will catch it. |
| Evidence unlinked after gate passed | Deal remains in the stage it reached. Evidence gates are only checked on entry, not continuously. |
| Bulk evidence linking | Evidence count is updated after each link. Gate re-evaluated on next transition attempt. |

---

# 4. SLA Rules

## 4.1 SLA Policy Model

Instead of hardcoded durations, SLA is defined as a **policy** that can vary by customer segment, deal type, or organizational configuration.

```typescript
interface SLAPolicy {
  policyId: string;                // unique identifier
  name: string;
  description: string;
  rules: SLARule[];
  defaultRule: SLARule;            // fallback when no specific rule matches
}

interface SLARule {
  stageName: string;
  maxDurationHours: number;        // SLA timer duration
  thresholdWarningPercent: number; // default: 75
  thresholdEscalatePercent: number;// default: 100
  applicableSegments?: string[];   // e.g., ["enterprise", "smb", "government"]
}

// Default SLA Policy for SalesOS v2.0
const DEFAULT_SLA_POLICY: SLAPolicy = {
  policyId: "salesos-sla-v1",
  name: "SalesOS Default SLA",
  description: "Standard SLA policy for Opportunity Management",
  rules: [
    {
      stageName: "Draft",
      maxDurationHours: 168,  // 7 days
      thresholdWarningPercent: 75,
      thresholdEscalatePercent: 100,
      applicableSegments: ["enterprise", "smb"],
    },
    {
      stageName: "In Review",
      maxDurationHours: 72,  // 3 days
      thresholdWarningPercent: 75,
      thresholdEscalatePercent: 100,
      applicableSegments: ["enterprise", "smb"],
    },
  ],
  defaultRule: {
    stageName: "*",
    maxDurationHours: 336,  // 14 days default for unconfigured stages
    thresholdWarningPercent: 75,
    thresholdEscalatePercent: 100,
  },
};
```

**Future extensibility:**
- Different SLA policies for different customer segments (`enterprise`, `smb`, `government`)
- Different SLA policies for different deal types (`new_business`, `renewal`, `expansion`)
- SLA policies configurable via admin UI without code changes

## 4.2 SLA Definitions

| Stage | Max Duration | Timer Start | Timer Reset |
|---|---|---|---|
| Draft | 168 hours (7 days) | On Deal creation | On transition out of Draft |
| In Review | 72 hours (3 days) | On entry to In Review | On transition out of In Review |

## 4.2 SLA Timer Behavior

```
Stage Entry
    │
    ▼
Timer Started
    │
    ├── Normal: Transition happens before SLA → Timer cancelled
    │
    └── SLA Breach: Timer expires
              │
              ▼
         Escalation Triggered
              │
              ├── Notification sent to stage owner
              ├── Notification sent to stage reviewer (if applicable)
              ├── Audit event created: salesos.sla.breached
              └── Deal flagged as "sla_breached" in metadata
```

## 4.3 SLA States

```typescript
type SLAStatus = "on_track" | "approaching" | "breached";

interface SLAStatusResponse {
  status: SLAStatus;
  stage: string;
  enteredAt: string;
  maxDurationHours: number;
  remainingHours?: number;
  breachedAt?: string;
}
```

## 4.4 SLA Notification Thresholds

| Threshold | Action |
|---|---|
| 75% of SLA duration elapsed | Notify: "Deal approaching SLA limit" |
| 100% of SLA duration elapsed (breach) | Notify: "SLA breached" + escalate to manager's manager |
| 200% of SLA duration elapsed (extreme breach) | Notify: Admin dashboard alert |

---

# 5. Escalation Rules

## 5.1 Escalation Matrix

| Trigger | Escalation Level | Action | Notify |
|---|---|---|---|
| SLA breached in Draft (7 days) | Level 1 | Notify Sales Manager | Sales Manager |
| SLA breached in In Review (3 days) | Level 1 | Notify reviewer + reviewer's manager | Reviewer, Sales Manager |
| SLA extreme breach (14 days Draft, 7 days In Review) | Level 2 | Notify Sales Admin | Sales Admin |
| Consecutive rejections (3+) | Level 2 | Flag deal for manual review | Sales Admin |
| High-value deal (amount > 1M SAR) stuck in any stage > 30 days | Level 2 | Executive review requested | Sales Operations |

## 5.2 Escalation Behavior

```typescript
interface EscalationAction {
  level: 1 | 2;
  trigger: string;
  notificationChannels: string[];   // e.g., ["in_app", "email"]
  auditEvent: string;                // e.g., "salesos.escalation.level1"
  autoAction?: "none" | "flag" | "notify_admin";
}

const ESCALATION_RULES: EscalationAction[] = [
  {
    level: 1,
    trigger: "sla_breached_draft",
    notificationChannels: ["in_app"],
    auditEvent: "salesos.escalation.level1",
    autoAction: "none",
  },
  {
    level: 2,
    trigger: "sla_extreme_breach",
    notificationChannels: ["in_app", "email"],
    auditEvent: "salesos.escalation.level2",
    autoAction: "notify_admin",
  },
];
```

## 5.3 Escalation does NOT auto-transition

Escalation never changes the Deal stage. It only:
1. Creates notifications
2. Creates audit events
3. Flags the deal for attention
4. Optionally notifies higher-level actors

Stage transitions always require explicit human action. This is a governance requirement (Constitution Principle 5: Consumer-Driven Extraction + Principle 12: Business First, Technology Second).

---

# 6. Workflow Events

## 6.1 Event Publication per Transition

| Transition Action | Domain Events Published | Platform Event Type |
|---|---|---|
| `qualify` | `DealStageChanged` | `salesos.deal.stage_changed` |
| `submit_for_review` | `DealStageChanged`, `DealSubmittedForReview` | `salesos.deal.stage_changed`, `salesos.deal.submitted_for_review` |
| `approve` | `DealStageChanged`, `DealApproved` | `salesos.deal.stage_changed`, `salesos.deal.approved` |
| `reject` | `DealStageChanged`, `DealRejected` | `salesos.deal.stage_changed`, `salesos.deal.rejected` |
| `negotiate` | `DealStageChanged` | `salesos.deal.stage_changed` |
| `close_won` | `DealStageChanged`, `DealClosedWon` | `salesos.deal.stage_changed`, `salesos.deal.closed_won` |
| `close_lost` | `DealStageChanged`, `DealClosedLost` | `salesos.deal.stage_changed`, `salesos.deal.closed_lost` |

## 6.2 SLA Events

| Event | Trigger | Payload |
|---|---|---|
| `salesos.sla.on_track` | Periodic check | `{ dealId, stage, remainingHours }` |
| `salesos.sla.approaching` | 75% threshold | `{ dealId, stage, remainingHours }` |
| `salesos.sla.breached` | Timer expired | `{ dealId, stage, breachedAt }` |

## 6.3 Escalation Events

| Event | Trigger | Payload |
|---|---|---|
| `salesos.escalation.level1` | First SLA breach | `{ dealId, stage, level, escalatedTo }` |
| `salesos.escalation.level2` | Extreme breach or consecutive rejections | `{ dealId, stage, level, reason }` |

---

# 7. Recovery and Compensation

## 7.1 Failed Transition Recovery

When a transition fails (guard blocks, network error, concurrency conflict):

```typescript
interface FailedTransition {
  dealId: string;
  attemptedAction: string;
  fromStage: string;
  failureReason: string;
  failureCode: string;       // GUARD_BLOCKED | NETWORK_ERROR | CONCURRENCY_CONFLICT
  timestamp: string;
  correlationId: string;
}

enum RecoveryStrategy {
  /**
   * Manual: Admin must review and retry. Used for guard failures.
   * The deal remains in its current stage. No automatic retry.
   */
  MANUAL_REVIEW = "manual_review",

  /**
   * Retry: Automatic retry with backoff. Used for transient network errors.
   * Max 3 retries with exponential backoff (1s, 4s, 9s).
   */
  AUTO_RETRY = "auto_retry",

  /**
   * Compensate: Reverse the partial state change. Used when event publication
   * fails after the aggregate was saved.
   */
  COMPENSATE = "compensate",
}

function getRecoveryStrategy(failureCode: string): RecoveryStrategy {
  switch (failureCode) {
    case "GUARD_BLOCKED":
      return RecoveryStrategy.MANUAL_REVIEW;
    case "NETWORK_ERROR":
      return RecoveryStrategy.AUTO_RETRY;
    case "CONCURRENCY_CONFLICT":
      return RecoveryStrategy.MANUAL_REVIEW;
    default:
      return RecoveryStrategy.MANUAL_REVIEW;
  }
}
```

## 7.2 Compensation Matrix

When a transition succeeds (aggregate saved) but downstream publication fails, the compensation strategy depends on the failure point.

| Failure Point | Auto-Retry | Manual Review | Compensate | Impact on Aggregate | Rationale |
|---|---|---|---|---|---|
| Domain Event publication to Event Bus | ✅ Queue retry (max 3, 1s/4s/9s backoff) | ❌ | ❌ | None — aggregate already consistent | Eventual consistency acceptable. Event is important but aggregate state is source of truth. |
| Platform Audit event creation | ✅ Queue retry (max 3) | ❌ | ❌ | None | Audit events are critical for compliance but absence does not affect consistency. |
| SLA timer start | ❌ | ❌ | ❌ | None — timer starts on next health check | SLA timers are monitoring tools, not governance enforcement. |
| Notification delivery | ❌ | ❌ | ❌ | None | Notifications are advisory. Deal state unaffected. |
| Concurrency conflict (version mismatch) | ❌ | ✅ Admin must resolve | ❌ | Rolled back — version not incremented | Conflict means another writer succeeded. Current request must refresh and retry. |
| Guard evaluation failure | ❌ | ✅ Admin can override (but must document) | ❌ | None — transition never applied | Governance requires human judgment for overrides. |
| Repository save failure | ❌ | ✅ | ❌ | None — transaction rolled back | Database error requires investigation before retry. |

## 7.3 Admin Override

For governance-blocked transitions (GUARD_BLOCKED), an ADMIN can override with a documented reason:

```typescript
interface GovernanceOverride {
  dealId: string;
  blockedAction: string;
  overrideReason: string;
  overriddenBy: string;      // ADMIN user ID
  timestamp: string;
  auditEvent: string;        // "salesos.governance.override"
}
```

**Rules:**
- Override creates a mandatory audit event: `salesos.governance.override`
- Override reason is required (min 20 characters)
- Override is logged with the reviewer's identity
- Override does NOT bypass the domain invariants (DI-01 to DI-07 still apply)
- Override is a one-time authorization, not a permanent bypass

---

# 8. Workflow Snapshots

Every transition creates a **WorkflowSnapshot** — a permanent record of the state machine state at the moment of transition. Snapshots are critical for audit, debugging, event replay, and cross-product analysis (AuditOS, Knowledge Graph, Institutional Memory).

## 8.1 Snapshot Schema

```typescript
interface WorkflowSnapshot {
  snapshotId: string;                    // unique ID
  workflowId: string;                    // "deal-management"
  workflowVersion: number;               // version of the workflow definition
  correlationId: string;                 // from the API call (SPEC-01b §1.3)

  // Transition context
  dealId: string;
  action: string;                        // e.g., "submit_for_review", "approve"
  fromStage: string;
  toStage: string;
  actorId: string;

  // Guard results (full pipeline evaluation)
  guardPipeline: GuardPipelineResult;    // all guard evaluations + final result

  // Timing
  transitionRequestedAt: string;         // when the transition was initiated
  transitionCompletedAt: string;         // when the transition was applied
  guardEvaluationDurationMs: number;     // total time for all guard evaluations

  // SLA state at transition
  slaStatus: SLAStatusResponse;          // current SLA status before transition

  // Concurrency
  versionBefore: number;                 // aggregate version before transition
  versionAfter: number;                  // aggregate version after transition

  // Errors (if any)
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}
```

## 8.2 Snapshot Storage

| Property | Value |
|---|---|
| **Storage** | Platform Audit service (same as audit events) |
| **Queryable by** | dealId, correlationId, actorId, time range |
| **Retention** | Same as audit log (platform-defined) |
| **Consumed by** | Audit trail UI, event replay, cross-product analysis |
| **Created** | On every transition attempt (success or failure) |

## 8.3 Snapshot Usage Scenarios

| Scenario | How Snapshot Helps |
|---|---|
| Audit investigation | Full record of every transition attempt with guard results |
| Debugging failed transitions | Guard pipeline results show exactly which guard failed and why |
| Event replay | snapshotId links to the Domain Event published during this transition |
| Cross-product analysis (AuditOS) | AuditOS can read WorkflowSnapshots via Platform Audit service |
| Knowledge Graph | Deal stage history is reconstructed from snapshots |
| SLA compliance reporting | SLA status before every transition is captured |
| Workflow version migration | workflowVersion in snapshot enables multi-version analysis |

## 8.4 Snapshot Creation Timing

```text
Transition Request
    │
    ▼
Guard Pipeline Evaluation
    │
    ├── Success → Snapshot created (includes full guard results)
    │              │
    │              ▼
    │           Aggregate Updated → Event Published → Done
    │
    └── Failure → Snapshot created (includes which guard failed, why)
                   │
                   ▼
                Transition Rejected → Error Returned
```

---

# 9. Specification Decisions

| ID | Decision | Rationale | Alternatives | Affected Sections |
|---|---|---|---|---|---|
| SD-001 | State machine in Platform Engine | Enables future config without code changes | Hardcoded: faster initially, inflexible long-term | §1 (State Machine) |
| SD-002 | Evidence gates in domain layer | Keeps evidence logic in domain, not workflow engine | Engine checks evidence: couples engine to SalesOS | §2 (Evidence Gates) |
| SD-003 | SLA policies instead of hardcoded durations | Enables customer-segment-specific SLA without code changes | Fixed durations: simpler but inflexible | §4 (SLA Policy Model) |
| SD-004 | Escalation notifies, never auto-transitions | Human decision for governance-sensitive operations | Auto-return: risky without human judgment | §5 (Escalation Rules) |
| SD-005 | Recovery is manual for guard failures | Governance-first approach | Auto-retry: could bypass governance | §7 (Recovery/Compensation) |
| SD-006 | Event publication failure does NOT roll back the aggregate | Aggregate state is source of truth; events are secondary | Roll back: complex, risks data loss | §7.2 (Compensation Matrix) |
| SD-007 | Guard execution is ordered, fail-fast, deterministic | Ensures consistent behavior across all transitions | Parallel evaluation: non-deterministic, harder to debug | §2.1 (Guard Execution Model) |
| SD-008 | Workflow has its own version (workflowVersion) | Enables dual-version support during upgrades | Sharing eventVersion: conflates event schema with workflow structure | §1.1 (Workflow Definition) |
| SD-009 | WorkflowSnapshot created on every transition attempt | Permanent record for audit, replay, cross-product analysis | Log-only: loses structured data for automated consumers | §8 (Workflow Snapshots) |
| SD-010 | SLA policy is configurable per customer segment | Enables enterprise/SMB/government differentiation without code | One-size-fits-all: forces same SLA for all customers | §4.1 (SLA Policy Model) |

---

# 10. Traceability

| SPEC-01c Element | PRD-01 Reference | SPEC-01a Reference | SPEC-01b Reference | Blueprint Reference |
|---|---|---|---|---|
| Stage definitions | §8 (Workflow) | §2 (Stage VO) | — | §7.4 (State Machines) |
| Transition definitions | §6 FR-03, §8 | §1 (Deal) | §2.2 (transitionDealAction) | §7.4 |
| Workflow versioning | — | §3 (eventVersion pattern) | §7 (API Versioning) | — |
| Guard execution model | §7 (DR-01 to DR-09) | §1.3 (Invariants), §4 (Domain errors) | §1.1 (Error mapping) | §7.4 |
| Transition guards | §7 DR-01 to DR-09 | §1.3 (Invariants) | — | §7.4 |
| Evidence gates | §9 | §5 (EvidenceGateService) | §2.6 (linkEvidenceAction) | §7.4 |
| SLA policy model | §8 (SLA Rules) | — | — | — |
| Escalation rules | — | — | — | — |
| Recovery/compensation | — | §4 (Domain errors) | §5 (Transaction Boundary) | — |
| Compensation matrix | — | §4 (Domain errors) | §5 (Transaction Boundary) | — |
| Workflow snapshots | — | — | §1.3 (Correlation Context) | — |
| Workflow events | §11 (Published Events) | §3 (Domain Events) | §3 (Event Publication) | §11.2 |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Workflow Specification
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN), `SPEC-01b_API_Specification.md` v1.0 (FROZEN)
- **Next:** SPEC-01d (UX Specification), SPEC-01e (Test Specification)
- **Changes from v0.1:** Added Workflow Definition with workflowVersion and versioning policy (§1.1), Guard Execution Model with ordered fail-fast pipeline (§2.1), SLA Policy Model with configurable customer-segment policies (§4.1), Compensation Matrix with 7 failure scenarios (§7.2), Workflow Snapshots with full schema and 8 usage scenarios (§8). Specification Decisions expanded from 6 to 10. Traceability updated.
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. Serves as Reference Workflow Specification for all future AQLIYA product specifications.
- **Next:** SPEC-01d (UX Specification).
- **ADR notes for future:** (1) Consider Transactional Outbox pattern for enterprise production deployments. (2) Process Manager / Saga pattern may be needed when workflows span products (Deal → Proposal → Contract → Invoice). (3) Consider a unified Policy Engine when SLA, Approval, Risk, and Compliance policies proliferate across capabilities.
