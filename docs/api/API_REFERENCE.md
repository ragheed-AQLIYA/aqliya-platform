# AQLIYA API Reference

> **Status:** Active | **Version:** v0.1 | **Last Updated:** 2026-07-11

## Overview

AQLIYA exposes RESTful JSON APIs under `/api/`. All authenticated routes require a valid session.
Error responses use a standardized format:

```json
{
  "success": false,
  "error": { "code": "error_code", "message": "Human-readable message" },
  "meta": { "timestamp": "2026-07-11T12:00:00.000Z" }
}
```

Success responses follow the pattern:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-07-11T12:00:00.000Z" }
}
```

Download endpoints return binary content with appropriate `Content-Type`, `Content-Disposition`, `Content-Length`, and `X-Content-Type-Options: nosniff` headers.

---

## Authentication

| Icon | Meaning |
|------|---------|
| 🌐 | Public — no authentication required |
| 🔒 | Authenticated — valid session required |
| 🔐 | Admin — ADMIN role required |
| 🔑 | SCIM auth — Bearer token (SCIM API key) |

**Session-based auth:** Routes marked 🔒/🔐 use NextAuth.js sessions. Unauthenticated requests return `401` with `{ error: "Unauthorized" }` or `{ error: "Authentication required" }`.

**SCIM auth:** Routes marked 🔑 use a shared SCIM API key (`SCIM_API_KEY` env var) passed as `Bearer <token>` in the `Authorization` header.

**MFA:** Some authenticated routes may require MFA verification. See `/api/auth/mfa/verify`.

---

## Endpoints

### Health & Monitoring

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | 🌐 | Comprehensive liveness check (DB, auth secret, uptime, build info) |
| GET | `/api/health/live` | 🌐 | Kubernetes liveness probe — process up only, no dependencies |
| GET | `/api/health/ready` | 🌐 | Readiness check (DB, storage, pgvector, Redis, AI providers, auth secret) |
| GET | `/api/metrics` | 🔐 | Platform-wide metrics (engagements by status, decisions, clients, evidence counts) |
| GET | `/api/monitoring/health?scope=all` | 🔐 | System monitoring — health, system metrics, queue metrics, failed jobs |
| GET | `/api/integration/health` | 🔒 | Integration system health — circuit breaker states, metric counters, LCOS subsystem |
| GET | `/api/notifications/stream` | 🔒 | SSE stream for real-time platform notifications (30s polling interval) |

#### Health response format (`GET /api/health`)

```json
{
  "status": "ok",
  "version": "0.1.0",
  "build": { "commit": "abc123", "timestamp": "2026-07-11T00:00:00.000Z", "environment": "production" },
  "checks": {
    "database": { "ok": true, "latencyMs": 3 },
    "auth_secret": { "ok": true }
  },
  "uptime": 3600,
  "responseTimeMs": 5,
  "note": "Enterprise health endpoint — liveness check"
}
```

#### Readiness response format (`GET /api/health/ready`)

```json
{
  "status": "ok",
  "checks": {
    "database": { "ok": true, "latencyMs": 3 },
    "storage": { "ok": true, "detail": "writable (./uploads)" },
    "pgvector": { "ok": true, "detail": "available" },
    "redis": { "ok": true, "detail": "connected" },
    "ai_provider": { "ok": true, "detail": "not enabled (FF_AI_REAL_PROVIDERS not set)" },
    "auth_secret": { "ok": true }
  }
}
```

---

### Authentication & SSO

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET, POST | `/api/auth/[...nextauth]` | 🌐 | NextAuth.js handlers — sign in, sign out, session, callback, CSRF |
| POST | `/api/auth/mfa/verify` | 🔒 | Verify MFA TOTP token or backup code |
| GET | `/api/auth/saml/[providerId]/initiate` | 🌐 | Initiate SAML SSO — redirects to IdP |
| POST | `/api/auth/saml/[providerId]/callback` | 🌐 | SAML ACS — receives SAMLResponse from IdP |
| GET | `/api/auth/saml/[providerId]/metadata` | 🌐 | SAML SP metadata XML for IdP configuration |

#### SAML SSO flow

1. User visits `/api/auth/saml/[providerId]/initiate?callbackUrl=/audit`
2. Redirected to IdP login page
3. IdP POSTs SAMLResponse to `/api/auth/saml/[providerId]/callback`
4. AQLIYA validates assertion, creates/updates user, sets NextAuth JWT session cookie
5. User redirected to `callbackUrl`

---

### AuditOS

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET, POST | `/api/audit/engagements/[engagementId]/exports/[format]` | 🔒 | Export engagement as PDF or XLSX (`format`: `pdf` or `xlsx`) |
| GET | `/api/audit/evidence/[evidenceId]/download` | 🔒 | Download evidence file (supports token-based or session-based access) |

> **Note:** AuditOS CRUD operations (list, create, update, delete engagements) are performed through Server Actions, not direct API routes. The export and download endpoints above are the only REST API routes for AuditOS. See [`docs/source-of-truth/ROUTE_STRATEGY.md`](../source-of-truth/ROUTE_STRATEGY.md) for workspace routes.

#### Evidence download flow

The evidence download supports two authentication modes:
- **Session-based:** Authenticated user with sufficient permissions
- **Token-based:** A pre-signed download token (`?token=...`) allows temporary access without session

Both paths enforce:
- Rate limiting per actor (evidence.download)
- Tenant isolation (organization ID check)
- Storage provider retrieval
- Full audit trail logging

---

### DecisionOS

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/decisions/[decisionId]/evidence/[evidenceId]/download` | 🔒 | Download decision evidence file |

> **Note:** DecisionOS CRUD operations (list, create, update, review, approve) are performed through Server Actions. The evidence download is the only REST API route for DecisionOS.

#### Decision evidence download

Enforces:
- Session authentication
- Authorization via `enforce()` engine (type: "evidence", action: "export")
- Decision exists and belongs to user's organization (tenant-safe 404)
- Storage provider retrieval
- Full audit trail via `auditLogger`

---

### LocalContentOS

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/local-content/metrics` | 🔒 | Prometheus-format metrics for LCOS (projects, workbooks, suppliers, spend records, evidence, findings, reviews) |
| GET | `/api/local-content/projects/[projectId]/audit/export` | 🔒 | Export project audit trail as CSV |
| GET | `/api/local-content/projects/[projectId]/evidence/[evidenceId]/download` | 🔒 | Download project evidence file |
| GET | `/api/local-content/projects/[projectId]/reports/[reportId]/download` | 🔒 | Download project report (PDF assessment summary, XLSX spend classification, XLSX evidence index) |

#### LCOS metrics format

Returns Prometheus exposition format (`text/plain`):

```
# HELP lcos_projects_total Total number of LCOS projects
# TYPE lcos_projects_total gauge
lcos_projects_total 42
```

#### Audit export format

Returns CSV with columns: `timestamp,action,actorId,actorName,entityType,entityId,metadata`

#### Evidence download

Enforces:
- Project access assertion (`assertProjectAccess`)
- Authorization via `enforce()` engine
- Evidence download access via `assertEvidenceDownloadAccess`
- Storage provider retrieval
- Full audit trail

---

### Platform — Enterprise Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/platform/enterprise-health` | 🔐 | Tier 3 enterprise readiness snapshot — alerts, outbox status, rate limiter mode |
| GET | `/api/platform/evidence/health` | 🔐 | Core Evidence Platform operational health — backfill coverage, orphaned evidence, adapter syncs |
| GET | `/api/platform/siem` | 🔐 | List SIEM export jobs (paginated) |
| POST | `/api/platform/siem` | 🔐 | Trigger SIEM export or configure SIEM destination |

#### Enterprise health response

```json
{
  "ok": true,
  "snapshot": {
    "alerts": [{ "severity": "warning", "message": "..." }],
    "outbox": { "failed": 0 },
    "rateLimiter": { "mode": "memory" }
  },
  "summary": {
    "criticalAlerts": 0,
    "warningAlerts": 2,
    "outboxFailed": 0,
    "rateLimiterMode": "memory"
  }
}
```

---

### Platform — Event Outbox

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/platform/outbox/status` | 🔐 | Outbox queue status — pending, failed, processing, processed counts + recent failed events |
| POST | `/api/platform/outbox/process` | 🔐 | Trigger outbox batch processing (max 50 events) |
| POST | `/api/platform/outbox/retry` | 🔐 | Retry failed outbox events — optionally specify event IDs in body |

#### Outbox retry body

```json
{ "ids": ["event-id-1", "event-id-2"] }
```

If `ids` is omitted, retries up to 50 failed events automatically.

---

### Platform — Event Registry

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/platform/events/registry` | 🔐 | Registered platform event schemas (Event Bus Phase 2) |

Returns: schema version, count, and list of registered event schemas.

---

### Platform — Retention

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/platform/retention` | 🌐 | List all default retention policies (no auth required — returns defaults only) |
| GET | `/api/platform/retention/policies` | 🔐 | List retention policies with overrides |
| PUT | `/api/platform/retention/policies` | 🔐 | Update/set retention policy override |
| DELETE | `/api/platform/retention/policies?modelName=...` | 🔐 | Reset policy override to default |
| POST | `/api/platform/retention/run` | 🔐 | Run retention engine — deletes/archives records per policy |
| POST | `/api/platform/retention/dry-run` | 🔐 | Dry-run retention engine — preview what would be affected |
| GET | `/api/platform/retention/history` | 🔐 | Retention job execution history |
| GET | `/api/platform/retention/holds` | 🔐 | List retention holds |
| POST | `/api/platform/retention/holds` | 🔐 | Create retention hold |
| DELETE | `/api/platform/retention/holds/[id]` | 🔐 | Remove retention hold |

#### Retention policy body (PUT)

```json
{
  "modelName": "AuditEvent",
  "retentionDays": 365,
  "action": "archive",
  "enabled": true,
  "notifyBeforeDelete": true
}
```

#### Retention hold body (POST)

```json
{
  "recordType": "AuditEngagement",
  "recordId": "engagement-id",
  "reason": "Legal hold — ongoing investigation"
}
```

---

### Platform — ABAC Pilot

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/platform/abac/pilot-status` | 🔐 | ABAC (Attribute-Based Access Control) pilot status — enforce readiness + shadow report summary |
| GET | `/api/platform/abac/shadow-report` | 🔐 | Full ABAC shadow mismatch report for rollout review |

#### ABAC pilot status response

```json
{
  "ok": true,
  "flags": {
    "abacShadow": true,
    "abacEnforce": false
  },
  "pilot": {
    "enforceEnabledForOrg": false,
    "configuredEnforceOrgIds": [],
    "readyForEnforce": true,
    "recommendation": "ready"
  },
  "shadow": {
    "windowDays": 30,
    "totalEvaluations": 1250,
    "totalMismatches": 3,
    "mismatchRate": 0.0024
  }
}
```

---

### Platform — Agent Memory

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/agent-memory` | 🔒 | Query agent memory by agentId, agentType, prefix, tags; or get specific memoryKey |
| POST | `/api/agent-memory` | 🔒 | Store agent memory entry |
| DELETE | `/api/agent-memory?agentId=...&memoryKey=...` | 🔒 | Delete agent memory entry |

#### Agent memory body (POST)

```json
{
  "agentId": "assistant-1",
  "memoryKey": "user_preference",
  "memoryValue": { "theme": "dark", "language": "ar" },
  "agentType": "assistant",
  "ttl": "2026-12-31T23:59:59Z",
  "tags": ["preferences", "ui"]
}
```

Role requirements:
- GET: VIEWER minimum
- POST: OPERATOR minimum
- DELETE: OPERATOR minimum

---

### AI — Providers

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/ai/providers` | 🔒 | List AI providers and their status (configured keys, enabled models) |

Returns provider settings and status from the AI orchestrator.

---

### AI — Evaluation Gate

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/ai/eval-gate?suiteId=...` | 🔐 | Get evaluation gate threshold for a suite |
| POST | `/api/ai/eval-gate` | 🔒 | Evaluate AI output against a gate (suite + task type) |
| PUT | `/api/ai/eval-gate` | 🔐 | Register/update evaluation gate threshold |

#### Eval gate body (POST)

```json
{
  "suiteId": "audit-summary",
  "taskType": "summarize",
  "actualOutput": "Generated text to evaluate..."
}
```

Role requirements:
- GET: ADMIN
- POST: OPERATOR
- PUT: ADMIN

---

### AI — Governance Metrics

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/ai/governance?days=30` | 🔐 | AI governance metrics — review rates, approval rates, confidence scores over the specified period |

---

### AI — Spend Tracking

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/ai/spend?days=30` | 🔐 | AI spend summary — cost by provider, model, and product over the specified period |

---

### AI — Knowledge Management (RAG)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/ai/knowledge/ingest` | 🔒 | Ingest a document into the knowledge base (RAG) |
| GET | `/api/ai/knowledge/search?query=...&limit=10` | 🔒 | Search knowledge base with optional `governed` flag |
| GET | `/api/ai/knowledge/metadata?documentId=...` | 🔒 | Get document metadata from knowledge base |
| DELETE | `/api/ai/knowledge?documentId=...` | 🔒 | Delete document from knowledge base |

#### Knowledge ingest body (POST)

```json
{
  "documentId": "doc-123",
  "content": "Document text content...",
  "metadata": { "source": "upload", "category": "policy" },
  "productKey": "audit",
  "sourceType": "pdf",
  "sensitivity": "internal"
}
```

Role requirements:
- GET/search/metadata: VIEWER minimum
- POST/ingest: OPERATOR minimum
- DELETE: OPERATOR minimum

---

### Skills

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/skills/evaluate` | 🔐 | List all evaluatable skills with metadata (summary, level breakdown) |
| POST | `/api/skills/evaluate` | 🔐 | Run single or batch skill evaluation |

#### Skills evaluate body (POST)

```json
{ "skillId": "skill:foundation:repo-analysis" }
```

Or for batch evaluation by level:

```json
{ "level": 0 }
```

Or evaluate all:

```json
{ "level": "all" }
```

Returns: evaluation report as markdown + structured result data.

---

### Knowledge Mining

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/knowledge-mining/candidates?status=...&sortBy=...` | 🔒 | List knowledge mining candidates (paginated, filterable) |
| POST | `/api/knowledge-mining/candidates` | 🔒 | Run full mining pipeline |
| GET | `/api/knowledge-mining/candidates/[id]` | 🔒 | Get candidate with evidence and promotion history |
| DELETE | `/api/knowledge-mining/candidates/[id]` | 🔐 | Delete a candidate |
| POST | `/api/knowledge-mining/promote` | 🔒 | Promote an approved candidate to knowledge artifact |
| POST | `/api/knowledge-mining/review` | 🔒 | Submit, approve, or reject a candidate |
| POST | `/api/knowledge-mining/batch-promote` | 🔐 | Batch promote all approved candidates |
| POST | `/api/knowledge-mining/aggregate` | 🔒 | Run pattern aggregation (non-persisting) |
| GET | `/api/knowledge-mining/kpis` | 🔒 | Knowledge mining operational KPIs |

#### Candidates query params (GET)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | enum | all | Filter by: `CANDIDATE`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PROMOTED` |
| `canonicalCode` | string | — | Filter by canonical GL code |
| `search` | string | — | Full-text search |
| `sortBy` | string | `createdAt` | Sort field: `supportCount`, `confidence`, `createdAt` |
| `sortDir` | string | `desc` | Sort direction: `asc`, `desc` |
| `offset` | number | `0` | Pagination offset |
| `limit` | number | `50` | Page size |

#### Promote body (POST)

```json
{
  "candidateId": "candidate-123",
  "artifactType": "candidate-synonyms",
  "notes": "Approved for promotion"
}
```

`artifactType` must be `candidate-synonyms` or `candidate-rule-pack`.

#### Review body (POST)

```json
{
  "action": "approve",
  "candidateId": "candidate-123",
  "notes": "Looks good"
}
```

Supported `action` values: `submit`, `approve`, `reject`.

**Security note:** Actor identity is ALWAYS derived from session, never from request body. `promotedBy` / `reviewerId` in body are ignored.

Role requirements:
- GET candidates, GET candidate, GET kpis: VIEWER minimum
- POST candidates, POST promote, POST review, POST aggregate: OPERATOR minimum
- DELETE candidate, POST batch-promote: ADMIN minimum

---

### SCIM v2

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/scim/v2/Users?filter=...&startIndex=1&count=100` | 🔑 | List users (SCIM v2 compliant, paginated, filterable) |
| POST | `/api/scim/v2/Users` | 🔑 | Create user |
| GET | `/api/scim/v2/Users/[id]` | 🔑 | Get user by ID |
| PUT | `/api/scim/v2/Users/[id]` | 🔑 | Full replace user |
| PATCH | `/api/scim/v2/Users/[id]` | 🔑 | Partial update user (SCIM Patch) |
| DELETE | `/api/scim/v2/Users/[id]` | 🔑 | Deactivate user |
| GET | `/api/scim/v2/Groups?filter=...&startIndex=1&count=100` | 🔑 | List groups (SCIM v2 compliant, paginated, filterable) |
| POST | `/api/scim/v2/Groups` | 🔑 | Create group |
| GET | `/api/scim/v2/Groups/[id]` | 🔑 | Get group by ID |
| PUT | `/api/scim/v2/Groups/[id]` | 🔑 | Full replace group |
| PATCH | `/api/scim/v2/Groups/[id]` | 🔑 | Partial update group |
| DELETE | `/api/scim/v2/Groups/[id]` | 🔑 | Delete group |

SCIM endpoints use Bearer token authentication (via `SCIM_API_KEY` env var). Responses include `Content-Type: application/scim+json`.

---

### SalesOS

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/sales/export` | 🔒 | Export SalesOS dashboard data as CSV (accounts, deals, pipeline stages) |

Rate limited: 10 requests per 60-second window per user.

---

### Office AI Assistant

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/office-ai/download?outputId=...&format=md` | 🔒 | Download Office AI Assistant output (formats: `md`, `txt`, `print`) |

The `print` format returns an HTML page with RTL support and auto-print trigger.

Rate limited: 30 downloads per 60-second window per user (in-memory, per-instance).

---

### WorkflowOS (Sunbul)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/workflowos/records/[recordId]/download` | 🔒 | Download workflow record — metadata + latest document |
| GET | `/api/workflowos/documents/[documentId]/download` | 🔒 | Download workflow document |
| GET | `/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf` | 🔒 | Export workflow record as PDF |
| GET | `/api/workflowos/escalation-check` | 🔒 | Check and process pending escalated exports |

---

### Pilot Review

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/pilot-review` | 🌐 | Submit pilot evaluation request form |

Rate limited: 8 requests per 60-second window per IP. Validates required fields (name, email, organization, useCase). Optionally forwards to webhook if `PILOT_REVIEW_WEBHOOK_URL` is configured.

---

### Custom Product Request

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/custom-product-submit` | 🌐 | Submit custom product design request |

Rate limited: 6 requests per 60-second window per IP. Uses Zod schema validation. Optionally sends email via Resend if `RESEND_API_KEY` is configured. Arabic form labels.

---

## Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `authentication_required` | 401 | Not authenticated |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `rate_limited` | 429 | Too many requests |
| `validation_error` | 400 | Invalid request body |
| `storage_error` | 500 | Storage system failure |
| `ai_provider_error` | 502 | AI provider error |
| `database_error` | 500 | Database error |
| `internal_error` | 500 | Unexpected server error |

Common API route error patterns:
- **Unauthenticated:** `{ error: "Authentication required" }` with status 401
- **Access denied:** `{ error: "Access denied: ROLE role required" }` with status 403
- **Sanitized errors:** Routes using `sanitizeError`/`sanitizeErrorResponse` return controlled error messages with appropriate HTTP status codes

---

## Rate Limiting

- **Default API rate limit:** 5000 requests per IP per window (configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`)
- **Pilot review:** 8 requests / 60s per IP
- **Custom product submit:** 6 requests / 60s per IP
- **SalesOS export:** 10 requests / 60s per user
- **Office AI download:** 30 requests / 60s per user (in-memory, per-instance)
- **Evidence download:** Enforced via `enforceAuditRateLimit` (audit-specific)
- Rate-limited routes return 429 with descriptive error message
- Rate limiter supports both `memory` (single-instance) and `redis` (multi-instance) modes via `RATE_LIMITER` env var

---

## Security Headers

All download/export endpoints include:
- `X-Content-Type-Options: nosniff`
- `Content-Disposition: attachment; filename="..."` (for file downloads)
- `Cache-Control: private, no-store` (for sensitive data)
- `Content-Security-Policy` (set globally via middleware)

---

## Deprecated Endpoints

The following endpoints are deprecated — dashboard UIs use Server Actions instead. They remain functional for external/scheduled job access:

| Route | Deprecation Reason | Alternative |
|-------|-------------------|-------------|
| `/api/knowledge-mining/candidates` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/candidates/[id]` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/promote` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/review` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/batch-promote` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/aggregate` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
| `/api/knowledge-mining/kpis` | Dashboard uses server actions | `knowledge-mining-actions.ts` |
