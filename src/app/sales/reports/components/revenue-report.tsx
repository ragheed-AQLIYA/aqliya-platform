"use client";

import type { RevenueRow } from "@/actions/sales-report-actions";
import { ReportCard } from "./report-card";
import { DollarSign } from "lucide-react";

interface RevenueReportProps {
  data: RevenueRow[];
}

function formatSAR(v: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(v);
}

export function RevenueReport({ data }: RevenueReportProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
        لا توجد بيانات إيرادات للفترة المحددة
      </div>
    );
  }

  const totals = data.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      count: acc.count + r.count,
      won: acc.won + r.won,
      lost: acc.lost + r.lost,
    }),
    { total: 0, count: 0, won: 0, lost: 0 },
  );

  const maxValue = Math.max(...data.map((r) => r.total), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <ReportCard
          label="إجمالي الإيرادات"
          value={formatSAR(totals.total)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <ReportCard label="عدد الصفقات" value={totals.count} />
        <ReportCard label="صفقات رابحة" value={totals.won} />
        <ReportCard label="صفقات خاسرة" value={totals.lost} />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3 text-sm font-medium">
          الإيرادات الشهرية
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-4 py-2 text-right">الشهر</th>
                <th className="px-4 py-2 text-right">الإيرادات</th>
                <th className="px-4 py-2 text-right">العدد</th>
                <th className="px-4 py-2 text-right">فوز</th>
                <th className="px-4 py-2 text-right">خسارة</th>
                <th className="px-4 py-2 text-right">الرسم البياني</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const pct = maxValue > 0 ? (row.total / maxValue) * 100 : 0;
                return (
                  <tr
                    key={row.month}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2 font-medium">{row.month}</td>
                    <td className="px-4 py-2">{formatSAR(row.total)}</td>
                    <td className="px-4 py-2">{row.count}</td>
                    <td className="px-4 py-2 text-green-600 dark:text-green-400">
                      {row.won}
                    </td>
                    <td className="px-4 py-2 text-red-600 dark:text-red-400">
                      {row.lost}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex h-6 items-center gap-1">
                        <div
                          className="h-4 rounded bg-primary/60 transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                          title={formatSAR(row.total)}
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
            <tfoot>
              <tr className="border-t bg-muted/30 font-semibold">
                <td className="px-4 py-2">المجموع</td>
                <td className="px-4 py-2">{formatSAR(totals.total)}</td>
                <td className="px-4 py-2">{totals.count}</td>
                <td className="px-4 py-2 text-green-600 dark:text-green-400">
                  {totals.won}
                </td>
                <td className="px-4 py-2 text-red-600 dark:text-red-400">
                  {totals.lost}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
