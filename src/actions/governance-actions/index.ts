"use server";

import "server-only";

import { getCachedOrFetch, DASHBOARD_CACHE_TTL_MS } from "@/lib/platform/cache-strategy";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { daysBetween, isOverdue, type GovernanceDashboard } from "./common";
import { fetchDecisionItems } from "./decisions";
import { fetchWorkflowItems } from "./workflows";
import { fetchLocalContentReviewItems } from "./localcontent";
import { fetchSalesReviewItems } from "./sales";
import { fetchRiskAssessmentItems } from "./risk";
import { fetchAuditFindingItems } from "./audit";

export type { GovernanceItem, GovernanceDashboard } from "./common";

export async function getGovernanceDashboardAction(offset?: number): Promise<GovernanceDashboard> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }

  const cacheKey = `dashboard:governance:${user.organizationId}:items`;
  return await getCachedOrFetch(cacheKey, async () => {
    const now = new Date();
    const PAGE_SIZE = 50;
    const skip = offset || 0;

    const [decisionItems, workflowItems, lcItems, salesItems, riskItems, auditItems] = await Promise.all([
      fetchDecisionItems(skip, PAGE_SIZE),
      fetchWorkflowItems(skip, PAGE_SIZE),
      fetchLocalContentReviewItems(skip, PAGE_SIZE),
      fetchSalesReviewItems(skip, PAGE_SIZE),
      fetchRiskAssessmentItems(skip, PAGE_SIZE),
      fetchAuditFindingItems(skip, PAGE_SIZE),
    ]);

    const items = [
      ...decisionItems,
      ...workflowItems,
      ...lcItems,
      ...salesItems,
      ...riskItems,
      ...auditItems,
    ];

    const totalPending = items.length;
    const criticalItems = items.filter(isOverdue);
    const criticalCount = criticalItems.length;

    const byProduct: Record<string, number> = {};
    for (const item of items) {
      byProduct[item.productLabel] = (byProduct[item.productLabel] ?? 0) + 1;
    }

    const totalAgeDays = items.reduce((sum, item) => sum + daysBetween(item.createdAt, now), 0);
    const averageAge = items.length > 0 ? Math.round(totalAgeDays / items.length) : 0;

    return { items, stats: { totalPending, criticalCount, byProduct, averageAge } };
  }, DASHBOARD_CACHE_TTL_MS);
}
