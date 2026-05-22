import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

function now() {
  return new Date();
}

const suppliers = [
  {
    name: "شركة التقنية المتقدمة",
    crNumber: "1010123456",
    localityClassification: "local",
    localContentPercentage: 85,
    ownershipType: "Saudi",
    workforceLocalPct: 92,
  },
  {
    name: "مؤسسة الأعمال الهندسية",
    crNumber: "1010234567",
    localityClassification: "local",
    localContentPercentage: 72,
    ownershipType: "Saudi",
    workforceLocalPct: 78,
  },
  {
    name: "GlobalTech Solutions Ltd",
    crNumber: null,
    localityClassification: "non_local",
    localContentPercentage: 15,
    ownershipType: "foreign",
    workforceLocalPct: 8,
  },
  {
    name: "شركة الخدمات اللوجستية",
    crNumber: "1010345678",
    localityClassification: "local",
    localContentPercentage: 95,
    ownershipType: "Saudi",
    workforceLocalPct: 98,
  },
  {
    name: "EuroParts Middle East",
    crNumber: null,
    localityClassification: "non_local",
    localContentPercentage: 22,
    ownershipType: "foreign",
    workforceLocalPct: 12,
  },
  {
    name: "مصنع البلاستيك الوطني",
    crNumber: "1010456789",
    localityClassification: "local",
    localContentPercentage: 78,
    ownershipType: "Saudi",
    workforceLocalPct: 85,
  },
  {
    name: "AsiaTrade Import Co",
    crNumber: null,
    localityClassification: "non_local",
    localContentPercentage: 5,
    ownershipType: "foreign",
    workforceLocalPct: 3,
  },
  {
    name: "شركة الصيانة المتكاملة",
    crNumber: "1010567890",
    localityClassification: "mixed",
    localContentPercentage: 55,
    ownershipType: "joint_venture",
    workforceLocalPct: 62,
  },
  {
    name: "مؤسسة النقل السريع",
    crNumber: "1010678901",
    localityClassification: "local",
    localContentPercentage: 90,
    ownershipType: "Saudi",
    workforceLocalPct: 95,
  },
  {
    name: "TechImport International",
    crNumber: null,
    localityClassification: "non_local",
    localContentPercentage: 10,
    ownershipType: "foreign",
    workforceLocalPct: 5,
  },
  {
    name: "شركة المواد الكيميائية",
    crNumber: "1010789012",
    localityClassification: "local",
    localContentPercentage: 68,
    ownershipType: "Saudi",
    workforceLocalPct: 73,
  },
  {
    name: "Global Services Corp",
    crNumber: null,
    localityClassification: "non_local",
    localContentPercentage: 18,
    ownershipType: "foreign",
    workforceLocalPct: 9,
  },
];

const spendRecords: {
  supplierIdx: number;
  amount: number;
  category: string;
  contractReference: string;
  period: string;
  description: string;
}[] = [
  {
    supplierIdx: 0,
    amount: 5200000,
    category: "technology",
    contractReference: "PO-2025-001",
    period: "Q1",
    description: "خوادم ومعدات شبكات",
  },
  {
    supplierIdx: 0,
    amount: 3100000,
    category: "technology",
    contractReference: "PO-2025-014",
    period: "Q2",
    description: "تراخيص برمجيات وأنظمة تشغيل",
  },
  {
    supplierIdx: 0,
    amount: 2400000,
    category: "technology",
    contractReference: "PO-2025-027",
    period: "Q3",
    description: "خدمات دعم فني وصيانة",
  },
  {
    supplierIdx: 1,
    amount: 3800000,
    category: "construction",
    contractReference: "CTR-2025-002",
    period: "Q1",
    description: "أعمال إنشائية - مبنى الإدارة",
  },
  {
    supplierIdx: 1,
    amount: 2900000,
    category: "construction",
    contractReference: "CTR-2025-015",
    period: "Q2",
    description: "تمديدات كهربائية وميكانيكية",
  },
  {
    supplierIdx: 2,
    amount: 4200000,
    category: "technology",
    contractReference: "PO-2025-003",
    period: "Q1",
    description: "أجهزة حاسب آلي وطابعات",
  },
  {
    supplierIdx: 2,
    amount: 1800000,
    category: "technology",
    contractReference: "PO-2025-018",
    period: "Q2",
    description: "شاشات عرض وأنظمة مؤتمرات",
  },
  {
    supplierIdx: 3,
    amount: 1800000,
    category: "logistics",
    contractReference: "CTR-2025-004",
    period: "Q1",
    description: "خدمات نقل وشحن",
  },
  {
    supplierIdx: 3,
    amount: 1500000,
    category: "logistics",
    contractReference: "CTR-2025-019",
    period: "Q3",
    description: "تخزين وتوزيع",
  },
  {
    supplierIdx: 3,
    amount: 1200000,
    category: "logistics",
    contractReference: "CTR-2025-028",
    period: "Q4",
    description: "خدمات لوجستية متكاملة",
  },
  {
    supplierIdx: 4,
    amount: 2100000,
    category: "goods",
    contractReference: "PO-2025-005",
    period: "Q1",
    description: "قطع غيار معدات أوروبية",
  },
  {
    supplierIdx: 4,
    amount: 1600000,
    category: "goods",
    contractReference: "PO-2025-020",
    period: "Q2",
    description: "مكونات هيدروليكية",
  },
  {
    supplierIdx: 5,
    amount: 2800000,
    category: "goods",
    contractReference: "PO-2025-006",
    period: "Q1",
    description: "مواد بلاستيكية للتغليف",
  },
  {
    supplierIdx: 5,
    amount: 2200000,
    category: "goods",
    contractReference: "PO-2025-021",
    period: "Q2",
    description: "عبوات وأغطية بلاستيكية",
  },
  {
    supplierIdx: 5,
    amount: 1800000,
    category: "goods",
    contractReference: "PO-2025-029",
    period: "Q3",
    description: "مواد تعبئة وتغليف",
  },
  {
    supplierIdx: 6,
    amount: 3500000,
    category: "goods",
    contractReference: "PO-2025-007",
    period: "Q1",
    description: "مواد خام مستوردة",
  },
  {
    supplierIdx: 6,
    amount: 2700000,
    category: "goods",
    contractReference: "PO-2025-022",
    period: "Q3",
    description: "إلكترونيات ومكونات",
  },
  {
    supplierIdx: 7,
    amount: 1400000,
    category: "services",
    contractReference: "CTR-2025-008",
    period: "Q1",
    description: "صيانة مرافق",
  },
  {
    supplierIdx: 7,
    amount: 1300000,
    category: "services",
    contractReference: "CTR-2025-023",
    period: "Q2",
    description: "صيانة أنظمة تكييف",
  },
  {
    supplierIdx: 8,
    amount: 1100000,
    category: "logistics",
    contractReference: "CTR-2025-009",
    period: "Q1",
    description: "نقل داخلي",
  },
  {
    supplierIdx: 8,
    amount: 900000,
    category: "logistics",
    contractReference: "CTR-2025-024",
    period: "Q2",
    description: "توصيل سريع",
  },
  {
    supplierIdx: 9,
    amount: 1900000,
    category: "technology",
    contractReference: "PO-2025-010",
    period: "Q1",
    description: "معدات شبكات مستوردة",
  },
  {
    supplierIdx: 9,
    amount: 1500000,
    category: "technology",
    contractReference: "PO-2025-025",
    period: "Q3",
    description: "أجهزة اتصالات",
  },
  {
    supplierIdx: 10,
    amount: 1700000,
    category: "goods",
    contractReference: "PO-2025-011",
    period: "Q1",
    description: "مواد كيميائية صناعية",
  },
  {
    supplierIdx: 10,
    amount: 1400000,
    category: "goods",
    contractReference: "PO-2025-026",
    period: "Q2",
    description: "منظفات ومواد معالجة",
  },
  {
    supplierIdx: 11,
    amount: 2600000,
    category: "services",
    contractReference: "CTR-2025-012",
    period: "Q1",
    description: "استشارات إدارية",
  },
  {
    supplierIdx: 11,
    amount: 2100000,
    category: "services",
    contractReference: "CTR-2025-030",
    period: "Q3",
    description: "تدريب وتطوير",
  },
  {
    supplierIdx: 11,
    amount: 1600000,
    category: "services",
    contractReference: "CTR-2025-031",
    period: "Q4",
    description: "خدمات تدقيق خارجي",
  },
  {
    supplierIdx: 2,
    amount: 1100000,
    category: "technology",
    contractReference: "PO-2025-032",
    period: "Q4",
    description: "أجهزة لوحية وملحقات",
  },
  {
    supplierIdx: 4,
    amount: 800000,
    category: "goods",
    contractReference: "PO-2025-033",
    period: "Q4",
    description: "أدوات قياس ومعايرة",
  },
];

async function main() {
  console.log("Cleaning existing LocalContentOS data...");
  await prisma.localContentAuditEvent.deleteMany();
  await prisma.localContentReport.deleteMany();
  await prisma.localContentApproval.deleteMany();
  await prisma.localContentReview.deleteMany();
  await prisma.localContentFinding.deleteMany();
  await prisma.localContentEvidence.deleteMany();
  await prisma.localContentClassification.deleteMany();
  await prisma.localContentSpendRecord.deleteMany();
  await prisma.localContentSupplier.deleteMany();
  await prisma.localContentProject.deleteMany();

  console.log("Seeding LocalContentOS demo data...");

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
    select: { id: true, organizationId: true },
  });
  if (!adminUser) {
    throw new Error("Admin user not found. Run prisma/seed.ts first.");
  }

  const project = await prisma.localContentProject.create({
    data: {
      id: "lc-project-demo-001",
      organizationId: adminUser.organizationId,
      name: "شركة الابتكار التقني — تقييم المحتوى المحلي FY2025",
      reportingPeriod: "FY2025",
      scopeDescription:
        "تقييم نسبة المحتوى المحلي في المشتريات والعقود للسنة المالية 2025",
      status: "InReview",
      createdById: adminUser.id,
      createdByName: "Ahmed Al-Mansouri",
    },
  });
  console.log(`  Project: ${project.name}`);

  const createdSuppliers = await Promise.all(
    suppliers.map((s, i) =>
      prisma.localContentSupplier.create({
        data: {
          id: `lc-supplier-${String(i + 1).padStart(2, "0")}`,
          projectId: project.id,
          name: s.name,
          crNumber: s.crNumber,
          localityClassification: s.localityClassification,
          localContentPercentage: s.localContentPercentage,
          ownershipType: s.ownershipType,
          workforceLocalPct: s.workforceLocalPct,
          status: "active",
        },
      }),
    ),
  );
  console.log(`  Suppliers: ${createdSuppliers.length}`);

  const createdSpend = await Promise.all(
    spendRecords.map((sr, i) =>
      prisma.localContentSpendRecord.create({
        data: {
          id: `lc-spend-${String(i + 1).padStart(3, "0")}`,
          projectId: project.id,
          supplierId: createdSuppliers[sr.supplierIdx].id,
          amount: sr.amount,
          currency: "SAR",
          category: sr.category,
          contractReference: sr.contractReference,
          period: sr.period,
          description: sr.description,
        },
      }),
    ),
  );
  console.log(`  Spend records: ${createdSpend.length}`);

  const totalSpend = createdSpend.reduce((sum, r) => sum + r.amount, 0);
  console.log(`  Total spend: SAR ${totalSpend.toLocaleString()}`);

  const classificationBases = [
    "certificate",
    "certificate",
    "contract_term",
    "certificate",
    "self_declaration",
    "certificate",
    "analyst_estimate",
    "contract_term",
    "certificate",
    "analyst_estimate",
    "contract_term",
    "self_declaration",
  ];
  const classifications = await Promise.all(
    createdSuppliers.map((supplier, i) =>
      prisma.localContentClassification.create({
        data: {
          id: `lc-class-${String(i + 1).padStart(2, "0")}`,
          projectId: project.id,
          supplierId: supplier.id,
          classifiedBy: "admin-demo",
          localPercentage: supplier.localContentPercentage || 0,
          classificationBasis: classificationBases[i] || "analyst_estimate",
          confidence: i < 5 ? "high" : i < 9 ? "medium" : "low",
          notes:
            supplier.ownershipType === "Saudi"
              ? "مصنف كمورد محلي بناءً على السجل التجاري وشهادة المحتوى المحلي"
              : supplier.ownershipType === "foreign"
                ? "مصنف كمورد غير محلي بناءً على بيانات السجل"
                : "يحتاج مراجعة إضافية — مورد مشترك",
          reviewStatus: i < 8 ? "confirmed" : "draft",
        },
      }),
    ),
  );
  console.log(`  Classifications: ${classifications.length}`);

  const evidenceData = [
    {
      supplierIdx: 0,
      filename: "شهادة-محتوى-محلي-التقنية-المتقدمة.pdf",
      fileType: "pdf",
      evidenceType: "certificate",
      status: "verified",
    },
    {
      supplierIdx: 1,
      filename: "شهادة-محتوى-محلي-الهندسية.pdf",
      fileType: "pdf",
      evidenceType: "certificate",
      status: "verified",
    },
    {
      supplierIdx: 2,
      filename: "GlobalTech-contract.pdf",
      fileType: "pdf",
      evidenceType: "contract",
      status: "reviewed",
    },
    {
      supplierIdx: 3,
      filename: "شهادة-محلية-الخدمات-اللوجستية.pdf",
      fileType: "pdf",
      evidenceType: "certificate",
      status: "verified",
    },
    {
      supplierIdx: 4,
      filename: "EuroParts-self-declaration.pdf",
      fileType: "pdf",
      evidenceType: "attestation",
      status: "reviewed",
    },
    {
      supplierIdx: 5,
      filename: "شهادة-محتوى-محلي-البلاستيك-الوطني.pdf",
      fileType: "pdf",
      evidenceType: "certificate",
      status: "verified",
    },
    {
      supplierIdx: 6,
      filename: "AsiaTrade-invoice-Q1.pdf",
      fileType: "pdf",
      evidenceType: "invoice",
      status: "uploaded",
    },
    {
      supplierIdx: 7,
      filename: "عقد-الصيانة-المتكاملة.pdf",
      fileType: "pdf",
      evidenceType: "contract",
      status: "reviewed",
    },
    {
      supplierIdx: 8,
      filename: "شهادة-تسجيل-النقل-السريع.pdf",
      fileType: "pdf",
      evidenceType: "registration",
      status: "verified",
    },
    {
      supplierIdx: 9,
      filename: "TechImport-contract.pdf",
      fileType: "pdf",
      evidenceType: "contract",
      status: "uploaded",
    },
    {
      supplierIdx: 10,
      filename: "شهادة-محتوى-محلي-الكيميائية.pdf",
      fileType: "pdf",
      evidenceType: "certificate",
      status: "verified",
    },
    {
      supplierIdx: 11,
      filename: "GlobalServices-contract.pdf",
      fileType: "pdf",
      evidenceType: "contract",
      status: "linked",
    },
    {
      supplierIdx: 6,
      filename: "AsiaTrade-attestation.docx",
      fileType: "docx",
      evidenceType: "attestation",
      status: "missing",
    },
    {
      supplierIdx: 4,
      filename: "EuroParts-invoice-Q2.pdf",
      fileType: "pdf",
      evidenceType: "invoice",
      status: "linked",
    },
    {
      supplierIdx: 9,
      filename: "TechImport-invoice-Q3.pdf",
      fileType: "pdf",
      evidenceType: "invoice",
      status: "missing",
    },
  ];

  const evidence = await Promise.all(
    evidenceData.map((ed, i) =>
      prisma.localContentEvidence.create({
        data: {
          id: `lc-evidence-${String(i + 1).padStart(2, "0")}`,
          projectId: project.id,
          supplierId: createdSuppliers[ed.supplierIdx].id,
          filename: ed.filename,
          fileType: ed.fileType,
          evidenceType: ed.evidenceType,
          status: ed.status,
          storageKey: `localcontent/demo/${ed.filename}`,
          reviewedById: ed.status === "verified" ? "reviewer-demo" : null,
          reviewedAt: ed.status === "verified" ? now() : null,
        },
      }),
    ),
  );
  console.log(`  Evidence: ${evidence.length}`);

  const findings = await Promise.all([
    prisma.localContentFinding.create({
      data: {
        id: "lc-finding-01",
        projectId: project.id,
        type: "low_content",
        severity: "high",
        title: "انخفاض المحتوى المحلي في قطاع تقنية المعلومات",
        description:
          "ثلاثة موردين أجانب يشكلون 38% من إجمالي الإنفاق على تقنية المعلومات بمتوسط محتوى محلي 15% فقط. يوصى بالبحث عن بدائل محلية أو فرض نسبة دنيا في العقود المستقبلية.",
        linkedSupplierId: createdSuppliers[2].id,
        status: "submitted",
        createdById: "admin-demo",
        createdByName: "Ahmed Al-Mansouri",
      },
    }),
    prisma.localContentFinding.create({
      data: {
        id: "lc-finding-02",
        projectId: project.id,
        type: "evidence_gap",
        severity: "medium",
        title: "شهادة محتوى محلي مفقودة لمورد المشروع المشترك",
        description:
          "شركة الصيانة المتكاملة (مشروع مشترك) لا تملك شهادة محتوى محلي معتمدة. التصنيف الحالي مبني على شروط العقد فقط.",
        linkedSupplierId: createdSuppliers[7].id,
        status: "submitted",
        createdById: "admin-demo",
        createdByName: "Ahmed Al-Mansouri",
      },
    }),
    prisma.localContentFinding.create({
      data: {
        id: "lc-finding-03",
        projectId: project.id,
        type: "low_content",
        severity: "medium",
        title: "تركز الإنفاق غير المحلي في 3 موردين أجانب",
        description:
          "ثلاثة موردين أجانب (GlobalTech, AsiaTrade, TechImport) يستحوذون على 38% من إجمالي الإنفاق غير المحلي.",
        status: "draft",
        createdById: "admin-demo",
        createdByName: "Ahmed Al-Mansouri",
      },
    }),
    prisma.localContentFinding.create({
      data: {
        id: "lc-finding-04",
        projectId: project.id,
        type: "data_quality",
        severity: "low",
        title: "تصنيف مورد مواد البناء معتمد على إقرار ذاتي فقط",
        description:
          "تصنيف EuroParts يعتمد على إقرار ذاتي بدون شهادة محتوى محلي معتمدة أو تدقيق خارجي.",
        linkedSupplierId: createdSuppliers[4].id,
        status: "submitted",
        createdById: "admin-demo",
        createdByName: "Ahmed Al-Mansouri",
      },
    }),
    prisma.localContentFinding.create({
      data: {
        id: "lc-finding-05",
        projectId: project.id,
        type: "data_quality",
        severity: "low",
        title: "غياب بيانات القوى العاملة لأربعة موردين أجانب",
        description:
          "أربعة موردين أجانب ليس لديهم بيانات نسبة السعودة، مما يؤثر على دقة حساب المحتوى المحلي الإجمالي.",
        status: "draft",
        createdById: "admin-demo",
        createdByName: "Ahmed Al-Mansouri",
      },
    }),
  ]);
  console.log(`  Findings: ${findings.length}`);

  const review = await prisma.localContentReview.create({
    data: {
      id: "lc-review-01",
      projectId: project.id,
      reviewerId: "reviewer-demo",
      reviewerName: "Sara Al-Otaibi",
      action: "submitted",
      comments:
        "تم مراجعة التصنيفات والأدلة. توجد ملاحظات على تصنيف الموردين الأجانب — يرجى تحديث البيانات.",
      status: "in_review",
    },
  });
  console.log(`  Review: ${review.id}`);

  const approval = await prisma.localContentApproval.create({
    data: {
      id: "lc-approval-01",
      projectId: project.id,
      approverId: "approver-demo",
      approverName: "Mohammad Al-Harbi",
      decision: "approved",
      comments: "تم اعتماد تقييم المحتوى المحلي للمشروع بعد استكمال المراجعة.",
    },
  });
  console.log(`  Approval: ${approval.id}`);

  const auditEvents = await Promise.all([
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-01",
        projectId: project.id,
        actorId: "admin-demo",
        actorName: "Ahmed Al-Mansouri",
        action: "project.created",
        entityType: "LocalContentProject",
        entityId: project.id,
      },
    }),
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-02",
        projectId: project.id,
        actorId: "admin-demo",
        actorName: "Ahmed Al-Mansouri",
        action: "suppliers.imported",
        entityType: "LocalContentSupplier",
        entityId: createdSuppliers[0].id,
        metadata: { count: createdSuppliers.length },
      },
    }),
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-03",
        projectId: project.id,
        actorId: "admin-demo",
        actorName: "Ahmed Al-Mansouri",
        action: "spend.imported",
        entityType: "LocalContentSpendRecord",
        entityId: createdSpend[0].id,
        metadata: { count: createdSpend.length },
      },
    }),
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-04",
        projectId: project.id,
        actorId: "admin-demo",
        actorName: "Ahmed Al-Mansouri",
        action: "classifications.completed",
        entityType: "LocalContentClassification",
        entityId: classifications[0].id,
        metadata: { count: classifications.length },
      },
    }),
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-05",
        projectId: project.id,
        actorId: "reviewer-demo",
        actorName: "Sara Al-Otaibi",
        action: "review.submitted",
        entityType: "LocalContentReview",
        entityId: review.id,
      },
    }),
    prisma.localContentAuditEvent.create({
      data: {
        id: "lc-audit-06",
        projectId: project.id,
        actorId: "approver-demo",
        actorName: "Mohammad Al-Harbi",
        action: "approval.decided",
        entityType: "LocalContentApproval",
        entityId: approval.id,
        metadata: { decision: "approved" },
      },
    }),
  ]);
  console.log(`  Audit events: ${auditEvents.length}`);

  console.log("\nLocalContentOS seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
