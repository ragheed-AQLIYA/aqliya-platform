import {
  evaluateNextActionRules,
  evaluateOrgNextActions,
  type NextActionRecommendation,
} from "../vnext/next-action-engine";
import {
  loadStrategicRecommendationsFromStore,
  type StrategicRecommendationsSnapshot,
} from "../v02/strategic-recommendations";
import type { SalesNextBestActionItem } from "../types";
import {
  createNextAction,
  getAccount,
  getOpportunity,
  listActivitiesForOpportunity,
  listEvidenceForOpportunity,
  listMeetings,
  listNextActions,
  listObjections,
  listOpportunities,
  listOutreach,
  listProofAssets,
  listProofAssetsForOpportunity,
} from "../store";

function groupByOpportunityId<T extends { opportunityId?: string }>(
  items: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    if (!item.opportunityId) continue;
    const list = map.get(item.opportunityId) ?? [];
    list.push(item);
    map.set(item.opportunityId, list);
  }
  return map;
}

const PRIORITY_TO_UI: Record<
  NextActionRecommendation["priority"],
  SalesNextBestActionItem["priority"]
> = {
  urgent: "high",
  high: "high",
  medium: "medium",
  low: "low",
};

export function mapRecommendationToUIItem(
  rec: NextActionRecommendation,
): SalesNextBestActionItem {
  const href = rec.opportunityId
    ? `/sales/opportunities/${rec.opportunityId}`
    : rec.accountId
      ? `/sales/accounts/${rec.accountId}`
      : "/sales";
  return {
    id: `nba-rule-${rec.ruleId}-${rec.opportunityId ?? rec.accountId ?? "org"}`,
    labelAr: rec.title,
    labelEn: rec.title,
    priority: PRIORITY_TO_UI[rec.priority],
    href,
    accountId: rec.accountId,
    opportunityId: rec.opportunityId,
    reasonAr: rec.description,
  };
}

export function salesRecommendNextActionsAsUI(
  organizationId: string,
  opportunityId?: string,
): SalesNextBestActionItem[] {
  return salesRecommendNextActions(organizationId, opportunityId).map(
    mapRecommendationToUIItem,
  );
}

export function salesListNextActions(organizationId: string) {
  return listNextActions(organizationId);
}

export function salesRecommendNextActions(
  organizationId: string,
  opportunityId?: string,
) {
  if (opportunityId) {
    const opportunity = getOpportunity(organizationId, opportunityId);
    if (!opportunity) return [];
    const account = getAccount(organizationId, opportunity.accountId);
    const objections = listObjections(organizationId).filter(
      (o) => o.opportunityId === opportunityId,
    );
    const meetings = listMeetings(organizationId).filter(
      (m) => m.opportunityId === opportunityId,
    );
    const outreach = listOutreach(organizationId).filter(
      (o) => o.opportunityId === opportunityId,
    );
    const proofAssets = listProofAssetsForOpportunity(
      organizationId,
      opportunityId,
    );
    return evaluateNextActionRules({
      opportunity,
      activities: listActivitiesForOpportunity(organizationId, opportunityId),
      evidence: listEvidenceForOpportunity(organizationId, opportunityId),
      account: account ?? undefined,
      objections,
      meetings,
      outreach,
      proofAssets,
    });
  }

  const opportunities = listOpportunities(organizationId);
  const accountsById = new Map(
    opportunities
      .map((o) => getAccount(organizationId, o.accountId))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => [a.id, a]),
  );
  const activitiesByOpp = new Map(
    opportunities.map((o) => [
      o.id,
      listActivitiesForOpportunity(organizationId, o.id),
    ]),
  );
  const evidenceByOpp = new Map(
    opportunities.map((o) => [
      o.id,
      listEvidenceForOpportunity(organizationId, o.id),
    ]),
  );
  const objectionsByOpp = groupByOpportunityId(
    listObjections(organizationId),
  );
  const meetingsByOpp = groupByOpportunityId(listMeetings(organizationId));
  const outreachByOpp = groupByOpportunityId(listOutreach(organizationId));
  return evaluateOrgNextActions({
    opportunities,
    accounts: [...accountsById.values()],
    activitiesByOpp,
    evidenceByOpp,
    objections: [...objectionsByOpp.values()].flat(),
    meetings: [...meetingsByOpp.values()].flat(),
    outreach: [...outreachByOpp.values()].flat(),
    proofAssets: listProofAssets(organizationId),
  });
}

export function salesGetStrategicRecommendations(
  organizationId: string,
): StrategicRecommendationsSnapshot {
  return loadStrategicRecommendationsFromStore(organizationId);
}

export function salesPersistRecommendations(
  organizationId: string,
  createdById: string,
  opportunityId?: string,
) {
  const recs = salesRecommendNextActions(organizationId, opportunityId);
  return recs.map((rec) =>
    createNextAction({
      organizationId,
      createdById,
      opportunityId: rec.opportunityId,
      accountId: rec.accountId,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      dueAt: rec.dueAt,
      assigneeId: rec.assigneeId,
      ruleId: rec.ruleId,
      recommendationOnly: true,
    }),
  );
}
