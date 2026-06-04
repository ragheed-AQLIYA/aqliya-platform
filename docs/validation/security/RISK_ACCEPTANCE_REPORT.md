# Risk Acceptance Report — AQLIYA Pilot

**Reviewer:** Security Reviewer (Read-Only)
**Date:** 2026-06-04
**Scope:** 3 accepted critical risks from previous audit cycle
**Pilot Context:** Single-tenant (1 organization), ~5 users, controlled network

---

## Risk 1: CSP-01 — Ineffective CSP Header

### Current State

CSP header configured in `src/middleware-security.ts:16`:

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
```

`'unsafe-inline'` and `'unsafe-eval'` in `script-src` neutralise script-injection XSS protection.

### Exploitability Assessment

**Rating:** High (in isolation), but bounded by what CSP still blocks

**Reasoning:** CSP still prevents several attack classes:

| Directive | Blocks | Still effective? |
|---|---|---|
| `object-src 'none'` | Flash/Java plugin-based attacks | Yes |
| `frame-ancestors 'none'` | Clickjacking (overlays) | Yes (redundant with `X-Frame-Options: SAMEORIGIN`) |
| `base-uri 'self'` | Base tag injection (redirects all relative URLs) | Yes |
| `connect-src 'self'` | Data exfiltration via `fetch`/`XHR` to external C2 | Yes |
| `img-src 'self' data: blob:` | Image-based data exfiltration to external servers | Yes |
| `default-src 'self'` | Catch-all fallback for unspecified directives | Partial |

What CSP does **not** prevent: inline script injection (`<script>alert(1)</script>`), `eval()`-based attacks. Any stored XSS or DOM-based XSS that injects a script tag will execute.

### Pilot Impact

**Rating:** Low

**Reasoning:**
- Single org, ~5 known users, no public registration, no untrusted user-generated content in free-form rich text
- AuditOS pilot workflow (trial balance upload, account mapping, financial statements, findings) has structured data inputs, not broad HTML rendering
- No public-facing form that accepts arbitrary HTML/JS from untrusted parties
- Primary XSS vectors (stored XSS via comments, rich text) require an attacker to already have authenticated access
- A session-stealing attacker with XSS would still need to bypass MFA (for ADMIN/OPERATOR roles) and the CSP still blocks data exfiltration (`connect-src 'self'`)
- Effective risk: a malicious insider with authenticated access could execute scripts — but they already have database write access

### Production Impact

**Rating:** High

**Reasoning:**
- At scale with hundreds of orgs and thousands of users, including potential public-facing surfaces, the CSP weakness becomes a primary XSS defence gap
- Multi-tenant SaaS means a single XSS in a shared component could leak data across tenants
- `connect-src 'self'` limits damage radius by preventing C2 beaconing, but data theft via DOM exfiltration (`document.cookie` read, then store in same-origin) is still possible

### Mitigation Options

1. **Route-scoped strict CSP for pilot** — Override CSP for `/audit/*` routes. Remove `unsafe-inline` and `unsafe-eval` for these paths. Requires checking whether Next.js hydration or any third-party vendor scripts on audit pages need them. **Cost:** Medium (needs audit of all audit-route scripts). **Benefit:** High for pilot.

2. **Strict CSP with nonce/hash** — Replace `unsafe-inline` with a nonce or hash-based approach. Requires Next.js integration for nonce generation in middleware + passing to `<Script>` components. **Cost:** High for v0.1. **Benefit:** Production-grade.

3. **Content-Security-Policy-Report-Only** — Deploy a strict CSP in report-only mode alongside the current policy to collect violations without breaking functionality. **Cost:** Low. **Benefit:** Data for hardening.

4. **No change, accept for pilot** — Deploy with current CSP, accept that `connect-src 'self'` and `object-src 'none'` provide partial defense. **Cost:** Zero. **Risk:** Low for 5-user single-tenant pilot.

### Recommendation

**ACCEPT WITH CONDITIONS**

Condition: Deploy option 3 (report-only strict CSP) for `/audit/*` routes at minimum. This costs nearly nothing, surfaces violations before production scale, and gives actionable data for hardening before multi-tenant rollout. Do not close CSP-01 without a plan to move to strict CSP before production multi-tenancy.

---

## Risk 2: MFA-SU-01 — No Step-Up Authentication

### Current State

**Code findings:**

1. **MFA disable** (`src/actions/mfa.ts:61-86`): `disableMFA(password)` **requires current password** via `bcrypt.compare(password, user.passwordHash)`. This IS a step-up — the user must re-authenticate with their password before disabling MFA. The risk description is partially inaccurate on this point.

2. **Role changes:** No step-up found for role promotion/demotion. An ADMIN session can change another user's role without re-authentication.

3. **MFA session flow** (`src/middleware.ts:140-163`): Middleware checks `mfaVerified` flag in JWT. If MFA is required for the role (ADMIN/OPERATOR) and not verified, access is denied/redirected. The verify endpoint sets `mfaVerified: true` in the JWT via `encode()`.

4. **Session token:** JWT-based, httpOnly, secure in production, `sameSite: 'lax'`, 30-day maxAge. Contains `jti` for revocation tracking.

### Exploitability Assessment

**Rating:** Medium (for role changes), Low (for MFA disable)

**Reasoning:**
- MFA disable is protected by password step-up — an attacker needs both session cookie AND password
- Role changes have no step-up — a session-hijacked ADMIN could escalate another user's privileges
- Session hijack requires: XSS (partially blocked by CSP connect-src), physical access to unattended machine, or network-level interception (unlikely in controlled pilot)
- Session token is httpOnly (not accessible via JS), `sameSite: 'lax'` (protects against CSRF-based session theft)

### Pilot Impact

**Rating:** Low

**Reasoning:**
- 5 users, likely all known to each other, controlled network
- MFA disable requires password — the main step-up concern is already addressed
- Role changes without step-up: in a 5-user single-org pilot, the ADMIN managing the pilot is unlikely to have their session stolen
- Session revocation via `jti` is implemented — if a compromised session is detected, it can be revoked
- Backup codes are hashed (sha256), reducing risk of offline brute-force if database is leaked

### Production Impact

**Rating:** High

**Reasoning:**
- At scale, an ADMIN session compromise without step-up for role changes is a privilege escalation vector
- Role change is a Tier-0 sensitive action that should require re-authentication (password + MFA token)
- In multi-tenant SaaS, a compromised ADMIN could promote a user in another org to ADMIN, bypassing tenant isolation

### Mitigation Options

1. **Step-up for role changes** — Add password+OTP re-verification before `user.update({ role: newRole })`. **Cost:** Low (server action change). **Benefit:** High.

2. **Step-up for MFA disable** — Already implemented via password. Document that this exists.

3. **Short session MFA re-verification timer** — Re-require MFA verification every N hours for sensitive operations. **Cost:** Medium (JWT expiry check per action). **Benefit:** Medium.

4. **No change** — Accept current state. MFA disable already has step-up. Role changes are ADMIN-only, and in a 5-user pilot, the risk is minimal.

### Recommendation

**ACCEPT WITH CONDITIONS**

Condition: Document that MFA disable already has password step-up (correct the risk record). For the pilot, add step-up for role changes (option 1 — low cost, high governance value). This is a server action change in <20 lines and aligns with AQLIYA's "Governed Institutional Intelligence" identity.

---

## Risk 3: RBAC-CROSS-01 — ADMIN Bypasses Tenant Isolation

### Current State

**Code findings across 4 guard implementations:**

| Guard function | File | ADMIN bypasses isolation? |
|---|---|---|
| `requireOrgAccess()` | `src/lib/auth.ts:96-105` | **No** — hard compare `user.organizationId !== organizationId`, throws for any mismatch regardless of role |
| `assertOrganizationAccess()` | `src/lib/audit/tenant-guard.ts:59-64` | **No** — hard compare `organizationId !== actor.organizationId`, throws for any mismatch |
| `assertEngagementAccess()` | `src/lib/audit/tenant-guard.ts:19-34` | **No** — compares engagement org against actor org |
| `requireServerActionAccess()` | `src/core/access/server-action-guard.ts:36-58` | **Conditional** — ADMIN bypasses tenant isolation for any resource (lines 53-55), AND explicit `allowPlatformAdminCrossTenant` flag for `organization` resource (lines 45-51) |

The test file (`cross-tenant-isolation.test.ts:244`) confirms: ADMIN can access any resource across orgs.

### Exploitability Assessment

**Rating:** Low (for single-tenant pilot), Medium (for multi-tenant)

**Reasoning:**
- `requireServerActionAccess` is used as the unified server-action gate for cross-product access (sales, audit, decisions, local_content, etc.)
- ADMIN bypass is by design — platform admins must manage organizations, users, settings across tenants
- The two strict guards (`requireOrgAccess`, `assertOrganizationAccess`) are used in specific high-integrity paths (DecisionOS, AuditOS)
- For multi-tenant: a compromised ADMIN account has cross-tenant read/write on all resources

### Pilot Impact

**Rating:** Low

**Reasoning:**
- Single-tenant: all users share the same `organizationId`
- `requireServerActionAccess` compares `targetOrgId !== user.organizationId` — in a single org, this always matches
- The ADMIN bypass code path (`user.role === "ADMIN"`) is irrelevant when there is only one org
- No cross-tenant data exposure is possible in a 1-org deployment
- All AuditOS, DecisionOS, LocalContentOS data belongs to the same org

### Production Impact

**Rating:** High

**Reasoning:**
- At multi-tenant scale, a compromised ADMIN account is a super-user across all orgs
- This is intentional platform admin design, not a bug — but the blast radius of an ADMIN compromise is total
- Mitigations reduce this: MFA required for ADMIN (src/lib/auth.ts:75-84), session jti revocation, audit logging

### Mitigation Options (for production, not pilot-blocking)

1. **Audit logging of cross-tenant ADMIN actions** — Ensure every cross-tenant ADMIN action is logged with both source and target organizationId. Already partially implemented via AuditLog model.

2. **ADMIN scope restriction** — Allow restricting ADMIN to specific organizations via a `scope` field rather than global access. **Cost:** High (architecture change). **Benefit:** High for production.

3. **Just-in-time privilege elevation** — ADMIN starts with single-org scope and must explicitly elevate for cross-tenant operations with audit trail. **Cost:** Medium-High.

4. **No change** — Accept as designed with MFA + session management mitigations. **Cost:** Zero.

### Recommendation

**ACCEPT — No conditions for pilot**

A single-tenant pilot renders this risk inert. The ADMIN bypass code path is never triggered because all users share one `organizationId`. For production multi-tenant, this is an accepted design trade-off with compensating controls (MFA requirement for ADMIN, session jti revocation, audit logging). Document as a known production risk requiring monitoring.

---

## Overall Security Risk Acceptance

| Risk | Severity | Pilot Risk | Production Risk | Decision |
|------|----------|-----------|----------------|----------|
| CSP-01 | Critical | **Low** | High | **ACCEPT WITH CONDITIONS** — Deploy report-only strict CSP for `/audit/*` routes |
| MFA-SU-01 | Critical | **Low** | High | **ACCEPT WITH CONDITIONS** — Add step-up for role changes (<20 lines); document MFA disable already has step-up |
| RBAC-CROSS-01 | Critical | **Low** (inert in 1-org) | High | **ACCEPT** — Single-tenant deployment renders this irrelevant; documented design trade-off for production |

## Final Recommendation

**GO WITH CONDITIONS**

### Conditions for pilot go-ahead

1. **CSP-01:** Deploy `Content-Security-Policy-Report-Only` with a strict policy on `/audit/*` and `/local-content/*` routes. This is a one-line middleware addition that collects violations without breaking anything.

2. **MFA-SU-01:** Add password re-verification before role changes in the ADMIN user management flow. This is a ~15-20 line server action change with high governance alignment.

3. **Documentation:** Update the risk register to reflect that MFA disable already has password step-up (the previous assessment was partially inaccurate).

### Non-blocking recommendations (for production readiness)

1. CSP hardening to strict mode before multi-tenant deployment
2. Step-up timer (re-verify MFA every N hours for sensitive actions)
3. ADMIN scope restriction or JIT elevation for cross-tenant operations
4. Cross-tenant ADMIN audit log enrichment (source vs target orgId)

### Security posture summary

All three risks are **Low pilot impact** once the two low-cost conditions above are met. The single-tenant, controlled-network, small-user pilot context dramatically reduces the exploitability of all three findings. The codebase has compensating controls (MFA enforcement for ADMIN/OPERATOR, session jti revocation, `connect-src 'self'`, httpOnly cookies, audit logging) that further reduce residual risk.

The pilot should proceed with the two conditions above. None of the three risks, in this deployment context, justifies a No-Go decision.
