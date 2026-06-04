/**
 * A1-03 — deterministic performance materiality helpers (AuditOS v0.1).
 */

export type MaterialityBasis = "revenue" | "assets" | "manual";

export type MaterialityInput = {
  basis?: MaterialityBasis;
  revenue?: number | null;
  totalAssets?: number | null;
  performancePct?: number;
  manualThreshold?: number | null;
};

export type MaterialitySummary = {
  basis: MaterialityBasis;
  performanceMateriality: number;
  samplingThreshold: number;
  pctUsed: number;
  disclaimerAr: string;
};

const DEFAULT_PERFORMANCE_PCT = 5;

export function calculatePerformanceMateriality(input: MaterialityInput): number {
  if (input.manualThreshold != null && input.manualThreshold > 0) {
    return input.manualThreshold;
  }

  const pct = input.performancePct ?? DEFAULT_PERFORMANCE_PCT;
  const basis = input.basis ?? inferBasis(input);

  if (basis === "revenue" && input.revenue != null && input.revenue > 0) {
    return Math.round((input.revenue * pct) / 100);
  }
  if (basis === "assets" && input.totalAssets != null && input.totalAssets > 0) {
    return Math.round((input.totalAssets * pct) / 100);
  }

  return 0;
}

function inferBasis(input: MaterialityInput): MaterialityBasis {
  if (input.revenue != null && input.revenue > 0) return "revenue";
  if (input.totalAssets != null && input.totalAssets > 0) return "assets";
  return "manual";
}

/** Sampling threshold = 80% of performance materiality (deterministic rule). */
export function calculateSamplingThreshold(
  performanceMateriality: number,
): number {
  if (performanceMateriality <= 0) return 0;
  return Math.round(performanceMateriality * 0.8);
}

export function buildMaterialitySummary(input: MaterialityInput): MaterialitySummary {
  const basis = input.basis ?? inferBasis(input);
  const performanceMateriality = calculatePerformanceMateriality(input);
  const samplingThreshold = calculateSamplingThreshold(performanceMateriality);
  const pctUsed = input.performancePct ?? DEFAULT_PERFORMANCE_PCT;

  return {
    basis,
    performanceMateriality,
    samplingThreshold,
    pctUsed,
    disclaimerAr:
      "مادية الأداء تقدير حتمي للمساعدة — المراجع البشري يعتمد العتبة النهائية.",
  };
}

export function classifyBalanceMateriality(
  balance: number,
  threshold: number,
): "material" | "immaterial" {
  if (threshold <= 0) return "immaterial";
  return Math.abs(balance) >= threshold ? "material" : "immaterial";
}
