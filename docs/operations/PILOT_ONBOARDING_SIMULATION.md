# Pilot Onboarding Simulation Checklist

**Date:** 2026-06-21  
**Purpose:** Dry-run pilot onboarding before first customer go-live  
**Run by:** Platform operator  
**Duration:** ~2 hours

---

## Simulation scenario

**Customer:** Acme Industries (fictional)  
**Products:** LocalContentOS + DecisionOS  
**Users:** 1 ADMIN, 2 REVIEWER, 3 VIEWER  
**SSO:** Credentials (no SAML for simulation)

---

## Phase 1 — Provisioning (30 min)

| Step | Action | Pass | Notes |
|------|--------|------|-------|
| 1.1 | Create `PlatformOrganization` for Acme | ☐ | |
| 1.2 | Invite 6 users with correct roles | ☐ | |
| 1.3 | Verify tenant isolation — Acme cannot see seed org | ☐ | |
| 1.4 | Run `npm run platform:backfill-evidence:apply` if needed | ☐ | |
| 1.5 | Confirm evidence health 100% | ☐ | GET `/api/platform/evidence/health` |

---

## Phase 2 — Product smoke (45 min)

| Step | Action | Pass | Notes |
|------|--------|------|-------|
| 2.1 | LocalContentOS: create project | ☐ | |
| 2.2 | Upload evidence file — scanner passes | ☐ | `SCANNER_PROVIDER=clamav` |
| 2.3 | Run classification + submit for review | ☐ | |
| 2.4 | Reviewer approves — audit log entry | ☐ | |
| 2.5 | Export PDF/XLSX — disclaimer present | ☐ | |
| 2.6 | DecisionOS: create decision + attach evidence | ☐ | |
| 2.7 | Decision review workflow to approved | ☐ | |

---

## Phase 3 — Operations (30 min)

| Step | Action | Pass | Notes |
|------|--------|------|-------|
| 3.1 | `/monitoring` — enterprise + evidence panels load | ☐ | |
| 3.2 | Simulate SEV-3 ticket — L1 → L2 handoff | ☐ | Use roster |
| 3.3 | Verify backup exists in `./backups` or RDS | ☐ | |
| 3.4 | Run restore drill or confirm last drill report | ☐ | `npm run platform:restore-drill` |
| 3.5 | Confirm AI features show exclusion/disabled state | ☐ | Per AI scope decision |

---

## Phase 4 — Customer handoff (15 min)

| Step | Action | Pass | Notes |
|------|--------|------|-------|
| 4.1 | Walk through handbook §1 onboarding checklist | ☐ | |
| 4.2 | Provide support email + escalation path | ☐ | |
| 4.3 | Confirm SOW Appendix B (AI exclusions) reviewed | ☐ | |
| 4.4 | Schedule Week 1 steering meeting | ☐ | |

---

## Simulation result

| Field | Value |
|-------|-------|
| **Date run** | `[DATE]` |
| **Operator** | `[NAME]` |
| **Overall** | ☐ PASS / ☐ FAIL |
| **Blockers** | |

---

## Local validation (2026-06-21)

Automated closure checks executed via `npm run platform:pilot-closure`:

- ClamAV scanner smoke (when ClamAV container running)
- Redis rate limiter load test (when Redis running)
- Pilot readiness script
- Restore drill (when backup available)

Named on-call contacts remain **pending assignment** before unconditional production GO.
