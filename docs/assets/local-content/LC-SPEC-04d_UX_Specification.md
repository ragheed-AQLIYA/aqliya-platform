# LC-SPEC-04d: UX Specification — Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** UX Specification — retroactive alignment
> **Parent:** `LC-PRD-04_Findings_Review.md` v0.1
> **Depends On:** LC-SPEC-04c | **Template:** LC-SPEC-01d (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-04c |
| **Consumer** | Frontend, QA |
| **Evidence Classification** | Executive Evidence |

---

## 1. Screens

### 1.1 Findings List (`/local-content/[projectId]/findings`)

| Element | Behavior |
|---|---|
| Table | Columns: title, type (Arabic), severity badge, status badge, linked entity, date |
| Loading | Skeleton spinner |
| Empty | "لا توجد نتائج — استخدم زر إضافة نتيجة لإنشاء أول نتيجة" |
| Severity badge | critical (red), high (orange), medium (yellow), low (gray) |
| Status badge | draft (gray), submitted (blue), reviewed (yellow), resolved (green), dismissed (gray) |
| Create button | Opens finding form modal |
| Edit | Click row → edit modal |
| Delete | Icon button + confirmation |

### 1.2 Finding Form (Modal)

| Control | Type | Arabic |
|---|---|---|
| type | Select | النوع |
| severity | Select | الأولوية |
| title | Text input | العنوان |
| description | Textarea | الوصف |
| linkedSupplierId | Select | المورد المرتبط |
| linkedSpendRecordId | Select | سجل الإنفاق المرتبط |
| status | Select (edit mode) | الحالة |
| Submit | Button | حفظ |
| Cancel | Button | إلغاء |

### 1.3 Review Section (`/local-content/[projectId]/review`)

| Element | Behavior |
|---|---|
| Current status indicator | Shows approval routing state |
| Review history | Timeline of submitted reviews |
| Submit review form | Action dropdown + comments textarea + submit button |
| Approval button | Shown when review prerequisites met |

### 1.4 Navigation

| Source | Link | Arabic Label |
|---|---|---|
| Project nav | `/local-content/[projectId]/findings` | النتائج |
| Project nav | `/local-content/[projectId]/review` | المراجعة |

---

## 2. UX Rules

| UX-01 | Finding type and severity shown as Arabic-labeled badges |
| UX-02 | Delete finding shows confirmation dialog |
| UX-03 | Status transition constrained (cannot skip steps) |
| UX-04 | Review form disabled if user already submitted a review |
| UX-05 | Approval routing state shown as progress indicator |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ finding-form.tsx, content-review-queue.tsx, nav entries |
| **Documented** | ✅ This spec retroactively describes existing UX |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-04e (Test Specification)
