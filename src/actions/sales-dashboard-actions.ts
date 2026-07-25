"use server";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import { getSalesDashboardStats } from "@/lib/sales/services";
import { getCachedOrFetch, DASHBOARD_CACHE_TTL_MS } from "@/lib/platform/cache-strategy";
import {
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import { createLogger } from "@/lib/observability/logger";

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
    const logger = createLogger({ product: "salesos", action: "safe" });
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("SalesOS dashboard action failed", error as Error);
    logger.error("[SalesOS Dashboard Action]", error instanceof Error ? error : undefined);
    return { ok: false, error: message };
  }
}

export async function getSalesDashboardStatsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const cacheKey = `dashboard:sales:${ctx.organizationId}:stats`;
    try {
      return await getCachedOrFetch(
        cacheKey,
        async () => getSalesDashboardStats(ctx.organizationId),
        DASHBOARD_CACHE_TTL_MS,
      );
    } catch {
      throw new Error(
        "SalesOS tables unavailable \u2014 apply migration salesos_p0_core and seed",
      );
    }
  });
}