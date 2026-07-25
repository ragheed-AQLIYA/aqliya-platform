// ─── LocalContentOS — Pipeline Orchestrator ───
// Runs the full local content pipeline in 11 isolated stages.
// Each stage uses existing engines — no duplicated logic.
// Stage failure does not block subsequent stages.
// P0: Results are informational — no autonomous decisions.
//
// Stages:
//   1. populateWorkbook   — auto-fill from project suppliers & TB
//   2. detectMissing      — scan workbook for gaps
//   3. generateRequests   — create data request package
//   4. computeScore       — calculate current LC score
//   5. generateRecs       — create improvement recommendations
//   6. runSimulations     — run 4 standard what-if scenarios
//   7. runAiAdvisor       — AI pattern improvement suggestions
//   8. runAiReview        — AI auto-review with explanations
//   9. updateIndustryMem  — update industry memory coverage
//  10. updateOrgMem       — update organization memory coverage
//  11. pilotReadiness     — overall pilot readiness assessment

import "server-only";

import { prisma } from "@/lib/prisma";
import { createAiAuditEvent } from "../audit-events";
import type { TbLine } from "../workbook/types";
import type { LcScoreResult } from "../workbook/types";
import {
  PIPELINE_ACTOR,
  runStage,
  type PipelineStageStatus,
  type PipelineStageResult,
  type PipelineResult,
} from "./common";
import { stagePopulateWorkbook, stageDetectMissing, stageGenerateRequests } from "./workbook-stages";
import { stageComputeScore, stageGenerateRecs } from "./scoring-stages";
import { stageRunSimulations } from "./simulation-stages";
import { stageRunAiAdvisor, stageRunAiReview } from "./ai-stages";
import { stageUpdateIndustryMem, stageUpdateOrgMem } from "./memory-stages";
import { stagePilotReadiness } from "./pilot-stages";

export type { PipelineStageStatus, PipelineStageResult, PipelineResult } from "./common";
export { formatPipelineSummary } from "./common";

/**
 * Run the full local content pipeline for a given workbook.
 * All 11 stages execute in sequence; failures are isolated.
 */
export async function runLocalContentPipeline(
  organizationId: string,
  projectId: string,
  workbookId: string,
  tbLines?: TbLine[],
): Promise<PipelineResult> {
  const startedAt = Date.now();
  const startedAtStr = new Date().toISOString();
  const stages: PipelineStageResult[] = [];
  const safeTbLines: TbLine[] = tbLines ?? [];

  // ── Stage 1: Populate Workbook ──
  stages.push(await runStage(1, "populateWorkbook", () =>
    stagePopulateWorkbook(projectId, organizationId, workbookId),
  ));

  // ── Stage 2: Detect Missing Data ──
  stages.push(await runStage(2, "detectMissing", () =>
    stageDetectMissing(workbookId, organizationId),
  ));

  // ── Stage 3: Generate Data Requests ──
  stages.push(await runStage(3, "generateRequests", () =>
    stageGenerateRequests(workbookId, organizationId),
  ));

  // ── Stage 4: Compute Score ──
  let finalScore: LcScoreResult | null = null;
  stages.push(await runStage(4, "computeScore", async () => {
    const outcome = await stageComputeScore(organizationId, workbookId);
    finalScore = outcome._finalScore ?? null;
    const { _finalScore: _, ...stageOutcome } = outcome;
    return stageOutcome;
  }));

  // ── Stage 5: Generate Recommendations ──
  stages.push(await runStage(5, "generateRecs", () =>
    stageGenerateRecs(organizationId, workbookId),
  ));

  // ── Stage 6: Run Simulations ──
  stages.push(await runStage(6, "runSimulations", () =>
    stageRunSimulations(organizationId, workbookId),
  ));

  // ── Stage 7: AI Advisor — Pattern Suggestions ──
  stages.push(await runStage(7, "runAiAdvisor", () =>
    stageRunAiAdvisor(organizationId, workbookId, safeTbLines),
  ));

  // ── Stage 8: AI Auto-Review ──
  stages.push(await runStage(8, "runAiReview", () =>
    stageRunAiReview(organizationId, workbookId, safeTbLines),
  ));

  // ── Stage 9: Update Industry Memory ──
  stages.push(await runStage(9, "updateIndustryMem", () =>
    stageUpdateIndustryMem(organizationId),
  ));

  // ── Stage 10: Update Organization Memory ──
  stages.push(await runStage(10, "updateOrgMem", () =>
    stageUpdateOrgMem(organizationId),
  ));

  // ── Stage 11: Pilot Readiness ──
  stages.push(await runStage(11, "pilotReadiness", () =>
    stagePilotReadiness(organizationId),
  ));

  // ── Write master audit event ──
  const completedAt = Date.now();
  const successfulStages = stages.filter((s) => s.status === "success").length;
  const partialStages = stages.filter((s) => s.status === "partial").length;
  const failedStages = stages.filter((s) => s.status === "failed").length;

  await createAiAuditEvent({
    organizationId,
    workbookId,
    action: "pipeline.completed",
    actorId: PIPELINE_ACTOR,
    providerId: PIPELINE_ACTOR,
    status: failedStages === 0 ? "success" : "partial",
    inputSummary: { projectId, workbookId, totalStages: stages.length },
    outputSummary: {
      successfulStages,
      partialStages,
      failedStages,
      totalDurationMs: completedAt - startedAt,
      finalScore: (finalScore as LcScoreResult | null)?.overallScore ?? null,
    },
  }).catch(() => {});

  const overallStatus: PipelineResult["status"] = failedStages >= stages.length
    ? "partial"
    : "completed";

  return {
    organizationId,
    workbookId,
    projectId,
    startedAt: startedAtStr,
    completedAt: new Date().toISOString(),
    totalDurationMs: completedAt - startedAt,
    stages,
    finalScore,
    status: overallStatus,
  };
}
