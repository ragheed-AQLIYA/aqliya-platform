# Open-Design Design Lab Policy for AQLIYA

**Status:** Approved  
**Date:** 2026-05-27  
**Authority:** AQLIYA Operating Contract v0.1 + open-design evaluation report  
**File origin:** `docs/open-design-aqliya-design-lab-policy.md`

---

## 1. Decision

**open-design معتمد كأداة تصميم خارجية فقط. ممنوع دمجه داخل AQLIYA.**

- open-design = أداة تصميم سريع (Prototypes, Pitch Decks, Dashboards, Landing Pages)
- OpenCode/Cursor = محوّل هندسي يعيد بناء التصميم داخل AQLIYA وفق نظام المشروع
- الفصل التام بين المجلدات إلزامي

---

## 2. Roles

| الأداة              | الدور                 | المخرجات                                  |
| ------------------- | --------------------- | ----------------------------------------- |
| **open-design**     | Design Lab خارجي      | HTML/PDF/PPTX/Screenshots (مرجع بصري فقط) |
| **OpenCode/Cursor** | Engineering Converter | Next.js components داخل AQLIYA مع الحوكمة |
| **Human Reviewer**  | Gatekeeper            | موافقة على التصميم والادعاءات قبل التحويل |

---

## 3. Allowed

- تصميم landing pages (مهارة: `saas-landing`, `web-prototype`)
- تصميم dashboards (مهارة: `dashboard`)
- تصميم pilot demos (مهارة: `replit-deck`, `web-prototype`)
- تصميم pitch decks (مهارة: `guizang-ppt`, `simple-deck`)
- تصميم mobile prototypes (مهارة: `mobile-app`, `mobile-onboarding`)
- تصميم pricing pages (مهارة: `pricing-page`)
- تصميم blog posts / editorial (مهارة: `blog-post`)
- تصميم تقارير مالية (مهارة: `finance-report`)
- تصدير HTML / PDF / PPTX / ZIP / Screenshots
- استخدام المخرجات كمرجع بصري فقط

---

## 4. Forbidden

- تشغيل open-design داخل مجلد `C:\Users\PC\Documents\Aqliya`
- إضافة أي dependency من open-design إلى `package.json` الخاص بـ AQLIYA
- نقل dependencies من `tools/open-design/node_modules` إلى AQLIYA
- نسخ components أو CSS مباشرة من مخرجات open-design إلى AQLIYA
- استخدام claims تسويقية (مثل "معتمد حكوميًا"، "AI معتمد") من open-design بدون مراجعة
- استخدام open-design لبناء: Auth / RBAC / Governance / Workflows / Audit Trail
- استخدام open-design في قرارات إنتاجية نهائية (مثل الموافقة على تقارير التدقيق)
- تشغيل `pnpm install` أو `pnpm tools-dev` دون موافقة مسبقة (أوامر ثقيلة)

---

## 5. Safe Locations

```
C:\Users\PC\Documents\
├── tools\
│   └── open-design\              ← مستودع open-design المستنسخ
│
├── Aqliya-Lab\                   ← مخرجات التصميم
│   ├── design-exports\           ← صادرات HTML/PDF/PPTX
│   ├── prototypes\               ← نماذج تفاعلية
│   ├── pitch-decks\              ← عروض تقديمية
│   └── screenshots\              ← صور مرجعية
│
└── Aqliya\                       ← سورس المنتج الأساسي فقط
    ├── src\
    ├── prisma\
    ├── components\
    └── ...
```

لا يوجد أي ملف من open-design داخل `Aqliya\`. لا يوجد رابط مباشر. لا يوجد import.

---

## 6. Workflow

```
Step 1: open-design → Visual Prototype / Export
Step 2: Human Review → هوية AQLIYA؟ ادعاءات دقيقة؟ RTL/Arabic؟ تدفق صحيح؟
Step 3: OpenCode/Cursor → Rebuild داخل AQLIYA مع:
         - Next.js components وفق نظام AQLIYA
         - Arabic-first UX + RTL
         - i18n
         - RBAC + Audit Trail
         - Loading/Error/Empty states
         - Tenant isolation
Step 4: Targeted Validation → typecheck + lint + build
```

**ينتهي دور open-design**: بعد اجتياز Step 2 (المراجعة البشرية).  
**يبدأ دور OpenCode**: عند Step 3 (إعادة البناء داخل AQLIYA).

open-design ينتج المرجع البصري. OpenCode/Cursor يعيد بناء المرجع داخل AQLIYA وفق نظام المشروع، المكونات، الحوكمة، RTL، i18n، الصلاحيات، والحالات التشغيلية.

---

## 7. Risk Checklist (قبل كل استخدام)

- [ ] هل التصميم يطابق هوية AQLIYA: Private, Governed, Institutional Intelligence؟
- [ ] هل الادعاءات التسويقية في التصميم دقيقة وقابلة للإثبات؟
- [ ] هل اتجـاه RTL صحيح للعربية؟
- [ ] هل التصميم سيعاد بناؤه يدويًا (لا يُنسخ)؟
- [ ] هل المخرجات ستُحفظ في `Aqliya-Lab\` وليس في `Aqliya\`؟
- [ ] هل جهازي لديه رام كافٍ لتشغيل open-design الآن؟
- [ ] هل الأوامر التي سأشغّلها خفيفة/متوسطة وليست ثقيلة بدون داعٍ؟

---

## 8. Command Classification

| الأمر                                   | الثقل          | ملاحظات RAM                 |
| --------------------------------------- | -------------- | --------------------------- |
| `git clone`                             | خفيف           | < 100MB                     |
| `node --version`                        | خفيف           | < 50MB                      |
| استخدام واجهة open-design web مع Docker | متوسط          | 384MB-512MB (محدد)          |
| `pnpm install`                          | **ثقيل**       | 1-2GB. يحتاج VS Build Tools |
| `pnpm tools-dev run web`                | **ثقيل مستمر** | 500MB-1.5GB مستمر           |
| استخدام OpenCode داخل open-design       | متوسط-ثقيل     | متغير حسب حجم الـ prompt    |
| تصدير النتائج                           | خفيف           | < 50MB                      |

**قاعدة**: لا تشغّل أوامر ثقيلة (`pnpm install`, `pnpm tools-dev`) بدون موافقة مسبقة. استخدم Docker للتشغيل الأولي إذا كان متاحًا.

---

## 9. References

- التقرير الكامل: متضمن في جلسة OpenCode بتاريخ 2026-05-27
- مستودع open-design: `https://github.com/nexu-io/open-design`
- مستودع AQLIYA: `C:\Users\PC\Documents\Aqliya`
- مجلد الأدوات: `C:\Users\PC\Documents\tools\open-design` (مقترح)
- مجلد المخرجات: `C:\Users\PC\Documents\Aqliya-Lab\design-exports` (مقترح)
