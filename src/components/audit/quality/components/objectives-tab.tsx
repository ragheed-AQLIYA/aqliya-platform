"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColor } from "./tab-utils";

interface ObjectivesTabProps {
  objectives: any[];
}

export function ObjectivesTab({ objectives }: ObjectivesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">أهداف الجودة</h3>
      </div>
      {objectives.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد أهداف جودة مسجلة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {objectives.map((obj) => (
            <Card key={obj.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{obj.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      التصنيف: {obj.category} | المرجع: {obj.reference ?? "—"}
                    </p>
                  </div>
                  <Badge className={statusColor(obj.status)}>
                    {obj.status}
                  </Badge>
                </div>
                {obj.risks && obj.risks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {obj.risks.length} مخاطر مرتبطة
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
