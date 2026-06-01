"use server";

import { revalidatePath } from "next/cache";
import { isExpectedAccessDeniedError, requireUserContext } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  assertSalesAccountAccess,
  assertSalesDealAccess,
  requireSalesOrgAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "@/lib/sales/audit-events";
import {
  recordReviewDecision,
  type ReviewDecision,
} from "@/lib/sales/governance";
import {
  createSalesDeal,
  createSalesAccount,
  updateSalesAccount,
  getSalesAccount,
  getSalesDashboardStats,
  getSalesDeal,
  listSalesAccounts,
  listSalesDeals,
  listSalesPipelineStages,
  listSalesDealAuditEvents,
  updateSalesDeal,
  updateDealNextAction,
  type SalesOrgScope,
} from "@/lib/sales/services";
import type {
  CreateSalesDealInput,
  UpdateSalesDealInput,
} from "@/lib/sales/validation";
import {
  approveOpportunity,
  createSalesAccount as createInMemoryAccount,
  linkOpportunityEvidence,
  submitOpportunityForReview,
} from "@/lib/sales/service";

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
    console.error("[SalesOS Action]", message);
    return { ok: false, error: message };
  }
}

function scopeFromCtx(ctx: Awaited<ReturnType<typeof requireSalesOrgAccess>>): SalesOrgScope {
  return {
    organizationId: ctx.organizationId,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

function actorFromCtx(ctx: Awaited<ReturnType<typeof requireSalesOrgAccess>>) {
  return {
    id: ctx.user.id,
    name: ctx.user.name,
    platformOrganizationId: ctx.platformOrganizationId,
  };
}

function revalidateSales(options?: { dealId?: string; accountId?: string }) {
  revalidatePath("/sales");
  revalidatePath("/sales/deals");
  revalidatePath("/sales/accounts");
  revalidatePath("/sales/pipeline");
  revalidatePath("/sales/review");
  revalidatePath("/sales/activities");
  if (options?.dealId) {
    revalidatePath(`/sales/deals/${options.dealId}`);
  }
  if (options?.accountId) {
    revalidatePath(`/sales/accounts/${options.accountId}`);
  }
}

async function logPlatformAudit(params: {
  user: { id: string; name: string; email: string };
  platformOrganizationId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const alog = auditLogger({
      productKey: Product.SALES_OS,
      sourceSystem: Product.SALES_OS,
      organization: {
        platformOrganizationId: params.platformOrganizationId ?? undefined,
      },
      actor: {
        id: params.user.id,
        name: params.user.name,
        email: params.user.email,
        type: "user",
      },
    });
    await alog.record(
      params.action,
      { type: params.targetType, id: params.targetId },
      { metadata: params.metadata },
    );
  } catch (error) {
    console.warn(
      `[SalesOS] Platform audit write failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}

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
    const user = await requireUserContext("OPERATOR");
    const ctx = await requireSalesPermission("salesos:create");
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
    return deal;
  });
}

export async function updateSalesDealAction(
  dealId: string,
  input: UpdateSalesDealInput,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const deal = await updateSalesDeal(dealId, ctx.organizationId, input, {
      id: user.id,
      name: user.name,
      platformOrganizationId: ctx.platformOrganizationId,
    });
    revalidateSales({ dealId: deal.id, accountId: deal.accountId });
    return deal;
  });
}

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
    const user = await requireUserContext("OPERATOR");
    const ctx = await requireSalesPermission("salesos:create");
    const name = String(formData.get("name") ?? "").trim();
    const industry = String(formData.get("industry") ?? "").trim() || null;
    const account = await createSalesAccount(
      scopeFromCtx(ctx),
      { name, industry },
      actorFromCtx(ctx),
    );
    revalidateSales({ accountId: account.id });
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
    return account;
  });
}

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

export async function listSalesDealAuditEventsAction(dealId: string) {
  return safe(async () => {
    const access = await assertSalesDealAccess(dealId);
    return listSalesDealAuditEvents(access.dealId, access.organizationId);
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
    return record;
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
    return result;
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
    return signal;
  });
}

export async function linkDealEvidenceAction(
  dealId: string,
  evidenceId: string,
  label?: string,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { linkEvidenceToDeal } = await import("@/lib/sales/evidence-links");
    const link = await linkEvidenceToDeal(
      scopeFromCtx(ctx),
      { dealId, evidenceId },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    return link;
  });
}

export async function unlinkDealEvidenceAction(linkId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.salesEvidenceLink.findFirst({
      where: { id: linkId, organizationId: ctx.organizationId },
      select: { id: true, targetId: true },
    });
    if (!existing?.targetId) {
      throw new SalesAccessError("Evidence link not found", "NOT_FOUND");
    }
    const { unlinkEvidenceFromDeal } = await import("@/lib/sales/evidence-links");
    await unlinkEvidenceFromDeal(
      scopeFromCtx(ctx),
      { dealId: existing.targetId, linkId: existing.id },
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId: existing.targetId });
    return { dealId: existing.targetId, linkId: existing.id };
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
    return interaction;
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
    return memo;
  });
}

export async function submitConversionMemoAction(dealId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { submitConversionMemo } = await import("@/lib/sales/conversion-memo");
    const memo = await submitConversionMemo(
      scopeFromCtx(ctx),
      dealId,
      {},
      actorFromCtx(ctx),
    );
    revalidateSales({ dealId });
    return memo;
  });
}

export async function getSalesFounderReportAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    const { getSalesFounderReport } = await import("@/lib/sales/reporting");
    const report = await getSalesFounderReport(ctx.organizationId);
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
    return draft;
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

export async function recalculateAccountIcpScoreAction(accountId: string) {
  const { recalculateAccountIcpFitAction } = await import("./sales-icp-actions");
  return recalculateAccountIcpFitAction(accountId);
}

export async function setAccountIcpReviewedAction(
  accountId: string,
  reviewed: boolean,
) {
  const mod = await import("./sales-icp-actions");
  return mod.setAccountIcpReviewedAction(accountId, reviewed);
}

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
    return result;
  });
}

export async function analyzeDealObjectionAction(
  dealId: string,
  input: { objectionText: string; category?: string },
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
      { pastedText: input.objectionText },
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
    return account;
  });
}

export async function draftFollowUpAction(dealId: string, formData: FormData) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { draftFollowUpStub } = await import("@/lib/sales/agents/follow-up");
    const interactionId = String(formData.get("interactionId") ?? "").trim() || undefined;
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
    return draft;
  });
}

export async function rejectFollowUpDraftAction(
  dealId: string,
  draftId: string,
  formData: FormData,
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    await assertSalesDealAccess(dealId);
    const { rejectFollowUpDraft } = await import("@/lib/sales/agents/follow-up");
    const note = String(formData.get("note") ?? "").trim() || undefined;
    const draft = await rejectFollowUpDraft(
      scopeFromCtx(ctx),
      dealId,
      draftId,
      actorFromCtx(ctx),
      note,
    );
    revalidateSales({ dealId });
    return draft;
  });
}

export async function scaffoldUploadSalesProofAssetFileAction(formData: FormData) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:create");
    const { scaffoldSalesProofFileUpload } = await import(
      "@/lib/sales/proof-file-upload-scaffold"
    );
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("SalesOS validation: file is required");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return scaffoldSalesProofFileUpload({
      organizationId: ctx.organizationId,
      proofAssetId: String(formData.get("proofAssetId") ?? ""),
      actorId: ctx.user.id,
      filename: file.name,
      fileType: file.type || "application/octet-stream",
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

export async function submitOpportunityReviewAction(opportunityId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    await requireSalesPermission("salesos:update");
    return submitOpportunityForReview(user, opportunityId);
  });
}

export async function approveOpportunityAction(opportunityId: string) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    await requireSalesPermission("salesos:update");
    return approveOpportunity(user, opportunityId);
  });
}

export async function linkEvidenceAction(
  opportunityId: string,
  typeId: string,
  label: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    await requireSalesPermission("salesos:update");
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

/** Legacy alias used by sales workspace inline server actions */
export const createAccountAction = createSalesAccountAction;

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
