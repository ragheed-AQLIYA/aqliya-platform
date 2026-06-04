"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEngagementRollforwardAction } from "@/actions/audit-read-actions";
import type { RollforwardReport } from "@/lib/audit/rollforward";

export function RollforwardPanel({ engagementId }: { engagementId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RollforwardReport | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getEngagementRollforwardAction(engagementId);
      if (cancelled) return;
      setLoading(false);
      if (!res.success) {
        setError(res.error ?? "تعذر تحميل rollforward");
        return;
      }
      if (res.data.available) {
        setReport(res.data.report);
      } else {
        setReason(res.data.reasonAr);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  return (
    <Card className="mt-4" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base">مقارنة الفترات (A1-04)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : reason ? (
          <p className="text-sm text-muted-foreground">{reason}</p>
        ) : report ? (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {report.priorPeriodLabel} → {report.currentPeriodLabel} ·{" "}
              {report.materialCount} حساب مادي · إجمالي فرق{" "}
              {report.totalVarianceAbs.toLocaleString("ar-SA")}
            </p>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {report.rows.slice(0, 12).map((row) => (
                <li
                  key={row.accountCode}
                  className="flex flex-wrap justify-between gap-2 rounded border px-2 py-1"
                >
                  <span>
                    {row.accountCode} — {row.accountName}
                  </span>
                  <span className="flex items-center gap-2">
                    {row.material ? (
                      <Badge variant="destructive">مادي</Badge>
                    ) : null}
                    <span className="text-muted-foreground">
                      {row.variance.toLocaleString("ar-SA")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{report.disclaimerAr}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
