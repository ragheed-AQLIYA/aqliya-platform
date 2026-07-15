"use server";

import {
  assertSalesDealAccess,
  requireSalesPermission,
} from "@/lib/sales/guards";
import {
  recordReviewDecision,
  type ReviewDecision,
} from "@/lib/sales/governance";
import { safe, scopeFromCtx, actorFromCtx, revalidateSales } from "./sales-actions-helpers";
import { invalidateCacheByPrefix } from "@/lib/kernel";

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
    const { recordSalesAuditEvent, SalesAuditActions } = await import("@/lib/sales/audit-events");
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

export async function recordSalesReviewDecisionAction(
  dealId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const decision = String(formData.get("decision") ?? "pending") as ReviewDecision;
    const reason = String(formData.get("reason") ?? "").trim();
    const stageSlug = String(formData.get("stageSlug") ?? "").trim() || null;
    const record = await recordReviewDecision(scopeFromCtx(ctx), {
      dealId,
      decision,
      actor: actorFromCtx(ctx),
      reason,
      stageSlug,
    });
    revalidateSales({ dealId });
    await invalidateCacheByPrefix(`dashboard:sales:${ctx.organizationId}:stats`);
    return record;
  });
}

export async function listPendingOpportunityReviewsAction() {
  const mod = await import("./sales-review-list-actions");
  return mod.listPendingOpportunityReviewsAction();
}

export async function listPendingReviewDraftsAction() {
  const mod = await import("./sales-review-list-actions");
  return mod.listPendingReviewDraftsAction();
}

export async function listOrgSalesApprovalsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { listOrgSalesApprovals } = await import("@/lib/sales/l5-governance-list");
    return listOrgSalesApprovals(ctx.organizationId);
  });
}
