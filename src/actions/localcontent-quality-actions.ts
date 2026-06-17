// ─── LocalContentOS — AI Quality Dashboard Actions ───
// Aggregates AI quality metrics for the quality dashboard.
// P0: Read-only queries, no mutations.

"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface AiQualityMetrics {
  // Suggestions
  totalSuggestions: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  suggestionAcceptanceRate: number | null;
  avgSuggestionConfidence: number | null;

  // Explanations
  totalExplanations: number;
  confirmedExplanations: number;
  rejectedExplanations: number;
  falsePositives: number;
  falsePositiveRate: number | null;
  avgExplanationConfidence: number | null;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;

  // Pattern Health
  totalHealthRecords: number;
  highPerformingRecords: number;
  activeRecords: number;
  decayingRecords: number;
  obsoleteRecords: number;
  avgHealthScore: number | null;

  // Review Runs
  totalReviewRuns: number;
  completedRuns: number;
  failedRuns: number;
  totalExplanationsGenerated: number;
  totalPatternSuggestions: number;
  lastRunStatus: string | null;
  lastRunAt: string | null;
  lastRunDuration: number | null;

  // Org Memory
  totalOrgMemoryRecords: number;
  manualOverrides: number;

  // Industry Patterns
  totalIndustryPatterns: number;
  avgEffectiveness: number | null;

  // Recent runs (for timeline)
  recentRuns: Array<{
    id: string;
    status: string;
    explanationsGenerated: number;
    patternSuggestions: number;
    falsePositives: number;
    startedAt: string;
    completedAt: string | null;
    durationMs: number;
  }>;
}

// ─── Action ───

export async function getAiQualityMetricsAction(): Promise<{
  ok: boolean;
  data?: AiQualityMetrics;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const orgId = user.organizationId;

    // Run all queries in parallel
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
      // All suggestions for this org
      prisma.lcPatternSuggestion.findMany({
        where: { organizationId: orgId },
        select: { id: true, status: true, confidence: true },
      }),

      // All explanations (non-FP, pending & confirmed)
      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId, isFalsePositive: false },
        select: { id: true, status: true, confidence: true, riskLevel: true },
      }),

      // False positives
      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId, isFalsePositive: true },
        select: { id: true, status: true },
      }),

      // Health records
      prisma.lcPatternHealthRecord.findMany({
        where: { organizationId: orgId },
        select: { id: true, status: true, healthScore: true },
      }),

      // Recent review runs
      prisma.lcAiReviewRun.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Org memory count
      prisma.lcOrganizationMatchMemory.count({
        where: { organizationId: orgId },
      }),

      // Manual overrides
      prisma.lcPatternSuggestion.count({
        where: { organizationId: orgId, source: "manual", status: "approved" },
      }),

      // Industry patterns
      prisma.lcIndustryPatternMemory.findMany({
        select: { effectivenessPct: true },
      }),
    ]);

    // ─── Compute metrics ───

    const totalSuggestions = suggestions.length;
    const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
    const approvedSuggestions = suggestions.filter((s) => s.status === "approved").length;
    const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected").length;
    const suggestionAcceptanceRate =
      approvedSuggestions + rejectedSuggestions > 0
        ? Math.round(
            (approvedSuggestions / (approvedSuggestions + rejectedSuggestions)) * 100,
          )
        : null;
    const avgSuggestionConfidence =
      totalSuggestions > 0
        ? Math.round(
            suggestions.reduce((sum, s) => sum + s.confidence, 0) / totalSuggestions,
          )
        : null;

    const totalExplanations = explanations.length;
    const confirmedExplanations = explanations.filter(
      (e) => e.status === "confirmed",
    ).length;
    const rejectedExplanations = explanations.filter(
      (e) => e.status === "rejected",
    ).length;
    const falsePositives = fpExplanations.length;
    const falsePositiveRate =
      totalExplanations + falsePositives > 0
        ? Math.round(
            (falsePositives / (totalExplanations + falsePositives)) * 100,
          )
        : null;
    const avgExplanationConfidence =
      totalExplanations > 0
        ? Math.round(
            explanations.reduce((sum, e) => sum + e.confidence, 0) /
              totalExplanations,
          )
        : null;
    const highRiskCount = explanations.filter((e) => e.riskLevel === "high").length;
    const mediumRiskCount = explanations.filter(
      (e) => e.riskLevel === "medium",
    ).length;
    const lowRiskCount = explanations.filter((e) => e.riskLevel === "low").length;

    const totalHealthRecords = healthRecords.length;
    const highPerformingRecords = healthRecords.filter(
      (h) => h.status === "high_performing",
    ).length;
    const activeRecords = healthRecords.filter((h) => h.status === "active").length;
    const decayingRecords = healthRecords.filter(
      (h) => h.status === "decaying",
    ).length;
    const obsoleteRecords = healthRecords.filter(
      (h) => h.status === "obsolete",
    ).length;
    const avgHealthScore =
      totalHealthRecords > 0
        ? Math.round(
            healthRecords.reduce((sum, h) => sum + h.healthScore, 0) /
              totalHealthRecords,
          )
        : null;

    const totalReviewRuns = reviewRuns.length;
    const completedRuns = reviewRuns.filter((r) => r.status === "completed").length;
    const failedRuns = reviewRuns.filter((r) => r.status === "failed").length;
    const totalExplanationsGenerated = reviewRuns.reduce(
      (sum, r) => sum + r.explanationsGenerated,
      0,
    );
    const totalPatternSuggestions = reviewRuns.reduce(
      (sum, r) => sum + r.patternSuggestions,
      0,
    );

    const lastRun = reviewRuns[0] ?? null;

    const totalIndustryPatterns = industryPatterns.length;
    const avgEffectiveness =
      totalIndustryPatterns > 0
        ? Math.round(
            industryPatterns.reduce((sum, p) => sum + p.effectivenessPct, 0) /
              totalIndustryPatterns,
          )
        : null;

    const recentRuns = reviewRuns.map((r) => {
      const durationMs =
        r.completedAt && r.startedAt
          ? r.completedAt.getTime() - r.startedAt.getTime()
          : 0;
      return {
        id: r.id,
        status: r.status,
        explanationsGenerated: r.explanationsGenerated,
        patternSuggestions: r.patternSuggestions,
        falsePositives: r.falsePositives,
        startedAt: r.startedAt.toISOString(),
        completedAt: r.completedAt?.toISOString() ?? null,
        durationMs,
      };
    });

    return {
      ok: true,
      data: {
        totalSuggestions,
        pendingSuggestions,
        approvedSuggestions,
        rejectedSuggestions,
        suggestionAcceptanceRate,
        avgSuggestionConfidence,
        totalExplanations,
        confirmedExplanations,
        rejectedExplanations,
        falsePositives,
        falsePositiveRate,
        avgExplanationConfidence,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        totalHealthRecords,
        highPerformingRecords,
        activeRecords,
        decayingRecords,
        obsoleteRecords,
        avgHealthScore,
        totalReviewRuns,
        completedRuns,
        failedRuns,
        totalExplanationsGenerated,
        totalPatternSuggestions,
        lastRunStatus: lastRun?.status ?? null,
        lastRunAt: lastRun?.startedAt.toISOString() ?? null,
        lastRunDuration:
          lastRun?.completedAt && lastRun?.startedAt
            ? lastRun.completedAt.getTime() - lastRun.startedAt.getTime()
            : null,
        totalOrgMemoryRecords: memCount,
        manualOverrides,
        totalIndustryPatterns,
        avgEffectiveness,
        recentRuns,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to load quality metrics",
    };
  }
}
