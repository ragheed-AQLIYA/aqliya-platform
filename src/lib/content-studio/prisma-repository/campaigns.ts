import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Campaign, CampaignStatus } from "../types";
import type { CreateCampaignInput } from "../contracts";
import { newId } from "../store";
import { assertCampaignTransition } from "../workflow";
import { mapCampaign } from "./common";

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<Campaign> {
  const project = await prisma.contentStudioProject.findFirst({
    where: {
      id: input.contentProjectId,
      organizationId: input.organizationId,
    },
  });
  if (!project) throw new Error("Content project not found");

  const row = await prisma.contentStudioCampaign.create({
    data: {
      id: newId("camp"),
      contentProjectId: input.contentProjectId,
      organizationId: input.organizationId,
      name: input.name,
      objective: input.objective ?? null,
      audience: input.audience ?? null,
      channels: (input.channels ?? []) as Prisma.InputJsonValue,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: input.status ?? "draft",
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
  return mapCampaign(row);
}

export async function listCampaigns(
  organizationId: string,
): Promise<Campaign[]> {
  const rows = await prisma.contentStudioCampaign.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCampaign);
}

export async function getCampaign(
  id: string,
  organizationId: string,
): Promise<Campaign | null> {
  const row = await prisma.contentStudioCampaign.findFirst({
    where: { id, organizationId },
  });
  return row ? mapCampaign(row) : null;
}

export async function updateCampaignState(
  id: string,
  organizationId: string,
  status: CampaignStatus,
): Promise<Campaign> {
  const existing = await prisma.contentStudioCampaign.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Campaign not found");
  assertCampaignTransition(existing.status as CampaignStatus, status);
  const row = await prisma.contentStudioCampaign.update({
    where: { id },
    data: { status },
  });
  return mapCampaign(row);
}
