"use client";

import { Move, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GraphToolbar({
  loading,
  showList,
  onToggleList,
  onRefresh,
}: {
  loading: boolean;
  showList: boolean;
  onToggleList: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">الرسم البياني للمعرفة</h1>
        <p className="text-sm text-muted-foreground">
          Knowledge Graph — تصور العلاقات بين الكيانات عبر المنصة
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleList}>
          <Move className="h-4 w-4 ml-1" />
          {showList ? "إخفاء اللوحة" : "إظهار اللوحة"}
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>
    </div>
  );
}
