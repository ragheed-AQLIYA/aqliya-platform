// SalesOS v0.2 Institutional Learning — rule-based, evidence-backed only

import { getWinLossPatterns } from "../../vnext/commercial-memory";
import type {
  InstitutionalLearningEvidence,
  InstitutionalLearningInput,
  InstitutionalLearningInsight,
  InstitutionalLearningPattern,
  InstitutionalLearningRecommendation,
  InstitutionalLearningSnapshot,
  InstitutionalLearningTrend,
} from "./types";

export const INSTITUTIONAL_LEARNING_LABEL =
  "AI-assisted / evidence-based recommendation";

export const INSTITUTIONAL_LEARNING_DISCLAIMER_EN =
  "Institutional learning outputs are draft recommendations backed by logged evidence — not policy. Human review required before changing GTM or ICP.";

export const INSTITUTIONAL_LEARNING_DISCLAIMER_AR =
  "مخرجات التعلم المؤسسي هي توصيات مسودة مبنية على أدلة مسجلة — وليست سياسة. المراجعة البشرية مطلوبة قبل تعديل GTM أو ICP.";

const PATTERN_MIN_COUNT = 2;
const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

const REASON_LABEL_AR: Record<string, string> = {
  budget_freeze: "تجميد الميزانية",
  expansion_fit: "ملاءمة التوسع",
  no_executive_sponsor: "غياب راعٍ تنفيذي",
  timing: "توقيت",
  competitor: "منافسة",
  price_value: "السعر مقابل القيمة",
};

function reasonLabelAr(reason: string): string {
  return REASON_LABEL_AR[reason] ?? reason;
}

function evidence(
  partial: Omit<InstitutionalLearningEvidence, "summaryAr"> & {
    summaryAr?: string;
  },
): InstitutionalLearningEvidence {
  return {
    ...partial,
    summaryAr: partial.summaryAr ?? partial.summary,
  };
}

function patternConfidence(count: number, evidenceCount: number): number {
  return Math.min(0.92, 0.45 + count * 0.08 + evidenceCount * 0.04);
}

function bucketReasons(
  deals: InstitutionalLearningInput["wonDeals"],
  outcome: "won" | "lost",
): Map<string, InstitutionalLearningEvidence[]> {
  const buckets = new Map<string, InstitutionalLearningEvidence[]>();
  for (const deal of deals) {
    const reason = (deal.reason ?? "unspecified").trim();
    const key = reason.toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(
      evidence({
        source: outcome === "won" ? "won_deal" : "lost_deal",
        refId: deal.opportunityId,
        summary: `${outcome} — ${deal.name}: ${reason}`,
        summaryAr: `${outcome === "won" ? "فوز" : "خسارة"} — ${deal.name}: ${reasonLabelAr(reason)}`,
      }),
    );
    buckets.set(key, list);
  }
  return buckets;
}

function deriveWinLossPatterns(
  input: InstitutionalLearningInput,
): InstitutionalLearningPattern[] {
  const patterns: InstitutionalLearningPattern[] = [];

  for (const [reason, ev] of bucketReasons(input.wonDeals, "won")) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-win-${reason}`,
      patternType: "win_theme",
      label: `Win theme: ${reason}`,
      labelAr: `نمط فوز: ${reasonLabelAr(reason)}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Replicate proof and qualification steps tied to "${reason}" — draft only.`,
      recommendationAr: `كرّر أدلة التأهيل المرتبطة بـ "${reasonLabelAr(reason)}" — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  for (const [reason, ev] of bucketReasons(input.lostDeals, "lost")) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-loss-${reason}`,
      patternType: "loss_theme",
      label: `Loss theme: ${reason}`,
      labelAr: `نمط خسارة: ${reasonLabelAr(reason)}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Review qualification gates for "${reason}" before advancing stage — draft only.`,
      recommendationAr: `راجع بوابات التأهيل لـ "${reasonLabelAr(reason)}" قبل تقدم المرحلة — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const signalBuckets = new Map<string, InstitutionalLearningEvidence[]>();
  for (const sig of input.signals) {
    if (sig.strength !== "strong" && sig.strength !== "moderate") continue;
    const key = sig.signalType;
    const list = signalBuckets.get(key) ?? [];
    list.push(
      evidence({
        source: "signal",
        refId: sig.id,
        summary: `${sig.signalType}: ${sig.description}`,
        summaryAr: `إشارة ${sig.signalType}: ${sig.description}`,
      }),
    );
    signalBuckets.set(key, list);
  }
  for (const [signalType, ev] of signalBuckets) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-signal-${signalType}`,
      patternType: "signal_cluster",
      label: `Repeated ${signalType} signals`,
      labelAr: `تكرار إشارات ${signalType}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Prioritize follow-up while ${signalType} signals are active — draft only.`,
      recommendationAr: `أولِ المتابعة عند نشاط إشارات ${signalType} — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const wonOppIds = new Set(input.wonDeals.map((d) => d.opportunityId));
  const proofHits = new Map<string, InstitutionalLearningEvidence[]>();
  for (const asset of input.proofAssets) {
    const linked = (asset.linkedOpportunityIds ?? []).filter((id) =>
      wonOppIds.has(id),
    );
    if (linked.length === 0) continue;
    const list = proofHits.get(asset.id) ?? [];
    for (const oppId of linked) {
      list.push(
        evidence({
          source: "proof_asset",
          refId: asset.id,
          summary: `Proof "${asset.title}" linked to won opportunity ${oppId}`,
          summaryAr: `دليل "${asset.title}" مرتبط بفرصة فائزة ${oppId}`,
        }),
      );
    }
    proofHits.set(asset.id, list);
  }
  for (const [assetId, ev] of proofHits) {
    if (ev.length < 1) continue;
    const asset = input.proofAssets.find((a) => a.id === assetId);
    patterns.push({
      id: `pattern-proof-${assetId}`,
      patternType: "proof_correlation",
      label: `Proof correlated with wins: ${asset?.title ?? assetId}`,
      labelAr: `دليل مرتبط بالفوز: ${asset?.title ?? assetId}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: "Reuse this proof asset in similar-stage deals — draft only.",
      recommendationAr: "أعد استخدام هذا الدليل في صفقات بمرحلة مماثلة — مسودة فقط.",
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const activityKeywords: ReadonlyArray<{ keys: string[]; label: string }> = [
    { keys: ["meeting", "workshop", "discovery"], label: "discovery_engagement" },
    { keys: ["pilot", "poC", "poc"], label: "pilot_motion" },
    { keys: ["proposal", "rfp"], label: "proposal_motion" },
  ];
  const activityBuckets = new Map<string, InstitutionalLearningEvidence[]>();
  for (const act of input.activities) {
    const lower = act.summary.toLowerCase();
    for (const rule of activityKeywords) {
      if (!rule.keys.some((k) => lower.includes(k))) continue;
      const list = activityBuckets.get(rule.label) ?? [];
      list.push(
        evidence({
          source: "activity",
          refId: act.id,
          summary: `${act.type}: ${act.summary.slice(0, 120)}`,
          summaryAr: `${act.type}: ${act.summary.slice(0, 120)}`,
        }),
      );
      activityBuckets.set(rule.label, list);
    }
  }
  for (const [label, ev] of activityBuckets) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-activity-${label}`,
      patternType: "activity_theme",
      label: `Activity theme: ${label}`,
      labelAr: `نمط نشاط: ${label}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Sustain ${label.replace(/_/g, " ")} cadence on active pipeline — draft only.`,
      recommendationAr: `حافظ على إيقاع ${label} في خط الأنابيب النشط — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  if (input.winLossInsightIds?.length) {
    const wlFromMemory = getWinLossPatterns({
      winLoss: input.winLossInsightIds.map((w) => ({
        id: w.id,
        organizationId: input.organizationId,
        opportunityId: w.opportunityId,
        outcome: w.outcome,
        primaryReason: w.primaryReason,
        createdAt: "",
        updatedAt: "",
        status: "active" as const,
        source: "stored" as const,
      })),
      opportunities: [],
      interactions: [],
    });
    for (const wl of wlFromMemory.filter((p) => p.count >= PATTERN_MIN_COUNT)) {
      const existing = patterns.some((p) => p.id === `pattern-wl-${wl.reason}`);
      if (existing) continue;
      patterns.push({
        id: `pattern-wl-${wl.reason}`,
        patternType: wl.outcome === "won" ? "win_theme" : "loss_theme",
        label: `${wl.outcome} pattern: ${wl.reason}`,
        labelAr: `${wl.outcome === "won" ? "فوز" : "خسارة"}: ${reasonLabelAr(wl.reason)}`,
        count: wl.count,
        confidence: patternConfidence(wl.count, wl.count),
        recommendation:
          wl.outcome === "won"
            ? "Document win factors for institutional playbook — draft only."
            : "Add qualification checklist for this loss factor — draft only.",
        recommendationAr:
          wl.outcome === "won"
            ? "وثّق عوامل الفوز لدليل مؤسسي — مسودة فقط."
            : "أضف قائمة تأهيل لعامل الخسارة — مسودة فقط.",
        evidence: [
          evidence({
            source: "win_loss_insight",
            refId: wl.reason,
            summary: `${wl.outcome} ×${wl.count} — ${wl.reason}`,
            summaryAr: `${wl.outcome === "won" ? "فوز" : "خسارة"} ×${wl.count} — ${reasonLabelAr(wl.reason)}`,
          }),
        ],
        outputStatus: "recommendation",
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count);
}

function deriveTrends(
  input: InstitutionalLearningInput,
): InstitutionalLearningTrend[] {
  const trends: InstitutionalLearningTrend[] = [];
  const now = Date.now();
  const recentActs = input.activities.filter(
    (a) => now - new Date(a.loggedAt).getTime() <= MS_30_DAYS,
  );
  const priorActs = input.activities.filter(
    (a) => now - new Date(a.loggedAt).getTime() > MS_30_DAYS,
  );

  const recentCount = recentActs.length;
  const priorCount = priorActs.length;
  let activityDirection: InstitutionalLearningTrend["direction"] =
    "insufficient_data";
  if (recentCount + priorCount >= 3) {
    if (recentCount > priorCount) activityDirection = "up";
    else if (recentCount < priorCount) activityDirection = "down";
    else activityDirection = "stable";
  }
  trends.push({
    id: "trend-activity-volume",
    metric: "Logged activities (30d vs prior)",
    metricAr: "الأنشطة المسجلة (٣٠ يومًا مقابل السابق)",
    direction: activityDirection,
    currentValue: recentCount,
    priorValue: priorCount,
    unit: "activities",
    confidence: recentCount + priorCount >= 3 ? 0.62 : 0.35,
    evidence: [...recentActs, ...priorActs].slice(0, 6).map((a) =>
      evidence({
        source: "activity",
        refId: a.id,
        summary: a.summary.slice(0, 80),
      }),
    ),
    outputStatus: "recommendation",
  });

  const won = input.wonDeals.length;
  const lost = input.lostDeals.length;
  const total = won + lost;
  const winRate = total > 0 ? won / total : 0;
  trends.push({
    id: "trend-win-rate",
    metric: "Closed win rate",
    metricAr: "معدل الفوز على الصفقات المغلقة",
    direction:
      total < 2
        ? "insufficient_data"
        : winRate >= 0.5
          ? "up"
          : "down",
    currentValue: Math.round(winRate * 100),
    unit: "percent",
    confidence: total >= 3 ? 0.7 : 0.4,
    evidence: [
      ...input.wonDeals.slice(0, 3).map((d) =>
        evidence({
          source: "won_deal",
          refId: d.opportunityId,
          summary: `Won: ${d.name}`,
          summaryAr: `فوز: ${d.name}`,
        }),
      ),
      ...input.lostDeals.slice(0, 3).map((d) =>
        evidence({
          source: "lost_deal",
          refId: d.opportunityId,
          summary: `Lost: ${d.name}`,
          summaryAr: `خسارة: ${d.name}`,
        }),
      ),
    ],
    outputStatus: "recommendation",
  });

  const strongSignals = input.signals.filter((s) => s.strength === "strong");
  trends.push({
    id: "trend-strong-signals",
    metric: "Strong buying signals",
    metricAr: "إشارات شراء قوية",
    direction:
      strongSignals.length >= 3
        ? "up"
        : strongSignals.length === 0
          ? "down"
          : "stable",
    currentValue: strongSignals.length,
    unit: "signals",
    confidence: strongSignals.length >= 2 ? 0.68 : 0.42,
    evidence: strongSignals.slice(0, 5).map((s) =>
      evidence({
        source: "signal",
        refId: s.id,
        summary: s.description,
      }),
    ),
    outputStatus: "recommendation",
  });

  return trends;
}

function deriveInsights(
  patterns: InstitutionalLearningPattern[],
  trends: InstitutionalLearningTrend[],
  input: InstitutionalLearningInput,
): InstitutionalLearningInsight[] {
  const insights: InstitutionalLearningInsight[] = [];

  const topWin = patterns.find((p) => p.patternType === "win_theme");
  if (topWin && topWin.evidence.length > 0) {
    insights.push({
      id: "insight-top-win-theme",
      category: "win_loss",
      title: topWin.label,
      titleAr: topWin.labelAr,
      narrative: `Recurring win factor observed ${topWin.count} times in closed-won history.`,
      narrativeAr: `عامل فوز متكرر ظهر ${topWin.count} مرات في الصفقات المغلقة الفائزة.`,
      confidence: topWin.confidence,
      evidence: topWin.evidence,
      outputStatus: "recommendation",
    });
  }

  const topLoss = patterns.find((p) => p.patternType === "loss_theme");
  if (topLoss && topLoss.evidence.length > 0) {
    insights.push({
      id: "insight-top-loss-theme",
      category: "win_loss",
      title: topLoss.label,
      titleAr: topLoss.labelAr,
      narrative: `Recurring loss factor observed ${topLoss.count} times — validate gates before scale.`,
      narrativeAr: `عامل خسارة متكرر ${topLoss.count} مرات — راجع البوابات قبل التوسع.`,
      confidence: topLoss.confidence,
      evidence: topLoss.evidence,
      outputStatus: "recommendation",
    });
  }

  const activityTrend = trends.find((t) => t.id === "trend-activity-volume");
  if (
    activityTrend &&
    activityTrend.direction !== "insufficient_data" &&
    activityTrend.evidence.length > 0
  ) {
    insights.push({
      id: "insight-activity-trend",
      category: "engagement",
      title: "Commercial activity cadence",
      titleAr: "إيقاع النشاط التجاري",
      narrative: `Activity volume is ${activityTrend.direction} (${activityTrend.currentValue} vs ${activityTrend.priorValue ?? 0} prior).`,
      narrativeAr: `حجم النشاط ${activityTrend.direction === "up" ? "مرتفع" : activityTrend.direction === "down" ? "منخفض" : "مستقر"}.`,
      confidence: activityTrend.confidence,
      evidence: activityTrend.evidence,
      outputStatus: "recommendation",
    });
  }

  const proofPatterns = patterns.filter(
    (p) => p.patternType === "proof_correlation",
  );
  if (proofPatterns.length > 0) {
    const p = proofPatterns[0];
    insights.push({
      id: "insight-proof-wins",
      category: "proof",
      title: p.label,
      titleAr: p.labelAr,
      narrative: "Proof assets appear on won opportunities — reuse in proposals.",
      narrativeAr: "أدلة مرتبطة بصفقات فائزة — أعد استخدامها في العروض.",
      confidence: p.confidence,
      evidence: p.evidence,
      outputStatus: "recommendation",
    });
  }

  const refs = input.contentAssetRefs ?? [];
  if (refs.length > 0 && patterns.length > 0) {
    insights.push({
      id: "insight-content-stub",
      category: "content",
      title: "Content assets available (stub)",
      titleAr: "أصول محتوى متاحة (stub)",
      narrative: `${refs.length} content refs registered for institutional reuse — ingest not live.`,
      narrativeAr: `${refs.length} مراجع محتوى مسجلة لإعادة الاستخدام المؤسسي — الربط غير مفعّل بعد.`,
      confidence: 0.45,
      evidence: refs.map((r) =>
        evidence({
          source: "content_asset",
          refId: r.id,
          summary: r.title,
          summaryAr: r.title,
        }),
      ),
      outputStatus: "draft",
    });
  }

  return insights.filter((i) => i.evidence.length > 0);
}

function deriveRecommendations(
  patterns: InstitutionalLearningPattern[],
  insights: InstitutionalLearningInsight[],
  input: InstitutionalLearningInput,
): InstitutionalLearningRecommendation[] {
  const recs: InstitutionalLearningRecommendation[] = [];

  for (const pattern of patterns.slice(0, 5)) {
    if (pattern.evidence.length === 0) continue;
    recs.push({
      id: `rec-pattern-${pattern.id}`,
      priority: pattern.patternType === "loss_theme" ? "high" : "medium",
      title: pattern.recommendation,
      titleAr: pattern.recommendationAr,
      reasoning: `Pattern "${pattern.label}" repeated ${pattern.count} times with linked evidence.`,
      reasoningAr: `النمط "${pattern.labelAr}" تكرر ${pattern.count} مرات مع أدلة مرتبطة.`,
      confidence: pattern.confidence,
      evidence: pattern.evidence,
      outputStatus: "recommendation",
    });
  }

  const winTrend = insights.find((i) => i.id === "insight-top-win-theme");
  if (winTrend) {
    recs.push({
      id: "rec-scale-win-playbook",
      priority: "medium",
      title: "Codify win playbook from recurring themes",
      titleAr: "وثّق دليل الفوز من الأنماط المتكررة",
      reasoning: winTrend.narrative,
      reasoningAr: winTrend.narrativeAr,
      confidence: winTrend.confidence,
      evidence: winTrend.evidence,
      outputStatus: "recommendation",
    });
  }

  if (input.lostDeals.length > input.wonDeals.length && input.lostDeals.length >= 2) {
    const lossEv = input.lostDeals.slice(0, 4).map((d) =>
      evidence({
        source: "lost_deal",
        refId: d.opportunityId,
        summary: `Lost: ${d.name}`,
        summaryAr: `خسارة: ${d.name}`,
      }),
    );
    recs.push({
      id: "rec-loss-review",
      priority: "high",
      title: "Schedule institutional loss review",
      titleAr: "جدولة مراجعة خسارة مؤسسية",
      reasoning: `Loss count (${input.lostDeals.length}) exceeds wins (${input.wonDeals.length}) in current snapshot.`,
      reasoningAr: `الخسائر (${input.lostDeals.length}) تتجاوز الفوز (${input.wonDeals.length}) في هذه اللقطة.`,
      confidence: 0.72,
      evidence: lossEv,
      outputStatus: "recommendation",
    });
  }

  return recs
    .filter((r) => r.evidence.length > 0)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
}

function overallConfidence(
  patterns: InstitutionalLearningPattern[],
  insights: InstitutionalLearningInsight[],
): number {
  const scores = [
    ...patterns.map((p) => p.confidence),
    ...insights.map((i) => i.confidence),
  ];
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

export function buildInstitutionalLearningSnapshot(
  input: InstitutionalLearningInput,
): InstitutionalLearningSnapshot {
  const patterns = deriveWinLossPatterns(input);
  const trends = deriveTrends(input);
  const insights = deriveInsights(patterns, trends, input);
  const recommendations = deriveRecommendations(patterns, insights, input);

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    disclaimer: INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
    disclaimerAr: INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
    insightLabel: INSTITUTIONAL_LEARNING_LABEL,
    overallConfidence: overallConfidence(patterns, insights),
    closedWonCount: input.wonDeals.length,
    closedLostCount: input.lostDeals.length,
    insights,
    patterns,
    trends,
    recommendations,
  };
}
