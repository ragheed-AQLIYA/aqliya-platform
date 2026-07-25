"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  lookupDecisionOrg,
  handleError,
  logAudit,
  ok,
  fail
} from "./common";

export async function publishRecommendationAction(
  decisionId: string,
  forcePublishCurrent?: boolean,
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await lookupDecisionOrg(decisionId);
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
    const existing = await prisma.recommendation.findUnique({
      where: { decisionId },
    });

    if (!existing) {
      return fail("Recommendation not found");
    }

    const latestApproval = await prisma.approval.findFirst({
      where: { decisionId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });

    const hasImmutableSnapshot = !!(
      latestApproval?.snapshotAction && latestApproval?.snapshotRationale
    );

    if (hasImmutableSnapshot && latestApproval) {
      const snapshotDiffers =
        latestApproval.snapshotAction !== existing.recommendedAction ||
        latestApproval.snapshotRationale !== existing.rationale;

      if (snapshotDiffers && !forcePublishCurrent) {
        await logAudit(
          user.id,
          decisionId,
          "STALE_PUBLISH_BLOCKED",
          "Recommendation",
          JSON.stringify({ currentVersion: existing.publishedVersion }),
          JSON.stringify({
            reason: "Current recommendation differs from approved snapshot",
            snapshotAction: latestApproval.snapshotAction,
            currentAction: existing.recommendedAction,
          }),
          decisionLookup.organizationId,
        );

        return {
          success: false as const,
          error:
            "Current recommendation differs from approved snapshot. Publish the approved version or provide forcePublishCurrent override.",
          requiresOverride: true as const,
          snapshotInfo: {
            approvedAction: latestApproval.snapshotAction,
            currentAction: existing.recommendedAction,
            approvedAt: latestApproval.snapshotCreatedAt,
            approver: latestApproval.approverId,
          },
        };
      }

      if (snapshotDiffers && forcePublishCurrent) {
        await logAudit(
          user.id,
          decisionId,
          "STALE_PUBLISH_OVERRIDE",
          "Recommendation",
          JSON.stringify({ snapshotAction: latestApproval.snapshotAction }),
          JSON.stringify({
            publishedCurrentInstead: true,
            currentAction: existing.recommendedAction,
          }),
          decisionLookup.organizationId,
        );

        const recommendation = await prisma.recommendation.update({
          where: { decisionId },
          data: {
            isClientVisible: true,
            publishedAt: new Date(),
            publishedById: user.id,
            publishedVersion: { increment: 1 },
            publishedFromSnapshot: false,
            publishedApprovalId: null,
          },
        });

        await logAudit(
          user.id,
          decisionId,
          "CURRENT_PUBLISHED_WITHOUT_APPROVAL",
          "Recommendation",
          undefined,
          JSON.stringify({
            version: recommendation.publishedVersion,
            fromSnapshot: false,
          }),
          decisionLookup.organizationId,
        );

        return {
          success: true as const,
          data: recommendation,
          publishedFromSnapshot: false as const,
        };
      }

      const recommendation = await prisma.recommendation.update({
        where: { decisionId },
        data: {
          isClientVisible: true,
          publishedAt: new Date(),
          publishedById: user.id,
          publishedVersion: { increment: 1 },
          publishedFromSnapshot: true,
          publishedApprovalId: latestApproval.id,
        },
      });

      await logAudit(
        user.id,
        decisionId,
        "SNAPSHOT_PUBLISHED",
        "Recommendation",
        undefined,
        JSON.stringify({
          version: recommendation.publishedVersion,
          approvalId: latestApproval.id,
          fromSnapshot: true,
        }),
        decisionLookup.organizationId,
      );

      return {
        success: true as const,
        data: recommendation,
        publishedFromSnapshot: true as const,
      };
    }

    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: true,
        publishedAt: new Date(),
        publishedById: user.id,
        publishedVersion: { increment: 1 },
        publishedFromSnapshot: false,
        publishedApprovalId: null,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "CURRENT_PUBLISHED_WITHOUT_APPROVAL",
      "Recommendation",
      undefined,
      JSON.stringify({
        version: recommendation.publishedVersion,
        fromSnapshot: false,
      }),
      decisionLookup.organizationId,
    );

    return {
      success: true as const,
      data: recommendation,
      publishedFromSnapshot: false as const,
    };
  } catch (error) {
    return handleError(error, "publishing recommendation");
  }
}

export async function unpublishRecommendationAction(decisionId: string) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await lookupDecisionOrg(decisionId);
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: false,
        publishedFromSnapshot: false,
        publishedApprovalId: null,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "OUTPUT_UNPUBLISHED",
      "Recommendation",
      undefined,
      undefined,
      decisionLookup.organizationId,
    );

    return ok(recommendation);
  } catch (error) {
    return handleError(error, "unpublishing recommendation");
  }
}

export async function getPublishedRecommendationViewAction(decisionId: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: {
        id: true,
        title: true,
        type: true,
        organizationId: true,
        recommendation: {
          select: {
            recommendedAction: true,
            rationale: true,
            expectedNextState: true,
            scopeExclusions: true,
            assumptionsUsed: true,
            risksAccepted: true,
            risksRejected: true,
            isClientVisible: true,
            publishedAt: true,
            publishedVersion: true,
            publishedFromSnapshot: true,
            publishedApprovalId: true,
          },
        },
      },
    });

    if (!decision) {
      return fail("Recommendation not available");
    }

    if (decision.organizationId !== user.organizationId) {
      return fail("Recommendation not available");
    }

    if (!decision.recommendation?.isClientVisible) {
      return fail("Recommendation not available");
    }

    let contentSource:
      | "approved_snapshot"
      | "current_recommendation"
      | "legacy" = "current_recommendation";
    let snapshotMetadata = null;

    if (
      decision.recommendation.publishedFromSnapshot &&
      decision.recommendation.publishedApprovalId
    ) {
      const approval = await prisma.approval.findUnique({
        where: { id: decision.recommendation.publishedApprovalId },
        select: {
          snapshotAction: true,
          snapshotRationale: true,
          snapshotExpectedNextState: true,
          snapshotScopeExclusions: true,
          snapshotAssumptionsUsed: true,
          snapshotRisksAccepted: true,
          snapshotRisksRejected: true,
          snapshotConditions: true,
          snapshotConfidence: true,
          snapshotScore: true,
          snapshotCreatedAt: true,
          approver: { select: { name: true } },
        },
      });

      if (approval?.snapshotAction && approval.snapshotRationale) {
        contentSource = "approved_snapshot";
        snapshotMetadata = {
          approvedAt: approval.snapshotCreatedAt,
          approver: approval.approver?.name,
          conditions: approval.snapshotConditions,
          confidence: approval.snapshotConfidence,
          score: approval.snapshotScore,
        };
      }
    } else if (
      decision.recommendation.publishedAt &&
      !decision.recommendation.publishedFromSnapshot
    ) {
      const latestApproval = await prisma.approval.findFirst({
        where: { decisionId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          snapshotAction: true,
          snapshotRationale: true,
          snapshotCreatedAt: true,
          approver: { select: { name: true } },
        },
      });

      if (latestApproval?.snapshotAction && latestApproval.snapshotRationale) {
        const matchesSnapshot =
          latestApproval.snapshotAction ===
            decision.recommendation.recommendedAction &&
          latestApproval.snapshotRationale ===
            decision.recommendation.rationale;

        if (matchesSnapshot) {
          contentSource = "approved_snapshot";
          snapshotMetadata = {
            approvedAt: latestApproval.snapshotCreatedAt,
            approver: latestApproval.approver?.name,
          };
        }
      } else if (latestApproval) {
        contentSource = "legacy";
      }
    }

    return ok({
        id: decision.id,
        title: decision.title,
        recommendation: decision.recommendation,
        decisionType: decision.type,
        currentUserRole: user.role,
        contentSource,
        snapshotMetadata,
      });
  } catch (error) {
    return handleError(error, "fetching published recommendation");
  }
}
