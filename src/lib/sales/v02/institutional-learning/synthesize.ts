// @ts-nocheck
import {
  getTopObjections,
  getTopSignals,
  getWinLossPatterns,
} from "../../vnext/commercial-memory";
import { isClosedOpportunityStage } from "../../types";
import {
  evidenceFromContentAssets,
  normalizeContentAssetRefs,
} from "./content-assets";
import {
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
} from "./disclaimers";
import { learningEvidence } from "./evidence";
import {
  INSTITUTIONAL_LEARNING_LABEL,
  type InstitutionalLearningInput,
  type InstitutionalLearningInsight,
  type InstitutionalLearningPattern,
  type InstitutionalLearningRecommendation,
  type InstitutionalLearningSnapshot,
  type InstitutionalLearningTrend,
} from "./types";

const MIN_PATTERN_COUNT = 2;

const REASON_LABELS: Record<string, { en: string; ar: string }> = {
  budget_freeze: { en: "Budget freeze", ar: "تجميد ميزانية" },
  expansion_fit: { en: "Expansion fit", ar: "ملاءمة توسع" },
  no_executive_sponsor: { en: "No executive sponsor", ar: "لا راعٍ تنفيذي" },
  timing: { en: "Timing", ar: "توقيت" },
  competitor: { en: "Competitor", ar: "منافس" },
};

function reasonLabel(reason: string): { en: string; ar: string } {
  return (
    REASON_LABELS[reason] ?? {
      en: reason.replace(/_/g, " "),
      ar: reason.replace(/_/g, " "),
    }
  );
}

function patternConfidence(count: number): number {
  return Math.min(0.92, 0.45 + count * 0.12);
}

function countClosed(input: InstitutionalLearningInput): {
  won: number;
  lost: number;
} {
  let won = 0;
  let lost = 0;
  for (const opp of input.opportunities) {
    if (!isClosedOpportunityStage(opp.stage)) continue;
    if (opp.stage.includes("Won") || opp.stage === "ClosedWon") won += 1;
    else lost += 1;
  }
  return { won, lost };
}

function derivePatterns(
  input: InstitutionalLearningInput,
): InstitutionalLearningPattern[] {
  const patterns: InstitutionalLearningPattern[] = [];
  const winLoss = getWinLossPatterns({
    winLoss: input.winLossInsights,
    opportunities: input.opportunities,
    interactions: input.interactions,
  });

  for (const row of winLoss.filter((w) => w.count >= MIN_PATTERN_COUNT)) {
    const labels = reasonLabel(row.reason);
    const patternType = row.outcome === "won" ? "win_theme" : "loss_theme";
    const source =
      row.source === "stored"
        ? "win_loss_insight"
        : row.source === "opportunity"
          ? row.outcome === "won"
            ? "won_deal"
            : "lost_deal"
          : "interaction";

    patterns.push({
      id: `il-pattern-wl-${row.outcome}-${row.reason}`,
      patternType,
      label: `${row.outcome === "won" ? "Win" : "Loss"} theme: ${labels.en}`,
      labelAr: `${row.outcome === "won" ? "فوز" : "خسارة"}: ${labels.ar}`,
      count: row.count,
      recommendation:
        row.outcome === "won"
          ? `Replicate proof steps for ${labels.en} — recommendation only.`
          : `Mitigate ${labels.en} earlier with proof — recommendation only.`,
      recommendationAr:
        row.outcome === "won"
          ? `كرّر إثبات ${labels.ar} — توصية فقط.`
          : `عالج ${labels.ar} مبكراً — توصية فقط.`,
      confidence: patternConfidence(row.count),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          source,
          `${row.outcome}:${row.reason}`,
          `${row.outcome} "${row.reason}" ×${row.count} (${row.source})`,
          `${row.outcome} "${labels.ar}" ×${row.count}`,
        ),
      ],
    });
  }

  const topSignals = getTopSignals({
    signals: input.signals,
    interactions: input.interactions,
    limit: 6,
  });
  for (const sig of topSignals.filter((s) => s.count >= MIN_PATTERN_COUNT)) {
    patterns.push({
      id: `il-pattern-sig-${sig.label}`,
      patternType: "signal_cluster",
      label: `Signal cluster: ${sig.label}`,
      labelAr: `تجمع إشارات: ${sig.label}`,
      count: sig.count,
      recommendation: "Prioritize follow-up while cluster is active — draft only.",
      recommendationAr: "أولِ المتابعة — مسودة فقط.",
      confidence: patternConfidence(sig.count),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          sig.source === "stored" ? "signal" : "interaction",
          sig.label,
          `Signal "${sig.label}" ×${sig.count}`,
          `إشارة "${sig.label}" ×${sig.count}`,
        ),
      ],
    });
  }

  const wonOpps = input.opportunities.filter(
    (o) =>
      isClosedOpportunityStage(o.stage) &&
      (o.stage.includes("Won") || o.stage === "ClosedWon"),
  );
  const proofOnWon = input.proofAssets.filter((p) =>
    (p.linkedOpportunityIds ?? []).some((oid) =>
      wonOpps.some((o) => o.id === oid),
    ),
  );
  if (proofOnWon.length >= 1) {
    patterns.push({
      id: "il-pattern-proof-won",
      patternType: "proof_correlation",
      label: `${proofOnWon.length} proof asset(s) on won deals`,
      labelAr: `${proofOnWon.length} إثبات على صفقات فائزة`,
      count: proofOnWon.length,
      recommendation: "Catalog in institutional playbook — human approval required.",
      recommendationAr: "وثّق في دليل التشغيل — موافقة بشرية مطلوبة.",
      confidence: Math.min(0.88, 0.55 + proofOnWon.length * 0.08),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: proofOnWon.slice(0, 4).map((p) =>
        learningEvidence(
          "proof_asset",
          p.id,
          `Proof "${p.title}" linked to won deal`,
          `إثبات "${p.title}" مرتبط بفوز`,
        ),
      ),
    });
  }

  const topObjections = getTopObjections({
    objections: input.objections,
    interactions: input.interactions,
    limit: 5,
  });
  for (const obj of topObjections.filter((o) => o.count >= MIN_PATTERN_COUNT)) {
    patterns.push({
      id: `il-pattern-obj-${obj.label}`,
      patternType: "activity_theme",
      label: `Objection theme: ${obj.label}`,
      labelAr: `موضوع اعتراض: ${obj.label}`,
      count: obj.count,
      recommendation: "Pair objection-response proof before stage advance.",
      recommendationAr: "اربط إثبات الرد قبل تقدم المرحلة.",
      confidence: patternConfidence(obj.count),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          obj.source === "stored" ? "objection" : "interaction",
          obj.label,
          `Objection "${obj.label}" ×${obj.count}`,
          `اعتراض "${obj.label}" ×${obj.count}`,
        ),
      ],
    });
  }

  return patterns.filter((p) => p.evidence.length > 0);
}

function deriveTrends(
  input: InstitutionalLearningInput,
  closedWonCount: number,
  closedLostCount: number,
): InstitutionalLearningTrend[] {
  const trends: InstitutionalLearningTrend[] = [];
  const closed = closedWonCount + closedLostCount;

  if (closed >= 1) {
    const rate = closedWonCount / closed;
    trends.push({
      id: "il-trend-win-rate",
      trendType: "win_rate",
      metric: `Win rate ${Math.round(rate * 100)}% (${closedWonCount}/${closed})`,
      metricAr: `معدل الفوز ${Math.round(rate * 100)}%`,
      direction: rate >= 0.5 ? "up" : rate <= 0.35 ? "down" : "stable",
      currentValue: rate,
      confidence: Math.min(0.85, 0.4 + closed * 0.08),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          "won_deal",
          "aggregate",
          `${closedWonCount} won / ${closedLostCount} lost`,
          `${closedWonCount} فوز / ${closedLostCount} خسارة`,
        ),
        ...input.winLossInsights.slice(0, 3).map((w) =>
          learningEvidence(
            "win_loss_insight",
            w.id,
            `${w.outcome}: ${w.primaryReason}`,
            `${w.outcome}: ${w.primaryReason}`,
          ),
        ),
      ],
    });
  }

  const activeActivities = input.activities.filter((a) => a.status === "active");
  if (activeActivities.length >= 3) {
    trends.push({
      id: "il-trend-activity-volume",
      trendType: "activity_volume",
      metric: `${activeActivities.length} active activities`,
      metricAr: `${activeActivities.length} نشاط نشط`,
      direction: "up",
      currentValue: activeActivities.length,
      confidence: Math.min(0.75, 0.45 + activeActivities.length * 0.05),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: activeActivities.slice(0, 4).map((a) =>
        learningEvidence(
          "activity",
          a.id,
          `${a.type}: ${a.summary.slice(0, 80)}`,
          `نشاط ${a.type}`,
        ),
      ),
    });
  }

  const strongSignals = input.signals.filter((s) => s.strength === "strong");
  if (strongSignals.length >= 1) {
    trends.push({
      id: "il-trend-signal-strength",
      trendType: "signal_strength",
      metric: `${strongSignals.length} strong signal(s)`,
      metricAr: `${strongSignals.length} إشارة قوية`,
      direction: strongSignals.length >= 2 ? "up" : "stable",
      currentValue: strongSignals.length,
      confidence: Math.min(0.8, 0.5 + strongSignals.length * 0.1),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: strongSignals.slice(0, 4).map((s) =>
        learningEvidence(
          "signal",
          s.id,
          `${s.signalType}: ${s.description}`,
          `${s.signalType}: ${s.description}`,
        ),
      ),
    });
  }

  return trends.filter((t) => t.evidence.length > 0);
}

function deriveInsights(
  input: InstitutionalLearningInput,
  patterns: InstitutionalLearningPattern[],
): InstitutionalLearningInsight[] {
  const insights: InstitutionalLearningInsight[] = [];
  const topWin = patterns.find((p) => p.patternType === "win_theme");
  const topLoss = patterns.find((p) => p.patternType === "loss_theme");

  if (topWin) {
    insights.push({
      id: "il-insight-top-win",
      dimension: "win_loss",
      title: `Leading win theme: ${topWin.label}`,
      titleAr: `أبرز فوز: ${topWin.labelAr}`,
      narrative: topWin.recommendation,
      narrativeAr: topWin.recommendationAr,
      confidence: topWin.confidence,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [...topWin.evidence],
    });
  }

  if (topLoss) {
    insights.push({
      id: "il-insight-top-loss",
      dimension: "win_loss",
      title: `Leading loss theme: ${topLoss.label}`,
      titleAr: `أبرز خسارة: ${topLoss.labelAr}`,
      narrative: topLoss.recommendation,
      narrativeAr: topLoss.recommendationAr,
      confidence: topLoss.confidence,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [...topLoss.evidence],
    });
  }

  const contentRefs = normalizeContentAssetRefs(input.contentAssetRefs);
  if (contentRefs.length >= 1) {
    insights.push({
      id: "il-insight-content-stub",
      dimension: "content",
      title: `${contentRefs.length} content asset ref(s) (stub)`,
      titleAr: `${contentRefs.length} مرجع محتوى (stub)`,
      narrative:
        "Content asset refs registered for learning context — no live CMS sync in v0.2.",
      narrativeAr: "مراجع محتوى للسياق فقط — لا مزامنة CMS في v0.2.",
      confidence: 0.55,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: evidenceFromContentAssets(contentRefs),
    });
  }

  return insights.filter((i) => i.evidence.length > 0);
}

function deriveRecommendations(
  input: InstitutionalLearningInput,
  patterns: InstitutionalLearningPattern[],
): InstitutionalLearningRecommendation[] {
  const recs: InstitutionalLearningRecommendation[] = [];
  const lossPattern = patterns.find((p) => p.patternType === "loss_theme");
  const budgetProof = input.proofAssets.find(
    (p) =>
      p.assetType === "objection_response" ||
      p.title.toLowerCase().includes("budget") ||
      p.title.toLowerCase().includes("roi"),
  );

  if (lossPattern && budgetProof) {
    recs.push({
      id: "il-rec-proof-loss-theme",
      ruleId: "proof_for_loss_theme",
      priority: "high",
      title: "Attach proof to recurring loss theme",
      titleAr: "اربط إثباتاً بنمط الخسارة",
      reasoning: `Loss "${lossPattern.label}" — review proof "${budgetProof.title}".`,
      reasoningAr: `خسارة "${lossPattern.labelAr}" — راجع "${budgetProof.title}".`,
      confidence: Math.min(lossPattern.confidence, 0.85),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        ...lossPattern.evidence,
        learningEvidence(
          "proof_asset",
          budgetProof.id,
          `Proof: ${budgetProof.title}`,
          `إثبات: ${budgetProof.title}`,
        ),
      ],
    });
  }

  const stalled = input.opportunities.filter(
    (o) =>
      !isClosedOpportunityStage(o.stage) &&
      (o.stage === "Discovery" || o.stage === "Proposal") &&
      !input.activities.some((a) => a.opportunityId === o.id),
  );
  if (stalled.length >= 1) {
    const opp = stalled[0];
    recs.push({
      id: "il-rec-log-activity-stalled",
      ruleId: "stalled_no_activity",
      priority: "medium",
      title: "Log activity on stalled opportunity",
      titleAr: "سجّل نشاطاً على صفقة متوقفة",
      reasoning: `"${opp.name}" in ${opp.stage} has no linked activities.`,
      reasoningAr: `"${opp.name}" في ${opp.stage} بلا نشاط.`,
      confidence: 0.68,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          "lost_deal",
          opp.id,
          `Opportunity ${opp.name} stage=${opp.stage}`,
          `صفقة ${opp.name}`,
        ),
      ],
    });
  }

  for (const wl of input.winLossInsights.filter((w) => w.outcome === "won").slice(0, 1)) {
    recs.push({
      id: `il-rec-replicate-win-${wl.id}`,
      ruleId: "replicate_win_motion",
      priority: "medium",
      title: "Replicate documented win motion",
      titleAr: "كرّر حركة الفوز الموثّقة",
      reasoning: `Won factor: ${wl.primaryReason}.`,
      reasoningAr: `فوز: ${wl.primaryReason}.`,
      confidence: wl.confidence?.score ?? 0.72,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: [
        learningEvidence(
          "win_loss_insight",
          wl.id,
          `Win: ${wl.primaryReason}`,
          `فوز: ${wl.primaryReason}`,
        ),
        ...(wl.evidenceRef
          ? [
              learningEvidence(
                "proof_asset",
                wl.evidenceRef,
                `Evidence ref ${wl.evidenceRef}`,
                `مرجع ${wl.evidenceRef}`,
              ),
            ]
          : []),
      ],
    });
  }

  return recs.filter((r) => r.evidence.length > 0);
}

function overallConfidence(snapshot: {
  insights: InstitutionalLearningInsight[];
  patterns: InstitutionalLearningPattern[];
  trends: InstitutionalLearningTrend[];
  recommendations: InstitutionalLearningRecommendation[];
}): number {
  const scores = [
    ...snapshot.insights.map((i) => i.confidence),
    ...snapshot.patterns.map((p) => p.confidence),
    ...snapshot.trends.map((t) => t.confidence),
    ...snapshot.recommendations.map((r) => r.confidence),
  ];
  if (!scores.length) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function buildInstitutionalLearningSnapshot(
  input: InstitutionalLearningInput,
): InstitutionalLearningSnapshot {
  const contentAssetRefs = normalizeContentAssetRefs(input.contentAssetRefs);
  const { won: closedWonCount, lost: closedLostCount } = countClosed(input);
  const patterns = derivePatterns(input);
  const trends = deriveTrends(input, closedWonCount, closedLostCount);
  const insights = deriveInsights(input, patterns);
  const recommendations = deriveRecommendations(input, patterns);

  const snapshot: InstitutionalLearningSnapshot = {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    disclaimer: INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
    disclaimerAr: INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
    recommendationLabel: INSTITUTIONAL_LEARNING_LABEL,
    overallConfidence: 0,
    closedWonCount,
    closedLostCount,
    contentAssetRefs,
    insights,
    patterns,
    trends,
    recommendations,
  };
  snapshot.overallConfidence = overallConfidence(snapshot);
  return snapshot;
}
