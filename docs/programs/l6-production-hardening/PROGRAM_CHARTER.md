# L6 Production Hardening — Program Charter

> **Status:** Draft | **Version:** 1.0 | **Date:** 2026-07-01 | **Owner:** Platform Team

---

## 1. Purpose

رفع AuditOS و LocalContentOS و SalesOS من **L5 (Pilot-ready)** إلى **L6 (Production-hardened)**.

## 2. Scope

### Three Products

| Product | Current | Target | Route Prefix |
|---------|---------|--------|-------------|
| AuditOS | L5 | L6 | `/audit/*` |
| LocalContentOS | L5 | L6 | `/local-content/*` |
| SalesOS | L5 | L6 | `/sales/*` |

### Shared Platform Layer

| Layer | Description |
|-------|-------------|
| Authentication | SSO, MFA, session |
| Evidence | Core Evidence Platform |
| Knowledge | Knowledge Foundation |
| Monitoring | Health, metrics, alerts |
| Backup | Automated + restore drill |
| CI/CD | Deploy pipeline |
| Observability | Logs, traces, metrics |
| Security | Rate limiter, scanner, headers |

## 3. Gates

```text
L6-G0  Infrastructure Ready ──┐
                               ├── L6-G1  Operational Readiness ──┐
                                                                    ├── L6-G2  Security Validation ──┐
                                                                                                         ├── L6-G3  Performance Validation ──┐
                                                                                                                                              ├── L6-G4  Product Go-Live ──┐
                                                                                                                                                                               ├── L6 Exit Review
```

### L6-G0: Infrastructure Ready

**Gate rule:** Cannot start G1 without G0 PASS.

| Item | Criteria | Status |
|------|----------|:------:|
| AWS Accounts | Prod + Staging isolated | ⬜ |
| IAM | Least-privilege roles | ⬜ |
| VPC | Private subnets, NAT, security groups | ⬜ |
| RDS | PostgreSQL 16, Multi-AZ, automated backups | ⬜ |
| S3 | Evidence storage, access logs, versioning | ⬜ |
| Secrets | AWS Secrets Manager / Parameter Store | ⬜ |
| DNS | Route53, TLS certificates | ⬜ |
| ECS/ECR | Container registry + Fargate service | ⬜ |
| Logging | CloudWatch logs, structured format | ⬜ |
| **G0 Gate** | All items PASS or documented exception | ⬜ |

### L6-G1: Operational Readiness

**Gate rule:** Cannot start G2 without G1 PASS.

| Item | Criteria | Status |
|------|----------|:------:|
| Monitoring Dashboards | AuditOS + LCOS + SalesOS | ⬜ |
| Alerts | Error rate, health, queue depth | ⬜ |
| Health Checks | Per-product + platform aggregate | ✅ (P0-D1) |
| Backup Automation | Daily pg_dump → S3 | ⬜ |
| Restore Verification | `npm run restore-drill` weekly | ✅ (P0-D3) |
| Runbooks | Deployment, DR, incident, on-call | ✅ (P0-F) |
| **G1 Gate** | All items PASS | ⬜ |

### L6-G2: Security Validation

**Gate rule:** Cannot start G3 without G2 PASS (or documented Risk Acceptance).

| Item | Criteria | Severity SLA | Status |
|------|----------|:-----------:|:------:|
| External Pen Test | Third-party engagement | Critical/High → Fix | ⬜ |
| Fix Findings | Per severity SLA | See table | ⬜ |
| Secrets Review | No secrets in code/env | All | ⬜ |
| Dependency Scan | `npm audit`, Snyk/Trivy | High+ → Fix | ⬜ |
| Container Scan | ECR scan, Image vulnerabilities | Critical → Fix | ⬜ |
| Upload Security | ClamAV + MIME + size | ✅ (P0-B4) | ✅ |
| Rate Limiter | Redis-backed, per-route | ✅ (existing infra) | ✅ |
| CSP Hardening | no unsafe-eval/inline | ✅ (previous pass) | ✅ |
| **G2 Gate** | All Critical/High fixed or risk-accepted | ⬜ |

#### Severity SLA

| Severity | SLA |
|----------|:----:|
| Critical | Must fix before G2 PASS |
| High | Must fix before G2 PASS |
| Medium | Risk review + documented acceptance |
| Low | Backlog, no blocking |

### L6-G3: Performance Validation

**Gate rule:** Cannot start G4 without G3 PASS.

| Item | Criteria | Status |
|------|----------|:------:|
| Load Test | 500 concurrent users, P95 < 2s | ⬜ |
| Stress Test | Find breakpoint (where does it fail?) | ⬜ |
| Soak Test | 2-hour sustained load, no degradation | ⬜ |
| Recovery Test | Kill container → auto-restart within 30s | ⬜ |
| DB Connection Pool | No exhaustion under load | ⬜ |
| **G3 Gate** | All PASS with documented thresholds | ⬜ |

### L6-G4: Product Go-Live Review

**Gate rule:** Per-product gate — one product can pass while another stays.

| Product | Criteria | Status |
|---------|----------|:------:|
| **AuditOS** | Pilot results positive, KPI dashboard green, runbook verified | ⬜ |
| **LCOS** | Pilot results positive, seed data verified, runbook verified | ⬜ |
| **SalesOS** | Pilot results positive, dashboard Prisma-backed, runbook verified | ⬜ |

#### Per-Product KPIs

| KPI | AuditOS | LCOS | SalesOS |
|-----|:-------:|:----:|:-------:|
| Page load P95 < 2s | ⬜ | ⬜ | ⬜ |
| AI pipeline success > 95% | ⬜ | ⬜ | ⬜ |
| Auth enforcement 100% | ✅ | ✅ | ✅ |
| Error rate < 1% | ⬜ | ⬜ | ⬜ |
| Backup verified | ⬜ | ⬜ | ⬜ |

## 4. L6 Exit Review

**Final gate before production declaration.**

| Question | PASS |
| -------- |:----:|
| Infrastructure Ready (G0)? | □ |
| Operations Ready (G1)? | □ |
| Security Approved (G2)? | □ |
| Performance Validated (G3)? | □ |
| Product KPIs Met (G4)? | □ |
| Critical Risks Closed? | □ |
| Go-Live Approved? | □ |

> **If all PASS:**
> ```text
> 🏆 L6 Production — PASS
> ```

---

## 5. Estimation

| Phase | Parallel? | Effort | Depends On |
|-------|:---------:|:------:|:----------:|
| G0: Infrastructure | 🟡 Partial | 3-5 days | AWS access |
| G1: Operations | 🟢 Yes (in code) | 2 days | G0 |
| G2: Security | 🔴 Sequential | 3-5 days | G0, G1 |
| G3: Performance | 🟡 Partial | 2-3 days | G0, G1 |
| G4: Product Review | 🟢 Per product | 2 days | G0-G3 |
| Exit Review | — | 0.5 day | G4 |

**Total: ~12-18 days** (if infra ready, ~3 weeks if not).

---

## 6. Critical Path

```text
AWS Infrastructure (G0) ← المسار الحرج
        ↓
Pen Test (G2) ← ثاني أطول مسار
        ↓
Fix Findings (G2)
        ↓
Performance Tests (G3)
        ↓
Go-Live Review (G4)
```

إذا AWS مش جاهزة → المشروع كله يتأخر.

---

## 7. Next Steps

1. ✅ Accept this charter
2. Assess current AWS infrastructure state
3. Start G0 or document blockers
4. Parallel: code-level hardening (CSP, rate limiter — already done)
5. Schedule external pen test (requires G0)

---

*Program Charter v1.0 — 2026-07-01*
