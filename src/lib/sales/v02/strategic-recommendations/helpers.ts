// @ts-nocheck
import { isClosedOpportunityStage } from "../../types";
import type {
  SalesAccount,
  SalesInteractionLog,
  SalesOpportunity,
} from "../../types";
import { MS_PER_DAY } from "./constants";
import type { StrategicRecommendation } from "./types";

export function daysSince(isoDate: string, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(isoDate).getTime()) / MS_PER_DAY,
  );
}

export function isWonStage(stage: SalesOpportunity["stage"]): boolean {
  return stage === "ClosedWon" || stage === "Closed Won";
}

export function lastInteractionAt(
  opportunityId: string,
  interactions: SalesInteractionLog[],
): number | null {
  const related = interactions
    .filter((i) => i.opportunityId === opportunityId)
    .map((i) => new Date(i.loggedAt).getTime())
    .filter((t) => !Number.isNaN(t));
  if (related.length === 0) return null;
  return Math.max(...related);
}

export function accountById(
  accounts: SalesAccount[],
): Map<string, SalesAccount> {
  return new Map(accounts.map((a) => [a.id, a]));
}

export function openOpportunities(
  opportunities: SalesOpportunity[],
): SalesOpportunity[] {
  return opportunities.filter((o) => !isClosedOpportunityStage(o.stage));
}

export function makeRec(
  partial: Omit<StrategicRecommendation, "id"> & { id?: string },
): StrategicRecommendation {
  const suffix =
    partial.accountId ??
    partial.opportunityId ??
    partial.industry ??
    partial.proofAssetId ??
    "org";
  return {
    ...partial,
    id: partial.id ?? `strat-${partial.ruleId}-${suffix}`,
  };
}

export function groupByCategory(
  recommendations: StrategicRecommendation[],
): Record<
  import("./types").StrategicRecommendationCategory,
  StrategicRecommendation[]
> {
  const empty: Record<
    import("./types").StrategicRecommendationCategory,
    StrategicRecommendation[]
  > = {
    industry_priority: [],
    proof_to_use: [],
    account_revisit: [],
    opp_at_risk: [],
    icp_drift: [],
    messaging_themes: [],
  };
  for (const item of recommendations) {
    empty[item.category].push(item);
  }
  return empty;
}
