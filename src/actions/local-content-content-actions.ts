"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  createContentProject,
  createContentCampaign,
  createContentSource,
  createContentItem,
  listContentProjects,
  listContentCampaigns,
  listContentItems,
  listContentItemsByCampaign,
  getContentCampaign,
  getContentItem,
  submitContentItemForReview,
  updateCampaignStatus,
  updateContentItemStatus,
  executeGovernedAI,
  getCommandCenterSummary,
} from "@/lib/local-content/content/services";
import {
  submitContentReview,
  submitContentApproval,
  listReviewQueue,
  listApprovalQueue,
} from "@/lib/local-content/content/review";
import {
  createOutputPackage,
  buildOutputPackagePayload,
  markOutputExported,
  listOutputPackages,
} from "@/lib/local-content/content/outputs";
import { verifySource } from "@/lib/local-content/content/evidence";
import {
  assertLocalContentPermission,
  hasLocalContentPermission,
} from "@/lib/local-content/content/permissions";
import type {
  CampaignStatus,
  ContentFormat,
  ContentItemStatus,
  SourceType,
} from "@/lib/local-content/content/types";

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
    console.error("[LocalContentOS Content Action]", message);
    return { ok: false, error: message };
  }
}

function actorFromUser(user: Awaited<ReturnType<typeof requireUserContext>>) {
  return { createdById: user.id, createdByName: user.name };
}

export async function listContentStudioSummaryAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getCommandCenterSummary>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return getCommandCenterSummary(user.organizationId);
  });
}

export async function listContentProjectsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContentProjects>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listContentProjects(user.organizationId);
  });
}

export async function createContentProjectAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createContentProject>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");

    const title = String(formData.get("title") ?? "").trim();
    if (!title) throw new Error("Title is required");

    const project = await createContentProject({
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      title,
      objective: String(formData.get("objective") ?? "").trim() || undefined,
      audience: String(formData.get("audience") ?? "").trim() || undefined,
      language: String(formData.get("language") ?? "ar").trim(),
      ...actorFromUser(user),
    });

    await auditLogger({
      productKey: "local_content",
      organization: { platformOrganizationId: user.platformOrganizationId },
      actor: { id: user.id, name: user.name },
    }).record(
      "localcontentos.content_project.created",
      { type: "ContentProject", id: project.id },
      { metadata: { title: project.title } },
    );

    revalidatePath("/local-content");
    revalidatePath("/local-content/campaigns");
    return project;
  });
}

export async function listContentCampaignsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContentCampaigns>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listContentCampaigns(user.organizationId);
  });
}

export async function createContentCampaignAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createContentCampaign>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");

    const contentProjectId = String(formData.get("contentProjectId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    if (!contentProjectId || !name) {
      throw new Error("contentProjectId and name are required");
    }

    const channelsRaw = String(formData.get("channels") ?? "").trim();
    const channels = channelsRaw
      ? channelsRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const campaign = await createContentCampaign({
      contentProjectId,
      organizationId: user.organizationId,
      objective: String(formData.get("objective") ?? "").trim() || undefined,
      audience: String(formData.get("audience") ?? "").trim() || undefined,
      channels,
      name,
      ...actorFromUser(user),
    });

    revalidatePath("/local-content/campaigns");
    revalidatePath("/local-content");
    return campaign;
  });
}

export async function getContentCampaignAction(
  campaignId: string,
): Promise<ActionResult<{
  campaign: NonNullable<Awaited<ReturnType<typeof getContentCampaign>>>;
  items: Awaited<ReturnType<typeof listContentItemsByCampaign>>;
}>> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    const campaign = await getContentCampaign(campaignId, user.organizationId);
    if (!campaign) throw new Error("Campaign not found");
    const items = await listContentItemsByCampaign(campaignId, user.organizationId);
    return { campaign, items };
  });
}

export async function createContentSourceAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createContentSource>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");

    const title = String(formData.get("title") ?? "").trim();
    const type = String(formData.get("type") ?? "note") as SourceType;
    if (!title) throw new Error("Title is required");

    const source = await createContentSource({
      organizationId: user.organizationId,
      campaignId: String(formData.get("campaignId") ?? "").trim() || undefined,
      contentItemId: String(formData.get("contentItemId") ?? "").trim() || undefined,
      title,
      type,
      url: String(formData.get("url") ?? "").trim() || undefined,
      note: String(formData.get("note") ?? "").trim() || undefined,
      ...actorFromUser(user),
    });

    revalidatePath("/local-content/campaigns");
    return source;
  });
}

export async function createContentItemAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createContentItem>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:create");

    const campaignId = String(formData.get("campaignId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const format = String(formData.get("format") ?? "article") as ContentFormat;
    if (!campaignId || !title) {
      throw new Error("campaignId and title are required");
    }

    const item = await createContentItem({
      campaignId,
      organizationId: user.organizationId,
      title,
      format,
      ...actorFromUser(user),
    });

    revalidatePath(`/local-content/campaigns/${campaignId}`);
    return item;
  });
}

export async function draftAssistContentItemAction(
  contentItemId: string,
  instructions?: string,
): Promise<ActionResult<Awaited<ReturnType<typeof executeGovernedAI>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");

    const item = await getContentItem(contentItemId, user.organizationId);
    if (!item) {
      throw new Error("Content item not found");
    }

    const result = await executeGovernedAI(contentItemId, {
      organizationId: user.organizationId,
      instructions,
      actorId: user.id,
      actorName: user.name,
    });

    revalidatePath(`/local-content/campaigns/${item.campaignId}`);
    revalidatePath("/local-content/review");
    return result;
  });
}

export async function submitContentReviewAction(
  contentItemId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof submitContentReview>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");

    const status = String(formData.get("status") ?? "pending") as
      | "pending"
      | "approved"
      | "changes_requested"
      | "rejected";

    const review = await submitContentReview({
      contentItemId,
      organizationId: user.organizationId,
      status,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      dimensions: {
        sourceGrounding: formData.get("sourceGrounding") === "on",
        brand: formData.get("brand") === "on",
        compliance: formData.get("compliance") === "on",
        factualClaims: formData.get("factualClaims") === "on",
        languageQuality: formData.get("languageQuality") === "on",
      },
      reviewerId: user.id,
      reviewerName: user.name,
    });

    revalidatePath("/local-content/review");
    return review;
  });
}

export async function submitContentApprovalAction(
  contentItemId: string,
  approved: boolean,
  notes?: string,
): Promise<ActionResult<Awaited<ReturnType<typeof submitContentApproval>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:approve");

    const result = await submitContentApproval({
      contentItemId,
      organizationId: user.organizationId,
      approved,
      notes,
      approverId: user.id,
      approverName: user.name,
    });

    revalidatePath("/local-content/review");
    revalidatePath("/local-content/outputs");
    return result;
  });
}

export async function listReviewQueueAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listReviewQueue>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listReviewQueue(user.organizationId);
  });
}

export async function createOutputPackageAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createOutputPackage>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:export");

    const campaignId = String(formData.get("campaignId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!campaignId || !title) {
      throw new Error("campaignId and title are required");
    }

    const pkg = await createOutputPackage({
      campaignId,
      organizationId: user.organizationId,
      title,
      ...actorFromUser(user),
    });

    revalidatePath("/local-content/outputs");
    return pkg;
  });
}

export async function listOutputPackagesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listOutputPackages>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    assertLocalContentPermission(user.role, "localcontentos:read");
    return listOutputPackages(user.organizationId);
  });
}

export async function exportOutputPackageAction(
  packageId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof buildOutputPackagePayload>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    assertLocalContentPermission(user.role, "localcontentos:export");

    const payload = await buildOutputPackagePayload(packageId, user.organizationId);
    await markOutputExported(packageId, user.organizationId, {
      exportedBy: user.name,
    });

    revalidatePath("/local-content/outputs");
    return payload;
  });
}

export async function verifyContentSourceAction(
  sourceId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof verifySource>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:review");
    const source = await verifySource(
      sourceId,
      user.organizationId,
      { id: user.id, name: user.name },
    );
    revalidatePath("/local-content/campaigns");
    return source;
  });
}

export async function updateCampaignStatusAction(
  campaignId: string,
  status: CampaignStatus,
): Promise<ActionResult<Awaited<ReturnType<typeof updateCampaignStatus>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");
    const campaign = await updateCampaignStatus(
      campaignId,
      user.organizationId,
      status,
    );
    revalidatePath("/local-content/campaigns");
    revalidatePath(`/local-content/campaigns/${campaignId}`);
    return campaign;
  });
}

export async function submitContentItemForReviewAction(
  contentItemId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof submitContentItemForReview>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    assertLocalContentPermission(user.role, "localcontentos:update");
    const item = await submitContentItemForReview(
      contentItemId,
      user.organizationId,
    );
    revalidatePath("/local-content/review");
    return item;
  });
}

export async function canUseLocalContentPermissionAction(
  permission: Parameters<typeof hasLocalContentPermission>[1],
): Promise<boolean> {
  try {
    const user = await requireUserContext("VIEWER");
    return hasLocalContentPermission(user.role, permission);
  } catch {
    return false;
  }
}
