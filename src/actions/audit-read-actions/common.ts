import { prisma } from "@/lib/prisma"

export const APPROVED_STATUSES = ["approved", "published"]

export async function assertEvidenceInEngagement(
  evidenceId: string,
  engagementId: string,
  organizationId: string,
): Promise<void> {
  const row = await prisma.auditEvidence.findFirst({
    where: {
      id: evidenceId,
      engagementId,
      engagement: { organizationId },
    },
    select: { id: true },
  });
  if (!row) throw new Error("Evidence not found");
}
