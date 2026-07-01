# LC-SPEC-02b: API Specification — Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — retroactive alignment documenting the Server Actions, guard layers, and API contracts for Supplier & Spend Management.
> **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
> **Depends On:** `LC-SPEC-02a_Domain_Specification.md` v0.1
> **Template:** LC-SPEC-01b (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-02a |
| **Blocks** | LC-SPEC-02c, LC-SPEC-02e |
| **Consumer** | API Engineering, Frontend Teams |
| **Evidence Classification** | Executable Evidence |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Domain Model | LC-SPEC-02a | §§1-7 |
| Prisma Model | `schema.prisma` | LocalContentSupplier, LocalContentSpendRecord |
| Server Action implementations | `src/actions/localcontent-actions.ts` | 10 Supplier + Spend actions |

---

# 1. Server Action Map

All actions in `src/actions/localcontent-actions.ts`. Each follows `ActionResult<T>` pattern.

## 1.1 Supplier Actions

```typescript
listLocalContentSuppliersAction(projectId: string): Promise<ActionResult<Supplier[]>>
  // Query: listSuppliers(projectId)
  // Guard: requireProjectAccess(projectId)
  // Audit: none (read-only)

createLocalContentSupplierAction(formData: FormData): Promise<ActionResult<Supplier>>
  // Mutates: createSupplier(input, actor)
  // Guard: requireProjectAccess(formData.projectId)
  // Validation: validateSupplierLocality(), validateOwnershipType()
  // Audit: SUPPLIER_CREATED

updateLocalContentSupplierAction(formData: FormData): Promise<ActionResult<Supplier>>
  // Mutates: updateSupplierStatus(id, data)
  // Guard: requireProjectAccess(projectId)
  // Audit: SUPPLIER_UPDATED

deleteLocalContentSupplierAction(supplierId: string): Promise<ActionResult<void>>
  // Mutates: deleteSupplier(projectId, supplierId)
  // Guard: requireProjectAccess(projectId)
  // Audit: SUPPLIER_DELETED (implied)
```

## 1.2 Spend Actions

```typescript
listLocalContentSpendRecordsAction(projectId: string): Promise<ActionResult<SpendRecord[]>>
  // Query: listSpendRecords(projectId) — ordered by createdAt DESC
  // Guard: requireProjectAccess(projectId)

createLocalContentSpendRecordAction(formData: FormData): Promise<ActionResult<SpendRecord>>
  // Mutates: createSpendRecord(input, actor)
  // Guard: requireProjectAccess(formData.projectId)
  // Validation: Zod createSpendRecordSchema (amount > 0, required fields)
  // Audit: SPEND_CREATED

importLocalContentSpendCsvAction(formData: FormData): Promise<ActionResult<ImportResult>>
  // Parses: formData.get("file") — CSV file upload
  // Process: parseLocalContentCSV() → validate each row → bulk create
  // Guard: requireProjectAccess(formData.get("projectId"))
  // Audit: SPEND_IMPORTED with valid/rejected counts

classifyLocalContentSpendRecordAction(formData: FormData): Promise<ActionResult<SpendRecord>>
  // Mutates: classifySpendRecord(spendId, classification)
  // Guard: requireProjectAccess(projectId)
  // Validation: Zod classifySpendRecordSchema
  // Audit: SPEND_CLASSIFIED

deleteLocalContentSpendRecordAction(spendId: string): Promise<ActionResult<void>>
  // Mutates: deleteSpendRecord(spendId)
  // Guard: requireProjectAccess(projectId)
  // Audit: SPEND_DELETED (implied)
```

## 1.3 Analytics Actions

```typescript
getLocalContentSpendAnalyticsAction(organizationId: string): Promise<ActionResult<SpendAnalytics>>
  // Query: getOrganizationSpendAnalytics(organizationId)
  // Guard: requireOrganizationAccess(organizationId)
  // Returns: aggregated spend by category, locality, period
```

---

## 2. Guard Layer

| Action | Guard Function | Chain |
|---|---|---|
| All Supplier actions | `requireProjectAccess(projectId)` | supplier → project.organizationId |
| All Spend actions | `requireProjectAccess(projectId)` | spend → project.organizationId |
| Spend analytics | `requireOrganizationAccess(orgId)` | Direct org check |

Guard functions from `localcontent-guards.ts` and `guards.ts` enforce:
1. Authentication (`requireUserContext()`)
2. Tenant isolation (`project.organizationId === user.organizationId`)
3. Role permission (`canPerformAction(user, action)`)

---

## 3. Validation Schemas

| Schema | Source | Applied To |
|---|---|---|
| `createSpendRecordSchema` | `schemas/spend.ts` | `createLocalContentSpendRecordAction()` |
| `classifySpendRecordSchema` | `schemas/spend.ts` | `classifyLocalContentSpendRecordAction()` |

Additionally, domain validation functions:
| Function | Purpose | Applied To |
|---|---|---|
| `validateSupplierLocality()` | Must be local/non_local/mixed/unclassified | Supplier create + update |
| `validateOwnershipType()` | Must be Saudi/foreign/joint_venture | Supplier create + update |
| `validatePositiveNumber()` | Amount must be > 0 | Spend create + import |
| `validatePercentage()` | Value must be 0-100 | Supplier fields |

---

## 4. Error Mapping

| Error Scenario | ActionResult Code | HTTP Analog |
|---|---|---|
| Invalid supplier locality | `VALIDATION_ERROR` | 400 |
| Invalid spend amount | `VALIDATION_ERROR` | 400 |
| Supplier not in user's org | `FORBIDDEN` | 403 |
| Project not found | `NOT_FOUND` | 404 |
| CSV with no valid rows | `OK` (empty validRows) | 200 (partial success) |

---

## 5. Revalidation Contracts

| Action | Revalidation Path |
|---|---|
| `createLocalContentSupplierAction` | Project detail page |
| `deleteLocalContentSupplierAction` | Project detail page |
| `createLocalContentSpendRecordAction` | Project detail page |
| `importLocalContentSpendCsvAction` | Project detail page |
| `classifyLocalContentSpendRecordAction` | Project detail page |

All mutations call `revalidateLocalContentProject(projectId)` internally.

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ 10 Supplier + Spend Server Actions in `localcontent-actions.ts` |
| **Documented** | ✅ This specification retroactively describes the existing API surface |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** API Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for review
- **Next:** LC-SPEC-02c (Workflow Specification)
