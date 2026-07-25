// ─── LocalContentOS — AI Quality Dashboard Actions ───
// Aggregates AI quality metrics for the quality dashboard.
// P0: Read-only queries, no mutations.

"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { AiQualityMetrics } from "./common";
import { computeSuggestionMetrics } from "./suggestions";
import { computeExplanationMetrics } from "./explanations";
import { computeHealthMetrics } from "./health";
import { computeRunMetrics, computeIndustryMetrics } from "./runs";
import { computeConfidenceBuckets, computeAcceptanceOverTime } from "./distribution";

export type { AiQualityMetrics };

export async function getAiQualityMetricsAction(): Promise<{
  ok: boolean;
  data?: AiQualityMetrics;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const orgId = user.organizationId;

    const [
      suggestions,
      explanations,
      fpExplanations,
      healthRecords,
      reviewRuns,
      memCount,
      manualOverrides,
      industryPatterns,
    ] = await Promise.all([
      prisma.lcPatternSuggestion.findMany({
        where: { organizationId: orgId },
        select: { id: true, status: true, confidence: true, createdAt: true, updatedAt: true },
      }),

      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId, isFalsePositive: false },
        select: { id: true, status: true, confidence: true, riskLevel: true, createdAt: true },
      }),

      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId, isFalsePositive: true },
        select: { id: true, status: true },
      }),

      prisma.lcPatternHealthRecord.findMany({
        where: { organizationId: orgId },
        select: { id: true, status: true, healthScore: true },
      }),

      prisma.lcAiReviewRun.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.lcOrganizationMatchMemory.count({
        where: { organizationId: orgId },
      }),

      prisma.lcPatternSuggestion.count({
        where: { organizationId: orgId, source: "manual", status: "approved" },
      }),

      prisma.lcIndustryPatternMemory.findMany({
        select: { effectivenessPct: true },
      }),
    ]);

    const suggestionMetrics = computeSuggestionMetrics(suggestions);
    const explanationMetrics = computeExplanationMetrics(explanations, fpExplanations);
    const healthMetrics = computeHealthMetrics(healthRecords);
    const runMetrics = computeRunMetrics(reviewRuns);
    const industryMetrics = computeIndustryMetrics(industryPatterns);
    const { suggestionConfidenceBuckets, explanationConfidenceBuckets } =
      computeConfidenceBuckets(suggestions, explanations);
    const acceptanceOverTime = computeAcceptanceOverTime(reviewRuns);

    return {
      ok: true,
      data: {
        ...suggestionMetrics,
        ...explanationMetrics,
        ...healthMetrics,
        ...runMetrics,
        ...industryMetrics,
        totalOrgMemoryRecords: memCount,
        manualOverrides,
        suggestionConfidenceBuckets,
        explanationConfidenceBuckets,
        acceptanceOverTime,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to load quality metrics",
    };
  }
}
