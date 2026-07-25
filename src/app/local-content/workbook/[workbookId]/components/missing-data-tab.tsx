import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import type { MissingDataDetectionResult } from "@/lib/local-content/workbook/types";

interface Props {
  missingData: MissingDataDetectionResult | null;
  canAccess: boolean;
}

export function MissingDataTab({ missingData, canAccess }: Props) {
  if (!canAccess) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>استورد الميزان أولا لتعبئة الدفتر.</p>
      </div>
    );
  }

  if (!missingData || missingData.totalMissing === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p>لا توجد بيانات ناقصة. كل البنود مكتملة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        إجمالي العناصر الناقصة: {missingData.totalMissing}
      </p>
      {Object.values(missingData.byCategory).map((group) => (
        <Card key={group.category}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {group.label} ({group.count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.items.map((item, idx) => (
                <div
                  key={`${item.lineCode}-${item.fieldName}-${idx}`}
                  className="text-sm p-2 border rounded"
                >
                  <p className="font-medium">
                    {item.lineCode} — {item.lineName}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {item.description}
                  </p>
                  {item.evidenceRequired && item.evidenceTypes.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.evidenceTypes.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
