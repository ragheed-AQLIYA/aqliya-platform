"use server";

import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  ContentStudioError,
  getWorkspace as csGetWorkspace,
  listWorkspaces as csListWorkspaces,
  createWorkspace as csCreateWorkspace,
  updateWorkspace as csUpdateWorkspace,
} from "@/lib/platform/content-studio";
import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
} from "@/lib/platform/content-studio";
import { safe, revalidateAll, type ActionResult } from "./common";

export async function createWorkspaceAction(
  data: CreateWorkspaceData,
): Promise<ActionResult<{ id: string; name: string }>> {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    const workspaces = await csListWorkspaces(user.organizationId);
    return workspaces;
  });
}

export async function getWorkspaceAction(id: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
