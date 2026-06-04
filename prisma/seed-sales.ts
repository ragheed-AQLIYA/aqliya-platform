import { PrismaClient } from "@prisma/client";

export type SalesOSSeedResult = {
  pipelineId: string;
  stageIds: string[];
  accountIds: string[];
  dealIds: string[];
};

export async function seedSalesOS(
  prisma: PrismaClient,
  platformOrgId: string,
  orgId: string,
  adminId: string,
): Promise<SalesOSSeedResult> {
  // Clean existing SalesOS data (FK-safe order: children before parents)
  await prisma.salesAuditEvent.deleteMany();
  await prisma.salesApproval.deleteMany();
  await prisma.salesReview.deleteMany();
  await prisma.salesProposal.deleteMany();
  await prisma.salesEvidenceLink.deleteMany();
  await prisma.salesInteraction.deleteMany();
  await prisma.salesContact.deleteMany();
  await prisma.salesDeal.deleteMany();
  await prisma.salesAccount.deleteMany();
  await prisma.salesPipelineStage.deleteMany();
  await prisma.salesPipeline.deleteMany();

  console.log("Seeding SalesOS data...");

  const result = await prisma.$transaction(async (tx) => {
    // ─── Pipeline ───
    const pipeline = await tx.salesPipeline.create({
      data: {
        organizationId: orgId,
        platformOrganizationId: platformOrgId,
        name: "المسار الرئيسي",
        slug: "main-pipeline",
        isDefault: true,
        status: "active",
        createdById: adminId,
      },
    });

    // ─── Stages ───
    const stageInputs = [
      { name: "تقديم", slug: "prospecting", sortOrder: 0, isClosed: false },
      { name: "تأهيل", slug: "qualification", sortOrder: 1, isClosed: false },
      { name: "عرض", slug: "proposal", sortOrder: 2, isClosed: false },
      { name: "تفاوض", slug: "negotiation", sortOrder: 3, isClosed: false },
      { name: "فوز/خسارة", slug: "won-lost", sortOrder: 4, isClosed: true },
    ];

    const stages = await Promise.all(
      stageInputs.map((s) =>
        tx.salesPipelineStage.create({
          data: {
            pipelineId: pipeline.id,
            organizationId: orgId,
            platformOrganizationId: platformOrgId,
            name: s.name,
            slug: s.slug,
            sortOrder: s.sortOrder,
            isClosed: s.isClosed,
            status: "active",
          },
        }),
      ),
    );
    console.log(`  Stages: ${stages.length}`);

    // ─── Accounts ───
    const accountInputs = [
      {
        name: "الشركة السعودية للتقنية",
        status: "active",
        industry: "technology",
      },
      {
        name: "مجموعة الراجحي المالية",
        status: "qualified",
        industry: "financial_services",
      },
      {
        name: "شركة البترول الوطنية",
        status: "prospect",
        industry: "energy",
      },
      {
        name: "مؤسسة الاتصالات المتطورة",
        status: "active",
        industry: "telecommunications",
      },
    ];

    const accounts = await Promise.all(
      accountInputs.map((a) =>
        tx.salesAccount.create({
          data: {
            organizationId: orgId,
            platformOrganizationId: platformOrgId,
            name: a.name,
            status: a.status,
            industry: a.industry,
            createdById: adminId,
          },
        }),
      ),
    );
    console.log(`  Accounts: ${accounts.length}`);

    // ─── Contacts ───
    const contactInputs = [
      {
        accountIdx: 0,
        name: "خالد العتيبي",
        email: "khalid@sauditech.sa",
        role: "CTO",
      },
      {
        accountIdx: 0,
        name: "نورة القحطاني",
        email: "noura@sauditech.sa",
        role: "مديرة المشتريات",
      },
      {
        accountIdx: 1,
        name: "فيصل الراجحي",
        email: "faisal@alrajhi-fg.sa",
        role: "نائب الرئيس المالي",
      },
      {
        accountIdx: 2,
        name: "ماجد السبيعي",
        email: "majed@npco.sa",
        role: "مدير العمليات",
      },
      {
        accountIdx: 3,
        name: "سلمان الدوسري",
        email: "salman@advancedcom.sa",
        role: "الرئيس التنفيذي",
      },
    ];

    await Promise.all(
      contactInputs.map((c) =>
        tx.salesContact.create({
          data: {
            organizationId: orgId,
            platformOrganizationId: platformOrgId,
            accountId: accounts[c.accountIdx].id,
            name: c.name,
            email: c.email,
            role: c.role,
          },
        }),
      ),
    );
    console.log(`  Contacts: ${contactInputs.length}`);

    // ─── Deals ───
    const dealInputs = [
      {
        accountIdx: 0,
        stageIdx: 0,
        title: "حلول تقنية سحابية",
        status: "open",
        amount: 500000,
        probability: 20,
        expectedCloseDate: new Date("2026-09-30"),
      },
      {
        accountIdx: 1,
        stageIdx: 2,
        title: "خدمات استشارية مالية",
        status: "open",
        amount: 2500000,
        probability: 65,
        expectedCloseDate: new Date("2026-08-15"),
      },
      {
        accountIdx: 3,
        stageIdx: 3,
        title: "منصة رقمية متكاملة",
        status: "open",
        amount: 8000000,
        probability: 80,
        expectedCloseDate: new Date("2026-10-01"),
      },
      {
        accountIdx: 2,
        stageIdx: 4,
        title: "نظام إدارة الطاقة",
        status: "won",
        amount: 1200000,
        probability: 100,
        expectedCloseDate: new Date("2026-05-01"),
      },
    ];

    const deals = await Promise.all(
      dealInputs.map((d) =>
        tx.salesDeal.create({
          data: {
            organizationId: orgId,
            platformOrganizationId: platformOrgId,
            accountId: accounts[d.accountIdx].id,
            stageId: stages[d.stageIdx].id,
            title: d.title,
            status: d.status,
            amount: d.amount,
            currency: "SAR",
            probability: d.probability,
            expectedCloseDate: d.expectedCloseDate,
            createdById: adminId,
          },
        }),
      ),
    );
    console.log(`  Deals: ${deals.length}`);

    // ─── Interactions ───
    const interactionInputs = [
      {
        accountIdx: 0,
        dealIdx: 0,
        type: "meeting",
        subject: "اجتماع عرض تقني",
        summary: "تم تقديم عرض الحلول السحابية وإبداء العميل اهتمامه بالمرحلة القادمة",
        occurredAt: new Date("2026-05-15"),
      },
      {
        accountIdx: 1,
        dealIdx: 1,
        type: "call",
        subject: "مكالمة متابعة",
        summary: "متابعة طلب العميل للخدمات الاستشارية وتأكيد المواعيد",
        occurredAt: new Date("2026-06-02"),
      },
      {
        accountIdx: 3,
        dealIdx: 2,
        type: "email",
        subject: "إرسال العرض المالي",
        summary: "تم إرسال العرض المالي النهائي للمنصة الرقمية المتكاملة",
        occurredAt: new Date("2026-06-10"),
      },
    ];

    await Promise.all(
      interactionInputs.map((i) =>
        tx.salesInteraction.create({
          data: {
            organizationId: orgId,
            platformOrganizationId: platformOrgId,
            accountId: accounts[i.accountIdx].id,
            dealId: deals[i.dealIdx].id,
            type: i.type,
            subject: i.subject,
            summary: i.summary,
            occurredAt: i.occurredAt,
            createdById: adminId,
          },
        }),
      ),
    );
    console.log(`  Interactions: ${interactionInputs.length}`);

    // ─── Evidence Links ───
    await Promise.all([
      tx.salesEvidenceLink.create({
        data: {
          organizationId: orgId,
          platformOrganizationId: platformOrgId,
          targetType: "deal",
          targetId: deals[0].id,
          dealId: deals[0].id,
          evidenceId: "evid-needs-analysis-001",
          label: "تقرير تحليل الاحتياجات",
          evidenceType: "document",
          createdById: adminId,
        },
      }),
      tx.salesEvidenceLink.create({
        data: {
          organizationId: orgId,
          platformOrganizationId: platformOrgId,
          targetType: "deal",
          targetId: deals[2].id,
          dealId: deals[2].id,
          evidenceId: "evid-feasibility-study-001",
          label: "دراسة الجدوى الفنية",
          evidenceType: "document",
          createdById: adminId,
        },
      }),
    ]);
    console.log(`  Evidence links: 2`);

    // ─── Audit Events ───
    await Promise.all([
      tx.salesAuditEvent.create({
        data: {
          organizationId: orgId,
          platformOrganizationId: platformOrgId,
          actorId: adminId,
          actorName: "Ahmed Al-Mansouri",
          action: "pipeline.created",
          targetType: "SalesPipeline",
          targetId: pipeline.id,
        },
      }),
      tx.salesAuditEvent.create({
        data: {
          organizationId: orgId,
          platformOrganizationId: platformOrgId,
          actorId: adminId,
          actorName: "Ahmed Al-Mansouri",
          action: "accounts.imported",
          targetType: "SalesAccount",
          targetId: accounts[0].id,
          metadata: { count: accounts.length },
        },
      }),
      tx.salesAuditEvent.create({
        data: {
          organizationId: orgId,
          platformOrganizationId: platformOrgId,
          actorId: adminId,
          actorName: "Ahmed Al-Mansouri",
          action: "deal.stage_changed",
          targetType: "SalesDeal",
          targetId: deals[2].id,
          metadata: { from: "proposal", to: "negotiation" },
        },
      }),
    ]);
    console.log(`  Audit events: 3`);

    return {
      pipelineId: pipeline.id,
      stageIds: stages.map((s) => s.id),
      accountIds: accounts.map((a) => a.id),
      dealIds: deals.map((d) => d.id),
    };
  });

  console.log("SalesOS seeding completed.");
  return result;
}
