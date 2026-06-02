/**
 * Institutional learning drill-down href builders (Wave 5).
 * Pure helpers — safe for client and server imports.
 */

import type { InstitutionalLearningTrend } from "../v02/institutional-learning";

export type InstitutionalLearningRowKind =
  | "insight"
  | "pattern"
  | "trend"
  | "recommendation";

export const INSTITUTIONAL_LEARNING_FOCUS_PARAM = "focus";

export function institutionalLearningRowElementId(rowId: string): string {
  return `institutional-row-${rowId}`;
}

export function buildInstitutionalLearningTrendHref(
  trend: Pick<InstitutionalLearningTrend, "id" | "trendType">,
): string {
  switch (trend.trendType) {
    case "win_rate":
      return "/sales/revenue";
    case "activity_volume":
      return "/sales/opportunities";
    case "signal_strength":
      return buildInstitutionalLearningDrillDownHref(trend.id, "trend");
    default:
      return buildInstitutionalLearningDrillDownHref(trend.id, "trend");
  }
}

export function buildInstitutionalLearningRowHref(
  rowKind: InstitutionalLearningRowKind,
  rowId: string,
  trendType?: InstitutionalLearningTrend["trendType"],
): string {
  if (rowKind === "trend" && trendType) {
    return buildInstitutionalLearningTrendHref({ id: rowId, trendType });
  }
  if (rowKind === "recommendation") {
    return "/sales/command-center";
  }
  return buildInstitutionalLearningDrillDownHref(rowId, rowKind);
}

export function buildInstitutionalLearningDrillDownHref(
  rowId: string,
  rowType: InstitutionalLearningRowKind = "trend",
): string {
  const params = new URLSearchParams({
    [INSTITUTIONAL_LEARNING_FOCUS_PARAM]: rowId,
    type: rowType,
  });
  return `/sales/intelligence?${params.toString()}#memory`;
}

export function parseInstitutionalLearningMemoryFocus(
  hash: string,
): string | null {
  const raw = hash.replace(/^#/, "").trim();
  const slash = raw.indexOf("/");
  if (slash === -1) return null;
  const tab = raw.slice(0, slash).toLowerCase();
  if (tab !== "memory") return null;
  const focus = raw.slice(slash + 1).trim();
  return focus.length > 0 ? focus : null;
}
