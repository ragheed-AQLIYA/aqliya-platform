# Security / Public API Hardening

**Date:** 2026-05-28  
**Commit:** `7907042`  
**Type:** Security hotfix (Low-Load)  
**Prerequisites:** Security audit report (`docs/reports/`)

---

## Scope

5 files patched to close findings from the AQLIYA v1.1 security audit:

| # | Finding | Severity | File |
|---|---------|----------|------|
| H1 | `getAuditActor()` dev fallback returned hardcoded super-user on any auth failure in development | HIGH | `src/lib/audit/actor-context.ts` |
| H2 | `/api/pilot-review` endpoint had no rate limiting, no security headers | HIGH | `src/proxy.ts` |
| M1 | LocalContent download route used unsanitized filename in Content-Disposition | MEDIUM | `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` |
| M3 | Office AI download rate limiter Map had no cleanup → potential memory leak | MEDIUM | `src/app/api/office-ai/download/route.ts` |
| M4 | `custom-product-submit` email HTML had unescaped user content | MEDIUM | `src/app/api/custom-product-submit/route.ts` |
| L3 | Hardcoded personal email fallback could leak in production | LOW | `src/app/api/custom-product-submit/route.ts` |

---

## Fixes Applied

### H1 — Dev audit actor fallback gated

`src/lib/audit/actor-context.ts`

Before: fallback activated when `NODE_ENV !== "production"` (any non-production env including staging).  
After: fallback requires both:

```ts
process.env.NODE_ENV !== "production" &&
process.env.AUDIT_DEV_FALLBACK_ENABLED === "true"
```

A `console.warn` is emitted when the fallback is active.

### H2 — `/api/pilot-review` added to proxy

`src/proxy.ts`

- Added to `publicExact` set → remains public (no auth).
- Added to proxy `matcher` → receives rate limiting and security headers.

Flow: rate limiting → public path check → security headers + pass-through.

### M1 — Filename sanitized

`src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`

Uses `sanitizeFilename()` from `src/lib/platform/download.ts` with fallback `"local-content-report"`.

### M3 — Rate limiter cleanup

`src/app/api/office-ai/download/route.ts`

Added `setInterval` every 60s to evict expired entries from the download rate limiter Map.

### M4 — Email HTML escaping + L3 email fallback

`src/app/api/custom-product-submit/route.ts`

- Added `escapeHtml()` helper and applied to all free-text fields in the email template.
- Email fallback (`ragheed@aqliya.com`) restricted to `NODE_ENV=development`.
- Added guard: if `REQUEST_RECEIVER_EMAIL` or `REQUEST_SENDER_EMAIL` is empty in production, email is skipped with a warning.

---

## Validation

| Check | Result |
|---|---|
| `npx eslint` (targeted on 5 files) | 0 errors, 1 pre-existing warning |
| `npx tsc --noEmit` | 0 errors |
| Pre-commit hook (eslint + prettier) | PASS |

### Remaining pre-existing warning

`escapeHtmlAttr` defined but unused in `src/app/api/office-ai/download/route.ts:38` — not part of this change.

---

## Behavioral Changes

- **`/api/pilot-review`:** still public, now rate-limited and security-headered.
- **`getAuditActor()` in development:** requires `AUDIT_DEV_FALLBACK_ENABLED=true` env var. Without it, unauthenticated requests throw an auth error.
- **Custom product email:** will not send in production unless `REQUEST_RECEIVER_EMAIL` and `REQUEST_SENDER_EMAIL` are explicitly set.

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Regression in dev workflow | dev fallback still works with explicit env flag |
| Email delivery stops in production | env vars were always intended to be set; fallback was an undocumented convenience |
| Filename sanitizer returns empty | fallback ensures a valid filename is always present |

---

## Next Steps (Not Blockers)

1. **P3:** Remove unused `escapeHtmlAttr` from `src/app/api/office-ai/download/route.ts`.
2. **P2/P3:** Add `Strict-Transport-Security` to `src/middleware-security.ts` as separate change (depends on deployment model review).
