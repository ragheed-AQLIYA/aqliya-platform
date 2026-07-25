"use server";

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma";
import {
  isExpectedAccessDeniedError,
  getCurrentUser,
} from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import {
  buildRecommendationDiff,
  getDiffSummary,
} from "@/lib/recommendation/recommendation-diff";
import {
  buildTimeline,
} from "@/lib/decision/decision-timeline";
import { getDecisionAuditLogs } from "@/lib/decision/decision-audit";

const logger = createLogger({ product: "platform", action: "approval" });

export async function getApprovalStatus(decisionId: string) {
  try {
    const user = await getCurrentUser();

    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

    const [decision, evidenceStats, auditLogs] = await Promise.all([
      prisma.decision.findUnique({
        where: { id: decisionId },
        include: {
          approvals: {
            include: { approver: true, recommendation: true },
            orderBy: { createdAt: "desc" },
          },
          recommendation: true,
          // [MIGRATED] auditLogs include → separate PlatformAuditLog query (productKey: "decision_os")
          // auditLogs: {
          //   include: { user: true },
          //   orderBy: { createdAt: "desc" },
          // },
        },
      }),
      prisma.decisionEvidence.aggregate({
        where: { decisionId },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      getDecisionAuditLogs(decisionId, { orderBy: "desc" }),
    ]);

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const latestApproval = decision.approvals[0];
    const reviewActions = auditLogs.filter(
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
      logger.error("Error fetching approval status:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch approval status" };
  }
}

export async function getRecommendationDiff(decisionId: string) {
  try {
    const user = await getCurrentUser();

    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

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
      logger.error("Error fetching recommendation diff:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch recommendation diff" };
  }
}

export async function getDecisionTimeline(decisionId: string) {
  try {
    const user = await getCurrentUser();

    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        recommendation: true,
        approvals: {
          include: { approver: true },
          orderBy: { createdAt: "asc" },
        },
        // [MIGRATED] auditLogs include → separate PlatformAuditLog query (productKey: "decision_os")
        // auditLogs: {
        //   include: { user: true },
        //   orderBy: { createdAt: "asc" },
        // },
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    // [MIGRATED] Fetch audit logs from PlatformAuditLog
    const auditLogs = await getDecisionAuditLogs(decisionId, { orderBy: "asc" });

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
      auditLogs: auditLogs.map((l) => ({
        action: l.action,
        createdAt: l.createdAt,
        userName: l.user?.name ?? undefined,
        after: l.after ?? undefined,
      })),
    });

    return { success: true, data: timeline };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error fetching decision timeline:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch decision timeline" };
  }
}
