# Phase 2 — Naming and Duplicate Cleanup Report

**Date:** 2026-05-16
**Status:** Complete

## Summary

Phase 2 focused on reviewing remaining numbered folders, resolving commercial duplication, adding v1.1 alignment notices to product definition packs, and updating cross-references broken by Phase 1 archival.

## Files Moved

| From | To | Reason |
|------|----|--------|
| `docs/commercial/pilot-pack/` | `docs/archive/commercial-legacy/pilot-pack/` | Superseded by `docs/commercial-pack/` (newer, Arabic-first) |
| `docs/commercial/demo-storyline-auditos.md` | `docs/archive/commercial-legacy/demo-storyline-auditos.md` | Superseded by modular `demo-storyline/` (7 files) |

## Files Renamed

None in this phase. The `aqlia-auditos-boundaries.md` → `aqliya-auditos-boundaries.md` fix was completed in Phase 1.

## Files Reviewed but Kept

| Path | Reason |
|------|--------|
| `docs/02-accounting-methodology/` | Pure AuditOS methodology; no v1.1 conflicts |
| `docs/03-audit-methodology/` | Pure AuditOS methodology; no v1.1 conflicts |
| `docs/05-notes-system/` | Pure AuditOS methodology; no v1.1 conflicts |
| `docs/product/decisionos-product-definition-pack.md` | Valuable design thinking; added v1.1 notice |
| `docs/product/salesos-product-definition-pack.md` | Valuable design thinking; added v1.1 notice |
| `docs/product/simulationos-product-definition-pack.md` | Valuable design thinking; added v1.1 notice |
| `docs/product/governanceos-product-definition-pack.md` | Already had disclaimer; no action needed |
| `docs/product/aqliya-product-comparison-and-recommendation.md` | Internal strategic analysis; added v1.1 notice |
| `docs/commercial/demo-storyline/` | Active modular demo resource |
| `docs/commercial-pack/` | Active primary commercial pack |

## Files Marked as Owner Decision

| Path | Decision Needed | Risk |
|------|----------------|------|
| `docs/commercial/` (top-level folder) | Keep as top-level or restructure under `docs/product/` | Medium |
| `docs/02-accounting-methodology/`, `03-`, `05-` | Move under `docs/systems/auditos/methodology/` when safe | Low |

## Duplicate Groups Resolved

| Group | Canonical File | Archived File(s) | Reason |
|-------|---------------|------------------|--------|
| Pilot commercial pack | `docs/commercial-pack/` (12 files) | `docs/commercial/pilot-pack/` (10 files) | `commercial-pack` is newer, Arabic-first, more structured |
| Demo storyline | `docs/commercial/demo-storyline/` (7 modular files) | `docs/commercial/demo-storyline-auditos.md` (single file) | Modular version is the primary demo resource |

## Duplicate Groups Unresolved

| Group | Files | Status |
|-------|-------|--------|
| AuditOS commercial assets | `docs/product/auditos-commercial-assets/` vs `docs/commercial/` | Still needs owner decision |
| Product docs vs v1.1 | Product definition packs vs `docs/official/aqliya-product-taxonomy-v1.1.md` | ✅ v1.1 alignment notices added; docs kept in place |

## Links Updated

| File | Old Reference | New Reference |
|------|---------------|---------------|
| `docs/governance/audit-governance.md` | `docs/04-financial-statements/` | `docs/archive/legacy-numbered/04-financial-statements/` |
| `docs/governance/evidence-governance.md` | `docs/06-evidence-and-review/` | `docs/archive/legacy-numbered/06-evidence-and-review/` |
| `docs/governance/ai-governance.md` | `docs/07-ai-governance/` | `docs/archive/legacy-numbered/07-ai-governance/` |
| `docs/execution/implementation-prompts.md` | `docs/06-evidence-and-review/` | `docs/archive/legacy-numbered/06-evidence-and-review/` |
| `docs/execution/qa-prompts.md` | `docs/04-financial-statements/`, `docs/06-evidence-and-review/` | `docs/archive/legacy-numbered/...` |
| `docs/product/auditos-product-packaging.md` | `docs/01-product-foundation/` | `docs/archive/legacy-numbered/01-product-foundation/` |
| `docs/reports/stabilization/AQLIYA_STABILIZATION_AND_ARCHITECTURE_PLAN.md` | `docs/07-ai-governance/` | `docs/archive/legacy-numbered/07-ai-governance/` |
| `docs/commercial/README.md` | Referenced pilot-pack and demo-storyline-single as active | Updated to point to archive and new primary |

## v1.1 Alignment Notices Added

| File | Notice |
|------|--------|
| `docs/product/decisionos-product-definition-pack.md` | ✅ Added |
| `docs/product/salesos-product-definition-pack.md` | ✅ Added |
| `docs/product/simulationos-product-definition-pack.md` | ✅ Added |
| `docs/product/aqliya-product-comparison-and-recommendation.md` | ✅ Added |
| `docs/product/governanceos-product-definition-pack.md` | ⏭ Already had notice |

## Indexes Updated

- `docs/README.md` — Updated commercial/pilot navigation, archive descriptions
- `docs/DOCUMENTATION_INVENTORY.md` — Updated commercial folder status
- `docs/commercial/README.md` — Updated to reflect archival of pilot-pack and demo-storyline-single
- `docs/DOCUMENTATION_CONFLICT_REPORT.md` — Updated summary; marked Finding 2 and Finding 7 as resolved
- `docs/archive/commercial-legacy/COMMERCIAL_DUPLICATION_REVIEW.md` — Updated status from "analysis only" to "Phase 2 complete"

## Reports Created

| Report | Description |
|--------|-------------|
| `docs/reports/repository-structure-audit/remaining-numbered-folders-review.md` | Review of 02, 03, 05 numbered folders |
| `docs/reports/repository-structure-audit/product-docs-duplication-review.md` | Review of product definition packs vs v1.1 |
| `docs/reports/repository-structure-audit/phase-2-naming-duplicate-cleanup-report.md` | This report |

## Risks Remaining

| Risk | Level | Description |
|------|-------|-------------|
| Cross-references in large audit reports | Low | `AUDIT_REPORT.md` and `AQLIYA_FULL_PROJECT_AUDIT_REPORT.md` still reference old paths — not updated (do not rewrite large documents rule) |
| Commercial folder restructuring | Medium | `docs/commercial/` vs `docs/product/auditos-commercial-assets/` overlap unresolved |
| Governance/docs referencing 02/03/05 | Low | These folders still exist in root; no immediate issue |
| AI_CONTEXT.md vs AGENTS.md | Low | Not reviewed in Phase 2 — deferred to Phase 3 |

## Recommended Next Phase Prompt

للمرحلة 3 — مراجعة هيكل الشيفرة المصدرية (نظرية فقط):

````md
# Phase 3 — Source Folder Review (Structure Only)

Execute Phase 3 of the repository restructuring plan defined in `docs/reports/repository-structure-audit/restructure-plan.md`.

This is a structure review only. No files will be moved, renamed, or modified.

Goals:
- Review `src/components/visuals/` — assess if it should be `src/components/marketing/`
- Review `src/actions/tender.ts` — assess product ownership (AuditOS or LocalContentOS)
- Review `src/lib/audit/pagination.ts` and `rate-limit.ts` — assess as shared utilities
- Map import relationships for these potential moves
- Produce a Source Folder Review Report

Allowed:
- Read files
- Audit import paths
- Create analysis report

Forbidden:
- Move any file
- Change any import
- Refactor any code
- Change any business logic
````
