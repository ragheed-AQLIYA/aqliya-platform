# AQLIYA Pre-Client Demo Route Fix Report

**Date:** 2026-05-22
**Author:** OpenCode Agent
**Status:** Complete

## Summary

- Fixed syntax error in `about/page.tsx` (stray `>` causing 500s across all marketing routes)
- Confirmed `not-found.tsx` works correctly (returns 404 for unknown routes)
- Reviewed `published/recommendation/[decisionId]` — legacy published route; protection handled within action, not route-level
- Fixed `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` — was returning 500 instead of 401 for unauthenticated requests
- Ran comprehensive route verification: all 29 marketing routes return 200, all 6 demo routes return 200, auth routes 200, workspace routes 307, /api/health 200, unknown routes 404
- Full validation: `npx tsc --noEmit` passes, `npm run lint` passes (0 errors, 169 pre-existing warnings), `npm run build` passes

## Product/System Affected

- Product: Platform (Core)
- Area: Marketing routes, API routes, Error handling
- Completion level before: N/A (bug fix)
- Completion level after: All routes return correct status codes

## Files Changed

- `src/app/(marketing)/about/page.tsx` — removed stray `>` character and 3 trailing lines (259–262: `>`, `</div>`, `);`, `}`)
- `src/app/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf/route.ts` — added explicit check for `"Unauthenticated"` role in user data before catch-all

## Files Reviewed (No Change)

- `src/app/not-found.tsx` — confirmed working correctly
- `src/app/published/recommendation/[decisionId]/page.tsx` — legacy published route; action `getPublishedRecommendationViewAction` handles auth protection internally

## Route Verification Results

| Route Group | Routes | Expected | Actual |
|---|---|---|---|
| Marketing (about, privacy, terms, security, etc.) | 29 | 200 | Pass |
| Demo (auditos/solution, audit-trial, etc.) | 6 | 200 | Pass |
| Auth (login, access-denied) | 2 | 200 | Pass |
| Workspaces (audit, decisions, local-content) | 3 | 307 | Pass |
| Published (recommendation/{id}) | 1 | 200 | Pass |
| /api/health | 1 | 200 | Pass |
| Unknown route | 1 | 404 | Pass |
| /api/sunbul export PDF (unauthenticated) | 1 | 401 | Pass |

## Governance Check

- RBAC: Not affected (no RBAC changes)
- Tenant isolation: Not affected
- Evidence: Not affected
- Audit trail: Not affected
- Review/approval: Not affected
- Export control: Sunbul export route now returns proper 401 instead of 500 on auth failure
- AI boundary: Not affected

## Validation

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Pass (0 errors, 169 pre-existing warnings) |
| `npm run build` | Pass (63 pages, 37.3s) |
| `npm test` | Not run (no tests affected by changes) |

## Known Limitations

- 169 pre-existing lint warnings remain (all unused-vars)
- Published recommendation route protection depends on `getCurrentUser()` returning null for anonymous users — if middleware changes, this should be reviewed
- No middleware-level guard for published routes (by design — published routes are intentionally public)

## Next Recommended Step

1. Resolve pre-existing lint warnings in targeted areas before new feature work
2. Consider adding middleware-level protection to any API route that accesses tenant data
3. Document route map in `ROUTE_STRATEGY.md` if any routes change in future
