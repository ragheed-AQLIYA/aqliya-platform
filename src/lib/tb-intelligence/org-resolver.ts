import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Resolves AuditOrganization.id or PlatformOrganization.id → Organization.id
 * for Firm Memory, TBClassificationHistory, and TenantIntegration lookups.
 */
export async function resolveFirmMemoryOrganizationId(
  orgRef: string,
): Promise<string | null> {
  const direct = await prisma.organization.findUnique({
    where: { id: orgRef },
    select: { id: true },
  });
  if (direct) return direct.id;

  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: orgRef },
    select: { platformOrganizationId: true },
  });
  if (auditOrg?.platformOrganizationId) {
    const org = await prisma.organization.findFirst({
      where: { platformOrganizationId: auditOrg.platformOrganizationId },
      select: { id: true },
    });
    return org?.id ?? null;
  }

  const byPlatform = await prisma.organization.findFirst({
    where: { platformOrganizationId: orgRef },
    select: { id: true },
  });
  return byPlatform?.id ?? null;
}

export async function resolveFirmMemoryOrganizationIdFromEngagement(
  engagementId: string,
): Promise<string | null> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { organizationId: true },
  });
  if (!engagement?.organizationId) return null;
  return resolveFirmMemoryOrganizationId(engagement.organizationId);
}
