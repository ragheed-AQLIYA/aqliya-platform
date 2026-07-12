import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSunbulStats } from "@/actions/admin-actions";
import { OrganizationWorkspace } from "@/components/organization/organization-workspace";

export default async function SunbulOrganizationPage() {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const stats = await getSunbulStats();

  return (
    <OrganizationWorkspace
      data={{
        name: "Sunbul",
        nameAr: "شركة سنبل",
        userCounts: {
          admin: stats.adminCount,
          operator: stats.operatorCount,
          viewer: stats.viewerCount,
          total: stats.totalUsers,
        },
        sunbulClientCount: stats.sunbulClientCount,
        sunbulMembershipCount: stats.sunbulMembershipCount,
        sunbulRecordCount: stats.sunbulRecordCount,
        sunbulStatus: stats.sunbulStatus,
      }}
    />
  );
}
