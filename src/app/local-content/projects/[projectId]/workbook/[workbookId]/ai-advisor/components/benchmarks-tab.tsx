"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { IndustryBenchmark } from "./types";

const effectivenessColor = (pct: number) =>
  pct >= 80
    ? "text-green-600 font-medium"
    : pct >= 50
      ? "text-amber-600 font-medium"
      : "text-red-600 font-medium";

interface Props {
  benchmarks: IndustryBenchmark[];
}

export function BenchmarksTab({ benchmarks }: Props) {
  return (
    <>
      <h3 className="text-lg font-semibold">
        فعالية الأنماط حسب القطاع / Industry Pattern Benchmarks
      </h3>
      {benchmarks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد بيانات كافية عن فعالية الأنماط بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-3 text-right font-medium">القطاع</th>
                <th className="p-3 text-right font-medium">الرمز</th>
                <th className="p-3 text-right font-medium">الإجمالي</th>
                <th className="p-3 text-right font-medium">الصحيح</th>
                <th className="p-3 text-right font-medium">FP</th>
                <th className="p-3 text-right font-medium">الفعالية</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 capitalize">{b.industry}</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {b.workbookLineCode}
                    </code>
                  </td>
                  <td className="p-3">{b.totalMatches}</td>
                  <td className="p-3">{b.correctMatches}</td>
                  <td className="p-3">{b.falsePositives}</td>
                  <td className="p-3">
                    <span className={effectivenessColor(b.effectivenessPct)}>
                      {b.effectivenessPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
