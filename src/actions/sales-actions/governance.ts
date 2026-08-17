"use server";

import {
  safe,
  scopeFromCtx,
  actorFromCtx,
  revalidateSales,
  getCurrentUser,
  enforce,
  requireSalesPermission,
  assertSalesDealAccess,
  SalesAccessError,
  recordReviewDecision,
  type ReviewDecision,
  approveOpportunity,
  linkOpportunityEvidence,
  submitOpportunityForReview,
  getSalesDeal,
  invalidateCacheByPrefix,
} from "./common";

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
  const mod = await import("../sales-review-list-actions");
  return mod.listPendingOpportunityReviewsAction();
}

export async function listPendingReviewDraftsAction() {
  const mod = await import("../sales-review-list-actions");
  return mod.listPendingReviewDraftsAction();
}

export async function listOrgSalesApprovalsAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { listOrgSalesApprovals } = await import("@/lib/sales/l5-governance-list");
    return listOrgSalesApprovals(ctx.organizationId);
  });
}

export async function submitOpportunityReviewAction(opportunityId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "sales" }, "update");
    return submitOpportunityForReview(user, opportunityId);
  });
}

export async function approveOpportunityAction(opportunityId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "sales" }, "admin");
    return approveOpportunity(user, opportunityId);
  });
}

export async function linkEvidenceAction(
  opportunityId: string,
  typeId: string,
  label: string,
) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "sales" }, "update");
    return linkOpportunityEvidence(user, opportunityId, typeId, label);
  });
}

export async function requestClaimReviewAction(opportunityId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(opportunityId);
    const deal = await getSalesDeal(opportunityId, ctx.organizationId);
    if (!deal) {
      throw new SalesAccessError("Deal not found", "NOT_FOUND");
    }
    const { flagCommercialClaimIfNeeded } = await import(
      "@/lib/sales/commercial-claims"
    );
    return flagCommercialClaimIfNeeded({
      scope: scopeFromCtx(ctx),
      actor: actorFromCtx(ctx),
      targetType: "SalesDeal",
      targetId: opportunityId,
      existingMetadata: deal.metadata,
      sourceType: "outreach_draft",
      sourceId: opportunityId,
      text: "AI-assisted commercial claim review requested",
    });
  });
}

export async function submitOpportunityReviewActionPrisma(
  dealId: string,
  reason: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { submitOpportunityForReview } = await import("@/lib/sales/l5-governance");
    return submitOpportunityForReview(
      scopeFromCtx(ctx),
      { dealId, reason },
      actorFromCtx(ctx),
    );
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

export async function scaffoldUploadSalesProofAssetFileAction(input: {
  organizationId: string;
  proofAssetId: string;
  filename: string;
  fileType: string;
  fileDataBase64: string;
}) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    if (ctx.organizationId !== input.organizationId) {
      throw new SalesAccessError("Organization mismatch", "FORBIDDEN");
    }
    const { scaffoldSalesProofFileUpload } = await import(
      "@/lib/sales/proof-file-upload-scaffold"
    );
    const buffer = Buffer.from(input.fileDataBase64, "base64");
    return scaffoldSalesProofFileUpload({
      organizationId: input.organizationId,
      proofAssetId: input.proofAssetId,
      actorId: ctx.user.id,
      filename: input.filename,
      fileType: input.fileType,
      content: buffer,
    });
  });
}
