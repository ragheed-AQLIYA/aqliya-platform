"use server";

import { prisma } from "@/lib/prisma";

export async function getWorkspaceStats() {
  const [
    auditClientsTotal,
    auditClientsLinked,
    engagementsTotal,
    engagementsLinked,
    projectsTotal,
    workspaceTotal,
  ] = await Promise.all([
    prisma.auditClient.count(),
    prisma.auditClient.count({ where: { clientWorkspaceId: { not: null } } }),
    prisma.auditEngagement.count(),
    prisma.auditEngagement.count({ where: { projectId: { not: null } } }),
    prisma.project.count(),
    prisma.clientWorkspace.count(),
  ]);

  const auditClientsUnlinked = auditClientsTotal - auditClientsLinked;
  const engagementsUnlinked = engagementsTotal - engagementsLinked;

  return {
    auditClientsTotal,
    auditClientsLinked,
    engagementsTotal,
    engagementsLinked,
    projectsTotal,
    workspaceTotal,
    auditClientsUnlinked,
    engagementsUnlinked,
  };
}

export async function getWorkspacesWithLinks(platformOrgId: string, offset?: number) {
  const PAGE_SIZE = 50;
  const skip = offset || 0;
  const where = { platformOrganizationId: platformOrgId };
  const [workspaces, totalCount] = await Promise.all([
    prisma.clientWorkspace.findMany({
      where,
      include: {
        _count: { select: { projects: true, auditClients: true } },
        auditClients: {
          select: { id: true, name: true },
        },
        projects: {
          include: {
            _count: { select: { auditEngagements: true } },
            auditEngagements: {
              select: { id: true, fiscalPeriod: true },
              take: 5,
            },
          },
        },
      },
      orderBy: { name: "asc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.clientWorkspace.count({ where }),
  ]);
  return { workspaces, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
}
