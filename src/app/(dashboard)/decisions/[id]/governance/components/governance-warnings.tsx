"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GovernanceWarningsProps {
  warnings: string[];
}

export function GovernanceWarnings({ warnings }: GovernanceWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800">
            تنبيهات الحوكمة الحالية
          </h4>
          <ul className="mt-2 list-disc pr-5 text-sm text-amber-700 space-y-1">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
