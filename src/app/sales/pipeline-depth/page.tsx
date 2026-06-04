import { getCurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { listOpportunities } from "@/lib/sales/store";
import { buildPipelineDepthMetrics } from "@/lib/sales/intelligence/pipeline-depth";
import { PipelineDepthView } from "@/components/sales/pipeline-depth-view";
import { SalesSubNav } from "@/components/sales/sales-subnav";

export const dynamic = "force-dynamic";

export default async function SalesPipelineDepthPage() {
  const user = await getCurrentUser();
  initSalesWorkspace(user);
  const snapshot = buildPipelineDepthMetrics(
    listOpportunities(user.organizationId),
  );

  return (
    <div dir="rtl">
      <SalesSubNav />
      <PipelineDepthView snapshot={snapshot} />
    </div>
  );
}
