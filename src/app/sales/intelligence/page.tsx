import { getCurrentUser } from "@/lib/auth";
import {
  getSalesIntelligenceMemory,
  initSalesWorkspace,
} from "@/lib/sales/service";
import { salesGetCommercialKnowledgeGraphSnapshot } from "@/lib/sales/services/commercial-knowledge-graph-service";
import { salesBuildCommercialProofNetworkOverview } from "@/lib/sales/services/commercial-proof-network-service";
import { salesGetInstitutionalLearningForOrg } from "@/lib/sales/services/institutional-learning-service";
import { salesGetMarketIntelligenceForOrg } from "@/lib/sales/services/market-intelligence-service";
import { salesBuildProofEffectivenessWaveB } from "@/lib/sales/services/proof-effectiveness-service";
import { IntelligenceHub } from "@/components/sales/intelligence-hub";

export const dynamic = "force-dynamic";

export default async function SalesIntelligencePage() {
  const user = await getCurrentUser();
  await initSalesWorkspace(user);
  const orgId = user.organizationId;

  const memory = await getSalesIntelligenceMemory(user);
  const marketIntelligence = salesGetMarketIntelligenceForOrg(orgId);
  const proofEffectiveness = salesBuildProofEffectivenessWaveB(orgId);
  const knowledgeGraph = salesGetCommercialKnowledgeGraphSnapshot(orgId);
  const proofNetwork = salesBuildCommercialProofNetworkOverview(orgId);
  const institutionalLearning = salesGetInstitutionalLearningForOrg(orgId);

  return (
    <IntelligenceHub
      marketIntelligence={marketIntelligence}
      proofEffectiveness={proofEffectiveness}
      memory={{
        objections: memory.objections,
        competitors: memory.competitors,
        signals: memory.signals,
        auditRecent: memory.auditRecent,
        interactionCount: memory.interactionCount,
        disclaimerAr: memory.disclaimerAr,
        opportunityInsights: memory.opportunityInsights,
      }}
      institutionalLearning={institutionalLearning}
      knowledgeGraph={knowledgeGraph}
      proofNetwork={proofNetwork}
    />
  );
}
