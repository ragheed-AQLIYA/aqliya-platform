import { getCurrentUser } from "@/lib/auth";
import { getSalesDashboard } from "@/lib/sales/service";
import { SalesWorkspace } from "@/components/sales/sales-workspace";

export default async function SalesDashboardPage() {
  const user = await getCurrentUser();
  const dashboard = getSalesDashboard(user);

  return (
    <SalesWorkspace
      accounts={dashboard.accounts}
      opportunities={dashboard.opportunities}
      pipelineValue={dashboard.pipelineValue}
      byStage={dashboard.byStage}
    />
  );
}
