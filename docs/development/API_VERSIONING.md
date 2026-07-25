# AQLIYA API Versioning Strategy

> **Status:** Active
> **Last Updated:** 2026-07-24
> **Owner:** Platform Architecture

## Versioning Strategy

AQLIYA uses **URL-based versioning** for public and partner-facing APIs:

```
/api/v1/resource
/api/v2/resource
```

Internal platform APIs (health checks, monitoring, retention) are **not versioned** and are considered stable internal contracts.

---

## Version Lifecycle

| Phase | Duration | Description |
|-------|----------|-------------|
| **Current** | Active | Latest version. Full support, new features. |
| **Supported** | 12 months after next version | Previous version. Bug fixes only. No new features. |
| **Deprecated** | 6 months after supported ends | Returns `Sunset` header. Logs deprecation warnings. |
| **Removed** | After deprecation | Returns `410 Gone` with migration link. |

### Timeline Example

```
v1 released     → Current
v2 released     → v1 becomes Supported
+12 months      → v1 becomes Deprecated (Sunset header active)
+18 months      → v1 removed (410 Gone)
```

---

## Deprecation Policy

When a version enters **Deprecated** status:

1. All responses include `Sunset: <date>` header
2. All responses include `Deprecation: true` header
3. Warning logged server-side on every request
4. Migration guide published in `docs/development/`
5. SDK/changelog notifications sent to affected consumers

### Response Headers

```http
HTTP/1.1 200 OK
Sunset: Sat, 01 Jul 2027 00:00:00 GMT
Deprecation: true
Link: <https://aqliya.com/docs/api/v2-migration>; rel="successor-version"
```

---

## Current API Routes Inventory

### Unversioned Internal APIs

These routes are internal platform APIs and are not subject to versioning:

| Route | Purpose | Auth |
|-------|---------|------|
| `/api/health` | Liveness probe | None |
| `/api/health/ready` | Readiness probe | None |
| `/api/health/live` | Deep liveness | None |
| `/api/platform/health` | Platform health (DB latency) | None |
| `/api/platform/health/enterprise-health` | Enterprise health | Service |
| `/api/platform/health/evidence-health` | Evidence vault health | Service |
| `/api/platform/retention/*` | Data retention management | Admin |
| `/api/platform/outbox/*` | Event outbox management | Service |
| `/api/platform/events/registry` | Event registry | Service |
| `/api/platform/cache/warm` | Cache warming | Service |
| `/api/platform/abac/*` | ABAC pilot status | Admin |
| `/api/platform/siem` | SIEM integration | Service |
| `/api/monitoring/health` | Monitoring health | None |
| `/api/metrics` | Application metrics | Service |
| `/api/notifications/stream` | Notification SSE | Auth |
| `/api/integration/health` | Integration health | Service |

### Product APIs

| Route | Purpose | Auth |
|-------|---------|------|
| `/api/pow/challenge` | PoW challenge generation | None |
| `/api/agent-memory` | Agent memory CRUD | RBAC |
| `/api/skills/evaluate` | Skill evaluation | Auth |
| `/api/audit/evidence/[id]/download` | AuditOS evidence download | Auth + Tenant |
| `/api/audit/engagements/[id]/exports/[format]` | AuditOS engagement exports | Auth + Tenant |
| `/api/local-content/projects/[id]/evidence/[id]/download` | LocalContentOS evidence | Auth + Tenant |
| `/api/local-content/projects/[id]/reports/[id]/download` | LocalContentOS reports | Auth + Tenant |
| `/api/local-content/projects/[id]/audit/export` | LocalContentOS audit export | Auth + Tenant |
| `/api/local-content/metrics` | LocalContentOS metrics | Auth |
| `/api/decisions/[id]/evidence/[id]/download` | DecisionOS evidence | Auth + Tenant |
| `/api/office-ai/download` | Office AI downloads | Auth + Tenant |
| `/api/sales/export` | SalesOS data export | Auth + Tenant |
| `/api/sales/intel/*` | SalesOS intelligence | Auth + OAuth |
| `/api/sales/crm/*` | SalesOS CRM integration | Auth |
| `/api/workflowos/*` | WorkflowOS operations | Auth + Tenant |
| `/api/knowledge-mining/*` | Knowledge mining pipeline | Auth + Tenant |
| `/api/crm/webhook` | CRM webhook receiver | Signature |

### Auth APIs

| Route | Purpose | Auth |
|-------|---------|------|
| `/api/auth/[...nextauth]` | NextAuth handlers | None |
| `/api/auth/mfa/verify` | MFA verification | Auth |
| `/api/auth/saml/[providerId]/*` | SAML SSO flow | Config |

### SCIM APIs

| Route | Purpose | Auth |
|-------|---------|------|
| `/api/scim/v2/Users` | SCIM user provisioning | Token |
| `/api/scim/v2/Users/[id]` | SCIM user operations | Token |
| `/api/scim/v2/Groups` | SCIM group provisioning | Token |
| `/api/scim/v2/Groups/[id]` | SCIM group operations | Token |

### Other APIs

| Route | Purpose | Auth |
|-------|---------|------|
| `/api/custom-product-submit` | Custom product inquiry | PoW |
| `/api/pilot-review` | Pilot review submission | Auth |

---

## Adding a New Version

### Steps

1. Create route directory: `src/app/api/v{N}/`
2. Implement endpoints mirroring the previous version's structure
3. Update middleware matcher to include the new version prefix
4. Update route role mappings if applicable
5. Add integration tests for the new version
6. Update this documentation

### Middleware

The Next.js middleware must include the new version in its matcher pattern:

```typescript
// In src/middleware.ts — add to matcher
"/api/v1/:path*",
"/api/v2/:path*",
```

### Role Mapping

Update `routeMinRoles` in middleware configuration to include new version routes:

```typescript
const routeMinRoles: Record<string, string> = {
  "/api/v2/audit/engagements": "AUDIT_MEMBER",
  // ... etc
};
```

---

## Migration Guide

### For API Consumers

When a new version is released:

1. Review the [CHANGELOG](/CHANGELOG.md) for breaking changes
2. Update API base URL from `/api/v{N-1}/` to `/api/v{N}/`
3. Test against the new version in staging
4. Update client code to handle any response shape changes
5. Monitor deprecation headers on old version

### Response Changes Between Versions

Document any breaking changes here as versions evolve:

#### v1 → v2 (Planned)

- Standardized error response format: `{ error: { code: string, message: string, details?: unknown } }`
- Pagination cursor format: `{ items: [], pagination: { nextCursor, hasMore, totalCount } }`
- Timestamp format: ISO 8601 with timezone (not Unix epoch)

### Breaking Changes Definition

The following are considered breaking changes:

- Response field removal or rename
- Response field type change
- Required request field addition
- Authentication requirement change
- Error response format change
- Status code change for existing scenarios
- Pagination behavior change

The following are **not** breaking changes:

- New optional request fields
- New response fields
- New endpoints
- New error codes (without changing existing ones)
- Performance improvements

---

## Version Headers

Every API response should include:

```http
X-API-Version: v1
X-API-Deprecated: false
```

When deprecated:

```http
X-API-Version: v1
X-API-Deprecated: true
X-API-Sunset: 2027-07-01
```
