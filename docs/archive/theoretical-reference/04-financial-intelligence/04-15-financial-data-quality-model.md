---
title: Financial Data Quality Model
document_id: 04.15
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents: 04.01, 04.08, 04.10, 04.11, 04.14, 09.01, 09.06, 09.10
---

# Financial Data Quality Model

## 1. Purpose

This document defines the Financial Data Quality Model as the AQLIYA framework for assessing, scoring, and communicating the quality of financial data. The model provides a structured methodology for evaluating completeness, consistency, accuracy, timeliness, provenance, and structural integrity — producing a quality assessment that informs confidence in all downstream intelligence signals.

## 2. Thesis

**The Financial Data Quality Model is a structured, multi-dimensional framework for assessing financial data quality — producing a composite quality score and per-dimension assessments that determine the fitness of financial data for intelligence generation and audit decision support.**

Financial data quality is not binary. Data is not simply "good" or "bad." It has multiple quality dimensions — completeness of fields, consistency across periods, accuracy of values, timeliness of extraction, provenance completeness, and structural integrity — each of which may vary independently. A dataset may have complete fields but inconsistent period representation. It may be timely but lack provenance metadata.

The Financial Data Quality Model assesses each quality dimension independently and produces a composite quality score that propagates to all downstream intelligence. Signals generated from high-quality data carry more confidence. Signals from low-quality data are flagged with reduced confidence or quarantined entirely.

```
DATA QUALITY MODEL DIMENSIONS

    Financial Data Quality Score
        │
        ├── Completeness (30% weight)
        │   ├── Field completeness
        │   ├── Record completeness
        │   ├── Period completeness
        │   └── Entity completeness
        │
        ├── Consistency (25% weight)
        │   ├── Structural consistency (debits = credits)
        │   ├── Cross-period consistency
        │   ├── Cross-source consistency
        │   └── Relationship consistency
        │
        ├── Accuracy (15% weight)
        │   ├── Value range reasonableness
        │   ├── Data type correctness
        │   ├── Format conformance
        │   └── Calculation verification
        │
        ├── Timeliness (10% weight)
        │   ├── Extraction recency
        │   ├── Period coverage
        │   ├── Reporting lag
        │   └── Data freshness
        │
        ├── Provenance (10% weight)
        │   ├── Source attribution completeness
        │   ├── Extraction metadata presence
        │   ├── Transformation traceability
        │   └── Field-level lineage
        │
        └── Structural Integrity (10% weight)
            ├── Schema conformance
            ├── Reference integrity
            ├── Uniqueness compliance
            └── Format specification adherence
```

## 3. Problem

Financial data quality assessment today is inconsistent, subjective, and poorly integrated with intelligence generation:

- **Quality is assessed informally.** Reviewers form a subjective impression of data quality during manual validation. There is no structured, repeatable quality assessment methodology.

- **Quality is not quantified.** "The data looks clean" is a qualitative judgment, not a quantifiable score. It cannot be compared across periods, clients, or datasets.

- **Quality dimensions are conflated.** Completeness, consistency, and accuracy are treated as a single quality concept rather than independent dimensions. A dataset that is complete but inconsistent receives the same treatment as one that is incomplete but consistent.

- **Quality does not propagate to intelligence.** Even when quality is assessed (e.g., "trial balance is balanced"), the assessment does not flow to downstream intelligence. Signals are generated with the same confidence regardless of underlying data quality.

- **Quality is assessed once, at ingestion.** Data quality can degrade or improve over time as new data arrives, data sources change, or quality issues are resolved. Quality assessment is not continuously updated.

- **Quality is not tenant-comparable.** There is no standard quality framework that enables comparison of data quality across clients, periods, or data sources within a consistent methodology.

For audit firms, this means data quality is an implicit factor in every engagement but is never systematically measured, documented, or propagated to intelligence confidence. Quality-related decisions — scope adjustments, reliance determinations, procedure modifications — are made without quality data.

## 4. Why Existing Systems Fail

| Category | What It Does | Data Quality Gap |
|---|---|---|
| **Data Quality Tools** (Informatica DQ, Talend) | Profiles and monitors data quality | Applies generic data quality metrics (completeness, uniqueness, timeliness) but lacks financial domain context. Does not know that a trial balance should balance or that debit/credit conventions must be consistent. |
| **ERP Systems** | Manages transactional data quality | Ensures transactional integrity within the ERP but does not assess export quality. A trial balance export may have quality issues not present in the source system. |
| **Audit Tools** | Imports and formats financial data | Provides basic validation checks but no structured quality scoring or dimensional assessment. Quality assessment is implicit, not explicit. |
| **Spreadsheet Review** | Manual quality assessment | Inconsistent, subjective, non-repeatable. Each reviewer applies different quality criteria. No structured quality output. |
| **Generic AI** | Parses financial documents | Cannot assess financial data quality in domain-specific terms. Does not know what completeness means for a trial balance or what consistency means for journal entries. |

**The common failure:** existing approaches either assess data quality in generic terms without financial domain context (data quality tools) or assess financial data without structured quality methodology (audit tools, spreadsheets). The Financial Data Quality Model combines structured quality dimensions with financial domain context.

## 5. AQLIYA Philosophy

The Financial Data Quality Model at AQLIYA rests on these philosophical commitments:

**Quality is multi-dimensional.** Financial data quality is not a single attribute. It is a composite of completeness, consistency, accuracy, timeliness, provenance, and structural integrity. Each dimension is assessed independently and contributes to the overall score.

**Quality is quantifiable.** Quality is not a subjective judgment. It is a structured assessment with defined criteria, measurable metrics, and repeatable scoring methodology.

**Quality is contextual.** The same data may have acceptable quality for one engagement and unacceptable quality for another. Quality thresholds are engagement-configurable.

**Quality propagates to confidence.** The data quality score is a primary input to signal confidence. High-quality data produces high-confidence signals. Low-quality data produces low-confidence signals.

**Quality is continuously assessed.** Data quality is not a point-in-time assessment. It is updated as new data arrives, as quality issues are resolved, and as the dataset evolves.

**Quality is transparent.** The quality score is not a black-box number. It is decomposed into dimension scores, criterion scores, and evidence — reviewers can see exactly what contributed to the quality assessment.

**Quality drives decisions.** Data quality assessment informs engagement decisions — scope, reliance, procedure selection, confidence in conclusions. Quality is not a technical metric. It is a decision input.

**Evidence is the unit of trust.** Data quality assessment is what distinguishes evidence from raw data — a structured, quantified, multi-dimensional evaluation that provides the provenance and reviewability required for governed decisions.

**Financial Intelligence is AQLIYA's first moat.** The Financial Data Quality Model provides the confidence foundation that every FI signal depends on — a domain-specific, multi-dimensional framework that generic tools lack. AuditOS is the first wedge; quality-assessed data powers its audit intelligence.

## 6. Core Principles

1. **Six quality dimensions are assessed.** Completeness, consistency, accuracy, timeliness, provenance, and structural integrity are the six dimensions of the Financial Data Quality Model.

2. **Each dimension has defined criteria.** Each quality dimension is assessed against specific, measurable criteria — field completeness percentage, debit/credit balance match, period alignment correctness, extraction timestamp presence.

3. **Dimension scores are weighted to a composite.** Dimension weights are configurable per engagement. Default weights reflect typical audit quality priorities (completeness and consistency weighted highest).

4. **Quality scores are normalized to 0-100.** All dimension scores and the composite score are on a 0-100 scale, enabling consistent interpretation and comparison.

5. **Quality thresholds are engagement-configurable.** The score thresholds for "acceptable," "marginal," and "unacceptable" quality are configurable per engagement based on risk, scope, and professional standards.

6. **Quality scores propagate to signal confidence.** The data quality score is a primary input to the signal confidence model. Low-quality data produces signals with reduced confidence.

7. **Quality assessment is repeatable and attributable.** The same data produces the same quality score with the same methodology. Quality assessments carry generation metadata for auditability.

8. **Quality is assessed per dataset, per period, per source.** Each data load, each period, and each data source receives its own quality assessment. Composite quality for the engagement aggregates across datasets.

## 7. Key Concepts

- **Financial Data Quality Score:** A composite score (0-100) representing the overall quality of financial data, derived from six dimension scores with engagement-configurable weights.

- **Completeness Dimension:** Assessment of field-level completeness, record-level completeness (all required accounts present), period completeness (all periods present), and entity completeness (all required entities present).

- **Consistency Dimension:** Assessment of structural consistency (debits = credits), cross-period consistency (comparable account structures), cross-source consistency (GL to sub-ledger reconciliation), and relationship consistency (expected account relationship patterns).

- **Accuracy Dimension:** Assessment of value range reasonableness, data type correctness, format conformance, and calculation verification (roll-forwards, subtotals).

- **Timeliness Dimension:** Assessment of extraction recency (how recent is the data), period coverage (all periods of the engagement period are covered), reporting lag (time between period end and data extraction), and data freshness.

- **Provenance Dimension:** Assessment of source attribution completeness, extraction metadata presence (timestamp, system identifier), transformation traceability, and field-level lineage.

- **Structural Integrity Dimension:** Assessment of schema conformance (data matches expected structure), reference integrity (foreign key relationships intact), uniqueness compliance (no duplicate records), and format specification adherence.

- **Quality Threshold:** A configurable score boundary determining quality classification — e.g., >= 80 = Acceptable, 60-79 = Marginal, < 60 = Unacceptable.

- **Confidence Propagation:** The mechanism by which the data quality score informs the confidence level of downstream signals, findings, and recommendations.

- **Quality Artifact:** The structured, persistent record of quality assessment — dimension scores, criterion scores, evidence, and generation metadata — retained as an evidence document.

## 8. Operational Implications

1. Data quality assessment runs automatically as part of the validation pipeline. Every ingested dataset receives a quality score.
2. Quality scores are available immediately after validation completes. Reviewers see data quality status at engagement start.
3. Quality thresholds are configured per engagement during setup. Default thresholds are suggested based on engagement type and risk.
4. Quality scores below the acceptable threshold trigger notifications — the engagement team is alerted that data quality may affect intelligence confidence.
5. Quality scores are reviewed during engagement kickoff — data quality issues are documented and addressed before substantive work begins.
6. Quality improvement is tracked across periods — quality trends show whether data quality is improving, stable, or deteriorating over successive data loads.
7. Professional services configure quality weights and thresholds based on engagement risk, client size, and regulatory requirements.

## 9. Product Implications

1. The data quality score is displayed prominently in the engagement workspace — a score badge (color-coded: green/amber/red) with trend indicator.
2. Quality dimension breakdown is visual — a radar or bar chart showing scores for each of the six dimensions.
3. Quality criteria detail is drillable — clicking a dimension shows individual criterion scores, pass/fail status, and evidence.
4. Quality thresholds are configurable in engagement settings — users set acceptable/marginal/unacceptable boundaries.
5. Quality history is shown as a timeline — how quality has changed across data loads and over periods.
6. Quality impact on confidence is visible — downstream signal views show how data quality score contributes to signal confidence.
7. The quality artifact is exportable as an evidence document for working paper inclusion.

## 10. Architecture Implications

1. Quality assessment is a service within the validation pipeline — it consumes validation results and produces quality scores.
2. The quality model defines dimension weights, criteria definitions, and scoring methodology as governed configuration.
3. Six dimension scores are computed by independent sub-services — completeness, consistency, accuracy, timeliness, provenance, structural integrity.
4. The composite score is computed by weighted aggregation of dimension scores.
5. Quality scores are stored as structured metadata attached to datasets — enabling efficient query and propagation.
6. Confidence propagation consumes quality scores as inputs to signal confidence computation.
7. Quality thresholds are stored as engagement configuration — changes are versioned and governed.
8. Quality history is stored as a time-series — enabling trend analysis and cross-period comparison.

## 11. Governance Implications

1. Quality model configuration — dimension weights, criteria definitions, scoring methodology — is governed. Changes require documented rationale and version capture.
2. Quality thresholds — what score constitutes acceptable vs. unacceptable quality — are governed parameters per engagement.
3. Quality scores below the acceptable threshold that are accepted for use require documented override rationale.
4. Quality assessment methodology — how each dimension is scored, what criteria are included — must be transparent and auditable for regulatory inspection.
5. Quality score changes over time are monitored — significant drops in quality trigger governance notification and investigation.
6. Quality artifacts are retained as evidence documents for the engagement lifecycle and beyond.

## 12. AI / Intelligence Implications

1. AI assists in quality assessment by detecting subtle quality issues that rule-based criteria may miss — atypical data patterns, emerging quality deterioration, format drift.
2. Machine learning models predict quality score trends — detecting early indicators of quality deterioration before they cross threshold boundaries.
3. AI suggests quality threshold adjustments based on engagement characteristics and historical quality patterns for similar clients.
4. Anomaly detection in quality scores identifies sudden quality changes that may indicate data source issues, export configuration changes, or data integrity problems.
5. NLP assists in assessing provenance quality — extracting source attribution and extraction metadata from document headers, file names, and embedded metadata.
6. Cross-client quality learning is restricted to aggregated, de-identified quality patterns and benchmark data under governance approval.

## 13. UX Implications

1. Data quality score is a persistent, highly visible element in the engagement UI — a score badge in the header or left navigation.
2. Quality dimension breakdown is interactive — clicking a dimension shows its criteria, scores, pass/fail status, and supporting evidence.
3. Quality thresholds are displayed visually — the score is shown on a color-coded scale with threshold markers (acceptable/marginal/unacceptable zones).
4. Quality history is shown as a line chart — quality score over time with data load events and threshold markers.
5. Quality impact on signal confidence is shown in signal detail — "Data quality score: 85 (contributes HIGH confidence to this signal)."
6. Quality artifact export is a one-click action — generates a structured quality report for working paper inclusion.

## 14. Commercial Implications

1. Data quality scoring is a commercial proof point. Enterprises pay to understand the reliability of their financial data. A structured quality score provides this understanding.
2. The wedge buyer is the engagement partner who needs to know, before work begins, whether the client's data can be relied upon for audit purposes.
3. Quality score trends demonstrate value over time — if data quality improves across successive engagements, the platform can claim credit for quality visibility and improvement.
4. Quality scores enable fact-based scoping decisions — engagements with high-quality scores may justify reduced procedures; low-quality scores support scope limitations or additional procedures.
5. Quality benchmarking (comparing a client's quality score to anonymized peer benchmarks) is an additional value proposition for quality-conscious clients.

## 15. Anti-Patterns

1. **Single-Number Quality.** Reducing data quality to a single score without dimensional breakdown. A single number obscures which aspects of quality pass and which fail.

2. **Static Quality Assessment.** Assessing quality once at ingestion and never updating. Quality should be continuously reassessed as new data arrives and as the dataset evolves.

3. **Generic Quality Criteria.** Applying generic data quality criteria (e.g., field completeness percentage) without financial domain context. A trial balance that is 100% field-complete but does not balance has a quality problem that generic criteria miss.

4. **Quality Without Propagation.** Computing quality scores that do not influence downstream confidence. Quality that does not affect intelligence is academic.

5. **Ignoring Quality Trends.** Using point-in-time quality scores without trend analysis. A client with declining quality scores over successive periods presents a different risk profile than one with stable or improving quality.

6. **Weighted Score Without Context.** Applying fixed dimension weights across all engagements. Quality weighting should reflect engagement-specific priorities — a fraud engagement may weight consistency higher; a first-year engagement may weight completeness higher.

7. **Over-Scoring.** Designing the quality model such that most datasets score above 90, making the score meaningless. Quality models must distinguish acceptable from marginal from unacceptable data.

8. **Quality Score Without Actionability.** Producing a quality score without linking to specific improvement actions. A low quality score should indicate what specifically needs to improve.

## 16. Examples

**Example 1: High-Quality Dataset.** A trial balance from a well-maintained SAP system: field completeness 100%, structural consistency pass (debits = credits), cross-period comparison pass (all prior period accounts present), accuracy pass (all values in expected ranges), timeliness pass (data extracted within 5 days of period end), provenance pass (source system, extraction timestamp, and export configuration documented). Composite quality score: 94/100. Classification: Acceptable. Signal confidence contribution: HIGH.

**Example 2: Marginal-Quality Dataset.** A QuickBooks trial balance with known data quality characteristics: field completeness 100%, structural consistency pass, cross-period comparison warning (8 prior period accounts not in current period), accuracy pass, timeliness pass, provenance warning (no extraction timestamp). Composite quality score: 72/100. Classification: Marginal. Signal confidence contribution: REDUCED. Reviewer is notified and decides to accept with documented rationale.

**Example 3: Low-Quality Dataset.** A manually compiled trial balance from a small entity: field completeness 85% (15 accounts missing account names), structural consistency fail (debits $1.2M, credits $1.18M), cross-period comparison N/A (no prior period data), accuracy fail (negative inventory balance), timeliness warning (data is 45 days old), provenance fail (no source attribution). Composite quality score: 38/100. Classification: Unacceptable. Signals from this dataset are flagged with LOW confidence. Engagement team is notified and scope implications are assessed.

**Example 4: Quality Trend Analysis.** Over four consecutive quarters, a client's quality scores are: Q1: 88, Q2: 82, Q3: 75, Q4: 71. The declining trend is detected and flagged. Investigation reveals that the client changed ERP configurations mid-year, causing data export quality deterioration. The engagement team addresses the issue with the client before the year-end audit.

## 17. Enterprise Impact

1. **Quality transparency** — every dataset carries a structured, quantified quality assessment. Engagement teams know data reliability from the start.
2. **Confidence-informed intelligence** — signal confidence is calibrated by data quality. High-quality data produces high-confidence signals; low-quality data produces appropriately cautious signals.
3. **Quality-driven decision-making** — engagement scope, reliance decisions, and procedure selection are informed by data quality data. Quality is a decision input, not an afterthought.
4. **Quality improvement tracking** — quality trends across periods and data loads provide visibility into whether data quality is improving, stable, or deteriorating.
5. **Consistent quality methodology** — all engagements use the same quality model with the same dimensions, criteria, and scoring. Quality is comparable across engagements.
6. **Regulatory defensibility** — quality artifacts document that data quality was assessed using a structured, repeatable methodology. Regulators can inspect quality assessment evidence.

## 18. Long-Term Strategic Importance

The Financial Data Quality Model is the foundation for confident intelligence. Without a structured, quantified, multi-dimensional quality assessment, every signal, finding, and recommendation carries implicit quality uncertainty — the reviewer does not know how reliable the underlying data is.

A quality model that is domain-specific, multi-dimensional, engagement-configurable, and confidence-propagating creates a durable advantage. Generic data quality tools lack financial domain context. Financial tools lack structured quality methodology. The combination is rare and defensible.

Over time, the quality model accumulates benchmark data — quality score distributions by industry, by ERP, by engagement type, by data source. This benchmark data enables predictive quality assessment, quality improvement recommendations, and evidence-based quality expectations for new engagements.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 04.01 | Financial Intelligence Thesis | Data quality is a prerequisite for intelligence |
| 04.08 | Financial Normalization Theory | Normalization produces quality annotations |
| 04.10 | Financial Validation Theory | Validation results inform quality assessment |
| 04.11 | Financial Signal Theory | Quality score contributes to signal confidence |
| 04.14 | ERP Normalization Theory | ERP-specific quality profiles feed quality assessment |
| 09.01 | Data Trust Theory | Quality model operationalizes data trust principles |
| 09.06 | Data Quality Scoring Theory | Formal methodology for quality scoring |
| 09.10 | Data-To-Decision Trust Chain | Quality score is a link in the trust chain |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | Initial definition of Financial Data Quality Model and six-dimension framework |
| 0.2 | 2026-05-08 | Founding Team | Promoted to Reviewed. Added evidence/data distinction doctrine, strengthened Financial Intelligence as first-moat positioning and AuditOS wedge connection. |
