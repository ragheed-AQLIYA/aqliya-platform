import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OrganizationWorkspace } from "@/components/organization/organization-workspace";
import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const org = await prisma.organization.findFirst({
    where: {
      id,
      ...(user.organizationId
        ? { platformOrganizationId: user.organizationId }
        : {}),
    },
    include: {
      _count: {
        select: { users: true, decisions: true },
      },
      users: {
        select: { role: true },
      },
    },
  });

  if (!org) {
    notFound();
  }

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

  // Sunbul / WorkflowOS counts
  const platformOrgId = org.platformOrganizationId;
  let sunbulClientCount = 0;
  let sunbulRecordCount = 0;
  let sunbulMembershipCount = 0;

  if (platformOrgId) {
    sunbulClientCount = await prisma.sunbulClient.count({
      where: { platformOrganizationId: platformOrgId },
    });
    sunbulRecordCount = await prisma.workflowRecord.count({
      where: {
        template: { platformOrganizationId: platformOrgId },
      },
    });
    sunbulMembershipCount = await prisma.workflowTemplate.count({
      where: { platformOrganizationId: platformOrgId },
    });
  }

  const sunbulStatus =
    sunbulRecordCount > 0
      ? "نشط"
      : sunbulClientCount > 0
        ? "جاهز"
        : "غير مفعل";

  const orgData = {
    orgId: org.id,
    name: org.name,
    nameAr: org.name,
    platformOrgId: org.platformOrganizationId || undefined,
    userCounts: {
      admin: roleCounts["ADMIN"] || 0,
      operator: roleCounts["OPERATOR"] || 0,
      viewer: roleCounts["VIEWER"] || 0,
      total: org._count.users,
    },
    sunbulClientCount,
    sunbulMembershipCount,
    sunbulRecordCount,
    sunbulStatus,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/organizations"
          className="hover:text-foreground transition-colors"
        >
          المؤسسات
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{org.name}</span>
      </div>

      {/* Organization Workspace */}
      <OrganizationWorkspace data={orgData} />
    </div>
  );
}
