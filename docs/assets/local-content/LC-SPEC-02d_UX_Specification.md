# LC-SPEC-02d: UX Specification — Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** UX Specification — retroactive alignment documenting the supplier and spend management user experience.
> **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
> **Depends On:** `LC-SPEC-02a_Domain_Specification.md` v0.1
> **Template:** LC-SPEC-01d (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-02a, LC-SPEC-02b, LC-SPEC-02c |
| **Consumer** | Frontend Engineering, UX Design |
| **Evidence Classification** | Executable Evidence |

---

## 1. Page Map

| Route | Purpose | Server Actions Consumed |
|---|---|---|
| `/local-content/projects/[projectId]/suppliers` | Supplier list + create form | `listLocalContentSuppliersAction`, `createLocalContentSupplierAction`, `deleteLocalContentSupplierAction` |
| `/local-content/projects/[projectId]/spend` | Spend records + CSV import + classification | `listLocalContentSpendRecordsAction`, `createLocalContentSpendRecordAction`, `importLocalContentSpendCsvAction`, `classifyLocalContentSpendRecordAction` |

Both pages are accessed via the **Project Detail navigation grid** (11 cards).

---

## 2. Navigation

```
Project Detail
  │
  ├── الموردين (Suppliers) ─────► /projects/[projectId]/suppliers
  │
  └── الإنفاق (Spend) ──────────► /projects/[projectId]/spend
```

---

## 3. State Handling

| State | Suppliers Page | Spend Page |
|---|---|---|
| Loading | Shared `loading.tsx` at project level | Shared `loading.tsx` at project level |
| Error | `<InlineNotice variant="error">` | `<InlineNotice variant="error">` |
| Empty | "لم يتم إضافة موردين" + create CTA | "لا توجد سجلات إنفاق" + import CTA |
| Not Found | `not-found.tsx` (invalid project ID) | `not-found.tsx` (invalid project ID) |
| CSV Import Progress | N/A | Loading indicator during file upload |

---

## 4. RTL / Bilingual

| Element | Language |
|---|---|
| Page titles | Arabic: "الموردين" / "الإنفاق" |
| Form labels | Arabic (labels for supplier name, CR number, locality, etc.) |
| CSV upload button | Arabic |
| Empty states | Arabic |
| Error notices | Arabic |
| Status values | English (active, inactive, under_review) |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Supplier + Spend pages exist as sub-routes of project detail |
| **Documented** | ✅ This specification retroactively describes the UX structure |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** UX Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for review
- **Next:** LC-SPEC-02e (Test Specification)
