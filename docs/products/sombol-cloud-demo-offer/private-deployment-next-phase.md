# Sombol — Private / Internal Deployment Next Phase

**Version:** 1.0
**Status:** Forward-looking roadmap — not yet available
**Classification:** Strategic planning document for Sombol

> هذه الوثيقة توضح الخطط المستقبلية لنشر AQLIYA داخل بيئة Sombol. **النشر الداخلي غير متوفر حاليًا كحزمة إنتاج.** الذي نقدمه اليوم هو AQLIYA Cloud.

---

## Why Private Deployment Is Phase 2

**الأسباب:**

| السبب | التوضيح |
|---|---|
| **استقرار المنصة أولاً** | نريد التأكد من أن المنصة مستقرة ومختبرة في Cloud قبل تعقيد النشر الداخلي |
| **متطلبات البنية التحتية** | النشر الداخلي يتطلب خوادم، قاعدة بيانات، تخزين ملفات، وصيانة مستمرة |
| **الأمن** | نحتاج إلى إكمال فحص الملفات، سياسات الاحتفاظ، والنسخ الاحتياطي |
| **الذكاء الاصطناعي المحلي** | Not implemented — Local AI في خارطة الطريق وليس جاهزاً |
| **قابلية النقل** | نحتاج إلى التأكد من أن المنصة تعمل بنفس الطريقة في Cloud و On-Prem |

### Recommended Path

```
Cloud Pilot → Cloud Expansion → Internal Planning → Internal Pilot → Production
```

لا نقفز من Cloud Pilot إلى Internal مباشرة.

---

## Required Prerequisites

### 1. Production Migration Baseline

- [ ] تقييم الفجوات بين ملفات الترحيل وقاعدة البيانات
- [ ] تطبيق SQL الترحيل للإنتاج
- [ ] التحقق من جميع سكربتات التحقق
- [ ] إعداد النسخ الاحتياطي التلقائي (Backup automation)
- [ ] توثيق إجراءات الاستعادة (Restore procedure)

### 2. Storage Provider Decision

| الخيار | Cloud | Internal |
|---|---|---|
| S3 (AWS) | ✅ متوفر | — |
| Azure Blob Storage | قيد التطوير | ✅ مناسب لـ Azure |
| Local filesystem (NAS/SAN) | — | ✅ مناسب للداخلي |
| قرار | استخدم S3 في Cloud | اختر Azure Blob أو Local حسب بيئتكم |

### 3. File Scanning

- [ ] فحص الملفات من الفيروسات (ClamAV أو service خارجي)
- [ ] قبل الإنتاج — يجب أن يكون فحص الملفات إلزامياً
- [ ] غير متوفر حالياً — في خارطة الطريق

### 4. Backup / Restore

- [ ] نسخ احتياطي تلقائي لقاعدة البيانات (PostgreSQL pg_dump)
- [ ] نسخ احتياطي للملفات
- [ ] إجراء استعادة مجدول (اختبار الاستعادة)
- [ ] توثيق RPO و RTO

### 5. Monitoring

- [ ] مراقبة صحة النظام (Health checks)
- [ ] تنبيهات الأعطال
- [ ] مراقبة استخدام الموارد
- [ ] مراقبة أداء الذكاء الاصطناعي

### 6. Local AI (Optional — Future)

- [ ] Ollama / vLLM runtime (غير مطبّق)
- [ ] نماذج محلية (Qwen, Llama, Mistral)
- [ ] Embeddings محلية
- [ ] بدون اتصال إنترنت — تشغيل كامل داخلي

> **ملاحظة:** Local AI ليس جاهزاً. لا يمكننا تقديم موعد محدد حاليًا.

---

## What Would Be Installed Internally

عند اكتمال المتطلبات، سيتم تثبيت المكونات التالية داخل بيئة Sombol:

| المكون | الوصف |
|---|---|
| **Application Server** | Next.js 16 — تطبيق الواجهة ومنطق الأعمال |
| **Database** | PostgreSQL — قاعدة البيانات الرئيسية |
| **File Storage** | NAS / SAN / Azure Blob — تخزين الملفات |
| **AI Runtime** | اختياري — Ollama / vLLM لنماذج الذكاء المحلية |
| **Redis** | اختياري — للتخزين المؤقت |

### Typical Architecture (Internal)

```
[موظف ← متصفح] → [Load Balancer] → [Application Server (Next.js)]
                                         │
                                    [PostgreSQL]
                                         │
                                    [File Storage (NAS/SAN)]
                                         │
                                    [Optional: Local AI (Ollama/vLLM)]
```

> جميع المكونات داخل شبكة Sombol. لا حاجة للإنترنت للتشغيل الأساسي.

---

## What Is Not Ready Yet for Internal Deployment

| العنصر | الحالة | الأثر |
|---|---|---|
| **حزمة On-Prem جاهزة** | غير جاهزة | لا يوجد Docker Compose أو Kubernetes رسمي للإنتاج |
| **Local AI Runtime** | غير مطبّق | لا يمكن تشغيل الذكاء محلياً |
| **File scanning (ClamAV)** | غير مطبّق | لا يوجد فحص فيروسات للملفات المرفوعة |
| **Automatic backup** | غير مطبّق | النسخ الاحتياطي يدوي حاليًا |
| **Health monitoring** | جزئي | يوجد health check للنظام فقط |
| **SSO / LDAP** | غير متوفر | لا يمكن الربط مع Active Directory |
| **ترقية تلقائية** | غير متوفرة | التحديثات يدوية |

---

## Proposed Path: Cloud Pilot → Private Deployment

```
Cloud Pilot (3 months)
    │
    ▼
Cloud Expansion (+3 months)
    │
    ├── Gather requirements for internal
    ├── Deploy Cloud AI when ready
    ├── Test file scanning
    └── Prepare backup automation
    │
    ▼
Internal Planning (+2 months)
    │
    ├── Infrastructure assessment (servers, storage, network)
    ├── Security review
    ├── Data migration plan
    └── Rollback plan
    │
    ▼
Internal Pilot (+3 months)
    │
    ├── Deploy inside Sombol environment
    ├── Migrate selected clients
    ├── Test all workflows
    └── Monitor performance
    │
    ▼
Production Internal
    │
    ├── All clients migrated
    ├── Full backup/restore tested
    ├── Monitoring active
    └── Optional: Local AI when ready
```

> **الإجمالي المقدر:** 12–18 شهراً من بداية Cloud Pilot إلى النشر الداخلي الكامل.

---

## Commercial Model (Internal — Future)

| البند | النموذج المتوقع |
|---|---|
| ترخيص المنصة | سنوي — لكل مؤسسة |
| المستخدمون | غير محدود (داخلي) |
| التخزين | حسب البنية التحتية لـ Sombol |
| الذكاء الاصطناعي | حسب النموذج (Cloud AI أو Local AI) |
| الدعم | عقد دعم سنوي |
| التحديثات | إصدارات نصف سنوية |
| التدريب | حسب الاتفاق |
| الاستشارات | أيام استشارية حسب الحاجة |

---

## Next Steps for Sombol

1. **ابدأ بـ Cloud Pilot** — جرب المنصة بدون التزام مالي
2. **قيّم النتائج بعد 3 شهور** — هل تحقق المنصة أهدافك؟
3. **خطط للتوسع** — متى تحتاج النشر الداخلي؟
4. **تواصل معنا** — سنشاركك تحديثات التطوير أولاً بأول

> AQLIYA ملتزمة ببناء منصة تعمل في Cloud وعلى أرضكم. نبدأ بـ Cloud، ثم ننتقل إلى الداخلي عندما تكون المنصة جاهزة — وعندما تكونون جاهزين.
