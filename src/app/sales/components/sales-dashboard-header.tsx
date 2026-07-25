"use client";

import { AIIndicator } from "@/components/enterprise/ai-indicator";
import { ContextualActions } from "@/components/workspace/contextual-actions";

interface SalesDashboardHeaderProps {
  hasDbData: boolean;
}

export function SalesDashboardHeader({ hasDbData }: SalesDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-h2 font-black text-foreground">SalesOS</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          ذكاء الإيرادات وإدارة مسارات البيع المؤسسي
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {hasDbData ? "L5 Pilot-ready — Prisma" : "L5 — database connected"}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <AIIndicator type="insight" label="٣ رؤى ذكية" />
        <ContextualActions
          orientation="horizontal"
          actions={[
            {
              id: "new-deal",
              label: "صفقة جديدة",
              icon: "Plus",
              variant: "default",
              action: () => {},
            },
            {
              id: "export",
              label: "تصدير",
              icon: "Download",
              variant: "secondary",
              action: () => {},
            },
          ]}
        />
      </div>
    </div>
  );
}
