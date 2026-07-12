# AQLIYA Observability Baseline

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** dev

---

## 1. CloudWatch Dashboards

| Dashboard | Name | Contents |
|-----------|------|----------|
| AQLIYA Dev | `aqliya-dev-dashboard` | ALB, ECS, RDS, Redis metrics |

### Created by Terraform

```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"
}
```

---

## 2. CloudWatch Alarms

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| `rds-cpu-high` | `CPUUtilization` (RDS) | > 80% for 5min | SNS topic |
| `rds-free-storage` | `FreeStorageSpace` (RDS) | < 2GB | SNS topic |
| `ecs-cpu-high` | `CPUUtilization` (ECS) | > 80% for 5min | SNS topic |
| `alb-5xx-high` | `HTTPCode_Target_5XX_Count` (ALB) | > 10 for 5min | SNS topic |
| `alb-high-latency` | `TargetResponseTime` (ALB) | > 5s for 5min | SNS topic |

### SNS Topic

```
arn:aws:sns:eu-north-1:308621094029:aqliya-dev-alarms
```

All alarms publish to this topic. Subscribers must be added manually (email, Slack webhook, etc.).

---

## 3. CloudWatch Logs

| Log Group | Retention | Source |
|-----------|-----------|--------|
| `/ecs/aqliya-dev` | 30 days | ECS containers (app + ClamAV) |
| `/aws/rds/instance/aqliya-dev-db/postgresql` | 30 days | RDS PostgreSQL logs |

### Log Streams

| Prefix | Container |
|--------|-----------|
| `ecs/app/` | Next.js app container |
| `clamav/clamav/` | ClamAV sidecar |
| `migrate-v5/migrate/` | Database migration tasks |

### Log Queries

#### Find recent errors
```
fields @timestamp, @message
| filter @message like /(?i)error|exception|fail|warn/
| sort @timestamp desc
| limit 50
```

#### Find app health check results
```
fields @timestamp, @message
| filter @logStream like /ecs\/app/
| filter @message like /health|healthy|unhealthy|check/
| sort @timestamp desc
| limit 20
```

---

## 4. Health Endpoints

| Endpoint | Purpose | Expected Response | Auth |
|----------|---------|-------------------|------|
| `/api/health` | Full health check (DB + auth) | `{"status":"ok"}` | None |
| `/api/health/live` | Liveness probe | 200 | None |
| `/api/health/ready` | Readiness probe | 200 | None |

### What health checks

```json
{
  "status": "ok|degraded",
  "checks": {
    "database": { "ok": true|false, "detail": "...", "latencyMs": 2 },
    "auth_secret": { "ok": true|false }
  },
  "uptime": 423,
  "responseTimeMs": 3
}
```

---

## 5. Application Monitoring

| Tool | Status | Purpose |
|------|--------|---------|
| Sentry (error tracking) | ✅ Client + Server configured | Error and performance monitoring |
| `@sentry/nextjs` | ✅ Installed | Automatic error reporting |
| Sentry auth token | ❌ Not set in dev | Upload source maps for production |

### Sentry Configuration

Files:
- `sentry.client.config.ts` — Client-side Sentry
- `sentry.server.config.ts` — Server-side Sentry
- `sentry.edge.config.ts` — Edge runtime Sentry

**To enable source maps in production:**
```
# Set SENTRY_AUTH_TOKEN in the build environment
# Or configure in sentry.properties
```

---

## 6. Uptime Checks (Recommended)

For production, set up external uptime monitoring:

- [ ] **Pingdom** or **Checkly** synthetic check on `https://aqliya.com/api/health`
- [ ] Alert if 3 consecutive checks fail
- [ ] Scheduled every 1-5 minutes

---

## 7. WAF Metrics

| Metric | Where | Purpose |
|--------|-------|---------|
| `BlockedRequests` | CloudWatch → WAF namespace | Detect attack patterns |
| `AllowedRequests` | CloudWatch → WAF namespace | Traffic baseline |

Enable WAF metrics via Terraform:

```hcl
resource "aws_wafv2_web_acl" "cloudfront" {
  # ...
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "..."
    sampled_requests_enabled   = true
  }
}
```

✅ Already enabled.

---

## 8. Backup Monitoring

- Backup plan active: ✅ `aqliya-dev-backup-plan`
- Backup vault: ✅ `aqliya-dev-backup-vault`
- RDS automated backups: ✅ 1 day (pending maintenance window)

Check backup status:
```bash
aws backup list-backup-jobs --by-resource-type RDS --query 'BackupJobs[?State==`COMPLETED`].[CreationDate,CompletionDate]'
```
