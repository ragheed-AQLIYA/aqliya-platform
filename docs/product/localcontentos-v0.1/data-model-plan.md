# LocalContentOS v0.1 — Data Model Plan

## Reuse Strategy

LocalContentOS will **reuse** these existing platform models:

| Existing Model          | LC Purpose                                             |
| ----------------------- | ------------------------------------------------------ |
| `PlatformOrganization`  | Tenant identity (no new org model needed)              |
| `ClientWorkspace`       | Workspace scoping with `workspaceType: "content"`      |
| `Project`               | Execution boundary with `projectType: "local_content"` |
| `PlatformAuditLog`      | All mutation audit (use `productKey: "localcontent"`)  |
| `AuditEvent`            | Optional domain-specific audit events                  |
| `User` / `Organization` | Auth context (existing NextAuth session)               |

New models are needed for the local content domain. Each is prefixed `LocalContent` for clarity and namespace isolation.

## New Models (v0.1)

### LocalContentProject

| Field                    | Type          | Purpose                                      |
| ------------------------ | ------------- | -------------------------------------------- |
| `id`                     | String (cuid) | Primary key                                  |
| `organizationId`         | String        | Links to Organization (tenant)               |
| `platformOrganizationId` | String?       | Links to PlatformOrganization                |
| `clientWorkspaceId`      | String?       | Links to ClientWorkspace                     |
| `projectId`              | String?       | Links to Project                             |
| `name`                   | String        | Project name                                 |
| `reportingPeriod`        | String        | e.g., "FY2025"                               |
| `scopeDescription`       | String?       | Scope narrative                              |
| `status`                 | String        | Workflow status (Draft, DataCollection, ...) |
| `localContentScore`      | Float?        | Computed aggregate score                     |
| `createdById`            | String?       | Creator                                      |
| `createdByName`          | String?       | Creator display name                         |
| `metadata`               | Json?         | Extension data                               |
| `createdAt`              | DateTime      |                                              |
| `updatedAt`              | DateTime      |                                              |

Relationships: suppliers[], spendRecords[], classifications[], evidence[], findings[], reviews[], approvals[], reports[], auditEvents[]

### LocalContentSupplier

| Field                    | Type          | Purpose                               |
| ------------------------ | ------------- | ------------------------------------- |
| `id`                     | String (cuid) | Primary key                           |
| `projectId`              | String        | FK to LocalContentProject             |
| `name`                   | String        | Supplier name                         |
| `crNumber`               | String?       | Commercial registration               |
| `localityClassification` | String?       | local, non_local, mixed, unclassified |
| `localContentPercentage` | Float?        | Declared local content %              |
| `ownershipType`          | String?       | Saudi, foreign, joint_venture         |
| `workforceLocalPct`      | Float?        | Saudi workforce percentage            |
| `status`                 | String        | active, inactive, under_review        |
| `metadata`               | Json?         |                                       |
| `createdAt`              | DateTime      |                                       |
| `updatedAt`              | DateTime      |                                       |

Relationships: spendRecords[], classifications[], evidenceItems[]

### LocalContentSpendRecord

| Field               | Type          | Purpose                                             |
| ------------------- | ------------- | --------------------------------------------------- |
| `id`                | String (cuid) | Primary key                                         |
| `projectId`         | String        | FK to LocalContentProject                           |
| `supplierId`        | String        | FK to LocalContentSupplier                          |
| `amount`            | Float         | Spend amount                                        |
| `currency`          | String        | SAR, USD, etc.                                      |
| `category`          | String        | Spend category (goods, services, construction, ...) |
| `contractReference` | String?       | Contract/PO number                                  |
| `period`            | String        | Reporting period segment                            |
| `description`       | String?       |                                                     |
| `metadata`          | Json?         |                                                     |
| `createdAt`         | DateTime      |                                                     |
| `updatedAt`         | DateTime      |                                                     |

Relationships: classifications[]

### LocalContentClassification

| Field                 | Type          | Purpose                                                        |
| --------------------- | ------------- | -------------------------------------------------------------- |
| `id`                  | String (cuid) | Primary key                                                    |
| `projectId`           | String        | FK to LocalContentProject                                      |
| `supplierId`          | String?       | FK to LocalContentSupplier (nullable for record-level)         |
| `spendRecordId`       | String?       | FK to LocalContentSpendRecord (nullable for supplier-level)    |
| `classifiedBy`        | String?       | Operator ID                                                    |
| `localPercentage`     | Float         | Determined local content %                                     |
| `classificationBasis` | String        | certificate, self_declaration, contract_term, analyst_estimate |
| `confidence`          | String        | high, medium, low, unverified                                  |
| `notes`               | String?       | Classification rationale                                       |
| `reviewStatus`        | String        | draft, reviewed, confirmed, disputed                           |
| `metadata`            | Json?         |                                                                |
| `createdAt`           | DateTime      |                                                                |
| `updatedAt`           | DateTime      |                                                                |

### LocalContentEvidence

| Field           | Type          | Purpose                                                 |
| --------------- | ------------- | ------------------------------------------------------- |
| `id`            | String (cuid) | Primary key                                             |
| `projectId`     | String        | FK to LocalContentProject                               |
| `supplierId`    | String?       | FK to LocalContentSupplier                              |
| `spendRecordId` | String?       | FK to LocalContentSpendRecord                           |
| `findingId`     | String?       | FK to LocalContentFinding                               |
| `filename`      | String        |                                                         |
| `fileType`      | String        | pdf, xlsx, docx, jpg, ...                               |
| `mimeType`      | String?       |                                                         |
| `storageKey`    | String?       | Platform storage key                                    |
| `fileHash`      | String?       | SHA-256 checksum                                        |
| `sizeBytes`     | Int?          |                                                         |
| `evidenceType`  | String        | certificate, contract, attestation, invoice, other      |
| `status`        | String        | uploaded, linked, reviewed, verified, rejected, missing |
| `reviewedById`  | String?       |                                                         |
| `reviewedAt`    | DateTime?     |                                                         |
| `metadata`      | Json?         |                                                         |
| `createdAt`     | DateTime      |                                                         |
| `updatedAt`     | DateTime      |                                                         |

### LocalContentFinding

| Field                 | Type          | Purpose                                                                         |
| --------------------- | ------------- | ------------------------------------------------------------------------------- |
| `id`                  | String (cuid) | Primary key                                                                     |
| `projectId`           | String        | FK to LocalContentProject                                                       |
| `type`                | String        | evidence_gap, low_content, unclassified_supplier, data_quality, compliance_risk |
| `severity`            | String        | low, medium, high, critical                                                     |
| `title`               | String        |                                                                                 |
| `description`         | String        |                                                                                 |
| `linkedSupplierId`    | String?       |                                                                                 |
| `linkedSpendRecordId` | String?       |                                                                                 |
| `status`              | String        | draft, submitted, reviewed, resolved, dismissed                                 |
| `createdById`         | String?       |                                                                                 |
| `createdByName`       | String?       |                                                                                 |
| `metadata`            | Json?         |                                                                                 |
| `createdAt`           | DateTime      |                                                                                 |
| `updatedAt`           | DateTime      |                                                                                 |

Relationships: evidenceItems[]

### LocalContentReview

| Field          | Type          | Purpose                                 |
| -------------- | ------------- | --------------------------------------- |
| `id`           | String (cuid) | Primary key                             |
| `projectId`    | String        | FK to LocalContentProject               |
| `reviewerId`   | String        | Reviewer user ID                        |
| `reviewerName` | String        |                                         |
| `action`       | String        | submitted, returned, commented          |
| `comments`     | String?       | Reviewer comments                       |
| `status`       | String        | pending, in_review, returned, completed |
| `metadata`     | Json?         |                                         |
| `createdAt`    | DateTime      |                                         |
| `updatedAt`    | DateTime      |                                         |

### LocalContentApproval

| Field              | Type          | Purpose                                       |
| ------------------ | ------------- | --------------------------------------------- |
| `id`               | String (cuid) | Primary key                                   |
| `projectId`        | String        | FK to LocalContentProject                     |
| `approverId`       | String        | Approver user ID                              |
| `approverName`     | String        |                                               |
| `decision`         | String        | approved, rejected                            |
| `comments`         | String?       |                                               |
| `approvalSnapshot` | Json?         | Snapshot of assessment state at approval time |
| `createdAt`        | DateTime      |                                               |

### LocalContentReport

| Field             | Type          | Purpose                                                                                              |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `id`              | String (cuid) | Primary key                                                                                          |
| `projectId`       | String        | FK to LocalContentProject                                                                            |
| `reportType`      | String        | assessment_summary, supplier_register, spend_classification, gap_risk, evidence_index, final_package |
| `format`          | String        | pdf, xlsx                                                                                            |
| `status`          | String        | generated, downloaded, archived                                                                      |
| `generatedById`   | String?       |                                                                                                      |
| `generatedByName` | String?       |                                                                                                      |
| `storageKey`      | String?       | Export file storage key                                                                              |
| `disclaimer`      | String?       | Export disclaimer text                                                                               |
| `metadata`        | Json?         | Includes scores, dates, reviewer, approver at generation time                                        |
| `createdAt`       | DateTime      |                                                                                                      |
| `updatedAt`       | DateTime      |                                                                                                      |

## Index Strategy

Each model should have at minimum:

```
@@index([projectId, createdAt])
@@index([status])
@@index([createdAt])
```

Supplier: `@@index([projectId, status])`
Evidence: `@@index([projectId, status, createdAt])`
Finding: `@@index([projectId, severity, status])`
AuditEvent: `@@index([projectId, createdAt])`

## v0.1 vs Later

All above models are required for v0.1.

Deferred to later:

- `LocalContentContract` — contract-level tracking (v0.2)
- `LocalContentWorkforceRecord` — workforce localization (v0.3)
- `LocalContentHistoricalBaseline` — trend data (v0.3)
- `LocalContentSimulationScenario` — what-if modeling (v0.2)
