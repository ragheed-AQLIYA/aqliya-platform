import { getCurrentUser } from "@/lib/auth";
import { getRevenueIntelligenceView } from "@/lib/sales/vnext/revenue-intelligence";
import { RevenueIntelligenceView } from "@/components/sales/revenue-intelligence-view";

export const dynamic = "force-dynamic";

export default async function SalesRevenuePage() {
  const user = await getCurrentUser();
  const snapshot = await getRevenueIntelligenceView(user);

  return <RevenueIntelligenceView snapshot={snapshot} />;
}
