# Security Audit — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Method:** Static code review + subagent exploration + smoke test observations  
**Overall Score: 58/100**

---

## Score Breakdown

| Domain | Score | Weight |
|--------|------:|--------|
| Authentication | 65 | 20% |
| Authorization/RBAC | 45 | 20% |
| Tenant isolation | 75 | 15% |
| Session/JWT | 60 | 10% |
| MFA | 50 | 10% |
| Input/upload security | 55 | 10% |
| Secrets management | 80 | 10% |
| Dependency/deployment | 55 | 5% |

---

## Critical Findings

| ID | Finding | Severity | Impact | Evidence | Recommendation | Effort |
|----|---------|----------|--------|----------|----------------|--------|
| SEC-01 | `/api/test-token` exposes JWT | **Critical** | Session compromise | `src/app/api/test-token/route.ts` | Delete or dev-only gate | 15m |
| SEC-02 | `CoreAccessControl` always grants | **Critical** | Permission bypass | `src/core/access/access-control.ts` | Implement real matrix or remove | 2-5d |
| SEC-03 | Custom login CSRF bypass | **High** | Account takeover vector | `custom-login/route.ts` | Fix CSRF | 4-8h |
| SEC-04 | MFA JWT fields not set at login | **High** | MFA gate ineffective | `auth-config.ts`, middleware | Load mfaEnabled from DB | 2-4h |
| SEC-05 | File virus scanner pass-through | **High** | Malware upload | `file-scanner.ts` | Integrate ClamAV or cloud scanner | 1-2w |
| SEC-06 | DB SSO providers not wired to login | **Medium** | False enterprise SSO claim | `sso-providers.ts` not in auth-config | Wire or document env-only | 1-2w |
| SEC-07 | SSO admin CRUD without ADMIN check | **Medium** | Privilege escalation | `sso-admin-actions.ts` | Add role guard | 1h |
| SEC-08 | SAML stub returns null | **Medium** | Enterprise SAML claim false | `buildSamlProvider()` | Implement or remove UI claim | 2-4w |
| SEC-09 | CSP allows unsafe-inline/eval (next.config) | **Medium** | XSS surface | `next.config.mjs` | Tighten CSP | 2-4d |
| SEC-10 | Edge rate limit memory-only | **Medium** | DoS across instances | `rate-limit-edge.ts` | Redis-backed edge or ALB WAF | 1w |

---

## Authentication — PARTIALLY VERIFIED

- NextAuth v5 with JWT strategy — VERIFIED
- Credentials + env OAuth providers — VERIFIED
- Invite-only OAuth signIn callback — VERIFIED
- 7-day session on custom login — VERIFIED
- `AUTH_SECRET` length check in health endpoint — VERIFIED

---

## RBAC — PARTIALLY VERIFIED

**Works:**
- Middleware `routeMinRoles` hierarchy (viewer < operator < admin)
- Product-specific guards (audit, local-content, workflowos)
- Server action `requireServerActionAccess`

**Broken/Stubs:**
- `CoreAccessControl.check()` → always granted
- Fine-grained permission matrix not enforced

---

## Tenant Isolation — VERIFIED

- `organizationId` on user session and domain models
- Cross-tenant test file exists
- Download routes verify org match
- Platform admin cross-tenant opt-in pattern

---

## MFA — PARTIALLY VERIFIED

**Implemented:**
- TOTP generate/verify (`src/lib/auth/mfa.ts`)
- AES-256-GCM secret encryption
- Setup/disable server actions
- MFA verify API sets `mfaVerified` on JWT
- Settings UI at `/settings/mfa`

**Gaps:**
- Login flow doesn't set `mfaEnabled` on JWT
- Middleware MFA gate incomplete
- TOTP uses SHA1 hash vs HMAC-SHA1 — **UNVERIFIED** compatibility

---

## Secrets — VERIFIED

- Platform vault: AES-256-GCM, `VAULT_ENCRYPTION_KEY`
- MFA secrets derived from `AUTH_SECRET`
- SCIM API key: timing-safe compare
- No `.env` in repo
- CI uses dummy secrets (appropriate)

---

## File Uploads — PARTIALLY VERIFIED

- Extension allowlists on audit/decision/workflow uploads — VERIFIED
- 20MB caps — VERIFIED
- SHA-256 on decision evidence — VERIFIED
- Virus scan — **STUB** (pass-through)

---

## Dependency Vulnerabilities — UNVERIFIED

`npm audit` not run in this audit. Recommend as follow-up.

---

## Enterprise Security Posture

| Requirement | Status |
|-------------|--------|
| SOC2 Type II ready | NO — gaps in access control, scanning, MFA |
| Pen test ready | NO — test-token, CSRF bypass |
| PDPL (Saudi) alignment | PARTIAL — audit trails exist; DPA not audited |
| NCA ECC alignment | PARTIAL — logging/monitoring present; IAM gaps |

---

## Ranked Remediation Roadmap

1. **Critical (24h):** Remove test-token route; fix build-blocking security-adjacent schema drift
2. **High (1 week):** MFA JWT flow; CSRF on custom login; CoreAccessControl decision
3. **Medium (1 month):** File scanner; SSO wiring; CSP hardening
4. **Low (quarter):** SAML; dependency audit CI gate; pen test
