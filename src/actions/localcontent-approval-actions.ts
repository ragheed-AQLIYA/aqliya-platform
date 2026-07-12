"use server";

import { prisma } from "@/lib/prisma";
import {
  listReviews,
  createReview,
  listApprovals,
  createApproval,
  getProjectApprovalRoutingState,
  updateProjectStatus,
} from "@/lib/local-content/services";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  submitReviewSchema,
  submitApprovalSchema,
} from "@/lib/local-content/schemas/review";
import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";
import { type ActionResult } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import {
  safe,
  logToPlatform,
  revalidateLocalContentPaths,
} from "@/actions/localcontent-shared";

// ─── Review Actions ───

export async function submitLocalContentReviewAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createReview>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(submitReviewSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { action, comments } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "review");
    await requirePermission(Permission.REVIEW_APPROVAL, ResourceType.REVIEW);
    const review = await createReview({
      projectId,
      reviewerId: user.id,
      reviewerName: user.name,
      action: action || "submitted",
      comments: comments || undefined,
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.review.submitted",
      targetType: "LocalContentReview",
      targetId: review.id,
      metadata: { action: review.action },
    });

    try {
      const project = await prisma.localContentProject.findUnique({
        where: { id: projectId },
        select: { name: true, organizationId: true },
      });
      if (project) {
        await notifyOnEvent("on_review", project.organizationId, projectId, {
          productKey: "localcontentos",
          templateKey: "localcontent_review_routing",
          recipientId: user.id,
          templateVars: {
            projectName: project.name,
            score: "0",
          },
        });
      }
    } catch {
      // Notification must not block the primary action
    }

    revalidateLocalContentPaths(projectId, [
      "review",
      "approval",
      "audit-trail",
    ]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return review;
  });
}

// ─── Approval Actions ───

export async function submitLocalContentApprovalAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createApproval>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(submitApprovalSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { decision, comments } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "approve");
    await requirePermission(Permission.REVIEW_APPROVAL, ResourceType.REVIEW);
    const approval = await createApproval({
      projectId,
      approverId: user.id,
      approverName: user.name,
      decision,
      comments: comments || undefined,
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.approval.decided",
      targetType: "LocalContentApproval",
      targetId: approval.id,
      metadata: { decision: approval.decision },
    });

    if (approval.decision === "approved" || approval.decision === "rejected") {
      await updateProjectStatus(
        projectId,
        approval.decision === "approved" ? "Approved" : "Rejected",
        { id: user.id, name: user.name },
      );
    }

    revalidateLocalContentPaths(projectId, [
      "approval",
      "review",
      "audit-trail",
    ]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return approval;
  });
}

// ─── Review List Action ───

export async function listLocalContentReviewsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listReviews>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);
    return listReviews(projectId);
  });
}

export async function getLocalContentApprovalRoutingAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectApprovalRoutingState>>>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);
    return getProjectApprovalRoutingState(projectId);
  });
}

// ─── Approval List Action ───

export async function listLocalContentApprovalsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listApprovals>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);
    return listApprovals(projectId);
  });
}
