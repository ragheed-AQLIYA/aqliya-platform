/**
 * Phase 28.3 — Reusable provenance summary (no org IDs or raw evidence).
 */
import type { ProvenanceSummary } from "@/lib/knowledge-foundation/provenance-summary";

export function ProvenanceSummaryCard({
  summary,
}: {
  summary: ProvenanceSummary;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm" dir="rtl">
      <h3 className="mb-3 text-sm font-semibold">ملخص المصدر والأدلة</h3>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">المرشّحات المرتبطة</p>
          <p className="mt-1 text-lg font-bold">{summary.candidateCount}</p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">إجمالي الأدلة</p>
          <p className="mt-1 text-lg font-bold">{summary.totalEvidenceCount}</p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">الجهات المساهمة</p>
          <p className="mt-1 text-lg font-bold">
            {summary.contributingOrganizationCount}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">متوسط الثقة</p>
          <p className="mt-1 text-lg font-bold">
            {(summary.averageConfidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {summary.canonicalCodeDistribution.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            توزيع الرموز المعيارية
          </p>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {summary.canonicalCodeDistribution.map((row) => (
              <div
                key={row.canonicalCode}
                className="flex items-center justify-between rounded border bg-background px-3 py-1.5 text-xs"
              >
                <span className="font-mono">{row.canonicalCode}</span>
                <span className="text-muted-foreground">
                  {row.category} · {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">لا توجد بيانات مصدر متاحة.</p>
      )}
    </section>
  );
}
