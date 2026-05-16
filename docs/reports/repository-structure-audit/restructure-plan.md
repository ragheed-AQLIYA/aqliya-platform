# Restructure Plan — Safe Phased Approach

## Phase 0 — No-Change Baseline

### Git Status
- Modified files: ~50 (mostly docs with modified content; some source files)
- Untracked files: ~120+ (new docs, cypress config, Docker files, new scripts, new tests, service worker, sentry config)
- No staged changes

### Current Risk Map
| Risk Area | Level | Description |
|-----------|-------|-------------|
| Documentation overgrowth | MEDIUM | ~500+ doc files, some duplicate, some conflicting with v1.1 |
| Legacy numbered docs | LOW | Pre-v1.1 docs may conflict with official positioning |
| Commercial doc duplication | LOW | `commercial/` and `commercial-pack/` overlap |
| Source code | LOW | Well-organized modular monolith; no immediate risk |
| Schema | LOW | Stable with 7 migrations |
| Untracked files | LOW | Mostly new configs/scripts/docs — need review for commit |

### Baseline Commands
```bash
git status --short
npx tsc --noEmit    # Run to establish baseline
npm run lint         # Run to check current ESLint state
npm run build        # Run to check current build state
```

## Phase 1 — Documentation Organization Only

**Goal:** Organize documentation without touching any source code.

**Status:** ✅ **Completed** on 2026-05-16

**Actions executed:**
- ✅ Archived 4 legacy numbered folders → `docs/archive/legacy-numbered/`
- ✅ Archived old website content drafts → `docs/archive/content-drafts/`
- ✅ Fixed typo: `aqlia-auditos-boundaries.md` → `aqliya-auditos-boundaries.md`
- ✅ Created commercial duplication review → `docs/archive/commercial-legacy/COMMERCIAL_DUPLICATION_REVIEW.md`
- ✅ Archived historical pilot sessions and runs → `docs/archive/pilot-history/`
- ✅ Updated `docs/README.md` with archive section
- ✅ Updated `docs/DOCUMENTATION_INVENTORY.md` with new archive paths
- ✅ Updated audit report files to reflect Phase 1 completion

**Not executed (deferred):**
- `docs/auditos/` → `docs/systems/auditos/operations/` — not in Phase 1 scope; requires more careful path update
- `docs/commercial/pilot-pack/` archival — requires owner decision per COMMERCIAL_DUPLICATION_REVIEW.md

**Validation:**
```bash
git status --short    # Confirm no source files changed
```

**Rollback plan:**
```bash
git checkout -- docs/    # Revert all doc changes
```

## Phase 2 — Naming and Duplicate Cleanup

**Goal:** Fix naming inconsistencies, merge duplicates, update indexes.

**Allowed actions:**
- Fix typos in filenames (e.g., `aqlia-auditos-boundaries.md` → `aqliya-auditos-boundaries.md`)
- Merge duplicate doc files
- Update `docs/README.md` and `docs/source-of-truth/README.md`
- Mark old docs as `[ARCHIVED]` in index files

**Forbidden actions:**
- Any source code change
- Any schema change
- Any route change

**Affected paths:**
- `docs/source-of-truth/aqlia-auditos-boundaries.md` → rename to `aqliya-auditos-boundaries.md`
- `docs/product/` files vs `docs/official/aqliya-product-taxonomy-v1.1.md` → align
- `docs/source-of-truth/AI_CONTEXT.md` vs `AGENTS.md` → review/merge

**Validation commands:**
```bash
git status --short
```

**Rollback plan:**
```bash
git checkout -- docs/
```

## Phase 3 — Source Folder Review (Structure Only)

**Goal:** Review source folder structure without moving any active code.

**Allowed actions:**
- Audit folder structure
- Map import relationships
- Identify files that could be moved
- Create recommended structure document

**Forbidden actions:**
- Move any file
- Rename any file
- Change any import
- Refactor any code

**Affected paths:**
- `src/components/visuals/` — mostly marketing; could move to `src/components/marketing/`
- `src/actions/tender.ts` — may belong to LocalContentOS; needs decision
- `src/lib/audit/pagination.ts`, `rate-limit.ts` — shared utilities in AuditOS folder; could be shared

**Validation commands:**
```bash
npx tsc --noEmit
npm run build
```

**Rollback plan:**
No code changes — no rollback needed.

## Phase 4 — Safe Source Reorganization (If Needed)

**Goal:** Move files within `src/` with full import mapping.

**Allowed actions:**
- Move files to better domain folders
- Update all import paths
- Update barrel exports

**Forbidden actions:**
- Change business logic
- Change function signatures
- Change component APIs
- Add/remove features

**Potential moves:**
- `src/components/visuals/` → `src/components/marketing/visuals/`
- `src/actions/tender.ts` → `src/actions/local-content/` (if LocalContentOS confirmed)
- `src/lib/audit/pagination.ts` → `src/lib/shared/`
- `src/lib/audit/rate-limit.ts` → `src/lib/shared/`

**Validation commands:**
```bash
npx tsc --noEmit        # Must pass
npm run lint            # Must pass
npm run build           # Must pass
npm test                # Run Jest suite
```

**Rollback plan:**
```bash
git revert HEAD         # Atomic revert
```

## Phase 5 — Validation and Lock

**Goal:** Ensure repository integrity after all changes.

**Validation suite:**
```bash
npx tsc --noEmit        # Zero errors
npm run lint            # No new errors
npm run build           # Successful
npm test                # All passing
git status --short      # Clean state
```

**Doc link check:**
- Verify all README.md files have correct relative links
- Verify docs index covers all doc folders
- Verify no broken cross-references

**Lock actions:**
- Update `AGENTS.md` if structure changed
- Update `docs/README.md` with final structure
- Commit all changes with descriptive message

**Rollback plan:**
```bash
git reset --hard HEAD~1    # Undo the restructure commit
```
