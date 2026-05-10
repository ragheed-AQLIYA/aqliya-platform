---
title: Source Data Reliability Theory
document_id: 09.02
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 2 - Domain Theory
related_documents: 04.01, 08.01, 09.01, 09.04, 09.05, 09.06, 09.11, 09.12
---

# Source Data Reliability Theory

## 1. Purpose

This document defines how AQLIYA evaluates whether a source system or source file is reliable enough to contribute data into trusted workflows.

## 2. Thesis

**Source data reliability is the degree to which a source can be expected to produce stable, accurate, attributable, and reproducible records for a defined enterprise use case.**

Reliability is about the source's behavior over time, not only the cleanliness of one extract.

## 3. Problem

Enterprises often assume official systems are reliable simply because they are official. In practice, the same ERP instance can contain manual workarounds, incomplete exports, local customizations, timing gaps, broken integrations, or undocumented corrections. File-based handoffs add more risk through manual manipulation and uncontrolled versioning.

Without a reliability doctrine, downstream teams mistake system authority for operational trustworthiness.

## 4. Why Existing Systems Fail

Most systems either trust the source brand name or evaluate only record-level errors. They miss broader reliability factors such as extract repeatability, cutoff discipline, source control ownership, mapping stability, and whether the same query run twice produces the same answer.

Generic data tooling measures pipeline success. AQLIYA must measure whether the source can support defensible evidence.

## 5. AQLIYA Philosophy

Source reliability is not binary and it is not inherited from vendor reputation. AQLIYA assesses reliability by combining system authority, extraction method, operational controls, historical consistency, and change transparency. Financial Intelligence makes this especially important because financial truth is often distorted by source quirks long before analysis begins.

Reliability feeds data trust, but does not determine it alone. A reliable source can still produce incomplete datasets; an unreliable source cannot be rehabilitated by attractive analytics.

## 6. Core Principles

1. Source authority does not equal source reliability.
2. Reliability must be assessed at source, extract method, and dataset instance levels.
3. Repeatability is a core reliability property.
4. Manual intervention lowers reliability unless fully governed and attributed.
5. Hidden transformations reduce reliability.
6. Reliability can improve through approved controls, but not through assumption.
7. Reliability history should influence future trust decisions.
8. Critical workflows require stricter reliability thresholds than exploratory workflows.

## 7. Key Concepts

- **Source Reliability:** Expected trustworthiness of a source over repeated use.
- **Authoritative Source:** The system officially responsible for a record domain.
- **Extraction Reliability:** Trustworthiness of the method used to obtain data from the source.
- **Repeatability:** Ability to reproduce the same output under the same conditions.
- **Control Compensator:** A documented control that reduces reliability risk, such as dual review or system reconciliation.

## 8. Operational Implications

1. Every onboarding must inventory candidate sources and rank their reliability.
2. Teams must document approved extraction methods.
3. Reliability incidents should be tracked as recurring operational risks.
4. Source changes require re-evaluation before downstream reliance resumes.
5. Firms need fallback handling when only lower-reliability sources are available.

## 9. Product Implications

1. Source profiles should expose reliability factors, not just connection status.
2. Users should see whether data came from direct integration, managed export, or manual upload.
3. Reliability warnings must appear before evidence acceptance, not after.
4. Product logic should distinguish high-authority low-repeatability sources from highly repeatable approved extracts.
5. Workflow rules should be able to require higher reviewer scrutiny for lower-reliability sources.

## 10. Architecture Implications

1. Source metadata must persist system identity, extraction path, operator, timing, and control context.
2. Reliability scoring should be versioned and historically queryable.
3. Architecturally, source adapters must declare known limitations and failure modes.
4. The platform must preserve raw extracts for replay and comparison where governance allows.
5. Reliability assessments should integrate with lineage and provenance services.

## 11. Governance Implications

Governance defines which source classes may support which decision classes. For example, direct ERP extracts may support material review paths, while manually adjusted spreadsheets may require compensating controls, heightened review, or exclusion from trusted workflows.

## 12. AI / Intelligence Implications

AI models must consume source reliability as an input signal. A sophisticated anomaly result generated from a low-reliability source should be presented with appropriately constrained confidence and escalation guidance. AI must not flatten source differences into one generic confidence number.

## 13. UX Implications

Reviewers need a clear source story: source name, source type, extraction method, freshness, reliability posture, and known caveats. Reliability communication should support judgment, not overwhelm users with technical connector detail.

## 14. Commercial Implications

Strong source reliability handling improves enterprise trust during pilots because buyers quickly test whether AQLIYA can distinguish official records from merely convenient files. This is part of infrastructure credibility and a differentiator from lightweight automation products.

## 15. Anti-Patterns

1. **ERP Halo Effect.** Assuming all ERP data is reliable because it came from an ERP.
2. **CSV Equivalence.** Treating manually edited exports the same as controlled system extracts.
3. **Connector Theater.** Assuming a live integration guarantees reliable data.
4. **Repeatability Blindness.** Ignoring whether a source can reproduce prior results.
5. **Unowned Source Acceptance.** Accepting source feeds with no accountable owner.

## 16. Examples

**Example 1:** A direct read-only ERP extract with stable query logic and reconciliation controls receives high reliability, even before dataset-specific checks are completed.

**Example 2:** A spreadsheet emailed by a client controller is accepted only with lower reliability, explicit provenance notes, and additional reviewer approval.

**Example 3:** A source previously rated reliable drops after a schema change causes inconsistent period exports. All dependent workflows are downgraded pending remediation.

## 17. Enterprise Impact

1. Fewer hidden assumptions in regulated reviews.
2. Better control over where manual source risk enters the platform.
3. Faster root-cause analysis when downstream trust fails.
4. Improved reproducibility of evidence and findings.
5. Stronger buyer confidence in deployment readiness.

## 18. Long-Term Strategic Importance

Source reliability is a structural precursor to trustworthy Financial Intelligence and decision infrastructure. It prevents AQLIYA from becoming a generic ingestion layer that mistakes connectivity for credibility.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 04.01 | Financial Intelligence Thesis | Financial source reliability is core to the first moat |
| 08.01 | Governance and Trust Thesis | Governance determines acceptable source reliability for decisions |
| 09.01 | Data Trust Theory | Reliability is a major component of overall data trust |
| 09.04 | Data Lineage Theory | Reliability must remain traceable through transformations |
| 09.05 | Data Provenance Theory | Provenance explains who supplied and handled the source |
| 09.06 | Data Quality Scoring Theory | Reliability contributes to quality scoring |
| 09.11 | Financial Data Error Taxonomy | Reliability failures often generate error classes in the taxonomy |
| 09.12 | Garbage-In Risk Model | Low-reliability sources amplify downstream risk |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency and promoted to Reviewed |
