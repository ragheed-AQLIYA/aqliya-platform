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
  // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
  const archiveEvents = await prisma.platformAuditLog.findMany({
    where: {
      productKey: "audit_os",
      sourceId: { in: ids },
      action: "engagement.archived",
    },
    orderBy: { createdAt: "desc" },
  });

  const eventByEngagement = new Map<string, (typeof archiveEvents)[number]>();
  for (const ev of archiveEvents) {
    const engId = (ev.metadata as Record<string, unknown> | null)?.engagementId as string | undefined;
    if (engId && !eventByEngagement.has(engId)) {
      eventByEngagement.set(engId, ev);
    }
  }

  return engagements.map((e) => {
    const ev = eventByEngagement.get(e.id);
    return {
      engagementId: e.id,
      clientName: e.client?.name ?? "—",
      fiscalPeriod: e.fiscalPeriod,
      previousStatus: ev?.beforeState ?? "published",
      archivedAt: ev?.createdAt.toISOString() ?? e.updatedAt.toISOString(),
      archivedBy: ev?.actorName ?? null,
    };
  });
}
