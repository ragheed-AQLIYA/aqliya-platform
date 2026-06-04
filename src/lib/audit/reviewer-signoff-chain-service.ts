import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildReviewerSignoffChain,
  type ReviewerSignoffChainSnapshot,
} from "./reviewer-signoff-chain";

export async function getEngagementReviewerSignoffChain(
  engagementId: string,
): Promise<ReviewerSignoffChainSnapshot> {
  const [engagement, tbCount, stmtCount, openComments, approvals] =
    await Promise.all([
      prisma.auditEngagement.findUnique({
        where: { id: engagementId },
        select: { status: true },
      }),
      prisma.auditTrialBalance.count({ where: { engagementId } }),
      prisma.auditFinancialStatement.count({ where: { engagementId } }),
      prisma.auditReviewComment.count({
        where: { engagementId, status: "open" },
      }),
      prisma.auditApprovalRecord.findMany({
        where: { engagementId },
        orderBy: { createdAt: "asc" },
        select: {
          approverRole: true,
          approverName: true,
          action: true,
          createdAt: true,
        },
      }),
    ]);

  return buildReviewerSignoffChain({
    engagementStatus: engagement?.status ?? "draft",
    hasTrialBalance: tbCount > 0,
    hasStatements: stmtCount > 0,
    openReviewComments: openComments,
    approvalRecords: approvals.map((a) => ({
      approverRole: a.approverRole,
      approverName: a.approverName,
      action: a.action,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
