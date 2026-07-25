"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface Run {
  id: string;
  status: string;
  explanationsGenerated: number;
  patternSuggestions: number;
  falsePositives: number;
  startedAt: string | null;
  durationMs: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-SA");
}

export function PipelineRunsTable({ runs }: { runs: Run[] }) {
  const maxTotal = Math.max(
    1,
    ...runs.map(
      (r) => r.explanationsGenerated + r.patternSuggestions + r.falsePositives,
    ),
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          تشغيلات pipeline / Pipeline Runs
        </CardTitle>
        <CardDescription className="text-xs">
          آخر 10 تشغيلات للمراجعة الذكية — حجم الشريط يتناسب مع إجمالي
          المخرجات
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <p>
              لا توجد تشغيلات بعد. شغّل pipeline المراجعة الذكية من صفحة
              الدفتر.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">الحالة</th>
                  <th className="pb-2 font-medium">التفسيرات</th>
                  <th className="pb-2 font-medium">الاقتراحات</th>
                  <th className="pb-2 font-medium">FP</th>
                  <th className="pb-2 font-medium">الإجمالي</th>
                  <th className="pb-2 font-medium">تاريخ التشغيل</th>
                  <th className="pb-2 font-medium">المدة</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run, i) => {
                  const total =
                    run.explanationsGenerated +
                    run.patternSuggestions +
                    run.falsePositives;
                  const barWidth = (total / maxTotal) * 100;
                  return (
                    <tr
                      key={run.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="py-2">{run.explanationsGenerated}</td>
                      <td className="py-2">{run.patternSuggestions}</td>
                      <td className="py-2">{run.falsePositives}</td>
                      <td className="py-2 min-w-[80px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className={`h-full rounded transition-all duration-500 ${
                                i === 0 ? "bg-primary" : "bg-gray-400"
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{total}</span>
                        </div>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {formatDate(run.startedAt)}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {run.durationMs > 0
                          ? `${(run.durationMs / 1000).toFixed(1)}s`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
