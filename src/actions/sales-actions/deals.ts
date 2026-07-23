"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  logPlatformAudit,
  requireSalesPermission,
  assertSalesDealAccess,
  SalesAccessError,
  SalesAuditActions,
  listSalesDeals,
  getSalesDeal,
  createSalesDeal,
  updateSalesDeal,
  updateDealNextAction,
  listSalesDealAuditEvents,
  invalidateCacheByPrefix,
  type CreateSalesDealInput,
  type UpdateSalesDealInput,
} from "./common";

export async function listSalesDealsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return listSalesDeals(ctx.organizationId);
  });
}

export async function getSalesDealAction(dealId: string) {
  return safe(async () => {
    const access = await assertSalesDealAccess(dealId);
    const full = await getSalesDeal(access.dealId, access.organizationId);
    if (!full) {
      throw new SalesAccessError("Deal not found", "NOT_FOUND");
    }
    return full;
  });
}

export async function createSalesDealAction(input: CreateSalesDealInput) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const user = ctx.user;
    const deal = await createSalesDeal(ctx.organizationId, input, {
      id: user.id,
      name: user.name,
      platformOrganizationId: ctx.platformOrganizationId,
    });
    await logPlatformAudit({
      user,
      platformOrganizationId: ctx.platformOrganizationId,
      action: SalesAuditActions.DEAL_CREATED,
      targetType: "SalesDeal",
      targetId: deal.id,
    });
    revalidateSales({ dealId: deal.id, accountId: deal.accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);

    // Auto-score lead after deal creation (fire-and-forget)
    import("@/actions/sales-intel-actions")
      .then((m) => m.scoreDealLeadsAction(deal.id))
      .catch(() => {});

    return deal;
  });
}

export async function updateSalesDealAction(
  dealId: string,
  input: UpdateSalesDealInput,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const user = ctx.user;
    await assertSalesDealAccess(dealId);
    const deal = await updateSalesDeal(dealId, ctx.organizationId, input, {
      id: user.id,
      name: user.name,
      platformOrganizationId: ctx.platformOrganizationId,
    });
    revalidateSales({ dealId: deal.id, accountId: deal.accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return deal;
  });
}

export async function updateDealNextActionAction(
  dealId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const nextAction = String(formData.get("nextAction") ?? "").trim() || null;
    const nextActionAtRaw = String(formData.get("nextActionAt") ?? "").trim();
    const nextActionAt = nextActionAtRaw ? new Date(nextActionAtRaw) : null;
    const result = await updateDealNextAction(
      dealId,
      scopeFromCtx(ctx),
      { nextAction, nextActionAt },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return result;
  });
}

export async function listSalesDealAuditEventsAction(dealId: string) {
  return safe(async () => {
    const access = await assertSalesDealAccess(dealId);
    return listSalesDealAuditEvents(access.dealId, access.organizationId);
  });
}

export async function createOpportunityFromAccountAction(
  accountId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const valueRaw = formData.get("valueEstimate");
  const amount =
    valueRaw != null && String(valueRaw).trim() !== ""
      ? Number(valueRaw)
      : null;
  return createSalesDealAction({
    title: name,
    accountId,
    amount: Number.isFinite(amount) ? amount : null,
  });
}
