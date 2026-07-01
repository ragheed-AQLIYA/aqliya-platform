# LC-SPEC-05c: Workflow Specification — Approval & Export

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — retroactive alignment
> **Parent:** `LC-PRD-05_Approval_Export.md` v0.1
> **Depends On:** LC-SPEC-05a, LC-SPEC-05b | **Template:** LC-SPEC-01c (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-05a, LC-SPEC-05b |
| **Evidence Classification** | Governance Evidence |

---

## 1. Approval Flow

```
1. Reviews are completed (at least one "completed" review)
2. User navigates to approval section → sees approval routing state
3. User submits approval with decision + optional comments
4. Server validates:
   a. Input schema
   b. At least one completed review exists
   c. All required reviewers have submitted
   d. No "returned" reviews without resolution
5. Approval record created with snapshot of current project state
6. Audit event recorded
```

---

## 2. Report Generation Flow

```
1. User selects report type and format
2. On submission:
   a. Server validates input schema
   b. Server fetches project data + calculates full score
   c. Report record created with:
      - Scoring metadata (localContent%, totalSpend, etc.)
      - Bilingual disclaimer (Arabic + English + Trust Principle)
      - Generated-by info
   d. Audit event recorded
3. Report listed on reports page
```

---

## 3. Scoring Data (in Report Metadata)

| Field | Source |
|---|---|
| `localContentPercentage` | `calculateProjectScore()` |
| `totalSpend` | Aggregated spend records |
| `supplierCount` | Supplier stats |
| `evidenceCoverage` | Evidence verification rate |
| `findingCount` | Finding stats |
| `generatedAt` | Timestamp |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Approval validation, report generation, scoring in existing codebase |
| **Documented** | ✅ This spec retroactively describes existing workflows |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-05d
