// ─── Pipeline Stages 4-5: Score Computation & Recommendations ───

import "server-only";

import { prisma } from "@/lib/prisma";
import { computeLcScore } from "../workbook/scoring";
import { generateRecommendations } from "../workbook/recommendation-engine";
import { createAiAuditEvent, AuditActions } from "../audit-events";
import { PIPELINE_ACTOR, PIPELINE_PROVIDER } from "./common";
import type { StageOutcome } from "./common";
import type { LcScoreResult } from "../workbook/types";

export interface ScoringStageResult extends StageOutcome {
  _finalScore?: LcScoreResult | null;
}

export async function stageComputeScore(
  organizationId: string,
  workbookId: string,
): Promise<ScoringStageResult> {
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId, workbook: { project: { organizationId } } },
    take: 100,
  });
  const score = computeLcScore(lines);

  await prisma.lcWorkbook.update({
    where: { id: workbookId, project: { organizationId } },
    data: {
      lcScore: score.overallScore,
    },
  });

  await createAiAuditEvent({
    organizationId,
    workbookId,
    action: AuditActions.AI_REVIEW_COMPLETED,
    actorId: PIPELINE_ACTOR,
    providerId: PIPELINE_PROVIDER,
    status: "success",
    inputSummary: { stage: "computeScore", lineCount: lines.length },
    outputSummary: { overallScore: score.overallScore, metrics: score.metrics.length },
  });

  return {
    status: "success",
    summary: `Score: ${score.overallScore !== null ? `${score.overallScore}%` : "insufficient data"} (${score.statusLabel})`,
    details: {
      overallScore: score.overallScore,
      statusLabel: score.statusLabel,
      metrics: score.metrics.length,
    },
    _finalScore: score,
  };
}

export async function stageGenerateRecs(
  organizationId: string,
  workbookId: string,
): Promise<StageOutcome> {
  const result = await generateRecommendations(organizationId, workbookId);
  const count = result.recommendations.length;
  return {
    status: count > 0 ? "success" : "skipped",
    summary: count > 0
      ? `Generated ${count} recommendations (top impact: ${Math.max(...result.recommendations.map((r) => r.impactScore))}%)`
      : "No recommendations generated",
    details: {
      recommendationCount: count,
      currentScore: result.currentScore,
      categories: [...new Set(result.recommendations.map((r) => r.category))],
    },
  };
}
