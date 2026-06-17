# REPOSITORY CLEANUP EXECUTION PLAN — AQLIYA

**Date:** 2026-06-17  
**Principle:** Small batches · reversible · validate each step

---

## Pre-flight

- [ ] Git working tree committed or stashed  
- [ ] Baseline: note current `tsc` status (known: 9 errors per audit)  
- [ ] No parallel feature work during Batch 1–2  

---

## Step 1 — Batch 1: Duplicate file deletion (LOW RISK)

**Scope:** 19 `(1).ts` + 11 `.bak`  
**Reversible:** `git checkout -- path` or `git restore`

| Action | Files |
|--------|-------|
| DELETE | All paths in DUPLICATE_REMOVAL_PLAN Category A & B |
| UPDATE | `src/app/layout.tsx`, `src/app/manifest.ts` favicon paths |

**Validation:**
```bash
npx tsc --noEmit
npm test -- --passWithNoTests --testPathPattern="nonexistent"  # optional smoke
grep -r " (1)" src/ --include="*.ts"  # should be zero file refs except mock strings
```

**Success:** No new TS errors vs baseline; duplicate files gone.

---

## Step 2 — Batch 2: Documentation scaffolding (LOW RISK)

| Action | Target |
|--------|--------|
| CREATE | `docs/reports/README.md` |
| CREATE | `docs/refactoring/repository-cleanup-2026-06-17/BATCH_LOG.md` |
| UPDATE | `docs/README.md` link to reports/ (if file exists) |

**Validation:** Markdown only — no build impact.

---

## Step 3 — Batch 3: ESLint scope fix (LOW RISK)

| Action | File |
|--------|------|
| UPDATE | `eslint.config.mjs` — add `docs/**`, `knowledge-foundation/**`, `docs/archive/code/**` to globalIgnores |

**Validation:**
```bash
npm run lint -- --max-warnings 0 src/app/layout.tsx
```

**Success:** Lint no longer scans archive code.

---

## Step 4 — Batch 4: Empty directory cleanup (LOW RISK)

**Pre-check:** Confirm zero files in each dir.

| DELETE dir | Path |
|------------|------|
| Optional | `src/lib/contacts/` if empty |
| Optional | `src/lib/utils/` if empty |
| Optional | `src/lib/i18n/` if empty |

**Skip:** `src/lib/risk/` until populated or moved (routes exist).

**Validation:** `tsc --noEmit` unchanged.

---

## Step 5 — Batch 5: Archive duplicate doc (LOW RISK)

| Source | Target |
|--------|--------|
| `docs/audits/RELEASE_DECISION.md` | `docs/archive/2026-06/RELEASE_DECISION-audits-copy.md` |

**Validation:** Grep for links to old path; update if found.

---

## Step 6 — Batch 6: Runbooks merge prep (MEDIUM RISK)

**Pre-check:** Diff `runbooks/backup-restore.md` vs `docs/operations/backup-restore-procedure.md`

| Action | Only if content equivalent or merge written |
|--------|---------------------------------------------|
| MOVE | `runbooks/*.md` → `docs/operations/runbooks/` |
| UPDATE | Root `runbooks/README.md` → stub redirect |

**Validation:** Grep repo for `runbooks/` links.

**Defer if:** Content differs materially.

---

## Step 7 — Batch 7: Sales `_v02` → `v02` merge (HIGH RISK)

**Prerequisites:** CI green 14+ days; Sales feature freeze.

| Step | Action |
|------|--------|
| 7a | `grep -r "_v02" src/` — full import list |
| 7b | Update imports to `v02` paths |
| 7c | Delete `src/lib/sales/_v02/` |
| 7d | `npm test` full suite |

**Reversible:** Git revert single PR.

**Defer:** Until build green per CEO strategy.

---

## Step 8 — Batch 8: Decision route redirects (MEDIUM RISK)

| Step | Action |
|------|--------|
| 8a | Add redirects in `next.config.mjs` |
| 8b | Deprecation notice in `src/app/decision/` |
| 8c | Delete `decision/` pages after 1 release |

---

## Step 9 — Batch 9: docs/product → docs/products merge (MEDIUM RISK)

| Step | Action |
|------|--------|
| 9a | Inventory both folders |
| 9b | Move unique files only |
| 9c | Update `docs/README.md` index |

**No link checker in CI — manual grep required.**

---

## Step 10 — Batch 10: scripts/ grouping (LOW-MEDIUM RISK)

| Step | Action |
|------|--------|
| 10a | Document script map in `scripts/README.md` |
| 10b | Move scripts in groups; update `package.json` paths |

**Defer:** Large surface — documentation first.

---

## Execution status

| Batch | Status | Date |
|-------|--------|------|
| 1 | **EXECUTE NOW** | 2026-06-17 ✓ |
| 2 | **EXECUTE NOW** | 2026-06-17 ✓ |
| 3 | PROPOSED | 2026-06-17 ✓ |
| 4 | Empty dirs | 2026-06-17 ✓ |
| 5 | Archive duplicate doc | 2026-06-17 ✓ |
| 6 | Runbooks cross-link | 2026-06-17 ✓ (partial) |
| 7–10 | PROPOSED | After build green 14+ days |

---

## Rollback procedure

```bash
git restore <paths>
# or
git revert <commit-sha>
```

Every batch = **one commit** for clean revert.
