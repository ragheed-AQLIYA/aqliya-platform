/**
 * Phase 8 — Human Review Workflow.
 *
 * Allows KNOWLEDGE_REVIEWER to approve, reject, or request more evidence
 * for candidate knowledge entries.
 *
 * Approved candidates are ready for promotion.
 * Rejected candidates are recorded with notes.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { emitReviewEvent } from "@/lib/knowledge-review/events";
import { registerAuditHandler } from "@/lib/knowledge-review/audit-handler";
import type { ReviewDecision } from "./types";

// Register the audit handler so every review action writes a PlatformAuditLog.
// Idempotent — safe to call multiple times.
registerAuditHandler();

export type ReviewResult = {
  success: boolean;
  candidateId: string;
  newStatus: string;
  error?: string;
};

/**
 * Apply a review decision to a candidate.
 */
export async function applyReviewDecision(
  decision: ReviewDecision,
): Promise<ReviewResult> {
  const candidate = await prisma.knowledgeCandidate.findUnique({
    where: { id: decision.candidateId },
    select: { id: true, status: true },
  });

  if (!candidate) {
    return {
      success: false,
      candidateId: decision.candidateId,
      newStatus: "UNKNOWN",
      error: "Candidate not found",
    };
  }

  if (candidate.status === "PROMOTED") {
    return {
      success: false,
      candidateId: decision.candidateId,
      newStatus: candidate.status,
      error: "Cannot review a candidate that has already been promoted",
    };
  }

  if (candidate.status === "REJECTED") {
    return {
      success: false,
      candidateId: decision.candidateId,
      newStatus: candidate.status,
      error: "Cannot re-review a rejected candidate. Create a new candidate instead.",
    };
  }

  const newStatus = decision.decision === "APPROVED" ? "APPROVED" : "REJECTED";

  await prisma.knowledgeCandidate.update({
    where: { id: decision.candidateId },
    data: {
      status: newStatus,
      reviewerId: decision.reviewerId,
      reviewedAt: new Date(),
      reviewNotes: decision.notes ?? null,
    },
  });

  // Emit review event
  await emitReviewEvent({
    type: newStatus === "APPROVED" ? "knowledge.candidate.approved" : "knowledge.candidate.rejected",
    candidateId: decision.candidateId,
    actorId: decision.reviewerId,
    timestamp: new Date().toISOString(),
    previousStatus: candidate.status,
    newStatus,
    notes: decision.notes ?? undefined,
  });

  return {
    success: true,
    candidateId: decision.candidateId,
    newStatus,
  };
}

/**
 * Submit a candidate for review (CANDIDATE → UNDER_REVIEW).
 */
export async function submitForReview(
  candidateId: string,
  submitterId: string,
): Promise<ReviewResult> {
  const candidate = await prisma.knowledgeCandidate.findUnique({
    where: { id: candidateId },
    select: { id: true, status: true },
  });

  if (!candidate) {
    return {
      success: false,
      candidateId,
      newStatus: "UNKNOWN",
      error: "Candidate not found",
    };
  }

  if (candidate.status !== "CANDIDATE") {
    return {
      success: false,
      candidateId,
      newStatus: candidate.status,
      error: `Cannot submit candidate in status ${candidate.status} for review`,
    };
  }

  await prisma.knowledgeCandidate.update({
    where: { id: candidateId },
    data: {
      status: "UNDER_REVIEW",
      reviewerId: submitterId,
    },
  });

  // Emit submit event
  await emitReviewEvent({
    type: "knowledge.candidate.submitted",
    candidateId,
    actorId: submitterId,
    timestamp: new Date().toISOString(),
    previousStatus: candidate.status,
    newStatus: "UNDER_REVIEW",
  });

  return {
    success: true,
    candidateId,
    newStatus: "UNDER_REVIEW",
  };
}

/**
 * Get candidates pending review (CANDIDATE or UNDER_REVIEW).
 */
export async function getPendingReviewCandidates(organizationId?: string) {
  const { listCandidates } = await import("./knowledge-candidate-service");

  const [candidates, underReview] = await Promise.all([
    listCandidates({
      status: "CANDIDATE",
      organizationId,
      sortBy: "supportCount",
      sortDir: "desc",
      limit: 100,
    }),
    listCandidates({
      status: "UNDER_REVIEW",
      organizationId,
      sortBy: "createdAt",
      sortDir: "asc",
      limit: 100,
    }),
  ]);

  return {
    pending: candidates.candidates,
    underReview: underReview.candidates,
    totalPending: candidates.total,
    totalUnderReview: underReview.total,
  };
}
