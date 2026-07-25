"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  requireSalesPermission,
  assertSalesDealAccess,
  assertSalesAccountAccess,
  SalesAccessError,
  getSalesAccount,
  invalidateCacheByPrefix,
} from "./common";

export async function recalculateDealRiskAction(dealId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { recalculateDealRisk } = await import("@/lib/sales/agents/deal-risk");
    const result = await recalculateDealRisk(
      dealId,
      scopeFromCtx(ctx),
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return result;
  });
}

export async function analyzeDealObjectionAction(
  dealId: string,
  input: { interactionId?: string | null; pastedText?: string | null },
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    await assertSalesDealAccess(dealId);
    const { runObjectionAnalysisStub } = await import(
      "@/lib/sales/agents/objection-analysis"
    );
    return runObjectionAnalysisStub(
      { scope: scopeFromCtx(ctx), actor: actorFromCtx(ctx) },
      dealId,
      input,
    );
  });
}

export async function draftFollowUpAction(dealId: string, interactionId?: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { draftFollowUpStub } = await import("@/lib/sales/agents/follow-up");
    const draft = await draftFollowUpStub(
      scopeFromCtx(ctx),
      dealId,
      { interactionId },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    return draft;
  });
}

export async function approveFollowUpDraftAction(
  dealId: string,
  draftId: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { approveFollowUpDraft } = await import("@/lib/sales/agents/follow-up");
    const draft = await approveFollowUpDraft(
      scopeFromCtx(ctx),
      dealId,
      draftId,
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return draft;
  });
}

export async function rejectFollowUpDraftAction(
  dealId: string,
  draftId: string,
  formData?: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const note = formData ? String(formData.get("note") ?? "").trim() || undefined : undefined;
    const { rejectFollowUpDraft } = await import("@/lib/sales/agents/follow-up");
    const draft = await rejectFollowUpDraft(
      scopeFromCtx(ctx),
      dealId,
      draftId,
      actorFromCtx(ctx),
      note,
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return draft;
  });
}

export async function dismissSalesNbaActionAction(
  organizationId: string,
  actionId: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    if (ctx.organizationId !== organizationId) {
      throw new SalesAccessError("Organization mismatch", "FORBIDDEN");
    }
    return { actionId, disposition: "dismissed" as const };
  });
}

export async function snoozeSalesNbaActionAction(
  organizationId: string,
  actionId: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    if (ctx.organizationId !== organizationId) {
      throw new SalesAccessError("Organization mismatch", "FORBIDDEN");
    }
    const { snoozeUntilFromPreset } = await import("@/lib/sales/nba-ui-filter");
    return {
      actionId,
      disposition: "snoozed" as const,
      snoozedUntil: snoozeUntilFromPreset("1w"),
    };
  });
}

export async function upsertConversionMemoAction(
  dealId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { upsertConversionMemo } = await import("@/lib/sales/conversion-memo");
    const draft = String(formData.get("draft") ?? "").trim();
    const pilotCriteria = String(formData.get("pilotCriteria") ?? "").trim();
    const memo = await upsertConversionMemo(
      scopeFromCtx(ctx),
      dealId,
      { draft, pilotCriteria },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return memo;
  });
}

export async function submitConversionMemoAction(dealId: string, markDecided?: boolean) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { submitConversionMemo } = await import("@/lib/sales/conversion-memo");
    const memo = await submitConversionMemo(
      scopeFromCtx(ctx),
      dealId,
      { markDecided: markDecided ?? false },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return memo;
  });
}

export async function getSalesFounderReportAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { getSalesFounderReport } = await import("@/lib/sales/reporting");
    const report = await getSalesFounderReport(ctx.organizationId);
    const { SalesAuditActions, recordSalesAuditEvent } = await import("./common");
    await recordSalesAuditEvent({
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      action: SalesAuditActions.REPORTS_VIEWED,
      targetType: "SalesReport",
      targetId: "founder",
    });
    return report;
  });
}

export async function createOutreachDraftAction(
  dealId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const { createOutreachDraft } = await import("@/lib/sales/outreach");
    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const draft = await createOutreachDraft(
      scopeFromCtx(ctx),
      dealId,
      { subject, body },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return draft;
  });
}

export async function submitOutreachDraftAction(dealId: string, draftId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { submitOutreachDraftForReview } = await import("@/lib/sales/outreach");
    const draft = await submitOutreachDraftForReview(
      scopeFromCtx(ctx),
      dealId,
      draftId,
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return draft;
  });
}

export async function reviewOutreachDraftAction(
  dealId: string,
  draftId: string,
  decision: "approved" | "rejected",
  note?: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { reviewOutreachDraft } = await import("@/lib/sales/outreach");
    const draft = await reviewOutreachDraft(
      scopeFromCtx(ctx),
      dealId,
      draftId,
      { decision, reviewNote: note },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return draft;
  });
}
