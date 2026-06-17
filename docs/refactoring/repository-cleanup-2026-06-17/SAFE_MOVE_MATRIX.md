# SAFE MOVE MATRIX — AQLIYA Repository Cleanup

**Date:** 2026-06-17  
**Legend:** ✅ Safe now · ⚠️ Verify first · 🛑 Do not touch

---

## ✅ Safe to delete now

| Path | Reason | Risk | Confidence | Reversible |
|------|--------|------|------------|------------|
| `src/actions/sales-icp-actions (1).ts` | No imports | Low | 98% | git restore |
| `src/actions/sales-review-list-actions (1).ts` | No imports | Low | 98% | git restore |
| All 17 other `src/**/* (1).ts` | No imports | Low | 98% | git restore |
| All 11 `src/app/(marketing)/**/*.bak` | Not routed | Low | 95% | git restore |

---

## ✅ Safe to update now

| Path | Change | Reason |
|------|--------|--------|
| `src/app/layout.tsx` | Favicon → `/favicon.svg` | `(1).svg` bad path; `public/favicon.svg` exists |
| `src/app/manifest.ts` | Same favicon fix | Same |
| `eslint.config.mjs` | Ignore docs/archive/code | Lint noise only |

---

## ✅ Safe to create now

| Path | Purpose |
|------|---------|
| `docs/reports/README.md` | Evidence index |
| `docs/refactoring/repository-cleanup-2026-06-17/BATCH_LOG.md` | Execution log |
| `docs/refactoring/repository-cleanup-2026-06-17/INDEX.md` | Plan index |

---

## ⚠️ Requires verification before action

| Path | Verification needed | Proposed action |
|------|---------------------|-----------------|
| `src/lib/sales/_v02/` | Full `grep _v02` import graph | Merge to v02 |
| `src/app/decision/` | Traffic/bookmarks unknown | Redirect first |
| `runbooks/*.md` | Diff vs docs/operations | Merge |
| `docs/product/` vs `docs/products/` | Link inventory | Merge |
| `public/brand/Favicons/symbol (1).svg` | File on disk check | Delete after ref fix |
| `src/lib/contacts/`, `utils/`, `i18n/` | Confirm empty | Delete dirs |
| `docs/audits/RELEASE_DECISION.md` | Link grep | Archive |
| `knowledge-foundation/` | Any runtime imports? | Document only — no move |
| `(1).test.ts` files | Glob | None found — N/A |

---

## 🛑 Must not touch (cleanup program)

| Path | Reason |
|------|--------|
| `prisma/schema.prisma` | No cleanup-driven schema changes |
| `src/lib/audit/` core flows | L5 pilot — CEO freeze |
| `src/lib/local-content/workbook/` | Revenue product |
| `src/app/auditos/` | Demo safety rules |
| `docs/DOCUMENTATION_AUTHORITY.md` | Tier 0 path |
| `docs/official/*` | Doctrine — content sync only, no move |
| `infra/terraform/` | Production IaC |
| `.github/workflows/deploy.yml` | CI — separate task |
| `src/lib/sales/vnext/` | Freeze — no delete |
| `docs/theoretical-reference/` (bulk) | No mass move |
| `docs/archive/` (bulk) | Historical integrity |
| `node_modules/`, `.next/` | Generated |

---

## ⚠️ Security items — OUT OF SCOPE for org cleanup

| Path | Note |
|------|------|
| `src/app/api/test-token/route.ts` | Security fix, not reorganization — separate P0 |

---

## Move vs delete decision tree

```
Is file routed or imported?
├── NO → candidate DELETE (if duplicate/backup)
├── YES → DO NOT DELETE
└── UNSURE → grep first → if zero hits → DELETE in Batch 1

Is folder mirror of another?
├── YES → MERGE in Phase 5+ with import updates
└── NO → classify in FOLDER_CLASSIFICATION.md

Is doc authoritative?
├── Tier 0–2 → UPDATE content only, never delete
├── Evidence/audit → keep dated folders
└── Duplicate → archive one copy
```

---

## Batch 1 execution set (approved safe list)

**Delete:** 19 `(1).ts` + 11 `.bak`  
**Update:** layout.tsx, manifest.ts favicon  
**Create:** docs/reports/README.md, BATCH_LOG.md  

**Total file operations:** ~32
