# LocalContentOS v0.1 — /local-content Route 404 Debug Report

## Date

2026-05-21

## Status

**FIXED** — All routes confirmed working in Turbopack dev server.

---

## Root Causes (Two-fold)

### 1. Stale Node.js Process on Port 3000 (Primary)

- A previous `next dev` process (PID 68376) was still bound to port 3000.
- Fresh dev server fell back to port 3002.
- Browser was pointed at port 3000, hitting the stale server which may have had inconsistent state.

### 2. Turbopack Proxy Incompatibility (Secondary — Actual 404)

After killing the stale process:

- **Stray lockfile**: Turbopack detected `C:\Users\PC\package-lock.json` alongside `C:\Users\PC\Documents\Aqliya\package-lock.json` and inferred the workspace root as `C:\Users\PC\` instead of the project directory. This caused Turbopack to fail resolving route files.
- **Deprecated middleware convention**: `middleware.ts` uses a deprecated convention in Next.js 16.2.4. Turbopack's internal proxy conversion mishandled server-rendered page routing. Client Components (e.g., `/login`) worked, but all Server Components returned 404 with the custom not-found page rendering.

---

## Evidence

| Test                          | Before Fix (Turbopack) | After Fix (Turbopack) |
| ----------------------------- | ---------------------- | --------------------- |
| `GET /`                       | 404                    | 200                   |
| `GET /login`                  | 200                    | 200                   |
| `GET /local-content`          | 404                    | 200 (62KB HTML)       |
| `GET /local-content/projects` | 404                    | 200                   |
| `GET /audit`                  | 404                    | 307 (redirect)        |

Dev server logs before fix:

```
GET /local-content 404 in 375ms (next.js: 143ms, proxy.ts: 89ms, application-code: 143ms)
```

Note: `proxy.ts: 89ms` confirmed the proxy was executing but routing was broken.

Turbopack lockfile warning before fix:

```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\PC\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config
```

---

## Fix Applied

1. **Killed stale process** (PID 68376) binding port 3000.
2. **Set explicit `turbopack.root`** in `next.config.mjs`:
   ```js
   turbopack: {
     root: "C:/Users/PC/Documents/Aqliya",
   },
   ```
   Absolute path used instead of `process.cwd()` to avoid potential cwd resolution issues in Turbopack's evaluation context.
3. **Renamed `middleware.ts` → `proxy.ts`** per Next.js 16.2.4 deprecation, updating the export:

   ```ts
   // Before (middleware.ts)
   export default function middleware(request: NextRequest) { ... }

   // After (proxy.ts)
   export function proxy(request: NextRequest) { ... }
   ```

4. **Deleted stale `.next` cache**.

---

## Files Changed

| File              | Change                                        |
| ----------------- | --------------------------------------------- |
| `next.config.mjs` | Set `turbopack.root` to absolute project path |
| `proxy.ts` (new)  | Renamed from `middleware.ts`; updated export  |
| `middleware.ts`   | **DELETED** (replaced by proxy.ts)            |

---

## Validation

| Command            | Result                                             |
| ------------------ | -------------------------------------------------- |
| `npx tsc --noEmit` | PASS — 0 errors                                    |
| `npm run lint`     | PASS — 0 errors, 174 pre-existing warnings         |
| `npm run build`    | PASS — all routes compiled including local-content |

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
```

---

## Known Limitations

1. `src/middleware.ts` still exists in the source tree as dead code. It defines auth-protected paths that are NOT currently enforced (only `proxy.ts` at root handles requests). These should be merged into `proxy.ts` in a follow-up.
2. `C:\Users\PC\package-lock.json` (stray lockfile in HOME) still exists. It does not affect routing with the explicit `turbopack.root` set, but should be cleaned up to avoid future confusion.
3. `proxy.ts` is still labeled as `ƒ Proxy (Middleware)` in the build output — this is cosmetic and expected with `--webpack` flag.

---

## Next Recommended Step

~~Merge `src/middleware.ts` auth logic into `proxy.ts` to restore route protection for `/audit`, `/decisions`, `/sales`, etc. Currently these routes are unprotected because only the intl/rate-limit middleware runs.~~

**COMPLETED 2026-05-21**: Auth protection restored in `src/proxy.ts` using `next-auth/jwt` `getToken`. All protected routes redirect to `/login` for unauthenticated users. See `docs/reports/aqliya-next16-proxy-auth-restoration-report.md`.
