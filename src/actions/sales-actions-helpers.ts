"use server";

import { revalidatePath } from "next/cache";
import { isExpectedAccessDeniedError } from "@/lib/kernel";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  SalesAccessError,
} from "@/lib/sales/guards";
import { type ActionResult, safe as _safe, type ErrorCode } from "@/lib/platform/action-result";
import type { SalesOrgScope } from "@/lib/sales/services";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "sales-os", action: "actions-helpers" });

export function mapSalesError(error: unknown): { code: ErrorCode; message: string } | null {
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

export function scopeFromCtx(ctx: Awaited<ReturnType<typeof import("@/lib/sales/guards").requireSalesOrgAccess>>): SalesOrgScope {
  return {
    organizationId: ctx.organizationId,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

export function actorFromCtx(ctx: Awaited<ReturnType<typeof import("@/lib/sales/guards").requireSalesOrgAccess>>) {
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
    logger.warn(
      `Platform audit write failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}
