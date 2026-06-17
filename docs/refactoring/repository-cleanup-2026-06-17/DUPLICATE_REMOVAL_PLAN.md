# DUPLICATE REMOVAL PLAN — AQLIYA

**Date:** 2026-06-17  
**Status:** PROPOSAL ONLY — execute per SAFE_MOVE_MATRIX and EXECUTION_PLAN  
**Rule:** No deletion without import verification

---

## Category A — Windows copy artifacts `(1).ts` (19 files)

**Evidence:** Glob 2026-06-17; grep shows **zero imports** of `(1).ts` paths in `src/`.

| # | Source path | Canonical sibling | Reason | Risk | Confidence |
|---|-------------|-------------------|--------|------|------------|
| 1 | `src/actions/sales-icp-actions (1).ts` | `sales-icp-actions.ts` | OS duplicate | Low | **98%** |
| 2 | `src/actions/sales-review-list-actions (1).ts` | `sales-review-list-actions.ts` | OS duplicate | Low | **98%** |
| 3 | `src/lib/ai/governed-ai-metadata (1).ts` | `governed-ai-metadata.ts` | OS duplicate | Low | **98%** |
| 4 | `src/lib/ai/intelligence-runtime (1).ts` | `intelligence-runtime.ts` | OS duplicate | Low | **98%** |
| 5 | `src/lib/sales/agents/deal-risk (1).ts` | `deal-risk.ts` | OS duplicate | Low | **98%** |
| 6 | `src/lib/sales/agents/deal-risk-shared (1).ts` | `deal-risk-shared.ts` | OS duplicate | Low | **98%** |
| 7 | `src/lib/sales/agents/follow-up (1).ts` | `follow-up.ts` | OS duplicate | Low | **98%** |
| 8 | `src/lib/sales/commercial-claims (1).ts` | `commercial-claims.ts` | OS duplicate | Low | **98%** |
| 9 | `src/lib/sales/core-adoption (1).ts` | `core-adoption.ts` | OS duplicate | Low | **98%** |
| 10 | `src/lib/sales/deal-risk-types (1).ts` | `deal-risk-types.ts` | OS duplicate | Low | **98%** |
| 11 | `src/lib/sales/nba-suppression-store (1).ts` | `nba-suppression-store.ts` | OS duplicate | Low | **98%** |
| 12 | `src/lib/sales/next-action-engine (1).ts` | `next-action-engine.ts` | OS duplicate | Low | **98%** |
| 13 | `src/lib/sales/outreach (1).ts` | `outreach.ts` | OS duplicate | Low | **98%** |
| 14 | `src/lib/sales/pilot-handoff-pack (1).ts` | `pilot-handoff-pack.ts` | OS duplicate | Low | **98%** |
| 15 | `src/lib/sales/prisma-repository (1).ts` | `prisma-repository.ts` | OS duplicate | Low | **98%** |
| 16 | `src/lib/sales/service (1).ts` | `service.ts` | OS duplicate | Low | **98%** |
| 17 | `src/lib/sales/tier-a-persistence (1).ts` | `tier-a-persistence.ts` | OS duplicate | Low | **98%** |
| 18 | `src/lib/sales/vnext/commercial-review-runtime (1).ts` | `commercial-review-runtime.ts` | OS duplicate | Low | **98%** |
| 19 | `src/lib/sales/vnext/meeting-intelligence (1).ts` | `meeting-intelligence.ts` | OS duplicate | Low | **98%** |

**Proposal:** DELETE all 19 in Batch 1.

---

## Category B — Marketing backup pages `.bak` (11 files)

**Evidence:** Glob; Next.js does not route `.bak` files.

| # | Source path | Target | Reason | Risk | Confidence |
|---|-------------|--------|--------|------|------------|
| 1–11 | `src/app/(marketing)/**/page.tsx.bak` | DELETE | Inactive backup | Low | **95%** |

**Optional archive target:** `docs/archive/marketing-pages/` if history needed — prefer DELETE.

**Proposal:** DELETE all 11 in Batch 1.

---

## Category C — Favicon path with `(1)` in name

| Source | References | Proposal |
|--------|------------|----------|
| `layout.tsx`, `manifest.ts` reference `/brand/Favicons/symbol (1).svg` | Active metadata | **UPDATE** refs to `/favicon.svg` or `/brand/aqliya-mark.svg` (files exist in public/) |
| `public/brand/Favicons/symbol (1).svg` | Tree listed; glob may be missing | Verify on disk before delete |

**Proposal:** Fix references in Batch 1; delete orphan `(1).svg` if duplicate of `favicon.svg`.

---

## Category D — Mirror directory structures (PROPOSE ONLY)

| Mirror A | Mirror B | Proposal | Phase | Confidence |
|----------|----------|----------|-------|------------|
| `src/lib/sales/v02/` | `src/lib/sales/_v02/` | Merge _v02 → v02; delete _v02 | 5 | 70% — needs import graph |
| `src/app/decision/` | `src/app/(dashboard)/decisions/` | Redirect + deprecate decision/ | 6 | 75% |
| `docs/product/` | `docs/products/` | Merge docs | 4 | 80% |
| `runbooks/` | `docs/operations/` | Merge runbooks | 4 | 80% |

**Do NOT delete either mirror until imports updated.**

---

## Category E — Obsolete version trees (PROPOSE ONLY)

| Path | Proposal | Reason |
|------|----------|--------|
| `docs/archive/code/sales-v02/` | KEEP in archive | Historical reference |
| `src/lib/sales/vnext/` | **FREEZE**, do not delete | Active experiments |
| `(1).test.ts` files | None found 2026-06-17 | Already absent |

---

## Category F — Duplicate documentation

| File A | File B | Proposal |
|--------|--------|----------|
| `docs/audits/RELEASE_DECISION.md` | `docs/review/RELEASE_DECISION.md` | Archive A |

---

## Removal summary

| Category | Count | Batch | Action |
|----------|------:|-------|--------|
| A `(1).ts` | 19 | 1 | DELETE |
| B `.bak` | 11 | 1 | DELETE |
| C favicon refs | 2 files | 1 | UPDATE refs |
| D mirror dirs | 4 pairs | 4–6 | MERGE (later) |
| E archive code | 1 tree | — | KEEP |
| F duplicate docs | 1 pair | 3 | ARCHIVE |

**Total immediate deletions proposed:** 30 files (Batch 1)
