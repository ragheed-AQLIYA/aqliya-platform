"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  requireSalesPermission,
  assertSalesAccountAccess,
  SalesAccessError,
  SalesAuditActions,
  recordSalesAuditEvent,
  listSalesAccounts,
  getSalesAccount,
  createSalesAccount,
  updateSalesAccount,
  invalidateCacheByPrefix,
} from "./common";

export async function listSalesAccountsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesAccounts(ctx.organizationId);
  });
}

export async function getSalesAccountAction(accountId: string) {
  return safe(async () => {
    const access = await assertSalesAccountAccess(accountId);
    const full = await getSalesAccount(access.accountId, access.organizationId);
    if (!full) {
      throw new SalesAccessError("Account not found", "NOT_FOUND");
    }
    await recordSalesAuditEvent({
      organizationId: access.organizationId,
      platformOrganizationId: access.platformOrganizationId,
      actorId: access.user.id,
      actorName: access.user.name,
      action: SalesAuditActions.ACCOUNT_VIEWED,
      targetType: "SalesAccount",
      targetId: access.accountId,
    });
    return full;
  });
}

export async function createSalesAccountAction(formData: FormData) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const name = String(formData.get("name") ?? "").trim();
    const industry = String(formData.get("industry") ?? "").trim() || null;
    const account = await createSalesAccount(
      scopeFromCtx(ctx),
      { name, industry },
      actorFromCtx(ctx),
    );
    revalidateSales({ accountId: account.id });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);

    // Auto-enrich: fire-and-forget in background after account creation
    import("@/actions/sales-intel-actions/auto-enrich")
      .then((m) => m.autoEnrichAccount(account.id, name, ctx.organizationId))
      .catch(() => { /* enrichment is best-effort */ });

    return account;
  });
}

export async function updateSalesAccountAction(
  accountId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesAccountAccess(accountId);
    const name = formData.has("name")
      ? String(formData.get("name") ?? "").trim()
      : undefined;
    const industry = formData.has("industry")
      ? String(formData.get("industry") ?? "").trim() || null
      : undefined;
    const account = await updateSalesAccount(
      accountId,
      scopeFromCtx(ctx),
      { name, industry },
      actorFromCtx(ctx),
    );
    revalidateSales({ accountId: account.id });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return account;
  });
}

/** Legacy alias used by sales workspace inline server actions */
export const createAccountAction = createSalesAccountAction;

export async function recalculateAccountIcpScoreAction(accountId: string) {
  const { recalculateAccountIcpFitAction } = await import("../sales-icp-actions");
  return recalculateAccountIcpFitAction(accountId);
}

export async function setAccountIcpReviewedAction(
  accountId: string,
  reviewed: boolean,
) {
  const mod = await import("../sales-icp-actions");
  return mod.setAccountIcpReviewedAction(accountId, reviewed);
}

export async function generateAccountResearchAction(accountId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesAccountAccess(accountId);
    const { runAccountResearchStub } = await import(
      "@/lib/sales/agents/account-research"
    );
    const result = await runAccountResearchStub(
      { scope: scopeFromCtx(ctx), actor: actorFromCtx(ctx) },
      accountId,
    );
    revalidateSales({ accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return result;
  });
}

export async function markAccountResearchReviewedAction(
  accountId: string,
  reviewed: boolean,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesAccountAccess(accountId);
    const { markAccountResearchReviewed } = await import(
      "@/lib/sales/agents/account-research"
    );
    if (!reviewed) {
      const account = await getSalesAccount(accountId, ctx.organizationId);
      if (!account) {
        throw new SalesAccessError("Account not found", "NOT_FOUND");
      }
      return account;
    }
    const account = await markAccountResearchReviewed(
      { scope: scopeFromCtx(ctx), actor: actorFromCtx(ctx) },
      accountId,
    );
    revalidateSales({ accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return account;
  });
}
