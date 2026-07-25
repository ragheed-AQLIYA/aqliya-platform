// SalesOS v0.2 Institutional Learning — insight derivation

import type {
  InstitutionalLearningInput,
  InstitutionalLearningInsight,
  InstitutionalLearningPattern,
  InstitutionalLearningTrend,
} from "../types";
import { evidence } from "./common";

export function deriveInsights(
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

  const activityTrend = trends.find(
    (t) => t.id === "trend-activity-volume",
  );
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
      narrative:
        "Proof assets appear on won opportunities — reuse in proposals.",
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
