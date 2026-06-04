import "server-only";

import { prisma } from "@/lib/prisma";
import type { ArchivedEngagementRow } from "./engagement-archival";

export async function listArchivedEngagements(
  organizationId: string,
): Promise<ArchivedEngagementRow[]> {
  const engagements = await prisma.auditEngagement.findMany({
    where: { organizationId, status: "archived" },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  if (engagements.length === 0) return [];

  const ids = engagements.map((e) => e.id);
  const archiveEvents = await prisma.auditEvent.findMany({
    where: {
      engagementId: { in: ids },
      eventType: "engagement.archived",
    },
    orderBy: { timestamp: "desc" },
  });

  const eventByEngagement = new Map<string, (typeof archiveEvents)[number]>();
  for (const ev of archiveEvents) {
    if (!eventByEngagement.has(ev.engagementId)) {
      eventByEngagement.set(ev.engagementId, ev);
    }
  }

  return engagements.map((e) => {
    const ev = eventByEngagement.get(e.id);
    return {
      engagementId: e.id,
      clientName: e.client?.name ?? "—",
      fiscalPeriod: e.fiscalPeriod,
      previousStatus: ev?.previousState ?? "published",
      archivedAt: ev?.timestamp.toISOString() ?? e.updatedAt.toISOString(),
      archivedBy: ev?.actorName ?? null,
    };
  });
}
