"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColor, severityColor } from "./tab-utils";

interface RisksTabProps {
  risks: any[];
}

export function RisksTab({ risks }: RisksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">مخاطر الجودة</h3>
      </div>
      {risks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد مخاطر جودة مسجلة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {risks.map((risk) => (
            <Card key={risk.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{risk.riskDescription}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      الهدف المرتبط: {risk.objective?.description ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={severityColor(risk.inherentRisk)}>
                      {risk.inherentRisk}
                    </Badge>
                    <Badge className={statusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>
                </div>
                {risk.responses && risk.responses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {risk.responses.length} استجابة
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
