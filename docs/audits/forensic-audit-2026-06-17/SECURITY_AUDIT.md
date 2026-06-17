# SECURITY AUDIT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Opened security-critical files + cross-ref `docs/audits/reality-audit-2026-06-17/security-audit.md`, `api-security-audit.md`  
**Full penetration test:** NOT VERIFIED

---

## Overall Score: 58/100

Source: reality-audit security-audit.md (opened). Sub-scores reproduced from that evidence-based report.

---

## Findings by Severity

### Critical

| ID | Finding | Evidence | File |
|----|---------|----------|------|
| SEC-C01 | `/api/test-token` exposes JWT + cookies without auth | Opened file — returns `token`, `token2`, `cookies` | `src/app/api/test-token/route.ts` L4–13 |
| SEC-C02 | `CoreAccessControl.check()` always returns `granted` | Opened file L7–8 | `src/core/access/access-control.ts` |

### High

| ID | Finding | Evidence | Source |
|----|---------|----------|--------|
| SEC-H01 | Custom login CSRF bypass | Static review | security-audit SEC-03 |
| SEC-H02 | MFA JWT fields not set at login | Static review | security-audit SEC-04 |
| SEC-H03 | File virus scanner pass-through stub | Static review | security-audit SEC-05 |

### Medium

| ID | Finding | Evidence | Source |
|----|---------|----------|--------|
| SEC-M01 | DB SSO providers not wired to login | Static review | security-audit SEC-06 |
| SEC-M02 | SSO admin CRUD without ADMIN check | Static review | security-audit SEC-07 |
| SEC-M03 | SAML stub returns null | Static review | security-audit SEC-08 |
| SEC-M04 | CSP allows unsafe-inline/eval | `next.config.mjs` | security-audit SEC-09 |
| SEC-M05 | Edge rate limit memory-only | Static review | security-audit SEC-10 |
| SEC-M06 | `/api/skills/evaluate` GET without auth | inventory-report | NOT opened this pass |

### Low

| ID | Finding | Evidence |
|----|---------|----------|
| SEC-L01 | SCIM single-org default | architecture-reality.md |
| SEC-L02 | TOTP SHA1 vs HMAC-SHA1 compatibility | UNVERIFIED |

---

## Domain Assessment

### Authentication — PARTIALLY VERIFIED

| Control | Status | Evidence |
|---------|--------|----------|
| NextAuth v5 JWT | VERIFIED | security-audit |
| Credentials + env OAuth | VERIFIED | security-audit |
| Invite-only OAuth callback | VERIFIED | security-audit |
| 7-day session on custom login | VERIFIED | security-audit |
| AUTH_SECRET length check | VERIFIED | health endpoint |

### Authorization — PARTIALLY VERIFIED

**Works:**
- Middleware `routeMinRoles` hierarchy
- Product guards (audit, local-content, workflowos)
- `requireServerActionAccess`

**Broken:**
- `CoreAccessControl` stub (opened)

### Tenant Isolation — VERIFIED

- `organizationId` on session and models
- Cross-tenant test file exists
- Download routes verify org match

### MFA — PARTIALLY VERIFIED

**Implemented:** TOTP, encryption, settings UI, verify API  
**Gap:** Login doesn't set `mfaEnabled` on JWT (security-audit)

### Secrets — VERIFIED

- Platform vault AES-256-GCM
- SCIM timing-safe compare
- No `.env` in repo (git status)
- CI dummy secrets in `deploy.yml` L23 (opened)

### CI/CD Security — PARTIALLY VERIFIED

| Item | Evidence |
|------|----------|
| Deploy runs `tsc --noEmit` first | `deploy.yml` L37 |
| Deploy ignores docs-only pushes | `deploy.yml` L7–10 |
| Build currently fails | `build-audit.md` — pipeline would block |

---

## Opened File Evidence: test-token

```typescript
// src/app/api/test-token/route.ts — exposes session tokens
return NextResponse.json({ token, token2, cookies: request.headers.get("cookie") });
```

**Recommendation:** Delete or restrict to `NODE_ENV=development` + localhost.

---

## Opened File Evidence: CoreAccessControl

```typescript
// src/core/access/access-control.ts
async check(_request: AccessRequest): Promise<AccessResult> {
  return { decision: "granted" };
}
```

---

## NOT VERIFIED

- OWASP ZAP / DAST scan
- Dependency CVE audit (`npm audit` not run)
- Production AWS security groups / WAF
- Secrets in deployed environments
- Full middleware route matrix

---

## Immediate Actions (Evidence-Based Priority)

1. Remove/gate `test-token` route (**15m** — security-audit)
2. Implement or remove `CoreAccessControl` stub (**2–5d**)
3. Fix MFA JWT at login (**2–4h**)
4. Wire or document SSO reality (**1–2w**)
