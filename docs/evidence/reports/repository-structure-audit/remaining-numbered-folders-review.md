# Remaining Numbered Folders Review (Phase 2)

**Date:** 2026-05-16

## Context

Four pre-v1.1 numbered folders were archived in Phase 1 (`01-product-foundation`, `04-financial-statements`, `06-evidence-and-review`, `07-ai-governance`). Three remain in the root of `docs/`.

## Remaining Folders

### `docs/02-accounting-methodology/`

| Field | Value |
|-------|-------|
| **Content** | 7 files: TB requirements, COA logic, account classification, mapping, reclassification, materiality, accounting standards |
| **Purpose** | Detailed accounting methodology for AuditOS trial balance processing |
| **Conflicts with v1.1** | None detected — technical methodology, not positioning |
| **Referenced by** | `docs/execution/implementation-prompts.md`, `docs/governance/audit-governance.md` |
| **Product area** | AuditOS |
| **Recommendation** | **Keep active.** Move under `docs/systems/auditos/` when safe. Not pre-v1.1 identity — pure methodology. |

### `docs/03-audit-methodology/`

| Field | Value |
|-------|-------|
| **Content** | 6 files: audit preparation, risk framework, red flags, observations, missing info, approval model |
| **Purpose** | Audit methodology for reviewer workflow in AuditOS |
| **Conflicts with v1.1** | None detected — technical methodology, not positioning |
| **Referenced by** | `docs/execution/implementation-prompts.md`, `docs/governance/audit-governance.md` |
| **Product area** | AuditOS |
| **Recommendation** | **Keep active.** Move under `docs/systems/auditos/` when safe. |

### `docs/05-notes-system/`

| Field | Value |
|-------|-------|
| **Content** | 6 files: notes generation, accounting policies, note-to-FS mapping, disclosures, missing data, review checklist |
| **Purpose** | Notes engine methodology for AuditOS financial statement notes |
| **Conflicts with v1.1** | None detected — technical methodology, not positioning |
| **Referenced by** | `docs/execution/implementation-prompts.md`, `docs/governance/audit-governance.md` |
| **Product area** | AuditOS |
| **Recommendation** | **Keep active.** Move under `docs/systems/auditos/` when safe. |

## Summary

| Folder | Action | Reason |
|--------|--------|--------|
| `02-accounting-methodology/` | ✅ Keep active | Pure technical methodology; no v1.1 conflicts |
| `03-audit-methodology/` | ✅ Keep active | Pure technical methodology; no v1.1 conflicts |
| `05-notes-system/` | ✅ Keep active | Pure technical methodology; no v1.1 conflicts |

None of these folders contain positioning or identity claims. They are pure AuditOS domain methodology. They should eventually be moved under `docs/systems/auditos/methodology/` in a future phase with full import mapping.

> **Note:** These folders are still referenced by active documents (`docs/governance/*`, `docs/execution/*`). Moving them now would break cross-references. Deferred to a future phase.
