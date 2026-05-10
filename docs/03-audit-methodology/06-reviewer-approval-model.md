# Reviewer Approval Model

## Purpose

This document defines the approval model for reviewer actions within AuditOS. Every finding, recommendation, and publication requires appropriate approval before advancing through the workflow.

## Approval Authority Levels

| Level | Role | Can Approve |
|-------|------|-------------|
| Level 1 | Operator | Cannot approve — data entry only |
| Level 2 | Reviewer | Observations, evidence verification, low-severity findings |
| Level 3 | Manager | Medium-severity findings, recommendations |
| Level 4 | Partner | Critical findings, escalations, publication |

## Approval Requirements by Item Type

### Evidence Verification

| Evidence Type | Required Approver |
|---------------|-------------------|
| Standard supporting document | Reviewer |
| Complex or judgmental evidence | Manager |
| Evidence with qualification | Manager |

### Findings

| Severity | Required Approver |
|----------|-------------------|
| Observation | Reviewer |
| Issue | Manager |
| Finding | Manager |
| Critical Finding | Partner |

### Recommendations

| Recommendation Type | Required Approver |
|--------------------|-------------------|
| Standard adjustment | Manager |
| Complex adjustment | Partner |
| Disclosure recommendation | Manager |
| Classification correction | Manager |

### Publication

| Publication Type | Required Approver |
|-----------------|-------------------|
| Draft financial statements | Manager |
| Publication package | Partner |

## Approval Workflow

```txt
1. Item reaches review-ready state
2. System routes to appropriate approver based on item type and severity
3. Approver reviews item with full context:
   - Supporting evidence
   - Previous review history
   - Related findings
   - AI contribution metadata
4. Approver takes one of:
   - Accept (approve as-is)
   - Modify (edit and approve)
   - Reject (with mandatory rationale)
   - Escalate (send to higher approver)
5. Action is recorded as attributable governance event
6. Item advances to next workflow state or returns for revision
```

## Escalation Path

```txt
Operator → Reviewer → Manager → Partner
```

An item may be escalated at any stage:

| Escalation Reason | Example |
|-------------------|---------|
| Exceeds current approver's authority | Reviewer escalates to Manager |
| Requires specialized expertise | Reviewer escalates to Partner |
| Disagreement or conflict | Reviewer escalates unresolved issue |
| Policy requirement | Mandatory escalation for critical items |

## Approval Blocking Rules

| Condition | Action |
|-----------|--------|
| Missing required evidence | Block approval — evidence must be provided |
| Unresolved critical finding | Block publication — all critical findings must be addressed |
| Missing required approver | Block — route to correct approver |
| Previous rejection without changes | Block — changes must be made before resubmission |
| Insufficient review time | Flag — minimum review period not yet elapsed |

## Approval Record

Every approval action produces:

```txt
Approval Record
  Item:         Finding F-2026-0042
  Action:       Accepted
  Approver:     Senior Reviewer (ID: SR-003)
  Timestamp:    2026-05-08 14:30:00
  Rationale:    Evidence sufficient, classification correct
  Previous:     Draft → Reviewed → Approved
  Next:         Ready for Recommendation
```
