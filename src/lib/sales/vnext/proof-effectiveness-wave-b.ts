/**
 * SalesOS vNext — Proof Effectiveness Wave B facade over v0.2 analytics.
 */

import "server-only";

import {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "../v02/proof-effectiveness";
import type {
  ProofAssetEffectivenessRow,
  ProofEffectivenessInput,
  ProofEffectivenessSnapshot,
  ProofEffectivenessWidgetSummary,
} from "../v02/proof-effectiveness";
import {
  canonicalizeOpportunityStage,
  type SalesAccount,
  type SalesOpportunity,
  type SalesProofAsset,
} from "../types";

export {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
};

export type {
  ProofAssetEffectivenessRow,
  ProofEffectivenessInput,
  ProofEffectivenessSnapshot,
  ProofEffectivenessWidgetSummary,
  ProofUsageMetrics,
  WinContributionMetrics,
  ObjectionResolutionMetrics,
  OppInfluenceMetrics,
} from "../v02/proof-effectiveness";

export const PROOF_EFFECTIVENESS_WAVE_B_LABEL =
  "Proof effectiveness recommendation";

export interface IndustryStageRelevanceMetrics {
  linkedIndustries: string[];
  linkedStages: string[];
  industryCoverageScore: number;
  stageCoverageScore: number;
  relevanceScore: number;
}

export interface ProofEffectivenessInsightRow {
  id: string;
  assetId?: string;
  title: string;
  titleAr: string;
  kind: "most_effective" | "underused" | "gap" | "recommendation";
  effectivenessScore?: number;
  usageScore?: number;
  industryStageRelevance?: IndustryStageRelevanceMetrics;
  recommendationAr: string;
  recommendationEn: string;
  evidence: string[];
  outputStatus: "recommendation";
}

export interface ProofEffectivenessWaveBSnapshot {
  organizationId: string;
  generatedAt: string;
  snapshot: ProofEffectivenessSnapshot;
  mostEffective: ProofAssetEffectivenessRow[];
  underused: ProofAssetEffectivenessRow[];
  gaps: ProofEffectivenessInsightRow[];
  recommendations: ProofEffectivenessInsightRow[];
  industryStageSummary: {
    topIndustriesWithoutProof: string[];
    topStagesWithoutProof: string[];
  };
  disclaimerEn: string;
  disclaimerAr: string;
  outputStatus: "recommendation";
}

const LATE_STAGES = new Set([
  "proposal",
  "pilot",
  "negotiation",
  "closed_won",
  "in_review",
]);

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

export function computeIndustryStageRelevance(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
): IndustryStageRelevanceMetrics {
  const oppMap = new Map(opportunities.map((o) => [o.id, o]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const industries = new Set<string>();
  const stages = new Set<string>();

  for (const oppId of linkedOpportunityIds(asset)) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    stages.add(canonicalizeOpportunityStage(opp.stage));
    const account = accountMap.get(opp.accountId);
    if (account?.industry) industries.add(account.industry);
  }

  for (const accountId of linkedAccountIds(asset)) {
    const account = accountMap.get(accountId);
    if (account?.industry) industries.add(account.industry);
  }

  const linkedIndustries = [...industries];
  const linkedStages = [...stages];
  const lateStageHits = linkedStages.filter((s) => LATE_STAGES.has(s)).length;

  return {
    linkedIndustries,
    linkedStages,
    industryCoverageScore: Math.min(linkedIndustries.length / 2, 1),
    stageCoverageScore: Math.min(
      (lateStageHits * 0.6 + linkedStages.length * 0.4) / 2,
      1,
    ),
    relevanceScore: Math.round(
      (Math.min(linkedIndustries.length / 2, 1) * 0.45 +
        Math.min((lateStageHits * 0.6 + linkedStages.length * 0.4) / 2, 1) *
          0.55) *
        100,
    ),
  };
}

function enrichRowsWithRelevance(
  rows: ProofAssetEffectivenessRow[],
  proofAssets: SalesProofAsset[],
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
): Map<string, IndustryStageRelevanceMetrics> {
  const assetMap = new Map(proofAssets.map((a) => [a.id, a]));
  const out = new Map<string, IndustryStageRelevanceMetrics>();
  for (const row of rows) {
    const asset = assetMap.get(row.assetId);
    if (!asset) continue;
    out.set(
      row.assetId,
      computeIndustryStageRelevance(asset, opportunities, accounts),
    );
  }
  return out;
}

function industriesAndStagesNeedingProof(
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
  proofAssets: SalesProofAsset[],
): { industries: string[]; stages: string[] } {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const coveredIndustries = new Set<string>();
  const coveredStages = new Set<string>();

  for (const asset of proofAssets) {
    if (asset.status === "archived") continue;
    const rel = computeIndustryStageRelevance(asset, opportunities, accounts);
    for (const i of rel.linkedIndustries) coveredIndustries.add(i);
    for (const s of rel.linkedStages) coveredStages.add(s);
  }

  const industryDemand = new Map<string, number>();
  const stageDemand = new Map<string, number>();

  for (const opp of opportunities) {
    const canonical = canonicalizeOpportunityStage(opp.stage);
    if (canonical === "closed_lost") continue;
    stageDemand.set(canonical, (stageDemand.get(canonical) ?? 0) + 1);
    const industry = accountMap.get(opp.accountId)?.industry;
    if (industry)
      industryDemand.set(industry, (industryDemand.get(industry) ?? 0) + 1);
  }

  return {
    industries: [...industryDemand.entries()]
      .filter(([name]) => !coveredIndustries.has(name))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name),
    stages: [...stageDemand.entries()]
      .filter(([name]) => !coveredStages.has(name) && LATE_STAGES.has(name))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name),
  };
}

function detectUnderused(
  rows: ProofAssetEffectivenessRow[],
  relevanceByAsset: Map<string, IndustryStageRelevanceMetrics>,
): ProofAssetEffectivenessRow[] {
  if (rows.length === 0) return [];
  const maxUsage = Math.max(...rows.map((r) => r.usage.usageScore), 1);
  const usageThreshold = maxUsage * 0.35;

  return rows
    .filter((row) => {
      if (row.status !== "active") return false;
      if (row.usage.usageScore > usageThreshold) return false;
      const rel = relevanceByAsset.get(row.assetId);
      return (
        (rel?.relevanceScore ?? 0) >= 40 ||
        row.objectionResolution.linkedObjectionCount > 0
      );
    })
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
    .slice(0, 8);
}

function buildGapInsights(
  industries: string[],
  stages: string[],
): ProofEffectivenessInsightRow[] {
  const gaps: ProofEffectivenessInsightRow[] = [];

  for (const industry of industries) {
    gaps.push({
      id: `gap-industry-${industry.replace(/\s+/g, "-").toLowerCase()}`,
      title: `Proof gap: ${industry}`,
      titleAr: `Proof gap: ${industry}`,
      kind: "gap",
      recommendationEn: `Add or link proof assets for active pipeline in ${industry}.`,
      recommendationAr: `Add or link proof for ${industry}.`,
      evidence: [`Industry "${industry}" has pipeline without linked proof`],
      outputStatus: "recommendation",
    });
  }

  for (const stage of stages) {
    gaps.push({
      id: `gap-stage-${stage}`,
      title: `Proof gap: late stage ${stage}`,
      titleAr: `Proof gap: stage ${stage}`,
      kind: "gap",
      recommendationEn: `Deploy stage-appropriate proof for ${stage} deals.`,
      recommendationAr: `Deploy proof for stage ${stage}.`,
      evidence: [`Late stage "${stage}" lacks linked proof coverage`],
      outputStatus: "recommendation",
    });
  }

  return gaps;
}

function buildRecommendations(
  mostEffective: ProofAssetEffectivenessRow[],
  underused: ProofAssetEffectivenessRow[],
  gaps: ProofEffectivenessInsightRow[],
  relevanceByAsset: Map<string, IndustryStageRelevanceMetrics>,
): ProofEffectivenessInsightRow[] {
  const recs: ProofEffectivenessInsightRow[] = [];
  const top = mostEffective[0];

  if (top) {
    recs.push({
      id: `rec-promote-${top.assetId}`,
      assetId: top.assetId,
      title: top.title,
      titleAr: top.title,
      kind: "recommendation",
      effectivenessScore: top.effectivenessScore,
      usageScore: top.usage.usageScore,
      industryStageRelevance: relevanceByAsset.get(top.assetId),
      recommendationEn: `Promote "${top.title}" in late-stage deals.`,
      recommendationAr: `Promote "${top.title}" in late-stage deals.`,
      evidence: top.evidence.slice(0, 3).map((e) => e.textAr || e.text),
      outputStatus: "recommendation",
    });
  }

  for (const row of underused.slice(0, 3)) {
    recs.push({
      id: `rec-underuse-${row.assetId}`,
      assetId: row.assetId,
      title: row.title,
      titleAr: row.title,
      kind: "recommendation",
      effectivenessScore: row.effectivenessScore,
      usageScore: row.usage.usageScore,
      industryStageRelevance: relevanceByAsset.get(row.assetId),
      recommendationEn: `Reuse underused asset "${row.title}".`,
      recommendationAr: `Reuse underused asset "${row.title}".`,
      evidence: row.evidence.slice(0, 2).map((e) => e.textAr || e.text),
      outputStatus: "recommendation",
    });
  }

  for (const gap of gaps.slice(0, 3)) {
    recs.push({
      id: `rec-${gap.id}`,
      title: gap.title,
      titleAr: gap.titleAr,
      kind: "recommendation",
      recommendationEn: gap.recommendationEn,
      recommendationAr: gap.recommendationAr,
      evidence: gap.evidence,
      outputStatus: "recommendation",
    });
  }

  return recs.slice(0, 10);
}

export interface ProofEffectivenessWaveBInput extends ProofEffectivenessInput {
  accounts?: SalesAccount[];
}

export function buildProofEffectivenessWaveBSnapshot(
  input: ProofEffectivenessWaveBInput,
): ProofEffectivenessWaveBSnapshot {
  const accounts = input.accounts ?? [];
  const snapshot = buildProofEffectivenessSnapshot(input);
  const relevanceByAsset = enrichRowsWithRelevance(
    snapshot.rankedAssets,
    input.proofAssets,
    input.opportunities,
    accounts,
  );

  const mostEffective = getMostEffectiveProofAssets(snapshot, 8);
  const underused = detectUnderused(snapshot.rankedAssets, relevanceByAsset);
  const { industries, stages } = industriesAndStagesNeedingProof(
    input.opportunities,
    accounts,
    input.proofAssets,
  );
  const gaps = buildGapInsights(industries, stages);
  const recommendations = buildRecommendations(
    mostEffective,
    underused,
    gaps,
    relevanceByAsset,
  );

  return {
    organizationId: input.organizationId,
    generatedAt: snapshot.generatedAt,
    snapshot,
    mostEffective,
    underused,
    gaps,
    recommendations,
    industryStageSummary: {
      topIndustriesWithoutProof: industries,
      topStagesWithoutProof: stages,
    },
    disclaimerEn: PROOF_EFFECTIVENESS_DISCLAIMER_EN,
    disclaimerAr: PROOF_EFFECTIVENESS_DISCLAIMER_AR,
    outputStatus: "recommendation",
  };
}

export function filterProofEffectivenessForOpportunity(
  waveB: ProofEffectivenessWaveBSnapshot,
  linkedAssetIds: Set<string>,
): ProofEffectivenessWaveBSnapshot {
  const scopedRows =
    linkedAssetIds.size > 0
      ? waveB.snapshot.rankedAssets.filter((r) => linkedAssetIds.has(r.assetId))
      : waveB.snapshot.rankedAssets.slice(0, 5);

  return {
    ...waveB,
    mostEffective: scopedRows.slice(0, 5),
    underused: waveB.underused.filter((r) =>
      scopedRows.some((s) => s.assetId === r.assetId),
    ),
    recommendations: waveB.recommendations.slice(0, 5),
    gaps: waveB.gaps.slice(0, 3),
  };
}
