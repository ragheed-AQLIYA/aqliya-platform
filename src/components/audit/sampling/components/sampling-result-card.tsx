"use client";

import type { SamplingMethod, SamplingResult } from "@/lib/audit/sampling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const METHOD_LABELS: Record<SamplingMethod, string> = {
  random: "عشوائي",
  high_value: "قيمة عالية",
  monetary_unit: "وحدة نقدية",
  stratified: "طبقي",
  systematic: "نظامي",
};

interface SamplingResultCardProps {
  result: SamplingResult;
}

export function SamplingResultCard({ result }: SamplingResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">نتيجة العينة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">
            {METHOD_LABELS[result.method] ?? result.method}
          </Badge>
          <Badge variant="outline">n={result.sampleSize}</Badge>
          <Badge variant="outline">seed={result.seed.slice(0, 8)}…</Badge>
        </div>
        {result.statistics && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
            <p>
              ثقة {(result.statistics.confidenceLevel * 100).toFixed(0)}% —
              حجم موصى به ≥ {result.statistics.recommendedMinSampleSize}
            </p>
            <p className="text-muted-foreground">
              هامش خطأ: {result.statistics.marginOfError.toFixed(2)} · σ=
              {result.statistics.standardDeviation.toFixed(2)}
            </p>
          </div>
        )}
        {result.strata && result.strata.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-start py-1">الطبقة</th>
                  <th className="text-end py-1">عينة</th>
                  <th className="text-end py-1">رصيد</th>
                </tr>
              </thead>
              <tbody>
                {result.strata.map((s) => (
                  <tr key={s.label} className="border-b border-muted/40">
                    <td className="py-1">{s.label}</td>
                    <td className="py-1 text-end">
                      {s.sampleItems}/{s.populationItems}
                    </td>
                    <td className="py-1 text-end tabular-nums">
                      {s.totalBalance.toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-start py-1">الحساب</th>
                <th className="text-end py-1">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {result.selectedItems.map((row) => (
                <tr key={row.id} className="border-b border-muted/40">
                  <td className="py-1">
                    {row.accountCode} — {row.accountName}
                  </td>
                  <td className="py-1 text-end tabular-nums">
                    {row.balance.toLocaleString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
