"use server";

import { revalidatePath } from "next/cache";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import { SalesAuditActions } from "@/lib/sales/audit-events";
import {
  assertSalesAccountAccess,
  requireSalesOrgAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

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
    console.error("[SalesOS ICP Action]", message);
    return { ok: false, error: message };
  }
}

function scopeFromCtx(ctx: Awaited<ReturnType<typeof requireSalesOrgAccess>>) {
  return {
    organizationId: ctx.organizationId,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

function revalidateAccount(accountId: string) {
  revalidatePath("/sales");
  revalidatePath("/sales/accounts");
  revalidatePath(`/sales/accounts/${accountId}`);
}

export async function recalculateAccountIcpFitAction(accountId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const user = ctx.user;
    await assertSalesAccountAccess(accountId);

    const { recalculateAccountIcpFit } = await import(
      "@/lib/sales/agents/icp-fit-agent"
    );
    const { account, result } = await recalculateAccountIcpFit(
      accountId,
      scopeFromCtx(ctx),
      { id: user.id, name: user.name },
    );

    await auditLogger({
      productKey: Product.SALES_OS,
      organization: {
        platformOrganizationId: user.platformOrganizationId,
      },
      actor: { id: user.id, name: user.name, type: "user", email: user.email },
    }).record(SalesAuditActions.AGENT_ICP_SCORED, {
      type: "SalesAccount",
      id: accountId,
      label: account.name,
    });

    revalidateAccount(accountId);
    return {
      account,
      fitScore: result.score.fitScore,
      confidence: result.confidence,
    };
  });
}

export async function setAccountIcpReviewedAction(
  accountId: string,
  reviewed: boolean,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const user = ctx.user;
    await assertSalesAccountAccess(accountId);

    const { setAccountIcpReviewed } = await import(
      "@/lib/sales/agents/icp-fit-agent"
    );
    const account = await setAccountIcpReviewed(
      accountId,
      scopeFromCtx(ctx),
      { id: user.id, name: user.name },
      reviewed,
    );

    revalidateAccount(accountId);
    return account;
  });
}
