import { getCurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import {
  listAccounts,
  listAllInteractions,
  listContactsForAccount,
  listICPInsights,
  listOpportunities,
  listWinLossInsights,
} from "@/lib/sales/store";
import { buildICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import { ICPLearningView } from "@/components/sales/icp-learning-view";

export const dynamic = "force-dynamic";

export default async function SalesICPPage() {
  const user = await getCurrentUser();
  await initSalesWorkspace(user);
  const orgId = user.organizationId;

  const accounts = listAccounts(orgId);
  const opportunities = listOpportunities(orgId);
  const icpInsights = listICPInsights(orgId);
  const winLossInsights = listWinLossInsights(orgId);
  const interactions = listAllInteractions(orgId);
  const contacts = accounts.flatMap((account) =>
    listContactsForAccount(orgId, account.id),
  );

  const snapshot = buildICPLearningSnapshot({
    organizationId: orgId,
    accounts,
    opportunities,
    contacts,
    icpInsights,
    winLossInsights,
    interactions,
  });

  return <ICPLearningView snapshot={snapshot} />;
}
