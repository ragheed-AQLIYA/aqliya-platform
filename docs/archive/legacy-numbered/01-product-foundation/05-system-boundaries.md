# System Boundaries

## Purpose

This document defines what AuditOS does and does not do. These boundaries are derived from the AQLIYA Core Doctrine and are non-negotiable — they protect the product's identity, the firm's professional responsibility, and the trust of regulators and clients.

## In Scope

| Capability | Description |
|------------|-------------|
| Financial data ingestion | Import trial balance, ledger, journal entry data in standard formats |
| Account mapping | Map client chart of accounts to canonical financial model |
| Financial statement drafting | Generate draft statements from mapped data |
| Notes drafting | Generate draft notes with available data and flag missing information |
| Evidence requirement identification | Determine supporting evidence needed per account area |
| Review finding generation | Identify potential issues with severity classification |
| Reviewer workflow | Route findings through governed review and approval processes |
| AI assistance | Suggest mappings, draft findings, flag anomalies — all with evidence traces |
| Traceability | Maintain complete, immutable record from source data to published output |
| Publication | Generate client-facing engagement packages from approved outputs |

## Out of Scope

| Capability | Reason |
|------------|--------|
| Issue statutory audit opinions | Audit opinions require professional judgment and liability that cannot be delegated to a system |
| Replace licensed auditors | Professional accountability is non-negotiable (doctrine) |
| Guarantee compliance without review | Compliance requires professional assessment of entity-specific facts and circumstances |
| Finalize official financial statements without approval | Financial statements require management and auditor approval — system outputs are drafts |
| Accept evidence autonomously | Evidence verification requires human judgment (doctrine) |
| Operate as black-box AI | All AI in governed workflows must be explainable (doctrine) |
| Generate tax or zakat filings | Tax compliance is a separate domain requiring specialized expertise |
| Act as ERP or transaction processing system | AQLIYA is decision infrastructure, not transaction processing |
| Manage client relationships (CRM) | CRM is a separate category outside AQLIYA's identity |
| Provide conversational AI interface | Chat interfaces are structurally incompatible with governed workflows (doctrine) |

## Boundary Enforcement

| Boundary | Enforcement Mechanism |
|----------|----------------------|
| Outputs are draft | Every output carries a prominent "DRAFT — NOT FINAL" notice |
| AI does not approve | Workflow engine blocks AI from approval actions |
| Evidence requires verification | Evidence starts as "candidate" — requires human verification |
| Findings require review | Findings cannot advance to publication without approval |
| Critical findings require partner approval | Workflow engine enforces approval authority levels |
| All actions are attributable | Every user action is recorded with identity and timestamp |
