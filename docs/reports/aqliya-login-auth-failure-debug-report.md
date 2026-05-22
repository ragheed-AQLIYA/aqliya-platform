# AQLIYA Login/Auth Failure Debug Report

## 1. Executive Summary

**FIXED** — Login is now working. Seeded credentials `admin@aqliya.com` / `admin123` authenticate successfully. Protected workspace routes redirect to `/login` when unauthenticated and render when authenticated. Callback URL redirect works after login.

Three root causes were identified and fixed:

1. **NEXTAUTH_URL mismatch** — `.env` had port 3001, dev server runs on port 3000
2. **Loading state never reset** — Login form left button in permanent "جارٍ تسجيل الدخول..." state after any error
3. **Missing seed data** — Admin user did not exist in the database

## 2. User-Visible Symptom

- `/login` loads correctly
- Submitting `admin@aqliya.com` / `admin123` shows: `حدث خطأ في الاتصال. حاول مرة أخرى.`
- Button stays in loading state: `جارٍ تسجيل الدخول...`
- No redirect occurs
- Protected workspace routes remain inaccessible

## 3. Root Cause

### 3.1 NEXTAUTH_URL Port Mismatch (Primary)

`.env` contained `NEXTAUTH_URL="http://localhost:3001"` but the dev server runs on port 3000. This caused:

- `/api/auth/providers` returned URLs pointing to port 3001:
  ```json
  "signinUrl":"http://localhost:3001/api/auth/signin/credentials"
  "callbackUrl":"http://localhost:3001/api/auth/callback/credentials"
  ```
- NextAuth internal CSRF/callback flow could fail when constructed URLs pointed to a non-existent port

### 3.2 Loading State Never Reset (UX Blocker)

The `handleSubmit` function in `src/app/login/page.tsx` called `setLoading(true)` but never called `setLoading(false)` in any code path. This left the submit button permanently disabled after any login attempt, preventing retry without a full page refresh.

### 3.3 Missing Seed Data (Data Issue)

The admin user (`admin@aqliya.com`) did not exist in the database at the time of the manual QA test. When `authorize()` returns `null` (user not found), NextAuth should return a credentials error, but combined with the NEXTAUTH_URL mismatch and the loading state bug, the user saw a connection error instead.

## 4. Fix Applied

| File                     | Change                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env`                   | Changed `NEXTAUTH_URL` from `http://localhost:3001` to `http://localhost:3000`; added `AUTH_URL=http://localhost:3000` for Auth.js v5 compatibility                              |
| `src/app/login/page.tsx` | Added `setLoading(false)` in all error/edge paths; added callback URL redirect support; removed unused `useRouter` import; added `else` branch for unexpected `signIn` responses |
| Database                 | Seeded admin user via `npx tsx prisma/seed.ts`                                                                                                                                   |

### Login form changes detail:

- `catch` block: added `setLoading(false)`
- `res?.error` branch: added `setLoading(false)`
- `res?.ok && !session?.user` branch: added `setLoading(false)`
- New `else` branch for `!res?.error && !res?.ok`: shows "حدث خطأ غير متوقع" and resets loading
- Successful login now reads `callbackUrl` from URL search params and redirects there
- Removed unused `useRouter` import and `router` variable

## 5. Auth Flow Verification

| Check                           | Expected                         | Actual                                                                                                         | Result |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| `/login` loads                  | 200                              | 200                                                                                                            | PASS   |
| `/api/auth/session`             | JSON (null when unauth)          | `null`                                                                                                         | PASS   |
| `/api/auth/providers`           | JSON with credentials, port 3000 | `{"credentials":{"id":"credentials",...,"callbackUrl":"http://localhost:3000/api/auth/callback/credentials"}}` | PASS   |
| `/api/auth/csrf`                | JSON with csrfToken              | `{"csrfToken":"..."}`                                                                                          | PASS   |
| Credentials sign-in (valid)     | Redirect to workspace            | Redirected to `/local-content` (with callbackUrl)                                                              | PASS   |
| Credentials sign-in (invalid)   | Error message, button reset      | "بريد إلكتروني أو كلمة مرور غير صحيحة", button clickable                                                       | PASS   |
| Protected route unauthenticated | Redirect to `/login`             | 307 → `/login?callbackUrl=...`                                                                                 | PASS   |
| Protected route authenticated   | Page renders                     | Pages render for `/local-content`, `/audit`, `/decisions`, `/assistant`                                        | PASS   |
| Callback URL after login        | Redirect to callbackUrl          | `/local-content` renders after login from `/local-content` redirect                                            | PASS   |
| Sign out                        | Clears session, redirects to `/` | Works                                                                                                          | PASS   |

## 6. Seed/User Verification

- User `admin@aqliya.com` EXISTS in database
- Role: `ADMIN`
- Organization: `AQLIYA Demo Organization`
- Password hash: present (bcrypt, 10 rounds)
- Organization has `platformOrganizationId: null` (expected for seed org)

## 7. Proxy Verification

| Route                     | Expected                 | Actual                               | Result |
| ------------------------- | ------------------------ | ------------------------------------ | ------ |
| `/api/auth/*`             | Public, never redirected | Passes through with security headers | PASS   |
| `/login`                  | Public                   | 200                                  | PASS   |
| `/`                       | Public                   | 200                                  | PASS   |
| `/local-content` (unauth) | Redirect to `/login`     | 307                                  | PASS   |
| `/audit` (unauth)         | Redirect to `/login`     | 307                                  | PASS   |
| `/decisions` (unauth)     | Redirect to `/login`     | 307                                  | PASS   |
| `/assistant` (unauth)     | Redirect to `/login`     | 307                                  | PASS   |
| `/sales` (unauth)         | Redirect to `/login`     | 307                                  | PASS   |
| `/settings` (unauth)      | Redirect to `/login`     | 307                                  | PASS   |
| `/organizations` (unauth) | Redirect to `/login`     | 307                                  | PASS   |
| `/monitoring` (unauth)    | Redirect to `/login`     | 307                                  | PASS   |
| `/sunbul` (unauth)        | Redirect to `/login`     | 307                                  | PASS   |
| `/workflowos` (unauth)    | Redirect to `/login`     | 307                                  | PASS   |

## 8. Validation Results

| Command                   | Result | Notes                                               |
| ------------------------- | ------ | --------------------------------------------------- |
| `npx prisma validate`     | PASS   | Schema valid                                        |
| `npx prisma generate`     | PASS   | Client generated                                    |
| `npx tsc --noEmit`        | PASS   | 0 errors                                            |
| `npm run lint`            | PASS   | 0 errors, 174 pre-existing warnings                 |
| `npm run build`           | PASS   | All routes compiled, ƒ Proxy (Middleware) confirmed |
| `npm test -- --runInBand` | PASS   | 22 suites, 206 tests                                |

## 9. Remaining Risks

1. **Decisions page static rendering error** — Pre-existing: `/decisions` route uses `headers()` which prevents static rendering. This is a runtime warning during build, not a login blocker.
2. **`/assistant` console 404** — Browser DevTools shows a 404 for `/assistant` (RSC chunk), but the page renders correctly with HTTP 200. This appears to be a Turbopack dev-mode issue with RSC streaming, not an auth issue.
3. **`.env` port assumption** — The fix hardcodes port 3000. If a different port is used, `NEXTAUTH_URL` and `AUTH_URL` must be updated accordingly. The `.env.example` correctly shows port 3000.
4. **No `AUTH_TRUST_HOST` in production** — `trustHost: true` in auth-config.ts is fine for development but should be reviewed for production deployment.

## 10. Next Recommended Step

Continue LocalContentOS browser QA. The login blocker is resolved. A human QA reviewer can now log in with seeded credentials and complete the remaining browser smoke items.
