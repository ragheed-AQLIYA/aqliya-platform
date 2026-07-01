# Knowledge Foundation — Enterprise Operations (Phase 29)

**Program:** Phase 29 — Enterprise Operations  
**Product:** Knowledge Foundation (Governed Knowledge Release System)  
**ADR:** ADR-028 CLOSED · L5 Pilot Ready  
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## Document Index

| Priority | Document | Status |
| -------- | -------- | ------ |
| **P0** | [Release Approval SOP](./RELEASE_APPROVAL_SOP.md) | ✅ Active |
| **P0** | [Rollback SOP](./ROLLBACK_SOP.md) | ✅ Active |
| **P1** | [Evidence Retention Policy](./EVIDENCE_RETENTION_POLICY.md) | ✅ Active |
| **P1** | [RELEASED+FAILED Recovery Runbook](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) | ✅ Active |
| **P1** | [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md) | ✅ Active (script — not yet executed) |
| **P2** | [Pilot Governance Runbook](./PILOT_GOVERNANCE_RUNBOOK.md) | ✅ Active |
| **P2** | [Monitoring & Incident Response](./MONITORING_AND_INCIDENT_RESPONSE.md) | ✅ Active |
| **P2** | [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md) | ✅ Active |
| **Exit** | [Tabletop Execution Record](./TABLETOP_EXECUTION_RECORD.md) | 🔄 Fill before exercise |
| **Exit** | [Tabletop Smoke Validation](./TABLETOP_SMOKE_VALIDATION.md) | ✅ Active |
| **Exit** | [After Action Report](./TABLETOP_AFTER_ACTION_REPORT.md) | 📋 Template |
| **Exit** | [Pilot Go/No-Go Decision](./PILOT_GO_NO_GO_DECISION.md) | 📋 Template |

**Phase 29 P0:** ✅ COMPLETE · **P1:** ✅ COMPLETE · **P2:** ✅ COMPLETE (2026-06-21)

---

## Phase 29 Status

```text
Phase 29 Documentation:     COMPLETE
Tabletop Exit Gate:         IN PROGRESS (execution phase)
Operational Readiness:      PENDING — verified only after Tabletop PASS
```

### Exit gate sequence

| Step | Document |
| ---- | -------- |
| 1 | [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md) |
| 2 | [Tabletop Execution Record](./TABLETOP_EXECUTION_RECORD.md) |
| 3 | [Tabletop Smoke Validation](./TABLETOP_SMOKE_VALIDATION.md) |
| 4 | [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md) |
| 5 | [After Action Report](./TABLETOP_AFTER_ACTION_REPORT.md) |
| 6 | [Pilot Go/No-Go Decision](./PILOT_GO_NO_GO_DECISION.md) |

Guide: `docs/deliverables/PHASE_29_TABLETOP_EXIT_GATE.md`

---

## Operational Risk Coverage (R-05–R-08)

| ID | Risk | Operational closure |
| -- | ---- | ------------------- |
| R-05 | Trust-chain fork when ACTIVE has no COMPLETE release | Monitoring §3.2 orphan query + Pilot Runbook |
| R-06 | RELEASED + `artifactStatus: FAILED` | Recovery runbook |
| R-07 | activate/rollback not transactional | Rollback SOP + Monitoring post-incident |
| R-08 | Rollback input fields | Rollback SOP §7 (reason required) |

---

## Governed Chain (reference)

```text
Knowledge Mining → Human Promotion → Explicit Binding
    → Version Draft → Approval → Release Package
    → Integrity Verification → Activation → Governed Rollback
```

**Invariant (post Phase 28.4 hotfix):** No known code path reaches `ACTIVE` without `verifyReleaseIntegrity()`.

---

## Workspace Routes

| Route | Purpose |
| ----- | ------- |
| `/knowledge-foundation` | Dashboard, KPIs, version list |
| `/knowledge-foundation/new` | Create version + bind candidates (OPERATOR) |
| `/knowledge-foundation/[id]` | Detail, readiness, integrity, lifecycle actions |
| `/knowledge-foundation/diff` | Version comparison |
| `/knowledge-foundation/history` | Platform audit log (`productKey: knowledge-foundation`) |
| `/knowledge-review` | Mining candidate review / promotion |

---

## Roles (summary)

| Action | Minimum role |
| ------ | ------------- |
| Create version, bind, release | OPERATOR or ADMIN |
| Approve, activate, rollback, deprecate | ADMIN |
| View ACTIVE version | VIEWER+ |
| View DRAFT/APPROVED detail | OPERATOR+ |

---

## Exit Gate — Tabletop Exercise

**Prerequisite:** Complete [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md)

**Then run:** [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md) with non-developer participants using documents only.

**Pilot consolidation:** [Pilot Governance Runbook](./PILOT_GOVERNANCE_RUNBOOK.md)

---

## Related Evidence

- `docs/deliverables/PHASE_29_P0_GOVERNANCE_SOPS.md`
- `docs/deliverables/PHASE_29_P1_ENTERPRISE_OPERATIONS.md`
- `docs/deliverables/PHASE_29_P2_ENTERPRISE_OPERATIONS.md`
- `docs/deliverables/PHASE_29_TABLETOP_EXIT_GATE.md`
- `docs/deliverables/PHASE_28_FINAL_HOTFIX_REPORT.md`
- `docs/architecture/adr/ADR-028-KNOWLEDGE-FOUNDATION-BRIDGE.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md` — `/knowledge-foundation/*`
- `docs/operations/data-retention-policy.md` — parent retention policy
