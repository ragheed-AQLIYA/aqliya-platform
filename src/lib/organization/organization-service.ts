// ─── Organization Service ───
// Server-only Prisma queries for organization management.
import { prisma } from "@/lib/prisma";

export interface OrgWithCounts {
  id: string;
  name: string;
  platformOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userCount: number;
  decisionCount: number;
}

export interface OrgDetailData {
  id: string;
  name: string;
  platformOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userCounts: {
    admin: number;
    operator: number;
    viewer: number;
    total: number;
  };
  decisionCount: number;
  sunbulClientCount: number;
  sunbulMembershipCount: number;
  sunbulRecordCount: number;
  sunbulStatus: string;
  enabledProducts: string[];
}

export async function listOrganizations(
  platformOrgId?: string,
): Promise<OrgWithCounts[]> {
  const where = platformOrgId
    ? { platformOrganizationId: platformOrgId }
    : {};

  const orgs = await prisma.organization.findMany({
    where,
    include: {
      _count: {
        select: {
          users: true,
          decisions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
    platformOrganizationId: org.platformOrganizationId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    userCount: org._count.users,
    decisionCount: org._count.decisions,
  }));
}

export async function getOrganizationDetail(
  orgId: string,
  platformOrgId?: string,
): Promise<OrgDetailData | null> {
  const where: Record<string, unknown> = { id: orgId };
  if (platformOrgId) {
    where.platformOrganizationId = platformOrgId;
  }

  const org = await prisma.organization.findFirst({
    where,
    include: {
      _count: {
        select: {
          users: true,
          decisions: true,
        },
      },
      users: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!org) return null;

  // Count users by role
  const roleCounts: Record<string, number> = {
    ADMIN: 0,
    OPERATOR: 0,
    VIEWER: 0,
  };
  for (const u of org.users) {
    const key = u.role as string;
    roleCounts[key] = (roleCounts[key] || 0) + 1;
  }

  // Sunbul-related counts (through PlatformOrganization)
  let sunbulClientCount = 0;
  let sunbulMembershipCount = 0;
  let sunbulRecordCount = 0;
  let sunbulStatus = "غير مفعل";

  if (platformOrgId) {
    const sunbulClients = await prisma.sunbulClient.findMany({
      where: { platformOrganizationId: platformOrgId },
      select: { id: true },
    });
    sunbulClientCount = sunbulClients.length;

    sunbulRecordCount = await prisma.workflowRecord.count({
      where: {
        template: {
          platformOrganizationId: platformOrgId,
        },
      },
    });

    const workflowTemplates = await prisma.workflowTemplate.count({
      where: { platformOrganizationId: platformOrgId },
    });

    sunbulMembershipCount = workflowTemplates;
    sunbulStatus =
      sunbulRecordCount > 0
        ? "نشط"
        : sunbulClientCount > 0
          ? "جاهز"
          : "غير مفعل";
  } else if (org.platformOrganizationId) {
    const poId = org.platformOrganizationId;
    sunbulClientCount = await prisma.sunbulClient.count({
      where: { platformOrganizationId: poId },
    });
    sunbulRecordCount = await prisma.workflowRecord.count({
      where: { template: { platformOrganizationId: poId } },
    });
    sunbulMembershipCount = await prisma.workflowTemplate.count({
      where: { platformOrganizationId: poId },
    });
    sunbulStatus =
      sunbulRecordCount > 0
        ? "نشط"
        : sunbulClientCount > 0
          ? "جاهز"
          : "غير مفعل";
  }

  return {
    id: org.id,
    name: org.name,
    platformOrganizationId: org.platformOrganizationId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    userCounts: {
      admin: roleCounts["ADMIN"] || 0,
      operator: roleCounts["OPERATOR"] || 0,
      viewer: roleCounts["VIEWER"] || 0,
      total: org._count.users,
    },
    decisionCount: org._count.decisions,
    sunbulClientCount,
    sunbulMembershipCount,
    sunbulRecordCount,
    sunbulStatus,
    enabledProducts: getEnabledProducts(org._count.decisions > 0),
  };
}

function getEnabledProducts(hasDecisions: boolean): string[] {
  const products = ["AuditOS", "WorkflowOS (سنبل)"];
  if (hasDecisions) products.push("DecisionOS");
  products.push("Office AI Assistant");
  return products;
}

export async function updateOrganization(
  orgId: string,
  data: { name?: string },
): Promise<OrgWithCounts | null> {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { name: data.name },
  });

  return {
    id: org.id,
    name: org.name,
    platformOrganizationId: org.platformOrganizationId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    userCount: await prisma.user.count({ where: { organizationId: org.id } }),
    decisionCount: await prisma.decision.count({
      where: { organizationId: org.id },
    }),
  };
}

export async function createOrganization(data: {
  name: string;
  platformOrganizationId: string;
}): Promise<OrgWithCounts> {
  const org = await prisma.organization.create({
    data: {
      name: data.name,
      platformOrganizationId: data.platformOrganizationId,
    },
  });

  return {
    id: org.id,
    name: org.name,
    platformOrganizationId: org.platformOrganizationId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    userCount: 0,
    decisionCount: 0,
  };
}

export async function deleteOrganization(orgId: string): Promise<boolean> {
  // Soft-delete: only allow if no users or decisions exist
  const counts = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: { select: { users: true, decisions: true } },
    },
  });

  if (!counts || counts._count.users > 0 || counts._count.decisions > 0) {
    return false;
  }

  await prisma.organization.delete({ where: { id: orgId } });
  return true;
}
