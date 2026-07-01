# AQLIYA Pilot Launch Certificate

**Certificate ID:** PLC-2026-06-21-001  
**Date:** 2026-06-21  
**Prior status:** GO WITH CONDITIONS (84/100)  
**Current status:** **GO**  
**Scope:** First institutional pilot — AuditOS, DecisionOS, LocalContentOS on AQLIYA Cloud

---

## Executive verdict

| Field | Value |
|-------|-------|
| **Pilot launch decision** | **GO** |
| **Readiness score** | **94 / 100** |
| **Closure sprint** | Complete (operational only — no feature/architecture changes) |
| **Trust principle** | AI assists. Humans decide. Evidence governs. |

Pilot launch is **authorized** subject to the **Pre-Customer Go-Live Gate** below (deployment execution only — no new engineering).

---

## Closure item evidence

### 1. ClamAV — PASS (local) / READY (production)

| Check | Result | Evidence |
|-------|--------|----------|
| ECS sidecar in Terraform | Done | `infra/terraform/modules/compute/main.tf` — ClamAV container + `dependsOn HEALTHY` |
| Staging compose parity | Done | `docker-compose.staging.yml` — `SCANNER_PROVIDER=clamav` |
| Upload scanner smoke | **PASS** | `backups/pilot-reports/scanner-smoke-*.json` — PONG + clean scan OK |
| Production deploy | **Pending apply** | Run `terraform apply` in production environment |

**Validated config:** `SCANNER_PROVIDER=clamav`, `CLAMAV_HOST=127.0.0.1` (ECS sidecar)

---

### 2. Redis rate limiter — PASS (local) / READY (production)

| Check | Result | Evidence |
|-------|--------|----------|
| `RATE_LIMITER=redis` in ECS Terraform | Done | `infra/terraform/modules/compute/main.tf` |
| Shared counter under load | **PASS** | 10 allowed / 5 denied on 15 requests — `rate-limit-load-*.json` |
| Memory fallback | **Not used** | `memoryFallbackDetected: false` |
| Production deploy | **Pending apply** | ElastiCache URL already in ECS secrets |

---

### 3. RDS restore drill — PASS (local) / SCHEDULED (production)

| Metric | Local drill (2026-06-21) | Production target |
|--------|--------------------------|-------------------|
| **RTO** | **5.4 seconds** (scratch DB restore) | ≤ 4 hours (runbook SLA) |
| **RPO** | **< 1 minute** (backup age at drill) | ≤ 24 hours (RDS automated backup) |
| Row spot-check | 700 rows — PASS | Same script on RDS snapshot |
| Report | `backups/drill-reports/drill-2026-06-21T20-41-47.json` | Execute per runbook § backup |

> **Note:** Local drill uses Docker Postgres 16. Live RDS drill (I-01) scheduled within 7 days of first production deploy — script and runbook ready.

---

### 4. AI runtime decision — RESOLVED

**Decision:** **Option B — AI excluded from pilot**

| Artifact | Location |
|----------|----------|
| Scope decision | `docs/operations/PILOT_AI_SCOPE_DECISION.md` |
| SOW appendix | `docs/commercial/PILOT_SOW_TEMPLATE.md` — Appendix B |
| Production config | `FF_AI_REAL_PROVIDERS=false` in ECS Terraform |

**Ambiguity:** None. Pilot SOW must attach Appendix B.

---

### 5. Pilot operations — READY

| Artifact | Status |
|----------|--------|
| Operational handbook | `docs/operations/PILOT_OPERATIONAL_HANDBOOK.md` |
| On-call roster template | `docs/operations/PILOT_ONCALL_ROSTER.md` |
| Onboarding simulation | `docs/operations/PILOT_ONBOARDING_SIMULATION.md` |
| Unified closure runner | `npm run platform:pilot-closure` |

**Action before first customer ticket:** Replace `[NAME]` placeholders in on-call roster.

---

## Automated validation summary

**Command:** `npm run platform:pilot-closure`  
**Result:** **GO** (2026-06-21)

```
✓ clamav_upload_smoke
✓ redis_rate_limit_load
✓ pilot_readiness (100% evidence coverage)
✓ restore_drill
```

**Report:** `backups/pilot-reports/pilot-launch-closure-1782074524171.json`

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm run platform:pilot-closure` | Pass — GO |
| `npm run platform:pilot-readiness` | Pass — 7 pass, 2 warn |
| `npm run build` | Not re-run (no app code changes) |

---

## Pre-Customer Go-Live Gate (mandatory, ~1 day)

These are **deployment execution** steps — not engineering blockers:

1. **Terraform apply (production)** — deploy ClamAV sidecar + `RATE_LIMITER=redis` + `SCANNER_PROVIDER=clamav`
2. **Post-deploy smoke** — run upload test + rate limit check against production/staging URL
3. **On-call roster** — assign named primary/secondary + customer escalation contacts
4. **RDS restore drill (I-01)** — schedule within 7 days of go-live; use `scripts/platform/restore-drill.mjs` against RDS snapshot

---

## Product readiness (unchanged from Phase 7)

| Product | Verdict |
|---------|---------|
| LocalContentOS | GO |
| AuditOS | GO |
| DecisionOS | GO |
| Platform Core | GO |

---

## Sign-off

| Role | Status | Date |
|------|--------|------|
| Platform engineering (closure sprint) | Complete | 2026-06-21 |
| Production deploy lead | Pending terraform apply | — |
| Commercial (SOW Appendix B) | Ready for signature | — |
| Customer executive sponsor | Pending contract | — |

---

## Certificate statement

> AQLIYA pilot launch readiness is certified **GO** as of 2026-06-21. All five closure sprint items have repository evidence and local operational validation. Production customer onboarding may proceed after the Pre-Customer Go-Live Gate is executed.

**Issued by:** Pilot Launch Closure Sprint (automated + operational documentation)  
**Next review:** After first production deploy + RDS live drill
