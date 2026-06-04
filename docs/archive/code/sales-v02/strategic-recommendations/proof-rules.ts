// @ts-nocheck
import type {
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
} from "../../types";
import { DRAFT_AR } from "./constants";
import { makeRec, openOpportunities } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicRecommendation } from "./types";

export function deriveProofRecommendations(input: {
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  proofAssets: SalesProofAsset[];
}): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];
  const open = openOpportunities(input.opportunities);

  for (const objection of input.objections.filter((o) => !o.resolved)) {
    const linked = input.proofAssets.some(
      (p) =>
        p.assetType === "objection_response" &&
        p.linkedOpportunityIds?.includes(objection.opportunityId),
    );
    if (linked) continue;

    const candidate = input.proofAssets.find(
      (p) =>
        p.assetType === "objection_response" ||
        p.assetType === "case_study" ||
        p.assetType === "customer_quote",
    );
    if (!candidate) continue;

    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.PROOF_OBJECTION_GAP,
        category: "proof_to_use",
        title: `Link proof for ${objection.category} objection (${DRAFT_AR})`,
        titleAr: `Link proof: ${objection.category} (${DRAFT_AR})`,
        reasoning: `Unresolved ${objection.category} objection without linked proof; suggest "${candidate.title}".`,
        reasoningAr: `Objection gap; suggest ${candidate.title}.`,
        confidence: 0.72,
        evidence: [
          {
            text: objection.description,
            textAr: objection.description,
            source: "objection",
            refId: objection.id,
          },
          {
            text: candidate.title,
            textAr: candidate.title,
            source: "proof",
            refId: candidate.id,
          },
        ],
        priority:
          objection.frequency && objection.frequency >= 2 ? "high" : "medium",
        opportunityId: objection.opportunityId,
        accountId: objection.accountId,
        proofAssetId: candidate.id,
        href: `/sales/opportunities/${objection.opportunityId}`,
      }),
    );
  }

  for (const opp of open) {
    const stageNeedsProof =
      opp.stage === "Proposal" ||
      opp.stage === "Pilot" ||
      opp.stage === "Negotiation";
    if (!stageNeedsProof) continue;

    const linkedProof = input.proofAssets.filter((p) =>
      p.linkedOpportunityIds?.includes(opp.id),
    );
    if (linkedProof.length >= 2) continue;

    const suggested =
      linkedProof[0] ??
      input.proofAssets.find(
        (p) =>
          p.assetType === "case_study" ||
          p.assetType === "pilot_result" ||
          p.assetType === "proposal",
      );
    if (!suggested) continue;

    recs.push(
      makeRec({
        ruleId: STRATEGIC_RULE_IDS.PROOF_STAGE_GAP,
        category: "proof_to_use",
        title: `Attach stage proof for ${opp.name} (${DRAFT_AR})`,
        titleAr: `Stage proof: ${opp.stage} (${DRAFT_AR})`,
        reasoning: `${opp.stage} with ${linkedProof.length} linked proof asset(s); below review threshold.`,
        reasoningAr: `Proof coverage gap at ${opp.stage}.`,
        confidence: 0.68,
        evidence: [
          {
            text: `${opp.name} @ ${opp.stage}`,
            textAr: `${opp.name} @ ${opp.stage}`,
            source: "opportunity",
            refId: opp.id,
          },
          {
            text: suggested.title,
            textAr: suggested.title,
            source: "proof",
            refId: suggested.id,
          },
        ],
        priority: "medium",
        opportunityId: opp.id,
        accountId: opp.accountId,
        proofAssetId: suggested.id,
        href: `/sales/opportunities/${opp.id}`,
      }),
    );
  }

  return recs.slice(0, 5);
}
