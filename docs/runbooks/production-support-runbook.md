# AQLIYA Production Support Runbook
# دليل الدعم الإنتاجي لعقلية

> **Version:** 1.1 | **Date:** 2026-07-12 | **Language:** Bilingual (Arabic/English)
> **Applies to:** Production / Pilot deployments
> **ينطبق على:** النشر الإنتاجي / التجريبي

---

## 1. Service Architecture — معمارية الخدمات

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

## 2. Startup Sequence — تسلسل بدء التشغيل

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

## 3. Health Checks — فحوصات السلامة

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /api/health` | Basic liveness — التحقق الأساسي من الحياة | `{ "ok": true, "timestamp": "..." }` |
| `GET /api/health/live` | K8s/Docker liveness — فحص الحياة للحاويات | `{ "ok": true }` |
| `GET /api/health/ready` | Readiness (DB + Redis) — فحص الجاهزية | `{ "ok": true, "db": true, "redis": true }` |
| `GET /api/platform/enterprise-health` | Full health snapshot — لقطة سلامة كاملة | JSON with outbox, rate-limiter, ABAC |
| `GET /operator` | Operator dashboard — لوحة المشغل | Web UI with EnterpriseHealthPanel |

## 4. Backup & Recovery — النسخ الاحتياطي والاستعادة

### Automated Backup — النسخ الاحتياطي التلقائي

The backup scheduler runs every hour (configurable via `BACKUP_INTERVAL_MS`).
يعمل مجدول النسخ الاحتياطي كل ساعة.

```bash
# Manual backup — نسخ احتياطي يدوي
npm run db:backup

# Start scheduler (runs in background) — تشغيل المجدول
npm run db:backup:scheduler

# Verify backup — التحقق من النسخة الاحتياطية
ls -la ./backups/

# Verify backup integrity — التحقق من سلامة النسخة
npm run db:restore:drill [backup-file]
```

### Recovery Procedure — إجراءات الاستعادة

```bash
# 1. Identify latest backup — تحديد أحدث نسخة احتياطية
ls -t ./backups/aqliya_backup_*.dump | head -1

# 2. Run restore drill (scratch DB, no production impact) — اختبار الاستعادة
DATABASE_URL=<target-url> node scripts/platform/restore-drill.mjs <backup-file>

# 3. Point app to restored DB — توجيه التطبيق لقاعدة البيانات المستعادة
# Update DATABASE_URL in .env or Docker Compose

# 4. Run migrations — تشغيل الترحيلات
npx prisma migrate deploy

# 5. Verify — التحقق
npm run smoke:local
```

### RTO/RPO — أهداف وقت/نقطة الاسترداد

| Metric | Value |
|--------|-------|
| RPO | 1 hour (scheduled backup) |
| RTO (RDS snapshot) | ~30 minutes |
| RTO (pg_dump restore) | ~2 hours |

## 5. File Scanning — فحص الملفات

### Configuration — الإعدادات

```env
SCANNER_PROVIDER=clamav
CLAMAV_HOST=clamav       # Docker service name or IP
CLAMAV_PORT=3310
```

### Verification — التحقق

```bash
# Check ClamAV is running — التحقق من تشغيل ClamAV
docker compose ps clamav

# Test ClamAV connectivity (from app container) — اختبار الاتصال
docker compose exec app node -e "
  const { pingClamAv } = require('./src/lib/audit/clamav-client');
  pingClamAv().then(r => console.log(r));
"
```

## 6. Rate Limiting — تحديد المعدل

### Configuration — الإعدادات

```env
RATE_LIMITER=redis    # Required for multi-instance
REDIS_URL=redis://redis:6379
```

### Presets — الإعدادات المسبقة

| Route | Limit | Window |
|-------|-------|--------|
| `/api/auth/*` | 20/min | 60s |
| `/api/ai/*` | 10/min | 60s |
| `/api/scim/*` | 60/min | 60s |
| `/api/health` | 120/min | 60s |
| Standard API | 60/min | 60s |

## 7. AI Runtime — وقت تشغيل الذكاء الاصطناعي

### Provider Configuration — إعدادات المزود

```env
# Cloud providers (pick one) — مزودي الخدمة السحابية
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Or local (Ollama) — أو محلي
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=llama3

# Feature flags — إشارات الميزات
FF_AI_REAL_PROVIDERS=true
FF_AI_RAG=false
```

### Verification — التحقق

```bash
# Check AI health — التحقق من سلامة الذكاء الاصطناعي
curl http://localhost:3000/api/health

# Test AI provider — اختبار مزود الذكاء الاصطناعي
curl http://localhost:3000/api/ai/providers
```

## 8. ABAC Enforcement — تطبيق التحكم بالوصول

### Pilot Org Configuration — إعدادات المؤسسات التجريبية

```env
FF_ABAC_ENFORCE=true
FF_ABAC_SHADOW=true
ABAC_ENFORCE_ORG_IDS=<org-id-1>,<org-id-2>
```

### Shadow Mode — وضع الظل

Before enabling enforcement for a new org:
قبل تفعيل التطبيق لمؤسسة جديدة:
1. Set `FF_ABAC_SHADOW=true` (already default)
2. Check `/api/platform/abac/shadow-report` for mismatches
3. Review denials at `/operator` dashboard
4. Add org ID to `ABAC_ENFORCE_ORG_IDS`

## 9. Monitoring — المراقبة

### Dashboards — لوحات المعلومات

| URL | Purpose | الغرض |
|-----|---------|-------|
| `/operator` | Enterprise health, outbox status, ABAC status | سلامة المؤسسة، حالة الصادر، حالة ABAC |
| `/monitoring` | System metrics | مقاييس النظام |
| `/settings/chain-verification` | Audit hash chain integrity | سلامة سلسلة تجزئة التدقيق |
| `/settings/siem` | SIEM export configuration | إعدادات تصدير SIEM |

### Alert Thresholds — عتبات التنبيه

| Condition | Severity | Action |
|-----------|----------|--------|
| Outbox > 100 failed | Critical | Check `/operator`, review outbox |
| Backup > 25h old | Critical | Check backup scheduler |
| ClamAV unreachable | Critical | Restart ClamAV container |
| 5xx rate > 5% | High | Check app logs |
| Rate limit > 80% | Medium | Scale app or adjust limits |

## 10. Incident Response — الاستجابة للحوادث

### Severity Levels — مستويات الخطورة

| Level | Definition | Response Time |
|-------|------------|---------------|
| P0 | Complete outage — انقطاع كامل | 15 min |
| P1 | Major feature broken — تعطل ميزة رئيسية | 30 min |
| P2 | Minor feature degraded — تدهور ميزة ثانوية | 2 hours |
| P3 | Cosmetic / non-urgent — تجميلي / غير عاجل | Next business day |

### Common Incidents — الحوادث الشائعة

**App not responding — التطبيق لا يستجيب**
```bash
docker compose logs app --tail=50
docker compose restart app
```

**Database connection failed — فشل اتصال قاعدة البيانات**
```bash
docker compose logs db --tail=50
docker compose restart db
npm run smoke:local
```

**File uploads failing — فشل رفع الملفات**
```bash
docker compose logs clamav --tail=50
curl http://localhost:3310  # Test ClamAV socket
```

**Rate limiting incorrectly — تحديد المعدل غير صحيح**
```bash
docker compose logs redis --tail=50
docker compose exec redis redis-cli ping
```

## 11. Daily Operations — العمليات اليومية

```bash
# Morning check — الفحص الصباحي
curl -s http://localhost:3000/api/health | jq .
curl -s http://localhost:3000/api/platform/enterprise-health | jq '.alerts'

# Backup verification — التحقق من النسخ الاحتياطي
ls -la ./backups/ | tail -5

# Disk usage — استخدام القرص
df -h ./backups/ ./uploads/

# Container health — سلامة الحاويات
docker compose ps

# Audit chain integrity — سلامة سلسلة التدقيق
# Visit /settings/chain-verification in browser
```
