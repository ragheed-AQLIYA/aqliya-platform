# Certification Blockers

**Updated:** 2026-06-07  
**Baseline:** `e791cc1` (Phase 3 repo complete; demo static gate PASS)  
**Authority:** `L6_READINESS_SCORECARD.md`, `phase-4-entry-checklist.md`

---

## Summary

| Label | Meaning |
| ----- | ------- |
| **Repo PASS** | Evidence exists in repository or local proxy (`:5435`) |
| **Remote OPEN** | Requires operator on reachable staging |
| **Vendor OPEN** | External human/vendor |

**Cycle 6 program:** **BLOCKED** until blockers #1 remote row is closed and G6-7 → CLOSED.

---

## Blocker matrix

| # | Blocker | Severity | Owner | Repo status | Remote / vendor | Evidence |
| - | ------- | -------- | ----- | ----------- | --------------- | -------- |
| 1 | Staging live smoke (G6-2) | **Critical** | Ops / AGENT-A | **PASS** (local proxy) | **OPEN** | [LIVE_SMOKE_REPORT.md](./LIVE_SMOKE_REPORT.md), `npm run cycle6:full-run` |
| 2 | External penetration test (L0-04) | **Critical** | Vendor | N/A | **OPEN** | [PENTEST_PREP_PACKET.md](./PENTEST_PREP_PACKET.md) |
| 3 | Terraform apply (L0-01) | **Critical** | Ops | Review **PASS** | Apply **OPEN** | `infra/terraform/`, `terraform-readiness-review-l0-01.md` |
| 4 | Backup restore drill | High | Ops | Scripts **PASS** | Drill **OPEN** | [BACKUP_RESTORE_DRILL_EVIDENCE.md](./BACKUP_RESTORE_DRILL_EVIDENCE.md) |
| 5 | Cross-tenant isolation tests | Medium | Engineering | **PASS** (Jest) | Staging DB run **OPEN** | `src/__tests__/cross-tenant-isolation.test.ts`, `org-scoping.test.ts` |
| 6 | Director G6-7 CLOSED | **Critical** | Director | **CONDITIONAL** | **OPEN** | [cycle-6-close.md](../../operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md) |
| 7 | `staging.aqliya.ai` reachable | **Critical** | Ops / infra | N/A | **OPEN** (2026-06-06 DNS FAIL) | [REMOTE_STAGING_PROBE.md](./REMOTE_STAGING_PROBE.md) |

---

## Unblock order (operator)

```text
1. Provision DNS + staging host (#7)
2. DATABASE_URL + STAGING_BASE_URL → cycle6-operator-preflight.mjs
3. npx prisma migrate deploy (through 20260608000002)
4. npm run cycle6:remote-smoke
5. node scripts/cycle6-smoke-report-stamp.mjs → LIVE_SMOKE_REPORT remote row
6. G6-7 in cycle-6-close.md → CLOSED
7. program-execution-state.md → Cycle 6 CLOSED
```

**Packet:** `docs/operations/cycle-6-remote-operator-packet.md`

---

## Not blockers (repo complete — do not re-open)

| Item | Evidence |
| ---- | -------- |
| Roadmap Phase 3 backlog | `ROADMAP_PHASE3_COMPLETION_REPORT.md` |
| A1-09 audit-ai bridge | `4d24afd`+ |
| Demo static gate | `npm run demo:smoke` @ slice 24 |
| LocalContactOS L5 tests | `local-contacts.test.ts` (20) |
| XL CRM/ERP integrations | Scope docs only — not certification blockers |

---

## Phase 4 gate dependency

No **L6 certified** label until rows **#1 (remote)**, **#2**, **#3**, and **#6** are closed or explicitly risk-accepted per `docs/validation/security/RISK_ACCEPTANCE_REPORT.md`.
