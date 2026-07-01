# METADATA_AUDIT.md
# Knowledge Governance Sprint v1 — Phase 5 Report

> **Status:** Completed | **Date:** 2026-06-29 | **Owner:** Governance Team | **Sprint:** Knowledge Governance Sprint v1

---

## 1. Executive Summary

A comprehensive scan of 1,860 non-archive Markdown files across 56 active documentation directories reveals a critical metadata gap. **Zero files (0%) have complete metadata** across all six required fields: Type, Status, Owner, KnowledgeArea, ReviewCycle, and LastReviewed. While 808 files (43.4%) carry some form of metadata, no single file satisfies the full standard.

Two incompatible metadata conventions exist — YAML frontmatter (used in 258 theoretical-reference files) and inline bold headers (used in official docs and governance files). Neither convention covers all required fields, and the two conventions never overlap in the same document.

**Key findings:**

| Metric | Value |
|--------|-------|
| Total files scanned | 1,860 |
| Complete metadata (6/6 fields) | 0 (0%) |
| Partial metadata | 808 (43.4%) |
| No metadata | 1,052 (56.6%) |
| Files missing KnowledgeArea | 1,860 (100%) |
| Files missing ReviewCycle | 1,859 (99.95%) |
| Files missing LastReviewed | 1,840 (98.9%) |
| Most common field: Status | 779 files (41.9%) |
| Most common Owner | "Founding Team" (260 files) |
| Most common Status | "Active" (official docs), "Approved" (theoretical-reference) |

**Recommendation:** Adopt a single YAML frontmatter standard for all active documentation, automate validation via pre-commit hook, and prioritize remediation of directories with highest file count and lowest coverage.

---

## 2. Methodology

### Scan Scope

- **Directory:** docs/ (excluding docs/archive/)
- **File type:** *.md (Markdown)
- **Total files scanned:** 1,860
- **Tools used:** PowerShell scripts with regex-based field detection
- **Scan date:** 2026-06-29

### Fields Checked

The six required metadata fields defined by the Knowledge Governance Charter:

| # | Field | Required | Description |
|---|-------|----------|-------------|
| 1 | **Type** | Yes | Document type (e.g., Doctrine, Report, Spec, Runbook, Gateway) |
| 2 | **Status** | Yes | Document status (e.g., Active, Draft, Approved, Superseded) |
| 3 | **Owner** | Yes | Responsible team or individual |
| 4 | **KnowledgeArea** | Yes | Knowledge domain classification |
| 5 | **ReviewCycle** | Yes | Review cadence or next review date |
| 6 | **LastReviewed** | Yes | Date of most recent review |

### Optional Fields Checked

| Field | Usage Count |
|-------|-------------|
| Superseded By | 0 |
| Supersedes | 0 |
| Classification | 0 |
| Version | Present in official docs and some YAML frontmatter docs |

### Detection Method

- **YAML frontmatter:** Files starting with --- followed by key-value pairs and closing with ---
- **Inline headers:** Files using **Field:** Value pattern in the first 20 lines
- Files matching neither pattern were classified as "no metadata"

---

## 3. Global Statistics

### Overall Distribution

| Category | Count | Percentage |
|----------|-------|------------|
| Complete metadata (6/6 required fields) | 0 | 0.0% |
| Partial metadata (1-5 fields) | 808 | 43.4% |
| No metadata | 1,052 | 56.6% |
| **Total** | **1,860** | **100%** |

### Field-by-Field Coverage

| Field | Present | Missing | Coverage % |
|-------|---------|---------|------------|
| Status | 779 | 1,081 | 41.9% |
| Owner | 518 | 1,342 | 27.8% |
| Type | 258 | 1,602 | 13.9% |
| Version (optional) | 258 | 1,602 | 13.9% |
| LastReviewed | 20 | 1,840 | 1.1% |
| ReviewCycle | 1 | 1,859 | 0.05% |
| KnowledgeArea | 0 | 1,860 | 0.0% |

### Most Common Values

| Field | Most Common Value | Count |
|-------|-------------------|-------|
| Status (official) | Active | ~260 files |
| Status (theoretical-reference) | Approved | ~200 files |
| Owner | Founding Team | 260 files |
| Type | doctrine | 258 files |

### Optional Field Usage

| Field | Files Using It |
|-------|----------------|
| Superseded By | 0 |
| Supersedes | 0 |
| Classification | 0 |

---

## 4. Metadata by Directory

Coverage percentage is calculated as: *(files with any metadata ÷ total files in directory) × 100*

| Directory | Total Files | With Metadata | Coverage % | Priority |
|-----------|-------------|---------------|------------|----------|
| theoretical-reference | 352 | 258 | 73.3% | Low |
| governance | 9 | 5 | 55.6% | Low |
| official | 14 | 14 | 100%* | Low |
| source-of-truth | 26 | 5 | 19.2% | Medium |
| deliverables | 90 | 18 | 20.0% | Medium |
| programs | 31 | 6 | 19.4% | Medium |
| validation | 32 | 3 | 9.4% | High |
| pilot | 61 | 5 | 8.2% | High |
| products | 270 | 20 | 7.4% | High |
| operations | 110 | 5 | 4.5% | High |
| releases | 95 | 4 | 4.2% | High |
| audits | 112 | 4 | 3.6% | High |
| marketing | 13 | 0 | 0.0% | Critical |
| deployment | 8 | 0 | 0.0% | Critical |
| engineering | 24 | 0 | 0.0% | Critical |
| runbooks | 5 | 0 | 0.0% | Critical |
| review | 35 | 0 | 0.0% | Critical |
| reports | 257 | 0 | 0.0% | Critical |
| architecture | 25 | 0 | 0.0% | Critical |
| auditos | 36 | 0 | 0.0% | Critical |
| systems | 39 | 0 | 0.0% | Critical |
| platform | 12 | 0 | 0.0% | Critical |
| commercial | 10 | 0 | 0.0% | Critical |
| commercial-pack | 16 | 0 | 0.0% | Critical |
| All others | 218 | 0 | 0.0% | Critical |

*\* official docs use inline headers, not YAML frontmatter — count reflects any metadata presence, not completeness*

**Note on "coverage":** Files counted as "with metadata" may have as few as 1 field. **No directory has files with complete 6-field metadata.**

---

## 5. Metadata Convention Comparison

### Convention A: YAML Frontmatter

**Used by:** docs/theoretical-reference/, some docs/source-of-truth/, some docs/deliverables/

**Example:**
`yaml
---
title: AQLIYA Core Doctrine v1.0 — Approval Report
document_id: 00.REPORT.004
status: Draft
owner: Founding Team
version: 1.0
last_updated: 2026-05-08
---
`

**Fields found (258 YAML files):**

| Field | Frequency | Notes |
|-------|-----------|-------|
| title | 258/258 | Universal but varied capitalization |
| status | 258/258 | Values: Draft, Approved, Active, etc. |
| owner | 258/258 | Values: Founding Team, Governance Team, etc. |
| last_updated | 258/258 | Date-based, but not equivalent to LastReviewed |
| version | 258/258 | Semantic versioning |
| document_id | 258/258 | Unique identifier pattern |
| priority | 251/258 | Not a required field |
| related_documents | 251/258 | Useful but optional |
| depth_level | 251/258 | Structural metadata |

**Non-standard naming:** Fields use lowercase snake_case (last_updated) instead of the required PascalCase (LastReviewed). No file has KnowledgeArea:, ReviewCycle:, or LastReviewed:.

### Convention B: Inline Bold Headers

**Used by:** docs/official/, docs/governance/, docs/DOCUMENTATION_AUTHORITY.md

**Example:**
`markdown
**Status:** Active
**Version:** 1.1
**Owner:** Governance Team
**Last Reviewed:** 2026-06-26
`

**Fields found (up to 14 files):**

| Field | Frequency | Notes |
|-------|-----------|-------|
| Status | ~14/14 | Some use different wording |
| Version | ~14/14 | Semantic versioning |
| Owner | ~12/14 | Variably present |
| Last Reviewed | ~10/14 | Variably present |
| Review cycle | ~1/14 | Only in governance charter |
| Source files | ~5/14 | System-specific field |

**Gaps:** No file has Type: or KnowledgeArea: as a bold header.

### Convention C: No Structured Metadata

**Used by:** 1,052 files (56.6%) across all directories.

These files have document titles, section headers, and content — but no structured metadata that a machine can parse. Information like status and ownership is implicit in the file path or content context.

### Convention Overlap

| Property | YAML Frontmatter | Inline Headers |
|----------|-----------------|----------------|
| Files using it | 258 | ~19 |
| Machine-parseable | Yes | Partial (regex-dependent) |
| Includes Status | Yes | Yes |
| Includes Owner | Yes | Partial |
| Includes ReviewCycle | No | Rarely |
| Includes KnowledgeArea | No | No |
| Includes LastReviewed | No (uses last_updated) | Sometimes |
| Schema validation | Possible | Difficult |
| Cross-convention documents | **0** | **0** |

**No document uses both conventions simultaneously.**

---

## 6. Missing Field Analysis

### Most Missing Fields

| Rank | Field | Missing From | Severity |
|------|-------|--------------|----------|
| 1 | KnowledgeArea | 1,860 files (100%) | Critical — no classification by domain |
| 2 | ReviewCycle | 1,859 files (99.95%) | Critical — no scheduled review process |
| 3 | LastReviewed | 1,840 files (98.9%) | High — cannot determine freshness |
| 4 | Type | 1,602 files (86.1%) | High — document purpose is implicit |
| 5 | Owner | 1,342 files (72.2%) | Medium — ownership unclear |
| 6 | Status | 1,081 files (58.1%) | Medium — document lifecycle unknown |

### Impact of Missing Fields

| Missing Field | Concrete Impact |
|---------------|-----------------|
| **KnowledgeArea** | Cannot filter docs by domain (audit, compliance, AI, etc.). Cross-referencing impossible. |
| **ReviewCycle** | No alerting for stale documents. Docs drift out of date silently. |
| **LastReviewed** | Cannot determine if a doc reflects current reality. Review history invisible. |
| **Type** | Cannot distinguish doctrine from reports from runbooks. Navigation relies on directory structure alone. |
| **Owner** | No accountability. Stale docs have no responsible party to update or archive. |
| **Status** | Cannot distinguish active docs from superseded, draft, or archived references. |

---

## 7. Recommendation: Uniform Metadata Template

### Proposed YAML Frontmatter Standard

All active documentation files should adopt the following YAML frontmatter template:

`yaml
---
title: "Document Title"
type: "doctrine | report | spec | runbook | gateway | reference | guide | log"
status: "active | draft | approved | superseded | archived"
owner: "Team Name | Individual Name"
knowledgeArea: "audit | ai | compliance | product | governance | platform | commercial | operations | technical | strategy"
reviewCycle: "quarterly | monthly | annually | 2026-Q3 | event-driven"
lastReviewed: "2026-06-29"
version: "1.0"
supersedes: ""        # Optional: file-path this document replaces
supersededBy: ""      # Optional: file-path that supersedes this document
classification: ""    # Optional: public | internal | confidential | restricted
---
`

**Field definitions:**

| Field | Required | Format | Validation |
|-------|----------|--------|------------|
| 	itle | Yes | String | Non-empty |
| 	ype | Yes | Enum from controlled list | Must match allowed types |
| status | Yes | Enum from controlled list | Must match allowed statuses |
| owner | Yes | String | Non-empty, ideally team name |
| knowledgeArea | Yes | Enum from controlled list | Must match allowed areas |
| eviewCycle | Yes | String | Follows pattern: requency \| date \| "event-driven" |
| lastReviewed | Yes | Date | Format: YYYY-MM-DD |
| ersion | Recommended | SemVer | MAJOR.MINOR or MAJOR.MINOR.PATCH |
| supersedes | If applicable | File path | Relative path to superseded file |
| supersededBy | If applicable | File path | Relative path to superseding file |
| classification | If sensitive | Enum | public, internal, confidential, estricted |

### Automation Strategy

1. **Pre-commit hook** — Validate YAML frontmatter presence and field completeness for new/changed .md files
2. **Lint script** — 
pm run docs:lint that checks all non-archive .md files against the standard
3. **Auto-remediation** — Script to inject missing fields with sensible defaults (e.g., lastReviewed: file-last-modified-date)

---

## 8. Priority Fix List

Directories are listed in **reverse order of current metadata coverage** (worst first).

| Priority | Directory | Files | Current Coverage | Action Required |
|----------|-----------|-------|-----------------|-----------------|
| **P0** | reports | 257 | 0% | Add YAML frontmatter to all files. Highest count, zero coverage. |
| **P0** | products | 270 | 7.4% | Add YAML to all files. Second highest count, near-zero coverage. |
| **P1** | audits | 112 | 3.6% | Add YAML to all files. |
| **P1** | operations | 110 | 4.5% | Add YAML to all files. |
| **P1** | releases | 95 | 4.2% | Add YAML to all files. |
| **P2** | audit | 36 | 0% | Zero coverage, high business importance. |
| **P2** | systems | 39 | 0% | Zero coverage. |
| **P2** | review | 35 | 0% | Zero coverage. |
| **P3** | pilot | 61 | 8.2% | Low but not zero. |
| **P3** | validation | 32 | 9.4% | Low but not zero. |
| **P3** | programs | 31 | 19.4% | Partial coverage from program charters. |
| **P4** | deliverables | 90 | 20.0% | Partial coverage from delivery reports. |
| **P4** | source-of-truth | 26 | 19.2% | Partial coverage from existing YAML. |
| **P5** | theoretical-reference | 352 | 73.3% | Has YAML but with non-standard field names. Remap fields. |
| **P5** | governance | 9 | 55.6% | Has partial inline headers. Standardize to YAML. |
| **P5** | official | 14 | 100%* | Has inline headers. Convert to YAML while preserving human readability. |

\* *"100%" refers to presence of any metadata, not completeness. Official docs have no Type or KnowledgeArea.*

---

## Appendix: Controlled Vocabulary Values

### 	ype Values
- doctrine — Official identity, governance, architecture docs
- eport — Analysis, audit, completion reports
- spec — Product specs, implementation specs
- unbook — Operational playbooks, deployment guides
- gateway — Cross-reference navigation files
- eference — Glossary, maps, indexes
- guide — How-to guides, pilot guides
- log — Changelogs, cleanup logs, activity logs

### knowledgeArea Values
- udit — Audit methodology and operations
- i — Artificial intelligence, AI governance
- compliance — Regulatory compliance
- product — Product specs and roadmaps
- governance — Platform governance, documentation governance
- platform — Core platform architecture
- commercial — Commercial strategy, sales, marketing
- operations — DevOps, deployment, runbooks
- 	echnical — Engineering, infrastructure
- strategy — Strategic planning, vision, market analysis

### status Values
- ctive — Currently valid and maintained
- draft — In progress, not finalized
- pproved — Reviewed and approved for use
- superseded — Replaced by a newer document
- rchived — Historical reference only

### classification Values
- public — Suitable for external publication
- internal — Internal platform documentation
- confidential — Restricted to specific teams
- estricted — Highest sensitivity, limited access

---

*This audit was conducted as part of Knowledge Governance Sprint v1, Phase 5. For the governance charter governing this work, see qliya-knowledge-governance-charter-v1.md. For navigation analysis, see NAVIGATION_ANALYSIS.md. For broken reference analysis, see BROKEN_REFERENCES.md.*
