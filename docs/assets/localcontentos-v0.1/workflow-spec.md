# LocalContentOS v0.1 — Workflow Specification

## Core Workflow States

```
Setup → DataCollection → ClassificationInProgress → EvidenceReview →
FindingsDrafted → InReview → (Returned → InReview) →
Approved → (ReportReady → Exported → Archived) | Rejected
```

```
Draft → تحليل البيانات → تصنيف → مراجعة الأدلة →
صياغة النتائج → قيد المراجعة → (مرتجع → قيد المراجعة) →
معتمد → (التقرير جاهز → مُصدّر → مؤرشف) | مرفوض
```

## State Machine

| From                     | To                       | Who               | Condition                        |
| ------------------------ | ------------------------ | ----------------- | -------------------------------- |
| Draft                    | DataCollection           | Operator          | Project created, suppliers added |
| DataCollection           | ClassificationInProgress | Operator          | Spend records imported           |
| ClassificationInProgress | EvidenceReview           | Operator          | Classification entries completed |
| EvidenceReview           | FindingsDrafted          | Operator          | Evidence reviewed                |
| FindingsDrafted          | InReview                 | Operator          | Submit for review                |
| InReview                 | Returned                 | Reviewer          | Changes requested                |
| Returned                 | InReview                 | Operator          | Revisions completed              |
| InReview                 | Approved                 | Reviewer/Approver | Assessment accepted              |
| InReview                 | Rejected                 | Reviewer/Approver | Assessment rejected              |
| Approved                 | ReportReady              | Operator          | Report generated                 |
| ReportReady              | Exported                 | Operator          | Export triggered                 |
| Exported                 | Archived                 | Operator          | Archive for retention            |

## User Journey (Arabic-first)

### 1. Project Setup / إعداد المشروع

- User creates a new local content assessment project.
- Selects organization, reporting period, scope description.
- System initializes project in `Draft` status.

### 2. Supplier Registry / سجل الموردين

- User adds suppliers: name, CR number, locality classification, ownership type, workforce data.
- Suppliers can be imported from CSV or entered manually.
- Each supplier gets classification status: classified, unclassified, needs_review.

### 3. Spend Records / سجلات الإنفاق

- User imports or enters procurement spend per supplier.
- Each record: supplier, amount, category, contract reference, period.
- System calculates spend totals per supplier and per category.

### 4. Classification / التصنيف

- User classifies each spend record or supplier as local/non-local with percentage.
- Evidence can be attached: supplier certificates, local content attestations.
- System flags unclassified or low-confidence entries.

### 5. Evidence Review / مراجعة الأدلة

- User reviews evidence completeness per supplier/record.
- Status: complete, partial, missing, conflicting.
- System flags gaps: missing evidence, conflicting claims, unverifiable.

### 6. Findings / النتائج والفجوات

- User drafts findings: gaps, risks, observations.
- Each finding linked to evidence, supplier, or spend record.
- Severity: low, medium, high, critical.

### 7. Review / المراجعة

- User submits project for review.
- Reviewer examines classification, evidence, findings.
- Reviewer can return for revision (with comments) or forward for approval.

### 8. Approval / الاعتماد

- Approver reviews the assessment.
- Approver can approve or reject.
- Approval recorded with timestamp and identity.

### 9. Reports / التقارير والتصدير

- User generates reports: Assessment Summary, Supplier Register, Findings, Evidence Index.
- Export formats: PDF, XLSX.
- Export includes disclaimer, governance metadata, reviewer/approver identity.

### 10. Audit Trail / سجل التدقيق

- Every mutation logged to PlatformAuditLog.
- Traceability from output back to evidence.
- Full actor, timestamp, before/after state.

## Required States Per UI Page

| Page           | Required States                                     |
| -------------- | --------------------------------------------------- |
| Dashboard      | loaded, empty (no projects), error                  |
| Project List   | loaded, empty, loading, error                       |
| Project Detail | loaded, not-found, loading, error                   |
| Suppliers      | loaded, empty (no suppliers), loading, error        |
| Spend Records  | loaded, empty, loading, error                       |
| Classification | loaded, in-progress, loading, error                 |
| Evidence       | loaded, empty, uploading, loading, error            |
| Findings       | loaded, empty, loading, error                       |
| Review         | loaded, submitted, returned, loading, error         |
| Approval       | loaded, pending, approved, rejected, loading, error |
| Reports        | loaded, generating, ready, loading, error           |
| Audit Trail    | loaded, empty, loading, error                       |
