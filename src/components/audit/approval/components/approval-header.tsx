"use client";

import { useTranslations } from "next-intl";
import type { Engagement } from "@/types/audit";

export function ApprovalHeader({
  engagement,
}: {
  engagement: Engagement | null;
}) {
  const t = useTranslations("audit.approval");
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {engagement?.client?.name} - {engagement?.fiscalPeriod}
        </p>
      </div>
    </div>
  );
}
