# Phase 4 Entry — L6 Certification Checklist

**Authority:** `docs/execution-backlog/v1.2-execution-backlog.md` (Phase 4), `L6_COMPLETION_PROGRAM.md`  
**Prerequisite:** Roadmap Phase 3 **repo complete** — see `ROADMAP_PHASE3_COMPLETION_REPORT.md` (`main` ≥ `3beabfc`)  
**Updated:** 2026-06-07

---

## Before claiming any L6 label

| Rule | Detail |
| ---- | ------ |
| Cycle 6 | Must be **CLOSED** on **remote** staging (not local `:5435` proxy only) |
| Pentest | **L0-04** scheduled or complete — no “L6 certified” without vendor evidence |
| IaC | **L0-01** Terraform **apply** is operator decision — review only in repo today |
| Product XL | **S7-03** CRM, **LC-08** ERP — out of Phase 4 repo scope until product approves |

---

## Gate 0 — Program closure (blocking)

| # | Action | Evidence | Owner |
| - | ------ | -------- | ----- |
| 1 | Remote staging reachable | `REMOTE_STAGING_PROBE.md` → PASS | Ops |
| 2 | `npx prisma migrate deploy` on staging (incl. `20260607100000_audit_evidence_version`) | migrate log | Ops |
| 3 | `npm run db:verify-pgvector` | `pgvector-verify-output.txt` | Ops |
| 4 | `npm run ic:smoke:cycle5:live` with real keys | `evidence/ic-smoke-cycle5-live.json` | Ops |
| 5 | `npm run cycle6:smoke:audit-ai` on staging DB | `evidence/cycle6-governed-audit-smoke.json` | Ops |
| 6 | Fill `docs/validation/cycle-6/LIVE_SMOKE_REPORT.md` remote row | All Required Evidence fields | Ops |
| 7 | Director G6-7 **PASS** | `parallel-execution-cycle-2026-06-06-cycle-6-close.md` → CLOSED | Director |

**Runbook:** `cycle-6-staging-operator-checklist.md`  
**One-page packet:** `cycle-6-remote-operator-packet.md`  
**Blockers:** `docs/validation/cycle-6/CERTIFICATION_BLOCKERS.md`  
**Preflight:** `node scripts/cycle6-operator-preflight.mjs`  
**Stamp helper:** `node scripts/cycle6-smoke-report-stamp.mjs`  
**Remote smoke:** `npm run cycle6:remote-smoke`

---

## Gate 1 — Platform L0 (L6 certification)

| ID | Criterion | Status (repo) |
| -- | --------- | ------------- |
| L0-01 | IaC reviewed; **apply** documented | Review done — apply pending |
| L0-02 | HA/DR plan + RTO/RPO | ✅ `ha-dr-plan.md` |
| L0-03 | Backup automation | ✅ CI + scheduler |
| L0-04 | External penetration test | **OPEN** — vendor |
| L0-07 | Cross-tenant isolation tests | ✅ test suite |

---

## Gate 2 — Intelligence Core L0.5

| ID | Criterion | Status (repo) |
| -- | --------- | ------------- |
| IC-01 | Governed RAG + audit trail | ✅ Cycle 5 |
| IC-02 | Active LLM staging activation | Ops env |
| IC-04 | CI eval regression gate | ✅ |
| IC-06 | Budget alerts | ✅ |
| IC-09 | Provider hardening | ✅ Cycle 4 |

---

## Gate 3 — Per-layer L6 (after Gates 0–2)

| Layer | Certification task | Key deps |
| ----- | ------------------ | -------- |
| L1 AuditOS | A1-01, A1-06, A1-09 + platform L6 | Phase 3 features deployed + smoke |
| L2 LocalContentOS | LC-01, LC-03, LC-05, LC-06 + platform L6 | Pilot conditions doc |
| L3 DecisionOS | D3-01, D3-02, D3-03 + platform L6 | |
| L7 SalesOS | S7-01–S7-05 + platform L6 | Internal L5 criteria only — not CRM L6 |

**Scorecard:** `docs/validation/cycle-6/L6_READINESS_SCORECARD.md`  
**Blockers:** `docs/validation/cycle-6/CERTIFICATION_BLOCKERS.md`

---

## Gate 0.5 — Customer demo static gate (repo)

| Command | Purpose |
| ------- | ------- |
| `npm run demo:smoke` | Routes, download auth, RAG/pgvector files, tenant tests (no server) |

**Evidence:** slice 24 @ `ec7beec`+

---

## Gate 4 — Full repository validation (Phase 4 sign-off)

| Gate | Command | Evidence @ `82b06fc` |
| ---- | ------- | -------------------- |
| Unit/integration Jest | `npm test` | 141 pass, ~8s |
| Demo static | `npm run demo:smoke` | Pass |
| TypeScript | `npx tsc --noEmit` | Pass @ slice 31 |
| Production build | `npm run build` | **PASS** @ slice 31 (~155s) |

Run before any “production candidate” announcement:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Record results in `docs/validation/PILOT_VALIDATION_MASTER_REPORT.md` (append dated section).

---

## Honest labels after Phase 4 entry work

| Label | When allowed |
| ----- | ------------ |
| Pilot-ready with conditions | Today — AuditOS / LocalContentOS |
| L6 platform certified | Never until L0-04 + DR drill + Gates 0–4 PASS |
| Production go-live | Separate `PILOT_GO_LIVE_CHECKLIST.md` + customer sign-off |

---

## Related

- `ROADMAP_PHASE3_COMPLETION_REPORT.md`
- `program-execution-state.md`
- `PARALLEL_REMEDIATION_GATES.md`
