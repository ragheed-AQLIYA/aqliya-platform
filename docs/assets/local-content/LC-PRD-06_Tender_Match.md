# LC-PRD-06: Tender Match

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Tender Matching subsystem
> **Epic:** LC-EPIC-06

---

## 1. Overview

Tender Match (LC-02) is a deterministic matching engine that compares project supplier/spend data against a tender specification stored in project metadata. No AI, no schema changes — the tender spec lives in `project.metadata.tender` as JSON.

**In scope:** Tender spec parsing, match report generation, category-level matching, overall fit level determination.

---

## 2. Functional Requirements

| ID | Requirement | Implementation |
|---|---|---|
| FR-01 | Parse tender spec from project metadata JSON | `parseTenderSpecFromMetadata()` |
| FR-02 | Calculate overall local content percentage from suppliers | `buildTenderMatchReport()` |
| FR-03 | Compare against min required local content % | Score comparison |
| FR-04 | Calculate non-local spend share | Spend analysis |
| FR-05 | Compare against max non-local spend share | Score comparison |
| FR-06 | Count local suppliers vs min required | Supplier analysis |
| FR-07 | Match required spend categories against actual | Category matching |
| FR-08 | Determine overall fit level (pass/conditional/fail) | Score aggregation |
| FR-09 | Generate warnings for each violation | Violation list |
| FR-10 | Render match report in bilingual UI | `tender-match-view.tsx` |

---

## 3. Domain Model

### TenderSpec (from project.metadata)

| Field | Type | Default | Purpose |
|---|---|---|---|
| `titleAr` | string? | — | Arabic tender title |
| `titleEn` | string? | — | English tender title |
| `minLocalContentPct` | number | 30 | Minimum local content % |
| `maxNonLocalSpendSharePct` | number? | — | Max non-local spend share |
| `minLocalSupplierCount` | number | 1 | Min local suppliers |
| `requiredSpendCategories` | string[] | [] | Required categories |

### MatchReport

| Field | Type | Purpose |
|---|---|---|
| `projectName` | string | Name of project |
| `tender` | TenderSpec | Original spec |
| `supplierCount` | number | Total suppliers |
| `localSupplierCount` | number | Local suppliers |
| `spendByCategory` | Record | Spend breakdown |
| `localContentPct` | number | Calculated total |
| `nonLocalSpendSharePct` | number | Non-local share |
| `categoryMatches` | CategoryMatch[] | Per-category match |
| `warnings` | string[] | Bilingual violations |
| `fitLevel` | "pass"/"conditional"/"fail" | Overall |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `tender-matching.ts` (~180 lines), `tender-matching.test.ts`, `tender-match-view.tsx` |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-06a–06e
