# Observability Stack Audit Report

**Date:** 2026-06-04 (updated 2026-06-04 with fixes)
**Auditor:** Observability Agent (AQLIYA)
**Status:** COMPLETE — Read-only audit of all monitoring and observability surfaces

---

## Table of Contents

1. [System Monitor Audit](#1-system-monitor-audit)
2. [AI Observability Audit](#2-ai-observability-audit)
3. [Metrics Endpoint Review](#3-metrics-endpoint-review)
4. [Health Check Review](#4-health-check-review)
5. [Alerting Coverage](#5-alerting-coverage)
6. [Readiness Gaps](#6-readiness-gaps)

---

## 1. System Monitor Audit

**Source file:** src/lib/platform/monitoring/system-monitor.ts
**Tests:** src/lib/platform/monitoring/__tests__/system-monitor.test.ts

### 1.1 Health Checks — Current Coverage

| Component   | Status      | What It Checks                                                                 | Produces    |
|-------------|-------------|--------------------------------------------------------------------------------|-------------|
| server    | ✅ Implemented | Returns uptime in seconds (in-memory START_TIME)                           | ok        |
| env       | ✅ Implemented | Checks DATABASE_URL and AUTH_SECRET are set                               | ok/warn |
| database  | ✅ Implemented | Runs SELECT 1 via Prisma, measures latency                                  | ok/error|
| edis     | ✅ Implemented | ensureRedisConnected() + client.ping(), warns if REDIS_URL unset        | ok/warn/error |
| queue     | ✅ Implemented | Gets Bull queue counts (waiting/active/completed/failed/delayed), respects FF | ok/warn/error |
| storage   | ⚠️ Stub       | Returns STORAGE_PROVIDER env var or "local", no real check                | ok        |
| i        | ⚠️ Partial    | Checks AI_PROVIDER env + relevant API key presence. **No connectivity test**| ok/warn |
| ilesystem| ⚠️ Stub       | Returns { status: "ok" } unconditionally. **No real check**                 | ok        |

### 1.2 Missing Health Checks

| Missing Check         | Severity | Impact                                                                 |
|-----------------------|----------|------------------------------------------------------------------------|
| **pgvector**           | **HIGH**  | RAG/embedding pipeline will silently fail if pgvector is down. No health check. ✅ **FIXED 2026-06-04** |
| **Disk space**         | **HIGH**  | Uploads, exports, logs can fill disk. No monitoring.                   |
| **File upload storage**| **HIGH**  | Local ./uploads or S3 bucket not checked for accessibility/write.    |
| **AI connectivity**    | **MEDIUM**| Only env vars checked, not actual provider reachability.               |
| **Process health**     | **MEDIUM**| No check for orphaned workers, stuck processes.                        |
| **SSL certificate**    | **LOW**   | Not applicable for dev; needed for production.                         |
| **Database migration** | **MEDIUM**| No check that migrations are up-to-date (prisma migrate status).     |

### 1.3 Queue Metrics

✅ **Implemented:** getQueueMetrics() returns waiting/active/completed/failed/delayed counts.
✅ **Implemented:** getFailedJobs() returns last N failed jobs with reason and timestamp.
✅ **Implemented:** Retry via POST /api/monitoring/queue/retry (admin-only).
✅ **Implemented:** Job listing via GET /api/monitoring/queue/jobs?status=....
⚠️ **Missing:** Jobs-per-second throughput, average processing time, queue growth rate.

### 1.4 Alert Mechanism

⚠️ **In-memory only.** The createAlert() function:
- Pushes to an in-memory lertHistory array (max 1000 entries)
- Writes an audit log entry to platformAuditLog
- **Does NOT** deliver to any external channel (no Slack, no PagerDuty, no email, no webhook)

⚠️ **No persistent alert storage.** Alerts are lost on process restart.
⚠️ **No alert rules engine.** Alerts are only created programmatically via createAlert() calls.

---

## 2. AI Observability Audit

### 2.1 Source Files

| File                              | Purpose                                         |
|------------------------------------|--------------------------------------------------|
| src/lib/ai/observability.ts     | Aggregated AI observability data (main query)    |
| src/lib/ai/spend-tracker.ts     | Spend breakdown by provider/model/day/org        |
| src/lib/ai/governance-metrics.ts| Governance metrics (review rate, override rate)  |
| src/lib/ai/cost-mapping.ts      | Static model→cost mapping table                  |
| src/app/api/ai/observability/route.ts | REST endpoint serving AI observability data |

### 2.2 Spend Tracking

| Category           | Coverage | Details                                                                 |
|--------------------|----------|-------------------------------------------------------------------------|
| **Total cost**     | ✅       | Aggregated from platformAuditLog.metadata.totalCost                   |
| **By provider**    | ✅       | OpenAI/Anthropic/other broken out by provider key                       |
| **By model**       | ✅       | Via cost-mapping.ts model→cost lookup (gpt-4o, gpt-4o-mini, claude-sonnet-4, claude-haiku-3-5) |
| **By day**         | ✅       | Daily spend trend over configurable period (default 30 days)            |
| **By organization**| ✅       | Top 10 orgs by spend, with usage bar                                   |
| **By product**     | ✅       | yProduct breakdown (ai_core, audit, localcontent, office_ai, decision, sales, sunbul) |
| **Currency**       | ✅       | USD (hardcoded in cost-mapping, not dynamic)                            |
| **Per-request cost**| ✅      | Calculated from token counts + model cost rates                         |

**Remaining gaps:**
- ⚠️ Cost mapping only has 4 models (GPT-4o, GPT-4o-mini, Claude Sonnet 4, Claude Haiku 3.5). Unknown models return  cost — silent undercounting.
- ⚠️ yModel.avgTokens in spend-tracker.ts has a **bug**: line 100 recomputes vgTokens by filtering all entries again, incorrectly accumulating into the initialized value. The result is inflated.
- ⚠️ Spend data is only as accurate as metadata.totalCost stored in audit logs — if a caller doesn't set it, spend is not tracked.

### 2.3 Governance Metrics

| Metric             | Coverage | Details                                                             |
|--------------------|----------|---------------------------------------------------------------------|
| **Review rate**    | ✅       | % of AI outputs pending human review (iOutputReviewStatus)       |
| **Override rate**  | ✅       | % of AI outputs rejected (in governance-metrics.ts only)          |
| **Auto-accept rate**| ✅      | % automatically accepted without review                             |
| **Average confidence**| ✅    | From metadata.confidence, average across all requests             |
| **By task type**   | ✅       | yTaskType breakdown in governance-metrics.ts                     |
| **Governance trend**| ✅      | Daily chart: reviewed vs auto-accepted over time                    |

**Remaining gaps:**
- ⚠️ verageConfidence in observability.ts defaults to 0.85 if confidence is 0 — this **masks missing data**.
- ⚠️ No breakdown by **reviewer performance** (who reviews fast, who rejects often).
- ⚠️ No **time-to-review** tracking (how long outputs wait for human review).
- ⚠️ No **escalation tracking** (which reviews were escalated, how often).

### 2.4 Latency Tracking

| Metric | Coverage | Details                                                        |
|--------|----------|----------------------------------------------------------------|
| **P50**| ✅       | Calculated from metadata.latencyMs array (percentile index)  |
| **P95**| ✅       | Same calculation, index at 95%                                 |
| **P99**| ✅       | Same calculation, index at 99%                                 |
| **Average**| ✅    | Per-provider average latency                                  |

**Remaining gaps:**
- ⚠️ The UI displays P50/P95/P99 as single MetricCard values. No **histogram**, no **distribution chart**, no **trend over time**.
- ⚠️ Latency is only as accurate as the caller providing metadata.latencyMs.
- ⚠️ No breakdown by **model** (only by provider).

### 2.5 Error Tracking

| Category          | Coverage | Details                                              |
|-------------------|----------|------------------------------------------------------|
| **By product**    | ✅       | yProduct.errors count in observability            |
| **By provider**   | ✅       | Provider error rate in observability + governance    |
| **Daily trend**   | ✅       | Error count over time chart                          |
| **Fallback count**| ✅       | allbackCount tracked per provider                 |

**Remaining gaps:**
- ⚠️ No **error categorization** (rate limit vs timeout vs auth vs model error).
- ⚠️ No **error rate alert threshold**.
- ⚠️ No **retry tracking** (how many requests were retried and succeeded).

### 2.6 Circuit Breaker Observability

❌ **Not implemented.** No circuit breaker patterns found anywhere in the codebase.
- No tracking of circuit breaker state (open/closed/half-open).
- No fallback metrics beyond allbackCount.
- No automatic provider failover observability.

---

## 3. Metrics Endpoint Review

**Source:** src/app/api/metrics/route.ts

### 3.1 Current Metrics Exposed

| Metric               | Type    | Notes                                                |
|----------------------|---------|------------------------------------------------------|
| engagements        | groupBy | Count of audit engagements by status                  |
| decisions          | groupBy | Count of decisions by status                          |
| 	otalEngagements   | count   | Total audit engagements (org-scoped)                  |
| 	otalDecisions     | count   | Total decisions (org-scoped)                          |
| 	otalClients       | count   | Total audit clients (org-scoped)                      |
| 	otalEvidence      | count   | Total evidence items (org-scoped)                     |

### 3.2 Format

**JSON only** — not Prometheus-compatible. Returns:
`json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "..." }
}
`

### 3.3 Auth

✅ Requires ADMIN role via equireUserContext("ADMIN").
✅ Scoped to user's organization.

### 3.4 Critical Gaps

| Missing Metric                          | Severity | Reason                                                         |
|-----------------------------------------|----------|----------------------------------------------------------------|
| **System metrics (CPU, memory, uptime)**| **HIGH**  | No external monitoring can see process health                  |
| **Queue metrics**                       | **HIGH**  | Job processing health not exposed to external systems          |
| **Database connection pool**            | **HIGH**  | Prisma pool usage not exposed                                  |
| **HTTP request rate/errors/latency**    | **HIGH**  | No request-level metrics for the platform                      |
| **AI spend / request counts**           | **MEDIUM**| Cannot integrate with external billing/monitoring              |
| **Active users / sessions**             | **MEDIUM**| No user activity metrics                                       |
| **Error rate (5xx, 4xx)**               | **HIGH**  | No HTTP error rate exposed                                     |
| **Prometheus /metrics format**        | **MEDIUM**| Cannot scrape into standard monitoring systems                 |
| **API response time percentiles**       | **HIGH**  | No API latency metrics                                         |

---

## 4. Health Check Review

### 4.1 Endpoints

| Endpoint                        | Auth    | Response Code                              | Notes                            |
|---------------------------------|---------|--------------------------------------------|----------------------------------|
| GET /api/health               | ❌ None | 200 (healthy/degraded), 503 (unhealthy)    | Public; returns JSON             |
| GET /api/monitoring/health    | ✅ Admin | 200 with { success, data } wrapper       | Requires auth; richer scope      |

### 4.2 What /api/health Checks

1. server — uptime (always ok)
2. env — DATABASE_URL + AUTH_SECRET present
3. database — SELECT 1 via Prisma
4. edis — connection + PING
5. queue — Bull queue stats (if enabled)
6. storage — env var only
7. i — API key presence only

### 4.3 What Is NOT Checked

| Missing Check               | Severity | Detail                                                           |
|-----------------------------|----------|------------------------------------------------------------------|
| ~~pgvector availability~~ | ~~HIGH~~ | ~~RAG/embedding features depend on pgvector. A broken vector extension silently degrades AI.~~ ✅ **FIXED 2026-06-04** |
| **Filesystem writeability**  | **HIGH**  | Upload directory may be read-only, full, or missing. No check.   |
| **Storage backend**          | **MEDIUM**| S3/Minio connectivity not tested (only env var read).            |
| **AI provider connectivity** | **MEDIUM**| Only checks API key presence, does not actually call the provider. |
| **DB connection pool**       | **HIGH**  | No pool utilization metric or health check.                      |
| **Migration status**         | **MEDIUM**| No check that schema is up-to-date.                              |
| **Notification engine**      | **LOW**   | No check that notification delivery (email/queue) is functional. |

---

## 5. Alerting Coverage

### 5.1 Current Alert Infrastructure

| Component                | Status | Notes                                                          |
|--------------------------|--------|----------------------------------------------------------------|
| **In-memory alert list**  | ✅     | createAlert() stores in-memory, max 1000 entries             |
| **Audit log on alert**    | ✅     | Every alert writes to platformAuditLog                          |
| **Alert acknowledge**     | ✅     | cknowledgeAlert() toggles boolean flag                      |
| **Budget alert feature flag**| ⚠️  | i.budget-alerts FF exists (FF_AI_BUDGET_ALERTS) but no implementation tied to it |
| **External delivery**     | ❌     | No Slack, PagerDuty, email, webhook, or SMS delivery           |
| **Alert rules engine**    | ❌     | No threshold configuration, no escalation policy               |
| **Alert persistence**     | ❌     | Lost on process restart (in-memory only)                       |
| **Paging / on-call**      | ❌     | No on-call rotation, no escalation, no auto-acknowledge        |

### 5.2 What Would NOT Be Caught If It Broke

| Scenario                              | Caught? | Why Not                                                              |
|---------------------------------------|---------|----------------------------------------------------------------------|
| Database down                         | ✅      | Health check → degraded/unhealthy                                    |
| Redis down                            | ✅      | Health check → degraded/unhealthy                                    |
| Queue worker crash                    | ⚠️      | Failed jobs visible but no alert sent                                |
| pgvector extension unavailable        | ✅ **FIXED** | Health check added: pgvector extension + DocumentChunk table        |
| Filesystem full (upload dir)          | ❌      | No disk space check                                                  |
| AI provider API key expired           | ⚠️      | Checked at health check time only; not continuously                  |
| AI spend exceeds monthly budget       | ⚠️      | FF exists but no implementation wired                                |
| Slow AI responses (P99 > 10s)         | ❌      | Data tracked but no threshold alert                                  |
| High error rate from provider         | ❌      | Data tracked but no threshold alert                                  |
| SSL certificate expiry                | ❌      | Not monitored                                                        |
| Memory leak (heap growth)             | ⚠️      | System metrics visible in dashboard but no threshold alert           |
| Orphaned background jobs              | ❌      | No job timeout/progress monitoring                                   |
| Notification engine failure           | ❌      | No health check                                                      |
| Database migration drift              | ❌      | No prisma migrate status check                                     |

---

## 6. Readiness Gaps

### 6.1 Pre-Pilot Gaps (Must Fix Before Any Pilot)

These are **HIGH severity** issues that would cause blind spots during a pilot.

| # | Gap                        | Risk | Fix Required                                                         |
|---|----------------------------|------|----------------------------------------------------------------------|
| 1 | ~~pgvector health check~~ | ~~HIGH~~ | ~~Add checkPgVectorHealth()~~ ✅ **FIXED 2026-06-04:** checkPgVectorHealth() added to system-monitor.ts with extname + table checks. |
| 2 | **Filesystem writeability**| HIGH | Add real check: attempt to write+delete a temp file in upload dir    |
| 3 | **No external alert delivery**| HIGH | Wire createAlert() → notification engine → email for critical alerts (at minimum) |
| 4 | **Metrics endpoint incomplete** | HIGH | Add system metrics (memory, CPU, uptime) to /api/metrics          |
| 5 | **No budget alert implementation** | HIGH | Wire i.budget-alerts FF to send notification when spend crosses threshold |
| 6 | **AI provider connectivity** | MEDIUM | Add lightweight ping to AI provider (e.g., list models API)         |

### 6.2 Pre-Production Gaps (Must Fix Before Production)

| # | Gap                        | Risk | Fix Required                                                         |
|---|----------------------------|------|----------------------------------------------------------------------|
| 7 | **Prometheus metrics format** | HIGH | Add /api/metrics/prometheus endpoint returning Prometheus text format |
| 8 | **Request-level HTTP metrics** | HIGH | Add middleware to track request count, latency, error rate           |
| 9 | **Alert rules engine**     | HIGH | Implement threshold configuration (e.g., error rate > 5%, P99 > 10s) |
| 10| **Persistence for alerts** | HIGH | Store alerts in DB platformAlert or similar model                   |
| 11| **Circuit breaker patterns** | MEDIUM | Add provider circuit breaker with open/closed/half-open observability |
| 12| **AI latency alerts**      | MEDIUM | Alert when P95/P99 latency exceeds configurable thresholds           |
| 13| **Error categorization**   | MEDIUM | Categorize AI errors (rate_limit, timeout, auth, model_error)        |
| 14| **Time-to-review tracking** | MEDIUM | Track how long AI outputs wait for human review, alert on backlog   |
| 15| **Reviewer performance**   | LOW     | Track review throughput by reviewer                                  |
| 16| **Spend trend forecasting**| LOW     | Predict monthly spend based on daily trend                           |

### 6.3 Risk Heat Map

`
HIGH RISK ─────────────────────────────────────────────►
                                                      
  pgvector health check           ████████████████    
  Filesystem writeability check   ████████████████    
  External alert delivery         ████████████████    
  Prometheus metrics              ████████████████    
  HTTP request metrics            ████████████████    
  Alert persistence               ████████████████    
  Budget alert (wiring)           ████████████████    
                                                      
MEDIUM RISK ─────────────────────────────────────────►
                                                      
  AI connectivity test            ████████████        
  Circuit breaker observability   ████████████        
  Latency alerting                ████████████        
  Error categorization            ████████████        
  Migration status check          ████████████        
  Time-to-review tracking         ████████████        
                                                      
LOW RISK ────────────────────────────────────────────►
                                                      
  Reviewer performance metrics    ████                
  Spend forecasting               ████                
  SSL certificate monitoring      ████                
`

---

## Appendix A: Files Inspected

| File | Status |
|------|--------|
| src/lib/platform/monitoring/system-monitor.ts | ✅ Read |
| src/lib/platform/monitoring/__tests__/system-monitor.test.ts | ✅ Read |
| src/lib/ai/observability.ts | ✅ Read |
| src/lib/ai/spend-tracker.ts | ✅ Read |
| src/lib/ai/governance-metrics.ts | ✅ Read |
| src/lib/ai/cost-mapping.ts | ✅ Read |
| src/app/api/health/route.ts | ✅ Read |
| src/app/api/metrics/route.ts | ✅ Read |
| src/app/api/ai/observability/route.ts | ✅ Read |
| src/app/api/monitoring/health/route.ts | ✅ Read |
| src/app/api/monitoring/queue/jobs/route.ts | ✅ Read |
| src/app/api/monitoring/queue/retry/route.ts | ✅ Read |
| src/app/(dashboard)/monitoring/page.tsx | ✅ Read |
| src/app/(dashboard)/monitoring/ai/page.tsx | ✅ Read |
| src/app/(dashboard)/monitoring/queue/page.tsx | ✅ Read |
| src/app/(dashboard)/monitoring/reviews/page.tsx | ✅ Read |
| src/lib/platform/notifications/engine.ts | ✅ Read |
| src/lib/platform/notifications/types.ts | ✅ Read |
| src/lib/platform/notifications/constants.ts | ✅ Read |
| src/lib/platform/feature-flags/registry.ts | ✅ Read (alert FF) |

## Appendix B: Dashboard Screenshots Summary

The monitoring UI at /(dashboard)/monitoring/ provides:

1. **Main page** — Health status cards (Arabic: سليم/تحذير/عطل), system resources (RSS, Heap, External), queue metrics, failed jobs list, review link
2. **AI page** (/monitoring/ai/) — Spend/request/governance/error trend charts, per-product table, per-provider table, latency P50/P95/P99, top orgs
3. **Queue page** (/monitoring/queue/) — Queue counts, tabbed job lists (failed/waiting/active/completed), job detail modal with retry capability
4. **Reviews page** (/monitoring/reviews/) — Cross-product review queue with approve/reject/return actions

All dashboards are:
- ✅ Arabic-first (RTL layout, Arabic labels, Arabic error messages)
- ✅ Client-side fetch with loading/error/empty states
- ✅ Admin-only access (via API auth)

## Appendix C: Summary of Findings

| Category               | Status | Critical Issues                                              |
|------------------------|--------|--------------------------------------------------------------|
| Health checks          | ⚠️ 7/8 | Missing pgvector, disk, filesystem, AI connectivity          |
| AI observability       | ✅ Strong | Spend, governance, latency, errors all tracked              |
| Metrics endpoint       | ❌ Weak | Only AuditOS counts; no system/request/error metrics        |
| Alerting               | ❌ Missing | In-memory only; no external delivery; no rules engine       |
| Dashboards             | ✅ Good | Bilingual, functional, covers main surfaces                  |
| Tests                  | ✅ Good | System monitor tests cover metrics, health, queue, alerts   |
