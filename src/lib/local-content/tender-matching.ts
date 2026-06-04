/**
 * LC-02 — deterministic tender requirement matching (no AI, no schema change).
 * Tender spec lives in project.metadata.tender (JSON).
 */

import {
  calculateSpendBreakdown,
  type CalculateScoringInput,
} from "./scoring";

export type LocalContentTenderSpec = {
  referenceId?: string;
  titleAr?: string;
  minLocalContentPct: number;
  requiredSpendCategories?: string[];
  minLocalSupplierCount?: number;
  maxNonLocalSpendSharePct?: number;
};

export type TenderCategoryMatch = {
  category: string;
  required: boolean;
  spendAmount: number;
  met: boolean;
};

export type TenderMatchReport = {
  projectName: string;
  tender: LocalContentTenderSpec;
  fitLevel: "pass" | "partial" | "fail";
  localContentPct: number;
  totalSpend: number;
  supplierCounts: {
    local: number;
    mixed: number;
    nonLocal: number;
    unclassified: number;
  };
  categoryMatches: TenderCategoryMatch[];
  gaps: string[];
  recommendationsAr: string[];
};

export const DEFAULT_TENDER_SPEC: LocalContentTenderSpec = {
  referenceId: "DEFAULT-LC-TENDER",
  titleAr: "متطلبات محتوى محلي افتراضية (تجريب)",
  minLocalContentPct: 30,
  requiredSpendCategories: ["services", "equipment"],
  minLocalSupplierCount: 1,
  maxNonLocalSpendSharePct: 40,
};

export function parseTenderSpecFromMetadata(
  metadata: unknown,
): LocalContentTenderSpec | null {
  if (!metadata || typeof metadata !== "object") return null;
  const tender = (metadata as { tender?: unknown }).tender;
  if (!tender || typeof tender !== "object") return null;
  const t = tender as Record<string, unknown>;
  const min = Number(t.minLocalContentPct);
  if (!Number.isFinite(min) || min < 0 || min > 100) return null;
  return {
    referenceId:
      typeof t.referenceId === "string" ? t.referenceId : undefined,
    titleAr: typeof t.titleAr === "string" ? t.titleAr : undefined,
    minLocalContentPct: min,
    requiredSpendCategories: Array.isArray(t.requiredSpendCategories)
      ? t.requiredSpendCategories.filter((c): c is string => typeof c === "string")
      : undefined,
    minLocalSupplierCount:
      typeof t.minLocalSupplierCount === "number"
        ? t.minLocalSupplierCount
        : undefined,
    maxNonLocalSpendSharePct:
      typeof t.maxNonLocalSpendSharePct === "number"
        ? t.maxNonLocalSpendSharePct
        : undefined,
  };
}

function countSuppliersByLocality(
  suppliers: Array<{ localityClassification: string | null }>,
) {
  const counts = { local: 0, mixed: 0, nonLocal: 0, unclassified: 0 };
  for (const s of suppliers) {
    switch (s.localityClassification) {
      case "local":
        counts.local++;
        break;
      case "mixed":
        counts.mixed++;
        break;
      case "non_local":
        counts.nonLocal++;
        break;
      default:
        counts.unclassified++;
    }
  }
  return counts;
}

export function buildTenderMatchReport(input: {
  projectName: string;
  tender: LocalContentTenderSpec;
  spendRecords: CalculateScoringInput["spendRecords"];
  suppliers: Array<{ localityClassification: string | null }>;
}): TenderMatchReport {
  const breakdown = calculateSpendBreakdown(input.spendRecords);
  const supplierCounts = countSuppliersByLocality(input.suppliers);
  const gaps: string[] = [];
  const recommendationsAr: string[] = [];

  const localPct = Math.round(breakdown.localContentPercentage * 10) / 10;
  const nonLocalSharePct =
    breakdown.totalSpend > 0
      ? Math.round((breakdown.nonLocalSpend / breakdown.totalSpend) * 1000) / 10
      : 0;

  if (localPct < input.tender.minLocalContentPct) {
    gaps.push(
      `نسبة المحتوى المحلي ${localPct}% أقل من المطلوب ${input.tender.minLocalContentPct}%`,
    );
  }

  if (
    input.tender.maxNonLocalSpendSharePct != null &&
    nonLocalSharePct > input.tender.maxNonLocalSpendSharePct
  ) {
    gaps.push(
      `حصة الإنفاق غير المحلي ${nonLocalSharePct}% تتجاوز الحد ${input.tender.maxNonLocalSpendSharePct}%`,
    );
  }

  const minSuppliers = input.tender.minLocalSupplierCount ?? 0;
  if (minSuppliers > 0 && supplierCounts.local < minSuppliers) {
    gaps.push(
      `موردون محليون ${supplierCounts.local} أقل من المطلوب ${minSuppliers}`,
    );
  }

  const spendByCategory: Record<string, number> = {};
  for (const row of input.spendRecords) {
    const cat = (row.category || "other").toLowerCase();
    spendByCategory[cat] = (spendByCategory[cat] ?? 0) + row.amount;
  }

  const requiredCats =
    input.tender.requiredSpendCategories?.map((c) => c.toLowerCase()) ?? [];
  const categoryMatches: TenderCategoryMatch[] = requiredCats.map((category) => {
    const spendAmount = spendByCategory[category] ?? 0;
    const met = spendAmount > 0;
    if (!met) {
      gaps.push(`لا إنفاق مسجّل في فئة المناقصة: ${category}`);
    }
    return { category, required: true, spendAmount, met };
  });

  let fitLevel: TenderMatchReport["fitLevel"] = "pass";
  if (gaps.length > 0) {
    fitLevel = gaps.length <= 2 ? "partial" : "fail";
  }

  if (fitLevel !== "pass") {
    recommendationsAr.push(
      "راجع الموردين المحليين وسجّلات الإنفاق قبل تقديم الامتثال للمناقصة.",
    );
  }
  if (supplierCounts.unclassified > 0) {
    recommendationsAr.push(
      `صنّف ${supplierCounts.unclassified} مورداً غير مصنّف قبل المطابقة النهائية.`,
    );
  }

  return {
    projectName: input.projectName,
    tender: input.tender,
    fitLevel,
    localContentPct: localPct,
    totalSpend: breakdown.totalSpend,
    supplierCounts,
    categoryMatches,
    gaps,
    recommendationsAr,
  };
}
