"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColor } from "./tab-utils";

interface MonitoringTabProps {
  monitoring: any[];
}

export function MonitoringTab({ monitoring }: MonitoringTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">أنشطة المراقبة</h3>
      </div>
      {monitoring.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد أنشطة مراقبة مسجلة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {monitoring.map((act) => (
            <Card key={act.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{act.activityType}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      النطاق: {act.scope ?? "—"} | التكرار:{" "}
                      {act.frequency ?? "—"}
                    </p>
                  </div>
                  <Badge className={statusColor(act.status)}>
                    {act.status}
                  </Badge>
                </div>
                {act.findings && act.findings.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {act.findings.length} نتيجة
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
