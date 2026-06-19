import { PrismaClient } from "@prisma/client";

export type OfficeAISeedResult = {
  taskIds: string[];
};

export async function seedOfficeAI(
  prisma: PrismaClient,
  platformOrgId: string,
  orgId: string,
  adminId: string,
): Promise<OfficeAISeedResult> {
  // Clean existing Office AI data
  await prisma.officeAiFile.deleteMany();
  await prisma.officeAiOutput.deleteMany();
  await prisma.officeAiTask.deleteMany();

  console.log("Seeding Office AI Assistant data...");

  const result = await prisma.$transaction(async (tx) => {
    const adminName = "مدير النظام";

    // ─── Task 1: Excel Analysis (approved) ───
    const excelTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "excel_analysis",
        status: "approved",
        language: "ar",
        title: "تحليل ميزانية 2025",
        instructions:
          "تحليل جدول الميزانية السنوية للعام 2025، مع التركيز على الإيرادات والمصروفات والفجوة التمويلية.",
        createdById: adminId,
        createdByName: adminName,
        reviewedById: adminId,
        reviewedAt: new Date(),
        approvedById: adminId,
        approvedAt: new Date(),
        metadata: { department: "المالية", priority: "high" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: excelTask.id,
        content:
          "# تحليل ميزانية 2025\n\n## ملخص تنفيذي\nتم تحليل الميزانية السنوية للعام 2025 بناءً على البيانات المقدمة.\n\n### الإيرادات المتوقعة\n- إيرادات تشغيلية: 12.5 مليون ريال\n- إيرادات غير تشغيلية: 2.3 مليون ريال\n- إجمالي الإيرادات: **14.8 مليون ريال**\n\n### المصروفات\n- مصروفات تشغيلية: 9.2 مليون ريال\n- مصروفات إدارية: 1.8 مليون ريال\n- مصروفات رأسمالية: 2.5 مليون ريال\n- إجمالي المصروفات: **13.5 مليون ريال**\n\n### الفجوة التمويلية\n- الفائض المتوقع: **1.3 مليون ريال**\n- نسبة الفائض إلى الإيرادات: 8.8%\n\n### التوصيات\n1. مراجعة بنود المصروفات الرأسمالية لإمكانية خفض 10%\n2. زيادة تخصيص ميزانية التحول الرقمي بنسبة 15%\n3. إنشاء احتياطي طوارئ بنسبة 5% من الإيرادات\n\n---\n*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*",
        format: "markdown",
        status: "finalized",
        aiProvider: "deterministic",
        aiModel: "deterministic-analyst-v1",
        aiPromptVersion: "1.0",
        confidenceScore: 0.85,
        reviewedById: adminId,
        reviewedAt: new Date(),
        metadata: { tokensUsed: 450, sections: 5 },
      },
    });

    // ─── Task 2: Document Summary (needs_review) ───
    const summaryTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "document_summary",
        status: "needs_review",
        language: "ar",
        title: "تلخيص عقد الخدمات الاستشارية",
        instructions:
          "تلخيص عقد الخدمات الاستشارية المرفق في 10 نقاط رئيسية مع ذكر الالتزامات الرئيسية لكلا الطرفين.",
        createdById: adminId,
        createdByName: adminName,
        metadata: { department: "القانونية", priority: "medium" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: summaryTask.id,
        content:
          "# تلخيص عقد الخدمات الاستشارية\n\n## النقاط الرئيسية\n1. **طبيعة العقد**: عقد خدمات استشارية لتطوير استراتيجية التحول الرقمي\n2. **مدة العقد**: 18 شهراً من تاريخ التوقيع\n3. **قيمة العقد**: 850,000 ريال سعودي\n4. **الاستشاري**: شركة تقنية المعلومات المتقدمة\n5. **نطاق العمل**: تقييم الوضع الحالي، وضع خارطة طريق، تنفيذ المرحلة الأولى\n6. **التزامات المستفيد**: توفير البيانات والمعلومات والوصول للأنظمة\n7. **التزامات الاستشاري**: السرية التامة، تقديم تقارير شهرية، تدريب الكوادر\n8. **آلية الدفع**: 30% دفعة أولى، 40% عند التسليم، 30% بعد الاعتماد\n9. **بنود الجزاءات**: غرامة 2% عن كل شهر تأخير\n10. **إنهاء العقد**: باتفاق الطرفين أو بإخطار مسبق 30 يوماً\n\n---\n*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*",
        format: "markdown",
        status: "draft",
        aiProvider: "deterministic",
        aiModel: "deterministic-summarizer-v1",
        confidenceScore: 0.78,
        metadata: { keyPoints: 10, sections: 3 },
      },
    });

    // ─── Task 3: Report Draft (draft) ───
    const reportTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "report_draft",
        status: "draft",
        language: "ar",
        title: "تقرير الأداء الربعي Q2",
        instructions:
          "إعداد تقرير أداء الربع الثاني مع مقارنة بالربع السابق وتحليل الفجوات.",
        createdById: adminId,
        createdByName: adminName,
        metadata: { department: "الإدارة", quarter: "Q2-2025" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: reportTask.id,
        content:
          "# تقرير الأداء الربعي — Q2 2025\n\n## مؤشرات الأداء الرئيسية\n| المؤشر | Q1 2025 | Q2 2025 | التغير |\n|--------|---------|---------|--------|\n| الإيرادات | 3.2M | 3.8M | +18.8% |\n| العملاء الجدد | 12 | 18 | +50% |\n| رضا العملاء | 82% | 87% | +5% |\n| إنجاز المشاريع | 8 | 11 | +37.5% |\n\n## أبرز الإنجازات\n- إطلاق منصة الخدمات الإلكترونية الجديدة\n- توقيع 3 عقود استراتيجية مع جهات حكومية\n- تطوير نظام إدارة الجودة\n\n## التحديات\n- تأخير في تسليم مشروع البنية التحتية\n- نقص في الكوادر المتخصصة\n\n## التوصيات\n1. تسريع توظيف الكوادر المطلوبة\n2. مراجعة الجدول الزمني لمشاريع الربع الثالث\n3. رفع ميزانية التدريب بنسبة 20%\n\n---\n*مسودة أولية تحتاج مراجعة بشرية.*",
        format: "markdown",
        status: "draft",
        aiProvider: "deterministic",
        aiModel: "deterministic-reporter-v1",
        confidenceScore: 0.72,
        metadata: { kpisTracked: 4, sections: 4 },
      },
    });

    // ─── Task 4: Meeting Notes (generated) ───
    const meetingTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "meeting_notes",
        status: "generated",
        language: "ar",
        title: "محضر اجتماع مجلس الإدارة — مايو 2025",
        instructions:
          "توثيق محضر اجتماع مجلس الإدارة الدوري لشهر مايو 2025 مع القرارات والتوصيات.",
        createdById: adminId,
        createdByName: adminName,
        metadata: { meetingDate: "2025-05-15", attendees: 9 },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: meetingTask.id,
        content:
          "# محضر اجتماع مجلس الإدارة\n\n**التاريخ:** 15 مايو 2025\n**الحضور:** 9 أعضاء\n\n## جدول الأعمال\n1. اعتماد محضر الاجتماع السابق\n2. عرض الأداء المالي للربع الأول\n3. مناقشة خطة التحول الرقمي\n4. الموافقة على ميزانية المشاريع الجديدة\n\n## القرارات\n- **قرار 1**: اعتماد محضر الاجتماع السابق بالإجماع\n- **قرار 2**: الموافقة على تخصيص 2.5 مليون ريال لمشروع التحول الرقمي\n- **قرار 3**: تكليف اللجنة التنفيذية بدراسة إنشاء إدارة للابتكار\n\n## التوصيات\n- رفع تقرير مرحلي عن التحول الرقمي في الاجتماع القادم\n- دعوة مدقق خارجي لمراجعة الحوكمة\n\n---\n*مسودة أولية تحتاج مراجعة بشرية.*",
        format: "markdown",
        status: "draft",
        aiProvider: "deterministic",
        aiModel: "deterministic-minutes-v1",
        confidenceScore: 0.82,
      },
    });

    // ─── Task 5: Presentation Outline (rejected) ───
    const outlineTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "presentation_outline",
        status: "rejected",
        language: "ar",
        title: "عرض استراتيجية 2030",
        instructions:
          "إعداد مخطط عرض تقديمي لاستراتيجية المؤسسة حتى 2030، مع الشرائح الرئيسية والرسائل الأساسية.",
        createdById: adminId,
        createdByName: adminName,
        reviewedById: adminId,
        reviewedAt: new Date(),
        metadata: { rejectionReason: "يحتاج تحديث الأرقام والجداول الزمنية" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: outlineTask.id,
        content:
          "# مخطط العرض التقديمي: استراتيجية 2030\n\n## الشريحة 1: العنوان\nاستراتيجية المؤسسة 2030 — نحو الريادة والتميز\n\n## الشريحة 2: الرؤية\nأن نكون المؤسسة الرائدة في تقديم الحلول المبتكرة\n\n## الشريحة 3: الرسالة\nتمكين المؤسسات من تحقيق أهدافها عبر حلول ذكية ومستدامة\n\n## الشريحة 4: المحاور الاستراتيجية\n- التحول الرقمي\n- الاستدامة\n- الابتكار\n- الشراكات\n\n## الشريحة 5: مؤشرات النجاح\n- حصة سوقية 25%\n- رضا العملاء 95%\n- نمو الإيرادات 15% سنوياً\n\n---\n*مسودة أولية تحتاج مراجعة بشرية.*",
        format: "markdown",
        status: "draft",
        aiProvider: "deterministic",
        aiModel: "deterministic-outliner-v1",
        confidenceScore: 0.65,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: "الأرقام والجداول الزمنية تحتاج تحديث",
      },
    });

    // ─── Task 6: Executive Summary (archived) ───
    const execTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "executive_summary",
        status: "archived",
        language: "ar",
        title: "ملخص تنفيذي لتقرير السوق",
        instructions:
          "إعداد ملخص تنفيذي لتقرير تحليل السوق الربعي مع التوصيات الرئيسية.",
        createdById: adminId,
        createdByName: adminName,
        metadata: { archivedReason: "استبدل بتقرير محدث", quarter: "Q1-2025" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: execTask.id,
        content:
          "# ملخص تنفيذي — تقرير السوق Q1 2025\n\n## نظرة عامة\nأظهر السوق نمواً بنسبة 12% مقارنة بالربع المماثل من العام السابق.\n\n## الفرص الرئيسية\n- قطاع الخدمات المالية: نمو 18%\n- قطاع الطاقة: نمو 15%\n- قطاع الصحة: نمو 20%\n\n## المخاطر\n- تقلبات أسعار المواد الخام\n- تغير الأنظمة التنظيمية\n- المنافسة المتزايدة\n\n## التوصيات\n1. التركيز على قطاع الصحة كفرصة استراتيجية\n2. تعزيز الشراكات مع الموردين المحليين\n3. تطوير منتج تنافسي جديد\n\n---\n*مسودة أولية تحتاج مراجعة بشرية.*",
        format: "markdown",
        status: "finalized",
        aiProvider: "deterministic",
        aiModel: "deterministic-exec-v1",
        confidenceScore: 0.8,
      },
    });

    // ─── Task 7: English Report (draft - bilingual demo) ───
    const englishTask = await tx.officeAiTask.create({
      data: {
        platformOrganizationId: platformOrgId,
        taskType: "report_draft",
        status: "draft",
        language: "en",
        title: "Q3 Market Analysis Report",
        instructions:
          "Draft a market analysis report for Q3 covering GCC markets with competitive landscape.",
        createdById: adminId,
        createdByName: "System Admin",
        metadata: { region: "GCC", quarter: "Q3-2025" },
      },
    });

    await tx.officeAiOutput.create({
      data: {
        taskId: englishTask.id,
        content:
          "# Q3 2025 Market Analysis Report — GCC Region\n\n## Executive Summary\nThe GCC market continues to show robust growth driven by digital transformation initiatives.\n\n## Key Findings\n- **Saudi Arabia**: Market growth of 15% YoY\n- **UAE**: Digital adoption rate increased by 22%\n- **Qatar**: Infrastructure spending up 18%\n- **Kuwait**: New regulations driving compliance demand\n\n## Competitive Landscape\n| Company | Market Share | Growth Rate |\n|---------|-------------|-------------|\n| Company A | 28% | +12% |\n| Company B | 22% | +18% |\n| Company C | 15% | +8% |\n\n## Recommendations\n1. Expand presence in Saudi Arabia (highest growth potential)\n2. Develop compliance-focused solutions for Kuwaiti market\n3. Partner with local firms in Qatar for infrastructure projects\n\n---\n*Initial draft requiring human review. AI assists — humans decide.*",
        format: "markdown",
        status: "draft",
        aiProvider: "deterministic",
        aiModel: "deterministic-reporter-v1",
        confidenceScore: 0.75,
      },
    });

    return {
      taskIds: [
        excelTask.id,
        summaryTask.id,
        reportTask.id,
        meetingTask.id,
        outlineTask.id,
        execTask.id,
        englishTask.id,
      ],
    };
  });

  console.log(`Seeded ${result.taskIds.length} Office AI tasks`);
  return result;
}
