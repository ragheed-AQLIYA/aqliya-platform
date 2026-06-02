import "server-only";

import { prisma } from "@/lib/prisma";

/** Read-only L5 lists — no governance.ts / institutional-memory graph. */

export async function listPendingOpportunityReviews(organizationId: string) {
  if (!prisma.salesReview?.findMany) {
    return [];
  }
  return prisma.salesReview
    .findMany({
      where: {
        organizationId,
        status: "pending",
        reviewType: "opportunity_governance",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        deal: {
          select: {
            id: true,
            title: true,
            status: true,
            account: { select: { id: true, name: true } },
          },
        },
      },
    })
    .catch(() => []);
}

export async function listOrgSalesApprovals(organizationId: string) {
  if (!prisma.salesApproval?.findMany) {
    return [];
  }
  return prisma.salesApproval
    .findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        review: {
          select: { id: true, status: true, reason: true, dealId: true },
        },
        deal: {
          select: {
            id: true,
            title: true,
            account: { select: { name: true } },
          },
        },
      },
    })
    .catch(() => []);
}
