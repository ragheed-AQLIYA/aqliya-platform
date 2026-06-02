import {
  mergeICPInsightFromLearning,
  synthesizeICPHypothesis,
} from "../icp-learning";
import type { SalesICPInsight } from "../types";
import {
  createICPInsight,
  getAccount,
  listICPInsights,
  listOpportunitiesForAccount,
} from "../store";

export function salesListICPInsights(
  organizationId: string,
): SalesICPInsight[] {
  return listICPInsights(organizationId);
}

export function salesLearnICPForAccount(
  organizationId: string,
  accountId: string,
  createdById: string,
  persist = false,
) {
  const account = getAccount(organizationId, accountId);
  if (!account) return null;
  const opportunities = listOpportunitiesForAccount(organizationId, accountId);
  const existingInsights = listICPInsights(organizationId);
  const learning = synthesizeICPHypothesis({
    account,
    opportunities,
    existingInsights,
  });
  if (!persist) return { learning, insight: null };
  const insight = createICPInsight(
    mergeICPInsightFromLearning(organizationId, createdById, accountId, learning),
  );
  return { learning, insight };
}
