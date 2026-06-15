import "server-only";

import { prisma } from "@/lib/prisma";
import {
  categoryToPaperNumber,
  resolveCategoryLabel,
} from "./category-labels";

export type LeadScheduleLineInput = {
  mappingId: string;
  accountCode: string;
  accountName: string;
  closingBalance: number;
  priorBalance?: number;
};

export async function upsertLeadScheduleBundle(params: {
  engagementId: string;
  category: string;
  mappingLines: LeadScheduleLineInput[];
  createdById?: string;
}): Promise<{
  leadScheduleId: string;
  workingPaperIndexId: string;
  lineCount: number;
  totalClosingBalance: number;
}> {
  const labels = resolveCategoryLabel(params.category);
  const paperNumber = categoryToPaperNumber(params.category);
  const paperTitle = `${labels.ar} / ${labels.en}`;

  let paper = await prisma.workingPaperIndex.findFirst({
    where: {
      engagementId: params.engagementId,
      indexType: "lead_schedule",
      paperNumber,
    },
  });

  if (!paper) {
    paper = await prisma.workingPaperIndex.create({
      data: {
        engagementId: params.engagementId,
        indexType: "lead_schedule",
        paperNumber,
        paperTitle,
        preparedDate: new Date(),
        createdById: params.createdById,
        status: "draft",
      },
    });
  } else {
    await prisma.workingPaperIndex.update({
      where: { id: paper.id },
      data: { paperTitle },
    });
  }

  const totalClosing = params.mappingLines.reduce(
    (sum, line) => sum + line.closingBalance,
    0,
  );
  const totalPrior = params.mappingLines.reduce(
    (sum, line) => sum + (line.priorBalance ?? 0),
    0,
  );

  let leadSchedule = await prisma.leadSchedule.findUnique({
    where: { workingPaperIndexId: paper.id },
  });

  if (leadSchedule) {
    leadSchedule = await prisma.leadSchedule.update({
      where: { id: leadSchedule.id },
      data: {
        accountCode: paperNumber,
        accountName: labels.en,
        priorYearBalance: totalPrior,
        currentYearBalance: totalClosing,
        finalBalance: totalClosing,
        notes: `Factory auto-generated — ${params.category}`,
      },
    });
    await prisma.leadScheduleLine.deleteMany({
      where: { leadScheduleId: leadSchedule.id },
    });
  } else {
    leadSchedule = await prisma.leadSchedule.create({
      data: {
        engagementId: params.engagementId,
        workingPaperIndexId: paper.id,
        accountCode: paperNumber,
        accountName: labels.en,
        priorYearBalance: totalPrior,
        currentYearBalance: totalClosing,
        finalBalance: totalClosing,
        notes: `Factory auto-generated — ${params.category}`,
        createdById: params.createdById,
      },
    });
  }

  if (params.mappingLines.length > 0) {
    await prisma.leadScheduleLine.createMany({
      data: params.mappingLines.map((line, index) => ({
        leadScheduleId: leadSchedule!.id,
        lineNumber: index + 1,
        description: `${line.accountCode} — ${line.accountName}`,
        amount: line.closingBalance,
        reference: line.mappingId,
      })),
    });
  }

  return {
    leadScheduleId: leadSchedule.id,
    workingPaperIndexId: paper.id,
    lineCount: params.mappingLines.length,
    totalClosingBalance: totalClosing,
  };
}

export async function fetchLeadSchedulesWithLines(engagementId: string) {
  return prisma.leadSchedule.findMany({
    where: { engagementId },
    include: {
      workingPaperIndex: true,
      lines: { orderBy: { lineNumber: "asc" } },
    },
    orderBy: { accountCode: "asc" },
  });
}
