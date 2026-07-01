# Phase 4 — Observability & Auditability Assessment

**Date:** 2026-05-28
**Agent:** Observability & Auditability Agent
**Status:** Assessment complete

---

## Files Inspected

| File | Role |
|------|------|
| `src/lib/platform/audit-log.ts` | Core PlatformAuditLog write helper |
| `src/lib/platform/audit-logger.ts` | AuditLogger factory (binds product/org/actor context) |
| `src/lib/audit/actor-context.ts` | AuditOS actor resolution |
| `src/lib/governance/actor-lineage.ts` | Actor lineage helpers |
| `prisma/schema.prisma` (model PlatformAuditLog) | Audit event schema |
| `src/lib/rate-limit.ts` | In-memory rate limiter |
| `src/lib/audit/rate-limit.ts` | Audit per-action rate limiter |
| `src/lib/audit/export-service.ts` | Export package builder |
| `src/app/api/audit/evidence/[evidenceId]/download/route.ts` | Evidence download (with audit) |
| `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | LC report download (with audit) |
| `src/app/api/workflowos/documents/[documentId]/download/route.ts` | WorkflowOS doc download (with audit) |
| `src/app/api/office-ai/download/route.ts` | Office AI download (with audit) |
| `sentry.server.config.ts` | Error monitoring |
| `next.config.mjs` | Build config (includes Sentry) |

---

## Mutation Coverage Map

### AuditOS

| Mutation | Audit Event | Source |
|----------|-------------|--------|
| Evidence download | `evidence.download` via platform auditLogger | `download/route.ts:80-88` |
| Financial statement export | Audit events in export-service | `export-service.ts` |
| Review/approval | Via AuditEvent model | Various |

### LocalContentOS

| Mutation | Audit Event | Source |
|----------|-------------|--------|
| Report download | `report.download` via platform auditLogger | `download/route.ts:73-87` |
| Supplier/spend/evidence/finding create/update/delete | Audit events + platform AuditEvent | Various actions |

### WorkflowOS

| Mutation | Audit Event | Source |
|----------|-------------|--------|
| Document download | `document.download` via platform auditLogger | `download/route.ts:38-52` |
| Record mutations | SunbulAuditEvent | Various |

### Office AI Assistant

| Mutation | Audit Event | Source |
|----------|-------------|--------|
| Output download | `output.download` via platform auditLogger | `download/route.ts:105-119` |
| Task mutations | Via auditLogger | Various |

---

## Audit Coverage Gaps

| Priority | Gap | Impact |
|----------|-----|--------|
| P1 | **No generic mutation audit helper pattern** — each product implements its own audit logging. Some use platform auditLogger, some use legacy AuditEvent, some use SunbulAuditEvent. | Fragmented audit trail; hard to query across products |
| P1 | **Four separate audit models** — PlatformAuditLog, AuditLog, AuditEvent, SunbulAuditEvent. Not merged. | Data duplication; query complexity |
| P1 | **No operational health event type** — no system-level events for startup, migration, backup, deployment | Ops blind spots |
| P2 | **No structured error event schema** — errors are logged as generic "error" severity without standard error context fields | Hard to aggregate errors across products |
| P2 | **console.warn in writePlatformAuditLog** — silent failures are logged via console.warn on audit write failure (`audit-log.ts:148`) | Write failures silently degrade audit trail |
| P2 | **Evidence download already logged twice** — once in auditLogger + once via console.error on failure | Minor noise |

---

## Operational Logging Recommendations

| Priority | Recommendation |
|----------|----------------|
| P1 | Add a standardized `auditLogMutation(actor, target, action, metadata)` helper that unifies the audit logging pattern across all products (different from the existing logger, this would be a thin action-level wrapper) |
| P1 | Add operational health events (server start, migration success, backup, deployment) to PlatformAuditLog via a system actor |
| P2 | Add error context fields (errorCode, httpStatus, component, stack exists flag) to structured audit errors |
| P2 | Add periodic audit log health check (verify writes work, check for recent events per product) |

---

## Silent-Failure Areas

| Area | Risk | Current Behavior |
|------|------|------------------|
| `writePlatformAuditLog` safe mode | Audit events silently fail | Returns `{ ok: false, error }` but caller may ignore |
| `console.warn` on audit failure | Ops may not notice | No alert, no metrics |
| Sentry not configured | Error monitoring absent in dev | `SENTRY_DSN` is empty string in `.env.example` — enabled only in production |
| In-memory rate limiter | Ops cannot see rate limit hits | No metrics on rate limit enforcement |
| Demo fallback actor | Ops may not realize demo fallback is active | Only logged via console.warn |

---

## Founder Visibility Checklist

| Need | Status |
|------|--------|
| See who did what | ✅ PlatformAuditLog tracks actorId, actorName, actorEmail |
| See when it happened | ✅ createdAt timestamp on all audit events |
| See what changed | ✅ productKey, action, targetType, targetId tracked |
| See across products | ⚠️ Fragmented across 4 models — requires UNION query |
| See failed actions | ⚠️ No structured error schema |
| See export activity | ✅ Download routes all log via auditLogger |
| See review/approval events | ✅ AuditOS captures approval records |
| See AI activity | ✅ aiProvider, aiModel, aiOutputReviewStatus tracked |
| See rate limit enforcement | ❌ Not logged |
| See deployment events | ❌ Not implemented |

---

## Assessment Summary

| Dimension | Maturity |
|-----------|----------|
| Audit trail completeness | L4 (most mutations tracked) |
| Audit model unification | L2 (4 separate models) |
| Operational events | L1 (not implemented) |
| Error observability | L3 (Sentry configured, structured errors missing) |
| Rate limit visibility | L1 (not logged) |
| Audit write reliability | L3 (safe mode + console.warn) |
