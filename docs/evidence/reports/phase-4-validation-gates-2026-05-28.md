# Phase 4 — Validation Gates

**Date:** 2026-05-28
**Agent:** Validation & Runtime Gate Agent
**Status:** Checklist prepared (NOT executed)
**Rule:** Heavy commands require explicit approval.

---

## Production Build Checklist

| Step | Command | Type | Status |
|------|---------|------|--------|
| 1. Prisma validate | `npx prisma validate` | Light | 🟡 Awaiting approval |
| 2. TypeScript check | `npx tsc --noEmit` | Light | 🟡 Awaiting approval |
| 3. Prisma generate | `npx prisma generate` | Light | 🟡 Awaiting approval |
| 4. ESLint (quiet) | `npm run lint -- --quiet` or `npx eslint src/ --quiet` | Medium | 🔴 Request approval |
| 5. Full build | `npm run build` | Heavy | 🔴 Request approval |
| 6. Full test suite | `npm test` | Heavy | 🔴 Request approval |
| 7. Seed check | `npx tsx prisma/seed.ts` | Medium | 🔴 Request approval |

---

## Runtime Smoke Checklist

| Check | Method | Notes |
|-------|--------|-------|
| Auth: Login page loads | Browser → `/login` | Requires browser |
| Auth: Login succeeds | Browser → login with valid credentials | Requires browser |
| Auth: Unauthenticated redirect | Browser → `/(dashboard)` without session | Requires browser |
| Auth: Access denied | Browser → restricted resource | Requires browser |
| AuditOS: Engagement list loads | Authenticated → `/audit` | Requires browser + seed data |
| AuditOS: Export PDF downloads | Authenticated → engagement → export | Requires browser |
| LocalContentOS: Project loads | Authenticated → `/local-content` | Requires browser + seed |
| LocalContentOS: Report downloads | Authenticated → project → report | Requires browser |
| DecisionOS: Decision list loads | Authenticated → `/decisions` | Requires browser |
| WorkflowOS: Client list loads | Authenticated → `/workflowos` | Requires browser |
| Office AI: Assistant loads | Authenticated → `/assistant` | Requires browser |
| Rate limiting: API rate limit hit | Multiple rapid API calls | Requires script/tool |
| Error boundary: Trigger 404 | Navigate to nonexistent route | Requires browser |
| Error boundary: Trigger error | Cause server action to fail | Requires browser |

---

## Deployment Smoke Checklist

| Check | Method | Notes |
|-------|--------|-------|
| Environment vars set | Verify `.env` or process env | All required vars present |
| Database reachable | `npx prisma db push --accept-data-loss --dry-run` | Light command |
| Build succeeds | `npm run build` | Heavy — request approval |
| Migration runs | `npx prisma migrate deploy` | Heavy — request approval |
| App starts | `npm run start` | Verify no startup errors |
| Base URL accessible | HTTP GET `/` | Verify 200 response |
| Login page accessible | HTTP GET `/login` | Verify 200 response |
| API health check | HTTP GET `/api/health` or `/monitoring` | If endpoint exists |
| Static assets load | Browser → any page | Verify CSS/JS/images |

---

## Post-Build Verification Checklist

| Check | Command | Notes |
|-------|---------|-------|
| No TS errors | `npx tsc --noEmit` | Must show 0 errors |
| No lint errors (quiet) | `npm run lint -- --quiet` | Must show 0 errors |
| All tests pass | `npm test` | Must show all suites pass |
| Prisma validate | `npx prisma validate` | Schema valid |
| Prisma generate succeeds | `npx prisma generate` | Client generated |
| Build output exists | Check `.next/` directory | standalone output |
| No console.log in production | Verify `removeConsole` config | Errors/warn only |

---

## Approval Request

The following heavy commands are NOT yet run:

| Command | Risk | Request |
|---------|------|---------|
| `npm run lint` (full) | Broad scope, may show pre-existing warnings | ✅ Request approval to run |
| `npm run build` | CPU/RAM intensive, requires clean state | ✅ Request approval to run |
| `npm test` (full suite) | Long-running (213 tests) | ✅ Request approval to run |
| Browser automation | Requires running dev server | 🔴 Do not run — manual smoke test only |
| `npx prisma migrate dev` | Destructive | 🔴 Do not run — schema not changed |
| `npx prisma db push` | Schema sync | 🔴 Do not run — schema not changed |

**Light commands already run:** None in this Phase 4 pass (assessment was read-only).

---

## Validation Gate Summary

| Gate | Status | Approval Needed |
|------|--------|-----------------|
| TypeScript check | 🟡 Pending | Light — no approval needed |
| ESLint (quiet) | 🔴 Pending | Medium — request approval |
| Production build | 🔴 Pending | Heavy — request approval |
| Test suite | 🔴 Pending | Heavy — request approval |
| Runtime smoke | 🔴 Pending | Requires build + approval |
| Deployment smoke | 🔴 Pending | Requires deployment + approval |
