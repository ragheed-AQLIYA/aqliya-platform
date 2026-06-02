import type {
  SalesAccount,
  SalesInteractionLog,
  SalesOpportunity,
} from "../types";
import { buildAccountIntelligence } from "../vnext/account-intelligence";
import { buildOpportunityIntelligence } from "../vnext/opportunity-intelligence";
import { scoreOpportunity } from "./opportunity-scoring";

interface SalesObjectionInsight {
  id: string;
  label: string;
  labelAr: string;
  count: number;
  severity: string;
}

interface SalesSignalInsight {
  id: string;
  label: string;
  labelAr: string;
  value: number;
  confidence: number;
  entityId: string;
  entityType: string;
  count?: number;
}

const ACTIVE_ACCOUNT_STATUSES = new Set(["qualified", "active"]);
const ACTIVE_OPP_STAGES = new Set([
  "Draft",
  "Qualification",
  "InReview",
  "Approved",
]);
const STALLED_DAYS = 14;

export interface CommercialCommandCenterMetrics {
  activeAccounts: number;
  activeOpportunities: number;
  pipelineValue: number;
  stalledOpportunities: number;
  meetingsThisWeek: number;
  topObjections: SalesObjectionInsight[];
  topSignals: SalesSignalInsight[];
  icpFitDistribution: Array<{ labelAr: string; count: number; pct: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    summary: string;
    loggedAt: string;
    accountId: string;
  }>;
}

function isStalled(
  opp: SalesOpportunity,
  interactions: SalesInteractionLog[],
): boolean {
  if (!ACTIVE_OPP_STAGES.has(opp.stage)) return false;
  const oppInteractions = interactions.filter((i) => i.opportunityId === opp.id);
  if (oppInteractions.length === 0) return opp.stage !== "Draft";
  const latest = oppInteractions.reduce((max, i) =>
    new Date(i.loggedAt) > new Date(max.loggedAt) ? i : max,
  );
  const days =
    (Date.now() - new Date(latest.loggedAt).getTime()) / 86400000;
  return days >= STALLED_DAYS;
}

function meetingsThisWeek(interactions: SalesInteractionLog[]): number {
  const weekAgo = Date.now() - 7 * 86400000;
  return interactions.filter(
    (i) =>
      (i.type === "meeting" || i.type === "call") &&
      new Date(i.loggedAt).getTime() >= weekAgo,
  ).length;
}

export function buildCommercialCommandCenterMetrics(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
}): CommercialCommandCenterMetrics {
  const { accounts, opportunities, interactions } = input;
  const activeAccounts = accounts.filter((a) =>
    ACTIVE_ACCOUNT_STATUSES.has(a.status),
  ).length;
  const activeOpportunities = opportunities.filter((o) =>
    ACTIVE_OPP_STAGES.has(o.stage),
  ).length;
  const pipelineValue = opportunities
    .filter((o) => ACTIVE_OPP_STAGES.has(o.stage))
    .reduce((s, o) => s + (o.valueEstimate ?? 0), 0);
  const stalledOpportunities = opportunities.filter((o) =>
    isStalled(o, interactions),
  ).length;

  const objectionMap = new Map<string, SalesObjectionInsight>();
  for (const opp of opportunities) {
    const intel = buildOpportunityIntelligence({
      opportunity: opp,
      evidenceCount: 0,
      interactionCount: interactions.filter((i) => i.opportunityId === opp.id)
        .length,
      hasApprovedClaims: opp.approvalStatus === "Approved",
    });
    for (const gap of intel.qualificationGap) {
      const key = gap;
      const existing = objectionMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        objectionMap.set(key, {
          id: `obj-${key.slice(0, 12)}`,
          label: gap,
          labelAr: gap,
          count: 1,
          severity: gap.includes("High-value") ? "high" : "medium",
        });
      }
    }
    const scoring = scoreOpportunity(opp);
    for (const b of scoring.blockers) {
      const existing = objectionMap.get(b);
      if (existing) existing.count += 1;
      else {
        objectionMap.set(b, {
          id: `obj-${b.slice(0, 12)}`,
          label: b,
          labelAr: b,
          count: 1,
          severity: "high",
        });
      }
    }
  }

  const signalMap = new Map<string, SalesSignalInsight>();
  for (const account of accounts) {
    const opps = opportunities.filter((o) => o.accountId === account.id);
    const acctInteractions = interactions.filter(
      (i) => i.accountId === account.id,
    );
    const intel = buildAccountIntelligence({
      account,
      opportunities: opps,
      interactionCount: acctInteractions.length,
      daysSinceLastInteraction:
        acctInteractions.length > 0
          ? Math.floor(
              (Date.now() -
                new Date(acctInteractions[0].loggedAt).getTime()) /
                86400000,
            )
          : undefined,
    });
    for (const sig of intel.signals) {
      const key = sig.label;
      const existing = signalMap.get(key);
      if (existing) {
        existing.value = Math.round((existing.value + sig.value) / 2);
        existing.count = (existing as SalesSignalInsight & { count?: number })
          .count
          ? ((existing as SalesSignalInsight & { count: number }).count += 1)
          : 1;
      } else {
        signalMap.set(key, {
          id: sig.id,
          label: sig.label,
          labelAr: sig.label,
          value: sig.value,
          confidence: sig.confidence,
          entityId: account.id,
          entityType: "SalesAccount",
        });
      }
    }
  }

  const icpBuckets = { strong: 0, moderate: 0, weak: 0, unknown: 0 };
  for (const account of accounts) {
    const opps = opportunities.filter((o) => o.accountId === account.id);
    const avgScore =
      opps.length === 0
        ? 0
        : opps.reduce((s, o) => s + (o.qualificationScore ?? 40), 0) /
          opps.length;
    if (avgScore >= 75) icpBuckets.strong += 1;
    else if (avgScore >= 55) icpBuckets.moderate += 1;
    else if (avgScore > 0) icpBuckets.weak += 1;
    else icpBuckets.unknown += 1;
  }
  const icpTotal = accounts.length || 1;
  const icpFitDistribution = [
    {
      labelAr: "ملاءمة قوية",
      count: icpBuckets.strong,
      pct: Math.round((icpBuckets.strong / icpTotal) * 100),
    },
    {
      labelAr: "ملاءمة متوسطة",
      count: icpBuckets.moderate,
      pct: Math.round((icpBuckets.moderate / icpTotal) * 100),
    },
    {
      labelAr: "ملاءمة ضعيفة",
      count: icpBuckets.weak,
      pct: Math.round((icpBuckets.weak / icpTotal) * 100),
    },
    {
      labelAr: "غير محدد",
      count: icpBuckets.unknown,
      pct: Math.round((icpBuckets.unknown / icpTotal) * 100),
    },
  ];

  return {
    activeAccounts,
    activeOpportunities,
    pipelineValue,
    stalledOpportunities,
    meetingsThisWeek: meetingsThisWeek(interactions),
    topObjections: [...objectionMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topSignals: [...signalMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    icpFitDistribution,
    recentActivity: interactions.slice(0, 10).map((i) => ({
      id: i.id,
      type: i.type,
      summary: i.summary,
      loggedAt: i.loggedAt,
      accountId: i.accountId,
    })),
  };
}
