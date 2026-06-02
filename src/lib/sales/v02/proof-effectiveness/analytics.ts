// @ts-nocheck
import { suggestProofAssetsForObjection } from "../../proof-linkage-service";
import {
  canonicalizeOpportunityStage,
  type SalesObjection,
  type SalesOpportunity,
  type SalesProofAsset,
  type SalesWinLossInsight,
  type SalesInteractionLog,
} from "../../types";
import type {
  ObjectionResolutionMetrics,
  OppInfluenceMetrics,
  ProofAssetEffectivenessRow,
  ProofEffectivenessEvidenceItem,
  ProofEffectivenessSnapshot,
  ProofEffectivenessSummary,
  ProofUsageMetrics,
  WinContributionMetrics,
} from "./types";
import {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "./types";

const LATE_STAGES = new Set([
  "proposal",
  "pilot",
  "negotiation",
  "closed_won",
  "in_review",
]);

const PROOF_KEYWORDS =
  /\b(proof|evidence|case study|pilot|proposal|reference|roi|benchmark|objection)\b/i;

export interface ProofEffectivenessInput {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  winLossInsights: SalesWinLossInsight[];
  interactions: SalesInteractionLog[];
}

function linkedOpportunityIds(asset: SalesProofAsset): string[] {
  const ids = new Set<string>();
  if (asset.opportunityId) ids.add(asset.opportunityId);
  for (const id of asset.linkedOpportunityIds ?? []) ids.add(id);
  return [...ids];
}

function linkedAccountIds(asset: SalesProofAsset): string[] {
  const ids = new Set<string>();
  if (asset.accountId) ids.add(asset.accountId);
  for (const id of asset.linkedAccountIds ?? []) ids.add(id);
  return [...ids];
}

function opportunityOutcome(
  opp: SalesOpportunity,
  winLossByOpp: Map<string, SalesWinLossInsight>,
): "won" | "lost" | "open" {
  const wl = winLossByOpp.get(opp.id);
  if (wl?.outcome === "won") return "won";
  if (wl?.outcome === "lost") return "lost";
  const canonical = canonicalizeOpportunityStage(opp.stage);
  if (canonical === "closed_won") return "won";
  if (canonical === "closed_lost") return "lost";
  return "open";
}

function computeUsageMetrics(asset: SalesProofAsset): ProofUsageMetrics {
  const linkedOpportunityCount = linkedOpportunityIds(asset).length;
  const linkedAccountCount = linkedAccountIds(asset).length;
  const hasEvidenceRef = Boolean(asset.evidenceRef);
  const usageScore =
    linkedOpportunityCount * 2 +
    linkedAccountCount +
    (hasEvidenceRef ? 1 : 0) +
    (asset.status === "active" ? 0.5 : 0);

  return {
    linkedOpportunityCount,
    linkedAccountCount,
    hasEvidenceRef,
    usageScore,
  };
}

function computeWinContribution(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  winLossByOpp: Map<string, SalesWinLossInsight>,
  maxWinValue: number,
): {
  metrics: WinContributionMetrics;
  evidence: ProofEffectivenessEvidenceItem[];
} {
  const oppMap = new Map(opportunities.map((o) => [o.id, o]));
  const evidence: ProofEffectivenessEvidenceItem[] = [];
  let linkedWonCount = 0;
  let linkedLostCount = 0;
  let linkedOpenCount = 0;
  let attributedWonValue = 0;

  for (const oppId of linkedOpportunityIds(asset)) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const outcome = opportunityOutcome(opp, winLossByOpp);
    if (outcome === "won") {
      linkedWonCount += 1;
      attributedWonValue += opp.valueEstimate ?? 0;
      const wl = winLossByOpp.get(oppId);
      evidence.push({
        text: `Linked to won opportunity "${opp.name}"`,
        textAr: `مرتبط بفرصة فائزة "${opp.name}"`,
        source: wl ? "win_loss" : "opportunity",
      });
    } else if (outcome === "lost") {
      linkedLostCount += 1;
      evidence.push({
        text: `Linked to lost opportunity "${opp.name}"`,
        textAr: `مرتبط بفرصة خاسرة "${opp.name}"`,
        source: "opportunity",
      });
    } else {
      linkedOpenCount += 1;
    }
  }

  const closed = linkedWonCount + linkedLostCount;
  const winRate = closed > 0 ? linkedWonCount / closed : null;
  const winContributionScore =
    (winRate ?? 0) * 0.6 +
    (maxWinValue > 0 ? Math.min(attributedWonValue / maxWinValue, 1) * 0.4 : 0);

  return {
    metrics: {
      linkedWonCount,
      linkedLostCount,
      linkedOpenCount,
      winRate,
      attributedWonValue,
      winContributionScore,
    },
    evidence,
  };
}

function computeObjectionResolution(
  asset: SalesProofAsset,
  objections: SalesObjection[],
): {
  metrics: ObjectionResolutionMetrics;
  evidence: ProofEffectivenessEvidenceItem[];
} {
  const evidence: ProofEffectivenessEvidenceItem[] = [];
  const oppIds = new Set(linkedOpportunityIds(asset));
  const accountIds = new Set(linkedAccountIds(asset));

  const relatedObjections = objections.filter(
    (o) =>
      o.status !== "archived" &&
      ((o.opportunityId && oppIds.has(o.opportunityId)) ||
        (o.accountId && accountIds.has(o.accountId))),
  );

  const linkedObjections = relatedObjections.filter((obj) => {
    if (asset.assetType === "objection_response") return true;
    if (
      obj.evidenceRef &&
      asset.evidenceRef &&
      obj.evidenceRef === asset.evidenceRef
    ) {
      return true;
    }
    return suggestProofAssetsForObjection([asset], obj.category).some(
      (p) => p.id === asset.id,
    );
  });

  // Proof on a linked opp/account addresses objections on that same context.
  const contextualObjections =
    linkedObjections.length > 0 ? linkedObjections : relatedObjections;

  const resolvedObjectionCount = contextualObjections.filter(
    (o) => o.resolved,
  ).length;
  const categoriesAddressed = [
    ...new Set(contextualObjections.map((o) => o.category)),
  ];
  const resolutionRate =
    contextualObjections.length > 0
      ? resolvedObjectionCount / contextualObjections.length
      : null;

  for (const obj of contextualObjections.slice(0, 3)) {
    evidence.push({
      text: `Addresses ${obj.category} objection${obj.resolved ? " (resolved)" : ""}`,
      textAr: `يعالج اعتراض ${obj.category}${obj.resolved ? " (تم الحل)" : ""}`,
      source: "objection",
    });
  }

  const objectionResolutionScore =
    contextualObjections.length > 0
      ? (resolutionRate ?? 0) * 0.5 +
        Math.min(contextualObjections.length / 3, 1) * 0.3 +
        (asset.assetType === "objection_response" ? 0.2 : 0)
      : asset.assetType === "objection_response"
        ? 0.15
        : 0;

  return {
    metrics: {
      linkedObjectionCount: contextualObjections.length,
      resolvedObjectionCount,
      resolutionRate,
      categoriesAddressed,
      objectionResolutionScore,
    },
    evidence,
  };
}

function computeOppInfluence(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
  maxPipelineValue: number,
): {
  metrics: OppInfluenceMetrics;
  evidence: ProofEffectivenessEvidenceItem[];
} {
  const evidence: ProofEffectivenessEvidenceItem[] = [];
  const oppMap = new Map(opportunities.map((o) => [o.id, o]));
  const oppIds = linkedOpportunityIds(asset);

  let lateStageOpportunityCount = 0;
  let influencedPipelineValue = 0;
  let stageAdvancementSignals = 0;

  for (const oppId of oppIds) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const canonical = canonicalizeOpportunityStage(opp.stage);
    if (LATE_STAGES.has(canonical)) {
      lateStageOpportunityCount += 1;
      influencedPipelineValue += opp.valueEstimate ?? 0;
      evidence.push({
        text: `Influenced late-stage opp "${opp.name}" (${opp.stage})`,
        textAr: `تأثير على فرصة متقدمة "${opp.name}" (${opp.stage})`,
        source: "opportunity",
      });
    }
  }

  const assetCreatedAt = new Date(asset.createdAt).getTime();
  for (const interaction of interactions) {
    if (
      !interaction.opportunityId ||
      !oppIds.includes(interaction.opportunityId)
    ) {
      continue;
    }
    const loggedAt = new Date(interaction.loggedAt).getTime();
    if (Number.isNaN(loggedAt) || loggedAt < assetCreatedAt) continue;
    if (
      PROOF_KEYWORDS.test(interaction.summary) ||
      interaction.evidenceRef === asset.evidenceRef
    ) {
      stageAdvancementSignals += 1;
    }
  }

  if (stageAdvancementSignals > 0) {
    evidence.push({
      text: `${stageAdvancementSignals} post-link interaction signal(s)`,
      textAr: `${stageAdvancementSignals} إشارة تفاعل بعد الربط`,
      source: "interaction",
    });
  }

  const oppInfluenceScore =
    Math.min(lateStageOpportunityCount / 2, 1) * 0.45 +
    (maxPipelineValue > 0
      ? Math.min(influencedPipelineValue / maxPipelineValue, 1) * 0.35
      : 0) +
    Math.min(stageAdvancementSignals / 2, 1) * 0.2;

  return {
    metrics: {
      lateStageOpportunityCount,
      influencedPipelineValue,
      stageAdvancementSignals,
      oppInfluenceScore,
    },
    evidence,
  };
}

function normalizeScores(
  rows: ProofAssetEffectivenessRow[],
): ProofAssetEffectivenessRow[] {
  const maxUsage = Math.max(...rows.map((r) => r.usage.usageScore), 1);
  const maxWin = Math.max(
    ...rows.map((r) => r.winContribution.winContributionScore),
    0.01,
  );
  const maxObjection = Math.max(
    ...rows.map((r) => r.objectionResolution.objectionResolutionScore),
    0.01,
  );
  const maxInfluence = Math.max(
    ...rows.map((r) => r.oppInfluence.oppInfluenceScore),
    0.01,
  );

  return rows.map((row) => {
    const usageNorm = row.usage.usageScore / maxUsage;
    const winNorm = row.winContribution.winContributionScore / maxWin;
    const objectionNorm =
      row.objectionResolution.objectionResolutionScore / maxObjection;
    const influenceNorm = row.oppInfluence.oppInfluenceScore / maxInfluence;

    const effectivenessScore = Math.round(
      (usageNorm * 0.2 +
        winNorm * 0.35 +
        objectionNorm * 0.25 +
        influenceNorm * 0.2) *
        100,
    );

    return { ...row, effectivenessScore };
  });
}

function buildSummary(
  rows: ProofAssetEffectivenessRow[],
  allAssets: SalesProofAsset[],
): ProofEffectivenessSummary {
  const activeAssets = allAssets.filter((a) => a.status === "active");
  const top = rows[0];

  return {
    totalAssets: allAssets.length,
    activeAssets: activeAssets.length,
    topAssetId: top?.assetId ?? null,
    topAssetTitle: top?.title ?? null,
    aggregateAttributedWonValue: rows.reduce(
      (sum, r) => sum + r.winContribution.attributedWonValue,
      0,
    ),
    aggregateResolvedObjections: rows.reduce(
      (sum, r) => sum + r.objectionResolution.resolvedObjectionCount,
      0,
    ),
  };
}

export function buildProofEffectivenessSnapshot(
  input: ProofEffectivenessInput,
): ProofEffectivenessSnapshot {
  const activeAssets = input.proofAssets.filter(
    (a) => a.organizationId === input.organizationId && a.status !== "archived",
  );

  const winLossByOpp = new Map(
    input.winLossInsights.map((w) => [w.opportunityId, w]),
  );

  const maxWinValue = Math.max(
    ...input.opportunities
      .filter((o) => opportunityOutcome(o, winLossByOpp) === "won")
      .map((o) => o.valueEstimate ?? 0),
    1,
  );

  const maxPipelineValue = Math.max(
    ...input.opportunities.map((o) => o.valueEstimate ?? 0),
    1,
  );

  const rows: ProofAssetEffectivenessRow[] = activeAssets.map((asset) => {
    const usage = computeUsageMetrics(asset);
    const win = computeWinContribution(
      asset,
      input.opportunities,
      winLossByOpp,
      maxWinValue,
    );
    const objection = computeObjectionResolution(asset, input.objections);
    const influence = computeOppInfluence(
      asset,
      input.opportunities,
      input.interactions,
      maxPipelineValue,
    );

    const evidence = (
      [
        {
          text: `${usage.linkedOpportunityCount} linked opportunity(ies), ${usage.linkedAccountCount} account(s)`,
          textAr: `${usage.linkedOpportunityCount} فرصة مرتبطة، ${usage.linkedAccountCount} حساب`,
          source: "proof_asset" as const,
        },
        ...win.evidence,
        ...objection.evidence,
        ...influence.evidence,
      ] satisfies ProofEffectivenessEvidenceItem[]
    ).slice(0, 8);

    return {
      assetId: asset.id,
      title: asset.title,
      assetType: asset.assetType,
      status: asset.status,
      usage,
      winContribution: win.metrics,
      objectionResolution: objection.metrics,
      oppInfluence: influence.metrics,
      effectivenessScore: 0,
      rank: 0,
      evidence,
      outputStatus: "recommendation",
    };
  });

  const scored = normalizeScores(rows)
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    rankedAssets: scored,
    summary: buildSummary(scored, input.proofAssets),
    disclaimerEn: PROOF_EFFECTIVENESS_DISCLAIMER_EN,
    disclaimerAr: PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  };
}

export function getMostEffectiveProofAssets(
  snapshot: ProofEffectivenessSnapshot,
  limit = 10,
): ProofAssetEffectivenessRow[] {
  return snapshot.rankedAssets.slice(0, limit);
}
