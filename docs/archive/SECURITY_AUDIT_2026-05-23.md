# AQLIYA Platform — Security Architecture Audit

**Date:** 2026-05-23  
**Scope:** Full codebase — src/, API routes, middleware, auth, tenant guards, file handling, secrets, deployment config  
**Auditor Role:** Security Architect  
**Platform:** AQLIYA Private Governed Institutional Intelligence — AuditOS, LocalContentOS, DecisionOS, SalesOS, Sunbul, WorkflowOS

> Status update (2026-05-24): This audit is preserved as historical evidence, but two headline findings are no longer current code reality. Next.js 16 in this repository uses `src/proxy.ts` rather than requiring `middleware.ts`, and `src/app/api/sunbul/documents/[documentId]/download/route.ts` now authenticates before its document lookup. Use `docs/reports/security-auth-coverage-lock-2026-05-24.md` for the current auth-coverage verdict.

---

## A. Executive Security Summary

AQLIYA's application-layer security logic is largely well-structured: tenant isolation guards, org-scoped access control, role-based action gating, and bcrypt credential handling are all present and coherent. The authentication architecture (NextAuth v5 JWT, `requireOrgAccess`, `requireClientAccess`, `assertEngagementAccess`) is sound in design.

However, **two infrastructure-level failures invalidate the entire perimeter**:

1. **No `middleware.ts` exists.** The security headers module (`middleware-security.ts`) and rate-limiter module (`middleware-rate-limit.ts`) are implemented and functional — but they are never invoked. No Next.js middleware is registered. This means zero edge-level protection is applied to any route.

2. **`/api/sunbul/documents/[documentId]/download` performs a pre-auth database lookup.** An unauthenticated request can distinguish between "document exists" (401) and "document does not exist" (404), enabling ID enumeration of client documents without credentials.

These two issues, combined with unauthenticated demo routes, information-leaking health endpoint, an absolute filesystem path in production config, and an in-memory rate limiter that cannot survive serverless deployments, classify this platform as **Demo-Safe / Not Pilot-Safe** in its current state.

---

## B. Critical Findings

### B-1. No middleware.ts — Security Headers and Rate Limiting Are Dead Code

**Severity:** Critical  
**Files:** `src/middleware-security.ts`, `src/middleware-rate-limit.ts`  
**Root file:** MISSING (`/middleware.ts`)

`setSecurityHeaders()` and `rateLimitMiddleware()` are fully implemented but are never called. Next.js only invokes middleware from a file named `middleware.ts` (or `middleware.js`) at the project root or `src/` root. Neither exists.

**Consequence:**

- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection` — **none are sent to any client on any route**
- `X-Powered-By: Next.js` **is exposed** (no `poweredByHeader: false` in next.config.mjs)
- Rate limiting (60 req/min/IP) is **never enforced** on any API endpoint
- No CSP header is set anywhere (not in middleware, not in next.config.mjs)

**Fix:** Create `/src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMiddleware } from "@/middleware-rate-limit";
import { setSecurityHeaders } from "@/middleware-security";
import { auth } from "@/lib/auth-config";

export default auth(async (request: NextRequest) => {
  // 1. Rate limit
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Enforce auth on protected paths
  const { pathname } = request.nextUrl;
  const protectedPaths = [
    "/audit",
    "/local-content",
    "/decisions",
    "/sales",
    "/sunbul",
    "/workflowos",
    "/api/audit",
    "/api/local-content",
    "/api/sunbul",
    "/api/metrics",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !request.auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Security headers on all responses
  const response = NextResponse.next();
  return setSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)",
  ],
};
```

Also add to `next.config.mjs`:

```js
const nextConfig = {
  poweredByHeader: false,
  // ...
};
```

---

### B-2. Document ID Enumeration on Sunbul Download Endpoint

**Severity:** Critical  
**File:** `src/app/api/sunbul/documents/[documentId]/download/route.ts`

The route fetches `prisma.sunbulDocument.findUnique` **before** authenticating the caller. This allows any unauthenticated actor to probe document IDs and determine their existence:

- Valid ID, no session → **401** (document confirmed to exist)
- Invalid ID → **404** (document does not exist)

An attacker can enumerate valid Sunbul document IDs across all clients without credentials.

**Fix:** Move authentication to the first line of the handler:

```typescript
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  try {
    // AUTH FIRST — before any DB lookup
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser(); // throws "Unauthenticated" if no session

    const docRecord = await prisma.sunbulDocument.findUnique({ ... });
    // ... rest of handler
```

---

## C. High-Risk Findings

### C-1. `/auditos/*` Routes Are Publicly Accessible Without Authentication

**Severity:** High  
**File:** `src/app/auditos/layout.tsx`

The `/auditos` route group renders a full AuditOS demo UI — trial balance upload, mapping, statements, evidence, traceability — with NO authentication gate in its layout. Anyone with the URL can access these routes.

While the data is demo/mock data, this creates two risks:

1. In cloud deployment, clients assume any `aqliya.com` route is a real system
2. If the demo routes are ever wired to real data (a common dev shortcut), there is no safety net

**Fix:** Add auth guard to `src/app/auditos/layout.tsx`:

```typescript
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuditosLayout({ children }) {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }
  // ...
}
```

Or gate it behind an environment variable: `if (process.env.ENABLE_DEMO !== "true") notFound()`.

---

### C-2. `/api/health` Leaks System Information Without Authentication

**Severity:** High  
**File:** `src/app/api/health/route.ts`

The health endpoint is publicly accessible and returns:

- `process.env.NODE_ENV` (reveals production vs. staging classification)
- `process.uptime()` (reveals server restart timing, useful for timing attacks)
- Database availability status (confirms whether Postgres is reachable)

**Fix:** Add ADMIN-only auth OR strip sensitive fields for public responses:

```typescript
export async function GET() {
  // Option A: Require ADMIN
  try {
    await requireUserContext("ADMIN");
  } catch {
    /* check internal token */
  }

  // Option B: Public-safe response only
  return NextResponse.json({
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    // Remove: NODE_ENV, uptime, detailed check names
  });
}
```

---

### C-3. No Content-Security-Policy Header Anywhere

**Severity:** High  
**Files:** `src/middleware-security.ts`, `next.config.mjs`

No CSP is set at any level — middleware doesn't run (B-1) and `next.config.mjs` has no `headers()` function. For an institutional platform handling evidence documents, recommendations, and audit data, XSS via injected scripts is unmitigated.

**Fix:** Add to `next.config.mjs` as fallback (and also in middleware):

```js
async headers() {
  return [{
    source: "/(.*)",
    headers: [{
      key: "Content-Security-Policy",
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    }]
  }]
}
```

---

### C-4. In-Memory Rate Limiting Cannot Survive Serverless/Multi-Instance Deployments

**Severity:** High  
**File:** `src/lib/rate-limit.ts`

Rate limiting is implemented using a module-level `Map`. In Vercel (serverless) or any horizontally scaled deployment:

- Each function instance maintains its own map
- A single IP can hit 60 req/min × N instances before being rate-limited
- On Vercel, the map is reset on every cold start

**Fix:** Replace with edge-compatible shared counter. Options:

- `@upstash/ratelimit` with Redis (works on Vercel Edge)
- Vercel KV for simple counters
- For on-prem: Redis-backed rate limiter via `ioredis`

```typescript
// With Upstash
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});
```

---

### C-5. Absolute Windows Path Committed in `next.config.mjs`

**Severity:** High  
**File:** `next.config.mjs`, line: `turbopack: { root: "C:/Users/PC/Documents/Aqliya" }`

A developer's machine absolute path is hardcoded in production configuration. This leaks:

- Developer identity/machine structure
- That the platform is Windows-native (relevant for security posture assessment)
- Potential for path disclosure in error messages

**Fix:** Remove the `turbopack.root` key entirely (it defaults to `process.cwd()`) or make it conditional:

```js
...(process.env.NODE_ENV === "development" && process.platform === "win32"
  ? { turbopack: { root: process.cwd() } }
  : {}),
```

---

## D. Medium-Risk Findings

### D-1. `getPublishedRecommendationViewAction` Auth Is Via Error Path, Not Explicit Redirect

**Severity:** Medium  
**File:** `src/app/published/recommendation/[decisionId]/page.tsx`

The `/published/recommendation/[id]` page has no auth check in its layout. Auth is enforced only because `getPublishedRecommendationViewAction` calls `getCurrentUser()` internally — if that throws, the action returns `{ success: false }`, and the page calls `notFound()`. This chain is:

- Functionally correct
- Architecturally fragile — a future refactor of the action could silently break auth
- Returns 404 (not 401/redirect) for unauthenticated access, obscuring the auth requirement

**Fix:** Add explicit session check at the page level:

```typescript
export default async function PublishedRecommendationPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");
  // ...
}
```

---

### D-2. JWT Token Contains Full Org Context With No Rotation Mechanism

**Severity:** Medium  
**File:** `src/lib/auth-config.ts`

The JWT token encodes `organizationId`, `role`, `platformOrganizationId`, and the full `organization` object. This data is never refreshed until the token expires or the user re-authenticates. If a user's role or org membership changes in the DB, the JWT continues to grant the old privileges until expiration.

**Fix:** Either shorten JWT expiry (e.g., 15 min) with refresh tokens, or validate critical fields against DB on sensitive operations. For roles/permissions, the `requireUserContext` calls in server actions already re-read from the session, but the session data itself may be stale.

Add to `authConfig`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 8 * 60 * 60, // 8 hours max
}
```

---

### D-3. `import "dotenv/config"` in `auth-config.ts`

**Severity:** Medium  
**File:** `src/lib/auth-config.ts`, line 1

`import "dotenv/config"` in an auth module that runs both in Node.js context and potentially at module initialization time can cause unexpected behavior:

- In Edge Runtime (Vercel middleware), `dotenv` is not available
- It forces a filesystem read on every cold start
- Auth config should rely on `process.env` directly, which Next.js already populates

**Fix:** Remove `import "dotenv/config"` from `auth-config.ts`. Next.js loads `.env` files automatically. If Prisma-specific env loading is needed, keep it only in `prisma.config.ts`.

---

### D-4. `getAuditActor` Module-Level Mutable State

**Severity:** Medium  
**File:** `src/lib/audit/actor-context.ts`

```typescript
let demoFallbackActive = false;
export function isUsingDemoFallback(): boolean {
  return demoFallbackActive;
}
```

This is a module-level mutable boolean. In Next.js server runtime, modules are cached across requests in the same worker process. This means:

- One request's actor resolution state leaks into subsequent requests in the same worker
- In high-concurrency scenarios, `demoFallbackActive = true` from one request could mislead another request's logging/telemetry

**Fix:** Remove the module-level flag. Return the demo status as part of the function's return value:

```typescript
export async function getAuditActor(): Promise<AuditActor & { isDemoFallback: boolean }> { ... }
```

---

### D-5. `/api/custom-product-submit` Has No Rate Limiting or Bot Protection

**Severity:** Medium  
**File:** `src/app/api/custom-product-submit/route.ts`

This public endpoint accepts POST from the marketing site, logs `contactEmail` to console (visible in Vercel Logs), and sends emails via Resend. With no middleware running (B-1), there is no rate limiting. This is exploitable for:

- Email flooding (send thousands of emails to `ragheed@aqliya.com`)
- Log pollution
- Resend quota exhaustion

**Fix:** Add route-local rate limiting (until a global solution is in place):

```typescript
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const limit = checkRateLimit(`contact:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  // ...
}
```

Remove the `console.log` that includes `contactEmail` in production.

---

### D-6. Sunbul PDF Export Auth at Service Layer Only

**Severity:** Medium  
**File:** `src/app/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf/route.ts`

Auth is enforced inside `exportSunbulRecord` (via `requireClientAccess`) rather than at the route handler level. While functionally equivalent, this means:

- The route handler proceeds with parsing params before auth
- Any future short-circuit or caching layer added to the route could inadvertently bypass auth
- Error handling for `Unauthenticated` is downstream and may swallow edge cases

**Fix:** Add explicit auth at the start of the route handler before calling the service.

---

## E. Low-Risk Findings

### E-1. `.bak` Files Present in Production Codebase

**Severity:** Low  
**Files:** Multiple — `page.tsx.bak`, `page.tsx.bak` across marketing routes

Backup files in the repository are not served by Next.js (they don't match route conventions) but they:

- Pollute the codebase with potentially outdated logic
- May contain removed security controls or sensitive comments
- Confuse automated scanners

**Fix:** `find src -name "*.bak" -delete` and commit.

---

### E-2. `Dockerfile` Copies Full Source Including `.env.example` and Scripts

**Severity:** Low  
**File:** `Dockerfile`

The `COPY . .` instruction in the builder stage copies all files including `scripts/`, `docs/`, `AGENTS.md`, and `certificates/` into the image layer. While the runner stage only copies `.next/standalone`, the builder layer still exists in the image history and may contain sensitive build-time artifacts.

**Fix:** Add a `.dockerignore`:

```
.env
.env.*
certificates/
docs/
scripts/
*.md
.git/
backups/
cypress/
```

---

### E-3. `AUTH_SECRET` Is a Real Value in `.env`

**Severity:** Low (would be Critical if committed)  
**File:** `.env`

The `.env` file contains `AUTH_SECRET="SWPbmu3Vn4pYC0wUo+O2GpHXCIwaG2K6GMnV68spl8o="` — a real 32-byte base64 secret. Git history confirms `.env` was never committed. However:

- If this same secret is used in production (copy-paste from `.env`), a developer with local access can forge valid JWT sessions
- The secret must be rotated between development and production environments

**Fix:** Generate separate secrets per environment. Verify `AUTH_SECRET` in production Vercel/deployment env vars differs from the local `.env` value. Add a CI check:

```bash
# In CI: confirm AUTH_SECRET is not the dev default
[[ "$AUTH_SECRET" == "SWPbmu3Vn4pYC0wUo*" ]] && exit 1
```

---

### E-4. Health Endpoint Response Includes Verbose Database Status

**Severity:** Low  
**File:** `src/app/api/health/route.ts`

When the database is unavailable, the response includes `{ database: { status: "error", message: "Database connection failed" } }`. For a public endpoint, this confirms database architecture details to unauthenticated callers.

---

## F. Missing Security Controls

| Control                                     | Status                   | Priority |
| ------------------------------------------- | ------------------------ | -------- |
| Content-Security-Policy                     | Missing                  | P0       |
| Global middleware.ts                        | Missing                  | P0       |
| Edge-compatible rate limiting               | Missing                  | P0       |
| HSTS (`Strict-Transport-Security`)          | Missing                  | P1       |
| `X-Powered-By` removal                      | Missing                  | P1       |
| Unauthenticated demo route gates            | Missing                  | P1       |
| Health endpoint auth                        | Missing                  | P1       |
| `.dockerignore`                             | Missing                  | P2       |
| Bot protection on public forms              | Missing                  | P2       |
| JWT expiry/rotation policy                  | Partial                  | P2       |
| File upload MIME validation (server-side)   | Partial (extension only) | P2       |
| Secret rotation policy between environments | Not enforced             | P2       |
| CSP nonce for inline scripts                | Missing                  | P3       |

---

## G. Required Code Changes (Priority Order)

### G-1 — Create `/src/middleware.ts` [P0 — Immediate]

Calls `rateLimitMiddleware` and `setSecurityHeaders`. Add CSP header. Protect `/api/*` and all workspace routes at edge.

### G-2 — Add CSP to `next.config.mjs` as fallback headers [P0 — Immediate]

Defense in depth. CSP via `async headers()` config, even before middleware is proven stable.

### G-3 — Add `poweredByHeader: false` to `next.config.mjs` [P0 — Immediate]

One line.

### G-4 — Fix document enumeration in Sunbul download route [P0 — Before Demo]

Move auth check to first line of `GET` handler in `src/app/api/sunbul/documents/[documentId]/download/route.ts`.

### G-5 — Gate `/auditos/*` with auth check or env flag [P1 — Before Demo]

Either `getCurrentUser()` in `src/app/auditos/layout.tsx` or a `NEXT_PUBLIC_ENABLE_DEMO` flag guard.

### G-6 — Strip sensitive fields from `/api/health` [P1 — Before Demo]

Remove `environment` and `uptime` from public response.

### G-7 — Remove absolute path from `next.config.mjs` [P1 — Before Demo]

Remove `turbopack.root` or make conditional on `NODE_ENV`.

### G-8 — Remove `import "dotenv/config"` from `auth-config.ts` [P1]

Next.js handles env loading. This import is redundant and risky.

### G-9 — Replace in-memory rate limiter before pilot [P2 — Before Pilot]

Use Upstash/Redis for shared state. Required for any multi-instance or Vercel deployment.

### G-10 — Add rate limiting to `custom-product-submit` route [P2]

Local `checkRateLimit` call until global middleware is proven. Remove `contactEmail` from `console.log`.

### G-11 — Delete `.bak` files [P2]

`find src -name "*.bak" -delete`

### G-12 — Add `.dockerignore` [P2]

Exclude `.env*`, `certificates/`, `docs/`, `scripts/`, `.git/` from build context.

### G-13 — Explicit auth check in `published/recommendation` page [P3]

Replace implicit auth-via-action-error with explicit `redirect("/login")`.

### G-14 — Remove module-level `demoFallbackActive` flag [P3]

Refactor to return status as part of `getAuditActor()` return value.

---

## H. Required Documentation Changes

1. **`AGENTS.md`** — Add explicit rule: _"Every API route handler must call `getCurrentUser()` or equivalent as its first operation before any database access."_

2. **`AGENTS.md`** — Add: _"A `middleware.ts` must exist at `src/`. Do not delete it. All security headers and rate limiting run there."_

3. **`README.md`** — Add security environment variable checklist: `AUTH_SECRET` must differ between dev and production; document rotation procedure.

4. **`docs/DEPLOYMENT.md`** (create if missing) — Document: Vercel env vars required, secret rotation process, health endpoint access policy, demo route enable/disable flag.

5. **`docs/SECURITY.md`** (create) — Document: RBAC model, tenant isolation guarantees, audit trail integrity model, responsible disclosure contact.

---

## I. Security Backlog (Priority Sorted)

| #   | Item                                                                    | Effort | Priority |
| --- | ----------------------------------------------------------------------- | ------ | -------- |
| 1   | Create `src/middleware.ts` with headers + rate limit + auth enforcement | 2h     | P0       |
| 2   | Add CSP header to `next.config.mjs`                                     | 30m    | P0       |
| 3   | Fix Sunbul document download pre-auth DB lookup                         | 15m    | P0       |
| 4   | Add `poweredByHeader: false`                                            | 5m     | P0       |
| 5   | Gate `/auditos` with auth or env flag                                   | 30m    | P1       |
| 6   | Strip sensitive fields from `/api/health`                               | 15m    | P1       |
| 7   | Remove absolute path from `next.config.mjs`                             | 5m     | P1       |
| 8   | Remove `import "dotenv/config"` from `auth-config.ts`                   | 5m     | P1       |
| 9   | Replace in-memory rate limiter with Redis/Upstash                       | 4h     | P2       |
| 10  | Add HSTS header to security middleware                                  | 10m    | P2       |
| 11  | Add local rate limit to `custom-product-submit` route                   | 30m    | P2       |
| 12  | Delete `.bak` files                                                     | 10m    | P2       |
| 13  | Add `.dockerignore`                                                     | 15m    | P2       |
| 14  | Verify `AUTH_SECRET` rotation between dev/prod                          | 30m    | P2       |
| 15  | Explicit auth redirect in `published/recommendation` page               | 15m    | P3       |
| 16  | Refactor `demoFallbackActive` module-level flag                         | 1h     | P3       |
| 17  | JWT maxAge enforcement + rotation policy doc                            | 1h     | P3       |
| 18  | CSP nonce for server-rendered inline scripts                            | 3h     | P4       |
| 19  | Add bot protection (Turnstile/hCaptcha) to public forms                 | 4h     | P4       |
| 20  | Audit `.env` value rotation confirmation in CI                          | 1h     | P4       |

---

## J. Validation Commands / Checks

Run these to verify fixes after implementation:

```bash
# 1. Confirm middleware.ts exists and exports a default function
test -f src/middleware.ts && grep -q "export default" src/middleware.ts && echo "PASS" || echo "FAIL: middleware.ts missing"

# 2. Confirm poweredByHeader is false
grep -q "poweredByHeader: false" next.config.mjs && echo "PASS" || echo "FAIL"

# 3. Confirm no absolute Windows path in config
grep -q "C:/Users" next.config.mjs && echo "FAIL: path leak" || echo "PASS"

# 4. Confirm no .bak files
find src -name "*.bak" | wc -l | grep -q "^0$" && echo "PASS" || echo "FAIL: bak files present"

# 5. Confirm dotenv import removed from auth-config
grep -q "dotenv/config" src/lib/auth-config.ts && echo "FAIL: dotenv import present" || echo "PASS"

# 6. Security headers present in response (requires running server)
curl -s -I http://localhost:3000 | grep -E "X-Frame-Options|X-Content-Type-Options|Content-Security-Policy"

# 7. Rate limit enforcement check (requires running server)
for i in $(seq 1 70); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health; done | grep -c "429"

# 8. Sunbul download with no session returns 401 (not enumerable by ID)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/sunbul/documents/FAKE_ID/download
# Expected: 404 (not 401) — auth check should run before DB lookup

# 9. Confirm auditos route requires auth
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auditos
# Expected: 307 (redirect to /login)

# 10. Confirm health endpoint does not leak NODE_ENV
curl -s http://localhost:3000/api/health | jq '.environment' | grep -q "null" && echo "PASS" || echo "FAIL: environment field exposed"
```

---

## K. Final Readiness Classification

| Environment                             | Classification          | Rationale                                                                                  |
| --------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| **Internal Demo (controlled)**          | ✅ Demo-Safe            | Auth guards on all real workspace routes. Tenant isolation functional. No production data. |
| **Client-Facing Demo (any URL access)** | ⚠️ Conditional          | Gate `/auditos/*` first. Fix health endpoint. Remove turbopack path.                       |
| **Pilot (real client data)**            | ❌ Not Pilot-Safe       | Requires P0+P1 fixes. Rate limiting must be real (Redis). No CSP. No middleware.           |
| **Production**                          | ❌ Not Production-Ready | All of the above plus P2 items. Secret rotation confirmed. Docker hardened.                |

---

**Verdict: Demo-Safe → Pilot-Safe gap is 5–8 hours of focused fixes (P0+P1 items).**  
The application architecture is sound. The failures are infrastructure-layer gaps, not logic flaws. All P0 items can be resolved in a single focused session before any client-facing demo.

---

_Report generated by AQLIYA Security Architecture Audit — 2026-05-23_
