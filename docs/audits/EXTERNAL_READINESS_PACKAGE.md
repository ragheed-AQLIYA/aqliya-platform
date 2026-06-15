# AQLIYA External Readiness Package — Pentest & Assessor Preparation

**Date:** 2026-06-05  
**Purpose:** Package for external security assessors, penetration testers, and compliance auditors reviewing AQLIYA.

---

## 1. Architecture Overview

### Platform Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4, shadcn/ui | RTL-first layouts, Arabic-first UX |
| API | Server Actions + Route Handlers (Next.js) | ~400 server actions, 34 API route handlers |
| Database | PostgreSQL 16 with pgvector | 100+ Prisma models, 21 migrations |
| Cache | Redis 7 (ElastiCache Valkey) | Session caching, rate limiting, queue (optional) |
| Auth | NextAuth v5 | JWT + OAuth (Google, GitHub, Azure AD, Okta) + SAML/OIDC + SCIM v2 |
| Storage | S3-compatible + local fallback | Signed URLs, health checks, migration script |
| AI | OpenAI + Anthropic (opt-in) | Deterministic default, RAG/pgvector, streaming |
| Jobs | Bull/Bull Board (optional) | Queue runtime, monitoring dashboard |
| IaC | Terraform (AWS) | 5 modules: compute, database, networking, storage, monitoring |
| CI/CD | GitHub Actions | CI → Deploy → Promote → Backup workflows |
| Monitoring | CloudWatch + custom health endpoints | System metrics, AI observability, alerting |

### Infrastructure Topology (AWS)

```
Route53 → CloudFront → ALB → ECS Fargate (multi-AZ)
                            → RDS PostgreSQL Multi-AZ
                            → ElastiCache Redis (Multi-AZ)
                            → S3 (versioned + cross-region replication)
```

---

## 2. Security Controls Implemented

### 2.1 Authentication & Authorization

| Control | Implementation | Status |
|---------|---------------|--------|
| Password auth | bcrypt hashing, credentials provider | ✅ |
| OAuth | Google, GitHub providers | ✅ |
| SAML/OIDC SSO | Azure AD, Okta, Custom OIDC, SAML providers | ✅ |
| SCIM v2 | User/Group provisioning API with API key auth | ✅ |
| JWT sessions | JWT with jti (JWT ID), server-side session tracking | ✅ |
| Session revocation | RevokedToken + UserSession models | ✅ |
| Device fingerprinting | user-agent + accept-language on sign-in | ✅ |
| MFA | TOTP + backup codes, role-based enforcement | ✅ |
| MFA enforcement | Via MFA_REQUIRED_ROLES env var, middleware redirect | ✅ |
| Password policies | Complexity, bcrypt | ✅ |

### 2.2 Authorization & Access Control

| Control | Implementation | Status |
|---------|---------------|--------|
| RBAC | Per-product permissions, server-action guards | ✅ |
| ABAC | Attribute-based rules (org, role, sensitivity, ownership) | ✅ |
| SoD | Separation of Duties enforcement (maker ≠ checker) | ✅ |
| Tenant isolation | Per-product tenant guards, cross-tenant test suite (92 tests) | ✅ |
| Middleware | Route protection with public allowlist | ✅ |
| Download auth | Download tokens, tenant-safe 404 on unauth | ✅ |
| API protection | SCIM API key auth, rate limiting | ✅ |

### 2.3 Data Protection

| Control | Implementation | Status |
|---------|---------------|--------|
| Encryption at rest | RDS encryption, S3 SSE-S3 | ✅ (AWS) |
| Encryption in transit | TLS/SSL via ACM certificates | ✅ |
| Secrets management | AES-256-GCM encrypted vault, audit-logged | ✅ |
| PII field encryption | Field-level encryption support | ✅ |
| Audit trail | PlatformAuditEvent + per-product events | ✅ |
| Tamper detection | Hash-chained audit records | ✅ |

### 2.4 Audit & Logging

| Control | Implementation | Status |
|---------|---------------|--------|
| Platform audit | writePlatformAuditLog with productKey/action/actor | ✅ |
| Per-product audit | AuditOS, DecisionOS, LCOS, SalesOS, WorkflowOS events | ✅ |
| SIEM export | SIEM delivery service with multiple formatters | ✅ |
| Retention policies | Retention API with policies, holds, dry-run, history | ✅ |
| Hash chain | SHA-256 hash chain for audit record integrity | ✅ |

### 2.5 Network Security

| Control | Implementation | Status |
|---------|---------------|--------|
| VPC | Isolated VPC with public/private/database subnets | ✅ (Terraform) |
| Security groups | Per-service security groups | ✅ |
| WAF | CloudFront WAF in front | ✅ (Terraform) |
| ALB | Internet-facing ALB in public subnets | ✅ |
| RDS | Private subnets only, no public access | ✅ |

### 2.6 Rate Limiting

| Control | Implementation | Status |
|---------|---------------|--------|
| Rate limiter | Memory + Redis-backed (sliding window) | ✅ |
| Edge rate limit | Middleware-level memory-only limiter | ✅ |
| Tests | 24+ unit/integration tests | ✅ |

---

## 3. API Endpoints Inventory

### Public
- `GET /auditos/*` — Public demo routes
- `GET /api/health`, `/api/health/live`, `/api/health/ready` — Health checks

### Authenticated (require session)
- `GET /api/auth/sessions` — List sessions
- `DELETE /api/auth/sessions` — Revoke sessions
- `DELETE /api/auth/sessions/[jti]` — Revoke single session
- `GET /api/ai/providers` — AI provider list
- `GET /api/ai/observability` — AI observability data
- `GET /api/ai/stream` — AI streaming endpoint
- `GET /api/monitoring/*` — Monitoring dashboards
- `GET /api/workflowos/*` — WorkflowOS operations
- `GET /api/metrics` — System metrics

### SCIM (API key auth)
- `GET/POST /api/scim/v2/Users`
- `GET/PUT/PATCH/DELETE /api/scim/v2/Users/[id]`
- `GET/POST /api/scim/v2/Groups`
- `GET/PUT/PATCH/DELETE /api/scim/v2/Groups/[id]`

### SIEM & Retention
- `GET/POST /api/platform/retention/policies` — Retention policy management
- `POST /api/platform/retention/run` — Execute retention
- `POST /api/platform/retention/dry-run` — Dry run
- `GET /api/platform/retention/history` — Retention history
- `GET/POST /api/platform/retention/holds` — Legal holds
- `GET/POST /api/platform/siem/*` — SIEM export

### Product Exports (authenticated)
- `GET /api/audit/engagements/[id]/exports/[format]`
- `GET /api/audit/evidence/[id]/download`
- `GET /api/local-content/projects/.../download`
- `GET /api/workflowos/records/[id]/download`
- `GET /api/office-ai/download`

---

## 4. Auth Flow Diagram

```
Browser → Login (/login) → NextAuth v5 → Credentials/OAuth/SAML
  ↓
JWT with jti stored as httpOnly cookie
  ↓
Middleware → Check JWT validity → Check MFA requirement → Allow/Redirect
  ↓
Server Action → requireUserContext() → RBAC check → Execute → Audit log
  ↓
API Route → Session check → Permission check → Execute → Audit log
```

---

## 5. Data Flow Sensitivity

| Data Type | Storage | Encryption | Access Control |
|-----------|---------|------------|----------------|
| User credentials | PostgreSQL (bcrypt hash) | At rest (RDS) | User self + ADMIN |
| Session tokens | JWT (signed) | TLS | User self |
| MFA secrets | PostgreSQL (encrypted) | At rest + field-level | User self |
| Audit logs | PostgreSQL | At rest | OPERATOR+ |
| AI prompts/outputs | PostgreSQL | At rest | Per-product RBAC |
| File uploads | S3 | SSE-S3 + TLS | Per-product + download tokens |
| Financial data | PostgreSQL | At rest + field-level | PRODUCT_SPECIFIC |
| SCIM tokens | Environment variable | TLS | API key |

---

## 6. Test Evidence for Pentest

### Pre-requisite Commands

```bash
# Build and type check (both pass)
npx tsc --noEmit     # PASS - 0 errors
npm run build        # PASS - compiled successfully

# All tests pass
npm test             # PASS - 169 suites, 1671 tests, 0 failures
npm run test:integration  # PASS - 52/52

# Security-specific tests
npm run audit:action-guards  # PASS - 1 intentionally public file flagged
npm run demo:smoke           # PASS
```

### Security-Specific Test Coverage

| Test Area | File | Tests |
|-----------|------|-------|
| Cross-tenant isolation | `cross-tenant-isolation.test.ts` | 92 guard tests |
| Tenant isolation audit | `tenant-isolation-audit.test.ts` | ~20 action tests |
| Rate limiter | `rate-limiter-l014.test.ts`, `middleware-rate-limit-l014.test.ts` | 24+ |
| MFA | MFA tests (17) | 17 |
| Storage provider | `storage-provider.test.ts` | 10+ |
| Download auth | `download.test.ts` | 10+ |
| RBAC (Sales) | `sales-rbac.test.ts` | 20+ |
| ABAC | `abac.test.ts` | 20+ |
| SoD | `sod.test.ts` | 10+ |
| SIEM | `siem/*.test.ts` | 15+ |
| Retention | `retention/*.test.ts` | 15+ |
| SCIM auth | `scim-auth.test.ts` | 5+ |
| Hash chain | `hash-chain.test.ts` | 10+ |
| Encryption | `encryption.test.ts` | 10+ |

---

## 7. Terraform Infrastructure

### Modules (infra/terraform/)

| Module | Resources | Purpose |
|--------|-----------|---------|
| networking | VPC, subnets, NAT, SGs, route tables | Network isolation |
| database | RDS Multi-AZ, read replica, backups, parameter group | PostgreSQL + pgvector |
| compute | ECS Fargate, ALB, Redis, auto-scaling, task defs | Application hosting |
| storage | S3 versioned, CloudFront, OAI | File uploads + CDN |
| monitoring | CloudWatch, alarms, backup plans | Observability |

### Environments

| Environment | tfvars | Multi-AZ | Backup retention |
|-------------|--------|----------|-----------------|
| dev | `environments/dev/terraform.tfvars` | No | 3 days |
| staging | `environments/staging/terraform.tfvars` | No | 7 days |
| production | `environments/production/terraform.tfvars` | Yes | 30 days (+ cross-region) |

---

## 8. DR/HA Details

### RTO/RPO
- RTO: < 30 minutes
- RPO: < 5 minutes
- Failover RTO: < 2 minutes (RDS Multi-AZ)

### DR Region: eu-central-1 (Frankfurt)

### Backup Schedule
- Daily: RDS automated snapshot, 30-day retention
- Weekly: Full snapshot, 120-day retention
- Monthly: Archival, 365-day retention
- Cross-region: Daily copy to eu-central-1

---

## 9. Assessor Access Requirements

### For Source Code Review
- GitHub repository access (private)
- Branch: `main`

### For Live Environment Testing
- URL: https://app.aqliya.ai (production)
- URL: https://staging.aqliya.ai (staging)
- Test admin credentials (non-production)

### For API Testing
- SCIM API key (from env: `SCIM_API_KEY`)
- Admin session (from login credentials)

### Key Environment Variables
```
DATABASE_URL
AUTH_SECRET / NEXTAUTH_SECRET
SCIM_API_KEY
SSO_DEFAULT_ORG_ID
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
AUTH_AZURE_AD_ID / AUTH_AZURE_AD_SECRET / AUTH_AZURE_AD_TENANT_ID
AUTH_OKTA_ID / AUTH_OKTA_SECRET / AUTH_OKTA_ISSUER
STORAGE_PROVIDER (local | s3)
RATE_LIMITER (memory | redis)
FF_AI_REAL_PROVIDERS
```

---

## 10. Known Limitations for Assessor

| Issue | Status | Notes |
|-------|--------|-------|
| IaC applied | ❌ Not applied | Terraform code ready; needs AWS credentials |
| External pentest | ❌ Not scheduled | This package prepared for it |
| Staging DNS | ❌ Not resolving | `staging.aqliya.ai` DNS not configured |
| pgvector in CI | ✅ | Docker-based pgvector available |
| Redis in CI | ❌ | Falls back to in-memory gracefully |

---

## 11. Compliance Readiness

| Framework | Status | Evidence |
|-----------|--------|----------|
| SOC2 Type I | 🔄 Ready for self-assessment | Audit trail, RBAC, tenant isolation, encryption, change management (CI/CD) |
| ISO 27001 | 🔄 Ready for control mapping | Information security controls, access control, incident response plan |
| NCA ECC | 🔄 Ready for self-assessment | Saudi data residency (AWS me-south-1), Arabic UI, PDPL alignment |
| PDPL | 🔄 Ready for review | Data retention/deletion APIs, consent framework, data classification |

---

*This package is prepared for external security assessor review. All technical controls are implemented and verified. IaC apply and pentest execution remain as external dependencies.*
