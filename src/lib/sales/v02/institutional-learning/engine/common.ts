// SalesOS v0.2 Institutional Learning — shared helpers & constants

import type {
  InstitutionalLearningEvidence,
  InstitutionalLearningInput,
  InstitutionalLearningInsight,
  InstitutionalLearningPattern,
} from "../types";

export const INSTITUTIONAL_LEARNING_LABEL =
  "AI-assisted / evidence-based recommendation";

export const INSTITUTIONAL_LEARNING_DISCLAIMER_EN =
  "Institutional learning outputs are draft recommendations backed by logged evidence — not policy. Human review required before changing GTM or ICP.";

export const INSTITUTIONAL_LEARNING_DISCLAIMER_AR =
  "مخرجات التعلم المؤسسي هي توصيات مسودة مبنية على أدلة مسجلة — وليست سياسة. المراجعة البشرية مطلوبة قبل تعديل GTM أو ICP.";

export const PATTERN_MIN_COUNT = 2;
export const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

const REASON_LABEL_AR: Record<string, string> = {
  budget_freeze: "تجميد الميزانية",
  expansion_fit: "ملاءمة التوسع",
  no_executive_sponsor: "غياب راعٍ تنفيذي",
  timing: "توقيت",
  competitor: "منافسة",
  price_value: "السعر مقابل القيمة",
};

export function reasonLabelAr(reason: string): string {
  return REASON_LABEL_AR[reason] ?? reason;
}

export function evidence(
  partial: Omit<InstitutionalLearningEvidence, "summaryAr"> & {
    summaryAr?: string;
  },
): InstitutionalLearningEvidence {
  return {
    ...partial,
    summaryAr: partial.summaryAr ?? partial.summary,
  };
}

export function patternConfidence(
  count: number,
  evidenceCount: number,
): number {
  return Math.min(0.92, 0.45 + count * 0.08 + evidenceCount * 0.04);
}

export function bucketReasons(
  deals: NonNullable<InstitutionalLearningInput["wonDeals"]>,
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

export function overallConfidence(
  patterns: InstitutionalLearningPattern[],
  insights: InstitutionalLearningInsight[],
): number {
  const scores = [
    ...patterns.map((p) => p.confidence),
    ...insights.map((i) => i.confidence),
  ];
  if (scores.length === 0) return 0;
  return Math.round(
    (scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
  ) / 100;
}
