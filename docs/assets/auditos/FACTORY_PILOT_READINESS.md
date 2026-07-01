# AuditOS 2.0 Factory — Pilot Readiness Package (Phase 12)

**Status:** Ready for **controlled pilot with conditions**  
**Date:** 2026-06-13  
**Audience:** Operators, reviewers, pilot leads  
**Prerequisite doc:** [`CURRENT_STATE.md`](./CURRENT_STATE.md)

---

## 1. Executive Summary

AuditOS 2.0 Factory Program **Phases 2–12** are implemented on this branch as optional, flag-gated layers on top of existing AuditOS L5 pilot workflows.

| Verdict | Meaning |
| ------- | ------- |
| **Pilot-ready (baseline)** | Core `/audit/*` TB → mapping → FS → notes → approval with all factory flags **off** |
| **Pilot-ready (factory partial)** | Phases 9 + 11 enabled after operator training |
| **Pilot-ready (factory governed)** | Phase 10 enabled only when review discipline is in place |
| **Pilot-ready (full factory)** | Phases 2–8 + 9–11 enabled; reconciliation tie-out passes on staging |

Trust principle: **AI assists. Humans decide. Evidence governs.**

---

## 2. Pilot Activation Profiles

### Profile A — Baseline (Recommended for Session 5 / first TB)

```env
FF_AUDIT_INTELLIGENCE=false
FF_AUDIT_APPROVAL_GATES=false
FF_AUDIT_MIND_MAP=false
```

- Uses legacy approval/export path.
- No factory checklist on approval tab.
- Lowest risk for first real customer TB.

### Profile B — Traceability + AI assist

```env
FF_AUDIT_INTELLIGENCE=true
FF_AUDIT_MIND_MAP=true
FF_AUDIT_APPROVAL_GATES=false
```

- Notes tab: manual «تشغيل الإثراء» available.
- Factory map tab visible after TB + mapping + FS.
- Graph snapshot on approval **only if** `MIND_MAP=true`.
- Approval/export **not** blocked by factory gates.

### Profile C — Full factory governance (advanced pilot)

```env
FF_AUDIT_INTELLIGENCE=true
FF_AUDIT_APPROVAL_GATES=true
FF_AUDIT_MIND_MAP=true
```

- Approval tab shows `[Factory] …` checklist.
- Engagement approval **blocked** until gates pass (see [GOVERNANCE_ENGINE.md](./GOVERNANCE_ENGINE.md)).
- Export blocked until gates pass.
- Graph snapshot captured at approval milestone.

**Restart required:** set env → restart Next.js / redeploy ECS task.

### Profile D — Full factory pipeline (advanced pilot + tie-out)

```env
FF_AUDIT_FS_V2=true
FF_AUDIT_IFRS_RULES=true
FF_AUDIT_SOCPA_RULES=true
FF_AUDIT_DISCLOSURE_AUTO=true
FF_AUDIT_RECONCILIATION=true
FF_AUDIT_RECONCILIATION_GATES=true
FF_AUDIT_REPORTING_GRAPH=true
FF_AUDIT_LEAD_SCHEDULE_AUTO=true
FF_AUDIT_INTELLIGENCE=true
FF_AUDIT_APPROVAL_GATES=true
FF_AUDIT_MIND_MAP=true
```

- Full TB → lead schedules → reconciliation → FS v2 → IFRS → SOCPA → disclosure auto pipeline.
- Requires `npm run factory:smoke` pass on staging before customer session.
- Enable `RECONCILIATION_GATES` only after RC checks pass (`failedCount: 0`).

---

## 3. Operator Runbook — End-to-End

### 3.1 Pre-flight (once per environment)

| # | Check | Pass criteria |
| - | ----- | ------------- |
| 1 | PostgreSQL up | `docker compose up -d db` or RDS reachable |
| 2 | Migrations applied | `npx prisma migrate deploy` (or documented pilot DB) |
| 3 | Seed users | `admin@aqliya.com` / seed credentials per runbook |
| 4 | Auth | Login to `/audit` succeeds |
| 5 | Factory flags | Document which profile (A/B/C) is active |

### 3.2 Engagement flow (per customer)

| Step | Tab / route | Operator action | Evidence |
| ---- | ----------- | ----------------- | -------- |
| 1 | Trial balance | Upload customer TB | `AuditTrialBalance` + file hash |
| 2 | Mapping | Confirm mappings | `AuditAccountMapping` status `confirmed` |
| 3 | Validation | Run validation; dispose critical/high | Latest `AuditValidationRun` |
| 4 | Statements | Generate / rebuild FS | `AuditFinancialStatement` |
| 5 | Notes | Draft / review notes | `AuditDisclosureNote` |
| 6 | Factory map *(if B/C)* | Verify TB→mapping→FS→notes graph | `/factory-map` stats |
| 7 | Intelligence *(if B/C)* | Run enrichment; **human review** | `AuditAiOutput`, note status |
| 8 | Review / findings | Complete human review | Review comments / findings |
| 9 | Approval | Sign off | `AuditApprovalRecord` |
| 10 | Export | PDF/XLSX | Export audit event |

### 3.3 Post-approval verification *(Profile B/C)*

1. Open **سجل التدقيق** (`/audit-trail`).
2. Filter / search for `factory_graph.snapshot` (mind map on).
3. Confirm metadata includes `stats` (node/edge counts) and `milestone: approval`.

---

## 4. Go / No-Go Checklist

### GO (baseline pilot — Profile A)

- [ ] `npx tsc --noEmit` passes on release commit
- [ ] Core engagement workflow completes with seed or customer TB
- [ ] All factory flags **off** documented in pilot log
- [ ] `/auditos/*` not used for real customer data
- [ ] Reviewer assigned; human approval before export

### GO (factory partial — Profile B)

- [ ] All baseline GO items
- [ ] Operator read [`AUDIT_INTELLIGENCE.md`](./AUDIT_INTELLIGENCE.md) + [`MIND_MAP.md`](./MIND_MAP.md)
- [ ] Notes contain rule citations **or** team accepts enrichment may skip
- [ ] Manual enrichment run tested on staging engagement

### GO (factory governed — Profile C)

- [ ] All Profile B items
- [ ] Operator read [`GOVERNANCE_ENGINE.md`](./GOVERNANCE_ENGINE.md)
- [ ] Test approval **blocked** when notes still `draft` (expected)
- [ ] Test approval **passes** after notes reviewed/approved
- [ ] Export blocked / unblocked consistent with gates

### GO (full factory — Profile D)

- [ ] All Profile C items (or explicit waiver documented)
- [ ] `npm run factory:smoke:static` passes
- [ ] `npm run factory:smoke` passes on staging (`eng-gulf-2025` or equivalent)
- [ ] Reconciliation `failedCount: 0` in smoke evidence
- [ ] Operator read [`RECONCILIATION_ENGINE.md`](./RECONCILIATION_ENGINE.md), [`FS_ENGINE.md`](./FS_ENGINE.md)

### NO-GO

- [ ] `tsc` or CI red on target commit
- [ ] Auth or tenant isolation regression
- [ ] Factory flags on without trained reviewer
- [ ] Claiming IFRS/SOCPA **certification** or autonomous compliance (assistive rules only)
- [ ] Using `/auditos/*` for real TB or exports

---

## 5. Smoke Validation (Operator Commands)

Run on staging or local **before** customer session. Record output in pilot log.

```bash
# Light (required)
npx tsc --noEmit

# Targeted factory tests
npm test -- src/lib/audit/reporting-graph/__tests__
npm test -- src/lib/audit/governance/__tests__
npm test -- src/lib/audit/intelligence/__tests__
npm test -- src/__tests__/unit/workflow-gating.test.ts
```

Optional (explicit approval for heavy):

```bash
npm run build
npm test
npm run factory:smoke:static
```

**Automated factory smoke (SAR seed engagement `eng-gulf-2025`):**

```bash
docker compose up -d db
npx prisma db push
npm run seed:audit   # ensures platform login users + eng-gulf-2025
npm run factory:smoke
```

Evidence written to `docs/audits/evidence/factory-pilot-smoke-*.txt` on success.

**Browser smoke (manual or Cypress):**

| Route | Expected |
| ----- | -------- |
| `/audit/engagements/[id]/trial-balance` | TB loads |
| `/audit/engagements/[id]/lead-schedules` | Lead schedules page + generate button |
| `/audit/engagements/[id]/validation` | Validation + factory panels (reconciliation/IFRS/SOCPA) |
| `/audit/engagements/[id]/factory-map` | Disabled message OR graph (flag) |
| `/audit/engagements/[id]/notes` | Intelligence panel (flag) |
| `/audit/engagements/[id]/approval` | Factory checklist items (flag) |

**Cypress (requires app + DB on `localhost:3000`):**

```bash
npm run seed:audit
npm run build && npm run start   # separate terminal
npm run cy:local -- --spec cypress/e2e/audit-factory.cy.ts
```

---

## 6. Factory Module Reference

| Module | Doc | Flag |
| ------ | --- | ---- |
| Reporting graph | [GRAPH_ARCHITECTURE.md](./GRAPH_ARCHITECTURE.md) | `FF_AUDIT_REPORTING_GRAPH` |
| Lead schedules | [LEAD_SCHEDULE_ENGINE.md](./LEAD_SCHEDULE_ENGINE.md) | `FF_AUDIT_LEAD_SCHEDULE_AUTO` |
| Reconciliation | [RECONCILIATION_ENGINE.md](./RECONCILIATION_ENGINE.md) | `FF_AUDIT_RECONCILIATION` |
| FS v2 | [FS_ENGINE.md](./FS_ENGINE.md) | `FF_AUDIT_FS_V2` |
| IFRS rules | [IFRS_RULES_ENGINE.md](./IFRS_RULES_ENGINE.md) | `FF_AUDIT_IFRS_RULES` |
| SOCPA rules | [SOCPA_RULES_ENGINE.md](./SOCPA_RULES_ENGINE.md) | `FF_AUDIT_SOCPA_RULES` |
| Disclosure auto | [DISCLOSURE_AUTO_ENGINE.md](./DISCLOSURE_AUTO_ENGINE.md) | `FF_AUDIT_DISCLOSURE_AUTO` |
| Intelligence | [AUDIT_INTELLIGENCE.md](./AUDIT_INTELLIGENCE.md) | `FF_AUDIT_INTELLIGENCE` |
| Governance | [GOVERNANCE_ENGINE.md](./GOVERNANCE_ENGINE.md) | `FF_AUDIT_APPROVAL_GATES` |
| Mind map | [MIND_MAP.md](./MIND_MAP.md) | `FF_AUDIT_MIND_MAP` |

---

## 7. Safe Claims vs Forbidden Claims

### May claim (with Profile A)

- AuditOS governed workspace at `/audit/*` for TB → FS pilot
- Human review and audit trail on mutations
- Controlled pilot with documented constraints

### May claim (Profile B/C, when enabled and tested)

- Optional disclosure enrichment assist (not final opinion)
- Factory pipeline visualization (computed graph)
- Optional approval gates blocking premature sign-off (Profile C)
- Graph snapshot in audit trail at approval

### May claim (Profile D, when enabled and factory smoke passes)

- Governed factory pipeline: TB → lead schedules → reconciliation → FS v2
- Assistive IFRS/SOCPA rule evaluation (not certification)
- Automated disclosure note drafts from rule triggers (human review required)
- Lead schedule auto-generation from confirmed mappings
- Reconciliation tie-out checks (RC-001..006)

### Must NOT claim

- IFRS/SOCPA **compliance certification** or regulator-approved conclusions
- AI final approval or autonomous export
- Commercial GA / production-hardened L6
- Local/private AI runtime (Phase 1 partial only)

---

## 8. Pilot Evidence Checklist (Closeout)

Capture for each pilot engagement:

| Artifact | Location |
| -------- | -------- |
| TB source file + hash | Evidence / TB record |
| Mapping confirmation log | Mapping tab + audit events |
| Validation run ID | Validation tab |
| FS generation timestamp | Statements tab |
| Note review status | Notes tab |
| Factory graph snapshot *(B/C)* | Audit event `factory_graph.snapshot` |
| Approval record | Approval tab |
| Export file | Exports tab |
| Pilot feedback | `/pilot` tab |

---

## 9. Incident / Rollback

| Issue | Action |
| ----- | ------ |
| Factory gates block legitimate approval | Set `FF_AUDIT_APPROVAL_GATES=false`, restart |
| Intelligence corrupts note | Revert note content from audit trail; disable `FF_AUDIT_INTELLIGENCE` |
| Mind map performance slow | Disable `FF_AUDIT_MIND_MAP`; core workflow unaffected |
| Any auth/data leak | **Stop pilot** — escalate per platform runbook |

Factory flags are **independent** — disable individually without schema rollback.

---

## 10. Phase 12 Completion Criteria

| Criterion | Status |
| --------- | ------ |
| Current state documented | ✅ [`CURRENT_STATE.md`](./CURRENT_STATE.md) |
| Pilot profiles defined | ✅ §2 |
| Operator runbook | ✅ §3 |
| Go/No-Go checklist | ✅ §4 |
| Smoke commands listed | ✅ §5 |
| Safe claims bounded | ✅ §7 |
| Closure report | ✅ [`FACTORY_PROGRAM_CLOSURE.md`](./FACTORY_PROGRAM_CLOSURE.md) |

---

## Related Documents

- [`FACTORY_PROGRAM_CLOSURE.md`](./FACTORY_PROGRAM_CLOSURE.md) — program sign-off summary
- [`../AUDITOS_OPERATOR_MANUAL.md`](../AUDITOS_OPERATOR_MANUAL.md) — core operator manual
- [`../../pilot/GO-NOGO-CHECKLIST.md`](../../pilot/GO-NOGO-CHECKLIST.md) — platform-level Go/No-Go
- [`../../audits/AQLIYA_PILOT_READINESS_FINAL.md`](../../audits/AQLIYA_PILOT_READINESS_FINAL.md) — platform pilot evidence
