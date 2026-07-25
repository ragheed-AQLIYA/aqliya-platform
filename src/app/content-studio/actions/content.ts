"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  ContentStudioError,
  getWorkspace as csGetWorkspace,
  createContent as csCreateContent,
  getContent as csGetContent,
  listContent as csListContent,
  updateContent as csUpdateContent,
} from "@/lib/platform/content-studio";
import type {
  CreateContentData,
  UpdateContentData,
  ContentStatusValue,
} from "@/lib/platform/content-studio";
import { safe, revalidateAll, type ActionResult } from "./common";

export async function createContentAction(
  workspaceId: string,
  data: CreateContentData,
) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
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
    const _user = await getCurrentUser();
if (!hasRequiredRole(_user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
