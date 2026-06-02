"use server";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import { listPendingReviewDrafts } from "@/lib/sales/outreach";
import { listPendingOpportunityReviews } from "@/lib/sales/l5-governance-list";
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
    console.error("[SalesOS Review List Action]", message);
    return { ok: false, error: message };
  }
}

function scopeFromCtx(ctx: Awaited<ReturnType<typeof requireSalesPermission>>) {
  return {
    organizationId: ctx.organizationId,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

export async function listPendingOpportunityReviewsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listPendingOpportunityReviews(ctx.organizationId);
  });
}

export async function listPendingReviewDraftsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listPendingReviewDrafts(scopeFromCtx(ctx));
  });
}
