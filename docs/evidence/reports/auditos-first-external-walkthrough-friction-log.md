# AuditOS — External Walkthrough Friction Log

**Latest session:** 2026-05-28 (live execution, P1-fixed baseline)  
**Baseline tag:** `auditos-v0.1-external-walkthrough-ready-2026-05-28-p1` (`d91a1fe`)  
**Environment:** Docker Compose (`localhost:3000`)  
**Engagement:** `eng-gulf-2025`

---

## Latest Session Outcome (2026-05-28 — P1 fixed)

| Classification | **PASS_WITH_FRICTION** |
| -------------- | ---------------------- |
| Meaning | 12/12 steps pass after rebuild on P1 tag. No runtime blocker. P2 polish/framing only. |

**Full report:** `docs/reports/auditos-live-external-walkthrough-2026-05-28.md`

---

## Friction Log — Live Session (P1 baseline)

| ID | Severity | Area | Observation | Reproduction | Recommended Action |
| -- | -------- | ---- | ----------- | ------------ | ------------------ |
| L1 | P2 | Platform sidebar | «Sunbul» module visible during AuditOS walkthrough | Open any `eng-gulf-2025` tab | Facilitator: legacy alias → WorkflowOS; optional P3 hide for pilot |
| L2 | P2 | Platform context | Blue seed notice «غير مربوط بمشروع منصة» may alarm external operator | Engagement header on all tabs | Facilitator explains pilot/seed allowance per script |
| L3 | P2 | Statements copy | English FS line labels in Arabic-first UI | `/statements` balance sheet | P3 bilingual polish — not a blocker |
| L4 | P2 | Health timing | In-container health may refuse ~5s after container recreate | Immediate `wget` after `docker compose up` | Document warmup; use `127.0.0.1` after Ready |
| L5 | P3 | Session mode | Automated stand-in operator, not live external human | This validation run | Schedule human operator; rotate credentials |
| L6 | P2 | Approval (expected) | Final approval blocked by governance prerequisites | `/approval` on seed | **Not a defect** — explain in script |
| L7 | P2 | Export (positive) | Draft export messaging clear in Arabic | `/exports` | Keep; facilitator reinforces draft ≠ final |
| L8 | P2 | Audit trail (positive) | Workflow + export events visible | `/audit-trail` | Keep as governance proof point |
| L9 | P2 | Login UX (positive) | Hard-refresh note after Docker deploy visible | `/login` | Keep; mention in facilitator opening |

---

## Resolved / Closed

| ID | Severity | Area | Resolution |
| -- | -------- | ---- | ---------- |
| E1 | ~~P1~~ | Statements | **CLOSED** — `GovernanceTooltip` + `TooltipProvider` fix in `d91a1fe`; verified 12/12 after rebuild |
| E2 | ~~P2~~ | Deploy UX | **CLOSED** — Arabic sidebar + blue platform context after P1 rebuild |
| E3 | ~~P2~~ | Platform context | **CLOSED** — blue info banner on P1 image |

---

## 12-Step Results (Live Session)

| Step | Route | Result |
| ---- | ----- | ------ |
| 0 | `/login` | **PASS** |
| 1 | `…/eng-gulf-2025` | **PASS** |
| 2 | `…/trial-balance` | **PASS** |
| 3 | `…/mapping` | **PASS** |
| 4 | `…/statements` | **PASS** |
| 5 | `…/notes` | **PASS** |
| 6 | `…/evidence` | **PASS** |
| 7 | `…/findings` | **PASS** |
| 8 | `…/review` | **PASS** |
| 9 | `…/approval` | **PASS (constrained)** |
| 10 | `…/exports` | **PASS** |
| 11 | `…/audit-trail` | **PASS** |

---

## Prior Session (pre-P1 — archived)

**Date:** 2026-05-28 (first attempt, tag `9114ba5` without P1 fix)  
**Classification:** FAIL / PASS_WITH_FRICTION — statements error boundary on unrebuilt or pre-fix image.

Key archived items: E1 statements P1 (now closed), E2–E10 deploy/UX/governance notes (mostly closed or accepted).

---

## Blockers

| ID | Blocker | Status |
| -- | ------- | ------ |
| B1 | Statements client render | **Closed** (`d91a1fe`) |
| B2 | Auth / storage / tenant | **None** |

---

## References

- Live report: `docs/reports/auditos-live-external-walkthrough-2026-05-28.md`
- P1 fix: `docs/reports/auditos-statements-p1-fix-2026-05-28.md`
- Script: `docs/pilot/auditos-live-walkthrough-script.md`
