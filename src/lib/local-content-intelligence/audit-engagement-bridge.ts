/**
 * Resolve linked AuditOS engagement for LC / platform cross-product flows.
 */

import { prisma } from "@/lib/prisma";

export async function resolveAuditEngagementIdForLcProject(
  projectId: string,
): Promise<string | null> {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { metadata: true, projectId: true },
  });
  if (!project) return null;

  const meta = project.metadata;
  if (meta && typeof meta === "object") {
    const fromMeta = (meta as { auditEngagementId?: unknown }).auditEngagementId;
    if (typeof fromMeta === "string" && fromMeta.trim()) {
      return fromMeta.trim();
    }
  }

  if (project.projectId) {
    const engagement = await prisma.auditEngagement.findFirst({
      where: { projectId: project.projectId },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });
    if (engagement) return engagement.id;
  }

  return null;
}

export async function resolveLcProjectIdForEngagement(
  engagementId: string,
): Promise<{ projectId: string; projectName: string } | null> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { projectId: true },
  });

  if (engagement?.projectId) {
    const byPlatform = await prisma.localContentProject.findFirst({
      where: { projectId: engagement.projectId },
      select: { id: true, name: true },
    });
    if (byPlatform) {
      return { projectId: byPlatform.id, projectName: byPlatform.name };
    }
  }

  const candidates = await prisma.localContentProject.findMany({
    select: { id: true, name: true, metadata: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  for (const project of candidates) {
    if (!project.metadata || typeof project.metadata !== "object") continue;
    const linked = (project.metadata as { auditEngagementId?: unknown })
      .auditEngagementId;
    if (linked === engagementId) {
      return { projectId: project.id, projectName: project.name };
    }
  }

  return null;
}
