import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrganizationWorkspace } from "@/components/organization/organization-workspace";

export default async function SunbulOrganizationPage() {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const allUsers = await prisma.user.findMany({
    select: { role: true },
  });

  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;
  const operatorCount = allUsers.filter((u) => u.role === "OPERATOR").length;
  const viewerCount = allUsers.filter((u) => u.role === "VIEWER").length;

  const sunbulClientCount = await prisma.sunbulClient.count();
  const sunbulMembershipCount = await prisma.sunbulUserMembership.count();
  const sunbulRecordCount = await prisma.sunbulRecord.count();

  const sunbulStatus = sunbulRecordCount > 0 ? "جاهز للتشغيل" : "نموذج أولي";

  return (
    <OrganizationWorkspace
      data={{
        name: "Sunbul",
        nameAr: "شركة سنبل",
        userCounts: {
          admin: adminCount,
          operator: operatorCount,
          viewer: viewerCount,
          total: allUsers.length,
        },
        sunbulClientCount,
        sunbulMembershipCount,
        sunbulRecordCount,
        sunbulStatus,
      }}
    />
  );
}
