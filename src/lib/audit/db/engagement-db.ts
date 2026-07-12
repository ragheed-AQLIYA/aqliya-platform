import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Engagement,
  DashboardSummary,
  WorkflowStatus,
} from "@/types/audit";
import {
  toEngagement,
  toAuditEvent,
  emptyDashboardSummary,
  protectedAuditReadUnavailable,
} from "./types";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import { getPublicationPackage } from "./publication-db";
import type { PresentationProfile } from "@/lib/audit/presentation/presentation-profile";

export async function getDashboardSummary(
  organizationId?: string,
): Promise<DashboardSummary> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const [engagements, events, findings, evidence, _mappings] =
      await Promise.all([
        prisma.auditEngagement.findMany({
          where: orgFilter,
          include: { client: true },
        }),
        prisma.auditEvent.findMany({
          where: organizationId ? { engagement: { organizationId } } : {},
          orderBy: { timestamp: "desc" },
          take: 5,
        }),
        prisma.auditFinding.findMany({
          where: {
            status: { not: "resolved" },
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditEvidence.findMany({
          where: {
            state: "missing",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditAccountMapping.findMany({
          where: {
            status: "pending",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
      ]);
    if (engagements.length === 0) {
      return emptyDashboardSummary();
    }
    const activeEngagements = engagements.filter(
      (e) => e.status !== "archived" && e.status !== "published",
    ).length;
    const pendingReviews = engagements.filter(
      (e) => e.status === "under_review" || e.status === "awaiting_client",
    ).length;
    const readyForApproval = engagements.filter(
      (e) => e.status === "ready_for_approval",
    ).length;
    const publishedCount = engagements.filter(
      (e) => e.status === "published",
    ).length;
    return {
      totalEngagements: engagements.length,
      activeEngagements,
      pendingReviews,
      openFindings: findings.length,
      missingEvidence: evidence.length,
      readyForApproval,
      publishedCount,
      recentActivity: events.map(toAuditEvent),
      engagements: engagements.map(toEngagement),
    };
  } catch (error) {
    protectedAuditReadUnavailable("getDashboardSummary", error);
  }
}

export async function getEngagements(
  organizationId?: string,
): Promise<Engagement[]> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const engagements = await prisma.auditEngagement.findMany({
      where: orgFilter,
      include: { client: true },
    });
    if (engagements.length === 0) return [];
    return engagements.map(toEngagement);
  } catch (error) {
    protectedAuditReadUnavailable("getEngagements", error);
  }
}

export async function getEngagement(
  organizationId: string | undefined,
  id: string,
): Promise<Engagement | null> {
  try {
    const where: Record<string, unknown> = { id };
    if (organizationId)
      (where as Record<string, unknown>).organizationId = organizationId;
    const engagement = await prisma.auditEngagement.findUnique({
      where: where as { id: string },
      include: { client: true },
    });
    if (!engagement) return null;
    return toEngagement(engagement);
  } catch (error) {
    protectedAuditReadUnavailable(`getEngagement(${id})`, error);
  }
}

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
    const statusMap: Record<string, string[]> = {
      draft: ["setup"],
      setup: ["in_progress"],
      in_progress: ["under_review", "awaiting_client"],
      under_review: ["ready_for_approval", "awaiting_client"],
      awaiting_client: ["in_progress", "under_review"],
      ready_for_approval: ["approved"],
      approved: ["published"],
      published: [],
      archived: [],
    };
    return {
      currentState: engagement.status as WorkflowStatus["currentState"],
      availableTransitions: statusMap[engagement.status] ?? [],
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

    // 1. Accounts mapped
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

    // 2. Evidence collected
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

    // 3. Review comments resolved
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

    // 4. No high/critical unresolved findings
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

    // 5. Engagement status eligible
    const eligibleStatuses = [
      "in_progress",
      "under_review",
      "ready_for_approval",
    ];
    const statusPassed =
      engagement !== null && eligibleStatuses.includes(engagement.status);
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
      console.error(
        `[AuditDB] factory approval gates failed for ${engagementId}`,
        gateErr,
      );
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
      console.error(
        `[AuditDB] reconciliation approval gates failed for ${engagementId}`,
        reconGateErr,
      );
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

export async function getCanonicalAccounts(
  limit?: number,
): Promise<Array<{ id: string; code: string; name: string }>> {
  try {
    const accounts = await prisma.auditCanonicalAccount.findMany({
      orderBy: { displayOrder: "asc" },
      take: limit ?? 100,
    });
    return accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }));
  } catch (error) {
    console.warn(
      "[AuditDB] getCanonicalAccounts error, returning empty",
      error,
    );
    return [];
  }
}

// ─── Write Operations ───

export async function createClient(data: {
  organizationId: string;
  name: string;
  industry: string;
  reportingFramework?: string;
  currencyCode?: string;
}): Promise<import("@/types/audit").Client> {
  const { toClient } = await import("./types");
  const client = await prisma.auditClient.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      industry: data.industry,
      reportingFramework: data.reportingFramework ?? "ifrs_for_smes",
      currencyCode: data.currencyCode ?? "SAR",
      fiscalPeriodEnd: "12-31",
    },
  });
  return toClient(client);
}

export async function createEngagement(data: {
  organizationId: string;
  clientId: string;
  fiscalPeriod: string;
  engagementType: string;
  team?: Array<Record<string, unknown>>;
  status?: string;
  presentationProfile?: string;
  presentationProfileVersion?: string;
  presentationPolicyId?: string;
}): Promise<Engagement> {
  const { toEngagement: toE } = await import("./types");
  const { policyIdForProfile } = await import(
    "@/lib/audit/presentation/presentation-policy-resolver"
  );
  const profile = data.presentationProfile ?? "generic";
  const engagement = await prisma.auditEngagement.create({
    data: {
      organizationId: data.organizationId,
      clientId: data.clientId,
      fiscalPeriod: data.fiscalPeriod,
      engagementType: data.engagementType as Prisma.AuditEngagementCreateInput["engagementType"],
      status: data.status ?? "setup",
      team: (data.team ?? []) as unknown as Prisma.InputJsonValue,
      presentationProfile: profile,
      presentationProfileVersion:
        data.presentationProfileVersion ?? "generic-v1",
      presentationPolicyId:
        data.presentationPolicyId ?? policyIdForProfile(profile as PresentationProfile),
    },
    include: { client: true },
  });
  return toE(engagement as unknown as Parameters<typeof toE>[0]);
}

export async function updateEngagementPresentationProfile(
  engagementId: string,
  params: {
    presentationProfile: string;
    presentationProfileVersion: string;
    presentationPolicyId: string;
  },
): Promise<Engagement> {
  const { toEngagement: toE } = await import("./types");
  const engagement = await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: {
      presentationProfile: params.presentationProfile,
      presentationProfileVersion: params.presentationProfileVersion,
      presentationPolicyId: params.presentationPolicyId,
    },
    include: { client: true, presentationPolicy: true },
  });

  return toE(engagement as unknown as Parameters<typeof toE>[0]);
}

export async function updateEngagementStatus(
  id: string,
  status: string,
): Promise<void> {
  await prisma.auditEngagement.update({ where: { id }, data: { status } });
}

export async function publishEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<{ package: import("@/types/audit").PublicationPackage | null }> {
  try {
    let pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (!pkg) {
      pkg = await prisma.auditPublicationPackage.create({
        data: { engagementId, status: "published" },
      });
    }
    if (pkg.status === "published" || pkg.status === "locked") {
      throw new Error("Engagement is already published or locked");
    }
    const now = new Date();
    await prisma.auditPublicationPackage.update({
      where: { id: pkg.id },
      data: {
        status: "published",
        publishedAt: now,
        publishedBy: actorId,
        lockedAt: now,
      },
    });
    const safeStatuses = [
      "approved",
      "in_progress",
      "under_review",
      "ready_for_approval",
    ];
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { status: true },
    });
    if (engagement && safeStatuses.includes(engagement.status)) {
      await prisma.auditEngagement.update({
        where: { id: engagementId },
        data: { status: "published" },
      });
    }
    await recordAuditOsAuditEvent({
      engagementId,
      eventType: "publication.published",
      actorId,
      actorName,
      actorRole: "partner",
      targetType: "publication_package",
      targetId: pkg.id,
      newState: "published",
      description: `Engagement published by ${actorName}`,
    });
    const result = await getPublicationPackage(engagementId);
    return { package: result };
  } catch (error) {
    console.warn(`[AuditDB] publishEngagement(${engagementId}) error`, error);
    throw error;
  }
}

export async function archiveEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status === "archived")
    throw new Error("Engagement is already archived");

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: "archived" },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.archived",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: engagement.status,
    newState: "archived",
    description: `Engagement archived by ${actorName}`,
  });
}

export async function restoreEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<string> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status !== "archived")
    throw new Error("Engagement is not archived");

  const lastArchive = await prisma.auditEvent.findFirst({
    where: { engagementId, eventType: "engagement.archived" },
    orderBy: { timestamp: "desc" },
    select: { previousState: true },
  });
  const restoreStatus =
    lastArchive?.previousState &&
    lastArchive.previousState !== "archived"
      ? lastArchive.previousState
      : "published";

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: restoreStatus },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.restored",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: "archived",
    newState: restoreStatus,
    description: `Engagement restored by ${actorName}`,
  });
  return restoreStatus;
}
