// ─── Pipeline Stages 7-8: AI Advisor & Auto-Review ───

import "server-only";

import { runWorkbookAiReview } from "../workbook/ai-auto-review";
import { suggestPatternImprovements } from "../workbook/ai-advisor";
import { PIPELINE_ACTOR } from "./common";
import type { StageOutcome } from "./common";
import type { TbLine } from "../workbook/types";

export async function stageRunAiAdvisor(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<StageOutcome> {
  if (tbLines.length === 0) {
    return {
      status: "skipped",
      summary: "No TB lines available — pattern suggestion requires trial balance data",
    };
  }

  const result = await suggestPatternImprovements(organizationId, workbookId, tbLines);
  if (!result.success) {
    return {
      status: "partial",
      summary: `AI advisor: ${result.error ?? "unknown error"}`,
    };
  }

  const suggestions = result.data ?? [];
  return {
    status: suggestions.length > 0 ? "success" : "skipped",
    summary: suggestions.length > 0
      ? `Found ${suggestions.length} pattern improvement suggestions`
      : "No pattern improvements to suggest",
    details: {
      suggestionCount: suggestions.length,
    },
  };
}

export async function stageRunAiReview(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<StageOutcome> {
  const result = await runWorkbookAiReview(organizationId, workbookId, tbLines, PIPELINE_ACTOR);
  const isCompleted = result.status === "completed";
  return {
    status: isCompleted ? "success" : "partial",
    summary: isCompleted
      ? `AI review complete: ${result.explanationsGenerated} explanations, ${result.patternSuggestions} suggestions, ${result.falsePositivesFlagged} false positives`
      : `AI review partial: ${result.error ?? "unknown"}`,
    details: {
      explanations: result.explanationsGenerated,
      suggestions: result.patternSuggestions,
      falsePositives: result.falsePositivesFlagged,
      confidenceCalibrated: result.confidenceCalibrated,
    },
  };
}
