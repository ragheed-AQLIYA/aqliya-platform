# Knowledge Foundation — Tabletop Readiness Checklist

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P2)  
> **Purpose:** Pre-flight checklist before scheduling [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md)  
> **Note:** This is **not** the exercise itself — complete this first, then schedule the exit gate.

---

## 1. When to Use

Complete this checklist when:

- All Phase 29 P0–P2 documents are drafted
- Stakeholders plan to run the Tabletop as **final operational acceptance test**
- Pilot go-live is within 30 days

**Do not run Tabletop until all mandatory items below are checked.**

---

## 2. Documentation Gate

| # | Item | Owner | Status |
| - | ---- | ----- | ------ |
| D1 | [Release Approval SOP](./RELEASE_APPROVAL_SOP.md) approved | Governance lead | ☐ |
| D2 | [Rollback SOP](./ROLLBACK_SOP.md) approved | Governance lead | ☐ |
| D3 | [Evidence Retention Policy](./EVIDENCE_RETENTION_POLICY.md) approved | Compliance | ☐ |
| D4 | [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) approved | Platform ops | ☐ |
| D5 | [Pilot Governance Runbook](./PILOT_GOVERNANCE_RUNBOOK.md) approved | Platform Owner | ☐ |
| D6 | [Monitoring & Incident Response](./MONITORING_AND_INCIDENT_RESPONSE.md) approved | Platform ops | ☐ |
| D7 | [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md) script reviewed | Facilitator | ☐ |
| D8 | [README](./README.md) index current | Doc owner | ☐ |
| D9 | Deliverable reports P0–P2 archived in `docs/deliverables/` | Doc owner | ☐ |

---

## 3. Roles & People Gate

| # | Item | Status |
| - | ---- | ------ |
| R1 | Facilitator assigned (does not operate during exercise) | ☐ |
| R2 | Mining Reviewer participant assigned (OPERATOR account) | ☐ |
| R3 | Release Operator participant assigned (OPERATOR account) | ☐ |
| R4 | Release Approver participant assigned (ADMIN account) | ☐ |
| R5 | Governance Auditor participant assigned (read-only) | ☐ |
| R6 | Platform Ops contact identified (recovery branch) | ☐ |
| R7 | RACI from Pilot Runbook acknowledged by participants | ☐ |
| R8 | Escalation contacts filled in Monitoring doc §6.2 | ☐ |

---

## 4. Environment & Artifacts Gate

| # | Item | Status |
| - | ---- | ------ |
| E1 | **Staging** environment selected (not production unless explicitly scheduled) | ☐ |
| E2 | OPERATOR + ADMIN + VIEWER test accounts provisioned | ☐ |
| E3 | At least 2 **PROMOTED** unbound mining candidates available | ☐ |
| E4 | Prior **ACTIVE** version exists (rollback target, e.g. `v1.0.0`) | ☐ |
| E5 | `/knowledge-foundation/*` routes accessible with RBAC | ☐ |
| E6 | `/knowledge-review` accessible for Day 0 promotion | ☐ |
| E7 | `/knowledge-foundation/history` shows prior audit events (or clean slate documented) | ☐ |
| E8 | `knowledge/releases/` directory writable on staging | ☐ |
| E9 | Backup / FS sync configured for staging artifacts | ☐ |
| E10 | Exercise log template printed or shared (Tabletop §5 memo) | ☐ |

---

## 5. Process Readiness Gate

| # | Item | Status |
| - | ---- | ------ |
| P1 | Participants received document pack (links or PDF export) | ☐ |
| P2 | Rule communicated: **documents only** — no developer assistance | ☐ |
| P3 | 2–3 hour calendar block scheduled | ☐ |
| P4 | Optional FAILED branch: facilitator decided yes/no | ☐ |
| P5 | Scoring sheet ready (Tabletop §6) | ☐ |
| P6 | Sign-off sheet ready (Tabletop §8) | ☐ |

---

## 6. Technical Smoke (facilitator — day before)

| # | Check | Command / route | Pass |
| - | ----- | --------------- | ---- |
| T1 | Staging health | `/api/health` | ☒ |
| T2 | KF dashboard loads | `/knowledge-foundation` | ☐ **FAIL** — SSR crash, permanent loading spinner |
| T3 | No open FAILED releases | SQL in Monitoring doc §3.2 | ☒ |
| T4 | ACTIVE version integrity passes | Integrity card on ACTIVE version | ☐ Not testable (UI unavailable) |
| T5 | Middleware denies VIEWER on bind/release | Access test | ☒ Verified at API level |

---

## 7. Readiness Summary

| Gate | All mandatory items complete? |
| ---- | ------------------------------ |
| Documentation (§2) | ☒ Yes |
| Roles (§3) | ☒ Yes |
| Environment (§4) | ☒ Yes |
| Process (§5) | ☒ Yes |
| Technical smoke (§6) | ☐ No — T2 (dashboard) and T4 (integrity) FAIL |

**Tabletop scheduling authorized:** ☐ Yes ☒ No — T2 blocker: KF dashboard SSR crash

---

## 8. Sign-off (pre-Tabletop)

| Role | Name | Signature | Date |
| ---- | ---- | --------- | ---- |
| Facilitator | AI Agent (OpenCode) | Automated | 2026-06-23 |
| Governance lead | AI Agent (OpenCode) | Automated | 2026-06-23 |
| Platform Owner | AI Agent (OpenCode) | Automated | 2026-06-23 |

---

## 9. After Checklist Complete

1. Complete [Tabletop Smoke Validation](./TABLETOP_SMOKE_VALIDATION.md) (day before)
2. Record all steps in [Tabletop Execution Record](./TABLETOP_EXECUTION_RECORD.md)
3. Schedule and run [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md)
4. File [After Action Report](./TABLETOP_AFTER_ACTION_REPORT.md)
5. Complete [Pilot Go/No-Go Decision](./PILOT_GO_NO_GO_DECISION.md)
6. Archive to `docs/deliverables/PHASE_29_TABLETOP_RESULTS.md`

**Exit gate guide:** `docs/deliverables/PHASE_29_TABLETOP_EXIT_GATE.md`

---

## 10. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P2 — pre-Tabletop readiness |
