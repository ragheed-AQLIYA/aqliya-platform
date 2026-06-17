# AuditOS Recovery Inventory

**Branch:** `auditos/factory-memory-2026-06`  
**Base:** `18366fc` (main)  
**Generated:** 2026-06-15  
**Method:** `git status`, `git diff --name-only`, `git ls-files --others --exclude-standard`

---

## Summary Counts

| Category | Count | Notes |
|----------|------:|-------|
| **Modified (tracked)** | 94 | Unstaged vs HEAD |
| **Untracked** | 892 | Not in any commit |
| **New migrations (untracked dirs)** | 7 folders / 10 files | After `20260608120000` in HEAD |
| **Scripts (untracked under `scripts/`)** | 48 | phase-*, shalfa-*, tb-*, factory-* |
| **Docs (untracked under `docs/`)** | 151 | audits, architecture, systems/auditos, recovery |
| **Tests (untracked, pattern match)** | 71 | `__tests__`, `*.test.*` |
| **Audit UI (untracked under `src/components/audit/`)** | 20 | factory-map, lead-schedules, mapping badges, etc. |
| **TB Intelligence (untracked paths)** | 31 | `src/lib/tb-intelligence/**` |

---

## Modified Files (94) — By Area

| Top-level | Count |
|-----------|------:|
| `src/` | 57 |
| `docs/` | 23 |
| `prisma/` | 4 |
| `messages/` | 3 |
| `package.json` / `package-lock.json` | 2 |
| `.github/workflows/ci.yml` | 1 |
| `.env.example` | 1 |
| `cypress/` | 1 |
| `next.config.mjs` | 1 |
| `CLAUDE.md` | 1 |

**AuditOS-critical modified paths:**

- `prisma/schema.prisma`, `prisma/seed-audit.ts`, `prisma/seed.ts`
- `src/actions/audit-actions.ts`, `src/lib/audit/db/index.ts`, `src/lib/audit/services.ts`
- `src/components/audit/mapping/mapping-page.tsx`, trial-balance, statements, notes
- `messages/en.json`, `messages/ar.json` (Trust + Evidence i18n)
- `package.json` (phase-3c/3d/tb scripts)

---

## Untracked — AuditOS Program (high value)

| Path | Purpose |
|------|---------|
| `src/lib/tb-intelligence/` | TB classification, ERP mining, firm memory, governance |
| `src/lib/audit/fs-engine/` | FS rebuild v2 |
| `src/lib/audit/presentation/` | Phase 13.x presentation profile + policy |
| `src/lib/audit/rules/` | IFRS + SOCPA engines |
| `src/lib/audit/reconciliation/` | Reconciliation engine |
| `src/lib/audit/reporting-graph/` | Reporting graph |
| `src/lib/audit/lead-schedule/` | Lead schedules |
| `src/lib/audit-intelligence/` | Audit intelligence panel |
| `src/lib/audit/coa/` | Canonical COA (Phase 8.1) |
| `knowledge/tb-intelligence/` | ERP dictionary, prefix rules, failure mining |
| `prisma/migrations/20260609100000_*` through `20260615100000_*` | Factory + memory migrations |
| `scripts/phase-*`, `scripts/shalfa-*`, `scripts/tb-*`, `scripts/factory-*` | Validation + pilot tooling |
| `docs/audits/PHASE_*`, `docs/architecture/PHASE_3*`, `docs/systems/auditos/` | Program evidence |

---

## New Migrations (local, untracked)

```
20260609100000_tb_intelligence_firm_memory
20260613100000_reporting_graph_foundation
20260614120000_engagement_presentation_profile
20260614130000_presentation_policy_engine
20260614140000_firm_memory_erp_context
20260614150000_firm_memory_governance
20260615100000_tb_classification_detail
```

**Prisma migrate status (local DB @ 2026-06-15):** 37 migrations recorded; **3 pending apply** per CLI:
`20260614140000`, `20260614150000`, `20260615100000` (may have been applied via `db execute` — verify `_prisma_migrations` table on staging).

---

## Recommended Exclusions (do NOT commit)

### Binaries / office / customer data

| File | Reason |
|------|--------|
| `AQLIYA_Enterprise_Deck_v3.pptx` | Binary marketing |
| `AQLIYA_*.docx` | Binary |
| `Audited FSs 31-12-2025.pdf` | Customer PDF |
| `TB.xlsx` | Customer TB data |
| `Local_Content_Verification_Audit_Matrix_v1.xlsx` | LC matrix (not AuditOS core) |
| `docs/audits/evidence/audited-fs-pages/*.png` | Rendered PDF pages |

### Temp / cache / local-only

| Pattern | Reason |
|---------|--------|
| `temp_*.sql`, `temp_*.mjs`, `temp_*.js` | Scratch |
| `.data/` | Local runtime store |
| `docs/audits/evidence/*.log` (optional) | Regenerable run logs — prefer JSON evidence |

### Out of scope (separate program)

| Path | Reason |
|------|--------|
| `knowledge-foundation/` | Knowledge Foundation program — not AuditOS Factory slice |
| `SOCPA_COMPLETE_ANALYSIS.md` (root) | Move to `docs/` or commit separately |

### Generated (regenerate in CI)

| Path | Reason |
|------|--------|
| `docs/audits/evidence/build-output.txt`, `tsc-output.txt` | Snapshot logs |

---

## Stashes (17)

Existing stashes from 2026-06-05 may overlap with current work. **Do not `stash pop` blindly** before recovery commits complete.

---

## Recovery Status

| Item | Status |
|------|--------|
| Recovery branch created | ✅ `auditos/factory-memory-2026-06` |
| Commit slices | ✅ **10 commits** (`3e80fab` → `HEAD`) |
| Binaries excluded | ✅ `.pptx`, `.docx`, `.pdf`, `.xlsx`, `temp_*` not committed |
| Remote push | ❌ **Not yet** — run `git push -u origin auditos/factory-memory-2026-06` |

**Note:** Commit `6a2f026` message says "memory" but contains TB intelligence code (`src/lib/tb-intelligence/`). Cosmetic only; no content loss.
