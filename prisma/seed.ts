import { config } from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  DecisionType,
  DecisionStatus,
  UserRole,
  RiskLevel,
  ScenarioType,
  ApprovalStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Load .env file explicitly
config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.decisionReport.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.assumption.deleteMany();
  await prisma.constraint.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.tenderProfile.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.tenantIntegration.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Seeding database...");

  // Create PlatformOrganization (bridge between Organization and AuditOrganization)
  // Upsert by slug so both seed.ts and seed-audit.ts share the same record
  const platformOrg = await prisma.platformOrganization.upsert({
    where: { slug: "aqliya-demo" },
    update: {},
    create: {
      slug: "aqliya-demo",
      name: "AQLIYA Demo",
      displayName: "AQLIYA Demo Organization",
    },
  });
  console.log(`Platform organization: ${platformOrg.slug} (${platformOrg.id})`);

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "AQLIYA Demo Organization",
      platformOrganizationId: platformOrg.id,
    },
  });
  console.log(`Created organization: ${org.name}`);

  await prisma.tenantIntegration.upsert({
    where: { id: `ai-${org.id}` },
    update: {},
    create: {
      id: `ai-${org.id}`,
      organizationId: org.id,
      type: "AI",
      provider: "aqliya-ai-runtime",
      displayName: "AQLIYA AI Runtime",
      status: "ACTIVE",
      configMetadata: {
        executionMode: "hybrid",
        cloudProvider: "openai",
        cloudModel: "",
        localBaseUrl: "http://localhost:11434",
        localModel: "llama3.2",
        hybridPolicy: {
          tb_classification: "local",
          account_mapping: "local",
          trial_balance_upload: "local",
          notes_generation: "cloud",
          report_writing: "cloud",
          audit_findings: "cloud",
          analytical_review: "local",
        },
      },
    },
  });
  console.log("Created default AI runtime integration (hybrid)");

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@aqliya.com",
      name: "Ahmed Al-Mansouri",
      role: UserRole.ADMIN,
      organizationId: org.id,
      passwordHash: await bcrypt.hash("admin123", 10),
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      email: "sara@aqliya.com",
      name: "Sara Al-Otaibi",
      role: UserRole.OPERATOR,
      organizationId: org.id,
      passwordHash: await bcrypt.hash("operator123", 10),
    },
  });

  const approver = await prisma.user.create({
    data: {
      email: "mohammad@aqliya.com",
      name: "Mohammad Al-Harbi",
      role: UserRole.VIEWER,
      organizationId: org.id,
      passwordHash: await bcrypt.hash("viewer123", 10),
    },
  });
  // Update platform organization with the admin as creator
  await prisma.platformOrganization.update({
    where: { id: platformOrg.id },
    data: { createdById: admin.id },
  });

  console.log("Created 3 users");

  // Create Decision - TENDER
  const tenderDecision = await prisma.decision.create({
    data: {
      title: "Non-Profit Training & Empowerment Tender - 1,000 Beneficiaries",
      type: DecisionType.TENDER,
      description:
        "Evaluate whether to bid on a non-profit training tender targeting 1,000 social security beneficiaries over 4 months.",
      priority: "HIGH",
      targetDate: new Date("2026-09-01"),
      ownerId: admin.id,
      reviewerId: reviewer.id,
      approverId: approver.id,
      organizationId: org.id,
      status: DecisionStatus.IN_REVIEW,
    },
  });
  console.log(`Created tender decision: ${tenderDecision.title}`);

  // Create Objectives for Tender
  await prisma.objective.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        description: "Train and empower 1,000 social security beneficiaries",
      },
      {
        decisionId: tenderDecision.id,
        description: "Establish long-term partnership with non-profit sector",
      },
      {
        decisionId: tenderDecision.id,
        description: "Achieve 12% margin target",
      },
    ],
  });

  // Create Constraints for Tender
  await prisma.constraint.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        description: "4-month delivery timeline",
      },
      {
        decisionId: tenderDecision.id,
        description: "Limited internal training resources",
      },
      {
        decisionId: tenderDecision.id,
        description: "Compliance with non-profit regulations",
      },
    ],
  });

  // Create Assumptions for Tender
  await prisma.assumption.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        description: "Stable training material costs",
      },
      {
        decisionId: tenderDecision.id,
        description: "No major regulatory changes during project",
      },
      {
        decisionId: tenderDecision.id,
        description: "Client payment within 45 days",
      },
    ],
  });

  // Create Alternatives for Tender
  await prisma.alternative.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        description: "Partner with local training center",
      },
      {
        decisionId: tenderDecision.id,
        description: "Subcontract training delivery",
      },
      {
        decisionId: tenderDecision.id,
        description: "Decline and focus on private sector",
      },
    ],
  });

  // Create Risks for Tender
  await prisma.risk.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        description: "Resource overallocation",
        level: RiskLevel.MEDIUM,
      },
      {
        decisionId: tenderDecision.id,
        description: "Training material price volatility",
        level: RiskLevel.LOW,
      },
      {
        decisionId: tenderDecision.id,
        description: "Client payment delays",
        level: RiskLevel.MEDIUM,
      },
    ],
  });

  // Create TenderProfile
  await prisma.tenderProfile.create({
    data: {
      decisionId: tenderDecision.id,
      clientName: "Social Development Non-Profit Organization",
      estimatedContractValue: 2800000,
      estimatedCost: 2460000,
      durationMonths: 4,
      requiredCapacity: 35,
      internalAvailableCapacity: 50,
      strategicFitScore: 90,
      riskLevel: RiskLevel.LOW,
      marginEstimate: 12.1,
    },
  });
  console.log("Created tender profile");

  // Create Scenarios for Tender
  const tenderBestCase = await prisma.scenario.create({
    data: {
      decisionId: tenderDecision.id,
      type: ScenarioType.BEST_CASE,
    },
  });

  const tenderExpectedCase = await prisma.scenario.create({
    data: {
      decisionId: tenderDecision.id,
      type: ScenarioType.EXPECTED_CASE,
    },
  });

  const tenderWorstCase = await prisma.scenario.create({
    data: {
      decisionId: tenderDecision.id,
      type: ScenarioType.WORST_CASE,
    },
  });

  // Create SimulationResults for Tender
  await prisma.simulationResult.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        scenarioId: tenderBestCase.id,
        feasibilityScore: 95,
        financialScore: 90,
        capacityScore: 92,
        riskScore: 94,
        strategicFitScore: 95,
        overallDecisionScore: 93.2,
      },
      {
        decisionId: tenderDecision.id,
        scenarioId: tenderExpectedCase.id,
        feasibilityScore: 82,
        financialScore: 78,
        capacityScore: 85,
        riskScore: 80,
        strategicFitScore: 90,
        overallDecisionScore: 83.0,
      },
      {
        decisionId: tenderDecision.id,
        scenarioId: tenderWorstCase.id,
        feasibilityScore: 65,
        financialScore: 62,
        capacityScore: 70,
        riskScore: 68,
        strategicFitScore: 90,
        overallDecisionScore: 71.0,
      },
    ],
  });
  console.log("Created tender scenarios and simulation results");

  // Create Recommendation for Tender
  await prisma.recommendation.create({
    data: {
      decisionId: tenderDecision.id,
      recommendedAction: "Proceed with the tender with conditions",
      rationale:
        "Strong strategic fit and acceptable Expected Case score of 83. Capacity and financial scores are adequate with identified manageable risks.",
      expectedNextState:
        "Contract signed with reallocated capacity and price lock-in secured",
      scopeExclusions:
        "Does not include additional training material development beyond current scope",
      assumptionsUsed:
        "Current resource allocation can be reallocated by 20% without impacting other projects",
      risksAccepted:
        "Medium risks related to resource allocation and payment delays with mitigation plan",
      risksRejected:
        "High financial risk from uncapped payment terms - mitigated through contract clauses",
      humanReviewRequired: true,
    },
  });
  console.log("Created tender recommendation");

  // Create Approval for Tender
  await prisma.approval.create({
    data: {
      decisionId: tenderDecision.id,
      approverId: approver.id,
      status: ApprovalStatus.PENDING,
      comments: "Under review - need to verify capacity reallocation plan",
    },
  });

  // Create AuditLogs for Tender
  await prisma.auditLog.createMany({
    data: [
      {
        decisionId: tenderDecision.id,
        organizationId: org.id,
        userId: admin.id,
        action: "DECISION_CREATED",
        entity: "Decision",
        after: JSON.stringify({ title: tenderDecision.title, status: "DRAFT" }),
      },
      {
        decisionId: tenderDecision.id,
        organizationId: org.id,
        userId: admin.id,
        action: "DECISION_UPDATED",
        entity: "TenderProfile",
        after: JSON.stringify({
          clientName: "Social Development Non-Profit Organization",
        }),
      },
      {
        decisionId: tenderDecision.id,
        organizationId: org.id,
        userId: admin.id,
        action: "DECISION_UPDATED",
        entity: "Decision",
        before: "DRAFT",
        after: "IN_REVIEW",
      },
    ],
  });
  console.log("Created tender audit logs");

  // --- INVESTMENT Decision ---
  const investmentDecision = await prisma.decision.create({
    data: {
      title: "Cloud Infrastructure Migration Investment",
      type: DecisionType.INVESTMENT,
      description:
        "Evaluate whether to invest SAR 4.2M in migrating on-premise infrastructure to cloud over 18 months.",
      priority: "HIGH",
      targetDate: new Date("2026-12-01"),
      ownerId: admin.id,
      reviewerId: reviewer.id,
      organizationId: org.id,
      status: DecisionStatus.DRAFT,
    },
  });
  console.log(`Created investment decision: ${investmentDecision.title}`);

  await prisma.objective.createMany({
    data: [
      {
        decisionId: investmentDecision.id,
        description:
          "Reduce infrastructure operating costs by 30% within 2 years",
      },
      {
        decisionId: investmentDecision.id,
        description: "Improve system availability from 99.5% to 99.95%",
      },
      {
        decisionId: investmentDecision.id,
        description: "Enable auto-scaling for peak demand periods",
      },
    ],
  });

  await prisma.constraint.createMany({
    data: [
      {
        decisionId: investmentDecision.id,
        description: "Must maintain operations during migration",
      },
      {
        decisionId: investmentDecision.id,
        description: "Data sovereignty requirements for Saudi data",
      },
    ],
  });

  await prisma.alternative.createMany({
    data: [
      {
        decisionId: investmentDecision.id,
        description: "Full migration to public cloud (AWS/GCP)",
      },
      {
        decisionId: investmentDecision.id,
        description: "Hybrid cloud approach with on-premise core",
      },
      {
        decisionId: investmentDecision.id,
        description: "Defer migration and optimize current infrastructure",
      },
    ],
  });

  await prisma.risk.createMany({
    data: [
      {
        decisionId: investmentDecision.id,
        description: "Migration downtime impacting operations",
        level: RiskLevel.HIGH,
      },
      {
        decisionId: investmentDecision.id,
        description: "Cloud cost overruns beyond projections",
        level: RiskLevel.MEDIUM,
      },
      {
        decisionId: investmentDecision.id,
        description: "Skills gap in cloud operations team",
        level: RiskLevel.MEDIUM,
      },
    ],
  });

  console.log("Created investment decision data");

  // --- STRATEGIC Decision ---
  const strategicDecision = await prisma.decision.create({
    data: {
      title: "Market Expansion into UAE - Strategic Entry",
      type: DecisionType.STRATEGIC,
      description:
        "Evaluate strategic entry into UAE market through direct presence vs. partnership model.",
      priority: "MEDIUM",
      targetDate: new Date("2027-03-01"),
      ownerId: admin.id,
      reviewerId: reviewer.id,
      organizationId: org.id,
      status: DecisionStatus.DRAFT,
    },
  });
  console.log(`Created strategic decision: ${strategicDecision.title}`);

  await prisma.objective.createMany({
    data: [
      {
        decisionId: strategicDecision.id,
        description: "Establish revenue presence in UAE within 12 months",
      },
      {
        decisionId: strategicDecision.id,
        description:
          "Leverage existing Saudi client relationships with UAE operations",
      },
    ],
  });

  await prisma.constraint.createMany({
    data: [
      {
        decisionId: strategicDecision.id,
        description: "Limited budget for initial market entry",
      },
      {
        decisionId: strategicDecision.id,
        description: "Must comply with UAE local content requirements",
      },
    ],
  });

  await prisma.alternative.createMany({
    data: [
      {
        decisionId: strategicDecision.id,
        description: "Open Dubai office with 5-person team",
      },
      {
        decisionId: strategicDecision.id,
        description: "Partner with established UAE firm for market access",
      },
      {
        decisionId: strategicDecision.id,
        description: "Serve UAE clients remotely from Saudi base",
      },
    ],
  });

  await prisma.risk.createMany({
    data: [
      {
        decisionId: strategicDecision.id,
        description: "Regulatory complexity in UAE market",
        level: RiskLevel.MEDIUM,
      },
      {
        decisionId: strategicDecision.id,
        description: "Currency fluctuation impact on revenue",
        level: RiskLevel.LOW,
      },
    ],
  });

  console.log("Created strategic decision data");

  // --- HIRING Decision ---
  const hiringDecision = await prisma.decision.create({
    data: {
      title: "Senior Financial Analyst - Key Hire Q3 2026",
      type: DecisionType.HIRING,
      description:
        "Evaluate whether to hire a senior financial analyst to support the growing AuditOS portfolio.",
      priority: "MEDIUM",
      targetDate: new Date("2026-08-01"),
      ownerId: reviewer.id,
      organizationId: org.id,
      status: DecisionStatus.DRAFT,
    },
  });
  console.log(`Created hiring decision: ${hiringDecision.title}`);

  await prisma.objective.createMany({
    data: [
      {
        decisionId: hiringDecision.id,
        description: "Reduce audit engagement turnaround time by 25%",
      },
      {
        decisionId: hiringDecision.id,
        description: "Support 3 additional audit engagements per quarter",
      },
    ],
  });

  await prisma.constraint.createMany({
    data: [
      {
        decisionId: hiringDecision.id,
        description: "Budget ceiling of SAR 18,000/month",
      },
      {
        decisionId: hiringDecision.id,
        description: "Must have IFRS for SMEs experience",
      },
    ],
  });

  await prisma.alternative.createMany({
    data: [
      {
        decisionId: hiringDecision.id,
        description: "Hire full-time senior analyst",
      },
      {
        decisionId: hiringDecision.id,
        description: "Contract with freelance financial analyst",
      },
      {
        decisionId: hiringDecision.id,
        description: "Upskill existing team member",
      },
    ],
  });

  await prisma.risk.createMany({
    data: [
      {
        decisionId: hiringDecision.id,
        description: "Difficulty finding qualified candidates",
        level: RiskLevel.MEDIUM,
      },
      {
        decisionId: hiringDecision.id,
        description: "Onboarding time reduces near-term capacity",
        level: RiskLevel.LOW,
      },
    ],
  });

  console.log("Created hiring decision data");

  // ─── DecisionEvidence seeds ───
  await prisma.decisionEvidence.create({
    data: {
      decisionId: tenderDecision.id,
      organizationId: org.id,
      filename: "tender-evaluation-matrix.xlsx",
      fileType: "xlsx",
      fileSize: 245760,
      fileHash: "a1b2c3d4e5f6",
      storageKey: `decisions/${tenderDecision.id}/evidence/tender-evaluation-matrix.xlsx`,
      uploadedById: admin.id,
      description: "مصفوفة تقييم العطاءات",
      metadata: { uploadedAt: "2026-05-20T10:00:00Z" },
    },
  });
  await prisma.decisionEvidence.create({
    data: {
      decisionId: tenderDecision.id,
      organizationId: org.id,
      filename: "vendor-qualification-report.pdf",
      fileType: "pdf",
      fileSize: 512000,
      fileHash: "b2c3d4e5f6a7",
      storageKey: `decisions/${tenderDecision.id}/evidence/vendor-qualification-report.pdf`,
      uploadedById: admin.id,
      description: "تقرير تأهيل الموردين",
    },
  });
  await prisma.decisionEvidence.create({
    data: {
      decisionId: investmentDecision.id,
      organizationId: org.id,
      filename: "financial-analysis.xlsx",
      fileType: "xlsx",
      fileSize: 389120,
      fileHash: "c3d4e5f6a7b8",
      storageKey: `decisions/${investmentDecision.id}/evidence/financial-analysis.xlsx`,
      uploadedById: admin.id,
      description: "تحليل مالي للاستثمار",
    },
  });
  await prisma.decisionEvidence.create({
    data: {
      decisionId: strategicDecision.id,
      organizationId: org.id,
      filename: "market-research-summary.pdf",
      fileType: "pdf",
      fileSize: 1048576,
      fileHash: "d4e5f6a7b8c9",
      storageKey: `decisions/${strategicDecision.id}/evidence/market-research-summary.pdf`,
      uploadedById: admin.id,
      description: "ملخص أبحاث السوق",
    },
  });
  console.log("Created DecisionEvidence seed data");

  // ─── WorkflowOS (Sunbul) seed data ───
  const workflowClient = await prisma.sunbulClient.upsert({
    where: { slug: "aqliya-demo" },
    update: {},
    create: {
      id: "wfc-aqliya-demo",
      name: "Aqliya Demo Org",
      slug: "aqliya-demo",
      status: "Active",
      platformOrganizationId: platformOrg.id,
    },
  });
  await prisma.sunbulUserMembership.upsert({
    where: {
      clientId_userId: { clientId: workflowClient.id, userId: admin.id },
    },
    update: {},
    create: {
      clientId: workflowClient.id,
      userId: admin.id,
      role: "PlatformAdmin",
      status: "Active",
    },
  });
  console.log("Created WorkflowOS seed data");

  // ─── AuditOS Engagement (for cross-product routes) ───
  // Ensure eng-gulf-2025 exists so tenant-guard and workspace-guard pass
  // even when seed-audit.ts has not been run separately.
  const auditOrg = await prisma.auditOrganization.upsert({
    where: { slug: "aqliya-audit" },
    update: {},
    create: {
      id: "org-aqliya",
      name: "Aqliya Audit Firm",
      slug: "aqliya-audit",
      jurisdiction: "Saudi Arabia",
      regulatoryFramework: "IFRS for SMEs",
      governanceRules: {
        requireEvidenceForMaterialFindings: true,
        maxApprovalDays: 14,
      },
      status: "active",
      createdById: admin.id,
      platformOrganizationId: platformOrg.id,
    },
  });

  const auditClient = await prisma.auditClient.upsert({
    where: { id: "cli-gulf-trading" },
    update: {},
    create: {
      id: "cli-gulf-trading",
      organizationId: auditOrg.id,
      name: "Gulf Trading Co.",
      registrationNumber: "CR-2021-88432",
      industry: "Wholesale Trade",
      reportingFramework: "ifrs_for_smes",
      fiscalPeriodEnd: "12-31",
      currencyCode: "SAR",
      status: "active",
      contactEmail: "finance@gulf-trading.sa",
      contactPhone: "+966 55 123 4567",
      createdById: admin.id,
    },
  });

  const auditWorkspace = await prisma.clientWorkspace.upsert({
    where: {
      platformOrganizationId_slug: {
        platformOrganizationId: platformOrg.id,
        slug: "gulf-trading",
      },
    },
    update: {},
    create: {
      id: "cws-gulf-trading",
      platformOrganizationId: platformOrg.id,
      name: "Gulf Trading Co.",
      slug: "gulf-trading",
      workspaceType: "client",
      status: "active",
      productAccess: { audit: true },
      metadata: {
        source: "seed",
        auditClientId: auditClient.id,
      },
    },
  });

  await prisma.auditClient.update({
    where: { id: auditClient.id },
    data: { clientWorkspaceId: auditWorkspace.id },
  });

  const auditProject = await prisma.project.upsert({
    where: { id: "proj-gulf-2025-audit" },
    update: {},
    create: {
      id: "proj-gulf-2025-audit",
      workspaceId: auditWorkspace.id,
      name: "Gulf Trading Co. — FY2025",
      projectType: "audit_engagement",
      status: "active",
      metadata: {
        source: "seed",
        auditEngagementId: "eng-gulf-2025",
        fiscalPeriod: "FY2025",
      },
    },
  });

  await prisma.auditEngagement.upsert({
    where: { id: "eng-gulf-2025" },
    update: { projectId: auditProject.id },
    create: {
      id: "eng-gulf-2025",
      organizationId: auditOrg.id,
      clientId: auditClient.id,
      projectId: auditProject.id,
      fiscalPeriod: "FY2025",
      engagementType: "full_audit",
      status: "in_progress",
      createdById: admin.id,
      team: [
        {
          userId: "usr-khalid",
          userName: "Khalid Al Saud",
          role: "partner",
          assignedAt: "2025-03-01T00:00:00Z",
        },
        {
          userId: "usr-farida",
          userName: "Farida Al Zamil",
          role: "manager",
          assignedAt: "2025-03-01T00:00:00Z",
        },
        {
          userId: "usr-sarah",
          userName: "Sarah Al Otaibi",
          role: "reviewer",
          assignedAt: "2025-03-02T00:00:00Z",
        },
        {
          userId: "usr-ahmed",
          userName: "Ahmed Al Ghamdi",
          role: "operator",
          assignedAt: "2025-03-02T00:00:00Z",
        },
      ],
      alerts: [
        {
          id: "alert-1",
          type: "warning",
          message: "Inventory count sheet not yet uploaded",
          source: "Evidence",
          createdAt: "2025-05-01T00:00:00Z",
        },
        {
          id: "alert-2",
          type: "info",
          message: "Short-term Loan classification review pending",
          source: "Finding",
          createdAt: "2025-05-02T00:00:00Z",
        },
        {
          id: "alert-3",
          type: "warning",
          message: "Revenue concentration analysis recommended",
          source: "AI",
          createdAt: "2025-05-03T00:00:00Z",
        },
        {
          id: "alert-4",
          type: "info",
          message: "Finance Cost disclosure note incomplete",
          source: "Notes",
          createdAt: "2025-05-03T00:00:00Z",
        },
      ],
    },
  });
  console.log(
    `  AuditOS engagement: eng-gulf-2025 (${auditOrg.name} / ${auditClient.name})`,
  );

  // ─── LocalContactOS Seed Data ─────────────────────────────
  console.log("Seeding LocalContactOS...");

  const contactsData = [
    {
      name: "سارة القحطاني",
      email: "sara.alqahtani@mci.gov.sa",
      phone: "+966 55 123 4567",
      position: "مدير إدارة المشتريات",
      department: "المشتريات",
      organizationName: "وزارة التجارة والصناعة",
      sensitivityLevel: "sensitive",
      notes: "الجهة المسؤولة عن العقود الحكومية في قطاع المشتريات. تفضل التواصل عبر البريد الإلكتروني الرسمي.",
      tags: ["حكومي", "مشتريات", "عقود"],
    },
    {
      name: "فيصل الدوسري",
      email: "faisal@dossary-holding.com",
      phone: "+966 50 234 5678",
      position: "الرئيس التنفيذي",
      department: "الإدارة التنفيذية",
      organizationName: "مؤسسة الدوسري القابضة",
      sensitivityLevel: "normal",
      notes: "شريك استراتيجي في قطاع المقاولات. اهتمام بمبادرات المحتوى المحلي.",
      tags: ["شريك", "قطاع خاص", "مقاولات"],
    },
    {
      name: "نورة الشمري",
      email: "noura.shamri@nemr.com.sa",
      phone: "+966 56 345 6789",
      position: "مدير الموارد البشرية",
      department: "الموارد البشرية",
      organizationName: "شركة نمر للصناعة",
      sensitivityLevel: "sensitive",
      notes: "التواصل بخصوص برامج التوطين وتطوير الكوادر الوطنية. سابقة أعمال في برامج التدريب المشترك.",
      tags: ["قطاع خاص", "صناعة", "موارد بشرية", "توطين"],
    },
    {
      name: "عبدالرحمن العتيبي",
      email: "abdulrahman@otaibi-consulting.com",
      phone: "+966 54 456 7890",
      position: "مستشار قانوني",
      department: "الشؤون القانونية",
      organizationName: "مكتب العتيبي للاستشارات",
      sensitivityLevel: "confidential",
      notes: "مستشار قانوني للعديد من العقود الحكومية. المعلومات سرية - لا تشارك بدون موافقة.",
      tags: ["قانوني", "استشارات", "سري"],
    },
    {
      name: "مريم الزهراني",
      email: "maryam.zahrani@kafaa.gov.sa",
      phone: "+966 55 567 8901",
      position: "أخصائي محتوى محلي",
      department: "إدارة المحتوى المحلي",
      organizationName: "هيئة كفاءة المحتوى المحلي",
      sensitivityLevel: "normal",
      notes: "مسؤولة عن متابعة تقارير المحتوى المحلي للجهات الحكومية.",
      tags: ["حكومي", "محتوى محلي", "هيئة"],
    },
    {
      name: "خالد الغامدي",
      email: "khalid.ghamdi@bayanatech.com",
      phone: "+966 53 678 9012",
      position: "نائب الرئيس لتقنية المعلومات",
      department: "تقنية المعلومات",
      organizationName: "شركة بيانة للتقنية",
      sensitivityLevel: "normal",
      notes: "شريك تقني محتمل لمنصة عقلية. اجتماعات سابقة حول تكامل الأنظمة.",
      tags: ["تقنية", "شريك محتمل", "تكامل"],
    },
  ];

  const createdContacts: any[] = [];
  for (const c of contactsData) {
    const contact = await prisma.localContact.create({
      data: {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        position: c.position,
        department: c.department,
        organizationName: c.organizationName,
        sensitivityLevel: c.sensitivityLevel,
        notes: c.notes,
        tags: c.tags,
        createdById: admin.id,
      },
    });
    createdContacts.push(contact);
  }
  console.log(`Created ${createdContacts.length} contacts`);

  // Create relations between contacts
  await prisma.localContactRelation.createMany({
    data: [
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        sourceContactId: createdContacts[0].id, // سارة القحطاني
        targetContactId: createdContacts[4].id, // مريم الزهراني
        relationType: "partner",
        description: "تعاون مشترك في متابعة عقود المشتريات الحكومية ومتطلبات المحتوى المحلي",
        strength: 8,
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        sourceContactId: createdContacts[2].id, // نورة الشمري
        targetContactId: createdContacts[5].id, // خالد الغامدي
        relationType: "colleague",
        description: "شراكة سابقة في مشروع توطين التقنية",
        strength: 6,
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        sourceContactId: createdContacts[3].id, // عبدالرحمن العتيبي
        targetContactId: createdContacts[0].id, // سارة القحطاني
        relationType: "client",
        description: "استشارات قانونية لعقود وزارة التجارة",
        strength: 9,
        createdById: admin.id,
      },
    ],
  });
  console.log("Created 3 contact relations");

  // Create interactions
  const now = new Date();
  await prisma.localContactInteraction.createMany({
    data: [
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: createdContacts[0].id,
        interactionType: "meeting",
        subject: "اجتماع مناقشة متطلبات المحتوى المحلي للعقود الجديدة",
        summary: "تم مناقشة آلية تطبيق متطلبات المحتوى المحلي في العقود الحكومية الجديدة. تم الاتفاق على عقد ورشة عمل للأطراف المعنية.",
        occurredAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        duration: 90,
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: createdContacts[1].id,
        interactionType: "call",
        subject: "متابعة عرض الشراكة الاستراتيجية",
        summary: "اتصال هاتفي لمناقشة بنود مذكرة التفاهم المقترحة. أبدى فيصل اهتمامه بالتفاصيل.",
        occurredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        duration: 30,
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: createdContacts[4].id,
        interactionType: "email",
        subject: "طلب تقرير المحتوى المحلي الربعي",
        summary: "تم إرسال طلب رسمي للحصول على تقرير المحتوى المحلي للربع الثاني.",
        occurredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: createdContacts[5].id,
        interactionType: "meeting",
        subject: "اجتماع عرض منصة عقلية",
        summary: "عرض توضيحي لمنصة عقلية وقدراتها في إدارة العلاقات المؤسسية. إهتمام واضح بتكامل الأنظمة.",
        occurredAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        duration: 120,
        createdById: admin.id,
      },
    ],
  });
  console.log("Created 4 contact interactions");

  // Create evidence (confidential contact)
  const confContact = createdContacts[3]; // عبدالرحمن العتيبي
  await prisma.contactEvidence.createMany({
    data: [
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: confContact.id,
        filename: "اتفاقية_سرية_الاستشارات_القانونية.pdf",
        fileType: "pdf",
        description: "اتفاقية السرية الموقعة مع مكتب العتيبي للاستشارات القانونية",
        evidenceType: "document",
        sizeBytes: 245760,
        uploadedById: admin.id,
      },
      {
        organizationId: org.id,
        platformOrganizationId: platformOrg.id,
        contactId: createdContacts[0].id,
        filename: "ملخص_اجتماع_المشتريات.docx",
        fileType: "docx",
        description: "ملخص اجتماع مناقشة متطلبات المحتوى المحلي",
        evidenceType: "reference",
        sizeBytes: 51200,
        uploadedById: admin.id,
      },
    ],
  });
  console.log("Created 2 evidence records");

  // Create a review for the confidential contact + approval
  const confReview = await prisma.contactReview.create({
    data: {
      organizationId: org.id,
      platformOrganizationId: platformOrg.id,
      contactId: confContact.id,
      reviewType: "sensitivity",
      status: "approved",
      reviewerId: admin.id,
      reviewerName: admin.name,
      reason: "مراجعة دورية لمستوى حساسية البيانات",
      findings: [
        { category: "بيانات شخصية", level: "high", note: "يحتوي على معلومات تعريفية حساسة" },
        { category: "بيانات تعاقدية", level: "critical", note: "يشمل عقودًا سرية مع جهات حكومية" },
      ],
      reviewerNotes: "تمت المراجعة والتأكيد على المستوى السري. التصدير يتطلب موافقة مسبقة.",
      completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contactApproval.create({
    data: {
      organizationId: org.id,
      platformOrganizationId: platformOrg.id,
      reviewId: confReview.id,
      approverId: admin.id,
      approverName: admin.name,
      status: "approved",
      note: "موافق على تصنيف جهة الاتصال كمستوى سري",
    },
  });
  console.log("Created 1 review + 1 approval");

  // Create an export request for a sensitive contact
  await prisma.contactExportRequest.create({
    data: {
      organizationId: org.id,
      platformOrganizationId: platformOrg.id,
      contactId: createdContacts[0].id, // سارة القحطاني (sensitive)
      status: "approved",
      requestedById: admin.id,
      requestedByName: admin.name,
      reason: "تصدير معلومات جهة الاتصال لتضمينها في تقرير الشركاء",
      reviewedById: admin.id,
      reviewedByName: admin.name,
      reviewNote: "موافق - معلومات عامة للجهة",
      reviewedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      requiresLegalReview: false,
      legalReviewStatus: "not_required",
    },
  });
  console.log("Created 1 export request");

  // Audit events for the seed data
  await prisma.platformAuditLog.createMany({
    data: [
      {
        platformOrganizationId: platformOrg.id,
        productKey: "localcontactos",
        actorId: admin.id,
        actorName: admin.name,
        action: "seed",
        targetType: "LocalContact",
        targetId: "bulk",
        targetLabel: "6 contacts seeded",
        severity: "info",
        metadata: { source: "seed" },
      },
      {
        platformOrganizationId: platformOrg.id,
        productKey: "localcontactos",
        actorId: admin.id,
        actorName: admin.name,
        action: "seed",
        targetType: "ContactEvidence",
        targetId: "bulk",
        targetLabel: "2 evidence records seeded",
        severity: "info",
        metadata: { source: "seed" },
      },
    ],
  });
  console.log("Created 2 audit events for contacts");

  // ─── End LocalContactOS Seed Data ─────────────────────────

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
