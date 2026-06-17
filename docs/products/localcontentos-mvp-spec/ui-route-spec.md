# LocalContentOS — UI/Route Spec

**Status:** Specification only — not implemented
**Version:** 1.0
**Note:** Routes must NOT be created until implementation phase is explicitly approved.

---

## Proposed Route Structure

```
/local-content                                    — Engagement list / dashboard
/local-content/[engagementId]                     — Engagement overview
/local-content/[engagementId]/settings            — Engagement settings
/local-content/[engagementId]/period              — Reporting period
/local-content/[engagementId]/vendors             — Vendor master
/local-content/[engagementId]/spend               — Procurement spend
/local-content/[engagementId]/contracts           — Contract register
/local-content/[engagementId]/evidence            — Evidence vault
/local-content/[engagementId]/classification      — Classification review
/local-content/[engagementId]/findings            — Exceptions and findings
/local-content/[engagementId]/review              — Management review
/local-content/[engagementId]/report              — Pilot summary / export
/local-content/[engagementId]/audit-trail         — Audit trail
```

---

## Route Details

### /local-content

| Field                     | Detail                                                                       |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Purpose**               | Dashboard listing all LocalContentOS engagements for the user's organization |
| **Users**                 | All roles (data scoped by role)                                              |
| **Main Components**       | Engagement list, create button, status filters, search                       |
| **Server Actions Needed** | `listEngagements`, `createEngagement`, `archiveEngagement`                   |
| **Data Dependencies**     | LocalContentEngagement table, Organization context                           |
| **Permissions**           | View own engagements (Owners/Admins see all)                                 |
| **Status**                | Future — not implemented                                                     |

### /local-content/[engagementId]

| Field                     | Detail                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| **Purpose**               | Engagement overview with key metrics and workflow status                |
| **Users**                 | All roles assigned to this engagement                                   |
| **Main Components**       | Metrics cards, workflow progress, quick action buttons, recent activity |
| **Server Actions Needed** | `getEngagementSummary`, `getEngagementMetrics`                          |
| **Data Dependencies**     | All engagement tables for metrics aggregation                           |
| **Permissions**           | Must be assigned to this engagement                                     |
| **Status**                | Future — not implemented                                                |

### /local-content/[engagementId]/vendors

| Field                     | Detail                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- |
| **Purpose**               | Vendor master import, review, and classification                                  |
| **Users**                 | Data Owner (import), Analyst (classify), Reviewer (review)                        |
| **Main Components**       | Import uploader, vendor table with filters, classification badges, evidence links |
| **Server Actions Needed** | `importVendorMaster`, `updateVendorClassification`, `getVendorList`               |
| **Data Dependencies**     | Vendor table, EvidenceRecord, ClassificationReview                                |
| **Permissions**           | Import: Data Owner+. Classify: Analyst+. Review: Reviewer+                        |
| **Status**                | Future — not implemented                                                          |

### /local-content/[engagementId]/evidence

| Field                     | Detail                                                                         |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Purpose**               | Evidence vault — upload, link, and review evidence files                       |
| **Users**                 | Data Owner (upload), Analyst (link), Reviewer (review)                         |
| **Main Components**       | File uploader, evidence table, link dialog, confidence selector, status badges |
| **Server Actions Needed** | `uploadEvidenceRecord`, `linkEvidenceToRecord`, `getEvidenceList`              |
| **Data Dependencies**     | EvidenceRecord table, file storage                                             |
| **Permissions**           | Upload: Data Owner+. Link: Analyst+. Review: Reviewer+                         |
| **Status**                | Future — not implemented                                                       |

### /local-content/[engagementId]/classification

| Field                     | Detail                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| **Purpose**               | Classification review workspace — propose, review, and approve classifications  |
| **Users**                 | Analyst (propose), Reviewer (review), Approver (finalize)                       |
| **Main Components**       | Classification queue, record detail panel, evidence viewer, approval buttons    |
| **Server Actions Needed** | `createClassificationReview`, `approveClassification`, `getClassificationQueue` |
| **Data Dependencies**     | ClassificationReview, Vendor, ProcurementSpendRecord, EvidenceRecord            |
| **Permissions**           | Propose: Analyst+. Review: Reviewer+. Approve: Approver+                        |
| **Status**                | Future — not implemented                                                        |

### /local-content/[engagementId]/findings

| Field                     | Detail                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Purpose**               | Findings management — draft, review, and track resolution                            |
| **Users**                 | Analyst (draft), Reviewer (review), Engagement Owner (assign)                        |
| **Main Components**       | Findings table, create/edit form, severity badges, owner assignment, status tracking |
| **Server Actions Needed** | `createLocalContentFinding`, `updateFindingStatus`, `getFindingsList`                |
| **Data Dependencies**     | LocalContentFinding table                                                            |
| **Permissions**           | Draft: Analyst+. Review: Reviewer+. Assign: Engagement Owner+                        |
| **Status**                | Future — not implemented                                                             |

### /local-content/[engagementId]/review

| Field                     | Detail                                                                           |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Purpose**               | Management review — submit findings for decision, collect responses              |
| **Users**                 | Reviewer (prepare), Approver (decide)                                            |
| **Main Components**       | Review package view, findings summary, evidence coverage, approve/return buttons |
| **Server Actions Needed** | `submitForManagementReview`, `approveLocalContentReport`                         |
| **Data Dependencies**     | All engagement data (read-only at this stage)                                    |
| **Permissions**           | Prepare: Reviewer+. Approve: Approver+                                           |
| **Status**                | Future — not implemented                                                         |

### /local-content/[engagementId]/report

| Field                     | Detail                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| **Purpose**               | Pilot summary, report viewing, and export                               |
| **Users**                 | All roles (view), Approver (export)                                     |
| **Main Components**       | Report summary cards, metric visualizations, export buttons (PDF, XLSX) |
| **Server Actions Needed** | `getEngagementReport`, `exportLocalContentSummary`                      |
| **Data Dependencies**     | LocalContentReport, aggregated classification data                      |
| **Permissions**           | View: All assigned. Export: Approver+                                   |
| **Status**                | Future — not implemented                                                |

### /local-content/[engagementId]/audit-trail

| Field                     | Detail                                                  |
| ------------------------- | ------------------------------------------------------- |
| **Purpose**               | Immutable audit log of all actions in the engagement    |
| **Users**                 | All roles (data scoped)                                 |
| **Main Components**       | Audit event table, filters, search, export              |
| **Server Actions Needed** | `getAuditTrail` (reuses existing Core audit service)    |
| **Data Dependencies**     | AQLIYA Core AuditEvent model                            |
| **Permissions**           | View: All assigned. Sensitive events may be role-gated. |
| **Status**                | Future — not implemented                                |

---

## UI Principles for Implementation

| Principle                  | Application                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| **Arabic-first**           | RTL layout, Arabic as default language, bilingual data display             |
| **Governance indicators**  | Evidence badges, confidence levels, approval stamps visible on all records |
| **Progressive disclosure** | Summary first, details on demand — not overwhelming                        |
| **Bulk actions**           | Import, classify, and review in bulk where possible                        |
| **Guided workflow**        | Show current state and next recommended action                             |
| **Audit visibility**       | "Who approved this" shown contextually, not hidden                         |
