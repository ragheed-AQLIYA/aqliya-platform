import {
  countStalledOpportunities,
  deriveCompetitorMentions,
  extractObjectionsFromInteractions,
} from "../intelligence/commercial-memory";
import {
  listAllInteractions,
  listCompetitorMentions,
  listObjections,
  listOpportunities,
  listSignals,
  listWinLossInsights,
} from "../store";

export function salesGetCommercialMemory(organizationId: string) {
  const interactions = listAllInteractions(organizationId);
  const opportunities = listOpportunities(organizationId);
  return {
    objectionSignals: extractObjectionsFromInteractions(interactions),
    derivedCompetitors: deriveCompetitorMentions([], interactions),
    objections: listObjections(organizationId),
    signals: listSignals(organizationId),
    competitors: listCompetitorMentions(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    opportunityCount: opportunities.length,
    stalledOpportunityCount: countStalledOpportunities(
      opportunities,
      interactions,
    ),
  };
}
