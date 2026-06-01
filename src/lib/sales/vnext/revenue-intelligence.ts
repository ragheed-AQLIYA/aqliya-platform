// ─── SalesOS revenue intelligence (vNext) ───

import type { CurrentUser } from "@/lib/auth";
import type {
  SalesInteractionLog,
  SalesOpportunity,
  SalesOpportunityStage,
} from "../types";
import { initSalesWorkspace } from "../service";
import { listAllInteractions, listOpportunities } from "../store";
import { buildPipelineForecast } from "../intelligence/pipeline-forecast";
import { buildPipelineAnalytics } from "./pipeline-analytics";
import { scoreOpportunity } from "../intelligence/opportunity-scoring";

const CLOSED_STAGES = new Set([
  "ClosedWon",
  "ClosedLost",
  "Archived",
  "Rejected",
]);

const STALL_MS = 14 * 86400000;

export interface RevenueRiskFlag {
  id: string;
  labelAr: string;
  severity: "high" | "medium" | "low";
  opportunityId?: string;
  opportunityName?: string;
}

export interface RevenueActionItem {
  opportunityId: string;
  opportunityName: string;
  accountId: string;
  stage: SalesOpportunityStage | string;
  valueEstimate: number;
  reasons: string[];
  priority: "high" | "medium" | "low";
}

export interface RevenueStageBucket {
  stage: string;
  count: number;
  rawValue: number;
  weightedValue: number;
  pctOfPipeline: number;
}

export interface RevenueNote {
  id: string;
  textAr: string;
  kind: "observation" | "recommendation" | "caution";
}

export interface RevenueIntelligenceSnapshot {
  totalPipeline: number;
  weightedForecast: number;
  forecastConfidence: "low" | "medium" | "high";
  pipelineCoverage: {
    ratio: number;
    impliedTarget: number;
    labelAr: string;
    level: "thin" | "adequate" | "healthy";
  };
  stalledOpportunities: {
    count: number;
    items: Array<{
      id: string;
      name: string;
      accountId: string;
      stage: string;
      valueEstimate: number;
      daysSinceActivity: number | null;
    }>;
  };
  stageDistribution: RevenueStageBucket[];
  riskFlags: RevenueRiskFlag[];
  opportunitiesNeedingAction: RevenueActionItem[];
  revenueNotes: RevenueNote[];
  won: { count: number; value: number };
  lost: { count: number; value: number };
  disclaimerAr: string;
}

function isActiveOpportunity(o: SalesOpportunity): boolean {
  return !CLOSED_STAGES.has(o.stage);
}

function lastInteractionAt(
  opportunityId: string,
  interactions: SalesInteractionLog[],
): number | null {
  const related = interactions
    .filter((i) => i.opportunityId === opportunityId)
    .map((i) => new Date(i.loggedAt).getTime())
    .filter((t) => !Number.isNaN(t));
  if (related.length === 0) return null;
  return Math.max(...related);
}

export function listStalledOpportunities(
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
): SalesOpportunity[] {
  const now = Date.now();
  return opportunities.filter((o) => {
    if (!isActiveOpportunity(o)) return false;
    const lastAt = lastInteractionAt(o.id, interactions);
    if (lastAt === null) {
      return o.stage === "Draft" || o.stage === "Qualification";
    }
    return now - lastAt > STALL_MS;
  });
}

function deriveImpliedTarget(
  weightedForecast: number,
  wonValue: number,
): number {
  const floor = 100_000;
  const fromForecast = weightedForecast > 0 ? weightedForecast * 2.5 : 0;
  const fromWon = wonValue > 0 ? wonValue * 1.5 : 0;
  return Math.max(floor, fromForecast, fromWon);
}

function buildStageDistribution(
  forecastByStage: ReturnType<typeof buildPipelineForecast>["byStage"],
  totalPipeline: number,
): RevenueStageBucket[] {
  return Object.entries(forecastByStage)
    .map(([stage, bucket]) => ({
      stage,
      count: bucket.count,
      rawValue: bucket.raw,
      weightedValue: Math.round(bucket.weighted),
      pctOfPipeline:
        totalPipeline > 0
          ? Math.round((bucket.raw / totalPipeline) * 100)
          : 0,
    }))
    .sort((a, b) => b.rawValue - a.rawValue);
}

function buildRiskFlags(
  opportunities: SalesOpportunity[],
  stalled: SalesOpportunity[],
): RevenueRiskFlag[] {
  const flags: RevenueRiskFlag[] = [];
  const stalledIds = new Set(stalled.map((o) => o.id));

  for (const o of opportunities) {
    if (!isActiveOpportunity(o)) continue;
    const scored = scoreOpportunity(o);

    for (const risk of scored.riskIndicators) {
      flags.push({
        id: `${o.id}-${risk}`,
        labelAr: mapRiskLabel(risk),
        severity: risk.includes("high") ? "high" : "medium",
        opportunityId: o.id,
        opportunityName: o.name,
      });
    }

    if (stalledIds.has(o.id)) {
      flags.push({
        id: `${o.id}-stalled`,
        labelAr: "فرصة متوقفة — لا نشاط منذ 14+ يوم",
        severity: "high",
        opportunityId: o.id,
        opportunityName: o.name,
      });
    }

    if ((o.risks?.length ?? 0) > 0) {
      for (const r of o.risks ?? []) {
        flags.push({
          id: `${o.id}-risk-${r.slice(0, 12)}`,
          labelAr: r,
          severity: "medium",
          opportunityId: o.id,
          opportunityName: o.name,
        });
      }
    }
  }

  const seen = new Set<string>();
  return flags
    .filter((f) => {
      const key = `${f.opportunityId ?? "org"}-${f.labelAr}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

function mapRiskLabel(risk: string): string {
  const map: Record<string, string> = {
    high_value_unreviewed: "قيمة عالية دون مراجعة معتمدة",
    rejected: "الفرصة في حالة مرفوضة",
  };
  return map[risk] ?? risk;
}

function buildActionItems(
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
): RevenueActionItem[] {
  const stalledIds = new Set(
    listStalledOpportunities(opportunities, interactions).map((o) => o.id),
  );
  const items: RevenueActionItem[] = [];

  for (const o of opportunities) {
    if (!isActiveOpportunity(o)) continue;
    const scored = scoreOpportunity(o);
    const reasons: string[] = [...scored.blockers];

    if (stalledIds.has(o.id)) {
      reasons.push("متابعة متوقفة — جدولة تواصل");
    }
    if (o.stage === "InReview" || o.reviewStatus === "InReview") {
      reasons.push("بانتظار اكتمال المراجعة التجارية");
    }
    if (reasons.length === 0) continue;

    const priority: RevenueActionItem["priority"] =
      stalledIds.has(o.id) || scored.riskIndicators.length > 0
        ? "high"
        : scored.blockers.length > 1
          ? "medium"
          : "low";

    items.push({
      opportunityId: o.id,
      opportunityName: o.name,
      accountId: o.accountId,
      stage: o.stage,
      valueEstimate: o.valueEstimate ?? 0,
      reasons,
      priority,
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return items
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        b.valueEstimate - a.valueEstimate,
    )
    .slice(0, 12);
}

function buildRevenueNotes(input: {
  totalPipeline: number;
  weightedForecast: number;
  coverageLevel: RevenueIntelligenceSnapshot["pipelineCoverage"]["level"];
  stalledCount: number;
  actionCount: number;
  forecastConfidence: RevenueIntelligenceSnapshot["forecastConfidence"];
  riskCount: number;
}): RevenueNote[] {
  const notes: RevenueNote[] = [
    {
      id: "draft-disclaimer",
      kind: "caution",
      textAr:
        "مسودة ذكاء إيرادات — توصيات مساعدة فقط. ليست commit مالي ولا تنبؤ AI معتمد.",
    },
  ];

  if (input.totalPipeline === 0) {
    notes.push({
      id: "empty-pipeline",
      kind: "observation",
      textAr: "لا يوجد مسار نشط — ركّز على تأهيل فرص جديدة قبل تقدير الإيرادات.",
    });
    return notes;
  }

  notes.push({
    id: "forecast-summary",
    kind: "observation",
    textAr: `المسار الخام ${input.totalPipeline.toLocaleString("ar-SA")} ر.س مقابل توقع مرجّح ${Math.round(input.weightedForecast).toLocaleString("ar-SA")} ر.س (ثقة: ${input.forecastConfidence}).`,
  });

  if (input.coverageLevel === "thin") {
    notes.push({
      id: "coverage-thin",
      kind: "recommendation",
      textAr:
        "تغطية المسار ضعيفة — زِد حجم الصفقات المؤهلة أو سرّع التقدم نحو مراحل متقدمة.",
    });
  } else if (input.coverageLevel === "healthy") {
    notes.push({
      id: "coverage-healthy",
      kind: "observation",
      textAr: "تغطية المسار صحية نسبياً — راقب جودة التأهيل لا الحجم فقط.",
    });
  }

  if (input.stalledCount > 0) {
    notes.push({
      id: "stalled-note",
      kind: "recommendation",
      textAr: `${input.stalledCount} فرصة بلا زخم كافٍ — أولوية المتابعة هذا الأسبوع.`,
    });
  }

  if (input.actionCount > 0) {
    notes.push({
      id: "action-note",
      kind: "recommendation",
      textAr: `${input.actionCount} فرصة تحتاج إجراء (مراجعة، متابعة، أو إزالة عائق).`,
    });
  }

  if (input.riskCount >= 3) {
    notes.push({
      id: "risk-cluster",
      kind: "caution",
      textAr: "تجمّع مخاطر على عدة صفقات — راجع الأدلة والاعتمادات قبل توسيع التوقع.",
    });
  }

  return notes;
}

export function buildRevenueIntelligenceSnapshot(input: {
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
}): RevenueIntelligenceSnapshot {
  const { opportunities, interactions } = input;
  const active = opportunities.filter(isActiveOpportunity);
  const forecast = buildPipelineForecast(opportunities);
  buildPipelineAnalytics(opportunities);

  const totalPipeline = forecast.totalRaw;
  const weightedForecast = forecast.weightedTotal;

  const won = opportunities.filter((o) => o.stage === "ClosedWon");
  const lost = opportunities.filter((o) => o.stage === "ClosedLost");
  const wonValue = won.reduce((s, o) => s + (o.valueEstimate ?? 0), 0);
  const lostValue = lost.reduce((s, o) => s + (o.valueEstimate ?? 0), 0);

  const impliedTarget = deriveImpliedTarget(weightedForecast, wonValue);
  const coverageRatio =
    impliedTarget > 0 ? totalPipeline / impliedTarget : 0;
  const coverageLevel: RevenueIntelligenceSnapshot["pipelineCoverage"]["level"] =
    coverageRatio >= 3
      ? "healthy"
      : coverageRatio >= 2
        ? "adequate"
        : "thin";
  const coverageLabelAr =
    coverageLevel === "healthy"
      ? "تغطية قوية"
      : coverageLevel === "adequate"
        ? "تغطية مقبولة"
        : "تغطية رفيعة";

  const stalledList = listStalledOpportunities(opportunities, interactions);
  const now = Date.now();
  const stalledItems = stalledList.map((o) => {
    const lastAt = lastInteractionAt(o.id, interactions);
    return {
      id: o.id,
      name: o.name,
      accountId: o.accountId,
      stage: o.stage,
      valueEstimate: o.valueEstimate ?? 0,
      daysSinceActivity:
        lastAt === null ? null : Math.floor((now - lastAt) / 86400000),
    };
  });

  const riskFlags = buildRiskFlags(opportunities, stalledList);
  const opportunitiesNeedingAction = buildActionItems(
    opportunities,
    interactions,
  );
  const stageDistribution = buildStageDistribution(
    forecast.byStage,
    totalPipeline,
  );

  const revenueNotes = buildRevenueNotes({
    totalPipeline,
    weightedForecast,
    coverageLevel,
    stalledCount: stalledList.length,
    actionCount: opportunitiesNeedingAction.length,
    forecastConfidence: forecast.forecastConfidence,
    riskCount: riskFlags.length,
  });

  return {
    totalPipeline,
    weightedForecast,
    forecastConfidence: forecast.forecastConfidence,
    pipelineCoverage: {
      ratio: Math.round(coverageRatio * 100) / 100,
      impliedTarget: Math.round(impliedTarget),
      labelAr: coverageLabelAr,
      level: coverageLevel,
    },
    stalledOpportunities: {
      count: stalledList.length,
      items: stalledItems,
    },
    stageDistribution,
    riskFlags,
    opportunitiesNeedingAction,
    revenueNotes,
    won: { count: won.length, value: wonValue },
    lost: { count: lost.length, value: lostValue },
    disclaimerAr:
      "ذكاء إيرادات مساعد — DRAFT — ليس commit مالي. المراجعة البشرية مطلوبة.",
  };
}

export async function getRevenueIntelligenceView(
  user: CurrentUser,
): Promise<RevenueIntelligenceSnapshot> {
  await initSalesWorkspace(user);
  const orgId = user.organizationId;
  const opportunities = listOpportunities(orgId);
  const interactions = listAllInteractions(orgId);
  return buildRevenueIntelligenceSnapshot({ opportunities, interactions });
}
