"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  requireSalesPermission,
  SalesAuditActions,
  recordSalesAuditEvent,
  listSalesPipelineStages,
  getSalesDashboardStats,
  invalidateCacheByPrefix,
} from "./common";

export async function listSalesPipelineStagesAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const stages = await listSalesPipelineStages(ctx.organizationId);
    const pipelineId = stages[0]?.pipelineId;
    if (pipelineId) {
      await recordSalesAuditEvent({
        organizationId: ctx.organizationId,
        platformOrganizationId: ctx.platformOrganizationId,
        actorId: ctx.user.id,
        actorName: ctx.user.name,
        action: SalesAuditActions.PIPELINE_VIEWED,
        targetType: "SalesPipeline",
        targetId: pipelineId,
      });
    }
    return stages;
  });
}

export async function getSalesDashboardStatsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return getSalesDashboardStats(ctx.organizationId);
  });
}

export async function listOrgSalesActivitiesAction(options?: { limit?: number }) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { listInteractionsForOrganization } = await import(
      "@/lib/sales/interactions"
    );
    return listInteractionsForOrganization(scopeFromCtx(ctx), options);
  });
}

export async function listOrgSalesAuditEventsAction(
  filters?: Parameters<
    typeof import("@/lib/sales/audit-trail").listOrgSalesAuditEvents
  >[1],
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { listOrgSalesAuditEvents } = await import("@/lib/sales/audit-trail");
    return listOrgSalesAuditEvents(ctx.organizationId, filters);
  });
}

export async function listOrgSalesSignalsAction(options?: {
  accountId?: string;
  limit?: number;
}) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { listSignalsForOrganization } = await import("@/lib/sales/signals");
    return listSignalsForOrganization(scopeFromCtx(ctx), options);
  });
}

export async function createSalesSignalAction(formData: FormData) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const { createSalesSignal } = await import("@/lib/sales/signals");
    const accountId = String(formData.get("accountId") ?? "");
    const type = String(formData.get("type") ?? "engagement");
    const title = String(formData.get("title") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim() || undefined;
    const signal = await createSalesSignal(
      scopeFromCtx(ctx),
      { accountId, type: type as "intent", title, summary },
      actorFromCtx(ctx),
    );
    revalidateSales({ accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return signal;
  });
}
