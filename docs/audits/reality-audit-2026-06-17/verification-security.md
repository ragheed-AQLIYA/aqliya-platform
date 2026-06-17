# Verification — Security Critical Findings

**Verification date:** 2026-06-17

---

## FINDING 1: `/api/test-token`

### Source

```1:14:src/app/api/test-token/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const secret = process.env.AUTH_SECRET;
  const token = await getToken({ req: request, secret, salt: "authjs.session-token" });
  const token2 = await getToken({ req: request, secret, salt: "next-auth.session-token" });
  
  return NextResponse.json({
    token,
    token2,
    cookies: request.headers.get("cookie"),
  });
}
```

### Middleware coverage

`src/middleware.ts` matcher (lines 257–311) includes `/api/ai/*`, `/api/platform/*`, etc.  
**Does NOT include** `/api/test-token`.

### Production reachability

Clean build route manifest (2026-06-17 02:38) lists:
```
├ ƒ /api/test-token
```

### Execution path

1. Unauthenticated GET to `/api/test-token`
2. Handler reads JWT from **requester's** cookies (if any)
3. Returns decoded token + raw `Cookie` header as JSON

### Exploitability analysis

| Question | Answer | Evidence |
|----------|--------|----------|
| Reachable in production build? | **YES** | Build manifest |
| Protected by middleware? | **NO** | Matcher omission |
| Dev-only guard (`NODE_ENV`)? | **NO** | No env check in file |
| Grants new privileges? | **NO** | Read-only reflection of caller's session |
| Exposes secrets without session? | **NO** — returns null/empty if no cookie | Code logic |
| Information disclosure? | **YES** — JWT claims + cookie header echoed | Response shape |
| CSRF data exfiltration vector? | **PARTIAL** — attacker could embed image/script if victim is logged in | Standard CSRF read pattern |

**Classification:** **VALID** (endpoint should not exist in production)  
**Severity calibration:** Original audit said **Critical** — verification rates **HIGH** (disclosure/debug, not direct auth bypass)

**VERDICT:** **PARTIALLY CONFIRMED** — finding real; severity slightly exaggerated

---

## FINDING 2: CoreAccessControl always grants

### Source

```4:9:src/core/access/access-control.ts
export class CoreAccessControl {
  constructor(_ledger?: unknown) {}

  async check(_request: AccessRequest): Promise<AccessResult> {
    return { decision: "granted" };
  }
}
```

### Call path

```58:99:src/core/access/server-action-guard.ts
export async function requireServerActionAccess(...) {
  const user = await requireUserContext(minRole);  // ← coarse RBAC enforced HERE
  ...
  if (targetOrgId !== user.organizationId && user.role !== "ADMIN") {
    throw new Error("Access denied: organization mismatch");  // ← tenant check HERE
  }
  const result = await checkAccess({...});  // ← CoreAccessControl (always grants)
  ...
}
```

### Test acknowledgment

```508:513:src/__tests__/cross-tenant-isolation.test.ts
  describe("6. CoreAccessControl stub", () => {
      const { CoreAccessControl } = await import(...)
```

### Exploitability analysis

| Layer | Enforced? |
|-------|-----------|
| Session required | **YES** — `requireUserContext` |
| Role hierarchy (VIEWER/OPERATOR/ADMIN) | **YES** — `requireUserContext(minRole)` |
| Organization mismatch | **YES** — explicit throw |
| Fine-grained permission matrix | **NO** — CoreAccessControl stub |
| Resource-specific deny | **NO** — always granted after coarse checks |

**Classification:** **VALID** for fine-grained RBAC  
**Classification:** **PARTIAL** for "RBAC is broken" — coarse RBAC + tenant checks still operate

**VERDICT:** **PARTIALLY CONFIRMED** — stub is real; impact narrower than "permission bypass" implies

---

## FINDING 3: MFA gaps

### JWT callback — no MFA fields

```94:117:src/lib/auth-config.ts
    async jwt({ token, user, account }) {
      if (user) {
        ...
        token.role = u.role;
        token.organizationId = u.organizationId;
        // NO mfaEnabled or mfaVerified assignment
      }
      return token;
    },
```

### Middleware expects MFA on token

```202:218:src/middleware.ts
    const mfaEnabled = tok.mfaEnabled as boolean | undefined;
    const mfaVerified = tok.mfaVerified as boolean | undefined;
    ...
      if (!isMfaExempt && (!mfaEnabled || !mfaVerified)) {
```

### MFA verify route sets flag post-login

```69:69:src/app/api/auth/mfa/verify/route.ts
      token: { ...sessionToken, mfaVerified: true },
```

### DB has MFA fields

`src/actions/mfa.ts` reads/writes `user.mfaEnabled`, `mfaSecret`.

### Behavior inference

- After login: `mfaEnabled` undefined on JWT → middleware treats as not enabled/verified
- Users with MFA enabled in DB may be redirected to `/settings/mfa` on every request until verify API called
- **Gap is real** — login flow doesn't load `mfaEnabled` from DB into JWT

**Classification:** **VALID**

**VERDICT:** **CONFIRMED**

---

## Summary

| Finding | Original Severity | Verified | Verdict |
|---------|------------------|----------|---------|
| test-token | Critical | High (disclosure) | **PARTIALLY CONFIRMED** |
| CoreAccessControl | Critical | Medium (fine-grained only) | **PARTIALLY CONFIRMED** |
| MFA JWT gap | High | High | **CONFIRMED** |
