import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  getOutcomeStatusLabel,
  type OutcomeDashboardMetrics,
} from "@/lib/decision/outcome-dashboard";
import type { OutcomeCorrelationSnapshot } from "@/lib/decision/outcome-correlation";
import type { DecisionPortfolioSnapshot } from "@/lib/decision/decision-portfolio";
import type { CrossDecisionPatternSnapshot } from "@/lib/decision/cross-decision-patterns";

type DashboardMetrics = {
  totalDecisions: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  approvedCount: number;
  pendingApproval: number;
  draftCount: number;
  inProgressCount: number;
  avgCompletion: number;
  governanceMetrics: {
    evidenceBackedCount: number;
    missingEvidenceCount: number;
    inReviewWithoutEvidence: number;
    humanReviewRequiredCount: number;
    readyForReviewCount: number;
    publishedWithoutSnapshotCount: number;
    highPriorityPendingApprovalCount: number;
  };
  recentDecisions: {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string | null;
    createdAt: Date;
    hasRecommendation: boolean;
    hasApproval: boolean;
    hasEvidence: boolean;
    humanReviewRequired: boolean;
    stageCount: number;
  }[];
  bottlenecks: {
    id: string;
    title: string;
    stage: string;
    priority: string | null;
  }[];
  outcomeMetrics: OutcomeDashboardMetrics;
  outcomeCorrelation: OutcomeCorrelationSnapshot;
  portfolioSnapshot: DecisionPortfolioSnapshot;
  crossDecisionPatterns: CrossDecisionPatternSnapshot;
};

function getPriorityColor(priority: string | null) {
  switch (priority) {
    case "CRITICAL":
      return "text-red-500";
    case "HIGH":
      return "text-orange-500";
    case "MEDIUM":
      return "text-yellow-500";
    case "LOW":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "DRAFT":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    default:
      return "secondary";
  }
}

export function DecisionDashboard({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">إجمالي القرارات</div>
          <div className="text-2xl font-bold mt-1">
            {metrics.totalDecisions}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">قرارات معتمدة</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {metrics.approvedCount}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">بانتظار الاعتماد</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">
            {metrics.pendingApproval}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">متوسط الإنجاز</div>
          <div className="text-2xl font-bold mt-1">
            {metrics.avgCompletion}%
          </div>
        </div>
      </div>

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">حسب الحالة</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <Badge variant={getStatusVariant(status)}>{status}</Badge>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">حسب النوع</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">حسب الأولوية</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byPriority).map(([priority, count]) => (
              <div
                key={priority}
                className="flex items-center justify-between text-sm"
              >
                <span className={getPriorityColor(priority)}>{priority}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {metrics.crossDecisionPatterns.recurringRiskThemes.length > 0 && (
        <div className="rounded-lg border p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">
            أنماط عبر القرارات (D3-04)
          </h3>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {metrics.crossDecisionPatterns.recurringRiskThemes.map((row) => (
              <li
                key={row.patternKey}
                className="flex justify-between gap-2 rounded border px-2 py-1"
              >
                <span className="truncate">{row.labelAr}</span>
                <span className="text-muted-foreground shrink-0">
                  {row.count} قرار
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground mt-2">
            {metrics.crossDecisionPatterns.disclaimerAr}
          </p>
        </div>
      )}

      <div className="rounded-lg border p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3">محفظة القرارات (D3-05)</h3>
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">نشطة</div>
            <div className="text-xl font-bold">{metrics.portfolioSnapshot.active}</div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">معتمدة</div>
            <div className="text-xl font-bold">{metrics.portfolioSnapshot.approved}</div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">مسودة</div>
            <div className="text-xl font-bold">{metrics.portfolioSnapshot.draft}</div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">عالية · مفتوحة</div>
            <div className="text-xl font-bold text-amber-600">
              {metrics.portfolioSnapshot.highPriorityOpen}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">متابعة النتائج (D3-01)</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">نتائج مسجّلة</div>
            <div className="text-xl font-bold mt-1">
              {metrics.outcomeMetrics.totalOutcomes}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              تغطية {metrics.outcomeMetrics.coveragePct}% من القرارات
            </div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">مراجعات النتيجة</div>
            <div className="text-xl font-bold mt-1 text-green-600">
              {metrics.outcomeMetrics.reviewedCount}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              {metrics.outcomeMetrics.missingReview} بانتظار مراجعة
            </div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">معتمدة بدون نتيجة</div>
            <div className="text-xl font-bold mt-1 text-amber-600">
              {metrics.outcomeMetrics.approvedMissingOutcome}
            </div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">متوسط الانحراف</div>
            <div className="text-xl font-bold mt-1">
              {metrics.outcomeMetrics.avgVariance != null
                ? metrics.outcomeMetrics.avgVariance
                : "—"}
            </div>
          </div>
        </div>

        {Object.keys(metrics.outcomeMetrics.byStatus).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(metrics.outcomeMetrics.byStatus).map(
              ([status, count]) => (
                <Badge key={status} variant="outline">
                  {getOutcomeStatusLabel(status)}: {count}
                </Badge>
              ),
            )}
          </div>
        )}

        {metrics.outcomeCorrelation.byPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              ارتباط النتائج بالأولوية (D3-06)
            </h4>
            <ul className="space-y-1 text-sm">
              {metrics.outcomeCorrelation.byPriority
                .filter((r) => r.decisionsWithOutcome > 0)
                .map((r) => (
                  <li key={r.key} className="flex justify-between gap-2">
                    <span>{r.labelAr}</span>
                    <span className="text-muted-foreground">
                      نجاح {r.successRatePct ?? "—"}%
                    </span>
                  </li>
                ))}
            </ul>
            <p className="text-[10px] text-muted-foreground mt-2">
              {metrics.outcomeCorrelation.disclaimerAr}
            </p>
          </div>
        )}

        {metrics.outcomeMetrics.recentOutcomes.length > 0 ? (
          <div className="space-y-2">
            {metrics.outcomeMetrics.recentOutcomes.map((item) => (
              <Link
                key={item.decisionId}
                href={`/decisions/${item.decisionId}/outcome`}
                className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate max-w-[220px]">
                    {item.title}
                  </span>
                  <Badge variant="secondary">
                    {getOutcomeStatusLabel(item.outcomeStatus)}
                  </Badge>
                  {!item.hasReview && (
                    <Badge variant="outline" className="text-[10px]">
                      بانتظار مراجعة
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.variance != null ? `انحراف ${item.variance}` : "—"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد نتائج مسجّلة بعد. سجّل النتيجة من صفحة القرار بعد الاعتماد.
          </p>
        )}
      </div>

      {metrics.bottlenecks.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3 text-amber-600">
            اختناقات التنفيذ
          </h3>
          <div className="space-y-2">
            {metrics.bottlenecks.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href={`/decisions/${b.id}`}
                className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
              >
                <div>
                  <span className="font-medium">{b.title}</span>
                  <span
                    className={`ml-2 text-xs ${getPriorityColor(b.priority)}`}
                  >
                    {b.priority}
                  </span>
                </div>
                <Badge variant="secondary">متوقف عند: {b.stage}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(metrics.governanceMetrics.missingEvidenceCount > 0 ||
        metrics.governanceMetrics.inReviewWithoutEvidence > 0 ||
        metrics.governanceMetrics.publishedWithoutSnapshotCount > 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold mb-3 text-amber-800">
            قيود تشغيلية تحتاج متابعة
          </h3>
          <div className="space-y-2 text-sm text-amber-700">
            {metrics.governanceMetrics.missingEvidenceCount > 0 && (
              <p>
                هناك {metrics.governanceMetrics.missingEvidenceCount} قرارًا
                بدون أي دليل دعم مرفق.
              </p>
            )}
            {metrics.governanceMetrics.inReviewWithoutEvidence > 0 && (
              <p>
                هناك {metrics.governanceMetrics.inReviewWithoutEvidence} قرارًا
                قيد المراجعة رغم غياب الأدلة الداعمة.
              </p>
            )}
            {metrics.governanceMetrics.publishedWithoutSnapshotCount > 0 && (
              <p>
                هناك {metrics.governanceMetrics.publishedWithoutSnapshotCount}{" "}
                توصية منشورة بدون لقطة اعتماد مجمّدة.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">أحدث القرارات</h3>
        <div className="space-y-2">
          {metrics.recentDecisions.map((d) => (
            <Link
              key={d.id}
              href={`/decisions/${d.id}`}
              className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium truncate max-w-[200px]">
                  {d.title}
                </span>
                <Badge variant="outline">{d.type}</Badge>
                {d.priority && (
                  <span className={`text-xs ${getPriorityColor(d.priority)}`}>
                    {d.priority}
                  </span>
                )}
                {d.hasEvidence ? (
                  <Badge variant="outline" className="text-[10px]">
                    مدعوم بأدلة
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    بدون أدلة
                  </Badge>
                )}
                {d.humanReviewRequired && (
                  <Badge variant="secondary" className="text-[10px]">
                    مراجعة بشرية
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${(d.stageCount / 7) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {d.stageCount}/7
                </span>
                {d.hasApproval && (
                  <Badge variant="default" className="text-xs">
                    معتمد
                  </Badge>
                )}
                {d.hasRecommendation && !d.hasApproval && (
                  <Badge variant="secondary" className="text-xs">
                    بانتظار الاعتماد
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
