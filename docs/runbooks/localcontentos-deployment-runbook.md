# LocalContentOS Deployment Runbook — دليل نشر المحتوى المحلي

> **Product:** LocalContentOS under AQLIYA  
> **Level:** L5 Pilot-ready  
> **Status:** Active | Version 1.0 | 2026-07-01  
> **Routes:** /local-content/*  
> **Stack:** Next.js 16, TypeScript 5, PostgreSQL 16, Prisma 7, Tailwind CSS 4  
> **Language:** Bilingual (Arabic/English)

---

## Table of Contents — فهرس المحتويات

1. [Prerequisites — المتطلبات الأساسية](#1-prerequisites--)
2. [LCOS-Specific Environment Variables — متغيرات البيئة الخاصة](#2-lcos-specific-environment-variables--)
3. [Prisma Migration Order — ترتيب ترحيلات بريزما](#3-prisma-migration-order--)
4. [Seed Data Instructions — تعليمات بيانات التمهيد](#4-seed-data-instructions--)
5. [File Storage Setup — إعداد تخزين الملفات](#5-file-storage-setup--)
6. [ERP Connector Configuration — تكوين موصلERP](#6-erp-connector-configuration--)
7. [Post-Deploy Smoke Tests — اختبارات التدخين بعد النشر](#7-post-deploy-smoke-tests--)
8. [Troubleshooting Common Issues — استكشاف الأخطاء الشائعة](#8-troubleshooting-common-issues--)

---

## 1. Prerequisites — المتطلبات الأساسية

### System Requirements — متطلبات النظام

| Requirement | Version | Notes |
|-------------|---------|-------|
| PostgreSQL | 16+ | Required for Prisma ORM |
| Node.js | 22+ | Required for Next.js 16 |
| npm | 10+ | Included with Node 22 |
| pg_dump / pg_restore | 16+ | For backup and restore drill |
| psql | 16+ | For direct DB verification |
| Git | Latest | For repository checkout |

### Infrastructure — البنية التحتية

`ash
# 1. Clone repository
git clone <repo-url>
cd aqliya

# 2. Install dependencies
npm install
# postinstall runs: prisma generate + validate-env.mjs

# 3. Source environment
# Copy template and edit for your environment
cp .env.example .env
`

### Docker (Optional — Recommended for Local Dev)

`ash
# Start PostgreSQL 16 via Docker Compose
docker compose up -d db

# Verify DB is running
docker compose ps db
# Expected: State "Up" (healthy)
`

**Important:** On some systems, localhost:5432 may point to a host PostgreSQL instead of the Docker container. When running inside a Docker network, use db:5432 as the host.

---

## 2. LCOS-Specific Environment Variables — متغيرات البيئة الخاصة

### Required for LCOS

| Variable | Value | Description | Arabic Description |
|----------|-------|-------------|-------------------|
| DATABASE_URL | postgresql://user:pass@host:5432/aqliya_lc_pilot | Database connection string for LCOS | سلسلة اتصال قاعدة البيانات |
| LOCALCONTENT_CONTENT_BACKEND | prisma | Content Studio persistence backend (prisma or file) | محرك تخزين المحتوى (بريزما أو ملف) |
| AUTH_SECRET | Base64-encoded 32 bytes | NextAuth session secret | مفتاح جلسات تسجيل الدخول |
| NEXTAUTH_URL | http://localhost:3000 | Application base URL | رابط التطبيق الأساسي |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | Public-facing app URL | رابط التطبيق العام |

### AI Provider Configuration — إعداد مزود الذكاء الاصطناعي

| Variable | Example | Description |
|----------|---------|-------------|
| AI_PROVIDER | openai / nthropic / deterministic | Default AI provider for LCOS suggestions |
| OPENAI_API_KEY | sk-... | OpenAI API key (when AI_PROVIDER=openai) |
| ANTHROPIC_API_KEY | sk-ant-... | Anthropic API key (when AI_PROVIDER=anthropic) |
| ANTHROPIC_MODEL | claude-sonnet-4-20250514 | Anthropic model version |
| AI_LOCAL_BASE_URL | http://localhost:11434 | Local Ollama endpoint |
| AI_LOCAL_MODEL | qwen3:8b | Local model for offline mode |
| FF_AI_REAL_PROVIDERS | 	rue / alse | Enable real AI providers (deterministic fallback if false) |
| FF_AI_RAG | 	rue / alse | Enable RAG context injection for AI calls |

### Storage Configuration — إعداد التخزين

| Variable | Example | Description |
|----------|---------|-------------|
| STORAGE_PROVIDER | local / s3 | Evidence file storage backend |
| LOCAL_STORAGE_DIR | ./uploads | Local storage path (when STORAGE_PROVIDER=local) |
| SCANNER_PROVIDER | clamav (or empty) | File upload virus scanner |

### Telemetry & Monitoring — القياس والمراقبة

| Variable | Example | Description |
|----------|---------|-------------|
| LOG_LEVEL | debug | Application log level |
| SENTRY_DSN | https://... | Sentry error tracking DSN |
| RATE_LIMITER | memory / edis | Rate limiter backend |

### Pilot-Specific Variables (LCOS pilot only)

| Variable | Pilot Value | Why |
|----------|-------------|-----|
| DATABASE_URL | Points at qliya_lc_pilot | Dedicated database for LCOS |
| LOCALCONTENT_CONTENT_BACKEND | prisma | Production-like Prisma guard |
| FF_AI_REAL_PROVIDERS | 	rue | Enable AI suggestions (recommended for pilot) |
| FF_AI_RAG | 	rue | Enable grounded AI context |

---

## 3. Prisma Migration Order — ترتيب ترحيلات بريزما

### Understanding the Migration Chain — فهم سلسلة الترحيلات

LCOS shares the Prisma schema with the platform. When deploying, **all** pending migrations apply in order.

### Migration Categories — فئات الترحيلات

| Category | Migration Prefix | Example |
|----------|-----------------|---------|
| Shared Core | 20260506... | init_postgres, auth, organizations |
| AuditOS | 202605... | Audit engagement models |
| **LocalContentOS** | 20260521053231... | dd_localcontentos_foundation |
| **LocalContentOS Content Studio** | 20260601120000... | localcontentos_content_studio |
| SalesOS P0/P1 | 2026060114... | SalesOS schema (applied on same DB) |

### Deployment Order — ترتيب النشر

`ash
# Step 1: Verify current migration status (read-only)
npx prisma migrate status
# Expected on empty DB: all migrations listed as "not yet applied"

# Step 2: Apply all pending migrations
# ⚠️ Requires explicit approval
npx prisma migrate deploy

# Step 3: Generate Prisma client
npx prisma generate

# Step 4: Verify all tables exist
psql "" -c "\dt \"LocalContent*\""
psql "" -c "\dt \"ContentStudio*\""
psql "" -c "\dt \"Lc*\""
`

### Expected LCOS Tables — الجداول المتوقعة

| Table | Migration | Purpose |
|-------|-----------|---------|
| LocalContentProject | dd_localcontentos_foundation | LCOS projects |
| LcSupplier | dd_localcontentos_foundation | Supplier records |
| LcSpendRecord | dd_localcontentos_foundation | Spend/Procurement records |
| LcWorkbook | dd_localcontentos_foundation | Scoring workbook |
| LcWorkbookLine | dd_localcontentos_foundation | Workbook line items |
| LcClassification | dd_localcontentos_foundation | Supplier classification |
| LcEvidence | dd_localcontentos_foundation | Evidence attachments |
| LcFinding | dd_localcontentos_foundation | Gap/Risk findings |
| LcReview | dd_localcontentos_foundation | Review records |
| LcAiReviewRun | dd_localcontentos_foundation | AI review runs (audit) |
| LcPatternSuggestion | dd_localcontentos_foundation | AI pattern suggestions |
| LcMatchReview | dd_localcontentos_foundation | Match review decisions |
| LcIndustryPatternMemory | dd_localcontentos_foundation | Industry memory |
| LcOrganizationMatchMemory | dd_localcontentos_foundation | Org memory |
| LcScoreSnapshot | dd_localcontentos_foundation | Score snapshots |
| ContentStudioProject | localcontentos_content_studio | Content Studio projects |
| ContentStudioCampaign | localcontentos_content_studio | Content campaigns |
| ContentStudioSource | localcontentos_content_studio | Content sources |
| ContentStudioItem | localcontentos_content_studio | Content items |
| ContentStudioReview | localcontentos_content_studio | Content reviews |
| ContentStudioApproval | localcontentos_content_studio | Content approvals |
| ContentStudioOutput | localcontentos_content_studio | Content outputs |

### Pilot DB Checklist — قائمة التحقق لقاعدة بيانات التجربة

- [ ] Database is **empty** (no prior _prisma_migrations rows)
- [ ] DATABASE_URL points to dedicated LCOS database (e.g., qliya_lc_pilot)
- [ ] 
px prisma migrate status shows no drift message
- [ ] All 17+ migrations apply cleanly
- [ ] All LCOS tables present (verified via \dt)

---

## 4. Seed Data Instructions — تعليمات بيانات التمهيد

### Seed Scripts — نصوص التمهيد

LCOS provides a comprehensive seed dataset in prisma/seed-local-content.ts.

| Command | Description | Arabic |
|---------|-------------|--------|
| 
pm run seed:localcontent (or 
px tsx prisma/seed-local-content.ts) | Seed LCOS demo data | تمهيد بيانات تجريبية للمحتوى المحلي |
| 
px prisma db seed | Seed full platform (platform + audit + LCOS) | تمهيد المنصة كاملة |

### Seed Data Contents — محتويات بيانات التمهيد

| Entity | Count | Details |
|--------|-------|---------|
| Organizations | 1-2 | Including demo organizations |
| Projects | 1 | Realistic LCOS project (e.g., شركة الابتكار التقني) |
| Suppliers | 12+ | Saudi/non-local/mixed suppliers with Arabic names |
| Spend Records | 30+ | Procurement data with amounts and categories |
| Classifications | 12+ | Supplier classification records |
| Workbooks | 1 | Full 20+ line scoring workbook |
| Evidence | 15+ | Uploaded evidence files |
| Findings | 5+ | Gap/Risk findings |
| Reviews | 1+ | Sample review records |
| AI Patterns | 3+ | Pre-seeded pattern suggestions |

### Seeding Procedure — إجراءات التمهيد

`powershell
# Step 1: Ensure DB is migrated
npx prisma migrate status   # read-only check

# Step 2: Run LCOS seed
# ⚠️ Requires explicit approval — writes data
npx tsx prisma/seed-local-content.ts

# Step 3: Verify seed data
psql "" -c "SELECT COUNT(*) FROM \"LocalContentProject\";"
psql "" -c "SELECT COUNT(*) FROM \"LcSupplier\";"
psql "" -c "SELECT COUNT(*) FROM \"LcWorkbookLine\";"
`

**Note:** prisma/seed.ts (full platform seed) uses deleteMany — it clears existing data. Use only on fresh databases. The LCOS-specific seed (seed-local-content.ts) is safer on existing databases.

### Credentials for Pilot — بيانات الدخول للتجربة

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | dmin@aqliya.com | dmin123 | ADMIN |
| Operator | sara@aqliya.com | operator123 | OPERATOR |
| Viewer | mohammad@aqliya.com | iewer123 | VIEWER |

---

## 5. File Storage Setup — إعداد تخزين الملفات

### Local Storage (Development / Single-Instance) — التخزين المحلي

`env
STORAGE_PROVIDER=local
LOCAL_STORAGE_DIR=./uploads
`

`ash
# Create uploads directory if it doesn't exist
mkdir -p uploads

# Verify permissions (app must have write access)
ls -la uploads/
`

### S3-Compatible Storage (Production / Multi-Instance) — تخزين S3

`env
STORAGE_PROVIDER=s3
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=aqliya-localcontent-evidence
S3_REGION=me-central-1
S3_ENDPOINT=https://s3.me-central-1.amazonaws.com
`

### File Scanning (Production) — فحص الملفات

`env
SCANNER_PROVIDER=clamav
CLAMAV_HOST=clamav       # Docker service name
CLAMAV_PORT=3310
`

### Evidence Storage Model — نموذج تخزين الأدلة

LCOS evidence files are stored via the LcEvidence model:

| Field | Type | Description |
|-------|------|-------------|
| storageProvider | String | local or s3 |
| storageKey | String | Path or S3 key |
| ileHash | String | SHA-256 checksum |
| ileSize | Int | File size in bytes |
| mimeType | String | e.g., pplication/pdf |

**Storage Rules:**
- Evidence requires authentication and tenant-scoped access
- File metadata must be logged on upload
- Downloads must be permission-checked server-side
- All mutations are audited via PlatformAuditLog

---

## 6. ERP Connector Configuration — تكوين موصل ERP

### Current Status — الحالة الحالية

**⚠️ ERP integration is on the roadmap (LC-08) and NOT yet implemented.**  
The connector interface, types, and SAP/Oracle/CSV importers exist as prototypes.  
**Per-connection secrets** are prepared in .env.example but not active:

`env
# # ERP_CONNECTION__<id>__API_KEY=   # Future — not active
`

### Configuration Path — مسار التكوين

When ERP integration is activated:

1. Navigate to /local-content/settings/integrations
2. Select ERP type: SAP, Oracle, Microsoft Dynamics, Custom
3. Configure connection parameters (API URL, credentials)
4. Map chart of accounts to local content categories
5. Schedule sync frequency (daily, weekly, monthly)
6. Test connection

### Supported Importer Stubs — نماذج الاستيراد المدعومة

| System | File | Status |
|--------|------|--------|
| SAP | sap-importer.ts | Type/interface prototype |
| Oracle | oracle-importer.ts | Type/interface prototype |
| CSV | csv-importer.ts | Available for custom integrations |

### API Integration — تكامل API

For custom integrations without ERP:

`ash
# Export project data as JSON for external processing
GET /api/local-content/projects/[id]/export?format=json
# Requires authentication + appropriate permissions
`

---

## 7. Post-Deploy Smoke Tests — اختبارات التدخين بعد النشر

### Health Check — فحص الصحة

`ash
# Basic liveness
curl http://localhost:3000/api/health
# Expected: { "ok": true, "timestamp": "..." }

# Readiness (DB + Redis)
curl http://localhost:3000/api/health/ready
# Expected: { "ok": true, "db": true, "redis": true }

# Enterprise health
curl http://localhost:3000/api/platform/enterprise-health
# Expected: JSON with outbox, rate-limiter, ABAC status
`

### Verify LCOS Routes — التحقق من مسارات LCOS

`ash
# Login and get session cookie first, then:
curl -s http://localhost:3000/local-content
# Expected: 302 (redirect to login if unauthenticated)
# Expected: 200 (dashboard with KPIs if authenticated)

# Project list
curl -s http://localhost:3000/local-content/projects
# Expected: 200 with project list or empty state

# API health for LCOS
curl -s http://localhost:3000/api/health/live
`

### Verify Seed Data — التحقق من بيانات التمهيد

`ash
# Count seed entities via psql
psql "" -c "
SELECT 'projects' as entity, COUNT(*) FROM \"LocalContentProject\"
UNION ALL
SELECT 'suppliers', COUNT(*) FROM \"LcSupplier\"
UNION ALL
SELECT 'spend', COUNT(*) FROM \"LcSpendRecord\"
UNION ALL
SELECT 'workbook_lines', COUNT(*) FROM \"LcWorkbookLine\"
UNION ALL
SELECT 'evidence', COUNT(*) FROM \"LcEvidence\"
UNION ALL
SELECT 'findings', COUNT(*) FROM \"LcFinding\";
"
`

### Verify AI Pipeline — التحقق من خط الذكاء الاصطناعي

`ash
# Check AI provider health
curl http://localhost:3000/api/ai/providers
# Expected: JSON listing available providers

# Run pipeline dry-run (if available)
npx tsx scripts/localcontent/pilot-session-check.ts
`

### Full Platform Smoke — اختبار تدخين كامل

`ash
# Built-in smoke test
npm run smoke:local -- --base-url http://localhost:3000

# Tier 2 operational smoke
npm run smoke:tier2

# LCOS-specific smoke
npx tsx scripts/localcontent/pilot-workflow-execution.ts
`

### Browser Manual Checklist — قائمة التحقق اليدوية

- [ ] Login works at /login with seeded admin credentials
- [ ] LCOS dashboard loads at /local-content with KPIs visible
- [ ] Project list shows seeded projects
- [ ] Workbook scoring displays correctly
- [ ] Evidence upload works (test with small PDF)
- [ ] Review workflow: submit → review → approve
- [ ] Export generates PDF/XLSX
- [ ] AI Review Center shows suggestions
- [ ] Quality dashboard loads with metrics
- [ ] Arabic/RTL layout renders correctly

---

## 8. Troubleshooting Common Issues — استكشاف الأخطاء الشائعة

### Database Issues — مشاكل قاعدة البيانات

| Symptom | Cause | Fix |
|---------|-------|-----|
| 
px prisma migrate status shows drift | Migrations applied out of order or from different DB | Check DATABASE_URL; reconcile with migrate resolve or restore from backup |
| DATABASE_URL connection refused | PostgreSQL not running or wrong host/port | docker compose ps db; verify DATABASE_URL format |
| Migration fails with "already exists" | Partial migration on existing schema | Run 
px prisma migrate status to check; use migrate resolve --rolled-back if needed |

### Seed Issues — مشاكل التمهيد

| Symptom | Cause | Fix |
|---------|-------|-----|
| Seed script exits with error | Missing tables (migrations not run) | Run 
px prisma migrate deploy first |
| Seed creates duplicate data | Already-seeded database | Use -- --force flag or re-create from backup |
| 
pm run seed:localcontent not found | Script not added to package.json | Use 
px tsx prisma/seed-local-content.ts directly |

### AI Pipeline Issues — مشاكل خط الذكاء الاصطناعي

| Symptom | Cause | Fix |
|---------|-------|-----|
| AI suggestions empty | FF_AI_REAL_PROVIDERS=false or AI provider unreachable | Set FF_AI_REAL_PROVIDERS=true; check AI_PROVIDER and API keys |
| AI review fails with 403 | Missing authentication for governed AI | Ensure user is logged in with sufficient role (OPERATOR+) |
| Grounded AI returns null | isProductAICoreEnabled() returns false | Check FF_AI_REAL_PROVIDERS and FF_AI_RAG flags |
| Pipeline stage fails silently | Stage error is isolated — check audit logs | Navigate to project detail → Governance tab |

### Evidence Upload Issues — مشاكل رفع الأدلة

| Symptom | Cause | Fix |
|---------|-------|-----|
| Upload fails with 413 | File too large | Check NEXT_PUBLIC_UPLOAD_MAX_SIZE (default 10MB) |
| Upload fails with 500 | Storage backend unreachable | Check STORAGE_PROVIDER and LOCAL_STORAGE_DIR |
| Upload fails — scanning error | ClamAV not running | docker compose ps clamav; check SCANNER_PROVIDER |

### Export Issues — مشاكل التصدير

| Symptom | Cause | Fix |
|---------|-------|-----|
| PDF export fails | pdfkit not installed | Verify 
pm ls pdfkit; re-run 
pm install |
| XLSX export empty | Missing workbook data | Ensure workbook has scored data |
| Export says "DRAFT — NOT FINAL" | Project not approved | Advance project to APPROVED status |

### Classification Issues — مشاكل التصنيف

| Symptom | Cause | Fix |
|---------|-------|-----|
| Classification returns no results | No classification rules defined | Define rules at /local-content/classification-rules |
| Suppliers not classified | Missing CR numbers or locality status | Update supplier records with required fields |
| Confidence score very low | Insufficient pattern data or industry memory | Run AI pipeline after adding more supplier/spend data |

### General Issues — مشاكل عامة

| Symptom | Cause | Fix |
|---------|-------|-----|
| LOCALCONTENT_CONTENT_BACKEND=prisma ignored | Typo or whitespace in .env | Verify exact value: LOCALCONTENT_CONTENT_BACKEND=prisma |
| App not starting (build error) | Prisma client stale | Run 
px prisma generate |
| 404 on all /local-content routes | Auth middleware blocking | Check NEXTAUTH_SECRET and authentication config |
| Arabic text not rendering | Missing Arabic fonts in PDF renderer | Ensure Arabic fonts are bundled in src/lib/export/ |

---

## Related Resources — الموارد ذات الصلة

| Resource | Path |
|----------|------|
| Operator Guide | docs/runbooks/localcontentos-operator-guide.md |
| Disaster Recovery Plan | docs/runbooks/localcontentos-dr-plan.md |
| AI Provider Auth Review | docs/runbooks/localcontentos-ai-auth-review.md |
| Production Support | docs/runbooks/production-support-runbook.md |
| Pilot DB Setup | docs/releases/localcontentos-completion/localcontentos-lc-pilot-db-runbook.md |
| Product Status | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md |
| Route Strategy | docs/source-of-truth/ROUTE_STRATEGY.md |
| Architecture | docs/source-of-truth/AQLIYA_ARCHITECTURE.md |
| Seed Data | prisma/seed-local-content.ts |

---

## Document Record — سجل الوثيقة

| Item | Status |
|------|--------|
| Version | 1.0 |
| Date | 2026-07-01 |
| Author | Documentation Agent |
| Last Review | — |
| Production Claim | NO (pilot runbook) |
