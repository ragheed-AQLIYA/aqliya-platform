# Professional Accountability Framework

## Purpose

Defines the accountability structure for all actors within AQLIYA governed workflows. Derived from Part 10 (Human + AI Operating Model) and Part 15 (Responsible Intelligence Doctrine). Every action in the system traces to an accountable human or a bounded governed control.

## Doctrine Foundation

| Source | Core Doctrine |
|--------|---------------|
| Part 10 §2 | AI assists. Humans decide. Human decision authority is non-negotiable for regulated and liability-bearing outcomes. |
| Part 10 §6 | Human override is structurally easy, not procedurally difficult. |
| Part 10 §7 | Every material decision traces to a clearly accountable human actor. |
| Part 15 §2 | Responsibility for decisions rests with human professionals, not systems. |
| Part 15 §6 | Intelligence must assist and inform, never decide or conclude autonomously. |
| Part 15 §3 | Professional liability awareness must be embedded in system behavior, not just policy. |

---

## Accountability Matrix

### 1. Reviewer

| Dimension | Definition |
|-----------|------------|
| **Role** | Professional who examines evidence, evaluates findings, and makes determinations within their assigned engagement scope |
| **Accountability** | Accuracy and sufficiency of review; appropriate application of professional judgment; documented rationale for accept/reject/override decisions |
| **Doctrine Source** | Part 10 §4, Part 10 §5, Part 10 §6, Part 15 §8, Part 07 §7, Part 05 §12 |
| **Evidence Requirement** | Every review decision must reference specific evidence items; override rationale must be documented as a structured evidence object; AI recommendations reviewed must be logged with disposition (accepted, modified, rejected) and reasoning |

### 2. Approver

| Dimension | Definition |
|-----------|------------|
| **Role** | Authorized human who grants final sign-off on findings, decisions, or report outputs |
| **Accountability** | Final responsibility for the completeness, accuracy, and defensibility of approved outputs; confirmation that all required review steps completed |
| **Doctrine Source** | Part 10 §2, Part 10 §6, Part 15 §3, Part 08 §7, Part 07 §8 |
| **Evidence Requirement** | Approval must be preceded by review of all evidence dependencies; system blocks approval if evidence gates are not satisfied; approver identity, timestamp, and attestation scope are recorded immutably |

### 3. Engagement Lead / Partner

| Dimension | Definition |
|-----------|------------|
| **Role** | Senior professional with overarching authority for an engagement, including escalation decisions and final report issuance |
| **Accountability** | Engagement-level judgment on materiality, risk acceptance, scope adequacy, and report defensibility; oversight of reviewer and approver actions |
| **Doctrine Source** | Part 10 §2, Part 15 §8, Part 15 §9, Part 08 §7, Part 05 §05 |
| **Evidence Requirement** | Engagement-level decisions (materiality thresholds, scope changes, risk acceptance) must be recorded with evidence of basis; escalation reviews must reference the decision chain that triggered them |

### 4. AI System (Bounded Accountability)

| Dimension | Definition |
|-----------|------------|
| **Role** | Governed intelligence component operating within defined assistance boundaries |
| **Accountability** | Output quality, evidence linkage, confidence calibration, and limitation disclosure within its assigned scope; the system is never accountable for decisions — only for the quality and transparency of its assistance |
| **Doctrine Source** | Part 10 §4, Part 10 §7, Part 10 §10, Part 15 §2, Part 15 §5 |
| **Evidence Requirement** | Every AI output carries evidence references, reasoning trace, confidence bounds, model version, and limitation disclosure; outputs without these are discarded at the governance layer |

### 5. System Administrator

| Dimension | Definition |
|-----------|------------|
| **Role** | Human who configures workflow templates, role definitions, evidence thresholds, and governance rules within tenant scope |
| **Accountability** | Configuration integrity; separation of duties (admin cannot approve in same workflow); adherence to governance boundary configuration |
| **Doctrine Source** | Part 08 §8, Part 08 §6, Part 15 §10, Part 07 §1 |
| **Evidence Requirement** | All configuration changes are logged as governance events with actor identity, timestamp, before/after state, and change rationale; unauthorized boundary changes trigger security alert and require admin re-approval |

### 6. Quality Reviewer / Second Reviewer

| Dimension | Definition |
|-----------|------------|
| **Role** | Independent reviewer who evaluates a sample of completed decisions for quality, consistency, and governance compliance |
| **Accountability** | Objectivity of quality assessment; identification of patterns indicating judgment erosion, boundary drift, or governance bypass |
| **Doctrine Source** | Part 05 §13, Part 08 §6, Part 15 §1 |
| **Evidence Requirement** | Quality review must reference the original decision chain; findings must be traceable to specific evidence, review actions, and approval events |

---

## Accountability Enforcement

| Mechanism | Enforcement |
|-----------|-------------|
| Separation of duties | No single actor may create and approve the same decision; workflow engine prevents same user ID from appearing as creator and approver |
| Attribution | Every material action recorded with authenticated actor identity, timestamp, rationale, and evidence references |
| Non-repudiation | Immutable audit log preserves action history; signature and attestation events require cryptographic or equivalent identity binding |
| Escalation path | Decisions exceeding authority scope are structurally routed to the next authority tier; the workflow state machine prevents bypass |
| Override governance | Override of any governance rule, evidence gate, or AI recommendation must be recorded with rationale, authority level, and second-review trigger |
| Accountability persistence | Accountability records survive personnel changes; decision owner is tracked per-object, not per-role |

---

## Doctrine Sources

- Part 10 — Human + AI Operating Model (10.01 Human + AI Thesis, 10.04 AI Assistance Theory, 10.05 Reviewer Trust Theory, 10.06 Human Override Theory, 10.07 AI Accountability Theory)
- Part 15 — Responsible Intelligence Doctrine (15.01 Responsible Intelligence Doctrine, 15.02 AI Responsibility Doctrine, 15.03 Human Accountability Doctrine, 15.08 Professional Judgment Preservation Theory, 15.09 Auditor Responsibility Boundary)
- Part 08 — Governance & Trust (08.01 Governance and Trust Thesis, 08.06 Accountability Doctrine, 08.07 Approval Governance Doctrine, 08.08 Access Governance Doctrine)
- Part 07 — Workflow Intelligence (07.01 Workflow Intelligence Theory, 07.07 Review Lifecycle Framework, 07.08 Approval Lifecycle Framework, 07.09 Escalation Framework)
- Part 05 — Audit Intelligence (05.01 AuditOS Thesis, 05.05 Audit Engagement Model, 05.12 Audit Review Lifecycle, 05.13 Audit Quality Assurance Model)

---

*This framework is derived from approved doctrine. No product implementation may reduce accountability requirements without a formal doctrine amendment.*
