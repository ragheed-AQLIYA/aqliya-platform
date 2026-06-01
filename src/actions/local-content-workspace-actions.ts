"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import type { CurrentUser } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { assertLocalContentPermission } from "@/lib/local-content/content/permissions";
import {
  createContentCampaign,
  createContentItem,
  createContentProject,
  createContentSource,
  executeGovernedAI,
  getCommandCenterSummary,
  getContentCampaign,
  getContentProject,
  listContentCampaigns,
  listContentItems,
  listContentItemsByCampaign,
  listContentProjects,
  listContentSources,
  submitContentItemForReview,
  updateCampaignStatus,
} from "@/lib/local-content/content/services";
import {
  submitContentApproval,
  submitContentReview,
  listReviewQueue,
  listApprovalQueue,
} from "@/lib/local-content/content/review";
import {
  buildOutputPackagePayload,
  createOutputPackage,
  markOutputExported,
  listOutputPackages,
} from "@/lib/local-content/content/outputs";
import { verifySource } from "@/lib/local-content/content/evidence";
import type { ContentFormat } from "@/lib/local-content/content/types";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[LocalContentOS Workspace Action]", message);
    return { ok: false, error: message };
  }
}

function orgId(user: Awaited<ReturnType<typeof requireUserContext>>): string {
  return user.organizationId;
}

function requireMutationId(id: string, label: string): string {
  const trimmed = id?.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

async function logContentStudioAudit(params: {
  user: CurrentUser;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const alog = auditLogger({
      productKey: Product.LOCAL_CONTENT,
      sourceSystem: "localcontentos_content_studio",
      organization: {
        platformOrganizationId: params.user.platformOrganizationId,
        clientWorkspaceId: params.user.organizationId,
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
      {
        severity: "info",
        status: "recorded",
        sourceModel: params.targetType,
        sourceId: params.targetId,
        metadata: params.metadata,
      },
    );
  } catch {
    // Dual-write must not block the primary action
  }
}

function revalidateWorkspace() {
  revalidatePath("/local-content");
  revalidatePath("/local-content/campaigns");
  revalidatePath("/local-content/review");
  revalidatePath("/local-content/outputs", "page");
  revalidatePath("/local-content/outputs", "layout");
}

export async function getContentStudioSummaryAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return getCommandCenterSummary(orgId(user));
  });
}

export async function listContentStudioProjectsAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listContentProjects(orgId(user));
  });
}

export async function createContentStudioProjectAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) throw new Error("Title is required");
    const project = await createContentProject({
      organizationId: orgId(user),
      platformOrganizationId: user.platformOrganizationId,
      title,
      objective: String(formData.get("objective") ?? "").trim() || undefined,
      audience: String(formData.get("audience") ?? "").trim() || undefined,
      language: String(formData.get("language") ?? "ar").trim(),
      createdById: user.id,
      createdByName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_project.created",
      targetType: "ContentStudioProject",
      targetId: project.id,
      metadata: { title: project.title },
    });
    revalidateWorkspace();
    return project;
  });
}

export async function listContentStudioCampaignsAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listContentCampaigns(orgId(user));
  });
}

export async function getContentStudioCampaignAction(campaignId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    const oid = orgId(user);
    const campaign = await getContentCampaign(campaignId, oid);
    if (!campaign) throw new Error("Campaign not found");
    const items = await listContentItemsByCampaign(campaignId, oid);
    const sources = (await listContentSources(oid)).filter(
      (s) => s.campaignId === campaignId,
    );
    const project = await getContentProject(campaign.contentProjectId, oid);
    return { campaign, items, sources, project };
  });
}

export async function createContentStudioCampaignAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");
    const contentProjectId = String(formData.get("contentProjectId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    if (!contentProjectId || !name) throw new Error("Project and name required");
    const channelsRaw = String(formData.get("channels") ?? "").trim();
    const channels = channelsRaw
      ? channelsRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    const campaign = await createContentCampaign({
      organizationId: orgId(user),
      contentProjectId,
      name,
      objective: String(formData.get("objective") ?? "").trim() || undefined,
      audience: String(formData.get("audience") ?? "").trim() || undefined,
      channels,
      createdById: user.id,
      createdByName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_campaign.created",
      targetType: "ContentStudioCampaign",
      targetId: campaign.id,
      metadata: { name: campaign.name, contentProjectId },
    });
    revalidateWorkspace();
    revalidatePath(`/local-content/campaigns/${campaign.id}`);
    return campaign;
  });
}

export async function createContentStudioSourceAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) throw new Error("Title is required");
    const source = await createContentSource({
      organizationId: orgId(user),
      campaignId: String(formData.get("campaignId") ?? "").trim() || undefined,
      contentItemId: String(formData.get("contentItemId") ?? "").trim() || undefined,
      title,
      type: String(formData.get("type") ?? "note") as "url" | "file" | "note",
      url: String(formData.get("url") ?? "").trim() || undefined,
      note: String(formData.get("note") ?? "").trim() || undefined,
      createdById: user.id,
      createdByName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_source.created",
      targetType: "ContentStudioSource",
      targetId: source.id,
      metadata: { title: source.title, type: source.type },
    });
    revalidateWorkspace();
    const campaignId = String(formData.get("campaignId") ?? "").trim();
    if (campaignId) revalidatePath(`/local-content/campaigns/${campaignId}`);
    return source;
  });
}

export async function verifyContentStudioSourceAction(sourceId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const source = await verifySource(requireMutationId(sourceId, "sourceId"), orgId(user), {
      id: user.id,
      name: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_source.verified",
      targetType: "ContentStudioSource",
      targetId: sourceId,
      metadata: { status: source.status },
    });
    revalidateWorkspace();
    return source;
  });
}

export async function createContentStudioItemAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");
    const campaignId = String(formData.get("campaignId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!campaignId || !title) throw new Error("Campaign and title required");
    const item = await createContentItem({
      organizationId: orgId(user),
      campaignId,
      title,
      format: (String(formData.get("format") ?? "article") as ContentFormat) || "article",
      createdById: user.id,
      createdByName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_item.created",
      targetType: "ContentStudioItem",
      targetId: item.id,
      metadata: { title: item.title, format: item.format, campaignId },
    });
    revalidatePath(`/local-content/campaigns/${campaignId}`);
    return item;
  });
}

export async function draftAssistContentItemAction(
  contentItemId: string,
  instructions?: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");
    const result = await executeGovernedAI(requireMutationId(contentItemId, "contentItemId"), {
      organizationId: orgId(user),
      instructions,
      actorId: user.id,
      actorName: user.name,
    });
    if (!result.success) throw new Error(result.error ?? "Draft assist failed");
    await logContentStudioAudit({
      user,
      action: "localcontent.content_item.draft_assisted",
      targetType: "ContentStudioItem",
      targetId: contentItemId,
      metadata: {
        campaignId: result.contentItem?.campaignId,
        aiAssisted: true,
      },
    });
    revalidatePath("/local-content/review");
    if (result.contentItem?.campaignId) {
      revalidatePath(`/local-content/campaigns/${result.contentItem.campaignId}`);
    }
    return result;
  });
}

export async function submitContentStudioReviewAction(contentItemId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const item = await submitContentItemForReview(
      requireMutationId(contentItemId, "contentItemId"),
      orgId(user),
    );
    await logContentStudioAudit({
      user,
      action: "localcontent.content_item.review_submitted",
      targetType: "ContentStudioItem",
      targetId: contentItemId,
      metadata: { campaignId: item.campaignId, status: item.status },
    });
    revalidatePath("/local-content/review", "page");
    revalidatePath("/local-content/review", "layout");
    revalidatePath("/local-content", "page");
    revalidatePath(`/local-content/campaigns/${item.campaignId}`, "page");
    return item;
  });
}

export async function completeContentStudioReviewAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const record = await submitContentReview({
      contentItemId: requireMutationId(
        String(formData.get("contentItemId") ?? ""),
        "contentItemId",
      ),
      organizationId: orgId(user),
      status: String(formData.get("status") ?? "approved") as
        | "approved"
        | "changes_requested"
        | "rejected",
      dimensions: {
        sourceGrounding: formData.get("sourceGrounding") === "on",
        brand: formData.get("brand") === "on",
        compliance: formData.get("compliance") === "on",
        factualClaims: formData.get("factualClaims") === "on",
        languageQuality: formData.get("languageQuality") === "on",
      },
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      reviewerId: user.id,
      reviewerName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_review.completed",
      targetType: "ContentStudioReview",
      targetId: record.id,
      metadata: {
        contentItemId: record.contentItemId,
        status: record.status,
      },
    });
    revalidatePath("/local-content/review", "page");
    revalidatePath("/local-content/review", "layout");
    revalidatePath("/local-content", "page");
    revalidatePath("/local-content/outputs", "page");
    revalidatePath("/local-content/outputs", "layout");
    return record;
  });
}

export async function completeContentStudioReviewFormAction(formData: FormData) {
  const res = await completeContentStudioReviewAction(formData);
  if (!res.ok) throw new Error(res.error);
  redirect("/local-content/review?refresh=1");
}

export async function approveContentStudioItemAction(
  contentItemId: string,
  approved: boolean,
  notes?: string,
) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:approve");
    const { approval, item } = await submitContentApproval({
      contentItemId: requireMutationId(contentItemId, "contentItemId"),
      organizationId: orgId(user),
      approved,
      notes,
      approverId: user.id,
      approverName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_approval.decided",
      targetType: "ContentStudioApproval",
      targetId: approval.id,
      metadata: {
        contentItemId,
        approved,
        productId: "localcontentos",
      },
    });
    revalidatePath("/local-content/review", "page");
    revalidatePath("/local-content/review", "layout");
    revalidatePath("/local-content", "page");
    revalidatePath("/local-content/outputs", "page");
    revalidatePath("/local-content/outputs", "layout");
    return { approval, item };
  });
}

export async function approveContentStudioItemFormAction(formData: FormData) {
  const contentItemId = String(formData.get("contentItemId") ?? "").trim();
  const approved = formData.get("approved") === "true";
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  const res = await approveContentStudioItemAction(contentItemId, approved, notes);
  if (!res.ok) throw new Error(res.error);
  redirect("/local-content/review?refresh=1");
}

export async function listContentStudioReviewQueueAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listReviewQueue(orgId(user));
  });
}

export async function listContentStudioApprovalQueueAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listApprovalQueue(orgId(user));
  });
}

export async function createContentStudioOutputAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:export");
    const campaignId = String(formData.get("campaignId") ?? "").trim();
    if (!campaignId) throw new Error("Campaign required");
    const pkg = await createOutputPackage({
      campaignId,
      organizationId: orgId(user),
      title: String(formData.get("title") ?? "").trim() || "Output Package",
      createdById: user.id,
      createdByName: user.name,
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_output.created",
      targetType: "ContentStudioOutput",
      targetId: pkg.id,
      metadata: { title: pkg.title, campaignId },
    });
    revalidatePath("/local-content/outputs", "page");
    revalidatePath("/local-content/outputs", "layout");
    return pkg;
  });
}

export async function listContentStudioOutputsAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listOutputPackages(orgId(user));
  });
}

export async function buildContentStudioOutputPayloadAction(packageId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return buildOutputPackagePayload(requireMutationId(packageId, "packageId"), orgId(user));
  });
}

export async function exportContentStudioOutputAction(packageId: string) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:export");
    const oid = orgId(user);
    const pkgId = requireMutationId(packageId, "packageId");
    const payload = await buildOutputPackagePayload(pkgId, oid);
    const exported = await markOutputExported(pkgId, oid, {
      exportedBy: user.name,
      productId: "localcontentos",
    });
    await logContentStudioAudit({
      user,
      action: "localcontent.content_output.exported",
      targetType: "ContentStudioOutput",
      targetId: packageId,
      metadata: {
        campaignId: exported.campaignId,
        exportedBy: user.name,
      },
    });
    revalidatePath("/local-content/outputs", "page");
    revalidatePath("/local-content/outputs", "layout");
    return { exported, payload };
  });
}

export async function exportContentStudioOutputFormAction(formData: FormData) {
  const packageId = String(formData.get("packageId") ?? "").trim();
  if (!packageId) throw new Error("Package ID required");
  const res = await exportContentStudioOutputAction(packageId);
  if (!res.ok) throw new Error(res.error);
  redirect("/local-content/outputs?refresh=1");
}

export async function activateContentStudioCampaignAction(campaignId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");
    const campaign = await updateCampaignStatus(
      requireMutationId(campaignId, "campaignId"),
      orgId(user),
      "active",
    );
    await logContentStudioAudit({
      user,
      action: "localcontent.content_campaign.activated",
      targetType: "ContentStudioCampaign",
      targetId: campaignId,
      metadata: { status: campaign.status },
    });
    revalidateWorkspace();
    return campaign;
  });
}

export async function listContentStudioItemsAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listContentItems(orgId(user));
  });
}
