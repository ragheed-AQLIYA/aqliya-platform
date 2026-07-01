# Phase 1 — Project Inventory Map

**Audit date:** 2026-05-31  
**Repository:** `C:\Users\PC\Documents\Aqliya`  
**Method:** Targeted glob, grep, and file reads (no shell tree walk; git commands blocked by environment hook)

---

## Top-Level Classification

| Path | Purpose | Status | Notes |
|------|---------|--------|-------|
| `src/` | Next.js application (routes, components, lib, actions) | **Active** | Primary implementation. Not in scope for this audit pass. |
| `prisma/` | Database schema, migrations, seeds | **Active** | Canonical data model. |
| `public/` | Static assets | **Active** | Marketing and app assets. |
| `tests/` / `__tests__/` / `*.test.ts` | Jest tests | **Active** | Scattered per repo convention. |
| `scripts/` | Ops, seed, validation, pilot utilities (49 files) | **Active / Mixed** | Many Sunbul-era names (`seed-sunbul-*`, `validate-sunbul-*`); agent scratch scripts (`_w3-*`, `_stage-*`, `_write_*`). |
| `docs/` | Primary documentation tree (~985 `.md` files under docs) | **Active / Mixed** | Well-structured core; significant sprawl in reports, product, theoretical-reference. |
| `README.md`, `AGENTS.md`, `CLAUDE.md` | Entry points and agent contract | **Active** | README aligned to authority hierarchy; AGENTS.md is large operational contract. |
| `.skills/aqliya/` | Agent skills | **Active** | 8 skill files; aligned with AGENTS.md. |
| `agent-reports/` | Agent wave output (15 files, untracked) | **Mixed / Sprawl** | Root-level agent logs outside `docs/reports/`. Waves 1–4 + v03-planning. |
| `wave-5/` | Agent wave output (2 files, untracked) | **Unknown / Sprawl** | Should live under `docs/reports/` or archive. |
| `docs/notion/` | Notion OS planning pack (30 files, untracked) | **Mixed** | Strategic planning; not in `DOCUMENTATION_AUTHORITY.md` hierarchy. |
| `.understand-anything/` | Codebase knowledge-graph tooling output (46 files, untracked) | **Tool artifact** | Intermediate batches, logs, JSON graphs — not product docs. |
| `.data/` | Runtime/local JSON (platform, sales) | **Runtime artifact** | Should not be committed; add to `.gitignore` review. |
| Root audit/review MD | `AQLIYA_STRATEGIC_REALITY_AUDIT.md`, `PROJECT_CLEANUP_REVIEW_REPORT*.md`, `opencode-last-instruction.md`, `tmp-*` | **Mixed / Clutter** | Untracked planning and scratch at repo root. |
| `gen_v02_test.py`, `tmp_write_*.py` | Ad-hoc scripts | **Scratch** | Untracked; archive or delete candidate after review. |
| `node_modules/` | Dependencies | **Active** | Standard; excluded from doc governance. |
| `.cursor/` | Cursor rules/hooks (referenced but path not readable in audit env) | **Active** | Hooks blocked shell git in this session. |

---

## `docs/` Top-Level Map

| Directory | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| `docs/DOCUMENTATION_AUTHORITY.md` | Level 0 conflict resolution | **Active** | Canonical hierarchy definition. |
| `docs/official/` | v1.1 doctrine (11 files) | **Active** | Includes `AQLIYA_MASTER_REFERENCE.md`, vision, taxonomy, architecture, roadmap. |
| `docs/source-of-truth/` | Architecture, routes, product status (13 files) | **Active** | Some internal contradictions on Sunbul/workflowos and PDF export claims across siblings. |
| `docs/product/` | Product specs, pilot packs, Sunbul legacy (~263 files) | **Active / Mixed** | Large Sunbul subdirectory still active despite WorkflowOS canonical rename. |
| `docs/systems/` | Operator/system docs per product | **Active** | `local-content-os/README.md` stale on PDF/XLSX vs code reality. |
| `docs/releases/` | v0.1 release scope, limitations, notes | **Active** | `aqliya-v0.1-release-scope.md` stale on LocalContentOS PDF/XLSX. |
| `docs/reports/` | Evidence and validation (~175+ `.md` files) | **Active / Sprawl** | Duplicative phase/eid/p2-agent waves; prior structure audits exist. |
| `docs/pilot/` | Pilot execution (61 files) | **Active** | Operational pilot docs; overlaps with `docs/product/pilot-control-pack/`. |
| `docs/archive/` | Historical docs (107 files) | **Legacy** | Well-labeled; README needs category expansion. |
| `docs/theoretical-reference/` | Background theory (352 files) | **Background** | Level 7 per authority; one file lists obsolete product names as current. |
| `docs/notion/` | Notion OS evolution pack (30 files) | **Mixed / Untracked** | Not indexed in `docs/README.md`. |
| `docs/execution/` | Engineering prompts and architecture guards (7 files) | **Mixed / Stale** | `architecture-guards.md` contradicts current multi-product reality. |
| `docs/deployment/` | AuditOS deployment/security posture | **Active** | Referenced from reports; not in docs index navigation table. |
| `docs/clients/` | Client org docs (e.g. Sunbul client) | **Active** | Corrects Sunbul-as-client vs product naming. |
| `docs/commercial/` | Demo storyline (8 files) | **Active** | `commercial-pack/` referenced in docs README but glob found 0 files — may be renamed/absent. |
| `docs/auditos/` | AuditOS-specific docs outside `systems/` | **Active** | Parallel to `docs/systems/auditos/`. |
| `docs/governance/`, `docs/architecture/`, `docs/content/` | Supporting docs | **Active** | Partial overlap with official/source-of-truth. |
| `docs/runtime-prototypes/` | Governance prototype notes | **Mixed** | Research/prototype; borderline archive candidate. |
| `docs/02-accounting-methodology/`, `docs/03-audit-methodology/` | Numbered methodology | **Active / Legacy naming** | Pre-v1.1 numbering pattern; content may still be valid for AuditOS. |

---

## Duplicated Planning Folders (Evidence)

| Location A | Location B | Issue |
|------------|------------|-------|
| `agent-reports/wave*.md` | `docs/reports/wave*.md`, `docs/reports/p2-agent*.md` | Same agent-wave pattern in two roots. |
| `docs/reports/repository-structure-audit/` | `docs/reports/project-organization/` (this pass) | Prior audit exists; this pass supersedes for 2026-05-31. |
| `docs/product/sunbul/` (~20+ files) | `docs/product/workflowos/` | Sunbul framed as product; WorkflowOS is canonical per official docs. |
| `docs/pilot/` | `docs/product/pilot-control-pack/`, `docs/product/first-pilot-execution-workflow/` | Three pilot doc trees with overlapping checklists. |
| `docs/archive/decision-os/` | `docs/systems/decisionos/` | Legacy Tender Decisions vs current DecisionOS. |

---

## Agent-Generated Report Sprawl

| Path | Count | Role | Recommended disposition |
|------|-------|------|-------------------------|
| `agent-reports/` | 15 | Untracked wave 1–4 agent outputs | Move to `docs/reports/agent-waves/` or `docs/archive/agent-reports-2026-05/` |
| `wave-5/` | 2 | Untracked continuation | Same as above |
| `docs/notion/` | 30 | Notion OS planning (untracked) | Index under `docs/reports/notion-os/` or keep as strategic annex with README cross-link |
| `.understand-anything/` | 46 | Tool artifacts | `.gitignore`; not documentation |

---

## Special Focus Summary

### DecisionOS / Sunbul / Tender leftovers

- **Tender Decisions:** Only in `docs/archive/decision-os/` and stale `docs/execution/architecture-guards.md`.
- **Sunbul:** Still described as "real custom workspace" in `AQLIYA_SYSTEM_TAXONOMY.md` while official vision/taxonomy say "legacy redirect alias to WorkflowOS."
- **Decision OS (spaced):** Used in `architecture-guards.md` and `aqliya-auditos-boundaries.md` — canonical is **DecisionOS**.

### Strategic audit folders

- Root: `AQLIYA_STRATEGIC_REALITY_AUDIT.md`, `PROJECT_CLEANUP_REVIEW_REPORT.md`, `PROJECT_CLEANUP_REVIEW_REPORT_v2.md` (all untracked).
- `docs/reports/institutional-analysis/` — large analysis reports.

---

## Inventory Gate

**Mode:** Audit-only with documentation creation. No file moves executed in Phase 1.

**Risk:** High volume of untracked root and `docs/notion/` content increases merge noise if committed without triage.
