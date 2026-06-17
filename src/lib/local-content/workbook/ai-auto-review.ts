// ─── LocalContentOS — Auto AI Review Pipeline ───
// Phase 1: After workbook population, automatically run AI review.
// Generates pattern suggestions, FP candidates, confidence analysis,
// and explanation cache. Stores results but never auto-applies.
// Status: "Pending Review"

import "server-only";

import { prisma } from "@/lib/prisma";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";
import {
  suggestPatternImprovements,
  explainAccountMatches,
  calibrateWorkbookConfidence,
  listPendingFalsePositives,
} from "./ai-advisor";
import { getWorkbookWithLines } from "./population";
import type { TbLine } from "./types";

// ─── Logging ───

const LOG_PREFIX = "[LocalContentOS AutoAIReview]";

function logReview(event: string, payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(LOG_PREFIX, event, payload);
}

// ─── Types ───

export interface AutoReviewResult {
  reviewRunId: string;
  workbookId: string;
  status: "completed" | "partial" | "failed";
  explanationsGenerated: number;
  patternSuggestions: number;
  falsePositivesFlagged: number;
  confidenceCalibrated: boolean;
  error?: string;
}

export interface WorkbookReviewStatus {
  /** Whether a review has ever been attempted */
  everReviewed: boolean;
  /** The most recent review run, if any */
  lastRunId?: string;
  /** Status of the most recent run */
  lastRunStatus?: string;
  /** Count of pending items */
  pendingPatternSuggestions: number;
  pendingFalsePositives: number;
  /** When the last run completed */
  lastCompletedAt?: string;
}

// ─── Main Pipeline ───

/**
 * Run the full AI review pipeline on a workbook after population.
 * Called automatically after populateWorkbookFromTb().
 * Safe to call multiple times — creates a new review run each time.
 * P0: Always requires human review of results.
 */
export async function runWorkbookAiReview(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
  actorId?: string,
): Promise<AutoReviewResult> {
  const startedAt = Date.now();
  logReview("ai_review_started", { organizationId, workbookId });

  // Create review run record
  const reviewRun = await prisma.lcAiReviewRun.create({
    data: {
      organizationId,
      workbookId,
      status: "in_progress",
      createdById: actorId ?? null,
    },
  });

  try {
    // Get projectId from workbook
    const workbook = await prisma.lcWorkbook.findUnique({
      where: { id: workbookId },
      select: { projectId: true },
    });
    const projectId = workbook?.projectId;

    // Step 1: Generate account match explanations
    logReview("step_explanations", { workbookId });
    const explanationResult = await explainAccountMatches(
      organizationId,
      workbookId,
      tbLines,
    );
    const explanationCount = explanationResult.success
      ? (explanationResult.data?.length ?? 0)
      : 0;

    // Step 2: Run confidence calibration
    logReview("step_calibration", { workbookId });
    const calibrationResult = await calibrateWorkbookConfidence(
      organizationId,
      workbookId,
    );

    // Step 3: Suggest pattern improvements
    logReview("step_pattern_suggestions", { workbookId });
    const suggestionResult = await suggestPatternImprovements(
      organizationId,
      workbookId,
      tbLines,
    );
    const suggestionCount = suggestionResult.success
      ? (suggestionResult.data?.length ?? 0)
      : 0;

    // Step 4: List pending false positives
    logReview("step_false_positives", { workbookId });
    const fpResult = await listPendingFalsePositives(organizationId);
    const fpCount = fpResult.success ? (fpResult.data?.length ?? 0) : 0;

    // Calculate overall status
    const totalErrors = [
      !explanationResult.success,
      !calibrationResult.success,
      !suggestionResult.success,
      !fpResult.success,
    ].filter(Boolean).length;

    const status: "completed" | "partial" =
      totalErrors === 0
        ? "completed"
        : totalErrors < 3
          ? "partial"
          : "partial";

    const durationMs = Date.now() - startedAt;

    // Update review run record
    await prisma.lcAiReviewRun.update({
      where: { id: reviewRun.id },
      data: {
        status,
        explanationsGenerated: explanationCount,
        patternSuggestions: suggestionCount,
        falsePositives: fpCount,
        confidenceCalibrated: calibrationResult.success,
        recommendationsGenerated: 0,
        completedAt: new Date(),
      },
    });

    // Audit event
    await createAiAuditEvent({
      organizationId,
      projectId: projectId ?? undefined,
      workbookId,
      action: AuditActions.AI_REVIEW_COMPLETED,
      actorId,
      providerId: "local",
      modelVersion: process.env.AI_LOCAL_MODEL ?? "qwen3:8b",
      status: status === "completed" ? "success" : "partial",
      inputSummary: { tbLineCount: tbLines.length },
      outputSummary: {
        explanationsGenerated: explanationCount,
        patternSuggestions: suggestionCount,
        falsePositivesFlagged: fpCount,
        confidenceCalibrated: calibrationResult.success,
      },
      durationMs,
    }).catch(() => {});

    logReview("ai_review_completed", {
      workbookId,
      status,
      durationMs,
      explanationCount,
      suggestionCount,
      fpCount,
    });

    return {
      reviewRunId: reviewRun.id,
      workbookId,
      status,
      explanationsGenerated: explanationCount,
      patternSuggestions: suggestionCount,
      falsePositivesFlagged: fpCount,
      confidenceCalibrated: calibrationResult.success,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const durationMs = Date.now() - startedAt;

    await prisma.lcAiReviewRun.update({
      where: { id: reviewRun.id },
      data: {
        status: "failed",
        errorMessage: message,
        completedAt: new Date(),
      },
    });

    await createAiAuditEvent({
      organizationId,
      workbookId,
      action: AuditActions.AI_REVIEW_FAILED,
      actorId,
      providerId: "local",
      modelVersion: process.env.AI_LOCAL_MODEL ?? "qwen3:8b",
      status: "failed",
      inputSummary: { workbookId },
      outputSummary: { error: message },
      durationMs,
    }).catch(() => {});

    logReview("ai_review_failed", { workbookId, error: message });

    return {
      reviewRunId: reviewRun.id,
      workbookId,
      status: "failed",
      explanationsGenerated: 0,
      patternSuggestions: 0,
      falsePositivesFlagged: 0,
      confidenceCalibrated: false,
      error: message,
    };
  }
}

/**
 * Get the AI review status for a workbook.
 * Shows whether review has been attempted and what's pending.
 */
export async function getWorkbookReviewStatus(
  organizationId: string,
  workbookId: string,
): Promise<WorkbookReviewStatus> {
  try {
    const lastRun = await prisma.lcAiReviewRun.findFirst({
      where: { organizationId, workbookId },
      orderBy: { createdAt: "desc" },
    });

    const pendingSuggestions = await prisma.lcPatternSuggestion.count({
      where: { organizationId, status: "pending" },
    });

    const pendingFPs = await prisma.lcMatchReview.count({
      where: {
        organizationId,
        isFalsePositive: true,
        status: "pending",
      },
    });

    if (!lastRun) {
      return {
        everReviewed: false,
        pendingPatternSuggestions: pendingSuggestions,
        pendingFalsePositives: pendingFPs,
      };
    }

    return {
      everReviewed: true,
      lastRunId: lastRun.id,
      lastRunStatus: lastRun.status,
      pendingPatternSuggestions: pendingSuggestions,
      pendingFalsePositives: pendingFPs,
      lastCompletedAt: lastRun.completedAt?.toISOString(),
    };
  } catch (error) {
    logReview("get_review_status_failed", {
      organizationId,
      workbookId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      everReviewed: false,
      pendingPatternSuggestions: 0,
      pendingFalsePositives: 0,
    };
  }
}

/**
 * Re-run the AI review pipeline (replaces previous run).
 */
export async function rerunWorkbookAiReview(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
  actorId?: string,
): Promise<AutoReviewResult> {
  return runWorkbookAiReview(organizationId, workbookId, tbLines, actorId);
}
