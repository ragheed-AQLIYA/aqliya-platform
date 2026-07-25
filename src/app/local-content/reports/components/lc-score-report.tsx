import type { LcScoreReportRow } from "@/actions/localcontent-report-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { FileBarChart } from "lucide-react";

export function LcScoreReport({ data }: { data: LcScoreReportRow[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<FileBarChart className="h-12 w-12" />}
        title="لا توجد بيانات درجات"
        description="لم يتم العثور على مشاريع محتوى محلي بعد. ابدأ بإضافة مشروع لحساب الدرجات."
      />
    );
  }

  const avgScore =
    data.reduce((s, r) => s + (r.score ?? 0), 0) / data.length;
  const totalSpend = data.reduce((s, r) => s + r.totalSpend, 0);
  const weightedLocalPct =
    totalSpend > 0
      ? data.reduce((s, r) => s + (r.totalSpend * r.localPercentage) / totalSpend, 0)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="متوسط الدرجة" value={`${avgScore.toFixed(1)}%`} />
        <Metric label="إجمالي الإنفاق" value={`${totalSpend.toLocaleString("ar-SA")} ر.س`} />
        <Metric label="المحتوى المحلي المرجح" value={`${weightedLocalPct.toFixed(1)}%`} />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-right">
              <th className="p-3 font-medium">المشروع</th>
              <th className="p-3 font-medium">الفترة</th>
              <th className="p-3 font-medium text-left">الدرجة</th>
              <th className="p-3 font-medium text-left">الإنفاق</th>
              <th className="p-3 font-medium text-left">نسبة المحلي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.projectId} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">{row.projectName}</td>
                <td className="p-3 text-muted-foreground">{row.reportingPeriod}</td>
                <td className="p-3 text-left font-medium tabular-nums">
                  {row.score != null ? `${row.score.toFixed(1)}%` : "—"}
                </td>
                <td className="p-3 text-left tabular-nums">
                  {row.totalSpend.toLocaleString("ar-SA")}
                </td>
                <td className="p-3 text-left tabular-nums">
                  <LocalPctBadge pct={row.localPercentage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function LocalPctBadge({ pct }: { pct: number }) {
  const color =
    pct >= 50
      ? "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950"
      : pct >= 25
        ? "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950"
        : "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}
