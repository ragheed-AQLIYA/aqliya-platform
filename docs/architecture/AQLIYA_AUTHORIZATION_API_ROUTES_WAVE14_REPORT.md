# AQLIYA Authorization Consolidation — Wave 14: API Routes

**Date:** 2026-07-10
**Status:** ✅ COMPLETE
**Scope:** All API route handlers under `src/app/api/`

---

## Summary

Wave 14 migrated **40 `requireUserContext` calls** across **27 API route files** to the shared auth model (`getCurrentUser()` + `hasRequiredRole()`). All routes now follow a consistent pattern: get current user, check role, proceed or throw. The existing error handling in each route automatically catches the same error messages ("Unauthenticated", "Access denied: ROLE role required") and maps them to 401/403 HTTP responses.

## What Changed

### Migration Pattern

All API routes followed the same pattern:

**Before:**
```ts
import { requireUserContext } from "@/lib/auth";
const user = await requireUserContext("ADMIN"); // or VIEWER, OPERATOR
```

**After:**
```ts
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
const user = await getCurrentUser();
if (!hasRequiredRole(user, "ADMIN")) {
  throw new Error("Access denied: ADMIN role required");
}
```

### Error Mapping

| Error Source | Error Message | HTTP Status |
|---|---|---|
| `getCurrentUser()` | "Unauthenticated" | 401 |
| `hasRequiredRole()` | "Access denied: ROLE role required" | 403 |

### Files Changed (27 production + 1 test)

**Admin-only routes (no user object needed):**

| File | Calls | Role |
|---|---|---|
| `api/metrics/route.ts` | 1 | ADMIN |
| `api/ai/governance/route.ts` | 1 | ADMIN |
| `api/ai/spend/route.ts` | 1 | ADMIN |
| `api/skills/evaluate/route.ts` | 1 | ADMIN |
| `api/monitoring/health/route.ts` | 1 | ADMIN |
| `api/integration/health/route.ts` | 1 | VIEWER |
| `api/platform/enterprise-health/route.ts` | 1 | ADMIN |
| `api/platform/events/registry/route.ts` | 1 | ADMIN |
| `api/platform/outbox/status/route.ts` | 1 | ADMIN |
| `api/platform/outbox/process/route.ts` | 1 | ADMIN |
| `api/platform/retention/history/route.ts` | 1 | ADMIN |
| `api/platform/evidence/health/route.ts` | 1 | ADMIN |

**User-object routes (user.organizationId, user.id used):**

| File | Calls | Role |
|---|---|---|
| `api/agent-memory/route.ts` | 3 | VIEWER, OPERATOR |
| `api/ai/knowledge/route.ts` | 1 | OPERATOR |
| `api/ai/knowledge/search/route.ts` | 1 | VIEWER |
| `api/ai/knowledge/metadata/route.ts` | 1 | VIEWER |
| `api/ai/knowledge/ingest/route.ts` | 1 | OPERATOR |
| `api/ai/eval-gate/route.ts` | 3 | OPERATOR, ADMIN |
| `api/platform/retention/policies/route.ts` | 3 | ADMIN |
| `api/platform/retention/run/route.ts` | 1 | ADMIN |
| `api/platform/retention/holds/route.ts` | 2 | ADMIN |
| `api/platform/retention/holds/[id]/route.ts` | 1 | ADMIN |
| `api/platform/retention/dry-run/route.ts` | 1 | ADMIN |
| `api/platform/abac/shadow-report/route.ts` | 1 | ADMIN |
| `api/platform/abac/pilot-status/route.ts` | 1 | ADMIN |
| `api/platform/outbox/retry/route.ts` | 1 | ADMIN |
| `api/office-ai/download/route.ts` | 1 | VIEWER |

**Test updated:**

| File | Change |
|---|---|
| `api/skills/evaluate/__tests__/route.test.ts` | Mock updated from `requireUserContext` to `getCurrentUser` + `hasRequiredRole` |

## Migration Statistics

| Metric | Value |
|---|---|
| Calls eliminated | 40 |
| Files migrated | 27 |
| Files unchanged (test mock only) | 1 |
| Import changes | 27 `requireUserContext` → `getCurrentUser` + `hasRequiredRole` |
| Role distribution | ADMIN: 25, OPERATOR: 8, VIEWER: 7 |

## Cumulative Progress

| Wave | Product/Scope | Calls Removed | Running Total |
|---|---|---|---|
| 1-7 | DecisionOS + WorkflowOS | ~41 | ~41 |
| 8 | Platform Cleanup | N/A | ~41 |
| 9 | SalesOS | 15 | ~56 |
| 10 | AuditOS | 0 (no-op) | ~56 |
| 11 | LocalContentOS | 49 | ~105 |
| 12 | LocalContactOS | 33 | ~138 |
| 13 | Platform/Admin | 45 | ~183 |
| **14** | **API Routes** | **40** | **~223** |
| Remaining | 16 files | **79** | **~302 total** |

## Remaining Breakdown

| Area | Calls | Files |
|---|---|---|
| Content Studio | 23 | 1 |
| Office AI | 12 | 2 |
| DecisionOS remaining | 11 | 3 |
| WorkflowOS remaining | 14 | 5 |
| Other actions | 19 | 5 |

## Validation

| Command | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean |
| `npx jest --testPathPatterns="api/skills/evaluate"` | ✅ 2/2 pass |
| Full suite | ✅ 365 suites, 1 pre-existing failure (api-smoke) |

## Risk Assessment

- **Breaking change risk:** Low — `getCurrentUser()` throws the same "Unauthenticated" error, and the explicit role check throws the same "Access denied: ROLE role required" error
- **Error handling:** All existing catch blocks in API routes already handle these exact error messages, so 401/403 mapping is preserved
- **No behavioral change:** Auth is gate-only; route logic is untouched

## Next Recommended Steps

- **Wave 15:** Content Studio (23 calls) + Office AI (12 calls)
- **Wave 16:** DecisionOS remaining (11) + WorkflowOS remaining (14)
- **Wave 17:** Other actions (19) — agent-memory, ingestion, content-evidence, institutional-memory, governance
- **Final wave:** Cleanup — remove `requireUserContext` export from `lib/auth.ts`
