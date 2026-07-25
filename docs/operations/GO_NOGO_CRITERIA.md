# AQLIYA Production Go/No-Go Decision Criteria

> **Version:** 1.0  
> **Date:** 2026-07-25  
> **Scope:** Production deployment approval framework for AQLIYA platform releases  
> **Owner:** Release Management Team  
> **Related:** `DEPLOYMENT_CHECKLIST.md`, `production-deployment-runbook.md`, `PILOT_OPERATIONAL_HANDBOOK.md`

---

## 1. Purpose

This document defines the objective, measurable criteria for a Go/No-Go decision on production deployment. Every release must pass all **BLOCKING** gates. **WARNING** gates require explicit risk acceptance. **INFO** gates are advisory only.

No deployment proceeds without a signed Go decision.

---

## 2. Code Quality Gates

### 2.1 TypeScript Compilation

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npx tsc --noEmit` | 0 errors | **BLOCKING** | |

**Pass Condition:** Zero TypeScript compilation errors. Any error is blocking.

### 2.2 Test Suite

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npm test` — all suites pass | 0 failures | **BLOCKING** | |
| Test suite count | 100+ suites expected | WARNING | |
| Skipped tests | ≤ 30 documented skips | INFO | |

**Pass Condition:** All test suites pass with zero failures. New failures (not pre-existing skips) are blocking.

### 2.3 Production Build

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npm run build` | Exit code 0, `.next/` produced | **BLOCKING** | |
| Build time | ≤ 5 minutes | WARNING | |
| Build warnings | 0 new warnings | WARNING | |

**Pass Condition:** Successful production build. Build failure is blocking.

### 2.4 Lint Hygiene

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npm run lint -- --quiet` | 0 new errors | **BLOCKING** | |
| Pre-existing warnings | ≤ documented baseline | INFO | |

**Pass Condition:** No new ESLint errors introduced. Pre-existing documented warnings are acceptable.

### 2.5 Architectural Integrity

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| God Objects | 0 (all modules < 500 lines) | WARNING | |
| Circular dependencies | 0 | **BLOCKING** | |
| `as any` in production code | 0 | **BLOCKING** | |
| Server-only leaks to client | 0 | **BLOCKING** | |

---

## 3. Security Gates

### 3.1 Dependency Audit

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npm audit` — critical | 0 | **BLOCKING** | |
| `npm audit` — high | 0 | **BLOCKING** | |
| `npm audit` — moderate | ≤ 3 with remediation plan | WARNING | |
| Unmaintained packages | 0 | WARNING | |

### 3.2 Static Security Analysis

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| No hardcoded secrets | 0 findings | **BLOCKING** | |
| SQL injection vectors | 0 (all parameterized) | **BLOCKING** | |
| CSP configuration | No `unsafe-eval`, no `unsafe-inline` | WARNING | |
| Auth middleware coverage | All workspace routes protected | **BLOCKING** | |
| Demo route isolation | No auth required, no real data | **BLOCKING** | |

### 3.3 External Penetration Test

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| External pen-test | Completed, all critical/high fixed | **BLOCKING** (*) | |
| Pen-test report | Available and reviewed | **BLOCKING** (*) | |

> **(*)** Currently pending — vendor-gated. Until completed, production deployment is **CONDITIONAL GO** for controlled pilot only. Full unrestricted production requires pen-test closure. See ADR-100–109.

### 3.4 Authentication & Authorization

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| SSO/SAML | Tested with staging IdP | WARNING | |
| SCIM provisioning | API key auth verified | WARNING | |
| MFA | Enabled for admin accounts | WARNING | |
| RBAC server-side enforcement | All actions protected | **BLOCKING** | |
| Tenant isolation | Cross-org access blocked | **BLOCKING** | |
| ClientSecret encryption | AES-256-GCM at rest verified | WARNING | |

### 3.5 Data Protection

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| File upload scanning | `SCANNER_PROVIDER=clamav` active | **BLOCKING** (*) | |
| Rate limiting | `RATE_LIMITER=redis` active | WARNING | |
| Secrets rotation | < 90 days since last rotation | INFO | |

> **(*)** Currently pending ClamAV daemon verification in live environment. Without it, `SCANNER_PROVIDER=none` is fail-open (accepts all uploads). Production requires ClamAV.

---

## 4. Performance Gates

### 4.1 Response Latency

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `/api/health` p95 latency | ≤ 200ms | WARNING | |
| `/api/platform/health` p95 latency | ≤ 500ms | WARNING | |
| Dashboard page load (TTFB) | ≤ 1.5s | WARNING | |
| API action response (p95) | ≤ 2s | WARNING | |

### 4.2 Throughput & Resources

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| DB connection pool saturation | < 80% | WARNING | |
| Redis memory usage | < 80% maxmemory | WARNING | |
| ECS CPU utilization | < 70% sustained | WARNING | |
| ECS memory utilization | < 80% | WARNING | |
| Load test pass | 100 req/s sustained, < 1% error rate | WARNING | |

### 4.3 Cache Effectiveness

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Dashboard cache hit rate | > 50% | INFO | |
| Cache invalidation triggered on mutations | Verified | INFO | |

---

## 5. Data Integrity Gates

### 5.1 Migration Safety

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Staging migration success | Passed with `prisma migrate deploy` | **BLOCKING** | |
| Schema drift | 0 (migrate status shows sync) | **BLOCKING** | |
| No destructive migrations | Verified (no DROP, no RENAME without plan) | **BLOCKING** | |
| Seed data compatibility | Seed runs without errors after migration | WARNING | |

### 5.2 Backup Verification

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Pre-deployment backup | Completed and checksum verified | **BLOCKING** | |
| `npm run backup:verify` | All critical tables verified | **BLOCKING** | |
| Restore drill | Last drill ≤ 30 days ago, passed | WARNING | |
| Backup retention | ≥ 30 days of backups available | WARNING | |

### 5.3 PlatformAuditLog Integrity

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Audit log table exists | `PlatformAuditLog` queryable | **BLOCKING** | |
| Hash chain integrity | `HashChainEntry` has no orphans | WARNING | |
| Recent audit events | Entries within last 24 hours | INFO | |
| `npm run platform:verify-audit-logs` | Passes | WARNING | |

### 5.4 Cross-Product Data Integrity

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| `npm run platform:verify-org-links` | Passes (0 orphaned org refs) | WARNING | |
| `npm run platform:verify-workspace-links` | Passes | WARNING | |
| Tenant isolation | Verified via cross-tenant tests | **BLOCKING** | |

---

## 6. Operational Gates

### 6.1 Monitoring & Observability

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Health endpoints respond | All 4 endpoints return 200 | **BLOCKING** | |
| Structured logging active | JSON-formatted logs with context | WARNING | |
| Error reporting active | Sentry or equivalent receiving events | WARNING | |
| CloudWatch dashboards configured | 4 dashboards operational | INFO | |
| CloudWatch alarms active | 5+ alarms configured | WARNING | |

### 6.2 Runbook Readiness

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| Deployment checklist reviewed | `DEPLOYMENT_CHECKLIST.md` current | **BLOCKING** | |
| Rollback procedure tested | At least once in staging | **BLOCKING** | |
| Restore drill completed | Within last 30 days | WARNING | |
| Pilot operational handbook current | `PILOT_OPERATIONAL_HANDBOOK.md` | INFO | |

### 6.3 On-Call Readiness

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| On-call roster populated | Named individuals, not placeholders | **BLOCKING** | |
| Escalation path verified | Test page to primary → secondary | WARNING | |
| Communication channel active | Slack/Teams channel monitored | WARNING | |
| PagerDuty/OpsGenie configured | Alert routing active | WARNING | |

### 6.4 Infrastructure Verification

| Gate | Threshold | Weight | Status |
|------|-----------|--------|--------|
| ECS service healthy | `runningCount == desiredCount` | **BLOCKING** | |
| RDS instance reachable | Connection succeeds from ECS | **BLOCKING** | |
| ElastiCache reachable | Redis responds to PING | **BLOCKING** | |
| S3 bucket accessible | IAM role permits read/write | **BLOCKING** | |
| ACM certificate valid | Not expiring within 30 days | INFO | |
| WAF attached | Associated with ALB/CloudFront | WARNING | |

---

## 7. Decision Matrix

### 7.1 Scoring Rules

Each gate is scored:
- **PASS** = meets or exceeds threshold
- **PASS*** = meets threshold with documented caveat
- **WARN** = below threshold but not blocking
- **FAIL** = below BLOCKING threshold

### 7.2 Overall Decision

| Condition | Decision |
|-----------|----------|
| All BLOCKING gates PASS | **GO** |
| All BLOCKING gates PASS, ≤ 2 WARNING gates fail | **CONDITIONAL GO** — documented risk acceptance required |
| Any BLOCKING gate FAIL | **NO-GO** |
| > 3 WARNING gates FAIL | **CONDITIONAL GO** — requires VP Engineering sign-off |

### 7.3 Release Decision Form

#### Go/No-Go Decision — Release `[VERSION]`

| Category | BLOCKING Gates | PASS | FAIL | WARN | Notes |
|----------|---------------|------|------|------|-------|
| Code Quality | 4 | | | | |
| Security | 7 | | | | |
| Performance | 0 | | | | |
| Data Integrity | 6 | | | | |
| Operational | 6 | | | | |
| **TOTAL** | **23** | | | | |

**Overall Decision:** `[GO / CONDITIONAL GO / NO-GO]`

**Risk Items Accepted:**
1. `[List any WARNING gate failures with rationale]`

**Sign-Off:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Release Manager | `[NAME]` | `[SIGN]` | `[DATE]` |
| Engineering Lead | `[NAME]` | `[SIGN]` | `[DATE]` |
| Security Lead | `[NAME]` | `[SIGN]` | `[DATE]` |
| Product Owner | `[NAME]` | `[SIGN]` | `[DATE]` |
| VP Engineering (if CONDITIONAL GO) | `[NAME]` | `[SIGN]` | `[DATE]` |

---

## 8. Post-Go Verification (First 24 Hours)

After a GO decision and deployment:

| Timeframe | Check | Action if fail |
|-----------|-------|----------------|
| +5 minutes | All health endpoints 200 | Rollback (§6.1) |
| +15 minutes | Auth flow working | Rollback |
| +1 hour | Error rate ≤ baseline | Investigate; rollback if > 5% |
| +4 hours | Core product dashboards functional | Hotfix or rollback |
| +24 hours | `PlatformAuditLog` shows normal activity | Investigate gaps |
| +24 hours | No data integrity issues reported | Root cause analysis |

---

> **Related documents:** `DEPLOYMENT_CHECKLIST.md`, `production-deployment-runbook.md`, `PILOT_OPERATIONAL_HANDBOOK.md`, `backup-restore-procedure.md`, `PILOT_ONCALL_ROSTER.md`
