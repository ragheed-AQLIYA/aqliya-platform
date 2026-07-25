import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import { recordAuditOsAuditEvent, safePublishStatuses } from "./common";
import { getPublicationPackage } from "../publication-db";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function publishEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<{ package: import("@/types/audit").PublicationPackage | null }> {
  try {
    let pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (!pkg) {
      pkg = await prisma.auditPublicationPackage.create({
        data: { engagementId, status: "published" },
      });
    }
    if (pkg.status === "published" || pkg.status === "locked") {
      throw new Error("Engagement is already published or locked");
    }
    const now = new Date();
    await prisma.auditPublicationPackage.update({
      where: { id: pkg.id },
      data: {
        status: "published",
        publishedAt: now,
        publishedBy: actorId,
        lockedAt: now,
      },
    });
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { status: true },
    });
    if (engagement && safePublishStatuses.includes(engagement.status)) {
      await prisma.auditEngagement.update({
        where: { id: engagementId },
        data: { status: "published" },
      });
    }
    await recordAuditOsAuditEvent({
      engagementId,
      eventType: "publication.published",
      actorId,
      actorName,
      actorRole: "partner",
      targetType: "publication_package",
      targetId: pkg.id,
      newState: "published",
      description: `Engagement published by ${actorName}`,
    });
    const result = await getPublicationPackage(engagementId);
    return { package: result };
  } catch (error) {
    logger.warn("[AuditDB] publishEngagement(${engagementId}) error", { error: error instanceof Error ? error?.message : String(error) });
    throw error;
  }
}
