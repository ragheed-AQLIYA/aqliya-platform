---
title: Findings Intelligence Theory
document_id: 05.06
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 2 - Domain Theory
related_documents:
  - 05.01 AuditOS Thesis
  - 05.02 Audit Intelligence Theory
  - 05.03 AI-Assisted Audit Philosophy
  - 05.05 Audit Engagement Model
  - 05.10 Explainable Audit Intelligence
  - 05.11 Audit Report Intelligence
  - 05.14 Audit Governance Model
---

# Findings Intelligence Theory

## 1. Purpose

Establish the theoretical foundation for how audit findings are discovered, classified, analysed, and represented as structured intelligence within the AQLIYA system. Findings are the primary output of audit work — this theory ensures they are comparable, composable, and machine-readable without losing the contextual depth that human judgement provides.

## 2. Thesis

An audit finding is not a paragraph of text — it is a structured assertion supported by evidence, evaluated against criteria, and linked to a root cause. Findings Intelligence (FI) treats each finding as a first-class intelligence unit that can be analysed, aggregated, and learned from across engagements. Financial Intelligence is AQLIYA's first moat; Findings Intelligence is a compounding moat: the ability to treat findings not as static report content but as a living corpus of organisational risk intelligence that deepens with every engagement.

## 3. Problem

Audit findings are typically written as free-text observations in reports. This format is:
- Not machine-analysable across engagements
- Inconsistent in structure and quality across auditors
- Difficult to aggregate for trend analysis
- Hard to link back to specific evidence items
- Vulnerable to ambiguity and interpretation differences

## 4. Why Existing Systems Fail

Current audit management systems treat findings as report sections. They provide structured forms for finding entry, but the structure is shallow — a title, a severity rating, and a description. They fail because:
- The structure encodes no relationship between finding, evidence, and criteria
- There is no ontology of finding types
- Severity ratings are subjective and inconsistent
- Findings cannot be composed into higher-level patterns
- There is no learning across engagements — each finding is a fresh creation

## 5. AQLIYA Philosophy

Findings are intelligence, not content. Every finding must be structured so that it can be understood by both humans and machines. The human auditor identifies and articulates the finding; AI assists by validating structure, surfacing similar findings from history, and flagging logical gaps. EDI stores each finding as a versioned entity linked to its supporting evidence. Financial Intelligence is AQLIYA's first moat; Findings Intelligence is a compounding moat — the corpus of structured findings grows in value over time, creating a barrier to entry that no tool-based competitor can replicate. AuditOS is the first wedge through which this intelligence is proven in the audit domain. Evidence is the unit of trust; AI assists; humans decide.

## 6. Core Principles

- **Structured by default**: Every finding follows a schema of assertion, evidence, criteria, root cause, impact, recommendation
- **Evidence-bound**: No finding exists without linked evidence in EDI
- **Comparable**: Findings use a shared ontology and severity framework
- **Composable**: Findings can be grouped, rolled up, and decomposed
- **Learnable**: Every finding enriches the intelligence layer for future engagements

## 7. Key Concepts

- **Finding Assertion**: The core claim that something is wrong or noteworthy
- **Criteria Reference**: The standard, policy, or benchmark against which the assertion is evaluated
- **Evidence Link**: A verifiable reference to the evidence supporting the assertion
- **Root Cause Classification**: The categorised underlying cause (process, people, technology, external)
- **Impact Assessment**: The actual or potential consequence of the finding
- **Recommendation**: The suggested corrective action, tied to root cause
- **Finding Ontology**: The taxonomy of finding types used across all engagements
- **Severity Framework**: The multi-dimensional severity model (likelihood, impact, materiality)

## 8. Operational Implications

- Findings must be entered with structured schema, not free text
- Each finding requires at least one evidence link before it can be finalised
- Finding severity is calculated from the framework, not manually assigned
- Findings must be reviewed and approved through a defined lifecycle
- Trend analysis across findings requires consistent ontology usage

## 9. Product Implications

- The product must provide a structured finding creation interface that enforces the schema
- Finding ontology must be configurable per organisation
- Finding search and aggregation must support cross-engagement queries
- Finding lifecycle management must integrate with the engagement lifecycle
- The product must expose finding intelligence as an API-consumable resource

## 10. Architecture Implications

- Findings are stored as versioned aggregates in EDI, not as rows in a report table
- Finding schema is enforced at the domain layer, not in the UI
- Finding ontology is a bounded context with its own versioning
- Events are emitted for finding creation, update, severity change, and closure
- Integration with Evidence Intelligence (05.07) is via evidence link references

## 11. Governance Implications

- Governance requires that every finding be traceable to evidence and criteria
- Finding severity and classification are subject to review and override with documented rationale
- Governance policies can mandate minimum evidence requirements per finding type
- Finding aggregation for board reporting must preserve the structured representation
- Structural governance means findings cannot be deleted — only superseded or deprecated

## 12. AI / Intelligence Implications

- AI classifies findings into the ontology based on textual and contextual analysis
- AI suggests evidence gaps — findings without sufficient evidence are flagged
- AI surfaces similar findings from historical engagements for consistency checking
- AI detects severity anomalies — findings that deviate from historical patterns
- AI does not create findings autonomously; it assists in structuring and validating what the human auditor identifies

## 13. UX Implications

- Finding entry must balance structure with speed — too many fields hinder adoption
- Evidence linking must be intuitive — drag, search, or auto-suggest based on engagement context
- Finding comparison views must make severity and ontology differences visually clear
- AI suggestions must be presented as options, not defaults
- The UX must communicate the intelligence value of structured findings, not just the administrative burden

## 14. Commercial Implications

- Findings corpus as compounding moat: the value of AQLIYA increases with every structured finding in the corpus
- Organisations with large audit portfolios benefit most from cross-engagement finding analysis
- Finding trend reports become a high-value commercial deliverable
- The ontology and severity framework can be licensed or standardised for industry verticals
- No chatbot upsell — value is in the structured intelligence, not in conversational interfaces

## 15. Anti-Patterns

- **Free-text findings**: Writing findings as paragraphs destroys machine-analysability
- **Severity as a single dropdown**: Severity is multi-dimensional; single ratings are meaningless
- **Finding without evidence**: A finding not linked to evidence is an opinion, not an audit finding
- **Copy-paste findings**: Reusing finding text without re-evaluating evidence and context
- **Ontology rigidity**: A fixed ontology that cannot evolve with the organisation's risk landscape
- **Finding inflation**: Creating too many low-value findings to show activity
- **AI-generated findings**: Letting AI author findings autonomously destroys human accountability

## 16. Examples

- **Control deficiency finding**: Assertion that a procurement approval control is not operating effectively. Evidence link to three approved exceptions that exceeded delegation limits. Criteria reference to the Delegation of Authority policy. Root cause classified as process design gap. Severity calculated as high impact, medium likelihood, low materiality. Recommendation to redesign the approval workflow.
- **Process improvement finding**: Assertion that invoice processing cycle time exceeds benchmark. Evidence link to cycle time data from AP system. Criteria reference to industry benchmark. Root cause classified as technology limitation. Severity calculated as medium impact, high likelihood, low materiality. Recommendation to implement automated invoice matching.

## 17. Enterprise Impact

- Consistent finding structure enables enterprise-wide audit intelligence
- Trend analysis across findings reveals systemic issues before they become material
- Root cause classification supports targeted remediation programmes
- Reduced audit cost through finding reuse and pattern recognition
- Stronger governance through traceable, evidence-bound findings

## 18. Long-Term Strategic Importance

Findings Intelligence is AQLIYA's compounding moat. Financial Intelligence is the first moat — without domain understanding of financial structures, findings cannot rise above free text. Findings Intelligence builds on that foundation, transforming the most valuable output of audit work — findings — from static content into a living intelligence asset. Every engagement that uses AQLIYA adds to the FI corpus. Over time, this corpus becomes irreplicable: no competitor can match the depth of structured, evidence-bound, cross-engagement findings intelligence. FI is the reason AQLIYA is an intelligence system, not a tool.

## 19. Related Documents

- **05.01 AuditOS Thesis** — Anchors AQLIYA's wedge strategy; Financial Intelligence as first moat is established in the Thesis
- **05.02 Audit Intelligence Theory** — Domain theory providing the intelligence pipeline context for findings
- **05.03 AI-Assisted Audit Philosophy** — Defines AI boundaries for finding drafting and classification
- **05.05 Audit Engagement Model** — Findings are produced within engagement lifecycle
- **05.10 Explainable Audit Intelligence** — Finding rationale must be explainable
- **05.11 Audit Report Intelligence** — Findings are the primary content of audit reports
- **05.14 Audit Governance Model** — Governance rules apply to finding creation and closure

## 20. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full 20-section document defining Findings Intelligence Theory |
| 0.2 | 2026-05-08 | Founding Team | Wave 3C promotion to Reviewed. CRITICAL FIX: Changed all "Findings Intelligence is first moat" references to "Financial Intelligence is first moat; Findings Intelligence is compounding moat." Fixed cross-references. Added doctrinal anchors. |
