# Observability Audit Report

**Date:** 2026-06-04  
**Auditor:** OpenCode Observability Auditor (READ-ONLY)  
**Scope:** AQLIYA platform monitoring, metrics, error tracking, spend, queue, and dashboard observability

---

## 1. Health Endpoints

### Endpoints Found
| Endpoint | Auth | Scope |
|----------|------|-------|
| `GET /api/health` | None | `getHealthCheck()` — all components |
| `GET /api/monitoring/health?scope=` | Admin (`requireUserContext("ADMIN")`) | `all`, `health`, `system`, `queue` |

### Component Checks

| Component | Checked? | Implementation | Status |
|-----------|----------|---------------|--------|
| Server (uptime) | ✅ | Static uptime string (`system-monitor.ts:141`) | OK |
| Environment vars | ✅ | Checks `DATABASE_URL`, `AUTH_SECRET` exist (`system-monitor.ts:107-111`) | OK |
| Database (PostgreSQL) | ✅ | `SELECT 1` query (`system-monitor.ts:60-68`) | OK |
| Redis | ✅ | Ping via `ensureRedisConnected()` + `client.ping()` (`system-monitor.ts:70-84`) | OK — warns if `REDIS_URL` missing |
| Queue (Bull) | ✅ | `getWaitingCount/Active/Completed/Failed/Delayed` (`system-monitor.ts:86-104`) | OK — warns if queue disabled |
| Storage | ⚠️ | Static — reads `STORAGE_PROVIDER` env var only (`system-monitor.ts:156`) | WARN — no actual disk/S3 check |
| AI Provider | ⚠️ | Reads `AI_PROVIDER` + checks API key exists for openai/anthropic (`system-monitor.ts:158-168`) | WARN — no actual API ping |
| pgvector | ✅ | Checks `pg_extension` + `DocumentChunk` table metadata (`system-monitor.ts:113-132`) | OK — metadata only, no real vector op |
| Filesystem | ❌ Stub | Static `{ status: "ok" }` (`system-monitor.ts:173`) | WARN — no actual check |
| Email/SMTP | ❌ Missing | Not implemented | MISSING |
| Object Storage (S3) | ❌ Missing | Not implemented | MISSING |

**Coverage:** 80% (8 of 10 logical components) — 1 is a stub, 1 is static-only

**Gaps:**
- `filesystem` health returns hardcoded "ok" with no actual disk read/write check
- `storage` health only reads an env var — no actual S3/local-storage connectivity test
- No email/SMTP health check
- No AI provider actual connection test (just checks env var existence)
- Health endpoint at `/api/health` has no auth — safe (read-only, no sensitive data), but could be used for DoS reconnaissance

---

## 2. Metrics

### Endpoints Found

| Endpoint | Auth | Format |
|----------|------|--------|
| `GET /api/metrics` | Admin | Custom JSON |
| `GET /api/monitoring/health?scope=system` | Admin | Custom JSON (system metrics sub-object) |
| `GET /api/monitoring/health?scope=queue` | Admin | Custom JSON (queue metrics sub-object) |

### Metrics Exposed

| Metric | Source | Format |
|--------|--------|--------|
| Engagement counts by status | `prisma.auditEngagement.groupBy` (`metrics/route.ts:14-21`) | JSON |
| Decision counts by status | `prisma.decision.groupBy` (`metrics/route.ts:23-29`) | JSON |
| Total engagements | `prisma.auditEngagement.count` (`metrics/route.ts:32-34`) | JSON |
| Total decisions | `prisma.decision.count` (`metrics/route.ts:35-37`) | JSON |
| Total clients | `prisma.auditClient.count` (`metrics/route.ts:38-40`) | JSON |
| Total evidence items | `prisma.auditEvidence.count` (`metrics/route.ts:41-43`) | JSON |
| System metrics (memory, CPU, uptime) | `getSystemMetrics()` via monitoring/health | Custom JSON |
| Queue metrics (waiting, active, completed, failed, delayed) | `getQueueMetrics()` via monitoring/health | Custom JSON |

### Missing Metrics

| Missing Metric | Severity | Reason |
|---------------|----------|--------|
| API request rate (RPS) | HIGH | Cannot detect traffic spikes |
| API error rate (5xx/4xx) | HIGH | Cannot detect error bursts |
| API latency percentiles (p50/p95/p99) | HIGH | Not included outside AI observability |
| Concurrent users/sessions | MEDIUM | No visibility into active users |
| Database connection pool usage | MEDIUM | No visibility into DB pressure |
| External API call rates | MEDIUM | AI provider calls tracked but not aggregate |
| CPU/Memory trends over time | LOW | Current values only, no time series |
| Prometheus format | LOW | Custom JSON — not compatible with standard Prometheus scrape |

**Gaps:**
- No Prometheus-compatible metrics endpoint
- No time-series metrics storage — all metrics are point-in-time
- No request/response metrics at the HTTP level
- `/api/metrics` only contains business-level counts, not system-level signals
- No metrics for file uploads/downloads, export operations, or other key workflows

---

## 3. Error Tracking

### Current State

| Capability | Status | Details |
|-----------|--------|---------|
| Structured logger | ✅ | `src/lib/platform/logger.ts` — level-based, metadata support, formatted output |
| Legacy logger | ⚠️ | `src/lib/logger.ts` — simpler version, different API, potential confusion |
| Sentry integration | ✅ | Configured in `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`; instrumentation in `src/instrumentation.ts:1,15` |
| Sentry DSN | ⚠️ | Loaded from `SENTRY_DSN` env var — will silently no-op if not set |
| Sentry enabled | ⚠️ | Only in production (`sentry.server.config.ts:7`) |
| `console.error` usage | ⚠️ | 16 direct `console.error` calls found across lib/ — bypassing the structured logger |
| Platform audit log for errors | ✅ | `writePlatformAuditLog` with severity "error" used for health failures (`system-monitor.ts:185-192`) |
| Centralized error handler | ❌ | `onRequestError = Sentry.captureRequestError` only covers request errors in production |
| Error aggregation/alerts | ❌ | No system to aggregate, deduplicate, or alert on errors |

### Analysis

- **Two loggers exist**: `@/lib/logger` (simple, `src/lib/logger.ts:1-70`) and `@/lib/platform/logger` (richer, `src/lib/platform/logger.ts:1-70`). This dual-logger pattern is confusing and risks inconsistent usage.
- **Sentry is production-only**: Dev/staging errors are not tracked externally.
- **Direct `console.error` bypasses logger**: 16 instances across the codebase (queue-runtime, redis-client, email sender, audit DB, sales store, auth-config, etc.) bypass the structured logger entirely.
- **No error aggregation dashboard**: The monitoring dashboard (`/monitoring`) shows failed queue jobs but does not aggregate or display application errors from the logger.
- **No log shipping**: Neither logger writes to files, stdout JSON, or external log aggregation services (ELK, Datadog, etc.).

**Gap:** Errors are scattered across `console.error`, two loggers, and Sentry (production only). No centralized error visibility for the pilot operator.

---

## 4. Spend Tracking

### Implementation

| Component | File | Details |
|-----------|------|---------|
| Spend tracker | `src/lib/ai/spend-tracker.ts` | Reads `platformAuditLog` records with `action: "ai_generation"`, calculates cost via `getModelCost()` |
| Spend summary | `spend-tracker.ts:36-133` | `getAISpendSummary(days)` — returns totalCost, totalRequests, byProvider, byModel, byDay, topOrgs |
| Cost mapping | `getModelCost()` from `@/lib/ai/cost-mapping` | Model-specific per-1K-token costs |
| API route | `src/app/api/ai/spend/route.ts` | Admin-protected, returns spend summary |
| AI observability | `src/lib/ai/observability.ts` | Combines spend + governance + latency metrics |
| Dashboard | `src/app/(dashboard)/monitoring/ai/page.tsx` | Rich dashboard showing spend trends, by-product, by-provider, latency, errors |

### Fix Verification

The `getAISpendSummary()` function in `spend-tracker.ts:78-79` correctly uses:
```typescript
const totalCost = toCurrency(entries.reduce((s, e) => s + e.totalCost, 0))
const totalRequests = entries.length
```
Both `totalCost` and `totalRequests` are derived from the same `entries` array — no disconnect between the two.

### Pilot Operator Visibility

| Question | Answer |
|----------|--------|
| Can pilot operator see AI spend? | ✅ Yes — via `/monitoring/ai` dashboard |
| Real-time? | ⚠️ Near-real-time — data comes from `platformAuditLog` which is written on each AI call |
| Break down by model? | ✅ Yes — table per model with cost and avg tokens |
| Break down by provider? | ✅ Yes — per-provider with error rate and fallback count |
| Break down by product? | ✅ Yes — per-product with review rate and errors |
| Daily trend chart? | ✅ Yes — spend and request trends over time |
| Latency metrics? | ✅ Yes — P50/P95/P99 latency distribution |
| Org-level spend? | ✅ Yes — top organizations by spend |

**Verdict:** Spend tracking is **satisfactory for pilot**. The observability layer is one of the strongest components.

---

## 5. Queue Monitoring

### Implementation

| Capability | Status | Details |
|-----------|--------|---------|
| Queue metrics (counts) | ✅ | `getQueueMetrics()` in `system-monitor.ts:202-218` — waiting, active, completed, failed, delayed |
| Failed jobs list | ✅ | `getFailedJobs(limit)` in `system-monitor.ts:220-234` |
| Job detail view | ✅ | `GET /api/monitoring/queue/jobs?status=&limit=` in `jobs/route.ts` |
| Job retry | ✅ | `POST /api/monitoring/queue/retry` in `retry/route.ts` — with audit log |
| Dashboard page | ✅ | `/monitoring/queue` — full RTL UI with tabbed job views and retry button |
| Main dashboard integration | ✅ | `/monitoring` shows queue summary cards + recent failed jobs |

### Missing

| Missing | Severity | Details |
|---------|----------|---------|
| Job processing rate (jobs/sec) | MEDIUM | Not tracked — `jobsPerSecond` field exists in `QueueMetrics` interface (`system-monitor.ts:32`) but is never populated |
| Job latency/processing time | MEDIUM | Duration is computed client-side from timestamps, not aggregated as a metric |
| Queue depth trend over time | MEDIUM | Only current point-in-time counts — no historical trend |
| Worker pool metrics | LOW | No visibility into worker count, concurrency, saturation |
| Dead letter queue | LOW | Bull auto-removes failed jobs after configurable limit — no separate tracking |

**Verdict:** Queue monitoring is **functional for pilot** — operator can see counts, drill into jobs, and retry failures. Missing processing rate and latency aggregation.

---

## 6. pgVector Health

### Implementation

`checkPgVectorHealth()` at `system-monitor.ts:113-132`:

1. **Extension check** (line 116-121): Queries `pg_extension WHERE extname = 'vector'` — verifies the extension exists in PostgreSQL
2. **Table check** (line 122-127): Queries `information_schema.tables WHERE table_name = 'DocumentChunk'` — verifies the DocumentChunk table exists
3. **Status logic**: If extension missing → `error`; If extension exists but table missing → `warn`; Both exist → `ok`

### Assessment

| Aspect | Verdict |
|--------|---------|
| Extension existence | ✅ Checked |
| Table existence | ✅ Checked |
| Real vector operation | ❌ **NOT performed** — no actual `SELECT 1 <-> '[...]'::vector` or index check |
| Index/size check | ❌ Not performed |

**The check confirms the extension is installed and the expected table exists, but does not verify that vector indexing works, that the vector columns are properly formed, or that a similarity search query succeeds.** This is a metadata-only check.

**Risk:** If the vector extension is corrupted or the column type is wrong, the health check would still report "ok" but actual vector queries would fail at runtime.

---

## 7. Dashboard

### Routes Found

| Route | Description | Auth |
|-------|-------------|------|
| `/monitoring` | Main platform monitoring dashboard | Workspace (admin) |
| `/monitoring/ai` | AI observability dashboard | Workspace (admin) |
| `/monitoring/queue` | Queue management and job detail | Workspace (admin) |
| `/monitoring/reviews` | Unified cross-product review page | Workspace (admin) |

### What the Pilot Operator Can See

**Main dashboard (`/monitoring`):**
- Health status of all 8 components with color-coded cards (green/yellow/red)
- System resource metrics (uptime, RSS, heap used/total, external)
- Queue overview (waiting, active, completed, failed, delayed counts)
- Recent failed jobs with error messages
- Link to unified reviews page

**AI dashboard (`/monitoring/ai`):**
- Total AI requests, total cost, review rate, average confidence
- Daily spend trend chart
- Daily request trend chart
- Daily review/governance trend chart
- Daily error chart
- Per-product breakdown table (requests, cost, reviewed, errors)
- Per-provider breakdown table (requests, cost, latency, error rate, fallbacks)
- Latency distribution (P50/P95/P99)
- Top organizations by spend

**Queue page (`/monitoring/queue`):**
- Tabs for failed/waiting/active/completed jobs
- Job detail modal with type, attempts, timestamps, duration, failed reason, stacktrace
- Retry button for failed jobs
- Links back to main monitoring

**Reviews page (`/monitoring/reviews`):**
- All pending reviews across AuditOS, SalesOS, LocalContentOS, WorkflowOS
- Product filter with counts
- Approve/reject/return actions per review

### What's Missing

| Missing | Priority | Reason |
|---------|----------|--------|
| Database connection pool usage | MEDIUM | Critical for diagnosing DB saturation |
| HTTP request/error rate chart | HIGH | Cannot see traffic patterns or error spikes |
| Active user/session count | MEDIUM | No visibility into platform usage |
| Real-time log viewer | LOW | Nice-to-have but not critical for pilot |
| Alert history panel on dashboard | LOW | `getAlertHistory()` exists but not displayed |

**Verdict:** The monitoring dashboard is **comprehensive for pilot** — health, system, queue, AI spend, and reviews are all visible. The main gap is HTTP-level metrics and real-time error tracking.

---

## Overall Score

| Category | Coverage | Assessment |
|----------|----------|------------|
| Health endpoints | 80% | Good — missing filesystem (stub) and storage (static) real checks |
| Metrics | 50% | Business metrics exposed but no HTTP-level, latency, or Prometheus metrics |
| Error tracking | 40% | Sentry in production only, dual loggers, scattered `console.error` |
| Spend tracking | 95% | Excellent — dashboard, per-product/per-provider/per-org, trends |
| Queue monitoring | 85% | Good — counts, job detail, retry; missing processing rate trends |
| pgvector health | 60% | Metadata-only; no real vector operation test |
| Dashboard UX | 85% | Rich RTL bilingual dashboards; missing HTTP/error-rate/alert-history |

**Overall Coverage: 70%**

### Missing Signals (Priority-Ordered)

| Priority | Signal | Impact |
|----------|--------|--------|
| P0 | HTTP request/error rate | Cannot detect API degradation or error bursts |
| P0 | Centralized error visibility | Errors are scattered, not aggregated for operator |
| P1 | Real vector operation test | pgvector could be corrupted but health shows "ok" |
| P1 | Database connection pool metrics | Cannot diagnose DB saturation before it becomes critical |
| P1 | Filesystem health real check | Disk-full scenarios invisible |
| P2 | Queue processing rate | Cannot detect gradual queue slowdown |
| P2 | Active users/sessions | No concurrent usage visibility |
| P2 | Prometheus endpoint | Cannot integrate with standard monitoring infra |

### Recommended Alerts

| Alert | Priority | Trigger |
|-------|----------|---------|
| Health check → unhealthy | P0 | Any component returns "error" |
| Queue failure rate spike | P0 | >5 failed jobs in 5 minutes |
| AI spend daily threshold | P1 | Daily cost exceeds configurable limit |
| Redis unreachable | P1 | Redis health check fails |
| Database unreachable | P1 | Database health check fails |
| Queue job latency > 60s | P1 | Job processing time exceeds threshold |
| Memory > 80% heap | P2 | heapUsedMb / heapTotalMb > 0.8 |
| Disk space low | P2 | Filesystem health check (once implemented) |

### Verdict

**MINOR GAPS for pilot**

The observability stack is stronger than expected for a v0.1 product:

- Health checks cover the major infrastructure components (DB, Redis, Queue, pgvector)
- AI spend observability is production-grade with per-product, per-provider, and trend visualization
- Queue management dashboard supports job inspection and retry
- The monitoring pages are fully bilingual (Arabic-first) with RTL layout

**Critical gaps to resolve before production:**
1. Add HTTP request/error rate metrics (P0)
2. Standardize error logging — eliminate dual logger and `console.error` scatter (P0)
3. Add real vector operation to pgvector health check (P1)
4. Implement real filesystem and storage health checks (P1)
5. Add queue processing rate metric (P2)
