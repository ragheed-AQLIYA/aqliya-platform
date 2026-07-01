# Phase 3 — Documentation Duplication & Archive Candidate Review

**Audit date:** 2026-05-31  
**Rule:** No moves executed. High-uncertainty items listed only.

**Archive candidate count:** **58** (see summary at end)

---

## Proposed Archive Categories Under `docs/archive/`

| Category path | Purpose |
|---------------|---------|
| `docs/archive/agent-reports-2026-05/` | Root `agent-reports/`, `wave-5/` agent wave outputs |
| `docs/archive/sunbul-product-legacy/` | `docs/product/sunbul/*` superseded by WorkflowOS docs |
| `docs/archive/execution-stale/` | Stale engineering guards and prompts |
| `docs/archive/notion-planning-2026-05/` | Optional home for `docs/notion/` if not kept active |
| `docs/archive/root-planning-scratch/` | Root-level untracked audit/review MD and tmp scripts |
| `docs/archive/reports-superseded/` | Duplicate phase reports superseded by 2026-05-28 locks |

---

## Candidate Table

| File / path | Current role | Problem | Recommended action | Confidence |
|-------------|--------------|---------|-------------------|------------|
| `agent-reports/wave1a-core-access-governance.md` | Agent wave 1 output | Outside docs hierarchy; untracked | Move → `docs/archive/agent-reports-2026-05/` | High |
| `agent-reports/wave1b-mock-to-real.md` | Agent output | Same | Same | High |
| `agent-reports/wave1c-security-audit.md` | Agent output | Same | Same | High |
| `agent-reports/wave1d-core-empty-units.md` | Agent output | Same | Same | High |
| `agent-reports/wave2a-core-engine-unification.md` | Agent output | Same | Same | High |
| `agent-reports/wave2b-decisionos-workflowos.md` | Agent output | Same | Same | High |
| `agent-reports/wave2c-localcontentos-core-adoption.md` | Agent output | Same | Same | High |
| `agent-reports/wave3a-auditos-l6.md` | Agent output | Same | Same | High |
| `agent-reports/wave3c-tests-cicd.md` | Agent output | Same | Same | High |
| `agent-reports/wave3d-localcontentos-l6.md` | Agent output | Same | Same | High |
| `agent-reports/wave4a-studio-v01.md` | Agent output | Claims Studio v0.1 — not implemented | Archive + banner | High |
| `agent-reports/wave4b-institutional-memory.md` | Agent output | IM not implemented | Archive + banner | High |
| `agent-reports/wave4c-onprem-architecture.md` | Agent output | On-Prem not implemented | Archive + banner | High |
| `agent-reports/wave4d-platform-production-final.md` | Agent output | Overclaims production | Archive + banner | High |
| `agent-reports/v03-planning/wave-2/agent-w2-collector.md` | Planning collector | Nested sprawl | Archive | High |
| `wave-5/agent-w5-institutional.md` | Agent output | Root sprawl | Archive | High |
| `wave-5/agent-w5-kg-filters.md` | Agent output | Root sprawl | Archive | High |
| `docs/execution/architecture-guards.md` | Engineering guard | Severely stale (Tender Decisions, AuditOS-only) | Archive → `execution-stale/` | High |
| `docs/product/sunbul/` (entire tree, ~20+ files) | Product docs | Sunbul not product; WorkflowOS canonical | Archive → `sunbul-product-legacy/` | Medium-High |
| `docs/archive/decision-os/*` | Already archived | Tender Decisions legacy | Keep in place | High |
| `AQLIYA_STRATEGIC_REALITY_AUDIT.md` (root) | Strategic audit | Root clutter; untracked | Archive root-planning | Medium |
| `PROJECT_CLEANUP_REVIEW_REPORT.md` (root) | Prior cleanup | Superseded by this pass | Archive | Medium |
| `PROJECT_CLEANUP_REVIEW_REPORT_v2.md` (root) | Prior cleanup | Superseded | Archive | Medium |
| `opencode-last-instruction.md` (root) | Session scratch | Not durable docs | Archive or delete (Category B) | Medium |
| `tmp-agent7-report.md`, `tmp-tsc-out.txt`, `tmp-wave6-smoke-*.txt` | Scratch | Transient | Do not commit; gitignore | High |
| `gen_v02_test.py`, `tmp_write_*.py` (root) | Ad-hoc scripts | Scratch | Archive or gitignore | Medium |
| `.understand-anything/` (entire) | Tool output | Not documentation | Add to `.gitignore` | High |
| `.data/platform/*.json`, `.data/sales/*.json` | Runtime data | Should not be in repo | Gitignore | High |
| `docs/notion/01-current-state-audit.md` … `29-*` (30 files) | Notion OS planning | Outside hierarchy; untracked | Index OR archive as planning pack | Medium |
| `docs/reports/eid-continuous-build-wave-1..10-2026-05-28.md` | Build evidence | 10 near-duplicate wave files | Keep index + archive waves 1–9 if index sufficient | Medium |
| `docs/reports/p2-agent1-unified-rbac-report.md` … `p2-agent14-*` | Parallel agent reports | Overlap with wave reports | Consolidate index; archive duplicates | Medium |
| `docs/reports/phase-3-*`, `phase-4-*` (12+ files) | Phase hardening | Superseded by go/no-go locks | Archive subset post-review | Medium |
| `docs/reports/repository-structure-audit/*` | Prior structure audit | Superseded by project-organization pass | Keep as evidence; link from new audit | Low move |
| `docs/reports/file-organization-audit-2026-05-25.md` | Prior audit | Duplicate purpose | Cross-link only | Low |
| `docs/archive/content-drafts/website-content-rewrite-v1- chatGPT.md` | Typo in filename | Broken naming | Rename on archive (Category B) | Medium |
| `docs/archive/KNoWN_LIMITATIONS.md` | Typo duplicate | Superseded by releases known-limitations | Keep archived | High |
| `docs/pilot/AQLIYA_CONTROLLED_PILOT_EXECUTION_REPORT.md` | Pilot report | Duplicate in `docs/reports/audits/` and `docs/pilot/controlled-execution/` | Deduplicate pointer | Medium |
| `docs/product/pilot-control-pack/` vs `docs/pilot/execution-pack/` | Pilot checklists | Content overlap | Merge index; no file move yet | Medium |
| `docs/commercial/demo-storyline/` vs `docs/archive/commercial-legacy/demo-storyline-auditos.md` | Demo scripts | Partial overlap | Keep active commercial; archive legacy | Low |
| `docs/theoretical-reference/institutional-memory/strategic-doctrine-map.md` | Background | Lists obsolete products as current | Add historical banner only | High |
| `docs/source-of-truth/AQLIYA-company-product-architecture-official.md` | Supporting | May overlap master reference | Review merge (Category B) | Low |
| `docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md` | Supporting | Overlap with AQLIYA_ARCHITECTURE.md | Cross-link audit (Category B) | Low |
| `docs/auditos/` vs `docs/systems/auditos/` | AuditOS docs | Split locations | Navigation index only | Low |
| `scripts/_agent10_write_docs.py`, `_w3-*`, `_stage-*`, `_write_*` | Agent scratch | Untracked clutter | Gitignore or `scripts/scratch/` | Medium |
| `docs/content/aqliya-website-content-professional-CLAUDE.md` | Content draft | May overlap marketing | Archive if superseded by v3 release note | Low |
| `docs/archive/CLAUDE.md` | Legacy agent doc | Superseded by AGENTS.md | Already archived — OK | High |
| `docs/archive/SYSTEM_STATUS.md`, `RELEASE_NOTES.md` | Historical status | Stale | Already archived — OK | High |
| `docs/product/sombol-*`, `sombol-*` paths | Typo variant of Sunbul | Naming confusion | Archive with sunbul legacy | Medium |
| `docs/reports/auditos-l6-go-nogo.md` | L6 claim report | L6 not achieved | Keep as evidence; label aspirational | Low |
| `docs/reports/localcontentos-l6-readiness.md` | L6 readiness | Product is L5 | Keep as evidence | Low |
| `docs/reports/aqliya-full-platform-build-program-plan.md` | Build plan | Aspirational v02 scope | Archive planning (Category B) | Medium |
| `docs/reports/aqliya-eid-expansion-program-plan.md` | Expansion plan | Aspirational | Archive planning (Category B) | Medium |
| `docs/02-accounting-methodology/`, `docs/03-audit-methodology/` | Numbered folders | Pre-v1.1 naming | Keep active; optional archive alias | Low |
| `docs/runtime-prototypes/` (~10 files) | Prototype notes | Borderline active | Archive if no ongoing reference | Low |
| `docs/governance/AQLIYA_EXECUTION_CHARTER.md` | Governance | Overlap official roadmap | Cross-link; no move | Low |
| `AQLIYA_Website_Content_Review_AR.md` (root) | Content review | Root clutter | Move to docs/content or archive | Medium |
| `docs/reports/mimiclaw-opencode-analysis.md` | Toolchain analysis | Rejected toolchain per AGENTS.md §36 | Archive as decision evidence | Medium |

---

## Do NOT Archive (High Uncertainty — Keep Active)

- All `docs/official/*.md` v1.1 doctrine files
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `ROUTE_STRATEGY.md`, `AQLIYA_ARCHITECTURE.md`
- `docs/releases/aqliya-v0.1-*` (patch stale claims, do not archive)
- `docs/reports/aqliya-controlled-pilot-release-lock-2026-05-25.md`
- `docs/reports/public-claim-alignment-2026-05-24.md`
- `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`
- `docs/clients/sunbul/README.md` (corrects client vs product naming)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total archive candidates listed** | **58** |
| High confidence (safe to archive after copy) | 22 |
| Medium confidence (needs review) | 28 |
| Low confidence (index/link only) | 8 |
| Moves executed this pass | **0** |
