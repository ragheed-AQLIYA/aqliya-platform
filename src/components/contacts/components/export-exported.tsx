"use client";

import { CheckCircle } from "lucide-react";

export function ExportExported() {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-purple-500" />
      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
        تم تصدير هذا الملف الشخصي
      </span>
    </div>
  );
}
