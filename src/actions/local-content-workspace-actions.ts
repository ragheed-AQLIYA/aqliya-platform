"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
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
  listApprovalQueue,
  listContentCampaigns,
  listContentItems,
  listContentItemsByCampaign,
  listContentProjects,
  listContentSources,
  listOutputPackages,
  listReviewQueue,
  submitContentItemForReview,
  updateCampaignStatus,
} from "@/lib/local-content/content/services";
import {
  submitContentApproval,
  submitContentReview,
} from "@/lib/local-content/content/review";
import {
  buildOutputPackagePayload,
  createOutputPackage,
  markOutputExported,
} from "@/lib/local-content/content/outputs";
import { verifySource } from "@/lib/local-content/content/evidence";
import type { ContentFormat } from "@/lib/local-content/content/types";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
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

function revalidateWorkspace(): void {
  revalidatePath("/local-content");
  revalidatePath("/local-content/campaigns");
  revalidatePath("/local-content/review");
  revalidatePath("/local-content/outputs");
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
    const campaign = await getContentCampaign(campaignId, orgId(user));
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    const items = await listContentItemsByCampaign(campaignId, orgId(user));
    const sources = (await listContentSources(orgId(user))).filter(
      (s) => s.campaignId === campaignId,
    );
    const project = await getContentProject(
      campaign.contentProjectId,
      orgId(user),
    );
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
    const result = await executeGovernedAI(contentItemId, {
      organizationId: orgId(user),
      instructions,
      actorId: user.id,
      actorName: user.name,
    });
    if (!result.success) throw new Error(result.error ?? "Draft assist failed");
    revalidatePath("/local-content/review");
    return result;
  });
}

export async function submitContentStudioReviewAction(contentItemId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const item = await submitContentItemForReview(contentItemId, orgId(user));
    revalidatePath("/local-content/review");
    return item;
  });
}

export async function completeContentStudioReviewAction(formData: FormData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const record = await submitContentReview({
      contentItemId: String(formData.get("contentItemId") ?? "").trim(),
      organizationId: orgId(user),
      status: String(formData.get("status") ?? "approved") as
        | "approved"
        | "changes_requested"
        | "rejected",
      dimensions: {
        sourceGrounding: formData.get("sourceGrounding") === "on",
        brand: formData.get("brand") === "on",
        compliance: formData.get("compliance") === "on",
      },
      reviewerId: user.id,
      reviewerName: user.name,
    });
    revalidatePath("/local-content/review");
    return record;
  });
}

export async function approveContentStudioItemAction(
  contentItemId: string,
  approved: boolean,
  notes?: string,
) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:approve");
    return submitContentApproval({
      contentItemId,
      organizationId: orgId(user),
      approved,
      notes,
      approverId: user.id,
      approverName: user.name,
    });
  });
}

export async function listContentStudioReviewQueueAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listReviewQueue(orgId(user));
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
    revalidatePath("/local-content/outputs");
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

export async function exportContentStudioOutputAction(packageId: string) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:export");
    const payload = await buildOutputPackagePayload(packageId, orgId(user));
    const exported = await markOutputExported(packageId, orgId(user), {
      exportedBy: user.name,
      productId: "localcontentos",
    });
    revalidatePath("/local-content/outputs");
    return { exported, payload };
  });
}

export async function activateContentStudioCampaignAction(campaignId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");
    const campaign = await updateCampaignStatus(
      campaignId,
      orgId(user),
      "active",
    );
    revalidateWorkspace();
    return campaign;
  });
}

export async function activateCampaignFormAction(
  campaignId: string,
  _formData: FormData,
): Promise<void> {
  await activateContentStudioCampaignAction(campaignId);
}

export async function exportOutputFormAction(
  packageId: string,
  _formData: FormData,
): Promise<void> {
  await exportContentStudioOutputAction(packageId);
}

export async function createContentStudioSourceFormAction(
  formData: FormData,
): Promise<void> {
  await createContentStudioSourceAction(formData);
}

export async function createContentStudioItemFormAction(
  formData: FormData,
): Promise<void> {
  await createContentStudioItemAction(formData);
}

export async function createContentStudioOutputFormAction(
  formData: FormData,
): Promise<void> {
  await createContentStudioOutputAction(formData);
}
