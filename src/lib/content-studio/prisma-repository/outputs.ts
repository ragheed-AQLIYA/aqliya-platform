import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { OutputPackage } from "../types";
import type { CreateOutputPackageInput } from "../contracts";
import { newId } from "../store";
import { canTransitionOutput } from "../workflow";
import { mapOutput } from "./common";

export async function createOutput(
  input: CreateOutputPackageInput,
): Promise<OutputPackage> {
  const campaign = await prisma.contentStudioCampaign.findFirst({
    where: { id: input.campaignId, organizationId: input.organizationId },
  });
  if (!campaign) throw new Error("Campaign not found");

  const includes = {
    campaignSummary: input.includes?.campaignSummary ?? true,
    contentCalendar: input.includes?.contentCalendar ?? true,
    approvedContent: input.includes?.approvedContent ?? true,
    complianceMemo: input.includes?.complianceMemo ?? true,
  };

  const row = await prisma.contentStudioOutput.create({
    data: {
      id: newId("out"),
      campaignId: input.campaignId,
      organizationId: input.organizationId,
      title: input.title,
      status: input.status ?? "draft",
      includes: includes as Prisma.InputJsonValue,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
  return mapOutput(row);
}

export async function listOutputs(
  organizationId: string,
): Promise<OutputPackage[]> {
  const rows = await prisma.contentStudioOutput.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOutput);
}

export async function getOutput(
  id: string,
  organizationId: string,
): Promise<OutputPackage | null> {
  const row = await prisma.contentStudioOutput.findFirst({
    where: { id, organizationId },
  });
  return row ? mapOutput(row) : null;
}

export async function updateOutput(
  id: string,
  organizationId: string,
  patch: Partial<
    Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
  >,
): Promise<OutputPackage> {
  const existing = await prisma.contentStudioOutput.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Output package not found");
  if (
    patch.status &&
    !canTransitionOutput(existing.status as OutputPackage["status"], patch.status)
  ) {
    throw new Error(`Cannot transition output to ${patch.status}`);
  }
  const row = await prisma.contentStudioOutput.update({
    where: { id },
    data: {
      status: patch.status,
      exportMetadata:
        patch.exportMetadata !== undefined
          ? (patch.exportMetadata as Prisma.InputJsonValue)
          : undefined,
      exportedAt: patch.exportedAt ? new Date(patch.exportedAt) : undefined,
    },
  });
  return mapOutput(row);
}
