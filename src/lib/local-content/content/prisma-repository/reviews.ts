import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ContentReviewRecord, ContentItemStatus } from "../types";
import type { SubmitReviewInput } from "../contracts";
import { newId } from "../store";
import { assertContentItemTransition } from "../workflow";
import { mapReview } from "./common";

export async function createReview(input: SubmitReviewInput): Promise<ContentReviewRecord> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.contentStudioItem.findFirst({
      where: {
        id: input.contentItemId,
        organizationId: input.organizationId,
      },
    });
    if (!item) throw new Error("Content item not found");

    if (
      input.status === "approved" ||
      input.status === "changes_requested" ||
      input.status === "rejected"
    ) {
      if (item.status === "draft") {
        assertContentItemTransition("draft", "in_review");
        await tx.contentStudioItem.update({
          where: { id: item.id },
          data: { status: "in_review" },
        });
      }
    }

    if (input.status === "changes_requested") {
      const current = await tx.contentStudioItem.findUniqueOrThrow({
        where: { id: item.id },
      });
      assertContentItemTransition(
        current.status as ContentItemStatus,
        "changes_requested",
      );
      await tx.contentStudioItem.update({
        where: { id: item.id },
        data: { status: "changes_requested" },
      });
    }

    const row = await tx.contentStudioReview.create({
      data: {
        id: newId("crev"),
        contentItemId: input.contentItemId,
        organizationId: input.organizationId,
        status: input.status,
        dimensions: (input.dimensions ?? {}) as Prisma.InputJsonValue,
        notes: input.notes ?? null,
        reviewerId: input.reviewerId ?? null,
        reviewerName: input.reviewerName ?? null,
      },
    });
    return mapReview(row);
  });
}

export async function listReviews(organizationId: string): Promise<ContentReviewRecord[]> {
  const rows = await prisma.contentStudioReview.findMany({
    take: 100,
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReview);
}

export async function listReviewsForItem(
  contentItemId: string,
  organizationId: string,
): Promise<ContentReviewRecord[]> {
  const rows = await prisma.contentStudioReview.findMany({
    take: 100,
    where: { contentItemId, organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReview);
}
