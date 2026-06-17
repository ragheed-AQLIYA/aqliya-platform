# Sombol — Current Capabilities and Limitations

**Version:** 1.0
**Status:** Transparency document for Sombol evaluation
**Last updated:** 2026-05-20

> هذه الوثيقة توضح ما هو جاهز للاستخدام الآن، وما هو قيد التطوير، وما هو غير متوفر بعد. الشفافية هي أساس الثقة.

---

## What Is Implemented Now

### Platform Foundation

| القدرة | التفاصيل |
|---|---|
| PlatformOrganization | منصة تنظيمية موحدة تربط جميع المنتجات |
| ClientWorkspace | عزل بيانات العملاء — كل عميل في مساحة منفصلة |
| Project | إدارة المشاريع ضمن مساحة العميل |
| RBAC (per-product) | صلاحيات حسب المنتج والدور |
| Security middleware | حماية جميع مسارات العمل للمستخدمين الموثقين |
| Session-based auth | تسجيل دخول موحد عبر NextAuth |

### AuditOS

| القدرة | التفاصيل |
|---|---|
| Engagement lifecycle | إنشاء، تحرير، مراجعة، اعتماد، نشر |
| Trial balance upload | رفع ميزان المراجعة |
| Account mapping | رسم خرائط الحسابات مع اقتراحات ذكية |
| Financial statements | بيانات مالية مع إيضاحات |
| Evidence vault | إدارة الأدلة — رفع، ربط، تدقيق |
| Findings & recommendations | نتائج التدقيق والتوصيات |
| Review & approval workflow | سير عمل المراجعة والاعتماد |
| PDF/XLSX export | تصدير التقارير |
| Audit trail | سجل تدقيق لكل إجراء |
| Platform context card | سياق المنصة (مساحة العمل، المشروع) في كل Engagement |

### Office AI Assistant

| القدرة | التفاصيل |
|---|---|
| Task creation | 6 أنواع مهام: تلخيص، تحليل، تقرير، عرض، تنفيذي، اجتماع |
| Deterministic draft generation | توليد مسودة بقوالب ذكية — ليس ذكاء اصطناعي سحابي |
| Bilingual output | عربي وإنجليزي |
| File attachment | رفع ملفات (PDF, Word, Excel, CSV, TXT) — تخزين آمن | ✅ متوفر |
| File validation | التحقق من الامتداد، الحجم (10 MB)، الأمان | ✅ متوفر |
| File content extraction (TXT) | استخراج النص من الملفات النصية | ✅ متوفر |
| File content extraction (CSV) | استخراج الرؤوس وعينات البيانات | ✅ متوفر |
| File content extraction (XLSX) | استخراج أسماء الأوراق والأعمدة والبيانات النموذجية | ✅ متوفر |
| File content extraction (DOCX) | استخراج النص من مستندات Word | ✅ متوفر |
| File content extraction (PDF text layer) | استخراج النص من ملفات PDF ذات الطبقة النصية | ✅ متوفر |
| Review workflow | مراجعة، اعتماد، رفض | ✅ متوفر |
| Human review gate | لا يُستخدم أي ناتج دون مراجعة بشرية | ✅ متوفر |
| PlatformAuditLog events | 5 أنواع أحداث مسجلة | ✅ متوفر |

### PlatformAuditLog (Unified Audit)

| القدرة | التفاصيل |
|---|---|
| Unified audit model | سجل تدقيق موحد عبر AuditOS + Office AI Assistant |
| Admin page | /settings/audit-logs مع تصفية حسب المنتج |
| Dual-write AuditOS | جميع أحداث AuditOS مسجلة تلقائياً |
| Dual-write DecisionOS | جميع أحداث DecisionOS مسجلة تلقائياً |
| Workspace/project context | مساحة العمل والمشروع مسجلان مع كل حدث |

---

## What Is Deterministic / Template-Based

| الميزة | النوع | التوضيح |
|---|---|---|
| Draft generation (Office AI) | قوالب ذكية (Deterministic) | ليس ذكاء اصطناعي — نصوص منظمة من قوالب مسبقة الكتابة |
| Account mapping suggestions | قواعد محددة مسبقاً | ليس ذكاء اصطناعي — قواعد مطابقة |
| AI Financial Review | قواعد محددة مسبقاً | تحليل مؤشرات مالية بقواعد محددة |

> جميع المخرجات الحالية تُنتج بقواعد ذكية (Deterministic) وليس بنماذج ذكاء اصطناعي سحابي. هذا يعني أن المخرجات متوقعة وآمنة، لكنها ليست بنفس مرونة الذكاء الاصطناعي التوليدي.

---

## What Is Not Yet Implemented

| الميزة | الحالة | الموعد المتوقع |
|---|---|---|
| تحليل محتوى ملفات PDF الممسوحة ضوئياً (OCR) | غير مطبّق | مرحلة لاحقة |
| Cloud AI (OpenAI, Claude) | غير موصل | المرحلة القادمة (ما بعد Pilot) |
| تحليل محتوى PDF/Word/Excel — كامل مع OCR | OCR فقط غير مطبّق — استخراج النص العادي مطبّق للملفات النصية | مرحلة لاحقة |
| Local AI / On-Prem LLM | غير مطبّق | المرحلة الثالثة |
| نشر داخلي (On-Prem) | غير جاهز | المرحلة الثالثة |
| Air-Gapped mode | غير مطبّق | بعد On-Prem |
| فحص الملفات من الفيروسات | غير مطبّق | قبل الإنتاج |
| Office AI Assistant – chatbot | غير مطبّق (وليس في الخطة) | غير مخطط له |
| Office AI – تلخيص البريد الإلكتروني | غير مطبّق | مرحلة لاحقة |
| LocalContentOS كمساحة عمل كاملة | غير مطبّق | مرحلة لاحقة |
| نماذج مخصصة (Studio) | غير مطبّق | مرحلة لاحقة |
| توقيع إلكتروني | غير متوفر | غير مخطط له |
| SSO / SAML / LDAP | غير متوفر | مرحلة لاحقة |

---

## Security Posture

| الجانب | الوضع الحالي |
|---|---|
| تشفير البيانات في النقل | HTTPS/TLS |
| تشفير التخزين | AES-256 على مستوى قاعدة البيانات |
| عزل المستأجرين (Tenant isolation) | منظمة → مساحة عمل → مشروع — عزل على مستوى الصف |
| إدارة الجلسات | JWT مع صلاحية محدودة |
| حماية المسارات | Middleware على جميع مسارات العمل |
| تسجيل الدخول | كلمة مرور + bcrypt |
| فحص الملفات | غير مطبّق (قيد التطوير) |
| المصادقة متعددة العوامل (MFA) | غير متوفرة |

---

## Data Separation Posture

| المستوى | آلية العزل |
|---|---|
| منظمة (Organization) | platformOrganizationId على كل جدول |
| مساحة عميل (Workspace) | clientWorkspaceId على كل سجل |
| مشروع (Project) | projectId على كل سجل |
| ذكاء اصطناعي (AI) | نطاق الاستعلام محدود بالمشروع |
| سجل التدقيق (Audit) | منظمة ← مساحة عمل ← مشروع |
| الملفات (Files) | مسار التخزين: {org}/{workspace}/{project}/ |
| عبر المنتجات | لا اختلاط بيانات بين AuditOS و Office AI Assistant |

---

## Auditability Posture

| الجانب | الوضع الحالي |
|---|---|
| سجل التدقيق الموحد | ✅ موجود — PlatformAuditLog |
| أحداث AuditOS | ✅ مسجلة تلقائياً |
| أحداث DecisionOS | ✅ مسجلة تلقائياً |
| أحداث Office AI Assistant | ✅ مسجلة تلقائياً |
| تصفية حسب المنتج | ✅ متوفرة |
| علامة الاختبار (test) | ✅ موجودة — metadata.test = true |
| تصدير سجل التدقيق | غير متوفر — قادم |
| الاحتفاظ بالسجلات | غير مطبّق — قادم |

---

## Production Migration Warning

> **هام:** البنية التحتية الحالية للمنصة تم تطويرها في بيئة تطوير محلية. للانتقال إلى الإنتاج، يجب:
>
> 1. إجراء تقييم للفجوات بين ملفات الترحيل (migrations) وقاعدة البيانات الفعلية
> 2. تطبيق SQL الترحيل الموجّه على قاعدة بيانات الإنتاج
> 3. اختبار جميع سكربتات التحقق بعد الترحيل
> 4. إعداد النسخ الاحتياطي التلقائي
>
> راجع `docs/products/aqliya-production-migration-plan.md` للتفاصيل.

---

## No Overclaims

نحن في AQLIYA نلتزم بالشفافية الكاملة:

| لا ندّعي أن | الحقيقة |
|---|---|
| النظام يحلل محتوى الملفات النصية (TXT, CSV, XLSX, DOCX, PDF) | ✅ صحيح — استخراج النص المحلي مطبّق |
| النظام يحلل الصور والمستندات الممسوحة ضوئياً | ❌ غير صحيح — OCR غير مطبّق |
| النظام يدعم الذكاء الاصطناعي السحابي | لا — مخرجات قوالب ذكية (Deterministic) |
| النظام جاهز للنشر الداخلي | لا — Cloud فقط حالياً |
| النظام يدعم Local AI | لا — غير مطبّق |
| Office AI Assistant هو chatbot | لا — مساعد عمل منظم، وليس chatbot |
| جميع المخرجات جاهزة للاستخدام النهائي | لا — كل المخرجات مسودة حتى المراجعة البشرية |

> **مبدأ الثقة:** الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
> **Trust principle:** AI assists. Humans decide. Evidence governs.
