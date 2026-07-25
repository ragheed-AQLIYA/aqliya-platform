import type { DashboardMetrics } from "./constants";

export function AlertsPanel({ metrics }: { metrics: DashboardMetrics }) {
  const { governanceMetrics } = metrics;
  const hasAlerts =
    governanceMetrics.missingEvidenceCount > 0 ||
    governanceMetrics.inReviewWithoutEvidence > 0 ||
    governanceMetrics.publishedWithoutSnapshotCount > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold mb-3 text-amber-800">
        قيود تشغيلية تحتاج متابعة
      </h3>
      <div className="space-y-2 text-sm text-amber-700">
        {governanceMetrics.missingEvidenceCount > 0 && (
          <p>
            هناك {governanceMetrics.missingEvidenceCount} قرارًا
            بدون أي دليل دعم مرفق.
          </p>
        )}
        {governanceMetrics.inReviewWithoutEvidence > 0 && (
          <p>
            هناك {governanceMetrics.inReviewWithoutEvidence} قرارًا
            قيد المراجعة رغم غياب الأدلة الداعمة.
          </p>
        )}
        {governanceMetrics.publishedWithoutSnapshotCount > 0 && (
          <p>
            هناك {governanceMetrics.publishedWithoutSnapshotCount}{" "}
            توصية منشورة بدون لقطة اعتماد مجمّدة.
          </p>
        )}
      </div>
    </div>
  );
}
