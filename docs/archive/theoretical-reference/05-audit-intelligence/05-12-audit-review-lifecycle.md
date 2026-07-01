---
title: Audit Review Lifecycle
document_id: 05.12
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents:
  - 05.01 AuditOS Thesis
  - 05.03 AI-Assisted Audit Philosophy
  - 05.05 Audit Engagement Model
  - 05.06 Findings Intelligence Theory
  - 05.07 Evidence Intelligence Theory
  - 05.11 Audit Report Intelligence
  - 05.13 Audit Quality Assurance Model
  - 05.14 Audit Governance Model
---

# Audit Review Lifecycle

## 1. Purpose

Define the structured lifecycle by which audit work products — evidence, findings, risk assessments, and reports — are reviewed, approved, and closed within the AQLIYA system. Review is the quality gate that ensures every engagement output meets professional standards before release.

## 2. Thesis

Review is not a final step — it is a continuous process that runs throughout the engagement lifecycle. The Audit Review Lifecycle (ARL) defines how review occurs at every stage: evidence is reviewed as it is collected, findings are reviewed as they are drafted, risk assessments are reviewed as they are updated, and the final report is reviewed before release. Each review is a structured, evidence-based evaluation that is itself recorded in EDI.

## 3. Problem

Audit review is typically performed as a final quality check before report issuance. This last-minute review finds issues that are costly to fix at that stage. Common problems include:
- Review occurs too late to influence the work product efficiently
- Review comments are informal (email, document markup) and not systematically tracked
- Review findings are not linked to the work product for remediation tracking
- Review quality varies based on the reviewer's experience and thoroughness
- There is no systematic learning from review outcomes

## 4. Why Existing Systems Fail

Current tools provide review workflows as document approval steps. They fail because:
- Review is a binary approve/reject action with no intermediate states
- Review comments are not linked to specific evidence or findings
- No integration between review of evidence, findings, and the final report
- Review history is not systematically retained for governance
- No intelligence layer to learn from review outcomes

## 5. AQLIYA Philosophy

Review is structural, not procedural. Every work product in AQLIYA has a defined lifecycle with review gates at critical points. Review is not just about finding errors — it is about confirming that the work product meets quality standards and is supported by evidence. The reviewer's judgement is captured as structured feedback linked to the reviewed item. AI assists by flagging items that may need closer review based on risk, complexity, or historical review patterns. No chatbot replaces the reviewer — review is a human judgement that AI informs but does not make.

AuditOS is AQLIYA's first wedge, not the company identity. The Review Lifecycle operationalises the doctrine that governance is structural — review gates are enforced by system state, not optional procedures. Financial Intelligence is the first moat — reviews depend on understanding what the financial data means and whether evidence supports it. Evidence is the unit of trust: every review finding must trace to a work product. AI assists; humans decide — no AI may approve a work product or substitute for reviewer judgement.

## 6. Core Principles

- **Continuous review**: Review happens throughout the engagement, not just at the end
- **Structured feedback**: Review comments are structured, categorised, and linked to work products
- **Evidence-based**: Review evaluates work products against evidence and criteria
- **Tracked remediation**: Review findings have a lifecycle — raised, acknowledged, resolved, verified
- **Reviewer accountability**: Every review is attributed and logged in EDI
- **Learning-enabled**: Review outcomes improve future work product quality and review efficiency

## 7. Key Concepts

- **Review Gate**: A defined point in the engagement lifecycle where review is required
- **Work Product**: The item under review (evidence item, finding, risk assessment, report component)
- **Review Instance**: A specific review of a work product by a specific reviewer
- **Review Finding**: A structured observation from the review, linked to the work product
- **Review Status**: The state of the review (pending, in progress, passed, failed, conditional)
- **Remediation Tracking**: The lifecycle of addressing review findings
- **Reviewer Assignment**: The allocation of review responsibility based on expertise and independence
- **Review History**: The immutable log of all reviews for a work product

## 8. Operational Implications

- Review gates must be defined at engagement planning, incorporated into the engagement model
- Every work product enters a review state after initial completion
- Review findings are tracked to resolution before the work product can advance
- Review escalation paths must be defined for unresolved disagreements
- Review history is part of the engagement record retained in EDI

## 9. Product Implications

- The product must support review as a first-class workflow, not an attachment to a document
- Review assignment must consider reviewer expertise, availability, and independence
- Review finding tracking must be integrated with work product lifecycle
- Review dashboards must show review status across the engagement
- Remediation tracking must be visible and actionable

## 10. Architecture Implications

- Review is a domain service that operates across multiple bounded contexts (evidence, findings, reports)
- Review instances and findings are stored as aggregates in EDI
- Review events drive state transitions in work product lifecycles
- Reviewer assignment is a domain service respecting independence rules
- Integration with the Engagement Model (05.05) for review gate definitions

## 11. Governance Implications

- Review gates are governance-enforced — work products cannot advance without passing required reviews
- Review independence is governed — reviewers must be independent of the work they review
- Review history is immutable and retained for regulatory inspection
- Governance policies can set minimum review requirements per engagement type and risk level
- Review finding resolution is subject to governance oversight

## 12. AI / Intelligence Implications

- AI flags work products that may need closer review based on risk, complexity, or history
- AI suggests reviewers based on expertise and independence rules
- AI identifies patterns in review findings across engagements for quality improvement
- AI does not perform review — it informs the review assignment and focus
- AI learns from review outcomes to improve future work product quality

## 13. UX Implications

- Review status must be visible at a glance across the engagement workspace
- Review initiation must be a deliberate action, not automatic
- Review finding entry must be structured but quick
- Remediation tracking must be clear — what was raised, what was done, what is still open
- Review history must be accessible without cluttering the working view

## 14. Commercial Implications

- Structured review reduces rework cost and improves audit quality
- Review analytics (review cycle time, finding patterns) become a quality management offering
- Organisations with regulatory oversight benefit from defensible review processes
- Review efficiency improvements translate to faster engagement cycles
- No dashboard upsell — value is in structured, traceable review

## 15. Anti-Patterns

- **Last-minute review**: Waiting until report draft to begin review
- **Binary review**: Only approve or reject, with no ability for conditional or partial review
- **Unstructured feedback**: Review comments in email or document markup not linked to work products
- **Reviewer overlap**: The preparer and reviewer being the same person
- **Review finding abandonment**: Review findings raised but never tracked to resolution
- **AI review autonomy**: Letting AI approve work products without human review
- **Review gate proliferation**: Too many review gates causing workflow paralysis

## 16. Examples

- **Evidence review**: Auditor collects evidence items for revenue recognition testing. Each evidence item enters review state. Reviewer examines evidence quality, relevance, and link to assertions. Two evidence items flagged for insufficient reliability. Reviewer creates review findings linked to those items. Auditor addresses findings by collecting additional evidence. Reviewer verifies and closes findings. Evidence items pass review.
- **Report review**: Draft report generated from engagement data. Report enters review. Reviewer examines each section against findings and evidence in EDI. Two statements in executive summary identified as not fully supported by findings. Reviewer creates review findings. Auditor adjusts wording to align with evidence. Reviewer verifies changes. Report passes review.

## 17. Enterprise Impact

- Higher audit quality through continuous, structured review
- Reduced rework cost through early issue detection
- Consistent review practices across the audit function
- Improved regulatory confidence through traceable review history
- Review intelligence enables targeted quality improvement initiatives

## 18. Long-Term Strategic Importance

The Audit Review Lifecycle is the quality assurance mechanism for all of AQLIYA. Without a rigorous review process, the intelligence produced by the system cannot be trusted. ARL ensures that every work product — evidence, finding, risk assessment, report — is independently verified before it becomes part of the audit record. This is not just a workflow — it is the structural guarantee of quality that makes AQLIYA's intelligence defensible.

## 19. Related Documents

- **05.01 AuditOS Thesis** — Quality and defensibility are core thesis principles
- **05.03 AI-Assisted Audit Philosophy** — Defines AI boundaries; review remains a human judgment AI informs but does not make
- **05.05 Audit Engagement Model** — Review gates are integrated with the engagement lifecycle
- **05.06 Findings Intelligence Theory** — Findings undergo review before acceptance
- **05.07 Evidence Intelligence Theory** — Evidence undergoes review before use
- **05.11 Audit Report Intelligence** — Report review is the final review gate
- **05.13 Audit Quality Assurance Model** — Review is a component of QA
- **05.14 Audit Governance Model** — Governance enforces review requirements

## 20. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full 20-section document defining the Audit Review Lifecycle |
| 0.2 | 2026-05-08 | Founding Team | Wave 3C promotion to Reviewed. Fixed cross-references. Added doctrinal anchors: wedge positioning, Financial Intelligence as first moat, governance as structural, evidence as unit of trust, AI assists/humans decide. |
