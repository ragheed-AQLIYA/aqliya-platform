# AuditOS v0.1 — Live Walkthrough Script

**Date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-pilot-baseline-2026-05-28`  
**Audience:** External operator + AQLIYA facilitator  
**Tone:** Professional, proof-driven, no hype  
**Duration:** ~60–90 minutes

---

## Before You Start

- [ ] Environment health green (`/api/health`)
- [ ] Browser hard-refreshed if app redeployed today
- [ ] Login credentials confirmed (not default seed passwords for external org)
- [ ] Screen share tested (RTL layout visible)
- [ ] Facilitator has friction log ready
- [ ] Technical backup on standby (deployment only — not to override operator clicks)

---

## 1. Opening (3 minutes)

> شكراً لانضمامكم. اليوم سنمر على **AuditOS** — مساحة تدقيق مالية محكومة ضمن منصة AQLIYA.
>
> مبدأنا: **الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.**
>
> ما ترونه اليوم هو **خط أساس pilot v0.1** — ليس منصة enterprise معتمدة ولا رأي تدقيق نهائي.
>
> هدفنا: إظهار سير العمل من ميزان المراجعة حتى التصدير وسجل التدقيق، مع بوابات مراجعة واعتماد بشرية.
>
> توقفوا في أي خطوة للأسئلة.

**Show:** Login page operator note about hard refresh after deploy (if relevant).

---

## 2. Problem Framing (2 minutes)

> فرق التدقيق والجهات المؤسسية تحتاج:
>
> - **تتبع** من الرقم إلى المصدر
> - **أدلة** مربوطة بالمخرجات
> - **قرارات بشرية** مسجلة — لا اعتماد تلقائي
> - **سجل تدقيق** لكل تغيير مهم
>
> AuditOS v0.1 يقدم هذا في بيئة واحدة محكومة — deployment م controlled single-instance.

**Do not say:** "AI audit", "certified platform", "replaces your audit firm".

---

## 3. Engagement Context (5 minutes)

**Navigate:** `/audit/engagements/eng-gulf-2025`

> هذا تكليف تجريبي: Gulf Trading Co. — FY2025. في pilot حقيقي نستخدم بياناتكم بعد intake محكوم.

**Show:**

- Client name and fiscal period in header
- **Overview tab** — KPI cards (TB, mapping, evidence, findings, review, approval)
- **Next-action card** — "الخطوة التالية" with reason in Arabic
- **Workflow progress** — locked/unlocked tabs
- Blue **platform context** note if shown — explain seed/pilot allowance

**Click:** Next-action button to first open step if useful.

---

## 4. Trial Balance Flow (8 minutes)

**Navigate:** `…/trial-balance`

> ميزان المراجعة هو نقطة البداية. كل قائمة مالية لاحقة تتتبع إلى هنا.

**Show:**

- Seeded lines and balances (SAR)
- Search/filter if available
- Upload path (mention — optional live upload if time permits)

**Say:**

> لا ننتقل للتصنيف حتى يكتمل ميزان المراجعة — هذا gate مقصود.

**Observe:** Arabic labels, balance validation messages.

---

## 5. Mapping (8 minutes)

**Navigate:** `…/mapping`

> نربط حسابات العميل بالتصنيف المعياري — أساس القوائم المالية.

**Show:**

- Mapped vs unmapped counts
- Sample mapping row
- Gate message if any account still unmapped

**Say:**

> التصنيف الخاطئ يظهر لاحقاً في القوائم — لذلك هذه خطوة حوكمة قبل الإصدار.

---

## 6. Statements (10 minutes)

**Navigate:** `…/statements`

> القوائم المالية مُولّدة من التصنيف مع إمكانية **تتبع** أي بند.

**Show:**

- Balance sheet and income tabs
- **Draft banner** on statements
- **Traceability drawer** on one line — backward to TB
- **Export dropdown** — PDF or XLSX

**Perform:** One export; point to **green success message**.

**Say:**

> التصدير هنا **مسودة** — مسموح للمراجعة الداخلية قبل الاعتماد النهائي. ليس مخرجاً معتمداً للجهة الخارجية.

---

## 7. Notes (5 minutes)

**Navigate:** `…/notes`

> الإيضاحات تربط القوائم بالافصاحات — جزء من حزمة المراجعة.

**Show:** Seeded notes; optional edit if time permits.

**Keep brief** — focus on linkage concept, not content authoring depth.

---

## 8. Evidence (10 minutes)

**Navigate:** `…/evidence`

> **الدليل يحكم** — الملفات والمراجع تُخزّن في vault محكوم.

**Show:**

- Existing evidence list
- Storage status badge (local provider)
- Upload flow OR pre-uploaded file
- Download (permissioned)

**Say:**

> التحميل والتنزيل يمران بصلاحيات. كل رفع مهم يُسجّل في سجل التدقيق.

**Optional:** Reject dialog — explain state change; file retention on disk is v0.1 limitation.

---

## 9. Findings (8 minutes)

**Navigate:** `…/findings`

> النتائج تربط الملاحظات بالأدلة — لا نتيجة مادية بلا مرجع.

**Show:**

- Seeded findings
- Create one finding OR review linkage to evidence
- Guidance text on evidence requirement

---

## 10. Review (8 minutes)

**Navigate:** `…/review`

> المراجعة **بشرية**. الذكاء الاصطناعي قد يقترح — لكن القرار للمراجع.

**Show:**

- Review comments thread
- Open review count on overview if relevant

**Say:**

> لا اعتماد نهائي قبل إكمال مراجعات مطلوبة — النظام يمنع التجاوز.

---

## 11. Approval Governance (8 minutes)

**Navigate:** `…/approval`

> **قرار بشري — لا اعتماد تلقائي.**

**Show:**

- Blue governance banner (human decision)
- Status badge (may be blocked — **expected**)
- Amber **prerequisite card** with link to next tab

**If blocked:**

> هذا مقصود. Pilot seed قد لا يصل للاعتماد في جلسة واحدة — نريد إظهار الحوكمة لا تجاوزها.

**If ready (rare in seed):**

- Walk through approve/reject dialogs
- Confirm audit trail entry

**Do not:** Force approval by facilitator override.

---

## 12. Export (5 minutes)

**Navigate:** `…/exports`

> صفحة التصدير المركزية — نفس سياسة المسودة.

**Show:**

- PDF and XLSX buttons with draft labeling
- Download; success feedback
- Error handling if misconfigured (should not occur in rehearsed env)

**Say:**

> الملف يحمل حالة مسودة. الاعتماد النهائي مسؤولية بشرية مسجلة.

---

## 13. Audit Trail (5 minutes)

**Navigate:** `…/audit-trail`

> سجل التدقيق — من فعل ماذا ومتى.

**Show:**

- Events for TB, evidence, review, export
- Actor identity and timestamps

**Say:**

> أي mutation مهم يجب أن يظهر هنا. غياب حدث = blocker في pilot.

---

## 14. Closing (5 minutes)

> **ما أثبتناه اليوم:**
>
> - سير عمل كامل محكوم من TB إلى التصدير
> - بوابات بشرية ومراجعة
> - أدلة وتتبع
> - سجل تدقيق
>
> **ما لم نثبته:**
>
> - Enterprise HA / SSO / multi-region
> - اعتماد regulator أو Big 4
> - تشغيل autonomous
>
> **Pilot expectations:**
>
> - جلسة واحدة controlled مع مراقب
> - friction log — لا توسعة features أثناء الأسبوع الأول
> - credentials وبيئة م dedicated
> - قرار Go/No-Go بعد pilot وليس اليوم

**Ask:**

- ما أكثر خطوة وضوحاً؟
- أين احتجتم توجيهاً أكثر؟
- أي claim بدا مبالغاً فيه؟

**Next:** Share FAQ (`auditos-pilot-faq.md`) and deployment classification.

---

## Facilitator Checklist (post-session)

- [ ] Friction log completed (P0/P1/P2)
- [ ] No false claims recorded
- [ ] Operator confirmed understanding of draft export + human approval
- [ ] Health still green at end
- [ ] Issue log opened for any P1 items

---

## References

- Walkthrough guide: `docs/pilot/auditos-first-operator-walkthrough.md`
- Demo environment: `docs/pilot/auditos-demo-environment.md`
- FAQ: `docs/pilot/auditos-pilot-faq.md`
