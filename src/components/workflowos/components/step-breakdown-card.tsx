"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepBar } from "./step-bar";
import type { DashboardData } from "./use-workflow-admin";

const STEP_TYPE_LABELS: Record<string, string> = {
  review: "مراجعة",
  approval: "اعتماد",
  evidence_upload: "رفع دليل",
  notification: "إشعار",
  escalation: "تصعيد",
  unknown: "غير معروف",
};

export function StepBreakdownCard({
  steps,
}: {
  steps: DashboardData["stepBreakdown"];
}) {
  const stepTypeMax = Math.max(
    ...steps.map((s) => s.avgHours ?? 0),
    1,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">متوسط الوقت لكل خطوة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد بيانات كافية
          </p>
        ) : (
          steps.map((step) => (
            <StepBar
              key={step.stepType}
              label={STEP_TYPE_LABELS[step.stepType] ?? step.stepType}
              avg={step.avgHours}
              max={stepTypeMax}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
