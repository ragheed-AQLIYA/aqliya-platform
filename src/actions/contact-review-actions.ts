"use server";

import { createLogger } from "@/lib/observability/logger";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentUser, isExpectedAccessDeniedError } from "@/lib/auth";
import { enforce } from "@/lib/kernel";


const logger = createLogger({ product: "platform", action: "unknown" });

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("[Contact Review Actions]", error instanceof Error ? error : undefined);
    return { ok: false, error: message };
  }
}

async function logAuditEvent(params: {
  contactId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  actorId: string;
  actorName?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: params.platformOrganizationId,
        clientWorkspaceId: null,
        productKey: "localcontactos",
        actorId: params.actorId,
        actorName: params.actorName,
        actorEmail: null,
        action: params.action,
        targetType: "LocalContact",
        targetId: params.contactId,
        targetLabel: null,
        severity: "info",
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    logger.error("[Audit Log Error]", e instanceof Error ? e : undefined);
  }
}

export async function assignReviewer(
  contactId: string,
  reviewerId: string,
  reviewType?: string,
  reason?: string,
  dueDate?: string,
) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "review");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, name: true, organizationId: true },
    });
    if (!reviewer || reviewer.organizationId !== user.organizationId) {
      throw new Error("Reviewer not found or access denied");
    }

    const review = await prisma.contactReview.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        contactId,
        reviewType: reviewType ?? "sensitivity",
        status: "pending",
        reviewerId,
        reviewerName: reviewer.name,
        reason: reason || null,
        reviewDueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "reviewerAssigned",
      details: `Reviewer ${reviewer.name} assigned by ${user.name} for ${reviewType ?? "sensitivity"} review`,
      metadata: { reviewId: review.id, reviewerId, reviewType: reviewType ?? "sensitivity" },
    });

    revalidatePath(`/contacts/${contactId}`);
    return review;
  });
}

export async function completeReview(reviewId: string, notes?: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: reviewId, tenantId: user.organizationId }, "update");
    const review = await prisma.contactReview.findUnique({
      where: { id: reviewId },
      select: { id: true, organizationId: true, contactId: true, reviewerId: true, status: true },
    });
    if (!review || review.organizationId !== user.organizationId) {
      throw new Error("Review not found or access denied");
    }
    if (review.status !== "pending") {
      throw new Error("Review is already completed");
    }

    const updated = await prisma.contactReview.update({
      where: { id: reviewId },
      data: {
        status: "approved",
        reviewerNotes: notes || null,
        completedAt: new Date(),
      },
    });

    await logAuditEvent({
      contactId: review.contactId,
      organizationId: user.organizationId,
      actorId: user.id,
      actorName: user.name,
      action: "reviewCompleted",
      details: `Review completed by ${user.name}`,
      metadata: { reviewId: review.id, notes },
    });

    revalidatePath(`/contacts/${review.contactId}`);
    return updated;
  });
}

export async function getReviewStatus(contactId: string, offset?: number) {
  return safe(async () => {
    const user = await getCurrentUser();
    const where = { organizationId: user.organizationId, contactId };
    const PAGE_SIZE = 50;
    const skip = offset || 0;
    const [reviews, totalCount] = await Promise.all([
      prisma.contactReview.findMany({
        where,
        include: { approvals: true },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.contactReview.count({ where }),
    ]);

    const allCount = totalCount;
    const pendingCount = reviews.filter((r) => r.status === "pending").length;
    const approvedCount = reviews.filter((r) => r.status === "approved").length;
    const rejectedCount = reviews.filter((r) => r.status === "rejected").length;
    const changesRequestedCount = reviews.filter((r) => r.status === "changes_requested").length;
    const overdueCount = reviews.filter(
      (r) => r.status === "pending" && r.reviewDueDate && r.reviewDueDate < new Date(),
    ).length;

    return {
      total: allCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      changesRequested: changesRequestedCount,
      overdue: overdueCount,
      reviews,
      hasMore: skip + PAGE_SIZE < totalCount,
    };
  });
}

export async function listReviewers(organizationId: string, offset?: number) {
  return safe(async () => {
    const user = await getCurrentUser();
    if (user.organizationId !== organizationId) {
      throw new Error("Access denied");
    }

    const PAGE_SIZE = 50;
    const skip = offset || 0;
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId, role: { in: ["ADMIN", "OPERATOR"] } },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.user.count({ where: { organizationId, role: { in: ["ADMIN", "OPERATOR"] } } }),
    ]);
    return { users, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
  });
}
