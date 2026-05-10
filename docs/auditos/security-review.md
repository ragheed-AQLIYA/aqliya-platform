# Security Review

## Server Action Security Checklist

All audit server actions in `src/actions/audit-actions.ts` have been reviewed against this checklist:

| Requirement | Status | Coverage |
|------------|--------|----------|
| `getAuditActor()` resolves actor | ✅ | All 50+ actions |
| `requireRole()` enforces role | ✅ | All mutation actions |
| `assertEngagementAccess()` enforces tenant isolation | ✅ | All 29 actions with engagementId |
| `enforceAuditRateLimit()` prevents abuse | ✅ | All mutation/upload/AI/export actions |
| No `actorId`/`actorName` accepted from UI | ✅ | Actor resolved server-side |
| No direct Prisma in React client components | ✅ | Broken by server actions layer |
| Errors are clear but do not leak sensitive data | ✅ | Standard error messages |

## Role Enforcement Map

| Role | Can Create/Upload | Can Review | Can Approve |
|------|-------------------|------------|-------------|
| admin | ✅ | ✅ | ✅ |
| operator | ✅ | ✅ | ❌ |
| reviewer | ❌ | ✅ | ❌ |
| partner | ❌ | ❌ | ✅ |
| viewer | ❌ | ❌ | ❌ |

## Tenant Isolation

- `assertEngagementAccess()` in `src/lib/audit/tenant-guard.ts`
- 29 server actions guarded
- `getDashboardSummary()` scoped by `organizationId`
- Second org seeded for testing: `org-aqliya-demo-2`

## Rate Limiting

See `docs/auditos/rate-limiting.md`

## File Upload Security

| Requirement | Status |
|------------|--------|
| File type whitelist | ✅ (pdf, xlsx, xls, docx, jpg, jpeg, png, csv) |
| File size limit | ✅ (20 MB) |
| User-facing errors for invalid files | ✅ |
| File hash stored | ✅ |
| Virus scanning | ❌ (documented blocker) |

## Audit Log Integrity

| Requirement | Status |
|------------|--------|
| All material actions create AuditEvent | ✅ |
| AuditEvents not editable from UI | ✅ (no endpoints exist) |
| Actor/timestamp/target metadata present | ✅ |
| Pilot/blocker actions create events | ✅ |
| Export actions create events | ✅ |
| AI actions create events | ✅ |

## Dashboard Scoping

Fixed in Phase 13C. `getDashboardSummary()` now accepts `organizationId` parameter. The dashboard page resolves the actor and passes `actor.organizationId` to scope the data.

## Remaining Production Blockers

| Blocker | Status | Notes |
|---------|--------|-------|
| Virus/malware scanning | ❌ Open | Requires external integration |
| Production auth provisioning | 🔄 In Progress | Core mapping done, admin UI missing |
| Multi-tenant isolation validation | ✅ Resolved | Guard + seed + docs |
| PDF/DOCX export decision | ❌ Open | Awaiting decision |
| Security review | 🔄 In Progress | This document |
| Rate limiting | 🔄 In Progress | In-memory implementation done |
| Backup and monitoring | ❌ Open | Requires infra setup |
