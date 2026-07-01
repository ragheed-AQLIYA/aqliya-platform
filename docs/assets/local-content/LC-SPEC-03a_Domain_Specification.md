# LC-SPEC-03a: Domain Specification — Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — retroactive alignment
> **Parent:** `LC-PRD-03_Evidence_Classification.md` v0.1
> **Depends On:** — | **Template:** LC-SPEC-01a (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-PRD-03 |
| **Consumer** | Implementation, Data Team |
| **Evidence Classification** | Executive Evidence |

---

## 1. Domain Model

### 1.1 Entities

#### LocalContentEvidence
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| supplierId | String? | | FK → LocalContentSupplier |
| spendRecordId | String? | | FK → LocalContentSpendRecord |
| filename | String | ✅ | Original uploaded filename |
| fileType | String | ✅ | "pdf", "doc", "xlsx", "image" |
| mimeType | String? | | MIME type from upload |
| storageKey | String? | | Storage provider key |
| fileHash | String? | | SHA-256 for integrity |
| sizeBytes | Int? | | File size |
| evidenceType | String | ✅ | From VALID_EVIDENCE_TYPES |
| status | EvidenceStatus | ✅ | uploaded → reviewed → verified/rejected |
| reviewNote | String? | | Reviewer note |
| reviewedById | String? | | FK → User |
| reviewedAt | DateTime? | | Timestamp |
| createdAt | DateTime | ✅ | Auto |
| updatedAt | DateTime | ✅ | Auto |

#### LocalContentClassification
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| supplierId | String? | | FK → LocalContentSupplier |
| spendRecordId | String? | | FK → LocalContentSpendRecord |
| classifiedBy | String? | | User who classified |
| localPercentage | Int | ✅ | 0–100 |
| classificationBasis | String | ✅ | From VALID_CLASSIFICATION_BASES |
| confidence | String | ✅ | unverified/low/medium/high |
| notes | String? | | Free text |
| createdAt | DateTime | ✅ | Auto |

### 1.2 Value Objects

| Value Object | Values | Source |
|---|---|---|
| EvidenceType | "certificate", "invoice", "contract", "report", "declaration", "other" | VALID_EVIDENCE_TYPES |
| EvidenceStatus | "uploaded", "reviewed", "verified", "rejected", "missing" | VALID_EVIDENCE_STATUSES |
| ClassificationBasis | "certificate", "self_declaration", "contract_term", "analyst_estimate" | VALID_CLASSIFICATION_BASES |
| ConfidenceLevel | "unverified", "low", "medium", "high" | VALID_CONFIDENCE_LEVELS |

### 1.3 Relationships

```
LocalContentProject ──┐
                     ├── LocalContentEvidence (0..n)
                     │      supplierId? → LocalContentSupplier
                     │      spendRecordId? → LocalContentSpendRecord
                     │
                     ├── LocalContentClassification (0..n)
                            supplierId? → LocalContentSupplier
                            spendRecordId? → LocalContentSpendRecord
```

### 1.4 Enum Definitions

```typescript
// From types.ts (existing)
export const VALID_EVIDENCE_TYPES = [
  "certificate", "invoice", "contract", "report", "declaration", "other",
] as const;

export const VALID_EVIDENCE_STATUSES = [
  "uploaded", "reviewed", "verified", "rejected", "missing",
] as const;

export const VALID_CLASSIFICATION_BASES = [
  "certificate", "self_declaration", "contract_term", "analyst_estimate",
] as const;

export const VALID_CONFIDENCE_LEVELS = [
  "unverified", "low", "medium", "high",
] as const;
```

---

## 2. Domain Rules

| Rule | Enforcement |
|---|---|
| Evidence belongs to exactly one project | FK on `projectId` |
| Evidence may optionally link to supplier/spend | Nullable FKs |
| Evidence status transitions: uploaded → reviewed → verified/rejected | Business logic in `updateLocalContentEvidenceStatusAction` |
| Classification must be linked to project | FK on `projectId` |
| Classification linked to supplier XOR spendRecord XOR neither | Business logic |
| Classification basis must be from valid values | Zod enum |
| Rule validation for category-local-specific combinations | `validateClassificationAgainstRules()` |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Evidence + Classification models, types, services in existing codebase |
| **Documented** | ✅ This spec retroactively describes existing domain |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-03b (API Specification)
