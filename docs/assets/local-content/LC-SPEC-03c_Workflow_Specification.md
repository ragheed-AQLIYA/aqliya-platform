# LC-SPEC-03c: Workflow Specification — Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — retroactive alignment
> **Parent:** `LC-PRD-03_Evidence_Classification.md` v0.1
> **Depends On:** LC-SPEC-03a, LC-SPEC-03b | **Template:** LC-SPEC-01c (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-03a, LC-SPEC-03b |
| **Evidence Classification** | Governance Evidence |

---

## 1. Evidence Lifecycle

```
                    ┌──────────┐
                    │ UPLOADED │ (initial state on record creation)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ REVIEWED │ (reviewer marks examined)
                    └────┬─────┘
                         │
                    ┌────┴──────┐
                    ▼           ▼
              ┌─────────┐ ┌──────────┐
              │VERIFIED │ │ REJECTED │ (final states)
              └─────────┘ └──────────┘

Alternative path: UPLOADED ──► MISSING (file lost/deleted reference)
```

### State Rules

| Transition | Trigger | Permission | Side Effect |
|---|---|---|---|
| → UPLOADED | Action: createEvidenceEntry | create_evidence | Audit log entry |
| → REVIEWED | Action: updateStatus | review_evidence | Sync to Core evidence adapter |
| → VERIFIED | Action: updateStatus | review_evidence | Sync to Core evidence adapter |
| → REJECTED | Action: updateStatus | review_evidence | Sync to Core evidence adapter |
| → MISSING | (manual/file deletion) | create_evidence | Cleanup storage if needed |

---

## 2. Classification Flow

```
1. User selects supplier AND/OR spend record
2. User enters classification data:
   - localPercentage (0–100)
   - classificationBasis (enum)
   - confidence (optional, default "unverified")
   - notes (optional)
3. On submission:
   a. Server validates input schema
   b. Server looks up classification rules for the category
      (metadata override → DEFAULT_CLASSIFICATION_RULES)
   c. Server validates against rules via validateClassificationAgainstRules()
      - minLocalPct
      - allowedBases
      - minConfidence
   d. If violations → returned as warnings (not blocking)
   e. Classification record created with audit event
4. Revalidate classification list cache
```

---

## 3. File Upload Flow

```
1. User creates evidence record (filename, metadata) → gets evidenceId
2. User calls upload action with FormData containing:
   - file (File object)
   - evidenceId (string)
   - filename (optional override)
3. Server:
   a. Validates evidence exists and belongs to project
   b. Validates file size (limit by storage provider)
   c. Uploads to getStorageProvider()
   d. Updates evidence record with storageKey, fileHash, sizeBytes
   e. Creates audit event
4. Download via route handler:
   - Auth + tenant guard
   - Generates signed/download URL for evidence file
   - Audit event on download
```

---

## 4. File Download Flow

```
1. User clicks download on evidence row
2. Frontend navigates to: /api/local-content/evidence/[id]/download
3. Route handler:
   a. Verifies auth session
   b. Looks up evidence + verifies projectId matches user org
   c. Asserts download access permission
   d. Retrieves file from storage provider
   e. Returns file stream with original filename
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Evidence lifecycle, classification validation, file upload/download in existing code |
| **Documented** | ✅ This spec retroactively describes existing workflows |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-03d (UX Specification)
