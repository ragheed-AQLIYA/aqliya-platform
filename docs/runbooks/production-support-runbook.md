# AQLIYA Production Support Runbook

**Version:** 1.0  
**Date:** 2026-06-21  
**Applies to:** Production / Pilot deployments

---

## 1. Service Architecture

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Next.js    │  │   Redis 7    │  │   ClamAV     │
│   (App)      │◄─┤   (Rate     │  │   (Scanner)  │
│   :3000      │  │    Limiter) │  │   :3310      │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
┌──────▼───────┐  ┌──────────────┐
│  PostgreSQL  │  │  Backup      │
│  16          │  │  Scheduler   │
│  :5432       │  │  (sidecar)   │
└──────────────┘  └──────────────┘
```

## 2. Startup Sequence

```bash
# Full stack (dev)
docker compose up -d

# Full stack (production)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/live
curl http://localhost:3000/api/health/ready
```

## 3. Health Checks

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /api/health` | Basic liveness | `{ "ok": true, "timestamp": "..." }` |
| `GET /api/health/live` | K8s/Docker liveness | `{ "ok": true }` |
| `GET /api/health/ready` | Readiness (DB + Redis) | `{ "ok": true, "db": true, "redis": true }` |
| `GET /api/platform/enterprise-health` | Full health snapshot | JSON with outbox, rate-limiter, ABAC |
| `GET /operator` | Operator dashboard | Web UI with EnterpriseHealthPanel |

## 4. Backup & Recovery

### Automated Backup

The backup scheduler runs every hour (configurable via `BACKUP_INTERVAL_MS`).

```bash
# Manual backup
npm run db:backup

# Start scheduler (runs in background)
npm run db:backup:scheduler

# Verify backup
ls -la ./backups/

# Verify backup integrity
npm run db:restore:drill [backup-file]
```

### Recovery Procedure

```bash
# 1. Identify latest backup
ls -t ./backups/aqliya_backup_*.dump | head -1

# 2. Run restore drill (scratch DB, no production impact)
DATABASE_URL=<target-url> node scripts/platform/restore-drill.mjs <backup-file>

# 3. Point app to restored DB
# Update DATABASE_URL in .env or Docker Compose

# 4. Run migrations
npx prisma migrate deploy

# 5. Verify
npm run smoke:local
```

### RTO/RPO

| Metric | Value |
|--------|-------|
| RPO | 1 hour (scheduled backup) |
| RTO (RDS snapshot) | ~30 minutes |
| RTO (pg_dump restore) | ~2 hours |

## 5. File Scanning

### Configuration

```env
SCANNER_PROVIDER=clamav
CLAMAV_HOST=clamav       # Docker service name or IP
CLAMAV_PORT=3310
```

### Verification

```bash
# Check ClamAV is running
docker compose ps clamav

# Test ClamAV connectivity (from app container)
docker compose exec app node -e "
  const { pingClamAv } = require('./src/lib/audit/clamav-client');
  pingClamAv().then(r => console.log(r));
"
```

## 6. Rate Limiting

### Configuration

```env
RATE_LIMITER=redis    # Required for multi-instance
REDIS_URL=redis://redis:6379
```

### Presets

| Route | Limit | Window |
|-------|-------|--------|
| `/api/auth/*` | 20/min | 60s |
| `/api/ai/*` | 10/min | 60s |
| `/api/scim/*` | 60/min | 60s |
| `/api/health` | 120/min | 60s |
| Standard API | 60/min | 60s |

## 7. AI Runtime

### Provider Configuration

```env
# Cloud providers (pick one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Or local (Ollama)
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=llama3

# Feature flags
FF_AI_REAL_PROVIDERS=true
FF_AI_RAG=false
```

### Verification

```bash
# Check AI health
curl http://localhost:3000/api/health

# Test AI provider
curl http://localhost:3000/api/ai/providers
```

## 8. ABAC Enforcement

### Pilot Org Configuration

```env
FF_ABAC_ENFORCE=true
FF_ABAC_SHADOW=true
ABAC_ENFORCE_ORG_IDS=<org-id-1>,<org-id-2>
```

### Shadow Mode

Before enabling enforcement for a new org:
1. Set `FF_ABAC_SHADOW=true` (already default)
2. Check `/api/platform/abac/shadow-report` for mismatches
3. Review denials at `/operator` dashboard
4. Add org ID to `ABAC_ENFORCE_ORG_IDS`

## 9. Monitoring

### Dashboards

| URL | Purpose |
|-----|---------|
| `/operator` | Enterprise health, outbox status, ABAC status |
| `/monitoring` | System metrics |
| `/settings/chain-verification` | Audit hash chain integrity |
| `/settings/siem` | SIEM export configuration |

### Alert Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| Outbox > 100 failed | Critical | Check `/operator`, review outbox |
| Backup > 25h old | Critical | Check backup scheduler |
| ClamAV unreachable | Critical | Restart ClamAV container |
| 5xx rate > 5% | High | Check app logs |
| Rate limit > 80% | Medium | Scale app or adjust limits |

## 10. Incident Response

### Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| P0 | Complete outage | 15 min |
| P1 | Major feature broken | 30 min |
| P2 | Minor feature degraded | 2 hours |
| P3 | Cosmetic / non-urgent | Next business day |

### Common Incidents

**App not responding**
```bash
docker compose logs app --tail=50
docker compose restart app
```

**Database connection failed**
```bash
docker compose logs db --tail=50
docker compose restart db
npm run smoke:local
```

**File uploads failing**
```bash
docker compose logs clamav --tail=50
curl http://localhost:3310  # Test ClamAV socket
```

**Rate limiting incorrectly**
```bash
docker compose logs redis --tail=50
docker compose exec redis redis-cli ping
```

## 11. Daily Operations

```bash
# Morning check
curl -s http://localhost:3000/api/health | jq .
curl -s http://localhost:3000/api/platform/enterprise-health | jq '.alerts'

# Backup verification
ls -la ./backups/ | tail -5

# Disk usage
df -h ./backups/ ./uploads/

# Container health
docker compose ps

# Audit chain integrity
# Visit /settings/chain-verification in browser
```
