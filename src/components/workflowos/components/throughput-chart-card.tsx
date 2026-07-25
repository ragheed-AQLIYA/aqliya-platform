"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "./use-workflow-admin";

export function ThroughputChartCard({
  throughput,
}: {
  throughput: DashboardData["throughput"];
}) {
  const maxThroughput = Math.max(
    ...throughput.map((d) => Math.max(d.completed, d.created)),
    1,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الإنتاجية اليومية</CardTitle>
      </CardHeader>
      <CardContent>
        {throughput.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد بيانات كافية
          </p>
        ) : (
          <div className="space-y-2">
            {throughput.map((day) => (
              <div key={day.date} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("ar-SA", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    {day.completed} / {day.created}
                  </span>
                </div>
                <div className="flex gap-1 h-4">
                  <div
                    className="bg-green-500 rounded-r"
                    style={{
                      width: `${(day.completed / maxThroughput) * 100}%`,
                      minWidth: day.completed > 0 ? "4px" : "0",
                    }}
                    title={`تم إنجاز ${day.completed}`}
                  />
                  <div
                    className="bg-blue-500 rounded-l"
                    style={{
                      width: `${(day.created / maxThroughput) * 100}%`,
                      minWidth: day.created > 0 ? "4px" : "0",
                    }}
                    title={`تم إنشاء ${day.created}`}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-green-500" />
                مكتمل
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-blue-500" />
                منشأ
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
