# AQLIYA AWS Foundation Blueprint

**Status:** Decision-grade blueprint  
**Version:** 1.0  
**Date:** 2026-07-04  
**Author:** Principal Cloud Architect (repository-grounded analysis)  
**Target Audience:** Founder / Architect / Infrastructure Lead  
**Confidence:** HIGH — all assertions grounded in inspected code, config, and workflows

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Vercel vs AWS Boundary](#2-vercel-vs-aws-boundary)
3. [Deployment Model](#3-deployment-model)
4. [Network Topology](#4-network-topology)
5. [Database Strategy](#5-database-strategy)
6. [AI Infrastructure](#6-ai-infrastructure)
7. [Storage and File Handling](#7-storage-and-file-handling)
8. [Auth and Identity](#8-auth-and-identity)
9. [Observability](#9-observability)
10. [Disaster Recovery and Business Continuity](#10-disaster-recovery-and-business-continuity)
11. [Security Posture](#11-security-posture)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Cost Projection](#13-cost-projection)
14. [Decision Registry (Open Issues)](#14-decision-registry-open-issues)
15. [Implementation Roadmap](#15-implementation-roadmap)
16. [Appendices](#16-appendices)

---

## 1. Architecture Overview

### 1.1 Physical Architecture Diagram

```
                         Internet
                            │
                      [CloudFront CDN]
                     (WAFv2 — rate limiting
                      + AWS Managed Rules)
                            │
                      ┌─────┴─────┐
                      │  Route53   │
                      │ aqliya.com │
                      └─────┬─────┘
                            │
                   [ALB — HTTPS, me-south-1]
                   (term TLS, multi-AZ)
                            │
              ┌─────────────┼─────────────┐
              │             │             │
     [ECS Fargate Task] [ECS Fargate] [ECS Fargate]
      (az-1a)     (az-1b)     (az-1c)
              │             │             │
              └──────┬──────┴──────┬──────┘
                     │             │
            [RDS PostgreSQL]   [ElastiCache Redis]
            (Multi-AZ,        (Clustered, 2 nodes)
             pgvector,
             read replica)
                     │
                     ▼
              [S3 — Uploads Bucket]
              (versioned, SSE-S3,
               lifecycle to IA/Glacier)
                     │
                     ▼
     [CloudFront OAI → S3 Static Bucket]
     (static assets: _next/static, images, fonts)

Cross-Region DR:
  me-south-1 (primary) ── snapshot copy ──→ eu-central-1 (DR)
```

### 1.2 Current State Assessment

| Dimension | Current State | Assessment |
|-----------|---------------|------------|
| Hosting | ECS Fargate (Terraform IaC) | ✅ Properly architected |
| Region | me-south-1 (Bahrain/Riyadh) | ✅ Correct for KSA/GCC |
| Container | Dockerized Next.js standalone | ✅ Production-viable |
| Database | RDS PG16 + pgvector | ✅ Correct stack |
| Cache | ElastiCache Redis | ✅ Configured |
| Storage | S3 (versioned, encrypted) | ✅ Proper setup |
| CDN | CloudFront + WAFv2 | ✅ Configured |
| AI | Hybrid: cloud API + local Ollama | ✅ Flexible architecture |
| DR | Cross-region snapshot to eu-central-1 | ⚠️ DR region needs review |
| Monitoring | CloudWatch + Sentry + Plausible | ✅ Multi-layered |
| CI/CD | GitHub Actions → ECR → ECS | ✅ Proper pipeline |
| Vercel | PR previews only | ✅ Correct boundary |

### 1.3 Guiding Principles

1. **Everything-in-AWS unless proven otherwise** — No hybrid-cloud complexity without a concrete requirement.
2. **PostgreSQL (via RDS) is the data plane** — All structured data, vectors, events, and audit logs go through RDS. No separate document/event databases.
3. **S3 is the file and evidence plane** — Uploads, generated reports, static assets, backups. No local file system persistence.
4. **Redis is the ephemeral state layer** — Rate limiting, session cache, job queue back-pressure. No persistent data in Redis.
5. **AI is hybrid by design** — Sensitive data routes to local (Ollama), non-sensitive to cloud (OpenAI/Anthropic). Architecture supports Bedrock as a future option.
6. **No Vercel in production** — Vercel is developer preview infrastructure only. Production traffic goes through CloudFront → ALB → ECS.

---

## 2. Vercel vs AWS Boundary

### 2.1 Current State

The repository has both the AWS deployment pipeline and a `vercel.json`. After thorough inspection, the boundaries are clean:

| Scope | Platform | Purpose |
|-------|----------|---------|
| Production | AWS (ECS Fargate) | 🏆 Primary deployment target |
| Staging | AWS (ECS Fargate) | Staging environment in AWS |
| Dev | AWS (ECS Fargate) | Dev environment in AWS |
| PR Previews | Vercel | ✅ Ephemeral per-PR preview deploys |
| Preview build | Vercel | `vercel.json` build/install commands |

### 2.2 Evidence

- **`infra/terraform/`** — Full production-grade IaC with VPC, RDS, ECS, Redis, S3, CloudFront, WAFv2, monitoring. This is not a toy setup.
- **`.github/workflows/deploy.yml`** — Builds Docker image, pushes to ECR, updates ECS task definition. Targets production, not Vercel.
- **`.github/workflows/preview.yml`** — Uses Vercel for PR previews. This is the correct use case.
- **`docker-compose.yml`** — Production stack with ClamAV, Redis, pgvector, app container. Ready for local production-equivalent testing.
- **`next.config.mjs`** — `output: "standalone"` (Node.js server), not `export` (static). No ISR usage. No Vercel-specific SDK calls.
- **No `@vercel/`, `@next/third-parties`, or Vercel Edge Functions** found in imports.

### 2.3 Recommendation

**Lock in: AWS for all production/staging/dev workloads. Vercel only for PR previews.**

The existing architecture is correct. No action needed to "migrate from Vercel" — the codebase was already architected for AWS-native deployment. The only Vercel-related code is the preview pipeline, which is appropriate.

If you want to simplify, you could replace Vercel previews with an ephemeral AWS environment per PR (e.g., using Terraform workspaces or Pulumi stacks). However, this is not a priority — Vercel previews work well for frontend review and cost nothing for low traffic.

### 2.4 Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `vercel.json` diverges from AWS build config | Low | Preview branch only; AWS build defined in Dockerfile |
| Future dev accidentally adds Vercel-specific code | Low | Add `@vercel/*`, `edge:true` to lint rules |
| Preview env doesn't test DB/Redis integration | Medium | Acceptable for pure frontend review; full integration tests run in CI |

---

## 3. Deployment Model

### 3.1 Container Architecture

```
┌─────────────────────────────────────────────┐
│           aqliya-app Docker Image            │
│  ┌─────────────────────────────────────────┐ │
│  │  Node.js 22 (Alpine Linux)              │ │
│  │  Next.js standalone output              │ │
│  │  Built from: Dockerfile                 │ │
│  │  User: nextjs (non-root)                │ │
│  │  Port: 3000                             │ │
│  └─────────────────────────────────────────┘ │
│  Volumes: /app/uploads (for local storage)   │
└─────────────────────────────────────────────┘
```

### 3.2 Environment Matrix

| Environment | Terraform Env | ECS Tasks | CPU/Mem | Multi-AZ | DR | Backup |
|-------------|---------------|-----------|---------|----------|----|--------|
| **dev** | `environments/dev/` | 1 | 512/1024 | No | No | 3 days |
| **staging** | `environments/staging/` | 2 | 512/1024 | No | No | 7 days |
| **production** | `environments/production/` | 3-10 (auto-scale) | 1024/2048 | Yes | eu-central-1 | 30 days |

### 3.3 Auto-Scaling Configuration

- **Metric:** CPU ≥ 70% OR Memory ≥ 75%
- **Scale-out:** +1 task every 60s
- **Scale-in:** -1 task every 300s
- **Min/Max:** 3 / 10 (production)
- **Cooldown:** 120s

### 3.4 Health Check

- **Endpoint:** `/api/health` → returns 200 when ready
- **Readiness checks:** Database connectivity, pgvector availability, Redis (if configured), S3 writability, AI provider config, auth secret presence
- **Startup grace period:** 60s
- **Interval:** 30s
- **Unhealthy threshold:** 3

### 3.5 Findings and Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No ECS exec enabled for debugging | Add `enable_execute_command = true` for staging/dev | Low |
| No HPA based on request count | Consider adding ALB RequestCountPerTarget for smoother scaling | Medium |
| No spot/Fargate Spot usage | Dev/staging could use Fargate Spot for ~70% cost reduction | Low |
| No canary deploy strategy | Consider CodeDeploy blue/green for production; currently uses ECS rolling update | Medium |
| No warm pools or keep-alive | Acceptable for Fargate; cold starts are ~3-5s | Low |

---

## 4. Network Topology

### 4.1 VPC Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| CIDR | 10.0.0.0/16 | Standard /16 for production |
| Availability Zones | me-south-1a, me-south-1b, me-south-1c | 3 AZs for HA (me-south-1 has 3) |
| Private subnets | 3 (one per AZ) | ECS tasks, RDS, Redis |
| Public subnets | 3 (one per AZ) | ALB, NAT Gateway |
| Database subnets | 3 (one per AZ) | RDS subnet group |
| NAT Gateways | 1 per AZ (production) | ~$90/month for 3 (largest unoptimized cost) |

### 4.2 Security Group Rules

| SG | Ingress | Egress | Purpose |
|----|---------|--------|---------|
| `alb-sg` | 443 (HTTPS from 0.0.0.0/0), 80 (HTTP → redirect) | All | Load balancer |
| `ecs-sg` | ALB only (port 3000) | All | Application tasks |
| `rds-sg` | ECS tasks only (port 5432) | N/A | Database |
| `redis-sg` | ECS tasks only (port 6379) | N/A | Cache |

### 4.3 Findings and Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| NAT Gateway cost ($90/mo for 3) | Consolidate to 1 NAT Gateway + 1 AZ for non-production; evaluate NAT Gateway alternatives for dev/staging | **Critical** — largest infra waste |
| No VPC Flow Logs | Enable VPC Flow Logs to CloudWatch for network forensics | Medium |
| No VPC Endpoints | Add S3 Gateway Endpoint to keep S3 traffic within AWS network (saves NAT bandwidth) | High |
| No VPC Endpoint for ECR/Docker | Add ECR Gateway Endpoints (api, dkr) to reduce NAT traffic and improve deploy speed | High |
| No VPC Endpoint for CloudWatch | Add CloudWatch Logs endpoint | Medium |
| No network segmentation for CI/CD | Not needed yet; CI runs in GitHub Actions, not VPC | Low |

---

## 5. Database Strategy

### 5.1 Current Configuration

| Parameter | Value |
|-----------|-------|
| Engine | PostgreSQL 16 (RDS) |
| Instance class | db.r6g.large (2 vCPU, 16 GB RAM) — production |
| Storage | 100 GB gp3, max 500 GB (auto-scale) |
| Encryption | Enabled (AWS KMS) |
| Multi-AZ | Yes (production) |
| Read replica | Yes (1, production only) |
| Parameter group | Custom: log_statement=ddl, pg_stat_statements loaded |
| Backup | 30 days retention, automated 03:00-04:00 UTC |
| Maintenance | Sunday 05:00-06:00 UTC |
| Deletion protection | Yes (production) |
| Credentials | AWS Secrets Manager (not in Terraform state) |

### 5.2 pgvector Compatibility

- ✅ **Required by schema.** `DocumentChunk` model has an `embedding` column (`vector(1536)`) for vector similarity search.
- ✅ **RDS PostgreSQL 16 supports pgvector** as an extension (confirmed in `isPgvectorAvailable()` health check).
- ⚠️ **Aurora PostgreSQL also supports pgvector** but at higher cost. RDS PG16 is the right choice.
- ⚠️ **Serverless v2** could be an option for dev/staging to reduce idle cost.

### 5.3 Query Patterns (from codebase)

| Pattern | Location | Frequency |
|---------|----------|-----------|
| Basic CRUD | Every action, route | Always |
| Vector search | DocumentChunk queries | On AI similarity requests |
| Audit event writes | All mutations | Every write |
| Tenant-scoped queries | All business models (organizationId) | Always |
| Full-text search | Audit engagement queries | Medium |
| JSON operations | Metadata/config fields | Frequent |
| Read replica reads | Analytics, reporting, heavy queries | When query-only |

### 5.4 Connection Pooling

- **Pool config:** Set `connection_limit=20` (max connections) and `pool_timeout=10` (seconds to wait) in the connection string
- **Current:** Prisma manages its own pool via `DATABASE_URL` with pool parameters
- **Pool size:** Default Prisma (varies by env)
- **Recommendation:** Add **PgBouncer** (RDS Proxy or sidecar) for production:
  - Benefits: Connection multiplexing, graceful failover, reduced connection overhead
  - Cost: RDS Proxy ~$15/month per AZ
  - Alternative: Built-in Prisma pool management is acceptable for < 50 concurrent connections

### 5.5 Migration Strategy

- **Tool:** Prisma Migrate (`npx prisma migrate dev`)
- **Safety:** `CREATE` only per schema drift policy; no automatic destructive migrations
- **CI/CD:** `prisma migrate deploy` runs in deploy workflow
- **Rollback:** Manual via creating a new migration that reverses the change (no automatic rollback in Prisma)

### 5.6 DR for Database

| Scenario | Mechanism | RTO | RPO |
|----------|-----------|-----|-----|
| AZ failure | RDS Multi-AZ auto-failover | < 2 min | < 1 min |
| Region failure | Promote cross-region snapshot in eu-central-1 | < 60 min | ~24h (snapshot-based) |
| Data corruption | PITR to any point within backup retention (30 days) | < 60 min | < 5 min |
| Schema migration failure | Manual rollback migration | Varies | N/A |

### 5.7 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| DR RPO is ~24h (daily snapshot) | Implement cross-region streaming replication (logical replication or DMS CDC) to reduce RPO to seconds | **High** — especially for KSA data residency |
| No read replica query routing | Update Prisma DATABASE_URL to use reader endpoint for read-only queries; implement read/write splitting at the service layer | Medium |
| No query performance monitoring | Enable Performance Insights (free for 7 days, paid for longer retention) | Medium |
| Single instance class across all envs | Use db.t4g.small/medium for dev/staging to reduce cost | High |
| DB password from Secrets Manager per env | ✅ Already done. Verify secret rotation policy is enabled | Verify |

---

## 6. AI Infrastructure

### 6.1 Architecture

```
┌─────────── User Request (task type, org config) ──────────┐
│                                                           │
▼                                                           │
hybrid-router.ts                                             │
│                                                           │
├── Determine execution mode:                               │
│   ├── orgConfig.aiExecutionMode (local/cloud/hybrid)      │
│   ├── AI_MODE env var (global default)                    │
│   └── task type routing (task → provider map)             │
│                                                           │
├── If local → local-provider.ts (Ollama)                   │
│                                                           │
├── If cloud → provider-router.ts                           │
│   ├── Circuit breaker (health cache, error tracking)      │
│   ├── Health check (connectivity, API key valid)          │
│   ├── Fallback chain (primary → secondary → tertiary)     │
│   └── Provider selection (per org integration)            │
│       ├── openai-provider.ts                              │
│       ├── anthropic-provider.ts                           │
│       ├── deterministic-provider.ts (rule-based)          │
│       └── cloud-provider.ts (generic)                     │
│                                                           │
├── SecretResolver credential resolution:                   │
│   ├── Per-org integration config (vault)                  │
│   └── Process.env fallback                                │
│                                                           │
└── Response → audit log → evidence (if applicable)         │
```

### 6.2 Provider Matrix

| Provider | Config Key | Use Case | Status |
|----------|-----------|----------|--------|
| OpenAI | `OPENAI_API_KEY` | Non-sensitive AI tasks (report writing, disclosure) | ✅ Active |
| Anthropic | `ANTHROPIC_API_KEY` | Non-sensitive AI tasks (audit findings, analysis) | ✅ Active |
| Ollama | `OLLAMA_BASE_URL` | Sensitive/local tasks (account mapping, TB classification) | ✅ Active |
| Deterministic | None (rule-based) | Structured extraction, formatting | ✅ Active |
| Mock | `MOCK_MODE=true` | Testing | ✅ Active |
| Bedrock | Not implemented | Strategic — see recommendation | ❌ Not built |

### 6.3 Task Routing Table (from `hybrid-router.ts`)

```
AI_MODE=hybrid:
  local:  ["account_mapping", "tb_classification", "trial_balance_upload", "analytical_review"]
  cloud:  ["notes_generation", "disclosure_enrichment", "report_writing", "audit_findings"]

AI_MODE=local:
  all:    local (Ollama)

AI_MODE=cloud:
  all:    cloud provider (OpenAI/Anthropic per provider-router)
```

### 6.4 Cost Governance

- **Budget manager:** `src/lib/core/ai/budget-manager.ts` — tracks cost per org/period
- **Circuit breaker:** Auto-disable AI provider after `n` consecutive failures
- **Health cache:** Provider health status cached with TTL to avoid repeated checks
- **Feature flag:** `FF_AI_REAL_PROVIDERS` gates real API calls (vs mock/deterministic)

### 6.5 Recommendations

| Issue | Recommendation | Priority | Effort |
|-------|----------------|----------|--------|
| No AWS Bedrock integration | **Add Bedrock provider as a first-class option.** Benefits: no API keys to manage, VPC-private inference via VPC Endpoints, KMS encryption, no data leaves AWS network, supports Claude models. Recommended for all cloud AI tasks. | **High** | 3-5 days dev, 0 infra change |
| Ollama on ECS Fargate is impractical | Ollama requires GPU or high CPU/RAM. Fargate GPU is not available. **Options:** (1) Run Ollama on an EC2 GPU instance (g4dn/g5) in the VPC; (2) Use Bedrock for cloud and accept no local GPU for MVP; (3) SageMaker endpoint for custom models. | **High** | Architecture decision |
| No AI prompt/audit logging | All AI requests should be logged with: input context hash, prompt type, model, output, confidence, review status. The infrastructure exists (audit trails) but must be wired into AI calls. | Medium | 2-3 days |
| No rate limiting per AI provider | Add per-provider, per-org rate limits to circuit breaker | Medium | 1-2 days |
| No model governance registry | Strategic roadmap item; not blocking v0.1 | Low | Future |
| SecretResolver depends on env vars | Should also query AWS Secrets Manager as a backend for per-org AI keys | Medium | 2 days |

### 6.6 Bedrock Recommendation (Decision D-001)

```
Option A: Add Bedrock provider (RECOMMENDED)
  Pro: No API key management, VPC-private, KMS, native Claude, lower ops burden
  Con: Requires Bedrock model access approval per region (me-south-1 may not have all models)
  Cost: Pay-per-token, comparable to direct API

Option B: Stay with direct API + Ollama EC2
  Pro: Full model flexibility, existing architecture
  Con: API key management, data leaves VPC, more ops for Ollama host

Option C: SageMaker + Ollama EC2
  Pro: Full control, any model
  Con: Highest ops burden, overkill for current scale
```

**Decision (recommended):** Add Bedrock as cloud provider primary, keep direct API as fallback, evaluate Ollama on EC2 for local-only workloads.

---

## 7. Storage and File Handling

### 7.1 Architecture

```
User upload
    │
    ▼
Next.js Server Action / API Route
    │
    ├── ClamAV scan (if SCANNER_PROVIDER=clamav)
    │
    ├── S3StorageProvider (primary, S3_BUCKET + S3_ENDPOINT)
    │   │
    │   └── Supports: AWS S3 (production) + MinIO (local/dev)
    │       • ForcePathStyle for MinIO
    │       • Configurable region, endpoint, credentials
    │       • Uses @aws-sdk/client-s3
    │
    └── LocalStorageProvider (dev only, /app/uploads)
        • Docker volume: uploads:/app/uploads
        • Not for production
```

### 7.2 S3 Bucket Layout

| Bucket | Purpose | Access | Versioning | Encryption | Lifecycle |
|--------|---------|--------|------------|------------|-----------|
| `aqliya-production-uploads` | Evidence, file uploads, generated reports | ECS tasks (via IAM role) | ✅ Enabled | ✅ SSE-S3 | Standard → IA (30d) → Glacier (90d) |
| `aqliya-production-static` | Next.js static assets, images, fonts | CloudFront OAI | ✅ Enabled | ✅ SSE-S3 | None (static) |
| `aqliya-terraform-state` | Terraform state | Admins only | ✅ Enabled | ✅ | N/A |
| Backups | pg_dump output | Backup script | ✅ | ✅ | Per backup policy |

### 7.3 File Upload Pipeline

```
Upload → Scan (ClamAV/S3 malware detection) → Store (S3 via SDK) → 
DB record (file ref + metadata + checksum) → Audit event
```

- **Checksum:** SHA-256 computed during upload, stored in DB for integrity verification
- **Scanning:** Optional ClamAV sidecar (docker-compose includes `clamav` service)
- **Access control:** Downloads require auth + tenant check (secured in route handlers)
- **Temp storage:** `/tmp/uploads` during processing, moved to S3 on completion

### 7.4 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| S3 storage uses env-var credentials | ✅ Already uses `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`. For production, switch to IAM role-based access (ECS task role) | **High** |
| No S3 bucket policies restricting access | Add explicit bucket policy denying HTTP, enforcing TLS, restricting to VPC endpoints | High |
| No S3 object lock / WORM | Consider S3 Object Lock for audit evidence immutability (compliance requirement) | Medium |
| No multipart upload for large files | For >100MB evidence files, implement S3 multipart upload with presigned URLs | Medium |
| No CDN invalidation automation | Add CloudFront invalidation after new static release | Low |
| Local storage path is `/app/uploads` | Already configured in Dockerfile as owned by `nextjs` user | ✅ Done |

---

## 8. Auth and Identity

### 8.1 Current Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| Auth framework | NextAuth v5 | ✅ Active |
| Session strategy | JWT (database sessions also available) | ✅ Active |
| MFA | TOTP (speakeasy), email OTP, backup codes | ✅ Active |
| RBAC | Role-based access control with role hierarchy | ✅ Active |
| ABAC | Feature-flagged (FF_ABAC_ENFORCE, FF_ABAC_SHADOW) | ⚠️ Shadow mode |
| Tenant isolation | organizationId on all business models | ✅ Active |
| SSO | SAML (via @node-saml/node-saml) | ✅ Active (SAML impl) |
| SCIM | Config in .env.example | ⚠️ Configured but not deep verified |
| Audit trail | All mutations logged via outbox pattern | ✅ Active |
| Secrets | AWS Secrets Manager | ✅ Terraform integration |

### 8.2 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| AUTH_SECRET / NEXTAUTH_SECRET in env | Already using Secrets Manager pattern; verify rotation | Medium |
| No Cognito / Identity Provider integration | Consider Cognito User Pools as an identity layer option for future B2B scenarios. Not blocking. | Low |
| SAML tested? | Integration exists. Must be validated against a real IdP (Azure AD, Okta) before going live | **High** |
| No SCIM provisioning verified | Verify user provisioning/deprovisioning flows | Medium |
| MFA recovery flow | TOTP backup codes are generated ✅, verify recovery flow | Medium |

---

## 9. Observability

### 9.1 Current Stack

| Layer | Tool | Coverage |
|-------|------|----------|
| Application errors | Sentry | All server actions, API routes, client errors |
| Business analytics | Plausible (self-hosted) | Page views, user behavior |
| Infrastructure metrics | CloudWatch | CPU, memory, RDS, Redis, ALB, S3 |
| Application logs | CloudWatch Logs | ECS container logs (14d retention configured) |
| Health checks | `/api/health` | DB, pgvector, Redis, Storage, AI providers |
| Dashboards | CloudWatch Dashboard | Custom dashboard in `monitoring` module |
| Alarms | CloudWatch Alarms | CPU, memory, DB connections, ALB 5xx |
| Backups | AWS Backup | RDS automated + manual snapshots |
| Uptime monitoring | Health check endpoint + ALB target group | ALB health checks |

### 9.2 Dashboard Structure (from Terraform monitoring module)

```
AQLIYA-{env}-Dashboard
├── ECS:
│   ├── CPU Utilization (p50, p95, p99)
│   ├── Memory Utilization (p50, p95, p99)
│   └── Running Task Count
├── ALB:
│   ├── Request Count
│   ├── Target Response Time (p50, p95, p99)
│   └── 5xx Error Rate
├── RDS:
│   ├── Database Connections
│   ├── CPU Utilization
│   ├── Read/Write IOPS
│   └── Free Storage Space
├── Redis:
│   ├── Cache Hit Rate
│   ├── Memory Usage
│   └── CPU Utilization
└── S3:
    ├── Bucket Size (uploads, static)
    └── Number of Objects
```

### 9.3 Alarm Configuration

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| ECS CPU high | CPUUtilization > 70% | 5 min | Auto-scale + SNS notification |
| ECS Memory high | MemoryUtilization > 75% | 5 min | Auto-scale + SNS notification |
| ALB 5xx spike | HTTPCode_Target_5XX_Count > 10 | 5 min | SNS notification |
| RDS connections | DatabaseConnections > 80% of max | 5 min | SNS notification |
| RDS storage | FreeStorageSpace < 20 GB | 10 min | SNS notification |
| Redis memory | EngineCPUUtilization > 80% | 5 min | SNS notification |

### 9.4 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No structured logging | Add structured JSON logging (pino or winston) to ECS for easier log analysis | Medium |
| No OpenSearch / log analytics | Consider Amazon OpenSearch for advanced log querying at scale. Not urgent for current volume. | Low |
| No APM (Application Performance Monitoring) | Sentry has performance monitoring — enable it. Consider AWS X-Ray for distributed tracing across ECS → RDS → S3. | Medium |
| No synthetics / canaries | Add CloudWatch Synthetics for frontend availability monitoring | Low |
| No cost anomaly detection | Enable AWS Cost Anomaly Detection (free) for budget alerts | Low |
| Plausible self-hosted? | If self-hosted, consider Plausible Cloud (reduced ops). If already cloud, ignore. | Check |

---

## 10. Disaster Recovery and Business Continuity

### 10.1 Current DR Configuration

| Component | Primary | DR Strategy | DR Location |
|-----------|---------|-------------|-------------|
| Application | ECS Fargate (me-south-1) | Re-deploy from ECR to DR region | eu-central-1 |
| Database | RDS Multi-AZ (me-south-1) | Cross-region snapshot copy → promote | eu-central-1 |
| Storage | S3 me-south-1 | CRR (Cross-Region Replication) not configured; snapshots and backups sent to DR | eu-central-1 |
| Cache | ElastiCache (me-south-1) | Not DR'd (rebuilt on failover) | N/A |
| DNS | Route53 (me-south-1) | Health check → failover routing | us-east-1 (Route53 global) |

### 10.2 Current DR Region: eu-central-1 (Frankfurt)

⚠️ **Data residency concern:** For a KSA-headquartered platform, eu-central-1 (Frankfurt) may not meet Saudi data residency requirements (PDPL, NCA, CST). The primary region (me-south-1) is correct, but the DR region should be reconsidered:

| DR Region | Data Residency | Latency from KSA | Service Availability |
|-----------|---------------|-------------------|---------------------|
| eu-central-1 (current) | ✅ GDPR-compliant, ❌ Not KSA | ~80-100ms | All services |
| me-south-1 (same region, different AZs) | ✅ KSA-compliant | ~5ms | All services |
| af-south-1 (Cape Town) | ⚠️ SA, not KSA | ~150ms | Limited services |
| ap-south-1 (Mumbai) | ❌ India only | ~200ms | All services |

**Recommendation:** Evaluate using `me-south-1` for both primary and DR (AZ-level redundancy is already robust). If cross-region DR is mandatory:
- Option A: Keep eu-central-1 but add explicit data classification to ensure no PII/Sensitive data is replicated
- Option B: Use `me-central-1` (UAE) — closer, GCC data residency alignment
- Option C: Use a second me-south-1 account as DR via snapshot export

### 10.3 DR Runbook (Production)

```
Trigger condition: me-south-1 region unavailable for > 10 minutes

Steps:
1. Verify outage: Check CloudWatch, AWS Health Dashboard, PagerDuty
2. Decision:  Executive Go/No-Go for DR failover
3. Promote RDS snapshot: Restore latest cross-region snapshot in DR region
4. Deploy ECS: Run deploy.yml targeting DR region ECR/ECS
5. Update DNS: Route53 health check → failover to DR ALB
6. Verify: Health check endpoint returns 200, smoke test core flows
7. Communication: Status page update, customer notification template X

Recovery Time Objective (RTO):  < 60 minutes
Recovery Point Objective (RPO):  ~24 hours (with snapshots) or < 5 min (with streaming replication)
```

### 10.4 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| DR RPO is ~24h (snapshot-based) | Implement streaming replication (logical replication or AWS DMS CDC) for < 5 min RPO | **High** |
| DR region may violate KSA data residency | **Decision needed:** Evaluate me-central-1 (UAE) as DR region, or use multi-region within me-south-1 | **Critical** |
| No DR drill automation | Create a monthly DR drill script using Terraform workspaces in DR region | Medium |
| No S3 CRR for uploads bucket | Enable S3 Cross-Region Replication (CRR) for evidence/file uploads | Medium |
| No backup restore test | `scripts/platform/restore-drill.mjs` exists — automate monthly execution | Medium |

---

## 11. Security Posture

### 11.1 Current Implementations

| Control | Status | Details |
|---------|--------|---------|
| WAFv2 | ✅ Active | Rate limiting (5000 req/5min/IP), AWS Managed Rules |
| TLS/HTTPS | ✅ Active | ACM certs, HTTPS-only listener, security headers in next.config |
| CSP Headers | ✅ Active | `default-src 'self'`, strict CSP in next.config |
| DB Encryption | ✅ Active | Storage encrypted (KMS/gp3 default) |
| S3 Encryption | ✅ Active | SSE-S3 |
| Secrets Management | ✅ Active | AWS Secrets Manager for DB, Storage, Auth |
| RBAC | ✅ Active | Multi-role hierarchy, server-side enforcement |
| ABAC | ⚠️ Shadow | Feature-flagged, evaluating before full enforcement |
| Tenant Isolation | ✅ Active | organizationId on all models, server-side queries scoped |
| Audit Trail | ✅ Active | Outbox pattern for all mutations |
| MFA | ✅ Active | TOTP, email OTP, backup codes |
| SAML SSO | ✅ Active | @node-saml/node-saml, SP metadata, assertion validation |
| ClamAV Scanning | ✅ Active | Sidecar container for file upload scanning |
| IAM Roles | ✅ Active | ECS task roles, least-privilege in Terraform |
| No hardcoded secrets | ✅ Verified | All secrets via env vars or Secrets Manager |
| ECR image scanning | ⚠️ Basic | Enable Amazon ECR Enhanced Scanning (Inspector) |

### 11.2 Security Group Audit (from Terraform)

```
alb-sg:
  Ingress: 0.0.0.0/0:443, 0.0.0.0/0:80
  → ✅ Correct. ALB must accept public HTTPS.

ecs-sg:
  Ingress: alb-sg:3000
  → ✅ Correct. Only ALB can reach app.

rds-sg:
  Ingress: ecs-sg:5432
  → ✅ Correct. Only ECS tasks can reach DB.

redis-sg:
  Ingress: ecs-sg:6379
  → ✅ Correct. Only ECS tasks can reach Redis.
```

### 11.3 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No SecurityHub / GuardDuty | Enable AWS GuardDuty (free for 30 days, then ~$1-5/month per account). Enable Security Hub (free tier). Both provide CIS benchmarks and threat detection. | **High** |
| No network firewall / AWS WAF on ALB | WAF is associated with CloudFront only. Add WAF ACL to ALB as well for defense in depth. | Medium |
| No VPC endpoints | Add Gateway Endpoints for S3 and DynamoDB; Interface Endpoints for ECR, CloudWatch, Secrets Manager | High |
| No S3 Block Public Access at account level | Verify `aws_s3_account_public_access_block` is set in Terraform | High |
| No encryption at rest for ECS task storage | Ephemeral storage is not encrypted by default. Enable Fargate ephemeral storage encryption. | Medium |
| No KMS Customer Managed Keys (CMK) | Currently using AWS-managed keys. For production compliance, consider CMK with rotation. | Medium |
| No CloudTrail | Enable AWS CloudTrail for all API calls (free management events, paid for data events) | **High** |
| No Config rules | Enable AWS Config for compliance monitoring (CIS, NCA) | Medium |
| No vulnerability scanning on running ECS tasks | Enable Amazon Inspector for ECS running containers | Medium |
| No penetration testing schedule | Documented as E-01 in AGENTS.md — external pentest required before customer launch | High |

---

## 12. CI/CD Pipeline

### 12.1 Pipeline Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PR Push  │───▶│ Preview  │───▶│ Vercel   │    │  Merge   │
│           │    │ (preview)│    │ (preview)│    │  to main │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  Push to  │───▶│  CI      │───▶│ Build +  │         │
│  main/stg │    │ (lint,   │    │ Test +   │         │
│           │    │  type,   │    │ Prisma   │         │
│           │    │  test)   │    │ Generate │         │
└──────────┘    └──────────┘    └──────────┘         │
                                                     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Deploy  │◀───│  Terra   │◀───│  Docker  │◀───│  ECR     │
│  ECS     │    │  form    │    │  Build   │    │  Push    │
│  Fargate │    │  Apply   │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

Manual:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Promote │───▶│  Approval│───▶│  Deploy  │
│  staging │    │  Gate    │    │  prod    │
│  → prod  │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘
```

### 12.2 Workflow Summary

| Workflow | File | Trigger | Environment |
|----------|------|---------|-------------|
| CI | `.github/workflows/ci.yml` | Push to main/staging, PRs | Build/test only |
| Deploy | `.github/workflows/deploy.yml` | Push to main (prod), staging branch | Staging/Production |
| Promote | `.github/workflows/promote.yml` | Manual workflow_dispatch | Staging → Production |
| Preview | `.github/workflows/preview.yml` | PR opened/updated | Vercel (preview) |
| Backup | `.github/workflows/backup.yml` | Scheduled (daily?) | Production |
| Smoke Test | multi-env-smoke (`package.json`) | Post-deploy | All envs |

### 12.3 CI Steps (`ci.yml`)

1. Checkout
2. Setup Node 22
3. `npm ci --ignore-scripts`
4. `cp .env.example .env` (for type checking)
5. `npx prisma generate`
6. `npx tsc --noEmit`
7. `npm run lint -- --quiet` (pre-existing warnings documented)
8. `npm test` (unit + integration)
9. `npm run build` (full build)
10. `npm audit` (security audit)

### 12.4 Deploy Steps (`deploy.yml`)

1. Checkout
2. Configure AWS credentials (via OIDC or secrets)
3. `aws ecr get-login-password`
4. Docker build + tag
5. Docker push to ECR
6. `aws ecs update-service` — force new deployment
7. Wait for service stable
8. Smoke test (`npx multi-env-smoke test`)

### 12.5 Recommendations

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No rollback automation in deploy workflow | Add rollback step that redeploys previous task definition if smoke tests fail | **High** |
| No canary / blue-green deployment | ECS supports CodeDeploy blue/green. Implement for production to reduce deployment risk. | Medium |
| No infrastructure validation in CI | Add `terraform validate` + `terraform plan` check in CI for infrastructure PRs | Medium |
| No dependency caching | Docker layer caching for faster builds. Use GitHub Actions cache for npm + Docker layers. | Medium |
| No ECR lifecycle policy verified | `retain 30 images` is documented but verify in Terraform | Verify |
| No integration test DB in CI | CI uses pgvector service — verify this works (integrations that need DB may be skipped) | Verify |

---

## 13. Cost Projection

### 13.1 Monthly Cost Breakdown (Production)

| Service | Configuration | Monthly Estimate | Notes |
|---------|--------------|------------------|-------|
| **ECS Fargate** | 3 tasks × 1024 CPU / 2048 MB | $150 | R6g equivalent. Scales to 10 max. |
| **ALB** | 1 ALB, multi-AZ | $25 | Fixed + per LCU |
| **NAT Gateway** | 1 per AZ (3) | $90 | Largest infra waste |
| **RDS PostgreSQL** | db.r6g.large, Multi-AZ, gp3 100GB | $600 | Can be optimized |
| **RDS Read Replica** | db.r6g.large | $300 | Production only |
| **ElastiCache Redis** | cache.r6g.large, 2 nodes | $150 | Clustered mode |
| **S3** | Uploads + static + backups | $15 | Negligible at scale |
| **CloudFront** | CDN + WAFv2 | $15 | Mostly static assets |
| **Route53** | Hosted zone + health checks | $5 | Fixed |
| **CloudWatch** | Logs + metrics + dashboards | $20 | ~$0.50/GB ingested |
| **Secrets Manager** | 5 secrets | $4 | $0.40/secret/month |
| **Backup (AWS Backup)** | Snapshots | $20 | Varies by size |
| **Sentry** | Team plan | $26 | Error monitoring |
| **Vercel** | Pro (preview only) | $20 | PR preview builds |
| **Plausible** | Self-hosted or cloud | $0-10 | Depends |
| **Total** | | **~$1,440/month** | Baseline production |

### 13.2 Optimization Opportunities

| Optimization | Savings | Effort | Risk |
|-------------|---------|--------|------|
| Consolidate NAT Gateways to 1 | ~$60/mo | Low | Single-AZ NAT is SPOF; acceptable for staging |
| Use Graviton (ARM) for RDS/ECS | ~20% ($200/mo) | Low | Verify Next.js + Prisma work on ARM (they do) |
| Use Reserved Instances for RDS (1yr) | ~40% ($360/mo) | Low | Requires 1yr commitment |
| Use Fargate Spot for dev/staging | ~70% ($50/mo) | Low | No spot in production |
| Right-size dev/staging DB (t4g.medium) | ~$400/mo | Low | Already recommended |
| Enable RDS auto-pause for dev | ~$100/mo | Low | Only if dev is intermittent |
| **Optimized total** | **~$700-900/mo** | | |

### 13.3 Year-1 Projection

| Quarter | Run Rate | Cumulative | Notes |
|---------|----------|------------|-------|
| Q1 | $1,440/mo | $4,320 | Production launch |
| Q2 | $1,200/mo | $7,920 | After Graviton + RI optimization |
| Q3 | $1,500/mo | $12,420 | +Scale (more ECS tasks), +Bedrock costs |
| Q4 | $2,000/mo | $18,420 | +Scale, +DR streaming replication |

**Annual estimate: $15,000-20,000** (infrastructure only, excluding AI API tokens)

---

## 14. Decision Registry (Open Issues)

| ID | Issue | Options | Recommendation | Owner | Deadline |
|----|-------|---------|---------------|-------|----------|
| D-001 | AI cloud provider: Bedrock vs direct API | A) Add Bedrock provider (primary) + direct API fallback; B) Stay direct API only | **A** — Bedrock for VPC-private, KMS, no API key mgmt | Architecture | Before GA |
| D-002 | DR region for KSA data residency | A) eu-central-1 (current); B) me-central-1 (UAE); C) Second me-south-1 account | **B** — me-central-1 for GCC alignment, or **A** with data classification | Compliance | **Urgent** |
| D-003 | Ollama GPU hosting in production | A) EC2 g4dn.xlarge in VPC; B) Drop local AI for MVP; C) SageMaker endpoint | **B** for MVP, evaluate **A** for pilot | Architecture | Q3 |
| D-004 | VPC endpoint deployment | A) Add S3 Gateway + ECR/CloudWatch interface endpoints; B) Keep NAT-only | **A** — saves NAT bandwidth, improves security | Infrastructure | Before GA |
| D-005 | PgBouncer / RDS Proxy | A) Add RDS Proxy; B) Prisma pool management only | **B** for now, **A** if connection count exceeds 50 | Infrastructure | Monitor |
| D-006 | S3 Cross-Region Replication | A) Enable CRR for uploads bucket; B) Use backup.yml + manual restore | **A** — reduces RPO to near-zero for evidence files | Infrastructure | Before GA |
| D-007 | Migration from gp3 to io2 for DB | A) Stay gp3 (current); B) io2 for higher IOPS | **A** — gp3 is sufficient at current scale | Infrastructure | Monitor |
| D-008 | ECS Blue/Green deployment | A) CodeDeploy blue/green; B) Rolling update (current) | **B** for MVP, **A** when >3 active devs | DevOps | Future |
| D-009 | Container image scanning | A) ECR Enhanced (Inspector); B) Trivy in CI; C) None | **A + B** — defense in depth | Security | Before GA |
| D-010 | Plausible: self-hosted vs cloud | A) Keep self-hosted; B) Plausible Cloud | **B** — reduce ops burden; $10-20/mo | Ops | Low |

---

## 15. Implementation Roadmap

### Phase 1: Foundation (1-2 weeks) — Pre-GA

1. **Enable VPC Endpoints** (S3 Gateway, ECR, CloudWatch, Secrets Manager)
   - Reduces NAT bandwidth, improves security, speeds up deploys
   - Effort: 2-3 hours (Terraform changes)
   - Cost: $0 for Gateway, ~$7/month per Interface endpoint

2. **Enable GuardDuty + SecurityHub + CloudTrail**
   - Baseline security monitoring
   - Effort: 1 hour (Terraform + enable)
   - Cost: ~$5-15/month

3. **Consolidate NAT Gateway to 1 for dev/staging** (leave 3 for prod)
   - Saves $60-120/month
   - Effort: 1 hour (Terraform change)

4. **Resolve DR Region Decision (D-002)**
   - Compliance prerequisite
   - Effort: Decision meeting + Terraform variable change

### Phase 2: Production Hardening (2-3 weeks) — GA

1. **Add Bedrock provider (D-001)**
   - Primary AI provider for cloud tasks
   - Effort: 3-5 days (new provider module)

2. **Implement cross-region streaming replication** (logical replication or DMS CDC)
   - Reduces DR RPO from ~24h to < 5 min
   - Effort: 3-5 days (setup + validation)

3. **Add CloudFront → ALB WAF association**
   - Defense in depth for web traffic
   - Effort: 1 day

4. **Implement structured logging** (pino/winston → CloudWatch)
   - Better log analysis
   - Effort: 2 days

5. **Verify SAML SSO with real IdP**
   - Customer prerequisite
   - Effort: 2-3 days (integration testing)

### Phase 3: Operational Excellence (ongoing)

1. Monthly DR drill (automated via restore-drill.mjs)
2. Quarterly penetration test (external)
3. Monthly dependency updates (Dependabot)
4. Weekly backup restore verification
5. Cost optimization review (monthly)

---

## 16. Appendices

### A. Key Files Referenced

| File | Purpose | 
|------|---------|
| `infra/terraform/main.tf` | Root composition — assembles VPC, DB, ECS, S3, monitoring |
| `infra/terraform/providers.tf` | AWS provider config (me-south-1, us-east-1, dr) |
| `infra/terraform/variables.tf` | All root variables with defaults |
| `infra/terraform/modules/networking/` | VPC, subnets, NAT, SGs |
| `infra/terraform/modules/database/main.tf` | RDS PG16, read replica, cross-region DR |
| `infra/terraform/modules/compute/` | ECS Fargate, ALB, Redis, auto-scaling |
| `infra/terraform/modules/storage/` | S3 buckets, CloudFront, WAF |
| `infra/terraform/modules/monitoring/` | CloudWatch dashboards, alarms, AWS Backup |
| `infra/terraform/environments/production/` | Production tfvars |
| `Dockerfile` | Node 22 Alpine, standalone build, uploads dir |
| `docker-compose.yml` | Full stack (app, pgvector, Redis, ClamAV) |
| `.env.example` | All env vars documented |
| `.github/workflows/deploy.yml` | ECS deployment pipeline |
| `.github/workflows/ci.yml` | CI: lint, type, test, build, audit |
| `src/lib/core/ai/hybrid-router.ts` | Task-based local/cloud AI routing |
| `src/lib/core/ai/providers/` | All AI provider implementations |
| `src/lib/platform/storage/s3-storage-provider.ts` | S3 file storage |
| `src/lib/platform/storage/object-storage-provider.ts` | Audit S3 storage |
| `prisma/schema.prisma` | Full data model (DocumentChunk vector, AuditEvent, etc.) |

### B. Environment Variables Requiring Pre-Provisioning

| Variable | Source | Required For |
|----------|--------|-------------|
| `DATABASE_URL` | Secrets Manager (`aqliya/<env>/database-url`) | Runtime |
| `REDIS_URL` | Secrets Manager (`aqliya/<env>/redis-url`) | Cache, rate limit |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Secrets Manager (`aqliya/<env>/auth-secret`) | Auth sessions |
| `S3_BUCKET`, `S3_ENDPOINT`, etc. | Secrets Manager (`aqliya/<env>/storage-config`) | File storage |
| `OPENAI_API_KEY` | Env / Secrets | AI (cloud tasks) |
| `ANTHROPIC_API_KEY` | Env / Secrets | AI (cloud tasks) |
| `SENTRY_DSN` | Env | Error monitoring |
| `PLAUSIBLE_URL` / `PLAUSIBLE_TOKEN` | Env | Analytics |

### C. Terraform Pre-requisites (per README)

1. Route53 hosted zone
2. ACM certificates in me-south-1 (ALB) and us-east-1 (CloudFront)
3. Secrets in AWS Secrets Manager (see B above)
4. Bootstrap: S3 bucket `aqliya-terraform-state` + DynamoDB `aqliya-terraform-locks`
5. AWS CLI configured with appropriate credentials

### D. Readiness Check Endpoint Details

```
GET /api/health

Checks:
  • Database: SELECT 1 via Prisma
  • pgvector: Extension availability
  • Redis: Connection test (if REDIS_URL set)
  • Storage: Local writable or S3 configured
  • AI provider: FF_AI_REAL_PROVIDERS + API key presence
  • Auth secret: AUTH_SECRET/NEXTAUTH_SECRET presence and length

Response: 200 (all checks pass) or 503 (degraded)
```
