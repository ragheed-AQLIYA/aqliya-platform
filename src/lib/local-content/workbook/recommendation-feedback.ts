// ─── Recommendation Feedback Loop — V3.5 Phase 4 ───
// Tracks which recommendations actually improve scores,
// computes health metrics, and enables the system to learn
// what works, what gets ignored, and what consistently succeeds.

import { prisma } from "@/lib/prisma";
import { createAiAuditEvent } from "@/lib/local-content/audit-events";

// ─── Types ───

export interface RecommendationHealthMetrics {
  totalRecommendations: number;
  acceptedCount: number;
  rejectedCount: number;
  implementedCount: number;
  abandonedCount: number;
  acceptanceRate: number; // 0-1
  implementationRate: number; // 0-1
  outcomesRecorded: number;
  averageAccuracyScore: number | null; // 0-1
  averageRealizedDelta: number | null;
  recommendationsByCategory: Record<string, number>;
  healthStatus: "healthy" | "stable" | "needs_attention";
}

export interface RecommendationOutcomeInput {
  organizationId: string;
  recommendationId: string;
  workbookId: string;
  scoreBefore: number | null;
  scoreAfter: number | null;
  expectedDelta: number | null;
  notes?: string;
  createdById?: string;
}

export interface CategoryHealth {
  category: string;
  total: number;
  accepted: number;
  implemented: number;
  acceptanceRate: number;
  averageImpact: number | null;
}

// ─── Public API ───

/**
 * Record the actual outcome of an implemented recommendation.
 * Called when a recommendation is marked as "implemented" and the
 * workbook score has been recomputed.
 */
export async function recordRecommendationOutcome(
  input: RecommendationOutcomeInput,
): Promise<void> {
  const realizedDelta =
    input.scoreBefore !== null && input.scoreAfter !== null
      ? input.scoreAfter - input.scoreBefore
      : null;

  const accuracyScore =
    realizedDelta !== null && input.expectedDelta !== null && input.expectedDelta !== 0
      ? Math.min(1, Math.max(0, 1 - Math.abs(realizedDelta - input.expectedDelta) / Math.abs(input.expectedDelta)))
      : null;

  const outcome = await prisma.lcRecommendationOutcome.create({
    data: {
      organizationId: input.organizationId,
      recommendationId: input.recommendationId,
      workbookId: input.workbookId,
      scoreBefore: input.scoreBefore,
      scoreAfter: input.scoreAfter,
      realizedDelta,
      expectedDelta: input.expectedDelta,
      accuracyScore,
      timeToImplement: null, // computed separately
      notes: input.notes,
      createdById: input.createdById,
    },
  });

  await createAiAuditEvent({
    organizationId: input.organizationId,
    projectId: undefined,
    workbookId: input.workbookId,
    action: "AI_RECOMMENDATION_OUTCOME_RECORDED",
    actorId: input.createdById ?? undefined,
    providerId: "deterministic",
    status: "success",
    durationMs: 0,
    outputSummary: {
      outcomeId: outcome.id,
      recommendationId: input.recommendationId,
      realizedDelta,
      accuracyScore,
    },
  });
}

/**
 * Get recommendation health metrics for a dashboard/organization.
 */
export async function getRecommendationHealth(
  organizationId: string,
  workbookId?: string,
): Promise<RecommendationHealthMetrics> {
  const where: Record<string, unknown> = { organizationId };
  if (workbookId) {
    where.workbookId = workbookId;
  }

  const [allRecs, outcomes] = await Promise.all([
    prisma.lcRecommendation.findMany({
      where: where as any,
    }),
    prisma.lcRecommendationOutcome.findMany({
      where: { organizationId, ...(workbookId ? { workbookId } : {}) },
    }),
  ]);

  const total = allRecs.length;
  const accepted = allRecs.filter((r) => r.status === "accepted").length;
  const rejected = allRecs.filter((r) => r.status === "rejected").length;
  const implemented = allRecs.filter((r) => r.status === "implemented").length;
  const abandoned = allRecs.filter((r) => r.status === "abandoned").length;

  const acceptanceRate = total > 0 ? (accepted + implemented) / total : 0;
  const implementationRate = total > 0 ? implemented / total : 0;

  // Category breakdown
  const byCategory: Record<string, number> = {};
  for (const r of allRecs) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }

  // Outcome accuracy
  const accuracyScores = outcomes
    .map((o) => o.accuracyScore)
    .filter((s): s is number => s !== null);
  const averageAccuracy =
    accuracyScores.length > 0
      ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
      : null;

  const realizedDeltas = outcomes
    .map((o) => o.realizedDelta)
    .filter((d): d is number => d !== null);
  const avgRealizedDelta =
    realizedDeltas.length > 0
      ? realizedDeltas.reduce((a, b) => a + b, 0) / realizedDeltas.length
      : null;

  const healthStatus: RecommendationHealthMetrics["healthStatus"] =
    implementationRate >= 0.5 && (averageAccuracy ?? 0) >= 0.7
      ? "healthy"
      : implementationRate >= 0.25
        ? "stable"
        : "needs_attention";

  return {
    totalRecommendations: total,
    acceptedCount: accepted,
    rejectedCount: rejected,
    implementedCount: implemented,
    abandonedCount: abandoned,
    acceptanceRate,
    implementationRate,
    outcomesRecorded: outcomes.length,
    averageAccuracyScore: averageAccuracy,
    averageRealizedDelta: avgRealizedDelta,
    recommendationsByCategory: byCategory,
    healthStatus,
  };
}

/**
 * Get per-category health breakdown.
 */
export async function getCategoryHealth(
  organizationId: string,
): Promise<CategoryHealth[]> {
  const allRecs = await prisma.lcRecommendation.findMany({
    where: { organizationId },
  });

  const byCategory = new Map<string, CategoryHealth>();

  for (const r of allRecs) {
    if (!byCategory.has(r.category)) {
      byCategory.set(r.category, {
        category: r.category,
        total: 0,
        accepted: 0,
        implemented: 0,
        acceptanceRate: 0,
        averageImpact: null,
      });
    }
    const cat = byCategory.get(r.category)!;
    cat.total++;
    if (r.status === "accepted") cat.accepted++;
    if (r.status === "implemented") cat.implemented++;
  }

  const result: CategoryHealth[] = [];
  for (const [, cat] of byCategory) {
    cat.acceptanceRate = cat.total > 0 ? (cat.accepted + cat.implemented) / cat.total : 0;
    result.push(cat);
  }

  return result.sort((a, b) => b.total - a.total);
}

/**
 * Check if a predicted impact was realized (for a single recommendation).
 */
export async function checkPredictionAccuracy(
  recommendationId: string,
): Promise<{
  recommendationId: string;
  expectedDelta: number | null;
  realizedDelta: number | null;
  accuracyScore: number | null;
  hasOutcome: boolean;
} | null> {
  const rec = await prisma.lcRecommendation.findUnique({
    where: { id: recommendationId },
  });
  if (!rec) return null;

  const outcome = await prisma.lcRecommendationOutcome.findFirst({
    where: { recommendationId },
    orderBy: { createdAt: "desc" },
  });

  if (!outcome) {
    return {
      recommendationId,
      expectedDelta: rec.estimatedValue,
      realizedDelta: null,
      accuracyScore: null,
      hasOutcome: false,
    };
  }

  return {
    recommendationId,
    expectedDelta: outcome.expectedDelta,
    realizedDelta: outcome.realizedDelta,
    accuracyScore: outcome.accuracyScore,
    hasOutcome: true,
  };
}

/**
 * Get the top-k most accurate recommendations (learning signal).
 */
export async function getTopPerformingRecommendations(
  organizationId: string,
  limit = 10,
): Promise<
  Array<{
    recommendationId: string;
    accuracyScore: number;
    realizedDelta: number | null;
    expectedDelta: number | null;
  }>
> {
  const outcomes = await prisma.lcRecommendationOutcome.findMany({
    where: { organizationId, accuracyScore: { not: null } },
    orderBy: { accuracyScore: "desc" },
    take: limit,
  });

  return outcomes
    .filter((o): o is typeof o & { accuracyScore: number } => o.accuracyScore !== null)
    .map((o) => ({
      recommendationId: o.recommendationId,
      accuracyScore: o.accuracyScore,
      realizedDelta: o.realizedDelta,
      expectedDelta: o.expectedDelta,
    }));
}
