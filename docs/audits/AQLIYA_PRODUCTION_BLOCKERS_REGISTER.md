# AQLIYA Production Blockers Register

> **Date:** 2026-07-04  
> **Audit Phase:** G — Verdict  
> **Total Blockers:** 8  
> **By Severity:** Critical 1 | High 3 | Medium 2 | Low 2

---

## How to Use This Register

- **Blocker =** documented gap between current state and unrestricted production readiness
- Each blocker includes: severity, scope, ownership, evidence, and remediation step
- Blockers are ordered by severity, then by launch impact
- Close blockers before full unrestricted production launch
- Controlled launch (with conditions) is acceptable while these are open

---

## B-01: No External Penetration Test (CRITICAL)

| Field | Value |
|-------|-------|
| **Severity** | 🛑 **CRITICAL** |
| **Scope** | Platform-wide (all products) |
| **Component** | Security infrastructure |
| **Owner** | Security/Infrastructure (vendor-gated) |
| **Status** | ❌ OPEN — not started |

### Description

No external penetration test has been performed on the AQLIYA platform. While internal security posture is strong (CSP, HSTS, RBAC, tenant isolation, rate limiting, audit trail), the absence of an independent, adversarial security assessment is a material gap for any production launch.

### Evidence

- No penetration test report found in `docs/`, `reports/`, or `monitoring/`
- No penetration test findings or remediation tracking found
- Repository contains no pentest engagement artifacts
- `docs/audits/` — no existing pentest documentation
- `docs/operations/production-deployment-runbook.md` v1.5 does not mention pentest completion

### Risk

- Unknown vulnerabilities could be exploited in production
- Insurance/regulatory requirements may mandate pentest
- SOC2/ISO certification processes require pentest as precursor
- Customer security questionnaires will ask for pentest evidence

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Contract external pentest vendor | 1-2 weeks | Security/Infra |
| 2 | Provide scope: AuditOS, LocalContentOS, auth, API, middleware | 1 day | Security/Infra |
| 3 | Exec pentest (black-box + grey-box) | 1-2 weeks | Vendor |
| 4 | Receive report, triage findings | 3 days | Security/Infra |
| 5 | Fix critical/high findings | Variable | Engineering |
| 6 | Document and archive report in `docs/audits/` | 1 day | Security/Infra |

### Launch Impact

- **Controlled launch:** Acceptable with condition (pentest must be in progress within Week 1)
- **Full unrestricted launch:** Must be completed

---

## B-02: ClamAV File Scanner Not Deployed (HIGH)

| Field | Value |
|-------|-------|
| **Severity** | ⚠️ **HIGH** |
| **Scope** | Platform-wide (all products with file upload) |
| **Component** | File storage / Security middleware |
| **Owner** | Infrastructure |
| **Status** | ❌ OPEN — software exists, daemon not deployed |

### Description

ClamAV antivirus daemon is not deployed in the target infrastructure. The scanning client exists and is wired into the middleware (`src/middleware-security.ts`), but the actual ClamAV service is not running. When `SCANNER_PROVIDER` is set to `clamav`, the file scan will fail.

### Evidence

- `src/lib/files/scanner.ts` — ClamAV client code exists and implements `scanBuffer()`
- `src/middleware-security.ts` — calls `scanBuffer()` on file uploads
- No ClamAV daemon running on current infra (confirmed by absence of ClamAV in Docker Compose and Terraform configs)
- `SCANNER_PROVIDER=clamav` not set in any environment (defaults to `none` or `local`)
- `docs/operations/production-deployment-runbook.md` v1.3 mentions ClamAV as "not yet deployed"

### Risk

- Files uploaded by users/clients are not scanned for malware
- Malicious document uploads could compromise other users, storage, or infrastructure
- Industry best practice violation for any platform handling file uploads (AuditOS evidence vault, LocalContentOS documents)

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Deploy ClamAV daemon in target infra (Docker: `clamav/clamav:latest`) | 1 day | Infrastructure |
| 2 | Set `SCANNER_PROVIDER=clamav` in environment | 30 min | DevOps |
| 3 | Test file upload with EICAR test file | 30 min | Engineering |
| 4 | Document ClamAV deployment in runbook | 1 hour | Docs |

### Launch Impact

- **Controlled launch:** Acceptable with condition (ClamAV must be deployed by end of Week 1)
- **Full unrestricted launch:** Must be deployed

---

## B-03: Rate Limiter — Memory Mode Default (HIGH)

| Field | Value |
|-------|-------|
| **Severity** | ⚠️ **HIGH** |
| **Scope** | Platform-wide |
| **Component** | Rate limiter / middleware |
| **Owner** | Infrastructure |
| **Status** | ❌ OPEN — configuration change needed |

### Description

The rate limiter defaults to in-memory mode (`RATE_LIMITER=memory`). This means each application instance maintains its own rate-limiter state. In a multi-instance deployment (ECS with 2+ tasks), rate limits are per-instance, not global. A single aggressive client hitting all instances can achieve 2-3x the intended rate limit before being throttled.

Redis-based rate limiting is implemented but not activated.

### Evidence

- `src/middleware-rate-limit.ts` — memory store default
- `src/lib/rate-limit/` — Redis adapter exists via ioredis
- `.env.example` — `RATE_LIMITER=memory` default with comment about multi-instance
- Terraform `infra/terraform/` — ElastiCache Redis module exists but not wired to rate limiter env var

### Risk

- Rate limiting is ineffective across multiple app instances
- Brute-force login attempts, API abuse, DDoS resistance are weaker than intended
- Compliance requirement for rate limiting (SOC2, security controls) is partially met

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Set `RATE_LIMITER=redis` in staging/production ECS task definition | 30 min | Infrastructure |
| 2 | Verify Redis ElastiCache is provisioned in Terraform `apply` | 1 day | Infrastructure |
| 3 | Test rate limiting behavior with Redis backend | 1 hour | Infrastructure |

### Launch Impact

- **Controlled launch:** Acceptable if single-instance deployment
- **Full unrestricted launch:** Must be Redis-backed

---

## B-04: Terraform IaC Never Applied to Live Staging (HIGH)

| Field | Value |
|-------|-------|
| **Severity** | ⚠️ **HIGH** |
| **Scope** | Infrastructure (deployment) |
| **Component** | Terraform configuration |
| **Owner** | Infrastructure |
| **Status** | ❌ OPEN — code complete, no apply |

### Description

The Terraform infrastructure-as-code configuration (`infra/terraform/`) is comprehensive and well-structured but has never been applied against a live AWS staging or production environment. It exists as code-only. No `terraform apply` has been run, no resources have been provisioned, and the configuration has not been validated against real AWS service APIs.

### Evidence

- `infra/terraform/` — VPC, RDS, ECS, ElastiCache, monitoring, storage modules — all present and syntactically valid
- No `terraform.tfstate` or `terraform.tfstate.backup` found anywhere in the repository
- No `.terraform/` directory in the repository (excluded by `.gitignore`)
- No evidence of `terraform apply` in CI/CD workflows
- `docs/operations/production-deployment-runbook.md` describes manual deployment steps via AWS Console, not terraform apply

### Risk

- Terraform configuration may have drift from actual AWS service API changes
- IAM permissions, resource limits, region-specific features not validated
- First `terraform apply` may reveal configuration errors requiring fixes
- No infrastructure change management pipeline established

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Create staging AWS account/environment | 1-2 weeks | Infra/CloudOps |
| 2 | Run `terraform plan` against staging | 1 day | Infrastructure |
| 3 | Fix any plan errors | variable | Infrastructure |
| 4 | Run `terraform apply` for staging infrastructure | 1-2 hours | Infrastructure |
| 5 | Verify all resources provisioned correctly | 1 day | Infrastructure |
| 6 | Document Terraform apply workflow in runbook | 2 hours | Infrastructure |

### Launch Impact

- **Controlled launch:** Acceptable (manual Docker deployment on EC2 is viable interim)
- **Full unrestricted launch:** Must have Terraform-managed infrastructure validated

---

## B-05: 21 Skipped Tests (MEDIUM)

| Field | Value |
|-------|-------|
| **Severity** | 📋 **MEDIUM** |
| **Scope** | Platform-wide (multiple test suites) |
| **Component** | Test infrastructure |
| **Owner** | Engineering |
| **Status** | 🟡 OPEN — documented, pre-existing |

### Description

21 tests across the test suite are configured to skip (`it.skip` or `test.skip`). These are pre-existing and documented. While they do not affect the overall pass rate (4,092 of 4,113 pass), they represent untested code paths that may contain defects.

### Evidence

- `npm test` output: 4092 passed, 21 skipped, 0 failed
- Skipped tests span multiple test files and product areas
- No single test file has more than 2-3 skipped tests
- No `test.skip` or `it.skip` call without a documented reason (in most cases)

### Risk

- The 21 skipped tests cover edge cases that may have bugs
- Test coverage statistics are overstated
- CI/CD pass/fail signal is weakened (skipped tests may mask real issues)

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Audit skipped tests — determine if they should be fixed, removed, or remain skipped | 1 day | Engineering |
| 2 | If fixable: fix the underlying issue and unskip | Variable | Engineering |
| 3 | If intentionally skipped: add explicit comment in test code | 30 min | Engineering |
| 4 | Update test documentation with rationale | 1 hour | Engineering |

### Launch Impact

- **Controlled launch:** Acceptable
- **Full unrestricted launch:** Acceptable but should be investigated

---

## B-06: 4 TypeScript Errors in Marketing Pages (MEDIUM)

| Field | Value |
|-------|-------|
| **Severity** | 📋 **MEDIUM** |
| **Scope** | `src/app/(marketing)/page.tsx`, `src/app/en/page.tsx` |
| **Component** | Marketing pages |
| **Owner** | Engineering |
| **Status** | 🟡 OPEN — intermittent, cache-dependent |

### Description

4 TypeScript errors appear in marketing pages related to readonly-type incompatibility. These errors are intermittent — they do not appear on every build run (cache-dependent). When they appear, they involve `ProblemData.tools` readonly type mismatch with array mutations.

### Evidence

- Errors appear in `src/app/(marketing)/page.tsx` and `src/app/en/page.tsx`
- Error pattern: readonly `ProblemData.tools` cannot be assigned to mutable variable
- Errors disappear after build cache regeneration (full `rm -rf .next` + rebuild)
- Observed on initial audit run, resolved after cache clear, reappeared on fresh TypeScript check without build

### Risk

- Marketing page rendering may fail intermittently
- TypeScript strict mode violation reduces confidence in type safety
- Cache-dependent behavior suggests underlying type definition mismatch, not a stale cache

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Inspect `ProblemData.tools` type definition | 1 hour | Engineering |
| 2 | Fix the type to use `readonly` arrays consistently or remove readonly | 30 min | Engineering |
| 3 | Run `npx tsc --noEmit` to verify fix | 2 min | Engineering |
| 4 | Run fresh build to verify resolution | 5 min | Engineering |

### Launch Impact

- **Controlled launch:** Acceptable (cosmetic issue on marketing pages, not product routes)
- **Full unrestricted launch:** Should be fixed

---

## B-07: Launch Documentation Package Not Complete (LOW)

| Field | Value |
|-------|-------|
| **Severity** | ℹ️ **LOW** |
| **Scope** | Documentation / Operations |
| **Component** | Release documentation |
| **Owner** | Engineering / Docs |
| **Status** | ❌ OPEN — audit itself is filling this gap |

### Description

While documentation is comprehensive, there is no single "launch readiness checklist" or "launch manual" document that operators and support teams can use during the launch window. The runbook covers ongoing operations but not launch-day procedures.

### Evidence

- `docs/operations/production-deployment-runbook.md` — focuses on ongoing operations, not launch-day
- No `LAUNCH_CHECKLIST.md` or `launch-day.md` document found
- No incident response plan specific to launch-related issues found
- No escalation tree / on-call rotation documented

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Create Launch Day Runbook — 5 pages: pre-launch checklist, launch sequence, monitoring, incident response, rollback | 1 day | Engineering/Docs |
| 2 | Create rollback plan for each launch component | 1 day | Engineering |
| 3 | Define on-call rotation and escalation tree | 1 day | Operations |

### Launch Impact

- **Controlled launch:** Acceptable
- **Full unrestricted launch:** Should be completed

---

## B-08: Marketing Readme/Landing README Not Updated for v0.1 Launch (LOW)

| Field | Value |
|-------|-------|
| **Severity** | ℹ️ **LOW** |
| **Scope** | Documentation / Marketing |
| **Component** | README / GitHub presence |
| **Owner** | Engineering / Marketing |
| **Status** | ❌ OPEN |

### Description

The main `README.md` describes the project but does not contain explicit v0.1 launch positioning, product status references, or guidance for production users. While the public website is accurate, the GitHub README could mislead someone evaluating the project from the repository.

### Evidence

- `README.md` does not mention v0.1 launch status
- `README.md` does not reference product status matrix
- `README.md` does not contain "production launch" or "production-ready" language
- README reads as a development project, not a launched production platform

### Remediation

| Step | Action | Effort | Owner |
|------|--------|--------|-------|
| 1 | Update README with v0.1 launch status badge | 30 min | Engineering |
| 2 | Add "Production Launch: v0.1 — CONDITIONALLY READY" banner | 15 min | Engineering |
| 3 | Link to product status matrix and known limitations | 15 min | Engineering |

### Launch Impact

- **Controlled launch:** Acceptable
- **Full unrestricted launch:** Should be completed before public announcement

---

## Summary Table

| ID | Title | Severity | Scope | Status | Launch Impact |
|----|-------|----------|-------|--------|---------------|
| B-01 | No External Penetration Test | 🛑 CRITICAL | Platform-wide | ❌ OPEN | Controlled launch OK with condition |
| B-02 | ClamAV Not Deployed | ⚠️ HIGH | Platform-wide | ❌ OPEN | Deploy by Week 1 |
| B-03 | Rate Limiter Memory Default | ⚠️ HIGH | Platform-wide | ❌ OPEN | Config change |
| B-04 | Terraform Not Applied | ⚠️ HIGH | Infrastructure | ❌ OPEN | Acceptable interim |
| B-05 | 21 Skipped Tests | 📋 MEDIUM | All products | 🟡 OPEN | Acceptable |
| B-06 | TS Marketing Page Errors | 📋 MEDIUM | Marketing | 🟡 OPEN | Fix by Week 2 |
| B-07 | Launch Doc Package Incomplete | ℹ️ LOW | Operations | ❌ OPEN | Acceptable |
| B-08 | README Not Updated | ℹ️ LOW | Repository | ❌ OPEN | Before public announcement |

**Total: 1 Critical | 3 High | 2 Medium | 2 Low = 8 Blockers**
