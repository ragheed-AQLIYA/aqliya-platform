import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationAction } from "@/actions/organization-actions";
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

  let orgDetail;
  try {
    const result = await getOrganizationAction(id);
    if (!result.ok) notFound();
    orgDetail = result.data;
  } catch {
    notFound();
  }

  if (!orgDetail) notFound();

  const orgData = {
    orgId: orgDetail.id,
    name: orgDetail.name,
    nameAr: orgDetail.name,
    platformOrgId: orgDetail.platformOrganizationId || undefined,
    userCounts: orgDetail.userCounts,
    sunbulClientCount: orgDetail.sunbulClientCount,
    sunbulMembershipCount: orgDetail.sunbulMembershipCount,
    sunbulRecordCount: orgDetail.sunbulRecordCount,
    sunbulStatus: orgDetail.sunbulStatus,
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
        <span className="text-foreground font-medium">{orgDetail.name}</span>
      </div>

      {/* Organization Workspace */}
      <OrganizationWorkspace data={orgData} />
    </div>
  );
}
