"use client";

import { CheckCircle2, Circle, XCircle, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_STEPS, STATUS_LABELS } from "./constants";

interface StatusStepperProps {
  currentStepIndex: number;
  status: string;
}

export function StatusStepper({ currentStepIndex, status }: StatusStepperProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {STATUS_STEPS.map((step, i) => {
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex items-center gap-1.5 ${isDone ? "text-green-600" : isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[10px] hidden sm:inline">
                    {STATUS_LABELS[step]?.en || step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px ${isDone ? "bg-green-400" : "bg-muted"}`}
                  />
                )}
              </div>
            );
          })}
          {status === "rejected" && (
            <>
              <div className="h-px flex-1 bg-red-400" />
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-[10px]">Rejected</span>
              </div>
            </>
          )}
          {status === "archived" && (
            <>
              <div className="h-px flex-1 bg-gray-400" />
              <div className="flex items-center gap-1 text-gray-500">
                <Archive className="h-3.5 w-3.5" />
                <span className="text-[10px]">Archived</span>
              </div>
            </>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground text-center">
          {STATUS_LABELS[status]?.ar || status}
        </div>
      </CardContent>
    </Card>
  );
}
