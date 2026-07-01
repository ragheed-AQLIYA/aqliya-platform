import type {
  SalesAccount,
  SalesICPInsight,
  SalesOpportunity,
} from "../../types";
import { DRAFT_AR } from "./constants";
import { accountById, isWonStage, makeRec, openOpportunities } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicEvidenceItem, StrategicRecommendation } from "./types";

export function deriveIndustryPriorities(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  icpInsights: SalesICPInsight[];
}): StrategicRecommendation[] {
  const accounts = accountById(input.accounts);
  const open = openOpportunities(input.opportunities);
  const buckets = new Map<
    string,
    {
      pipeline: number;
      won: number;
      accountCount: number;
      evidence: StrategicEvidenceItem[];
    }
  >();

  for (const opp of open) {
    const account = accounts.get(opp.accountId);
    const industry = account?.industry ?? "Unknown";
    const bucket = buckets.get(industry) ?? {
      pipeline: 0,
      won: 0,
      accountCount: 0,
      evidence: [],
    };
    bucket.pipeline += opp.valueEstimate ?? 0;
    bucket.evidence.push({
      text: `Open opp ${opp.name} (${opp.stage})`,
      textAr: `Open opp ${opp.name} (${opp.stage})`,
      source: "opportunity",
      refId: opp.id,
    });
    buckets.set(industry, bucket);
  }

  for (const opp of input.opportunities) {
    if (!isWonStage(opp.stage)) continue;
    const account = accounts.get(opp.accountId);
    const industry = account?.industry ?? "Unknown";
    const bucket = buckets.get(industry) ?? {
      pipeline: 0,
      won: 0,
      accountCount: 0,
      evidence: [],
    };
    bucket.won += 1;
    bucket.evidence.push({
      text: `Won deal ${opp.name}`,
      textAr: `Won deal ${opp.name}`,
      source: "opportunity",
      refId: opp.id,
    });
    buckets.set(industry, bucket);
  }

  for (const account of input.accounts) {
    if (!account.industry) continue;
    const bucket = buckets.get(account.industry) ?? {
      pipeline: 0,
      won: 0,
      accountCount: 0,
      evidence: [],
    };
    bucket.accountCount += 1;
    if (
      !bucket.evidence.some(
        (e) => e.refId === account.id && e.source === "account",
      )
    ) {
      bucket.evidence.push({
        text: `Account ${account.name} (${account.status})`,
        textAr: `Account ${account.nameAr ?? account.name}`,
        source: "account",
        refId: account.id,
      });
    }
    buckets.set(account.industry, bucket);
  }

  const icpKeywords = input.icpInsights
    .filter((i) => i.dimension === "industry")
    .flatMap((i) => i.hypothesis.toLowerCase().match(/[a-z]+/g) ?? []);

  return [...buckets.entries()]
    .map(([industry, bucket]) => {
      const icpBoost =
        icpKeywords.length > 0 &&
        icpKeywords.some((k) => industry.toLowerCase().includes(k))
          ? 1.5
          : 0;
      const score =
        bucket.pipeline / 100_000 +
        bucket.won * 2 +
        bucket.accountCount * 0.5 +
        icpBoost;
      return { industry, bucket, score };
    })
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ industry, bucket, score }) => {
      const confidence = Math.min(
        0.9,
        0.4 + bucket.accountCount * 0.08 + bucket.won * 0.1 + score * 0.04,
      );
      return makeRec({
        ruleId: STRATEGIC_RULE_IDS.INDUSTRY_PIPELINE_PRIORITY,
        category: "industry_priority",
        title: `Prioritize ${industry} vertical (${DRAFT_AR})`,
        titleAr: `Prioritize ${industry} (${DRAFT_AR})`,
        reasoning: `Open pipeline SAR ${Math.round(bucket.pipeline).toLocaleString("en-US")}, ${bucket.won} wins, ${bucket.accountCount} accounts.`,
        reasoningAr: `Pipeline + wins + accounts signal for ${industry}.`,
        confidence,
        evidence: bucket.evidence.slice(0, 4),
        priority: confidence >= 0.75 ? "high" : "medium",
        industry,
        href: "/sales/icp",
      });
    });
}
