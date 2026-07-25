"use client";

import { ShieldCheck } from "lucide-react";

export function EvidenceGovernanceBanner() {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">الحوكمة</p>
          <p>
            كل مستند هنا هو مادة دعم للقرار. يبقى القرار بحاجة إلى مراجعة
            واعتماد بشريين حتى لو اكتملت الأدلة.
          </p>
        </div>
      </div>
    </div>
  );
}
