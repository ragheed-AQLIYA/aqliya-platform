# Decision Provenance Framework

## Definition

**Decision provenance** is the traceable chain connecting any AQLIYA decision outcome back through the originating human authority, governance rules, evidence relied upon, and doctrinal principles applied. It establishes *who decided what, under which authority, informed by which evidence, constrained by which rules, and guided by which principles.*

Every output produced by the AQLIYA system — whether an AuditOS finding, a commercial trust claim, or a governance approval — must be traceable to its origin.

## Provenance Chain

```
Decision → Evidence → Principle → Governance Rule → Workflow → Human Responsibility
```

### 1. Decision
The final output or action taken: a recommendation, a published report, a risk flag, or an approval. Every decision is the *terminal node* of a provenance record.

### 2. Evidence
The factual inputs grounding the decision: ledger entries, transaction logs, external confirmations, regulatory filings, detected anomalies. Evidence must be cryptographically verifiable or at minimum timestamped and versioned.

### 3. Principle
The doctrinal principle(s) invoked: Shariah-compliance maxims, fiduciary duty norms, risk-management axioms, or ethical constraints codified in AQLIYA's doctrine base. Each principle must have a canonical identifier.

### 4. Governance Rule
The specific rule from the governance framework that authorizes, constrains, or mandates the decision path. May be derived from:
- AQLIYA internal governance policy
- Jurisdictional regulatory instruments
- Institutional supervisory board mandates
- Product-level rule books (e.g., AuditOS operational boundaries)

### 5. Workflow
The AQLIYA system workflow or pipeline through which the decision was produced. Includes the agent(s) invoked, the sequence of processing steps, the human-in-the-loop checkpoints traversed, and the escalation path if applicable.

### 6. Human Responsibility
The **accountable human** — not the AI agent — who bears ultimate responsibility for the decision. This is a named individual or role with delegated authority. If the human is a board, the board chair is identified. If the human is a reviewer, their identity and timestamp of review are recorded.

## AuditOS Relevance

Every AuditOS finding or recommendation must carry provenance:
- The audit trail from Evidence → Principle → Governance Rule must be mechanically reconstructable.
- AuditOS outputs without provenance are treated as unsubstantiated and must not be published or acted upon.
- Internal and external auditors must be able to re-execute the provenance chain independently (reproducibility requirement).
- Findings must cite the specific governance rule breached or satisfied, the evidence inspected, and the human reviewer who signed off.

## Commercial Relevance

Trust claims made in AQLIYA commercial materials, marketing, or investor communications must be traceable to evidence-backed doctrine:
- A claim such as "AuditOS detects 98% of compliance anomalies" must carry provenance: which evidence corpus, which test methodology, which principle defines "compliance anomaly", and which human approved the claim's publication.
- Commercial provenance records must be archived for the lifetime of the claim plus the applicable statute of limitations for misrepresentation.
- Trust is earned through transparency; provenance is the mechanism of transparency.

## Governance Relevance

Every approval within AQLIYA governance must be attributable:
- Approvals may not be anonymous or purely algorithmic.
- Each approval event must record:
  - **Approver identity** (individual or board resolution reference)
  - **Time of approval**
  - **Scope of authority** under which the approval was made
  - **Governance rule(s) authorizing the approver**
  - **Evidence reviewed** prior to approval
  - **Any deviations** from standard process with justification
- Withdrawn or superseded approvals must retain their provenance record with the superseding reference.

## Example Provenance Records

### Example 1: AuditOS Anomaly Finding

| Layer | Value |
|---|---|
| **Decision** | Anomaly flag: "Unusual vendor payment, Entity 442, Q3 cycle" |
| **Evidence** | Transaction hash `0xa3f...`, vendor master data v2.1, payment schedule deviation >3σ |
| **Principle** | P-104: Payment Integrity Principle ("All disbursements must have matching corroborating documentation") |
| **Governance Rule** | GR-22: Automated Anomaly Detection Thresholds, Section 4(b) |
| **Workflow** | AuditOS Pipeline v3.2 → Anomaly Detection Agent → Human Review Queue → Approved by Reviewer |
| **Human Responsibility** | Fatima Al-Rashid, Senior Audit Associate, approved 2026-04-15T14:22Z |

### Example 2: Commercial Trust Claim

| Layer | Value |
|---|---|
| **Decision** | Published claim: "99.7% reconciliation accuracy on sample corpus" |
| **Evidence** | Reconciliation test run #447, corpus of 1.2M ledger entries, third-party confirmation batch #88 |
| **Principle** | P-201: Commercial Integrity Principle ("Published claims must be verifiable by independent third party") |
| **Governance Rule** | GR-55: External Communications Policy, Section 7 |
| **Workflow** | QA Pipeline → Evidence Aggregation Agent → Marketing Review → GC Sign-off → Publication |
| **Human Responsibility** | Dr. Yusuf Kamal, Chief Governance Officer, approved 2026-05-01T09:00Z |

### Example 3: Governance Approval — New Product Feature

| Layer | Value |
|---|---|
| **Decision** | Approved: "Automated Zakat Calculation Module for AuditOS" |
| **Evidence** | Test results v4.7, Fiqh board fatwa #231, risk assessment report RA-89 |
| **Principle** | P-008: Ijtihad-by-Machine Constraint ("Automated religious rulings require Fiqh board pre-approval and periodic review") |
| **Governance Rule** | GR-04: Product Change Approval, Section 2(a)(iii) |
| **Workflow** | Product Review Pipeline → Fiqh Board Review → Technical Review → CEO Approval |
| **Human Responsibility** | Fiqh Board Resolution #2026-03-12, ratified by CEO Ahmad Noor |

## What Must Be Human-Approved

The following decision classes **must never** be fully automated and require explicit human approval with captured provenance:

1. **Final Audit Opinions** — Any opinion expressed on financial statement fairness or compliance status.
2. **External Publications** — Any report, benchmark, or claim released outside AQLIYA.
3. **Governance Approvals** — Any decision that alters product scope, governance policy, or risk appetite.
4. **Escalation Resolutions** — Any resolution of a risk flag that had been escalated above standard thresholds.
5. **Doctrine Amendments** — Any addition, removal, or modification of doctrinal principles in the knowledge base.
6. **Customer-Facing Commitments** — Any agreement, SLA term, or contractual commitment made on behalf of AQLIYA.
7. **Exception Grants** — Any override of standard governance rules for a specific case.

## Future System Implications

### Automated Provenance Capture
Future AQLIYA agents must emit provenance metadata alongside every output. The system architecture must treat provenance as a first-class primitive — not an afterthought bolted onto logging.

### Immutable Provenance Store
Provenance records must be stored in an append-only, cryptographically verifiable ledger (e.g., content-addressed or blockchain-anchored). Tampering with provenance must be detectable.

### Provenance Verification API
External auditors and regulators must be able to query the provenance of any AQLIYA output via a read-only API without requiring internal system access.

### Agent Accountability
As agents become more autonomous, the provenance chain must distinguish between:
- **Agent-initiated decisions** (proposed by AI, reviewed by human)
- **Human-initiated decisions** (directed by human, assisted by AI)
- **Autonomous decisions** (executed by system within pre-authorized bounds, reported after-the-fact)

### Regulatory Readiness
Provenance records must be structured to satisfy foreseeable regulatory requirements: EU AI Act traceability obligations, financial audit standards (ISA, ISSAI), and Shariah governance certification requirements (AAOIFI GSIFI).
