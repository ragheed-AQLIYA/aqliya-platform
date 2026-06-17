// ─── LocalContentOS — Pattern Learning Loop ───
// Phase 4: Extends LcPatternSuggestion with metrics, builds
// PatternLearningService, and generates Pattern Health Score.
// Tracks acceptance rates, success rates, false positive rates,
// and decay scores for every pattern suggestion.
// P0: Every learning metric update requires explicit approval.

import "server-only";

import { prisma } from "@/lib/prisma";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";

// ─── Types ───

export interface PatternHealthScore {
  workbookLineCode: string;
  pattern: string;
  healthScore: number;        // 0-100
  acceptanceRate: number | null;  // 0-1
  successRate: number | null;     // 0-1
  falsePositiveRate: number | null; // 0-1
  decayScore: number;         // 0-1 (1 = recent, 0 = old)
  status: "active" | "decaying" | "obsolete" | "high_performing";
  totalSuggestions: number;
  totalAccepted: number;
  totalSuccessful: number;
}

export interface LearningLoopSummary {
  totalPatterns: number;
  activePatterns: number;
  highPerformingPatterns: number;
  decayingPatterns: number;
  obsoletePatterns: number;
  averageHealthScore: number | null;
  lastUpdated: string;
}

// ─── Pattern Learning Service ───

/**
 * Update learning metrics for a pattern suggestion after review.
 * Called automatically when reviewPatternSuggestion() approves/rejects.
 * P0: Metrics updated but never used to auto-modify patterns.
 */
export async function updatePatternLearningMetrics(
  suggestionId: string,
  decision: "approved" | "rejected",
): Promise<void> {
  try {
    const suggestion = await prisma.lcPatternSuggestion.findUnique({
      where: { id: suggestionId },
    });
    if (!suggestion) return;

    const isApproved = decision === "approved";

    // Compute acceptance rate for this pattern
    const similarSuggestions = await prisma.lcPatternSuggestion.findMany({
      where: {
        organizationId: suggestion.organizationId,
        workbookLineCode: suggestion.workbookLineCode,
      },
    });

    const totalCount = similarSuggestions.length;
    const acceptedCount = similarSuggestions.filter(
      (s) => s.status === "approved",
    ).length + (isApproved ? 1 : 0); // include current

    const acceptanceRate = totalCount > 0 ? acceptedCount / totalCount : 0;

    // Update the suggestion with metrics
    await prisma.lcPatternSuggestion.update({
      where: { id: suggestionId },
      data: {
        acceptanceScore: acceptanceRate,
        // successScore and falsePositiveRate are updated after the
        // pattern is actually applied and we see results
        ...(isApproved ? { appliedAt: new Date() } : {}),
      },
    });

    // If approved, update the health record
    if (isApproved) {
      await upsertPatternHealthRecord(
        suggestion.organizationId,
        suggestion.workbookLineCode,
        suggestion.suggestedPattern,
        suggestion.confidence,
        true,
      );
    }

    await createAiAuditEvent({
      organizationId: suggestion.organizationId,
      action: AuditActions.AI_LEARNING_LOOP_UPDATED,
      providerId: "deterministic",
      status: "success",
      inputSummary: { suggestionId, decision, acceptanceRate },
      metadata: { workbookLineCode: suggestion.workbookLineCode },
    }).catch(() => {});
  } catch (error) {
    console.warn(
      "[LocalContentOS LearningLoop] Failed to update metrics:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}

/**
 * Record a pattern application outcome (success or failure).
 * Called after a pattern suggestion has been applied and results are visible.
 */
export async function recordPatternOutcome(
  suggestionId: string,
  wasSuccessful: boolean,
): Promise<void> {
  try {
    const suggestion = await prisma.lcPatternSuggestion.findUnique({
      where: { id: suggestionId },
    });
    if (!suggestion) return;

    // Update success score
    const similarSuggestions = await prisma.lcPatternSuggestion.findMany({
      where: {
        organizationId: suggestion.organizationId,
        workbookLineCode: suggestion.workbookLineCode,
        status: "approved",
      },
    });

    const totalSuccessful = similarSuggestions.filter(
      (s) => s.successScore !== null && s.successScore > 0.5,
    ).length + (wasSuccessful ? 1 : 0);

    const totalAccepted = similarSuggestions.length;

    const successRate = totalAccepted > 0 ? totalSuccessful / totalAccepted : 0;

    await prisma.lcPatternSuggestion.update({
      where: { id: suggestionId },
      data: {
        successScore: wasSuccessful ? 1 : 0,
        falsePositiveRate: wasSuccessful ? 0 : 1,
      },
    });

    // Update health record
    await upsertPatternHealthRecord(
      suggestion.organizationId,
      suggestion.workbookLineCode,
      suggestion.suggestedPattern,
      suggestion.confidence,
      wasSuccessful,
    );

    // Recompute health for similar patterns
    await recomputePatternHealth(
      suggestion.organizationId,
      suggestion.workbookLineCode,
    );
  } catch (error) {
    console.warn(
      "[LocalContentOS LearningLoop] Failed to record outcome:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}

// ─── Pattern Health Score ───

async function upsertPatternHealthRecord(
  organizationId: string,
  workbookLineCode: string,
  pattern: string,
  confidence: number,
  isSuccessful: boolean,
): Promise<void> {
  try {
    // Find existing record
    const existing = await prisma.lcPatternHealthRecord.findFirst({
      where: {
        organizationId,
        workbookLineCode,
        pattern,
      },
    });

    if (existing) {
      const totalAccepted = existing.totalAccepted + 1;
      const totalSuccessful = existing.totalSuccessful + (isSuccessful ? 1 : 0);
      const acceptRate = totalAccepted > 0 ? totalAccepted / (existing.totalSuggestions + 1) : 0;
      const successRate = totalAccepted > 0 ? totalSuccessful / totalAccepted : 0;
      const healthScore = computeCompositeHealthScore(
        acceptRate,
        successRate,
        existing.decayScore,
        confidence,
      );

      await prisma.lcPatternHealthRecord.update({
        where: { id: existing.id },
        data: {
          totalSuggestions: { increment: 1 },
          totalAccepted: { increment: 1 },
          totalSuccessful: isSuccessful ? { increment: 1 } : undefined,
          acceptanceRate: acceptRate,
          successRate,
          healthScore,
          lastAppliedAt: new Date(),
          status: classifyHealthStatus(healthScore),
        },
      });
    } else {
      const healthScore = computeCompositeHealthScore(1, isSuccessful ? 1 : 0, 1.0, confidence);

      await prisma.lcPatternHealthRecord.create({
        data: {
          organizationId,
          workbookLineCode,
          pattern,
          healthScore,
          acceptanceRate: 1,
          successRate: isSuccessful ? 1 : 0,
          falsePositiveRate: isSuccessful ? 0 : 1,
          decayScore: 1.0,
          totalSuggestions: 1,
          totalAccepted: 1,
          totalSuccessful: isSuccessful ? 1 : 0,
          lastSuggestedAt: new Date(),
          lastAppliedAt: new Date(),
          status: classifyHealthStatus(healthScore),
        },
      });
    }
  } catch (error) {
    console.warn(
      "[LocalContentOS LearningLoop] Failed to upsert health record:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}

/**
 * Recompute pattern health scores for all patterns matching a workbook line code.
 */
async function recomputePatternHealth(
  organizationId: string,
  workbookLineCode: string,
): Promise<void> {
  try {
    const records = await prisma.lcPatternHealthRecord.findMany({
      where: { organizationId, workbookLineCode },
    });

    for (const record of records) {
      const acceptRate = record.acceptanceRate ?? 0;
      const successRate = record.successRate ?? 0;
      const healthScore = computeCompositeHealthScore(
        acceptRate,
        successRate,
        record.decayScore,
        0.7, // default confidence
      );

      await prisma.lcPatternHealthRecord.update({
        where: { id: record.id },
        data: {
          healthScore,
          status: classifyHealthStatus(healthScore),
        },
      });
    }
  } catch (error) {
    console.warn(
      "[LocalContentOS LearningLoop] Failed to recompute health:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}

/**
 * Compute a composite health score from individual metrics.
 * Formula: (acceptanceRate * 0.3 + successRate * 0.4 + decayScore * 0.2 + confidence * 0.1) * 100
 */
function computeCompositeHealthScore(
  acceptanceRate: number,
  successRate: number,
  decayScore: number,
  confidence: number,
): number {
  const normalizedConfidence = confidence / 100;
  const raw =
    acceptanceRate * 0.3 +
    successRate * 0.4 +
    decayScore * 0.2 +
    normalizedConfidence * 0.1;
  return Math.round(Math.max(0, Math.min(100, raw * 100)));
}

function classifyHealthStatus(
  healthScore: number,
): "active" | "decaying" | "obsolete" | "high_performing" {
  if (healthScore >= 80) return "high_performing";
  if (healthScore >= 50) return "active";
  if (healthScore >= 20) return "decaying";
  return "obsolete";
}

// ─── Query APIs ───

/**
 * Get pattern health scores for an organization.
 */
export async function getPatternHealthScores(
  organizationId: string,
): Promise<PatternHealthScore[]> {
  const records = await prisma.lcPatternHealthRecord.findMany({
    where: { organizationId },
    orderBy: { healthScore: "desc" },
    take: 100,
  });

  return records.map((r) => ({
    workbookLineCode: r.workbookLineCode,
    pattern: r.pattern,
    healthScore: r.healthScore,
    acceptanceRate: r.acceptanceRate,
    successRate: r.successRate,
    falsePositiveRate: r.falsePositiveRate,
    decayScore: r.decayScore,
    status: r.status as PatternHealthScore["status"],
    totalSuggestions: r.totalSuggestions,
    totalAccepted: r.totalAccepted,
    totalSuccessful: r.totalSuccessful,
  }));
}

/**
 * Get a summary of the learning loop state.
 */
export async function getLearningLoopSummary(
  organizationId: string,
): Promise<LearningLoopSummary> {
  try {
    const records = await prisma.lcPatternHealthRecord.findMany({
      where: { organizationId },
    });

    const total = records.length;
    const active = records.filter((r) => r.status === "active").length;
    const highPerf = records.filter((r) => r.status === "high_performing").length;
    const decaying = records.filter((r) => r.status === "decaying").length;
    const obsolete = records.filter((r) => r.status === "obsolete").length;
    const avgHealth = total > 0
      ? Math.round(records.reduce((sum, r) => sum + r.healthScore, 0) / total)
      : null;

    return {
      totalPatterns: total,
      activePatterns: active,
      highPerformingPatterns: highPerf,
      decayingPatterns: decaying,
      obsoletePatterns: obsolete,
      averageHealthScore: avgHealth,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return {
      totalPatterns: 0,
      activePatterns: 0,
      highPerformingPatterns: 0,
      decayingPatterns: 0,
      obsoletePatterns: 0,
      averageHealthScore: null,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Apply decay to all pattern suggestions older than 30 days.
 * Should be called periodically (e.g., weekly cron).
 */
export async function applyPatternDecay(
  organizationId?: string,
): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const where: Record<string, unknown> = {
    createdAt: { lte: thirtyDaysAgo },
  };
  if (organizationId) where.organizationId = organizationId;

  const oldSuggestions = await prisma.lcPatternSuggestion.findMany({ where });
  let updatedCount = 0;

  for (const suggestion of oldSuggestions) {
    const ageDays = Math.floor(
      (Date.now() - suggestion.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const decay = Math.max(0.1, 1.0 - ageDays * 0.01); // 1% decay per day, min 0.1

    await prisma.lcPatternSuggestion.update({
      where: { id: suggestion.id },
      data: { decayScore: decay },
    });
    updatedCount++;
  }

  return updatedCount;
}
