// SalesOS vNext commercial recommendations (Wave B facade over v0.2 strategic-recommendations)

import "server-only";

import {
  listAccounts,
  listAllInteractions,
  listICPInsights,
  listObjections,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
} from "@/lib/sales/store";
import {
  buildStrategicRecommendationsSnapshot,
  STRATEGIC_DISCLAIMER_AR,
  STRATEGIC_DISCLAIMER_COMPACT_AR,
  STRATEGIC_DISCLAIMER_EN,
  STRATEGIC_RECOMMENDATION_LABEL,
  type StrategicEvidenceItem,
  type StrategicRecommendation,
  type StrategicRecommendationCategory,
  type StrategicRecommendationsInput,
  type StrategicRecommendationsSnapshot,
} from "@/lib/sales/v02/strategic-recommendations";

export const COMMERCIAL_RECOMMENDATION_DISCLAIMER_EN =
  "AI-assisted / evidence-based commercial recommendations — not autonomous decisions. Human review required before changing targeting, proof strategy, messaging, or ICP policy.";

export const COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR = STRATEGIC_DISCLAIMER_AR;

export const COMMERCIAL_RECOMMENDATION_DISCLAIMER_COMPACT_AR =
  STRATEGIC_DISCLAIMER_COMPACT_AR;

export const COMMERCIAL_RECOMMENDATION_LABEL = STRATEGIC_RECOMMENDATION_LABEL;

export const COMMERCIAL_RECOMMENDATION_CATEGORIES = [
  "industries",
  "proof",
  "accounts_revisit",
  "opps_at_risk",
  "icp_drift",
  "messaging_themes",
] as const;

export type CommercialRecommendationCategory =
  (typeof COMMERCIAL_RECOMMENDATION_CATEGORIES)[number];

export interface CommercialRecommendationEvidence {
  text: string;
  textAr: string;
  source: StrategicEvidenceItem["source"];
  refId?: string;
}

export interface CommercialRecommendation {
  id: string;
  category: CommercialRecommendationCategory;
  ruleId: string;
  title: string;
  titleAr: string;
  reasoning: string;
  reasoningAr: string;
  confidence: number;
  evidence: CommercialRecommendationEvidence[];
  source: string;
  recommendedAction: string;
  recommendedActionAr: string;
  priority: "high" | "medium" | "low";
  accountId?: string;
  opportunityId?: string;
  industry?: string;
  proofAssetId?: string;
  href?: string;
}

export interface CommercialRecommendationsSnapshot {
  organizationId: string;
  recommendations: CommercialRecommendation[];
  byCategory: Record<
    CommercialRecommendationCategory,
    CommercialRecommendation[]
  >;
  overallConfidence: number;
  disclaimer: string;
  disclaimerAr: string;
  recommendationLabel: typeof COMMERCIAL_RECOMMENDATION_LABEL;
  notAutonomous: true;
}

export type CommercialRecommendationsInput = StrategicRecommendationsInput;

const V02_SOURCE = "v02/strategic-recommendations";

export const CATEGORY_MAP: Record<
  StrategicRecommendationCategory,
  CommercialRecommendationCategory
> = {
  industry_priority: "industries",
  proof_to_use: "proof",
  account_revisit: "accounts_revisit",
  opp_at_risk: "opps_at_risk",
  icp_drift: "icp_drift",
  messaging_themes: "messaging_themes",
};

const RECOMMENDED_ACTIONS: Record<
  CommercialRecommendationCategory,
  { en: string; ar: string }
> = {
  industries: {
    en: "Review ICP alignment and outbound focus for this vertical with sales leadership.",
    ar: "راجع ملاءمة ICP وتركيز التوسع لهذا القطاع مع قيادة المبيعات.",
  },
  proof: {
    en: "Attach or develop relevant proof before the next customer touchpoint.",
    ar: "أرفق أو طور دليلاً مناسباً قبل نقطة التواصل التالية مع العميل.",
  },
  accounts_revisit: {
    en: "Schedule a revisit or re-qualification touch for this account.",
    ar: "جدول مراجعة أو إعادة تأهيل لهذا الحساب.",
  },
  opps_at_risk: {
    en: "Run a deal review and document a risk mitigation plan.",
    ar: "نفّذ مراجعة صفقة ووثّق خطة للتخفيف من المخاطر.",
  },
  icp_drift: {
    en: "Validate pipeline mix against the active ICP hypothesis before pursuing.",
    ar: "تحقق من توافق المسار مع فرضية ICP قبل المتابعة.",
  },
  messaging_themes: {
    en: "Update pitch narrative and objection handling for this recurring theme.",
    ar: "حدّث سرد العرض ومعالجة الاعتراضات لهذا النمط المتكرر.",
  },
};

function emptyByCategory(): Record<
  CommercialRecommendationCategory,
  CommercialRecommendation[]
> {
  return {
    industries: [],
    proof: [],
    accounts_revisit: [],
    opps_at_risk: [],
    icp_drift: [],
    messaging_themes: [],
  };
}

function groupCommercialByCategory(
  recommendations: CommercialRecommendation[],
): Record<CommercialRecommendationCategory, CommercialRecommendation[]> {
  const grouped = emptyByCategory();
  for (const item of recommendations) {
    grouped[item.category].push(item);
  }
  return grouped;
}

function mapEvidence(
  evidence: StrategicEvidenceItem[],
): CommercialRecommendationEvidence[] {
  return evidence.map((item) => ({
    text: item.text,
    textAr: item.textAr,
    source: item.source,
    refId: item.refId,
  }));
}

export function toCommercialRecommendation(
  item: StrategicRecommendation,
): CommercialRecommendation {
  const category = CATEGORY_MAP[item.category];
  const actions = RECOMMENDED_ACTIONS[category];
  return {
    id: item.id.replace(/^strat-/, "comm-"),
    category,
    ruleId: item.ruleId,
    title: item.title,
    titleAr: item.titleAr,
    reasoning: item.reasoning,
    reasoningAr: item.reasoningAr,
    confidence: item.confidence,
    evidence: mapEvidence(item.evidence),
    source: V02_SOURCE,
    recommendedAction: actions.en,
    recommendedActionAr: actions.ar,
    priority: item.priority,
    accountId: item.accountId,
    opportunityId: item.opportunityId,
    industry: item.industry,
    proofAssetId: item.proofAssetId,
    href: item.href,
  };
}

function sortRecommendations(
  recommendations: CommercialRecommendation[],
): CommercialRecommendation[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...recommendations].sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.confidence - a.confidence,
  );
}

function buildSnapshotFromRecommendations(
  organizationId: string,
  recommendations: CommercialRecommendation[],
  overallConfidence: number,
): CommercialRecommendationsSnapshot {
  const sorted = sortRecommendations(recommendations);
  return {
    organizationId,
    recommendations: sorted,
    byCategory: groupCommercialByCategory(sorted),
    overallConfidence,
    disclaimer: COMMERCIAL_RECOMMENDATION_DISCLAIMER_EN,
    disclaimerAr: COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR,
    recommendationLabel: COMMERCIAL_RECOMMENDATION_LABEL,
    notAutonomous: true,
  };
}

export function transformStrategicToCommercialSnapshot(
  strategic: StrategicRecommendationsSnapshot,
): CommercialRecommendationsSnapshot {
  const recommendations = strategic.recommendations.map(toCommercialRecommendation);
  return buildSnapshotFromRecommendations(
    strategic.organizationId,
    recommendations,
    strategic.overallConfidence,
  );
}

export function buildCommercialRecommendationsSnapshot(
  input: CommercialRecommendationsInput,
): CommercialRecommendationsSnapshot {
  const strategic = buildStrategicRecommendationsSnapshot(input);
  return transformStrategicToCommercialSnapshot(strategic);
}

export function loadCommercialRecommendationsFromStore(
  organizationId: string,
  now?: Date,
): CommercialRecommendationsSnapshot {
  return buildCommercialRecommendationsSnapshot({
    organizationId,
    accounts: listAccounts(organizationId),
    opportunities: listOpportunities(organizationId),
    objections: listObjections(organizationId),
    proofAssets: listProofAssets(organizationId),
    icpInsights: listICPInsights(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    interactions: listAllInteractions(organizationId),
    now,
  });
}

export {
  buildStrategicRecommendationsSnapshot,
  loadStrategicRecommendationsFromStore,
} from "@/lib/sales/v02/strategic-recommendations";

export type {
  StrategicRecommendationsInput,
  StrategicRecommendationsSnapshot,
} from "@/lib/sales/v02/strategic-recommendations";
