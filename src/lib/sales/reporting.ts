import { prisma } from "@/lib/prisma";
import {
  buildDueNextActions,
  partitionPipelineDeals,
} from "./services/reporting-helpers";
import {
  icpBandLabelAr,
  readAccountIcpScore,
  type IcpFitBand,
} from "./icp-types";

export type PipelineHealthCounts = {
  open: number;
  won: number;
  lost: number;
  total: number;
};

export type IcpBandCounts = {
  strong: number;
  moderate: number;
  weak: number;
  unknown: number;
  configured: number;
  totalAccounts: number;
};

export type SalesFounderReportSnapshot = {
  generatedAt: Date;
  pipelineHealth: PipelineHealthCounts;
  icpBands: IcpBandCounts;
  dueNextActionsCount: number;
  overdueNextActionsCount: number;
  pendingOutreachReviewsCount: number;
  outreachModuleAvailable: boolean;
  evidenceLinkCount: number;
};

const EMPTY_ICP_BANDS: IcpBandCounts = {
  strong: 0,
  moderate: 0,
  weak: 0,
  unknown: 0,
  configured: 0,
  totalAccounts: 0,
};

export function aggregatePipelineHealth(
  deals: Array<{ status: string }>,
): PipelineHealthCounts {
  const { openDeals, closedDeals } = partitionPipelineDeals(deals);
  const won = closedDeals.filter((deal) => deal.status === "won").length;
  const lost = closedDeals.filter((deal) => deal.status === "lost").length;

  return {
    open: openDeals.length,
    won,
    lost,
    total: deals.length,
  };
}

export function aggregateIcpBands(
  accounts: Array<{ metadata: unknown }>,
): IcpBandCounts {
  const counts: IcpBandCounts = { ...EMPTY_ICP_BANDS, totalAccounts: accounts.length };

  for (const account of accounts) {
    const assessment = readAccountIcpScore(account.metadata);
    if (assessment.configured && assessment.score) {
      counts.configured += 1;
      counts[assessment.score.band] += 1;
    } else {
      counts.unknown += 1;
    }
  }

  return counts;
}

export function countPendingOutreachReviewsInDealMetadata(
  deals: Array<{ metadata: unknown }>,
): number {
  let count = 0;

  for (const deal of deals) {
    if (!deal.metadata || typeof deal.metadata !== "object" || Array.isArray(deal.metadata)) {
      continue;
    }

    const drafts = (deal.metadata as Record<string, unknown>).outreachDrafts;
    if (!Array.isArray(drafts)) continue;

    for (const raw of drafts) {
      if (
        raw &&
        typeof raw === "object" &&
        !Array.isArray(raw) &&
        (raw as Record<string, unknown>).status === "pending_review"
      ) {
        count += 1;
      }
    }
  }

  return count;
}

async function resolveOutreachModuleAvailable(): Promise<boolean> {
  try {
    await import("./outreach");
    return true;
  } catch {
    return false;
  }
}

async function resolvePendingOutreachReviewCount(
  organizationId: string,
  deals: Array<{ metadata: unknown }>,
): Promise<{ count: number; moduleAvailable: boolean }> {
  const moduleAvailable = await resolveOutreachModuleAvailable();

  if (moduleAvailable) {
    try {
      const outreach = await import("./outreach");
      if (typeof outreach.countPendingOutreachReviewDrafts === "function") {
        const count = await outreach.countPendingOutreachReviewDrafts(organizationId);
        return { count, moduleAvailable: true };
      }
      if (typeof outreach.listPendingReviewOutreachDrafts === "function") {
        const drafts = await outreach.listPendingReviewOutreachDrafts(organizationId);
        return {
          count: Array.isArray(drafts) ? drafts.length : 0,
          moduleAvailable: true,
        };
      }
    } catch {
      // Fall through to metadata scan.
    }
  }

  return {
    count: countPendingOutreachReviewsInDealMetadata(deals),
    moduleAvailable,
  };
}

export function icpBandRowsAr(
  bands: IcpBandCounts,
): Array<{ band: IcpFitBand; label: string; count: number }> {
  return (
    [
      { band: "strong" as const, label: icpBandLabelAr("strong"), count: bands.strong },
      { band: "moderate" as const, label: icpBandLabelAr("moderate"), count: bands.moderate },
      { band: "weak" as const, label: icpBandLabelAr("weak"), count: bands.weak },
      { band: "unknown" as const, label: icpBandLabelAr("unknown"), count: bands.unknown },
    ] satisfies Array<{ band: IcpFitBand; label: string; count: number }>
  );
}

export async function getSalesFounderReport(
  organizationId: string,
): Promise<SalesFounderReportSnapshot> {
  const [dealStatuses, accounts, openDealsForNextActions, evidenceLinkCount] =
    await Promise.all([
      prisma.salesDeal.findMany({
        where: { organizationId },
        select: { status: true },
      }),
      prisma.salesAccount.findMany({
        where: { organizationId },
        select: { metadata: true },
      }),
      prisma.salesDeal.findMany({
        where: { organizationId, status: "open" },
        select: {
          id: true,
          title: true,
          metadata: true,
          account: { select: { name: true } },
        },
      }),
      prisma.salesEvidenceLink.count({ where: { organizationId } }),
    ]);

  const dueNextActions = buildDueNextActions(openDealsForNextActions);
  const outreach = await resolvePendingOutreachReviewCount(
    organizationId,
    openDealsForNextActions,
  );

  return {
    generatedAt: new Date(),
    pipelineHealth: aggregatePipelineHealth(dealStatuses),
    icpBands: aggregateIcpBands(accounts),
    dueNextActionsCount: dueNextActions.length,
    overdueNextActionsCount: dueNextActions.filter((item) => item.isOverdue).length,
    pendingOutreachReviewsCount: outreach.count,
    outreachModuleAvailable: outreach.moduleAvailable,
    evidenceLinkCount,
  };
}
