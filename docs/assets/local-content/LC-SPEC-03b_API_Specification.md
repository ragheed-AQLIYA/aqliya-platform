# LC-SPEC-03b: API Specification — Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — retroactive alignment
> **Parent:** `LC-PRD-03_Evidence_Classification.md` v0.1
> **Depends On:** LC-SPEC-03a | **Template:** LC-SPEC-01b (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-03a |
| **Consumer** | Frontend, QA |
| **Evidence Classification** | Executable Evidence |

---

## 1. Server Actions (API Surface)

All Server Actions live in `src/actions/localcontent-actions.ts`. Each returns `ActionResult<T>`.

### 1.1 Evidence Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `listLocalContentEvidenceAction` | `(projectId) => ActionResult<Evidence[]>` | Evidence list (desc by createdAt) | `view` | — |
| `createLocalContentEvidenceAction` | `(projectId, formData) => ActionResult<Evidence>` | Created evidence | `create_evidence` | `localcontent.evidence.created` |
| `updateLocalContentEvidenceStatusAction` | `(projectId, evidenceId, status) => ActionResult<{id, status}>` | Updated status | `review_evidence` | `localcontent.evidence.status_updated` |
| `deleteLocalContentEvidenceAction` | `(projectId, evidenceId) => ActionResult<void>` | — | `create_evidence` | `localcontent.evidence.deleted` |
| `uploadLocalContentEvidenceFileAction` | `(projectId, formData) => ActionResult<{id, filename, storageKey}>` | Upload metadata | `create_evidence` | `localcontent.evidence.file_uploaded` |

### 1.2 Classification Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `listLocalContentClassificationAction` | `(projectId) => ActionResult<Classification[]>` | Classification list | `view` | — |
| `classifyLocalContentSpendRecordAction` | `(projectId, formData) => ActionResult<Classification>` | Created classification | `classify` | `localcontent.classification.created` |

### 1.3 Route Handlers

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/api/local-content/evidence/[evidenceId]/download` | GET | Download evidence file | Auth + tenant guard |
| `/api/local-content/upload` | POST | Upload evidence file (alternative) | Auth + tenant guard |

---

## 2. Request/Response Contracts

### createLocalContentEvidenceAction — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `filename` | string | ✅ | Original filename |
| `supplierId` | string | | FK to supplier |
| `spendRecordId` | string | | FK to spend record |
| `fileType` | string | | Default: "pdf" |
| `mimeType` | string | | MIME type |
| `evidenceType` | string | | Default: "other" |

### classifyLocalContentSpendRecordAction — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `supplierId` | string | | FK to supplier |
| `spendRecordId` | string | | FK to spend record |
| `localPercentage` | number (0–100) | ✅ | Determined local content % |
| `classificationBasis` | string | ✅ | Basis enum value |
| `confidence` | string | | Default: "unverified" |
| `notes` | string | | Free text |

---

## 3. Error Handling

| Error | Code | HTTP Equivalent | Action |
|---|---|---|---|
| Validation error | VALIDATION_ERROR | 400 | Invalid form data |
| Not found | NOT_FOUND | 404 | Evidence/spend not in project |
| Unauthorized | — | 401 | Not authenticated |
| Forbidden | — | 403 | Missing project permission |

All actions follow the `safe()` pattern: catch → log → return `{ ok: false, error: string, code?: string }`.

---

## 4. Idempotency & Consistency

- Evidence creation is NOT idempotent (creates new row each call)
- Classification creation is NOT idempotent (creates new row each call)
- Status update IS idempotent (setting same status is safe)
- File upload requires evidence record first (two-step: create → upload)

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ All actions in localcontent-actions.ts with schemas in schemas/evidence/ |
| **Documented** | ✅ This spec retroactively describes existing API surface |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-03c (Workflow Specification)
