# AQLIYA Next.js 16 Proxy Auth Restoration Report

## Date

2026-05-21

## Status

**PASS** — Auth protection fully restored for all protected workspace routes.

---

## 1. Executive Summary

After the `middleware.ts` → `proxy.ts` migration to fix the `/local-content` 404, auth protection was inadvertently lost. The proxy was not being registered by Next.js 16's middleware manifest, meaning no route was being auth-checked. The root cause was that `proxy.ts` placed at the project root was not detected by Next.js 16.2.4. Moving the file to `src/proxy.ts` resolved detection, and the next-intl middleware was found to break public routes when invoked from `src/`. Skipping intl for public routes while keeping it for authenticated protected routes restored full functionality.

---

## 2. Root Cause

1. **Proxy file location**: Next.js 16.2.4 did not register `proxy.ts` at the project root into the middleware manifest (both middleware-manifest.json files were empty `{}`). Moving to `src/proxy.ts` fixed the registration.
2. **next-intl middleware compatibility**: When `src/proxy.ts` invokes `createMiddleware` from next-intl for public routes, it caused all public routes (/, /login, /auditos, /products/\*) to return 404. Skipping intl middleware for public non-API routes resolved this. Authenticated workspace routes still receive full intl processing.
3. **Stale `src/middleware.ts`**: The old auth middleware file was deleted to prevent conflicts with the new proxy.

---

## 3. Files Changed

| File                   | Change                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| `src/proxy.ts` (new)   | Auth-protected proxy with `getToken`, protected paths, redirect to `/login` |
| `proxy.ts` (root)      | **DELETED** — not detected by Next.js 16.2.4                                |
| `src/middleware.ts`    | **DELETED** — deprecated, conflicting with proxy                            |
| `middleware.ts` (root) | **DELETED** — previously replaced by proxy.ts                               |
| `next.config.mjs`      | `turbopack.root` restored to absolute path                                  |

---

## 4. Auth Protection Result

### Protected Routes (unauthenticated)

| Route                     | Expected             | Actual                                      | Pass/Fail |
| ------------------------- | -------------------- | ------------------------------------------- | --------- |
| `/local-content`          | Redirect to `/login` | 307 → `/login?callbackUrl=%2Flocal-content` | PASS      |
| `/local-content/projects` | Redirect to `/login` | 307                                         | PASS      |
| `/audit`                  | Redirect to `/login` | 307 → `/login?callbackUrl=%2Faudit`         | PASS      |
| `/decisions`              | Redirect to `/login` | 307 → `/login?callbackUrl=%2Fdecisions`     | PASS      |
| `/assistant`              | Redirect to `/login` | 307                                         | PASS      |
| `/sales`                  | Redirect to `/login` | 307                                         | PASS      |
| `/settings`               | Redirect to `/login` | 307                                         | PASS      |
| `/sunbul`                 | Redirect to `/login` | 307                                         | PASS      |
| `/workflowos`             | Redirect to `/login` | 307                                         | PASS      |
| `/organizations`          | Redirect to `/login` | 307                                         | PASS      |
| `/monitoring`             | Redirect to `/login` | 307                                         | PASS      |

### Public Routes

| Route                     | Expected | Actual | Pass/Fail |
| ------------------------- | -------- | ------ | --------- |
| `/`                       | 200      | 200    | PASS      |
| `/login`                  | 200      | 200    | PASS      |
| `/products/local-content` | 200      | 200    | PASS      |
| `/products/audit`         | 200      | 200    | PASS      |
| `/auditos`                | 200      | 200    | PASS      |
| Non-existent route        | 404      | 404    | PASS      |

---

## 5. Validation

| Command               | Result                                             |
| --------------------- | -------------------------------------------------- |
| `npx tsc --noEmit`    | PASS — 0 errors                                    |
| `npm run lint`        | PASS — 0 errors, 172 pre-existing warnings         |
| `npm run build`       | PASS — all routes compiled including local-content |
| Dev server route test | PASS — all routes verified                         |

Build route manifest confirms:

```
├ ƒ /local-content
├ ƒ /local-content/projects
├ ƒ /local-content/projects/[projectId]
├ ƒ /local-content/projects/[projectId]/approval
├ ƒ /local-content/projects/[projectId]/audit-trail
├ ƒ /local-content/projects/[projectId]/classification
├ ƒ /local-content/projects/[projectId]/evidence
├ ƒ /local-content/projects/[projectId]/findings
├ ƒ /local-content/projects/[projectId]/reports
├ ƒ /local-content/projects/[projectId]/review
├ ƒ /local-content/projects/[projectId]/spend
├ ƒ /local-content/projects/[projectId]/suppliers
ƒ Proxy (Middleware)
```

---

## 6. Remaining Issues

1. **next-intl middleware skipped for public routes**: The `intlMiddleware` from next-intl caused 404 on public routes when invoked from `src/proxy.ts`. Public routes use the root layout's `NextIntlClientProvider` for i18n instead. Authenticated workspace routes still use full intl processing.
2. **`C:\Users\PC\package-lock.json`** stray lockfile remains in HOME directory. Mitigated by `turbopack.root` in next.config.mjs.
3. **Decisions page static rendering error** is pre-existing and unrelated to this fix.

---

## 7. Final Verdict

**PASS** — Proxy/auth protection restored for all protected workspace routes. Authenticated users are allowed through; unauthenticated users are redirected to `/login` with callback URL. No route returns unexpected 404. Public marketing pages, login, and demo routes remain accessible.
