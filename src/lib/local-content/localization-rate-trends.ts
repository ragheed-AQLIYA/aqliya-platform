/**
 * LC-07 — localization-rate trend analytics (deterministic by period).
 */

import { calculateSpendBreakdown } from "./scoring";

export type TrendSpendRecordInput = {
  amount: number;
  period?: string | null;
  recordCreatedAt?: string | null;
  supplier: {
    localityClassification: string | null;
    localContentPercentage: number | null;
    ownershipType?: string | null;
  };
};

export type LocalizationTrendPoint = {
  periodKey: string;
  labelAr: string;
  totalSpend: number;
  localSpend: number;
  localContentPercentage: number;
  recordCount: number;
  deltaVsPriorPct: number | null;
};

export type LocalizationRateTrendSnapshot = {
  points: LocalizationTrendPoint[];
  trendDirection: "up" | "down" | "flat" | "insufficient_data";
  disclaimerAr: string;
};

function normalizePeriodKey(
  period?: string | null,
  recordCreatedAt?: string | null,
): string {
  const trimmed = period?.trim();
  if (trimmed) return trimmed.slice(0, 24);
  if (recordCreatedAt) {
    const d = new Date(recordCreatedAt);
    if (!Number.isNaN(d.getTime())) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${d.getFullYear()}-${m}`;
    }
  }
  return "غير_محدد";
}

export function buildLocalizationRateTrends(
  records: TrendSpendRecordInput[],
): LocalizationRateTrendSnapshot {
  const buckets = new Map<string, TrendSpendRecordInput[]>();

  for (const record of records) {
    const key = normalizePeriodKey(record.period, record.recordCreatedAt);
    const list = buckets.get(key) ?? [];
    list.push(record);
    buckets.set(key, list);
  }

  const sortedKeys = [...buckets.keys()].sort((a, b) => a.localeCompare(b));
  const points: LocalizationTrendPoint[] = [];
  let priorRate: number | null = null;

  for (const periodKey of sortedKeys) {
    const bucket = buckets.get(periodKey) ?? [];
    const breakdown = calculateSpendBreakdown(
      bucket.map((r) => ({
        amount: r.amount,
        category: "other",
        supplier: {
          localityClassification: r.supplier.localityClassification,
          localContentPercentage: r.supplier.localContentPercentage,
          ownershipType: r.supplier.ownershipType ?? null,
        },
      })),
    );
    const rate = breakdown.localContentPercentage;
    const deltaVsPriorPct =
      priorRate == null ? null : Math.round((rate - priorRate) * 10) / 10;
    priorRate = rate;

    points.push({
      periodKey,
      labelAr: periodKey,
      totalSpend: breakdown.totalSpend,
      localSpend: breakdown.localSpend,
      localContentPercentage: rate,
      recordCount: bucket.length,
      deltaVsPriorPct,
    });
  }

  let trendDirection: LocalizationRateTrendSnapshot["trendDirection"] =
    "insufficient_data";
  if (points.length >= 2) {
    const first = points[0].localContentPercentage;
    const last = points[points.length - 1].localContentPercentage;
    const diff = last - first;
    if (Math.abs(diff) < 0.5) trendDirection = "flat";
    else if (diff > 0) trendDirection = "up";
    else trendDirection = "down";
  }

  return {
    points,
    trendDirection,
    disclaimerAr:
      "اتجاه نسبة المحتوى المحلي حسب فترة الإنفاق — تحليل مساعد، لا يغني عن المراجعة المعتمدة.",
  };
}
