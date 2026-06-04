// @ts-nocheck
/**
 * SalesOS v0.2 — executive commercial intelligence aggregator.
 * Read-only synthesis for /platform/commercial (not CRM operations).
 */

import type { CurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { getRevenueIntelligenceView } from "@/lib/sales/services/revenue-intelligence-service";
import {
  buildICPLearningSnapshot,
  ICP_DISCLAIMER_AR,
} from "@/lib/sales/services/icp-learning-service";
import {
  salesBuildCommercialMemorySnapshot,
  salesGetTopSignals,
} from "@/lib/sales/services/commercial-memory-service";
import { salesRecommendNextActionsAsUI } from "@/lib/sales/services/next-action";
import { buildPipelineAnalytics } from "@/lib/sales/vnext/pipeline-analytics";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { SalesNextBestActionItem } from "@/lib/sales/types";
import {
  listAccounts,
  listAllInteractions,
  listContactsForAccount,
  listICPInsights,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
} from "@/lib/sales/store";

export const EXECUTIVE_COMMERCIAL_DISCLAIMER_AR =
  "لوحة ذكاء تجاري تنفيذي — DRAFT v0.2. مبنية على بيانات SalesOS التشغيلية؛ ليست CRM ولا قرارات آلية. المراجعة البشرية مطلوبة.";

export type ExecutiveSectionStatus = "ok" | "fallback" | "empty";

export interface ExecutiveCommercialRevenue {
  totalPipeline: number;
  weightedForecast: number;
  forecastConfidence: RevenueIntelligenceSnapshot["forecastConfidence"];
  pipelineCoverageLevel: RevenueIntelligenceSnapshot["pipelineCoverage"]["level"];
  pipelineCoverageLabelAr: string;
  coverageRatioPct: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  lostValue: number;
  riskFlagCount: number;
  noteCount: number;
}

export interface ExecutiveCommercialPipeline {
  totalValue: number;
  weightedValue: number;
  activeOpportunityCount: number;
  stalledCount: number;
  dealsRequiringReview: number;
  avgQualificationScore: number;
  topStages: Array<{ stage: string; count: number; pct: number }>;
}

export interface ExecutiveCommercialIcp {
  hypothesisAr: string;
  overallConfidencePct: number;
  topFitSegments: Array<{ labelAr: string; pct: number }>;
  reviewQueueCount: number;
}

export interface ExecutiveCommercialProof {
  activeAssetCount: number;
  linkedOpportunityCount: number;
  assetTypes: Array<{ type: string; count: number }>;
  coverageGapHintAr: string | null;
}

export interface ExecutiveCommercialSignal {
  label: string;
  count: number;
  source: string;
}

export interface ExecutiveCommercialLearningTrend {
  id: string;
  labelAr: string;
  direction: "up" | "down" | "stable";
  confidencePct: number;
  summaryAr: string;
}

export interface ExecutiveCommercialSection<T> {
  status: ExecutiveSectionStatus;
  fallbackMessageAr?: string;
  data: T | null;
}

export interface ExecutiveCommercialSnapshot {
  organizationId: string;
  generatedAt: string;
  disclaimerAr: string;
  revenue: ExecutiveCommercialSection<ExecutiveCommercialRevenue>;
  pipeline: ExecutiveCommercialSection<ExecutiveCommercialPipeline>;
  icp: ExecutiveCommercialSection<ExecutiveCommercialIcp>;
  proof: ExecutiveCommercialSection<ExecutiveCommercialProof>;
  signals: ExecutiveCommercialSection<ExecutiveCommercialSignal[]>;
  recommendations: ExecutiveCommercialSection<SalesNextBestActionItem[]>;
  learningTrends: ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]>;
}

function pct(n: number): number {
  return Math.round(n * 100);
}

function loadOrgSalesData(orgId: string) {
  const accounts = listAccounts(orgId);
  const opportunities = listOpportunities(orgId);
  const interactions = listAllInteractions(orgId);
  const icpInsights = listICPInsights(orgId);
  const winLossInsights = listWinLossInsights(orgId);
  const contacts = accounts.flatMap((account) =>
    listContactsForAccount(orgId, account.id),
  );
  return {
    accounts,
    opportunities,
    interactions,
    icpInsights,
    winLossInsights,
    contacts,
  };
}

function buildRevenueSection(
  revenue: RevenueIntelligenceSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialRevenue> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل ذكاء الإيرادات — عرض ملخص محدود.",
      data: null,
    };
  }
  if (!revenue || revenue.totalPipeline === 0) {
    return {
      status: "empty",
      fallbackMessageAr: "لا توجد بيانات إيرادات كافية بعد.",
      data: null,
    };
  }
  return {
    status: "ok",
    data: {
      totalPipeline: revenue.totalPipeline,
      weightedForecast: revenue.weightedForecast,
      forecastConfidence: revenue.forecastConfidence,
      pipelineCoverageLevel: revenue.pipelineCoverage.level,
      pipelineCoverageLabelAr: revenue.pipelineCoverage.labelAr,
      coverageRatioPct: pct(revenue.pipelineCoverage.ratio),
      wonCount: revenue.won.count,
      wonValue: revenue.won.value,
      lostCount: revenue.lost.count,
      lostValue: revenue.lost.value,
      riskFlagCount: revenue.riskFlags.length,
      noteCount: revenue.revenueNotes.length,
    },
  };
}

function buildPipelineSection(
  orgId: string,
  revenue: RevenueIntelligenceSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialPipeline> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحليل المسار — راجع SalesOS Pipeline.",
      data: null,
    };
  }
  try {
    const opportunities = listOpportunities(orgId);
    const analytics = buildPipelineAnalytics(opportunities);
    const activeOpportunityCount = opportunities.filter(
      (o) => o.stage !== "ClosedWon" && o.stage !== "ClosedLost",
    ).length;

    if (opportunities.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توجد فرص في المسار.",
        data: null,
      };
    }

    const stageEntries = Object.entries(analytics.stageDistribution)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([stage, count]) => ({
        stage,
        count,
        pct: Math.round((count / opportunities.length) * 100),
      }));

    return {
      status: "ok",
      data: {
        totalValue: analytics.totalValue,
        weightedValue: analytics.weightedValue,
        activeOpportunityCount,
        stalledCount: revenue?.stalledOpportunities.count ?? 0,
        dealsRequiringReview: analytics.dealsRequiringReview,
        avgQualificationScore: analytics.avgQualificationScore,
        topStages: stageEntries,
      },
    };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحليل المسار.",
      data: null,
    };
  }
}

function buildIcpSection(
  snapshot: ICPLearningSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialIcp> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل ICP — راجع /sales/icp.",
      data: null,
    };
  }
  if (!snapshot) {
    return { status: "empty", data: null };
  }

  const topFitSegments = snapshot.icpFit.slice(0, 4).map((row) => ({
    labelAr: row.labelAr,
    pct: row.pct,
  }));

  const reviewQueueCount =
    snapshot.winLossPatterns.filter((r) => r.confidence < 0.6).length +
    snapshot.storedInsights.filter((r) => r.confidence < 0.55).length;

  return {
    status: "ok",
    data: {
      hypothesisAr: snapshot.currentHypothesis.recommendationAr,
      overallConfidencePct: pct(snapshot.overallConfidence),
      topFitSegments,
      reviewQueueCount,
    },
  };
}

function buildProofSection(orgId: string): ExecutiveCommercialSection<ExecutiveCommercialProof> {
  try {
    const assets = listProofAssets(orgId).filter((a) => a.status === "active");
    if (assets.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توجد أصول إثبات نشطة.",
        data: null,
      };
    }

    const typeCounts = new Map<string, number>();
    const linkedOppIds = new Set<string>();
    for (const asset of assets) {
      typeCounts.set(asset.assetType, (typeCounts.get(asset.assetType) ?? 0) + 1);
      for (const oppId of asset.linkedOpportunityIds ?? []) {
        linkedOppIds.add(oppId);
      }
    }

    const assetTypes = [...typeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const coverageGapHintAr =
      linkedOppIds.size === 0
        ? "أصول الإثبات غير مربوطة بفرص — راجع الربط في SalesOS."
        : null;

    return {
      status: "ok",
      data: {
        activeAssetCount: assets.length,
        linkedOpportunityCount: linkedOppIds.size,
        assetTypes,
        coverageGapHintAr,
      },
    };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل شبكة الإثبات.",
      data: null,
    };
  }
}

function buildSignalsSection(
  orgId: string,
): ExecutiveCommercialSection<ExecutiveCommercialSignal[]> {
  try {
    const ranked = salesGetTopSignals(orgId, 8);
    const memory = salesBuildCommercialMemorySnapshot(orgId);
    const merged = ranked.length > 0 ? ranked : memory.topSignals.slice(0, 8);

    if (merged.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا إشارات تجارية مسجلة بعد.",
        data: [],
      };
    }

    return {
      status: "ok",
      data: merged.map((item) => ({
        label: item.label,
        count: item.count,
        source: item.source,
      })),
    };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر استخراج الإشارات من الذاكرة التجارية.",
      data: [],
    };
  }
}

function buildRecommendationsSection(
  orgId: string,
): ExecutiveCommercialSection<SalesNextBestActionItem[]> {
  try {
    const actions = salesRecommendNextActionsAsUI(orgId).slice(0, 8);
    if (actions.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توصيات إجراء حالية — مسار نظيف أو بيانات ناقصة.",
        data: [],
      };
    }
    return { status: "ok", data: actions };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر توليد توصيات NBA.",
      data: [],
    };
  }
}

function deriveLearningTrends(
  snapshot: ICPLearningSnapshot | null,
): ExecutiveCommercialLearningTrend[] {
  if (!snapshot) return [];

  const trends: ExecutiveCommercialLearningTrend[] = [];

  for (const row of snapshot.bestIndustries.slice(0, 2)) {
    trends.push({
      id: `industry-${row.id}`,
      labelAr: row.labelAr,
      direction: row.confidence >= 0.65 ? "up" : "stable",
      confidencePct: pct(row.confidence),
      summaryAr: row.recommendationAr,
    });
  }

  for (const row of snapshot.winLossPatterns.slice(0, 2)) {
    trends.push({
      id: `winloss-${row.id}`,
      labelAr: row.labelAr,
      direction: row.dimension === "win_loss" ? "down" : "stable",
      confidencePct: pct(row.confidence),
      summaryAr: row.recommendationAr,
    });
  }

  if (snapshot.overallConfidence > 0) {
    trends.push({
      id: "icp-overall",
      labelAr: "ثقة ICP الإجمالية",
      direction:
        snapshot.overallConfidence >= 0.6
          ? "up"
          : snapshot.overallConfidence < 0.45
            ? "down"
            : "stable",
      confidencePct: pct(snapshot.overallConfidence),
      summaryAr: snapshot.currentHypothesis.recommendationAr,
    });
  }

  return trends.slice(0, 6);
}

function buildLearningTrendsSection(
  snapshot: ICPLearningSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر استنتاج اتجاهات التعلم.",
      data: [],
    };
  }
  const trends = deriveLearningTrends(snapshot);
  if (trends.length === 0) {
    return {
      status: "empty",
      fallbackMessageAr: "لا اتجاهات تعلم كافية — سجّل المزيد من التفاعلات والنتائج.",
      data: [],
    };
  }
  return { status: "ok", data: trends };
}

export async function buildExecutiveCommercialSnapshot(
  user: CurrentUser,
): Promise<ExecutiveCommercialSnapshot> {
  await initSalesWorkspace(user);
  const orgId = user.organizationId;
  const base = loadOrgSalesData(orgId);

  let revenueSnapshot: RevenueIntelligenceSnapshot | null = null;
  let revenueError: unknown;
  try {
    revenueSnapshot = await getRevenueIntelligenceView(user);
  } catch (err) {
    revenueError = err;
  }

  let icpSnapshot: ICPLearningSnapshot | null = null;
  let icpError: unknown;
  try {
    icpSnapshot = buildICPLearningSnapshot({
      organizationId: orgId,
      accounts: base.accounts,
      opportunities: base.opportunities,
      contacts: base.contacts,
      icpInsights: base.icpInsights,
      winLossInsights: base.winLossInsights,
      interactions: base.interactions,
    });
  } catch (err) {
    icpError = err;
  }

  return {
    organizationId: orgId,
    generatedAt: new Date().toISOString(),
    disclaimerAr: `${EXECUTIVE_COMMERCIAL_DISCLAIMER_AR} ${ICP_DISCLAIMER_AR}`,
    revenue: buildRevenueSection(revenueSnapshot, revenueError),
    pipeline: buildPipelineSection(orgId, revenueSnapshot, revenueError),
    icp: buildIcpSection(icpSnapshot, icpError),
    proof: buildProofSection(orgId),
    signals: buildSignalsSection(orgId),
    recommendations: buildRecommendationsSection(orgId),
    learningTrends: buildLearningTrendsSection(icpSnapshot, icpError),
  };
}

export async function getExecutiveCommercialView(
  user: CurrentUser,
): Promise<ExecutiveCommercialSnapshot> {
  return buildExecutiveCommercialSnapshot(user);
}
