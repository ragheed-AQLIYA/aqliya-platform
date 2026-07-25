import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ContentItem, ContentItemStatus } from "../types";
import type { CreateContentItemInput } from "../contracts";
import { newId } from "../store";
import { assertContentItemTransition } from "../workflow";
import { mapContentItem } from "./common";

export async function createContentItem(input: CreateContentItemInput): Promise<ContentItem> {
  const campaign = await prisma.contentStudioCampaign.findFirst({
    where: { id: input.campaignId, organizationId: input.organizationId },
  });
  if (!campaign) throw new Error("Campaign not found");

  const row = await prisma.contentStudioItem.create({
    data: {
      id: newId("citem"),
      campaignId: input.campaignId,
      organizationId: input.organizationId,
      title: input.title,
      format: input.format,
      body: input.body ?? null,
      sourceRefIds: (input.sourceRefIds ?? []) as Prisma.InputJsonValue,
      status: input.status ?? "idea",
      aiGenerated: false,
      reviewRequired: false,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
  return mapContentItem(row);
}

export async function listContentItems(organizationId: string): Promise<ContentItem[]> {
  const rows = await prisma.contentStudioItem.findMany({
    take: 100,
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapContentItem);
}

export async function listContentItemsByCampaign(
  campaignId: string,
  organizationId: string,
): Promise<ContentItem[]> {
  const rows = await prisma.contentStudioItem.findMany({
    take: 100,
    where: { campaignId, organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapContentItem);
}

export async function getContentItem(id: string, organizationId: string): Promise<ContentItem | null> {
  const row = await prisma.contentStudioItem.findFirst({
    where: { id, organizationId },
  });
  return row ? mapContentItem(row) : null;
}

export async function updateContentItemStatus(
  id: string,
  organizationId: string,
  status: ContentItemStatus,
): Promise<ContentItem> {
  const existing = await prisma.contentStudioItem.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Content item not found");
  assertContentItemTransition(existing.status as ContentItemStatus, status);
  const row = await prisma.contentStudioItem.update({
    where: { id },
    data: { status },
  });
  return mapContentItem(row);
}

export async function updateContentItem(
  id: string,
  organizationId: string,
  patch: Partial<
    Pick<
      ContentItem,
      | "body"
      | "status"
      | "draftAssistMetadata"
      | "sourceRefIds"
      | "aiGenerated"
      | "reviewRequired"
    >
  >,
): Promise<ContentItem> {
  const existing = await prisma.contentStudioItem.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Content item not found");
  if (patch.status) {
    assertContentItemTransition(
      existing.status as ContentItemStatus,
      patch.status,
    );
  }
  const row = await prisma.contentStudioItem.update({
    where: { id },
    data: {
      body: patch.body !== undefined ? patch.body ?? null : undefined,
      status: patch.status,
      draftAssistMetadata:
        patch.draftAssistMetadata !== undefined
          ? (patch.draftAssistMetadata as Prisma.InputJsonValue)
          : undefined,
      sourceRefIds:
        patch.sourceRefIds !== undefined
          ? (patch.sourceRefIds as Prisma.InputJsonValue)
          : undefined,
      aiGenerated: patch.aiGenerated,
      reviewRequired: patch.reviewRequired,
    },
  });
  return mapContentItem(row);
}
