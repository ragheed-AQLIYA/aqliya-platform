"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Engagement } from "@/types/audit";
import { ExportDropdown } from "./export-dropdown";

interface StatementsHeaderProps {
  t: (key: string) => string;
  engagement: Engagement | null;
  exporting: "pdf" | "xlsx" | null;
  exportError: string | null;
  exportSuccess: string | null;
  fsV2Enabled: boolean;
  fsActionLoading: boolean;
  onExport: (format: "pdf" | "xlsx") => void;
  onRebuildV2: () => void;
  onMarkAllReviewed: () => void;
}

export function StatementsHeader({
  t,
  engagement,
  exporting,
  exportError,
  exportSuccess,
  fsV2Enabled,
  fsActionLoading,
  onExport,
  onRebuildV2,
  onMarkAllReviewed,
}: StatementsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {engagement?.client?.name} - {engagement?.fiscalPeriod}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {fsV2Enabled && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={fsActionLoading}
              onClick={onRebuildV2}
            >
              {fsActionLoading ? (
                <Loader2 className="size-4 me-1 animate-spin" />
              ) : null}
              إعادة بناء القوائم (v2)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={fsActionLoading}
              onClick={onMarkAllReviewed}
            >
              اعتماد مراجعة الكل
            </Button>
          </>
        )}
        {exportSuccess && (
          <span className="text-xs text-green-700">{exportSuccess}</span>
        )}
        {exportError && (
          <span className="text-xs text-red-600">{exportError}</span>
        )}
        <ExportDropdown
          t={t}
          exporting={exporting}
          onExport={onExport}
        />
      </div>
    </div>
  );
}
