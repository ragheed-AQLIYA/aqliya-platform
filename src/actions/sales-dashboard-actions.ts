"use server";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import { getSalesDashboardStats } from "@/lib/sales/services";
import {
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";

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
    console.error("[SalesOS Dashboard Action]", message);
    return { ok: false, error: message };
  }
}

export async function getSalesDashboardStatsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    try {
      return await getSalesDashboardStats(ctx.organizationId);
    } catch {
      throw new Error(
        "SalesOS tables unavailable — apply migration salesos_p0_core and seed",
      );
    }
  });
}
