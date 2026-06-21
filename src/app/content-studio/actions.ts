"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  ContentStudioError,
  createWorkspace as csCreateWorkspace,
  getWorkspace as csGetWorkspace,
  listWorkspaces as csListWorkspaces,
  updateWorkspace as csUpdateWorkspace,
  createContent as csCreateContent,
  getContent as csGetContent,
  listContent as csListContent,
  updateContent as csUpdateContent,
  approveContent as csApproveContent,
  rejectContent as csRejectContent,
  publishContent as csPublishContent,
  archiveContent as csArchiveContent,
  createTemplate as csCreateTemplate,
  getTemplate as csGetTemplate,
  listTemplates as csListTemplates,
  getVersionHistory as csGetVersionHistory,
  getVersion as csGetVersion,
  restoreVersion as csRestoreVersion,
  getWorkspaceStats as csGetWorkspaceStats,
} from "@/lib/platform/content-studio";
import { submitForReview as csSubmitForReview } from "@/lib/platform/content-studio/content-studio-service";
import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
  CreateContentData,
  UpdateContentData,
  CreateTemplateData,
  ContentStatusValue,
} from "@/lib/platform/content-studio";

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
    if (error instanceof ContentStudioError) {
      return { ok: false, error: error.message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ContentStudio]", message);
    return { ok: false, error: message };
  }
}

function revalidateAll() {
  revalidatePath("/content-studio");
}

// ─── Workspace Actions ───

export async function createWorkspaceAction(
  data: CreateWorkspaceData,
): Promise<ActionResult<{ id: string; name: string }>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const ws = await csCreateWorkspace(user.organizationId, data, user.id);
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "content_studio",
      action: "content_studio.workspace_created",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "contentWorkspace",
      targetId: ws.id,
      targetLabel: ws.name,
    });
    revalidateAll();
    return { id: ws.id, name: ws.name };
  });
}

export async function listWorkspacesAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const workspaces = await csListWorkspaces(user.organizationId);
    return workspaces;
  });
}

export async function getWorkspaceAction(id: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const ws = await csGetWorkspace(id);
    if (!ws) throw new ContentStudioError("Content workspace not found");
    if (ws.organizationId !== user.organizationId) {
      throw new Error("Access denied: workspace not in your organization");
    }
    return ws;
  });
}

export async function updateWorkspaceAction(
  id: string,
  data: UpdateWorkspaceData,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const existing = await csGetWorkspace(id);
    if (!existing) throw new ContentStudioError("Content workspace not found");
    if (existing.organizationId !== user.organizationId) {
      throw new Error("Access denied: workspace not in your organization");
    }
    const updated = await csUpdateWorkspace(id, data);
    revalidateAll();
    return updated;
  });
}

// ─── Content Actions ───

export async function createContentAction(
  workspaceId: string,
  data: CreateContentData,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const ws = await csGetWorkspace(workspaceId);
    if (!ws) throw new ContentStudioError("Content workspace not found");
    if (ws.organizationId !== user.organizationId) {
      throw new Error("Access denied: workspace not in your organization");
    }
    const content = await csCreateContent(workspaceId, data, user.id);
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "content_studio",
      action: "content_studio.content_created",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "contentItem",
      targetId: content.id,
      targetLabel: content.title,
    });
    revalidateAll();
    revalidatePath(`/content-studio/${workspaceId}`);
    return content;
  });
}

export async function listContentAction(
  workspaceId: string,
  status?: ContentStatusValue,
) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const ws = await csGetWorkspace(workspaceId);
    if (!ws) throw new ContentStudioError("Content workspace not found");
    if (ws.organizationId !== user.organizationId) {
      throw new Error("Access denied: workspace not in your organization");
    }
    return csListContent(workspaceId, status ? { status } : undefined);
  });
}

export async function getContentAction(id: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const content = await csGetContent(id);
    if (!content) throw new ContentStudioError("Content item not found");
    return content;
  });
}

export async function updateContentAction(
  id: string,
  data: UpdateContentData,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const content = await csGetContent(id);
    if (!content) throw new ContentStudioError("Content item not found");
    const updated = await csUpdateContent(id, data, user.id);
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "content_studio",
      action: "content_studio.content_updated",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "contentItem",
      targetId: content.id,
      targetLabel: content.title,
    });
    revalidatePath(`/content-studio/${content.workspaceId}/${id}`);
    return updated;
  });
}

// ─── Lifecycle Actions ───

export async function submitForReviewAction(contentId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csSubmitForReview(contentId, user.id);
    revalidateAll();
    return result;
  });
}

export async function approveContentAction(
  contentId: string,
  notes?: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csApproveContent(contentId, user.id, notes);
    revalidateAll();
    return result;
  });
}

export async function rejectContentAction(
  contentId: string,
  reason: string,
) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csRejectContent(contentId, user.id, reason);
    revalidateAll();
    return result;
  });
}

export async function publishContentAction(contentId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csPublishContent(contentId, user.id);
    revalidateAll();
    return result;
  });
}

export async function archiveContentAction(contentId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csArchiveContent(contentId, user.id);
    revalidateAll();
    return result;
  });
}

// ─── Template Actions ───

export async function createTemplateAction(data: CreateTemplateData) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const template = await csCreateTemplate(user.organizationId, data, user.id);
    revalidateAll();
    revalidatePath("/content-studio/templates");
    return template;
  });
}

export async function listTemplatesAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return csListTemplates(user.organizationId);
  });
}

export async function getTemplateAction(id: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const template = await csGetTemplate(id);
    if (!template) throw new ContentStudioError("Template not found");
    return template;
  });
}

// ─── Stats & Versioning ───

export async function getWorkspaceStatsAction(workspaceId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return csGetWorkspaceStats(workspaceId);
  });
}

export async function getVersionHistoryAction(contentId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return csGetVersionHistory(contentId);
  });
}

export async function getVersionAction(versionId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return csGetVersion(versionId);
  });
}

export async function restoreVersionAction(versionId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await csRestoreVersion(versionId, user.id);
    revalidateAll();
    return result;
  });
}

// ─── Export Action ───

export async function exportContentAction(contentId: string) {
  try {
    const user = await requireUserContext("VIEWER");
    const content = await csGetContent(contentId);
    if (!content) return { success: false, error: "Content not found" };
    if (content.organizationId !== user.organizationId) {
      return { success: false, error: "Access denied" };
    }
    const ws = await csGetWorkspace(content.workspaceId);
    if (!ws) return { success: false, error: "Workspace not found" };

    // Fetch user names from DB for createdBy/reviewedBy/approvedBy
    const { prisma } = await import("@/lib/prisma");
    const [createdBy, reviewedBy, approvedBy] = await Promise.all([
      content.createdById
        ? prisma.user.findUnique({ where: { id: content.createdById }, select: { name: true } })
        : null,
      content.reviewedById
        ? prisma.user.findUnique({ where: { id: content.reviewedById }, select: { name: true } })
        : null,
      content.approvedById
        ? prisma.user.findUnique({ where: { id: content.approvedById }, select: { name: true } })
        : null,
    ]);

    const { buildContentStudioPDF } = await import("@/lib/platform/content-studio/content-export");

    const pdfResult = await buildContentStudioPDF({
      contentId: content.id,
      title: content.title,
      body: content.body,
      summary: content.summary,
      status: content.status,
      contentType: content.contentType,
      version: content.version,
      locale: content.locale,
      tags: content.tags,
      workspaceName: ws.name,
      createdByName: createdBy?.name ?? null,
      reviewedByName: reviewedBy?.name ?? null,
      approvedByName: approvedBy?.name ?? null,
      publishedAt: content.publishedAt,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      exportedAt: new Date(),
    });

    // Audit log
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "content_studio",
      action: "content_studio.content_exported",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "contentItem",
      targetId: content.id,
      targetLabel: content.title,
      metadata: { format: "pdf", workspaceName: ws.name },
    });

    return {
      success: true,
      content: pdfResult.content.toString("base64"),
      mimeType: pdfResult.mimeType,
      filename: pdfResult.filename,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    console.error("[ContentStudio Export] Error:", message);
    return { success: false, error: message };
  }
}
