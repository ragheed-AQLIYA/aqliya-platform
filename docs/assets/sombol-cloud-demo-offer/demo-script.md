# Sombol — AQLIYA Cloud Demo Script

**Version:** 1.0
**Duration:** 20 minutes
**Language:** Arabic (primary), English (technical terms)
**Audience:** Sombol executive team, IT lead, audit practice lead

---

## Opening Pitch (2 min)

**بسم الله الرحمن الرحيم. أهلاً بكم في Sombol.**

نحن في AQLIYA نقدم منصة ذكاء مؤسسي خاص ومحكوم. ليست هذه منصة SaaS عادية — إنها منصة ذكاء تعمل داخل بيئتكم، على بياناتكم، وتحت حوكمتكم.

ما سنريكم اليوم هو منصة AQLIYA Cloud الجاهزة للاستخدام، والتي تشمل:
- **AuditOS** — نظام التدقيق المالي المحكوم
- **Office AI Assistant** — مساعد العمل الذكي للموظفين
- **سجل تدقيق موحد** عبر جميع الأنظمة

> الذكاء يساعد. الإنسان يقرر. الدليل يحكم.

---

## Demo Agenda

| الوقت | الموضوع |
|---|---|
| 00:00–02:00 | Opening pitch + platform identity |
| 02:00–05:00 | Platform overview — ClientWorkspace, Project, RBAC |
| 05:00–08:00 | AuditOS in workspace context |
| 08:00–12:00 | Office AI Assistant — create task, attach file, generate |
| 12:00–15:00 | Review workflow — approve/reject |
| 15:00–18:00 | PlatformAuditLog — unified visibility |
| 18:00–20:00 | Q&A + next steps |

---

## Demo Storyline

### 1. Platform Overview (2 min)

> "ما سترونه أولاً هو المنصة نفسها — AQLIYA Intelligence Core. هذه الطبقة المشتركة تدير كل شيء: الصلاحيات، سير العمل، الأدلة، وسجل التدقيق."

**Talk track:**
- "عند تسجيل الدخول، تظهر لكم الواجهة الرئيسية."
- "المنصة تدير عدة منتجات — AuditOS هو المنتج الأول، وسنضيف LocalContentOS لاحقاً."
- "مساعد Office AI هو تطبيق مشترك — ليس منتجاً مستقلاً، بل أداة مساعدة لجميع الموظفين."

**Show:**
- Admin page `/settings/platform-organization`
- Sidebar with modules

### 2. Client Workspaces (2 min)

> "Sombol لديها عشرات العملاء. كل عميل له مساحة عمل منفصلة — بياناته، ملفاته، تقاريره — كل شيء معزول."

**Talk track:**
- "مساحة العمل هي الحدود التنظيمية — لا تختلط بيانات العميل أ مع العميل ب."
- "كل مساحة عمل يمكن أن تحتوي على مشاريع متعددة — على سبيل المثال: تدقيق 2025، تحليل محتوى محلي."

**Show:**
- `/settings/workspaces` — workspace list
- Click into a workspace — show linked clients + projects

### 3. AuditOS in Workspace Context (2 min)

> "نظام التدقيق مرتبط بمساحة العمل والمشروع. كل engagement له سياق منصة واضح."

**Talk track:**
- "عند فتح engagement، ترون في الأعلى سياق المنصة — مساحة العمل، المشروع، المؤسسة."
- "هذا يضمن أن كل إجراء داخل engagement مسجل ومرتبط بالعميل الصحيح."

**Show:**
- Open an audit engagement
- Point to the Platform Context Card
- Tabs: mapping, evidence, findings, etc.

### 4. Office AI Assistant — Task Creation (2 min)

> "الآن — مساعد العمل الذكي. ليس chatbot. إنه مساعد منظم، خاضع للحوكمة."

**Talk track:**
- "نفتح /assistant."
- "نختار نوع المهمة — مثلاً، تلخيص مستند."
- "نحدد اللغة — العربية أو الإنجليزية."
- "نربط المهمة بمساحة عميل ومشروع."
- "نضيف تعليمات."
- "ننشئ المهمة."

**Show:**
- `/assistant` page
- Select: document_summary, Arabic, client workspace, project
- Title: "تلخيص تقرير الربع الثالث"
- Click Create Task

### 5. Attach File (2 min)

> "نرفق ملف PDF أو Excel. الملف يُخزّن في مساحة التخزين الآمنة للمنصة."

**Talk track:**
- "الملف يُرفع بآلية آمنة — التحقق من الامتداد، الحجم، والمسار."
- "ملاحظة مهمة: في هذه المرحلة، نستخدم أسماء الملفات كمراجع فقط. تحليل المحتوى قادم في المرحلة التالية."
- "يمكن إرفاق ملفات متعددة."

**Show:**
- Expand "Attach a file"
- Upload or enter metadata
- File appears in Source Files list

### 6. Generate Draft (2 min)

> "نضغط على "توليد مسودة" — يظهر الناتج فوراً."

**Talk track:**
- "المخرجات حاليًا تُنشأ بقوالب ذكية (وليس ذكاء اصطناعي سحابي بعد)."
- "كل مخرجات هي **مسودة أولية** — تحتاج مراجعة بشرية."
- "الملفات المرفقة تظهر في قسم المصادر."
- "إخلاء المسؤولية: المخرجات ليست نهائية."

**Show:**
- Click Generate Draft
- Show output with disclaimer
- Show source file references

### 7. Review and Approve (2 min)

> "الموظف يراجع المسودة — يقبل أو يرفض أو يطلب تعديلاً. لا يُتخذ أي قرار بشكل آلي."

**Talk track:**
- "نضغط على "اعتماد" — يتغير الحالة إلى Approved."
- "يمكن الضغط على "رفض" مع كتابة سبب الرفض."
- "لا يوجد تصدير تلقائي — الإخراج النهائي يتطلب موافقة بشرية."

**Show:**
- Click Approve
- Status changes to approved
- Show the stepper: Draft → Generated → Needs Review → Approved

### 8. PlatformAuditLog Visibility (2 min)

> "كل ما فعلناه مسجل في سجل التدقيق الموحد."

**Talk track:**
- "نفتح /settings/audit-logs."
- "نرى الأحداث: task.created, file.attached, output.created, task.status_changed."
- "السجل يغطي AuditOS و Office AI Assistant."
- "معرّف المنصة، مساحة العمل، المشروع — كلها مسجلة."
- "يمكن التصفية حسب المنتج، النوع، والتاريخ."

**Show:**
- `/settings/audit-logs` page
- Filter by `office_ai_assistant`
- Show: task.created, output.created, status_changed
- Show governance notice

---

## What NOT to Claim

| لا تقل | قل بدلاً من ذلك |
|---|---|
| Office AI Assistant هو chatbot | مساعد عمل ذكي منظم، وليس chatbot |
| الذكاء الاصطناعي يحلل المحتوى | نستخدم أسماء الملفات كمراجع حالياً |
| النظام جاهز للتثبيت الداخلي | Cloud first — النشر الداخلي في المرحلة الثانية |
| التوقيع الإلكتروني متكامل | غير متوفر حالياً |
| النظام يدعم On-Prem | في مرحلة التخطيط — غير جاهز للإنتاج |
| النظام يحلل ملفات PDF/Word | قيد التطوير — غير متوفر بعد |

---

## Questions for Sombol During Demo

1. **ما هي أنواع الملفات الأكثر استخداماً في عملكم اليومي؟** (PDF, Excel, Word?)
2. **كم عدد العملاء النشطين الذين تديرونهم حالياً؟**
3. **هل لديكم حاجة لمساعد Office AI فوراً أم التركيز على AuditOS أولاً؟**
4. **ما هي معايير نجاح المرحلة التجريبية بالنسبة لكم؟**
5. **هل لديكم متطلبات خاصة للامتثال أو الحوكمة؟**
6. **ما هو الجدول الزمني المتوقع لاتخاذ قرار التبني؟**
