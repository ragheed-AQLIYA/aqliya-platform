# AQLIYA Deployment Runbook — GitHub Secrets

> **Version:** 1.0  
> **Last updated:** 2026-06-26  
> **Scope:** All GitHub Secrets required for CI/CD and deployment across all workflows  
> **Maintainer:** Platform Engineering  
> **Language:** Bilingual (Arabic/English) — Arabic is primary for operator workflows

---

## جدول المحتويات | Table of Contents

1. [مقدمة | Introduction](#1-مقدمة--introduction)
2. [ملخص سريع | Quick Reference](#2-ملخص-سريع--quick-reference)
3. [تفصيل الـ Secrets | Secret Details](#3-تفصيل-الـ-secrets--secret-details)
   - 3.1 [AWS مفتاحي — `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`](#31-aws-مفتاحي---aws_access_key_id--aws_secret_access_key)
   - 3.2 [قاعدة البيانات — `DATABASE_URL`](#32-قاعدة-البيانات---database_url)
   - 3.3 [مفتاح المصادقة — `AUTH_SECRET`](#33-مفتاح-المصادقة---auth_secret)
   - 3.4 [رابط NextAuth — `NEXTAUTH_URL`](#34-رابط-nextauth---nextauth_url)
   - 3.5 [اختبارات الدخان — `SMOKE_TEST_TOKEN`](#35-اختبارات-الدخان---smoke_test_token)
   - 3.6 [SCIM مفتاح — `SCIM_API_KEY`](#36-scim-مفتاح---scim_api_key)
   - 3.7 [Vercel النشر على — `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`](#37-vercel-النشر-على---vercel_token-vercel_org_id-vercel_project_id)
4. [إعداد بيئة جديدة من الصفر | Setting Up a Fresh Environment](#4-إعداد-بيئة-جديدة-من-الصفر--setting-up-a-fresh-environment)
5. [نقل المشروع إلى حساب GitHub آخر | Migrating to Another GitHub Account](#5-نقل-المشروع-إلى-حساب-github-آخر--migrating-to-another-github-account)
6. [استراتيجية التدوير | Rotation Strategy](#6-استراتيجية-التدوير--rotation-strategy)
7. [قائمة تفتيش ما قبل الإطلاق | Pre-Launch Checklist](#7-قائمة-تفتيش-ما-قبل-الإطلاق--pre-launch-checklist)
8. [استكشاف الأخطاء وإصلاحها | Troubleshooting](#8-استكشاف-الأخطاء-وإصلاحها--troubleshooting)
9. [الملحق: هيكل الـ Workflows | Appendix: Workflow Structure](#9-الملحق-هيكل-الـ-workflows--appendix-workflow-structure)

---

## 1. مقدمة | Introduction

هذا المستند يوثق جميع **GitHub Secrets** المطلوبة لنشر منصة AQLIYA على AWS (ECS Fargate) والمعاينة على Vercel. الهدف هو ضمان أن إعداد بيئة جديدة أو نقل المشروع إلى حساب GitHub آخر يمكن القيام به دون معرفة ضمنية.

**الـ Workflows المشمولة:**

| الـ Workflow | الملف | البيئة |
|---|---|---|
| Deploy to AWS | `.github/workflows/deploy.yml` | Production + Staging |
| Promote to Production | `.github/workflows/promote.yml` | Production |
| Vercel Preview | `.github/workflows/preview.yml` | Preview (PR) |
| Scheduled DB Backup | `.github/workflows/backup.yml` | Production + Staging |
| CI | `.github/workflows/ci.yml` | CI (يستخدم قيماً وهمية) |

---

## 2. ملخص سريع | Quick Reference

| # | الـ Secret | البيئات | إلزامي | العملية الأكثر خطورة |
|---|---|---|---|---|
| 1 | `AWS_ACCESS_KEY_ID` | Prod + Staging | ✅ Required | Terraform Apply + ECR Push |
| 2 | `AWS_SECRET_ACCESS_KEY` | Prod + Staging | ✅ Required | Terraform Apply + ECR Push |
| 3 | `DATABASE_URL` | Prod + Staging | ✅ Required | Prisma Migrate Deploy |
| 4 | `AUTH_SECRET` | Preview only | ✅ Required (Preview) | Next.js Build |
| 5 | `NEXTAUTH_URL` | Preview only | ✅ Required (Preview) | Next.js Build |
| 6 | `SMOKE_TEST_TOKEN` | Prod + Staging | 🟡 Optional | Smoke Test |
| 7 | `SCIM_API_KEY` | Prod + Staging | 🟡 Optional | Smoke Test (SCIM) |
| 8 | `VERCEL_TOKEN` | Preview only | ✅ Required (Preview) | Vercel Deploy |
| 9 | `VERCEL_ORG_ID` | Preview only | ✅ Required (Preview) | Vercel Deploy |
| 10 | `VERCEL_PROJECT_ID` | Preview only | ✅ Required (Preview) | Vercel Deploy |

**عدد الـ Secrets الإجمالي: 10**  
**عدد الـ Secrets الإلزامية للنشر على AWS: 3** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DATABASE_URL`)

---

## 3. تفصيل الـ Secrets | Secret Details

---

### 3.1 AWS مفتاحي — `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| **المصدر** | AWS IAM Console → Users → `<github-actions-deployer>` → Security credentials → Create access key |
| **صلاحيات IAM المطلوبة** | `AmazonECS_FullAccess`, `AmazonEC2FullAccess`, `AmazonS3FullAccess`, `AmazonECR-FullAccess`, `AWSCloudFormationFullAccess`, `IAMReadOnlyAccess`, `AmazonRDSFullAccess`, `AmazonElastiCacheFullAccess`, `CloudWatchLogsFullAccess`, `AWSCertificateManagerFullAccess`, `AmazonRoute53FullAccess` |
| **حيث يُستخدم** | **deploy.yml** ← jobs: `terraform`, `build-and-push`, `deploy`<br>**promote.yml** ← jobs: `promote`, `rollback` |
| **الخدمات المستهدفة** | Terraform (S3 backend, DynamoDB locks, AWS resources)، ECR (Docker login/push)، ECS (update-service)، S3، RDS، ElastiCache، Route53، CloudWatch |
| **البيئة** | Production + Staging |
| **الإلزام** | ✅ **Required** — بدونه تتوقف جميع عمليات AWS |
| **طريقة الاختبار** | تشغيل `deploy.yml` يدوياً من `workflow_dispatch` على staging — يجب أن تنجح `terraform plan` و `ECR login` |
| **مدة الصلاحية** | غير محدودة (Access Keys طويلة الأمد). يُوصى بالتدوير كل 90 يوماً |
| **تاريخ آخر تدوير** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# 1. إنشاء مفتاح جديد في AWS IAM Console
#    AWS Console → IAM → Users → github-actions-deployer → Create access key

# 2. تحديث GitHub Secrets
#    Settings → Secrets and variables → Actions
#    - تحديث AWS_ACCESS_KEY_ID
#    - تحديث AWS_SECRET_ACCESS_KEY

# 3. التحقق
#    تشغيل deploy.yml على staging workflow_dispatch
#    أو تشغيل هذا الأمر محلياً باستخدام المفاتيح الجديدة:
#    aws sts get-caller-identity

# 4. (بعد التأكيد) حذف المفتاح القديم من AWS IAM Console
```

#### خطة التحسين الموصى بها

استبدال المفاتيح طويلة الأمد بـ **OIDC** (GitHub OpenID Connect):

```yaml
# في deploy.yml و promote.yml
permissions:
  id-token: write
  contents: read

# استبدال aws-access-key-id / aws-secret-access-key بـ:
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/aqliya-github-actions
    aws-region: me-south-1
```

هذا يلغي الحاجة لتخزين أي مفتاح AWS في GitHub Secrets تماماً.

---

### 3.2 قاعدة البيانات — `DATABASE_URL`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `DATABASE_URL` |
| **المصدر** | AWS RDS Console → Database → `aqliya-{production,staging}` → Connectivity → Endpoint + Port<br>Username/Password من AWS Secrets Manager أو من `db_password` في Terraform output |
| **صيغة القيمة** | `postgresql://<user>:<password>@<rds-endpoint>:5432/aqliya` |
| **حيث يُستخدم** | **deploy.yml** ← jobs: `migrate`, `post-deploy`<br>**preview.yml** ← job: `deploy-preview` (build-time)<br>**backup.yml** ← jobs: `backup`, `verify` |
| **البيئة** | Production + Staging + Preview |
| **الإلزام** | ✅ **Required** — تفشل جميع عمليات الترحيل والنسخ الاحتياطي والتحقق بدونه |
| **طريقة الاختبار** | 1. تشغيل `deploy.yml` يدوياً — يجب أن تنجح `prisma migrate deploy`<br>2. تشغيل `backup.yml` — يجب إنتاج ملف `.sql` في Artifacts<br>3. تحقق: `npx prisma migrate status` يجب أن يعرض `"All migrations have been applied successfully"` |
| **مدة الصلاحية** | بكلمة مرور RDS: غير محدودة (تتغير فقط عند إعادة تعيين كلمة مرور مستخدم RDS الرئيسي) |
| **تاريخ آخر تدوير** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# 1. إعادة تعيين كلمة مرور مستخدم RDS الرئيسي
#    AWS Console → RDS → Database → Modify → New master password
#    أو عبر AWS CLI:
#    aws rds modify-db-instance \
#      --db-instance-identifier aqliya-production \
#      --master-user-password "<NEW_PASSWORD>" \
#      --apply-immediately

# 2. تحديث DATABASE_URL في GitHub Secrets
#    Settings → Secrets and variables → Actions
#    الصيغة: postgresql://postgres:<NEW_PASSWORD>@<endpoint>:5432/aqliya

# 3. التحقق
#    تشغيل backup.yml يدوياً: يجب أن ينتج back-up بنجاح
#    تشغيل deploy.yml يدوياً على staging: prisma migrate status

# 4. تحديث أي تطبيقات أو خدمات أخرى تستخدم نفس قاعدة البيانات
```

---

### 3.3 مفتاح المصادقة — `AUTH_SECRET`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `AUTH_SECRET` |
| **المصدر** | يُنشأ محلياً باستخدام: `openssl rand -base64 32` |
| **متطلبات القيمة** | 32 حرفاً على الأقل، Base64 مشفر. يجب أن يطابق قيمة `NEXTAUTH_SECRET` في بيئة ECS |
| **حيث يُستخدم** | **preview.yml** ← job: `deploy-preview` (أثناء `npm run build`) |
| **البيئة** | Preview (PR) فقط |
| **الإلزام** | ✅ **Required** — بدونه يفشل Build على Vercel Preview<br>❌ غير مطلوب لـ `deploy.yml` لأن ECS Task Definition يقرأ `AUTH_SECRET` من بيئة الحاوية مباشرة |
| **طريقة الاختبار** | فتح PR → التأكد أن Vercel Preview build يمر بنجاح |
| **مدة الصلاحية** | غير محدودة نظرياً، لكن يُوصى بالتدوير كل 180 يوماً أو فور الاشتباه بتسريب |
| **تاريخ آخر تدوير** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# 1. إنشاء قيمة جديدة
openssl rand -base64 32

# 2. تحديث GitHub Secret
#    Settings → Secrets and variables → Actions → AUTH_SECRET

# 3. تحديث ECS Task Definition (بيئة الإنتاج)
#    - تعديل متغير البيئة AUTH_SECRET في task definition
#    - إنشاء مراجعة جديدة ونشرها

# 4. التحقق
#    - تسجيل الخروج ثم تسجيل الدخول — يجب أن تعمل الجلسات الجديدة
#    - الجلسات القديمة ستبطل (المستخدمون سيحتاجون إعادة تسجيل الدخول)
```

> **تنبيه:** تدوير `AUTH_SECRET` يبطل جميع جلسات المستخدمين الحالية. يُنصح بجدولة ذلك خارج ساعات العمل وإبلاغ المستخدمين مسبقاً.

---

### 3.4 رابط NextAuth — `NEXTAUTH_URL`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `NEXTAUTH_URL` |
| **المصدر** | عنوان Vercel Preview URL أو البيئة. يُستخرج من إعدادات Vercel Project |
| **صيغة القيمة** | `https://<project>-<id>.vercel.app` (لـ Preview) |
| **حيث يُستخدم** | **preview.yml** ← job: `deploy-preview` (أثناء `npm run build`) |
| **البيئة** | Preview (PR) فقط |
| **الإلزام** | ✅ **Required** — مطلوب لـ NextAuth/build-time |
| **طريقة الاختبار** | فتح PR → التحقق أن Vercel Preview يعمل والمصادقة لا تظهر أخطاء |
| **مدة الصلاحية** | تتغير مع كل Preview Deployment (قيمة ثابتة في الـ Secret لكن يجب أن تطابق تكوين Vercel) |
| **تاريخ آخر تحديث** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# فقط إذا تغير عنوان Vercel Project:
# 1. الحصول على عنوان Vercel Preview الجديد من Vercel Dashboard
#    Settings → Projects → AQLIYA → Domains

# 2. تحديث GitHub Secret
#    Settings → Secrets and variables → Actions → NEXTAUTH_URL
```

---

### 3.5 اختبارات الدخان — `SMOKE_TEST_TOKEN`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `SMOKE_TEST_TOKEN` |
| **المصدر** | يُنشأ يدوياً: `openssl rand -hex 32` أو أي token عشوائي | |
| **الغرض** | يُمرَّر كـ `AUTH_TOKEN` لـ `scripts/platform/post-deploy-smoke.mjs` لاختبار نقاط النهاية المحمية |
| **حيث يُستخدم** | **deploy.yml** ← job: `post-deploy`<br>**promote.yml** ← job: `smoke-test` |
| **البيئة** | Production + Staging |
| **الإلزام** | 🟡 **Optional** — القيمة الافتراضية هي سلسلة فارغة. إذا لم يُضبط، smoke tests قد تفشل إذا كانت نقاط النهاية تتطلب مصادقة |
| **طريقة الاختبار** | تشغيل `deploy.yml` → مراقبة job `post-deploy` → Smoke test يجب أن يعود `exit 0` |
| **مدة الصلاحية** | غير محدودة |
| **تاريخ آخر تدوير** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# 1. إنشاء token جديد
openssl rand -hex 32

# 2. إذا كان token مخزناً أيضاً في بيئة ECS:
#    - تحديث ECS Task Definition
#    - أو تحديث Parameter Store / Secrets Manager إذا كان app يقرأه

# 3. تحديث GitHub Secret
#    Settings → Secrets and variables → Actions → SMOKE_TEST_TOKEN

# 4. التحقق
#    تشغيل deploy.yml على staging workflow_dispatch
```

---

### 3.6 SCIM مفتاح — `SCIM_API_KEY`

| البند | القيمة |
|---|---|
| **الاسم في GitHub** | `SCIM_API_KEY` |
| **المصدر** | يُنشأ يدوياً: `openssl rand -hex 32` أو يشتق من تكوين موفر SCIM |
| **الغرض** | يُمرَّر لـ `post-deploy-smoke.mjs` لاختبار نقاط نهاية SCIM (`/api/scim/v2/*`) |
| **حيث يُستخدم** | **deploy.yml** ← job: `post-deploy` |
| **البيئة** | Production + Staging |
| **الإلزام** | 🟡 **Optional** — القيمة الافتراضية `''`. إذا لم يُضبط، تُتجاوز اختبارات SCIM |
| **طريقة الاختبار** | تشغيل `deploy.yml` → التحقق أن اختبارات SCIM في smoke test تمر |
| **مدة الصلاحية** | غير محدودة |
| **تاريخ آخر تدوير** | غير موثّق |

#### إجراء التدوير (Rotation)

```bash
# 1. إنشاء مفتاح جديد
openssl rand -hex 32

# 2. تحديث:
#    - GitHub Secret: Settings → Secrets → SCIM_API_KEY
#    - تطبيق SCIM provider (Azure AD / Okta) إذا كان متصلاً

# 3. التحقق
#    تشغيل smoke test يدوياً على staging
```

> **ملاحظة:** SCIM ليس مفعّلاً بالكامل بعد. هذا الـ Secret يصبح إلزامياً فقط عند تفعيل SCIM provisioning.

---

### 3.7 Vercel النشر على — `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

| البند | `VERCEL_TOKEN` | `VERCEL_ORG_ID` | `VERCEL_PROJECT_ID` |
|---|---|---|---|
| **المصدر** | Vercel Dashboard → Settings → Tokens → Create | Vercel Dashboard → Settings → General → Team ID | Vercel Dashboard → Project → Settings → Project ID |
| **حيث يُستخدم** | `preview.yml` ← `amondnet/vercel-action@v25` | `preview.yml` ← `amondnet/vercel-action@v25` | `preview.yml` ← `amondnet/vercel-action@v25` |
| **البيئة** | Preview (PR) | Preview (PR) | Preview (PR) |
| **الإلزام** | ✅ Required | ✅ Required | ✅ Required |
| **طريقة الاختبار** | فتح PR جديد → يجب نشر Vercel Preview تلقائياً | نفسه | نفسه |
| **مدة الصلاحية** | حسب نوع Token: يمكن أن تكون غير محدودة أو محددة المدة | ثابت (إلا إذا تغير الفريق) | ثابت (إلا إذا أُنشئ مشروع جديد) |
| **تاريخ آخر تدوير** | غير موثّق | غير موثّق | غير موثّق |

#### إجراء التدوير (Rotation)

**`VERCEL_TOKEN`:**

```bash
# 1. Vercel Dashboard → Settings → Tokens
# 2. حذف الـ token القديم
# 3. إنشاء token جديد مع النطاقات:
#    - deployments (read + write)
#    - projects (read)
#    - teams (read)
# 4. نسخ القيمة
# 5. Settings → Secrets → VERCEL_TOKEN → Update
# 6. التحقق: فتح PR جديد والتأكد من نشر Preview
```

**`VERCEL_ORG_ID` و `VERCEL_PROJECT_ID`:**

لا تحتاج تدويراً دورياً. تتغير فقط إذا:
- انتقل المشروع إلى فريق Vercel آخر ← تحديث `VERCEL_ORG_ID`
- أُنشئ مشروع Vercel جديد ← تحديث `VERCEL_PROJECT_ID`

---

## 4. إعداد بيئة جديدة من الصفر | Setting Up a Fresh Environment

هذا القسم يشرح كيفية إعداد النشر على حساب GitHub جديد (مثلاً: fork، أو استضافة لدى عميل، أو بيئة تطوير منفصلة).

### الخطوة 1 — إنشاء المفاتيح في AWS

```bash
# 1. إنشاء مستخدم IAM
#    AWS Console → IAM → Users → Create user
#    الاسم المقترح: github-actions-deployer

# 2. إرفاق السياسات التالية (أو إنشاء سياسة مخصصة بأقل الصلاحيات الممكنة):
#    - AmazonECS_FullAccess
#    - AmazonEC2FullAccess
#    - AmazonS3FullAccess
#    - AmazonECR-FullAccess
#    - AWSCloudFormationFullAccess
#    - IAMReadOnlyAccess
#    - AmazonRDSFullAccess
#    - AmazonElastiCacheFullAccess
#    - CloudWatchLogsFullAccess
#    - AWSCertificateManagerFullAccess
#    - AmazonRoute53FullAccess

# 3. إنشاء Access Key
#    Security credentials → Create access key → Other → Create

# 4. حفظ AWS_ACCESS_KEY_ID و AWS_SECRET_ACCESS_KEY
```

### الخطوة 2 — إنشاء قاعدة البيانات

```bash
# 1. إنشاء RDS PostgreSQL 16 (أو استخدام Terraform مباشرة)
#    - aws rds create-db-instance (أو terraform apply)

# 2. حفظ endpoint و master password

# 3. تكوين DATABASE_URL:
#    postgresql://postgres:<password>@<endpoint>:5432/aqliya
```

### الخطوة 3 — إضافة GitHub Secrets

اذهب إلى: `GitHub Repository → Settings → Secrets and variables → Actions → New repository secret`

| الـ Secret | القيمة |
|---|---|
| `AWS_ACCESS_KEY_ID` | من AWS IAM (الخطوة 1) |
| `AWS_SECRET_ACCESS_KEY` | من AWS IAM (الخطوة 1) |
| `DATABASE_URL` | `postgresql://postgres:<PASS>@<RDS_ENDPOINT>:5432/aqliya` |
| `SMOKE_TEST_TOKEN` | (اختياري) `openssl rand -hex 32` |
| `SCIM_API_KEY` | (اختياري) `openssl rand -hex 32` |

### الخطوة 4 — إعداد Vercel (لـ Preview)

```bash
# 1. استيراد المشروع إلى Vercel
#    vercel link

# 2. استخراج المعرفات
#    VERCEL_ORG_ID:  cat .vercel/project.json | jq -r '.orgId'
#    VERCEL_PROJECT_ID: cat .vercel/project.json | jq -r '.projectId'

# 3. إنشاء Vercel Token
#    Vercel Dashboard → Settings → Tokens → Create

# 4. إضافة إلى GitHub Secrets
```

### الخطوة 5 — التأكد من Terraform State

```bash
# 1. إنشاء S3 bucket لحالة Terraform (إذا لم يكن موجوداً):
#    aws s3 mb s3://aqliya-terraform-state --region me-south-1

# 2. إنشاء DynamoDB table للأقفال:
#    aws dynamodb create-table \
#      --table-name aqliya-terraform-locks \
#      --attribute-definitions AttributeName=LockID,AttributeType=S \
#      --key-schema AttributeName=LockID,KeyType=HASH \
#      --billing-mode PAY_PER_REQUEST
```

### الخطوة 6 — اختبار التكامل

```bash
# 1. تشغيل CI: دفع commit إلى staging branch
# 2. تشغيل deploy.yml: من Actions tab
# 3. التحقق:
#    - Terraform init/plan/apply ينجح
#    - Docker image يدفع إلى ECR
#    - Prisma migrations تنفذ
#    - ECS service يتحدّث
```

---

## 5. نقل المشروع إلى حساب GitHub آخر | Migrating to Another GitHub Account

### قائمة النقل

- [ ] إنشاء مستخدم IAM جديد في حساب AWS الهدف
- [ ] إنشاء Access Keys
- [ ] إنشاء RDS PostgreSQL (أو ترحيل قاعدة البيانات الموجودة)
- [ ] إضافة Secrets الـ 10 إلى GitHub Actions Secrets في المستودع الجديد
- [ ] تحديث Terraform backend (S3 bucket و DynamoDB table) إذا كان الـ AWS account مختلفاً
- [ ] تحديث `container_image` في `terraform.tfvars` بحساب AWS الجديد
- [ ] تحديث `domain_name` في `terraform.tfvars` إذا تغير النطاق
- [ ] ربط Vercel project جديد (أو ربط المشروع الحالي)
- [ ] تحديث `VERCEL_ORG_ID` و `VERCEL_PROJECT_ID` و `VERCEL_TOKEN`
- [ ] تشغيل `deploy.yml` يدوياً للتحقق
- [ ] تشغيل `backup.yml` للتحقق من اتصال قاعدة البيانات
- [ ] فتح PR للتحقق من Vercel Preview

### الـ Secrets التي يجب تغييرها حتماً

| الـ Secret | السبب |
|---|---|
| `AWS_ACCESS_KEY_ID` | حساب AWS جديد |
| `AWS_SECRET_ACCESS_KEY` | حساب AWS جديد |
| `DATABASE_URL` | RDS endpoint + password جديد |
| `VERCEL_TOKEN` | Vercel account جديد |
| `VERCEL_ORG_ID` | Team ID جديد |
| `VERCEL_PROJECT_ID` | Project ID جديد (أو موجود) |

### الـ Secrets التي يمكن نقلها كما هي

| الـ Secret | السبب |
|---|---|
| `AUTH_SECRET` | يمكن إعادة استخدامه (لكن يُوصى بتجديده) |
| `SMOKE_TEST_TOKEN` | يمكن إعادة استخدامه |
| `SCIM_API_KEY` | يمكن إعادة استخدامه |
| `NEXTAUTH_URL` | سيتغير عنوان Vercel Preview URL |

---

## 6. استراتيجية التدوير | Rotation Strategy

### جدول التدوير الموصى به

| الـ Secret | الدورة | التذكير | المسؤول |
|---|---|---|---|
| `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | كل 90 يوماً | GitHub Scheduled Reminder | Platform Engineering |
| `DATABASE_URL` | كل 180 يوماً أو فور تغيير كلمة مرور RDS | SRE On-call | SRE / DBA |
| `AUTH_SECRET` | كل 180 يوماً أو عند الاشتباه بالتسريب | Security Alert | Security Team |
| `SMOKE_TEST_TOKEN` | سنوياً | — | Platform Engineering |
| `SCIM_API_KEY` | سنوياً | — | Platform Engineering |
| `VERCEL_TOKEN` | سنوياً | — | Platform Engineering |
| `VERCEL_ORG_ID` | عند تغيير الفريق | — | Admin |
| `VERCEL_PROJECT_ID` | عند إنشاء مشروع جديد | — | Admin |
| `NEXTAUTH_URL` | عند تغيير عنوان Vercel | — | Admin |

### خطة الاستجابة للتسريب (Leak Response)

```bash
# 1. إبطال المفتاح المسرَّب فوراً
#    AWS:    AWS Console → IAM → Users → → Make inactive / Delete
#    Vercel: Dashboard → Settings → Tokens → Delete

# 2. إنشاء مفتاح جديد و update GitHub Secret

# 3. مراجعة logs:
#    AWS:   CloudTrail → LookupEvents (بحث بـ ARN المستخدم المسرَّب)
#    Vercel: Audit Log (للمشتركين في Enterprise)

# 4. إخطار الفريق وإبلاغ الإدارة
```

---

## 7. قائمة تفتيش ما قبل الإطلاق | Pre-Launch Checklist

- [ ] **`AWS_ACCESS_KEY_ID`**: موجود وصحيح — اختبره بـ `aws sts get-caller-identity`
- [ ] **`AWS_SECRET_ACCESS_KEY`**: موجود وصحيح
- [ ] **`DATABASE_URL`**: موجود — اختبره يدوياً بتشغيل `backup.yml` workflow
- [ ] **`AUTH_SECRET`**: موجود — مطلوب لـ Vercel Preview
- [ ] **`NEXTAUTH_URL`**: موجود — مطلوب لـ Vercel Preview
- [ ] **`SMOKE_TEST_TOKEN`**: موجود (اختياري لكن موصى به)
- [ ] **`VERCEL_TOKEN`**: موجود وصالح
- [ ] **`VERCEL_ORG_ID`**: موجود ويطابق الفريق الحالي
- [ ] **`VERCEL_PROJECT_ID`**: موجود ويطابق المشروع الحالي
- [ ] **Terraform backend S3 bucket**: موجود (`aqliya-terraform-state`)
- [ ] **Terraform DynamoDB lock table**: موجودة (`aqliya-terraform-locks`)
- [ ] **ECR Repository منشأ**: `aqliya/production/app` و `aqliya/staging/app`
- [ ] **ECS Cluster**: `aqliya-production-cluster` و `aqliya-staging-cluster`
- [ ] **RDS PostgreSQL**: متاح وقابل للاتصال
- [ ] **Vercel project**: مستورد ومتصل بالمستودع

---

## 8. استكشاف الأخطاء وإصلاحها | Troubleshooting

### 8.1 Terraform: "AccessDenied" أو "Unauthorized"

```
Error: configuring Terraform AWS Provider: failed to refresh cached credentials
```

| السبب | الحل |
|---|---|
| `AWS_ACCESS_KEY_ID` قديم أو غير صحيح | تحديث الـ Secret في GitHub Settings |
| `AWS_SECRET_ACCESS_KEY` غير صحيح | تحديث الـ Secret |
| المفتاح ملغي في AWS | التحقق من AWS IAM Console → Users → Access keys |
| الـ IAM user ليس لديه صلاحية للـ S3 backend | إضافة `AmazonS3FullAccess` أو سياسة مخصصة للـ S3 bucket |

### 8.2 ECR Push: "denied: Your authorization token has expired"

```
denied: Your authorization token has expired
denied: Your authorization token has expired
```

| السبب | الحل |
|---|---|
| ECR login token منتهي | يتم تجديده تلقائياً في `amazon-ecr-login@v2` — إذا استمر المشكلة، تحقق من صلاحيات ECR |
| IAM policy لا تشمل `ecr:GetAuthorizationToken` | إضافة `ecr:GetAuthorizationToken` إلى IAM policy |

### 8.3 Prisma Migrate: "Can't reach database server"

```
Error: Can't reach database server
`postgresql://postgres:***@<host>:5432/aqliya`
```

| السبب | الحل |
|---|---|
| `DATABASE_URL` غير صحيح | التحقق من endpoint + port + username + password |
| RDS Security Group لا يسمح بالاتصال من GitHub Actions runners | إضافة عنوان IP العام لـ GitHub Actions runners مؤقتاً (أو استخدام Bastion/VPN) |
| RDS في وضع `stopped` | تشغيل RDS instance يدوياً |

> **ملاحظة مهمة:** GitHub Actions runners لا يمكنها الوصول إلى RDS في VPC خاص مباشرةً. هذا يعني أن RDS يجب أن يكون accessible من الإنترنت (مع قيود IP صارمة) أو استخدام **ECS Task** داخل VPC لتشغيل Prisma migrations. الحل البديل هو استخدام **AWS CodeBuild** داخل VPC.

### 8.4 Vercel Preview: Build فشل

| السبب | الحل |
|---|---|
| `AUTH_SECRET` غير موجود | إضافته إلى GitHub Secrets |
| `DATABASE_URL` غير موجود | إضافته إلى GitHub Secrets — مطلوب في build-time لـ Prisma generate |
| `NEXTAUTH_URL` غير صحيح | تحديثه بعنوان Vercel Preview URL الصحيح |

### 8.5 Smoke Test: فشل

| السبب | الحل |
|---|---|
| `SMOKE_TEST_TOKEN` غير مضبوط والنقاط النهائية تتطلب مصادقة | تعيين `SMOKE_TEST_TOKEN` بقيمة صحيحة |
| الخدمة لم تنتهِ من التحديث | زيادة `sleep 60` أو التحقق يدوياً من ECS service status |
| نقاط النهاية غير متاحة | التحقق من ECS task health → CloudWatch logs |

---

## 9. الملحق: هيكل الـ Workflows | Appendix: Workflow Structure

### 9.1 deploy.yml — تدفق النشر الرئيسي

```
test (اختبارات + TypeScript)
  ├── terraform (Terraform Init + Validate + Plan)
  ├── build-and-push (Docker build + ECR push + ECS update)
  └── migrate (Prisma Migrate Deploy)
       └── deploy (Terraform Apply باستخدام الـ Plan المرفوع)
            └── post-deploy (انتظار + Audit integrity + Smoke test)
```

### 9.2 promote.yml — ترقية staging → production

```
validate-staging (Health check + Security headers)
  └── promote (تأكيد وجود الصورة في ECR + تحديث ECS production)
       └── smoke-test (Post-deploy smoke test)
            └── rollback [if failure] (التراجع إلى task definition السابق)
```

### 9.3 preview.yml — معاينة PR على Vercel

```
deploy-preview (Install → Prisma generate → Type-check → Build → Vercel Deploy)
```

### 9.4 backup.yml — النسخ الاحتياطي المجدول

```
backup (تشغيل backup.mjs → رفع SQL artifact)
  └── verify (prisma migrate status على الـ backup)
```

### 9.5 خريطة Secrets → Jobs

| Secret | test | terraform | build-and-push | migrate | deploy | post-deploy | promote | smoke-test | rollback | preview | backup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `AWS_ACCESS_KEY_ID` | | ✅ | ✅ | | ✅ | | ✅ | | ✅ | | |
| `AWS_SECRET_ACCESS_KEY` | | ✅ | ✅ | | ✅ | | ✅ | | ✅ | | |
| `DATABASE_URL` | | | | ✅ | | ✅ | | | | ✅ | ✅ |
| `AUTH_SECRET` | | | | | | | | | | ✅ | |
| `NEXTAUTH_URL` | | | | | | | | | | ✅ | |
| `SMOKE_TEST_TOKEN` | | | | | | ✅ | | ✅ | | | |
| `SCIM_API_KEY` | | | | | | ✅ | | | | | |
| `VERCEL_TOKEN` | | | | | | | | | | ✅ | |
| `VERCEL_ORG_ID` | | | | | | | | | | ✅ | |
| `VERCEL_PROJECT_ID` | | | | | | | | | | ✅ | |

---

## سجل التغييرات | Changelog

| التاريخ | الإصدار | التغيير |
|---|---|---|
| 2026-06-26 | 1.0 | إنشاء المستند — توثيق جميع GitHub Secrets الـ 10 مع مصادرها، تدويرها، اختبارها، وخطة النقل |
