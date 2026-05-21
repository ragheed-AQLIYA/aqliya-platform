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

  const workflowosClientCount = await prisma.sunbulClient.count();
  const workflowosMembershipCount = await prisma.sunbulUserMembership.count();
  const workflowosRecordCount = await prisma.sunbulRecord.count();

  const workflowosStatus =
    workflowosRecordCount > 0 ? "جاهز للتشغيل" : "نموذج أولي";

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
        workflowosClientCount,
        workflowosMembershipCount,
        workflowosRecordCount,
        workflowosStatus,
      }}
    />
  );
}
