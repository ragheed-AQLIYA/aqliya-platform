"use server";

import { prisma } from "@/lib/prisma";

export interface ReviewRawData {
  suggestions: Awaited<ReturnType<typeof prisma.lcPatternSuggestion.findMany>>;
  explanations: Awaited<ReturnType<typeof prisma.lcMatchReview.findMany>>;
  healthRecords: Awaited<ReturnType<typeof prisma.lcPatternHealthRecord.findMany>>;
  lastRun: Awaited<ReturnType<typeof prisma.lcAiReviewRun.findMany>>[number] | null;
  memCount: number;
}

export async function gatherReviewData(orgId: string): Promise<ReviewRawData> {
  const [suggestions, explanations, healthRecords, reviewRuns, memCount] =
    await Promise.all([
      prisma.lcPatternSuggestion.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.lcPatternHealthRecord.findMany({
        where: { organizationId: orgId },
        orderBy: { healthScore: "desc" },
        take: 100,
      }),
      prisma.lcAiReviewRun.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
      prisma.lcOrganizationMatchMemory.count({
        where: { organizationId: orgId },
      }),
    ]);

  return {
    suggestions,
    explanations,
    healthRecords,
    lastRun: reviewRuns[0] ?? null,
    memCount,
  };
}
