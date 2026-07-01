---
title: Financial Data Error Taxonomy
document_id: 09.11
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 4 - Definition
related_documents: 09.01, 09.06, 09.07, 09.08, 09.09, 09.10, 09.12
---

# Financial Data Error Taxonomy

## 1. Purpose

This document defines the taxonomy of errors that AQLIYA recognizes in financial data. It provides a structured classification that ensures every data defect encountered in financial workflows is named, categorized, and connected to the appropriate trust and governance response.

## 2. Thesis

**Financial data errors are not equally risky, equally detectable, or equally treatable. A precise taxonomy enables differentiated detection, targeted remediation, and calibrated governance response.**

Without a shared taxonomy, enterprises conflate a rounding discrepancy with a missing-entity omission, increasing both remediation cost and decision risk.

## 3. Problem

Financial data within audit, accounting, and regulatory workflows contains many error types. Some are obvious structural failures; others are subtle semantic misalignments that pass validation but distort meaning. When all errors are treated generically, reviewers cannot prioritize remediation, governance cannot calibrate response, and products cannot route each error type to the correct handling path.

## 4. Why Existing Systems Fail

Existing systems typically fail in one of three ways:

1. They classify errors only by technical type, such as null values, type mismatches, or format violations, without capturing the financial semantics that determine business impact.
2. They treat all data quality issues as equivalent, forcing reviewers to manually triage what matters most.
3. They detect errors at ingestion but lose the error context through downstream processing, making it impossible to trace business impact back to the original defect.

## 5. AQLIYA Philosophy

AQLIYA classifies financial data errors by their impact on evidence integrity and decision fitness, not only by their technical form. The taxonomy is designed to connect each error type to specific trust effects, confidence reductions, and governance consequences. Because Financial Intelligence is the first moat, this taxonomy must be precise enough for regulated financial workflows where a misclassification can change a professional opinion or a regulatory outcome.

## 6. Core Principles

1. Errors are classified by financial impact type, not only by technical form.
2. Each error type must map to a specific trust effect and governance response.
3. The taxonomy must be extensible: new error types must be addable without restructuring.
4. Error severity must be linked to decision materiality: the same error type can be critical in one workflow and minor in another.
5. Errors must be preserved through the trust chain, not resolved and forgotten.
6. AI may detect and suggest error classifications, but humans confirm for material workflows.
7. The taxonomy must support both atomic errors at the field level and compound errors at the dataset or ledger level.
8. Error classification must be explainable: reviewers must understand why an error is categorized as it is.

## 7. Key Concepts

- **Structural Error:** A defect in data format, type, or schema that prevents processing or interpretation. Examples: null required field, non-numeric value in a financial amount column, duplicate key.
- **Semantic Error:** A defect where the data is structurally valid but financially or contextually incorrect. Examples: account mapped to wrong category, period assigned to wrong fiscal year, transaction misclassified between capital and operating.
- **Completeness Error:** A defect where required data is missing or insufficient. Examples: missing entity in a consolidated set, absent sub-ledger detail, incomplete journal entry.
- **Provenance Error:** A defect where data source, transformation history, or attribution is unknown or unverifiable. Examples: untraceable manual adjustment, data from unmapped source system, transformation applied without audit trail.
- **Timeliness Error:** A defect where data is stale, prematurely included, or outside the expected reporting period. Examples: prior-period data included in current scope, stale exchange rates, reclassified data not refreshed.
- **Consistency Error:** A defect where data contradicts other data within or across datasets. Examples: intercompany imbalance, trial balance discrepancy, conflicting signs on the same account.
- **Compound Error:** An error that emerges from the intersection of multiple atomic errors. Examples: missing entity plus wrong period classification; semantic mis-mapping combined with provenance uncertainty.

## 8. Operational Implications

1. Teams must adopt this taxonomy as the shared language for financial data quality issues.
2. Error triage procedures must route each error type to the correct remediation path.
3. Severity assessment must account for workflow materiality, not just error frequency.
4. Operations should track error distributions by type to identify systemic problems.
5. Compound errors require cross-reference detection, not just individual field checks.

## 9. Product Implications

1. The product must classify errors by this taxonomy and display the classification to reviewers.
2. Each error type must trigger the appropriate governance action: block, constrain, flag, or permit.
3. Reviewers need to see error severity in the context of their specific workflow and decision scope.
4. Error patterns across datasets should be surfaced to identify systemic issues rather than isolated defects.
5. The product should suggest resolution paths specific to each error type.

## 10. Architecture Implications

1. Error types must be stored as typed, structured metadata, not free-text notes.
2. The taxonomy must be extensible at the configuration layer without requiring schema migration.
3. Error metadata must propagate through the trust chain alongside affected data.
4. The classification engine must support both rule-based detection and AI-assisted suggestion, with human confirmation for material categories.
5. Error aggregation must preserve individual error types for drill-down, not collapse them into counts.

## 11. Governance Implications

Governance maps each error type to permitted actions, required escalation, and acceptable risk thresholds per workflow materiality. A provenance error in a partner-facing engagement requires different treatment than a timeliness error in internal analysis. The taxonomy provides the shared vocabulary for governance rules.

## 12. AI / Intelligence Implications

AI can detect errors, suggest classifications, and identify compound patterns. However, for material financial workflows, AI-assisted classification is a suggestion, not a final determination. AI models should be trained on this taxonomy to ensure consistency, and they must surface the reasoning behind suggested classifications.

## 13. UX Implications

Reviewers need to see errors categorized by financial impact type, not just by technical form. The UX should make the taxonomy navigable: filter by error type, sort by severity, and group by affected workflow. Error detail must include what is wrong, why it matters for this specific decision, and what the permitted next action is.

## 14. Commercial Implications

A precise financial error taxonomy is directly valuable in regulated domains where misclassification creates professional liability. It supports AQLIYA's Financial Intelligence moat by enabling differentiated handling that generic data quality tools cannot offer. Taxonomy-driven error management reduces rework and increases reviewer productivity.

## 15. Anti-Patterns

1. **Flat Error Reporting.** Treating all data defects as undifferentiated quality issues and reporting them as a single list.
2. **Technical-Only Classification.** Classifying errors by type mismatch or null count without mapping to financial impact.
3. **Error Erasure.** Resolving or overriding an error and removing it from the record rather than preserving it as annotated context.
4. **Severity Without Context.** Assigning fixed severity levels without linking to workflow materiality or decision scope.
5. **Compound Error Blindness.** Detecting atomic errors individually but missing the interaction effects that create compound errors.
6. **Taxonomy Inflation.** Creating so many error subtypes that the taxonomy becomes unusable and reviewers default to generic classification.

## 16. Examples

**Example 1:** A trial balance import has a null value in the account code column. This is a structural error that blocks automatic account mapping. The product classifies it as a structural error, severity critical for mapping workflows, permits manual entry but blocks automated processing, and flags it for remediation.

**Example 2:** A journal entry is posted to the wrong fiscal year. This passes structural and completeness checks but is a semantic error with high time-sensitivity. The product classifies it as a semantic error, severity high for period-specific workflows, and links it to the consistency error detection that compares against period boundaries.

**Example 3:** An intercompany imbalance is detected between two entities in a consolidation set. This is a consistency error that also creates a compound error with the semantic mis-mapping that caused it. The product preserves both the compound error and its atomic contributors in the error metadata.

## 17. Enterprise Impact

1. Faster error triage through shared, precise classification.
2. Reduced remediation cost by routing errors to the correct handling path.
3. Better risk assessment by linking error types to decision materiality.
4. Improved systemic quality through error pattern analysis.
5. Stronger regulatory posture through defensible error documentation.

## 18. Long-Term Strategic Importance

The Financial Data Error Taxonomy is essential infrastructure for AQLIYA's Financial Intelligence moat. As AQLIYA expands beyond AuditOS into broader Enterprise Decision Intelligence, this taxonomy provides the precision needed to govern financial data quality in any regulated domain. Without it, error handling remains generic and AQLIYA cannot claim differentiated treatment of the data errors that matter most in financial workflows.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 09.01 | Data Trust Theory | Error types are the defects that reduce data trust |
| 09.06 | Data Quality Scoring Theory | Error types and severity shape quality scores |
| 09.07 | Invalid Data Handling Theory | Structural and provenance errors may render data invalid |
| 09.08 | Uncertain Data Treatment Theory | Some semantic and timeliness errors create uncertainty rather than invalidity |
| 09.09 | Data Confidence Model | Error types reduce confidence on specific dimensions |
| 09.10 | Data-To-Decision Trust Chain | Error types propagate through the chain and affect downstream links |
| 09.12 | Garbage-In Risk Model | Unclassified or mishandled errors accumulate into garbage-in risk |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency and promoted to Reviewed |