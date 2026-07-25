"use server";

import { createLogger } from "@/lib/observability/logger";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  getContent as csGetContent,
  getWorkspace as csGetWorkspace,
} from "@/lib/platform/content-studio";

const logger = createLogger({ product: "platform", action: "content-studio" });

export async function exportContentAction(contentId: string) {
  try {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    const content = await csGetContent(contentId);
    if (!content) return { success: false, error: "Content not found" };
    if (content.organizationId !== user.organizationId) {
      return { success: false, error: "Access denied" };
    }
    const ws = await csGetWorkspace(content.workspaceId);
    if (!ws) return { success: false, error: "Workspace not found" };

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
    logger.error("[ContentStudio Export] Error:", error instanceof Error ? error : undefined);
    return { success: false, error: message };
  }
}
