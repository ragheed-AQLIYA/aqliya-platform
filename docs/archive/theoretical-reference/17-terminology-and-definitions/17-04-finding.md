---
title: Finding
document_id: 17.04
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 4 — Definition
related_documents: 17.02, 17.05, 17.06, 17.07, 17.11, 17.12, 05.06
---

# Finding

## 1. Purpose

This document defines "Finding" as a structured concept within AQLIYA. Findings are the primary intellectual output of audit and governance work. They are the reason evidence is gathered, the reason risk is assessed, and the reason reports exist. Without a precise definition, findings become informal observations, undocumented opinions, or unvalidated claims — none of which survive regulatory scrutiny or professional liability standards. This definition ensures findings are treated as first-class enterprise objects with full evidence backing, professional validation, and governance enforcement.

## 2. Thesis

A finding in AQLIYA is a formally identified, evidence-backed observation that has been validated through professional review and approved through governed processes. Findings are not raw data points, informal notes, or system-generated alerts. They are professional-grade conclusions that carry weight — regulatory weight, liability weight, and reputational weight. Every finding must be traceable to its supporting evidence, must be reviewed by a qualified professional, must be approved through a defined governance chain, and must be documented in its full lifecycle from initial detection to final disposition.

## 3. Problem

Findings in current audit practice suffer from three structural deficiencies:

1. **Informal documentation**: Findings are recorded in email threads, spreadsheets, and ad hoc notes rather than in structured, auditable records with full evidence chains.
2. **Disconnected evidence**: The evidence supporting a finding is scattered across file shares, email attachments, and local drives rather than being linked directly to the finding it supports.
3. **Weak governance**: Finding approval is often informal — a manager nods in a meeting rather than formally approving through a governed process with documented reasoning.

These deficiencies create regulatory risk, professional liability, and quality inconsistency. A finding that cannot be traced to its evidence, reviewed by a qualified professional, and approved through a governed process is a finding that may not withstand external scrutiny.

## 4. Why Existing Systems Fail

**Audit management platforms** record findings as text entries in checklists or forms. They do not enforce evidence linking, professional review chains, or governance approval gates. Findings exist as descriptions, not as structured objects.

**Document management systems** store evidence files but do not connect them to findings. Evidence and findings live in separate systems, requiring manual cross-referencing that is error-prone and time-consuming.

**Email and spreadsheets** are where findings are drafted, discussed, and finalized — unstructured, unlinked, and untraceable. The final finding in the report may bear little resemblance to the original observation.

**Quality control systems** review findings after they are drafted but do not enforce evidence sufficiency, review completeness, or approval compliance before findings proceed to reports.

The common failure: no system treats the finding as a structured object with a lifecycle — from initial detection through evidence gathering, professional review, approval, and report inclusion. AQLIYA does.

## 5. AQLIYA Philosophy

A finding in AQLIYA undergoes a defined lifecycle:

1. **Detection**: An anomaly, risk signal, or evidence gap is identified through intelligence, manual review, or a combination.
2. **Evidence linking**: The finding is connected to the evidence that supports it — source documents, analytical results, intelligence outputs, and professional observations.
3. **Drafting**: The finding is described in professional terms: what was observed, why it matters, what evidence supports it, and what the implications are.
4. **Materiality assessment**: The finding is evaluated against materiality thresholds to determine whether it is a material finding, an immaterial observation, or not substantiated.
5. **Professional review**: A qualified reviewer evaluates the finding, its evidence, and its classification. The reviewer may accept, modify, or reject the finding with documented reasoning.
6. **Approval**: The finding is approved through the governance chain — which reviewers must approve, in what sequence, with what authority.
7. **Report inclusion**: The approved finding is included in the appropriate report with its full evidence trace and professional assessment.
8. **Outcome tracking**: The finding's impact on the overall engagement conclusion is documented, closing the feedback loop.

## 6. Core Principles

1. **Evidence is mandatory.** A finding without evidence is not a finding — it is an unsubstantiated claim. Evidence sufficiency is a governance requirement, not a professional courtesy.
2. **Professional judgment is required.** Intelligence may detect anomalies and suggest findings, but a qualified professional must validate the observation, evaluate the evidence, and confirm the finding.
3. **Governance is enforced.** Findings follow a defined approval chain configured by governance rules. A finding cannot proceed to report inclusion without meeting its approval requirements.
4. **Traceability is structural.** Every finding traces back to its evidence, forward to its report, and through its review and approval chain. If the chain is broken, the finding is structurally deficient.
5. **Classification matters.** Findings are classified (material, immaterial, observation) based on materiality assessment, not just professional opinion. The classification determines the governance path.

## 7. Key Concepts

- **Finding Object:** A structured record containing the observation, evidence references, materiality assessment, professional review, approval chain, report inclusion, and outcome documentation.
- **Finding Lifecycle:** The progression from detection through evidence linking, drafting, materiality assessment, professional review, approval, report inclusion, and outcome tracking.
- **Finding Classification:** The categorization of a finding based on materiality — material finding, immaterial observation, or not substantiated. Classification determines governance path and report treatment.
- **Finding Evidence Chain:** The documented link between a finding and all evidence that supports it, including source documents, analytical results, and professional observations.
- **Finding Approval Chain:** The sequence of professional reviewers who must approve the finding before it can be included in a report, defined by governance configuration.

## 8. Operational Implications

1. Every anomaly flag, evidence gap, or risk signal that survives initial triage must be tracked as a finding candidate with its full evidence chain, even if it is later determined to be immaterial.
2. Finding classification must follow defined materiality thresholds rather than individual professional judgment alone. Judgment is applied within the thresholds.
3. Finding review must be documented — who reviewed, what they evaluated, what they decided, and what reasoning they applied. Verbal reviews are not sufficient.
4. Finding approval must follow the governance chain defined for the engagement type. No finding reaches a report without completing its approval chain.
5. Finding outcome must be tracked — what impact did the finding have on the engagement conclusion, and did the finding materialize as expected.

## 9. Product Implications

1. Findings are first-class product objects with their own views, lifecycle management, and audit trails.
2. The product enforces the finding lifecycle — no finding can skip review, bypass approval, or reach a report without completing its governance chain.
3. Finding views show the full evidence trace by default. Reviewers should not need to navigate to separate evidence screens to understand what supports a finding.
4. Finding classification is driven by materiality thresholds configured for the engagement, not by ad hoc judgment.
5. Finding templates provide structured formats for common finding types, ensuring consistent documentation across engagements and reviewers.

## 10. Architecture Implications

1. The finding object has a defined schema: detection source, evidence references, observation description, materiality assessment, classification, reviewer actions, approval chain, report reference, and outcome documentation.
2. Finding state transitions are governed by the workflow engine. A finding cannot move to "approved" without meeting review and approval requirements.
3. Finding history is immutable. Previous states are retained. Modifications create new states with references to prior states and documented reasoning.
4. Finding-evidence links are enforced by the data model. A finding without linked evidence is flagged as structurally incomplete.
5. Finding queries support retrieval by engagement, classification, materiality level, evidence sufficiency, and approval status.

## 11. Governance Implications

1. Finding governance defines: who can create a finding candidate, who can classify it, who reviews it, who approves it, and who includes it in a report.
2. Material findings require stricter governance chains than immaterial observations. The governance path is determined by classification.
3. Finding approval must be documented with professional reasoning — not just a binary "approved" but the evaluator's assessment of evidence sufficiency, classification accuracy, and report relevance.
4. Finding modifications after approval require re-approval through the same governance chain. One-time approval is not sufficient when the finding's substance changes.
5. Finding audit trails must be generatable at any time for regulatory inspection, quality control review, or professional liability defense.

## 12. AI / Intelligence Implications

1. Intelligence detects anomalies and suggests finding candidates. It does not create findings. Finding creation requires professional human validation.
2. Intelligence assigns initial materiality assessments based on configured thresholds and financial data analysis. The professional reviewer confirms or modifies the classification.
3. When intelligence suggests a finding, it provides the full evidence trace: what was detected, what data supports it, what patterns were identified, and what confidence level applies.
4. Intelligence feedback loops capture whether finding candidates were accepted, modified, or rejected, improving future detection and classification.
5. Intelligence supports finding documentation by drafting initial descriptions, evidence summaries, and classification rationales — but the professional reviewer always edits, validates, and owns the final content.

## 13. UX Implications

1. Finding views prioritize the evidence chain. Reviewers see what evidence supports the finding, how strong it is, and what gaps exist.
2. Classification and materiality assessment are presented with the relevant thresholds, calculations, and benchmarks — making it easy for reviewers to confirm or modify.
3. Review and approval interactions are primary workflow steps, not administrative overhead.
4. Finding templates provide structured input fields that guide professional documentation rather than relying on free-text descriptions.
5. Finding status is always visible — where the finding is in its lifecycle, what steps remain, and what governance actions are pending.

## 14. Commercial Implications

1. Finding management is a primary value driver for audit firms. Reducing finding-to-report time, improving evidence sufficiency, and enforcing governance compliance directly impact firm economics.
2. Pilot engagements demonstrate value through finding quality improvements — fewer findings with incomplete evidence, fewer findings bypassing approval, and fewer findings lacking outcome tracking.
3. Finding management creates network effects within a firm — standardized finding templates, cross-engagement finding patterns, and institutional memory of finding classifications.
4. The commercial narrative shifts from "find anomalies faster" to "produce defensible findings with complete evidence chains and governance compliance."

## 15. Anti-Patterns

1. **Finding without evidence.** Allowing findings to be created or approved without linking them to supporting evidence. An unsupported finding is a liability, not an asset.
2. **Finding without classification.** Treating all findings as equal regardless of materiality. This overloads governance with immaterial observations and under-governs material risks.
3. **Finding without review.** Allowing findings to proceed to reports without professional review and documented evaluation. This is a regulatory and professional liability risk.
4. **Finding by AI.** Allowing the system to create findings without human validation. AI can suggest finding candidates, but only a professional can create a finding.
5. **Finding as text entry.** Reducing findings to free-text descriptions in forms or checklists without structured evidence linking, classification, review, and approval.
6. **Finding without outcome.** Including findings in reports without tracking their impact on engagement conclusions. Without outcome tracking, findings cannot be evaluated for quality improvement.

## 16. Examples

**Example 1: Material Misstatement Finding.** During a revenue audit, the system flags anomalies in revenue recognition timing. The finding candidate includes: the specific transactions, the pattern detected, the financial impact calculation, and the supporting evidence. The reviewer evaluates the evidence, confirms the pattern constitutes a material misstatement, classifies it as a material finding, and documents the reasoning. The engagement manager reviews and approves. The partner provides final approval. The finding is included in the audit report with its full evidence trace, professional assessments, and approval chain.

**Example 2: Immaterial Observation.** During expense testing, the system detects minor discrepancies in expense categorization. The reviewer evaluates the evidence, confirms the pattern exists but determines it falls below materiality threshold. The finding is classified as an immaterial observation, reviewed by the manager, and documented for management letter inclusion without requiring partner approval.

**Example 3: Evidence Gap Finding.** During accounts receivable confirmation, the system identifies that three material balances lack sufficient confirmation evidence. The finding candidate includes: the specific accounts, the confirmation status, the materiality implications, and the recommended evidence collection steps. The reviewer accepts the finding, adds a note that two of three confirmations are expected within the week, and assigns evidence collection tasks. The finding tracks the evidence gap through resolution.

## 17. Enterprise Impact

1. **Regulatory defensibility**: Findings with complete evidence chains, professional review, and governance approval withstand regulatory scrutiny.
2. **Quality consistency**: Structured finding templates and enforced governance chains produce consistent quality across engagements and reviewers.
3. **Reviewer productivity**: Intelligence-assisted detection, evidence linking, and drafting reduce the time reviewers spend on finding administration, freeing time for professional judgment.
4. **Institutional memory**: Finding patterns and classifications persist across engagements, enabling future reviewers to learn from past findings.
5. **Risk reduction**: Governance enforcement prevents findings from reaching reports without adequate evidence, review, and approval — reducing professional liability.

## 18. Long-Term Strategic Importance

Findings are the intellectual product of audit and governance work. They are what clients receive, what regulators evaluate, and what professional liability assessors scrutinize. If AQLIYA defines findings precisely and manages them as structured, evidence-backed, governed objects, it creates a capability that no audit management platform, document system, or generic workflow tool can replicate.

Long-term, finding intelligence compounds. As the system accumulates finding patterns, classifications, and outcomes, it improves anomaly detection, materiality assessment, and evidence sufficiency evaluation. This creates a defensible position in audit intelligence that generic tools cannot achieve without the same domain depth and governance integration.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 17.02 | Decision | Findings are validated through professional decisions |
| 17.05 | Evidence | Evidence backs every finding |
| 17.06 | Materiality | Materiality determines finding classification |
| 17.07 | Risk Signal | Risk signals may initiate finding candidates |
| 17.11 | Review | Professional review validates findings |
| 17.12 | Approval | Approval governs finding progression |
| 05.06 | Findings Intelligence Theory | Theory of intelligence applied to findings |
| 07.05 | Findings Lifecycle Framework | Framework for the finding lifecycle |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Verified evidence-mandatory principle, governance enforcement, AI-assistive boundary (candidates only). Cross-references to 17.01 and 17.05 confirmed. |