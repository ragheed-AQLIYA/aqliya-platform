"use client";

import { Badge } from "@/components/ui/badge";

const COLORS: Record<string, string> = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  partial:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const LABELS: Record<string, string> = {
  completed: "مكتمل",
  partial: "جزئي",
  failed: "فشل",
  in_progress: "قيد التشغيل",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={COLORS[status] ?? "bg-gray-100"}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
