"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EvaluationTabProps {
  evaluations: any[];
}

export function EvaluationTab({ evaluations }: EvaluationTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">تقييم نظام الجودة</h3>
      </div>
      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد تقييمات مسجلة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluations.map((evalItem) => (
            <Card key={evalItem.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      تقييم سنة {evalItem.year}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {evalItem.overallConclusion ?? "—"}
                    </p>
                  </div>
                  <Badge
                    className={
                      evalItem.systemEffectiveness === "effective"
                        ? "bg-green-100 text-green-800"
                        : evalItem.systemEffectiveness ===
                            "partially_effective"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {evalItem.systemEffectiveness}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
