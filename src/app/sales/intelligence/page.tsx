import { getCurrentUser } from "@/lib/auth";
import {
  getSalesIntelligenceMemory,
  initSalesWorkspace,
} from "@/lib/sales/service";
import { salesGetMarketIntelligenceForOrg } from "@/lib/sales/services/market-intelligence-service";
import { salesBuildProofEffectivenessAnalysis } from "@/lib/sales/services/proof-effectiveness-service";
import { salesGetCommercialKnowledgeGraphSnapshot } from "@/lib/sales/services/commercial-knowledge-graph-service";
import { IntelligenceHub } from "@/components/sales/intelligence-hub";
import { IntelligenceMemoryView } from "@/components/sales/intelligence-memory-view";
import { MarketIntelligenceView } from "@/components/sales/market-intelligence-view";
import { ProofEffectivenessView } from "@/components/sales/proof-effectiveness-view";
import { CommercialKnowledgeGraphPanel } from "@/components/sales/commercial-knowledge-graph-panel";

export const dynamic = "force-dynamic";

export default async function SalesIntelligencePage() {
  const user = await getCurrentUser();
  initSalesWorkspace(user);
  const orgId = user.organizationId;

  const [memory, marketView, proofAnalysis, graphSnapshot] = await Promise.all([
    getSalesIntelligenceMemory(user),
    Promise.resolve(salesGetMarketIntelligenceForOrg(orgId)),
    Promise.resolve(salesBuildProofEffectivenessAnalysis(orgId)),
    Promise.resolve(salesGetCommercialKnowledgeGraphSnapshot(orgId, 12)),
  ]);

  const competitorsView = memory.competitors.map((c) => ({
    id: c.id,
    name: c.competitorName,
    accountId: c.accountId,
    contextAr: c.context,
  }));

  return (
    <IntelligenceHub
      marketPanel={<MarketIntelligenceView data={marketView} />}
      proofPanel={<ProofEffectivenessView analysis={proofAnalysis} />}
      memoryPanel={
        <IntelligenceMemoryView
          objections={memory.objections}
          competitors={competitorsView}
          signals={memory.signals}
          auditRecent={memory.auditRecent}
          interactionCount={memory.interactionCount}
          opportunityInsights={memory.opportunityInsights}
        />
      }
      graphPanel={<CommercialKnowledgeGraphPanel snapshot={graphSnapshot} />}
    />
  );
}
