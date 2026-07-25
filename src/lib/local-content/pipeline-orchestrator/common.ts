// ─── Pipeline Orchestrator — Shared Types, Constants, Helpers ───

import type { LcScoreResult } from "../workbook/types";

// ─── Constants ───

export const PIPELINE_ACTOR = "pipeline-orchestrator";
export const PIPELINE_PROVIDER = "pipeline-orchestrator";

// ─── Types ───

export type PipelineStageStatus = "success" | "partial" | "failed" | "skipped";

export interface PipelineStageResult {
  stage: number;
  name: string;
  status: PipelineStageStatus;
  durationMs: number;
  summary: string;
  details?: Record<string, unknown>;
  error?: string;
}

export interface PipelineResult {
  organizationId: string;
  workbookId: string;
  projectId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  stages: PipelineStageResult[];
  finalScore: LcScoreResult | null;
  status: "completed" | "partial";
}

/** Shape returned by each domain stage function. */
export interface StageOutcome {
  status: PipelineStageStatus;
  summary: string;
  details?: Record<string, unknown>;
}

// ─── Stage Runner ───

export async function runStage(
  stage: number,
  name: string,
  fn: () => Promise<StageOutcome>,
): Promise<PipelineStageResult> {
  const start = Date.now();
  try {
    const result = await fn();
    return {
      stage,
      name,
      status: result.status,
      durationMs: Date.now() - start,
      summary: result.summary,
      details: result.details,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      stage,
      name,
      status: "failed",
      durationMs: Date.now() - start,
      summary: `Failed: ${message}`,
      error: message,
    };
  }
}

// ─── Summary Formatter ───

export function formatPipelineSummary(result: PipelineResult): string {
  const lines: string[] = [];
  lines.push(`Pipeline Report — ${result.status.toUpperCase()}`);
  lines.push(`  Workbook: ${result.workbookId}`);
  lines.push(`  Duration: ${(result.totalDurationMs / 1000).toFixed(1)}s`);
  lines.push(`  Final Score: ${result.finalScore?.overallScore ?? "N/A"}%`);
  lines.push("");

  for (const stage of result.stages) {
    const statusIcon =
      stage.status === "success" ? "✅" :
      stage.status === "partial" ? "⚠️" :
      stage.status === "skipped" ? "⏭️" :
      "❌";
    lines.push(`  ${statusIcon} Stage ${stage.stage}.${stage.name} — ${stage.summary}`);
  }

  const successful = result.stages.filter((s) => s.status === "success").length;
  const partial = result.stages.filter((s) => s.status === "partial").length;
  const failed = result.stages.filter((s) => s.status === "failed").length;
  lines.push("");
  lines.push(`  Summary: ${successful} success, ${partial} partial, ${failed} failed`);
  return lines.join("\n");
}
