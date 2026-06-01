// @ts-nocheck
/**
 * SalesOS vNext — Proof Effectiveness Analytics (Wave B facade).
 * Re-exports v0.2 scoring and adds industry/stage relevance, gaps, recommendations.
 */

export {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
} from "../v02/proof-effectiveness";

export type {
  ObjectionResolutionMetrics,
  OppInfluenceMetrics,
  ProofAssetEffectivenessRow,
  ProofEffectivenessEvidenceItem,
  ProofEffectivenessInput,
  ProofEffectivenessSnapshot,
  ProofEffectivenessSummary,
  ProofEffectivenessWidgetSummary,
  ProofUsageMetrics,
  WinContributionMetrics,
} from "../v02/proof-effectiveness";

import {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  type ProofAssetEffectivenessRow,
  type ProofEffectivenessInput,
  type ProofEffectivenessSnapshot,
} from "../v02/proof-effectiveness";
import {
  canonicalizeOpportunityStage,
  type SalesAccount,
  type SalesObjection,
  type SalesOpportunity,
  type SalesProofAsset,
} from "../types";
import {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "../v02/proof-effectiveness/types";

export const PROOF_EFFECTIVENESS_WAVE_B_LABEL =
  "Evidence-based proof effectiveness — recommendation only";

export const PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL =
  PROOF_EFFECTIVENESS_WAVE_B_LABEL;

const LATE_STAGES = new Set([
  "proposal",
  "pilot",
  "negotiation",
  "closed_won",
  "in_review",
]);

export interface IndustryStageRelevanceMetrics {
  linkedIndustries: string[];
  linkedStages: string[];
  relevanceScore: number;
}

export interface ProofEffectivenessInsightRow {
  id: string;
  kind: "gap" | "recommendation" | "insight";
  titleEn: string;
  titleAr: string;
  recommendationEn: string;
  recommendationAr: string;
  outputStatus: "recommendation";
  relatedAssetIds?: string[];
  priority?: "high" | "medium" | "low";
}

export interface ProofEffectivenessWaveBSnapshot {
  organizationId: string;
  generatedAt: string;
  disclaimerEn: string;
  disclaimerAr: string;
  outputStatus: "recommendation";
  snapshot: ProofEffectivenessSnapshot;
  mostEffective: ProofAssetEffectivenessRow[];
  underused: ProofAssetEffectivenessRow[];
  gaps: ProofEffectivenessInsightRow[];
  recommendations: ProofEffectivenessInsightRow[];
  industryStageSummary: {
    topIndustriesWithoutProof: string[];
    topStagesWithoutProof: string[];
  };
}

export interface ProofEffectivenessAnalysisInput extends ProofEffectivenessInput {
  accounts: SalesAccount[];
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

function computeIndustryRelevance(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
  winLossWonOppIds: Set<string>,
) {
  const oppMap = new Map(opportunities.map((o) => [o.id, o]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const buckets = new Map<
    string,
    { accounts: Set<string>; opps: Set<string>; won: number }
  >();

  for (const accountId of linkedAccountIds(asset)) {
    const account = accountMap.get(accountId);
    const industry = account?.industry ?? "Unknown";
    const bucket = buckets.get(industry) ?? {
      accounts: new Set<string>(),
      opps: new Set<string>(),
      won: 0,
    };
    bucket.accounts.add(accountId);
    buckets.set(industry, bucket);
  }

  for (const oppId of linkedOpportunityIds(asset)) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const account = accountMap.get(opp.accountId);
    const industry = account?.industry ?? "Unknown";
    const bucket = buckets.get(industry) ?? {
      accounts: new Set<string>(),
      opps: new Set<string>(),
      won: 0,
    };
    bucket.opps.add(oppId);
    if (
      winLossWonOppIds.has(oppId) ||
      canonicalizeOpportunityStage(opp.stage) === "closed_won"
    ) {
      bucket.won += 1;
    }
    buckets.set(industry, bucket);
  }

  const maxScore = Math.max(
    ...[...buckets.values()].map((b) => b.opps.size * 2 + b.accounts.size + b.won),
    1,
  );

  return [...buckets.entries()]
    .map(([industry, bucket]) => ({
      industry,
      score: Math.round(
        ((bucket.opps.size * 2 + bucket.accounts.size + bucket.won) / maxScore) * 100,
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

function computeStageRelevance(asset: SalesProofAsset, opportunities: SalesOpportunity[]) {
  const oppMap = new Map(opportunities.map((o) => [o.id, o]));
  const buckets = new Map<string, { canonical: string; opps: Set<string>; late: number }>();

  for (const oppId of linkedOpportunityIds(asset)) {
    const opp = oppMap.get(oppId);
    if (!opp) continue;
    const canonical = canonicalizeOpportunityStage(opp.stage);
    const bucket = buckets.get(canonical) ?? {
      canonical,
      opps: new Set<string>(),
      late: 0,
    };
    bucket.opps.add(oppId);
    if (LATE_STAGES.has(canonical)) bucket.late += 1;
    buckets.set(canonical, bucket);
  }

  const maxScore = Math.max(
    ...[...buckets.values()].map((b) => b.opps.size + b.late),
    1,
  );

  return [...buckets.entries()]
    .map(([canonical, bucket]) => ({
      canonical,
      score: Math.round(((bucket.opps.size + bucket.late) / maxScore) * 100),
    }))
    .sort((a, b) => b.score - a.score);
}

export function computeIndustryStageRelevance(
  asset: SalesProofAsset,
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
): IndustryStageRelevanceMetrics {
  const industries = computeIndustryRelevance(asset, opportunities, accounts, new Set());
  const stages = computeStageRelevance(asset, opportunities);
  const scores = [...industries.map((i) => i.score), ...stages.map((s) => s.score)];
  const relevanceScore =
    scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

  return {
    linkedIndustries: industries.map((i) => i.industry),
    linkedStages: stages.map((s) => s.canonical),
    relevanceScore,
  };
}

function identifyUnderused(rows: ProofAssetEffectivenessRow[]): ProofAssetEffectivenessRow[] {
  if (rows.length === 0) return [];
  const maxUsage = Math.max(...rows.map((r) => r.usage.usageScore), 1);
  const medianEffectiveness =
    rows.reduce((s, r) => s + r.effectivenessScore, 0) / rows.length;

  return rows
    .filter(
      (row) =>
        row.status === "active" &&
        row.usage.usageScore < maxUsage * 0.35 &&
        (row.effectivenessScore >= medianEffectiveness ||
          row.assetType === "objection_response" ||
          (row.winContribution.winRate ?? 0) >= 0.5),
    )
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
    .slice(0, 5);
}

function buildIndustryStageSummary(
  opportunities: SalesOpportunity[],
  accounts: SalesAccount[],
  proofAssets: SalesProofAsset[],
) {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const activeOpps = opportunities.filter(
    (o) => canonicalizeOpportunityStage(o.stage) !== "closed_lost",
  );
  const coveredOppIds = new Set<string>();
  for (const asset of proofAssets.filter((a) => a.status !== "archived")) {
    for (const oppId of linkedOpportunityIds(asset)) coveredOppIds.add(oppId);
  }

  const industriesWithout = new Set<string>();
  const stagesWithout = new Set<string>();

  for (const opp of activeOpps) {
    const industry = accountMap.get(opp.accountId)?.industry ?? "Unknown";
    if (!coveredOppIds.has(opp.id)) industriesWithout.add(industry);
    const canonical = canonicalizeOpportunityStage(opp.stage);
    if (!coveredOppIds.has(opp.id) && LATE_STAGES.has(canonical)) {
      stagesWithout.add(canonical);
    }
  }

  return {
    topIndustriesWithoutProof: [...industriesWithout],
    topStagesWithoutProof: [...stagesWithout],
  };
}

function gapToInsight(
  id: string,
  titleEn: string,
  titleAr: string,
  descriptionEn: string,
  descriptionAr: string,
): ProofEffectivenessInsightRow {
  return {
    id,
    kind: "gap",
    titleEn,
    titleAr,
    recommendationEn: descriptionEn,
    recommendationAr: descriptionAr,
    outputStatus: "recommendation",
  };
}

function buildGapInsights(input: {
  industryStageSummary: ProofEffectivenessWaveBSnapshot["industryStageSummary"];
  underused: ProofAssetEffectivenessRow[];
  objections: SalesObjection[];
  proofAssets: SalesProofAsset[];
}): ProofEffectivenessInsightRow[] {
  const gaps: ProofEffectivenessInsightRow[] = [];

  for (const industry of input.industryStageSummary.topIndustriesWithoutProof) {
    gaps.push(
      gapToInsight(
        `gap-industry-${industry}`,
        `No proof linked for ${industry}`,
        `لا أدلة مرتبطة لقطاع ${industry}`,
        `Active pipeline in ${industry} lacks linked proof assets.`,
        `مسار نشط في ${industry} بدون أصول إثبات مرتبطة.`,
      ),
    );
  }

  for (const stage of input.industryStageSummary.topStagesWithoutProof) {
    gaps.push(
      gapToInsight(
        `gap-stage-${stage}`,
        `Late stage gap: ${stage}`,
        `فجوة مرحلة متأخرة: ${stage}`,
        `Opportunities at ${stage} lack linked proof.`,
        `فرص في ${stage} بدون إثبات مرتبط.`,
      ),
    );
  }

  const unresolvedCategories = [
    ...new Set(
      input.objections
        .filter((o) => o.status !== "archived" && !o.resolved)
        .map((o) => o.category),
    ),
  ];
  const objectionAssets = input.proofAssets.filter(
    (a) => a.assetType === "objection_response" && a.status === "active",
  );

  for (const category of unresolvedCategories) {
    const hasAsset = objectionAssets.some((a) =>
      a.title.toLowerCase().includes(category.toLowerCase()),
    );
    if (!hasAsset) {
      gaps.push(
        gapToInsight(
          `gap-objection-${category}`,
          `Unresolved ${category} objections lack proof pack`,
          `اعتراضات ${category} غير محلولة بدون حزمة إثبات`,
          `Create objection_response assets for ${category}.`,
          `أنشئ أصول objection_response لـ ${category}.`,
        ),
      );
    }
  }

  if (input.underused.length > 0) {
    gaps.push(
      gapToInsight(
        "gap-usage-underused",
        "High-potential proof assets are under-linked",
        "أصول إثبات عالية الإمكانية غير مستخدمة بما يكفي",
        `${input.underused.length} asset(s) show strong signals but low deployment.`,
        `${input.underused.length} أصل يُظهر إشارات قوية لكن استخداماً منخفضاً.`,
      ),
    );
  }

  return gaps;
}

function buildRecommendationInsights(input: {
  mostEffective: ProofAssetEffectivenessRow[];
  underused: ProofAssetEffectivenessRow[];
  gaps: ProofEffectivenessInsightRow[];
}): ProofEffectivenessInsightRow[] {
  const recs: ProofEffectivenessInsightRow[] = [];
  const top = input.mostEffective[0];

  if (top) {
    recs.push({
      id: "rec-scale-top-performer",
      kind: "recommendation",
      titleEn: `Scale "${top.title}" to similar deals`,
      titleAr: `وسّع "${top.title}" لصفقات مشابهة`,
      recommendationEn: `Top-ranked asset (score ${top.effectivenessScore}).`,
      recommendationAr: `أعلى أصل (درجة ${top.effectivenessScore}).`,
      relatedAssetIds: [top.assetId],
      priority: "high",
      outputStatus: "recommendation",
    });
  }

  for (const asset of input.underused.slice(0, 2)) {
    recs.push({
      id: `rec-deploy-${asset.assetId}`,
      kind: "recommendation",
      titleEn: `Deploy underused asset "${asset.title}"`,
      titleAr: `انشر الأصل غير المستخدم "${asset.title}"`,
      recommendationEn: `Effectiveness ${asset.effectivenessScore}, usage ${asset.usage.usageScore}.`,
      recommendationAr: `فعالية ${asset.effectivenessScore}، استخدام ${asset.usage.usageScore}.`,
      relatedAssetIds: [asset.assetId],
      priority: "medium",
      outputStatus: "recommendation",
    });
  }

  for (const gap of input.gaps.filter((g) => g.id.startsWith("gap-industry")).slice(0, 2)) {
    recs.push({
      id: `rec-${gap.id}`,
      kind: "recommendation",
      titleEn: gap.titleEn,
      titleAr: gap.titleAr,
      recommendationEn: gap.recommendationEn,
      recommendationAr: gap.recommendationAr,
      relatedAssetIds: input.mostEffective.slice(0, 1).map((a) => a.assetId),
      priority: "high",
      outputStatus: "recommendation",
    });
  }

  return recs.slice(0, 8);
}

export function buildProofEffectivenessWaveBSnapshot(
  input: ProofEffectivenessAnalysisInput,
): ProofEffectivenessWaveBSnapshot {
  const snapshot = buildProofEffectivenessSnapshot(input);
  const mostEffective = getMostEffectiveProofAssets(snapshot, 5);
  const underused = identifyUnderused(snapshot.rankedAssets);
  const industryStageSummary = buildIndustryStageSummary(
    input.opportunities,
    input.accounts,
    input.proofAssets,
  );
  const gaps = buildGapInsights({
    industryStageSummary,
    underused,
    objections: input.objections,
    proofAssets: input.proofAssets,
  });
  const recommendations = buildRecommendationInsights({ mostEffective, underused, gaps });

  return {
    organizationId: input.organizationId,
    generatedAt: snapshot.generatedAt,
    disclaimerEn: PROOF_EFFECTIVENESS_DISCLAIMER_EN,
    disclaimerAr: PROOF_EFFECTIVENESS_DISCLAIMER_AR,
    outputStatus: "recommendation",
    snapshot,
    mostEffective,
    underused,
    gaps,
    recommendations,
    industryStageSummary,
  };
}

export function filterProofEffectivenessForOpportunity(
  waveB: ProofEffectivenessWaveBSnapshot,
  linkedAssetIds: Set<string>,
): ProofEffectivenessWaveBSnapshot {
  const filterRows = (rows: ProofAssetEffectivenessRow[]) =>
    rows.filter((row) => linkedAssetIds.has(row.assetId));

  let mostEffective = filterRows(waveB.mostEffective);
  const underused = filterRows(waveB.underused);

  if (mostEffective.length === 0) {
    mostEffective = waveB.snapshot.rankedAssets
      .filter((row) => linkedAssetIds.has(row.assetId))
      .slice(0, 5);
  }
  if (mostEffective.length === 0) {
    mostEffective = waveB.mostEffective.slice(0, 3);
  }

  const relatedIds = new Set([
    ...mostEffective.map((r) => r.assetId),
    ...underused.map((r) => r.assetId),
  ]);

  return {
    ...waveB,
    mostEffective,
    underused,
    gaps: waveB.gaps.filter(
      (g) => !g.relatedAssetIds?.length || g.relatedAssetIds.some((id) => relatedIds.has(id)),
    ),
    recommendations: waveB.recommendations.filter(
      (r) =>
        !r.relatedAssetIds?.length ||
        r.relatedAssetIds.some((id) => relatedIds.has(id) || linkedAssetIds.has(id)),
    ),
  };
}

export const buildProofEffectivenessAnalysis = buildProofEffectivenessWaveBSnapshot;

export type ProofEffectivenessAnalysis = ProofEffectivenessWaveBSnapshot;
export type ProofEffectivenessEnrichedRow = ProofAssetEffectivenessRow;
export type ProofEffectivenessGap = ProofEffectivenessInsightRow;
export type ProofEffectivenessRecommendation = ProofEffectivenessInsightRow;
