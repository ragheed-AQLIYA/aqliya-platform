# AQLIYA Stabilization — Phase 2 Completion Report
## Security & Workflow Hardening

## Summary

Phase 2 executed: tenant enforcement on all AuditOS read actions, organization-scoped dashboard queries, admin event fix, Gulf Trading data reconciliation, evidence event-path routing, and audit events for status changes. No new features added. No validation/publication models touched.

## Files Changed

### Tenant Enforcement — Read Actions

| File | Change |
|---|---|
| `src/actions/audit-read-actions.ts` | **Rewritten** — every read action now calls `getAuditActor()`, `requireRole()`, and `assertEngagementAccess()` before accessing data. 16 actions covered. |
| `src/actions/audit-actions.ts` | `getTraceabilityAction` now enforces actor + tenant. `confirmMappingAction` moved here from read-actions with full enforcement + audit event. |
| `src/lib/audit/services.ts` | `getEngagement()` updated to accept `organizationId` parameter for org-scoped reads. `getAuditUsers()` updated to accept `organizationId`. |
| `src/lib/audit/db/index.ts` | `getEngagement()` updated to accept `organizationId` and filter by it. `getAuditUsers()` now accepts optional `organizationId`. |
| `src/lib/audit/export-service.ts` | Updated `getEngagement` call to pass `undefined` (caller already verifies tenant). |
| `src/app/audit/engagements/[engagementId]/page.tsx` | Added `getAuditActor()` + `assertEngagementAccess()` in server component. Passes `actor.organizationId` to `getEngagement()`. |
| `src/app/audit/page.tsx` | Updated `getAuditUsers()` call to pass `actor.organizationId`. |
| `src/components/audit/mapping/mapping-page.tsx` | Updated import: `confirmMappingAction` now from `audit-actions` (not `audit-read-actions`). |

### Organization Scoping — Dashboard Queries

| File | Change |
|---|---|
| `src/lib/audit/db/index.ts` | `getDashboardSummary` — events, findings, evidence, and mappings now filtered by `engagement.organizationId` when `organizationId` is provided. Previously only engagements were filtered. |

### Admin Events Fix

| File | Change |
|---|---|
| `src/actions/audit-admin-actions.ts` | **Rewritten** — removed `recordAuditEvent` import and direct call. New `recordOrgEvent()` helper fetches any engagement from the actor's org for audit event attachment, or logs a warning if none exists. Prevents foreign-key violations from empty `engagementId`. |

### Evidence Event Path

| File | Change |
|---|---|
| `src/components/audit/evidence/evidence-page.tsx` | Verify and Mark Reviewed buttons now call `updateEvidenceStateWithEventAction` (records audit event) instead of `updateEvidenceStateAction` (event-free). |

### Audit Events for Status Changes

| File | Change |
|---|---|
| `src/lib/audit/services.ts` | `updateFindingStatus` now records `finding.state_changed` event. `updateRecommendationStatus` now records `recommendation.state_changed` event. `updateReviewCommentStatus` now records `review.comment_resolved` event when status transitions to `resolved`. |

### Data Reconciliation

| File | Change |
|---|---|
| `prisma/seed-audit.ts` | `map-8` creditAmount: `SAR(-20000)` → `SAR(95000)` (matches TB line). `map-12` creditAmount: `SAR(1200000)` → `SAR(705000)` (matches TB line). `map-21` sourceAccountId: `tb-line-21` → `tb-line-22` (account 5070 now correctly mapped). |
| `src/lib/audit/mock-data.ts` | `map-8` creditAmount: `SAR(-20000)` → `SAR(95000)`. `map-12` creditAmount: `SAR(1200000)` → `SAR(705000)`. `map-12` sourceAccountId: `tb-line-12` → `tb-line-13` (now correctly references Retained Earnings line). |
| `src/app/audit/engagements/[engagementId]/page.tsx` | Removed hardcoded "Sundry Income (5100) has no confirmed mapping" — both seed and mock data define confirmed `map-22` for account 5100. |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `npm run build` | **Pass** | Compiled successfully (webpack). TypeScript check passed in build phase. |
| `npm run lint` | **Fail** (72 errors, 165 warnings) | Error count unchanged from Phase 1 — all pre-existing in files not modified by this phase. |
| `npm run audit:health` | **Pass** | 7/7 checks: DB connected, 2 engagements, 28 events, 5 AI outputs, 9 users, 0 open blockers. |

## Remaining P0 Items

From the stabilization plan, only these P0 items remain:

1. **Add Prisma models and actions for validation persistence** — excluded from Phase 2 scope
2. **Implement real publish mutation** — excluded from Phase 2 scope

All other P0 items from the stabilization plan are now complete.

## Next Recommended Phase

**Phase 3 — Workflow Completion**

Recommended focus:
1. Implement validation persistence (Prisma models: `AuditValidationRun`, `AuditValidationIssue`, `AuditValidationDisposition` + server actions)
2. Implement publish lifecycle (publish mutation, status transition, audit event)
3. Establish clean validation baseline (fix Jest `server-only` import, fix tsconfig `.next/types` include)
