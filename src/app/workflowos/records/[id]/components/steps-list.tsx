"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecordWithTemplate } from "./types";

interface Props {
  record: RecordWithTemplate;
  showActions: boolean;
  onAdvance: () => Promise<void>;
  onComplete: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function StepsList({ record, showActions, onAdvance, onComplete, onReject }: Props) {
  const steps = (record.steps as unknown[]) ?? [];
  const stepResults = (record.stepResults as Record<string, unknown>) ?? {};
  const currentStep = record.currentStep;

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>الخطوات</CardTitle></CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <p className="text-muted-foreground">لا توجد خطوات</p>
        ) : (
          <ol className="space-y-3">
            {steps.map((step: unknown, index: number) => {
              const s = step as { name?: string; assignee?: string };
              const stepKey = `step_${index}`;
              const stepResult = stepResults[stepKey] as
                | { status?: string; notes?: string; updatedAt?: string }
                | undefined;
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <li
                  key={index}
                  className={`flex items-start gap-3 p-3 border rounded-lg ${
                    isCurrent ? "border-primary bg-primary/5" : ""
                  } ${isComplete ? "border-green-300 bg-green-50" : ""}`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{s.name ?? `خطوة ${index + 1}`}</p>
                    {s.assignee && (
                      <p className="text-sm text-muted-foreground">المسؤول: {s.assignee}</p>
                    )}
                    {stepResult && (
                      <div className="mt-2 text-sm bg-white p-2 rounded border">
                        {stepResult.status && <p>الحالة: {stepResult.status}</p>}
                        {stepResult.notes && <p>ملاحظات: {stepResult.notes}</p>}
                        {stepResult.updatedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            آخر تحديث: {new Date(stepResult.updatedAt).toLocaleString("ar-SA")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {isComplete && <Badge variant="secondary" className="flex-shrink-0">مكتملة</Badge>}
                  {isCurrent && <Badge className="flex-shrink-0">الحالية</Badge>}
                </li>
              );
            })}
          </ol>
        )}

        {showActions && (
          <div className="flex gap-3 justify-end mt-4">
            {currentStep < steps.length - 1 && (
              <form action={onAdvance}>
                <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  تقدم إلى الخطوة التالية
                </button>
              </form>
            )}
            {currentStep >= steps.length - 1 && (
              <form action={onComplete}>
                <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  إكمال سير العمل
                </button>
              </form>
            )}
            <form action={onReject}>
              <button type="submit" className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                رفض
              </button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
