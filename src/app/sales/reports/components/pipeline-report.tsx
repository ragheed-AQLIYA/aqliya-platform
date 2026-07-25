"use client";

import type { PipelineStageRow } from "@/actions/sales-report-actions";

interface PipelineReportProps {
  data: PipelineStageRow[];
}

function formatSAR(v: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(v);
}

export function PipelineReport({ data }: PipelineReportProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
        لا توجد بيانات مراحل للعرض
      </div>
    );
  }

  const maxValue = Math.max(...data.map((r) => r.totalValue), 1);
  const totalDeals = data.reduce((s, r) => s + r.count, 0);
  const totalValue = data.reduce((s, r) => s + r.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">إجمالي الصفقات</p>
          <p className="text-2xl font-bold">{totalDeals}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">قيمة المسار</p>
          <p className="text-2xl font-bold">{formatSAR(totalValue)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">متوسط قيمة الصفقة</p>
          <p className="text-2xl font-bold">
            {totalDeals > 0 ? formatSAR(Math.round(totalValue / totalDeals)) : "0"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3 text-sm font-medium">
          تحليل المراحل
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-4 py-2 text-right">المرحلة</th>
                <th className="px-4 py-2 text-right">العدد</th>
                <th className="px-4 py-2 text-right">القيمة</th>
                <th className="px-4 py-2 text-right">متوسط حجم الصفقة</th>
                <th className="px-4 py-2 text-right">متوسط العمر (يوم)</th>
                <th className="px-4 py-2 text-right">التوزيع</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const pct = maxValue > 0 ? (row.totalValue / maxValue) * 100 : 0;
                return (
                  <tr
                    key={row.stage}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2 font-medium">{row.stage}</td>
                    <td className="px-4 py-2">{row.count}</td>
                    <td className="px-4 py-2">{formatSAR(row.totalValue)}</td>
                    <td className="px-4 py-2">
                      {formatSAR(row.avgDealSize)}
                    </td>
                    <td className="px-4 py-2">{row.avgAge}</td>
                    <td className="px-4 py-2">
                      <div className="flex h-6 items-center gap-1">
                        <div
                          className="h-4 rounded bg-primary/60 transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
