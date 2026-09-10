"use server";

import { getCurrentUser } from "@/lib/auth";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export async function getLinkedLegacyOrgs(platformOrgId: string) {
  const user = await getCurrentUser();
  assertPlatformAdmin(user);

  // Scope: only allow querying the caller's own platformOrganizationId
  const scopedId = user.platformOrganizationId || user.organizationId;
  if (platformOrgId !== scopedId) {
    throw new Error("Access denied: cannot query other platform organizations");
  }

  const [decisionOrgs, auditOrgs] = await Promise.all([
    prisma.organization.findMany({
      where: { platformOrganizationId: platformOrgId },
      select: { id: true, name: true },
    }),
    prisma.auditOrganization.findMany({
      where: { platformOrganizationId: platformOrgId },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: scopedId,
    action: "PLATFORM_ORG_READ_LEGACY",
    actorId: user.id,
    actorType: "user",
    targetType: "platform_organization",
    targetId: platformOrgId,
    targetLabel: `linked-legacy-orgs`,
    metadata: {
      decisionOrgCount: decisionOrgs.length,
      auditOrgCount: auditOrgs.length,
    },
  });

  return {
    legacyDecisionOrg: decisionOrgs[0] ?? null,
    legacyAuditOrgs: auditOrgs,
  };
}
