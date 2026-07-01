# LC-PRD-03: Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Evidence & Classification subsystem
> **Epic:** LC-EPIC-03

---

## 1. Overview

Evidence & Classification manages file-based evidence linked to suppliers and spend records, and applies classification rules to determine local content percentages. Every evidence item has an audit trail, review status, and optional file storage. Classification rules are deterministic (LC-04) with metadata-driven overrides.

**In scope:** Evidence CRUD with file upload/download, classification rule registry, classification CRUD with rule validation, evidence status workflow (uploaded → reviewed → verified/rejected).

---

## 2. File Organization

| Layer | Files | Purpose |
|---|---|---|
| Domain Services | `services.ts` — `listEvidence`, `createEvidenceEntry`, `deleteEvidence`, `listClassifications`, `createClassification` | CRUD operations |
| Classification Rules | `classification-rules.ts` | Rule registry with default rules + metadata overrides |
| Schemas | `schemas/evidence.ts` | Zod: `createEvidenceSchema`, `updateEvidenceStatusSchema`, `uploadEvidenceFileSchema` |
| Route Handlers | `evidence/[evidenceId]/download/route.ts` | File download with auth + tenant isolation |
| Audit | `audit-events.ts` | Events: EVIDENCE_UPLOADED, CLASSIFICATION_CREATED |

---

## 3. Functional Requirements

### FR-01: Evidence Management
| ID | Requirement | Implementation |
|---|---|---|
| FR-01.1 | Create evidence entry with file metadata | `createEvidenceEntry()` |
| FR-01.2 | Upload file to storage provider | `uploadLocalContentEvidenceFileAction()` |
| FR-01.3 | Download evidence file (auth'd) | Route handler + `assertEvidenceDownloadAccess()` |
| FR-01.4 | List evidence for a project | `listEvidence(projectId)` |
| FR-01.5 | Update evidence review status | `updateLocalContentEvidenceStatusAction()` |
| FR-01.6 | Delete evidence | `deleteEvidence()` |

### FR-02: Classification
| ID | Requirement | Implementation |
|---|---|---|
| FR-02.1 | Create classification record for supplier/spend | `createClassification()` |
| FR-02.2 | Validate against classification rules | `validateClassificationAgainstRules()` |
| FR-02.3 | Support classification bases | `certificate`, `self_declaration`, `contract_term`, `analyst_estimate` |
| FR-02.4 | Arabic labels for bases and rules | `getClassificationBasisLabel()`, `labelAr` fields |
| FR-02.5 | List classifications for a project | `listClassifications(projectId)` |

---

## 4. Domain Rules

| ID | Rule | Enforcement |
|---|---|---|
| DR-01 | Evidence type must be valid | `validateEvidenceType()` |
| DR-02 | Evidence status transitions: uploaded → reviewed → verified/rejected | `updateEvidenceStatusSchema` |
| DR-03 | Classification basis must be in allowed list | Rule validation |
| DR-04 | Classification confidence must meet minimum for category | Rule validation |
| DR-05 | Evidence file access requires project-level permission | Route handler guard |

---

## 5. Evidence Status Machine

```
uploaded ──► reviewed ──► verified
                      └──► rejected
    │
    └──► missing
```

---

## 6. Classification Rule Registry

Default rules (from `classification-rules.ts`):

| Category | Min Local % | Allowed Bases | Min Confidence |
|---|---|---|---|
| services | 30% | certificate, contract_term, self_declaration | medium |
| equipment | 25% | certificate, contract_term | medium |
| consulting | 40% | certificate, analyst_estimate, contract_term | high |
| construction | 35% | certificate, contract_term | high |

Rules can be overridden via project metadata.

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Evidence CRUD, file upload/download, classification rules in existing codebase |
| **Documented** | ✅ This PRD retroactively describes the existing implementation |
| **Behavior Changed** | None | Code Modified | None | Governance Added | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-03a (Domain Specification)
