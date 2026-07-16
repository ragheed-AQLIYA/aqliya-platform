import "server-only";

import { prisma } from "@/lib/kernel";
import { Projection } from "@/lib/kernel/cqrs/projection";
import type { ProjectionConfig } from "@/lib/kernel/cqrs/projection";

export interface SalesPipelineReadModel {
  pipelineCount: number;
  totalDeals: number;
  dealsByStage: { stage: string; count: number; totalValue: number }[];
  totalPipelineValue: number;
  weightedValue: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  averageDealSize: number;
  lastComputedAt: string;
}

const SALES_PIPELINE_CONFIG: ProjectionConfig = {
  domain: "sales",
  actions: [
    "deal.created",
    "deal.stage_changed",
    "deal.status_changed",
    "deal.won",
    "deal.lost",
  ],
  rebuildIntervalMs: 60_000,
};

export class SalesPipelineProjection extends Projection<SalesPipelineReadModel> {
  readonly id = "sales-pipeline";
  readonly name = "SalesOS Pipeline";

  protected config = SALES_PIPELINE_CONFIG;

  async compute(organizationId: string): Promise<SalesPipelineReadModel> {
    const deals = await prisma.salesDeal.findMany({
      where: { organizationId },
      include: { stage: { select: { name: true } } },
    });

    const stages = await prisma.salesPipelineStage.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    });

    const pipelineCount = await prisma.salesPipeline.count({
      where: { organizationId },
    });

    const dealsByStageMap = new Map<string, { count: number; totalValue: number }>();
    for (const stage of stages) {
      dealsByStageMap.set(stage.name, { count: 0, totalValue: 0 });
    }

    let totalPipelineValue = 0;
    let weightedValue = 0;
    let openDeals = 0;
    let wonDeals = 0;
    let lostDeals = 0;

    for (const deal of deals) {
      const stageName = deal.stage?.name ?? deal.pipelineStage ?? "unknown";
      const entry = dealsByStageMap.get(stageName) ?? { count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += deal.amount ?? 0;
      dealsByStageMap.set(stageName, entry);

      totalPipelineValue += deal.amount ?? 0;
      weightedValue += (deal.amount ?? 0) * (deal.probability ?? 0) / 100;

      switch (deal.status) {
        case "open":
          openDeals += 1;
          break;
        case "won":
          wonDeals += 1;
          break;
        case "lost":
          lostDeals += 1;
          break;
      }
    }

    const dealsByStage = Array.from(dealsByStageMap.entries()).map(
      ([stage, data]) => ({
        stage,
        count: data.count,
        totalValue: data.totalValue,
      }),
    );

    return {
      pipelineCount,
      totalDeals: deals.length,
      dealsByStage,
      totalPipelineValue,
      weightedValue: Math.round(weightedValue),
      openDeals,
      wonDeals,
      lostDeals,
      averageDealSize:
        deals.length > 0 ? Math.round(totalPipelineValue / deals.length) : 0,
      lastComputedAt: new Date().toISOString(),
    };
  }
}

export async function querySalesPipeline(
  organizationId: string,
): Promise<SalesPipelineReadModel> {
  const projection = new SalesPipelineProjection();
  return projection.compute(organizationId);
}
