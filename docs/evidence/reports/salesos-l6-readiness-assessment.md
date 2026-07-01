# SalesOS L6 — Readiness assessment (post PR-20, pre PR-21 sign-off)

**Date:** 2026-06-01  
**Scope:** Repo + docs scan; operator DB/browser steps **not executed** in this assessment pass  
**Gate reference:** PR-20 integrator + PR-21d Phase 0 operator pack

---

## Classification (honest)

| Label | Verdict |
|-------|---------|
| **Institutional pilot-ready with conditions** | **Yes — conditional** (code + unit tests + runbook exist; human ops + smoke + sign-off still required) |
| **Production GA** | **No-go** |

**Conditions for pilot:** pilot DB with `migrate deploy` + `generate` + seed evidence; browser smoke on runbook §7 routes; integrator checklist sign-off; no claim of external email/LLM autonomy.

---

## L5 vs L6 — what the repo actually is

### L5-shaped (commercial pilot depth)

Present in repo as **metadata-first stubs + governed UI**, not full product tables:

| Capability | L5 expectation | Repo reality (2026-06-01) |
|------------|----------------|---------------------------|
| CRM core | Accounts, deals, pipeline | **Present** — Prisma P0 + UI routes |
| Evidence | Link deals/accounts to Core evidence | **Present** — `SalesEvidenceLink` + `/sales/evidence` |
| Interactions | Log calls/meetings/notes | **Present** — P1 migration + CRUD panels |
| Signals | Account intelligence feed | **Partial** — metadata `signals[]`; no `salesos_p2_signals` migration |
| Outreach | Governed draft review | **Partial** — metadata drafts; queue at `/sales/outreach`; **no send API** (by design) |
| Governance | Stage gates + review decisions | **Present** — PR-10 metadata + deal UI |
| Agents | Bounded stubs + human review | **Present** — research, ICP, objection, risk, follow-up (no external LLM auto-send) |
| Reporting | Founder snapshot | **Present** — `/sales/reports` read-only |
| Pilot handoff | Printable pack per deal | **Partial** — HTML export; `docs/pilot/` onboarding folder still missing |
| Audit | Domain + platform trail | **Present** — `/sales/audit-trail` |

**Verdict:** Repo exceeds **L4 core** and matches a **pragmatic L5-shaped pilot**, not the full L5 breadth described in historical master-plan drafts (many of which are not checked into this tree).

### L6 institutional bar

| L6 requirement | Status | Gap |
|----------------|--------|-----|
| Integrator gate (routes, encoding, Jest sweep) | **PR-20 landed** | Evidence nav link «الأدلة» not wired in `sales-shell` nav (page exists) |
| Operator runbook + Phase 0 script | **PR-21d landed** | Commands **not validated** on operator DB in any agent session |
| Browser smoke evidence | **Open** | Runbook §7 checklist — not run |
| Human sign-off | **Open** | `salesos-l6-integrator-checklist.md` unsigned |
| Doc authority sync | **Open** | `PRODUCT_STATUS_MATRIX` may still say mock-only vs v0.3 routes |
| PR-21 program (claims, memory, brief) | **In flight** | 21b/21c reports in repo; 21a commercial-claims pending |
| Production hardening | **Not started** | No build gate, no E2E, no multi-tenant soak |

**Verdict:** **Not L6 institutionally closed.** PR-20 closed the **integrator code/docs gate**; L6 pilot-ready still needs **operator evidence + human decision**.

---

## What blocks “pilot-ready” (ordered)

1. **No operator DB proof** — `migrate deploy`, `generate`, seed not recorded on target pilot database.
2. **No browser smoke** — PR-8–20 routes untested in a human session (see runbook §7).
3. **Integrator checklist unsigned** — product owner / integrator rows empty.
4. **Documentation drift** — product status matrix vs live `/sales/*` routes.
5. **Known UI gap** — `/sales/evidence` page without shell nav link (deep-link / manual URL only).
6. **PR-21 incomplete** — institutional memory (21b) and brief export (21c) landed; commercial claim gate (21a) and full L6 closure still open.
7. **Legacy migration drift** — six SalesOS migration names may exist in DB without local SQL (runbook §6.1); blocks `migrate dev`, not necessarily `deploy`.

---

## Validation evidence on hand

| Check | Result | Classification |
|-------|--------|----------------|
| `npx jest src/lib/sales/__tests__ --no-coverage` | **15/15 suites, 134/134 tests** (2026-06-01, PR-20) | light validated |
| `migrate deploy` on pilot DB | Not run in assessment | not validated |
| Browser smoke runbook §7 | Not run | not validated |
| `npm run build` | Not run (low-load) | not validated |

---

## Pilot-ready with conditions — operator minimum

1. Run `scripts/salesos-phase0-apply.ps1 -Execute` (or manual runbook §5) on pilot DB; capture `migrate status` output.
2. Complete browser smoke for PR-8–20 routes (runbook §7.1).
3. Sign `salesos-l6-integrator-checklist.md`.
4. Record waivers explicitly if skipping any route (e.g. empty seed org).

**Do not** label production-ready or “fully L6” until build + institutional RBAC smoke + PO sign-off on status matrix.

---

## Production no-go (explicit)

- No external send / LLM autonomy guarantees for outreach or agents.
- No validated HA, backup restore drill, or multi-org soak.
- Metadata-first outreach/signals lack relational audit/export guarantees of full CRM products.
- Drift reconciliation with legacy SalesOS migrations unresolved for some environments.

---

## Related artifacts

- `docs/operations/salesos-migration-runbook.md`
- `scripts/salesos-phase0-apply.ps1`
- `docs/reports/salesos-l6-progress.md`
- `docs/reports/salesos-l6-integrator-checklist.md`
- `docs/reports/salesos-v03-pr20-l6-integrator.md`

---

### Arabic one-liner

بعد PR-20: الكود L5-shaped والاختبارات 134/134 — L6 pilot-ready بشروط (migrate + smoke + توقيع)؛ الإنتاج: لا.
