import { suggestProofAssetsForObjection } from "../../proof-linkage-service";
import type {
  SalesActivity,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesWinLossInsight,
} from "../../types";
import {
  canonicalizeOpportunityStage,
  isClosedOpportunityStage,
} from "../../types";
import type {
  ProofAssetEffectiveness,
  ProofEffectivenessReport,
  ProofObjectionResolution,
  ProofOpportunityInfluence,
  ProofUsageMetrics,
  ProofWinContribution,
} from "./types";
import { PROOF_EFFECTIVENESS_DISCLAIMER } from "./types";
import type { ProofEffectivenessStoreSnapshot } from "./store-reader";

const EFFECTIVENESS_WEIGHTS = {
  usage: 0.2,
  winContribution: 0.35,
  objectionResolution: 0.25,
  opportunityInfluence: 0.2,
} as const;

const STAGE_INFLUENCE_WEIGHT: Record<string, number> = {
  new: 10,
  qualified: 20,
  discovery: 30,
  in_review: 45,
  proposal: 50,
  pilot: 60,
  negotiation: 70,
  closed_won: 100,
  closed_lost: 0,
};

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeRelative(values: number[]): number[] {
  const max = Math.max(...values, 0);
  if (max === 0) return values.map(() => 0);
  return values.map((v) => clampScore((v / max) * 100));
}

export function getLinkedOpportunityIds(asset: SalesProofAsset): string[] {
  const ids: string[] = [];
  if (asset.opportunityId) ids.push(asset.opportunityId);
  if (asset.linkedOpportunityIds?.length) ids.push(...asset.linkedOpportunityIds);
  return unique(ids);
}

export function getLinkedAccountIds(asset: SalesProofAsset): string[] {
  const ids: string[] = [];
  if (asset.accountId) ids.push(asset.accountId);
  if (asset.linkedAccountIds?.length) ids.push(...asset.linkedAccountIds);
  return unique(ids);
}

function activityReferencesForAsset(
  assetId: string,
  activities: SalesActivity[],
): SalesActivity[] {
  return activities.filter((activity) =>
    activity.evidenceLinkage?.proofAssetIds?.includes(assetId),
  );
}

function opportunityById(
  opportunities: SalesOpportunity[],
): Map<string, SalesOpportunity> {
  return new Map(opportunities.map((opp) => [opp.id, opp]));
}

function winLossByOpportunity(
  insights: SalesWinLossInsight[],
): Map<string, SalesWinLossInsight> {
  return new Map(insights.map((insight) => [insight.opportunityId, insight]));
}

function isWonOpportunity(
  opp: SalesOpportunity,
  winLoss?: SalesWinLossInsight,
): boolean {
  if (winLoss?.outcome === "won") return true;
  return canonicalizeOpportunityStage(opp.stage) === "closed_won";
}

function isLostOpportunity(
  opp: SalesOpportunity,
  winLoss?: SalesWinLossInsight,
): boolean {
  if (winLoss?.outcome === "lost") return true;
  return canonicalizeOpportunityStage(opp.stage) === "closed_lost";
}

function computeUsageMetrics(
  asset: SalesProofAsset,
  activities: SalesActivity[],
): Omit<ProofUsageMetrics, "score"> {
  const opportunityIds = getLinkedOpportunityIds(asset);
  const accountIds = getLinkedAccountIds(asset);
  const activityRefs = activityReferencesForAsset(asset.id, activities);

  return {
    opportunityLinkCount: opportunityIds.length,
    accountLinkCount: accountIds.length,
    activityReferenceCount: activityRefs.length,
    opportunityIds,
    accountIds,
  };
}

function computeWinContribution(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  winLossInsights: SalesWinLossInsight[],
): Omit<ProofWinContribution, "score"> {
  const oppMap = opportunityById(opportunities);
  const winLossMap = winLossByOpportunity(winLossInsights);
  const linkedIds = getLinkedOpportunityIds(asset);

  const wonOpportunityIds: string[] = [];
  const lostOpportunityIds: string[] = [];
  let wonValueTotal = 0;

  for (const oppId of linkedIds) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const winLoss = winLossMap.get(oppId);
    if (isWonOpportunity(opp, winLoss)) {
      wonOpportunityIds.push(oppId);
      wonValueTotal += opp.valueEstimate ?? 0;
    } else if (isLostOpportunity(opp, winLoss)) {
      lostOpportunityIds.push(oppId);
    }
  }

  const closedCount = wonOpportunityIds.length + lostOpportunityIds.length;
  const winRate =
    closedCount === 0
      ? null
      : Math.round((wonOpportunityIds.length / closedCount) * 100);

  return {
    wonOpportunityIds,
    wonDealCount: wonOpportunityIds.length,
    wonValueTotal,
    lostOpportunityIds,
    winRate,
  };
}

function computeObjectionResolution(
  asset: SalesProofAsset,
  objections: SalesObjection[],
  proofAssets: SalesProofAsset[],
): Omit<ProofObjectionResolution, "score"> {
  const linkedOppIds = new Set(getLinkedOpportunityIds(asset));
  const scopedObjections = objections.filter(
    (obj) => obj.opportunityId && linkedOppIds.has(obj.opportunityId),
  );

  const addressable = scopedObjections.filter((obj) =>
    suggestProofAssetsForObjection(proofAssets, obj.category).some(
      (candidate) => candidate.id === asset.id,
    ),
  );

  const resolvedObjectionIds = addressable
    .filter((obj) => obj.resolved === true)
    .map((obj) => obj.id);
  const unresolvedObjectionIds = addressable
    .filter((obj) => obj.resolved !== true)
    .map((obj) => obj.id);

  const resolutionRate =
    addressable.length === 0
      ? null
      : Math.round((resolvedObjectionIds.length / addressable.length) * 100);

  return {
    addressableObjectionIds: addressable.map((obj) => obj.id),
    resolvedObjectionIds,
    unresolvedObjectionIds,
    resolutionRate,
    categories: unique(addressable.map((obj) => obj.category)),
  };
}

function computeOpportunityInfluence(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
): Omit<ProofOpportunityInfluence, "score"> {
  const oppMap = opportunityById(opportunities);
  const linkedIds = getLinkedOpportunityIds(asset);

  const influencedOpportunityIds: string[] = [];
  let openInfluenceCount = 0;
  let advancedStageCount = 0;
  let totalPipelineValue = 0;

  for (const oppId of linkedIds) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;

    influencedOpportunityIds.push(oppId);
    const canonical = canonicalizeOpportunityStage(opp.stage);

    if (!isClosedOpportunityStage(opp.stage)) {
      openInfluenceCount += 1;
      totalPipelineValue += opp.valueEstimate ?? 0;
    }

    if (
      canonical === "proposal" ||
      canonical === "pilot" ||
      canonical === "negotiation" ||
      canonical === "in_review"
    ) {
      advancedStageCount += 1;
    }
  }

  return {
    influencedOpportunityIds,
    openInfluenceCount,
    advancedStageCount,
    totalPipelineValue,
  };
}

function rawUsageScore(metrics: Omit<ProofUsageMetrics, "score">): number {
  return (
    metrics.opportunityLinkCount * 3 +
    metrics.accountLinkCount * 2 +
    metrics.activityReferenceCount * 4
  );
}

function rawWinScore(metrics: Omit<ProofWinContribution, "score">): number {
  return metrics.wonDealCount * 40 + metrics.wonValueTotal / 25000;
}

function rawObjectionScore(
  metrics: Omit<ProofObjectionResolution, "score">,
): number {
  if (metrics.addressableObjectionIds.length === 0) return 0;
  return (
    metrics.resolvedObjectionIds.length * 30 +
    (metrics.resolutionRate ?? 0) * 0.5
  );
}

function rawInfluenceScore(
  asset: SalesProofAsset,
  metrics: Omit<ProofOpportunityInfluence, "score">,
  opportunities: SalesOpportunity[],
): number {
  const oppMap = opportunityById(opportunities);
  let stagePoints = 0;

  for (const oppId of metrics.influencedOpportunityIds) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const canonical = canonicalizeOpportunityStage(opp.stage);
    stagePoints += STAGE_INFLUENCE_WEIGHT[canonical] ?? 15;
  }

  return (
    stagePoints +
    metrics.openInfluenceCount * 5 +
    metrics.advancedStageCount * 10 +
    (asset.status === "active" ? 10 : 0)
  );
}

function buildRankedAssetRow(
  asset: SalesProofAsset,
  usageScore: number,
  winScore: number,
  objectionScore: number,
  influenceScore: number,
  usage: Omit<ProofUsageMetrics, "score">,
  winContribution: Omit<ProofWinContribution, "score">,
  objectionResolution: Omit<ProofObjectionResolution, "score">,
  opportunityInfluence: Omit<ProofOpportunityInfluence, "score">,
): ProofAssetEffectiveness {
  const effectivenessScore = clampScore(
    usageScore * EFFECTIVENESS_WEIGHTS.usage +
      winScore * EFFECTIVENESS_WEIGHTS.winContribution +
      objectionScore * EFFECTIVENESS_WEIGHTS.objectionResolution +
      influenceScore * EFFECTIVENESS_WEIGHTS.opportunityInfluence,
  );

  return {
    assetId: asset.id,
    title: asset.title,
    assetType: asset.assetType,
    status: asset.status,
    usage: { ...usage, score: usageScore },
    winContribution: { ...winContribution, score: winScore },
    objectionResolution: { ...objectionResolution, score: objectionScore },
    opportunityInfluence: { ...opportunityInfluence, score: influenceScore },
    effectivenessScore,
    rank: 0,
  };
}

export function computeProofAssetEffectiveness(
  snapshot: ProofEffectivenessStoreSnapshot,
): ProofAssetEffectiveness[] {
  const activeAssets = snapshot.proofAssets.filter(
    (asset) => asset.organizationId === snapshot.organizationId,
  );

  if (activeAssets.length === 0) return [];

  const usageRaw = activeAssets.map((asset) =>
    rawUsageScore(
      computeUsageMetrics(asset, snapshot.activities),
    ),
  );
  const winRaw = activeAssets.map((asset) =>
    rawWinScore(
      computeWinContribution(
        asset,
        snapshot.opportunities,
        snapshot.winLossInsights,
      ),
    ),
  );
  const objectionRaw = activeAssets.map((asset) =>
    rawObjectionScore(
      computeObjectionResolution(
        asset,
        snapshot.objections,
        snapshot.proofAssets,
      ),
    ),
  );
  const influenceRaw = activeAssets.map((asset) =>
    rawInfluenceScore(
      asset,
      computeOpportunityInfluence(asset, snapshot.opportunities),
      snapshot.opportunities,
    ),
  );

  const usageScores = normalizeRelative(usageRaw);
  const winScores = normalizeRelative(winRaw);
  const objectionScores = normalizeRelative(objectionRaw);
  const influenceScores = normalizeRelative(influenceRaw);

  const rows = activeAssets.map((asset, index) =>
    buildRankedAssetRow(
      asset,
      usageScores[index] ?? 0,
      winScores[index] ?? 0,
      objectionScores[index] ?? 0,
      influenceScores[index] ?? 0,
      computeUsageMetrics(asset, snapshot.activities),
      computeWinContribution(
        asset,
        snapshot.opportunities,
        snapshot.winLossInsights,
      ),
      computeObjectionResolution(
        asset,
        snapshot.objections,
        snapshot.proofAssets,
      ),
      computeOpportunityInfluence(asset, snapshot.opportunities),
    ),
  );

  rows.sort((a, b) => {
    if (b.effectivenessScore !== a.effectivenessScore) {
      return b.effectivenessScore - a.effectivenessScore;
    }
    return a.title.localeCompare(b.title);
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function buildProofEffectivenessReport(
  snapshot: ProofEffectivenessStoreSnapshot,
  options?: { generatedAt?: string; outputStatus?: "draft" | "recommendation" },
): ProofEffectivenessReport {
  const rankedAssets = computeProofAssetEffectiveness(snapshot);

  return {
    organizationId: snapshot.organizationId,
    generatedAt: options?.generatedAt ?? new Date().toISOString(),
    outputStatus: options?.outputStatus ?? "draft",
    disclaimer: PROOF_EFFECTIVENESS_DISCLAIMER,
    assetCount: rankedAssets.length,
    rankedAssets,
    topAssetIds: rankedAssets.slice(0, 5).map((asset) => asset.assetId),
  };
}

export function buildOrgProofEffectivenessReport(
  organizationId: string,
  snapshot: ProofEffectivenessStoreSnapshot,
): ProofEffectivenessReport {
  return buildProofEffectivenessReport({
    ...snapshot,
    organizationId,
  });
}
