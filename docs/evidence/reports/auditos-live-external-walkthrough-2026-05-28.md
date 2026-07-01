# AuditOS — Live External Walkthrough Execution Report

**Date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-external-walkthrough-ready-2026-05-28-p1`  
**Commit:** `d91a1fe`  
**Environment:** Docker Compose (`localhost:3000`) — `aqliya-app-1` + `aqliya-db-1`  
**Engagement:** `eng-gulf-2025` (Gulf Trading Co., FY2025)  
**Facilitator:** AQLIYA pilot lead (automated browser execution + walkthrough script)  
**Operator:** Internal rehearsal stand-in (`admin@aqliya.com` — external operator credentials to be rotated for live org)

> **Trust principle:** AI assists. Humans decide. Evidence governs.

---

## Final Classification

### **PASS_WITH_FRICTION**

| Meaning | All 12 workflow steps pass on rebuilt P1-fixed image. No P1 runtime blocker. Residual P2 operator-friction items only. |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |

**Not classified as:** enterprise rollout ready, certified production, autonomous audit, external audit opinion.

---

## Phase 1 — Environment Preparation

| Check | Result |
| ----- | ------ |
| `git checkout auditos-v0.1-external-walkthrough-ready-2026-05-28-p1` | ✅ |
| `git describe --tags --exact-match` | ✅ `auditos-v0.1-external-walkthrough-ready-2026-05-28-p1` |
| `git rev-parse --short HEAD` | ✅ `d91a1fe` |
| `docker compose up -d --build app` | ✅ Build ~2 min; container recreated |
| `docker compose ps` | ✅ `aqliya-app-1` Up, `aqliya-db-1` healthy |
| In-container health (`127.0.0.1:3000/api/health`) | ✅ `status: ok`, DB connected, storage writable |
| Startup logs | ✅ `Ready in 0ms`; no `DOMMatrix`, no statements stack trace |
| Seed `eng-gulf-2025` | ✅ Engagement loads in UI (statements + overview confirm seed present) |

**Note:** Immediate post-recreate `wget localhost:3000` inside container may refuse until listener binds (~5s). Use `127.0.0.1` after warmup.

---

## Phase 2 — Browser Preparation

| Item | Result |
| ---- | ------ |
| Fresh session with cache buster | ✅ `?v=liveext20260528*` |
| Login hard-refresh operator note | ✅ Visible on `/login` |
| Post-rebuild stale Server Action risk | ✅ Avoided via fresh login + new cache buster |
| Post-walkthrough Docker logs | ✅ No `Failed to find Server Action` during session |

---

## Phase 3 — 12-Step Walkthrough Results

Cache buster: `?v=liveext20260528b–f`  
Scripts used: `auditos-live-walkthrough-script.md`, `auditos-first-operator-walkthrough.md`

| Step | Area | Result | Notes |
| ---- | ---- | ------ | ----- |
| 0 | Login | **PASS** | Redirect OK; hard-refresh note visible |
| 1 | Engagement overview | **PASS** | Gulf Trading Co. header; activity feed |
| 2 | Trial balance | **PASS** | ميزان المراجعة workspace loads |
| 3 | Mapping | **PASS** | تعيين الحسابات accessible |
| 4 | **Statements** | **PASS** | **P1 fix verified** — no error boundary; SAR lines; مسودة banner; export dropdown |
| 5 | Notes | **PASS** | إيضاحات content |
| 6 | Evidence | **PASS** | Evidence workspace; traceability framing intact |
| 7 | Findings | **PASS** | Findings UI loads |
| 8 | Review | **PASS** | Review workspace loads |
| 9 | Approval | **PASS (constrained)** | Governance prerequisites block final approval — **expected** |
| 10 | Export | **PASS** | Draft PDF/XLSX labels (مسودة); governance copy clear |
| 11 | Audit trail | **PASS** | Events visible; export/workflow entries present |

**Score:** **12/12 PASS** (step 9 governance-constrained as designed)

---

## Critical Demonstration Points

### Governance (verified)

- Human approval required before final outputs — shown on approval + export tabs
- Incomplete approval intentionally blocked — prerequisite messaging present
- Audit trail records workflow actions — demonstrated on step 11
- Pre-approval exports labeled draft only — مسودة copy on exports + statements export

**Claims avoided:** autonomous audit, AI sign-off, enterprise certification.

### Statements (previous P1 — resolved)

| Check | Result |
| ----- | ------ |
| No error boundary | ✅ |
| Balance sheet visible | ✅ TOTAL ASSETS SAR 5,200,000 |
| SAR values visible | ✅ |
| Draft banner visible | ✅ «مسودة فقط — مراجعة بشرية واعتماد مطلوب» |
| Export dropdown visible | ✅ |

### Evidence

- Presented as traceability support, not autonomous validation — aligned with script.

---

## Phase 4 — Friction Log (this session)

See updated `docs/reports/auditos-first-external-walkthrough-friction-log.md`.

| ID | Severity | Area | Observation | Recommended Action |
| -- | -------- | ---- | ----------- | ------------------ |
| L1 | P2 | Platform sidebar | «Sunbul» module visible during AuditOS walkthrough | Facilitator explains legacy alias; optional P3 hide for pilot profile |
| L2 | P2 | Platform context | Blue seed notice «غير مربوط بمشروع منصة» may alarm external operator | Facilitator script explains pilot allowance |
| L3 | P2 | Statements copy | English line labels (ASSETS, LIABILITIES) in Arabic-first UI | P3 bilingual polish — not a blocker |
| L4 | P2 | Health timing | In-container health may refuse for ~5s right after recreate | Document warmup in demo env checklist |
| L5 | P3 | Session mode | Automated stand-in operator, not live external human | Schedule human operator session with rotated credentials |
| L6 | P2 | Approval | Final approval blocked by prerequisites | **Expected governance** — explain in script |
| L7 | — | Export | Draft messaging clear | Keep |
| L8 | — | Audit trail | Events visible | Keep as proof point |
| ~~E1~~ | ~~P1~~ | ~~Statements~~ | ~~Error boundary~~ | **RESOLVED** in `d91a1fe` |

---

## Operator Reaction Notes (facilitator / stand-in)

| Topic | Reaction |
| ----- | -------- |
| Statements | Would proceed — balance sheet and draft banner credible |
| Approval blocked | Would ask «why?» — prerequisite card + facilitator answer sufficient |
| Platform context note | Brief concern until pilot seed explained |
| Draft export | Understood when read aloud — not confused with final report |
| AI role | No autonomous sign-off shown — aligns with trust principle |

---

## Blockers

| ID | Blocker | Status |
| -- | ------- | ------ |
| B1 | Statements client render | **Closed** — fixed in `d91a1fe` |
| B2 | Auth / storage / tenant | **None observed** |

---

## Deliverables Checklist

| Deliverable | Status |
| ----------- | ------ |
| Session summary | ✅ This report |
| Friction log updated | ✅ |
| Operator reaction notes | ✅ § above |
| Blocker list | ✅ B1 closed |
| Final recommendation | ✅ § below |

---

## Final Recommendation

1. **External walkthrough is unblocked** on tag `auditos-v0.1-external-walkthrough-ready-2026-05-28-p1`.
2. **Before live human operator:** rebuild Docker, fresh incognito, hard refresh, rotate off seed `admin123`.
3. **Facilitator prep:** rehearse L1–L2 talking points; do not force approval on seed.
4. **Do not expand features** during pilot week — P1-only hotfixes if regressions appear.
5. **Next milestone:** schedule live external operator session; target re-classification to **PASS** if P2 items are accepted in briefing.

---

## References

- Baseline tag: `auditos-v0.1-external-walkthrough-ready-2026-05-28-p1` (`d91a1fe`)
- P1 fix report: `docs/reports/auditos-statements-p1-fix-2026-05-28.md`
- Prior re-smoke: `docs/reports/auditos-first-external-walkthrough-resmoke-2026-05-28.md`
- Script: `docs/pilot/auditos-live-walkthrough-script.md`
