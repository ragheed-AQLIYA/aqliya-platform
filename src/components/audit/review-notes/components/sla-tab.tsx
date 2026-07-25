"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { priorityColor } from "./utils";

interface SLATabProps {
  slaMetrics: any;
  slaTargets: any;
}

export function SLATab({ slaMetrics, slaTargets }: SLATabProps) {
  if (!slaMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          لا توجد بيانات أداء
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              إجمالي الملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{slaMetrics.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              مفتوحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{slaMetrics.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              مخالفة SLA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{slaMetrics.breached}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              متوسط وقت الحل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{slaMetrics.avgResolutionHours}h</p>
          </CardContent>
        </Card>
      </div>

      {slaTargets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">أهداف SLA حسب الأولوية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(slaTargets).map(([priority, target]: [string, any]) => (
                <div key={priority} className="flex items-center justify-between text-sm">
                  <Badge className={priorityColor(priority)}>
                    {priority === "critical" ? "حرج" : priority === "high" ? "عالي" : priority === "medium" ? "متوسط" : "منخفض"}
                  </Badge>
                  <span>الاستجابة: {target.responseHrs}h | الحل: {target.resolutionHrs}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
