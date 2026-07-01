# LC-SPEC-02c: Workflow Specification — Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — retroactive alignment documenting the CSV import pipeline, supplier classification workflow, and spend analytics computation for Supplier & Spend Management.
> **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
> **Depends On:** `LC-SPEC-02a_Domain_Specification.md` v0.1
> **Template:** LC-SPEC-01c (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-02a, LC-SPEC-02b |
| **Blocks** | LC-SPEC-02e (Test) |
| **Consumer** | Domain Engineering, QA Teams |
| **Evidence Classification** | Executable Evidence |

---

## 1. CSV Import Pipeline

### 1.1 Flow

```
User uploads CSV file
        │
        ▼
Server Action: importLocalContentSpendCsvAction()
        │
        ▼
Step 1: Parse CSV text
        │ parseLocalContentCSV(csvText)
        │   ├─ normalizeHeader() — Arabic/English mapping
        │   └─ parseRow() per line
        ▼
Step 2: Validate each row
        │   ├─ amount > 0
        │   ├─ supplierName required
        │   ├─ category required
        │   └─ period required
        ▼
Step 3: Separate valid / rejected rows
        ▼
Step 4: Create SpendRecords for valid rows
        │   └─ createSpendRecord() × N (in sequence)
        ▼
Step 5: Return ImportResult { validRows[], rejectedRows[], summary }
        │
        ▼
Audit: SPEND_IMPORTED event with valid/rejected counts
```

### 1.2 Bilingual Header Mapping

From `import.ts` `normalizeHeader()`:

| Arabic Header | English Header | Mapped To |
|---|---|---|
| المبلغ | amount | `amount` |
| اسم المورد | supplierName | `supplierName` |
| تصنيف الإنفاق | category | `category` |
| الفترة | period | `period` |
| العملة | currency | `currency` |
| رقم العقد | contractReference | `contractReference` |
| الوصف | description | `description` |
| رقم السجل التجاري | supplierRegistrationNumber | `supplierRegistrationNumber` |

### 1.3 Validation Rules per Row

| Field | Rule | Error Message |
|---|---|---|
| `amount` | Must be a positive number | `Invalid amount: "${raw.amount}"` |
| `supplierName` | Must be non-empty | `Missing supplier name` |
| `category` | Must be non-empty | `Missing category` |
| `period` | Must be non-empty | `Missing period` |

Rows that fail validation are returned as `RejectedRow[]` — partial success is valid.

---

## 2. Supplier Classification Workflow

### 2.1 Classification Inputs

| Field | Values | Validation |
|---|---|---|
| `localityClassification` | local, non_local, mixed, unclassified | `validateSupplierLocality()` |
| `ownershipType` | Saudi, foreign, joint_venture | `validateOwnershipType()` |
| `localContentPercentage` | 0–100 | `validatePercentage()` |
| `workforceLocalPct` | 0–100 | `validatePercentage()` |

### 2.2 Flow

```
User creates/edits supplier form
        │
        ▼
Server Action validates fields
        │
        ▼
Supplier saved with classification data
        │
        ▼
Audit: SUPPLIER_CREATED / SUPPLIER_UPDATED
        │
        ▼
Scoring engine consumes classification →
    localityFactor (40pt) + ownershipFactor (25pt) +
    workforceFactor (20pt) + declaredContent (15pt)
```

### 2.3 No State Machine

Supplier status (`active`, `inactive`, `under_review`) is a free-form string. No governance transitions are enforced. This is a known simplification for v0.1.

---

## 3. Spend Analytics Computation

### 3.1 Pipeline

```
Trigger: getOrganizationSpendAnalytics(organizationId)
  │
  ├─ 1. Find all projects for organization
  ├─ 2. For each project, fetch all spend records
  ├─ 3. Aggregate by:
  │      ├─ Category (goods, services, construction, etc.)
  │      ├─ Locality (local, non_local, mixed, unclassified)
  │      └─ Period (H1, H2, quarterly, annual)
  ├─ 4. Compute:
  │      ├─ Total spend
  │      ├─ Local spend %
  │      ├─ Category breakdown
  │      └─ Locality breakdown
  └─ 5. Return SpendAnalytics
```

---

## Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| CSV Import Pipeline (§1) | §6 (FR-03) | `import.ts` — parseLocalContentCSV, normalizeHeader, parseRow | Executive |
| Supplier Classification (§2) | §7 (DR-01, DR-02) | `validation.ts` — validateSupplierLocality, validateOwnershipType | Executive |
| Spend Analytics (§3) | §6 (FR-02.6) | `services.ts` — getOrganizationSpendAnalytics | Executive |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ CSV import, supplier/spend classification, analytics in existing codebase |
| **Documented** | ✅ This specification retroactively describes existing workflows |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Workflow Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for review
- **Next:** LC-SPEC-02d (UX Specification)
