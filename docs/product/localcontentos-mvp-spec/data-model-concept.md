# LocalContentOS — Data Model Concept

**Status:** Specification only — not implemented
**Version:** 1.0
**Note:** This is a conceptual data model. Do NOT create Prisma schema from this without explicit implementation approval. All entities, fields, and relationships must be validated during implementation planning.

---

## Entity Overview

```
LocalContentEngagement
├── ReportingPeriod
├── Vendor (many)
├── ProcurementSpendRecord (many)
├── ContractRecord (many)
├── EvidenceRecord (many, links to Vendor/Spend/Contract)
├── ClassificationReview (many, links to Vendor/Spend/Contract)
├── LocalContentFinding (many)
├── ManagementReview
├── LocalContentReport
└── AuditEvent (many — via AQLIYA Core AuditEvent model)
```

---

## Entity: LocalContentEngagement

| Field            | Type     | Notes                               |
| ---------------- | -------- | ----------------------------------- |
| id               | UUID     | Primary key                         |
| organizationId   | UUID     | FK to Organization (AQLIYA Core)    |
| name             | String   | Engagement name                     |
| status           | Enum     | Draft, Active, Closed, Archived     |
| pilotType        | Enum     | AnalystLed, SoftwareMVP, Production |
| scopeDescription | Text     | Free-text scope definition          |
| createdById      | UUID     | FK to User                          |
| createdAt        | DateTime |                                     |
| updatedAt        | DateTime |                                     |

**Status lifecycle:** Draft → Active → Closed → Archived

**Audit:** All engagement lifecycle events logged via AuditEvent.

---

## Entity: ReportingPeriod

| Field        | Type     | Notes                                            |
| ------------ | -------- | ------------------------------------------------ |
| id           | UUID     | Primary key                                      |
| engagementId | UUID     | FK to LocalContentEngagement                     |
| name         | String   | e.g., "Q1-2026"                                  |
| startDate    | Date     |                                                  |
| endDate      | Date     |                                                  |
| status       | Enum     | Open, DataCollection, InReview, Approved, Locked |
| createdById  | UUID     | FK to User                                       |
| createdAt    | DateTime |                                                  |
| updatedAt    | DateTime |                                                  |

**Reuse from Core:** None — new entity for LocalContentOS.

---

## Entity: Vendor

| Field                            | Type     | Notes                                                                             |
| -------------------------------- | -------- | --------------------------------------------------------------------------------- |
| id                               | UUID     | Primary key                                                                       |
| engagementId                     | UUID     | FK to LocalContentEngagement                                                      |
| vendorId                         | String   | Customer's vendor ID (not system ID)                                              |
| vendorName                       | String   | Arabic preferred                                                                  |
| vendorNameEn                     | String   | Optional English name                                                             |
| commercialRegistrationNumber     | String   | CR number (10 digits for Saudi)                                                   |
| country                          | String   | ISO country code                                                                  |
| city                             | String   |                                                                                   |
| vendorType                       | Enum     | Manufacturer, Distributor, Agent, Service Provider, Contractor, Consultant, Other |
| ownershipClassification          | Enum     | Local, NonLocal, Mixed, Undetermined                                              |
| localContentCertificateAvailable | Boolean  |                                                                                   |
| certificateReference             | String   |                                                                                   |
| classificationStatus             | Enum     | Draft, PendingEvidence, Reviewed, Approved                                        |
| notes                            | Text     |                                                                                   |
| createdById                      | UUID     | FK to User                                                                        |
| importBatchId                    | String   | For tracking data imports                                                         |
| createdAt                        | DateTime |                                                                                   |
| updatedAt                        | DateTime |                                                                                   |

**Reuse from Core:** None — new entity. Consider sharing fields with models in AuditOS if vendor data is common.

---

## Entity: ProcurementSpendRecord

| Field                | Type     | Notes                                                         |
| -------------------- | -------- | ------------------------------------------------------------- |
| id                   | UUID     | Primary key                                                   |
| engagementId         | UUID     | FK to LocalContentEngagement                                  |
| reportingPeriodId    | UUID     | FK to ReportingPeriod                                         |
| vendorId             | UUID     | FK to Vendor                                                  |
| purchaseOrderId      | String   | Customer PO number                                            |
| invoiceId            | String   | Customer invoice number                                       |
| spendDate            | Date     |                                                               |
| category             | String   |                                                               |
| subcategory          | String   |                                                               |
| itemDescription      | String   |                                                               |
| amountExcludingVat   | Decimal  |                                                               |
| currency             | String   | ISO code                                                      |
| contractReference    | String   | Link to contract ID                                           |
| costCenter           | String   |                                                               |
| projectReference     | String   |                                                               |
| classificationStatus | Enum     | Unclassified, Local, NonLocal, Mixed, PendingReview, Approved |
| reviewerNotes        | Text     |                                                               |
| createdById          | UUID     | FK to User                                                    |
| importBatchId        | String   |                                                               |
| createdAt            | DateTime |                                                               |

---

## Entity: ContractRecord

| Field                             | Type    | Notes                                                  |
| --------------------------------- | ------- | ------------------------------------------------------ |
| id                                | UUID    | Primary key                                            |
| engagementId                      | UUID    |                                                        |
| vendorId                          | UUID    | FK to Vendor                                           |
| contractId                        | String  | Customer contract ID                                   |
| contractTitle                     | String  |                                                        |
| contractStartDate                 | Date    |                                                        |
| contractEndDate                   | Date    |                                                        |
| contractValue                     | Decimal |                                                        |
| contractCategory                  | String  |                                                        |
| localContentClausePresent         | Boolean |                                                        |
| localContentCommitmentDescription | Text    |                                                        |
| reviewStatus                      | Enum    | Draft, UnderReview, Reviewed, LinkedToSpend, Exception |
| notes                             | Text    |                                                        |
| createdById                       | UUID    |                                                        |

---

## Entity: EvidenceRecord

| Field             | Type   | Notes                                                                    |
| ----------------- | ------ | ------------------------------------------------------------------------ |
| id                | UUID   | Primary key                                                              |
| engagementId      | UUID   |                                                                          |
| evidenceType      | Enum   | CR, Invoice, Contract, Certificate, PO, PaymentProof, Declaration, Other |
| relatedRecordType | Enum   | Vendor, Transaction, Contract, ClassificationOverride                    |
| relatedRecordId   | UUID   | Polymorphic FK                                                           |
| fileName          | String |                                                                          |
| fileOwner         | String |                                                                          |
| receivedDate      | Date   |                                                                          |
| evidenceStatus    | Enum   | Received, Verified, Expired, Missing, Rejected                           |
| confidenceLevel   | Enum   | High, Medium, Low, None                                                  |
| missingIssue      | Text   |                                                                          |
| reviewerId        | UUID   | FK to User                                                               |
| reviewDate        | Date   |                                                                          |
| notes             | Text   |                                                                          |
| createdById       | UUID   |                                                                          |

**Reuse from Core:** Consider using or extending existing file storage abstraction from `src/lib/audit/storage/`.

---

## Entity: ClassificationReview

| Field                  | Type    | Notes                                                |
| ---------------------- | ------- | ---------------------------------------------------- |
| id                     | UUID    | Primary key                                          |
| engagementId           | UUID    |                                                      |
| recordType             | Enum    | Vendor, Transaction, Contract                        |
| recordId               | UUID    | Polymorphic FK                                       |
| currentClassification  | Enum    |                                                      |
| proposedClassification | Enum    |                                                      |
| reason                 | Text    |                                                      |
| evidenceId             | UUID    | FK to EvidenceRecord                                 |
| reviewerId             | UUID    | FK to User                                           |
| reviewDecision         | Enum    | Accepted, Overridden, ReturnedForEvidence, Escalated |
| approvalRequired       | Boolean |                                                      |
| approverId             | UUID    | FK to User                                           |
| approvalStatus         | Enum    | Pending, Approved, Rejected, NotRequired             |
| notes                  | Text    |                                                      |

---

## Entity: LocalContentFinding

| Field                    | Type    | Notes                                                                          |
| ------------------------ | ------- | ------------------------------------------------------------------------------ |
| id                       | UUID    | Primary key                                                                    |
| engagementId             | UUID    |                                                                                |
| findingType              | Enum    | DataGap, EvidenceGap, ClassificationGap, PolicyGap, ProcessGap, ComplianceRisk |
| severity                 | Enum    | Critical, High, Medium, Low, Info                                              |
| affectedVendorOrContract | String  |                                                                                |
| affectedAmount           | Decimal |                                                                                |
| description              | Text    |                                                                                |
| evidenceGap              | Text    |                                                                                |
| recommendation           | Text    |                                                                                |
| ownerId                  | UUID    | FK to User (responsible for resolution)                                        |
| dueDate                  | Date    |                                                                                |
| status                   | Enum    | Open, InProgress, Resolved, Accepted, Escalated                                |
| managementResponse       | Text    |                                                                                |
| closureEvidence          | String  |                                                                                |

---

## Entity: ManagementReview

| Field             | Type     | Notes                                              |
| ----------------- | -------- | -------------------------------------------------- |
| id                | UUID     | Primary key                                        |
| engagementId      | UUID     |                                                    |
| reportingPeriodId | UUID     |                                                    |
| reviewerId        | UUID     | FK to User                                         |
| reviewDate        | DateTime |                                                    |
| disposition       | Enum     | Approved, ReturnedForRevision, AwaitingInformation |
| comments          | Text     |                                                    |
| lockedAt          | DateTime | When data was locked after approval                |

---

## Entity: LocalContentReport

| Field               | Type     | Notes                                            |
| ------------------- | -------- | ------------------------------------------------ |
| id                  | UUID     | Primary key                                      |
| engagementId        | UUID     |                                                  |
| reportingPeriodId   | UUID     |                                                  |
| version             | Integer  |                                                  |
| status              | Enum     | Draft, ReviewReady, Approved, Exported, Archived |
| totalSpend          | Decimal  |                                                  |
| localSpend          | Decimal  |                                                  |
| nonLocalSpend       | Decimal  |                                                  |
| mixedSpend          | Decimal  |                                                  |
| unclassifiedSpend   | Decimal  |                                                  |
| vendorCount         | Integer  |                                                  |
| evidenceCoveragePct | Decimal  |                                                  |
| exceptionCount      | Integer  |                                                  |
| approvedById        | UUID     |                                                  |
| approvedAt          | DateTime |                                                  |
| exportedAt          | DateTime |                                                  |
| exportedBy          | UUID     |                                                  |

---

## Audit Event Linkage

All entities above link to the existing AQLIYA Core `AuditEvent` model:

| Event Type              | Entity                 | Key Action  |
| ----------------------- | ---------------------- | ----------- |
| ENGAGEMENT_CREATED      | LocalContentEngagement | Create      |
| VENDORS_IMPORTED        | Vendor                 | Bulk import |
| CLASSIFICATION_PROPOSED | ClassificationReview   | Proposal    |
| CLASSIFICATION_APPROVED | ClassificationReview   | Approval    |
| FINDING_CREATED         | LocalContentFinding    | Create      |
| REPORT_APPROVED         | LocalContentReport     | Approval    |
| REPORT_EXPORTED         | LocalContentReport     | Export      |

**Reuse:** AQLIYA Core `AuditEvent` model is designed for cross-product audit — use as-is with `entityType` and `entityId` fields.

---

## What Can Reuse Existing AQLIYA Core Models

| Core Model                   | How to Reuse                                              |
| ---------------------------- | --------------------------------------------------------- |
| `Organization`               | Each LocalContentOS engagement belongs to an Organization |
| `User`                       | All roles map to existing User model                      |
| `AuditEvent`                 | All actions logged via existing audit model               |
| `File` / storage abstraction | Evidence files use existing storage layer                 |
| `GovernanceEngine`           | Approval workflow uses existing governance framework      |

## What Needs New Models

- All LocalContentOS-specific entities listed above (Vendor, ProcurementSpendRecord, ContractRecord, EvidenceRecord, ClassificationReview, LocalContentFinding, LocalContentReport)

## Schema Change Warning

Adding new Prisma models for LocalContentOS must:

1. Be approved as an implementation task (not speculative)
2. Follow existing naming conventions in `schema.prisma`
3. Include proper tenant isolation fields
4. Include audit event hooks
5. Be accompanied by a migration plan
