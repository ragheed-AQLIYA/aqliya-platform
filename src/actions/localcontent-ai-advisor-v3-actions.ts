// ─── LocalContentOS AI Advisor V3 — Server Actions ───
// Auto AI Review, Recommendation Engine, Simulation Engine, Learning Loop, AI Health

"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import {
  runWorkbookAiReview,
  getWorkbookReviewStatus,
} from "@/lib/local-content/workbook/ai-auto-review";
import {
  generateRecommendations,
  listWorkbookRecommendations,
  reviewRecommendation,
} from "@/lib/local-content/workbook/recommendation-engine";
import {
  runSimulation,
  listWorkbookSimulations,
  createSupplierOptimizationScenario,
  createWorkforceLocalizationScenario,
  createAssetLocalizationScenario,
  createMixedScenario,
} from "@/lib/local-content/workbook/simulation-engine";
import {
  getPatternHealthScores,
  getLearningLoopSummary,
} from "@/lib/local-content/workbook/learning-loop";
import { checkAiHealth, isAiHealthy } from "@/lib/local-content/workbook/ai-health";
import type { TbLine } from "@/lib/local-content/workbook/types";

// ─── Action Result ───

interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function fail<T = unknown>(error: string): ActionResult<T> {
  return { ok: false, error } as ActionResult<T>;
}

// ══════════════════════════════════════════════════════
// Phase 0 — AI Health
// ══════════════════════════════════════════════════════

export async function checkAiHealthAction(): Promise<ActionResult> {
  try {
    const user = await requireUserContext();
    const report = await checkAiHealth();
    return ok(report);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Health check failed");
  }
}

export async function isAiHealthyAction(): Promise<ActionResult<boolean>> {
  try {
    await requireUserContext();
    const healthy = await isAiHealthy();
    return ok(healthy);
  } catch {
    return ok(false);
  }
}

// ══════════════════════════════════════════════════════
// Phase 1 — Auto AI Review
// ══════════════════════════════════════════════════════

export async function runWorkbookAiReviewAction(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const result = await runWorkbookAiReview(
      organizationId,
      workbookId,
      tbLines,
      user.id,
    );

    revalidatePath(`/local-content/workbook/${workbookId}`);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "AI review failed");
  }
}

export async function getWorkbookReviewStatusAction(
  organizationId: string,
  workbookId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const status = await getWorkbookReviewStatus(organizationId, workbookId);
    return ok(status);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to get review status");
  }
}

// ══════════════════════════════════════════════════════
// Phase 2 — Recommendation Engine
// ══════════════════════════════════════════════════════

export async function generateRecommendationsAction(
  organizationId: string,
  workbookId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const result = await generateRecommendations(organizationId, workbookId);

    revalidatePath(`/local-content/workbook/${workbookId}`);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Recommendation generation failed");
  }
}

export async function listWorkbookRecommendationsAction(
  organizationId: string,
  workbookId: string,
  status?: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const recs = await listWorkbookRecommendations(organizationId, workbookId, status);
    return ok(recs);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list recommendations");
  }
}

export async function reviewRecommendationAction(
  recommendationId: string,
  decision: "accepted" | "rejected" | "implemented",
  reviewNotes: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    await reviewRecommendation(recommendationId, decision, reviewNotes, user.id);
    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to review recommendation");
  }
}

// ══════════════════════════════════════════════════════
// Phase 3 — Simulation Engine
// ══════════════════════════════════════════════════════

export async function runSimulationAction(
  organizationId: string,
  workbookId: string,
  scenarioType: "supplier" | "workforce" | "asset" | "mixed",
  params: Record<string, number>,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    let scenario;
    switch (scenarioType) {
      case "supplier":
        scenario = createSupplierOptimizationScenario(params.localSpendIncrease ?? 0);
        // Fill in the actual value
        scenario.parameters[0] = {
          ...scenario.parameters[0],
          newValue: params.localSpendValue ?? params.localSpendIncrease ?? 0,
        };
        break;
      case "workforce":
        scenario = createWorkforceLocalizationScenario(params.saudiHireCount ?? 0);
        scenario.parameters[0] = {
          ...scenario.parameters[0],
          newValue: params.saudiWorkforceValue ?? params.saudiHireCount ?? 0,
        };
        break;
      case "asset":
        scenario = createAssetLocalizationScenario(params.localAssetIncrease ?? 0);
        scenario.parameters[0] = {
          ...scenario.parameters[0],
          newValue: params.localAssetValue ?? params.localAssetIncrease ?? 0,
        };
        break;
      case "mixed":
        scenario = createMixedScenario(
          params.supplierDelta ?? 0,
          params.workforceDelta ?? 0,
          params.totalSaudiWorkforce ?? 0,
          params.totalWorkforce ?? 0,
          params.localAssetDelta ?? 0,
          params.totalAsset ?? 0,
        );
        break;
      default:
        return fail(`Unknown scenario type: ${scenarioType}`);
    }

    const result = await runSimulation(organizationId, workbookId, scenario);

    revalidatePath(`/local-content/workbook/${workbookId}`);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Simulation failed");
  }
}

export async function listWorkbookSimulationsAction(
  organizationId: string,
  workbookId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const sims = await listWorkbookSimulations(organizationId, workbookId);
    return ok(sims);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list simulations");
  }
}

// ══════════════════════════════════════════════════════
// Phase 4 — Learning Loop
// ══════════════════════════════════════════════════════

export async function getPatternHealthScoresAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const scores = await getPatternHealthScores(organizationId);
    return ok(scores);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to get health scores");
  }
}

export async function getLearningLoopSummaryAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const summary = await getLearningLoopSummary(organizationId);
    return ok(summary);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to get learning loop summary");
  }
}

// ══════════════════════════════════════════════════════
// Phase 5 — Workbook AI Dashboard (data gatherer)
// ══════════════════════════════════════════════════════

export async function getWorkbookAiDashboardDataAction(
  organizationId: string,
  workbookId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUserContext();

    const [reviewStatus, recommendations, simulations, health] = await Promise.all([
      getWorkbookReviewStatus(organizationId, workbookId),
      listWorkbookRecommendations(organizationId, workbookId).catch(() => []),
      listWorkbookSimulations(organizationId, workbookId).catch(() => []),
      checkAiHealth().catch(() => null),
    ]);

    return ok({
      reviewStatus,
      recommendations,
      simulations,
      health,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to get dashboard data");
  }
}
