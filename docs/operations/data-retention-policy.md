# AQLIYA Data Retention Policy

> **Version:** 1.0  
> **Last updated:** 2026-06-04  
> **Status:** Approved  
> **Scope:** All data stored within AQLIYA platform databases, file storage, and audit systems

---

## 1. Overview

AQLIYA is a Private Governed Institutional Intelligence Platform. This data retention policy defines how long different categories of data are retained, how they are deleted, and what safeguards apply before deletion.

This policy complies with applicable data protection regulations including Saudi PDPL and relevant institutional governance requirements.

### Principles

- Data is retained only as long as necessary for its intended purpose
- Retention periods are defined by data category, not storage location
- Deletion is irreversible; export/backup must precede deletion
- Legal hold overrides automated deletion
- All deletion actions are logged in the audit trail

---

## 2. Retention Periods by Data Category

### 2.1 Audit Records

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| System audit events | `AuditEvent`, `PlatformAuditEvent` | **7 years** | Regulatory compliance, institutional governance |
| Audit trail | All rows tracking mutations | **7 years** | Traceability requirements |
| Compliance records | Review/approval actions | **7 years** | Evidence integrity |

### 2.2 Financial Data

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| Deals, opportunities | `Deal`, `Opportunity` | **7 years** | Accounting/tax regulations |
| Transaction amounts | All monetary fields | **7 years** | Financial audit trail |
| Trial balance data | `TrialBalance`, `TBLine` | **7 years** | Audit evidence |

### 2.3 Evidence and Files

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| Evidence records | `Evidence` | **Duration of engagement + 2 years** | Contractual obligation |
| Uploaded files | File storage records | **Duration of engagement + 2 years** | Source document integrity |
| Supporting documents | All file attachments | **Duration of engagement + 2 years** | Evidence completeness |

### 2.4 User Data

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| User accounts | `User` | **Until account deletion request** | User control |
| User profiles | Profile fields | **Until account deletion request** | User control |
| Authentication sessions | Session records | **90 days** | Security best practice |
| Session tokens | NextAuth sessions | **90 days** | Minimum necessary |

### 2.5 Audit Logs

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| Application audit logs | All audit event tables | **2 years** | Operational traceability |
| Access logs | Permission checks, auth attempts | **2 years** | Security monitoring |

### 2.6 Notifications

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| User notifications | `Notification` | **90 days** | Relevance decay |
| System alerts | System notification records | **90 days** | Operational hygiene |

### 2.7 Workspace / Organization Data

| Data type | Models | Retention | Rationale |
|-----------|--------|-----------|-----------|
| Organizations | `Organization`, `Workspace` | **Until deactivation + 1 year** | Grace period for re-activation |
| Inactive tenants | Deactivated orgs | **1 year after deactivation** | Cleanup after grace |

---

## 3. Data Deletion Procedures

### 3.1 Automated deletion (scheduled)

| Frequency | Action | Responsible |
|-----------|--------|-------------|
| Daily | Delete expired sessions (older than 90 days) | Cron job |
| Daily | Delete expired notifications (older than 90 days) | Cron job |
| Monthly | Archive audit logs older than 2 years | Cron job + archive |
| Yearly | Purge archived audit logs older than 7 years | Manual review + purge |

### 3.2 Manual deletion (account/workspace close)

```sql
-- Step 1: Identify all data owned by the entity
SELECT * FROM "AuditEvent" WHERE "organizationId" = '<org_id>';

-- Step 2: Export before deletion (see §4)
-- Step 3: Soft-delete where model supports it
UPDATE "Organization" SET "deletedAt" = NOW() WHERE id = '<org_id>';

-- Step 4: After grace period, hard-delete
DELETE FROM "AuditEvent" WHERE "organizationId" = '<org_id>';
```

### 3.3 Legal hold

When a legal hold is active:

- Automated deletion is suspended for affected records
- A `LegalHold` record is created with case reference and affected scope
- Records are excluded from purge queries via a `legalHold` flag or join
- Hold is removed only when legal counsel confirms in writing

---

## 4. Export and Backup Before Deletion

### 4.1 Mandatory pre-deletion export

Before any data is permanently deleted, a machine-readable export must be created:

| Data type | Export format | Storage location |
|-----------|---------------|------------------|
| Audit records | JSON + CSV | `/backups/exports/` or S3 archive |
| Financial data | JSON + CSV | `/backups/exports/` or S3 archive |
| Evidence/files | Original format + manifest | `/backups/evidence/` or S3 archive |
| User data | JSON | `/backups/exports/` or S3 archive |

### 4.2 Export verification

- Generate SHA-256 checksum for each export file
- Verify export integrity before proceeding with deletion
- Store checksum in a signed manifest alongside the export
- Log the export action in `AuditEvent` with checksum reference

### 4.3 Backup schedule

| Backup type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Full database | Daily | 30 days | `/backups/db/` |
| File storage | Daily incremental | 30 days | `/backups/storage/` |
| Long-term archive | Monthly | 7 years | Cold storage / S3 Glacier |

### 4.4 Restore verification

- Test full restore monthly from a recent backup
- Verify data integrity after restore
- Document restore time and any issues

---

## 5. Arabic Summary (ملخص سياسة الاحتفاظ بالبيانات)

**سياسة الاحتفاظ بالبيانات لمنصة عقلية**

تلتزم منصة عقلية بالاحتفاظ بالبيانات وفقًا للوائح التنظيمية المعمول بها، بما في ذلك النظام السعودي لحماية البيانات الشخصية (PDPL).

| فئة البيانات | مدة الاحتفاظ |
|--------------|--------------|
| سجلات التدقيق (AuditEvent) | 7 سنوات |
| البيانات المالية (الصفقات والمبالغ) | 7 سنوات |
| الأدلة والملفات | مدة التعاقد + سنتين |
| جلسات المستخدمين | 90 يومًا |
| سجلات التدقيق التشغيلية | سنتان |
| الإشعارات | 90 يومًا |

**إجراءات الحذف:**

- الحذف التلقائي اليومي للجلسات والإشعارات منتهية الصلاحية
- أرشفة سجلات التدقيق شهريًا
- التصدير الاحتياطي إلزامي قبل أي حذف نهائي
- الإيقاف القانوني يعطل الحذف التلقائي للبيانات المتأثرة

**مبدأ أساسي:** التصدير والنسخ الاحتياطي قبل الحذف. لا يتم حذف أي بيانات بشكل نهائي دون تصدير موثق وتحقّق من سلامته.

---

## Policy Enforcement

| Aspect | Mechanism |
|--------|-----------|
| Automated deletion | Cron jobs (daily, monthly, yearly) |
| Legal hold | Manual flag on affected records |
| Pre-deletion export | Mandatory step in deletion workflow |
| Audit logging | All deletions logged in `AuditEvent` |
| Review cycle | This policy reviewed annually |

---

> **Note:** This policy applies to Cloud-deployed instances. On-Prem / Air-Gapped instances are responsible for configuring equivalent retention rules locally.
