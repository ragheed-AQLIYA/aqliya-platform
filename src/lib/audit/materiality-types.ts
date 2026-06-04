/** Shared types and formatting for materiality calculations — safe for client components */

export type MaterialityBasis = "revenue" | "total_assets" | "net_income" | "custom";

export type MaterialityResult = {
  engagementId: string;
  basis: MaterialityBasis;
  basisAmount: number;
  percentage: number;
  overallMateriality: number;
  performanceMateriality: number;
  clearlyTrivialThreshold: number;
  currency: string;
  methodDescription: string;
  basisDescription: string;
  calculatedAt: string;
};

export function formatMateriality(value: number, currency: string = "SAR"): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${currency} ${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${currency} ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${currency} ${(abs / 1_000).toFixed(2)}K`;
  return `${currency} ${abs.toFixed(2)}`;
}
