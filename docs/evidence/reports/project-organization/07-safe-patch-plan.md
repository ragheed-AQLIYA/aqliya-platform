# Phase 7 — Safe Patch Plan

**Audit date:** 2026-05-31  
**Execution policy:** Category A executed (2026-06-01). Category B **fully executed** (2026-06-01). Category C doc-only items **complete** (2026-06-01); code/schema items remain future.

---

## Category A — Safe Immediately (docs-only patches)

| ID | Path | Action | Risk | Status |
|----|------|--------|------|--------|
| A1 | `docs/README.md` | Add navigation rows: deployment, clients, execution (stale warning), notion (planning annex), project-organization, releases; fix commercial-pack broken link | Low | **Done this pass** |
| A2 | `docs/archive/README.md` | Expand category table; add agent-report and gitignore warnings | Low | **Done this pass** |
| A3 | `docs/reports/project-organization/README.md` | Create index for this audit pass | Low | **Done this pass** |
| A4 | `README.md` L50 | Change "binary PDF/XLSX export deferred" → "binary PDF/XLSX export implemented (2026-05-25); not L6" | Low | **Done this pass** |
| A5 | `docs/systems/local-content-os/README.md` | Sync export section to match matrix | Low | **Done this pass** |
| A6 | `docs/releases/aqliya-v0.1-release-scope.md` | Sync LocalContentOS PDF/XLSX rows | Low | **Done this pass** (+ `aqliya-v0.1-known-limitations.md`, `aqliya-v0.1-release-notes.md`) |
| A7 | `docs/DOCUMENTATION_AUTHORITY.md` L124 | Fix `aqliya-master-reference.md` → `AQLIYA_MASTER_REFERENCE.md` casing | Low | **Done this pass** |

**Note:** Category A navigation (A1–A3) and stale-claim sync (A4–A7) applied in follow-up pass (2026-06-01). Evidence: `PRODUCT_STATUS_MATRIX.md`, `src/lib/local-content/export.ts`. No code changes.

---

## Category B — Needs Approval Before Move/Archive

| ID | Path(s) | Action | Why approval | Risk if wrong | Status |
|----|---------|--------|--------------|---------------|--------|
| B1 | `agent-reports/` (15 files) | Move → `docs/archive/agent-reports-2026-05/` | Untracked; may be in active use by parallel agents | Lost reference mid-sprint | **Done 2026-06-01** |
| B2 | `wave-5/` (2 files) | Same as B1 | Same | Same | **Done 2026-06-01** |
| B3 | `docs/product/sunbul/` (~20+ files) | Move → `docs/archive/sunbul-product-legacy/` | Large tree; may have inbound links | Broken links in pilot docs | **Done 2026-06-01** |
| B4 | `docs/execution/architecture-guards.md` | Archive → `docs/archive/execution-stale/` | Could be referenced by old prompts | Agent follows stale guards | **Done 2026-06-01** |
| B5 | `docs/notion/` (30 files) | Archive → `docs/archive/notion-export-2026/`; redirect stub | Strategic planning; not doctrine authority | Loss of Notion sync context | **Done 2026-06-01** — archived (not active authority; `docs/README.md` points to archive) |
| B6 | Root untracked MD (`AQLIYA_STRATEGIC_*`, `PROJECT_CLEANUP_*`, `opencode-last-instruction.md`) | Archive → `docs/archive/root-planning-scratch/` | May contain unique decisions | Data loss | **Done 2026-06-01** |
| B7 | `docs/reports/eid-continuous-build-wave-[1-9]-*.md` | Archive → `docs/archive/old-reports/`; index updated | Evidence redundancy | Audit trail gap | **Done 2026-06-01** — wave 10 + index remain active |
| B8 | `.gitignore` updates for `.understand-anything/`, `.data/`, `tmp-*` | Add patterns | User may want local tool state | None — standard hygiene | **Done 2026-06-01** |
| B9 | `docs/reports/aqliya-full-platform-build-program-plan.md` and similar v02 aspirational plans | Archive → `docs/archive/historical-strategy/` | Large files; still referenced? | Planning context loss | **Done 2026-06-01** — 5 files + README |
| B10 | Rename `docs/product/localcontentos-v0.1/pilot-onboarding-pack/limitsations-and-safe-claims.md` | → `limitations-and-safe-claims.md` | Typo in pilot pack | Broken links | **Done 2026-06-01** |

**Category B execution:** **Complete 2026-06-01** — all 10 Category B items executed. Content-drafts space typo rename also done in main cleanup pass (2026-06-01).

**Note:** B10 in original audit listed `content-drafts/website-content-rewrite-v1- chatGPT.md`; user-approved B10 scope was LocalContentOS `limitations-and-safe-claims.md` rename. Content-drafts rename completed separately in main cleanup pass.

---

## Category C — Doc-Only Items (Complete 2026-06-01)

| ID | Scope | Reason | Status |
|----|-------|--------|--------|
| C1 | Any `src/`, `prisma/`, `package.json`, tests | Hard rule — not doc governance | **Future** — out of scope |
| C2 | Sunbul → Workflow Prisma model rename | Code/schema change | **Future** — requires approval |
| C3 | Merge duplicate pilot pack trees | Large content merge | **Done (pointer-only)** — `docs/pilot/PILOT-PACK-INDEX.md` + README updates; no deletes |
| C4 | `npm run build/lint/test` validation | Low-load protocol | **Future** — release gate |
| C5 | Delete any file | Archive-only policy | **Policy preserved** — no deletes |
| C6 | Update official v1.1 doctrine content (except casing fix) | Requires documented decision per authority | **Future** — other agent |

---

## Recommended Execution Order (Post-Approval)

1. **B8** — `.gitignore` hygiene (lowest risk)
2. **A4–A7** — Stale claim sync (4 small doc patches)
3. **B1–B2** — Root agent reports to archive
4. **B4** — Stale architecture guards
5. **B3** — Sunbul product tree (after link audit)
6. **B5** — Notion pack decision (track vs archive)
7. **B7, B9** — Report consolidation

---

## Patch Summary This Pass

| Category | Planned | Executed |
|----------|---------|----------|
| A | 7 | 7 (all Category A items) |
| B | 10 | 10 (all Category B items) |
| C | 6 | 1 doc-only (C3 pointers); C1/C2/C4/C5/C6 remain future |
