/**
 * SalesOS v0.2 Wave C — executive commercial dashboard service.
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
import { salesGetCommercialRecommendations } from "@/lib/sales/services/commercial-recommendations-service";
import { salesGetMarketIntelligenceForOrg } from "@/lib/sales/services/market-intelligence-service";
import { salesGetProofEffectivenessWidget } from "@/lib/sales/services/proof-effectiveness-service";
import { salesListCrossProductSignalsForCommandCenter } from "@/lib/sales/services/cross-product-signals-service";
import { salesBuildInstitutionalLearningSnapshot } from "@/lib/sales/services/institutional-learning-service";
import { buildPipelineAnalytics } from "@/lib/sales/vnext/pipeline-analytics";
import type { CommercialRecommendation } from "@/lib/sales/vnext/commercial-recommendations";
import { COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR } from "@/lib/sales/vnext/commercial-recommendations";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { InstitutionalLearningSnapshot } from "@/lib/sales/v02/institutional-learning";
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
  topEffectiveAssets: Array<{ title: string; score: number; linkedCount: number }>;
}

export interface ExecutiveCommercialSignal {
  label: string;
  count: number;
  source: string;
}

export interface ExecutiveCommercialRecommendationRow {
  id: string;
  titleAr: string;
  priority: CommercialRecommendation["priority"];
  reasoningAr: string;
  category: CommercialRecommendation["category"];
  confidencePct: number;
  href?: string;
}

export interface ExecutiveCommercialLearningTrend {
  id: string;
  labelAr: string;
  direction: "up" | "down" | "stable" | "insufficient_data";
  confidencePct: number;
  summaryAr: string;
}

export interface ExecutiveCommercialRisk {
  id: string;
  labelAr: string;
  severity: "high" | "medium" | "low";
  source: string;
  href?: string;
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
  recommendations: ExecutiveCommercialSection<ExecutiveCommercialRecommendationRow[]>;
  learningTrends: ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]>;
  executiveRisks: ExecutiveCommercialSection<ExecutiveCommercialRisk[]>;
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
    const widget = salesGetProofEffectivenessWidget(orgId, 3);

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
        topEffectiveAssets: widget.topAssets.map((row) => ({
          title: row.title,
          score: row.effectivenessScore,
          linkedCount: row.linkedOpportunityCount,
        })),
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
  market: WaveBMarketIntelligenceView | null,
  crossProduct: WaveAInstitutionalSignal[] | null,
): ExecutiveCommercialSection<ExecutiveCommercialSignal[]> {
  try {
    const merged: ExecutiveCommercialSignal[] = [];

    if (crossProduct && crossProduct.length > 0) {
      for (const signal of crossProduct.slice(0, 4)) {
        merged.push({
          label: signal.titleAr,
          count: signal.severity === "high" ? 3 : signal.severity === "medium" ? 2 : 1,
          source: `cross-product:${signal.waveAKind}`,
        });
      }
    }

    if (market) {
      for (const signal of market.topMarketSignals.slice(0, 3)) {
        merged.push({
          label: signal.labelAr ?? signal.label,
          count: Math.round(signal.score),
          source: "market-intelligence",
        });
      }
    }

    const ranked = salesGetTopSignals(orgId, 6);
    const memory = salesBuildCommercialMemorySnapshot(orgId);
    const memorySignals = ranked.length > 0 ? ranked : memory.topSignals.slice(0, 6);

    for (const item of memorySignals.slice(0, 4)) {
      merged.push({
        label: item.label,
        count: item.count,
        source: item.source,
      });
    }

    const deduped = merged.filter(
      (row, index, arr) =>
        arr.findIndex((other) => other.label === row.label && other.source === row.source) ===
        index,
    );

    if (deduped.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا إشارات تجارية مسجلة بعد.",
        data: [],
      };
    }

    return { status: "ok", data: deduped.slice(0, 10) };
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
): ExecutiveCommercialSection<ExecutiveCommercialRecommendationRow[]> {
  try {
    const snapshot = salesGetCommercialRecommendations(orgId);
    const rows = snapshot.recommendations.slice(0, 8).map((rec) => ({
      id: rec.id,
      titleAr: rec.titleAr,
      priority: rec.priority,
      reasoningAr: rec.reasoningAr,
      category: rec.category,
      confidencePct: pct(rec.confidence),
      href: rec.href,
    }));

    if (rows.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توصيات استراتيجية حالية — مسار نظيف أو بيانات ناقصة.",
        data: [],
      };
    }
    return { status: "ok", data: rows };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر توليد التوصيات التجارية.",
      data: [],
    };
  }
}

function mapInstitutionalTrendDirection(
  direction: InstitutionalLearningSnapshot["trends"][number]["direction"],
): ExecutiveCommercialLearningTrend["direction"] {
  if (direction === "insufficient_data") return "insufficient_data";
  return direction;
}

function buildLearningTrendsSection(
  institutional: InstitutionalLearningSnapshot | null,
  icpSnapshot: ICPLearningSnapshot | null,
  institutionalError?: unknown,
  icpError?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]> {
  if (institutionalError && icpError) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر استنتاج اتجاهات التعلم.",
      data: [],
    };
  }

  const trends: ExecutiveCommercialLearningTrend[] = [];

  if (institutional) {
    for (const row of institutional.trends.slice(0, 4)) {
      trends.push({
        id: row.id,
        labelAr: row.metricAr,
        direction: mapInstitutionalTrendDirection(row.direction),
        confidencePct: pct(row.confidence),
        summaryAr: `${row.metricAr}: ${row.currentValue}${row.priorValue != null ? ` (سابق ${row.priorValue})` : ""}`,
      });
    }
    for (const pattern of institutional.patterns.slice(0, 2)) {
      trends.push({
        id: pattern.id,
        labelAr: pattern.labelAr,
        direction: pattern.patternType === "loss_theme" ? "down" : "up",
        confidencePct: pct(pattern.confidence),
        summaryAr: pattern.recommendationAr,
      });
    }
  }

  if (trends.length < 3 && icpSnapshot) {
    if (icpSnapshot.overallConfidence > 0) {
      trends.push({
        id: "icp-overall",
        labelAr: "ثقة ICP الإجمالية",
        direction:
          icpSnapshot.overallConfidence >= 0.6
            ? "up"
            : icpSnapshot.overallConfidence < 0.45
              ? "down"
              : "stable",
        confidencePct: pct(icpSnapshot.overallConfidence),
        summaryAr: icpSnapshot.currentHypothesis.recommendationAr,
      });
    }
  }

  if (trends.length === 0) {
    return {
      status: "empty",
      fallbackMessageAr: "لا اتجاهات تعلم كافية — أغلق صفقات أو سجّل تفاعلات.",
      data: [],
    };
  }
  return { status: "ok", data: trends.slice(0, 6) };
}

function buildExecutiveRisksSection(
  revenue: RevenueIntelligenceSnapshot | null,
  commercialRecs: ReturnType<typeof salesGetCommercialRecommendations> | null,
  crossProduct: WaveAInstitutionalSignal[] | null,
  market: WaveBMarketIntelligenceView | null,
): ExecutiveCommercialSection<ExecutiveCommercialRisk[]> {
  try {
    const risks: ExecutiveCommercialRisk[] = [];

    if (revenue) {
      for (const flag of revenue.riskFlags.slice(0, 5)) {
        risks.push({
          id: flag.id,
          labelAr: flag.labelAr,
          severity: flag.severity,
          source: "revenue-intelligence",
          href: flag.opportunityId ? `/sales/opportunities/${flag.opportunityId}` : "/sales/revenue",
        });
      }
    }

    if (commercialRecs) {
      for (const rec of commercialRecs.byCategory.opps_at_risk.slice(0, 4)) {
        risks.push({
          id: rec.id,
          labelAr: rec.titleAr,
          severity: rec.priority === "high" ? "high" : rec.priority === "medium" ? "medium" : "low",
          source: "commercial-recommendations",
          href: rec.href ?? (rec.opportunityId ? `/sales/opportunities/${rec.opportunityId}` : "/sales"),
        });
      }
    }

    if (crossProduct) {
      for (const signal of crossProduct.filter((s) => s.severity === "high").slice(0, 3)) {
        risks.push({
          id: signal.id,
          labelAr: signal.titleAr,
          severity: "high",
          source: `cross-product:${signal.waveAKind}`,
        });
      }
    }

    if (market) {
      for (const competitor of market.topCompetitorSignals
        .filter((c) => c.threatLevel === "high")
        .slice(0, 2)) {
        risks.push({
          id: competitor.id,
          labelAr: `منافس: ${competitor.competitorName}`,
          severity: "medium",
          source: "market-intelligence",
        });
      }
    }

    const deduped = risks.filter(
      (row, index, arr) => arr.findIndex((other) => other.id === row.id) === index,
    );

    if (deduped.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا مخاطر تنفيذية مُعلّمة حالياً — راقب المسار والإشارات.",
        data: [],
      };
    }

    return { status: "ok", data: deduped.slice(0, 10) };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تجميع المخاطر التنفيذية.",
      data: [],
    };
  }
}

export async function salesBuildExecutiveCommercialSnapshot(
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

  let institutionalSnapshot: InstitutionalLearningSnapshot | null = null;
  let institutionalError: unknown;
  try {
    institutionalSnapshot = salesBuildInstitutionalLearningSnapshot(orgId);
  } catch (err) {
    institutionalError = err;
  }

  let marketView: WaveBMarketIntelligenceView | null = null;
  try {
    marketView = salesGetMarketIntelligenceForOrg(orgId);
  } catch {
    marketView = null;
  }

  let commercialRecs: ReturnType<typeof salesGetCommercialRecommendations> | null = null;
  try {
    commercialRecs = salesGetCommercialRecommendations(orgId);
  } catch {
    commercialRecs = null;
  }

  let crossProductSignals: WaveAInstitutionalSignal[] | null = null;
  try {
    crossProductSignals = await salesListCrossProductSignalsForCommandCenter(
      orgId,
      user.id,
      8,
    );
  } catch {
    crossProductSignals = null;
  }

  return {
    organizationId: orgId,
    generatedAt: new Date().toISOString(),
    disclaimerAr: `${EXECUTIVE_COMMERCIAL_DISCLAIMER_AR} ${ICP_DISCLAIMER_AR} ${COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR}`,
    revenue: buildRevenueSection(revenueSnapshot, revenueError),
    pipeline: buildPipelineSection(orgId, revenueSnapshot, revenueError),
    icp: buildIcpSection(icpSnapshot, icpError),
    proof: buildProofSection(orgId),
    signals: buildSignalsSection(orgId, marketView, crossProductSignals),
    recommendations: buildRecommendationsSection(orgId),
    learningTrends: buildLearningTrendsSection(
      institutionalSnapshot,
      icpSnapshot,
      institutionalError,
      icpError,
    ),
    executiveRisks: buildExecutiveRisksSection(
      revenueSnapshot,
      commercialRecs,
      crossProductSignals,
      marketView,
    ),
  };
}

export async function salesGetExecutiveCommercialView(
  user: CurrentUser,
): Promise<ExecutiveCommercialSnapshot> {
  return salesBuildExecutiveCommercialSnapshot(user);
}
