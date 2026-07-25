"use client";
import { Card, CardContent } from "@/components/ui/card";
import { WORKFLOW_STEPS } from "./constants";

export function WorkflowSteps() {
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-2">
          كيفية الاستخدام / How to use:
        </p>
        <div className="flex flex-wrap gap-2">
          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-xs"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {i + 1}
              </span>
              <span>{step.ar}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{step.en}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
