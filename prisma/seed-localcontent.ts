import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LocalContentOS...");

  // ── Reference existing records ──────────────────────────────
  const platformOrg = await prisma.platformOrganization.findFirst({
    where: { slug: "aqliya-demo" },
  });
  if (!platformOrg) throw new Error("PlatformOrganization 'aqliya-demo' not found. Run seed.ts first.");

  const org = await prisma.organization.findFirst({
    where: { platformOrganizationId: platformOrg.id },
  });
  if (!org) throw new Error("Organization not found. Run seed.ts first.");

  const admin = await prisma.user.findFirst({
    where: { email: "admin@aqliya.com" },
  });
  const reviewer = await prisma.user.findFirst({
    where: { email: "sara@aqliya.com" },
  });
  if (!admin || !reviewer) throw new Error("Users not found. Run seed.ts first.");

  const workspace = await prisma.clientWorkspace.findFirst({
    where: { platformOrganizationId: platformOrg.id, slug: "gulf-trading" },
  });

  // ── Helper ───────────────────────────────────────────────────
  const auditEvent = (projectId: string, actorId: string, actorName: string, action: string, entityType: string, entityId: string, metadata?: any) =>
    prisma.localContentAuditEvent.create({
      data: { projectId, actorId, actorName, action, entityType, entityId, metadata },
    });

  // ── Projects ─────────────────────────────────────────────────
  const projects = [
    {
      name: "مشروع تطوير المحتوى المحلي 2026",
      reportingPeriod: "2026-Q1",
      scopeDescription: "تقييم وتطوير المحتوى المحلي للمؤسسة للربع الأول 2026، مع تركيز على رفع نسبة المحتوى المحلي في المشتريات والخدمات.",
      status: "Approved",
      localContentScore: 42.5,
    },
    {
      name: "مبادرة توطين المشتريات",
      reportingPeriod: "2026-H1",
      scopeDescription: "مبادرة استراتيجية لتوطين المشتريات وزيادة الاعتماد على الموردين المحليين في النصف الأول من 2026.",
      status: "InReview",
      localContentScore: 35.0,
    },
    {
      name: "برنامج تعزيز المحتوى السعودي",
      reportingPeriod: "2026-Q2",
      scopeDescription: "برنامج شامل لتعزيز المحتوى السعودي في العقود والمناقصات الحكومية وفق متطلبات هيئة المحتوى المحلي.",
      status: "DataCollection",
      localContentScore: null,
    },
    {
      name: "مشروع تقييم الموردين",
      reportingPeriod: "2026-Q1",
      scopeDescription: "تقييم شامل للموردين من حيث نسبة المحتوى المحلي والتوطين والامتثال لمتطلبات الهيئة.",
      status: "ClassificationInProgress",
      localContentScore: null,
    },
    {
      name: "حوكمة الإنفاق المحلي",
      reportingPeriod: "2026-H1",
      scopeDescription: "حوكمة الإنفاق المحلي وربط المصروفات بنسب المحتوى المحلي لكل مورد وفئة إنفاق.",
      status: "Draft",
      localContentScore: null,
    },
  ];

  const createdProjects: any[] = [];
  for (const p of projects) {
    const project = await prisma.localContentProject.create({
      data: {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        clientWorkspaceId: workspace?.id,
        projectId: workspace ? undefined : undefined,
        name: p.name,
        reportingPeriod: p.reportingPeriod,
        scopeDescription: p.scopeDescription,
        status: p.status,
        localContentScore: p.localContentScore,
        createdById: admin.id,
        createdByName: admin.name,
      },
    });
    createdProjects.push(project);
    await auditEvent(project.id, admin.id, admin.name, "project_created", "LocalContentProject", project.id, {
      name: p.name,
      status: p.status,
    });
  }
  console.log(`Created ${createdProjects.length} LocalContentProjects`);

  // ── Suppliers ────────────────────────────────────────────────
  const supplierData = [
    { name: "شركة الابتكار التقني", cr: "CR-2020-12345", locality: "local", lcPct: 78, ownership: "Saudi", workforce: 85 },
    { name: "المتحدة للخدمات اللوجستية", cr: "CR-2019-54321", locality: "local", lcPct: 65, ownership: "Saudi", workforce: 70 },
    { name: "الرعاية الصحية الرقمية", cr: "CR-2021-98765", locality: "local", lcPct: 55, ownership: "Saudi", workforce: 60 },
    { name: "مؤسسة البناء المتقدم", cr: "CR-2018-11111", locality: "local", lcPct: 82, ownership: "Saudi", workforce: 90 },
    { name: "شركة التقنيات الصناعية", cr: "CR-2022-22222", locality: "local", lcPct: 70, ownership: "Saudi", workforce: 75 },
    { name: "مجموعة الخليج للتجارة", cr: "CR-2017-33333", locality: "mixed", lcPct: 45, ownership: "joint_venture", workforce: 50 },
    { name: "شركة الحلول المتكاملة", cr: "CR-2020-44444", locality: "local", lcPct: 88, ownership: "Saudi", workforce: 92 },
    { name: "المؤسسة السعودية للخدمات", cr: "CR-2019-55555", locality: "local", lcPct: 72, ownership: "Saudi", workforce: 78 },
    { name: "شركة التوريدات الفنية", cr: "CR-2021-66666", locality: "local", lcPct: 60, ownership: "Saudi", workforce: 65 },
    { name: "مجموعة الاتصالات المتطورة", cr: "CR-2022-77777", locality: "mixed", lcPct: 40, ownership: "joint_venture", workforce: 45 },
    { name: "شركة الغذاء السعودي", cr: "CR-2018-88888", locality: "local", lcPct: 90, ownership: "Saudi", workforce: 95 },
    { name: "مؤسسة الصيانة والخدمات", cr: "CR-2020-99999", locality: "local", lcPct: 68, ownership: "Saudi", workforce: 72 },
  ];

  // Distribute suppliers across projects (each project gets a subset)
  const projectSupplierMap: Record<number, number[]> = {
    0: [0, 1, 2, 5, 8],
    1: [0, 3, 4, 6, 9, 10],
    2: [1, 3, 5, 7, 10, 11],
    3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    4: [0, 2, 4, 6, 7, 8, 11],
  };

  const createdSuppliers: any[] = [];
  for (const [projIdx, supplierIdxs] of Object.entries(projectSupplierMap)) {
    const project = createdProjects[parseInt(projIdx)];
    for (const si of supplierIdxs) {
      const s = supplierData[si];
      const supplier = await prisma.localContentSupplier.create({
        data: {
          projectId: project.id,
          name: s.name,
          crNumber: s.cr,
          localityClassification: s.locality,
          localContentPercentage: s.lcPct,
          ownershipType: s.ownership,
          workforceLocalPct: s.workforce,
          status: "active",
          createdById: admin.id,
        },
      });
      createdSuppliers.push(supplier);
    }
  }
  console.log(`Created ${createdSuppliers.length} LocalContentSuppliers across projects`);

  // ── Workbooks ────────────────────────────────────────────────
  const workbookData = [
    { projectIdx: 0, title: "الربع الأول 2026", period: "2026-Q1" },
    { projectIdx: 0, title: "الربع الثاني 2026", period: "2026-Q2" },
    { projectIdx: 1, title: "النصف الأول 2026", period: "2026-H1" },
    { projectIdx: 2, title: "الربع الثاني 2026", period: "2026-Q2" },
    { projectIdx: 3, title: "تقييم الربع الأول", period: "2026-Q1" },
    { projectIdx: 3, title: "تقييم الربع الثاني", period: "2026-Q2" },
    { projectIdx: 4, title: "حوكمة النصف الأول", period: "2026-H1" },
    { projectIdx: 4, title: "حوكمة النصف الثاني", period: "2026-H2" },
  ];

  const workbookSections = [
    { code: "REV-01", name: "إجمالي الإيرادات", section: "revenue" },
    { code: "REV-02", name: "الإيرادات من العقود الحكومية", section: "revenue" },
    { code: "COS-01", name: "تكلفة المواد الموردة محلياً", section: "cost_of_sales" },
    { code: "COS-02", name: "تكلفة الخدمات المستوردة", section: "cost_of_sales" },
    { code: "COS-03", name: "تكلفة العمالة الوطنية", section: "cost_of_sales" },
    { code: "SPS-01", name: "إجمالي مشتريات الموردين", section: "supplier_spend" },
    { code: "SPS-02", name: "مشتريات من موردين محليين", section: "supplier_spend" },
    { code: "SPS-03", name: "مشتريات من منشآت صغيرة ومتوسطة", section: "supplier_spend" },
    { code: "WRK-01", name: "نسبة القوى العاملة الوطنية", section: "workforce" },
    { code: "WRK-02", name: "نسبة رواتب السعوديين", section: "workforce" },
    { code: "AST-01", name: "الأصول الثابتة المنتجة محلياً", section: "assets" },
    { code: "AST-02", name: "الاستثمار في المحتوى المحلي", section: "assets" },
  ];

  const createdWorkbooks: any[] = [];
  for (const wb of workbookData) {
    const project = createdProjects[wb.projectIdx];
    const workbook = await prisma.lcWorkbook.create({
      data: {
        projectId: project.id,
        title: wb.title,
        reportingPeriod: wb.period,
        status: wb.projectIdx <= 1 ? "complete" : wb.projectIdx === 3 ? "partial" : "draft",
        totalLines: workbookSections.length,
        autoFilledLines: Math.floor(workbookSections.length * (wb.projectIdx <= 1 ? 0.8 : 0.3)),
        missingLines: wb.projectIdx <= 1 ? 1 : 4,
        completionPct: wb.projectIdx <= 1 ? 92 : wb.projectIdx === 3 ? 45 : 15,
        lcScore: wb.projectIdx <= 1 ? (wb.projectIdx === 0 ? 42.5 : 39.0) : 30.0,
        lcScoreComputedAt: wb.projectIdx <= 1 ? new Date() : null,
        createdById: admin.id,
      },
    });
    createdWorkbooks.push(workbook);

    // Create workbook lines
    for (const line of workbookSections) {
      const auto = ["REV-01", "COS-01", "SPS-01", "WRK-01", "AST-01"].includes(line.code);
      await prisma.lcWorkbookLine.create({
        data: {
          workbookId: workbook.id,
          section: line.section,
          code: line.code,
          name: line.name,
          autoFillable: auto,
          autoFilled: auto && wb.projectIdx <= 1,
          autoFillValue: auto ? Math.random() * 5000000 + 1000000 : null,
          autoFillSource: auto ? "tb_classification" : null,
          manualValue: auto ? null : Math.random() * 3000000 + 500000,
          source: auto ? "tb" : "manual",
          confidence: wb.projectIdx <= 1 ? "high" : "medium",
          evidenceRequired: line.section === "supplier_spend" || line.section === "assets",
          displayOrder: workbookSections.indexOf(line) + 1,
        },
      });
    }
  }
  console.log(`Created ${createdWorkbooks.length} LcWorkbooks with lines`);

  // ── Spend Records ────────────────────────────────────────────
  const spendData = [
    { projIdx: 0, supIdx: 0, amount: 1250000, cat: "technology", contract: "CON-2026-001", period: "2026-Q1", desc: "تطوير منصة رقمية للمحتوى المحلي" },
    { projIdx: 0, supIdx: 1, amount: 875000, cat: "logistics", contract: "CON-2026-002", period: "2026-Q1", desc: "خدمات لوجستية لدعم المشاريع" },
    { projIdx: 0, supIdx: 2, amount: 450000, cat: "services", contract: "CON-2026-003", period: "2026-Q1", desc: "استشارات رعاية صحية رقمية" },
    { projIdx: 0, supIdx: 5, amount: 620000, cat: "goods", contract: "CON-2026-004", period: "2026-Q1", desc: "توريد مواد ومعدات" },
    { projIdx: 0, supIdx: 8, amount: 340000, cat: "services", contract: "CON-2026-005", period: "2026-Q1", desc: "خدمات توريدات فنية" },
    { projIdx: 1, supIdx: 0, amount: 2100000, cat: "technology", contract: "CON-2026-006", period: "2026-H1", desc: "حلول تقنية متكاملة لتوطين المشتريات" },
    { projIdx: 1, supIdx: 3, amount: 980000, cat: "construction", contract: "CON-2026-007", period: "2026-H1", desc: "أعمال إنشائية وتطوير البنية التحتية" },
    { projIdx: 1, supIdx: 4, amount: 750000, cat: "technology", contract: "CON-2026-008", period: "2026-H1", desc: "تقنيات صناعية وأتمتة" },
    { projIdx: 1, supIdx: 6, amount: 560000, cat: "services", contract: "CON-2026-009", period: "2026-H1", desc: "خدمات حلول متكاملة" },
    { projIdx: 1, supIdx: 9, amount: 1100000, cat: "technology", contract: "CON-2026-010", period: "2026-H1", desc: "خدمات اتصالات وتقنية" },
    { projIdx: 1, supIdx: 10, amount: 420000, cat: "goods", contract: "CON-2026-011", period: "2026-H1", desc: "توريد مواد غذائية" },
    { projIdx: 2, supIdx: 1, amount: 380000, cat: "logistics", contract: "CON-2026-012", period: "2026-Q2", desc: "خدمات لوجستية للمحتوى السعودي" },
    { projIdx: 2, supIdx: 3, amount: 1500000, cat: "construction", contract: "CON-2026-013", period: "2026-Q2", desc: "مشاريع بناء متقدم" },
    { projIdx: 2, supIdx: 5, amount: 290000, cat: "goods", contract: "CON-2026-014", period: "2026-Q2", desc: "توريدات تجارية متنوعة" },
    { projIdx: 2, supIdx: 7, amount: 520000, cat: "services", contract: "CON-2026-015", period: "2026-Q2", desc: "خدمات مؤسسية سعودية" },
    { projIdx: 2, supIdx: 10, amount: 680000, cat: "goods", contract: "CON-2026-016", period: "2026-Q2", desc: "توريد منتجات غذائية سعودية" },
    { projIdx: 2, supIdx: 11, amount: 310000, cat: "services", contract: "CON-2026-017", period: "2026-Q2", desc: "خدمات صيانة وتشغيل" },
    { projIdx: 3, supIdx: 0, amount: 880000, cat: "technology", contract: "CON-2026-018", period: "2026-Q1", desc: "تقييم منصات تقنية" },
    { projIdx: 3, supIdx: 2, amount: 275000, cat: "services", contract: "CON-2026-019", period: "2026-Q1", desc: "استشارات تقييم صحية" },
    { projIdx: 3, supIdx: 4, amount: 410000, cat: "technology", contract: "CON-2026-020", period: "2026-Q1", desc: "تقييم تقنيات صناعية" },
    { projIdx: 3, supIdx: 7, amount: 195000, cat: "services", contract: "CON-2026-021", period: "2026-Q1", desc: "خدمات تقييم مؤسسية" },
    { projIdx: 4, supIdx: 0, amount: 670000, cat: "technology", contract: "CON-2026-022", period: "2026-H1", desc: "منصة حوكمة الإنفاق" },
    { projIdx: 4, supIdx: 4, amount: 340000, cat: "technology", contract: "CON-2026-023", period: "2026-H1", desc: "أنظمة رقابة تقنية" },
    { projIdx: 4, supIdx: 6, amount: 520000, cat: "services", contract: "CON-2026-024", period: "2026-H1", desc: "خدمات حوكمة واستشارات" },
    { projIdx: 4, supIdx: 8, amount: 285000, cat: "services", contract: "CON-2026-025", period: "2026-H1", desc: "خدمات توريدات فنية للحوكمة" },
  ];

  for (const sp of spendData) {
    const project = createdProjects[sp.projIdx];
    const supplierKey = createdSuppliers.findIndex(
      (s) => s.projectId === project.id && s.name === supplierData[sp.supIdx].name,
    );
    const supplier = createdSuppliers[supplierKey >= 0 ? supplierKey : 0];
    await prisma.localContentSpendRecord.create({
      data: {
        projectId: project.id,
        supplierId: supplier.id,
        amount: sp.amount,
        currency: "SAR",
        category: sp.cat,
        contractReference: sp.contract,
        period: sp.period,
        description: sp.desc,
        createdById: admin.id,
      },
    });
  }
  console.log(`Created ${spendData.length} LocalContentSpendRecords`);

  // ── Classifications ──────────────────────────────────────────
  const classifications = [
    { projIdx: 0, supIdx: 0, localPct: 78, basis: "certificate", confidence: "high", notes: "شهادة محتوى محلي سارية من هيئة المحتوى المحلي" },
    { projIdx: 0, supIdx: 1, localPct: 65, basis: "self_declaration", confidence: "medium", notes: "إقرار ذاتي مع مستندات داعمة" },
    { projIdx: 0, supIdx: 2, localPct: 55, basis: "analyst_estimate", confidence: "low", notes: "تقدير محلل بناء على تقارير متوفرة" },
    { projIdx: 1, supIdx: 0, localPct: 80, basis: "certificate", confidence: "high", notes: "شهادة محدثة 2026" },
    { projIdx: 1, supIdx: 3, localPct: 82, basis: "certificate", confidence: "high", notes: "نسبة محتوى محلي عالية وفقاً للشهادة الرسمية" },
    { projIdx: 3, supIdx: 5, localPct: 45, basis: "contract_term", confidence: "medium", notes: "حسب بنود العقد مع شريك المشروع المشترك" },
    { projIdx: 3, supIdx: 9, localPct: 40, basis: "self_declaration", confidence: "low", notes: "إفادة من المورد تحتاج تدقيقاً إضافياً" },
  ];

  for (const cl of classifications) {
    const project = createdProjects[cl.projIdx];
    const supplierKey = createdSuppliers.findIndex(
      (s) => s.projectId === project.id && s.name === supplierData[cl.supIdx].name,
    );
    const supplier = createdSuppliers[supplierKey >= 0 ? supplierKey : 0];
    await prisma.localContentClassification.create({
      data: {
        projectId: project.id,
        supplierId: supplier.id,
        classifiedBy: admin.name,
        localPercentage: cl.localPct,
        classificationBasis: cl.basis,
        confidence: cl.confidence,
        notes: cl.notes,
        reviewStatus: cl.confidence === "high" ? "reviewed" : "draft",
      },
    });
  }
  console.log(`Created ${classifications.length} LocalContentClassifications`);

  // ── Evidence ─────────────────────────────────────────────────
  const evidenceData = [
    { projIdx: 0, supIdx: 0, filename: "شهادة_محتوى_محلي_ابتكار_تقني.pdf", type: "pdf", etype: "certificate", size: 245760, desc: "شهادة المحتوى المحلي - شركة الابتكار التقني" },
    { projIdx: 0, supIdx: 1, filename: "عقد_خدمات_لوجستية_2026.pdf", type: "pdf", etype: "contract", size: 512000, desc: "عقد الخدمات اللوجستية 2026" },
    { projIdx: 0, supIdx: 2, filename: "فاتورة_استشارات_رقمية.pdf", type: "pdf", etype: "invoice", size: 102400, desc: "فاتورة استشارات الرعاية الصحية الرقمية" },
    { projIdx: 1, supIdx: 0, filename: "تقرير_توطين_المشتريات.xlsx", type: "xlsx", etype: "attestation", size: 389120, desc: "تقرير توطين المشتريات - النصف الأول" },
    { projIdx: 1, supIdx: 3, filename: "شهادة_بناء_متقدم.jpg", type: "jpg", etype: "certificate", size: 204800, desc: "صورة شهادة المحتوى المحلي - البناء المتقدم" },
    { projIdx: 2, supIdx: 10, filename: "عقد_توريد_غذائي_سعودي.pdf", type: "pdf", etype: "contract", size: 180000, desc: "عقد توريد المنتجات الغذائية السعودية" },
    { projIdx: 3, supIdx: 0, filename: "سجل_تقييم_الموردين.xlsx", type: "xlsx", etype: "other", size: 450000, desc: "سجل تقييم الموردين الربع الأول" },
    { projIdx: 4, supIdx: 6, filename: "تقرير_حوكمة_الإنفاق.pdf", type: "pdf", etype: "attestation", size: 310000, desc: "تقرير حوكمة الإنفاق المحلي" },
  ];

  for (const ev of evidenceData) {
    const project = createdProjects[ev.projIdx];
    const supplierKey = createdSuppliers.findIndex(
      (s) => s.projectId === project.id && s.name === supplierData[ev.supIdx].name,
    );
    const supplier = createdSuppliers[supplierKey >= 0 ? supplierKey : 0];
    await prisma.localContentEvidence.create({
      data: {
        projectId: project.id,
        supplierId: supplier.id,
        filename: ev.filename,
        fileType: ev.type,
        mimeType: ev.type === "pdf" ? "application/pdf" : ev.type === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "image/jpeg",
        storageKey: `localcontent/${project.id}/evidence/${ev.filename}`,
        fileHash: `hash-${project.id.slice(0, 6)}-${Buffer.from(ev.filename).toString("base64").slice(0, 12)}`,
        sizeBytes: ev.size,
        evidenceType: ev.etype,
        status: "uploaded",
        createdById: admin.id,
      },
    });
  }
  console.log(`Created ${evidenceData.length} LocalContentEvidence records`);

  // ── Findings ─────────────────────────────────────────────────
  const findingData = [
    {
      projIdx: 0,
      type: "low_content",
      severity: "high",
      title: "نسبة محتوى محلي منخفضة في الخدمات اللوجستية",
      description: "شركة المتحدة للخدمات اللوجستية تظهر نسبة محتوى محلي 65% فقط، وهي أقل من الحد الأدنى المطلوب 70% للقطاع.",
      linkedSupIdx: 1,
    },
    {
      projIdx: 0,
      type: "evidence_gap",
      severity: "medium",
      title: "نقص في أدلة الإقرار الذاتي",
      description: "تصنيف المحتوى المحلي لشركة الرعاية الصحية الرقمية يعتمد على تقدير محلل بدون أدلة كافية.",
      linkedSupIdx: 2,
    },
    {
      projIdx: 3,
      type: "unclassified_supplier",
      severity: "high",
      title: "موردون بدون تصنيف محتوى محلي",
      description: "هناك 3 موردين في المشروع لم يتم تصنيفهم بعد من حيث المحتوى المحلي، مما يؤثر على دقة التقرير.",
      linkedSupIdx: null,
    },
    {
      projIdx: 1,
      type: "compliance_risk",
      severity: "critical",
      title: "مخاطر امتثال في المشاريع المشتركة",
      description: "مجموعة الاتصالات المتطورة (مشروع مشترك) لديها نسبة محتوى محلي 40% فقط، مما يشكل مخاطر امتثال لمتطلبات الهيئة.",
      linkedSupIdx: 9,
    },
  ];

  for (const fd of findingData) {
    const project = createdProjects[fd.projIdx];
    let linkedSupplierId: string | undefined;
    if (fd.linkedSupIdx !== null) {
      const sk = createdSuppliers.findIndex(
        (s) => s.projectId === project.id && s.name === supplierData[fd.linkedSupIdx!].name,
      );
      if (sk >= 0) linkedSupplierId = createdSuppliers[sk].id;
    }
    await prisma.localContentFinding.create({
      data: {
        projectId: project.id,
        type: fd.type,
        severity: fd.severity,
        title: fd.title,
        description: fd.description,
        linkedSupplierId,
        status: fd.severity === "critical" ? "submitted" : "draft",
        createdById: admin.id,
        createdByName: admin.name,
      },
    });
  }
  console.log(`Created ${findingData.length} LocalContentFindings`);

  // ── Reviews ──────────────────────────────────────────────────
  const reviewData = [
    {
      projIdx: 0,
      action: "submitted",
      comments: "تم استكمال جميع البيانات والمستندات المطلوبة. يُرجى مراجعة نسب المحتوى المحلي والتوصيات.",
      status: "completed",
    },
    {
      projIdx: 1,
      action: "returned",
      comments: "الرجاء توفير أدلة إضافية لتصنيف مجموعة الاتصالات المتطورة وتحديث تقييم المخاطر.",
      status: "returned",
    },
    {
      projIdx: 0,
      action: "commented",
      comments: "ملاحظة: يوجد قصور في أدلة تصنيف الموردين غير الحاصلين على شهادات. يرجى المعالجة قبل الاعتماد النهائي.",
      status: "in_review",
    },
  ];

  for (const rv of reviewData) {
    const project = createdProjects[rv.projIdx];
    await prisma.localContentReview.create({
      data: {
        projectId: project.id,
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        action: rv.action,
        comments: rv.comments,
        status: rv.status,
      },
    });
  }
  console.log(`Created ${reviewData.length} LocalContentReviews`);

  // ── Approvals ────────────────────────────────────────────────
  const approvalData = [
    {
      projIdx: 0,
      decision: "approved" as const,
      comments: "تمت الموافقة على مشروع تطوير المحتوى المحلي 2026 بعد استكمال الملاحظات.",
    },
  ];

  for (const ap of approvalData) {
    const project = createdProjects[ap.projIdx];
    await prisma.localContentApproval.create({
      data: {
        projectId: project.id,
        approverId: admin.id,
        approverName: admin.name,
        decision: ap.decision,
        comments: ap.comments,
      },
    });
  }
  console.log(`Created ${approvalData.length} LocalContentApprovals`);

  // ── Reports ──────────────────────────────────────────────────
  const reportData = [
    {
      projIdx: 0,
      reportType: "assessment_summary" as const,
      format: "pdf" as const,
      disclaimer: "تقرير تقييم المحتوى المحلي - الربع الأول 2026. هذا التقرير لأغراض داخلية ولا يمثل شهادة رسمية.",
    },
    {
      projIdx: 0,
      reportType: "supplier_register" as const,
      format: "xlsx" as const,
      disclaimer: "سجل الموردين حسب تصنيف المحتوى المحلي. يتم التحديث بشكل دوري.",
    },
    {
      projIdx: 1,
      reportType: "spend_classification" as const,
      format: "xlsx" as const,
      disclaimer: "تصنيف الإنفاق حسب المحتوى المحلي للنصف الأول 2026.",
    },
  ];

  for (const rp of reportData) {
    const project = createdProjects[rp.projIdx];
    await prisma.localContentReport.create({
      data: {
        projectId: project.id,
        reportType: rp.reportType,
        format: rp.format,
        status: "generated",
        generatedById: admin.id,
        generatedByName: admin.name,
        storageKey: `localcontent/${project.id}/reports/${rp.reportType}-${rp.format}.${rp.format}`,
        disclaimer: rp.disclaimer,
      },
    });
  }
  console.log(`Created ${reportData.length} LocalContentReports`);

  // ── Final audit events ────────────────────────────────────────
  await prisma.platformAuditLog.createMany({
    data: [
      {
        platformOrganizationId: platformOrg.id,
        productKey: "localcontentos",
        actorId: admin.id,
        actorName: admin.name,
        action: "seed",
        targetType: "LocalContentOS",
        targetId: "bulk",
        targetLabel: `Seeded ${createdProjects.length} projects, ${createdSuppliers.length} suppliers, ${spendData.length} spend records, ${evidenceData.length} evidence, ${findingData.length} findings`,
        severity: "info",
        metadata: { source: "seed-localcontent" },
      },
    ],
  });
  console.log("Created platform audit log for seed");

  console.log("LocalContentOS seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
