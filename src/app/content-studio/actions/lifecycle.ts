"use server";

import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  ContentStudioError,
  getContent as csGetContent,
  approveContent as csApproveContent,
  rejectContent as csRejectContent,
  publishContent as csPublishContent,
  archiveContent as csArchiveContent,
} from "@/lib/platform/content-studio";
import { submitForReview as csSubmitForReview } from "@/lib/platform/content-studio/content-studio-service";
import { safe, revalidateAll } from "./common";

export async function submitForReviewAction(contentId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
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
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const result = await csRejectContent(contentId, user.id, reason);
    revalidateAll();
    return result;
  });
}

export async function publishContentAction(contentId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const result = await csPublishContent(contentId, user.id);
    revalidateAll();
    return result;
  });
}

export async function archiveContentAction(contentId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const result = await csArchiveContent(contentId, user.id);
    revalidateAll();
    return result;
  });
}

export async function deleteContentAction(contentId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
if (!hasRequiredRole(user, "OPERATOR")) {
  throw new Error("Access denied: OPERATOR role required");
}
    const content = await csGetContent(contentId);
    if (!content) throw new ContentStudioError("Content item not found");
    await csArchiveContent(contentId, user.id);
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "content_studio",
      action: "content_studio.content_deleted",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "contentItem",
      targetId: content.id,
      targetLabel: content.title,
    });
    revalidateAll();
  });
}
