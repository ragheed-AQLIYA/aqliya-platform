import type { WaveCInstitutionalLearningView } from "@/lib/sales/services/institutional-learning-service";

export function hasInstitutionalLearningData(
  view: WaveCInstitutionalLearningView,
): boolean {
  const rowCount =
    view.insights.length +
    view.patterns.length +
    view.trends.length +
    view.recommendations.length;
  return rowCount > 0 && Object.keys(view.evidenceMap).length > 0;
}

export function useInstitutionalLearningPanel(
  data: WaveCInstitutionalLearningView,
  focusRowId?: string | null,
) {
  return {
    focusRowId,
    isEmpty: !hasInstitutionalLearningData(data),
  };
}
