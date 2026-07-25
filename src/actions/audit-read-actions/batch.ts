"use server"

import { prisma } from "@/lib/prisma"
import { getAuditActor } from "@/lib/audit/actor-context"

export async function getProjectsBatch(projectIds: string[]) {
  const actor = await getAuditActor()
  if (projectIds.length === 0) return []
  return prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true, projectType: true },
  })
}

export async function getWorkspacesBatch(workspaceIds: string[]) {
  const actor = await getAuditActor()
  if (workspaceIds.length === 0) return []
  return prisma.clientWorkspace.findMany({
    where: { id: { in: workspaceIds } },
    select: { id: true, name: true, slug: true },
  })
}
