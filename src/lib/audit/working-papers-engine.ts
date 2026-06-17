// ─── AuditOS L6.5 Working Papers Engine ───
// محرك أوراق العمل — ملف التدقيق الموحد
// ISA 230 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditActor } from "./actor-context";
import { assertEngagementAccess } from "./tenant-guard";

type IndexType = "lead_schedule" | "analytical_review" | "control_testing" | "substantive_testing" | "completion";

export class WorkingPapersEngine {
  // ==================== Paper Index ====================

  async createPaper(
    actor: AuditActor,
    input: {
      engagementId: string;
      indexType: IndexType;
      paperNumber: string;
      paperTitle: string;
      methodologyRef?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    return prisma.workingPaperIndex.create({
      data: {
        engagementId: input.engagementId,
        indexType: input.indexType,
        paperNumber: input.paperNumber,
        paperTitle: input.paperTitle,
        preparedById: actor.actorId,
        preparedDate: new Date(),
        methodologyRef: input.methodologyRef,
        createdById: actor.actorId,
      },
    });
  }

  async listPapers(engagementId: string, indexType?: IndexType) {
    return prisma.workingPaperIndex.findMany({
      where: {
        engagementId,
        ...(indexType ? { indexType } : {}),
      },
      include: {
        leadSchedule: true,
        analyticalReviewPaper: true,
        controlTestingPaper: true,
        substantiveTestingPaper: true,
        completionPaper: true,
      },
      orderBy: [{ indexType: "asc" }, { paperNumber: "asc" }],
    });
  }

  async getPaper(id: string) {
    return prisma.workingPaperIndex.findUnique({
      where: { id },
      include: {
        leadSchedule: true,
        analyticalReviewPaper: true,
        controlTestingPaper: true,
        substantiveTestingPaper: true,
        completionPaper: true,
      },
    });
  }

  async updatePaperStatus(
    actor: AuditActor,
    id: string,
    status: string,
    conclusion?: string,
  ) {
    const data: Record<string, unknown> = { status };
    if (conclusion) data.conclusion = conclusion;
    if (status === "reviewed") data.reviewedById = actor.actorId;
    if (status === "reviewed") data.reviewedDate = new Date();

    return prisma.workingPaperIndex.update({
      where: { id },
      data,
    });
  }

  // ==================== Lead Schedule ====================

  async createLeadSchedule(
    actor: AuditActor,
    input: {
      engagementId: string;
      workingPaperIndexId: string;
      accountCode: string;
      accountName: string;
      priorYearBalance?: number;
      currentYearBalance?: number;
      adjustments?: Record<string, unknown>[];
      finalBalance?: number;
      assertionCoverage?: Record<string, boolean>;
      notes?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    return prisma.leadSchedule.create({
      data: {
        engagementId: input.engagementId,
        workingPaperIndexId: input.workingPaperIndexId,
        accountCode: input.accountCode,
        accountName: input.accountName,
        priorYearBalance: input.priorYearBalance,
        currentYearBalance: input.currentYearBalance,
        adjustments: (input.adjustments ?? []) as Prisma.InputJsonValue,
        finalBalance: input.finalBalance,
        assertionCoverage: input.assertionCoverage as Prisma.InputJsonValue,
        notes: input.notes,
        createdById: actor.actorId,
      },
    });
  }

  async updateLeadSchedule(id: string, data: Record<string, unknown>) {
    return prisma.leadSchedule.update({ where: { id }, data });
  }

  // ==================== Analytical Review ====================

  async createAnalyticalReview(
    actor: AuditActor,
    input: {
      engagementId: string;
      workingPaperIndexId: string;
      procedureDescription: string;
      expectation?: number;
      expectationBasis?: string;
      actualResult?: number;
      variance?: number;
      variancePercentage?: number;
      investigationConclusion?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    return prisma.analyticalReviewPaper.create({
      data: {
        engagementId: input.engagementId,
        workingPaperIndexId: input.workingPaperIndexId,
        procedureDescription: input.procedureDescription,
        expectation: input.expectation,
        expectationBasis: input.expectationBasis,
        actualResult: input.actualResult,
        variance: input.variance,
        variancePercentage: input.variancePercentage,
        investigationRequired: input.variance !== undefined && Math.abs(input.variance) > 0,
        investigationConclusion: input.investigationConclusion,
        createdById: actor.actorId,
      },
    });
  }

  // ==================== Control Testing ====================

  async createControlTest(
    actor: AuditActor,
    input: {
      engagementId: string;
      workingPaperIndexId: string;
      controlDescription: string;
      controlObjective?: string;
      controlType: string;
      controlFrequency?: string;
      sampleSize?: number;
      deviations?: number;
      conclusion?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    const deviationRate = input.sampleSize && input.sampleSize > 0 && input.deviations !== undefined
      ? input.deviations / input.sampleSize
      : undefined;

    return prisma.controlTestingPaper.create({
      data: {
        engagementId: input.engagementId,
        workingPaperIndexId: input.workingPaperIndexId,
        controlDescription: input.controlDescription,
        controlObjective: input.controlObjective,
        controlType: input.controlType,
        controlFrequency: input.controlFrequency,
        sampleSize: input.sampleSize,
        deviations: input.deviations,
        deviationRate: deviationRate ?? null,
        operatingEffectivenessConclusion: input.conclusion,
        createdById: actor.actorId,
      },
    });
  }

  // ==================== Substantive Testing ====================

  async createSubstantiveTest(
    actor: AuditActor,
    input: {
      engagementId: string;
      workingPaperIndexId: string;
      procedureDescription: string;
      assertionTested?: string;
      populationReference?: string;
      sampleReference?: string;
      conclusion?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    return prisma.substantiveTestingPaper.create({
      data: {
        engagementId: input.engagementId,
        workingPaperIndexId: input.workingPaperIndexId,
        procedureDescription: input.procedureDescription,
        assertionTested: input.assertionTested,
        populationReference: input.populationReference,
        sampleReference: input.sampleReference,
        createdById: actor.actorId,
      },
    });
  }

  // ==================== Completion Paper ====================

  async createCompletionPaper(
    actor: AuditActor,
    input: {
      engagementId: string;
      workingPaperIndexId: string;
      checklistType: string;
      items?: Record<string, unknown>[];
      overallAssessment?: string;
    },
  ) {
    await assertEngagementAccess(input.engagementId, actor);

    return prisma.completionPaper.create({
      data: {
        engagementId: input.engagementId,
        workingPaperIndexId: input.workingPaperIndexId,
        checklistType: input.checklistType,
        items: (input.items ?? []) as Prisma.InputJsonValue,
        overallCompletionAssessment: input.overallAssessment,
        createdById: actor.actorId,
      },
    });
  }

  async signOffCompletion(
    actor: AuditActor,
    id: string,
  ) {
    return prisma.completionPaper.update({
      where: { id },
      data: {
        engagementPartnerSignOffId: actor.actorId,
        signOffDate: new Date(),
      },
    });
  }

  // ==================== File Generation ====================

  async generateFileIndex(engagementId: string): Promise<string> {
    const papers = await prisma.workingPaperIndex.findMany({
      where: { engagementId },
      orderBy: [{ indexType: "asc" }, { paperNumber: "asc" }],
    });

    const lines: string[] = [];
    lines.push("فهرس ملف التدقيق");
    lines.push("=".repeat(50));
    lines.push(`مهمة المراجعة: ${engagementId}`);
    lines.push(`تاريخ: ${new Date().toLocaleDateString("ar-SA")}`);
    lines.push("");

    let currentType = "";
    for (const paper of papers) {
      const typeLabel: Record<string, string> = {
        lead_schedule: "قوائم الربط",
        analytical_review: "المراجعة التحليلية",
        control_testing: "اختبار الرقابة",
        substantive_testing: "الاختبارات الموضوعية",
        completion: "الإكمال",
      };

      if (paper.indexType !== currentType) {
        currentType = paper.indexType;
        lines.push("");
        lines.push(`║ ${typeLabel[paper.indexType] ?? paper.indexType}`);
        lines.push("─".repeat(40));
      }

      lines.push(`  ${paper.paperNumber}  ${paper.paperTitle}  [${paper.status}]`);
    }

    return lines.join("\n");
  }

  async getDashboard(engagementId: string) {
    const papers = await prisma.workingPaperIndex.findMany({
      where: { engagementId },
    });

    const byType = papers.reduce(
      (acc, p) => {
        acc[p.indexType] = (acc[p.indexType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = papers.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: papers.length,
      byType,
      byStatus,
      draft: papers.filter((p) => p.status === "draft").length,
      reviewed: papers.filter((p) => p.status === "reviewed").length,
      approved: papers.filter((p) => p.status === "approved").length,
    };
  }
}

export const workingPapersEngine = new WorkingPapersEngine();

