# Human Review Mandatory Controls

## Purpose

Defines all mandatory human review control points within AQLIYA governed workflows. These controls are derived from Part 10 (Human + AI Operating Model), Part 15 (Responsible Intelligence Doctrine), and Part 07 (Workflow Intelligence Theory). Every control point is architecturally enforced — not procedurally recommended.

## Doctrine Foundation

| Source | Core Requirement |
|--------|------------------|
| Part 10 §2 | Human decision authority is non-negotiable for regulated and liability-bearing outcomes. |
| Part 10 §6 | Human override is structurally easy, not procedurally difficult. |
| Part 15 §3 | Professional liability awareness embedded in system behavior. |
| Part 15 §6 | Every intelligence output must be challengeable by a qualified professional. |
| Part 07 §4 | Human decision joints are architecturally unskippable; AI never occupies a decision joint. |
| Part 07 §6 | Evidence-gated transitions: no workflow transition without meeting evidentiary gates. |

---

## Mandatory Control Points

### 1. Evidence Admission

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which candidate evidence is promoted from raw data into the governed evidence store |
| **Required Review** | Reviewer must verify source provenance, data completeness, and contextual relevance before evidence achieves trusted status |
| **Authority Level** | Reviewer (engagement-assigned) with scope-limited evidence admission authority |
| **Doctrine Source** | Part 10 §5, Part 09 §6, Part 09 §1, Part 08 §9 |

### 2. AI Recommendation Acceptance

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which an AI-generated suggestion, finding draft, or classification is accepted into the workflow |
| **Required Review** | Reviewer must evaluate evidence backing, confidence calibration, and limitation disclosure; explicit accept, modify, or reject decision recorded |
| **Authority Level** | Reviewer with domain scope matching the recommendation subject matter |
| **Doctrine Source** | Part 10 §4, Part 10 §6, Part 10 §10, Part 15 §6, Part 15 §11 |

### 3. Finding Elevation

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a finding is elevated from draft to formal review state |
| **Required Review** | Reviewer must confirm evidence sufficiency, finding accuracy, risk classification, and materiality assessment |
| **Authority Level** | Senior Reviewer or Engagement Lead depending on materiality threshold |
| **Doctrine Source** | Part 07 §5, Part 07 §7, Part 05 §06, Part 05 §09 |

### 4. Escalation Decision

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a finding, risk, or exception exceeds the current authority scope and must be escalated |
| **Required Review** | Receiving authority must evaluate the escalation context, prior decisions, evidence chain, and proposed next action |
| **Authority Level** | Engagement Lead, Partner, or designated escalation authority based on severity |
| **Doctrine Source** | Part 07 §9, Part 08 §6, Part 15 §9 |

### 5. Approval Sign-Off

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Final authorization point before a decision, finding, or report enters a locked or published state |
| **Required Review** | Approver must verify all evidence gates passed, all prior reviews completed, outstanding issues resolved, and governance rules satisfied |
| **Authority Level** | Approver with scope authority matching the engagement or decision type; must be distinct from reviewer (separation of duties) |
| **Doctrine Source** | Part 10 §2, Part 10 §6, Part 08 §7, Part 07 §8 |

### 6. Override Execution

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a human overrides an AI recommendation, evidence gate, or governance rule |
| **Required Review** | Override must be accompanied by attributable rationale, authority scope confirmation, and automatic second-review assignment |
| **Authority Level** | Actor must hold override authority explicitly granted for the scope; override without authority triggers governance alert |
| **Doctrine Source** | Part 10 §6, Part 08 §6, Part 15 §3, Part 07 §4 |

### 7. Publication Release

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a report, finding set, or decision output is released to external stakeholders |
| **Required Review** | Reviewer must confirm evidence manifest completeness, approval chain integrity, limitation disclosures present, and governance compliance |
| **Authority Level** | Partner or delegated signatory with external publication authority |
| **Doctrine Source** | Part 05 §11, Part 08 §5, Part 07 §10, Part 15 §7 |

### 8. Governance Exception

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a workflow, decision, or action deviates from standard governance rules |
| **Required Review** | Exception must be documented with full context: what rule was deviated from, why, what evidence supports the deviation, and who authorized it |
| **Authority Level** | Governance Lead or designated authority above the standard rule scope |
| **Doctrine Source** | Part 08 §6, Part 08 §7, Part 15 §1 |

### 9. Quality Review

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Post-completion review of a sample of decisions, findings, or engagements for quality and consistency |
| **Required Review** | Independent reviewer examines decision chain, evidence sufficiency, governance compliance, and professional judgment quality |
| **Authority Level** | Quality Reviewer independent of the original engagement team |
| **Doctrine Source** | Part 05 §13, Part 08 §1, Part 08 §6 |

### 10. Post-Publication Reversal

| Dimension | Definition |
|-----------|------------|
| **Control Point** | Point at which a published decision, finding, or report is reversed or amended |
| **Required Review** | Reversal must be reviewed with full evidence chain reassessment; original and new decisions are both preserved with rationale for change |
| **Authority Level** | Authority at or above the level of the original approver |
| **Doctrine Source** | Part 15 §10, Part 10 §6, Part 08 §5, Part 07 §3 |

---

## Authority Level Hierarchy

| Level | Scope | Examples |
|-------|-------|----------|
| **Reviewer** | Single engagement or account scope | Evidence admission, AI recommendation acceptance, finding draft review |
| **Senior Reviewer** | Broader engagement scope; may override reviewer decisions | Finding elevation, exception handling within defined materiality |
| **Approver** | Engagement-level final authority; distinct from reviewer | Approval sign-off, publication release within engagement |
| **Engagement Lead** | Full engagement authority including escalation decisions | Escalation decisions, materiality determination, risk acceptance |
| **Partner** | Firm-level authority; external representation | Publication release to client/regulator, governance exception approval |
| **Governance Lead** | Cross-engagement governance authority | Governance exception authorization, quality review oversight, boundary configuration |

---

## Architectural Enforcement

| Control | Enforcement Mechanism |
|---------|----------------------|
| Mandatory review at control point | Workflow state machine requires human action at defined decision joints; AI cannot execute these transitions |
| Separation of duties | Workflow engine prevents same user from appearing as reviewer and approver on the same object |
| Evidence gate precondition | Control points are preceded by evidence gates; transition is blocked if evidence conditions are not met |
| Override governance | Override creates a governance event with second-review trigger; override rationale is a structured evidence object |
| Authority scope check | Workflow engine validates actor authority against the decision scope before allowing transition |
| Immutable audit trail | Every control point action is recorded with actor identity, timestamp, decision rationale, and evidence state |

---

## Doctrine Sources

- Part 10 — Human + AI Operating Model (10.01 Human + AI Thesis, 10.02 Human-In-The-Loop Theory, 10.03 Controlled Autonomy Theory, 10.04 AI Assistance Theory, 10.05 Reviewer Trust Theory, 10.06 Human Override Theory, 10.07 AI Accountability Theory, 10.08 AI Reliability Theory)
- Part 15 — Responsible Intelligence Doctrine (15.01 Responsible Intelligence Doctrine, 15.02 AI Responsibility Doctrine, 15.03 Human Accountability Doctrine, 15.04 No-Autonomous-Audit Decision Rule, 15.06 Sensitive Financial Data Doctrine, 15.07 Explainable Limitation Disclosure, 15.08 Professional Judgment Preservation Theory, 15.09 Auditor Responsibility Boundary, 15.10 Responsible Automation Philosophy, 15.11 AI Recommendation Boundary)
- Part 07 — Workflow Intelligence (07.01 Workflow Intelligence Theory, 07.03 Workflow State Theory, 07.04 Human-In-The-Loop Workflow Theory, 07.05 Findings Lifecycle Framework, 07.06 Evidence Lifecycle Framework, 07.07 Review Lifecycle Framework, 07.08 Approval Lifecycle Framework, 07.09 Escalation Framework, 07.10 Publication Framework, 07.11 Workflow Traceability Theory)
- Part 08 — Governance & Trust (08.01 Governance and Trust Thesis, 08.03 Auditability Doctrine, 08.04 Explainability Doctrine, 08.05 Traceability Doctrine, 08.06 Accountability Doctrine, 08.07 Approval Governance Doctrine, 08.09 Evidence Governance Doctrine, 08.10 AI Governance Doctrine)
- Part 05 — Audit Intelligence (05.01 AuditOS Thesis, 05.05 Audit Engagement Model, 05.06 Findings Intelligence Theory, 05.07 Evidence Intelligence Theory, 05.09 Audit Risk Scoring Theory, 05.11 Audit Report Intelligence, 05.12 Audit Review Lifecycle, 05.13 Audit Quality Assurance Model, 05.14 Audit Governance Model)

---

*These control points are structural requirements. No product configuration, workflow template, or deployment setting may remove or bypass a mandatory human review control point without a formal governance exception.*
