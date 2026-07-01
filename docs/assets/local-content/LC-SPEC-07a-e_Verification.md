# LC-SPEC-07a-e: Verification Checklist — All Specs

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Parent:** `LC-PRD-07_Verification.md`
> **Template:** LC-SPEC-01a–01e (Golden Reference)
> **Epic:** LC-EPIC-07

---

## Domain Specification (LC-SPEC-07a)

### Domain Model
Verification state stored entirely in `LocalContentProject.metadata.verificationChecklist` JSON. No separate database model.

### Value Objects
- `VerificationChecklistEntry`: `{ scale: string, workingPaperRef?: string }`
- `VerificationMatrixItem`: `{ id, section, criterionAr, criterionEn, scale }`

---

## API Specification (LC-SPEC-07b)

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `getLocalContentVerificationChecklistAction` | `(projectId) ⇒ ActionResult<VerificationChecklistReport>` | Full report | `view` | — |
| `updateLocalContentVerificationItemAction` | `(projectId, itemId, formData) ⇒ ActionResult<{itemId, scale}>` | Updated item | `admin` | `localcontent.verification.updated` |

---

## Workflow Specification (LC-SCEC-07c)

```
1. User navigates to verification checklist page
2. Server loads matrix from JSON + saved state from project metadata
3. Report shows items by section with current scale values
4. User updates item scale + optional working paper ref
5. Server validates + merges into project metadata
6. Audit event recorded
```

---

## UX Specification (LC-SPEC-07d)

| Element | Behavior |
|---|---|
| Checklist page | Items grouped by section with progress bars |
| Scale selector | 1–5 dropdown or N/A |
| Working paper ref | Optional text input |
| Save button | Per-item save |
| Progress | Section-level + overall completion % |

---

## Test Specification (LC-SPEC-07e)

| File | What It Tests |
|---|---|
| `verification-checklist.test.ts` | Parsing, report building, merge updates |

### Scenarios
```
✓ Builds report with default empty metadata (all items "not_started")
✓ Updates single item scale
✓ Merges multiple updates correctly
✓ Computes section-level progress
```

---

## Freeze Checklist — LC-EPIC-07

| Check | Status |
|---|---|
| All 5 Specs Frozen | ✅ LC-PRD-07 + LC-SPEC-07a–07e |
| Code Evidence Verified | ✅ verification-checklist.ts, .test.ts, updateVerificationItemAction |
| Architecture Drift | None |
