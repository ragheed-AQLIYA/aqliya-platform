# LocalContentOS — Full Program Closure Plan

**Document ID:** LC-FULL-CLOSURE-PLAN-2026-06-01  
**Product:** LocalContentOS (Compliance workspace + Content Studio) on AQLIYA Core  
**Program:** L4 → L6 institutional pilot-ready (pilot scope)  
**Date:** 2026-06-01  
**Production claim:** **NO** — before, during, and after closure  
**Validation class (engineering):** Light validated (unit tests, smoke 1–6, pilot DB migrate deploy on `aqliya_lc_pilot`)

---

## 1. Purpose

This plan defines **phases, owners, gates, risks, and DONE criteria** to close the LocalContentOS L6 program from an **engineering-complete** state to an **institutionally attested** pilot-ready baseline — without conflating SalesOS WIP, shared-database drift, or production readiness.

**Principle:** AI assists. Humans decide. Evidence governs.

---

## 2. Current baseline (as of 2026-06-01)

| Area | Status | Evidence |
|------|--------|----------|
| L6 workers 1–6 | **COMPLETE** | Worker reports, `localcontentos-l6-completion-status.md` |
| Smoke steps 1–6 | **PASS** | `agent-14-smoke-results.md`; review `crev_mpulmiwi_nzagcrh` |
| Content Studio unit tests | **25/25 PASS** | Worker 6 / targeted tests |
| B2 / B3 / B4 | **CLOSED** | Scorecard blocker register |
| B1 pilot DB (`aqliya_lc_pilot`) | **CLOSED** | `localcontentos-b1-option-a-execution-log.md` |
| B1 shared DB (`aqliya`) | **OPEN** | Documented waiver for pilot scope; Option B/C backlog |
| Migration encoding (deploy reproducibility) | **CLOSED** (git) | Commit `9f52cfc` |
| B1 evidence docs (git) | **CLOSED** | Commit `1bbc3ec` |
| PO sign-off / L6 program gate | **OPEN** | `localcontentos-l5-po-signoff-template.md` |
| Honest product level (pre-PO) | **L5+ / L6 candidate with conditions** | **NOT L6 achieved**, **NOT Production Ready** |

---

## 3. Phases and owners

| Phase | Name | Owner | Outcome |
|-------|------|-------|---------|
| **P0** | Evidence lock (git + docs) | Engineering integrator | All LC completion docs on `main`; execution log lists commit SHAs |
| **P1** | PO review | Product Owner (PO) | PO reads evidence pack; no production claims |
| **P2** | PO attestation | Product Owner | AUTHORIZE + conditions, DEFER, or REJECT on sign-off template |
| **P3** | Doc reconciliation (post-AUTHORIZE only) | Engineering + PO | L6 achieved **(pilot scope)** wording in matrix and closure pack |
| **P4** | Pilot runtime cutover | Platform / ops | Runtime `DATABASE_URL` → `aqliya_lc_pilot`; `LOCALCONTENT_CONTENT_BACKEND=prisma` |
| **P5** | Time-bounded pilot | Pilot operator | Internal/institutional pilot per quickstart; monitor waivers |
| **P6** | Platform backlog (optional) | Platform team | Shared `aqliya` B1 Option B/C; B5 repo-wide `tsc`/CI |

**Out of scope for this program:** SalesOS feature WIP, website soft-launch pack, full build/lint/test suite without explicit approval (AQLIYA low-load protocol).

---

## 4. Gates (must pass in order)

### Gate G0 — Documentation closure (engineering)

| Criterion | Owner | Status |
|-----------|-------|--------|
| Full closure plan published | Integrator | This document |
| PO next-steps + scorecard + one-pager committed | Integrator | P0 |
| Execution log updated with doc commit SHAs | Integrator | P0 |
| No SalesOS app/schema hunks in LC doc commits | Integrator | P0 |

**Exit:** G0 **PASS** when git baseline includes closure pack commits (see execution log § Documentation closure).

### Gate G1 — PO evidence review

| Criterion | Owner |
|-----------|-------|
| Smoke 6/6 reviewed | PO |
| B1 pilot execution log reviewed | PO |
| L6 readiness scorecard reviewed | PO |
| Waivers understood (shared DB B1, B5 platform) | PO |

**Reference:** `localcontentos-po-signoff-next-steps.md`

### Gate G2 — PO decision (human)

| Decision | Effect |
|----------|--------|
| **AUTHORIZE** + conditions | L6 program gate **CLOSED (pilot scope)**; trigger P3 doc updates |
| **DEFER** | Gate **OPEN**; pilot promotion blocked until re-review |
| **REJECT** | Gate **OPEN**; no institutional pilot promotion |

**Artifact:** Completed `localcontentos-l5-po-signoff-template.md` (Sections A–H).

### Gate G3 — Pilot runtime (post-AUTHORIZE)

| Criterion | Owner |
|-----------|-------|
| Pilot DB connectivity verified | Ops |
| No blind `migrate deploy` on shared `aqliya` | Ops |
| Operator quickstart distributed | PO / ops |

**Reference:** `localcontentos-l5-pilot-operator-quickstart.md`, `localcontentos-lc-pilot-db-runbook.md`

### Gate G4 — Institutional L6 label (documentation only)

| Criterion | Owner |
|-----------|-------|
| `PRODUCT_STATUS_MATRIX` LocalContentOS row updated | Engineering (after PO AUTHORIZE) |
| Closure docs state **L6 achieved (pilot scope)** | Engineering |
| Production claim remains **NO** | PO + engineering |

---

## 5. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Shared DB drift breaks blind deploy | High | Wrong migration scope on `aqliya` | Pilot-only Option A; no deploy on shared DB without Option B/C plan |
| R2 | Fresh clone migrate fail (encoding) | Low (post-`9f52cfc`) | Pilot blocked | Migration UTF-8 normalization committed; execution log |
| R3 | Premature L6 / Production marketing | Medium | Trust / compliance | PO gate G2; explicit **NO** production claim in all docs |
| R4 | Runtime still points at shared `aqliya` | Medium | Data / drift confusion | P4 cutover checklist; env not committed in repo |
| R5 | SalesOS WIP mixed into LC commits | Medium | Review noise | Path-scoped `git add`; exclude `prisma/schema.prisma` Sales hunks |
| R6 | Repo-wide CI red (B5) | High | Monorepo release friction | Track platform backlog; do not block LC pilot scope on B5 |
| R7 | Glass / MCP server-action smoke caveat (step 5) | Low | False negative in automated smoke | Documented in scorecard; human smoke authoritative |

---

## 6. DONE criteria (program closure)

### Engineering DONE (achieved)

- [x] All six L6 workers complete with evidence
- [x] Smoke 1–6 PASS with review dimensions
- [x] B1 closed on `aqliya_lc_pilot`
- [x] B2, B3, B4 closed
- [x] Migration deploy reproducibility commit on `main`
- [x] B1 execution evidence commit on `main`
- [ ] **P0:** Full closure documentation pack on `main` (this plan + integrator sync)

### Institutional DONE (requires PO)

- [ ] PO Gate G2 **AUTHORIZE** with documented conditions
- [ ] P3 doc reconciliation (L6 achieved **pilot scope** only)
- [ ] P4 pilot runtime pointed at pilot DB
- [ ] `PRODUCT_STATUS_MATRIX` LocalContentOS row reflects L6 institutional pilot-ready **with conditions**

### Explicitly NOT DONE (by design)

- Production Ready / GA / regulator-certified local content compliance
- Shared `aqliya` B1 reconciliation (unless PO schedules)
- Full monorepo build/lint/test validation without approval
- SalesOS operational sign-off (separate product program)

---

## 7. Execution checklist (integrator)

```
[ ] Publish localcontentos-full-closure-plan.md (this file)
[ ] Commit: po-signoff-next-steps, b1-migration-fix-commit-ready, scorecard, one-pager
[ ] Append execution log § Documentation closure with commit SHAs
[ ] Verify git diff --cached excludes prisma/schema.prisma, src/app/sales, tmp-*
[ ] Hand off to PO: localcontentos-po-signoff-next-steps.md
[ ] Await PO AUTHORIZE before P3 matrix L6 row
```

---

## 8. Related artifacts

| Document | Role |
|----------|------|
| `localcontentos-po-signoff-next-steps.md` | PO action guide |
| `localcontentos-l6-readiness-scorecard.md` | Eight dimensions + checklist |
| `localcontentos-program-status-one-pager.md` | Stakeholder summary |
| `localcontentos-b1-option-a-execution-log.md` | Pilot DB command evidence + git record |
| `localcontentos-l6-program-closure.md` | Worker completion summary |
| `localcontentos-l5-po-signoff-template.md` | PO sign-off form |

---

## 9. Sign-off (plan approval)

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering integrator | _(record in commit)_ | 2026-06-01 | Plan published |
| Product Owner | _Pending_ | | Plan accepted / DEFER |

---

*Plan version: LC-FULL-CLOSURE-2026-06-01. Validation: not production-validated. Pilot scope only.*
