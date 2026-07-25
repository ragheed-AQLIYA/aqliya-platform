"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColor, severityColor } from "./tab-utils";

interface OverviewTabProps {
  dashboard: any;
}

export function OverviewTab({ dashboard }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              أهداف الجودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard?.totalObjectives ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              مخاطر الجودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard?.totalRisks ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              إجراءات المراقبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dashboard?.monitoringByStatus?.planned ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              نتائج الجودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(() => {
                const fbs = dashboard?.findingsByStatus;
                if (!fbs) return 0;
                return Object.values(fbs as Record<string, number>).reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">نتائج المراقبة حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.monitoringByStatus &&
            Object.keys(dashboard.monitoringByStatus).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(dashboard.monitoringByStatus).map(
                  ([k, v]: [string, any]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between"
                    >
                      <Badge className={statusColor(k)}>{k}</Badge>
                      <span className="font-bold">{String(v)}</span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                لا توجد بيانات مراقبة
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">نتائج التقييم حسب الخطورة</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.findingsBySeverity &&
            Object.keys(dashboard.findingsBySeverity).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(dashboard.findingsBySeverity).map(
                  ([k, v]: [string, any]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between"
                    >
                      <Badge className={severityColor(k)}>{k}</Badge>
                      <span className="font-bold">{String(v)}</span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                لا توجد نتائج تقييم
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {dashboard?.latestEvaluation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">
              آخر تقييم للنظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              السنة: {dashboard.latestEvaluation.year} | الفعالية:{" "}
              <Badge
                className={
                  dashboard.latestEvaluation.systemEffectiveness ===
                  "effective"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }
              >
                {dashboard.latestEvaluation.systemEffectiveness}
              </Badge>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
