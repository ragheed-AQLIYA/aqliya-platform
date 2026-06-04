import { getCurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { listOpportunities } from "@/lib/sales/store";
import { buildConversionFunnel } from "@/lib/sales/intelligence/conversion-funnel";
import { ConversionFunnelView } from "@/components/sales/conversion-funnel-view";
import { SalesSubNav } from "@/components/sales/sales-subnav";

export const dynamic = "force-dynamic";

export default async function SalesFunnelPage() {
  const user = await getCurrentUser();
  initSalesWorkspace(user);
  const funnel = buildConversionFunnel(listOpportunities(user.organizationId));

  return (
    <div dir="rtl">
      <SalesSubNav />
      <ConversionFunnelView funnel={funnel} />
    </div>
  );
}
