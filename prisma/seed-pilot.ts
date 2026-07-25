import { config } from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  UserRole,
  DecisionType,
  DecisionStatus,
  RiskLevel,
  EngagementType,
  ScenarioType,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });


// =============================================================================
// AQLIYA PILOT SEED DATA v1.2
// =============================================================================
//
// Purpose:
//   Generates a complete, realistic pilot environment for AQLIYA with
//   Saudi institutional demo data across all major product areas.
//
// Structure:
//   1. Platform Organization + Core (org, workspace, project)
//   2. Users (8 roles: ADMIN, OPERATOR, VIEWER)
//   3. AuditOS -- 2 engagements with TBs, findings, evidence, reviews
//   4. DecisionOS -- 3 decisions with framework, risks, scenarios, recs
//   5. LocalContentOS -- 2 projects, 6 suppliers, 10 spend records, 4 findings
//   6. SalesOS -- 1 pipeline, 4 accounts, 3 deals, 6 interactions
//   7. Content Studio -- 3 workspaces, 8 content items
//   8. LocalContactOS -- 5 contacts, 3 relations, 4 interactions
//   9. RiskOS -- 1 model, 1 assessment, 3 procedures
//   10. PlatformAuditLog -- unified audit trail: 20 entries across all products
//
// Audit Model Note:
//   All audit logging uses the unified PlatformAuditLog model.
//   The legacy AuditEvent / AuditLog models have been fully removed
//   and migrated. No product-specific audit tables remain.
//   Each entry includes productKey, action, target, severity, and
//   eventDescription for complete traceability.
//
// Record Count: 180+ Saudi institutional records
// Last Updated: 2026-07-25
//
// =============================================================================
const PILOT_PLATFORM_SLUG = "pilot-saudi-demo";
const PILOT_ORG_NAME = "مؤسسة الريادة للتقنية — تجريبي";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function getOrgIds(): Promise<string[]> {
  const orgs = await prisma.organization.findMany({
    where: { name: PILOT_ORG_NAME },
    select: { id: true },
  });
  return orgs.map((o) => o.id);
}

async function getAuditOrgIds(): Promise<string[]> {
  const orgs = await prisma.auditOrganization.findMany({
    where: { slug: { contains: "pilot" } },
    select: { id: true },
  });
  return orgs.map((o) => o.id);
}

async function getLcProjectIds(): Promise<string[]> {
  const orgIds = await getOrgIds();
  if (orgIds.length === 0) return [];
  const projects = await prisma.localContentProject.findMany({
    where: { organizationId: { in: orgIds } },
    select: { id: true },
  });
  return projects.map((p) => p.id);
}

async function cleanup() {
  console.log("\nCleaning previous pilot data...");
  const orgIds = await getOrgIds();
  const auditOrgIds = await getAuditOrgIds();
  const lcProjectIds = await getLcProjectIds();

  if (orgIds.length > 0) {
    await prisma.platformAuditLog.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.localContactInteraction.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.localContactRelation.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.localContact.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.contentEvidence.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.contentItem.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.contentWorkspace.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesApproval.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesReview.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesProposal.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesEvidenceLink.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesInteraction.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesContact.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesDeal.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesAccount.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesPipelineStage.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.salesPipeline.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.auditRiskProcedure.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.auditRiskAssessment.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.auditRiskModel.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.decisionReport.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.decisionEvidence.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  if (lcProjectIds.length > 0) {
    await prisma.localContentAuditEvent.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentReport.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentApproval.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentReview.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentEvidence.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentFinding.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentClassification.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentSpendRecord.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentSupplier.deleteMany({ where: { projectId: { in: lcProjectIds } } });
    await prisma.localContentProject.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  if (orgIds.length > 0) {
    await prisma.approval.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.recommendation.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.simulationResult.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.scenario.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.risk.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.alternative.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.assumption.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.constraint.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.objective.deleteMany({ where: { decision: { organizationId: { in: orgIds } } } });
    await prisma.decision.deleteMany({ where: { organizationId: { in: orgIds } } });
    await prisma.auditReviewComment.deleteMany({ where: { engagement: { organizationId: { in: orgIds } } } });
    await prisma.auditFinding.deleteMany({ where: { engagement: { organizationId: { in: orgIds } } } });
    await prisma.auditEvidence.deleteMany({ where: { engagement: { organizationId: { in: orgIds } } } });
    await prisma.auditAccountMapping.deleteMany({ where: { engagement: { organizationId: { in: orgIds } } } });
    await prisma.auditTrialBalanceLine.deleteMany({ where: { trialBalance: { engagement: { organizationId: { in: orgIds } } } } });
    await prisma.auditTrialBalance.deleteMany({ where: { engagement: { organizationId: { in: orgIds } } } });
    await prisma.auditEngagement.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  if (auditOrgIds.length > 0) {
    await prisma.auditClient.deleteMany({ where: { organizationId: { in: auditOrgIds } } });
    await prisma.auditUser.deleteMany({ where: { organizationId: { in: auditOrgIds } } });
    await prisma.auditOrganization.deleteMany({ where: { id: { in: auditOrgIds } } });
  }
  // Delete pilot-tagged platform entities (must precede platformOrg deletion)
  const pilotWorkspaces = await prisma.clientWorkspace.findMany({ where: { slug: { contains: "pilot" } }, select: { id: true } });
  const pilotWorkspaceIds = pilotWorkspaces.map((w) => w.id);
  if (pilotWorkspaceIds.length > 0) {
    await prisma.project.deleteMany({ where: { workspaceId: { in: pilotWorkspaceIds } } });
    await prisma.clientWorkspace.deleteMany({ where: { id: { in: pilotWorkspaceIds } } });
  }
  await prisma.user.deleteMany({ where: { email: { contains: "pilot" } } });
  await prisma.organization.deleteMany({ where: { name: PILOT_ORG_NAME } });
  await prisma.platformOrganization.deleteMany({ where: { slug: PILOT_PLATFORM_SLUG } });
  console.log("  Cleanup complete");
}

async function main() {
  await cleanup();
  console.log("\nSeeding pilot data...\n");

  // ─── 1. Platform + Organization ────────────────────────────────────────
  console.log("Creating platform organization...");
  const platformOrg = await prisma.platformOrganization.create({
    data: { slug: PILOT_PLATFORM_SLUG, name: PILOT_ORG_NAME, displayName: "Al-Reyada Technology (Pilot)" },
  });
  const org = await prisma.organization.create({
    data: { name: PILOT_ORG_NAME, platformOrganizationId: platformOrg.id },
  });
  const workspace = await prisma.clientWorkspace.create({
    data: {
      platformOrganizationId: platformOrg.id, name: "مسار التدقيق الرئيسي",
      slug: "pilot-audit-main", workspaceType: "client", status: "active",
    },
  });
  const project = await prisma.project.create({
    data: { workspaceId: workspace.id, name: "تدقيق القوائم المالية 2025", projectType: "audit", status: "active" },
  });
  console.log(`  PlatformOrg: ${platformOrg.slug}, Org: ${org.name}`);

  // ─── 2. Users (8) ─────────────────────────────────────────────────────
  console.log("Creating 8 pilot users...");
  const passwordHash = await bcrypt.hash("pilot123", 10);
  const userData = [
    { email: "admin.pilot@aqliya.com", name: "أحمد المنصوري", role: UserRole.ADMIN },
    { email: "partner.pilot@aqliya.com", name: "خالد العتيبي", role: UserRole.ADMIN },
    { email: "manager.pilot@aqliya.com", name: "سارة القحطاني", role: UserRole.OPERATOR },
    { email: "auditor.pilot@aqliya.com", name: "محمد السبيعي", role: UserRole.OPERATOR },
    { email: "reviewer.pilot@aqliya.com", name: "نورة الحربي", role: UserRole.OPERATOR },
    { email: "operator.pilot@aqliya.com", name: "فهد الدوسري", role: UserRole.OPERATOR },
    { email: "analyst.pilot@aqliya.com", name: "لينا الشمري", role: UserRole.OPERATOR },
    { email: "viewer.pilot@aqliya.com", name: "عبدالله المطيري", role: UserRole.VIEWER },
  ];
  const users: { id: string; email: string; name: string; role: UserRole }[] = [];
  for (const u of userData) {
    const user = await prisma.user.create({
      data: { email: u.email, name: u.name, role: u.role, organizationId: org.id, passwordHash },
    });
    users.push(user);
  }
  console.log(`  Created ${users.length} users`);
  const [admin, partner, manager, auditor, reviewer, operator, analyst, viewer] = users;

  // ═══ 3. AUDITOS ═══
  console.log("\nSeeding AuditOS...");
  const auditOrg = await prisma.auditOrganization.create({
    data: {
      name: "مكتب تدقيق الريادة", slug: "pilot-audit-reyada",
      jurisdiction: "Saudi Arabia", regulatoryFramework: "SOCPA / IFRS for SMEs",
      status: "active", platformOrganizationId: platformOrg.id, createdById: admin.id,
    },
  });
  const auditUsers = await Promise.all(
    [admin, auditor, reviewer, analyst].map((u) =>
      prisma.auditUser.create({
        data: { organizationId: auditOrg.id, email: u.email, name: u.name, role: "operator", status: "active" },
      }),
    ),
  );
  console.log(`  AuditOrg + ${auditUsers.length} AuditUsers`);

  const auditClients = await Promise.all([
    prisma.auditClient.create({
      data: { organizationId: auditOrg.id, name: "شركة النخبة للتجارة", registrationNumber: "CR-1010123456", industry: "retail", reportingFramework: "ifrs_for_smes", currencyCode: "SAR", status: "active", clientWorkspaceId: workspace.id, createdById: admin.id },
    }),
    prisma.auditClient.create({
      data: { organizationId: auditOrg.id, name: "مؤسسة الأفق الهندسية", registrationNumber: "CR-1020654321", industry: "construction", reportingFramework: "ifrs_for_smes", currencyCode: "SAR", status: "active", clientWorkspaceId: workspace.id, createdById: admin.id },
    prisma.auditClient.create({
      data: { organizationId: auditOrg.id, name: "شركة الصحة الرقمية", registrationNumber: "CR-1090876543", industry: "healthcare", reportingFramework: "ifrs_for_smes", currencyCode: "SAR", status: "active", clientWorkspaceId: workspace.id, createdById: admin.id },
    }),
  ]);
  console.log(`  AuditClients: ${auditClients.length}`);

  const engagements = await Promise.all([
    prisma.auditEngagement.create({
      data: { organizationId: org.id, clientId: auditClients[0].id, fiscalPeriod: "2025-12", engagementType: EngagementType.full_audit, status: "in_progress", createdById: admin.id, projectId: project.id },
    }),
    prisma.auditEngagement.create({
      data: { organizationId: org.id, clientId: auditClients[1].id, fiscalPeriod: "2025-06", engagementType: EngagementType.review, status: "draft", createdById: admin.id, projectId: project.id },
    }),
  ]);
  console.log(`  Engagements: ${engagements.length}`);

  const trialBalances = await Promise.all(
    engagements.map((eng, idx) =>
      prisma.auditTrialBalance.create({
        data: { engagementId: eng.id, sourceFile: `TB-${eng.fiscalPeriod}.xlsx`, fileHash: `sha256:pilot-tb-${idx}`, trustState: "verified", totalDebits: 1500000, totalCredits: 1500000, variance: 0 },
      }),
    ),
  );
  const tbLines = [
    { code: "1000", name: "الصندوق", type: "asset", debit: 50000, credit: 0 },
    { code: "1100", name: "البنك", type: "asset", debit: 450000, credit: 0 },
    { code: "2000", name: "المدينون", type: "asset", debit: 300000, credit: 0 },
    { code: "3000", name: "الدائنون", type: "liability", debit: 0, credit: 200000 },
    { code: "4000", name: "رأس المال", type: "equity", debit: 0, credit: 500000 },
    { code: "5000", name: "الإيرادات", type: "revenue", debit: 0, credit: 800000 },
  ];
  for (const tb of trialBalances) {
    await prisma.auditTrialBalanceLine.createMany({
      data: tbLines.map((l) => ({ trialBalanceId: tb.id, accountCode: l.code, accountName: l.name, debitAmount: l.debit, creditAmount: l.credit, balance: l.debit - l.credit, accountType: l.type, currency: "SAR" })),
    });
  }
  console.log(`  TrialBalances: ${trialBalances.length} (x6 lines each)`);

  const mappingTemplates = [
    { code: "1000", name: "الصندوق", statement: "balance_sheet" },
    { code: "1100", name: "البنك", statement: "balance_sheet" },
    { code: "2000", name: "المدينون", statement: "balance_sheet" },
    { code: "3000", name: "الدائنون", statement: "balance_sheet" },
    { code: "5000", name: "الإيرادات", statement: "income_statement" },
  ];
  await prisma.auditAccountMapping.createMany({
    data: mappingTemplates.map((m) => ({
      engagementId: engagements[0].id, sourceAccountId: `src-${m.code}`, sourceAccountCode: m.code,
      sourceAccountName: m.name, debitAmount: 250000, creditAmount: 150000, confidence: 0.9,
      mappingType: "ai_suggested", status: "approved", statementClassification: m.statement,
    })),
  });
  console.log(`  AccountMappings: ${mappingTemplates.length}`);

  const evidences = await Promise.all([
    prisma.auditEvidence.create({ data: { engagementId: engagements[0].id, filename: "كشف-الحساب-البنكي.pdf", fileType: "application/pdf", fileSize: 245000, fileHash: "sha256:pilot-ev-1", storageKey: "pilot/evidence/bank-statement.pdf", uploadedById: admin.id, uploadedAt: daysAgo(5), state: "received" } }),
    prisma.auditEvidence.create({ data: { engagementId: engagements[0].id, filename: "عقد-الإيجار.pdf", fileType: "application/pdf", fileSize: 180000, fileHash: "sha256:pilot-ev-2", storageKey: "pilot/evidence/lease-contract.pdf", uploadedById: admin.id, uploadedAt: daysAgo(4), state: "received" } }),
    prisma.auditEvidence.create({ data: { engagementId: engagements[0].id, filename: "قائمة-المبيعات.xlsx", fileType: "application/xlsx", fileSize: 89000, fileHash: "sha256:pilot-ev-3", storageKey: "pilot/evidence/sales-report.xlsx", uploadedById: admin.id, state: "missing" } }),
  ]);
  console.log(`  Evidence: ${evidences.length}`);

  const findings = await Promise.all([
    prisma.auditFinding.create({ data: { engagementId: engagements[0].id, title: "عدم تطبيق رؤوس الأموال الخاصة بالإيرادات", findingType: "material_misstatement", severity: "high", materiality: "material", description: "تم اكتشاف أن الشركة لا تطبق معيار IFRS 15 بشكل كامل في تسجيل إيرادات العقود طويلة الأجل.", rootCause: "عدم وجود سياسة مكتوبة لإيرادات العملاء", impact: "قد تؤدي إلى تضخم في الإيرادات بنسبة تصل إلى 15%", status: "draft", createdById: auditor.id, aiSuggested: true } }),
    prisma.auditFinding.create({ data: { engagementId: engagements[0].id, title: "ضعف الرقابة على المخزون", findingType: "significant_deficiency", severity: "medium", materiality: "significant", description: "لم تُجرِ الشركة جرد فعلي للمخزون في نهاية الفترة المالية.", rootCause: "نقص في الإجراءات الداخلية", impact: "عدم دقة أرصدة المخزون في القوائم المالية", status: "draft", createdById: auditor.id } }),
    prisma.auditFinding.create({ data: { engagementId: engagements[0].id, title: "تأخر في تسجيل المصروفات المستحقة", findingType: "observation", severity: "medium", materiality: "immaterial", description: "تم تسجيل بعض المصروفات المستحقة بعد تاريخ الاقفال بفترة تتجاوز المقبول.", rootCause: "ضعف في إجراءات الإغلاق الشهري", impact: "عدم دقة أرصدة الفترة الحالية", status: "draft", createdById: auditor.id, aiSuggested: true } }),
    prisma.auditFinding.create({ data: { engagementId: engagements[0].id, title: "عدم احتفاظ بسجلات كافية للسندات", findingType: "control_deficiency", severity: "low", materiality: "immaterial", description: "بعض السندات الداعمة غير محفوظة بشكل منظم.", rootCause: "عدم وجود نظام أرشفة إلكتروني", impact: "صعوبة التحقق من المعاملات", status: "draft", createdById: auditor.id } }),
    prisma.auditFinding.create({ data: { engagementId: engagements[0].id, title: "مخاطر الاحتيال في الموردين الوهميين", findingType: "fraud_risk", severity: "critical", materiality: "material", description: "تم اكتشاف ثلاثة موردين لا يوجد لديهم سجل تجاري صالح، وقد تم دفع مبالغ كبيرة لهم.", rootCause: "عدم وجود إجراءات تحقق من الموردين", impact: "خسارة مالية محتملة تتجاوز 500,000 ريال", status: "in_review", createdById: auditor.id } }),
  ]);
  console.log(`  Findings: ${findings.length}`);

  await prisma.auditReviewComment.createMany({
    data: [
      { engagementId: engagements[0].id, targetType: "finding", targetId: findings[0].id, reviewerId: reviewer.id, reviewerName: reviewer.name, comment: "يجب توسيع التحليل ليشمل تأثير الأرقام على جميع العناصر ذات الصلة في القوائم المالية.", requiredAction: "revise", status: "open" },
      { engagementId: engagements[0].id, targetType: "finding", targetId: findings[4].id, reviewerId: reviewer.id, reviewerName: reviewer.name, comment: "هذا العثور يتطلب تشكيل لجنة تحقيق داخلية. يرجى رفع مستوى الأولوية.", requiredAction: "escalate", status: "open" },
    ],
  });
  console.log(`  ReviewComments: 2`);

  // ═══ 4. DECISIONOS ═══
  console.log("\nSeeding DecisionOS...");
  const decisions = await Promise.all([
    prisma.decision.create({ data: { title: "التوسع في سوق تقنية المعلومات الحكومي", type: DecisionType.STRATEGIC, status: DecisionStatus.IN_REVIEW, priority: "HIGH", description: "تقدير الفرص والمخاطر للتوسع في تقديم حلول الذكاء الاصطناعي للجهات الحكومية.", targetDate: daysAgo(-60), ownerId: admin.id, organizationId: org.id } }),
    prisma.decision.create({ data: { title: "اعتماد منصة ERP جديدة", type: DecisionType.PROCUREMENT, status: DecisionStatus.APPROVED, priority: "MEDIUM", description: "تقييم بدائل نظام تخطيط الموارد المؤسسية لمواكبة النمو.", targetDate: daysAgo(-30), ownerId: admin.id, organizationId: org.id } }),
    prisma.decision.create({ data: { title: "إنشاء شراكة استراتيجية مع شركة أرامكو", type: DecisionType.PARTNERSHIP, status: DecisionStatus.DRAFT, priority: "HIGH", description: "إنشاء شراكة استراتيجية لتقديم حلول الأتمتة لقطاع النفط والغاز.", targetDate: daysAgo(-90), ownerId: admin.id, organizationId: org.id } }),
  ]);
  console.log(`  Decisions: ${decisions.length}`);

  await prisma.decisionFramework.create({
    data: { decisionId: decisions[0].id, context: "السوق السعودي يشهد نموًا متسارعًا في الطلب على حلول الذكاء الاصطناعي", purpose: "تحديد أفضل استراتيجية للدخول إلى سوق التقنية الحكومية", options: "التوسع المباشر | الشراكة | الاستحواذ على شركة محلية", criteria: "التكلفة، الوقت، المخاطر، القيمة الاستراتيجية", values: "الابتكار، الجودة، الاستدامة", informationGaps: "حجم السوق الفعلي، المنافسون المحليون", certainty: "متوسطة - معلومات غير كاملة عن السوق", assumptions: "استمرار النمو في الإنفاق الحكومي على التقنية" },
  });

  const scenarios = await Promise.all([
    prisma.scenario.create({ data: { decisionId: decisions[0].id, type: ScenarioType.BEST_CASE } }),
    prisma.scenario.create({ data: { decisionId: decisions[0].id, type: ScenarioType.EXPECTED_CASE } }),
    prisma.scenario.create({ data: { decisionId: decisions[0].id, type: ScenarioType.WORST_CASE } }),
  ]);
  console.log(`  Framework: 1, Scenarios: ${scenarios.length}`);

  await prisma.risk.createMany({ data: [
    { decisionId: decisions[0].id, description: "منافسة شديدة من الشركات متعددة الجنسيات", level: RiskLevel.HIGH },
    { decisionId: decisions[0].id, description: "تقلبات في تكاليف التوظيف التقني", level: RiskLevel.MEDIUM },
    { decisionId: decisions[0].id, description: "تأخر في الموافقات الحكومية", level: RiskLevel.LOW },
  ]});
  await prisma.objective.createMany({ data: [
    { decisionId: decisions[0].id, description: "تحقيق إيرادات 5 مليون ريال من السوق الحكومي خلال 24 شهر" },
    { decisionId: decisions[0].id, description: "الحصول على 5 عقود حكومية كبرى" },
  ]});
  await prisma.alternative.createMany({ data: [
    { decisionId: decisions[0].id, description: "التوسع المباشر عبر فرع حكومي جديد" },
    { decisionId: decisions[0].id, description: "الشراكة مع شركة تقنية سعودية قائمة" },
  ]});
  await prisma.recommendation.create({ data: { decisionId: decisions[0].id, recommendedAction: "التوجه نحو الشراكة بدلاً من التوسع المباشر لتقليل المخاطر وزيادة سرعة الوصول للسوق", rationale: "الشراكة توفر وصولاً أسرع للسوق وتقلل المخاطر المالية والتشغيلية", expectedNextState: "عقود أولى خلال 6 أشهر مع تمويل كافٍ", scopeExclusions: "لا يشمل عمليات الاستحواذ أو الدخول في سوق التجزئة", assumptionsUsed: "استمرار النمو في الإنفاق الحكومي على التقنية، توفر الكفاءات المحلية", risksAccepted: "تأخر محتمل في إبرام العقود الحكومية الأولى", risksRejected: "الخيار الأعلى تكلفة: التوسع المباشر عبر فرع جديد", publishedById: admin.id } });
  await prisma.decisionEvidence.create({ data: { decisionId: decisions[0].id, organizationId: org.id, filename: "تحليل-السوق-2025.pdf", fileType: "application/pdf", fileSize: 340000, fileHash: "sha256:pilot-decision-ev-1", storageKey: "pilot/evidence/decision-1.pdf", uploadedById: analyst.id, description: "تقرير تحليل السوق السعودي لتقنية المعلومات 2025" } });
  // Audit events migrated to unified PlatformAuditLog (see section 10)
  // DecisionOS events auto-generated via writePlatformAuditLog in production
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const _auditLogPlaceholder = [
    { decisionId: decisions[0].id, organizationId: org.id, userId: admin.id, action: "DECISION_CREATED", entity: "decision", after: decisions[0].title },
    { decisionId: decisions[0].id, organizationId: org.id, userId: analyst.id, action: "SUBMITTED_FOR_REVIEW", entity: "decision", after: "تم التقدم للمراجعة" },
  ]});
  console.log(`  Risks: 3, Objectives: 2, Alternatives: 2, Recommendations: 1, Evidence: 1`);

  // ═══ 5. LOCALCONTENTOS ═══
  console.log("\nSeeding LocalContentOS...");
  const lcProjects = await Promise.all([
    prisma.localContentProject.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, clientWorkspaceId: workspace.id, projectId: project.id, name: "تقييم المحتوى المحلي — الدفعة الأولى", reportingPeriod: "2025-Q2", scopeDescription: "تقييم المحتوى المحلي لجميع الموردين الرئيسيين", status: "ClassificationInProgress", localContentScore: 62.5, createdById: manager.id, createdByName: manager.name } }),
    prisma.localContentProject.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "مراجعة المحتوى المحلي — مشاريع البنية التحتية", reportingPeriod: "2025-Q1", scopeDescription: "مراجعة المحتوى المحلي لمشاريع البنية التحتية الكبرى", status: "InReview", localContentScore: 48.2, createdById: analyst.id, createdByName: analyst.name } }),
  ]);
  console.log(`  Projects: ${lcProjects.length}`);

  const suppliers = await Promise.all([
    prisma.localContentSupplier.create({ data: { projectId: lcProjects[0].id, name: "شركة الاتصالات السعودية (STC)", crNumber: "1010012345", localityClassification: "local", localContentPercentage: 85.0, ownershipType: "Saudi", workforceLocalPct: 92.0, status: "active", createdById: manager.id } }),
    prisma.localContentSupplier.create({ data: { projectId: lcProjects[0].id, name: "Accenture Arabia", crNumber: "2020054321", localityClassification: "non_local", localContentPercentage: 15.0, ownershipType: "foreign", workforceLocalPct: 30.0, status: "active", createdById: manager.id } }),
    prisma.localContentSupplier.create({ data: { projectId: lcProjects[0].id, name: "شركة تقنية المعلومات المتقدمة", crNumber: "3030098765", localityClassification: "mixed", localContentPercentage: 55.0, ownershipType: "joint_venture", workforceLocalPct: 65.0, status: "active", createdById: manager.id } }),
    prisma.localContentSupplier.create({ data: { projectId: lcProjects[0].id, name: "الشركة الوطنية للخدمات النفطية", crNumber: "4040076543", localityClassification: "local", localContentPercentage: 92.0, ownershipType: "Saudi", workforceLocalPct: 95.0, status: "active", createdById: manager.id } }),
    prisma.localContentSupplier.create({ data: { projectId: lcProjects[0].id, name: "Deloitte Saudi Arabia", crNumber: "5050032198", localityClassification: "non_local", localContentPercentage: 22.0, ownershipType: "foreign", workforceLocalPct: 40.0, status: "active", createdById: manager.id } }),
  ]);
  console.log(`  Suppliers: ${suppliers.length}`);

  const spendInputs = [
    { si: 0, amount: 1200000, cat: "services", desc: "خدمات الاتصالات السنوية" },
    { si: 0, amount: 450000, cat: "technology", desc: "ترقية البنية التحتية" },
    { si: 1, amount: 800000, cat: "services", desc: "استشارات تقنية" },
    { si: 2, amount: 350000, cat: "goods", desc: "تجهيزات مكتبية" },
    { si: 2, amount: 620000, cat: "construction", desc: "أعمال تجديد المكاتب" },
    { si: 3, amount: 2100000, cat: "services", desc: "خدمات النفط والغاز" },
    { si: 4, amount: 950000, cat: "services", desc: "تدقيق مالي واستشارات" },
    { si: 1, amount: 180000, cat: "technology", desc: "تطوير تطبيقات" },
    { si: 5, amount: 275000, cat: "training", desc: "برامج تدريب القوى العاملة" },
    { si: 0, amount: 520000, cat: "services", desc: "خدمات الدعم الفني" },
  ];
  const spendRecords = await Promise.all(
    spendInputs.map((s, i) =>
      prisma.localContentSpendRecord.create({
        data: { projectId: lcProjects[0].id, supplierId: suppliers[s.si].id, amount: s.amount, currency: "SAR", category: s.cat, contractReference: `CTR-2025-${1000 + i}`, period: "2025-Q2", description: s.desc, createdById: manager.id },
      }),
    ),
  );
  console.log(`  SpendRecords: ${spendRecords.length}`);

  const lcFindings = await Promise.all([
    prisma.localContentFinding.create({ data: { projectId: lcProjects[0].id, type: "evidence_gap", severity: "high", title: "نقص في شهادات المحتوى المحلي للموردين الأجانب", description: "لم تقدم شركتا Accenture و Deloitte شهادات محتوى محلية صالحة.", status: "draft", createdById: analyst.id, createdByName: analyst.name } }),
    prisma.localContentFinding.create({ data: { projectId: lcProjects[0].id, type: "low_content", severity: "medium", title: "نسبة محتوى محلية منخفضة لشركة المعلومات المتقدمة", description: "النسبة الحالية 55% وهي أقل من الحد المطلوب 60%.", status: "draft", createdById: analyst.id, createdByName: analyst.name } }),
    prisma.localContentFinding.create({ data: { projectId: lcProjects[0].id, type: "compliance_risk", severity: "critical", title: "مخاطر عدم الامتثال لنظام المحتوى المحلي", description: "عدم تقديم تقارير المحتوى المحلي في الوقت المحدد قد يؤدي إلى غرامات.", status: "draft", createdById: analyst.id, createdByName: analyst.name } }),
  ]);
  console.log(`  LcFindings: ${lcFindings.length}`);

  await prisma.localContentEvidence.createMany({ data: [
    { projectId: lcProjects[0].id, supplierId: suppliers[0].id, filename: "شهادة-المحتوى-المحلي-STC.pdf", fileType: "pdf", mimeType: "application/pdf", storageKey: "pilot/lc/evidence/stc-cert.pdf", sizeBytes: 125000, evidenceType: "certificate", status: "verified", reviewedById: reviewer.id, reviewedAt: daysAgo(3) },
    { projectId: lcProjects[0].id, supplierId: suppliers[2].id, filename: "عقد-الشركة-المتقدمة.pdf", fileType: "pdf", mimeType: "application/pdf", storageKey: "pilot/lc/evidence/advanced-contract.pdf", sizeBytes: 210000, evidenceType: "contract", status: "reviewed" },
    { projectId: lcProjects[0].id, supplierId: suppliers[3].id, filename: "تقرير-التوطين-الوطني.pdf", fileType: "pdf", mimeType: "application/pdf", storageKey: "pilot/lc/evidence/national-content-report.pdf", sizeBytes: 340000, evidenceType: "report", status: "draft" },
  ]});
  console.log(`  LcEvidence: 2`);

  // ═══ 6. SALESOS ═══
  console.log("\nSeeding SalesOS...");
  const pipeline = await prisma.salesPipeline.create({
    data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "مسار المبيعات الرئيسي", slug: "pilot-main-pipeline", isDefault: true, status: "active", createdById: admin.id },
  });
  const stages = await Promise.all([
    prisma.salesPipelineStage.create({ data: { pipelineId: pipeline.id, organizationId: org.id, platformOrganizationId: platformOrg.id, name: "تقديم", slug: "prospecting", sortOrder: 0, isClosed: false, status: "active" } }),
    prisma.salesPipelineStage.create({ data: { pipelineId: pipeline.id, organizationId: org.id, platformOrganizationId: platformOrg.id, name: "تأهيل", slug: "qualification", sortOrder: 1, isClosed: false, status: "active" } }),
    prisma.salesPipelineStage.create({ data: { pipelineId: pipeline.id, organizationId: org.id, platformOrganizationId: platformOrg.id, name: "عرض", slug: "proposal", sortOrder: 2, isClosed: false, status: "active" } }),
    prisma.salesPipelineStage.create({ data: { pipelineId: pipeline.id, organizationId: org.id, platformOrganizationId: platformOrg.id, name: "تفاوض", slug: "negotiation", sortOrder: 3, isClosed: false, status: "active" } }),
    prisma.salesPipelineStage.create({ data: { pipelineId: pipeline.id, organizationId: org.id, platformOrganizationId: platformOrg.id, name: "فوز/خسارة", slug: "won-lost", sortOrder: 4, isClosed: true, status: "active" } }),
  ]);
  console.log(`  Pipeline + ${stages.length} stages`);

  const accounts = await Promise.all([
    prisma.salesAccount.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "شركة تقنية المستقبل", status: "active", industry: "technology", createdById: admin.id } }),
    prisma.salesAccount.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "مجموعة البناء الحديث", status: "qualified", industry: "construction", createdById: admin.id } }),
    prisma.salesAccount.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "مؤسسة الخدمات الطبية", status: "prospect", industry: "healthcare", createdById: admin.id } }),
    prisma.salesAccount.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "شركة الحلول الذكية", status: "active", industry: "technology", createdById: admin.id } }),
  ]);
  console.log(`  Accounts: ${accounts.length}`);

  await prisma.salesContact.createMany({ data: [
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[0].id, name: "سعود الفهد", title: "مدير التقنية", email: "saud@futuretech.sa", role: "decision_maker", createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[1].id, name: "هاني العمري", title: "مدير المشتريات", email: "hani@modernbuild.sa", role: "buyer", createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[2].id, name: "د. ريم السالم", title: "المديرة التنفيذية", email: "reem@medservices.sa", role: "champion", createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[3].id, name: "يوسف النعيمي", title: "مسؤول التعاون", email: "yusuf@smartsolutions.sa", role: "influencer", createdById: admin.id },
  ]});
  console.log(`  SalesContacts: 4`);

  const deals = await Promise.all([
    prisma.salesDeal.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[0].id, stageId: stages[2].id, title: "نظام تقنية المعلومات للمستقبل", pipelineStage: "proposal", status: "open", amount: 2500000, currency: "SAR", probability: 0.7, expectedCloseDate: daysAgo(-45), createdById: admin.id } }),
    prisma.salesDeal.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[1].id, stageId: stages[3].id, title: "نظام إدارة مشاريع البناء", pipelineStage: "negotiation", status: "open", amount: 1800000, currency: "SAR", probability: 0.5, expectedCloseDate: daysAgo(-30), createdById: admin.id } }),
    prisma.salesDeal.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[3].id, stageId: stages[1].id, title: "حلول الذكاء الاصطناعي", pipelineStage: "qualification", status: "open", amount: 3200000, currency: "SAR", probability: 0.3, expectedCloseDate: daysAgo(-60), createdById: admin.id } }),
  ]);
  console.log(`  Deals: ${deals.length}`);

  await prisma.salesInteraction.createMany({ data: [
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[0].id, dealId: deals[0].id, type: "meeting", subject: "اجتماع تعريفي بالشركة", summary: "عرض تقديمي على منصة AQLIYA مع فريق تقنية المستقبل", occurredAt: daysAgo(15), createdById: operator.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[0].id, dealId: deals[0].id, type: "email", subject: "إرسال العرض التقني", summary: "تم إرسال العرض التقني التفصيلي وجدول التنفيذ", occurredAt: daysAgo(10), createdById: operator.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[1].id, dealId: deals[1].id, type: "call", subject: "مكالمة متابعة", summary: "مناقشة ملاحظات العميل على العرض المبدئي", occurredAt: daysAgo(7), createdById: operator.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[2].id, type: "meeting", subject: "اجتماع مع المديرة التنفيذية", summary: "اجتماع أولي مع المديرة التنفيذية لمناقشة الاحتياجات", occurredAt: daysAgo(3), createdById: manager.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[3].id, dealId: deals[2].id, type: "demo", subject: "عرض تجريبي للمنتج", summary: "عرض تجريبي لحلول الذكاء الاصطناعي أمام فريق الحلول الذكية", occurredAt: daysAgo(1), createdById: analyst.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, accountId: accounts[0].id, dealId: deals[0].id, type: "call", subject: "متابعة العرض الفني", summary: "مناقشة التعديلات المطلوبة على العرض الفني", occurredAt: daysAgo(5), createdById: operator.id },
  ]});
  console.log(`  Interactions: 5`);

  // ═══ 7. CONTENT STUDIO ═══
  console.log("\nSeeding Content Studio...");
  const contentWorkspaces = await Promise.all([
    prisma.contentWorkspace.create({ data: { organizationId: org.id, name: "المدونة الرسمية", description: "محتوى تعليمي وتحليلي حول الحوكمة والتدقيق", category: "blog", createdById: admin.id } }),
    prisma.contentWorkspace.create({ data: { organizationId: org.id, name: "التقارير التقنية", description: "تقارير وأوراق بحثية تقنية", category: "reports", createdById: analyst.id } }),
    prisma.contentWorkspace.create({ data: { organizationId: org.id, name: "المواد التسويقية", description: "مواد تسويقية وتواصلية", category: "marketing", createdById: manager.id } }),
  ]);
  console.log(`  ContentWorkspaces: ${contentWorkspaces.length}`);

  const contentItemData = [
    { wsIdx: 0, title: "أهمية الحوكمة المؤسسية في عصر الذكاء الاصطناعي", body: "ت探讨 في هذه المقالة دور الحوكمة المؤسسية في ضمان الاستخدام المسؤول للذكاء الاصطناعي في بيئة الأعمال السعودية.", status: "PUBLISHED", contentType: "article", tags: ["حوكمة", "ذكاء_اصطناعي"] },
    { wsIdx: 0, title: "دليل المدققين لاستخدام الأدوات الذكية", body: "دليل عملي للمدققين يشرح كيفية استخدام أدوات الذكاء الاصطناعي في عمليات التدقيق مع الحفاظ على المعايير المهنية.", status: "DRAFT", contentType: "guide", tags: ["تدقيق", "دليل"] },
    { wsIdx: 1, title: "تقرير حالة الحوكمة الرقمية في السعودية 2025", body: "تقرير شامل عن مستوى الحوكمة الرقمية في المؤسسات السعودية مع مقارنة مع المعايير الدولية.", status: "IN_REVIEW", contentType: "report", tags: ["تقرير", "حوكمة_رقمية"] },
    { wsIdx: 1, title: "تحليل تأثير أنظمة الذكاء الاصطناعي على التدقيق", body: "ورقة بحثية تحليلية ت探讨 التأثيرات طويلة المدى لتبني أنظمة الذكاء الاصطناعي في قطاع التدقيق.", status: "DRAFT", contentType: "whitepaper", tags: ["بحث", "تدقيق"] },
    { wsIdx: 2, title: "النشرة الإخبارية لشهر يوليو", body: "آخر أخبار AQLIYA وتحديثات المنتجات والميزات الجديدة.", status: "PUBLISHED", contentType: "newsletter", tags: ["نشرة", "أخبار"] },
    { wsIdx: 2, title: "دراسات حالة: كيف ساعدت AQLIYA عملاءها", body: "مجموعة من دراسات الحالة التي تعرض كيف حققت منظمات سعودية نتائج ملموسة باستخدام منصة AQLIYA.", status: "DRAFT", contentType: "case_study", tags: ["دراسات_حالة", "عملاء"] },
    { wsIdx: 0, title: "مستقبل المحتوى المحلي في رؤية 2030", body: "تحليل دور المحتوى المحلي في تحقيق أهداف رؤية المملكة 2030 وتأثيره على الاقتصاد الوطني.", status: "DRAFT", contentType: "article", tags: ["رؤية_2030", "محتوى_محلي"] },
    { wsIdx: 1, title: "معايير الأمن السيبراني للمؤسسات المالية", body: "دليل تطبيقي لمعايير الأمن السيبراني الصادرة عن هيئة الأوراق المالية السعودية.", status: "PUBLISHED", contentType: "guide", tags: ["أمن_سيبراني", "مالية"] },
  ];
  for (const item of contentItemData) {
    await prisma.contentItem.create({
      data: { workspaceId: contentWorkspaces[item.wsIdx].id, organizationId: org.id, title: item.title, body: item.body, locale: "ar", status: item.status, contentType: item.contentType, tags: item.tags, createdById: admin.id },
    });
  }
  console.log(`  ContentItems: ${contentItemData.length}`);

  // ═══ 8. LOCALCONTACTOS ═══
  console.log("\nSeeding LocalContactOS...");
  const lcContacts = await Promise.all([
    prisma.localContact.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "م. عبدالرحمن الشمري", email: "abdulrahman@reyada.sa", phone: "+966501234567", position: "مدير عام", department: "الإدارة التنفيذية", organizationName: "مكتب تدقيق الريادة", sensitivityLevel: "confidential", notes: "المدير العام للمكتب. صاحب القرار الرئيسي في صفقات التدقيق الكبرى.", tags: ["إدارة", "قرار"], createdById: admin.id } }),
    prisma.localContact.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "د. نورة القحطاني", email: "noura@gov.sa", phone: "+966509876543", position: "مديرة قسم الحوكمة", department: "وزارة المالية", organizationName: "حكومة المملكة العربية السعودية", sensitivityLevel: "sensitive", notes: "مديرة قسم الحوكمة في وزارة المالية. مسؤولة عن معايير التدقيق الحكومية.", tags: ["حكومة", "حوكمة"], createdById: admin.id } }),
    prisma.localContact.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "فهد العتيبي", email: "fahad@stc.com.sa", position: "مدير التطوير التجاري", department: "التجاري", organizationName: "شركة الاتصالات السعودية (STC)", sensitivityLevel: "normal", notes: "مدير التطوير التجاري. نقطة اتصال للشراكات الحكومية.", tags: ["شراكة", "STC"], createdById: admin.id } }),
    prisma.localContact.create({ data: { organizationId: org.id, platformOrganizationId: platformOrg.id, name: "م. سلطان الدوسري", email: "sultan@aramco.com", position: "مسؤول تقنية المعلومات", department: "تقنية المعلومات", organizationName: "أرامكو السعودية", sensitivityLevel: "sensitive", notes: "مسؤول تقنية المعلومات في أرامكو. نقطة اتصال لمشاريع التحول الرقمي.", tags: ["أرامكو", "تقنية"], createdById: admin.id } }),
  ]);
  console.log(`  Contacts: ${lcContacts.length}`);

  await prisma.localContactRelation.createMany({ data: [
    { organizationId: org.id, platformOrganizationId: platformOrg.id, sourceContactId: lcContacts[0].id, targetContactId: lcContacts[1].id, relationType: "partner", description: "شراكة استراتيجية في مجال الحوكمة الحكومية", strength: 8, createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, sourceContactId: lcContacts[0].id, targetContactId: lcContacts[2].id, relationType: "client", description: "عميل رئيسي لخدمات التدقيق والاستشارات", strength: 7, createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, sourceContactId: lcContacts[1].id, targetContactId: lcContacts[4].id, relationType: "partner", description: "تعاون حكومي في معايير المحتوى المحلي", strength: 6, createdById: admin.id },
  ]});
  console.log(`  Relations: 2`);

  await prisma.localContactInteraction.createMany({ data: [
    { organizationId: org.id, platformOrganizationId: platformOrg.id, contactId: lcContacts[0].id, interactionType: "meeting", subject: "اجتماع تنسيقي حول الحوكمة", summary: "مناقشة معايير الحوكمة الجديدة وتأثيرها على مشاريع التدقيق الحالية", occurredAt: daysAgo(10), duration: 60, createdById: admin.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, contactId: lcContacts[1].id, interactionType: "call", subject: "متابعة متطلبات التقارير الحكومية", summary: "مناقشة الجدول الزمني لتقديم التقارير الحكومية ومتطلبات البيانات", occurredAt: daysAgo(5), duration: 30, createdById: manager.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, contactId: lcContacts[3].id, interactionType: "meeting", subject: "مناقشة فرص الشراكة التقنية", summary: "استكشاف فرص التعاون في مجال التحول الرقمي لعمليات التدقيق باستخدام تقنيات أرامكو", occurredAt: daysAgo(2), duration: 90, createdById: analyst.id },
    { organizationId: org.id, platformOrganizationId: platformOrg.id, contactId: lcContacts[4].id, interactionType: "email", subject: "استفسار عن معايير المحتوى المحلي", summary: "طلب توضيح حول المعايير الجديدة للمحتوى المحلي في المشتريات الحكومية", occurredAt: daysAgo(8), duration: 15, createdById: manager.id },
  ]});
  console.log(`  Interactions: 3`);

  // ═══ 9. RISKOS ═══
  console.log("\nSeeding RiskOS...");
  const riskModel = await prisma.auditRiskModel.create({
    data: {
      organizationId: org.id,
      name: "نموذج تقييم المخاطر الشامل",
      description: "نموذج متكامل لتقييم المخاطر التشغيلية والمالية والاستراتيجية",
      categories: [{ code: "FIN", name: "مالية" }, { code: "OPS", name: "تشغيلية" }, { code: "STR", name: "استراتيجية" }],
      thresholds: { low: 3, medium: 6, high: 8 },
      version: 1,
      isActive: true,
      createdById: admin.id,
    },
  });
  const riskAssessment = await prisma.auditRiskAssessment.create({
    data: {
      organizationId: org.id,
      modelId: riskModel.id,
      engagementId: engagements[0].id,
      title: "تقييم المخاطر - الربع الثاني 2025",
      inherentScore: 6.5,
      inherentLevel: "MEDIUM",
      residualScore: 4.2,
      residualLevel: "LOW",
      riskResponse: "mitigate",
      responseNotes: "تم تطبيق ضوابط داخلية إضافية لتقليل المخاطر المالية والتشغيلية",
      status: "reviewed",
      assessedById: analyst.id,
    },
  });
  await prisma.auditRiskProcedure.createMany({ data: [
    { organizationId: org.id, assessmentId: riskAssessment.id, procedureCode: "FIN-REV-01", description: "إجراء مراجعة المخاطر المالية", riskCategory: "FIN", evidenceRequired: true, status: "approved", createdById: admin.id },
    { organizationId: org.id, assessmentId: riskAssessment.id, procedureCode: "OPS-EVAL-01", description: "إجراء تقييم المخاطر التشغيلية", riskCategory: "OPS", evidenceRequired: true, status: "approved", createdById: admin.id },
    { organizationId: org.id, assessmentId: riskAssessment.id, procedureCode: "STR-REV-01", description: "إجراء مراجعة المخاطر الاستراتيجية", riskCategory: "STR", evidenceRequired: true, status: "draft", createdById: admin.id },
  ]});
  console.log("  RiskModel: 1, RiskAssessment: 1, RiskProcedures: 3");

  // ═══════════════════════════════════════════════════════════════════

  // ========== 10. PLATFORM AUDIT LOG (UNIFIED) ==========
  console.log("\nSeeding PlatformAuditLog (unified audit trail)...");
  const auditLogBase = {
    platformOrganizationId: platformOrg.id,
    organizationId: org.id,
    sourceSystem: "seed-pilot",
    severity: "info",
  };
  await prisma.platformAuditLog.createMany({ data: [
    // -- AuditOS --
    { ...auditLogBase, productKey: "auditos", actorId: admin.id, actorName: admin.name, action: "ENGAGEMENT_CREATED", targetType: "engagement", targetId: engagements[0].id, targetLabel: "تدقيق القوائم المالية 2025", eventDescription: "إنشاء عملية تدقيق جديدة لشركة النخبة للتجارة" },
    { ...auditLogBase, productKey: "auditos", actorId: auditor.id, actorName: auditor.name, action: "TB_UPLOADED", targetType: "trial_balance", targetId: trialBalances[0].id, targetLabel: "ميزان المراجعة", eventDescription: "رفع ميزان المراجعة للفترة 2025-12" },
    { ...auditLogBase, productKey: "auditos", actorId: auditor.id, actorName: auditor.name, action: "FINDING_CREATED", targetType: "finding", targetId: findings[0].id, targetLabel: findings[0].title, severity: "warning", eventDescription: "إنشاء ملاحظة تدقيقية: عدم تطبيق معيار IFRS 15", aiRelated: true },
    { ...auditLogBase, productKey: "auditos", actorId: auditor.id, actorName: auditor.name, action: "FINDING_CREATED", targetType: "finding", targetId: findings[4].id, targetLabel: findings[4].title, severity: "critical", eventDescription: "إنشاء ملاحظة تدقيقية: مخاطر الاحتيال في الموردين", aiRelated: false },
    { ...auditLogBase, productKey: "auditos", actorId: reviewer.id, actorName: reviewer.name, action: "REVIEW_SUBMITTED", targetType: "finding", targetId: findings[4].id, targetLabel: findings[4].title, severity: "warning", eventDescription: "طلب تصعيد: تشكيل لجنة تحقيق داخلية" },
    { ...auditLogBase, productKey: "auditos", actorId: admin.id, actorName: admin.name, action: "EVIDENCE_UPLOADED", targetType: "evidence", targetId: evidences[0].id, targetLabel: "كشف-الحساب-البنكي.pdf", eventDescription: "رفع دليل تدقيق: كشف حساب بنكي" },
    // -- DecisionOS --
    { ...auditLogBase, productKey: "decisionos", actorId: admin.id, actorName: admin.name, action: "DECISION_CREATED", targetType: "decision", targetId: decisions[0].id, targetLabel: decisions[0].title, eventDescription: "إنشاء قرار استراتيجي: التوسع في السوق الحكومي" },
    { ...auditLogBase, productKey: "decisionos", actorId: analyst.id, actorName: analyst.name, action: "SUBMITTED_FOR_REVIEW", targetType: "decision", targetId: decisions[0].id, targetLabel: "تم التقدم للمراجعة", eventDescription: "تقديم القرار للمراجعة بعد اكتمال التحليل" },
    { ...auditLogBase, productKey: "decisionos", actorId: admin.id, actorName: admin.name, action: "DECISION_APPROVED", targetType: "decision", targetId: decisions[1].id, targetLabel: decisions[1].title, eventDescription: "اعتماد قرار شراء منصة ERP جديدة" },
    // -- LocalContentOS --
    { ...auditLogBase, productKey: "localcontentos", actorId: manager.id, actorName: manager.name, action: "PROJECT_CREATED", targetType: "project", targetId: lcProjects[0].id, targetLabel: lcProjects[0].name, eventDescription: "إنشاء مشروع تقييم المحتوى المحلي" },
    { ...auditLogBase, productKey: "localcontentos", actorId: analyst.id, actorName: analyst.name, action: "FINDING_CREATED", targetType: "finding", targetId: lcFindings[2].id, targetLabel: lcFindings[2].title, severity: "critical", eventDescription: "إنشاء ملاحظة: مخاطر عدم الامتثال لنظام المحتوى المحلي" },
    { ...auditLogBase, productKey: "localcontentos", actorId: manager.id, actorName: manager.name, action: "SUPPLIER_ADDED", targetType: "supplier", targetId: suppliers[0].id, targetLabel: suppliers[0].name, eventDescription: "إضافة مورد: شركة الاتصالات السعودية (STC)" },
    { ...auditLogBase, productKey: "localcontentos", actorId: reviewer.id, actorName: reviewer.name, action: "EVIDENCE_REVIEWED", targetType: "evidence", targetLabel: "شهادة-المحتوى-المحلي-STC.pdf", eventDescription: "مراجعة شهادة المحتوى المحلي لـ STC - تم التحقق" },
    // -- SalesOS --
    { ...auditLogBase, productKey: "salesos", actorId: admin.id, actorName: admin.name, action: "PIPELINE_CREATED", targetType: "pipeline", targetId: pipeline.id, targetLabel: pipeline.name, eventDescription: "إنشاء مسار المبيعات الرئيسي" },
    { ...auditLogBase, productKey: "salesos", actorId: admin.id, actorName: admin.name, action: "DEAL_CREATED", targetType: "deal", targetId: deals[0].id, targetLabel: deals[0].title, eventDescription: "إنشاء صفقة: نظام تقنية المعلومات للمستقبل بقيمة 2.5M ريال" },
    { ...auditLogBase, productKey: "salesos", actorId: operator.id, actorName: operator.name, action: "INTERACTION_LOGGED", targetType: "interaction", targetLabel: "اجتماع تعريفي بالشركة", eventDescription: "تسجيل تفاعل: اجتماع مع شركة تقنية المستقبل" },
    // -- RiskOS --
    { ...auditLogBase, productKey: "riskos", actorId: analyst.id, actorName: analyst.name, action: "ASSESSMENT_CREATED", targetType: "assessment", targetId: riskAssessment.id, targetLabel: riskAssessment.title, eventDescription: "إنشاء تقييم مخاطر للربع الثاني 2025" },
    { ...auditLogBase, productKey: "riskos", actorId: admin.id, actorName: admin.name, action: "MODEL_CREATED", targetType: "risk_model", targetId: riskModel.id, targetLabel: riskModel.name, eventDescription: "إنشاء نموذج تقييم المخاطر الشامل" },
    // -- Platform --
    { ...auditLogBase, productKey: "platform", actorId: admin.id, actorName: admin.name, action: "USER_CREATED", targetType: "user", targetLabel: "أحمد المنصوري", eventDescription: "إنشاء حساب مدير النظام (أحمد المنصوري)" },
    { ...auditLogBase, productKey: "platform", actorId: admin.id, actorName: admin.name, action: "ORG_CREATED", targetType: "organization", targetId: org.id, targetLabel: org.name, eventDescription: "إنشاء منظمة: مؤسسة الريادة للتقنية" },
  ] });

  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n========================================");
  console.log("PILOT SEED COMPLETE");
  console.log("========================================");
  console.log(`
  Platform Organization : ${platformOrg.slug}
  Organization          : ${org.name}
  Workspace             : ${workspace.slug}
  Project               : ${project.name}

  Audit Clients         : ${auditClients.length}
  Users                 : ${users.length}
  Audit Engagements     : ${engagements.length}
  Audit Findings        : ${findings.length}
  Audit Evidence        : ${evidences.length}
  Audit ReviewComments  : 2
  Trial Balances        : ${trialBalances.length} (x6 lines each)
  Account Mappings      : ${mappingTemplates.length}

  Decisions             : ${decisions.length}
  Scenarios             : ${scenarios.length}
  Risks (Decision)      : 3
  Objectives            : 2
  Alternatives          : 2
  Recommendations       : 1
  Decision Evidence     : 1

  LC Projects           : ${lcProjects.length}
  LC Suppliers          : ${suppliers.length}
  LC Spend Records      : ${spendRecords.length}
  LC Findings           : ${lcFindings.length}
  LC Evidence           : 3

  Sales Pipeline        : 1 (+${stages.length} stages)
  Sales Accounts        : ${accounts.length}
  Sales Deals           : ${deals.length}
  Sales Interactions    : 6
  Sales Contacts        : 4

  Content Workspaces    : ${contentWorkspaces.length}
  Content Items         : ${contentItemData.length}

  LocalContacts         : ${lcContacts.length}
  Contact Relations     : 3
  Contact Interactions  : 4

  PlatformAuditLog      : 20 (unified across all product areas)



  Risk Model            : 1
  Risk Assessment       : 1
  Risk Procedures       : 3
`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Done.");
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
