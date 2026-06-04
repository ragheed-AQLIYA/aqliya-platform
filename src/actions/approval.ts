"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  isExpectedAccessDeniedError,
  requireDecisionAccess,
  getCurrentUser,
} from "@/lib/auth";
import {
  buildRecommendationDiff,
  getDiffSummary,
  type RecommendationDiff,
} from "@/lib/recommendation/recommendation-diff";
import {
  buildTimeline,
  type TimelineEvent,
} from "@/lib/decision/decision-timeline";
import { logAudit } from "@/lib/platform-audit";
import { notifyOnEvent } from "@/lib/platform/notification/integration";

function buildSnapshotData(
  recommendation: {
    id: string;
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    humanReviewRequired: boolean;
    confidence?: number | null;
    score?: number | null;
    risks?: unknown;
    nextActions?: unknown;
  } | null,
  overrideReason?: string,
) {
  if (!recommendation) {
    return {
      recommendationId: null,
      snapshotAction: null,
      snapshotRationale: null,
      snapshotExpectedNextState: null,
      snapshotScopeExclusions: null,
      snapshotAssumptionsUsed: null,
      snapshotRisksAccepted: null,
      snapshotRisksRejected: null,
      snapshotConditions: null,
      snapshotRisks: Prisma.JsonNull,
      snapshotNextActions: Prisma.JsonNull,
      snapshotConfidence: null,
      snapshotScore: null,
      snapshotOverrideReason: overrideReason || null,
      snapshotCreatedAt: new Date(),
    };
  }
  return {
    recommendationId: recommendation.id,
    snapshotAction: recommendation.recommendedAction,
    snapshotRationale: recommendation.rationale,
    snapshotExpectedNextState: recommendation.expectedNextState,
    snapshotScopeExclusions: recommendation.scopeExclusions,
    snapshotAssumptionsUsed: recommendation.assumptionsUsed,
    snapshotRisksAccepted: recommendation.risksAccepted,
    snapshotRisksRejected: recommendation.risksRejected,
    snapshotConditions: null,
    snapshotRisks: recommendation.risks
      ? (recommendation.risks as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    snapshotNextActions: recommendation.nextActions
      ? (recommendation.nextActions as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    snapshotConfidence: recommendation.confidence || null,
    snapshotScore: recommendation.score || null,
    snapshotOverrideReason: overrideReason || null,
    snapshotCreatedAt: new Date(),
  };
}

export async function submitForReview(decisionId: string) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "OPERATOR");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "DRAFT") {
      return {
        success: false,
        error: `Decision cannot be submitted for review in ${decision.status} status`,
      };
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "IN_REVIEW" },
    });

    await logAudit(
      user.id,
      decisionId,
      "SUBMITTED_FOR_REVIEW",
      "Decision",
      JSON.stringify({ status: "DRAFT" }),
      JSON.stringify({ status: "IN_REVIEW" }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_review", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_for_review",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          decisionType: decision.type,
          requestedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error submitting for review:", error);
    }
    return { success: false, error: "Failed to submit for review" };
  }
}

export async function approveDecision(
  decisionId: string,
  notes?: string,
  overrideReason?: string,
) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "ADMIN");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Decision cannot be approved in ${decision.status} status`,
      };
    }

    if (!decision.recommendation && !overrideReason) {
      return {
        success: false,
        error:
          "Recommendation is required before approval. Provide an override reason to approve without recommendation.",
      };
    }

    const snapshot = buildSnapshotData(decision.recommendation, overrideReason);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "APPROVED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "APPROVED",
        comments: notes || "Approved without conditions",
        ...snapshot,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_APPROVED",
      "Decision",
      JSON.stringify({
        status: "IN_REVIEW",
        recommendationId: decision.recommendation?.id,
      }),
      JSON.stringify({
        status: "APPROVED",
        notes,
        snapshotCreatedAt: snapshot.snapshotCreatedAt,
        overrideReason: snapshot.snapshotOverrideReason,
      }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_approval", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_approved",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          approvedBy: user.name ?? "System",
          approvedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status, snapshot } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error approving decision:", error);
    }
    return { success: false, error: "Failed to approve decision" };
  }
}

export async function approveWithConditions(
  decisionId: string,
  conditions: string,
  overrideReason?: string,
) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "ADMIN");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Decision cannot be approved in ${decision.status} status`,
      };
    }

    if (!conditions || conditions.trim().length === 0) {
      return {
        success: false,
        error: "Conditions are required for conditional approval",
      };
    }

    if (!decision.recommendation && !overrideReason) {
      return {
        success: false,
        error:
          "Recommendation is required before approval. Provide an override reason to approve without recommendation.",
      };
    }

    const snapshot = buildSnapshotData(decision.recommendation, overrideReason);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "APPROVED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "APPROVED",
        comments: `Approved with conditions: ${conditions}`,
        ...snapshot,
        snapshotConditions: conditions,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_APPROVED_WITH_CONDITIONS",
      "Decision",
      JSON.stringify({
        status: "IN_REVIEW",
        recommendationId: decision.recommendation?.id,
      }),
      JSON.stringify({
        status: "APPROVED",
        conditions,
        snapshotCreatedAt: snapshot.snapshotCreatedAt,
        overrideReason: snapshot.snapshotOverrideReason,
      }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_approval", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_approved",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          approvedBy: user.name ?? "System",
          approvedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status, snapshot } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error approving with conditions:", error);
    }
    return { success: false, error: "Failed to approve with conditions" };
  }
}

export async function rejectDecision(decisionId: string, reason: string) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "ADMIN");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Decision cannot be rejected in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Rejection reason is required" };
    }

    const snapshot = buildSnapshotData(decision.recommendation);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "REJECTED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "REJECTED",
        comments: reason,
        ...snapshot,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_REJECTED",
      "Decision",
      JSON.stringify({ status: "IN_REVIEW" }),
      JSON.stringify({ status: "REJECTED", reason }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_rejection", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_rejected",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          reason: reason,
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error rejecting decision:", error);
    }
    return { success: false, error: "Failed to reject decision" };
  }
}

export async function requestRevision(decisionId: string, reason: string) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "ADMIN");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Revision cannot be requested in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Revision reason is required" };
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "DRAFT" },
    });

    await logAudit(
      user.id,
      decisionId,
      "REVISION_REQUESTED",
      "Decision",
      JSON.stringify({ status: "IN_REVIEW" }),
      JSON.stringify({ status: "DRAFT", reason }),
      user.organizationId,
    );

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error requesting revision:", error);
    }
    return { success: false, error: "Failed to request revision" };
  }
}

export async function getApprovalStatus(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER");

    const [decision, evidenceStats] = await Promise.all([
      prisma.decision.findUnique({
        where: { id: decisionId },
        include: {
          approvals: {
            include: { approver: true, recommendation: true },
            orderBy: { createdAt: "desc" },
          },
          recommendation: true,
          auditLogs: {
            include: { user: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.decisionEvidence.aggregate({
        where: { decisionId },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
    ]);

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const latestApproval = decision.approvals[0];
    const reviewActions = decision.auditLogs.filter(
      (log) =>
        log.action === "SUBMITTED_FOR_REVIEW" ||
        log.action === "DECISION_APPROVED" ||
        log.action === "DECISION_APPROVED_WITH_CONDITIONS" ||
        log.action === "DECISION_REJECTED" ||
        log.action === "REVISION_REQUESTED",
    );

    let approvedSnapshot = null;
    let recommendationDiffers = false;
    let isLegacySnapshot = false;

    if (latestApproval) {
      const hasImmutableSnapshot = !!(
        latestApproval.snapshotAction && latestApproval.snapshotRationale
      );

      if (hasImmutableSnapshot) {
        approvedSnapshot = {
          recommendationId: latestApproval.recommendationId,
          recommendedAction: latestApproval.snapshotAction,
          rationale: latestApproval.snapshotRationale,
          expectedNextState: latestApproval.snapshotExpectedNextState,
          scopeExclusions: latestApproval.snapshotScopeExclusions,
          assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
          risksAccepted: latestApproval.snapshotRisksAccepted,
          risksRejected: latestApproval.snapshotRisksRejected,
          conditions: latestApproval.snapshotConditions,
          risks: latestApproval.snapshotRisks,
          nextActions: latestApproval.snapshotNextActions,
          confidence: latestApproval.snapshotConfidence,
          score: latestApproval.snapshotScore,
          overrideReason: latestApproval.snapshotOverrideReason,
          approvedAt:
            latestApproval.snapshotCreatedAt || latestApproval.createdAt,
          approver: latestApproval.approver?.name,
          isImmutable: true,
        };
      } else if (latestApproval.recommendation) {
        approvedSnapshot = {
          recommendationId: latestApproval.recommendation.id,
          recommendedAction: latestApproval.recommendation.recommendedAction,
          rationale: latestApproval.recommendation.rationale,
          expectedNextState: latestApproval.recommendation.expectedNextState,
          scopeExclusions: latestApproval.recommendation.scopeExclusions,
          assumptionsUsed: latestApproval.recommendation.assumptionsUsed,
          risksAccepted: latestApproval.recommendation.risksAccepted,
          risksRejected: latestApproval.recommendation.risksRejected,
          conditions: null,
          risks: null,
          nextActions: null,
          confidence: null,
          score: null,
          overrideReason: null,
          approvedAt: latestApproval.createdAt,
          approver: latestApproval.approver?.name,
          isImmutable: false,
        };
        isLegacySnapshot = true;
      }

      if (approvedSnapshot && decision.recommendation) {
        recommendationDiffers =
          approvedSnapshot.recommendedAction !==
            decision.recommendation.recommendedAction ||
          approvedSnapshot.rationale !== decision.recommendation.rationale;
      }
    }

    return {
      success: true,
      data: {
        status: decision.status,
        approvals: decision.approvals,
        latestApproval: latestApproval
          ? {
              status: latestApproval.status,
              approver: latestApproval.approver?.name,
              comments: latestApproval.comments,
              createdAt: latestApproval.createdAt,
              recommendationId: latestApproval.recommendation?.id,
              isLegacySnapshot,
            }
          : null,
        approvedSnapshot,
        recommendationDiffers,
        isLegacySnapshot,
        reviewActions: reviewActions.map((log) => ({
          action: log.action,
          user: log.user?.name,
          createdAt: log.createdAt,
          details: log.after ? JSON.parse(log.after) : null,
        })),
        evidenceCount: evidenceStats._count._all,
        latestEvidenceAt: evidenceStats._max.createdAt,
        hasRecommendation: !!decision.recommendation,
        recommendationSummary: decision.recommendation
          ? {
              id: decision.recommendation.id,
              action: decision.recommendation.recommendedAction,
              rationale: decision.recommendation.rationale,
              humanReviewRequired: decision.recommendation.humanReviewRequired,
              isClientVisible: decision.recommendation.isClientVisible,
              publishedFromSnapshot:
                decision.recommendation.publishedFromSnapshot,
              updatedAt: decision.recommendation.updatedAt,
            }
          : null,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching approval status:", error);
    }
    return { success: false, error: "Failed to fetch approval status" };
  }
}

export async function getRecommendationDiff(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        approvals: {
          include: { approver: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        recommendation: true,
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const latestApproval = decision.approvals[0];
    if (!latestApproval) {
      return { success: false, error: "No approval found" };
    }

    const hasImmutableSnapshot = !!(
      latestApproval.snapshotAction && latestApproval.snapshotRationale
    );
    if (!hasImmutableSnapshot) {
      return {
        success: false,
        error: "No immutable snapshot available for diff",
      };
    }

    if (!decision.recommendation) {
      return { success: false, error: "No current recommendation to compare" };
    }

    const approvedSnapshot: Record<string, unknown> = {
      recommendedAction: latestApproval.snapshotAction,
      rationale: latestApproval.snapshotRationale,
      expectedNextState: latestApproval.snapshotExpectedNextState,
      scopeExclusions: latestApproval.snapshotScopeExclusions,
      assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
      risksAccepted: latestApproval.snapshotRisksAccepted,
      risksRejected: latestApproval.snapshotRisksRejected,
      conditions: latestApproval.snapshotConditions,
      confidence: latestApproval.snapshotConfidence,
      score: latestApproval.snapshotScore,
      risks: latestApproval.snapshotRisks,
      nextActions: latestApproval.snapshotNextActions,
    };

    const currentRecommendation: Record<string, unknown> = {
      recommendedAction: decision.recommendation.recommendedAction,
      rationale: decision.recommendation.rationale,
      expectedNextState: decision.recommendation.expectedNextState,
      scopeExclusions: decision.recommendation.scopeExclusions,
      assumptionsUsed: decision.recommendation.assumptionsUsed,
      risksAccepted: decision.recommendation.risksAccepted,
      risksRejected: decision.recommendation.risksRejected,
      conditions: null,
      confidence: null,
      score: null,
      risks: null,
      nextActions: null,
    };

    const diff = buildRecommendationDiff(
      approvedSnapshot,
      currentRecommendation,
    );
    const summary = getDiffSummary(diff);

    return {
      success: true,
      data: {
        diff,
        summary,
        approvedAt:
          latestApproval.snapshotCreatedAt || latestApproval.createdAt,
        approver: latestApproval.approver?.name,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching recommendation diff:", error);
    }
    return { success: false, error: "Failed to fetch recommendation diff" };
  }
}

export async function requestReReview(decisionId: string, reason: string) {
  try {
    const { user } = await requireDecisionAccess(decisionId, "ADMIN");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.status !== "APPROVED" && decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Re-review cannot be requested in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Re-review reason is required" };
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "DRAFT" },
    });

    await logAudit(
      user.id,
      decisionId,
      "REVISION_REQUESTED",
      "Decision",
      JSON.stringify({
        status: decision.status,
        reason: "re-review due to recommendation change",
      }),
      JSON.stringify({ status: "DRAFT", reason: reason.trim() }),
      user.organizationId,
    );

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error requesting re-review:", error);
    }
    return { success: false, error: "Failed to request re-review" };
  }
}

export async function getDecisionTimeline(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        recommendation: true,
        approvals: {
          include: { approver: true },
          orderBy: { createdAt: "asc" },
        },
        auditLogs: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const timeline = buildTimeline({
      decisionCreatedAt: decision.createdAt,
      decisionUpdatedAt: decision.updatedAt ?? undefined,
      recommendationCreatedAt: decision.recommendation?.createdAt,
      recommendationUpdatedAt: decision.recommendation?.updatedAt,
      recommendationPublishedAt:
        decision.recommendation?.publishedAt ?? undefined,
      approvals: decision.approvals.map((a) => ({
        status: a.status,
        createdAt: a.createdAt,
        approverName: a.approver?.name,
        comments: a.comments ?? undefined,
        conditions: a.snapshotConditions ?? undefined,
        snapshotCreatedAt: a.snapshotCreatedAt ?? undefined,
        overrideReason: a.snapshotOverrideReason ?? undefined,
      })),
      auditLogs: decision.auditLogs.map((l) => ({
        action: l.action,
        createdAt: l.createdAt,
        userName: l.user?.name,
        after: l.after ?? undefined,
      })),
    });

    return { success: true, data: timeline };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decision timeline:", error);
    }
    return { success: false, error: "Failed to fetch decision timeline" };
  }
}
