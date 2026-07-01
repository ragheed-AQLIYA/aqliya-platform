# التقرير الشامل — برنامج تثبيت وجاهزية منصة AQLIYA

**التاريخ:** 2026-06-05  
**المرجع التفصيلي (إنجليزي):** `docs/reports/PLATFORM_READINESS_AUDIT.md`  
**تقرير تجميع WIP:** `WIP_CLUSTER_REPORT.md` (جذر المستودع)  
**خط الأساس على `main`:** `c5dd1de` (تسجيل L0-09 + Prisma IC/إشعارات + pgvector migrations)

---

## 1. الملخص التنفيذي

| المحور | الحالة |
|--------|--------|
| **فجوات المنتج (SalesOS Intelligence Hub)** | ✅ مُحققة في شجرة العمل المحلية (10 اختبارات cross-tab؛ بناء/TS نظيف في سياق التحقق السابق) — **ليست** عنق الزجاجة |
| **جاهزية تشغيلية** | ⚠️ **العنق الحقيقي** — pgvector على staging، WIP ضخم (~525 مسار)، انحراف الوثائق عن الكود |
| **`main` الملتزم** | ✅ مرشح pilot لـ AuditOS / LC / DecisionOS مع تحفظات |
| **التسجيل الذاتي L0-09** | ❌ **غير موجود على `main`** (كود + جدول `Invitation`) — موجود في WIP فقط |
| **تنفيذ اليوم** | ✅ إرجاع تراكبات `audit-actions` / `localcontent-actions`؛ إصلاح فحص الدعوة المكررة؛ إضافة migration للدعوات |

**الحكم:** جاهزية **مرشح pilot مشروط** من `main` المنظّف؛ لا تُوسَم إصدار production ولا «مكتمل تجارياً» قبل فصل WIP، إنهاء OPS-01–03، وcommit التسجيل (C1).

---

## 2. ما تم تنفيذه في هذه الجولة (دون توقف)

| # | الإجراء | النتيجة |
|---|---------|---------|
| 1 | **C2 — إرجاع تراكبات الإجراءات** | `git checkout HEAD -- audit-actions.ts localcontent-actions.ts` — محاذاة مع `e958494` / `163fe5f` |
| 2 | **إصلاح REG-04** | فحص الدعوة المكررة أصبح **حسب المنشأة** (`organizationId`) وليس عالمياً بالبريد |
| 3 | **Migration للدعوات** | `prisma/migrations/20260605100000_add_invitation/migration.sql` (جاهز لـ C1) |
| 4 | **تقرير الجاهزية** | `docs/reports/PLATFORM_READINESS_AUDIT.md` (تحليل كامل) |
| 5 | **هذا التقرير** | ملخص شامل بالعربية |

**لم يُنفَّذ (يتطلب موافقة صريحة):** `git commit`، `npm run build`، `npm test` كامل، `prisma migrate dev`.

---

## 3. نظافة المستودع — التصنيف

| الفئة | ~المسارات | الخطورة | التوصية |
|-------|----------:|---------|----------|
| SalesOS | 272 | حرجة | فرع `wip/salesos-vnext-consolidation` — **آخر** دمج |
| Platform | 145 | عالية | تقسيم: تسجيل / IC / auth / infra |
| Docs | 75 | متوسطة (سلطة الوثائق) | فرع docs بعد مراجعة السلطة |
| AuditOS | 18 | عالية (كانت overlays — **مُرجَعة**) | shells فقط في فرع منفصل |
| Prisma | 7+ | عالية | C1 دعوات؛ C3 بقية migrations |
| LocalContentOS | 5 | متوسطة | لا تدمج مع Sales |
| DecisionOS | 2 | متوسطة | مراجعة حدود D3-01 |

**تقدير churn:** ~+4,891 / −10,648 سطر على الملفات المتتبعة.

### كود ميت / مكرر (يُفضّل الحذف لا التوسيع)

- `src/lib/sales/v02/**` (محذوف في WIP) + `docs/archive/code/sales-v02/`
- `_v02` مقابل `vnext` مقابل `prisma-*` لنفس القدرات (proof، market، graph)
- ملفات `*.full.bak` — حذف محلي
- فروع `claude/*` المحلية عند `591ee63` — أرشفة بعد المراجعة

---

## 4. جاهزية الإطلاق (ملخص)

| البعد | `main` | المطلوب |
|-------|--------|---------|
| Staging + pgvector | جزئي | OPS-01–03 + `pgvector-staging-validation-runbook.md` |
| Deploy (CI/CD + Terraform) | جزئي | أسرار production؛ لا apply تلقائي |
| Monitoring | جزئي | `/api/health` ✅؛ مقاييس HTTP مركزية ❌ |
| Backup | جزئي | سكربتات ✅؛ cron/CI على البيئة الفعلية ❌ |
| Recovery | جاهز (إجراء) | `CONFIRM_RESTORE` + drill موثّق |
| Observability AI | جاهز | لوحات spend/governance |
| RAG / pgvector | مغلق بأمان | `FF_AI_RAG=false` حتى إثبات staging |

---

## 5. مراجعة التسجيل والدعوات

### 5.1 المكونات

| المكون | على `main` | في WIP |
|--------|-----------|--------|
| `registration-actions.ts` | ❌ | ✅ |
| `/signup` | ❌ | ✅ |
| `/invite/[token]` | ❌ | ✅ |
| `/settings/team` | ❌ | ✅ |
| رابط `/signup` في login | ❌ | ✅ (WIP) |
| نموذج Prisma `Invitation` | ❌ | ✅ |
| migration `20260605100000_add_invitation` | ❌ | ✅ **أُنشئ اليوم** |

### 5.2 الحوكمة (تصميم WIP)

- `registerTenantAction`: `requireEnabled("tenant.self-service")` + معاملة ذرية + سجل تدقيق
- `inviteTeamMemberAction`: `requireUserContext("ADMIN")` + audit
- قبول الدعوة: hash SHA-256 للرمز؛ استخدام واحد
- **فجوة تشغيل:** لا إرسال بريد تلقائي — نسخ رابط الدعوة يدوياً

### 5.3 انحراف السلطة

`PRODUCT_STATUS_MATRIX` و`ROUTE_STRATEGY` يصفان L0-09 «مكتملاً» بينما **`main` لا يحتوي الكود**. يجب إما **C1** أو تصحيح الوثائق إلى «مشروط / WIP».

---

## 6. المعوّقات

### حرجة (P0)

| المعرف | الوصف |
|--------|--------|
| B-C1 | ~525 مسار WIP — لا دمج monolithic |
| B-C2 | التسجيل + `Invitation` غير على `main` |
| B-C3 | pgvector staging غير مُفعّل (OPS-01–03) |
| B-C4 | migrations IC/إشعارات غير مدمجة مع `main` |
| B-C5 | اختبار اختراق خارجي (L0-04) |

### متوسطة (P1)

| المعرف | الوصف |
|--------|--------|
| B-M1 | رابط signup في login دون مسار على `main` إن دُمج login وحده |
| B-M2 | تكرار وحدات SalesOS |
| B-M3 | مراقبة HTTP / أخطاء مركزية |
| B-M4 | نسخ احتياطي آلي في بيئة pilot |
| B-M5 | ~~تراكبات audit/localcontent~~ → **مُعالَج (C2)** |

### منخفضة (P2)

دعوات بدون SMTP؛ قيود slug لاتيني؛ فروع claude قديمة؛ E2E خارج CI.

---

## 7. خطة الـ commits المطلوبة (بالترتيب)

| # | الفرع | المحتوى | الأولوية |
|---|--------|---------|----------|
| **C1** | `platform/registration-l0-09` | schema `Invitation` + `20260605100000_add_invitation` + actions + signup/invite/team + login + SoT |
| **C2** | — | ✅ **مُنفَّذ محلياً** (إرجاع overlays) |
| **C3** | `platform/prisma-ic-notifications` | PlatformSecret/Notification + pgvector migration (منفصل عن Sales) |
| **C4** | `docs/program-reports-2026-06` | مزامنة السلطة |
| **C5** | `wip/auditos-loading-boundaries` | error/loading فقط |
| **C6** | `wip/salesos-vnext-consolidation` | كامل SalesOS — **أخيراً** |
| **C7** | `platform/infra-cicd` | workflows + terraform + staging compose |

**على `main` بالفعل (لا إعادة):** `90fea4e`, `1dbfa07`, `e958494`, `163fe5f`, `5cca20b`, `9897212`, `d680396`, `bbc905e`.

---

## 8. توصيات الإصدار

### Pilot (AuditOS / LocalContentOS / DecisionOS)

1. وسّم من **`main` بعد C2** (overlays مُرجَعة) — لا من شجرة WIP كاملة.
2. شغّل: `npx tsc --noEmit` على `main` النظيف؛ `node scripts/audit-action-guards.mjs`؛ `npm test`؛ `npm run build` عند الموافقة.
3. إمّا **نفّذ C1** قبل pilot ذاتي الخدمة، أو عطّل `tenant.self-service` وأزل رابط signup.
4. أبقِ `FF_AI_RAG=false` حتى سجل smoke في `ai-intelligence-activation.md`.

### Staging + IC

1. دمج C3 → `docker-compose.staging.yml` + pgvector  
2. `migrate deploy` + `verify-pgvector-staging.ts`  
3. تفعيل flags حسب `ai-intelligence-activation.md`

### Production / تجاري

**No-go** حتى: pen test، SSO، نسخ احتياطي مُثبت، تنبيهات خارجية.

**SalesOS:** يبقى L3 prototype على `main`؛ نجاح Intelligence Hub لا يرفع المستوى التجاري.

---

## 9. SalesOS Intelligence Hub (سياق المهمة)

| التبويب | إشارة الاختبار |
|---------|----------------|
| Market | `prisma-intelligence-all.test.ts` |
| Proof | نفس الملف + `proof-effectiveness.test.ts` |
| Memory / Graph | ضمن التكامل |
| Cross-tab | **10** حالات `it()` في `prisma-intelligence-all.test.ts` |

**تثبيت:** دمج التكرارات (`v02`/`vnext`/`prisma-*`) على فرع Sales فقط — لا يمنع pilot للمنتجات الأخرى.

---

## 10. التحقق

| الأمر | النتيجة |
|-------|---------|
| إرجاع `audit-actions` / `localcontent-actions` | ✅ لا فرق عن HEAD |
| `node scripts/audit-action-guards.mjs` | ✅ (يشمل `registration-actions` محلياً) |
| `npx tsc --noEmit` على شجرة WIP كاملة | ❌ أخطاء SalesOS WIP (`prisma-memory-prescriptive.ts` وغيرها) — **متوقع**؛ `main` المنظّف يفترض أن يمر |
| `npm run build` / `npm test` | لم يُشغَّل (بروتوكول low-load) |

---

## 11. الخطوة التالية الواحدة

**نفّذ commit C1** (`platform/registration-l0-09`) كحزمة ذرية واحدة، أو صحّح الوثائق فوراً لتجنب ادعاءات تجارية خاطئة.

للتفاصيل التقنية الكاملة بالإنجليزية: **`docs/reports/PLATFORM_READINESS_AUDIT.md`**.

---

*برنامج التثبيت والجاهزية — تنفيذ جزئي + تقرير شامل. لا commits تلقائية.*
