import type {
  SalesICPInsight,
  SalesObjection,
  SalesWinLossInsight,
} from "../../types";
import { DRAFT_AR } from "./constants";
import { makeRec } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicRecommendation } from "./types";

export function deriveMessagingThemes(input: {
  objections: SalesObjection[];
  winLossInsights: SalesWinLossInsight[];
  icpInsights: SalesICPInsight[];
}): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];
  const objectionBuckets = new Map<
    string,
    { count: number; samples: SalesObjection[] }
  >();

  for (const objection of input.objections.filter((o) => !o.resolved)) {
    const key = objection.category.trim().toLowerCase() || "general";
    const bucket = objectionBuckets.get(key) ?? { count: 0, samples: [] };
    bucket.count += objection.frequency ?? 1;
    bucket.samples.push(objection);
    objectionBuckets.set(key, bucket);
  }

  for (const [category, bucket] of objectionBuckets) {
    if (bucket.count < 2) continue;
    const lead = bucket.samples[0];
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.MESSAGING_RECURRING_OBJECTION,
        category: "messaging_themes",
        title: `Messaging theme: address recurring ${category} (${DRAFT_AR})`,
        titleAr: `Messaging theme: ${category} (${DRAFT_AR})`,
        reasoning: `Recurring ${category} objection (${bucket.count} signals) - align talk tracks and proof before outbound.`,
        reasoningAr: `Recurring objection ${category} - refresh messaging and proof.`,
        confidence: Math.min(0.88, 0.55 + bucket.count * 0.08),
        evidence: bucket.samples.slice(0, 3).map((o) => ({
          text: o.description,
          textAr: o.description,
          source: "objection" as const,
          refId: o.id,
        })),
        priority: bucket.count >= 3 ? "high" : "medium",
        opportunityId: lead.opportunityId,
        accountId: lead.accountId,
        href: "/sales/intelligence",
      }),
    );
  }

  const reasonBuckets = new Map<
    string,
    { lost: number; won: number; samples: SalesWinLossInsight[] }
  >();
  for (const insight of input.winLossInsights) {
    const key = insight.primaryReason.trim().toLowerCase();
    if (!key) continue;
    const bucket = reasonBuckets.get(key) ?? { lost: 0, won: 0, samples: [] };
    if (insight.outcome === "lost") bucket.lost += 1;
    else bucket.won += 1;
    bucket.samples.push(insight);
    reasonBuckets.set(key, bucket);
  }

  for (const [reason, bucket] of reasonBuckets) {
    const total = bucket.lost + bucket.won;
    if (total < 2) continue;
    const lead = bucket.samples[0];
    const lostHeavy = bucket.lost >= bucket.won;
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.MESSAGING_WIN_LOSS_THEME,
        category: "messaging_themes",
        title: `Messaging theme: ${reason} in win/loss (${DRAFT_AR})`,
        titleAr: `Win/loss theme: ${reason} (${DRAFT_AR})`,
        reasoning: `${bucket.lost} lost / ${bucket.won} won with primary reason "${reason}" - ${lostHeavy ? "tighten objection handling" : "reuse winning narrative"}.`,
        reasoningAr: `Win/loss pattern ${reason} - adjust messaging.`,
        confidence: Math.min(0.85, 0.5 + total * 0.1),
        evidence: bucket.samples.slice(0, 3).map((w) => ({
          text: `${w.outcome}: ${w.primaryReason}`,
          textAr: `${w.outcome}: ${w.primaryReason}`,
          source: "win_loss" as const,
          refId: w.id,
        })),
        priority: lostHeavy && bucket.lost >= 2 ? "high" : "medium",
        opportunityId: lead.opportunityId,
        href: "/sales/intelligence",
      }),
    );
  }

  const hypothesisRows = input.icpInsights.filter(
    (i) => i.status === "active" && i.hypothesis.length > 12,
  );
  if (hypothesisRows.length > 0 && recs.length === 0) {
    const lead = hypothesisRows[0];
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.MESSAGING_WIN_LOSS_THEME,
        category: "messaging_themes",
        title: `Messaging theme: ICP hypothesis (${DRAFT_AR})`,
        titleAr: `ICP messaging: ${lead.dimension} (${DRAFT_AR})`,
        reasoning: `Active ICP hypothesis available - align outbound copy with stored segment narrative.`,
        reasoningAr: `Align messaging with ICP hypothesis.`,
        confidence: 0.58,
        evidence: [
          {
            text: lead.hypothesis,
            textAr: lead.hypothesis,
            source: "icp",
            refId: lead.id,
          },
        ],
        priority: "low",
        href: "/sales/icp",
      }),
    );
  }

  return recs.slice(0, 4);
}
