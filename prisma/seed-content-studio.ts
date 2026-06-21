import { PrismaClient } from "@prisma/client";

export type ContentStudioSeedResult = {
  workspaceIds: string[];
  contentIds: string[];
  templateIds: string[];
};

export async function seedContentStudio(
  prisma: PrismaClient,
  platformOrgId: string,
  orgId: string,
  adminId: string,
  reviewerId: string,
  approverId: string,
): Promise<ContentStudioSeedResult> {
  // Clean existing ContentStudio data (FK-safe order)
  await prisma.contentVersion.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.contentTemplate.deleteMany();
  await prisma.contentWorkspace.deleteMany();

  console.log("Seeding ContentStudio data...");

  // Use raw execute to bypass the hand-crafted delegate interface
  // since the seed script uses the generated Prisma client directly
  const result = await prisma.$transaction(async (tx) => {
    // ─── Workspace 1: Marketing Content / المحتوى التسويقي ───
    const ws1 = await tx.contentWorkspace.create({
      data: {
        organizationId: orgId,
        name: "المحتوى التسويقي",
        description: "مقالات ومواد تسويقية للتعريف بالمنصة والمنتجات",
        category: "marketing",
        isActive: true,
        createdById: adminId,
      },
    });

    // ─── Workspace 2: Technical Content / المحتوى التقني ───
    const ws2 = await tx.contentWorkspace.create({
      data: {
        organizationId: orgId,
        name: "المحتوى التقني",
        description: "توثيق فني وأدلة استخدام للمنتجات",
        category: "technical",
        isActive: true,
        createdById: adminId,
      },
    });

    // ─── Workspace 3: Annual Reports / التقارير السنوية ───
    const ws3 = await tx.contentWorkspace.create({
      data: {
        organizationId: orgId,
        name: "التقارير السنوية",
        description: "تقارير سنوية رسمية وإفصاحات",
        category: "reports",
        isActive: true,
        createdById: adminId,
      },
    });

    // ─── Content Item 1: Article (PUBLISHED) ───
    const c1 = await tx.contentItem.create({
      data: {
        workspaceId: ws1.id,
        organizationId: orgId,
        title: "عقلية: منصة الذكاء المؤسسي الخاص والمحكوم",
        body: `# عقلية: منصة الذكاء المؤسسي الخاص والمحكوم

## نبذة عن المنصة
عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة وأدلة وصلاحيات وسجل تدقيقي.

## المبادئ الأساسية
- **الذكاء يساعد** — الإنسان يقرر.
- **الدليل يحكم** — كل قرار مدعوم بأدلة.
- **الحوكمة مضمنة** — الصلاحيات والموافقات والتوثيق جزء من التصميم.

## المنتجات المتخصصة
1. **AuditOS** — نظام ذكاء التدقيق المالي والمؤسسي
2. **DecisionOS** — نظام حوكمة القرارات
3. **LocalContentOS** — نظام المحتوى المحلي
4. **WorkflowOS** — نظام سير العمل المحكوم`,
        summary: "تعريف شامل بمنصة عقلية ومبادئها ومنتجاتها المتخصصة",
        locale: "ar",
        tags: ["المنصة", "عقلية", "تعريف", "حوكمة"],
        status: "PUBLISHED",
        contentType: "article",
        version: 3,
        createdById: adminId,
        reviewedById: reviewerId,
        approvedById: approverId,
        publishedAt: new Date("2026-06-01"),
      },
    });

    // Version history for c1
    await tx.contentVersion.create({
      data: {
        contentId: c1.id,
        version: 1,
        title: "عقلية: منصة الذكاء المؤسسي",
        body: "# عقلية\nمنصة ذكاء مؤسسي خاص ومحكوم.\n\n## المبادئ\n- الذكاء يساعد — الإنسان يقرر.",
        tags: ["المنصة", "عقلية"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });
    await tx.contentVersion.create({
      data: {
        contentId: c1.id,
        version: 2,
        title: "عقلية: منصة الذكاء المؤسسي الخاص والمحكوم",
        body: `# عقلية: منصة الذكاء المؤسسي الخاص والمحكوم

## نبذة عن المنصة
منصة ذكاء مؤسسي خاص ومحكوم.

## المبادئ الأساسية
- الذكاء يساعد — الإنسان يقرر.
- الدليل يحكم.
- الحوكمة مضمنة.

## المنتجات
1. AuditOS
2. DecisionOS
3. LocalContentOS`,
        tags: ["المنصة", "عقلية", "حوكمة"],
        changeSummary: "إضافة تفاصيل المنتجات",
        createdById: adminId,
      },
    });
    await tx.contentVersion.create({
      data: {
        contentId: c1.id,
        version: 3,
        title: "عقلية: منصة الذكاء المؤسسي الخاص والمحكوم",
        body: c1.body,
        tags: ["المنصة", "عقلية", "تعريف", "حوكمة"],
        changeSummary: "إضافة مقدمة كاملة مع تعريف المنصة والمبادئ والمنتجات",
        createdById: adminId,
      },
    });

    // ─── Content Item 2: Article (IN_REVIEW) ───
    const c2 = await tx.contentItem.create({
      data: {
        workspaceId: ws1.id,
        organizationId: orgId,
        title: "دليل حوكمة الذكاء الاصطناعي في المؤسسات",
        body: `# دليل حوكمة الذكاء الاصطناعي في المؤسسات

## مقدمة
مع تزايد استخدام الذكاء الاصطناعي في القطاع المؤسسي، تبرز الحاجة إلى حوكمة تضمن الاستخدام المسؤول والآمن.

## المبادئ الأساسية لحوكمة الذكاء الاصطناعي

### 1. الشفافية
يجب أن تكون جميع مخرجات الذكاء الاصطناعي قابلة للتفسير والتدقيق.

### 2. المساءلة
يجب تحديد مسؤولية الإنسان عن كل قرار يتخذ بناءً على توصيات الذكاء الاصطناعي.

### 3. الخصوصية
يجب حماية بيانات المؤسسات والعملاء وعدم تسريبها إلى نماذج خارجية دون ضوابط.

### 4. العدالة
يجب التأكد من عدم تحيز مخرجات الذكاء الاصطناعي ضد أي فئة.

## إطار الحوكمة في عقلية
تطبق عقلية إطار حوكمة متكامل يشمل:
- سجل تدقيقي لكل عملية
- مراجعة بشرية إلزامية للمخرجات
- توثيق مصدر كل توصية
- ضوابط صلاحيات دقيقة`,
        summary: "دليل شامل لحوكمة الذكاء الاصطناعي في المؤسسات",
        locale: "ar",
        tags: ["حوكمة", "ذكاء اصطناعي", "مبادئ", "خصوصية"],
        status: "IN_REVIEW",
        contentType: "article",
        version: 2,
        createdById: adminId,
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c2.id,
        version: 1,
        title: "حوكمة الذكاء الاصطناعي في المؤسسات",
        body: "# حوكمة الذكاء الاصطناعي\nدليل مبادئ حوكمة الذكاء الاصطناعي.",
        tags: ["حوكمة", "ذكاء اصطناعي"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });
    await tx.contentVersion.create({
      data: {
        contentId: c2.id,
        version: 2,
        title: "دليل حوكمة الذكاء الاصطناعي في المؤسسات",
        body: c2.body,
        tags: ["حوكمة", "ذكاء اصطناعي", "مبادئ", "خصوصية"],
        changeSummary: "إضافة المقدمة والمبادئ الأربعة وإطار الحوكمة",
        createdById: adminId,
      },
    });

    // ─── Content Item 3: Article (DRAFT) ───
    const c3 = await tx.contentItem.create({
      data: {
        workspaceId: ws1.id,
        organizationId: orgId,
        title: "أثر التحول الرقمي على قطاع التدقيق في المملكة",
        body: `# أثر التحول الرقمي على قطاع التدقيق في المملكة

## مقدمة
يشهد قطاع التدقيق في المملكة العربية السعودية تحولاً كبيراً بفضل رؤية 2030 ومبادرات التحول الرقمي.

## التحديات الحالية
1. زيادة حجم البيانات المالية
2. تعقيد العمليات المحاسبية
3. الحاجة إلى تدقيق آني ومستمر
4. نقص الكوادر المتخصصة في التدقيق التقني

## الحلول المقترحة
- استخدام تقنيات الذكاء الاصطناعي لتحليل البيانات
- أتمتة إجراءات التدقيق المتكررة
- تطوير منصات حوكمة رقمية متكاملة`,
        summary: "تحليل تأثير التحول الرقمي على مهنة التدقيق",
        locale: "ar",
        tags: ["تدقيق", "تحول رقمي", "رؤية 2030", "تقنية"],
        status: "DRAFT",
        contentType: "article",
        version: 1,
        createdById: adminId,
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c3.id,
        version: 1,
        title: "أثر التحول الرقمي على قطاع التدقيق في المملكة",
        body: c3.body,
        tags: ["تدقيق", "تحول رقمي", "رؤية 2030", "تقنية"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });

    // ─── Content Item 4: Technical doc (PUBLISHED) ───
    const c4 = await tx.contentItem.create({
      data: {
        workspaceId: ws2.id,
        organizationId: orgId,
        title: "دليل بدء الاستخدام: منصة عقلية",
        body: `# دليل بدء الاستخدام: منصة عقلية

## المتطلبات الأساسية
- متصفح حديث (Chrome, Firefox, Edge)
- حساب مستخدم مع صلاحيات مناسبة
- اتصال إنترنت مستقر

## خطوات البدء

### 1. تسجيل الدخول
1. افتح الرابط الخاص بمنصة مؤسستك
2. أدخل البريد الإلكتروني وكلمة المرور
3. إذا كان المصادقة متعددة العوامل مفعلة، أدخل رمز التحقق

### 2. لوحة التحكم الرئيسية
بعد تسجيل الدخول، ستظهر لك لوحة التحكم الرئيسية والتي تحتوي على:
- ملخص المهام النشطة
- آخر التحديثات
- روابط سريعة للمنتجات المتاحة

### 3. الوصول إلى المنتجات
- **AuditOS**: إدارة مهام التدقيق من خلال /audit
- **DecisionOS**: إدارة القرارات من خلال /decisions
- **LocalContentOS**: إدارة المحتوى المحلي من خلال /local-content`,
        summary: "دليل شامل لبدء استخدام منصة عقلية",
        locale: "ar",
        tags: ["دليل", "بدء استخدام", "منصة", "تعليمات"],
        status: "PUBLISHED",
        contentType: "guide",
        version: 2,
        createdById: adminId,
        reviewedById: reviewerId,
        approvedById: approverId,
        publishedAt: new Date("2026-05-15"),
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c4.id,
        version: 1,
        title: "دليل بدء الاستخدام",
        body: "# دليل بدء الاستخدام\n## خطوات البدء\n1. سجل الدخول\n2. تصفح المنتجات\n3. ابدأ العمل",
        tags: ["دليل", "بدء استخدام"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });
    await tx.contentVersion.create({
      data: {
        contentId: c4.id,
        version: 2,
        title: "دليل بدء الاستخدام: منصة عقلية",
        body: c4.body,
        tags: ["دليل", "بدء استخدام", "منصة", "تعليمات"],
        changeSummary: "إضافة المتطلبات وخطوات مفصلة",
        createdById: adminId,
      },
    });

    // ─── Content Item 5: Technical doc (DRAFT) ───
    const c5 = await tx.contentItem.create({
      data: {
        workspaceId: ws2.id,
        organizationId: orgId,
        title: "مواصفات API لتكامل الأنظمة",
        body: `# مواصفات API لتكامل الأنظمة

## المصادقة
جميع طلبات API تتطلب رمز تفويض (Bearer Token) في ترويسة Authorization.

## نقاط النهاية

### العمليات الأساسية
- \`GET /api/health\` — التحقق من حالة المنصة
- \`GET /api/metrics\` — إحصائيات الأداء (يتطلب صلاحية ADMIN)

### AuditOS API
- \`GET /api/audit/engagements\` — قائمة المهام
- \`GET /api/audit/engagements/[id]\` — تفاصيل مهمة`,
        summary: "توثيق API لتكامل الأنظمة الخارجية مع منصة عقلية",
        locale: "ar",
        tags: ["API", "تكامل", "تقني", "مواصفات"],
        status: "DRAFT",
        contentType: "technical",
        version: 1,
        createdById: adminId,
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c5.id,
        version: 1,
        title: "مواصفات API لتكامل الأنظمة",
        body: c5.body,
        tags: ["API", "تكامل", "تقني", "مواصفات"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });

    // ─── Content Item 6: Annual Report (IN_REVIEW) ───
    const c6 = await tx.contentItem.create({
      data: {
        workspaceId: ws3.id,
        organizationId: orgId,
        title: "التقرير السنوي 2025 - تجربة تجريبية",
        body: `# التقرير السنوي 2025

## كلمة الرئيس التنفيذي
نحن في عقلية نؤمن بأن الذكاء الاصطناعي المسؤول هو مفتاح تمكين المؤسسات من اتخاذ قرارات أفضل.

## أبرز الإنجازات
1. إطلاق منصة عقلية بنسخة v0.1
2. تطوير AuditOS كأول منتج متخصص
3. إطلاق DecisionOS لحوكمة القرارات
4. اكتمال مرحلة الطرح التجريبي مع 3 عملاء

## الأداء المالي
- **الإيرادات**: 2.5 مليون ريال
- **الاستثمارات**: 8 ملايين ريال
- **عدد العملاء**: 3 في المرحلة التجريبية

## الخطط المستقبلية
- تطوير LocalContentOS كمنتج استراتيجي ثانٍ
- تعزيز قدرات الذكاء الاصطناعي التوليدي
- التوسع في القطاع الحكومي`,
        summary: "التقرير السنوي التجريبي للمنصة",
        locale: "ar",
        tags: ["تقرير سنوي", "أداء", "إنجازات", "خطط"],
        status: "IN_REVIEW",
        contentType: "report",
        version: 2,
        createdById: adminId,
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c6.id,
        version: 1,
        title: "التقرير السنوي 2025 - مسودة",
        body: "# التقرير السنوي 2025\nإنجازات المنصة في عام 2025.",
        tags: ["تقرير سنوي", "أداء"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });
    await tx.contentVersion.create({
      data: {
        contentId: c6.id,
        version: 2,
        title: "التقرير السنوي 2025 - تجربة تجريبية",
        body: c6.body,
        tags: ["تقرير سنوي", "أداء", "إنجازات", "خطط"],
        changeSummary: "إضافة المحتوى الكامل مع كلمة الرئيس التنفيذي والإنجازات",
        createdById: adminId,
      },
    });

    // ─── Content Item 7: Case Study (DRAFT) ───
    const c7 = await tx.contentItem.create({
      data: {
        workspaceId: ws3.id,
        organizationId: orgId,
        title: "دراسة حالة: تطبيق AuditOS في أحد البنوك المحلية",
        body: `# دراسة حالة: تطبيق AuditOS في أحد البنوك المحلية

## الخلفية
بنك محلي يعمل في المملكة العربية السعودية يحتاج إلى تطوير عملية التدقيق الداخلي لديه.

## التحدي
استغراق عملية التدقيق اليدوي وقتاً طويلاً مع احتمالية عالية للأخطاء البشرية.

## الحل
تطبيق AuditOS لأتمتة إجراءات التدقيق وتحليل البيانات المالية.

## النتائج
- **توفير وقت**: 60% تقليل وقت إنجاز مهام التدقيق
- **دقة أعلى**: 95% دقة في تحليل البيانات
- **شفافية**: سجل تدقيقي كامل لجميع الإجراءات`,
        summary: "دراسة حالة تطبيق AuditOS في القطاع المصرفي",
        locale: "ar",
        tags: ["دراسة حالة", "AuditOS", "بنوك", "تدقيق"],
        status: "DRAFT",
        contentType: "case-study",
        version: 1,
        createdById: adminId,
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
      },
    });

    await tx.contentVersion.create({
      data: {
        contentId: c7.id,
        version: 1,
        title: "دراسة حالة: تطبيق AuditOS في أحد البنوك المحلية",
        body: c7.body,
        tags: ["دراسة حالة", "AuditOS", "بنوك", "تدقيق"],
        changeSummary: "نسخة أولية",
        createdById: adminId,
      },
    });

    // ─── Templates ───
    const t1 = await tx.contentTemplate.create({
      data: {
        organizationId: orgId,
        name: "قالب مقال تسويقي",
        description: "قالب للمقالات التسويقية مع متغيرات للعنوان والملخص",
        category: "marketing",
        bodyTemplate: `# {{title}}

## ملخص
{{summary}}

## المقدمة
{{introduction}}

## المحتوى الرئيسي
{{body}}

## الخاتمة
{{conclusion}}

---

*تم إعداد هذا المقال بواسطة منصة عقلية*`,
        metadataTemplate: {
          contentType: "article",
          category: "marketing",
          defaultLocale: "ar",
          estimatedReadMinutes: "{{readTime}}",
        },
        defaultReviewRoles: ["editor", "manager"],
        isActive: true,
        createdById: adminId,
      },
    });

    const t2 = await tx.contentTemplate.create({
      data: {
        organizationId: orgId,
        name: "قالب تقرير رسمي",
        description: "قالب للتقارير الرسمية مع متغيرات للبيانات المالية",
        category: "reports",
        bodyTemplate: `# {{reportTitle}}

## الجهة المعدة
{{preparedBy}}

## التاريخ
{{reportDate}}

## ملخص تنفيذي
{{executiveSummary}}

## النتائج الرئيسية
{{findings}}

## التوصيات
{{recommendations}}

## المرفقات
{{attachments}}

---

*تم إعداد هذا التقرير بمساعدة الذكاء الاصطناعي. الذكاء يساعد — الإنسان يقرر.*`,
        metadataTemplate: {
          contentType: "report",
          category: "official",
          defaultLocale: "ar",
          requiresApproval: true,
          approvalRoles: ["manager", "admin"],
        },
        defaultReviewRoles: ["manager", "admin"],
        isActive: true,
        createdById: adminId,
      },
    });

    console.log(`Created 3 workspaces: ${ws1.name}, ${ws2.name}, ${ws3.name}`);
    console.log(`Created 7 content items across workspaces`);
    console.log(`Created 2 templates: ${t1.name}, ${t2.name}`);

    return {
      workspaceIds: [ws1.id, ws2.id, ws3.id],
      contentIds: [c1.id, c2.id, c3.id, c4.id, c5.id, c6.id, c7.id],
      templateIds: [t1.id, t2.id],
    };
  });

  return result;
}
