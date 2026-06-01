export type InstitutionalLearningDrillDownRowType =
  | "insight"
  | "pattern"
  | "trend"
  | "recommendation";

export const INSTITUTIONAL_LEARNING_FOCUS_PARAM = "focus";

export function institutionalLearningRowElementId(rowId: string): string {
  return `institutional-row-${rowId}`;
}

export function buildInstitutionalLearningDrillDownHref(
  rowId: string,
  rowType: InstitutionalLearningDrillDownRowType = "trend",
): string {
  const params = new URLSearchParams({
    [INSTITUTIONAL_LEARNING_FOCUS_PARAM]: rowId,
    type: rowType,
  });
  return `/sales/intelligence?${params.toString()}#memory`;
}
