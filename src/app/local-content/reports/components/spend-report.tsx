import type { SpendReportRow } from "@/actions/localcontent-report-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingDown } from "lucide-react";
import { CATEGORY_LABELS } from "./use-reports";

export function SpendReport({ data }: { data: SpendReportRow[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<TrendingDown className="h-12 w-12" />}
        title="لا توجد بيانات إنفاق"
        description="لم يتم تسجيل أي إنفاق بعد. أضف سجلات إنفاق للمشاريع لعرض التحليل."
      />
    );
  }

  const grandTotal = data.reduce((s, r) => s + r.total, 0);
  const grandLocal = data.reduce((s, r) => s + r.local, 0);
  const grandLocalPct = grandTotal > 0 ? (grandLocal / grandTotal) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="إجمالي الإنفاق" value={`${grandTotal.toLocaleString("ar-SA")} ر.س`} />
        <Metric label="إنفاق محلي" value={`${grandLocal.toLocaleString("ar-SA")} ر.س`} />
        <Metric label="نسبة المحلي" value={`${grandLocalPct.toFixed(1)}%`} />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-right">
              <th className="p-3 font-medium">الفئة</th>
              <th className="p-3 font-medium text-left">الإجمالي</th>
              <th className="p-3 font-medium text-left">محلي</th>
              <th className="p-3 font-medium text-left">دولي</th>
              <th className="p-3 font-medium text-left">% المحلي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.category} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">
                  {CATEGORY_LABELS[row.category] || row.category}
                </td>
                <td className="p-3 text-left tabular-nums">
                  {row.total.toLocaleString("ar-SA")}
                </td>
                <td className="p-3 text-left tabular-nums text-green-600">
                  {row.local.toLocaleString("ar-SA")}
                </td>
                <td className="p-3 text-left tabular-nums text-red-600">
                  {row.international.toLocaleString("ar-SA")}
                </td>
                <td className="p-3 text-left tabular-nums">
                  <LocalPctBadge pct={row.localPct} />
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
