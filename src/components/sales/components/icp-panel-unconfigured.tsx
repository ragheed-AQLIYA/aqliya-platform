"use client";

import { Target, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IcpPanelUnconfigured({
  canUpdate,
  loading,
  error,
  onRecalculate,
}: {
  canUpdate: boolean;
  loading: boolean;
  error: string | null;
  onRecalculate: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Target className="h-4 w-4 shrink-0" />
        <span>ICP assessment not configured</span>
      </div>
      <p className="text-xs text-muted-foreground">
        تقييم ملاءمة العميل المثالي (ICP) غير مفعّل — استخدم القواعد لحساب أول
        تقييم.
      </p>
      {canUpdate ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={onRecalculate}
          className="gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recalculate (rules)
        </Button>
      ) : null}
      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
