# AQLIYA Alerting Runbook

**Document Owner:** Observability Agent
**Last Updated:** 2026-06-08
**Status:** Verified
**Applies to:** AQLIYA Platform Core — All Products

---

## 1. Alerting Philosophy

### What We Alert On

AQLIYA alerts on **observable, actionable conditions** that threaten platform availability, data integrity, governance compliance, or budget control. We do not alert on routine operational events.

### How We Alert

| Method | Channel | Use Case |
|--------|---------|----------|
| Sentry error tracking | Dashboard + email | Unhandled exceptions, error spikes, performance degradation |
| Structured log output | Console/stdout (aggregated by CloudWatch/Datadog) | Budget threshold crossings, rate limit events |
| Notification engine | In-app, email, webhook | Product-level workflow alerts (review, approval, escalation) |
| CI/CD pipeline | GitHub Actions | Build/test failure, post-deploy smoke test failure |
| Pilot daily monitor | Report output | Daily operational status for AuditOS pilot |

### What We Do NOT Alert On (by design)

- Routine 4xx client errors (they are expected and rate-limited)
- Non-critical deprecation warnings
- Unauthenticated probe traffic against `/api/health`
- Rate-limit hits below 10% of the preset limit
- Normal workflow state transitions (they are logged, not alerted)

---

## 2. Alert Severity Levels

| Level | Label | Response Time | Examples |
|-------|-------|---------------|---------|
| **CRITICAL** | Red | Within 15 minutes | Sentry error spike >5× baseline / Database unreachable / Build pipeline failure / Security incident |
| **WARNING** | Yellow | Within 2 hours | AI budget >=80% consumed / Error rate >5% of requests / Redis unreachable / Rate limit saturation >90% |
| **INFO** | Blue | Next business day | New deployment detected / Pilot feedback received / Budget threshold at 50% / Non-critical env var missing |

---

## 3. Current Alerting Capabilities

### 3.1 Sentry Error Tracking (Runtime)

**Config files:**
- `sentry.client.config.ts` — Browser runtime; `tracesSampleRate: 0.2`; enabled only in production
- `sentry.server.config.ts` — Node.js runtime; `tracesSampleRate: 0.5`; enabled only in production
- `sentry.edge.config.ts` — Edge runtime; `tracesSampleRate: 0.2`; enabled only in production

**Capabilities:**
- Unhandled exception capture (client + server + edge)
- Performance tracing with configurable sample rates
- Error grouping and spike detection
- Request error capture via `onRequestError` in `instrumentation.ts`

**Alerts configured:** Sentry default alert rules:
- Error count spike (>2× baseline in 10 min) → CRITICAL
- New error type (first occurrence) → WARNING
- Performance degradation (p95 > 5s) → WARNING

### 3.2 AI Budget Alerts (Product-Level)

**Source file:** `src/lib/ai/budget-manager.ts`

**How it works:**
- Monthly spend cap per organization (default: $100 USD)
- Monthly request cap per organization (default: 10,000)
- Monthly token cap per organization (default: 5,000,000)
- Alerts fire at configurable thresholds (default: 50%, 80%, 90%, 100%)

**Threshold-to-severity mapping:**

| Threshold | Severity | Action |
|-----------|----------|--------|
| 50% consumed | INFO | Log entry; no escalation |
| 80% consumed | WARNING | Log entry; notify organization admin |
| 90% consumed | WARNING (high) | Log entry; escalate to platform ops |
| 100% consumed | CRITICAL | Requests blocked; immediate escalation |

**Trigger mechanism:**
```typescript
// Called explicitly after AI generation
await triggerBudgetAlerts(organizationId);
```

### 3.3 Post-Deploy Smoke Test (CI Pipeline)

**Source file:** `scripts/platform/post-deploy-smoke.mjs`

**When it runs:** Automatically after CI deployment (`deploy.yml` -> post-deploy job)

**What it checks:**
1. Health endpoints (`/api/health`, `/api/health/ready`, `/api/health/live`)
2. Auth flows (login page, CSRF, protected route redirect)
3. SCIM API (with optional API key)
4. Marketing pages (homepage, about, products, platform)
5. Required and optional environment variables
6. Notification engine jest tests

**Failure handling:**
- Any critical check fails → CRITICAL alert → pipeline fails → deploy rolled back
- Non-critical check fails → WARNING; pipeline continues

### 3.4 Decision Risk Alerts (Product-Level)

**Source files:**
- `src/lib/decision/signals-alerts.ts` — Alert lifecycle (OPEN → ACKNOWLEDGED → RESOLVED)
- `src/lib/decision/signal-automation.ts` — D3-02 signal automation
- `src/actions/decision-signals-alerts.ts` — Server actions

**Models:**
- `DecisionMonitoringSignal` — System-generated signals from HIGH/MEDIUM risks (severity: INFO | LOW | MEDIUM | HIGH)
- `DecisionRiskAlert` — Human-review-required alerts (severity: LOW | MEDIUM | HIGH | CRITICAL)

**Lifecycle:**
Risk identified → Signal generated (system) → Alert created → OPEN
  → Reviewed by operator → ACKNOWLEDGED → Resolved by admin → RESOLVED

**Key rules:**
- Signals are system-only (never manually created)
- Alerts always require human review (`requiresReview: true`)
- Alerts never auto-resolve
- Resolution requires a description string (admin only)

### 3.5 Pilot Daily Monitor

**Source file:** `scripts/platform/pilot-daily-monitor.ts`

**Run command:** `npm run pilot:daily`

**Produces:** Structured daily report covering:

| Section | Metrics |
|---------|---------|
| 1. Health Check | DB connectivity, engagement count, events, AI outputs, users, open blockers |
| 2. Workflow Status | Account mappings, evidence, findings, recommendations, reviews, approvals, AI outputs |
| 3. Production Blockers | All blocker items with status |
| 4. Recent Activity | Last 5 audit events |
| 5. Upload & Auth Monitoring | Evidence events (24h), upload rejections, auth failures, role denied events |
| 6. Pilot Feedback | Recent feedback items with severity |
| 7. Summary | Overall status assessment |

### 3.6 Audit Health Check

**Source file:** `scripts/platform/audit-health-check.ts`

**Run command:** `npm run audit:health`

**Covers:** DB connectivity, engagement count, audit events, AI outputs, users, open blockers.

---

## 4. Alert Response Procedures

### 4.1 CRITICAL: Sentry Error Spike / Build Failure / Database Down

**Symptoms:** PagerDuty or Sentry alert fires. Pipeline fails. `/api/health` returns 503.

**Immediate actions (0-15 min):**
1. Check Sentry dashboard for error details and affected routes
2. Check `/api/health` for failing components
3. If database: verify PostgreSQL connectivity (see Rate Limiter Runbook for Redis outage procedures)
4. If build: check `deploy.yml` logs in GitHub Actions for specific failure
5. If error spike: identify common stack trace, check recent deployment

**Containment:**
- If deployment caused the issue: roll back to previous stable deployment
- If database issue: failover to replica or restore from backup
- If Sentry spike is transient: monitor for 15 min before escalating

**Runbooks to reference:**
- [Staging Environment Runbook](staging-environment.md) — Deployment troubleshooting
- [Rate Limiter Runbook](rate-limiter.md) — Rate limit / Redis incident response

### 4.2 WARNING: Budget Threshold Crossed / High Error Rate

**Symptoms:** AI budget usage >=80%. Error rate >5%. Redis unreachable.

**Immediate actions (0-2 hours):**
1. AI budget: Check `triggerBudgetAlerts()` output in logs
2. Error rate: Check Sentry for new error patterns
3. Redis: Verify `redis-cli ping` and check `REDIS_URL` config

**Remediation:**
- Budget: Notify organization admin; consider raising monthly cap
- Errors: Identify and fix the source; create a `ProductionBlocker` record
- Redis: Restart Redis or failover; the app falls back to in-memory automatically

### 4.3 INFO: New Deployment / Pilot Feedback

**Symptoms:** Deployment completed. Pilot feedback submitted.

**Actions (next business day):**
1. Verify post-deploy smoke test results
2. Review pilot daily monitor report
3. Acknowledge and triage pilot feedback
4. Update production blocker list

---

## 5. How to Configure Alerts

### 5.1 Sentry Alerts

Configure via Sentry dashboard:
1. Navigate to **Alerts** → **Create Alert**
2. Choose metric: "Error count", "New issues", "Performance"
3. Set conditions: "Above" baseline, configure threshold
4. Set action: Email, Slack webhook, PagerDuty
5. Add runbook URL: Reference this document

### 5.2 AI Budget Alerts

Configure per organization in `src/lib/ai/budget-manager.ts`:

```typescript
const customConfig: Partial<BudgetConfig> = {
  monthlySpendCapUsd: 500,
  alertThresholds: [0.6, 0.85, 0.95, 1.0], // 60%, 85%, 95%, 100%
};
// Set via setBudgetConfig(organizationId, customConfig)
```

Or via `platformSecret` in the database with key `budget_config:<organizationId>`.

### 5.3 Notification Engine Alerts

**Templates:** `src/lib/platform/notification/templates.ts`
**Integration:** `src/lib/platform/notification/integration.ts`

Register a product for notifications:
```typescript
import { registerProductChannels } from "@/lib/platform/notification";

registerProductChannels("my_product", ["in_app", "email", "webhook"]);
```

Send an alert:
```typescript
import { notifyOnEvent } from "@/lib/platform/notification";

await notifyOnEvent("on_error", organizationId, targetId, {
  productKey: "my_product",
  templateKey: "workflowos_escalation_alert",
  recipientId: userId,
  recipientEmail: "user@org.com",
  templateVars: { recordTitle: "...", daysPending: "5" },
});
```

### 5.4 CI Pipeline Alerts

Configured in `.github/workflows/deploy.yml`. Failed post-deploy smoke tests automatically fail the pipeline. Add Slack/GitHub notifications in the workflow file.

### 5.5 Pilot Daily Monitor

Run as a cron job (recommended: daily at 08:00 UTC):

```bash
# crontab entry
0 8 * * * cd /opt/aqliya && /usr/bin/node scripts/platform/pilot-daily-monitor.ts >> /var/log/pilot-daily.log 2>&1
```

---

## 6. How to Suppress False Positives

### 6.1 Sentry False Positives

1. **Ignore known patterns:** In Sentry, navigate to issue → "Ignore" → set conditions
2. **Archive:** Archive issues that are accepted as not actionable
3. **Rate-limit expected errors:** Use Sentry's inbound filter for known 4xx patterns

### 6.2 Budget Alert False Positives

- If budget alerts fire on dev/staging: ensure `FF_AI_COST_TRACKING` is disabled in non-production
- If threshold is too sensitive: adjust `alertThresholds` array in budget config

### 6.3 Smoke Test False Positives

- SCIM test without valid `SCIM_API_KEY` → non-critical warning (by design)
- If a critical check fails for infrastructure reasons (e.g., DB restarting during deploy):
  1. Re-run the smoke test: `npm run smoke:local`
  2. If passing, confirm deployment succeeded manually
  3. If failing persistently, treat as genuine failure

### 6.4 Pilot Daily Monitor False Positives

- **Zero-engagement state:** Expected in fresh deployments; add `--allow-empty` flag
- **Missing seed data:** Expected; run `npx prisma db seed` before first run

### 6.5 Decision Risk Alert False Positives

- Alerts from LOW severity risks can be acknowledged without action
- False alerts can be resolved with resolution note: "False positive — reassessed"
- To prevent future false positives: adjust risk assessment thresholds

---

## 7. On-Call Procedures

### 7.1 Primary On-Call

**Responsibility:** Handle CRITICAL alerts within 15 minutes.

**Handoff:**
- Daily at 09:00 local time (or follow team schedule)
- Handoff document must include: open alerts, ongoing investigations, known issues

**Communication:**
- Slack channel: `#aqliya-ops` (or equivalent)
- Escalation: Notify on-call lead after 15 min of no response

### 7.2 Secondary On-Call

**Responsibility:** Backup for primary; handles WARNING alerts.

**Coverage:** Same as primary; auto-escalated after 30 min of no primary response.

### 7.3 Off-Hours

- CRITICAL alerts page primary on-call via Sentry → PagerDuty integration (if configured)
- WARNING alerts are logged and reviewed at start of next business day
- INFO alerts are batched and reviewed during daily standup

---

## 8. Escalation Matrix

| Condition | First Responder | Escalate After | Escalation Target |
|-----------|----------------|----------------|-------------------|
| Database unreachable | On-call (primary) | 15 min | Database Admin / Platform Lead |
| Sentry error spike | On-call (primary) | 30 min | Engineering Lead |
| AI budget breach | Organization Admin | 2 hours | Platform Ops Lead |
| Security incident | On-call (primary) | Immediate | Security Team |
| Build pipeline failure | DevOps Lead | 1 hour | Engineering Lead |
| Pilot health critical | Pilot Program Lead | 4 hours | Product Manager |
| Decision risk alert | Decision Owner | — | No escalation (product-level workflow) |

---

## 9. Alert Definition Reference

| ID | Alert Name | Source | Severity | Detection Method | Response |
|----|-----------|--------|----------|-----------------|----------|
| A-01 | Sentry Error Spike | Sentry | CRITICAL | Error count >2x baseline in 10 min | Check deployment, roll back if needed |
| A-02 | New Error Type | Sentry | WARNING | First occurrence of error | Investigate root cause |
| A-03 | Performance Degradation | Sentry | WARNING | p95 response >5s | Check DB query plans, Redis, AI latency |
| A-04 | AI Budget 50% | Budget Manager | INFO | Spend >=50% of monthly cap | Log only |
| A-05 | AI Budget 80% | Budget Manager | WARNING | Spend >=80% of monthly cap | Notify org admin |
| A-06 | AI Budget 90% | Budget Manager | WARNING | Spend >=90% of monthly cap | Escalate to platform ops |
| A-07 | AI Budget Exceeded | Budget Manager | CRITICAL | Spend >=100% of monthly cap | Block requests, escalate |
| A-08 | Build Failure | CI (GitHub Actions) | CRITICAL | Pipeline test/build fail | Check logs, fix, redeploy |
| A-09 | Smoke Test Failure | Post-deploy smoke test | CRITICAL | Critical check fails | Roll back deployment; fix issue |
| A-10 | Database Down | Health endpoint | CRITICAL | `/api/health` returns 503 | Check PostgreSQL, failover if needed |
| A-11 | Redis Unreachable | Health endpoint / Logs | WARNING | Redis connection fails | Restart Redis (app auto-falls back) |
| A-12 | Storage Unreachable | Health endpoint | CRITICAL | `/api/health/ready` storage fails | Check filesystem / S3 config |
| A-13 | Auth Secret Missing | Health endpoint | CRITICAL | AUTH_SECRET not set | Set env var immediately |
| A-14 | Decision Risk Alert | Decision Engine | As assigned | Risk alert generated by signal automation | Product-level: review, acknowledge, resolve |
| A-15 | Rate Limit Saturation | Rate Limiter | WARNING | Rate limit hit rate >90% of preset | Check traffic pattern; consider increasing limit |
| A-16 | Pilot Health Degraded | Pilot Daily Monitor | WARNING | Open blockers >0 or health check fails | Review daily report; address blockers |

---

## 10. Related Documents

- [Monitoring Runbook](monitoring.md) — How to observe platform health
- [Staging Environment Runbook](staging-environment.md) — Deployment and verification
- [Rate Limiter Runbook](rate-limiter.md) — Rate limit configuration and incident response
- `src/lib/ai/budget-manager.ts` — AI budget alert implementation
- `src/lib/decision/signals-alerts.ts` — Decision risk alert lifecycle
- `src/lib/platform/notification/` — Notification engine (in-app, email, webhook)
- `scripts/platform/post-deploy-smoke.mjs` — CI/CD smoke test
- `scripts/platform/pilot-daily-monitor.ts` — Daily pilot health report
- `scripts/platform/audit-health-check.ts` — AuditOS health check

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-06-08 | Observability Agent | Initial runbook created from codebase verification |
