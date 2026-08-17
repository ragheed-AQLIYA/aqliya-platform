"use server";

import {
  assertSalesDealAccess,
  assertSalesAccountAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import { getSalesAccount } from "@/lib/sales/services";
import { safe, scopeFromCtx, actorFromCtx, revalidateSales } from "./sales-actions-helpers";
import { invalidateCacheByPrefix } from "@/lib/kernel";

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
