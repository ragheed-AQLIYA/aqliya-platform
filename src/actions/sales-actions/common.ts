import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/observability/logger";
import { isExpectedAccessDeniedError, getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  assertSalesAccountAccess,
  assertSalesDealAccess,
  requireSalesOrgAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "@/lib/sales/audit-events";
import {
  recordReviewDecision,
  type ReviewDecision,
} from "@/lib/sales/governance";
import {
  createSalesDeal,
  createSalesAccount,
  updateSalesAccount,
  getSalesAccount,
  getSalesDashboardStats,
  getSalesDeal,
  listSalesAccounts,
  listSalesDeals,
  listSalesPipelineStages,
  listSalesDealAuditEvents,
  updateSalesDeal,
  updateDealNextAction,
  type SalesOrgScope,
} from "@/lib/sales/services";
import type {
  CreateSalesDealInput,
  UpdateSalesDealInput,
} from "@/lib/sales/validation";
import {
  approveOpportunity,
  linkOpportunityEvidence,
  submitOpportunityForReview,
} from "@/lib/sales/service";
import { type ActionResult, safe as _safe, ok, fail } from "@/lib/platform/action-result";
import type { ErrorCode } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";

const logger = createLogger({ product: "platform", action: "actions-sales-actions-common" });

export {
  getCurrentUser,
  enforce,
  assertSalesAccountAccess,
  assertSalesDealAccess,
  requireSalesOrgAccess,
  requireSalesPermission,
  SalesAccessError,
  recordSalesAuditEvent,
  SalesAuditActions,
  recordReviewDecision,
  type ReviewDecision,
  createSalesDeal,
  createSalesAccount,
  updateSalesAccount,
  getSalesAccount,
  getSalesDashboardStats,
  getSalesDeal,
  listSalesAccounts,
  listSalesDeals,
  listSalesPipelineStages,
  listSalesDealAuditEvents,
  updateSalesDeal,
  updateDealNextAction,
  type SalesOrgScope,
  type CreateSalesDealInput,
  type UpdateSalesDealInput,
  approveOpportunity,
  linkOpportunityEvidence,
  submitOpportunityForReview,
  type ActionResult,
  ok,
  fail,
  type ErrorCode,
  invalidateCacheByPrefix,
};

function mapSalesError(error: unknown): { code: ErrorCode; message: string } | null {
  if (error instanceof SalesAccessError) {
    return { code: (error.code as ErrorCode) ?? "FORBIDDEN", message: error.message };
  }
  if (isExpectedAccessDeniedError(error)) {
    return { code: "FORBIDDEN", message: "Access denied" };
  }
  return null;
}

export async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return _safe(fn, { mapError: mapSalesError, defaultCode: "INTERNAL_ERROR" });
}

export function scopeFromCtx(ctx: Awaited<ReturnType<typeof requireSalesOrgAccess>>): SalesOrgScope {
  return {
    organizationId: ctx.organizationId,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

export function actorFromCtx(ctx: Awaited<ReturnType<typeof requireSalesOrgAccess>>) {
  return {
    id: ctx.user.id,
    name: ctx.user.name,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

export function revalidateSales(options?: { dealId?: string; accountId?: string }) {
  revalidatePath("/sales");
  revalidatePath("/sales/deals");
  revalidatePath("/sales/accounts");
  revalidatePath("/sales/pipeline");
  revalidatePath("/sales/review");
  revalidatePath("/sales/activities");
  if (options?.dealId) {
    revalidatePath(`/sales/deals/${options.dealId}`);
  }
  if (options?.accountId) {
    revalidatePath(`/sales/accounts/${options.accountId}`);
  }
}

export async function logPlatformAudit(params: {
  user: { id: string; name: string; email: string };
  platformOrganizationId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const alog = auditLogger({
      productKey: Product.SALES_OS,
      sourceSystem: Product.SALES_OS,
      organization: {
        platformOrganizationId: params.platformOrganizationId ?? undefined,
      },
      actor: {
        id: params.user.id,
        name: params.user.name,
        email: params.user.email,
        type: "user",
      },
    });
    await alog.record(
      params.action,
      { type: params.targetType, id: params.targetId },
      { metadata: params.metadata },
    );
  } catch (error) {
    logger.warn(`[SalesOS] Platform audit write failed: ${error instanceof Error ? error.message : "unknown"}`);
  }
}
