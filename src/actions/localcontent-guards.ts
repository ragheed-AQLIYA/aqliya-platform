// ─── LocalContentOS Tenant Isolation Guards ───
// Extracted shared guard pattern for verifying entity access belongs to the
// current user's organization. Each guard:
//   1. Calls getCurrentUser() to get the authenticated user + org
//   2. Verifies the target entity belongs to that org via Prisma chain
//   3. Throws "Access denied" if not found or not owned
//
// Pattern: entity → parent → ... → LocalContentProject.organizationId
//
// These guards are consumed by server actions (B2A-1 workbook actions,
// B2A-2 review/v3 actions, etc.) and integrate with the existing safe()
// wrapper pattern (errors are caught and returned as { ok: false }).

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Verify that a project belongs to the current user's organization.
 * Used by actions accepting a projectId from the client.
 */
export async function requireProjectAccess(projectId: string): Promise<string> {
  const user = await getCurrentUser();
  const project = await prisma.localContentProject.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
    select: { id: true },
  });
  if (!project) throw new Error("Access denied: project access required");
  return user.organizationId;
}

/**
 * Verify that a workbook belongs to the current user's organization.
 * Chain: LcWorkbook → project → LocalContentProject.organizationId
 * Used by actions accepting a workbookId from the client.
 */
export async function requireWorkbookAccess(workbookId: string): Promise<string> {
  const user = await getCurrentUser();
  const workbook = await prisma.lcWorkbook.findFirst({
    where: {
      id: workbookId,
      project: { organizationId: user.organizationId },
    },
    select: { id: true },
  });
  if (!workbook) throw new Error("Access denied: workbook access required");
  return user.organizationId;
}

/**
 * Verify that a workbook line belongs to a workbook in the current user's org.
 * Chain: LcWorkbookLine → workbook → project → organizationId
 * Used by actions accepting a lineId from the client.
 */
export async function requireWorkbookLineAccess(lineId: string): Promise<string> {
  const user = await getCurrentUser();
  const line = await prisma.lcWorkbookLine.findFirst({
    where: {
      id: lineId,
      workbook: { project: { organizationId: user.organizationId } },
    },
    select: { id: true },
  });
  if (!line) throw new Error("Access denied: workbook line access required");
  return user.organizationId;
}

/**
 * Verify that a data request belongs to a workbook in the current user's org.
 * Chain: LcDataRequest → workbook → project → organizationId
 * Used by actions accepting a requestId from the client.
 */
export async function requireDataRequestAccess(requestId: string): Promise<string> {
  const user = await getCurrentUser();
  const request = await prisma.lcDataRequest.findFirst({
    where: {
      id: requestId,
      workbook: { project: { organizationId: user.organizationId } },
    },
    select: { id: true },
  });
  if (!request) throw new Error("Access denied: data request access required");
  return user.organizationId;
}

/**
 * Verify that a data request item belongs to a request in a workbook
 * in the current user's organization.
 * Chain: LcDataRequestItem → request → workbook → project → organizationId
 * Used by actions accepting an itemId from the client.
 */
export async function requireDataRequestItemAccess(itemId: string): Promise<string> {
  const user = await getCurrentUser();
  const item = await prisma.lcDataRequestItem.findFirst({
    where: {
      id: itemId,
      request: {
        workbook: { project: { organizationId: user.organizationId } },
      },
    },
    select: { id: true },
  });
  if (!item) throw new Error("Access denied: data request item access required");
  return user.organizationId;
}

/**
 * Verify that a client-supplied organizationId matches the current user's
 * organization. Used by actions that accept organizationId as a parameter
 * (e.g., review queue queries, AI advisor V3 actions) to prevent
 * cross-tenant data access through parameter manipulation.
 */
export async function requireOrganizationAccess(organizationId: string): Promise<string> {
  const user = await getCurrentUser();
  if (organizationId !== user.organizationId) {
    throw new Error("Access denied: organization mismatch");
  }
  return user.organizationId;
}

/**
 * Verify that a pattern suggestion belongs to the current user's organization.
 * LcPatternSuggestion has organizationId directly on the model.
 * Used by reviewSuggestionAction and batchReviewAction (type=suggestion).
 */
export async function requirePatternSuggestionAccess(suggestionId: string): Promise<string> {
  const user = await getCurrentUser();
  const suggestion = await prisma.lcPatternSuggestion.findFirst({
    where: { id: suggestionId, organizationId: user.organizationId },
    select: { id: true },
  });
  if (!suggestion) throw new Error("Access denied: pattern suggestion access required");
  return user.organizationId;
}

/**
 * Verify that a match review belongs to the current user's organization.
 * LcMatchReview has organizationId directly on the model.
 * Used by reviewExplanationAction and batchReviewAction (type=explanation/false_positive).
 */
export async function requireMatchReviewAccess(matchReviewId: string): Promise<string> {
  const user = await getCurrentUser();
  const review = await prisma.lcMatchReview.findFirst({
    where: { id: matchReviewId, organizationId: user.organizationId },
    select: { id: true },
  });
  if (!review) throw new Error("Access denied: match review access required");
  return user.organizationId;
}
