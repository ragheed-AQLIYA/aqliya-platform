import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import type { WorkflowStatus } from "@/types/audit";
import { protectedAuditReadUnavailable } from "../types";
import {
  statusTransitions,
  eligibleApprovalStatuses,
} from "./common";

const logger = createLogger({ product: "audit", action: "engagement-status" });

export async function getEngagementWorkflowStatus(
  engagementId: string,
): Promise<WorkflowStatus> {
  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
    });
    const [unmappedCount, missingCount, openReviewCount] = await Promise.all([
      prisma.auditAccountMapping.count({
        where: { engagementId, status: "pending" },
      }),
      prisma.auditEvidence.count({ where: { engagementId, state: "missing" } }),
      prisma.auditReviewComment.count({
        where: { engagementId, status: "open" },
      }),
    ]);
    if (!engagement) {
      return {
        currentState: "setup",
        availableTransitions: ["in_progress"],
        blockingIssues: [],
        completionPercentage: 10,
      };
    }

const logger = createLogger({ product: "platform", action: "lib-audit-db-engagement-db-status" });

    const blockingIssues: string[] = [];
    let completionPercentage = 10;
    if (unmappedCount > 0)
      blockingIssues.push(`${unmappedCount} unmapped account(s)`);
    if (missingCount > 0)
      blockingIssues.push(`${missingCount} missing evidence item(s)`);
    if (openReviewCount > 0)
      blockingIssues.push(`${openReviewCount} open review comment(s)`);
    if (engagement.status === "setup") completionPercentage = 15;
    else if (engagement.status === "in_progress") completionPercentage = 45;
    else if (engagement.status === "under_review") completionPercentage = 70;
    else if (engagement.status === "ready_for_approval")
      completionPercentage = 90;
    else if (
      engagement.status === "approved" ||
      engagement.status === "published"
    )
      completionPercentage = 100;
    return {
      currentState: engagement.status as WorkflowStatus["currentState"],
      availableTransitions: statusTransitions[engagement.status] ?? [],
      blockingIssues,
      completionPercentage,
    };
  } catch (error) {
    protectedAuditReadUnavailable(
      `getEngagementWorkflowStatus(${engagementId})`,
      error,
    );
  }
}

export async function getEngagementOrganizationId(
  engagementId: string,
): Promise<string | null> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { organizationId: true },
  });
  return engagement?.organizationId ?? null;
}

export async function getApprovalStatus(engagementId: string): Promise<{
  status: string;
  blockingIssues: readonly string[];
  checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  try {
    const [
      openReviews,
      unmappedCount,
      missingCount,
      rejectedCount,
      highCriticalFindings,
      engagement,
    ] = await Promise.all([
      prisma.auditReviewComment.count({
        where: { engagementId, status: "open" },
      }),
      prisma.auditAccountMapping.count({
        where: { engagementId, status: "pending" },
      }),
      prisma.auditEvidence.count({ where: { engagementId, state: "missing" } }),
      prisma.auditEvidence.count({
        where: { engagementId, state: "rejected" },
      }),
      prisma.auditFinding.count({
        where: {
          engagementId,
          severity: { in: ["high", "critical"] },
          status: { notIn: ["resolved", "dismissed"] },
        },
      }),
      prisma.auditEngagement.findUnique({
        where: { id: engagementId },
        select: { status: true },
      }),
    ]);
    const blockingIssues: string[] = [];
    const checklist: Array<{ label: string; passed: boolean; detail: string }> =
      [];

    const accountsPassed = unmappedCount === 0;
    checklist.push({
      label: "All accounts mapped",
      passed: accountsPassed,
      detail: accountsPassed
        ? "All accounts mapped"
        : `${unmappedCount} account(s) pending mapping`,
    });
    if (!accountsPassed)
      blockingIssues.push(`${unmappedCount} unmapped account(s)`);

    const evidencePassed = missingCount === 0 && rejectedCount === 0;
    checklist.push({
      label: "All evidence collected",
      passed: evidencePassed,
      detail: !evidencePassed
        ? `${missingCount} missing, ${rejectedCount} rejected`
        : "All evidence collected",
    });
    if (missingCount > 0)
      blockingIssues.push(`${missingCount} missing evidence item(s)`);
    if (rejectedCount > 0)
      blockingIssues.push(`${rejectedCount} rejected evidence item(s)`);

    const reviewsPassed = openReviews === 0;
    checklist.push({
      label: "Review comments resolved",
      passed: reviewsPassed,
      detail: reviewsPassed
        ? "All review comments resolved"
        : `${openReviews} open review comment(s)`,
    });
    if (!reviewsPassed)
      blockingIssues.push(`${openReviews} open review comment(s)`);

    const findingsPassed = highCriticalFindings === 0;
    checklist.push({
      label: "No critical unresolved findings",
      passed: findingsPassed,
      detail: findingsPassed
        ? "No high/critical findings"
        : `${highCriticalFindings} high/critical finding(s) unresolved`,
    });
    if (!findingsPassed)
      blockingIssues.push(
        `${highCriticalFindings} high/critical finding(s) unresolved`,
      );

    const statusPassed =
      engagement !== null && eligibleApprovalStatuses.includes(engagement.status);
    checklist.push({
      label: "Engagement ready for approval",
      passed: statusPassed,
      detail: statusPassed
        ? "Status eligible"
        : `Status: ${engagement?.status ?? "unknown"} (requires in_progress/under_review/ready_for_approval)`,
    });
    if (!statusPassed)
      blockingIssues.push(
        `Engagement status (${engagement?.status ?? "unknown"}) not ready for approval`,
      );

    try {
      const { appendFactoryApprovalGates } = await import(
        "@/lib/audit/governance"
      );
      await appendFactoryApprovalGates(engagementId, blockingIssues, checklist);
    } catch (gateErr) {
      logger.error(`[AuditDB] factory approval gates failed for ${engagementId}`, gateErr instanceof Error ? gateErr : new Error(String(gateErr)));
    }

    try {
      const { appendReconciliationApprovalGates } = await import(
        "@/lib/audit/reconciliation/reconciliation-engine"
      );
      await appendReconciliationApprovalGates(
        engagementId,
        blockingIssues,
        checklist,
      );
    } catch (reconGateErr) {
      logger.error(`[AuditDB] reconciliation approval gates failed for ${engagementId}`, reconGateErr instanceof Error ? reconGateErr : new Error(String(reconGateErr)));
    }

    const isReady = blockingIssues.length === 0;
    return {
      status: isReady ? "ready" : "not_ready",
      blockingIssues,
      checklist,
    } as const;
  } catch (error) {
    protectedAuditReadUnavailable(`getApprovalStatus(${engagementId})`, error);
  }
}
