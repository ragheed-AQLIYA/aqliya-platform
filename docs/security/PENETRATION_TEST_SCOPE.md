# Penetration Test Scope

> **Status:** Planning | **Target Date:** TBD | **Owner:** Security Team | **Version:** v0.1
> **Last Updated:** 2026-07-11

---

## Overview

This document defines the scope, rules of engagement, and methodology for the AQLIYA platform penetration test. The test is designed to validate the security posture of the platform before production deployment and to identify vulnerabilities in authentication, authorization, data isolation, input validation, and infrastructure configuration.

---

## Test Environment

| Element | Details |
|---------|---------|
| **Primary target** | `staging.aqliya.com` — staging environment |
| **Alternative target** | Local Docker Compose deployment (for deeper testing) |
| **Data classification** | Test data only — no real customer, financial, or PII data |
| **Authentication** | Test accounts will be provided (VIEWER, OPERATOR, ADMIN roles) |
| **SSO test account** | SAML test IdP credentials available on request |
| **API keys** | SCIM test API key available on request |
| **Network** | Testing from internet (no VPN required) |
| **Window** | Business hours (Sunday–Thursday, 09:00–18:00 KSA) |

### Environment Architecture

```
Internet
  │
  ▼
WAF / CDN (rate limiting, IP reputation, SQLi protection)
  │
  ▼
Next.js Application Server (Node.js 22)
  │
  ├── PostgreSQL 16 (database — tenant-isolated)
  ├── Redis (session cache, rate limiter — optional)
  └── Storage (local ./uploads or S3-compatible)
```

---

## In Scope

### 1. Web Application (Next.js App Router)

| Area | Details |
|------|---------|
| **Public routes** | `/`, `/platform`, `/industries`, `/proof`, `/governance`, `/about`, `/security` |
| **Public demo** | `/auditos` guided demo |
| **Public API** | `/api/health`, `/api/health/live`, `/api/health/ready`, `/api/pilot-review`, `/api/custom-product-submit` |
| **SCIM API** | `/api/scim/v2/Users`, `/api/scim/v2/Groups` (with API key) |
| **Authenticated API** | All `/api/audit/*`, `/api/decisions/*`, `/api/local-content/*`, `/api/knowledge-mining/*`, `/api/ai/*`, `/api/skills/*`, `/api/agent-memory`, `/api/metrics`, `/api/sales/export` |
| **Platform API** | `/api/platform/*` (enterprise-health, evidence, outbox, events, retention, abac, siem) |
| **WorkflowOS API** | `/api/workflowos/*` (records, documents, export) |
| **Authenticated workspaces** | `/audit/*`, `/decisions/*`, `/local-content/*`, `/office-ai`, `/workflowos/*` |
| **Auth flows** | Login, logout, session management, MFA verification, password reset |
| **File operations** | Evidence upload, evidence download, report download, document download, file export |

### 2. Authentication & Authorization

| Test Area | Priority |
|-----------|----------|
| Session handling and JWT security | Critical |
| RBAC enforcement (VIEWER vs OPERATOR vs ADMIN) | Critical |
| Tenant isolation (cross-organization data access) | Critical |
| MFA verification bypass | High |
| SAML SSO assertion validation | High |
| SCIM API key authentication | High |
| Role escalation attempts | High |
| Download token forgery | High |

### 3. Input Validation & Injection

| Test Area | Priority |
|-----------|----------|
| SQL injection in API parameters | Critical |
| NoSQL/Prisma injection in query parameters | Critical |
| Cross-site scripting (XSS) in form inputs | High |
| Server-side request forgery (SSRF) in webhook/destination fields | High |
| Path traversal in file download routes | High |
| CSV/PDF injection in export endpoints | Medium |
| XML external entity (XXE) injection in SAML XML parsing | High |

### 4. File Upload & Download

| Test Area | Priority |
|-----------|----------|
| Malicious file upload (malware, scripts) | Critical |
| MIME type validation bypass | High |
| File size limit enforcement | Medium |
| Directory traversal in filename | High |
| Unauthorized file access (cross-tenant) | Critical |
| Token-based download security | High |
| Storage provider authorization | High |

### 5. API Security

| Test Area | Priority |
|-----------|----------|
| Rate limiting effectiveness | High |
| API endpoint enumeration | Medium |
| Mass assignment / excessive data exposure | High |
| HTTP method override / unexpected methods | Medium |
| API error message information disclosure | Medium |
| Insecure direct object references (IDOR) | Critical |

### 6. Infrastructure Configuration

| Area | Details |
|------|---------|
| **CSP headers** | Content-Security-Policy strength and bypass potential |
| **Security headers** | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| **WAF rules** | Rate limiting effectiveness, SQLi/XSS rule bypass |
| **Environment variables** | Accidental exposure in error messages or source maps |
| **Node.js runtime** | Known vulnerabilities in runtime version (Node 22) |
| **Build output** | Source map exposure, API routes in client bundles |

### 7. Dependency Scanning

- npm dependency audit (`npm audit`)
- Known vulnerability check for direct and transitive dependencies
- Focus on: Next.js, NextAuth.js, Prisma, React, Tailwind CSS

---

## Out of Scope

| Area | Rationale |
|------|-----------|
| **Social engineering** | Phishing, physical access, tailgating |
| **Physical security** | Data center access, hardware tampering |
| **Denial of service** | Beyond rate limit testing; no DDoS, no resource exhaustion |
| **Third-party SaaS** | AI providers (Anthropic, OpenAI), Resend email, Vercel platform, Notion API |
| **Client-side only** | Pure client-side vulnerabilities without server impact |
| **Browser extensions** | Impact of malicious extensions |
| **Developer workstations** | Local development machines, CI/CD pipeline |
| **Source code repository** | Git history analysis, secret scanning (separate SAST program) |
| **Database direct access** | PostgreSQL is not exposed publicly |

---

## Rules of Engagement

### Authorization

1. Testing is authorized only against the specified test environment
2. No testing against production (`aqliya.com`) without separate authorization
3. The test team must use provided test accounts
4. All findings must be accompanied by a proof of concept

### Timing

1. Testing window: **Sunday–Thursday, 09:00–18:00 KSA**
2. Testing outside these hours requires prior approval from the Security Team
3. Maximum continuous testing session: 8 hours

### Prohibited Actions

| Action | Reason |
|--------|--------|
| Data deletion, modification, or corruption | Destructive — would affect other testers |
| Denial of service attacks | Could impact availability for other users |
| Automated scanning > 100 requests/second | Could trigger WAF blocks |
| Social engineering AQLIYA staff | Out of scope |
| Accessing other tenants' data | Even if vulnerability is found, stop and report |
| Installing malware or backdoors | Unethical and illegal |

### Disclosure

1. **Critical findings:** Report within **24 hours** via security@aqliya.com
2. **High findings:** Report within **48 hours**
3. **Medium/Low findings:** Include in final report
4. AQLIYA Security Team will acknowledge receipt within **4 business hours** for critical/high findings

---

## Testing Methodology

### Phase 1: Reconnaissance

- Map all public and authenticated routes
- Identify authentication mechanisms
- Document API surface area
- Analyze error responses for information disclosure

### Phase 2: Authentication & Session Testing

- Test login and session management
- Attempt session fixation, hijacking, replay
- Test MFA verification bypass
- Test SAML SSO assertion manipulation
- Test token-based download access without valid token

### Phase 3: Authorization & Tenant Isolation

- Test RBAC enforcement (cross-role access)
- Test tenant isolation (cross-organization data access)
- Attempt IDOR on all resource endpoints
- Test download token forgery and replay

### Phase 4: Input Validation & Injection

- SQL injection in all API parameters, query strings, and body fields
- XSS in forms, file names, and rendered content
- SSRF in webhook URLs and destination fields
- Path traversal in file download/document routes
- CSV injection in export endpoints

### Phase 5: File Upload & Download Testing

- Upload files with malicious content (scripts, macros, malware)
- Attempt MIME type and extension bypass
- Test file size limits
- Attempt cross-tenant file access via IDOR
- Test download token security

### Phase 6: API Security Testing

- Parameter tampering and mass assignment
- HTTP method manipulation
- Rate limit bypass attempts
- Mass assignment on POST/PUT endpoints

### Phase 7: Configuration Review

- Review HTTP security headers
- Review CSP configuration
- Review WAF rules and rate limiting
- Review error handling for information disclosure
- Review environment variable exposure

### Phase 8: Reporting

- Comprehensive report with risk-rated findings
- Proof of concept for each finding
- Remediation recommendations with priority
- Retest of fixed findings (within scope)

---

## Success Criteria

| Criterion | Definition |
|-----------|------------|
| **No critical vulnerabilities** | No unauthenticated remote code execution, SQL injection, or privilege escalation |
| **No high-risk information disclosure** | No exposure of secrets, PII, or tenant data |
| **Tenant isolation verified** | No cross-organization data access possible via API or UI |
| **RBAC enforced server-side** | No role escalation via API calls |
| **All findings documented** | Complete report with PoC, risk rating, and remediation steps |
| **Remediation timeline agreed** | Critical: 72 hours, High: 2 weeks, Medium: 30 days, Low: next release |

---

## Test Accounts

| Role | Email | Purpose |
|------|-------|---------|
| SUPER_ADMIN | admin@aqliya.com | Full platform access, user management |
| ADMIN | org-admin@test.aqliya.com | Organization-level administration |
| OPERATOR | operator@test.aqliya.com | Create/edit records, run workflows |
| VIEWER | viewer@test.aqliya.com | Read-only access |

Additional temporary accounts can be provisioned on request.

---

## Tools

The following tools are approved for use during testing:

| Tool | Purpose |
|------|---------|
| Burp Suite Professional | Web application proxy and scanner |
| OWASP ZAP | Automated vulnerability scanning |
| sqlmap | SQL injection detection |
| Postman / curl | Manual API testing |
| jwt_tool / jtool | JWT analysis and manipulation |
| nuclei | Template-based scanning |
| nmap | Network reconnaissance (within scope) |

Any additional tools must be approved by the AQLIYA Security Team before use.

---

## Communication

| Contact | Channel | Purpose |
|---------|---------|---------|
| Security Team | security@aqliya.com | Critical findings, coordination |
| Engineering Team | Via Security Team | Technical questions, reproduction help |
| Incident response | N/A during testing | For production incidents only |

---

## Appendix A: Route Map for Testers

### Public Routes

```
GET  /                          — Platform landing page
GET  /platform                  — Platform overview
GET  /industries                — Industry sectors
GET  /proof                     — Evidence center
GET  /governance                — Trust architecture
GET  /about                     — Company page
GET  /security                  — Enterprise security
GET  /auditos                   — Guided demo (no auth)
GET  /api/health                — Liveness check
GET  /api/health/live           — Kubernetes liveness probe
GET  /api/health/ready          — Readiness check
POST /api/pilot-review          — Pilot evaluation form
POST /api/custom-product-submit — Custom product request
```

### API Routes Requiring Authentication

See [API_REFERENCE.md](../api/API_REFERENCE.md) for the complete route table.

---

## Appendix B: Previous Security Posture

Based on the **2026-06-17 Security Hardening Pass**:

| Area | Status | Notes |
|------|--------|-------|
| CSP hardening | ✅ Complete | `unsafe-eval`/`unsafe-inline` removed; tightened `connect-src` |
| SSO secret encryption | ✅ Complete | AES-256-GCM at rest |
| SAML SSO | ✅ Implemented | `@node-saml/node-saml` with assertion validation |
| Middleware RBAC | ✅ Extended | Covering `/api/decisions/*` and `/api/agent-memory` |
| Rate limiter | ✅ Configured | Memory (single-instance) / Redis (multi-instance) |
| CI hardening | ✅ Complete | Postgres service, `npm audit`, N-1 rollback |
| Node.js 20 → 22 | ✅ Complete | Base image updated |
| Backup restore drill | ✅ Scripted | `scripts/platform/restore-drill.mjs` |

**Remaining for L6 production (infrastructure-dependent):**
- I-01: Run backup restore drill on AWS RDS
- I-02: Verify ECS/RDS/Redis live state
- I-03: Set `RATE_LIMITER=redis` in staging/production
- I-04: Deploy ClamAV daemon, set `SCANNER_PROVIDER=clamav`
- E-01: Schedule external penetration test (this document)
- E-02: SOC2 Type II readiness program
- E-03: ISO 27001 gap assessment

---

## Document Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Security Team Lead | | | |
| CTO / Engineering Lead | | | |
| External Tester Lead | | | |

---

*This document contains sensitive security information. Do not distribute outside authorized personnel.*
