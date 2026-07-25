/**
 * LocalContentOS AI Advisor — P0 False Positive Reviewer
 * Lists, reviews, and batch-reviews false positive matches.
 */

import { prisma } from "./common";
import { logAdvisor, ok, fail, type AdvisorResult } from "./common";
import { updateIndustryPatternMemory } from "./memory";

// ─── Types ───

export interface FalsePositiveReview {
  id: string;
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  status: string;
}

/**
 * List all pending false positive reviews for an organization's workbook.
 * These are matches flagged as high-risk that need human review.
 * P0 — Human review always required before any action.
 */
export async function listPendingFalsePositives(
  organizationId: string,
): Promise<AdvisorResult<FalsePositiveReview[]>> {
  if (!organizationId) {
    return fail("Organization ID is required");
  }

  try {
    const reviews = await prisma.lcMatchReview.findMany({
      where: {
        organizationId,
        isFalsePositive: true,
        status: "pending",
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 100,
    });

    return ok(
      reviews.map((r) => ({
        id: r.id,
        workbookLineCode: r.workbookLineCode,
        accountCode: r.accountCode,
        accountName: r.accountName,
        confidence: r.confidence,
        riskLevel: r.riskLevel,
        riskReason: r.riskReason ?? "",
        status: r.status,
      })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("list_false_positives_failed", { organizationId, error: message });
    return fail(message);
  }
}

/**
 * Review a potential false positive match.
 * Human decides whether to confirm or reject the FP flag.
 * P0 — Governed action, never auto-approved.
 */
export async function reviewFalsePositive(
  organizationId: string,
  matchReviewId: string,
  decision: "confirmed" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<unknown>> {
  if (!organizationId || !matchReviewId || !decision || !reviewerId) {
    return fail("Organization ID, match review ID, decision, and reviewer ID are required");
  }

  try {
    const existing = await prisma.lcMatchReview.findFirst({
      where: { id: matchReviewId, organizationId },
    });

    if (!existing) {
      return fail("Match review not found");
    }

    if (existing.status !== "pending") {
      return fail(`Match review already ${existing.status}`);
    }

    const updated = await prisma.lcMatchReview.update({
      where: { id: matchReviewId },
      data: {
        isFalsePositive: decision === "confirmed",
        status: decision === "confirmed" ? "confirmed" : "rejected",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // If confirmed FP, record in organization memory
    if (decision === "confirmed") {
      await prisma.lcOrganizationMatchMemory.upsert({
        where: {
          organizationId_workbookLineCode_accountCode: {
            organizationId: existing.organizationId,
            workbookLineCode: existing.workbookLineCode,
            accountCode: existing.accountCode,
          },
        },
        update: {
          previousResult: "overridden",
          accountName: existing.accountName,
          currentPattern: existing.patternUsed ?? undefined,
          manualOverride: true,
          overrideReason: reviewNotes || "Confirmed false positive",
        },
        create: {
          organizationId: existing.organizationId,
          workbookLineCode: existing.workbookLineCode,
          accountCode: existing.accountCode,
          accountName: existing.accountName,
          previousResult: "overridden",
          currentPattern: existing.patternUsed ?? null,
          manualOverride: true,
          overrideReason: reviewNotes || "Confirmed false positive",
        },
      });

      // Update industry pattern memory
      await updateIndustryPatternMemory(
        existing.organizationId,
        existing.workbookLineCode,
        existing.patternUsed ?? "",
        false,
      );
    }

    logAdvisor("false_positive_reviewed", {
      matchReviewId,
      decision,
      reviewerId,
    });

    return ok(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("false_positive_review_failed", { matchReviewId, error: message });
    return fail(message);
  }
}

/**
 * Batch-review false positives (approve all or reject all).
 * P0 — Governed action, gets logged as one batch operation.
 */
export async function batchReviewFalsePositives(
  organizationId: string,
  matchReviewIds: string[],
  decision: "confirmed" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<number>> {
  if (!organizationId || !matchReviewIds.length || !decision || !reviewerId) {
    return fail("Organization ID, match IDs, decision, and reviewer ID are required");
  }

  try {
    let count = 0;
    for (const id of matchReviewIds) {
      const result = await reviewFalsePositive(organizationId, id, decision, reviewNotes, reviewerId);
      if (result.success) count++;
    }

    logAdvisor("batch_false_positive_review", {
      organizationId,
      requestedCount: matchReviewIds.length,
      completedCount: count,
      decision,
      reviewerId,
    });

    return ok(count);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("batch_false_positive_review_failed", { organizationId, error: message });
    return fail(message);
  }
}
