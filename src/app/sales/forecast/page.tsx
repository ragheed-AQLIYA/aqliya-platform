import { getCurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { listOpportunities } from "@/lib/sales/store";
import { buildPipelineForecast } from "@/lib/sales/intelligence/pipeline-forecast";
import { PipelineForecastView } from "@/components/sales/pipeline-forecast-view";
import { SalesSubNav } from "@/components/sales/sales-subnav";

export const dynamic = "force-dynamic";

export default async function SalesForecastPage() {
  const user = await getCurrentUser();
  initSalesWorkspace(user);
  const forecast = buildPipelineForecast(listOpportunities(user.organizationId));

  return (
    <div dir="rtl">
      <SalesSubNav />
      <PipelineForecastView forecast={forecast} />
    </div>
  );
}
