# PRD-01: Engagement Management — AuditOS vNext

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SalesOS PRD-01 (reused)
> **Template Reuse Target:** ≥90%

---

## 1. Purpose

Engagement Management is the core operational capability of AuditOS vNext. It enables audit firms to plan, execute, review, and report on audit engagements through a governed workflow with evidence requirements, AI-assisted decision support, regulatory compliance, and full audit trail.

It is the **foundational domain** — Findings, Workpapers, Risk & Materiality, and Reporting all depend on Engagement data.

---

## 2. Scope

### In Scope

| Area | Description |
|---|---|
| Engagement CRUD | Create, plan, execute, review, close engagements |
| Stage Management | 9-stage lifecycle with non-linear review loop |
| Evidence Gates | Required evidence before stage transitions |
| Review Workflow | Multi-level (senior → manager → partner) |
| Domain Events | Engagement lifecycle events |
| Audit Trail | All mutations audited via Platform Audit |
| Role-Based Access | Engagement-scoped permissions |

### Out of Scope

| Area | Planned |
|---|---|
| Detailed workpaper management | EPIC-04 (Wave 2) |
| Findings management | EPIC-03 (Wave 2) |
| Materiality computation | EPIC-05 (Wave 3) |
| Report generation | EPIC-06 (Wave 3) |

---

## 3. Business Outcomes

| Outcome | Target |
|---|---|
| Engagement setup time | ≤ 1 day from client acceptance |
| Review completion rate | ≥ 90% within SLA |
| Evidence gate compliance | ≥ 95% |
| Approval-to-sign-off conversion | ≥ 85% |
| Full audit traceability | 100% |

---

## 4. Product Capability Definition

| Field | Value |
|---|---|
| **Product Capability** | Engagement Management |
| **Epic** | EPIC-01 |
| **Blueprint Sections** | §4, §5, §6 |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2, 5 |

---

## 5. Actors

| Actor | Role | Permissions Required |
|---|---|---|
| **Auditor** | Executes audit procedures, documents workpapers | `auditos:engagement.update` |
| **Review Manager** | Reviews workpapers, identifies findings | `auditos:engagement.review` |
| **Partner** | Approves engagements, signs off on opinion | `auditos:engagement.approve` |
| **Quality Reviewer** | Independent quality review before sign-off | `auditos:engagement.approve` |
| **Audit Admin** | Configures engagement templates, manages users | `auditos:engagement.admin` |

---

## 6. Functional Requirements

### FR-01: Create Engagement

| Field | Required | Type |
|---|---|---|
| `clientId` | ✅ | string |
| `period` | ✅ | string (e.g., "FY2026") |
| `team` | ✅ | EngagementTeam |
| `materiality` | ❌ | Materiality (post-planning) |

### FR-02: Transition Stage

9 stages with guards. Non-linear loop from Review back to Fieldwork.

### FR-03: Assign Team

| Field | Required | Type |
|---|---|---|
| `engagementId` | ✅ | string |
| `auditorId` | ✅ | string |
| `role` | ✅ | "field" \| "reviewer" \| "manager" \| "partner" |

### FR-04: Link Evidence

Links evidence from Platform Evidence Network to engagement stage.

### FR-05: List Engagements

Filterable by status, client, period, team member.

### FR-06: Get Engagement Detail

Full engagement with team, stage, evidence, review history.

---

## 7. Domain Rules

| DR-01 | Engagement belongs to exactly one Client |
|---|---|
| DR-02 | Engagement period is required |
| DR-03 | Evidence is required before entering Review stage |
| DR-04 | Reviewer cannot be the same as the workpaper author |
| DR-05 | Partner sign-off requires Quality Review completion |
| DR-06 | Closed engagements are immutable |
| DR-07 | All mutations are audited |
| DR-08 | Tenant isolation enforced server-side |

---

## 8. Workflow

**Stages:** Proposal → Acceptance → Planning → Risk Assessment → Fieldwork → Review → Reporting → Sign-off → Archival

**Review loop:** Fieldwork → Review → (if findings → back to Fieldwork) → Reporting

| Transition | Guard |
|---|---|
| Proposal → Acceptance | Partner approval, independence check |
| Acceptance → Planning | Manager assigned |
| Planning → Risk Assessment | Materiality set, program defined |
| Risk Assessment → Fieldwork | Risk documented |
| Fieldwork → Review | Evidence linked, workpapers complete |
| Review → Reporting | Review signed off, findings resolved |
| Reporting → Sign-off | Quality review completed |
| Sign-off → Archival | Regulatory retention set |

---

## 9. Evidence Requirements

| Evidence Type | Required For |
|---|---|
| `independence_check` | Acceptance |
| `planning_memo` | Planning |
| `risk_assessment` | Risk Assessment |
| `workpaper_complete` | Review |
| `review_signoff` | Reporting |
| `quality_review` | Sign-off |

---

## 10. AI Touchpoints

| Feature | In PRD-01? | Governance |
|---|---|---|
| Risk scoring | ❌ (Wave 3) | — |
| Materiality suggestion | ❌ (Wave 3) | — |
| Finding assist | ❌ (Wave 3) | — |

**AI intentionally excluded from PRD-01.** Core workflow must work without AI.

---

## 11. Platform Dependencies

| Capability | Contract |
|---|---|
| `platform.auth` | AuthGuard |
| `platform.workflow` | WorkflowEngine |
| `platform.evidence` | EvidenceService |
| `platform.event-bus` | EventBus |

---

## 12. APIs

| Action | Permission |
|---|---|
| `createEngagementAction` | `auditos:engagement.create` |
| `transitionEngagementAction` | `auditos:engagement.update` |
| `assignTeamAction` | `auditos:engagement.update` |
| `linkEvidenceAction` | `auditos:engagement.update` |
| `listEngagementsAction` | `auditos:engagement.view` |
| `getEngagementAction` | `auditos:engagement.view` |
| `archiveEngagementAction` | `auditos:engagement.admin` |

---

## 13. Acceptance Criteria

| AC-01 | Auditor creates engagement with required fields |
|---|---|
| AC-02 | Engagement transitions through all 9 stages |
| AC-03 | Review loop: Review → Fieldwork → re-Review |
| AC-04 | Evidence gate blocks transition if missing |
| AC-05 | Partner sign-off requires quality review |
| AC-06 | All mutations create audit events |
| AC-07 | Tenant isolation enforced |
| AC-08 | Closed engagements are immutable |

---

## 14. Test Scenarios

1. **Happy path:** Create → Plan → Assess → Fieldwork → Review (no findings) → Report → Sign-off → Archive
2. **Review loop:** Fieldwork → Review → (findings found) → back to Fieldwork → re-Review → Report
3. **Governance block:** Missing evidence blocks transition to Review
4. **Tenant isolation:** Cross-org access denied
5. **Audit trail:** All mutations visible

---

## 15. Traceability

| Element | Blueprint | ADR | Constitution |
|---|---|---|---|
| Engagement lifecycle | §6 | ADR-001, ADR-015 | 1, 2 |
| Evidence gates | §8 | ADR-001 | 5 |
| Platform consumption | §5 | ADR-001 | 1, 2 |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.1 | **Template:** SalesOS PRD-01
- **Status:** Draft — ready for review
