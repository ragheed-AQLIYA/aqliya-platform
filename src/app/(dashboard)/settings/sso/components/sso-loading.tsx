"use client";

import { RefreshCw } from "lucide-react";

export function SsoLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" dir="rtl">
      <div className="text-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">جارٍ تحميل إعدادات الدخول الموحد...</p>
      </div>
    </div>
  );
}
