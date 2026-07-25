// ─── Pipeline Stages 9-10: Industry & Organization Memory ───

import "server-only";

import {
  getLearningLoopSummary,
  getPatternHealthScores,
} from "../workbook/learning-loop";
import type { StageOutcome } from "./common";

export async function stageUpdateIndustryMem(
  organizationId: string,
): Promise<StageOutcome> {
  const summary = await getLearningLoopSummary(organizationId);
  return {
    status: "success",
    summary: `Industry memory: ${summary.totalPatterns} patterns (${summary.activePatterns} active, ${summary.highPerformingPatterns} high-performing)`,
    details: {
      totalPatterns: summary.totalPatterns,
      activePatterns: summary.activePatterns,
      highPerforming: summary.highPerformingPatterns,
    },
  };
}

export async function stageUpdateOrgMem(
  organizationId: string,
): Promise<StageOutcome> {
  const scores = await getPatternHealthScores(organizationId);
  return {
    status: "success",
    summary: `Organization memory: ${scores.length} health records tracked`,
    details: {
      records: scores.length,
      avgHealth: scores.length > 0
        ? Math.round(scores.reduce((s, r) => s + r.healthScore, 0) / scores.length)
        : null,
    },
  };
}
