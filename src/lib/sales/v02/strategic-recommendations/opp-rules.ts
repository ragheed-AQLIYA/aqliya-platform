// @ts-nocheck
import { scoreOpportunity } from "../../intelligence/opportunity-scoring";
import type {
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
} from "../../types";
import {
  DRAFT_AR,
  HIGH_VALUE_THRESHOLD,
  STALL_DAYS,
} from "./constants";
import { daysSince, lastInteractionAt, makeRec, openOpportunities } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicEvidenceItem, StrategicRecommendation } from "./types";

export function deriveOppsAtRisk(input: {
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  objections: SalesObjection[];
  now: Date;
}): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];
  const open = openOpportunities(input.opportunities);
  const objectionsByOpp = new Map<string, SalesObjection[]>();
  for (const obj of input.objections.filter((o) => !o.resolved)) {
    const list = objectionsByOpp.get(obj.opportunityId) ?? [];
    list.push(obj);
    objectionsByOpp.set(obj.opportunityId, list);
  }

  for (const opp of open) {
    const reasons: string[] = [];
    const reasonsAr: string[] = [];
    const evidence: StrategicEvidenceItem[] = [
      {
        text: `${opp.name} (${opp.stage})`,
        textAr: `${opp.name} (${opp.stage})`,
        source: "opportunity",
        refId: opp.id,
      },
    ];

    const lastAt = lastInteractionAt(opp.id, input.interactions);
    const daysIdle =
      lastAt === null
        ? STALL_DAYS + 1
        : daysSince(new Date(lastAt).toISOString(), input.now);
    if (daysIdle >= STALL_DAYS) {
      reasons.push(`No activity for ${daysIdle} days`);
      reasonsAr.push(`No activity ${daysIdle}d`);
    }

    const scored = scoreOpportunity(opp);
    if (
      (opp.valueEstimate ?? 0) >= HIGH_VALUE_THRESHOLD &&
      (opp.confidence?.score ?? scored.confidence) < 0.65
    ) {
      reasons.push("High value with low confidence");
      reasonsAr.push("High value, low confidence");
      if (scored.blockers[0]) {
        evidence.push({
          text: scored.blockers.join("; "),
          textAr: scored.blockers[0],
          source: "derived",
        });
      }
    }

    if (scored.riskIndicators.length > 0) {
      reasons.push(...scored.riskIndicators);
      reasonsAr.push("Scoring risk indicators");
    }

    const unresolved = objectionsByOpp.get(opp.id) ?? [];
    if (unresolved.length >= 2) {
      reasons.push(`${unresolved.length} unresolved objections`);
      reasonsAr.push(`${unresolved.length} objections open`);
      for (const obj of unresolved.slice(0, 2)) {
        evidence.push({
          text: obj.description,
          textAr: obj.description,
          source: "objection",
          refId: obj.id,
        });
      }
    }

    if (opp.risks?.some((r) => /budget|freeze|stall/i.test(r))) {
      reasons.push("Budget or stall risk on record");
      reasonsAr.push("Budget/stall risk flagged");
    }

    if (reasons.length === 0) continue;

    const confidence = Math.min(0.92, 0.5 + reasons.length * 0.12);
    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.OPP_AT_RISK,
        category: "opp_at_risk",
        title: `At-risk: ${opp.name} (${DRAFT_AR})`,
        titleAr: `At-risk: ${opp.name} (${DRAFT_AR})`,
        reasoning: reasons.join("; "),
        reasoningAr: reasonsAr.join("; "),
        confidence,
        evidence,
        priority:
          reasons.length >= 2 ||
          (opp.valueEstimate ?? 0) >= HIGH_VALUE_THRESHOLD
            ? "high"
            : "medium",
        opportunityId: opp.id,
        accountId: opp.accountId,
        href: `/sales/opportunities/${opp.id}`,
      }),
    );
  }

  return recs
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 6);
}
