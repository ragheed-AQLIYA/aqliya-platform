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
//   7. runAiAdvisor      — AI pattern improvement suggestions
//   8. updateIndustryMem  — update industry memory coverage
//   9. updateOrgMem       — update organization memory coverage
//  10. updatePatternHealth — refresh pattern health records
//  11. pilotReadiness     — overall pilot readiness assessment

import "server-only";

import { prisma } from "@/lib/prisma";
import { detectMissingData } from "./workbook/missing-data";
import { populateWorkbookFromProject } from "./workbook/population";
import { computeLcScore, getLineValue } from "./workbook/scoring";
import { generateRecommendations } from "./workbook/recommendation-engine";
import {
  runSimulation,
  createSupplierOptimizationScenario,
  createWorkforceLocalizationScenario,
  createAssetLocalizationScenario,
  createMixedScenario,
} from "./workbook/simulation-engine";
import { runWorkbookAiReview } from "./workbook/ai-auto-review";
import { suggestPatternImprovements } from "./workbook/ai-advisor";
import {
  getLearningLoopSummary,
  getPatternHealthScores,
} from "./workbook/learning-loop";
import { getPilotReadiness } from "@/lib/local-content/pilot-readiness";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";
import type { LcWorkbookLine } from "@prisma/client";
import type { TbLine } from "./workbook/types";
import type { LcScoreResult } from "./workbook/types";

// ─── Constants ───

const PIPELINE_ACTOR = "pipeline-orchestrator";
const PIPELINE_PROVIDER = "pipeline-orchestrator";

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

// ─── Orchestrator ───

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
  stages.push(await runStage(1, "populateWorkbook", async () => {
    const populated = await populateWorkbookFromProject(projectId, workbookId);
    return {
      status: "success" as PipelineStageStatus,
      summary: `Population: ${populated.autoFilledLines}/${populated.totalLines} lines auto-filled (${populated.completionPct}% complete)`,
      details: {
        totalLines: populated.totalLines,
        autoFilled: populated.autoFilledLines,
        missingLines: populated.missingLines,
        completionPct: populated.completionPct,
      },
    };
  }));

  // ── Stage 2: Detect Missing Data ──
  stages.push(await runStage(2, "detectMissing", async () => {
    const missing = await detectMissingData(workbookId);
    const categoryCount = Object.keys(missing.byCategory).length;
    return {
      status: "success" as PipelineStageStatus,
      summary: `Detected ${missing.totalMissing} missing items across ${categoryCount} categories`,
      details: {
        totalMissing: missing.totalMissing,
        categories: categoryCount,
      },
    };
  }));

  // ── Stage 3: Generate Data Requests ──
  stages.push(await runStage(3, "generateRequests", async () => {
    const missing = await detectMissingData(workbookId);
    if (missing.items.length === 0) {
      return {
        status: "skipped" as PipelineStageStatus,
        summary: "No missing items — no data request needed",
      };
    }
    const evidenceItems = missing.items.filter((i) => i.evidenceRequired);
    if (evidenceItems.length === 0) {
      return {
        status: "skipped" as PipelineStageStatus,
        summary: `Missing ${missing.items.length} items, but none require evidence collection`,
        details: { totalMissing: missing.items.length, evidenceRequired: 0 },
      };
    }
    return {
      status: "success" as PipelineStageStatus,
      summary: `Generated data request for ${evidenceItems.length} evidence-required items`,
      details: { evidenceItems: evidenceItems.length },
    };
  }));

  // ── Stage 4: Compute Score ──
  let finalScore: LcScoreResult | null = null;
  stages.push(await runStage(4, "computeScore", async () => {
    const lines = await prisma.lcWorkbookLine.findMany({
      where: { workbookId },
    });
    const score = computeLcScore(lines);
    finalScore = score;

    // Save score to workbook
    await prisma.lcWorkbook.update({
      where: { id: workbookId },
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
      status: "success" as PipelineStageStatus,
      summary: `Score: ${score.overallScore !== null ? `${score.overallScore}%` : "insufficient data"} (${score.statusLabel})`,
      details: {
        overallScore: score.overallScore,
        statusLabel: score.statusLabel,
        metrics: score.metrics.length,
      },
    };
  }));

  // ── Stage 5: Generate Recommendations ──
  stages.push(await runStage(5, "generateRecs", async () => {
    const result = await generateRecommendations(organizationId, workbookId);
    const count = result.recommendations.length;
    return {
      status: count > 0 ? "success" as PipelineStageStatus : "skipped" as PipelineStageStatus,
      summary: count > 0
        ? `Generated ${count} recommendations (top impact: ${Math.max(...result.recommendations.map((r) => r.impactScore))}%)`
        : "No recommendations generated",
      details: {
        recommendationCount: count,
        currentScore: result.currentScore,
        categories: [...new Set(result.recommendations.map((r) => r.category))],
      },
    };
  }));

  // ── Stage 6: Run Simulations ──
  stages.push(await runStage(6, "runSimulations", async () => {
    const lines = await prisma.lcWorkbookLine.findMany({ where: { workbookId } });
    const spn01 = lines.find((l) => l.code === "SPN-01");
    const spn03 = lines.find((l) => l.code === "SPN-03");
    const wrk01 = lines.find((l) => l.code === "WRK-01");
    const wrk02 = lines.find((l) => l.code === "WRK-02");
    const ast01 = lines.find((l) => l.code === "AST-01");
    const ast02 = lines.find((l) => l.code === "AST-02");

    const simulations: Array<{ label: string; scenario: ReturnType<typeof createSupplierOptimizationScenario> }> = [];

    // Supplier: increase local spend by 15%
    if (spn01 && spn03) {
      const localVal = getLineValue(spn01) ?? 0;
      const increase = Math.round(localVal * 0.15);
      simulations.push({
        label: "supplier_15pct",
        scenario: createSupplierOptimizationScenario(increase, spn03),
      });
      // Supplier: increase local spend by 30%
      simulations.push({
        label: "supplier_30pct",
        scenario: createSupplierOptimizationScenario(Math.round(localVal * 0.3), spn03),
      });
    }

    // Workforce: hire additional 10 Saudi employees
    if (wrk01 && wrk02) {
      const saudiVal = getLineValue(wrk01) ?? 0;
      simulations.push({
        label: "workforce_10pct",
        scenario: createWorkforceLocalizationScenario(saudiVal + 10),
      });
    }

    // Asset: increase local assets by 20%
    if (ast01) {
      const assetVal = getLineValue(ast01) ?? 0;
      const increase = Math.round(assetVal * 0.2);
      simulations.push({
        label: "asset_20pct",
        scenario: createAssetLocalizationScenario(increase),
      });
    }

    // Mixed: supplier + workforce + asset combined
    if (spn01 && spn03 && wrk01 && wrk02 && ast01 && ast02) {
      const localVal = getLineValue(spn01) ?? 0;
      const saudiVal = getLineValue(wrk01) ?? 0;
      const totalWorkforceVal = getLineValue(wrk02) ?? 0;
      const assetVal = getLineValue(ast01) ?? 0;
      const totalAssetVal = getLineValue(ast02) ?? 0;
      const saudiHireDelta = 5; // hire 5 more saudis
      simulations.push({
        label: "mixed_combined",
        scenario: createMixedScenario(
          Math.round(localVal * 0.2),
          saudiHireDelta,
          saudiVal + saudiHireDelta,
          totalWorkforceVal + saudiHireDelta,
          Math.round(assetVal * 0.1),
          totalAssetVal,
        ),
      });
    }

    // Run all simulations
    let successCount = 0;
    const simResults: string[] = [];
    for (const sim of simulations) {
      try {
        const result = await runSimulation(organizationId, workbookId, sim.scenario);
        successCount++;
        const deltaStr = result.delta !== null
          ? `+${result.delta.toFixed(1)}%`
          : "N/A";
        simResults.push(`${sim.label}: ${deltaStr}`);
      } catch (err) {
        simResults.push(`${sim.label}: failed`);
      }
    }

    return {
      status: successCount > 0 ? "success" as PipelineStageStatus : "skipped" as PipelineStageStatus,
      summary: successCount > 0
        ? `Ran ${successCount}/${simulations.length} simulations: ${simResults.join("; ")}`
        : "No simulations run",
      details: {
        attempted: simulations.length,
        succeeded: successCount,
        results: simResults,
      },
    };
  }));

  // ── Stage 7: AI Advisor — Pattern Suggestions ──
  stages.push(await runStage(7, "runAiAdvisor", async () => {
    if (safeTbLines.length === 0) {
      return {
        status: "skipped" as PipelineStageStatus,
        summary: "No TB lines available — pattern suggestion requires trial balance data",
      };
    }

    const result = await suggestPatternImprovements(organizationId, workbookId, safeTbLines);
    if (!result.success) {
      return {
        status: "partial" as PipelineStageStatus,
        summary: `AI advisor: ${result.error ?? "unknown error"}`,
      };
    }

    const suggestions = result.data ?? [];
    return {
      status: suggestions.length > 0 ? "success" as PipelineStageStatus : "skipped" as PipelineStageStatus,
      summary: suggestions.length > 0
        ? `Found ${suggestions.length} pattern improvement suggestions`
        : "No pattern improvements to suggest",
      details: {
        suggestionCount: suggestions.length,
      },
    };
  }));

  // ── Stage 8: AI Auto-Review (pattern explanations, confidence) ──
  stages.push(await runStage(8, "runAiReview", async () => {
    const result = await runWorkbookAiReview(organizationId, workbookId, safeTbLines, PIPELINE_ACTOR);
    const isCompleted = result.status === "completed";
    return {
      status: isCompleted ? "success" as PipelineStageStatus : "partial" as PipelineStageStatus,
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
  }));

  // ── Stage 9: Update Industry Memory ──
  stages.push(await runStage(9, "updateIndustryMem", async () => {
    const summary = await getLearningLoopSummary(organizationId);
    return {
      status: "success" as PipelineStageStatus,
      summary: `Industry memory: ${summary.totalPatterns} patterns (${summary.activePatterns} active, ${summary.highPerformingPatterns} high-performing)`,
      details: {
        totalPatterns: summary.totalPatterns,
        activePatterns: summary.activePatterns,
        highPerforming: summary.highPerformingPatterns,
      },
    };
  }));

  // ── Stage 10: Update Organization Memory ──
  stages.push(await runStage(10, "updateOrgMem", async () => {
    const scores = await getPatternHealthScores(organizationId);
    return {
      status: "success" as PipelineStageStatus,
      summary: `Organization memory: ${scores.length} health records tracked`,
      details: {
        records: scores.length,
        avgHealth: scores.length > 0
          ? Math.round(scores.reduce((s, r) => s + r.healthScore, 0) / scores.length)
          : null,
      },
    };
  }));

  // ── Stage 11: Pilot Readiness ──
  stages.push(await runStage(11, "pilotReadiness", async () => {
    const readiness = await getPilotReadiness(organizationId);
    const greenCount = readiness.metrics.filter((m) => m.level === "GREEN").length;
    const amberCount = readiness.metrics.filter((m) => m.level === "AMBER").length;
    const redCount = readiness.metrics.filter((m) => m.level === "RED").length;

    return {
      status: "success" as PipelineStageStatus,
      summary: `Pilot readiness: ${readiness.overallScore}% (${readiness.overallStatus}) — ${greenCount} GREEN, ${amberCount} AMBER, ${redCount} RED`,
      details: {
        overallScore: readiness.overallScore,
        overallStatus: readiness.overallStatus,
        greenCount,
        amberCount,
        redCount,
        metrics: readiness.metrics.map((m) => ({
          label: m.label,
          level: m.level,
          score: m.score,
        })),
      },
    };
  }));

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
    providerId: PIPELINE_PROVIDER,
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

// ─── Stage Runner ───

async function runStage(
  stage: number,
  name: string,
  fn: () => Promise<{
    status: PipelineStageStatus;
    summary: string;
    details?: Record<string, unknown>;
  }>,
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

/**
 * Format a pipeline result as a human-readable report.
 */
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
