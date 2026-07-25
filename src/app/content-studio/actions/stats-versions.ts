"use server";

import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import {
  getWorkspaceStats as csGetWorkspaceStats,
  getVersionHistory as csGetVersionHistory,
  getVersion as csGetVersion,
  restoreVersion as csRestoreVersion,
} from "@/lib/platform/content-studio";
import { safe, revalidateAll } from "./common";

export async function getWorkspaceStatsAction(workspaceId: string) {
  return safe(async () => {
    const _user = await getCurrentUser();
if (!hasRequiredRole(_user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    return csGetWorkspaceStats(workspaceId);
  });
}

export async function getVersionHistoryAction(contentId: string) {
  return safe(async () => {
    const _user = await getCurrentUser();
if (!hasRequiredRole(_user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    return csGetVersionHistory(contentId);
  });
}

export async function getVersionAction(versionId: string) {
  return safe(async () => {
    const _user = await getCurrentUser();
if (!hasRequiredRole(_user, "VIEWER")) {
  throw new Error("Access denied: VIEWER role required");
}
    return csGetVersion(versionId);
  });
}

export async function restoreVersionAction(versionId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const result = await csRestoreVersion(versionId, user.id);
    revalidateAll();
    return result;
  });
}
