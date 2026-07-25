"use client";

import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionTabs } from "@/components/decisions/decision-tabs";

const missingLabels: Record<string, string> = {
  intake_not_accepted: "يجب قبول الاستلام أولًا",
  framework_incomplete: "يجب إكمال إطار القرار",
  scenarios_missing: "مطلوب ثلاثة سيناريوهات على الأقل",
  scenarios_incomplete: "يجب إكمال جميع السيناريوهات",
  risks_missing: "تحليل المخاطر مفقود لبعض السيناريوهات",
  risks_incomplete: "تحليل المخاطر غير مكتمل لبعض السيناريوهات",
};

interface Props {
  decisionId: string;
  missing: string[];
}

export function RecommendationGateBlocked({ decisionId, missing }: Props) {
  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={decisionId} />
      <Card className="rounded-[24px] border-destructive shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            التوصية محظورة
          </CardTitle>
          <CardDescription>
            لا يمكن فتح مرحلة التوصية قبل استيفاء جميع المتطلبات السابقة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {missing.map((reason) => (
              <li key={reason}>
                <Badge
                  variant="outline"
                  className="text-destructive border-destructive"
                >
                  {missingLabels[reason] || reason}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
