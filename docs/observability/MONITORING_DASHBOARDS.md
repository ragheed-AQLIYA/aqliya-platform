# Monitoring Dashboards — AQLIYA Observability

> Last verified: 2026-07-11
> Owner: Observability Agent

---

## 1. Dashboard Inventory

### 1.1 Platform Monitoring Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/monitoring` (authenticated, `(dashboard)` layout) |
| **File** | `src/app/(dashboard)/monitoring/page.tsx` |
| **Type** | Server Component with `force-dynamic` |
| **Auto-refresh** | ⚠️ **PARTIAL** — Only the `LiveHealthCards` section polls every 30s. The remaining 5 panels render once per server request and require a manual page reload to update. |

**Sections:**

| Section | Component | Data Source | Real Data? |
|---------|-----------|-------------|------------|
| Platform Metric Cards | `MetricsCards` (inline) | Prisma counts across 12 models | ✅ Yes |
| AI Observability | `AiObservabilityCards` | `getAIObservability(7)` — last 7 days | ✅ Yes |
| Enterprise Health (Tier 3) | `EnterpriseHealthPanel` | `getEnterpriseHealthSnapshot()` | ✅ Yes |
| Trial Balance Firm Memory | `TbFirmMemoryKpisPanel` | `getFirmMemoryKpis()` | ✅ Yes |
| Evidence Health | `EvidenceHealthPanel` | `getEvidenceHealthSnapshot()` | ✅ Yes |
| Live Integration Health | `LiveHealthCards` (client) | `GET /api/integration/health` (30s poll) | ✅ Yes |

**Metrics displayed (Platform Metric Cards):**

| Arabic Label | English | Prisma Model |
|-------------|---------|--------------|
| مهام التدقيق | Audit Engagements | `auditEngagement` |
| القرارات | Decisions | `decision` |
| العملاء | Clients | `auditClient` |
| ملفات الأدلة | Evidence Files | `auditEvidence` |
| مشاريع المحتوى المحلي | Local Content Projects | `localContentProject` |
| جهات الاتصال | Contacts | `localContact` |
| حسابات المبيعات | Sales Accounts | `salesAccount` |
| مساحات المحتوى | Content Workspaces | `contentWorkspace` |
| المخاطر | Risks | `risk` |
| أحداث الذاكرة المؤسسية | Institutional Memory Events | `institutionalMemoryEvent` |
| إصدارات أساس المعرفة | Knowledge Foundation Versions | `knowledgeFoundationVersion` |
| أحداث التدقيق | Audit Events | `auditEvent` |

**Enterprise Health Panel (Tier 3) metrics:**

| Metric | Source |
|--------|--------|
| Rate Limiter mode | `getEnterpriseHealthSnapshot()` |
| Outbox failed/pending | Outbox table |
| ABAC enforce org count | ABAC evaluation |
| LCOS projects/findings/reviews/evidence | Local Content models |
| DecisionOS decisions/scenarios | Decision models |
| WorkflowOS records | Workflow models |
| Alerts (severity-coded) | Enterprise health checks |

**Evidence Health Panel metrics:**

| Metric | Source |
|--------|--------|
| CoreEvidence count | Evidence table |
| Backfill coverage % | Backfill coverage scan |
| Failed adapter syncs | Adapter sync log |
| Orphaned evidence | Orphan detection |
| Missing relations | Relation integrity |
| Audit / LC split | Per-product coverage |
| Lifecycle distribution | Status distribution |

**Live Health Cards (auto-refreshing):**

| Metric | Source | Refresh |
|--------|--------|---------|
| Total integrations | `/api/integration/health` | 30s |
| Healthy count | Aggregated | 30s |
| Degraded count | Aggregated | 30s |
| Unhealthy count | Aggregated | 30s |
| Circuit breaker states | Per-provider health | 30s |
| Consecutive failures | Failure counter | 30s |

---

### 1.2 Audit Portfolio Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/audit/portfolio` (authenticated) |
| **File** | `src/app/audit/portfolio/page.tsx` |
| **Type** | Server Component with `force-dynamic` |
| **Auto-refresh** | ❌ **Static** — requires manual page reload |
| **Data source** | `getOrganizationPortfolioAnalytics(orgId)` — real DB query |

> **Note:** There is no `/audit/dashboard` route. The portfolio page is the closest equivalent.

---

### 1.3 LocalContentOS Quality Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/local-content/quality-dashboard` (authenticated) |
| **File** | `src/app/local-content/quality-dashboard/page.tsx` |
| **Type** | Server Component with `force-dynamic` + `noStore()` |
| **Auto-refresh** | ❌ **Static** — requires manual page reload |
| **Data source** | `getAiQualityMetricsAction()` — real DB query |

**Metrics displayed (via `QualityDashboardClient`):**

| Metric | Source |
|--------|--------|
| AI acceptance rate | Quality metrics table |
| Confidence distribution | Confidence buckets |
| Pattern health | Pattern evaluation |
| Pipeline runs | Pipeline execution log |
| Risk overview | Risk scoring |

---

### 1.4 LocalContentOS Analytics

| Field | Value |
|-------|-------|
| **Route** | `/local-content/analytics` (authenticated) |
| **File** | `src/app/local-content/analytics/page.tsx` |
| **Type** | Server Component with `force-dynamic` |
| **Auto-refresh** | ❌ **Static** — requires manual page reload |
| **Data source** | `getLocalContentSpendAnalyticsAction()` — real DB query |

**Metrics displayed (via `SpendAnalyticsView`):**

| Metric | Source |
|--------|--------|
| Spend analytics | Spend records |
| Local content ratio trends | Computed from spend/classification |
| LC-06/LC-07 compliance | Classification rules engine |

---

### 1.5 LocalContentOS Health Page

| Field | Value |
|-------|-------|
| **Route** | `/local-content/health` (authenticated) |
| **File** | `src/app/local-content/health/page.tsx` |
| **Type** | Server Component |

---

### 1.6 AWS CloudWatch Dashboard (Terraform)

| Field | Value |
|-------|-------|
| **Resource** | `aws_cloudwatch_dashboard.main` |
| **File** | `infra/terraform/modules/monitoring/main.tf` |
| **Dashboard Name** | `${project_name}-${environment}-dashboard` |

**Widgets:**

| Widget | Metrics | Period |
|--------|---------|--------|
| ECS CPU / Memory | `CPUUtilization`, `MemoryUtilization` | 300s |
| RDS Metrics | `CPUUtilization`, `DatabaseConnections`, `FreeStorageSpace` | 300s |
| ALB Metrics | `TargetResponseTime`, `RequestCount`, `HTTPCode_Target_5XX` | 300s |
| Redis Metrics | `CPUUtilization`, `CurrConnections`, `FreeableMemory` | 300s |
| Error Rate (%) | Computed: `5XX / RequestCount` | 300s |

> **Gap:** The CloudWatch dashboard does not include a `DatabaseMemoryUsagePercentage` widget for Redis. The alarm monitors it, but the dashboard widget is missing. A Redis Memory Usage % widget should be added.

---

## 2. Health Check Endpoints

| Endpoint | Method | Auth | What it checks |
|----------|--------|------|----------------|
| `GET /api/health` | GET | ❌ None | Database connectivity, AUTH_SECRET presence, build info, uptime |
| `GET /api/integration/health` | GET | Auth required | Circuit breaker states, integration health, aggregated status |
| `GET /api/metrics` | GET | Auth required | System metrics, queue metrics, alert history |

---

## 3. System Monitor Thresholds

**File:** `src/lib/platform/monitoring/system-monitor.ts`

### Resource Threshold Alerts

| Resource | Warning | Critical | Cooldown |
|----------|---------|----------|----------|
| Heap memory usage % | 70% | 85% | 5 min |
| RSS memory (MB) | 512 MB | 1024 MB | 5 min |
| CPU load average (ratio to core count) | 0.8 (80%) | 1.5 (150%) | 5 min |

### Health Check Components

| Component | Check | Statuses |
|-----------|-------|----------|
| `server` | Uptime calculation | ok |
| `env` | Required env vars (`DATABASE_URL`, `AUTH_SECRET`) | ok / warn |
| `database` | `SELECT 1` via Prisma with latency measurement | ok / error |
| `redis` | `PING` via Redis client with latency measurement | ok / warn / error |
| `queue` | BullMQ queue counts (waiting, active, completed, failed, delayed) | ok / warn / error |
| `storage` | Storage provider detection | ok |
| `ai` | AI provider key validation | ok / warn |
| `filesystem` | Basic check | ok |

### Alert System

| Feature | Detail |
|---------|--------|
| Alert history | In-memory array, max 1000 entries |
| Cooldown | 5 minutes between resource threshold alerts |
| Audit trail | All alerts logged via `writePlatformAuditLog()` |
| Acknowledgment | Alerts can be acknowledged via `acknowledgeAlert()` |
| Overall status | Computed: `unhealthy` if any error, `degraded` if any warn, else `healthy` |

---

## 4. Terraform Alert Thresholds

**File:** `infra/terraform/modules/monitoring/main.tf`

| Alarm | Metric | Threshold | Period | Eval Periods | SNS |
|-------|--------|-----------|--------|--------------|-----|
| `ecs_cpu_high` | CPUUtilization | > 85% | 300s | 3 (15 min) | ✅ |
| `ecs_memory_high` | MemoryUtilization | > 85% | 300s | 3 (15 min) | ✅ |
| `rds_cpu_high` | CPUUtilization | > 80% | 300s | 3 (15 min) | ✅ |
| `rds_free_storage` | FreeStorageSpace | < 10 GB | 300s | 1 (5 min) | ✅ |
| `rds_connections_high` | DatabaseConnections | > 80 | 300s | 2 (10 min) | ✅ |
| `alb_5xx_high` | HTTPCode_Target_5XX | > 10 | 300s | 2 (10 min) | ✅ |
| `alb_high_latency` | TargetResponseTime (p95) | > 3s | 300s | 2 (10 min) | ✅ |
| **`redis_memory_high`** | DatabaseMemoryUsagePercentage | **> 80%** | **300s** | **3 (15 min)** | ✅ |

### SNS Configuration

| Resource | Detail |
|----------|--------|
| Topic | `${project_name}-${environment}-alarms` |
| Email subscription | Production only → `ops@{domain_name}` |
| Alarm actions | All alarms route to the SNS topic |

---

## 5. Access Instructions

| Dashboard | URL | Auth Required |
|-----------|-----|---------------|
| Platform Monitoring | `/monitoring` | Yes |
| Audit Portfolio | `/audit/portfolio` | Yes |
| LCOS Quality Dashboard | `/local-content/quality-dashboard` | Yes |
| LCOS Analytics | `/local-content/analytics` | Yes |
| LCOS Health | `/local-content/health` | Yes |
| Health Check (liveness) | `/api/health` | No |
| Integration Health | `/api/integration/health` | Yes |
| System Metrics | `/api/metrics` | Yes |
| AWS CloudWatch | AWS Console → CloudWatch → Dashboards | AWS IAM |

---

## 6. Known Gaps & Recommendations

### 6.1 Auto-Refresh Gap (Priority: HIGH)

**Status:** ⚠️ Gap identified

The monitoring page (`/monitoring`) is largely static:
- **6 panels render as server components** — they fetch data once on page load and never refresh
- Only `LiveHealthCards` polls every 30 seconds (client component)

**Impact:** Operators monitoring the dashboard must manually reload the page to see updated metrics.

**Recommendation:**
- Option A: Convert all server panels to client components with polling (increases API load)
- Option B: Add a page-level auto-refresh using `<Suspense>` + `key={timestamp}` pattern
- Option C: Add a WebSocket/SSE channel for real-time updates (higher complexity)
- **Recommended:** Option B — a periodic full-page re-render via client-side `router.refresh()` every 60 seconds, with a user toggle to pause/resume

### 6.2 Redis Memory Usage % Widget Missing from Dashboard (Priority: LOW)

**Status:** ⚠️ Gap identified

The CloudWatch Redis alarm monitors `DatabaseMemoryUsagePercentage` but the CloudWatch dashboard widget only shows `CPUUtilization`, `CurrConnections`, and `FreeableMemory`. The `DatabaseMemoryUsagePercentage` metric should be added as a dedicated widget.

**Recommendation:** Add a Redis Memory Usage % widget to the CloudWatch dashboard in `main.tf`.

### 6.3 No `/audit/dashboard` Route (Priority: INFO)

**Status:** ℹ️ Informational

There is no `/audit/dashboard` route. The audit portfolio page at `/audit/portfolio` serves as the closest equivalent with real data from `getOrganizationPortfolioAnalytics()`.

### 6.4 Audit Portfolio / LCOS Pages Lack Auto-Refresh (Priority: MEDIUM)

**Status:** ⚠️ Gap identified

Both `/audit/portfolio` and `/local-content/quality-dashboard` are static server components with `force-dynamic`. They require manual page reload.

**Recommendation:** Apply the same auto-refresh pattern recommended for the monitoring page.

### 6.5 Redis Dimensions Require Configuration (Priority: MEDIUM)

**Status:** ⚠️ Configuration required

The new `redis_memory_high` alarm uses a conditional dimension block:
- If `var.redis_replication_group_id` is set, it includes `ReplicationGroupId`
- If empty, it uses only `CacheClusterId` (defaults to `${project_name}-${environment}-redis`)

The calling module must pass `redis_replication_group_id` if the ElastiCache instance is a replication group (not a standalone cluster). Without this, the alarm may not match the correct Redis instance.

**Recommendation:** Verify the Redis infrastructure type and pass `redis_replication_group_id` in the module invocation if applicable.

### 6.6 No PagerDuty/OpsGenie Integration (Priority: LOW)

**Status:** ℹ️ Gap identified

All alarms route to SNS email only. For production on-call rotation, consider adding PagerDuty or OpsGenie as additional SNS targets.

### 6.7 No Redis Connection Count Alarm (Priority: LOW)

**Status:** ℹ️ Gap identified

There is no alarm for Redis connection exhaustion (`CurrConnections`). Consider adding one if Redis connection limits are a concern.

---

## 7. Files Reference

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/monitoring/page.tsx` | Platform monitoring page |
| `src/app/audit/portfolio/page.tsx` | Audit portfolio dashboard |
| `src/app/local-content/quality-dashboard/page.tsx` | LCOS AI quality dashboard |
| `src/app/local-content/analytics/page.tsx` | LCOS spend analytics |
| `src/app/local-content/health/page.tsx` | LCOS health page |
| `src/app/api/health/route.ts` | Liveness health endpoint |
| `src/components/monitoring/ai-observability-cards.tsx` | AI observability panel |
| `src/components/monitoring/enterprise-health-panel.tsx` | Enterprise health (Tier 3) |
| `src/components/monitoring/evidence-health-panel.tsx` | Evidence health panel |
| `src/components/monitoring/tb-firm-memory-kpis-panel.tsx` | Trial balance firm memory KPIs |
| `src/components/monitoring/live-health-cards.tsx` | Live integration health (client, 30s poll) |
| `src/components/monitoring/live-health-cards-wrapper.tsx` | Dynamic import wrapper |
| `src/components/monitoring/enterprise-health-operator-actions.tsx` | Operator actions |
| `src/lib/platform/monitoring/system-monitor.ts` | System monitor, thresholds, alerts |
| `src/lib/platform/monitoring/__tests__/` | Monitoring tests |
| `infra/terraform/modules/monitoring/main.tf` | AWS CloudWatch dashboards + alarms |
