# Security Risk Register

**Maintained by:** Engineering Security
**Created:** 2026-07-18
**Last Review:** 2026-07-18
**Next Review:** 2026-10-16
**Approved by:** Engineering Lead

---

## Purpose

This register tracks accepted security risks identified by the AQLIYA Security Scanner (`engineering/agents/security.mjs`). Each entry documents the risk, its justification for acceptance, mitigations in place, and review schedule.

All findings are classified as **Accepted Risks (AR)** — verified to be safe by design, not false positives, and not true positives requiring remediation.

---

## Risk Classification

| Field | Values |
| --- | --- |
| **Severity** | Critical / High / Medium / Low / Info |
| **Likelihood** | High / Medium / Low |
| **Risk Rating** | Severity × Likelihood (Critical×Low = Medium, etc.) |
| **Mitigation Type** | Preventive / Detective / Compensating |
| **Status** | Active / Closed / Expired |

---

## Active Accepted Risks

### SR-001 — `$queryRaw` Health Check (system-monitor)

| Field | Value |
| --- | --- |
| **Risk ID** | SR-001 |
| **Finding Ref** | F-0006 |
| **Category** | Data Access — Raw SQL |
| **OWASP** | A03: Injection |
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Rating** | Medium × Low = Low |
| **Description** | `prisma.$queryRaw\`SELECT 1\`` used for database connectivity check in `src/lib/platform/monitoring/system-monitor.ts` |
| **File** | `src/lib/platform/monitoring/system-monitor.ts` (line 63) |
| **Reason Accepted** | Parameterized literal query with no user input. `SELECT 1` is a standard database ping pattern. No interpolation, no template variables, no dynamic SQL. The query is identical across all health check implementations. |
| **Owner** | Platform Infrastructure |
| **Mitigation** | Preventive: Parameterized query (no string interpolation). Detective: Error caught and returned as `{ status: "error" }` — no stack trace exposed to client. |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-002 — `$queryRaw` Health Endpoint (platform health)

| Field | Value |
| --- | --- |
| **Risk ID** | SR-002 |
| **Finding Ref** | F-0018 |
| **Category** | Data Access — Raw SQL |
| **OWASP** | A03: Injection |
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Rating** | Medium × Low = Low |
| **Description** | `prisma.$queryRaw\`SELECT 1\`` used for database connectivity check in `src/app/api/platform/health/route.ts` |
| **File** | `src/app/api/platform/health/route.ts` (line 24) |
| **Reason Accepted** | Same parameterized `SELECT 1` pattern as SR-001. No user-controlled input reaches the query. Route returns 200/503 based on DB latency — no sensitive data exposed. |
| **Owner** | Platform Infrastructure |
| **Mitigation** | Preventive: Parameterized query. Detective: HTTP status codes 200/503 only. No auth required (LB health check pattern). Rate-limited at infrastructure level (load balancer). |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-003 — `$queryRaw` Health Endpoint (legacy health)

| Field | Value |
| --- | --- |
| **Risk ID** | SR-003 |
| **Finding Ref** | F-0024 |
| **Category** | Data Access — Raw SQL |
| **OWASP** | A03: Injection |
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Rating** | Medium × Low = Low |
| **Description** | `prisma.$queryRaw\`SELECT 1\`` used for database connectivity check in `src/app/api/health/route.ts` |
| **File** | `src/app/api/health/route.ts` (line 50) |
| **Reason Accepted** | Parameterized `SELECT 1` literal. No user input. Returns structured JSON with `ok` boolean and `latencyMs`. No sensitive data in response. |
| **Owner** | Platform Infrastructure |
| **Mitigation** | Preventive: Parameterized query. Detective: Structured JSON response (no raw error messages to client). |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-004 — `$queryRaw` Readiness Probe

| Field | Value |
| --- | --- |
| **Risk ID** | SR-004 |
| **Finding Ref** | F-0025 |
| **Category** | Data Access — Raw SQL |
| **OWASP** | A03: Injection |
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Rating** | Medium × Low = Low |
| **Description** | `prisma.$queryRaw\`SELECT 1\`` used for readiness probe in `src/app/api/health/ready/route.ts` |
| **File** | `src/app/api/health/ready/route.ts` (line 54) |
| **Reason Accepted** | Parameterized `SELECT 1` literal for Kubernetes-style readiness check. No user input. Same pattern as SR-001 through SR-003. |
| **Owner** | Platform Infrastructure |
| **Mitigation** | Preventive: Parameterized query. Detective: Returns 200/503 based on dependency checks. No auth required (infrastructure probe). |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-005 — `$queryRaw` Admin Health Check

| Field | Value |
| --- | --- |
| **Risk ID** | SR-005 |
| **Finding Ref** | F-0030 |
| **Category** | Data Access — Raw SQL |
| **OWASP** | A03: Injection |
| **Severity** | Medium |
| **Likelihood** | Low |
| **Risk Rating** | Medium × Low = Low |
| **Description** | `prisma.$queryRaw\`SELECT 1\`` used in `src/actions/admin-actions.ts` for admin dashboard database health check |
| **File** | `src/actions/admin-actions.ts` (line 150) |
| **Reason Accepted** | Parameterized `SELECT 1` literal. **Additional protection:** Server action is gated by `assertAdmin()` — requires authenticated admin user. Only callable from admin dashboard. No user input reaches the query. |
| **Owner** | Platform Infrastructure |
| **Mitigation** | Preventive: Parameterized query + `assertAdmin()` RBAC gate. Detective: Admin-only action — not accessible to regular users. Error caught, returns `{ ok: false, latency }` — no stack trace. |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-006 — No Auth on Pilot Review Endpoint

| Field | Value |
| --- | --- |
| **Risk ID** | SR-006 |
| **Finding Ref** | F-0020 |
| **Category** | Public Endpoint — Intentionally Unauthenticated |
| **OWASP** | A01: Broken Access Control |
| **Severity** | High |
| **Likelihood** | Medium |
| **Risk Rating** | High × Medium = High |
| **Description** | `POST /api/pilot-review` has no authentication — accepts pilot evaluation requests from public website visitors |
| **File** | `src/app/api/pilot-review/route.ts` |
| **Reason Accepted** | This is an intentionally public form endpoint. Authentication would prevent the core use case (unauthenticated visitors requesting pilot evaluations). The endpoint is: (1) Rate-limited to 8 requests/IP/minute, (2) Body size capped at 50KB, (3) Input validated with field-length checks and email regex, (4) No database mutations — forwards to optional webhook only, (5) Returns generic success/failure — no internal state exposed. |
| **Owner** | Product — Platform Growth |
| **Mitigation** | Preventive: Rate limiting (8 req/IP/min), body size cap (50KB), field validation (max 2000 chars), email format check, JSON parse guard. Detective: Structured error responses (no stack traces). Compensating: Webhook is optional and fails silently — no data persisted to database from this endpoint. |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-007 — No Auth on Custom Product Request Form

| Field | Value |
| --- | --- |
| **Risk ID** | SR-007 |
| **Finding Ref** | F-0026 |
| **Category** | Public Endpoint — Intentionally Unauthenticated |
| **OWASP** | A01: Broken Access Control |
| **Severity** | High |
| **Likelihood** | Medium |
| **Risk Rating** | High × Medium = High |
| **Description** | `POST /api/custom-product-submit` has no authentication — accepts custom system design requests from public website |
| **File** | `src/app/api/custom-product-submit/route.ts` |
| **Reason Accepted** | Public contact/inquiry form. Authentication would prevent the core use case. The endpoint is: (1) Rate-limited to 6 requests/IP/minute, (2) Full Zod schema validation on all fields (required fields, email format), (3) HTML output in email body uses `escapeHtml()` on all interpolated values (XSS prevention), (4) No database mutations — sends email via Resend API (optional), (5) Resend API key from environment variable only. |
| **Owner** | Product — Platform Growth |
| **Mitigation** | Preventive: Rate limiting (6 req/IP/min), Zod schema validation, `escapeHtml()` on all user input in email output, Resend API key from env only. Detective: Console logging in dev only (`safeDevLog` pattern absent — uses `console.log` gated by `NODE_ENV`). Compensating: No database writes. Email delivery is optional (fails silently if `RESEND_API_KEY` not set). |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-008 — No Auth on SAML SP Metadata Endpoint

| Field | Value |
| --- | --- |
| **Risk ID** | SR-008 |
| **Finding Ref** | F-0028 |
| **Category** | Public Endpoint — SAML Protocol Requirement |
| **OWASP** | A07: Identification and Authentication Failures |
| **Severity** | High |
| **Likelihood** | Low |
| **Risk Rating** | High × Low = Medium |
| **Description** | `GET /api/auth/saml/[providerId]/metadata` has no authentication — returns SAML Service Provider metadata XML |
| **File** | `src/app/api/auth/saml/[providerId]/metadata/route.ts` |
| **Reason Accepted** | **SAML protocol requirement.** The IdP administrator needs to fetch the SP metadata XML to register AQLIYA as a trusted Service Provider. This is standard SAML 2.0 flow — the metadata endpoint must be publicly accessible for IdP-SP trust establishment. The endpoint: (1) Only serves metadata for enabled SAML providers, (2) Returns 404 for unknown/disabled providers (no information leakage), (3) Returns XML Content-Type header (not JSON), (4) Metadata XML contains only SP configuration (entity ID, ACS URL, certificate) — no secrets. |
| **Owner** | Platform — Authentication |
| **Mitigation** | Preventive: Provider must exist and be enabled (`enabled: true`). Returns 404 for unknown providers (prevents enumeration). Detective: Provider lookup logged via Prisma query (database audit trail). Compensating: SP metadata XML is inherently public in SAML 2.0 — it contains only the SP's own configuration, not secrets. |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

### SR-009 — No Auth on SAML SSO Initiation Endpoint

| Field | Value |
| --- | --- |
| **Risk ID** | SR-009 |
| **Finding Ref** | F-0029 |
| **Category** | Public Endpoint — SAML Protocol Requirement |
| **OWASP** | A07: Identification and Authentication Failures |
| **Severity** | High |
| **Likelihood** | Low |
| **Risk Rating** | High × Low = Medium |
| **Description** | `GET /api/auth/saml/[providerId]/initiate` has no authentication — redirects user to IdP for SAML SSO |
| **File** | `src/app/api/auth/saml/[providerId]/initiate/route.ts` |
| **Reason Accepted** | **SSO initiation entry point — user is not yet authenticated.** This is the standard SAML SSO flow: user clicks "Sign in with SSO" → browser hits this endpoint → endpoint redirects to IdP. Authentication cannot be required because this IS the authentication initiation. The endpoint: (1) Validates `callbackUrl` server-side (only relative paths allowed, blocks `//` protocol-relative URLs), (2) Returns uniform redirect for both missing providers and invalid configs (prevents provider ID enumeration), (3) Audit-logs all initiation attempts (success, failure, not_found) via `writePlatformAuditLog`, (4) Provider must exist and be enabled. |
| **Owner** | Platform — Authentication |
| **Mitigation** | Preventive: `callbackUrl` validation (relative paths only, blocks `//` prefix). Provider must exist and be enabled. Uniform error redirects (prevents enumeration). Detective: All initiation attempts audit-logged with `sso.saml.initiate`, `sso.saml.initiate.failed`, `sso.saml.initiate.not_found`. Compensating: This is the pre-authentication entry point — the IdP performs the actual authentication. Post-login, the session is established by the callback handler which validates the SAML assertion. |
| **Acceptance Date** | 2026-07-18 |
| **Review Date** | 2026-10-16 |
| **Expiry** | 2027-01-18 (6 months) |

---

## Review Process

1. **Quarterly review:** Every 90 days, review all active risks against current code and threat landscape.
2. **Re-justification:** Risks older than 6 months require explicit re-justification or closure.
3. **Closure:** Expired risks move to "Closed Risks" section with closure reason.
4. **New risks:** Require engineering lead approval before acceptance.
5. **Emergency review:** Triggered by security incident, vulnerability disclosure, or architectural change.

### Review Checklist

For each risk at review time:
- [ ] Is the file still in the codebase?
- [ ] Has the mitigation changed?
- [ ] Is the acceptance reason still valid?
- [ ] Does the risk rating need updating?
- [ ] Should the risk be closed?

---

## Closed Risks

| Risk ID | Closed Date | Reason |
| --- | --- | --- |
| *(none yet)* | — | — |

---

## Risk Summary Statistics

| Metric | Value |
| --- | --- |
| **Total Active Risks** | 9 |
| **Critical** | 0 |
| **High** | 4 (SR-006, SR-007, SR-008, SR-009) |
| **Medium** | 5 (SR-001, SR-002, SR-003, SR-004, SR-005) |
| **Low** | 0 |
| **Info** | 0 |
| **Next Review** | 2026-10-16 |

### Breakdown by Category

| Category | Count | Risk IDs |
| --- | --- | --- |
| Data Access — Raw SQL | 5 | SR-001, SR-002, SR-003, SR-004, SR-005 |
| Public Endpoint — Intentionally Unauthenticated | 2 | SR-006, SR-007 |
| Public Endpoint — SAML Protocol Requirement | 2 | SR-008, SR-009 |

### Breakdown by Mitigation Type

| Mitigation Type | Primary (sole defense) | Compensating (secondary) |
| --- | --- | --- |
| Parameterized Query | 5 | 0 |
| Rate Limiting | 2 | 0 |
| Zod Validation | 1 | 0 |
| RBAC Gate | 1 | 0 |
| Audit Logging | 0 | 2 |
| Input Sanitization | 1 | 1 |
| Uniform Error Responses | 0 | 2 |

---

_AQLIYA Engineering Security · Risk Register_
