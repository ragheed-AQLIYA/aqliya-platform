# AQLIYA Monitoring Runbook

**Document Owner:** Observability Agent
**Last Updated:** 2026-06-08
**Status:** Verified
**Applies to:** AQLIYA Platform Core — All Products

---

## 1. Monitoring Philosophy

AQLIYA monitors **availability, performance, governance, and cost** across three tiers:

| Tier | Scope | Tools |
|------|-------|-------|
| **Infrastructure** | Server process, database, Redis, storage | Health endpoints, Sentry APM |
| **Application** | Error rates, response times, AI generation | Sentry, structured logs |
| **Business** | Workflow progress, budget consumption, pilot health | Pilot daily monitor, budget manager |

### Key Principles

1. **Health endpoints are the first line of defense** — `/api/health`, `/api/health/live`, `/api/health/ready` provide instant status.
2. **Sentry provides runtime observability** — Error tracking, performance tracing, and session monitoring.
3. **Scripts provide deep-dive checks** — Post-deploy smoke tests, daily monitors, and health checks validate operational readiness.
4. **Logs are structured JSON** — All alert events use consistent JSON format for log aggregation.

---

## 2. What We Monitor

| Category | What | How | Frequency |
|----------|------|-----|-----------|
| **Process liveness** | Server is running | `/api/health/live` | Every 10s (K8s/ECS) |
| **Application readiness** | DB, Redis, storage, AI providers, auth secret | `/api/health/ready` | Every 30s |
| **Combined health** | DB + auth secret | `/api/health` | Every 30s |
| **Database health** | PostgreSQL connectivity + pgvector extension | `/api/health/ready` (database + pgvector checks) | Every 30s |
| **Redis health** | Redis connectivity | `/api/health/ready` (redis check) | Every 30s |
| **Storage health** | Local filesystem writability or S3 config | `/api/health/ready` (storage check) | Every 30s |
| **Error rates** | Unhandled exceptions, error spikes | Sentry APM | Real-time |
| **Performance** | Route response times, DB query latency | Sentry APM (tracesSampleRate: 0.2 client, 0.5 server) | Real-time |
| **AI costs** | Monthly spend, request count, token count | Budget Manager (`src/lib/ai/budget-manager.ts`) | Per AI generation |
| **Rate limiting** | 429 response rate, Redis fallback status | Rate Limiter logs | Real-time |
| **Pilot operations** | AuditOS engagement health, workflow progress | Pilot daily monitor | Daily |
| **Deployment health** | Build, test, deploy pipeline | CI/CD smoke test | Per deployment |
| **Decision health** | Decision risk alerts, monitoring signals | Decision engine | Per decision |

---

## 3. Current Monitoring Tools

### 3.1 Sentry APM

**Config files:** 3 separate configs for client, server, and edge runtimes.

| Config | Runtime | Traces Sample Rate | DSN Env Var | Enabled When |
|--------|---------|-------------------|-------------|-------------|
| `sentry.client.config.ts` | Browser | 0.2 | `NEXT_PUBLIC_SENTRY_DSN` | `NODE_ENV === "production"` |
| `sentry.server.config.ts` | Node.js | 0.5 | `SENTRY_DSN` | `NODE_ENV === "production"` |
| `sentry.edge.config.ts` | Edge | 0.2 | `SENTRY_DSN` | `NODE_ENV === "production"` |

**Instrumentation:**
- `src/instrumentation.ts` loads Sentry server config (Node.js) and edge config (Edge) conditionally
- `onRequestError = Sentry.captureRequestError` captures unhandled request errors
- `browserTracingIntegration()` is enabled on the client side
- Sentry is **disabled** in development (`NODE_ENV !== "production"`)

**Integration:**
```typescript
// In instrumentation.ts — auto-loads on Next.js startup
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
```

### 3.2 Health Endpoints

| Endpoint | Purpose | Dependencies | Expected Status | 
|----------|---------|-------------|-----------------|
| `GET /api/health/live` | Kubernetes/ECS liveness probe | None (process only) | 200 `{"status":"ok","probe":"live"}` |
| `GET /api/health/ready` | Readiness probe | PostgreSQL, Storage, pgvector, Redis, AI providers, Auth secret | 200 `{"status":"ok"}` with all checks passing; 503 `{"status":"degraded"}` with failed checks |
| `GET /api/health` | Combined health + build info | PostgreSQL, Auth secret | 200 or 503 with build version, commit, uptime |

**Health check details:**

| Check | `/api/health` | `/api/health/ready` | `/api/health/live` |
|-------|--------------|-------------------|-------------------|
| Process running | ✅ | ✅ | ✅ |
| Database (SELECT 1) | ✅ | ✅ | — |
| Auth secret set | ✅ | ✅ | — |
| Storage writable | — | ✅ | — |
| pgvector available | — | ✅ | — |
| Redis connectivity | — | ✅ (optional) | — |
| AI provider keys | — | ✅ (if FF enabled) | — |

### 3.3 Metrics Endpoint

**Endpoint:** `GET /api/metrics`
**Auth required:** ADMIN role
**Returns:** Real-time counts of engagements, decisions, clients, and evidence.

```json
{
  "success": true,
  "data": {
    "engagements": { "active": 5, "completed": 3 },
    "decisions": { "draft": 10, "approved": 7 },
    "totalEngagements": 8,
    "totalDecisions": 17,
    "totalClients": 4,
    "totalEvidence": 23
  },
  "meta": { "timestamp": "2026-06-08T12:00:00.000Z" }
}
```

### 3.4 Pilot Daily Monitor

**Script:** `scripts/platform/pilot-daily-monitor.ts`
**Run:** `npm run pilot:daily` (or `npx tsx scripts/platform/pilot-daily-monitor.ts`)

This is the primary operational health report for the AuditOS pilot. It validates:
- Database connectivity and data presence
- Workflow health (engagements, mappings, evidence, findings, approvals)
- Production blockers (open/in-progress/resolved)
- Recent activity (last 5 events)
- Upload and auth failure rates
- Pilot feedback backlog

### 3.5 Audit Health Check

**Script:** `scripts/platform/audit-health-check.ts`
**Run:** `npm run audit:health` (or `npx tsx scripts/platform/audit-health-check.ts`)

Quick health check for AuditOS: DB connectivity, record counts, and open blockers. Exits 0 on success, 1 on failure.

### 3.6 Budget Tracking

**Source:** `src/lib/ai/budget-manager.ts`

Tracks three dimensions per organization per month:
- Spend (USD)
- Request count
- Token count

Alerts fire at configurable thresholds (50%, 80%, 90%, 100%).

### 3.7 Rate Limiter Monitoring

**Runbook:** [Rate Limiter Runbook](rate-limiter.md)

Key metrics to watch:
- **429 response rate** — spike indicates legitimate traffic being blocked or attack
- **Redis fallback warning** — `[rate-limit] RATE_LIMITER=redis but ...` in logs
- **Rate limit headers** — `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### 3.8 Notification Engine

**Source:** `src/lib/platform/notification/`

Channels: in-app, email, webhook.
Each dispatch is audited via `writePlatformAuditLog`.

---

## 4. Key Metrics to Watch

### 4.1 Infrastructure Metrics

| Metric | Source | Warning Threshold | Critical Threshold |
|--------|--------|-------------------|-------------------|
| DB query latency | `/api/health` | >500ms | >2s |
| DB connectivity | `/api/health/ready` | — | Any failure |
| Redis connectivity | `/api/health/ready` | Any failure | Sustained >5 min |
| Storage writable | `/api/health/ready` | — | Any failure |
| Process uptime | `/api/health` | — | <60s after expected restart |
| pgvector availability | `/api/health/ready` | — | Any failure |

### 4.2 Application Metrics

| Metric | Source | Warning Threshold | Critical Threshold |
|--------|--------|-------------------|-------------------|
| Error rate (server) | Sentry | >5% of requests | >15% of requests |
| p95 response time | Sentry | >3s | >5s |
| New error types | Sentry | 1+ new type/day | 5+ new types/hour |
| 429 rate limit hits | Rate limiter logs | >10% of traffic | >30% of traffic |

### 4.3 Business Metrics

| Metric | Source | Warning Threshold | Critical Threshold |
|--------|--------|-------------------|-------------------|
| AI spend (% of cap) | Budget manager | >=80% | >=100% |
| AI requests (% of cap) | Budget manager | >=80% | >=100% |
| Open production blockers | Pilot monitor | 1+ open for >24h | 3+ open total |
| Pilot feedback backlog | Pilot monitor | 5+ open items | 10+ open items |
| Upload rejection rate | Pilot monitor | >0 in 24h | >5 in 24h |
| Auth failure rate | Pilot monitor | >0 in 24h | >10 in 24h |

---

## 5. Health Check Endpoints Reference

### 5.1 Liveness — `GET /api/health/live`

```json
{
  "status": "ok",
  "probe": "live",
  "uptime": 3600
}
```

**Purpose:** Process-liveness probe for Kubernetes/ECS. Does NOT check dependencies.
**Expected status:** Always 200 if the server process is running.
**Response time:** Immediate (no async I/O).

### 5.2 Readiness — `GET /api/health/ready`

```json
{
  "status": "ok",
  "version": "0.1.0",
  "build": {
    "commit": "abc123",
    "timestamp": "2026-06-08T10:00:00.000Z",
    "environment": "production"
  },
  "checks": {
    "database": { "ok": true, "latencyMs": 12 },
    "storage": { "ok": true, "detail": "writable (./uploads)" },
    "pgvector": { "ok": true, "detail": "available" },
    "redis": { "ok": true, "latencyMs": 3, "detail": "connected" },
    "ai_provider": { "ok": true, "detail": "configured (openai)" },
    "auth_secret": { "ok": true }
  },
  "uptime": 3600,
  "responseTimeMs": 45,
  "note": "Enterprise health endpoint — readiness check"
}
```

**Purpose:** Readiness probe. Checks all critical dependencies.
**Expected status:** 200 if all checks pass; 503 if any check fails (with `"status": "degraded"`).

### 5.3 Combined — `GET /api/health`

```json
{
  "status": "ok",
  "version": "0.1.0",
  "build": {
    "commit": "abc123",
    "timestamp": "2026-06-08T10:00:00.000Z",
    "environment": "production"
  },
  "checks": {
    "database": { "ok": true, "latencyMs": 12 },
    "auth_secret": { "ok": true }
  },
  "uptime": 3600,
  "responseTimeMs": 15,
  "note": "Enterprise health endpoint — liveness check"
}
```

**Purpose:** General health endpoint with build info. Used by monitoring tools and CI smoke tests.
**Expected status:** 200 if DB and auth pass; 503 if degraded.

---

## 6. Running Monitoring Checks

### 6.1 Health Probe

```bash
# Quick staging check
npm run staging:probe

# Verify staging
npm run staging:verify

# Direct curl check
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/live
curl http://localhost:3000/api/health/ready
```

**What `staging:probe` tests:**
1. DNS resolution of staging host
2. `GET /api/health` — application health
3. `GET /api/health/ready` — readiness check
4. `GET /api/health/live` — liveness check
5. `GET /login` — page loads or redirects
6. `GET /` — homepage loads

### 6.2 Post-Deploy Smoke Test

```bash
# Against local dev
npm run smoke:local

# Against remote target
node scripts/platform/post-deploy-smoke.mjs --base-url "https://staging.aqliya.ai"

# With auth token for protected routes
AUTH_TOKEN=xxx node scripts/platform/post-deploy-smoke.mjs --base-url "https://staging.aqliya.ai"
```

**Exit codes:**
- 0: All critical checks pass
- 1: One or more critical checks failed

### 6.3 Audit Health Check

```bash
npm run audit:health
# or
npx tsx scripts/platform/audit-health-check.ts
```

**Exit codes:**
- 0: All checks pass (DB connected, data present, no open blockers)
- 1: One or more checks failed

### 6.4 Pilot Daily Monitor

```bash
npm run pilot:daily
# or
npx tsx scripts/platform/pilot-daily-monitor.ts
```

Produces a full report to stdout. Recommended to run daily as a cron job. Output includes:
- Health check summary
- Workflow status counts
- Production blockers table
- Recent activity (last 5 events)
- Upload & auth failure monitoring
- Pilot feedback summary
- Overall status assessment

### 6.5 Metrics Endpoint

```bash
# Requires admin authentication
curl -H "Cookie: <session-token>" http://localhost:3000/api/metrics
```

Returns real-time business metrics: engagement counts by status, decision counts by status, total counts for engagements, decisions, clients, and evidence.

### 6.6 Budget Status Check

```typescript
// Programmatic check (server-side)
import { getBudgetStatus } from "@/lib/ai/budget-manager";

const status = await getBudgetStatus(organizationId);
console.log(status.spendPercent); // e.g., 75.5
console.log(status.isExceeded); // false
```

---

## 7. Data Model for Monitoring

### 7.1 Audit Event (Primary Audit Trail)

All significant state changes are recorded as `auditEvent` records in the database. This includes:

| Event Category | Examples | Recorded By |
|---------------|----------|-------------|
| Engagement lifecycle | created, state_changed | Action layer |
| Evidence operations | file_scanned, created, downloaded | Action layer |
| AI operations | ai_review_requested, ai_output_generated | AI service |
| Auth operations | Access denied, role denied | Middleware / Action layer |
| Alert operations | alert_created, alert_acknowledged, alert_resolved | Decision engine |

### 7.2 Platform Audit Log

Cross-product audit log stored in `platformAuditLog` with fields:
- `productKey` — Product identifier (e.g., `ai_core`, `decisionos`)
- `action` — Action type (e.g., `ai_generation`, `notification_dispatched`)
- `actorId`, `targetType`, `targetId`, `targetLabel`
- `metadata` — JSON blob with action-specific data
- `platformOrganizationId` — Tenant isolation

### 7.3 Production Blocker

Manual tracking of issues requiring resolution before production:
- Fields: title, description, category, severity, status, owner, resolution plan
- Statuses: open, in_progress, in_review, resolved
- Referenced by pilot daily monitor

---

## 8. Dashboard Instructions

### 8.1 Sentry Dashboard

Access: Sentry account → Project → AQLIYA

**Key views:**
1. **Issues** — Error grouping with stack traces, count, and first/last seen
2. **Performance** — Route response times, p50/p95/p99, transaction summary
3. **User Feedback** — User-submitted error reports (if configured)
4. **Releases** — Error trends correlated with deployments

**Filter by:**
- Environment: `production` (primary), `staging` (secondary)
- Runtime: `client`, `server`, `edge`
- Time range: 1h, 24h, 7d

### 8.2 Health Dashboard (via Info endpoint)

The `/api/health` endpoint provides a machine-readable status snapshot. For a human dashboard:

```bash
# Quick status from CLI
function aqliya_status() {
  curl -s "$1/api/health" | python3 -m json.tool
  curl -s "$1/api/health/ready" | python3 -m json.tool
}
aqliya_status "http://localhost:3000"
```

### 8.3 Pilot Dashboard

The pilot daily monitor (`npm run pilot:daily`) serves as the primary operational dashboard for the AuditOS pilot. It can be:
- Run manually for on-demand status
- Scheduled as a cron job for daily emailed reports
- Extended to output JSON for ingestion by external dashboards

---

## 9. When to Escalate

### Immediate Escalation (CRITICAL)

| Trigger | Action | To Whom |
|---------|--------|---------|
| Health endpoint returns 503 continuously | Page on-call | Primary on-call engineer |
| Build fails in CI | Check logs, notify team | DevOps / Engineering lead |
| Sentry error spike >5x baseline | Investigate root cause | Engineering lead |
| All database connections fail | Failover to replica | Database admin |
| Auth secret missing | Set env var immediately | Platform ops |
| Security incident | Contain and notify | Security team |

### Same-Day Escalation (WARNING)

| Trigger | Action | To Whom |
|---------|--------|---------|
| AI budget >=80% | Notify org admin | Organization owner |
| Redis unreachable | Verify and restart | DevOps |
| Error rate >5% | Investigate Sentry | Engineering team |
| Open blocker >24h | Assign owner, set resolution plan | Product manager |
| Rate limit saturation | Evaluate traffic pattern | Platform team |

### Next-Business-Day Escalation (INFO)

| Trigger | Action | To Whom |
|---------|--------|---------|
| Pilot feedback submitted | Triage and assign | Product manager |
| Non-critical env var missing | Add to config | DevOps |
| Budget at 50% | Note for capacity planning | Platform ops |

---

## 10. Monitoring Gaps (Known)

The following monitoring capabilities are **not yet implemented** and represent gaps vs. production-readiness targets:

| Gap | Impact | Priority | Target |
|-----|--------|----------|--------|
| No Prometheus metrics endpoint | No standardized metrics export for Grafana/Datadog | HIGH | Expose counters for errors, latency, rate limits, budget |
| No structured logging framework | Budget alerts use `console.warn` instead of JSON | MEDIUM | Use a structured logger (pino/winston) for all log output |
| No synthetic monitoring | Only post-deploy smoke test covers synthetic checks | MEDIUM | Add Uptime Robot / Checkly / Playwright scheduled checks |
| No Datadog/PagerDuty config in repo | Monitoring tools are configured externally | MEDIUM | Document external tool config in this runbook |
| No Grafana dashboard as code | Dashboards are manual or non-existent | MEDIUM | Add Grafana JSON model for health endpoints + budget |
| No rate limit hit counter export | Rate limit saturation is not measurable | LOW | Add Prometheus counter for rate limit hits |
| No user-facing status page | Customers cannot check platform status | LOW | Add `/status` page (e.g., Atlassian Statuspage) |
| No automated alert routing | Alerts go to stdout; no PagerDuty/Opsgenie integration | HIGH | Wire notification engine to PagerDuty for CRITICAL alerts |
| No DB connection pool metrics | Pool exhaustion is invisible | MEDIUM | Export `pg-pool` metrics |
| No AI cost forecast | Budget exceeds are reactive, not predictive | LOW | Add spend projection based on current rate |

---

## 11. Related Documents

- [Alerting Runbook](alerting.md) — Alert definitions, response procedures, escalation matrix
- [Staging Environment Runbook](staging-environment.md) — Deployment and verification
- [Rate Limiter Runbook](rate-limiter.md) — Rate limit monitoring and incident response
- `src/app/api/health/` — Health endpoint implementation
- `src/app/api/health/__tests__/health-routes.test.ts` — Health endpoint tests
- `src/app/api/metrics/route.ts` — Metrics endpoint (ADMIN-only)
- `scripts/platform/post-deploy-smoke.mjs` — CI/CD smoke test
- `scripts/platform/pilot-daily-monitor.ts` — Daily pilot health report
- `scripts/platform/audit-health-check.ts` — AuditOS health check
- `src/lib/ai/budget-manager.ts` — AI budget tracking and alerts
- `src/lib/platform/notification/` — Notification engine

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-06-08 | Observability Agent | Initial runbook created from codebase verification |
