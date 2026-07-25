import { prisma } from "./common";

export async function listAuditEvents(projectId: string) {
  // [MIGRATED] localContentAuditEvent → platformAuditLog (dual-write with productKey: "local_content")
  // return prisma.localContentAuditEvent.findMany({
  //   where: { projectId },
  //   orderBy: { createdAt: "desc" },
  //   take: 100,
  // });
  return prisma.platformAuditLog.findMany({
    where: { productKey: "local_content", projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
