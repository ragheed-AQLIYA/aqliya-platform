import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ContentApprovalRecord, ContentItem } from "../types";
import type { SubmitApprovalInput } from "../contracts";
import { newId } from "../store";
import { assertContentItemTransition } from "../workflow";
import { mapApproval, mapContentItem } from "./common";

export async function createApproval(
  input: SubmitApprovalInput,
): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.contentStudioItem.findFirst({
      where: {
        id: input.contentItemId,
        organizationId: input.organizationId,
      },
    });
    if (!item) throw new Error("Content item not found");

    let updatedItem = item;
    if (input.approved) {
      if (item.status !== "in_review") {
        throw new Error("Content must be in_review before approval");
      }
      assertContentItemTransition("in_review", "approved");
      updatedItem = await tx.contentStudioItem.update({
        where: { id: item.id },
        data: { status: "approved" },
      });
    } else if (item.status === "in_review") {
      assertContentItemTransition("in_review", "changes_requested");
      updatedItem = await tx.contentStudioItem.update({
        where: { id: item.id },
        data: { status: "changes_requested" },
      });
    }

    const approvalRow = await tx.contentStudioApproval.create({
      data: {
        id: newId("cappr"),
        contentItemId: input.contentItemId,
        organizationId: input.organizationId,
        approved: input.approved,
        notes: input.notes ?? null,
        approverId: input.approverId ?? null,
        approverName: input.approverName ?? null,
      },
    });

    return {
      approval: mapApproval(approvalRow),
      item: mapContentItem(updatedItem),
    };
  });
}

export async function listApprovals(
  organizationId: string,
): Promise<ContentApprovalRecord[]> {
  const rows = await prisma.contentStudioApproval.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapApproval);
}

export async function listApprovalsForItem(
  contentItemId: string,
  organizationId: string,
): Promise<ContentApprovalRecord[]> {
  const rows = await prisma.contentStudioApproval.findMany({
    where: { contentItemId, organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapApproval);
}

export async function listApprovalQueue(
  organizationId: string,
): Promise<ContentItem[]> {
  const rows = await prisma.contentStudioItem.findMany({
    where: { organizationId, status: "in_review" },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapContentItem);
}
