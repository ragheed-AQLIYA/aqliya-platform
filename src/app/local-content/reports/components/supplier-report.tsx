import type { SupplierReportRow } from "@/actions/localcontent-report-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { CLASSIFICATION_LABELS } from "./use-reports";

export function SupplierReport({ data }: { data: SupplierReportRow[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="لا توجد بيانات موردين"
        description="لم يتم إضافة موردين بعد. ابدأ بإضافة موردين للمشاريع لعرض التصنيف."
      />
    );
  }

  const totalCount = data.reduce((s, r) => s + r.count, 0);
  const totalSpend = data.reduce((s, r) => s + r.totalSpend, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="إجمالي الموردين" value={`${totalCount}`} />
        <Metric label="إجمالي الإنفاق" value={`${totalSpend.toLocaleString("ar-SA")} ر.س`} />
        <Metric label="متوسط الإنفاق لكل مورد" value={`${totalCount > 0 ? Math.round(totalSpend / totalCount).toLocaleString("ar-SA") : "0"} ر.س`} />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-right">
              <th className="p-3 font-medium">التصنيف</th>
              <th className="p-3 font-medium text-left">العدد</th>
              <th className="p-3 font-medium text-left">إجمالي الإنفاق</th>
              <th className="p-3 font-medium text-left">% من الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.classification} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">
                  {CLASSIFICATION_LABELS[row.classification] || row.classification}
                </td>
                <td className="p-3 text-left tabular-nums">{row.count}</td>
                <td className="p-3 text-left tabular-nums">
                  {row.totalSpend.toLocaleString("ar-SA")}
                </td>
                <td className="p-3 text-left tabular-nums">
                  {totalSpend > 0
                    ? `${((row.totalSpend / totalSpend) * 100).toFixed(1)}%`
                    : "—"}
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
