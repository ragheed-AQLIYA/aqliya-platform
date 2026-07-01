# LC-SPEC-03d: UX Specification — Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** UX Specification — retroactive alignment
> **Parent:** `LC-PRD-03_Evidence_Classification.md` v0.1
> **Depends On:** LC-SPEC-03c | **Template:** LC-SPEC-01d (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-03c |
| **Consumer** | Frontend, QA |
| **Evidence Classification** | Executive Evidence |

---

## 1. Screens

### 1.1 Evidence List (`/local-content/[projectId]/evidence`)

| Element | Behavior | State | Handling |
|---|---|---|---|
| Table | Columns: filename, type, status, linked entity, date | Loading | Skeleton spinner |
| | | Empty | "لا توجد أدلة مرفوعة — استخدم زر رفع الدليل لإضافة أول دليل" |
| | | Error | Toast "فشل تحميل قائمة الأدلة" |
| Status badge | Color-coded: uploaded (blue), reviewed (yellow), verified (green), rejected (red), missing (gray) | All | Chinese-remainder |
| Upload button | Opens file upload dialog | — | — |
| Download link | Click → route handler download | No file | Grayed out |
| Status change | Dropdown/button to change evidence status | — | Confirmation prompt |

### 1.2 Evidence Upload Form (Modal)

| Control | Type | Arabic |
|---|---|---|
| filename | Text input | اسم الملف |
| supplierId | Select | المورد |
| spendRecordId | Select | سجل الإنفاق |
| fileType | Select | نوع الملف |
| evidenceType | Select | نوع الدليل |
| File picker | File input | اختيار ملف |
| Submit | Button (Upload) | رفع |
| Cancel | Button | إلغاء |

### 1.3 Classification Rules View (`/local-content/[projectId]/classification-rules`)

| Element | Behavior |
|---|---|
| Table | Columns: category (Arabic), minLocalPct, allowedBases (Arabic), minConfidence |
| Source indicator | "metadata.classificationRules" (overridden) or "افتراضي" (default) |
| Edit link | Opens page to configure rules in project metadata |

### 1.4 Classification Create Form (Modal or Inline)

| Control | Type | Arabic |
|---|---|---|
| supplierId | Select | المورد |
| spendRecordId | Select | سجل الإنفاق |
| localPercentage | Number (0–100) | النسبة المحلية |
| classificationBasis | Select (Arabic labels) | أساس التصنيف |
| confidence | Select | مستوى الثقة |
| notes | Textarea | ملاحظات |
| Submit | Button | تصنيف |

---

## 2. Navigation

| Source | Link | Arabic Label |
|---|---|---|
| Project nav | `/local-content/[projectId]/evidence` | الأدلة |
| Project nav | `/local-content/[projectId]/classification-rules` | قواعد التصنيف |
| Supplier detail | Evidence tab | الأدلة المرتبطة |
| Spend detail | Classification tab | التصنيفات |

---

## 3. UX Rules

| UX-01 | Evidence status changes show confirmation before applying |
| UX-02 | Classification form pre-fills supplier/spend from context if navigated from detail page |
| UX-03 | Evidence download requires authenticated session (not logged in → login redirect) |
| UX-04 | Empty state shows actionable next step, not just "no data" |
| UX-05 | Classification validation warnings shown as yellow banner (not blocking) |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ evidence-form.tsx, evidence-file-upload-form.tsx, classification-rules-view.tsx, nav entries |
| **Documented** | ✅ This spec retroactively describes existing UX |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-03e (Test Specification)
