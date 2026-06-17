# DOCUMENT REORGANIZATION PLAN — AQLIYA

**Date:** 2026-06-17  
**Rule:** No mass moves in one step. Phased with redirects/index updates.

---

## Target Hierarchy (aligned with DOCUMENTATION_GOVERNANCE_V2)

```
docs/
├── official/              ✓ exists — keep
├── source-of-truth/       ✓ exists — keep
├── architecture/          ✓ exists — keep
├── operations/            ✓ exists — canonical runbooks
├── systems/               ✓ exists — keep
├── audits/                ✓ exists — dated audit folders
├── reports/               ⚠ CREATE/populate — validation evidence
├── strategy/              ✓ exists — CEO/recovery
├── refactoring/           ✓ exists — this program
├── review/                ✓ exists — pilot evidence
├── pilot/                 ✓ exists
├── releases/              ✓ exists
├── research/              ⚠ optional rename target for theoretical-reference
└── archive/               ✓ exists — historical only
```

---

## Misplaced Docs

| Current path | Issue | Target | Phase |
|--------------|-------|--------|-------|
| `runbooks/*.md` (root) | Outside docs/ authority tree | `docs/operations/runbooks/` | 4 |
| `docs/product/` + `docs/products/` | Duplicate naming | Merge → `docs/products/{name}/` | 5 |
| `docs/recovery/` | Overlaps strategy/ | Merge → `docs/strategy/recovery/` | 5 |
| `docs/reality/` | Overlaps audits/ | Merge → `docs/audits/` or archive | 5 |
| `docs/demo/` | Marketing | `docs/marketing/demo/` or archive | 6 |
| `docs/commercial-pack/` (empty) | Empty | Delete or populate | 6 |
| `docs/brand/` | Should be with marketing | `docs/marketing/brand/` | 6 |
| `CLAUDE.md` references only | Root ok | Keep at root | — |
| Validation outputs scattered | No single evidence dir | `docs/reports/` | **1** |

---

## Duplicated Docs

| Doc A | Doc B | Action | Confidence |
|-------|-------|--------|------------|
| `docs/audits/RELEASE_DECISION.md` | `docs/review/RELEASE_DECISION.md` | Keep review/; archive audits copy | 85% |
| `docs/operations/backup-restore-procedure.md` | `runbooks/backup-restore.md` | Merge; one canonical in operations/ | 80% — verify diff first |
| Forensic + reality audit overlap | Multiple FINAL summaries | Keep both dated folders; add index | 100% |
| Master ref vs PRODUCT_STATUS_MATRIX | Status conflicts | Sync content, don't merge files | 100% |

---

## Obsolete Docs (do not delete — archive)

| Path | Reason | Action |
|------|--------|--------|
| Master ref §16 (27 tests) | Superseded by 2026-06-17 validation | Annotate + link reports/ |
| Phase 7 "build green" row | False vs June build | Update matrix, not delete |
| `docs/archive/*` | Already archived | Add banner if missing |
| Pre-2026 audit claims in README | Stale SalesOS label | Update README |

---

## Archive Candidates

| Path | Trigger |
|------|---------|
| `docs/recovery/` | After merge to strategy/ |
| `docs/reality/` | After merge to audits/ |
| Duplicate RELEASE_DECISION | After merge |
| `docs/archive/code/` | Keep archived; **exclude from ESLint** (not move) |
| Old agent reports in `docs/archive/agent-reports-*` | Already archive — no action |

---

## Phase 1 Actions (immediate, low risk)

1. **Create `docs/reports/README.md`** — index + regeneration instructions  
2. **Create `docs/refactoring/repository-cleanup-2026-06-17/INDEX.md`** — link all cleanup plans  
3. **Add banner to `docs/theoretical-reference/00-governance-rules.md`** or README if exists — "Background only"  
4. **Do NOT move 352 theoretical files** in Phase 1  

---

## Phase 4–6 Actions (deferred)

| Phase | Work |
|-------|------|
| 4 | Move `runbooks/` → `docs/operations/runbooks/` + root README redirect |
| 5 | Merge `docs/product/` into `docs/products/` with redirect table in docs/README |
| 6 | Consolidate recovery/reality/demo folders |

---

## Files that must NOT move

| Path | Reason |
|------|--------|
| `docs/DOCUMENTATION_AUTHORITY.md` | Tier 0 — path is authority |
| `docs/official/*` | Doctrine links across repo |
| `AGENTS.md`, `README.md` | Root entry points |
| All `docs/audits/*/verification-*.txt` | Evidence integrity |
| `prisma/` | Runtime dependency |

---

## Success metric

- New engineer finds **status** in `source-of-truth/`, **evidence** in `reports/`, **history** in `archive/`  
- Zero doc moves without `docs/README.md` link update in same PR
