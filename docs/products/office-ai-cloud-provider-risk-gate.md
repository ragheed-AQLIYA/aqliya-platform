# Office AI Assistant — Cloud AI Provider Risk Gate

**Version:** 1.0
**Status:** Risk assessment — not yet approved for implementation
**Classification:** Internal governance document
**Principle:** AI assists. Humans decide. Evidence governs.

---

## Decision Question

> **Should the Cloud AI provider (OpenAI, Claude, etc.) be enabled for Sombol's Office AI Assistant pilot?**

**Current answer: NO — do not enable until this risk gate is passed.**

The Office AI Assistant currently uses **Deterministic (template-based) generation** with **local file text extraction** for TXT, CSV, XLSX, DOCX, and PDF text-layer files. Cloud AI is NOT enabled. Transitioning to Cloud AI requires explicit security, privacy, and governance controls. This document defines the gate.

**Key update (Sprint 7F):** Local file text extraction is now implemented for all text-based formats. This partially unblocks the path to Cloud AI — extracted text CAN now be sent to a Cloud AI provider. However, the following controls are still required before Cloud AI can be enabled. OCR (scanned PDFs) is NOT implemented.

---

## Data Sensitivity Categories

| Category | Definition | Example | Cloud AI Allowed? |
|---|---|---|---|
| **Safe demo data** | Public, synthetic, or mock data with no business value | Demo company names, fake financials | ✅ Allowed |
| **Anonymized client data** | Real data with all PII and identifiers removed | Aggregated metrics without names, IDs, or contacts | ⚠️ Requires controls |
| **Confidential client data** | Real client data with PII intact | Client name, contract value, employee names | ❌ Not allowed |
| **Regulated/sensitive data** | Data subject to compliance (CMA, NDMO, etc.) | Banking records, government data | ❌ Not allowed |

**Current Office AI Assistant scope:** Deterministic generation only — no data leaves the server. Safe demo data and anonymized data are acceptable for demonstration.

---

## Allowed vs Disallowed Data for Cloud AI

### Allowed (with controls)

- Public financial benchmarks
- Anonymized or aggregated metrics
- Synthetic/mock data created for testing
- Data explicitly approved by Sombol's admin for AI processing

### Not Allowed

| Data type | Reason |
|---|---|
| Client names (real) | Could be used for model training if not explicitly excluded |
| Employee names + email | PII — not permitted without explicit governance |
| Contract values | Commercially sensitive |
| Banking details | Highly sensitive — not permitted |
| Government-issued IDs | Regulatory risk |
| User passwords or credentials | Security risk |
| Data from two different clients in same prompt | Cross-client mixing — prohibited |

---

## Required Controls Before Enabling Cloud AI

### 1. Explicit Admin Opt-In

| الشرط | التفاصيل |
|---|---|
| الموافقة الكتابية | مدير المنظمة يوقّع على تفعيل Cloud AI |
| مستوى البيانات المصرّح به | يحدد: "آمن للذكاء الاصطناعي" / "تجريبي فقط" |
| إمكانية الإلغاء | يمكن إيقاف Cloud AI في أي وقت |

### 2. Provider Configuration

| المكون | الشرط |
|---|---|
| مزود معتمد | OpenAI / Azure OpenAI / Anthropic (Claude) |
| نموذج محدد | GPT-4o, Claude 3.5 Sonnet, إلخ |
| منطقة البيانات | يجب أن يتوافق مع متطلبات Sombol (مثلاً Azure OpenAI في السعودية) |
| عدم استخدام البيانات للتدريب | يجب تأكيد كتابي من المزود: "We do not train on API inputs and outputs" |
| مدة الاحتفاظ بالبيانات | 30 يوماً كحد أقصى (أو حسب سياسة المزود) |

### 3. Prompt Logging

- [ ] كل prompt يُسجَّل في AiActionLog أو PlatformAuditLog
- [ ] يتضمن: معرف المستخدم، معرف المهمة، timestamp
- [ ] يتضمن: نسخة الـ prompt (للتدقيق)
- [ ] لا يتضمن: كلمة المرور، التوكنات

### 4. Input / Output Audit Logs

- [ ] PlatformAuditLog يسجل:
  - action: "assistant.generation_started" / "assistant.generation_completed"
  - aiProvider: "cloud_ai"
  - aiModel: "gpt-4o"
  - aiPromptVersion: "summary-v1"
  - aiOutputReviewStatus: "pending" / "accepted" / "rejected"
  - metadata.projectId, metadata.clientWorkspaceId

### 5. File Content Redaction Policy

- [ ] قبل إرسال محتوى الملف إلى Cloud AI:
  - استخراج النص من PDF/Word/Excel (يجب تطوير هذه الميزة أولاً)
  - إزالة المعرفات الشخصية (PII) إن وجدت
  - إرسال النص المستخرج فقط (بدون أسماء ملفات حساسة)
- [ ] إذا لم يتم تطوير استخراج النص → لا يمكن إرسال محتوى الملف إلى Cloud AI

**الوضع الحالي:** استخراج النص من TXT/CSV/XLSX/DOCX/PDF (طبقة نصية) مطبّق محلياً. OCR للمستندات الممسوحة ضوئياً غير مطبّق. استخراج النص متاح للإرسال إلى Cloud AI عند الموافقة، لكن يجب تطبيق إزالة المعرفات الشخصية (PII) قبل الإرسال.

### 6. Workspace / Project Scoping

- [ ] نطاق استعلام AI محدود بـ: clientWorkspaceId + projectId
- [ ] لا يمكن لـ AI الوصول إلى بيانات من مساحة عمل أخرى
- [ ] الفحص: جرب الاستعلام عن بيانات من مساحة عمل مختلفة — يجب أن يفشل

### 7. Human Review

- [ ] جميع مخرجات Cloud AI تمر عبر human review gate
- [ ] لا يتم استخدام أي مخرجات آلياً
- [ ] حالة المراجعة (accepted/rejected) مسجلة في PlatformAuditLog
- [ ] موجود حالياً ✅ — human review gate مطبّق لـ Deterministic

### 8. No Training on Customer Data

- [ ] يجب أن يقدّم مزود Cloud AI تعهداً خطياً: "We do not train on API inputs and outputs"
- [ ] يجب أن يكون هذا التعهد جزءاً من اتفاقية الخدمة مع Sombol
- [ ] إذا لم يقدّم المزود هذا التعهد → لا يمكن استخدام Cloud AI

---

## Recommended MVP Approach

```
                           ╔══════════════════════╗
                           ║  Default: Deterministic ║
                           ╚══════════════════════╝
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
           ╔════════════════════╗         ╔════════════════════╗
           ║  Safe demo data    ║         ║  Real client data  ║
           ║  → Cloud AI opt-in ║         ║  → Deterministic   ║
           ╚════════════════════╝         ╚════════════════════╝
                    │                               │
                    ▼                               ▼
        ╔══════════════════════╗          (File parsing + redaction
        ║  Sombol admin approves║          needed before Cloud AI)
        ║  per workspace        ║
        ╚══════════════════════╝
```

### Phase 1: Deterministic (Current)

- جميع المهام تستخدم DeterministicAIProvider
- آمن لجميع أنواع البيانات
- لا يحتاج إلى موافقة إضافية
- المخرجات متوقعة وآمنة

### Phase 2: Cloud AI Opt-In (Future)

- المهام العادية → Deterministic
- يمكن للمدير تفعيل Cloud AI لكل مساحة عمل على حدة
- فقط البيانات الآمنة وغير الحساسة مسموح بها
- مطلوب: استخراج النص من الملفات + إزالة PII

### Phase 3: Cloud AI Default (Future)

- جميع المهام تستخدم Cloud AI (إذا كان متاحاً)
- مع استمرار وجود Deterministic fallback
- مطلوب: عقد مع مزود + تعهد عدم التدريب على البيانات
- مطلوب: ضوابط إضافية حسب حساسية البيانات

---

## Provider Options

| المزود | المزايا | التحديات | التوفر |
|---|---|---|---|
| **OpenAI (GPT-4o)** | الأكثر انتشاراً، جودة عالية | بيانات تُعالج في USA (افتراضياً) | متاح الآن |
| **Azure OpenAI** | متوفر في السعودية، متوافق مع NDMO | إعداد أطول | متاح بعقد Azure |
| **Anthropic (Claude 3.5)** | أمان عالي، سياسة خصوصية واضحة | أقل انتشاراً في المنطقة | متاح |
| **Google (Gemini)** | تنافسي في التسعير | أقل تجربة مع AQLIYA | قيد التقييم |
| **Local AI (Qwen, Llama)** | 100% داخلي — لا بيانات تغادر المنشأة | غير مطبّق — جودة أقل | المستقبل |

**التوصية:** Azure OpenAI في السعودية لـ Sombol (حسب متطلبات NDMO). OpenAI كخيار بديل للبيانات غير الحساسة.

---

## Risk Matrix

| الخطر | الاحتمال | الأثر | مستوى | التخفيف |
|---|---|---|---|---|
| تسرب بيانات العملاء إلى Cloud AI | متوسط | عالي | **عالي** | لا تفعيل قبل استخراج النص + إزالة PII |
| تدريب النموذج على بيانات العملاء | منخفض | عالي | **عالي** | تعهد خطي من المزود بعدم التدريب |
| تجاوز حد التكلفة الشهري | متوسط | متوسط | **متوسط** | حد إنفاق، مراقبة، تنبيهات |
| latency عالي (Cloud API) | متوسط | منخفض | **منخفض** | fallback تلقائي إلى Deterministic |
| توقف مزود Cloud AI | منخفض | متوسط | **منخفض** | fallback تلقائي + إشعار |
| جودة مخرجات غير متوقعة | متوسط | متوسط | **متوسط** | human review gate إلزامي |
| انتهاك الامتثال (NDMO, GDPR) | منخفض | عالي | **عالي** | Azure OpenAI في المنطقة + تعاقد مناسب |

---

## No-Go Conditions

| الشرط | الإجراء |
|---|---|
| المزود لا يقدّم تعهداً خطياً بعدم التدريب على البيانات | ❌ لا تفعيل |
| استخراج النص من الملفات غير مطبّق | ❌ لا تفعيل لبيانات حقيقية |
| مسؤول Sombol لم يوقّع على الموافقة | ❌ لا تفعيل |
| لا يوجد حد إنفاق أو مراقبة تكلفة | ❌ لا تفعيل |
| Cloud AI غير متاح في منطقة متوافقة (إن لزم) | ❌ لا تفعيل لبيانات خاضعة للتنظيم |
| أي مخرج تم استخدامه دون مراجعة بشرية | ❌ إيقاف فوري — انتهاك للحوكمة |

---

## Implementation Recommendation

1. **لا تفعّل Cloud AI في Pilot.** المرحلة التجريبية الحالية تستخدم Deterministic فقط — آمن، متوقع، بدون مخاوف خصوصية.

2. **أخبر Sombol بذلك بشفافية:**
   - "نستخدم حالياً قوالب ذكية لتوليد المسودات. الذكاء الاصطناعي السحابي قادم في المرحلة التالية."
   - "نحن نأخذ خصوصية بياناتكم على محمل الجد — لا نرسل أي بيانات إلى Cloud AI دون ضوابط مناسبة."

3. **حدّث خارطة الطريق:**
   - Sprint 7B–7F: ✨ **تم الإنجاز** — استخراج TXT/CSV/XLSX/DOCX/PDF محلياً
   - Sprint 8A+: ربط Cloud AI (ضوابط + مزود)
   - Sprint 9A+: تفعيل Cloud AI الاختياري لبيانات آمنة

4. **استخدم التوصية الجديدة لعرض Sombol:**
   - **الآن:** Deterministic + استخراج نصوص الملفات + مراجعة بشرية ← **جاهز للعرض**
   - **الشهر 4–6:** Cloud AI لبيانات غير حساسة (بعد تطبيق الضوابط)
   - **الشهر 7–12:** Cloud AI كامل مع ضوابط + Azure OpenAI في المنطقة (اختياري)
   - **المستقبل:** Local AI للنشر الداخلي

> **الخلاصة:** لا نضحي بالأمان من أجل السرعة. هذا هو مبدأ AQLIYA: الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
> **Bottom line:** We don't sacrifice security for speed. This is the AQLIYA principle: AI assists. Humans decide. Evidence governs.
