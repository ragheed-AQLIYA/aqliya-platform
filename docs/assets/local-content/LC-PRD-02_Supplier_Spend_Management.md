# LC-PRD-02: Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Requirements Document — retroactive alignment for LocalContentOS Supplier & Spend Management
> **Epic:** LC-EPIC-02 in Capability Backlog
> **Note:** This PRD retroactively describes the existing Supplier and Spend Management implementation in `src/lib/local-content/`. No new capabilities are proposed.

---

## 1. Overview

### 1.1 Product

LocalContentOS — Supplier & Spend Management subsystem.

### 1.2 Problem

Institutions managing local content compliance must track supplier declarations, spend data, and classification records across multiple reporting periods. Without structured supplier and spend management, local content calculations rely on manual data entry, spreadsheets, and inconsistent classification.

### 1.3 Solution

A governed Supplier & Spend Management subsystem that provides CRUD operations for supplier records and spend transactions, bulk CSV import, classification assignment, and spend analytics — all enforced through organization-scoped tenant isolation and full audit trails.

### 1.4 Scope

**In scope:**
- Supplier creation, listing, update, and deletion
- Spend record creation, listing, bulk import, classification, and deletion
- CSV import with Arabic/English header support
- Spend analytics by organization
- Supplier classification with locality and ownership type validation
- Full audit trails for all mutations

**Out of scope:**
- Supplier onboarding workflows (planned — LC-EPIC-04)
- ERP integration scheduling (planned — future Epic)
- Supplier scoring calculation (covered in LC-EPIC-08)

---

## 2. File Organization

| Layer | Files | Purpose |
|---|---|---|
| Types | `types.ts` | `CreateSupplierInput`, `CreateSpendRecordInput`, `SupplierWeightedScore` |
| Domain Services | `services.ts` | CRUD: `listSuppliers`, `createSupplier`, `deleteSupplier`, `listSpendRecords`, `createSpendRecord`, `deleteSpendRecord`, `getOrganizationSpendAnalytics` |
| Import Engine | `import.ts` | CSV parsing with bilingual header support, validation, result reporting |
| Scoring | `scoring.ts` | `classifySupplier`, `classifySpend`, `calculateSpendBreakdown` |
| Validation | `validation.ts` | `validateSupplierLocality`, `validateOwnershipType`, `validatePositiveNumber`, `validatePercentage` |
| Schemes | `schemas/spend.ts` | Zod schemas: `createSpendRecordSchema`, `classifySpendRecordSchema` |
| Guards | `guards.ts`, `localcontent-guards.ts` | `assertProjectAccess`, `requireProjectAccess` |
| Audit | `audit-events.ts` | Events: `SUPPLIER_CREATED`, `SUPPLIER_UPDATED`, `SPEND_CREATED`, `SPEND_IMPORTED`, `SPEND_CLASSIFIED` |
| Server Actions | `localcontent-actions.ts` | 8 Supplier + Spend actions |
| API Route | Route handlers | Evidence download (shared with EPIC-01) |

---

## 3. User Personas

### 3.1 باحث الامتثال (Compliance Researcher)

- Creates and manages supplier records
- Imports spend data via CSV
- Classifies suppliers and spend records
- Reviews spend analytics by organization

### 3.2 مسؤول الامتثال (Compliance Officer)

- Oversees supplier and spend data quality
- Confirms or adjusts classifications
- Reviews analytics dashboards

### 3.3 مدقق خارجي (External Auditor)

- Reviews supplier declarations
- Verifies spend record accuracy against evidence
- Downloads audit reports

---

## 4. Design Principles

| # | Principle | Application to Supplier & Spend |
|---|---|---|
| DP-01 | Tenant Isolation | All queries scoped via `requireProjectAccess()` which verifies `organizationId` |
| DP-02 | Full Audit Trail | Every CREATE, UPDATE, DELETE generates `LocalContentAuditEvent` |
| DP-03 | Deterministic Classification | Supplier locality/ownership classification is rule-based, not AI |
| DP-04 | Bulk Import Safety | CSV import validates each row independently — partial success is valid |
| DP-05 | Arabic-First UX | CSV header mapping supports Arabic column names natively |

---

## 5. User Journeys

| ID | Journey | Steps | Actions Called |
|---|---|---|---|
| J-01 | Add supplier | Open project → Suppliers tab → Fill form → Submit | `createLocalContentSupplierAction` |
| J-02 | Delete supplier | Open project → Suppliers tab → Select → Delete | `deleteLocalContentSupplierAction` |
| J-03 | Import spend CSV | Spend tab → Upload CSV → Preview rows → Confirm | `importLocalContentSpendCsvAction` |
| J-04 | Classify spend | Spend tab → Select record → Set classification | `classifyLocalContentSpendRecordAction` |
| J-05 | View spend analytics | Dashboard → Analytics tab | `getLocalContentSpendAnalyticsAction` |

---

## 6. Functional Requirements

### FR-01: Supplier Management

| ID | Requirement | Implementation | Evidence |
|---|---|---|---|
| FR-01.1 | Create supplier with name, CR number, locality, ownership | `createSupplier()` in `services.ts` | Code |
| FR-01.2 | List all suppliers for a project | `listSuppliers(projectId)` | Code |
| FR-01.3 | Update supplier classification fields | `updateSupplierStatus()` in actions | Code |
| FR-01.4 | Delete supplier from project | `deleteSupplier()` | Code |
| FR-01.5 | Validate locality classification | `validateSupplierLocality()` → 4 values | Code |
| FR-01.6 | Validate ownership type | `validateOwnershipType()` → 3 values | Code |

### FR-02: Spend Management

| ID | Requirement | Implementation | Evidence |
|---|---|---|---|
| FR-02.1 | Create spend record for a supplier | `createSpendRecord()` in `services.ts` | Code |
| FR-02.2 | List all spend records for a project | `listSpendRecords(projectId)` | Code |
| FR-02.3 | Delete spend record | `deleteSpendRecord()` | Code |
| FR-02.4 | Bulk import spend records from CSV | `importLocalContentSpendCsvAction` → `parseLocalContentCSV()` | Code |
| FR-02.5 | Classify spend record | `classifyLocalContentSpendRecordAction` | Code |
| FR-02.6 | View spend analytics by organization | `getOrganizationSpendAnalytics()` | Code |

### FR-03: CSV Import

| ID | Requirement | Implementation | Evidence |
|---|---|---|---|
| FR-03.1 | Accept CSV file upload | `uploadLocalContentEvidenceFileAction` pattern | Code |
| FR-03.2 | Support Arabic and English headers | `normalizeHeader()` with bilingual map | `import.ts` |
| FR-03.3 | Validate each row independently | `parseRow()` — validates amount, supplier, category, period | `import.ts` |
| FR-03.4 | Return valid + rejected rows | `ImportResult { validRows, rejectedRows, summary }` | `import.ts` |
| FR-03.5 | Audit trail for import | Audit action `SPEND_IMPORTED` | `audit-events.ts` |

---

## 7. Domain Rules

| ID | Rule | Enforcement |
|---|---|---|
| DR-01 | Supplier locality must be one of: `local`, `non_local`, `mixed`, `unclassified` | `validateSupplierLocality()` |
| DR-02 | Ownership type must be one of: `Saudi`, `foreign`, `joint_venture` | `validateOwnershipType()` |
| DR-03 | Spend amount must be positive | `validatePositiveNumber()` |
| DR-04 | Supplier access scoped to project's organization | `requireProjectAccess(projectId)` chain |
| DR-05 | Spend records must reference an existing supplier | Prisma foreign key: `supplierId → LocalContentSupplier` |
| DR-06 | All mutations produce audit events | `createLocalContentAuditEvent()` dual-write |

---

## 8. Domain Model (Prisma)

```prisma
model LocalContentSupplier {
  id                     String              @id @default(cuid())
  projectId              String
  project                LocalContentProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name                   String
  crNumber               String?
  localityClassification String?  // local, non_local, mixed, unclassified
  localContentPercentage Float?
  ownershipType          String?  // Saudi, foreign, joint_venture
  workforceLocalPct      Float?
  status                 String   @default("active")  // active, inactive, under_review
  metadata               Json?
  createdById            String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  spendRecords    LocalContentSpendRecord[]
  classifications LocalContentClassification[]
  evidenceItems   LocalContentEvidence[]

  @@index([projectId, status])
}

model LocalContentSpendRecord {
  id                String               @id @default(cuid())
  projectId         String
  project           LocalContentProject  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  supplierId        String
  supplier          LocalContentSupplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  amount            Float
  currency          String               @default("SAR")
  category          String   // goods, services, construction, technology, logistics, other
  contractReference String?
  period            String
  description       String?
  metadata          Json?
  createdById       String?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  classifications       LocalContentClassification[]
  localContentEvidences LocalContentEvidence[]

  @@index([projectId, createdAt])
}
```

---

## 9. Error Handling

| Scenario | Error | Status/Response |
|---|---|---|
| Invalid locality | Validation error | `{ ok: false, error: "...", code: "VALIDATION_ERROR" }` |
| Invalid spend amount | Validation error | `{ ok: false, error: "...", code: "VALIDATION_ERROR" }` |
| Supplier not in project's org | Access denied | Throws "Access denied" — caught by safe() wrapper |
| Spend record references invalid supplier | Foreign key error | Prisma constraint violation → 500 |
| CSV with no valid rows | Empty import result | `{ validRows: [], rejectedRows: [...] }` |

---

## 10. Performance Requirements

| Metric | Target | Notes |
|---|---|---|
| Supplier list load | < 500ms | For project with 100+ suppliers |
| Spend list load | < 500ms | For project with 1000+ records |
| CSV import time | < 5s per 1000 rows | Bulk validation + creation |
| Spend analytics | < 2s | Aggregation over org-level data |

---

## 11. Testing Requirements

| Type | Count | Focus |
|---|---|---|
| Unit — Scoring | 18 | Supplier classification, spend breakdown |
| Unit — Import | 9 | CSV parsing, validation, bilingual headers |
| Unit — Audit | 22 | Audit events for all mutations |
| Unit — Guards | 3 | Access control for supplier/spend operations |
| Integration — Cross-tenant | 41 | Multi-org isolation (shared) |

---

## 12. Governance Checklist

| Check | Status |
|---|---|
| RBAC: Who can create/delete suppliers? | OPERATOR, ADMIN via `canPerformAction()` |
| Tenant isolation: Organization-scoped? | ✅ `requireProjectAccess()` |
| Audit trail: All mutations logged? | ✅ `SPEND_CREATED`, `SUPPLIER_CREATED`, etc. |
| Evidence files: Linked to records? | ✅ via `evidenceItems` on supplier |
| Export: Analytics exportable? | ✅ via `getOrganizationSpendAnalytics()` |
| AI boundary: No autonomous decisions? | ✅ All classification is manual/rule-based |

---

## 13. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-01 | Should supplier status transitions be governed (active → inactive → under_review)? | Currently free-form string |

---

## 14. Assumptions

| # | Assumption | Risk |
|---|---|---|
| A-01 | Supplier ↔ SpendRecord relationship is many-to-one (one supplier, many records) | Correct as modeled |
| A-02 | CSV import is the primary bulk data entry method | ERP integration is separate |

---

## 15. Traceability

| FR ID | PRD Section | Code Evidence | Evidence Classification |
|---|---|---|---|
| FR-01.1 | §6 (Supplier CRUD) | `services.ts` — `createSupplier()` | Executable |
| FR-01.2 | §6 (Supplier CRUD) | `services.ts` — `listSuppliers()` | Executable |
| FR-01.5 | §7 (DR-01) | `validation.ts` — `validateSupplierLocality()` | Executable |
| FR-02.4 | §6 (CSV Import) | `import.ts` — `parseLocalContentCSV()` | Executable |
| FR-02.6 | §6 (Analytics) | `services.ts` — `getOrganizationSpendAnalytics()` | Executable |
| FR-03.2 | §6 (Bilingual) | `import.ts` — `normalizeHeader()` bilingual map | Executable |
| DR-04 | §7 (Tenant Isolation) | `localcontent-guards.ts` — `requireProjectAccess()` | Executable |
| DR-06 | §7 (Audit) | `audit-events.ts` — audit actions | Executable |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Full Supplier & Spend CRUD, CSV import, analytics in existing codebase |
| **Documented** | ✅ This PRD retroactively describes the existing implementation |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** PRD — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LIA-001_CAPABILITY_BACKLOG.md` (LC-EPIC-02)
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for specifications
- **Next:** LC-SPEC-02a (Domain Specification)
