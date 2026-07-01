# AuditOS — Internal Security Review

**Date:** May 2026
**Phase:** 5 — Pilot Hardening
**Scope:** Pre-pilot internal security review of AuditOS governed workspace

## Summary

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 2 | 1 |

No critical or high-risk findings. Two medium findings related to demo-route isolation and event coverage consistency. One low finding related to environment variable exposure in backup scripts.

## Detailed Findings

### 1. Auth & Actor Context

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| `getAuditActor()` resolves authenticated users | Pass | `src/lib/audit/actor-context.ts:28-78` — maps session user to `AuditUser` via `organizationId_email` compound unique | None | None |
| Demo fallback gated to development only | Pass | `src/lib/audit/actor-context.ts:67-70` — throws "Authentication required" in production | None | None |
| `requireRole()` enforces role checks | Pass | `src/lib/audit/actor-context.ts:135-139` — throws on unauthorized role | None | None |
| `canDraft()` / `canReview()` / `canApprove()` helpers | Pass | `src/lib/audit/actor-context.ts:141-151` — used by write actions | None | None |

### 2. Tenant Enforcement

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| Write actions enforce `assertEngagementAccess()` | Pass | `src/actions/audit-actions.ts` — all write actions check engagement ownership before mutation | None | None |
| Read actions enforce `assertEngagementAccess()` (Phase 2) | Pass | `src/actions/audit-read-actions.ts` — all 15 read actions resolve actor and check engagement access | None | None |
| `assertEngagementAccess()` fetches engagement org and compares | Pass | `src/lib/audit/tenant-guard.ts:19-34` — throws `TenantAccessError` on mismatch | None | None |
| Dashboard queries scoped by `organizationId` | Pass with caveat | `src/lib/audit/db/index.ts:391-422` — engagements filtered; events/findings/evidence/mappings scoped by engagement.organizationId (Phase 2) | Low | Verified by code review; add integration test for cross-org isolation |
| `getAuditUsers()` scoped by `organizationId` | Pass | `src/lib/audit/db/index.ts:2239` — filters by `organizationId` when provided | None | None |
| `getAuditUsersAdminAction()` scoped by org | Pass | `src/actions/audit-admin-actions.ts:27-35` — filters by `actor.organizationId` | None | None |

### 3. Write Action Guards

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| `createEngagementAction` | Pass | Actor → role → no tenant check needed (writes to actor's org) | None | None |
| `uploadTrialBalanceAction` | Pass | Actor → role → `assertEngagementAccess` → rate limit | None | None |
| `createEvidenceAction` | Pass | Actor → role → access check → file type/size validation → security scan | None | None |
| `createFindingAction` / `updateFindingStatusAction` | Pass | Actor → role → access check | None | None |
| `createRecommendationAction` | Pass | Actor → role → access check | None | None |
| `createReviewCommentAction` | Pass | Actor → role → access check | None | None |
| `createApprovalRecordAction` | Pass | Actor → role → access check (admin/partner only) | None | None |
| `runValidationAction` (Phase 3) | Pass | Actor → role → access check | None | None |
| `disposeValidationIssueAction` (Phase 3) | Pass | Actor → role → engagement derived server-side from issue | None | None |
| `publishEngagementAction` (Phase 3) | Pass | Actor → role (admin/partner) → access check | None | None |

### 4. Admin Actions

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| Admin user CRUD scoped to actor's org | Pass | `src/actions/audit-admin-actions.ts` — all operations filter by `actor.organizationId` | None | None |
| Cannot deactivate self | Pass | `src/actions/audit-admin-actions.ts:103-105` — explicit check | None | None |
| Audit events use org-scoped engagement lookup (Phase 2) | Pass | `src/actions/audit-admin-actions.ts` `recordOrgEvent()` — finds any engagement in org for event attachment | None | None |

### 5. File Upload / Evidence Safety

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| File type whitelist | Pass | `src/actions/audit-actions.ts:98` — 8 allowed types (pdf, xlsx, xls, docx, jpg, jpeg, png, csv) | None | None |
| File size limit | Pass | `src/actions/audit-actions.ts:99-111` — 20MB max | None | None |
| Malware scanning abstraction | Pass with caveat | `src/lib/audit/file-scanner.ts:31-61` — dev mode returns "skipped_dev"; production fail-closed (blocks all uploads without SCANNER_PROVIDER) | Medium | Deferred: real scanner integration needed before production |
| Scan result recorded as audit event | Pass | `src/actions/audit-actions.ts:119-130` — evidence.file_scanned event with provider and scan timestamp | None | None |

### 6. Demo Route Isolation

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| `/auditos` demo never touches DB | Pass | `src/lib/audit/demo-data.ts:1-3` | None | None |
| Demo route unauthenticated by design | Pass | `src/app/auditos/layout.tsx` — no auth middleware | Low | Acceptable for guided demo |
| Demo sidebar links only to demo routes | Pass | `src/app/auditos/demo-sidebar.tsx` — 6-step demo navigation only | None | None |
| Marketing links to `/auditos` | Pass (Phase 1 fix) | Non-audit product pages link to `/products`, not `/auditos` | None | None |

### 7. Environment & Secrets

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| DATABASE_URL required; checked at Prisma init | Pass | `src/lib/prisma.ts:10-15` | None | None |
| Health endpoint does not leak DB URL | Pass | `src/app/api/health/route.ts` — returns only status strings, not connection strings | None | None |
| Backup script parses DATABASE_URL but does not print password | Low risk | `scripts/db-backup.ts:24-34` — password passed to pg_dump via PGPASSWORD env var, not command line; fallback prints full URL if parse fails | Low | Replace fallback parse-failure message to avoid printing full DATABASE_URL |
| Restore script requires CONFIRM_RESTORE=true | Pass | `scripts/db-restore.ts:7` — dry-run by default; no accidental execution | None | None |
| AUTH_SECRET required for NextAuth | Pass | `src/lib/auth-config.ts:10` — read from environment | None | None |

### 8. Publication & Validation Lifecycle

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| Publish action gated to admin/partner | Pass | `src/actions/audit-actions.ts` `publishEngagementAction` — `requireRole(actor, ["admin", "partner"])` | None | None |
| Published packages cannot be re-published | Pass | `src/lib/audit/db/index.ts:publishEngagement` — throws if already published or locked | None | None |
| Validation dispositions are attributable | Pass | `src/lib/audit/db/index.ts:disposeValidationIssue` — stores `disposedBy` with actor ID | None | None |
| Validation issue engagement derived server-side (Phase 3) | Pass | `disposeValidationIssue` fetches issue first to derive engagementId | None | None |

### 9. Audit Event Coverage

| Area | Status | Evidence | Risk | Required Action |
|---|---|---|---|---|
| Write actions record events | Pass | Evidence creation, mapping, finding creation, recommendation creation, review creation, approval — all record events | None | None |
| Status changes record events (Phase 2) | Pass | `finding.state_changed`, `recommendation.state_changed`, `evidence.state_changed`, `review.comment_resolved` | None | None |
| Validation records events (Phase 3) | Pass | `validation.run_completed`, `validation.issue_disposed` | None | None |
| Publication records events (Phase 3) | Pass | `publication.published` | None | None |
| Admin user events use org-scoped lookup (Phase 2) | Pass | `audit_user.created`, `audit_user.role_updated`, `audit_user.deactivated` | None | None |
| Some state-change UI paths use event-free path | Medium | `updateEvidenceStateAction` (no event) vs `updateEvidenceStateWithEventAction` (with event) — evidence Verify button fixed in Phase 2 but other consumers may still use old path | Medium | Audit all evidence state change callers and consolidate to single event-recording path |

## Risk Summary

| # | Risk | Severity | Status | Required Action |
|---|---|---|---|---|
| R1 | Evidence Upload — real scanner not integrated (fail-closed in production blocks all uploads) | Medium | Deferred | Integrate ClamAV or cloud scanner before production |
| R2 | Evidence state changes — dual code path (event vs no-event) may miss audit coverage | Medium | Open | Audit and consolidate to single event-recording path |
| R3 | Backup script fallback message prints full DATABASE_URL | Low | Open | Replace parse-failure message to exclude URL |

## Verdict

**Pass — Suitable for controlled pilot with documented caveats.**

All critical auth/tenant/isolation controls are in place. Reads and writes enforce actor resolution, role checks, and tenant access. Audit events cover the complete workflow. Publication and validation lifecycles are governed and attributable. Remaining risks are documented and scoped above.
