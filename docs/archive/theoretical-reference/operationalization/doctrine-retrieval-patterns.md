# Doctrine Retrieval Patterns

## 1. Product Positioning

| Field | Value |
|-------|-------|
| **Query Intent** | Determine whether a given capability, feature, or module is a core product component, a companion tool, or a service boundary — so that development, pricing, and support decisions reflect actual product architecture. |
| **Relevant Document Layers** | `architecture/product-boundaries.md`, `governance/product-classification.md`, `doctrine/commercial-scope.md`, `reference/feature-taxonomy.md` |
| **Required Governance Check** | Product boundary classification must be revalidated against current roadmap and any open commercial agreements. No feature may be repositioned without an approved product scope document. |
| **Human Escalation Trigger** | Escalate when: (a) the classification is ambiguous across two or more boundary types; (b) repositioning would affect an active customer contract; (c) the feature touches a regulated domain (finance, health, identity). |
| **Example Output Boundary** | "_Feature X is classified as a core platform capability under policy P-04. Its positioning may not be altered without a signed product scope amendment. Draft positioning proposals are internal-only until reviewed by Product Governance._" |

---

## 2. Audit Methodology

| Field | Value |
|-------|-------|
| **Query Intent** | Select, justify, and apply an audit methodology (substantive, control-based, risk-based, hybrid) to a given scope — ensuring the approach aligns with the governing standard and the nature of the subject matter. |
| **Relevant Document Layers** | `audit/methodology-catalog.md`, `governance/audit-standards.md`, `doctrine/professional-skepticism.md`, `reference/sampling-frameworks.md` |
| **Required Governance Check** | Methodology selection must cite a published standard (ISA, ISAE, ISO, or internal equivalent) and be approved at the engagement-planning gate. Deviation from default methodology requires a written rationale. |
| **Human Escalation Trigger** | Escalate when: (a) no standard methodology applies to the engagement type; (b) two or more methodologies produce materially different conclusions; (c) the methodology choice affects a regulatory filing. |
| **Example Output Boundary** | "_Based on scope classification S-02 (operational controls audit), the control-based methodology per ISA 315 (Revised) applies. Output is an AuditOS draft work program. Final methodology selection requires Engagement Lead sign-off._" |

---

## 3. Accounting Reasoning

| Field | Value |
|-------|-------|
| **Query Intent** | Resolve an accounting treatment question — recognition, measurement, presentation, or disclosure — by applying the applicable financial reporting framework to a specific transaction or balance. |
| **Relevant Document Layers** | `accounting/standards-index.md`, `governance/accounting-policies.md`, `doctrine/professional-judgment.md`, `reference/industry-guidance.md` |
| **Required Governance Check** | Every proposed accounting treatment must be cross-referenced to a specific paragraph of the applicable standard. Judgement-based treatments require a formal technical memorandum. |
| **Human Escalation Trigger** | Escalate when: (a) the applicable standard provides no clear guidance; (b) the treatment is material to the financial statements; (c) management's proposed treatment conflicts with the professional assessment. |
| **Example Output Boundary** | "_Transaction T-103 meets the recognition criteria of IFRS 15.27 (performance obligation satisfied over time). The draft journal entry and disclosure note are prepared. Final approval requires a signed technical memorandum from the Technical Accounting Reviewer._" |

---

## 4. AI Governance

| Field | Value |
|-------|-------|
| **Query Intent** | Determine the governance classification, acceptable use parameters, and oversight requirements for introducing or modifying an AI system within organizational workflows. |
| **Relevant Document Layers** | `governance/ai-policy.md`, `doctrine/human-in-the-loop.md`, `risk/ai-risk-register.md`, `reference/model-cards.md` |
| **Required Governance Check** | Every AI system must have a registered model card, a documented human-in-the-loop protocol, and an approved impact assessment before production use. The governance classification (assistive, recommendatory, or autonomous) must be declared. |
| **Human Escalation Trigger** | Escalate when: (a) the system would operate in an autonomous capacity; (b) the use case involves decisions with legal or financial consequence; (c) model behavior deviates from the registered model card by more than the approved tolerance. |
| **Example Output Boundary** | "_System AI-07 is classified as recommendatory. Outputs are drafts requiring human approval before client delivery. Full autonomous operation is prohibited under AI Policy §4.2._" |

---

## 5. Evidence Traceability

| Field | Value |
|-------|-------|
| **Query Intent** | Establish and verify a complete chain from a conclusion or output back through its supporting evidence, reasoning steps, and source documents — enabling external review and audit. |
| **Relevant Document Layers** | `governance/evidence-standards.md`, `doctrine/evidence-to-principle.md`, `reference/chain-of-custody.md`, `templates/evidence-register.md` |
| **Required Governance Check** | Every output that supports a professional opinion must have a registered evidence chain. Evidence must meet the applicable standard of sufficiency and appropriateness. Missing or incomplete chains block the output from advancing beyond draft status. |
| **Human Escalation Trigger** | Escalate when: (a) a required evidence item cannot be obtained; (b) the chain of custody is broken; (c) evidence is contradictory and cannot be resolved through additional procedures. |
| **Example Output Boundary** | "_Conclusion C-22 is supported by evidence items E-01 through E-07, registered in Evidence Register ER-2025-03. The evidence chain is complete. Draft output is available; final release requires Evidence Review sign-off._" |

---

## 6. Human-in-the-Loop Approval

| Field | Value |
|-------|-------|
| **Query Intent** | Determine the required human approval gate for a given output type — who must approve, at what stage, and with what documentation — before the output may be released from draft status. |
| **Relevant Document Layers** | `governance/approval-matrix.md`, `doctrine/human-responsibility.md`, `workflows/review-gates.md`, `templates/approval-record.md` |
| **Required Governance Check** | Every output must pass through its designated approval gate. The approver must be qualified and independent of the preparer. The approval must be recorded with a timestamp and rationale. |
| **Human Escalation Trigger** | Escalate when: (a) the designated approver is unavailable and the output is time-sensitive; (b) the approver disagrees with the preparer's judgement and the matter cannot be resolved at that level; (c) regulatory or contractual deadlines require a modified approval path. |
| **Example Output Boundary** | "_This output is classified as Reviewer-tier under the Approval Matrix (Output Class B). It requires one qualified reviewer. The draft is locked until the Reviewer's digital sign-off is recorded in the approval log._" |

---

## 7. Draft Output Boundaries

| Field | Value |
|-------|-------|
| **Query Intent** | Define what a system may produce as a draft, what it may not produce at all, and what conditions must be met for a draft to advance to approved status — preventing drafts from being mistaken for final outputs. |
| **Relevant Document Layers** | `governance/output-classification.md`, `doctrine/draft-vs-approved.md`, `templates/watermark-spec.md`, `reference/disallowed-outputs.md` |
| **Required Governance Check** | Every draft output must carry a visible watermark or header identifying it as "DRAFT — NOT FOR RELIANCE." Drafts must not be transmitted outside the organization without explicit gateway approval. Disallowed output types (e.g., final audit opinions, signed tax returns) must be blocked at the system level. |
| **Human Escalation Trigger** | Escalate when: (a) a draft is requested for external distribution; (b) the system is asked to produce a disallowed output type; (c) a draft is being used or cited as though it were approved. |
| **Example Output Boundary** | "_This document is a DRAFT prepared by Aqliya AuditOS. It is not a final deliverable. It must not be shared with clients, regulators, or third parties. All drafts require human review and approval per Policy G-07._" |

---

## 8. Commercial Claims

| Field | Value |
|-------|-------|
| **Query Intent** | Determine whether a statement about the product's capabilities, performance, or suitability constitutes an approved commercial claim — and if so, under what conditions it may be made. |
| **Relevant Document Layers** | `governance/commercial-claims-policy.md`, `legal/claim-register.md`, `product/capability-baseline.md`, `reference/marketing-approvals.md` |
| **Required Governance Check** | Every commercial claim must be: (a) substantiated by verifiable product capability at the current release level; (b) registered in the Claims Register; (c) approved by Legal and Product Governance. Unregistered claims are prohibited. |
| **Human Escalation Trigger** | Escalate when: (a) a sales or marketing request seeks a claim not yet registered; (b) a registered claim is challenged by a customer or competitor; (c) a claim depends on future roadmap items not yet shipped. |
| **Example Output Boundary** | "_Claim CL-014 ('AuditOS supports ISA 315-compliant risk assessment') is registered and substantiated as of Release 2.3. It may be used in commercial communications. Claims not appearing in the Claims Register must not be made._" |

---

## 9. Pilot Decisions

| Field | Value |
|-------|-------|
| **Query Intent** | Determine whether a proposed deployment, feature trial, or customer engagement qualifies as a pilot — and what governance, monitoring, and exit criteria apply. |
| **Relevant Document Layers** | `governance/pilot-framework.md`, `risk/pilot-risk-assessment.md`, `product/pilot-lifecycle.md`, `templates/pilot-charter.md` |
| **Required Governance Check** | Every pilot must have an approved Pilot Charter defining scope, duration, success criteria, failure thresholds, and rollback plan. Pilot outputs are governed at the same level as production outputs unless explicitly downgraded in the charter. |
| **Human Escalation Trigger** | Escalate when: (a) a pilot failure threshold is breached; (b) the pilot scope expands beyond the chartered boundary; (c) a customer or stakeholder treats pilot outputs as production-ready. |
| **Example Output Boundary** | "_Engagement E-89 meets the Pilot Framework criteria for a Controlled Pilot (Tier 2). The Pilot Charter (PC-2025-11) governs all outputs. Pilot outputs carry the 'PILOT — LIMITED RELIANCE' designation and may not be used for regulatory purposes._" |

---

## 10. Product Behavior Justification

| Field | Value |
|-------|-------|
| **Query Intent** | Provide a principled justification for why the product behaves in a particular way — referencing design doctrine, governance policies, and architectural constraints — so that users, auditors, and governance bodies can understand and validate product decisions. |
| **Relevant Document Layers** | `architecture/design-principles.md`, `doctrine/product-behavior.md`, `governance/product-decisions-log.md`, `reference/behavior-specifications.md` |
| **Required Governance Check** | Every material product behavior must be traceable to an approved design decision. Behaviors that materially affect professional outputs (audit conclusions, accounting treatments, governance recommendations) must be registered in the Product Decisions Log. |
| **Human Escalation Trigger** | Escalate when: (a) a behavior cannot be traced to an approved decision; (b) the behavior produces a materially different output than expected under the governing standard; (c) a stakeholder disputes the justification and the matter cannot be resolved through documented rationale. |
| **Example Output Boundary** | "_Behavior B-17 ('Mandatory evidence attachment before conclusion release') is justified by Design Principle DP-04 (Evidence First) and Governance Policy G-11 (Output Integrity). This behavior is non-configurable. The justification is registered in Product Decisions Log PDL-2025-042._" |

---

## Retrieval Flow Diagram

```
Query → Classify Intent → Select Document Layer → Apply Governance Check
                                                         │
                                              ┌──────────┴──────────┐
                                              │                     │
                                         Gate Passed           Gate Failed
                                              │                     │
                                    Produce Output          Trigger Escalation
                                    with Boundary                │
                                                         Human Decision
```
