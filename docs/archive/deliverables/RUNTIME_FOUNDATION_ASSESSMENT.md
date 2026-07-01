# Phase 8 — Runtime Foundation Assessment

**Date:** 2026-06-20  
**Scope:** Job queue, worker runtime, async processing, scheduled tasks, exports, AI jobs  
**Data Sources:** `src/lib/platform/operations/queue-runtime.ts`, `src/lib/platform/operations/unified-output-queue.ts`, `src/lib/platform/export.ts`, `src/lib/ai/orchestrator.ts`, `src/lib/audit/export/`

---

## Executive Summary

AQLIYA's runtime layer is **feature-flagged off by default** and largely stub-based. The Bull queue exists but is disabled (`queue.enabled` = false). Task persistence is off. The output queue returns fake IDs. Scheduled tasks rely on external cron (Terraform backup schedule) rather than platform-level scheduling.

**Runtime Foundation Score: 4.0/10** — infrastructure exists but not enabled, stubs dominate

---

## 1. Current State Inventory

### 1.1 Job Queue

| Component | File | Status |
|-----------|------|--------|
| Bull queue | `queue-runtime.ts` | Implemented but feature-flagged OFF |
| Job registration | `registerHandler()` | Implemented |
| Job enqueue | `enqueueTask()` | Returns fake ID when disabled |
| Worker startup | `startWorkers()` | Implemented |
| Job status | `getJobStatus()` | Implemented |

**Key limitations:**
- No persistent job definitions (handlers registered in-memory)
- No job priorities
- No scheduled/recurring jobs
- Default 3 retries — not configurable per job type
- No dead letter queue
- Redis dependency prevents use without Redis

### 1.2 Async Processing

| Capability | Status | Notes |
|-----------|--------|-------|
| Export generation | Synchronous | Exports block the request. No background processing. |
| AI inference | Synchronous | AI calls block the request (timeout at 30s) |
| Report generation | Synchronous | PDF/XLSX generation blocks the request |
| File processing | Synchronous | Uploads processed inline |
| Long-running tasks | Not handled | Anything exceeding 30s will timeout |

**Impact:** All async-capable operations (exports, AI, reports) are synchronous. Any operation that takes >30s will timeout. No background processing path exists.

### 1.3 Scheduled Tasks

| Task | Mechanism | Status |
|------|-----------|--------|
| Database backup | Terraform AWS Backup | Operational |
| Backup verification | GitHub Action (backup.yml) | Scheduled daily |
| Pilot health monitoring | `scripts/platform/pilot-daily-monitor.ts` | Manual script |
| Staging probe | `scripts/platform/staging-probe.mjs` | Manual |
| Cache invalidation | None | Not implemented |
| Data retention | Manual | `scripts/ops/` |
| Report generation | None | Not implemented |

**No platform-level scheduler.** All scheduled tasks use external mechanisms (Terraform, CI/CD, manual).

### 1.4 Export System

| Component | Status | Notes |
|-----------|--------|-------|
| `src/lib/platform/export.ts` | Implemented | Export format utilities + download response builder |
| `src/lib/platform/production-export.ts` | Implemented | Export metadata builder |
| `src/lib/audit/export/` | Implemented | PDF + XLSX exporters for AuditOS |
| `unified-output-queue.ts` | **Stub** | Returns fake ID |

**Exports are fully synchronous** — the output queue that should handle async export generation is a stub.

### 1.5 AI Jobs

| Capability | Status | Notes |
|-----------|--------|-------|
| AI generation | Synchronous | `orchestrator.generate()` blocks |
| AI streaming | Streaming | `orchestrator.generateStream()` returns ReadableStream |
| AI batch processing | Not implemented | No batch AI job support |
| AI model evaluation | Synchronous | eval-runner blocks |
| RAG embedding | Synchronous | Embedding service blocks |

**No async AI job framework.** Long AI tasks (batch analysis, document processing) have no background path.

---

## 2. Required Runtime Capabilities

### Priority Matrix

| Capability | Current | Required | Urgency | Effort |
|------------|---------|----------|---------|--------|
| Async export generation | Sync/stub | Async | HIGH | 5 days |
| Background AI processing | Sync only | Async | HIGH | 5 days |
| Scheduled report generation | None | Cron-like | MEDIUM | 3 days |
| Cache warming / invalidation | None | Scheduled | LOW | 2 days |
| Data retention enforcement | Manual | Scheduled | MEDIUM | 3 days |
| Email dispatch | Sync | Async | MEDIUM | 2 days |
| Webhook delivery | Sync with retry | Async | LOW | 2 days |
| Long-running migrations | None | Queue | LOW | 3 days |

---

## 3. Target Architecture

### 3.1 Queue Infrastructure

```
Enqueue API (platform-level)
    │
    ▼
┌──────────────────────────────────────────────┐
│            Bull Queue (Redis)                │
│                                              │
│  exports       ai-jobs      notifications    │
│  reports       embeddings   retention        │
│                                              │
│  Features: retry, priority, TTL, delay       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
                  Worker Processes
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
        Export     AI Job     Notifications
        Worker     Worker     Worker
```

### 3.2 Worker Design

```typescript
// Worker interface
interface PlatformWorker {
  readonly type: string;
  readonly concurrency: number;
  readonly retryPolicy: RetryPolicy;
  
  process(job: PlatformJob): Promise<JobResult>;
}

// Worker types needed
registerWorker('export-pdf', ExportPdfWorker);       // Concurrency: 2
registerWorker('export-xlsx', ExportXlsxWorker);      // Concurrency: 2
registerWorker('ai-execution', AiExecutionWorker);    // Concurrency: 1
registerWorker('ai-embedding', AiEmbeddingWorker);    // Concurrency: 1
registerWorker('notification-email', EmailWorker);    // Concurrency: 3
registerWorker('notification-webhook', WebhookWorker); // Concurrency: 3
registerWorker('report-generation', ReportWorker);    // Concurrency: 1
registerWorker('retention-enforcement', RetentionWorker); // Concurrency: 1 (scheduled)
```

### 3.3 Scheduled Tasks

```typescript
// Cron-like scheduler (can use Bull repeatable jobs or node-cron)
registerSchedule({
  name: 'daily-backup-verify',
  cron: '0 6 * * *',
  worker: 'backup-verify',
  timeout: '10m'
});

registerSchedule({
  name: 'weekly-retention-enforce',
  cron: '0 2 * * 0',
  worker: 'retention-enforcement',
  timeout: '30m'
});

registerSchedule({
  name: 'hourly-pilot-health-check',
  cron: '0 * * * *',
  worker: 'pilot-health',
  timeout: '5m'
});

registerSchedule({
  name: 'daily-report-generation',
  cron: '0 7 * * *',
  worker: 'report-generation',
  timeout: '15m'
});
```

---

## 4. Migration Plan

### Phase 1 — Enable Queue (Week 1, ~5 days)

| Step | Action | Effort |
|------|--------|--------|
| 1.1 | Enable Bull queue by default (remove feature flag) | 0.5 days |
| 1.2 | Create worker registration infrastructure | 1 day |
| 1.3 | Register export worker (PDF/XLSX) | 1 day |
| 1.4 | Migrate export generation to async | 2 days |
| 1.5 | Update frontend to poll for export completion | 1 day |

### Phase 2 — AI Jobs (Week 2, ~5 days)

| Step | Action | Effort |
|------|--------|--------|
| 2.1 | Register AI execution worker | 1 day |
| 2.2 | Create batch AI job API | 2 days |
| 2.3 | Migrate long-running AI tasks to queue | 2 days |
| 2.4 | Add streaming status for queue jobs | 1 day |

### Phase 3 — Scheduler (Week 3, ~3 days)

| Step | Action | Effort |
|------|--------|--------|
| 3.1 | Add Bull repeatable job scheduler | 1 day |
| 3.2 | Migrate backup verification to platform schedule | 1 day |
| 3.3 | Implement data retention enforcement worker | 2 days |

### Phase 4 — Production Hardening (Week 4, ~5 days)

| Step | Action | Effort |
|------|--------|--------|
| 4.1 | Add dead letter queue | 1 day |
| 4.2 | Add job monitoring/metrics | 1 day |
| 4.3 | Add admin dashboard for queue management | 2 days |
| 4.4 | Add job timeout and cancellation | 1 day |

**Total Estimated Effort:** **18 days**

---

## 5. Operational Requirements

| Requirement | Phase 1 | Phase 2 | Phase 3 |
|-------------|---------|---------|---------|
| Redis | Required | Required | Required |
| Worker process | Same container | Dedicated worker | Dedicated worker |
| Monitoring | CloudWatch | Bull dashboard | Bull + CloudWatch |
| Graceful shutdown | Not handled | Implemented | Tested |
| Job persistence | Bull/Redis | DB-backed | DB + S3 for artifacts |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Async exports change user experience | Users expect instant downloads | Show "generating" status with notification on completion |
| Queue failure loses jobs | Data loss | DB-backed job definitions; Redis persistence config |
| Worker scaling requires operational maturity | Ops overhead | Start with in-process workers (same container), scale to separate workers later |
| Redis dependency for runtime | Single point of failure | Bull supports Redis Sentinel/cluster; add fallback to in-memory |

---

## 7. Scoring

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Async export | No | Yes | ✓ |
| Background AI processing | No | Yes | ✓ |
| Scheduled tasks | External cron | Platform scheduler | ✓ |
| Job monitoring | None | Dashboard + metrics | ✓ |
| Dead letter handling | None | Queue retry | ✓ |
| Worker infrastructure | Stub | Production | ✓ |
| Queue enabled by default | No | Yes | ✓ |
| **Composite** | **4.0/10** | **9.0/10** | **5.0** |
