import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SalesActor, SalesOrgScope } from "../services";
import type { SalesReviewStatus, SalesReviewType } from "../l5-types";
import { orgWhere, withPlatformOrg } from "./org-scope";

export async function createSalesReview(
  scope: SalesOrgScope,
  input: {
    reviewType: SalesReviewType;
    targetType: string;
    targetId: string;
    dealId?: string | null;
    proposalId?: string | null;
    reason: string;
    stageSlug?: string | null;
    status?: SalesReviewStatus;
    metadata?: Record<string, unknown>;
  },
  actor: SalesActor,
) {
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("SalesOS validation: review reason is required");
  }

  return prisma.salesReview.create({
    data: withPlatformOrg(scope, {
      organizationId: scope.organizationId,
      reviewType: input.reviewType,
      targetType: input.targetType,
      targetId: input.targetId,
      dealId: input.dealId ?? null,
      proposalId: input.proposalId ?? null,
      reason,
      stageSlug: input.stageSlug ?? null,
      reviewerId: actor.id,
      reviewerName: actor.name ?? null,
      status: input.status ?? "pending",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    }),
  });
}

export async function getSalesReview(reviewId: string, scope: SalesOrgScope) {
  return prisma.salesReview.findFirst({
    where: { id: reviewId, ...orgWhere(scope) },
    include: {
      deal: { select: { id: true, title: true } },
      proposal: { select: { id: true, title: true, status: true } },
    },
  });
}

export async function listPendingSalesReviews(scope: SalesOrgScope, limit = 50) {
  return prisma.salesReview.findMany({
    where: { ...orgWhere(scope), status: "pending" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      deal: { select: { id: true, title: true, status: true } },
    },
  });
}

export async function listSalesReviewsForDeal(
  scope: SalesOrgScope,
  dealId: string,
) {
  return prisma.salesReview.findMany({
    where: { dealId, ...orgWhere(scope) },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSalesReviewStatus(
  reviewId: string,
  scope: SalesOrgScope,
  status: SalesReviewStatus,
) {
  const existing = await getSalesReview(reviewId, scope);
  if (!existing) {
    throw new Error("SalesOS: review not found");
  }

  return prisma.salesReview.update({
    where: { id: reviewId },
    data: { status },
  });
}
