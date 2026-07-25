"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  requireSalesPermission,
  invalidateCacheByPrefix,
} from "./common";

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
