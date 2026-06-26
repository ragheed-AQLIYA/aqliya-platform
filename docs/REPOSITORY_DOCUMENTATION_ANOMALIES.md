# AQLIYA — Repository Documentation Anomalies

> **Purpose:** Investigate and document every anomaly found during the documentation audit. Evidence-based, from repository inspection.
>
> **Status:** Active | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26

---

## Anomaly Summary

| ID | Severity | Anomaly | Category |
|----|----------|---------|----------|
| A-01 | 🔴 HIGH | Executable TypeScript under `docs/archive/retention/retention/` | Code in docs |
| A-02 | 🟡 MEDIUM | Duplicate architecture docs | Duplicate documents |
| A-03 | 🟡 MEDIUM | Duplicate roadmap docs | Duplicate documents |
| A-04 | 🟡 MEDIUM | Duplicate product status docs | Duplicate documents |
| A-05 | 🟡 MEDIUM | Overlapping governance docs | Overlap |
| A-06 | 🟡 MEDIUM | 10+ stale root-level reports | Stale artifacts |
| A-07 | 🟢 LOW | `CLAUDE.md` still present but superseded | Stale file |
| A-08 | 🟢 LOW | 200+ `desktop.ini` files across docs/ | Noise |
| A-09 | 🟢 LOW | Binary files undocumented | Missing metadata |
| A-10 | 🟢 LOW | DOCUMENTATION_GOVERNANCE.md has no `lastReviewed` field | Missing metadata |
| A-11 | 🟢 LOW | AGENTS.md §36 lists modifications but doc is not versioned | Versioning |
| A-12 | 🟢 LOW | `docs/DOCUMENTATION_CONFLICT_REPORT.md` may be stale (dated May 2026) | Stale report |

---

## A-01: Executable TypeScript Under docs/archive/retention/retention/

**Severity:** 🔴 HIGH

**Location:** `docs/archive/retention/retention/`

**Files Found:**
- `engine.ts`
- `history-store.ts`
- `holds.ts`
- `index.ts`
- `policies.ts`
- `types.ts`
- `__tests__/` (test directory)

**Root Cause:** Retention policy engine source code was placed (or copied) inside the documentation archive directory instead of in `src/` or `scripts/`.

**Why This Is an Anomaly:**
- Per `docs/DOCUMENTATION_GOVERNANCE_v2.md` §1.3: No executable source code under `docs/`
- TypeScript files in `docs/` create confusion about whether they are documentation or code
- These files may be dead code if the actual implementation lives elsewhere
- Test files under `docs/` are particularly anomalous

**Recommendation:**
1. Investigate whether these files are active code or archived reference copies
2. If active: move to `src/lib/retention/` or `scripts/retention/`
3. If archived reference: add a README explaining the origin and purpose
4. In either case: remove `.ts` files from `docs/` permanently

---

## A-02: Duplicate Architecture Documents

**Severity:** 🟡 MEDIUM

**Files:**
1. `docs/official/aqliya-core-architecture-v1.1.md` — Foundation architecture (official doctrine)
2. `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` — Detailed architecture (source of truth)

**Overlap:** Both documents describe AQLIYA architecture. v1.1 covers the foundational layer model; source-of-truth covers detailed component relationships.

**Root Cause:** Natural evolution — v1.1 was written first as official doctrine, then source-of-truth added detail. No supersession relationship was documented.

**Current State:** They are complementary, not fully redundant. Both have valid but overlapping content.

**Recommendation:**
1. Add a header to `aqliya-core-architecture-v1.1.md` stating: "Partially superseded by `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` for implementation details. Foundation architecture and layer model remain authoritative."
2. Add cross-reference in `AQLIYA_ARCHITECTURE.md` back to the founding doctrine
3. No content deletion needed

---

## A-03: Duplicate Roadmap Documents

**Severity:** 🟡 MEDIUM

**Files:**
1. `docs/official/aqliya-roadmap-v1.1.md` — Original roadmap
2. `docs/official/AQLIYA_ROADMAP_v1.2.md` — Updated execution roadmap
3. `docs/official/ENTERPRISE_COMPLETION_ROADMAP.md` — Enterprise-specific roadmap

**Overlap:** All three contain roadmap and execution planning content.

**Root Cause:** Multiple roadmap documents were created at different times for different audiences. v1.2 was created to supersede v1.1 but the supersession was not fully documented.

**Current State:** `AQLIYA_ROADMAP_v1.2.md` explicitly states it supersedes the other two documents (where conflict exists). The supersession is partially documented.

**Recommendation:**
1. Add explicit `Status: Partially Superseded` header to `aqliya-roadmap-v1.1.md` noting which sections remain valid (vision, strategy) and which are superseded (execution timeline)
2. Add explicit `Status: Superseded` header to `ENTERPRISE_COMPLETION_ROADMAP.md` with reference to v1.2
3. Keep all files for historical reference

---

## A-04: Duplicate Product Status Documents

**Severity:** 🟡 MEDIUM

**Files:**
1. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Detailed per-product status (40+ rows)
2. `docs/official/AQLIYA_MASTER_REFERENCE.md` — Contains product status summary table
3. `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` — Contains status summary
4. `AGENTS.md` §4 — Contains product status map

**Overlap:** Four files contain product status information at different levels of detail.

**Root Cause:** Product status is naturally referenced in multiple documents. Not truly duplicate — each serves a different purpose.

**Current State:** Complementary. Master reference has high-level summary; matrix has detailed breakdown; current state has operational status; AGENTS.md has agent-facing summary.

**Recommendation:**
1. Add cross-reference comment in each document pointing to `PRODUCT_STATUS_MATRIX.md` as the definitive detailed source
2. Ensure all documents reference the matrix for authoritative status rather than duplicating independently
3. No content change needed

---

## A-05: Overlapping Governance Documents

**Severity:** 🟡 MEDIUM

**Files:**
1. `docs/DOCUMENTATION_AUTHORITY.md` — Documentation conflict resolution authority
2. `docs/DOCUMENTATION_GOVERNANCE.md` — Original governance rules (v1.0)
3. `docs/DOCUMENTATION_GOVERNANCE_v2.md` — Updated governance rules (v2.0)
4. `AGENTS.md` — Contains governance rules in §11, §12, §18, §35
5. `docs/official/aqliya-implementation-rules-v1.1.md` — Implementation governance

**Overlap:** Five documents touch governance topics. Some overlap is intentional (different purposes), but the boundaries between them are unclear.

**Root Cause:** Governance rules accumulated organically across documents. AGENTS.md grew to 1767 lines absorbing governance content.

**Current State:**
- DOCUMENTATION_AUTHORITY.md: Conflict resolution only
- DOCUMENTATION_GOVERNANCE.md v1.0: General governance (being deprecated)
- DOCUMENTATION_GOVERNANCE_v2.md: Document lifecycle, ownership, naming, versioning
- AGENTS.md: Agent-facing governance (security, features, data, reporting)
- Implementation rules: Code-level governance

**Recommendation:**
1. Deprecate `DOCUMENTATION_GOVERNANCE.md` (v1.0) in favor of v2.0 — already done
2. Add a governance map comment in each document clarifying scope boundaries
3. Consolidate review cycle and ownership rules into v2.0

---

## A-06: Stale Root-Level Reports

**Severity:** 🟡 MEDIUM

**Files (10+):**
- `BUILD_FAILURE_MATRIX.md`
- `BUILD_STABILIZATION_REPORT.md`
- `SOCPA_COMPLETE_ANALYSIS.md`
- `PILOT_RESPONSE.md`
- `ROADMAP_2025.md`
- `QUALITY_REPORT.md`
- `AGENT_TASK_REPORT.md`
- `NEXT_STEPS_SNAPSHOT.md`
- `TRANSITION_MATRIX.md`
- `ORGANIZATION_MIGRATION_PLAN.md`
- `AGENTS_V2_CHECKLIST.md`
- `MIGRATION_GUIDE.md`

**Root Cause:** Reports were generated during various phases of development and left at the repository root without cleanup or archival.

**Why This Is an Anomaly:**
- Repository root should contain only canonical project files
- Stale reports create noise for new developers and AI agents
- Some reports may contain outdated information that could be mistaken for current status

**Recommendation:**
1. Review each file for continuing relevance
2. Move confirmed-stale reports to `docs/archive/reports/`
3. Keep actively relevant ones at root or in `docs/reports/`
4. Add date markers to filed reports

---

## A-07: Stale CLAUDE.md

**Severity:** 🟢 LOW

**File:** `CLAUDE.md` at repository root

**Current State:** Contains agent context instructions that predate the comprehensive AGENTS.md. Still present but not referenced by any configuration.

**Root Cause:** Leftover from earlier Claude Code configuration before the AGENTS.md contract was formalized.

**Recommendation:**
1. Add `**Status:** Deprecated — use AGENTS.md` header
2. Keep file in place (do not delete)
3. Update `.claude/settings.json` or similar if it references CLAUDE.md

---

## A-08: desktop.ini Files

**Severity:** 🟢 LOW

**Location:** Throughout `docs/` directory, 200+ files

**Root Cause:** Windows File Explorer automatically creates `desktop.ini` in directories with custom folder settings. These are invisible in Explorer but visible to file scans.

**Impact:** No functional impact. Creates noise for AI tools doing glob searches.

**Recommendation:**
1. Add `desktop.ini` to `.gitignore` if not already present
2. Do not actively remove — they are harmless
3. AI tools should filter `desktop.ini` from file searches

---

## A-09: Undocumented Binary Files

**Severity:** 🟢 LOW

**Location:** Repository root — `.docx`, `.pptx`, `.xlsx`, `.pdf` files

**Current State:** Binary files exist at root but are not documented in any index. AI tools cannot read them.

**Root Cause:** Commercial assets and presentations placed at repository root without documentation.

**Recommendation:**
1. Document each binary file's purpose in a `docs/commercial/binary-assets-index.md`
2. Or move to `docs/commercial-pack/`
3. Ensure markdown equivalents exist for key content

---

## A-10: Missing Metadata in DOCUMENTATION_GOVERNANCE.md

**Severity:** 🟢 LOW

**File:** `docs/DOCUMENTATION_GOVERNANCE.md`

**Issue:** No `lastReviewed` field, no change log, no explicit status field.

**Recommendation:** Add metadata header before deprecation. Since it is being superseded by v2.0, add deprecation header only.

---

## A-11: AGENTS.md Versioning

**Severity:** 🟢 LOW

**File:** `AGENTS.md`

**Issue:** AGENTS.md §36 tracks modification dates but the document itself has no version number in its header. At 1767 lines, it lacks internal structure for cross-referencing.

**Recommendation:**
1. Add version number to AGENTS.md header (e.g., `**Version:** 0.2`)
2. Add a table of contents for easier navigation
3. Continue using §X references for precise cross-referencing

---

## A-12: Stale Conflict Report

**Severity:** 🟢 LOW

**File:** `docs/DOCUMENTATION_CONFLICT_REPORT.md`

**Date:** 2026-05-16 (6+ weeks old)

**Issue:** This report identified documentation conflicts that may have been resolved by subsequent work. It has not been updated.

**Recommendation:**
1. Review if findings are still valid
2. If resolved, update status or archive
3. If still valid, reference from AI_ENTRYPOINT.md

---

## Anomaly Resolution Priority

| Priority | Anomalies | Action Required |
|----------|-----------|----------------|
| **P0 — Immediate** | A-01 (code in docs) | Move retention/ code out of docs/ |
| **P1 — This week** | A-02, A-03 (duplicate docs) | Add supersession headers |
| **P2 — This month** | A-04, A-05, A-06 (overlaps, stale reports) | Review, archive, add cross-refs |
| **P3 — Backlog** | A-07 through A-12 (low severity) | Metadata updates, documentation |

---

## Methodology

All anomalies found through:
1. Glob scan of all `.md`, `.ts`, `.js`, `.json` files in `docs/`
2. Cross-reference analysis of documents covering similar topics
3. Comparison of document dates and version numbers
4. Content inspection of key documents
5. Root-cause analysis

No code changes were made during this investigation.

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — Anomalies Report v1.0 | OpenCode |

---
