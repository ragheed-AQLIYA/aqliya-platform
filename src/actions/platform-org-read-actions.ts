"use server";

import { prisma } from "@/lib/prisma";

export async function getLinkedLegacyOrgs(platformOrgId: string) {
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

  return {
    legacyDecisionOrg: decisionOrgs[0] ?? null,
    legacyAuditOrgs: auditOrgs,
  };
}
