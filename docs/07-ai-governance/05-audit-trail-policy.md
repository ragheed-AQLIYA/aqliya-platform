# Audit Trail Policy

## Purpose

This document defines the audit trail policy for AuditOS. Every action, decision, and AI output must be recorded in an immutable audit trail.

## Audit Trail Principles

| Principle | Description |
|-----------|-------------|
| Completeness | Every action that affects system state is recorded |
| Immutability | Once recorded, audit events cannot be altered or deleted |
| Attributability | Every event is linked to a specific human actor or system process |
| Timeliness | Events are recorded at the time of occurrence (not batched) |
| Traceability | Events are linked to form a complete chain from source to output |
| Accessibility | Authorized users can query and review the audit trail |

## Events Recorded

### User Actions

| Event Type | Description | Recorded Data |
|------------|-------------|---------------|
| Login | User authenticates to the system | User ID, timestamp, IP, session ID |
| Create | User creates a record (client, engagement, finding, etc.) | User ID, object type, object ID, timestamp |
| Update | User modifies a record | User ID, object type, object ID, fields changed, previous values, new values, timestamp |
| Upload | User uploads a file | User ID, file name, file hash, file type, size, timestamp |
| Delete | User deletes or archives a record | User ID, object type, object ID, timestamp |
| Approve | User approves a workflow item | User ID, item type, item ID, decision (approved/modified/rejected), rationale, timestamp |

### System Events

| Event Type | Description | Recorded Data |
|------------|-------------|---------------|
| AI Generation | AI produces an output (mapping, signal, finding, recommendation) | AI model version, input data hash, output data, confidence, timestamp |
| State Transition | Workflow stage changes | Object type, object ID, previous state, new state, trigger, timestamp |
| Data Import | Data is ingested into the system | Source, file hash, record count, validation result, timestamp |
| Configuration Change | System or governance configuration is modified | Configuration key, previous value, new value, changed by, timestamp |
| Error | System error occurs | Error type, context, timestamp |

### Governance Events

| Event Type | Description | Recorded Data |
|------------|-------------|---------------|
| Governance Rule Change | Governance rule is created, modified, or deleted | Rule ID, previous rule, new rule, changed by, rationale, timestamp |
| Override | A system-enforced rule is overridden | Rule, overridden by, rationale, timestamp |
| Escalation | An item is escalated to higher authority | Item ID, escalated by, escalated to, reason, timestamp |
| Approval | Approval action is taken | Item ID, approver, decision, rationale, timestamp |

## Event Structure

Every audit event has the following structure:

```json
{
  "event_id": "EVT-20260508-00001",
  "event_type": "user_action.approve",
  "timestamp": "2026-05-08T14:30:00Z",
  "actor": {
    "id": "USR-003",
    "name": "Reviewer Name",
    "role": "REVIEWER"
  },
  "target": {
    "type": "finding",
    "id": "F-2026-0042"
  },
  "action": {
    "type": "approve",
    "decision": "approved_with_modification",
    "rationale": "Classification corrected, evidence sufficient"
  },
  "context": {
    "engagement_id": "E-2026-0042",
    "previous_state": "under_review",
    "new_state": "resolved"
  },
  "signature": "hash-of-previous-event+current-data"
}
```

## Audit Trail Storage

| Requirement | Implementation |
|-------------|----------------|
| Storage | Append-only event store |
| Immutability | Cryptographic chaining of events |
| Retention | Full retention for entire engagement lifecycle + regulatory requirement |
| Backup | Regular backup with geographic redundancy |
| Query | Structured query by actor, target, time range, event type |
| Export | Full event log export for regulatory inspection |

## Audit Trail Access

| Role | Access Level |
|------|--------------|
| Partner | Full audit trail access across engagements |
| Manager | Full audit trail access for assigned engagements |
| Reviewer | Event log access for assigned engagements |
| Operator | Limited — can view own actions |
| Client Viewer | No audit trail access |
| Admin | System-level event access (not engagement-level content) |
