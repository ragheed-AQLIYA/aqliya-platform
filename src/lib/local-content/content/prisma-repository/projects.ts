import "server-only";

import { prisma } from "@/lib/prisma";
import type { ContentProject } from "../types";
import type { CreateContentProjectInput } from "../contracts";
import { newId } from "../store";
import { mapProject } from "./common";

export async function createProject(input: CreateContentProjectInput): Promise<ContentProject> {
  const row = await prisma.contentStudioProject.create({
    data: {
      id: newId("cproj"),
      organizationId: input.organizationId,
      platformOrganizationId: input.platformOrganizationId ?? null,
      title: input.title,
      objective: input.objective ?? null,
      audience: input.audience ?? null,
      language: input.language ?? "ar",
      status: input.status ?? "draft",
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
  return mapProject(row);
}

export async function listProjects(organizationId: string): Promise<ContentProject[]> {
  const rows = await prisma.contentStudioProject.findMany({
    take: 100,
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProject);
}

export async function getProject(id: string, organizationId: string): Promise<ContentProject | null> {
  const row = await prisma.contentStudioProject.findFirst({
    where: { id, organizationId },
  });
  return row ? mapProject(row) : null;
}
