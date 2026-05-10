---
title: Evidence Intelligence Theory
document_id: 05.07
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
  - 05.06 Findings Intelligence Theory
  - 05.08 Sampling Intelligence Theory
  - 05.10 Explainable Audit Intelligence
---

# Evidence Intelligence Theory

## 1. Purpose

Define the theoretical framework for how audit evidence is identified, collected, stored, evaluated, and reasoned with in the AQLIYA system. Evidence is the unit of trust — this theory establishes how trust is earned, maintained, and verified through structured evidence management.

## 2. Thesis

Evidence is the fundamental unit of trust in audit. Every opinion, every finding, every recommendation is only as strong as the evidence that supports it. Evidence Intelligence treats evidence not as supporting material but as the foundational layer upon which all audit intelligence is built. EDI infrastructure provides the substrate; Evidence Intelligence provides the theory of how evidence is managed, evaluated, and reasoned with at scale.

## 3. Problem

Audit evidence is typically collected in ad hoc folders, email attachments, and shared drives. There is no systematic approach to evidence management across the audit lifecycle. This leads to:
- Lost or orphaned evidence that cannot be linked to findings
- Duplicate evidence collection across engagements
- No ability to evaluate evidence sufficiency systematically
- Difficulty in evidence review — reviewers cannot easily assess what exists and what is missing
- No chain of custody or version history for evidence items

## 4. Why Existing Systems Fail

Current systems treat evidence as file attachments. They provide storage but no intelligence. They fail because:
- Evidence is disconnected from the assertions it supports
- There is no framework for evaluating evidence quality — relevance, reliability, sufficiency
- Evidence from different sources cannot be compared or aggregated
- No automated detection of evidence gaps based on engagement scope
- Evidence retention and disposition are not governed

## 5. AQLIYA Philosophy

Evidence is not a file — it is a verifiable assertion about reality. Every evidence item in AQLIYA has a type, a source, a collection method, a link to the assertion it supports, and a chain of custody stored in EDI. The human auditor determines what evidence is relevant and sufficient; AI assists by mapping the evidence landscape, flagging gaps, and evaluating consistency. No chatbot replaces the auditor's judgement about evidence. The goal is not automation — it is intelligence-augmented evidence management.

AuditOS is AQLIYA's first wedge, not the company identity. Evidence Intelligence Theory operationalises the doctrine that evidence is the unit of trust within the audit domain. Financial Intelligence is the first moat — evidence without financial domain understanding cannot feed the intelligence pipeline. Governance is structural: evidence lifecycle, provenance, and chain of custody are enforced by system state. AI assists; humans decide — only a qualified reviewer accepts evidence as relied-upon.

## 6. Core Principles

- **Evidence as unit of trust**: Every audit claim must rest on verifiable evidence
- **Structured metadata**: Every evidence item has schema-enforced metadata
- **Traceable provenance**: Every evidence item records its source, collector, and modification history
- **Assertion-bound**: Evidence is always linked to a specific assertion or finding
- **Evaluable**: Evidence has measurable attributes for relevance, reliability, and sufficiency
- **Governed lifecycle**: Evidence has a defined lifecycle from collection through retention to disposition

## 7. Key Concepts

- **Evidence Item**: The atomic unit of evidence — a document, data extract, screenshot, interview note, etc.
- **Evidence Type**: Categorisation of evidence (documentary, testimonial, physical, analytical)
- **Evidence Source**: The origin of the evidence (system, person, observation)
- **Collection Method**: How the evidence was obtained (extraction, interview, inspection, confirmation)
- **Assertion Link**: The specific engagement assertion the evidence supports
- **Evidence Quality Score**: Multi-dimensional assessment of relevance, reliability, and sufficiency
- **Evidence Gap**: An assertion with insufficient supporting evidence
- **Chain of Custody**: The immutable history of evidence handling and modification

## 8. Operational Implications

- Every evidence item must be registered with metadata upon collection
- Evidence must be linked to assertions before it is considered in evaluation
- Evidence gaps must be tracked and resolved before engagement closure
- Evidence review is a formal step with sign-off
- Evidence retention policies must be enforced at the item level

## 9. Product Implications

- The product must provide evidence collection interfaces that enforce metadata capture
- Evidence linking to assertions must be a core workflow, not an afterthought
- Evidence gap analysis must be visible and actionable
- Evidence review must support annotation and discussion without modifying the evidence
- The product must integrate with EDI for immutable storage and retrieval

## 10. Architecture Implications

- Evidence is stored in EDI as immutable, versioned objects
- Evidence metadata is stored alongside the evidence blob but is independently queryable
- Evidence links are first-class domain relationships, not foreign keys
- Evidence lifecycle is managed through domain events (collected, linked, reviewed, retained, disposed)
- Integration with Findings Intelligence (05.06) and Sampling Intelligence (05.08) via shared evidence references

## 11. Governance Implications

- Evidence must be immutable once collected — no modification without a new version
- Chain of custody is governance-enforced through EDI's append-only log
- Evidence retention and disposition are subject to regulatory requirements
- Governance policies can mandate minimum evidence types per assertion class
- Evidence quality assessment must be documented and reviewable

## 12. AI / Intelligence Implications

- AI maps the evidence landscape across engagement assertions, visualising coverage
- AI identifies evidence gaps by comparing collected evidence against engagement scope
- AI assesses evidence consistency — flagging conflicts between evidence items
- AI does not determine evidence sufficiency; that remains a human judgement
- AI learns from evidence quality assessments to improve future gap detection

## 13. UX Implications

- Evidence collection must be fast and low-friction to encourage structured capture
- Evidence-to-assertion mapping must be visually navigable
- Evidence gap indicators must be prominent without creating false urgency
- Evidence review must allow comparison and annotation
- The UX must reinforce that evidence is the unit of trust — every screen should make evidence status visible

## 14. Commercial Implications

- Evidence management as a structured intelligence capability differentiates from file-storage competitors
- Evidence analytics (coverage, quality trends) become a consulting deliverable
- Organisations in regulated industries will pay for defensible evidence management
- Evidence reusability across engagements reduces cost for repeat clients
- No SaaS dashboard for evidence — value is in structured, defensible evidence

## 15. Anti-Patterns

- **Evidence as attachment**: Treating evidence as a file without metadata, links, or context
- **Evidence hoarding**: Collecting excessive evidence without linking it to assertions
- **Weak evidence acceptance**: Accepting unreliable evidence because it is easy to obtain
- **Evidence modification**: Editing evidence in place without versioning or chain of custody
- **Evidence as output**: Treating evidence collection as a deliverable rather than a means to an opinion
- **AI evidence evaluation**: Letting AI determine sufficiency or reliability autonomously
- **Evidence silos**: Evidence stored outside the engagement context, unlinked from assertions

## 16. Examples

- **Documentary evidence**: An accounts payable policy document collected as PDF. Metadata records document type, issue date, owner, version. Linked to the assertion "AP controls are adequately designed." Chain of custody records collector, collection date, verification hash.
- **Analytical evidence**: A data extract showing invoice approval cycle times. Metadata records extraction date, source system, query parameters, extractor identity. Linked to the assertion "Invoice processing is timely." Evidence type is analytical; source is the ERP system.

## 17. Enterprise Impact

- Defensible evidence management reduces legal and regulatory exposure
- Evidence reusability across engagements reduces collection effort
- Evidence gap analysis improves audit quality by preventing insufficiently supported opinions
- Standardised evidence practices improve consistency across the audit function
- Structured evidence enables enterprise-wide evidence intelligence for risk insights

## 18. Long-Term Strategic Importance

Evidence is the unit of trust, and trust is the foundation of audit. Evidence Intelligence Theory establishes how AQLIYA manages evidence at scale — not as files but as structured, verifiable, intelligence-bearing entities. As the corpus of evidence grows, AQLIYA's ability to surface patterns, detect anomalies, and support human judgement compounds. Evidence Intelligence is the substrate upon which Findings Intelligence and all higher-level audit intelligence are built.

## 19. Related Documents

- **05.01 AuditOS Thesis** — Evidence as unit of trust is a foundational principle of the Thesis
- **05.02 Audit Intelligence Theory** — Evidence context is enriched by the intelligence pipeline
- **05.03 AI-Assisted Audit Philosophy** — Defines AI boundaries for evidence extraction and candidate linking
- **05.05 Audit Engagement Model** — Evidence is collected and evaluated within the engagement lifecycle
- **05.06 Findings Intelligence Theory** — Findings reference evidence as their supporting basis
- **05.08 Sampling Intelligence Theory** — Evidence collection often involves sampling methods
- **05.10 Explainable Audit Intelligence** — Evidence traceability enables explainable audit opinions

## 20. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full 20-section document defining Evidence Intelligence Theory |
| 0.2 | 2026-05-08 | Founding Team | Wave 3C promotion to Reviewed. Fixed cross-references. Added doctrinal anchors: wedge positioning, Financial Intelligence as first moat, governance as structural, AI assists/humans decide. |
