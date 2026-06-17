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

  // Confidence distribution (suggestions + explanations)
  suggestionConfidenceBuckets: [number, number, number, number]; // 0-25, 25-50, 50-75, 75-100
  explanationConfidenceBuckets: [number, number, number, number];

  // Time-series acceptance rate (weekly buckets)
  acceptanceOverTime: Array<{
    label: string;
    total: number;
    approved: number;
    rate: number | null;
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
        select: { id: true, status: true, confidence: true, createdAt: true, updatedAt: true },
      }),

      // All explanations (non-FP, pending & confirmed)
      prisma.lcMatchReview.findMany({
        where: { organizationId: orgId, isFalsePositive: false },
        select: { id: true, status: true, confidence: true, riskLevel: true, createdAt: true },
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

    // ─── Confidence Distribution Buckets ───
    // ─── Acceptance Rate Per Period (Time-Series) ───
    // Use review run dates as the time axis (suggestion-level timestamps not available in select).
    const now = Date.now();
    const acceptanceOverTime: Array<{ label: string; total: number; approved: number; rate: number | null }> = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now - (w + 1) * 7 * 86400000);
      const weekEnd   = new Date(now - w * 7 * 86400000);
      const runsInWeek = reviewRuns.filter((r) => {
        const t = r.startedAt.getTime();
        return t >= weekStart.getTime() && t < weekEnd.getTime();
      });
      const totalGenerated = runsInWeek.reduce((s, r) => s + (r.patternSuggestions ?? 0), 0);
      acceptanceOverTime.push({
        label: weekStart.toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
        total: totalGenerated,
        approved: 0,
        rate: null,
      });
    }

    const suggestionConfidenceBuckets: [number, number, number, number] = [0, 0, 0, 0];
    for (const s of suggestions) {
      if (s.confidence <= 25) suggestionConfidenceBuckets[0]++;
      else if (s.confidence <= 50) suggestionConfidenceBuckets[1]++;
      else if (s.confidence <= 75) suggestionConfidenceBuckets[2]++;
      else suggestionConfidenceBuckets[3]++;
    }
    const explanationConfidenceBuckets: [number, number, number, number] = [0, 0, 0, 0];
    for (const e of explanations) {
      if (e.confidence <= 25) explanationConfidenceBuckets[0]++;
      else if (e.confidence <= 50) explanationConfidenceBuckets[1]++;
      else if (e.confidence <= 75) explanationConfidenceBuckets[2]++;
      else explanationConfidenceBuckets[3]++;
    }

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
