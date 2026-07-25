"use server";

import { prisma } from "@/lib/prisma";
import {
  safe,
  scopeFromCtx,
  requireSalesPermission,
  SalesAuditActions,
  recordSalesAuditEvent,
} from "./sales-actions/common";

export interface RevenueRow {
  month: string;
  total: number;
  count: number;
  won: number;
  lost: number;
}

export interface PipelineStageRow {
  stage: string;
  count: number;
  totalValue: number;
  avgDealSize: number;
  avgAge: number;
}

export interface ActivityByType {
  type: string;
  count: number;
}

export interface ActivityByUser {
  userId: string;
  userName: string;
  count: number;
}

export interface ActivityReport {
  total: number;
  byType: ActivityByType[];
  byUser: ActivityByUser[];
  conversionRate: number;
}

export type ReportPeriod = "3" | "6" | "12";

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getRevenueReportAction(
  period: ReportPeriod = "12",
): Promise<ReturnType<typeof safe<RevenueRow[]>>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const cutoff = monthsAgo(Number(period));

    const deals = await prisma.salesDeal.findMany({
      where: {
        organizationId: ctx.organizationId,
        createdAt: { gte: cutoff },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const monthMap = new Map<string, RevenueRow>();
    for (let i = 0; i < Number(period); i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = monthLabel(d);
      monthMap.set(key, { month: key, total: 0, count: 0, won: 0, lost: 0 });
    }

    for (const deal of deals) {
      const key = monthLabel(new Date(deal.createdAt));
      const row = monthMap.get(key);
      if (!row) continue;
      row.count++;
      row.total += deal.amount ?? 0;
      if (deal.status === "won") row.won++;
      if (deal.status === "lost") row.lost++;
    }

    const sorted = Array.from(monthMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    await recordSalesAuditEvent({
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      action: SalesAuditActions.REPORTS_VIEWED,
      targetType: "SalesReport",
      targetId: "revenue",
    });

    return sorted;
  });
}

export async function getPipelineReportAction(): Promise<
  ReturnType<typeof safe<PipelineStageRow[]>>
> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");

    const stages = await prisma.salesPipelineStage.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { sortOrder: "asc" },
    });

    const deals = await prisma.salesDeal.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        stageId: true,
        amount: true,
        status: true,
        createdAt: true,
        pipelineStage: true,
      },
    });

    const stageDealMap = new Map<string, typeof deals>();
    for (const deal of deals) {
      const key = deal.stageId ?? deal.pipelineStage ?? "unknown";
      const bucket = stageDealMap.get(key) ?? [];
      bucket.push(deal);
      stageDealMap.set(key, bucket);
    }

    const now = Date.now();
    const rows: PipelineStageRow[] = stages.map((stage) => {
      const stageDeals = stageDealMap.get(stage.id) ?? [];
      const closedDeals = stageDeals.filter(
        (d) => d.status === "won" || d.status === "lost",
      );
      const totalValue = stageDeals.reduce(
        (sum, d) => sum + (d.amount ?? 0),
        0,
      );
      const avgDealSize =
        stageDeals.length > 0
          ? Math.round(totalValue / stageDeals.length)
          : 0;
      const totalAge = stageDeals.reduce(
        (sum, d) => sum + (now - new Date(d.createdAt).getTime()),
        0,
      );
      const avgAge =
        stageDeals.length > 0
          ? Math.round(totalAge / stageDeals.length / 86400000)
          : 0;

      return {
        stage: stage.name,
        count: stageDeals.length,
        totalValue,
        avgDealSize,
        avgAge,
      };
    });

    const unknownDeals = stageDealMap.get("unknown") ?? [];
    if (unknownDeals.length > 0) {
      const totalValue = unknownDeals.reduce(
        (sum, d) => sum + (d.amount ?? 0),
        0,
      );
      const totalAge = unknownDeals.reduce(
        (sum, d) => sum + (now - new Date(d.createdAt).getTime()),
        0,
      );
      rows.push({
        stage: "غير مصنف",
        count: unknownDeals.length,
        totalValue,
        avgDealSize: unknownDeals.length > 0 ? Math.round(totalValue / unknownDeals.length) : 0,
        avgAge: unknownDeals.length > 0 ? Math.round(totalAge / unknownDeals.length / 86400000) : 0,
      });
    }

    await recordSalesAuditEvent({
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      action: SalesAuditActions.REPORTS_VIEWED,
      targetType: "SalesReport",
      targetId: "pipeline",
    });

    return rows;
  });
}

export async function getActivityReportAction(
  period: ReportPeriod = "12",
  type?: string,
): Promise<ReturnType<typeof safe<ActivityReport>>> {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const cutoff = monthsAgo(Number(period));

    const where: Record<string, unknown> = {
      organizationId: ctx.organizationId,
      occurredAt: { gte: cutoff },
    };
    if (type) where.type = type;

    const interactions = await prisma.salesInteraction.findMany({
      where,
      select: {
        type: true,
        createdById: true,
      },
    });

    const total = interactions.length;

    const typeCount = new Map<string, number>();
    const userCount = new Map<string, { name: string; count: number }>();
    for (const ix of interactions) {
      typeCount.set(ix.type, (typeCount.get(ix.type) ?? 0) + 1);
      const uid = ix.createdById ?? "unknown";
      const existing = userCount.get(uid) ?? { name: uid, count: 0 };
      existing.count++;
      userCount.set(uid, existing);
    }

    const byType: ActivityByType[] = Array.from(typeCount.entries())
      .map(([t, c]) => ({ type: t, count: c }))
      .sort((a, b) => b.count - a.count);

    const byUser: ActivityByUser[] = Array.from(userCount.entries())
      .map(([uid, info]) => ({
        userId: uid,
        userName: info.name === uid ? uid : info.name,
        count: info.count,
      }))
      .sort((a, b) => b.count - a.count);

    const totalDeals = await prisma.salesDeal.count({
      where: { organizationId: ctx.organizationId },
    });
    const conversionRate =
      totalDeals > 0
        ? Math.round((interactions.length / totalDeals) * 100)
        : 0;

    await recordSalesAuditEvent({
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      action: SalesAuditActions.REPORTS_VIEWED,
      targetType: "SalesReport",
      targetId: "activity",
    });

    return { total, byType, byUser, conversionRate };
  });
}
