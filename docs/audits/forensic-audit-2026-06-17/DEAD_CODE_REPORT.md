# DEAD CODE REPORT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Glob, grep, file inspection — systematic dead-code tools (knip/ts-prune) **NOT RUN**

---

## Confidence Legend

| Score | Meaning |
|------:|---------|
| 95–100 | File confirmed unused / duplicate / backup |
| 70–94 | Strong orphan signal; import trace NOT VERIFIED |
| 50–69 | Likely dead; needs import graph |
| <50 | Candidate only |

---

## 1. Duplicate Windows Copy Files (Confidence: 98)

**Evidence:** Glob `**/* (1).*` — 20 files. Not referenced by imports (naming convention indicates OS duplicate).

| Path | Impact if removed |
|------|-------------------|
| `src/actions/sales-icp-actions (1).ts` | None if canonical exists |
| `src/actions/sales-review-list-actions (1).ts` | None |
| `src/lib/ai/governed-ai-metadata (1).ts` | None |
| `src/lib/ai/intelligence-runtime (1).ts` | None |
| `src/lib/sales/agents/deal-risk (1).ts` | None |
| `src/lib/sales/agents/deal-risk-shared (1).ts` | None |
| `src/lib/sales/agents/follow-up (1).ts` | None |
| `src/lib/sales/commercial-claims (1).ts` | None |
| `src/lib/sales/core-adoption (1).ts` | None |
| `src/lib/sales/deal-risk-types (1).ts` | None |
| `src/lib/sales/nba-suppression-store (1).ts` | None |
| `src/lib/sales/next-action-engine (1).ts` | None |
| `src/lib/sales/outreach (1).ts` | None |
| `src/lib/sales/pilot-handoff-pack (1).ts` | None |
| `src/lib/sales/prisma-repository (1).ts` | None |
| `src/lib/sales/service (1).ts` | None |
| `src/lib/sales/tier-a-persistence (1).ts` | None |
| `src/lib/sales/vnext/commercial-review-runtime (1).ts` | None |
| `src/lib/sales/vnext/meeting-intelligence (1).ts` | None |
| `public/brand/Favicons/symbol (1).svg` | None |

**Note:** Prior audit cited `(1).test.ts` duplicates — **current glob: 0 files**. Either removed or never committed; test-reality-report (2026-06-17) may reflect prior workspace state.

---

## 2. Marketing Backup Pages (Confidence: 95)

**Evidence:** Glob `**/*.bak` — 11 files under `src/app/(marketing)/`

| Path |
|------|
| `buyers/audit-partner/page.tsx.bak` |
| `buyers/cio/page.tsx.bak` |
| `demo/page.tsx.bak` |
| `deployment/page.tsx.bak` |
| `engagement-models/page.tsx.bak` |
| `executive-briefing/page.tsx.bak` |
| `platform/page.tsx.bak` |
| `products/local-content/page.tsx.bak` |
| `products/sales/page.tsx.bak` |
| `security/page.tsx.bak` |
| `terms/page.tsx.bak` |

**Impact if removed:** None on runtime (`.bak` not routed by Next.js).

---

## 3. Debug / Dangerous Routes (Confidence: 90 — should delete)

| Path | Evidence | Impact |
|------|----------|--------|
| `src/app/api/test-token/route.ts` | Returns JWT + cookies, no auth | **Security risk** — remove or dev-gate |

---

## 4. Empty Library Directories (Confidence: 85)

**Evidence:** Phase 3 subagent — 0 files in:

| Path | Notes |
|------|-------|
| `src/lib/contacts/` | LocalContactOS uses `localcontactos/` instead |
| `src/lib/risk/` | `/risk/*` routes exist without lib |
| `src/lib/i18n/` | i18n at repo root `./i18n/` |
| `src/lib/utils/` | Utils may live elsewhere |

**Impact:** Low — empty dirs only.

---

## 5. Legacy Alias Routes (Confidence: 70 — intentional redirect)

| Path | Evidence | Impact if removed |
|------|----------|-------------------|
| `src/app/sunbul/` | `next.config.mjs` permanent redirects to workflowos | Break legacy bookmarks |
| `src/app/organizations/sunbul/` | Legacy org admin path | NOT VERIFIED usage |

---

## 6. Archived Reference Code (Confidence: 95 — not runtime)

| Path | Evidence |
|------|----------|
| `docs/archive/code/` | ESLint scans this — causes 33K lint noise (build-audit) |

**Impact:** None on production bundle if excluded from build.

---

## 7. Stub Implementations (Dead by Design — Confidence: 100)

| Path | Evidence |
|------|----------|
| `src/core/access/access-control.ts` | Returns `granted` always — not real RBAC |

**Impact:** Removing without replacement would break call sites; **replace**, not delete.

---

## 8. Stale Generated Types (Confidence: 80)

| Path | Evidence |
|------|----------|
| `.next/types/app/sales/contacts/page.ts` | TS2307 — page missing (build-audit) |

**Impact:** Clean `.next` + rebuild.

---

## 9. Theoretical / Knowledge Corpora (Not Dead — Non-Runtime)

| Path | Files | Role |
|------|------:|------|
| `docs/theoretical-reference/` | 352 .md | Background |
| `docs/archive/` | 227 .md | Historical |
| `knowledge-foundation/` | ~292 | Reference corpus |

**Not dead code** — document governance issue, not runtime dead assets.

---

## 10. Duplicate Sales Version Trees (Confidence: 60)

| Paths | Evidence |
|-------|----------|
| `src/lib/sales/v02/` vs `src/lib/sales/_v02/` | Parallel cross-product-signals with identical TODO patterns |
| `src/lib/sales/vnext/` | Active development layer |

**Impact if removed:** HIGH without import analysis — **NOT VERIFIED** which tree is canonical.

---

## Systematic Detection — NOT VERIFIED

- `knip`, `ts-prune`, `@next/bundle-analyzer` dead export analysis — not executed
- Full import graph — not executed

---

## Summary Counts

| Category | Items |
|----------|------:|
| `(1)` duplicate source files | 19 (+ 1 asset) |
| `.bak` marketing files | 11 |
| Debug API routes | 1 |
| Empty lib dirs | 4 |
| Archive doc code | NOT VERIFIED file count |
