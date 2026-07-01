# LC-PRD-07: Verification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Verification Checklist subsystem
> **Epic:** LC-EPIC-07

---

## 1. Overview

Verification Checklist (LC verification audit matrix) is a human-review checklist loaded from a knowledge JSON file. No AI. Each item has a section, criterion, and a scale (1–5 or N/A). Progress is stored in `project.metadata.verificationChecklist`.

**In scope:** Checklist loading from JSON, item update, progress computation, report generation.

---

## 2. Functional Requirements

| ID | Requirement | Implementation |
|---|---|---|
| FR-01 | Load verification matrix from knowledge JSON | `import verification-audit-matrix-v1.json` |
| FR-02 | Parse saved checklist state from metadata | `parseVerificationChecklistFromMetadata()` |
| FR-03 | Build full report (matrix + saved state) | `buildVerificationChecklistReport()` |
| FR-04 | Update single checklist item (scale + working paper ref) | `mergeVerificationChecklistUpdate()` |
| FR-05 | Compute section-level and overall progress | Aggregation in report builder |
| FR-06 | Update via server action with audit trail | `updateLocalContentVerificationItemAction()` |

---

## 3. Data Model

### VerificationMatrixItem (from JSON)
| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique item ID |
| `section` | string | Section classification |
| `criterionAr` | string | Arabic criterion |
| `criterionEn` | string | English criterion |
| `scale` | "scale_1_5" | All items use 1–5 scale |

### VerificationChecklistEntry (user state)
| Field | Type | Purpose |
|---|---|---|
| `scale` | string | Selected scale value |
| `workingPaperRef` | string? | Reference note |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ verification-checklist.ts + .test.ts in existing codebase |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1
