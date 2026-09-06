"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "./use-workflow-admin";

const PRIORITY_LABELS: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  urgent: "عاجل",
};

export function SlaComplianceCard({
  compliance,
}: {
  compliance: DashboardData["compliance"];
}) {
  return (
    <Card role="region" aria-label="بطاقة الالتزام بـ SLA">
      <CardHeader>
        <CardTitle className="text-lg">الالتزام بـ SLA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center" role="region" aria-label={`نسبة الالتزام: ${compliance.complianceRate}٪`}>
            <p className="text-3xl font-bold text-green-600">
              {compliance.complianceRate}%
            </p>
            <p className="text-sm text-muted-foreground">نسبة الالتزام</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center" role="region" aria-label={`في الوقت: ${compliance.onTime}`}>
              <p className="text-xl font-bold text-green-600">
                {compliance.onTime}
              </p>
              <p className="text-xs text-muted-foreground">في الوقت</p>
            </div>
            <div className="text-center" role="region" aria-label={`مخالفة: ${compliance.breached}`}>
              <p className="text-xl font-bold text-red-600">
                {compliance.breached}
              </p>
              <p className="text-xs text-muted-foreground">مخالفة</p>
            </div>
          </div>
        </div>
        <div
          role="meter"
          aria-valuenow={compliance.complianceRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`نسبة الالتزام بـ SLA: ${compliance.complianceRate}٪`}
          className="h-3 bg-muted rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${compliance.complianceRate}%` }}
            aria-hidden="true"
          />
        </div>
        {Object.keys(compliance.byPriority).length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(compliance.byPriority).map(
              ([priority, stats]) => (
                <div key={priority} className="p-2 rounded bg-muted/50" role="region" aria-label={`SLA للأولوية ${PRIORITY_LABELS[priority] ?? priority}: ${stats.rate}٪`}>
                  <p className="text-xs font-medium">
                    {PRIORITY_LABELS[priority] ?? priority}
                  </p>
                  <p className="text-sm font-bold">
                    {stats.rate}%
                    <span className="text-xs text-muted-foreground me-1">
                      ({stats.onTime}/{stats.total})
                    </span>
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
