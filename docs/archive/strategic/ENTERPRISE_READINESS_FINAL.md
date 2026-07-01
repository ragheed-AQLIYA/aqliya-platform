# AQLIYA Enterprise Readiness — Final Assessment

**Classification:** Board Enterprise Gate  
**Date:** 2026-06-19  
**Evidence:** Truth Reconciliation (70/100), AQLIYA_CURRENT_STATE (75/100), ENTERPRISE_OPS_CHECKLIST, security sprint (2026-06-17), production probes (2026-06-18)

---

## Classification Framework

| Level | Definition | Buyer expectation |
|-------|------------|-------------------|
| **Pilot Ready** | Controlled customer pilot with operator support, known gaps documented | LOI, limited users, no SLA penalty |
| **Commercial Ready** | Repeatable paid contracts, staging validated, support model, basic InfoSec | Annual subscription, 99% uptime target |
| **Enterprise Ready** | RFP-grade: pen test, SOC2 path, DR proven, SSO at scale, legal pack | Fortune-500 / government procurement |

---

## Overall Verdict

| Classification | Status | Score |
|----------------|--------|------:|
| **Pilot Ready** | **YES** — with written exclusions | 78/100 |
| **Commercial Ready** | **NO** — staging + support + reference gap | 52/100 |
| **Enterprise Ready** | **NO** — 90–180 days minimum | 35/100 |

**Platform overall (enterprise lens): 58/100**

---

## Dimension Assessment

### Security — Commercial Ready (approaching)

| Item | Status | Notes |
|------|--------|-------|
| Auth (NextAuth v5) | ✅ Real | OAuth, SAML wired post-sprint |
| MFA | ✅ Fixed | Challenge UI at login |
| RBAC middleware | ✅ Real | Route min roles enforced |
| CoreAccessControl | ✅ Deny-by-default | Post-sprint; coarse matrix |
| CSRF | ✅ Fixed | Custom login removed |
| File scanning | ✅ ClamAV integrated | Prod daemon not verified |
| Secrets vault | ✅ AES-256-GCM | At rest encryption |
| SCIM API | ✅ L4 | API key auth |
| Pen test | ❌ Not scheduled | Enterprise blocker |
| SOC2 / ISO | ❌ Not started | Enterprise blocker |
| `/api/test-token` | ✅ Deleted | Was critical |

**Classification:** Pilot Ready ✅ · Commercial Ready ⚠️ (pen test pending) · Enterprise Ready ❌

---

### Operations — Pilot Ready (conditional)

| Item | Status | Notes |
|------|--------|-------|
| Production health | ✅ PASS | HTTP 200, DB ok |
| Production smoke | ✅ 28/30 | 2026-06-18 |
| Staging | ❌ DNS ENOTFOUND | Blocker |
| CI/CD | ✅ Defined | 5 workflows; build green |
| Terraform IaC | ⚠️ In repo | Not validated locally |
| ECS/RDS/Redis live audit | ❌ Not run | AWS CLI absent on dev |
| Restore drill (live RDS) | ❌ Not run | Script exists |
| Backup schedule | ✅ Documented | 30-day retention in runbook |
| Node 22 / Docker | ✅ Aligned | Dockerfile updated |

**Classification:** Pilot Ready ⚠️ · Commercial Ready ❌ · Enterprise Ready ❌

---

### Compliance — Not Enterprise Ready

| Item | Status |
|------|--------|
| GDPR-style DPA | Not evidenced in repo |
| Data residency (KSA) | Strategic; not certified |
| Audit log retention policy | Documented L4 |
| AI governance documentation | Strong in code |
| Regulatory claims (LC, audit) | Correctly disclaimed |

**Classification:** Pilot Ready ✅ (with disclaimers) · Commercial Ready ⚠️ · Enterprise Ready ❌

---

### Governance — Pilot Ready (strong)

| Item | Status |
|------|--------|
| Human review gates | ✅ Enforced |
| Evidence linkage | ✅ Product workflows |
| Audit trails | ✅ Platform + product events |
| Export approval gates | ✅ WorkflowOS, decisions, LC |
| AI assist-only principle | ✅ Structural in code |
| Tenant isolation | ✅ organizationId patterns |

**Classification:** Pilot Ready ✅ · Commercial Ready ✅ · Enterprise Ready ⚠️ (needs external audit)

---

### Supportability — Not Commercial Ready

| Item | Status |
|------|--------|
| Operator runbooks | ✅ Exist per product |
| Monitoring dashboard | ✅ `/monitoring` |
| Sentry / CloudWatch | ✅ Configured in IaC |
| Customer support tier | ❌ Not packaged |
| Escalation matrix | ❌ Not documented |
| On-call rotation | ❌ Founder-dependent |

**Classification:** Pilot Ready ⚠️ · Commercial Ready ❌ · Enterprise Ready ❌

---

### Deployment — Commercial Ready (approaching)

| Item | Status |
|------|--------|
| Cloud production | ✅ aqliya.com live |
| On-Prem / Air-Gap | ❌ L0 — do not sell |
| Multi-AZ RDS design | ✅ In Terraform |
| Redis rate limiter | ⚠️ Code exists; ECS config unverified |
| ClamAV in prod | ⚠️ Integration done; daemon unverified |

**Classification:** Pilot Ready ✅ · Commercial Ready ⚠️ · Enterprise Ready ❌

---

### Observability — Pilot Ready

| Item | Status |
|------|--------|
| Health endpoint | ✅ `/api/health` |
| Platform audit logs | ✅ `/settings/audit-logs` |
| Post-deploy smoke | ✅ Script exists, mostly passing |
| APM / distributed tracing | ⚠️ Partial (Sentry) |

**Classification:** Pilot Ready ✅ · Commercial Ready ⚠️ · Enterprise Ready ❌

---

### Reliability — Pilot Ready (conditional)

| Item | Status |
|------|--------|
| Automated tests | ✅ 2462 pass |
| Cypress E2E | ✅ 162 pass (2026-06-18) |
| Load testing | ❌ No evidence |
| DR failover tested | ❌ Not run |
| Multi-task rate limit consistency | ⚠️ Redis mode unverified in prod |

**Classification:** Pilot Ready ⚠️ · Commercial Ready ❌ · Enterprise Ready ❌

---

## Summary Matrix

| Dimension | Pilot | Commercial | Enterprise |
|-----------|:-----:|:----------:|:----------:|
| Security | ✅ | ⚠️ | ❌ |
| Operations | ⚠️ | ❌ | ❌ |
| Compliance | ✅* | ⚠️ | ❌ |
| Governance | ✅ | ✅ | ⚠️ |
| Supportability | ⚠️ | ❌ | ❌ |
| Deployment | ✅ | ⚠️ | ❌ |
| Observability | ✅ | ⚠️ | ❌ |
| Reliability | ⚠️ | ❌ | ❌ |

*With explicit disclaimers on regulatory claims

---

## Path to Commercial Ready (60 days)

1. Fix staging DNS + full smoke (Week 1)
2. Execute live restore drill on staging RDS (Week 2)
3. Package support SLA + pilot SOW (Week 2)
4. Schedule pen test; receive preliminary report (Week 4–8)
5. First paying pilot delivered with case study (Week 8–12)
6. Redis rate limiter + ClamAV verified in ECS task def (Week 4)

**Target score after path: Commercial Ready ~72/100**

---

## Path to Enterprise Ready (180 days)

All Commercial Ready items plus:
- SOC2 Type I readiness assessment
- Completed pen test remediation
- Load test baseline
- MSA/DPA templates
- SSO runbook for 500+ users
- Optional: KSA data residency narrative with legal review

**Target score: Enterprise Ready ~78/100** (full enterprise 85+ requires SOC2 Type II timeline)

---

*Operator handoff: `docs/audits/truth-reconciliation-2026-06-18/ENTERPRISE_OPS_CHECKLIST.md`*
