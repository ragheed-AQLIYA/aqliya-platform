import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SalesActor, SalesOrgScope } from "../services";
import type { SalesApprovalKind, SalesApprovalStatus } from "../l5-types";
import { getSalesReview } from "./reviews";
import { orgWhere, withPlatformOrg } from "./org-scope";

export async function createSalesApproval(
  scope: SalesOrgScope,
  input: {
    reviewId: string;
    kind: SalesApprovalKind;
    status: SalesApprovalStatus;
    note?: string | null;
    proposalId?: string | null;
    dealId?: string | null;
    metadata?: Record<string, unknown>;
  },
  actor: SalesActor,
) {
  const review = await getSalesReview(input.reviewId, scope);
  if (!review) {
    throw new Error("SalesOS: review not found");
  }

  return prisma.salesApproval.create({
    data: withPlatformOrg(scope, {
      organizationId: scope.organizationId,
      reviewId: input.reviewId,
      kind: input.kind,
      status: input.status,
      approverId: actor.id,
      approverName: actor.name ?? null,
      note: input.note?.trim() || null,
      proposalId: input.proposalId ?? review.proposalId ?? null,
      dealId: input.dealId ?? review.dealId ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    }),
  });
}

export async function listSalesApprovalsForDeal(
  scope: SalesOrgScope,
  dealId: string,
) {
  return prisma.salesApproval.findMany({
    where: { dealId, ...orgWhere(scope) },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPendingApprovalQueue(scope: SalesOrgScope, limit = 50) {
  return prisma.salesReview.findMany({
    where: { ...orgWhere(scope), status: "pending" },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      deal: { select: { id: true, title: true } },
      approvals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}
