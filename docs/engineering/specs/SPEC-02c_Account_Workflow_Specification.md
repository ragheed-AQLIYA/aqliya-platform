# SPEC-02c: Workflow Specification — Account Intelligence

> **Status:** Draft v0.1 | **Template:** SPEC-01c | **Reuse:** ~90% | **Cycle:** 2

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-02a, SPEC-02b |
| **Blocks** | SPEC-02d, SPEC-02e |
| **Consumer** | Workflow Engineering Team |

---

## State Machine (4 stages)

```
Prospect ──qualify──▶ Active ──dormant──▶ Dormant ──reactivate──▶ Active
    │                     │                    │
    └───── archive ───────┴────────────────────┘
                              (admin only)
```

| Transition | From | To | Guard |
|---|---|---|---|
| qualify | Prospect | Active | — |
| dormant | Active | Dormant | Auto: 90 days no activity, or manual |
| reactivate | Dormant | Active | — |
| archive | Any | Archived | Admin only |

---

## Guard Pipeline

Same ordered, fail-fast, deterministic pipeline: Validation → Business → Governance.

| Action | Guards |
|---|---|
| qualify | none |
| dormant | auto_dormancy_trigger OR manual |
| reactivate | none |
| archive | admin_role_check |

---

## SLA

| Stage | SLA | Escalation |
|---|---|---|
| Prospect | 30 days | Notify Account Manager |
| Active | — | No SLA |
| Dormant | 60 days | Notify Admin |

---

## Recovery

Same patterns as SPEC-01c: guard failure prevents transition, event failure does NOT rollback, admin override is audited.

---

## Workflow Snapshots

Every transition creates a snapshot: `{ accountId, fromStage, toStage, action, actorId, timestamp, workflowVersion: 1 }`.

---

## Traceability

| Element | PRD-02 Reference |
|---|---|
| Stages | §8 (Workflow) |
| Guards | §7 |
| SLA | — |

---

## Document Metadata

- **Author:** OpenCode | **Template:** SPEC-01c | **Reuse:** ~90%
- **Version:** 0.1 | **Status:** Draft
