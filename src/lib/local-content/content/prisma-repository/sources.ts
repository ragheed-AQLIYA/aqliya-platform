import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ContentSource, SourceStatus } from "../types";
import type { CreateSourceInput } from "../contracts";
import { newId } from "../store";
import { canTransitionSource } from "../workflow";
import { asRecord, mapSource } from "./common";

export async function createSource(input: CreateSourceInput): Promise<ContentSource> {
  if (input.campaignId) {
    const campaign = await prisma.contentStudioCampaign.findFirst({
      where: { id: input.campaignId, organizationId: input.organizationId },
    });
    if (!campaign) throw new Error("Campaign not found");
  }
  if (input.contentItemId) {
    const item = await prisma.contentStudioItem.findFirst({
      where: {
        id: input.contentItemId,
        organizationId: input.organizationId,
      },
    });
    if (!item) throw new Error("Content item not found");
  }

  const row = await prisma.contentStudioSource.create({
    data: {
      id: newId("src"),
      organizationId: input.organizationId,
      campaignId: input.campaignId ?? null,
      contentItemId: input.contentItemId ?? null,
      title: input.title,
      type: input.type,
      url: input.url ?? null,
      note: input.note ?? null,
      fileRef: input.fileRef ?? null,
      credibility: input.credibility ?? "unverified",
      status: input.status ?? "proposed",
      evidenceMetadata: (input.evidenceMetadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
  return mapSource(row);
}

export async function listSources(organizationId: string): Promise<ContentSource[]> {
  const rows = await prisma.contentStudioSource.findMany({
    take: 100,
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapSource);
}

export async function listSourcesForCampaign(
  campaignId: string,
  organizationId: string,
): Promise<ContentSource[]> {
  const rows = await prisma.contentStudioSource.findMany({
    take: 100,
    where: { campaignId, organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapSource);
}

export async function getSource(id: string, organizationId: string): Promise<ContentSource | null> {
  const row = await prisma.contentStudioSource.findFirst({
    where: { id, organizationId },
  });
  return row ? mapSource(row) : null;
}

export async function verifySource(
  sourceId: string,
  organizationId: string,
  actor?: { id?: string; name?: string },
): Promise<ContentSource> {
  const existing = await prisma.contentStudioSource.findFirst({
    where: { id: sourceId, organizationId },
  });
  if (!existing) throw new Error("Source not found");
  if (!canTransitionSource(existing.status as SourceStatus, "verified")) {
    throw new Error(`Cannot verify source in status: ${existing.status}`);
  }
  const evidenceMetadata = {
    ...(asRecord(existing.evidenceMetadata) ?? {}),
    verifiedAt: new Date().toISOString(),
    verifiedById: actor?.id,
    verifiedBy: actor?.name ?? actor?.id,
  };
  const row = await prisma.contentStudioSource.update({
    where: { id: sourceId },
    data: {
      status: "verified",
      evidenceMetadata: evidenceMetadata as Prisma.InputJsonValue,
    },
  });
  return mapSource(row);
}

export async function rejectSource(
  sourceId: string,
  organizationId: string,
  reason?: string,
): Promise<ContentSource> {
  const existing = await prisma.contentStudioSource.findFirst({
    where: { id: sourceId, organizationId },
  });
  if (!existing) throw new Error("Source not found");
  if (!canTransitionSource(existing.status as SourceStatus, "rejected")) {
    throw new Error(`Cannot reject source in status: ${existing.status}`);
  }
  const evidenceMetadata = {
    ...(asRecord(existing.evidenceMetadata) ?? {}),
    rejectionReason: reason,
    rejectedAt: new Date().toISOString(),
  };
  const row = await prisma.contentStudioSource.update({
    where: { id: sourceId },
    data: {
      status: "rejected",
      evidenceMetadata: evidenceMetadata as Prisma.InputJsonValue,
    },
  });
  return mapSource(row);
}

export async function updateSourceStatus(
  sourceId: string,
  organizationId: string,
  status: SourceStatus,
): Promise<ContentSource> {
  const existing = await prisma.contentStudioSource.findFirst({
    where: { id: sourceId, organizationId },
  });
  if (!existing) throw new Error("Source not found");
  if (!canTransitionSource(existing.status as SourceStatus, status)) {
    throw new Error(`Invalid source transition: ${existing.status} → ${status}`);
  }
  const row = await prisma.contentStudioSource.update({
    where: { id: sourceId },
    data: { status },
  });
  return mapSource(row);
}
