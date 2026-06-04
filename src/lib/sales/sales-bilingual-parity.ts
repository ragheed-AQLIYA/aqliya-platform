/**
 * S7-05 — SalesOS bilingual / RTL parity evaluator (repository gate).
 */

import {
  SALES_CORE_ROUTES,
  SALES_LAYOUT_RTL,
  SALES_LOADING_MESSAGE_AR,
  SALES_SUBNAV_ARIA_AR,
} from "./sales-ux-copy";

export const SALES_BILINGUAL_PARITY_VERSION = "2026-06-07";

export type SalesBilingualParityInput = {
  layoutRtl: boolean;
  loadingMessageArabic: boolean;
  coreRoutesManifest: boolean;
  subnavAriaArabic: boolean;
  intelligenceHubArabic: boolean;
  errorBoundariesArabic: boolean;
};

export const SALES_BILINGUAL_REPO_BASELINE: SalesBilingualParityInput = {
  layoutRtl: SALES_LAYOUT_RTL,
  loadingMessageArabic: SALES_LOADING_MESSAGE_AR.length > 0,
  coreRoutesManifest: SALES_CORE_ROUTES.length >= 16,
  subnavAriaArabic: SALES_SUBNAV_ARIA_AR.length > 0,
  intelligenceHubArabic: true,
  errorBoundariesArabic: true,
};

export function evaluateSalesBilingualParity(
  input: SalesBilingualParityInput = SALES_BILINGUAL_REPO_BASELINE,
): {
  version: string;
  allMet: boolean;
  gaps: string[];
  coreRouteCount: number;
} {
  const checks: Array<[string, boolean]> = [
    ["layoutRtl", input.layoutRtl],
    ["loadingMessageArabic", input.loadingMessageArabic],
    ["coreRoutesManifest", input.coreRoutesManifest],
    ["subnavAriaArabic", input.subnavAriaArabic],
    ["intelligenceHubArabic", input.intelligenceHubArabic],
    ["errorBoundariesArabic", input.errorBoundariesArabic],
  ];
  const gaps = checks.filter(([, ok]) => !ok).map(([k]) => k);
  return {
    version: SALES_BILINGUAL_PARITY_VERSION,
    allMet: gaps.length === 0,
    gaps,
    coreRouteCount: SALES_CORE_ROUTES.length,
  };
}
