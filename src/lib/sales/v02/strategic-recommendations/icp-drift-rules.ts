// @ts-nocheck
import { buildICPLearningSnapshot } from "../../vnext/icp-learning";
import type {
  SalesAccount,
  SalesICPInsight,
  SalesInteractionLog,
  SalesOpportunity,
  SalesWinLossInsight,
} from "../../types";
import { DRAFT_AR, LOW_ICP_THRESHOLD } from "./constants";
import { accountById, makeRec, openOpportunities } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicEvidenceItem, StrategicRecommendation } from "./types";

export function deriveIcpDriftWarnings(input: {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  icpInsights: SalesICPInsight[];
  winLossInsights: SalesWinLossInsight[];
  interactions: SalesInteractionLog[];
}): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];
  const snapshot = buildICPLearningSnapshot({
    organizationId: input.organizationId,
    accounts: input.accounts,
    opportunities: input.opportunities,
    contacts: [],
    icpInsights: input.icpInsights,
    winLossInsights: input.winLossInsights,
    interactions: input.interactions,
  });

  const topIndustries = new Set(
    snapshot.bestIndustries.slice(0, 3).map((r) => r.label.toLowerCase()),
  );
  const accounts = accountById(input.accounts);
  const open = openOpportunities(input.opportunities);

  let lowFitPipeline = 0;
  let lowFitValue = 0;
  const lowFitEvidence: StrategicEvidenceItem[] = [];

  for (const opp of open) {
    const account = accounts.get(opp.accountId);
    const fit = account?.icpFitScore ?? 50;
    if (fit >= LOW_ICP_THRESHOLD) continue;
    lowFitPipeline += 1;
    lowFitValue += opp.valueEstimate ?? 0;
    lowFitEvidence.push({
      text: `${account?.name ?? opp.accountId} ICP ${fit}`,
      textAr: `${account?.nameAr ?? account?.name ?? opp.accountId} ICP ${fit}`,
      source: "account",
      refId: account?.id,
    });
  }

  if (lowFitPipeline >= 2) {
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.ICP_DRIFT_LOW_FIT_PIPELINE,
        category: "icp_drift",
        title: `ICP drift: low-fit pipeline (${DRAFT_AR})`,
        titleAr: `ICP drift: low-fit (${DRAFT_AR})`,
        reasoning: `${lowFitPipeline} open opps (SAR ${Math.round(lowFitValue).toLocaleString("en-US")}) below ICP fit ${LOW_ICP_THRESHOLD}.`,
        reasoningAr: `${lowFitPipeline} opps below ICP threshold ${LOW_ICP_THRESHOLD}.`,
        confidence: Math.min(0.85, 0.55 + lowFitPipeline * 0.08),
        evidence: lowFitEvidence.slice(0, 4),
        priority: lowFitPipeline >= 3 ? "high" : "medium",
        href: "/sales/icp",
      }),
    );
  }

  const offPattern: StrategicEvidenceItem[] = [];
  for (const opp of open) {
    const account = accounts.get(opp.accountId);
    const industry = (account?.industry ?? "").toLowerCase();
    if (!industry || topIndustries.size === 0) continue;
    const matchesTop = [...topIndustries].some(
      (t) => industry.includes(t) || t.includes(industry),
    );
    if (matchesTop) continue;
    offPattern.push({
      text: `${account?.name}: ${account?.industry}`,
      textAr: `${account?.nameAr ?? account?.name}: ${account?.industry}`,
      source: "derived",
      refId: account?.id,
    });
  }

  if (offPattern.length >= 2) {
    const topLabels = snapshot.bestIndustries
      .slice(0, 2)
      .map((r) => r.label)
      .join(", ");
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.ICP_DRIFT_INDUSTRY_MISMATCH,
        category: "icp_drift",
        title: `ICP drift: off-pattern industries (${DRAFT_AR})`,
        titleAr: `ICP drift: off-pattern (${DRAFT_AR})`,
        reasoning: `Active deals outside top ICP segments (${topLabels || "n/a"}).`,
        reasoningAr: `Pipeline industries diverge from ICP top segments.`,
        confidence: 0.7,
        evidence: offPattern.slice(0, 4),
        priority: "medium",
        href: "/sales/icp",
      }),
    );
  }

  const staleHypothesis = snapshot.storedInsights.find(
    (i) => i.confidence < 0.6 && i.dimension === "pain_point",
  );
  if (staleHypothesis) {
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.ICP_DRIFT_HYPOTHESIS_REVIEW,
        category: "icp_drift",
        title: `Review low-confidence ICP hypothesis (${DRAFT_AR})`,
        titleAr: `Review ICP hypothesis (${DRAFT_AR})`,
        reasoning: staleHypothesis.recommendation,
        reasoningAr: staleHypothesis.recommendationAr,
        confidence: staleHypothesis.confidence,
        evidence: staleHypothesis.evidence.map((e) => ({
          text: e.text,
          textAr: e.textAr,
          source: "icp" as const,
        })),
        priority: "low",
        href: "/sales/icp",
      }),
    );
  }

  return recs.slice(0, 4);
}
