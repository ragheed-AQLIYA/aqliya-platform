# AQLIYA Documentation Cleanup Plan

> **Purpose:** Identify every document issue (duplicate, superseded, temporary, stale) and recommend resolution. No files will be deleted — this is a plan only.
>
> **Status:** Active | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26
>
> **Rule:** DO NOT delete anything. Only produce recommendations.

---

## Executive Summary

| Category | Count | Action Required |
|----------|-------|----------------|
| Duplicate documents | 4 pairs | Mark superseded; merge content |
| Superseded documents | 4 | Update status headers |
| Temporary reports | 10+ | Archive or delete markers |
| Validation reports | 5+ | Archive or keep with date markers |
| Evidence reports | 3 | Archive |
| Historical reports | 5+ | Archive |
| Anomalous files under docs/ | 1 (retention/ directory) | Move to src/ or scripts/ |
| Archive candidates (root-level) | 10+ | Move to docs/archive/ |

---

## 1. Duplicate Documents

### Pair 1: DOCUMENTATION GOVERNANCE

| File | Status | Action |
|------|--------|--------|
| `docs/DOCUMENTATION_GOVERNANCE.md` (88 lines, v1.0) | **Deprecate** | Add `Status: Deprecated`, add `Superseded By: docs/DOCUMENTATION_GOVERNANCE_v2.md` header |
| `docs/DOCUMENTATION_GOVERNANCE_v2.md` (new) | **KEEP** | Already created — active governance document |

**Recommended:** Mark old v1.0 as deprecated. Keep both files (v1.0 remains for historical reference).

### Pair 2: ROADMAPS

| File | Status | Action |
|------|--------|--------|
| `docs/official/aqliya-roadmap-v1.1.md` | **Partially superseded** | Add header noting which sections are superseded by v1.2 |
| `docs/official/AQLIYA_ROADMAP_v1.2.md` | **KEEP — Active** | Already active — single source of truth for execution |
| `docs/official/ENTERPRISE_COMPLETION_ROADMAP.md` | **Superseded** | Add `Status: Superseded` header, reference v1.2 |

**Recommended:** Update v1.1 status header. Keep enterprise completion roadmap for historical record.

### Pair 3: ARCHITECTURE

| File | Status | Action |
|------|--------|--------|
| `docs/official/aqliya-core-architecture-v1.1.md` | **Partially superseded** | Add header noting foundation architecture is valid; implementation details in source-of-truth |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | **KEEP — Active** | Detailed architecture — single source of truth |

**Recommended:** Update v1.1 header to clarify partial supersession.

### Pair 4: PRODUCT STATUS

| File | Status | Action |
|------|--------|--------|
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | **KEEP — Active** | Detailed product status |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | **KEEP — Active** | Contains status summary but references matrix for details |

**Recommended:** No change needed — these are complementary. Master reference has summary, matrix has detail. Add cross-reference in both.

### Pair 5: CURRENT STATE

| File | Status | Action |
|------|--------|--------|
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | **KEEP — Active** | Most recent operational snapshot |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | **KEEP — Active** | Broader identity + status summary |

**Recommended:** No change — different purposes. Ensure cross-references.

### Pair 6: DOCUMENTATION GOVERNANCE (old vs DOCUMENTATION_AUTHORITY)

| File | Status | Action |
|------|--------|--------|
| `docs/DOCUMENTATION_AUTHORITY.md` | **KEEP — Active** | Highest authority — conflict resolution |
| `docs/DOCUMENTATION_GOVERNANCE.md` | **Deprecate** | Superseded by v2 |

**Recommended:** Resolved by pair 1 above.

---

## 2. Superseded Documents

| Document | Superseded By | Action |
|----------|---------------|--------|
| `docs/DOCUMENTATION_GOVERNANCE.md` | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Add deprecation header |
| `docs/official/ENTERPRISE_COMPLETION_ROADMAP.md` | `docs/official/AQLIYA_ROADMAP_v1.2.md` | Add superseded header |
| `docs/releases/L6_PRODUCTION_ROADMAP.md` | `docs/official/AQLIYA_ROADMAP_v1.2.md` | Move to archive or add superseded header |
| `CLAUDE.md` | `AGENTS.md` | Add deprecation header |

---

## 3. Temporary Reports (Root-Level)

These documents appear to be one-time or stale reports. They should be reviewed and archived.

| File | Est. Date | Action |
|------|-----------|--------|
| `BUILD_FAILURE_MATRIX.md` | Pre-2026-05 | **ARCHIVE** to `docs/archive/reports/build-failure-matrix.md` |
| `BUILD_STABILIZATION_REPORT.md` | Pre-2026-05 | **ARCHIVE** to `docs/archive/reports/build-stabilization-report.md` |
| `SOCPA_COMPLETE_ANALYSIS.md` | Pre-2026-05 | **ARCHIVE** to `docs/archive/reports/socpa-complete-analysis.md` |
| `PILOT_RESPONSE.md` | Pre-2026-05 | **ARCHIVE** to `docs/archive/reports/pilot-response.md` |
| `TRANSITION_MATRIX.md` | Unknown | **REVIEW** before archiving |
| `NEXT_STEPS_SNAPSHOT.md` | Unknown | **REVIEW** before archiving |
| `ORGANIZATION_MIGRATION_PLAN.md` | Unknown | **REVIEW** — may still be active |
| `ROADMAP_2025.md` | 2025 | **ARCHIVE** to `docs/archive/reports/roadmap-2025.md` |
| `QUALITY_REPORT.md` | Unknown | **ARCHIVE** to `docs/archive/reports/quality-report.md` |
| `AGENT_TASK_REPORT.md` | Unknown | **ARCHIVE** to `docs/archive/reports/agent-task-report.md` |

**Total root-level report files to review:** 12+

---

## 4. Validation Reports

| File | Action |
|------|--------|
| `docs/deliverables/` (all files) | **REVIEW** — these are generated deliverables, likely stale |
| `docs/reports/auditos-deliverables-list-2026-05-17.md` | **KEEP** for 6 months, then archive |
| `docs/reports/deliverable-ai-review-ready-2026-05-17.md` | **KEEP** for 6 months, then archive |
| Any file dated before 2026-05 in `docs/reports/` | **REVIEW** for archival |

---

## 5. Evidence Reports

| File | Action |
|------|--------|
| `docs/pilot/**` | **KEEP** — pilot documentation is needed for reference |
| `docs/deliverables/` output files | **REVIEW** for staleness |

---

## 6. Historical Reports

| File | Action |
|------|--------|
| `docs/archive/old-brand/` | **KEEP** — already archived |
| `docs/archive/pre-v1.1/` | **KEEP** — already archived |
| `docs/archive/numbered-folders/` | **KEEP** — already archived |
| `docs/archive/reports/` | **KEEP** — already archived |

---

## 7. Archive Candidates

### Root-Level Files to Move to `docs/archive/reports/`

Based on content inspection, these files are stale snapshots:

1. `BUILD_FAILURE_MATRIX.md`
2. `BUILD_STABILIZATION_REPORT.md`
3. `SOCPA_COMPLETE_ANALYSIS.md`
4. `PILOT_RESPONSE.md`
5. `ROADMAP_2025.md`
6. `QUALITY_REPORT.md`
7. `AGENT_TASK_REPORT.md`
8. `NEXT_STEPS_SNAPSHOT.md` (review first)
9. `TRANSITION_MATRIX.md` (review first)
10. `ORGANIZATION_MIGRATION_PLAN.md` (review first)

### Files Requiring Cross-Reference Before Archiving

- `TRANSITION_MATRIX.md` — may contain active migration data
- `NEXT_STEPS_SNAPSHOT.md` — may contain pending action items
- `ORGANIZATION_MIGRATION_PLAN.md` — may contain active organization data

---

## 8. Action Summary Table

| Action | Count | Priority |
|--------|-------|----------|
| **KEEP** (no action needed) | ~150 files | — |
| **Update status header** (add Deprecated/Superseded) | 4-6 files | High |
| **ARCHIVE** (move to docs/archive/reports/) | 10+ files | Medium |
| **REVIEW** for potential archival | 3 files | Medium |
| **Add cross-reference** (complementary pairs) | 2 pairs | Low |
| **Investigate anomalous content** (retention/ code) | 1 directory | High |

---

## 9. Non-Recommended Actions

These are explicitly NOT recommended:

- ❌ Do not delete any files
- ❌ Do not rename `docs/archive/` structure
- ❌ Do not merge content without preserving original
- ❌ Do not modify application code
- ❌ Do not delete root-level reports without review

---

## 10. Execution Phases

| Phase | Scope | Est. Effort |
|-------|-------|-------------|
| 1 | Update status headers on superseded docs | 1 hour |
| 2 | Review root-level reports (3 flagged files) | 1 hour |
| 3 | Archive root-level reports to docs/archive/reports/ | 2 hours |
| 4 | Move retention/ code from docs/ to src/ or scripts/ | 1 hour |
| 5 | Add cross-references in complementary pairs | 30 min |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — Documentation Cleanup Plan v1.0 | OpenCode |

---
