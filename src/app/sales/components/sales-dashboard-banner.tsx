"use client";

import { WorkspaceStatus } from "@/components/workspace/workspace-status";

interface SalesDashboardBannerProps {
  hasDbData: boolean;
  statsError?: string;
}

export function SalesDashboardBanner({
  hasDbData,
  statsError,
}: SalesDashboardBannerProps) {
  return (
    <>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        {hasDbData
          ? "SalesOS L5 — بيانات حقيقية من Prisma (P0). جميع التدفقات الأساسية تعمل مع الحوكمة وسجل التدقيق."
          : "SalesOS L5 — قاعدة البيانات جاهزة. شغّل `npx prisma db seed` لعرض بيانات حقيقية."}
      </div>

      {statsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          تعذر تحميل إحصائيات SalesOS: {statsError}
        </div>
      ) : null}

      <WorkspaceStatus
        module="sales"
        status={hasDbData ? "healthy" : "degraded"}
        message={
          hasDbData
            ? "مسار البيع — P0 foundation"
            : "بانتظار migration + seed"
        }
      />
    </>
  );
}
