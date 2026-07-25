import { prisma } from "@/lib/prisma";
import { recordAuditOsAuditEvent } from "./common";

export async function archiveEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status === "archived")
    throw new Error("Engagement is already archived");

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: "archived" },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.archived",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: engagement.status,
    newState: "archived",
    description: `Engagement archived by ${actorName}`,
  });
}

export async function restoreEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<string> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status !== "archived")
    throw new Error("Engagement is not archived");

  // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
  const lastArchive = await prisma.platformAuditLog.findFirst({
    where: { productKey: "audit_os", sourceId: engagementId, action: "engagement.archived" },
    orderBy: { createdAt: "desc" },
    select: { beforeState: true },
  });
  const restoreStatus =
    lastArchive?.beforeState &&
    lastArchive.beforeState !== "archived"
      ? lastArchive.beforeState
      : "published";

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: restoreStatus },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.restored",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: "archived",
    newState: restoreStatus,
    description: `Engagement restored by ${actorName}`,
  });
  return restoreStatus;
}
