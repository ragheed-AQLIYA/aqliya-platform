# AI Role and Limitations

## Purpose

This document defines the role of AI within AuditOS and its limitations. AI in AuditOS is always assistive, always evidence-backed, and always subject to human review.

## AI Role

AI in AuditOS serves as an **assistive layer** that augments professional judgment — it does not replace it. The system uses AI to:

| Function | Description | Human Role |
|----------|-------------|------------|
| Suggest account mappings | Analyze account names, codes, and patterns to propose mappings | Confirm, correct, or override |
| Detect anomalies | Identify unusual balances, trends, and classifications | Investigate and disposition |
| Draft finding language | Generate initial finding descriptions from signals and evidence | Review, edit, and approve |
| Draft recommendation language | Suggest recommendation text based on findings | Review, edit, and approve |
| Rank reviewer queues | Prioritize items by risk, materiality, and deadline | Review and process in priority order |
| Identify evidence gaps | Detect accounts without sufficient supporting evidence | Request and verify evidence |
| Generate financial statement drafts | Produce draft statements from mapped accounts | Review each line item |
| Generate draft notes | Produce draft notes with available data | Review, supplement, approve |

## What AI Does Not Do

| Operation | Why | Enforcement |
|-----------|-----|-------------|
| Approve evidence | Evidence verification requires human judgment about sufficiency and relevance | Workflow engine blocks AI from evidence approval actions |
| Finalize findings | Findings carry audit implications and professional accountability | Findings lifecycle requires human review |
| Issue audit conclusions | Conclusions require professional judgment and liability | System output marked as draft |
| Bypass reviewer | Human authority is structurally required at decision joints | Workflow engine enforces human review gates |
| Sign off on outputs | Signing carries professional and legal responsibility | Publication requires human approval |
| Make professional judgments | Professional judgment is exclusively human | All AI outputs are candidates, not conclusions |
| Operate without evidence trace | All governed AI must be explainable and traceable | Every AI output includes provenance metadata |

## AI Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Cannot verify source data accuracy | Outputs depend on input quality | Trust assessment at data intake |
| Cannot exercise professional judgment | AI suggests, humans decide | All outputs are draft — require human review |
| Cannot interpret complex regulations | Entity-specific regulatory compliance | Standards library + reviewer expertise |
| Cannot assess non-financial information | Limited to structured financial data | System flags information gaps |
| Cannot predict future events | Forward-looking information requires judgment | Management estimates and projections |
| Cannot understand entity-specific context | Business context requires professional knowledge | Reviewer provides entity understanding |

## AI Output Quality

| Quality Dimension | Description | Standard |
|-------------------|-------------|----------|
| Accuracy | Correctness of calculations, mappings, and classifications | Validated against rules |
| Completeness | Coverage of available data | All data processed |
| Explainability | Ability to trace why a specific output was produced | Every output includes rationale |
| Consistency | Same inputs produce same outputs | Deterministic where possible |
| Confidence | Level of certainty in the output | Expressed per output type |

## AI Model Governance

| Requirement | Description |
|-------------|-------------|
| Model versioning | Every AI output records the model version and configuration |
| Input tracking | Every AI output records the input data snapshot used |
| Output auditing | Every AI output is recorded in the audit trail |
| Performance monitoring | AI accuracy and confidence are measured against reviewer actions |
| Update management | Model updates are governed and communicated |
| Fallback behavior | If AI cannot produce a confident output, it signals uncertainty rather than generating unreliable output |
