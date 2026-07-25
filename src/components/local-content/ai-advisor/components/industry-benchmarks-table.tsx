"use client";

import type { IndustryBenchmark } from "../types";
import { EmptySection } from "./empty-section";

export function IndustryBenchmarksTable({ benchmarks }: { benchmarks: IndustryBenchmark[] }) {
  if (benchmarks.length === 0) {
    return (
      <EmptySection
        title="لا توجد بيانات قطاعية"
        description="لم يتم جمع بيانات كافية عن فعالية الأنماط بعد. ستظهر هنا بعد استخدام ميزة Pattern Learning Assistant."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">القطاع / Industry</th>
            <th className="pb-2 font-medium">الرمز / Code</th>
            <th className="pb-2 font-medium text-right">إجمالي / Total</th>
            <th className="pb-2 font-medium text-right">صحيح / Correct</th>
            <th className="pb-2 font-medium text-right">FP</th>
            <th className="pb-2 font-medium text-right">الفعالية / Eff.</th>
          </tr>
        </thead>
        <tbody>
          {benchmarks.map((b, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 capitalize">{b.industry}</td>
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{b.workbookLineCode}</code>
              </td>
              <td className="py-2 text-right">{b.totalMatches}</td>
              <td className="py-2 text-right">{b.correctMatches}</td>
              <td className="py-2 text-right">{b.falsePositives}</td>
              <td className="py-2 text-right">
                <span
                  className={
                    b.effectivenessPct >= 80
                      ? "text-green-600"
                      : b.effectivenessPct >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                  }
                >
                  {b.effectivenessPct}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
