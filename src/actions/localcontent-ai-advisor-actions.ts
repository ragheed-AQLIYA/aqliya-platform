"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  suggestPatternImprovements,
  explainAccountMatches,
  listPendingFalsePositives,
  reviewFalsePositive,
  batchReviewFalsePositives,
  getIndustryPatternBenchmarks,
  getOrganizationMatchMemory,
  calibrateWorkbookConfidence,
  listPendingPatternSuggestions,
  reviewPatternSuggestion,
} from "@/lib/local-content/workbook/ai-advisor";
import { assertProjectAccess } from "@/lib/local-content/guards";
import type { TbLine } from "@/lib/local-content/workbook/types";

// ─── Result type ───

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI Advisor Action]", message);
    return { ok: false, error: message };
  }
}

function requireUser(): { id: string; name: string; organizationId: string; role: string } {
  // This is called within safe(), so we don't need try/catch here
  // Using getCurrentUser from the auth layer.
  // In practice, we assert via the guards. For simplicity we re-use the auth pattern.
  throw new Error("Not implemented directly — use assertProjectAccess instead");
}

// ══════════════════════════════════════════════════════
// P0 — Pattern Learning Assistant Actions
// ══════════════════════════════════════════════════════

/**
 * Run AI pattern improvement analysis on a workbook.
 * Generates pattern suggestions for lines with FPs or missed matches.
 */
export async function runPatternAnalysisAction(
  projectId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "review");
    const result = await suggestPatternImprovements(
      context.project.organizationId,
      workbookId,
      tbLines,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Pattern analysis failed");
    }
    revalidatePath(`/local-content/projects/${projectId}/workbook/${workbookId}/ai-advisor`);
    return result.data;
  });
}

/**
 * List pending pattern suggestions for review.
 */
export async function listPendingPatternSuggestionsAction(
  projectId: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "view");
    const result = await listPendingPatternSuggestions(context.project.organizationId);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to list suggestions");
    }
    return result.data;
  });
}

/**
 * Review (approve/reject) a pattern suggestion.
 */
export async function reviewPatternSuggestionAction(
  suggestionId: string,
  decision: "approved" | "rejected",
  reviewNotes: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const user = await getCurrentUser();
    const result = await reviewPatternSuggestion(
      suggestionId,
      decision,
      reviewNotes,
      user.id,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Failed to review suggestion");
    }
    return result.data;
  });
}

// ══════════════════════════════════════════════════════
// P0 — Account Explanation Engine Actions
// ══════════════════════════════════════════════════════

/**
 * Generate explanations for all matched accounts in a workbook.
 */
export async function explainAccountMatchesAction(
  projectId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "view");
    const result = await explainAccountMatches(
      context.project.organizationId,
      workbookId,
      tbLines,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Account explanation failed");
    }
    return result.data;
  });
}

/**
 * Get match explanations for a specific workbook line.
 */
export async function getLineMatchExplanationsAction(
  projectId: string,
  workbookLineCode: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "view");
    const reviews = await prisma.lcMatchReview.findMany({
      where: {
        organizationId: context.project.organizationId,
        workbookLineCode,
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 50,
    });
    return reviews;
  });
}

// ══════════════════════════════════════════════════════
// P0 — False Positive Reviewer Actions
// ══════════════════════════════════════════════════════

/**
 * List all false positive flags pending review for an organization.
 */
export async function listFpFlagsAction(
  projectId: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "view");
    const result = await listPendingFalsePositives(context.project.organizationId);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to list FP flags");
    }
    return result.data;
  });
}

/**
 * Review a single false positive flag.
 */
export async function reviewFpFlagAction(
  matchReviewId: string,
  decision: "confirmed" | "rejected",
  reviewNotes: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const user = await getCurrentUser();
    const result = await reviewFalsePositive(
      matchReviewId,
      decision,
      reviewNotes,
      user.id,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Failed to review FP flag");
    }
    revalidatePath("/local-content/ai-advisor");
    return result.data;
  });
}

/**
 * Batch-review multiple false positive flags.
 */
export async function batchReviewFpAction(
  projectId: string,
  matchReviewIds: string[],
  decision: "confirmed" | "rejected",
  reviewNotes: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "review");
    const user = await getCurrentUser();
    const result = await batchReviewFalsePositives(
      context.project.organizationId,
      matchReviewIds,
      decision,
      reviewNotes,
      user.id,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Batch review failed");
    }
    revalidatePath("/local-content/ai-advisor");
    return result.data;
  });
}

// ══════════════════════════════════════════════════════
// P1 — Industry Memory Actions
// ══════════════════════════════════════════════════════

/**
 * Get industry pattern effectiveness benchmarks.
 */
export async function getIndustryBenchmarksAction(
  industry?: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const result = await getIndustryPatternBenchmarks(industry);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to get benchmarks");
    }
    return result.data;
  });
}

// ══════════════════════════════════════════════════════
// P1 — Organization Memory Actions
// ══════════════════════════════════════════════════════

/**
 * Get organization match history.
 */
export async function getOrgMatchMemoryAction(
  projectId: string,
  workbookLineCode?: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "view");
    const result = await getOrganizationMatchMemory(
      context.project.organizationId,
      workbookLineCode,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Failed to get organization memory");
    }
    return result.data;
  });
}

// ══════════════════════════════════════════════════════
// P1 — Confidence Calibration Actions
// ══════════════════════════════════════════════════════

/**
 * Run confidence calibration on a workbook.
 */
export async function calibrateConfidenceAction(
  projectId: string,
  workbookId: string,
): Promise<ActionResult<unknown>> {
  return safe(async () => {
    const context = await assertProjectAccess(projectId, "review");
    const result = await calibrateWorkbookConfidence(
      context.project.organizationId,
      workbookId,
    );
    if (!result.success) {
      throw new Error(result.error ?? "Confidence calibration failed");
    }
    revalidatePath(`/local-content/projects/${projectId}/workbook/${workbookId}`);
    return result.data;
  });
}
