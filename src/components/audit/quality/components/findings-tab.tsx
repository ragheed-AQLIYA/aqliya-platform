"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColor, severityColor } from "./tab-utils";

interface FindingsTabProps {
  findings: any[];
}

export function FindingsTab({ findings }: FindingsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">نتائج الجودة</h3>
      </div>
      {findings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد نتائج جودة مسجلة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {findings.map((finding) => (
            <Card key={finding.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{finding.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      النوع: {finding.findingType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={severityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                    <Badge className={statusColor(finding.status)}>
                      {finding.status}
                    </Badge>
                  </div>
                </div>
                {finding.remediation && (
                  <p className="text-xs text-muted-foreground mt-2">
                    خطة معالجة: {finding.remediation.status}
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
