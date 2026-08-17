import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient, DecisionType, DecisionStatus, AuditAction } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// ── Deterministic CUIDs for idempotency ──
const DECISION_PREFIX = "dsc-seed-";

const decisions = [
  {
    id: DECISION_PREFIX + "it-contract",
    titleAr: "تمديد عقد تقنية المعلومات",
    titleEn: "IT Contract Extension",
    type: DecisionType.TENDER,
    description: "تقييم تمديد العقد الحالي مع مزود خدمات تقنية المعلومات لمدة سنتين إضافيتين مع إمكانية إعادة التفاوض على الشروط التجارية.",
    descriptionEn: "Evaluate the extension of the current IT services contract for an additional two years with potential renegotiation of commercial terms.",
    priority: "HIGH",
    status: DecisionStatus.IN_REVIEW,
    targetDate: new Date("2026-06-15"),
    evidenceCount: 2,
    hasObjectives: true,
    hasRisks: true,
    hasAudit: true,
  },
  {
    id: DECISION_PREFIX + "bi-investment",
    titleAr: "الاستثمار في منصة ذكاء الأعمال",
    titleEn: "BI Platform Investment",
    type: DecisionType.INVESTMENT,
    description: "دراسة الاستثمار في منصة ذكاء أعمال متقدمة لتحليل البيانات التشغيلية والمالية ودعم اتخاذ القرارات الاستراتيجية.",
    descriptionEn: "Study the investment in an advanced business intelligence platform for analyzing operational and financial data to support strategic decision-making.",
    priority: "URGENT",
    status: DecisionStatus.DRAFT,
    targetDate: new Date("2026-07-01"),
    evidenceCount: 1,
    hasObjectives: true,
    hasRisks: true,
    hasAudit: true,
  },
  {
    id: DECISION_PREFIX + "digital-strategy",
    titleAr: "استراتيجية التحول الرقمي 2026",
    titleEn: "Digital Transformation Strategy 2026",
    type: DecisionType.STRATEGIC,
    description: "اعتماد استراتيجية التحول الرقمي للمؤسسة للعام 2026 بما يشمل تحديث البنية التحتية وتطوير الكفاءات الرقمية.",
    descriptionEn: "Adopt the organization's digital transformation strategy for 2026, including infrastructure modernization and digital skills development.",
    priority: "MEDIUM",
    status: DecisionStatus.APPROVED,
    targetDate: new Date("2026-06-30"),
    evidenceCount: 3,
    hasObjectives: true,
    hasRisks: true,
    hasAudit: true,
  },
  {
    id: DECISION_PREFIX + "hrms-procurement",
    titleAr: "شراء نظام إدارة الموارد البشرية",
    titleEn: "HRMS Procurement",
    type: DecisionType.PROCUREMENT,
    description: "شراء وتنصيب نظام متكامل لإدارة الموارد البشرية ليشمل إدارة الرواتب والحضور والإجازات وتقييم الأداء.",
    descriptionEn: "Procure and implement an integrated human resources management system covering payroll, attendance, leave, and performance evaluation.",
    priority: "HIGH",
    status: DecisionStatus.IN_REVIEW,
    targetDate: new Date("2026-08-15"),
    evidenceCount: 2,
    hasObjectives: true,
    hasRisks: false,
    hasAudit: true,
  },
  {
    id: DECISION_PREFIX + "compliance-hiring",
    titleAr: "توظيف مدير الامتثال",
    titleEn: "Compliance Manager Hiring",
    type: DecisionType.HIRING,
    description: "استحداث وظيفة مدير الامتثال التنظيمي للإشراف على تطبيق معايير الحوكمة والامتثال للوائح هيئة السوق المالية.",
    descriptionEn: "Create a regulatory compliance manager position to oversee governance standards and compliance with Capital Market Authority regulations.",
    priority: "MEDIUM",
    status: DecisionStatus.APPROVED,
    targetDate: new Date("2026-07-15"),
    evidenceCount: 1,
    hasObjectives: true,
    hasRisks: true,
    hasAudit: true,
  },
  {
    id: DECISION_PREFIX + "cloud-partnership",
    titleAr: "الشراكة مع مزود خدمات سحابية",
    titleEn: "Cloud Services Partnership",
    type: DecisionType.PARTNERSHIP,
    description: "إبرام شراكة استراتيجية مع مزود خدمات سحابية معتمد لنقل البنية التحتية التقنية إلى البيئة السحابية.",
    descriptionEn: "Establish a strategic partnership with an accredited cloud services provider to migrate the technical infrastructure to the cloud.",
    priority: "LOW",
    status: DecisionStatus.DRAFT,
    targetDate: new Date("2026-08-01"),
    evidenceCount: 0,
    hasObjectives: true,
    hasRisks: false,
    hasAudit: true,
  },
];

interface DecisionData {
  id: string;
  titleAr: string;
  titleEn: string;
  type: DecisionType;
  description: string;
  descriptionEn: string;
  priority: string;
  status: DecisionStatus;
  targetDate: Date;
  evidenceCount: number;
  hasObjectives: boolean;
  hasRisks: boolean;
  hasAudit: boolean;
}

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PROD) {
    throw new Error("Seeding in production is not allowed. Set ALLOW_SEED_IN_PROD to override.");
  }

  console.log("Checking for existing admin user...");

  // Look up the admin user (created by prisma/seed.ts)
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
    select: { id: true, organizationId: true, name: true },
  });

  if (!adminUser) {
    throw new Error(
      "Admin user not found (admin@aqliya.com). Run prisma/seed.ts first."
    );
  }

  console.log("Admin user:", adminUser.name, "| Org:", adminUser.organizationId);
  console.log("Seeding DecisionOS sample decisions...\n");

  // Use $transaction for atomicity
  await prisma.$transaction(async (tx) => {
    for (const dec of decisions as DecisionData[]) {
      const fullTitle = dec.titleAr + " (" + dec.titleEn + ")";

      // ─── Check if decision already exists ───
      const existing = await tx.decision.findUnique({
        where: { id: dec.id },
      });

      if (existing) {
        console.log("  [SKIP] Decision already exists:", dec.id, "—", dec.titleAr);
        continue;
      }

      // ─── Create the decision ───
      const decision = await tx.decision.create({
        data: {
          id: dec.id,
          title: fullTitle,
          type: dec.type,
          description: dec.description + "\n\n" + dec.descriptionEn,
          priority: dec.priority,
          status: dec.status,
          targetDate: dec.targetDate,
          ownerId: adminUser.id,
          organizationId: adminUser.organizationId,
        },
      });
      console.log("  [CREATE] Decision:", decision.id, "—", dec.titleAr);

      // ─── Objectives ───
      if (dec.hasObjectives) {
        const objectives = getObjectivesForDecision(dec.id);
        for (const obj of objectives) {
          await tx.objective.create({
            data: {
              decisionId: decision.id,
              description: obj,
            },
          });
        }
        console.log("    -> Objectives:", objectives.length);
      }

      // ─── Risks ───
      if (dec.hasRisks) {
        const risks = getRisksForDecision(dec.id);
        for (const r of risks) {
          await tx.risk.create({
            data: {
              decisionId: decision.id,
              description: r.description,
              level: r.level as any,
            },
          });
        }
        console.log("    -> Risks:", risks.length);
      }

      // ─── Evidence ───
      if (dec.evidenceCount > 0) {
        const evidence = getEvidenceForDecision(dec.id, decision.id, adminUser.organizationId, adminUser.id);
        for (const ev of evidence) {
          await tx.decisionEvidence.create({ data: ev });
        }
        console.log("    -> Evidence:", evidence.length);
      }

      // ─── Audit log entries ───
      if (dec.hasAudit) {
        const auditEntries = getAuditForDecision(dec.id, decision.id, adminUser.organizationId, adminUser.id, dec.status);
        for (const entry of auditEntries) {
          await tx.platformAuditLog.create({ data: { ...entry, productKey: "decisionos", severity: "info", sourceSystem: "seed-decisionos" } });
        }
        console.log("    -> Audit entries:", auditEntries.length);
      }
    }
  });

  console.log("\nDecisionOS seed complete. Created/verified", decisions.length, "decisions.");
}

// ── Helper functions for deterministic data ──

function getObjectivesForDecision(decisionId: string): string[] {
  const map: Record<string, string[]> = {
    "dsc-seed-it-contract": [
      "تخفيض التكاليف التشغيلية لتقنية المعلومات بنسبة 15%",
      "تحسين مستوى الخدمة ومؤشرات الأداء",
      "ضمان استمرارية الأعمال وتوفر الأنظمة",
      "Reduce operational IT costs by 15%",
      "Improve service levels and performance indicators",
    ],
    "dsc-seed-bi-investment": [
      "توحيد تقارير الأداء في منصة واحدة",
      "تمكين التحليل التنبؤي للبيانات المالية",
      "تقليل وقت إعداد التقارير من 5 أيام إلى يوم واحد",
      "Unify performance reports in a single platform",
    ],
    "dsc-seed-digital-strategy": [
      "رفع نسبة الخدمات الرقمية إلى 80%",
      "تأهيل 50 موظفاً في المهارات الرقمية",
      "تقليل الاعتماد على المعالجات الورقية",
      "Increase digital services to 80%",
    ],
    "dsc-seed-hrms-procurement": [
      "أتمتة عمليات الموارد البشرية بالكامل",
      "توحيد بيانات الموظفين في نظام مركزي",
      "تحسين دقة إعداد الرواتب والتقارير",
      "Fully automate HR processes",
    ],
    "dsc-seed-compliance-hiring": [
      "تعزيز تطبيق معايير الحوكمة المؤسسية",
      "ضمان الامتثال للوائح هيئة السوق المالية",
      "تطوير سياسات وإجراءات الامتثال الداخلي",
      "Strengthen corporate governance compliance",
    ],
    "dsc-seed-cloud-partnership": [
      "نقل 60% من البنية التحتية إلى السحابة",
      "خفض تكاليف التشغيل بنسبة 25%",
      "تحسين مرونة وقابلية التوسع",
      "Migrate 60% of infrastructure to cloud",
    ],
  };
  return map[decisionId] || ["General objective for this decision"];
}

function getRisksForDecision(decisionId: string): { description: string; level: string }[] {
  const map: Record<string, { description: string; level: string }[]> = {
    "dsc-seed-it-contract": [
      { description: "ارتفاع تكاليف التمديد عن الميزانية المقررة", level: "MEDIUM" },
      { description: "توقف الخدمات خلال فترة إعادة التفاوض", level: "HIGH" },
      { description: "صعوبة الانتقال لمزود بديل في حال عدم الاتفاق", level: "HIGH" },
    ],
    "dsc-seed-bi-investment": [
      { description: "مقاومة المستخدمين للنظام الجديد", level: "MEDIUM" },
      { description: "تحديات تكامل البيانات من المصادر المختلفة", level: "HIGH" },
    ],
    "dsc-seed-digital-strategy": [
      { description: "تأخر تنفيذ المبادرات الرقمية", level: "MEDIUM" },
      { description: "نقص الكفاءات الرقمية الداخلية", level: "HIGH" },
      { description: "تجاوز الميزانية المخصصة للتحول", level: "MEDIUM" },
    ],
    "dsc-seed-compliance-hiring": [
      { description: "صعوبة استقطاب كفاءات متخصصة بالامتثال", level: "MEDIUM" },
      { description: "تأثير التغيير التنظيمي على هيكل الإدارة الحالي", level: "LOW" },
    ],
  };
  return map[decisionId] || [
    { description: "Risk identified for this decision", level: "MEDIUM" },
  ];
}

function getEvidenceForDecision(
  decisionId: string,
  dbDecisionId: string,
  organizationId: string,
  userId: string,
) {
  const map: Record<string, any[]> = {
    "dsc-seed-it-contract": [
      {
        id: decisionId + "-ev-01",
        decisionId: dbDecisionId,
        organizationId,
        filename: "عقد-تقنية-المعلومات-الحالي.pdf",
        fileType: "application/pdf",
        fileSize: 245760,
        description: "العقد الحالي مع مزود خدمات تقنية المعلومات",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-01.pdf",
      },
      {
        id: decisionId + "-ev-02",
        decisionId: dbDecisionId,
        organizationId,
        filename: "تقييم-أداء-المزود-Q1-2026.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 102400,
        description: "تقييم أداء المزود للربع الأول 2026",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-02.xlsx",
      },
    ],
    "dsc-seed-bi-investment": [
      {
        id: decisionId + "-ev-01",
        decisionId: dbDecisionId,
        organizationId,
        filename: "دراسة-الجدوى-منصة-ذكاء-الأعمال.pdf",
        fileType: "application/pdf",
        fileSize: 512000,
        description: "دراسة الجدوى الفنية والمالية لمنصة ذكاء الأعمال",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-01.pdf",
      },
    ],
    "dsc-seed-digital-strategy": [
      {
        id: decisionId + "-ev-01",
        decisionId: dbDecisionId,
        organizationId,
        filename: "استراتيجية-التحول-الرقمي-2026.pdf",
        fileType: "application/pdf",
        fileSize: 1048576,
        description: "وثيقة استراتيجية التحول الرقمي للعام 2026",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-01.pdf",
      },
      {
        id: decisionId + "-ev-02",
        decisionId: dbDecisionId,
        organizationId,
        filename: "ميزانية-التحول-الرقمي.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 204800,
        description: "ميزانية مبادرات التحول الرقمي المقترحة",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-02.xlsx",
      },
      {
        id: decisionId + "-ev-03",
        decisionId: dbDecisionId,
        organizationId,
        filename: "خطة-تنفيذ-المبادرات-الرقمية.pptx",
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        fileSize: 3072000,
        description: "عرض تقديمي لخطة تنفيذ المبادرات الرقمية",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-03.pptx",
      },
    ],
    "dsc-seed-hrms-procurement": [
      {
        id: decisionId + "-ev-01",
        decisionId: dbDecisionId,
        organizationId,
        filename: "طلب-عرض-أسعار-أنظمة-HRMS.pdf",
        fileType: "application/pdf",
        fileSize: 409600,
        description: "طلب عرض الأسعار المقدم لمزودي أنظمة إدارة الموارد البشرية",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-01.pdf",
      },
      {
        id: decisionId + "-ev-02",
        decisionId: dbDecisionId,
        organizationId,
        filename: "مقارنة-المزودين-التقنية.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 153600,
        description: "مقارنة فنية بين مزودي أنظمة الموارد البشرية",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-02.xlsx",
      },
    ],
    "dsc-seed-compliance-hiring": [
      {
        id: decisionId + "-ev-01",
        decisionId: dbDecisionId,
        organizationId,
        filename: "الهيكل-التنظيمي-المقترح.pdf",
        fileType: "application/pdf",
        fileSize: 102400,
        description: "الهيكل التنظيمي المقترح مع إضافة وظيفة مدير الامتثال",
        uploadedById: userId,
        storageKey: "decisions/ev/" + decisionId + "-ev-01.pdf",
      },
    ],
  };
  return map[decisionId] || [];
}

function getAuditForDecision(
  decisionId: string,
  dbDecisionId: string,
  organizationId: string,
  userId: string,
  status: DecisionStatus,
) {
  const entries: any[] = [
    {
      id: decisionId + "-audit-01",
      decisionId: dbDecisionId,
      organizationId,
      userId,
      action: AuditAction.DECISION_CREATED,
      entity: "Decision",
      before: null,
      after: JSON.stringify({ status: "DRAFT" }),
      createdAt: new Date("2026-06-01"),
    },
  ];

  // Add status transition entries based on current status
  if (status === DecisionStatus.IN_REVIEW || status === DecisionStatus.APPROVED || status === DecisionStatus.REJECTED) {
    entries.push({
      id: decisionId + "-audit-02",
      decisionId: dbDecisionId,
      organizationId,
      userId,
      action: AuditAction.SUBMITTED_FOR_REVIEW,
      entity: "Decision",
      before: JSON.stringify({ status: "DRAFT" }),
      after: JSON.stringify({ status: "IN_REVIEW" }),
      createdAt: new Date("2026-06-05"),
    });
  }

  if (status === DecisionStatus.APPROVED || status === DecisionStatus.REJECTED) {
    entries.push({
      id: decisionId + "-audit-03",
      decisionId: dbDecisionId,
      organizationId,
      userId,
      action: status === DecisionStatus.APPROVED ? AuditAction.DECISION_APPROVED : AuditAction.DECISION_REJECTED,
      entity: "Decision",
      before: JSON.stringify({ status: "IN_REVIEW" }),
      after: JSON.stringify({ status: status }),
      createdAt: new Date("2026-06-10"),
    });
  }

  return entries;
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
