"use server";

import {
  safe,
  scopeFromCtx,
  requireSalesPermission,
  listSalesDeals,
  listSalesPipelineStages,
  SalesAuditActions,
  recordSalesAuditEvent,
  type ActionResult,
} from "./sales-actions/common";

export interface StageAnalytics {
  stageId: string | null;
  stageName: string;
  stageSlug: string;
  dealCount: number;
  totalValue: number;
  avgDealSize: number | null;
  wonCount: number;
  lostCount: number;
  winRate: number | null;
}

export interface PipelineAnalyticsData {
  overall: {
    totalDeals: number;
    openDeals: number;
    wonDeals: number;
    lostDeals: number;
    totalPipelineValue: number;
    avgDealSize: number | null;
    winRate: number | null;
    avgDaysOpen: number | null;
    avgWonCycleDays: number | null;
  };
  stageAnalytics: StageAnalytics[];
  conversionRates: { fromStage: string; toStage: string; rate: number | null; fromCount: number; toCount: number }[];
}

export async function getPipelineAnalyticsAction(): Promise<ActionResult<PipelineAnalyticsData>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const deals = await listSalesDeals(ctx.organizationId);
    const stages = await listSalesPipelineStages(ctx.organizationId);

    const wonDeals = deals.filter((d) => d.status === "won");
    const lostDeals = deals.filter((d) => d.status === "lost");
    const openDeals = deals.filter((d) => d.status === "open");

    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const avgDealSize = openDeals.length > 0
      ? Math.round(totalPipelineValue / openDeals.length)
      : null;
    const winRate = (wonDeals.length + lostDeals.length) > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : null;

    const now = Date.now();
    const avgDaysOpen = openDeals.length > 0
      ? Math.round(
          openDeals.reduce((sum, d) => sum + (now - new Date(d.createdAt).getTime()), 0) /
            openDeals.length /
            86400000,
        )
      : null;

    const avgWonCycleDays = wonDeals.length > 0
      ? Math.round(
          wonDeals.reduce(
            (sum, d) => sum + (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()),
            0,
          ) /
            wonDeals.length /
            86400000,
        )
      : null;

    const stageDealMap = new Map<string | null, typeof deals>();
    for (const deal of deals) {
      const key = deal.stageId ?? null;
      const bucket = stageDealMap.get(key) ?? [];
      bucket.push(deal);
      stageDealMap.set(key, bucket);
    }

    const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);

    const stageAnalytics: StageAnalytics[] = sortedStages.map((stage) => {
      const stageDeals = stageDealMap.get(stage.id) ?? [];
      const stageWon = stageDeals.filter((d) => d.status === "won").length;
      const stageLost = stageDeals.filter((d) => d.status === "lost").length;
      const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0);
      return {
        stageId: stage.id,
        stageName: stage.name,
        stageSlug: stage.slug,
        dealCount: stageDeals.length,
        totalValue: stageValue,
        avgDealSize: stageDeals.length > 0 ? Math.round(stageValue / stageDeals.length) : null,
        wonCount: stageWon,
        lostCount: stageLost,
        winRate: stageWon + stageLost > 0 ? Math.round((stageWon / (stageWon + stageLost)) * 100) : null,
      };
    });

    const conversionRates = sortedStages.flatMap((stage, i, arr) => {
      if (i === arr.length - 1) return [];
      const fromDeals = stageDealMap.get(stage.id) ?? [];
      const toDeals = stageDealMap.get(arr[i + 1].id) ?? [];
      return {
        fromStage: stage.name,
        toStage: arr[i + 1].name,
        rate: fromDeals.length > 0 ? Math.round((toDeals.length / fromDeals.length) * 100) : null,
        fromCount: fromDeals.length,
        toCount: toDeals.length,
      };
    });

    await recordSalesAuditEvent({
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      action: SalesAuditActions.REPORTS_VIEWED,
      targetType: "SalesAnalytics",
      targetId: "pipeline",
    });

    return {
      overall: {
        totalDeals: deals.length,
        openDeals: openDeals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        totalPipelineValue,
        avgDealSize,
        winRate,
        avgDaysOpen,
        avgWonCycleDays,
      },
      stageAnalytics,
      conversionRates,
    };
  });
}
