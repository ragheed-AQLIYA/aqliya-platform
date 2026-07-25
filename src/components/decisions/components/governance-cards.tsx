import type { DashboardMetrics } from "./constants";

export function GovernanceCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">
          قرارات مدعومة بأدلة
        </div>
        <div className="text-2xl font-bold mt-1 text-aqliya-blue">
          {metrics.governanceMetrics.evidenceBackedCount}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          بدون أدلة: {metrics.governanceMetrics.missingEvidenceCount}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">
          مراجعة بشرية مطلوبة
        </div>
        <div className="text-2xl font-bold mt-1 text-amber-600">
          {metrics.governanceMetrics.humanReviewRequiredCount}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          جاهزة للإرسال للمراجعة:{" "}
          {metrics.governanceMetrics.readyForReviewCount}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">
          قيد المراجعة دون أدلة
        </div>
        <div className="text-2xl font-bold mt-1 text-red-600">
          {metrics.governanceMetrics.inReviewWithoutEvidence}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          اختناق حوكمة مباشر قبل الاعتماد
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">
          عالي الأولوية بانتظار الاعتماد
        </div>
        <div className="text-2xl font-bold mt-1 text-orange-600">
          {metrics.governanceMetrics.highPriorityPendingApprovalCount}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          منشور بلا لقطة:{" "}
          {metrics.governanceMetrics.publishedWithoutSnapshotCount}
        </div>
      </div>
    </div>
  );
}
