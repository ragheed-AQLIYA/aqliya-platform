# AuditOS v0.1 — Internal Rehearsal Report (Track C.3)

**Date:** 2026-05-28  
**Environment:** Docker Compose stack (`localhost:3000`) — `aqliya-app-1` + `aqliya-db-1`  
**Engagement:** `eng-gulf-2025` (Gulf Trading Co., FY2025)  
**Operator:** Platform engineering (automated browser rehearsal)  
**Guide:** `docs/deployment/auditos-v0.1-internal-rehearsal.md`

---

## Executive Summary

Full 11-step internal rehearsal was executed against the **working Docker compose stack** seeded via compose-network DB setup (Track C.2).

**Result: CONDITIONAL FAIL** (superseded by Track C.4 — see addendum below)

- **10 of 11 workflow steps** passed or passed with expected governance constraints.
- **1 step failed** with a runtime error (Financial Statements tab).
- **No governance blockers** (auth bypass, tenant leak, silent mutations, health degradation).
- **First real blocker:** Financial Statements tab cannot load on Docker/standalone Node runtime.

**Recommendation:** Remain **CONDITIONAL GO** for product/workflow (Track B) but **do not** advance to external pilot until Statements tab Docker runtime failure is fixed (P1).

---

## Environment Checks

| Check | Before | After |
| ----- | ------ | ----- |
| `docker compose ps` | app + db up | app + db up |
| `GET /api/health` | `status: ok` | `status: ok` |
| DB + storage | connected / writable | connected / writable |

---

## Rehearsal Pass/Fail by Step

| Step | Workflow | Path | Result | Notes |
| ---- | -------- | ---- | ------ | ----- |
| 0 | Login | `/login` | **PASS** | `admin@aqliya.com` / seeded password |
| 1 | Open engagement (seed; skip create) | `/audit`, `/audit/engagements/eng-gulf-2025` | **PASS** | Dashboard shows Gulf Trading Co.; next-action card present |
| 2 | Trial balance | `/trial-balance` | **PASS** | Arabic UI; search; upload button; seeded TB present |
| 3 | Mapping | `/mapping` | **PASS** | 23 account mappings visible; Arabic tab labels |
| 4 | Statements | `/statements` | **FAIL** | Error boundary: «خطأ في القوائم المالية» — see blocker |
| 5 | Notes | `/notes` | **PASS** | 14 disclosure notes; draft banners |
| 6 | Evidence | `/evidence` | **PASS** | Page loads; Arabic guidance; seeded evidence in audit trail |
| 7 | Findings | `/findings` | **PASS** | Findings UI loads; «نتيجة جديدة» available |
| 8 | Review | `/review` | **PASS** | 3 review comments; human review form; no auto-approval |
| 9 | Approval | `/approval` | **PASS (constrained)** | Human-decision banner; prerequisites correctly block final approval |
| 10 | Export | `/exports` | **PASS** | Draft PDF export triggered; audit trail logs `PDF export generated` (8KB) |
| 11 | Audit trail | `/audit-trail` | **PASS** | 16+ events: evidence, findings, review, export, validation |

---

## First Blocker

### Financial Statements tab runtime failure (Step 4)

**Symptom:** Route error boundary renders:

> خطأ في القوائم المالية — تعذر تحميل هذا القسم بأمان.

**Screenshot:** Captured during rehearsal (statements error with retry/back actions).

**Server log (Docker app container):**

```
ReferenceError: DOMMatrix is not defined
```

Stack trace references shared webpack chunks also used by Office AI Assistant routes (`assistant/page.js`). Likely **server-side import of browser-only PDF/canvas dependency** in standalone Docker Node runtime.

**Impact:**

- Operators cannot view or interact with financial statements in the Docker deployment path.
- Export still works (PDF generated via separate server action path).
- Seeded data includes 3 financial statements in DB — data exists; UI route fails.

**Classification:** **P1 — rehearsal blocker** for Docker controlled deployment (not a governance/security blocker).

**Rehearsal stopped documenting at first P1 workflow failure per scope; remaining steps were verified to complete the assessment matrix above without code changes.

---

## UX Friction Log

| ID | Severity | Area | Observation |
| -- | -------- | ---- | ------------- |
| F1 | **P1** | Statements | Tab crashes with error boundary on Docker stack (`DOMMatrix`) |
| F2 | P2 | Platform context | Yellow banner: «الارتباط التدقيقي غير مرتبط بمشروع» on workflow tabs |
| F3 | P2 | Sidebar | Mixed EN/AR nav labels (`Dashboard`, `Engagements` vs Arabic workflow tabs) |
| F4 | P2 | Dashboard | Engagement status «معوق» with approval next-action — correct but dense for first-time operator |
| F5 | P2 | Trial balance | No dedicated loading/error route files (expected P2 from Track C) |
| F6 | P2 | Evidence | Seeded evidence rows not fully exposed in accessibility snapshot (table may be below fold) |
| F7 | P2 | Approval | Cannot complete approval on seeded engagement due to open reviews/findings/evidence — **correct governance**, may confuse rehearsal operator |
| F8 | P2 | Notes | English draft text in auto-generated notes mixed with Arabic UI |
| F9 | P2 | Export | Draft download works but no visible in-UI success toast; confirmed via audit trail only |
| F10 | P2 | Docker ops | Host `localhost:5432` vs compose `db:5432` split caused initial empty DB (documented Track C.2) |

---

## Governance Observations (Positive)

| Control | Observed |
| ------- | -------- |
| Auth required | `/audit` redirects unauthenticated users (307 → login) |
| Human approval banner | Present on approval tab |
| Approval prerequisites | Open reviews, findings, evidence block premature approval |
| Draft export labeling | «مسودة» banners on export tab |
| Audit trail | Export and evidence events logged with descriptions |
| Health stable | `/api/health` remained `ok` throughout |

**No blockers found for:** auth bypass, tenant leak, governance bypass, data loss, silent mutation, health failure.

---

## Operator Checklist (from guide)

| Item | Result |
| ---- | ------ |
| Next-action cards match blocked tab | **Partial** — dashboard shows approval/evidence actions |
| Arabic gate reasons understandable | **Yes** on export/approval |
| Cross-tenant test | **Not run** (single user rehearsal) |
| Upload directory grows | **Not verified** (no new upload in rehearsal) |
| Health stays green | **Yes** |
| Uncaught server errors | **Yes** — DOMMatrix on statements route |
| Human approval required for final export | **Yes** — draft labeling clear |

---

## Controlled Internal Rehearsal Verdict

| Classification | Assessment |
| -------------- | ---------- |
| **Full rehearsal pass** | **No** — statements step fails on Docker |
| **Partial rehearsal pass** | **Yes** — 10/11 steps usable |
| **Governance pass** | **Yes** |
| **Docker deployment rehearsal pass** | **No** — P1 statements blocker |

---

## Go/No-Go Recommendation

### Product (Track B) — unchanged

> **CONDITIONAL GO** for controlled internal use when not relying on Statements tab in Docker.

### Docker deployment rehearsal (Track C.3)

> **CONDITIONAL NO-GO for external pilot prep** until:

1. **P1 fix:** Statements tab loads on Docker/standalone Node (`DOMMatrix` / server-side PDF import isolation).
2. **P2 fix (recommended):** Document or resolve platform context banner «غير مرتبط بمشروع» for seeded audit org.

### Next engineering step (not in Track C.3 scope)

- Isolate browser-only dependencies (`pdf-parse`, canvas/DOMMatrix) from server bundles on audit workflow routes.
- Re-run this rehearsal script after fix on the same Docker stack.

---

## References

- Rehearsal guide: `docs/deployment/auditos-v0.1-internal-rehearsal.md`
- Docker validation: `docs/reports/auditos-v0.1-deployment-readiness-2026-05-28.md` (Track C.2)
- Product Go/No-Go: `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`

---

**Report status:** Final (updated Track C.4)  
**Code changed in Track C.3:** No (documentation only)  
**Schema changed:** No

---

## Track C.4 Fix & Recheck (2026-05-28)

### Root cause

`statements-page.tsx` (client component) imported `exportEngagementAction` directly. Next.js bundled the export server-action implementation (including `pdfkit` via `@/lib/audit/export`) into the statements route server module (`statements/page.js`).

**Before fix (Docker bundle proof):**

| String | `statements/page.js` |
| ------ | -------------------- |
| `pdfkit` | 1 |
| `exportEngagement` | 1 |

**After fix:**

| String | `statements/page.js` |
| ------ | -------------------- |
| `pdfkit` | 0 |
| `exportEngagement` | 0 |

Notes page (working in C.3) never had these references. Export tab already used `/api/audit/engagements/[id]/exports/[format]` and worked.

Secondary hardening:

- `file-extraction-service.ts` — `import "server-only"` (blocks `pdf-parse`/`pdfjs-dist` client bundling)
- `office-ai-task-service.ts` — dynamic import of file extraction
- `pdf-exporter.ts` — `import "server-only"`
- `next.config.mjs` — `pdf-parse`, `pdfjs-dist` added to `serverExternalPackages`

### Fix applied

- Removed `exportEngagementAction` from client statements page
- Statements export dropdown now uses fetch to existing permissioned API route (same pattern as `ExportDownloadButton`)
- Statement data rendering, calculations, and governance UI unchanged

### Docker validation

| Check | Result |
| ----- | ------ |
| `docker compose build app` | **Pass** (TypeScript in build) |
| `docker compose up -d app` | **Pass** |
| `GET /api/health` | **Pass** — `status: ok` |
| `/audit/engagements/eng-gulf-2025/statements` | **Pass** — balance sheet + income statement tabs, draft banners, line amounts, traceability |
| Error boundary «خطأ في القوائم المالية» | **Gone** |
| `DOMMatrix` in logs on statements navigation | **Not observed** |

### Rehearsal step 4 recheck

| Step | C.3 | C.4 |
| ---- | --- | --- |
| Statements (`/statements`) | **FAIL** | **PASS** |

### Operational note (P2)

After `docker compose build` + app restart, browsers with cached pre-build JS may show infinite loading or `Failed to find Server Action`. **Hard refresh or new session** loads new chunk (`page-ac4130259f966ae9.js`) and resolves. Document for operators redeploying Docker.

### Updated go/no-go (Track C.4)

| Classification | Status |
| -------------- | ------ |
| P1 statements blocker | **Resolved** |
| Controlled internal rehearsal (11 steps) | **PASS** (step 4 rechecked; prior 10 steps unchanged from C.3) |
| External pilot prep | **CONDITIONAL GO** — P1 cleared; P2 platform-context banner remains |

---

## Track C.5 Final Rehearsal (2026-05-28)

Full 11-step rerun after C.4 — see dedicated report `docs/reports/auditos-v0.1-internal-rehearsal-c5-2026-05-28.md`.

| Result | |
| ------ | -- |
| Steps | **11/11 PASS** (hard refresh) |
| First blocker | **None** |
| Health before/after | **ok** |
| Final verdict | **Controlled internal rehearsal PASS** |
| Go/No-Go | **GO** internal; **CONDITIONAL GO** external pilot |

