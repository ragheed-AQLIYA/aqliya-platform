import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getSalesDashboardDataAction } from "@/actions/sales-read-actions";
import { SalesDashboardClient } from "./sales-dashboard-client";

export default async function SalesDashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const organizationId = user.organizationId;
  if (!organizationId) {
    return (
      <SalesDashboardClient
        stats={null}
        statsError="لم يتم تعيين المؤسسة للمستخدم الحالي"
        hasDbData={false}
      />
    );
  }

  const result = await getSalesDashboardDataAction();

  if (!result.ok) {
    return (
      <SalesDashboardClient
        stats={null}
        statsError={result.error}
        hasDbData={false}
      />
    );
  }

  const { accountCount, dealCount, openDealCount, dealsByStage, latestDeals } = result.data;
  const stats = {
    accountCount,
    dealCount,
    openDealCount,
    dealsByStage,
    latestDeals,
  };

  return (
    <SalesDashboardClient
      stats={stats}
      hasDbData={accountCount > 0 || dealCount > 0}
    />
  );
}
