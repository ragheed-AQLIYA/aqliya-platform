"use client";

import { Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  loading,
  exporting,
  onRefresh,
  onExport,
}: {
  loading: boolean;
  exporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">لوحة تحكم سير العمل</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مقاييس الأداء والإنتاجية وسرعة الإنجاز
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ms-1 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 ms-1 animate-spin" />
          ) : (
            <Download className="h-4 w-4 ms-1" />
          )}
          تصدير CSV
        </Button>
      </div>
    </div>
  );
}
