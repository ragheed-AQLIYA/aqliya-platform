"use server";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  listSalesDeals,
  listSalesAccounts,
} from "@/lib/sales/services";
import {
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "sales-os", action: "read-actions" });

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof SalesAccessError) {
      return { ok: false, error: error.message, code: error.code };
    }
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Read action failed", error instanceof Error ? error : undefined, { message });
    return { ok: false, error: message };
  }
}

/** Thin read actions — services/guards only (no l5-governance / institutional-memory graph). */

export async function listSalesDealsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesDeals(ctx.organizationId);
  });
}

export async function listSalesAccountsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesAccounts(ctx.organizationId);
  });
}

export async function getSalesDashboardDataAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { prisma } = await import("@/lib/prisma");
    const organizationId = ctx.organizationId;

    const [accountCount, dealCount, openDealCount, stagesWithDeals, latestDeals] =
      await Promise.all([
        prisma.salesAccount.count({ where: { organizationId } }),
        prisma.salesDeal.count({ where: { organizationId } }),
        prisma.salesDeal.count({
          where: { organizationId, status: "open" },
        }),
        prisma.salesPipelineStage.findMany({
          where: { organizationId },
          orderBy: { sortOrder: "asc" },
          include: {
            deals: {
              where: { organizationId },
              select: {
                id: true,
                title: true,
                amount: true,
                currency: true,
                status: true,
                account: { select: { name: true } },
              },
              take: 5,
            },
            _count: { select: { deals: true } },
          },
        }),
        prisma.salesDeal.findMany({
          where: { organizationId },
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            account: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    return {
      accountCount,
      dealCount,
      openDealCount,
      dealsByStage: stagesWithDeals.map((stage) => ({
        id: stage.id,
        name: stage.name,
        slug: stage.slug,
        sortOrder: stage.sortOrder,
        _count: { deals: stage._count.deals },
        deals: stage.deals.map((d) => ({
          id: d.id,
          title: d.title,
          amount: d.amount,
          currency: d.currency,
          status: d.status,
          account: { name: d.account.name },
        })),
      })),
      latestDeals: latestDeals.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        updatedAt: d.updatedAt,
        account: { name: d.account.name },
      })),
    };
  });
}
