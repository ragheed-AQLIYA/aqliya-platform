import type { CurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { getRevenueIntelligenceView } from "@/lib/sales/services/revenue-intelligence-service";
import { buildICPLearningSnapshot, ICP_DISCLAIMER_AR } from "@/lib/sales/services/icp-learning-service";
import { salesBuildInstitutionalLearningSnapshot } from "@/lib/sales/services/institutional-learning-service";
import { salesGetMarketIntelligenceForOrg } from "@/lib/sales/services/market-intelligence-service";
import { salesGetCommercialRecommendations } from "@/lib/sales/services/commercial-recommendations-service";
import { salesListCrossProductSignalsForCommandCenter } from "@/lib/sales/services/cross-product-signals-service";
import { COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR } from "@/lib/sales/vnext/commercial-recommendations";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { InstitutionalLearningSnapshot } from "@/lib/sales/v02/institutional-learning";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";
import type { ExecutiveCommercialSnapshot } from "./types";
import { EXECUTIVE_COMMERCIAL_DISCLAIMER_AR, loadOrgSalesData } from "./common";
import { buildRevenueSection } from "./revenue";
import { buildPipelineSection } from "./pipeline";
import { buildIcpSection } from "./icp";
import { buildProofSection } from "./proof";
import { buildSignalsSection } from "./signals";
import { buildRecommendationsSection } from "./recommendations";
import { buildLearningTrendsSection } from "./learning-trends";
import { buildExecutiveRisksSection } from "./risks";

export async function salesBuildExecutiveCommercialSnapshot(
  user: CurrentUser,
): Promise<ExecutiveCommercialSnapshot> {
  await initSalesWorkspace(user);
  const orgId = user.organizationId;
  const base = loadOrgSalesData(orgId);

  let revenueSnapshot: RevenueIntelligenceSnapshot | null = null;
  let revenueError: unknown;
  try {
    revenueSnapshot = await getRevenueIntelligenceView(user);
  } catch (err) {
    revenueError = err;
  }

  let icpSnapshot: ICPLearningSnapshot | null = null;
  let icpError: unknown;
  try {
    icpSnapshot = buildICPLearningSnapshot({
      organizationId: orgId,
      accounts: base.accounts,
      opportunities: base.opportunities,
      contacts: base.contacts,
      icpInsights: base.icpInsights,
      winLossInsights: base.winLossInsights,
      interactions: base.interactions,
    });
  } catch (err) {
    icpError = err;
  }

  let institutionalSnapshot: InstitutionalLearningSnapshot | null = null;
  let institutionalError: unknown;
  try {
    institutionalSnapshot = salesBuildInstitutionalLearningSnapshot(orgId);
  } catch (err) {
    institutionalError = err;
  }

  let marketView: WaveBMarketIntelligenceView | null = null;
  try {
    marketView = salesGetMarketIntelligenceForOrg(orgId);
  } catch {
    marketView = null;
  }

  let commercialRecs: ReturnType<typeof salesGetCommercialRecommendations> | null = null;
  try {
    commercialRecs = salesGetCommercialRecommendations(orgId);
  } catch {
    commercialRecs = null;
  }

  let crossProductSignals: WaveAInstitutionalSignal[] | null = null;
  try {
    crossProductSignals = await salesListCrossProductSignalsForCommandCenter(
      orgId,
      user.id,
      8,
    );
  } catch {
    crossProductSignals = null;
  }

  return {
    organizationId: orgId,
    generatedAt: new Date().toISOString(),
    disclaimerAr: `${EXECUTIVE_COMMERCIAL_DISCLAIMER_AR} ${ICP_DISCLAIMER_AR} ${COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR}`,
    revenue: buildRevenueSection(revenueSnapshot, revenueError),
    pipeline: buildPipelineSection(orgId, revenueSnapshot, revenueError),
    icp: buildIcpSection(icpSnapshot, icpError),
    proof: buildProofSection(orgId),
    signals: buildSignalsSection(orgId, marketView, crossProductSignals),
    recommendations: buildRecommendationsSection(orgId),
    learningTrends: buildLearningTrendsSection(
      institutionalSnapshot,
      icpSnapshot,
      institutionalError,
      icpError,
    ),
    executiveRisks: buildExecutiveRisksSection(
      revenueSnapshot,
      commercialRecs,
      crossProductSignals,
      marketView,
    ),
  };
}

export async function salesGetExecutiveCommercialView(
  user: CurrentUser,
): Promise<ExecutiveCommercialSnapshot> {
  return salesBuildExecutiveCommercialSnapshot(user);
}
