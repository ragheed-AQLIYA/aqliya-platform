// ─── LocalContentOS — Local Content Score Engine ───
// Computes the local content score from workbook line values.
// The score is a weighted combination of revenue, supplier spend,
// workforce, and asset metrics.

import type { LcWorkbookLine } from "@prisma/client";
import type {
  LcMetricResult,
  LcScoreResult,
  LcMetricContribution,
  LcSectionBreakdown,
} from "./types";

/**
 * Get the effective value of a workbook line.
 * Uses manualValue if set, otherwise autoFillValue.
 */
export function getLineValue(line: LcWorkbookLine): number | null {
  if (line.manualValue !== null) return line.manualValue;
  if (line.autoFillValue !== null) return line.autoFillValue;
  return null;
}

/**
 * Find a line by code from a list of workbook lines.
 */
function findLine(
  lines: LcWorkbookLine[],
  code: string,
): LcWorkbookLine | undefined {
  return lines.find((l) => l.code === code);
}

/**
 * Compute a ratio as a percentage (0-100).
 * Returns null if numerator or denominator is null/zero.
 */
function computePct(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (numerator === null || denominator === null) return null;
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

// ─── Metric Definitions ───

interface MetricDef {
  code: string;
  label: string;
  labelAr: string;
  weight: number;
  explanationAr: string;
  numeratorCode: string;
  denominatorCode: string;
}

const METRICS: MetricDef[] = [
  {
    code: "revenue",
    label: "Revenue Score",
    labelAr: "نسبة الإيرادات المحلية",
    weight: 0.35,
    numeratorCode: "REV-01",
    denominatorCode: "REV-03",
    explanationAr: "نسبة الإيرادات من العملاء المحليين إلى إجمالي الإيرادات",
  },
  {
    code: "supplier_spend",
    label: "Supplier Spend Score",
    labelAr: "نسبة المشتريات المحلية",
    weight: 0.35,
    numeratorCode: "SPN-01",
    denominatorCode: "SPN-03",
    explanationAr: "نسبة المشتريات من الموردين السعوديين إلى إجمالي المشتريات",
  },
  {
    code: "workforce",
    label: "Workforce Score",
    labelAr: "نسبة التوطين",
    weight: 0.20,
    numeratorCode: "WRK-01",
    denominatorCode: "WRK-02",
    explanationAr: "نسبة الموظفين السعوديين إلى إجمالي الموظفين",
  },
  {
    code: "assets",
    label: "Asset Score",
    labelAr: "نسبة الأصول المحلية",
    weight: 0.10,
    numeratorCode: "AST-01",
    denominatorCode: "AST-02",
    explanationAr: "نسبة الأصول الثابتة المحلية إلى إجمالي الأصول الثابتة",
  },
];

/**
 * Compute all LC metrics from workbook lines.
 */
export function computeLcMetrics(
  lines: LcWorkbookLine[],
): LcMetricResult[] {
  return METRICS.map((def) => {
    const numLine = findLine(lines, def.numeratorCode);
    const denLine = findLine(lines, def.denominatorCode);
    const numerator = numLine ? getLineValue(numLine) : null;
    const denominator = denLine ? getLineValue(denLine) : null;
    const score = computePct(numerator, denominator);

    return {
      code: def.code,
      label: def.label,
      labelAr: def.labelAr,
      score,
      numerator,
      denominator,
      weight: def.weight,
      explanationAr: def.explanationAr,
    };
  });
}

// ─── Section Labels ───

const SECTION_AR_LABELS: Record<string, string> = {
  company_info: "معلومات الشركة",
  revenue: "الإيرادات",
  cost_of_sales: "تكلفة المبيعات",
  gross_profit: "إجمالي الربح",
  supplier_spend: "المشتريات",
  workforce: "الموارد البشرية",
  assets: "الأصول",
  declarations: "الإقرارات",
};

// ─── Contribution Analysis ───

/**
 * Compute per-metric contribution to the overall score.
 * Shows how much each metric contributes to the final weighted score.
 */
export function computeMetricContributions(
  metrics: LcMetricResult[],
  overallScore: number | null,
): LcMetricContribution[] {
  let totalWeight = 0;
  for (const m of metrics) {
    if (m.score !== null) {
      totalWeight += m.weight;
    }
  }

  return metrics.map((m) => {
    const effectiveWeight =
      totalWeight > 0 && m.score !== null
        ? m.weight / totalWeight
        : 0;
    const contributionPct =
      overallScore !== null && m.score !== null && totalWeight > 0
        ? Math.round((m.weight / totalWeight) * m.score * 100) / 100
        : null;

    return {
      code: m.code,
      labelAr: m.labelAr,
      score: m.score,
      weight: m.weight,
      effectiveWeight,
      contributionPct,
    };
  });
}

// ─── Section Breakdown ───

/**
 * Group lines by section and compute fill rates.
 * Section is derived from the line code prefix (e.g., REV-01 → revenue).
 */
// Map from line code prefix (first 3 chars) to canonical section name
const PREFIX_TO_SECTION: Record<string, string> = {
  CI: "company_info",
  REV: "revenue",
  COS: "cost_of_sales",
  GP: "gross_profit",
  SPN: "supplier_spend",
  WRK: "workforce",
  AST: "assets",
  DEC: "declarations",
  INF: "company_info",
};

/**
 * Compute per-section data availability from workbook lines.
 */
export function computeSectionBreakdown(
  lines: LcWorkbookLine[],
): LcSectionBreakdown[] {
  const sectionMap = new Map<string, { total: number; filled: number }>();

  for (const line of lines) {
    const prefix = line.code.slice(0, 3);
    const section = PREFIX_TO_SECTION[prefix] || "company_info";
    const entry = sectionMap.get(section) || { total: 0, filled: 0 };
    entry.total++;
    if (getLineValue(line) !== null) {
      entry.filled++;
    }
    sectionMap.set(section, entry);
  }

  return Array.from(sectionMap.entries())
    .map(([section, { total, filled }]) => ({
      section,
      labelAr: SECTION_AR_LABELS[section] || section,
      totalLines: total,
      filledLines: filled,
      missingLines: total - filled,
      fillPct: total > 0 ? Math.round((filled / total) * 100) : 0,
    }))
    .sort((a, b) => b.fillPct - a.fillPct);
}

/**
 * Compute the overall local content score from workbook lines.
 */
export function computeLcScore(
  lines: LcWorkbookLine[],
): LcScoreResult {
  const metrics = computeLcMetrics(lines);

  // Compute weighted average (only from metrics with a score)
  let weightedSum = 0;
  let totalWeight = 0;

  for (const m of metrics) {
    if (m.score !== null) {
      weightedSum += m.score * m.weight;
      totalWeight += m.weight;
    }
  }

  const overallScore =
    totalWeight > 0
      ? Math.round(
          (weightedSum / totalWeight) * 100,
        ) / 100
      : null;

  // Status label based on score range
  let statusLabel: string;
  if (overallScore === null) {
    statusLabel = "لا توجد بيانات كافية";
  } else if (overallScore >= 80) {
    statusLabel = "ممتاز";
  } else if (overallScore >= 60) {
    statusLabel = "جيد جداً";
  } else if (overallScore >= 40) {
    statusLabel = "جيد";
  } else if (overallScore >= 20) {
    statusLabel = "مقبول";
  } else {
    statusLabel = "ضعيف";
  }

  // Summary
  let summaryAr: string;
  if (overallScore === null) {
    summaryAr =
      "لا يمكن احتساب النتيجة لعدم توفر البيانات الكافية. يرجى تعبئة البيانات الناقصة أولاً.";
  } else {
    const metricSummary = metrics
      .filter((m) => m.score !== null)
      .map((m) => `${m.labelAr}: ${m.score}%`)
      .join("، ");
    summaryAr = `النتيجة الإجمالية للمحتوى المحلي: ${overallScore}% (${statusLabel}). ${metricSummary}`;
  }

  const contributions = computeMetricContributions(metrics, overallScore);
  const sectionBreakdown = computeSectionBreakdown(lines);

  return {
    overallScore,
    statusLabel,
    metrics,
    contributions,
    sectionBreakdown,
    computedAt: new Date().toISOString(),
    summaryAr,
  };
}
