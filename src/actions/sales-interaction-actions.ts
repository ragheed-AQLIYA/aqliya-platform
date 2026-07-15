"use server";

import {
  assertSalesDealAccess,
  assertSalesAccountAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "@/lib/sales/audit-events";
import { safe, scopeFromCtx, actorFromCtx, revalidateSales } from "./sales-actions-helpers";
import { invalidateCacheByPrefix } from "@/lib/kernel";

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

export async function linkDealEvidenceAction(
  dealId: string,
  evidenceIdOrForm: string | FormData,
  label?: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const evidenceId =
      evidenceIdOrForm instanceof FormData
        ? String(evidenceIdOrForm.get("evidenceId") ?? "").trim()
        : String(evidenceIdOrForm ?? "").trim();
    if (!evidenceId) {
      throw new SalesAccessError("Evidence id is required", "VALIDATION");
    }
    const { linkEvidenceToDeal } = await import("@/lib/sales/evidence-links");
    void label;
    const link = await linkEvidenceToDeal(
      scopeFromCtx(ctx),
      { dealId, evidenceId },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return link;
  });
}

export async function unlinkDealEvidenceAction(dealId: string, linkId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { unlinkEvidenceFromDeal } = await import("@/lib/sales/evidence-links");
    await unlinkEvidenceFromDeal(
      scopeFromCtx(ctx),
      { dealId, linkId },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return { dealId, linkId };
  });
}

export async function listDealEvidenceLinksAction(dealId: string) {
  return safe(async () => {
    const access = await assertSalesDealAccess(dealId);
    const { listEvidenceLinksForDeal } = await import("@/lib/sales/evidence-links");
    return listEvidenceLinksForDeal(scopeFromCtx(access), dealId);
  });
}

export async function createSalesInteractionAction(formData: FormData) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const { createSalesInteraction } = await import("@/lib/sales/interactions");
    const accountId = String(formData.get("accountId") ?? "");
    const dealId = String(formData.get("dealId") ?? "").trim() || undefined;
    const type = String(formData.get("type") ?? "note");
    const subject = String(formData.get("subject") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim() || undefined;
    const interaction = await createSalesInteraction(
      scopeFromCtx(ctx),
      {
        accountId,
        dealId,
        type: type as "note",
        subject,
        summary,
        occurredAt: new Date(),
      },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId, accountId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return interaction;
  });
}

export async function updateSalesInteractionAction(
  interactionId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { updateSalesInteraction } = await import("@/lib/sales/interactions");
    const subject = formData.has("subject")
      ? String(formData.get("subject") ?? "").trim()
      : undefined;
    const summary = formData.has("summary")
      ? String(formData.get("summary") ?? "").trim()
      : undefined;
    const interaction = await updateSalesInteraction(
      interactionId,
      scopeFromCtx(ctx),
      { subject, summary },
      actorFromCtx(ctx),
    );
    revalidateSales({
      dealId: interaction.dealId ?? undefined,
      accountId: interaction.accountId,
    });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return interaction;
  });
}

export async function deleteSalesInteractionAction(interactionId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { deleteSalesInteraction } = await import("@/lib/sales/interactions");
    const interaction = await deleteSalesInteraction(
      interactionId,
      scopeFromCtx(ctx),
      actorFromCtx(ctx),
    );
    revalidateSales({
      dealId: interaction.dealId ?? undefined,
      accountId: interaction.accountId,
    });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return interaction;
  });
}
